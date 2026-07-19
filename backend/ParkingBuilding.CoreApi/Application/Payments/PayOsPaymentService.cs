using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ParkingBuilding.CoreApi.Application.Audit;
using ParkingBuilding.CoreApi.Contracts.Common;
using ParkingBuilding.CoreApi.Domain.Entities;
using ParkingBuilding.CoreApi.Infrastructure.Persistence;
using PayOS;
using PayOS.Models;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Application.Payments;

public class PayOsPaymentService : IPayOsPaymentService
{
    private const string Provider = "PAYOS";
    private readonly ParkingDbContext _context;
    private readonly IAuditWriterService _auditWriter;
    private readonly PayOsOptions _options;
    private readonly PayOSClient? _client;

    public PayOsPaymentService(
        ParkingDbContext context,
        IAuditWriterService auditWriter,
        IOptions<PayOsOptions> options)
    {
        _context = context;
        _auditWriter = auditWriter;
        _options = options.Value;

        if (_options.IsConfigured)
        {
            _client = new PayOSClient(new PayOS.PayOSOptions
            {
                ClientId = _options.ClientId!,
                ApiKey = _options.ApiKey!,
                ChecksumKey = _options.ChecksumKey!,
                TimeoutMs = GetRequestTimeoutMs(),
                MaxRetries = 0
            });
        }
    }

    private int GetRequestTimeoutMs()
        => Math.Clamp(_options.RequestTimeoutMs, 1000, 60000);

    private RequestOptions CreateRequestOptions(CancellationToken cancellationToken)
        => new()
        {
            TimeoutMs = GetRequestTimeoutMs(),
            MaxRetries = 0,
            CancellationToken = cancellationToken
        };

    private RequestOptions<TRequest> CreateRequestOptions<TRequest>(CancellationToken cancellationToken)
        => new()
        {
            TimeoutMs = GetRequestTimeoutMs(),
            MaxRetries = 0,
            CancellationToken = cancellationToken
        };

    private void EnsureConfiguredInProduction()
    {
        var isDevelopment = string.Equals(
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            "Development",
            StringComparison.OrdinalIgnoreCase);

        if (!isDevelopment && !_options.IsConfigured)
        {
            throw new BusinessException(ErrorCodes.PayOsConfigRequired);
        }
    }

