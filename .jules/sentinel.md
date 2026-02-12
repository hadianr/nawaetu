## 2024-05-23 - Critical Payment Webhook Vulnerability
**Vulnerability:** The payment webhook endpoint (`/api/payment/webhook`) accepted any POST request and processed it as a valid payment, allowing attackers to spoof successful payments without authorization.
**Learning:** The implementation trusted the request body without verifying the `X-Mayar-Signature` header, likely due to oversight or assumption that the secret key presence in env meant verification was automatic.
**Prevention:** Always implement signature verification for webhooks (HMAC-SHA256) and ensure tests cover invalid/missing signature scenarios.
