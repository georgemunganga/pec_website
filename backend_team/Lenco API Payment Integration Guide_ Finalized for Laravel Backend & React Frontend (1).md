# Lenco API Payment Integration Guide: Finalized for Laravel Backend & React Frontend

**Author:** Manus AI
**Date:** December 1, 2025

This is the final, refined integration guide, incorporating your provided API credentials and clearly defining the payment flow for the **Laravel Backend Team** and the **React Frontend Team**.

---

## 0. Your Lenco API Credentials

The following credentials should be securely stored in your Laravel application's environment configuration (e.g., `.env` file). **NEVER expose the Secret Key or Webhook Signature Key in your frontend code.**

| Credential | Value | Laravel `.env` Key (Suggested) |
| :--- | :--- | :--- |
| **Base URL** | `https://api.lenco.co/access/v2` | `LENCO_BASE_URL` |
| **API (Secret) Key** | `9718f2b63d65b6a27209428ab4f11b26a3dc40cbaca6c7f6b40c9f1df4b50120` | `LENCO_SECRET_KEY` |
| **Public Key** | `pub-84f5185cc8279a51f08d9eea9e1cf176547e3eb483504142` | `LENCO_PUBLIC_KEY` |
| **Webhook Signature Key** | `fabc07b787fd05f243b4e1fe618d77698c73e971545ab91510b7db5fe32e2045` | `LENCO_WEBHOOK_SIGNATURE_KEY` |

---

## 1. Backend Team (Laravel) Responsibilities

The Laravel backend is the single point of contact for the Lenco API, handling all secure operations, transaction initiation, and final payment recording.

### A. Core Responsibilities

| Area | Responsibility | Implementation Detail |
| :--- | :--- | :--- |
| **Authentication** | Use `LENCO_SECRET_KEY` in the `Authorization: Bearer` header for all API calls. | `Authorization: Bearer 9718f2b63d65b6a27209428ab4f11b26a3dc40cbaca6c7f6b40c9f1df4b50120` |
| **Payment Initiation** | Implement dedicated API routes (e.g., `/api/payment/mobile-money`, `/api/payment/card`) that the React frontend calls to start a transaction. | The backend initiates the transaction with Lenco. |
| **Webhooks** | Set up the webhook endpoint (e.g., `https://api.bakedna.com/lenco/webhook`) and use `LENCO_WEBHOOK_SIGNATURE_KEY` to verify event authenticity. | This is the primary method for recording final payment status. |
| **Callback/Redirect** | Handle the final redirect from Lenco after a 3DS card payment. This route will process the final status from query parameters. | This acts as a secondary confirmation method for card payments. |
| **Error Handling** | Implement robust error handling for all API calls and webhook processing. | Ensure all payment attempts are logged and handled gracefully. |

### B. Payment Flow Logic (Laravel)

The flow must be designed to handle both direct API responses and asynchronous updates (webhooks/callbacks).

| Payment Method | Lenco Endpoint | Initial Response Flow | Final Status Flow |
| :--- | :--- | :--- | :--- |
| **Mobile Money** | `/collections/mobile-money` | Returns `pay-offline`. Laravel returns a status to React. | **Webhook** (`transaction.successful`/`transaction.failed`) is the primary source of truth. |
| **Card Payment** | `/collections/card` | Returns `3ds-auth-required` (with redirect URL) or `successful`/`failed`. | **Callback** to `redirectUrl` is the immediate source. **Webhook** is the final source of truth. |

---

## 2. Frontend Team (React) Responsibilities

The React frontend is responsible for collecting data and managing the user's journey, including redirects for authorization.

### A. Core Responsibilities

| Area | Responsibility | Implementation Detail |
| :--- | :--- | :--- |
| **Data Collection** | Collect all required payment and customer details securely. | Send data to the Laravel backend's initiation routes. |
| **Payment Request** | Call the Laravel backend's payment initiation routes. | The frontend should wait for the backend's response to determine the next step. |
| **Redirect Handling** | If the backend response contains a 3DS redirect URL, immediately redirect the user. | `window.location.href = redirectUrl` |
| **Final Status Display** | Handle the final landing page after the payment process is complete (via callback or direct success). | Display a clear success or failure message to the user. |

### B. The Redirect/Callback Mechanism (Card Payments)

The user's goal is to have the payment processed by the backend, with the user only being redirected if necessary.

1.  **React:** User submits card details to Laravel route `/api/payment/card`.
2.  **Laravel:** Calls Lenco API.
3.  **Lenco Response:**
    *   **If 3DS is required:** Lenco returns a `redirect` URL. Laravel sends this URL back to React.
    *   **If no 3DS:** Lenco returns `successful` or `failed`. Laravel records the payment and sends the final status to React.
4.  **React (on 3DS Redirect):** React receives the `redirect` URL and immediately redirects the user's browser to the bank's 3DS page.
5.  **Lenco Callback:** After 3DS, Lenco redirects the user back to the `redirectUrl` defined in the initial payload (a Laravel route).
6.  **Laravel Callback Route:** This route processes the final status from the URL query parameters, records the payment, and then redirects the user to a final React status page (e.g., `/order/success?ref=...`).

---

## 3. Webhook Security and Implementation (For Laravel Team)

The webhook is the most reliable way to ensure the backend records the payment, as it is independent of the user's browser session.

### A. Webhook Verification Code (Conceptual)

Use the provided `LENCO_WEBHOOK_SIGNATURE_KEY` to verify the `X-Lenco-Signature` header.

```php
// Conceptual Laravel logic for signature verification

protected function verifySignature(Request $request): bool
{
    $payload = $request->getContent();
    $signature = $request->header('X-Lenco-Signature');
    
    if (!$signature) {
        return false;
    }

    // Use the provided Webhook Signature Key directly
    $webhookSignatureKey = env('LENCO_WEBHOOK_SIGNATURE_KEY'); 

    // Calculate the expected signature (HMAC SHA512)
    $expectedSignature = hash_hmac('sha512', $payload, $webhookSignatureKey);

    // Use hash_equals for a timing attack safe comparison
    return hash_equals($expectedSignature, $signature);
}
```

### B. Relevant Webhook Events

The Laravel team should focus on these events to update the order status:

*   `transaction.successful`
*   `transaction.failed`

---

## References

[1] Lenco API Documentation: /collections/mobile-money.
[2] Lenco API Documentation: /collections/card.
[3] Lenco API Documentation: Webhooks. `https://lenco-api.readme.io/reference/webhooks`
