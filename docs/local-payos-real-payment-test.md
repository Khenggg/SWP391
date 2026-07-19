# Local real payOS reservation payment test

This workflow creates a real payOS checkout link through the backend reservation flow. Do not commit payOS secrets to `appsettings.*.json`, scripts, or docs.

## Required environment variables

Set these in the shell that starts `ParkingBuilding.CoreApi`:

```powershell
$env:PAYOS_CLIENT_ID = "<your-client-id>"
$env:PAYOS_API_KEY = "<your-api-key>"
$env:PAYOS_CHECKSUM_KEY = "<your-checksum-key>"
$env:PAYOS_RETURN_URL = "http://localhost:5173/payment/return"
$env:PAYOS_CANCEL_URL = "http://localhost:5173/payment/cancel"
$env:PAYOS_WEBHOOK_URL = "https://<public-host>/api/core/payments/payos/webhook"
$env:RESERVATION_ALLOW_ZERO_BOOKING_FEE = "false"
$env:RESERVATION_MAX_HOURS = "3"
```

`PAYOS_WEBHOOK_URL` must be public and reachable by payOS. For local testing, expose the backend with a tunnel and use that public URL.

## Start backend

```powershell
dotnet run --project backend/ParkingBuilding.CoreApi/ParkingBuilding.CoreApi.csproj
```

## Run the real payment test

In a separate PowerShell window with the same `PAYOS_*` variables available:

```powershell
.\scripts\test-real-payos-payment.ps1 `
  -BaseUrl "http://localhost:5000" `
  -PublicWebhookBaseUrl "https://<public-host>" `
  -ReservationHourlyPrice 10000 `
  -ReservedDurationMinutes 60
```

The script:

1. Verifies required payOS env vars are present without printing secret values.
2. Logs in as `admin01`, `driver01`, and `staff01`.
3. Sets a positive integer `reservationHourlyPrice`.
4. Creates a reservation and prints the real payOS checkout URL.
5. Waits for you to pay, then polls `GET /api/core/reservations/{id}/payment-status`.
6. Verifies entry-check returns `VALID` after webhook confirmation.

If polling times out, check that the public webhook URL is configured in the payOS dashboard and points to:

```text
POST /api/core/payments/payos/webhook
```

## Local fake webhook test

Without real payOS credentials, use the local placeholder automation:

```powershell
.\scripts\test-payos-reservation-flow.ps1 -BaseUrl "http://localhost:5000" -AllowWriteTests -AllowReset
```

That script covers:

- paid reservation returns `checkoutUrl`
- unpaid entry-check is rejected
- valid webhook marks payment and reservation paid
- duplicate webhook is idempotent
- wrong amount webhook fails
- paid confirmed reservation passes entry-check
