using ParkingBuilding.CoreApi.Domain.Entities;
using PayOS.Models.Webhooks;

namespace ParkingBuilding.CoreApi.Application.Payments;

public interface IPayOsPaymentService
{
    Task<PayOsPaymentResponse> CreateReservationPaymentLinkAsync(
        Payment payment,
        Reservation reservation,
        CancellationToken cancellationToken = default);

    Task<PayOsPaymentResponse> CreateExitPaymentLinkAsync(
        Payment payment,
        ParkingSession session,
        CancellationToken cancellationToken = default);

    Task<PayOsWebhookProcessResult> ProcessWebhookAsync(
        Webhook webhook,
        CancellationToken cancellationToken = default);

    Task CancelPaymentLinkAsync(
        Payment payment,
        string reason,
        CancellationToken cancellationToken = default);

    Task CancelProviderPaymentLinkAsync(
        string? providerTransactionId,
        string? gatewayPayload,
        string reason,
        CancellationToken cancellationToken = default);
}
