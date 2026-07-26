import pathlib, subprocess, sys

base = pathlib.Path(r"D:\Totrieutien\SWP391\backend\ParkingBuilding.CoreApi")

# ============================================================
# PATCH 1: PayOsPaymentService.cs — 3 patches
# ============================================================
f1 = base / "Application" / "Payments" / "PayOsPaymentService.cs"
c1 = f1.read_text(encoding="utf-8")

# 1a: Insert CreateMonthlyPassPaymentLinkAsync before ProcessWebhookAsync
anchor1 = "    public async Task<PayOsWebhookProcessResult> ProcessWebhookAsync("
monthly_method = r'''
    public async Task<PayOsPaymentResponse> CreateMonthlyPassPaymentLinkAsync(
        Payment payment,
        MonthlyPassApplication application,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (payment.Id <= 0)
            throw new BusinessException(ErrorCodes.PaymentMustBePersisted);

        var orderCode = CreateOrderCode(payment.Id);
        var amount = ToPayOsAmount(payment.TotalAmount);
        var expiredAt = payment.ExpiredAt ?? DateTimeOffset.UtcNow.AddMinutes(15);

        PayOsPaymentResponse result;
        object gatewayPayload;

        if (_client == null)
        {
            var paymentLinkId = $"local-payos-{orderCode}";
            result = new PayOsPaymentResponse
            {
                PaymentId = payment.Id,
                MonthlyPassApplicationId = application.Id,
                OrderCode = orderCode,
                Amount = amount,
                Status = "PENDING",
                Provider = Provider,
                PaymentLinkId = paymentLinkId,
                CheckoutUrl = $"/local/payos/checkout/{paymentLinkId}",
                ExpiredAt = expiredAt,
                IsLocalPlaceholder = true
            };
            gatewayPayload = new
            {
                provider = Provider, localPlaceholder = true,
                orderCode, paymentLinkId = result.PaymentLinkId,
                checkoutUrl = result.CheckoutUrl, amount, expiredAt
            };
        }
        else
        {
            var request = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = amount,
                Description = $"MPASS {application.Id}",
                ReturnUrl = _options.ReturnUrl!,
                CancelUrl = _options.CancelUrl!,
                ExpiredAt = expiredAt.ToUnixTimeSeconds(),
                Items = new List<PaymentLinkItem>
                {
                    new() { Name = $"Monthly Pass {application.Id}", Quantity = 1, Price = amount }
                }
            };

            var response = await _client.PaymentRequests.CreateAsync(
                request, CreateRequestOptions<CreatePaymentLinkRequest>(cancellationToken));

            result = new PayOsPaymentResponse
            {
                PaymentId = payment.Id,
                MonthlyPassApplicationId = application.Id,
                OrderCode = response.OrderCode,
                Amount = response.Amount,
                Status = "PENDING",
                Provider = Provider,
                PaymentLinkId = response.PaymentLinkId,
                CheckoutUrl = response.CheckoutUrl,
                QrCode = response.QrCode,
                ExpiredAt = response.ExpiredAt.HasValue
                    ? DateTimeOffset.FromUnixTimeSeconds(response.ExpiredAt.Value)
                    : expiredAt
            };

            gatewayPayload = new
            {
                provider = Provider, localPlaceholder = false,
                orderCode = response.OrderCode,
                paymentLinkId = response.PaymentLinkId,
                checkoutUrl = response.CheckoutUrl,
                QrCode = response.QrCode, amount = response.Amount,
                currency = response.Currency,
                status = response.Status.ToString(),
                expiredAt = result.ExpiredAt
            };
        }

        payment.Provider = Provider;
        payment.ProviderTransactionId = result.PaymentLinkId;
        payment.PaymentUrl = result.CheckoutUrl;
        payment.ExpiredAt = result.ExpiredAt;
        payment.PaymentValidUntil = result.ExpiredAt;
        payment.GatewayPayload = JsonSerializer.Serialize(gatewayPayload);
        payment.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return result;
    }

'''

if "CreateMonthlyPassPaymentLinkAsync" not in c1:
    c1 = c1.replace(anchor1, monthly_method + anchor1)
    print("[OK] P1a: CreateMonthlyPassPaymentLinkAsync inserted")
else:
    print("[SKIP] P1a: already exists")