    public async Task<PayOsPaymentResponse> CreateReservationPaymentLinkAsync(
        Payment payment,
        Reservation reservation,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (payment.Id <= 0)
        {
            throw new BusinessException(ErrorCodes.PaymentMustBePersisted);
        }

        var orderCode = CreateOrderCode(payment.Id);
        var amount = ToPayOsAmount(payment.TotalAmount);
        var expiredAt = payment.ExpiredAt ?? reservation.ExpiresAt;

        PayOsPaymentResponse result;
        object gatewayPayload;

        if (_client == null)
        {
            result = CreateLocalPlaceholderResponse(payment, reservation, orderCode, amount, expiredAt);
            gatewayPayload = new
            {
                provider = Provider,
                localPlaceholder = true,
                orderCode,
                paymentLinkId = result.PaymentLinkId,
                checkoutUrl = result.CheckoutUrl,
                amount,
                expiredAt
            };
        }
        else
        {
            var request = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = amount,
                Description = $"RES {reservation.Id}",
                ReturnUrl = _options.ReturnUrl!,
                CancelUrl = _options.CancelUrl!,
                ExpiredAt = expiredAt.ToUnixTimeSeconds(),
                Items = new List<PaymentLinkItem>
                {
                    new()
                    {
                        Name = $"Reservation {reservation.ReservationCode}",
                        Quantity = 1,
                        Price = amount
                    }
                }
            };

            var response = await _client.PaymentRequests.CreateAsync(
                request,
                CreateRequestOptions<CreatePaymentLinkRequest>(cancellationToken));

            result = new PayOsPaymentResponse
            {
                PaymentId = payment.Id,
                ReservationId = reservation.Id,
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
                provider = Provider,
                localPlaceholder = false,
                orderCode = response.OrderCode,
                paymentLinkId = response.PaymentLinkId,
                checkoutUrl = response.CheckoutUrl,
                QrCode = response.QrCode,
                amount = response.Amount,
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

    public async Task<PayOsPaymentResponse> CreateExitPaymentLinkAsync(
        Payment payment,
        ParkingSession session,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (payment.Id <= 0)
        {
            throw new BusinessException(ErrorCodes.PaymentMustBePersisted);
        }

        var orderCode = CreateOrderCode(payment.Id);
        var amount = ToPayOsAmount(payment.TotalAmount);
        var expiredAt = payment.ExpiredAt ?? DateTimeOffset.UtcNow.AddMinutes(15);

        PayOsPaymentResponse result;
        object gatewayPayload;

        if (_client == null)
        {
            result = CreateLocalPlaceholderSessionResponse(payment, session, orderCode, amount, expiredAt);
            gatewayPayload = new
            {
                provider = Provider,
                localPlaceholder = true,
                orderCode,
                paymentLinkId = result.PaymentLinkId,
                checkoutUrl = result.CheckoutUrl,
                amount,
                expiredAt
            };
        }
        else
        {
            var request = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = amount,
                Description = $"EXIT {session.SessionCode}",
                ReturnUrl = _options.ReturnUrl!,
                CancelUrl = _options.CancelUrl!,
                ExpiredAt = expiredAt.ToUnixTimeSeconds(),
                Items = new List<PaymentLinkItem>
                {
                    new()
                    {
                        Name = $"Exit Fee {session.SessionCode}",
                        Quantity = 1,
                        Price = amount
                    }
                }
            };

            var response = await _client.PaymentRequests.CreateAsync(
                request,
                CreateRequestOptions<CreatePaymentLinkRequest>(cancellationToken));

            result = new PayOsPaymentResponse
            {
                PaymentId = payment.Id,
                SessionId = session.Id,
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
                provider = Provider,
                localPlaceholder = false,
                orderCode = response.OrderCode,
                paymentLinkId = response.PaymentLinkId,
                checkoutUrl = response.CheckoutUrl,
                QrCode = response.QrCode,
                amount = response.Amount,
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

    public async Task<PayOsWebhookProcessResult> ProcessWebhookAsync(
        Webhook webhook,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        var data = await VerifyWebhookAsync(webhook);
        if (data == null)
        {
            throw new BusinessException(ErrorCodes.PayOsWebhookInvalid);
        }

        // Intercept test webhook from PayOS Dashboard
        if (data.OrderCode == 123)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_WEBHOOK_TEST_SUCCESS",
                targetType: "Payment",
                targetId: "0",
                newValue: "PayOS Dashboard Webhook test succeeded (orderCode 123)",
                reason: "payOS dashboard test webhook request."
            );

            return new PayOsWebhookProcessResult
            {
                Success = true,
                Message = "Test webhook processed successfully.",
                OrderCode = 123,
                PaymentStatus = "PAID",
                ReservationStatus = "CONFIRMED"
            };
        }

        var payment = await FindPaymentAsync(data, cancellationToken);
        if (payment == null)
        {
            throw new BusinessException(ErrorCodes.PaymentNotFound, StatusCodes.Status404NotFound);
        }

        var now = DateTimeOffset.UtcNow;

        if (payment.Purpose == "RESERVATION_FEE" || payment.Purpose == "RESERVATION_EXTENSION")
        {
            if (payment.Reservation == null)
            {
                throw new BusinessException(ErrorCodes.PaymentReservationNotFound, StatusCodes.Status404NotFound);
            }

            // Webhook duplicate check
            if (payment.Status == "PAID" && payment.Reservation.Status == "CONFIRMED")
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_WEBHOOK_DUPLICATE",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: $"Payment is already PAID and Reservation is CONFIRMED. OrderCode: {data.OrderCode}",
                    reason: "payOS webhook duplicate request."
                );

                return new PayOsWebhookProcessResult
                {
                    Success = true,
                    Idempotent = true,
                    Message = "Payment already marked as paid.",
                    PaymentId = payment.Id,
                    ReservationId = payment.ReservationId,
                    OrderCode = data.OrderCode,
                    PaymentStatus = payment.Status,
                    ReservationStatus = payment.Reservation.Status
                };
            }

            // Payment purpose check
            if (payment.Purpose != "RESERVATION_FEE")
            {
                throw new BusinessException(ErrorCodes.InvalidRequest, StatusCodes.Status400BadRequest);
            }

            var expectedAmount = CalculateExpectedReservationAmount(payment.Reservation);

            // Webhook amount check
            if (payment.TotalAmount != data.Amount || data.Amount != expectedAmount || payment.TotalAmount != expectedAmount)
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_WEBHOOK_AMOUNT_MISMATCH",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: JsonSerializer.Serialize(new
                    {
                        paymentTotalAmount = payment.TotalAmount,
                        webhookAmount = data.Amount,
                        expectedReservationAmount = expectedAmount,
                        data.OrderCode,
                        data.PaymentLinkId
                    }),
                    reason: "payOS webhook amount mismatch."
                );
                throw new BusinessException(ErrorCodes.PayOsAmountMismatch);
            }

            // Webhook late payment check (after payment deadline)
            if (payment.Reservation.PaymentDeadline.HasValue && now > payment.Reservation.PaymentDeadline.Value)
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_WEBHOOK_LATE_PAYMENT_REVIEW",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: $"Payment deadline was {payment.Reservation.PaymentDeadline.Value:yyyy-MM-dd HH:mm:ss}, current time {now:yyyy-MM-dd HH:mm:ss}. OrderCode: {data.OrderCode}",
                    reason: "payOS webhook received after payment deadline."
                );

                return new PayOsWebhookProcessResult
                {
                    Success = true,
                    Message = "LATE_PAYMENT_REVIEW",
                    PaymentId = payment.Id,
                    ReservationId = payment.ReservationId,
                    OrderCode = data.OrderCode,
                    PaymentStatus = payment.Status,
                    ReservationStatus = payment.Reservation.Status
                };
            }

            if (payment.Status != "PENDING" || payment.Reservation.Status != "PENDING" || payment.Reservation.PaymentStatus != "PENDING")
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_WEBHOOK_LATE_PAYMENT_REVIEW",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: $"Reservation status is {payment.Reservation.Status}, payment status is {payment.Reservation.PaymentStatus}. OrderCode: {data.OrderCode}",
                    reason: "payOS webhook reservation not in PENDING state."
                );

                return new PayOsWebhookProcessResult
                {
                    Success = true,
                    Message = "LATE_PAYMENT_REVIEW",
                    PaymentId = payment.Id,
                    ReservationId = payment.ReservationId,
                    OrderCode = data.OrderCode,
                    PaymentStatus = payment.Status,
                    ReservationStatus = payment.Reservation.Status
                };
            }

            // Confirm reservation and payment
            payment.Status = "PAID";
            payment.ReceivedAmount = data.Amount;
            payment.PaidAt = now;
            payment.UpdatedAt = now;
            payment.GatewayPayload = MergeGatewayPayload(payment.GatewayPayload, data, webhook);

            payment.Reservation.PaymentStatus = "PAID";
            payment.Reservation.Status = "CONFIRMED";
            payment.Reservation.ConfirmedAt = now;
            payment.Reservation.UpdatedAt = now;

            await _context.SaveChangesAsync(cancellationToken);

            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_PAYMENT_CONFIRMED",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new
                {
                    payment.Id,
                    payment.ReservationId,
                    data.OrderCode,
                    data.PaymentLinkId,
                    amount = data.Amount
                }),
                reason: "payOS webhook confirmed reservation payment.");

            return new PayOsWebhookProcessResult
            {
                Success = true,
                Message = "Payment marked as paid.",
                PaymentId = payment.Id,
                ReservationId = payment.ReservationId,
                OrderCode = data.OrderCode,
                PaymentStatus = payment.Status,
                ReservationStatus = payment.Reservation.Status
            };
        }
        else // Purpose is PARKING_FEE or LOST_CARD_FEE
        {
            if (payment.ParkingSession == null)
            {
                throw new BusinessException(ErrorCodes.PaymentSessionNotFound, StatusCodes.Status404NotFound);
            }

            // Webhook duplicate check
            if (payment.Status == "PAID" && payment.ParkingSession.PaymentStatus == "PAID")
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_WEBHOOK_DUPLICATE",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: $"Exit Payment is already PAID and Session PaymentStatus is PAID. OrderCode: {data.OrderCode}",
                    reason: "payOS webhook duplicate request for exit fee."
                );

                return new PayOsWebhookProcessResult
                {
                    Success = true,
                    Idempotent = true,
                    Message = "Payment already marked as paid.",
                    PaymentId = payment.Id,
                    SessionId = payment.SessionId,
                    OrderCode = data.OrderCode,
                    PaymentStatus = payment.Status
                };
            }

            // Webhook amount check
            if (payment.TotalAmount != data.Amount)
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_WEBHOOK_AMOUNT_MISMATCH",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: JsonSerializer.Serialize(new
                    {
                        paymentTotalAmount = payment.TotalAmount,
                        webhookAmount = data.Amount,
                        data.OrderCode,
                        data.PaymentLinkId
                    }),
                    reason: "payOS webhook exit amount mismatch."
                );
                throw new BusinessException(ErrorCodes.PayOsAmountMismatch);
            }

            // Confirm payment for session
            payment.Status = "PAID";
            payment.ReceivedAmount = data.Amount;
            payment.PaidAt = now;
            payment.UpdatedAt = now;
            payment.GatewayPayload = MergeGatewayPayload(payment.GatewayPayload, data, webhook);

            // Read buffer minutes from config or default to 15
            int bufferMinutes = 15;
            var envBuffer = Environment.GetEnvironmentVariable("EXIT_PAID_BUFFER_MINUTES");
            if (int.TryParse(envBuffer, out var parsedBuffer))
            {
                bufferMinutes = parsedBuffer;
            }

            payment.ParkingSession.PaymentStatus = "PAID";
            payment.ParkingSession.UpdatedAt = now;
            payment.PaymentValidUntil = now.AddMinutes(bufferMinutes);

            await _context.SaveChangesAsync(cancellationToken);

            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_EXIT_PAYMENT_CONFIRMED",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new
                {
                    payment.Id,
                    payment.SessionId,
                    data.OrderCode,
                    data.PaymentLinkId,
                    amount = data.Amount,
                    validUntil = payment.PaymentValidUntil
                }),
                reason: "payOS webhook confirmed exit parking fee payment.");

            return new PayOsWebhookProcessResult
            {
                Success = true,
                Message = "Exit payment marked as paid.",
                PaymentId = payment.Id,
                SessionId = payment.SessionId,
                OrderCode = data.OrderCode,
                PaymentStatus = payment.Status
            };
        }
    }

    public async Task<bool> TryReconcileReservationPaymentAsync(
        Payment payment,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (_client == null
            || payment.Provider != Provider
            || payment.Reservation == null)
        {
            return false;
        }

        if (payment.Status == "PAID" && payment.Reservation.PaymentStatus == "PAID")
        {
            return false;
        }

        var orderCode = CreateOrderCode(payment.Id);
        PaymentLink providerPayment;
        try
        {
            providerPayment = await _client.PaymentRequests.GetAsync(
                orderCode,
                CreateRequestOptions(cancellationToken));
        }
        catch (Exception ex)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_PAYMENT_RECONCILE_FETCH_FAILED",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new
                {
                    payment.Id,
                    payment.ReservationId,
                    orderCode,
                    error = ex.Message
                }),
                reason: "payOS reconcile fetch failed.");
            return false;
        }

        if (providerPayment.Amount != ToPayOsAmount(payment.TotalAmount))
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_PAYMENT_RECONCILE_AMOUNT_MISMATCH",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new
                {
                    paymentId = payment.Id,
                    reservationId = payment.ReservationId,
                    orderCode,
                    localAmount = payment.TotalAmount,
                    providerAmount = providerPayment.Amount,
                    providerStatus = providerPayment.Status
                }),
                reason: "payOS reconcile amount mismatch.");
            return false;
        }

        if (providerPayment.Status != PaymentLinkStatus.Paid
            || providerPayment.AmountPaid < providerPayment.Amount)
        {
            return false;
        }

        var paidAt = TryResolveProviderPaidAt(providerPayment) ?? DateTimeOffset.UtcNow;
        if (payment.Reservation.PaymentDeadline.HasValue && paidAt > payment.Reservation.PaymentDeadline.Value)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_PAYMENT_RECONCILE_LATE_PAYMENT",
                targetType: "Payment",
                targetId: payment.Id.ToString(),
                newValue: JsonSerializer.Serialize(new
                {
                    paymentId = payment.Id,
                    reservationId = payment.ReservationId,
                    orderCode,
                    paymentDeadline = payment.Reservation.PaymentDeadline,
                    providerPaidAt = paidAt,
                    providerStatus = providerPayment.Status
                }),
                reason: "payOS reconcile detected paid state after deadline.");
            return false;
        }

        if (IsLocalTerminalState(payment))
        {
            var localDecisionAt = payment.UpdatedAt > payment.Reservation.UpdatedAt
                ? payment.UpdatedAt
                : payment.Reservation.UpdatedAt;

            if (paidAt > localDecisionAt)
            {
                await _auditWriter.WriteAuditLogAsync(
                    action: "PAYOS_PAYMENT_RECONCILE_SKIPPED_TERMINAL_STATE",
                    targetType: "Payment",
                    targetId: payment.Id.ToString(),
                    newValue: JsonSerializer.Serialize(new
                    {
                        paymentId = payment.Id,
                        reservationId = payment.ReservationId,
                        orderCode,
                        paymentStatus = payment.Status,
                        reservationStatus = payment.Reservation.Status,
                        localDecisionAt,
                        providerPaidAt = paidAt
                    }),
                    reason: "payOS reconcile skipped because provider payment happened after local terminal state.");
                return false;
            }
        }

        payment.Status = "PAID";
        payment.ReceivedAmount = providerPayment.AmountPaid;
        payment.PaidAt = paidAt;
        payment.UpdatedAt = DateTimeOffset.UtcNow;
        payment.GatewayPayload = MergeGatewayPayload(payment.GatewayPayload, providerPayment);

        payment.Reservation.PaymentStatus = "PAID";
        payment.Reservation.Status = "CONFIRMED";
        payment.Reservation.ConfirmedAt ??= paidAt;
        payment.Reservation.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        await _auditWriter.WriteAuditLogAsync(
            action: "PAYOS_PAYMENT_RECONCILED",
            targetType: "Payment",
            targetId: payment.Id.ToString(),
            newValue: JsonSerializer.Serialize(new
            {
                paymentId = payment.Id,
                reservationId = payment.ReservationId,
                orderCode,
                providerPaymentId = providerPayment.Id,
                providerStatus = providerPayment.Status,
                providerAmount = providerPayment.Amount,
                providerAmountPaid = providerPayment.AmountPaid,
                paidAt
            }),
            reason: "payOS payment reconciled from provider status API.");

        return true;
    }

    public async Task CancelPaymentLinkAsync(
        Payment payment,
        string reason,
        CancellationToken cancellationToken = default)
    {
        if (payment.Provider != Provider)
        {
            return;
        }

        var shouldUpdateStatus = payment.Status == "PENDING";
        if (shouldUpdateStatus)
        {
            payment.Status = "CANCELLED";
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        await CancelProviderPaymentLinkAsync(
            payment.ProviderTransactionId,
            payment.GatewayPayload,
            reason,
            cancellationToken);
    }

    public async Task CancelProviderPaymentLinkAsync(
        string? providerTransactionId,
        string? gatewayPayload,
        string reason,
        CancellationToken cancellationToken = default)
    {
        EnsureConfiguredInProduction();

        if (_client == null)
        {
            return;
        }

        var idOrOrderCode = providerTransactionId ?? TryReadGatewayString(gatewayPayload, "orderCode");
        if (string.IsNullOrWhiteSpace(idOrOrderCode))
        {
            return;
        }

        try
        {
            await _client.PaymentRequests.CancelAsync(
                idOrOrderCode,
                reason,
                CreateRequestOptions<CancelPaymentLinkRequest>(cancellationToken));
        }
        catch (Exception ex)
        {
            await _auditWriter.WriteAuditLogAsync(
                action: "PAYOS_CANCEL_LINK_FAILED",
                targetType: "Payment",
                targetId: idOrOrderCode,
                newValue: JsonSerializer.Serialize(new
                {
                    providerTransactionId,
                    idOrOrderCode,
                    error = ex.Message
                }),
                reason: reason);
            throw new BusinessException(ErrorCodes.PayOsCancelLinkFailed);
        }
    }

    private async Task<WebhookData?> VerifyWebhookAsync(Webhook webhook)
    {
        var isDevelopment = string.Equals(
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            "Development",
            StringComparison.OrdinalIgnoreCase);

        if (_client == null || isDevelopment)
        {
            return webhook.Data;
        }

        return await _client.Webhooks.VerifyAsync(webhook);
    }

    private async Task<Payment?> FindPaymentAsync(WebhookData data, CancellationToken cancellationToken)
    {
        long paymentId = data.OrderCode - 900_000_000_000;
        if (paymentId > 0)
        {
            var payment = await _context.Payments
                .Include(p => p.Reservation)
                .Include(p => p.ParkingSession)
                .FirstOrDefaultAsync(p => p.Id == paymentId, cancellationToken);
            if (payment != null)
            {
                return payment;
            }
        }

        // Fallback: search by ProviderTransactionId
        return await _context.Payments
            .Include(p => p.Reservation)
            .Include(p => p.ParkingSession)
            .FirstOrDefaultAsync(p =>
                p.Provider == Provider
                && (p.ProviderTransactionId == data.PaymentLinkId || p.ProviderTransactionId == data.OrderCode.ToString()),
                cancellationToken);
    }

    private static PayOsPaymentResponse CreateLocalPlaceholderResponse(
        Payment payment,
        Reservation reservation,
        long orderCode,
        long amount,
        DateTimeOffset expiredAt)
    {
        var paymentLinkId = $"local-payos-{orderCode}";
        return new PayOsPaymentResponse
        {
            PaymentId = payment.Id,
            ReservationId = reservation.Id,
            OrderCode = orderCode,
            Amount = amount,
            Status = "PENDING",
            Provider = Provider,
            PaymentLinkId = paymentLinkId,
            CheckoutUrl = $"/local/payos/checkout/{paymentLinkId}",
            ExpiredAt = expiredAt,
            IsLocalPlaceholder = true
        };
    }

    private static PayOsPaymentResponse CreateLocalPlaceholderSessionResponse(
        Payment payment,
        ParkingSession session,
        long orderCode,
        long amount,
        DateTimeOffset expiredAt)
    {
        var paymentLinkId = $"local-payos-{orderCode}";
        return new PayOsPaymentResponse
        {
            PaymentId = payment.Id,
            SessionId = session.Id,
            OrderCode = orderCode,
            Amount = amount,
            Status = "PENDING",
            Provider = Provider,
            PaymentLinkId = paymentLinkId,
            CheckoutUrl = $"/local/payos/checkout/{paymentLinkId}",
            ExpiredAt = expiredAt,
            IsLocalPlaceholder = true
        };
    }

    private static long CreateOrderCode(long paymentId)
        => 900_000_000_000 + paymentId;

    private static long ToPayOsAmount(decimal amount)
        => decimal.ToInt64(decimal.Round(amount, 0, MidpointRounding.AwayFromZero));

    private static decimal CalculateExpectedReservationAmount(Reservation reservation)
    {
        if (reservation.ReservedDurationMinutes <= 0)
        {
            throw new BusinessException(ErrorCodes.ReservationDurationInvalid);
        }

        if (reservation.ReservedDurationMinutes % 60 != 0)
        {
            throw new BusinessException(ErrorCodes.ReservationDurationMustBeWholeHours);
        }

        if (reservation.SnapshotReservationHourlyPrice <= 0m)
        {
            throw new BusinessException(ErrorCodes.ReservationPricingNotConfigured);
        }

        if (reservation.SnapshotReservationHourlyPrice != decimal.Truncate(reservation.SnapshotReservationHourlyPrice))
        {
            throw new BusinessException(ErrorCodes.ReservationHourlyPriceMustBeInteger);
        }

        var expectedAmount = (reservation.ReservedDurationMinutes / 60) * reservation.SnapshotReservationHourlyPrice;
        if (expectedAmount != decimal.Truncate(expectedAmount))
        {
            throw new BusinessException(ErrorCodes.ReservationBookingAmountMustBeInteger);
        }

        return expectedAmount;
    }

    private static string MergeGatewayPayload(string? currentPayload, WebhookData data, Webhook webhook)
    {
        return JsonSerializer.Serialize(new
        {
            previous = TryParseJson(currentPayload),
            webhook = new
            {
                webhook.Code,
                webhook.Description,
                webhook.Success,
                data.OrderCode,
                data.Amount,
                data.PaymentLinkId,
                data.Reference,
                data.TransactionDateTime,
                data.AccountNumber
            }
        });
    }

    private static string MergeGatewayPayload(string? currentPayload, PaymentLink providerPayment)
    {
        return JsonSerializer.Serialize(new
        {
            previous = TryParseJson(currentPayload),
            reconcile = new
            {
                providerPayment.Id,
                providerPayment.OrderCode,
                providerPayment.Amount,
                providerPayment.AmountPaid,
                providerPayment.AmountRemaining,
                status = providerPayment.Status.ToString(),
                providerPayment.CreatedAt,
                providerPayment.CancellationReason,
                providerPayment.CanceledAt,
                transactions = providerPayment.Transactions
            }
        });
    }

    private static DateTimeOffset? TryResolveProviderPaidAt(PaymentLink providerPayment)
    {
        if (providerPayment.Transactions == null || providerPayment.Transactions.Count == 0)
        {
            return null;
        }

        foreach (var transaction in providerPayment.Transactions)
        {
            if (DateTimeOffset.TryParse(transaction.TransactionDateTime, out var parsed))
            {
                return parsed.ToUniversalTime();
            }
        }

        return null;
    }

    private static bool IsLocalTerminalState(Payment payment)
        => payment.Status is "CANCELLED" or "FAILED"
           || payment.Reservation?.Status is "CANCELLED" or "EXPIRED";

    private static JsonElement? TryParseJson(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(value);
            return document.RootElement.Clone();
        }
        catch
        {
            return null;
        }
    }

    private static string? TryReadGatewayString(string? gatewayPayload, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(gatewayPayload))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(gatewayPayload);
            if (document.RootElement.TryGetProperty(propertyName, out var property))
            {
                return property.ValueKind == JsonValueKind.String
                    ? property.GetString()
                    : property.ToString();
            }
        }
        catch
        {
            return null;
        }

        return null;
    }
}