# 1b: Insert MONTHLY_PASS_RENEWAL webhook handler
monthly_handler = r'''
        else if (payment.Purpose == "MONTHLY_PASS_RENEWAL")
        {
            var mpApp = await _context.MonthlyPassApplications
                .FirstOrDefaultAsync(a => a.Id == payment.MonthlyPassApplicationId, cancellationToken);

            if (mpApp == null)
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);

            if (payment.Status == "PAID" && mpApp.Status == "PAID")
            {
                return new PayOsWebhookProcessResult
                {
                    Success = true, Idempotent = true,
                    Message = "Monthly pass payment already marked as paid.",
                    PaymentId = payment.Id, OrderCode = data.OrderCode,
                    PaymentStatus = payment.Status
                };
            }

            if (payment.TotalAmount != data.Amount)
                throw new BusinessException(ErrorCodes.PayOsAmountMismatch);

            payment.Status = "PAID";
            payment.ReceivedAmount = data.Amount;
            payment.PaidAt = now;
            payment.UpdatedAt = now;
            payment.GatewayPayload = MergeGatewayPayload(payment.GatewayPayload, data, webhook);

            mpApp.Status = "PAID";
            mpApp.PaymentMethod = "BANK_TRANSFER";
            mpApp.PaymentReferenceNo = data.OrderCode.ToString();
            mpApp.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_MONTHLY_PASS_PAYMENT_CONFIRMED",
                targetType: "Payment", targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new { payment.Id, mpApp.Id, data.OrderCode, amount = data.Amount }),
                reason: "payOS webhook confirmed monthly pass payment.");

            return new PayOsWebhookProcessResult
            {
                Success = true, Message = "Monthly pass payment marked as paid.",
                PaymentId = payment.Id, OrderCode = data.OrderCode,
                PaymentStatus = payment.Status
            };
        }
'''

old_else = "        else // Purpose is PARKING_FEE or LOST_CARD_FEE"
if "MONTHLY_PASS_RENEWAL" not in c1:
    c1 = c1.replace(old_else, monthly_handler + old_else)
    print("[OK] P1b: MONTHLY_PASS_RENEWAL webhook handler inserted")
else:
    print("[SKIP] P1b: already exists")

# 1c: Add MonthlyPassApplication include to FindPaymentAsync
old1c = '.Include(p => p.ParkingSession)\n                .FirstOrDefaultAsync(p => p.Id == paymentId'
new1c = '.Include(p => p.ParkingSession)\n                .Include(p => p.MonthlyPassApplication)\n                .FirstOrDefaultAsync(p => p.Id == paymentId'
if '.Include(p => p.MonthlyPassApplication)' not in c1.split('FirstOrDefaultAsync(p => p.Id == paymentId')[0]:
    c1 = c1.replace(old1c, new1c)

old1c2 = '.Include(p => p.ParkingSession)\n                .FirstOrDefaultAsync(p =>\n'
new1c2 = '.Include(p => p.ParkingSession)\n                .Include(p => p.MonthlyPassApplication)\n                .FirstOrDefaultAsync(p =>\n'
if c1.count('.Include(p => p.MonthlyPassApplication)') < 2:
    c1 = c1.replace(old1c2, new1c2)

print("[OK] P1c: MonthlyPassApplication includes added")
f1.write_text(c1, encoding="utf-8")

# ============================================================
# PATCH 2: MonthlyPassApplicationService.cs — add CreateOnlinePaymentAsync
# ============================================================
f2 = base / "Application" / "MonthlyPasses" / "MonthlyPassApplicationService.cs"
c2 = f2.read_text(encoding="utf-8")

anchor2 = "        private MonthlyPassApplicationResponse MapToResponse(MonthlyPassApplication application)"
online_method = r'''
        public async Task<Payment> CreateOnlinePaymentAsync(long applicationId, long userId)
        {
            var application = await _context.MonthlyPassApplications
                .Include(a => a.Vehicle)
                .FirstOrDefaultAsync(a => a.Id == applicationId);

            if (application == null)
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);

            if (application.Status != "APPROVED_AWAITING_PAYMENT")
                throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);

            var existing = await _context.Payments
                .Where(p => p.MonthlyPassApplicationId == applicationId
                         && p.Status == "PENDING"
                         && p.ExpiredAt > DateTimeOffset.UtcNow)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync();

            if (existing != null && !string.IsNullOrEmpty(existing.PaymentUrl))
                return existing;

            var payment = new Payment
            {
                MonthlyPassApplicationId = applicationId,
                Amount = application.Price,
                TotalAmount = application.Price,
                Purpose = "MONTHLY_PASS_RENEWAL",
                Method = "BANK_TRANSFER",
                Status = "PENDING",
                ExpiredAt = DateTimeOffset.UtcNow.AddMinutes(15),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

'''

if "CreateOnlinePaymentAsync" not in c2:
    c2 = c2.replace(anchor2, online_method + anchor2)
    print("[OK] P2: CreateOnlinePaymentAsync inserted")
else:
    print("[SKIP] P2: already exists")
f2.write_text(c2, encoding="utf-8")

# ============================================================
# PATCH 3: MonthlyPassApplicationsController.cs — add endpoint + DI
# ============================================================
f3 = base / "Controllers" / "MonthlyPassApplicationsController.cs"
c3 = f3.read_text(encoding="utf-8")

# Add using
if "using ParkingBuilding.CoreApi.Application.Payments;" not in c3:
    c3 = c3.replace(
        "using ParkingBuilding.CoreApi.Application.MonthlyPasses;",
        "using ParkingBuilding.CoreApi.Application.MonthlyPasses;\nusing ParkingBuilding.CoreApi.Application.Payments;\nusing ParkingBuilding.CoreApi.Infrastructure.Persistence;"
    )

# Add DI fields + constructor params
if "_payOsPaymentService" not in c3:
    c3 = c3.replace(
        "private readonly MonthlyPassApplicationService _applicationService;",
        "private readonly MonthlyPassApplicationService _applicationService;\n        private readonly IPayOsPaymentService _payOsPaymentService;\n        private readonly ParkingDbContext _context;"
    )
    c3 = c3.replace(
        "MonthlyPassApplicationsController(MonthlyPassApplicationService applicationService)",
        "MonthlyPassApplicationsController(MonthlyPassApplicationService applicationService, IPayOsPaymentService payOsPaymentService, ParkingDbContext context)"
    )
    c3 = c3.replace(
        "_applicationService = applicationService;",
        "_applicationService = applicationService;\n            _payOsPaymentService = payOsPaymentService;\n            _context = context;"
    )

# Add endpoint
anchor3 = '            return Success(result, "RFID card assigned and monthly pass activated successfully");\n        }\n\n        private'
new_endpoint = r'''            return Success(result, "RFID card assigned and monthly pass activated successfully");
        }

        [HttpPost("{id}/pay-online")]
        [Authorize(Roles = "DRIVER,STAFF,MANAGER,ADMIN")]
        public async Task<IActionResult> CreateOnlinePayment(long id)
        {
            var userId = GetCurrentUserId();
            var payment = await _applicationService.CreateOnlinePaymentAsync(id, userId);

            var application = await _context.MonthlyPassApplications.FindAsync(id);
            if (application == null)
                throw new BusinessException(ErrorCodes.NotFound, StatusCodes.Status404NotFound);

            var payOsResult = await _payOsPaymentService.CreateMonthlyPassPaymentLinkAsync(payment, application);

            return Success(new
            {
                paymentId = payment.Id,
                applicationId = id,
                amount = payment.Amount,
                totalAmount = payment.TotalAmount,
                status = payment.Status,
                checkoutUrl = payOsResult.CheckoutUrl,
                qrCode = payOsResult.QrCode,
                expiredAt = payOsResult.ExpiredAt
            }, "Online payment link created successfully.");
        }

        private'''

if "pay-online" not in c3:
    c3 = c3.replace(anchor3, new_endpoint)
    print("[OK] P3: pay-online endpoint + DI inserted")
else:
    print("[SKIP] P3: already exists")
f3.write_text(c3, encoding="utf-8")

# ============================================================
# PATCH 4: Payment.cs — add MonthlyPassApplicationId if missing
# ============================================================
f4 = base / "Domain" / "Entities" / "Payment.cs"
c4 = f4.read_text(encoding="utf-8")

if "MonthlyPassApplicationId" not in c4:
    c4 = c4.replace(
        "public long? MonthlyPassId { get; set; }",
        "public long? MonthlyPassApplicationId { get; set; }\n        public virtual MonthlyPassApplication? MonthlyPassApplication { get; set; }\n\n        public long? MonthlyPassId { get; set; }"
    )
    f4.write_text(c4, encoding="utf-8")
    print("[OK] P4: MonthlyPassApplicationId added to Payment.cs")
else:
    print("[SKIP] P4: already exists")

print("\n=== ALL PATCHES COMPLETE ===")
