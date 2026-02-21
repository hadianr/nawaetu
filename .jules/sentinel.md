## 2024-05-23 - Critical Payment Webhook Vulnerability
**Vulnerability:** The payment webhook endpoint (`/api/payment/webhook`) accepted any POST request and processed it as a valid payment, allowing attackers to spoof successful payments without authorization.
**Learning:** The implementation trusted the request body without verifying the `X-Mayar-Signature` header, likely due to oversight or assumption that the secret key presence in env meant verification was automatic.
**Prevention:** Always implement signature verification for webhooks (HMAC-SHA256) and ensure tests cover invalid/missing signature scenarios.

## 2024-05-24 - Exposed Debug Endpoint with PII
**Vulnerability:** The `/api/debug/user-data` endpoint allowed unauthenticated access to full user profiles via an email query parameter, exposing sensitive PII.
**Learning:** Debug tools created during development often lack security controls and can be accidentally deployed to production if not explicitly guarded.
**Prevention:** Enforce strict environment checks (`process.env.NODE_ENV === 'production'`) on all debug routes or use feature flags. Ideally, remove debug routes before merging to main.

## 2026-02-05 - AI Response XSS Vulnerability
**Vulnerability:** The `formatMarkdown` utility function used simple regex replacement to convert markdown to HTML without sanitizing the input first, allowing XSS if the AI output contained malicious HTML.
**Learning:** Custom markdown parsers using regex are prone to XSS if input sanitization (escaping or stripping) is skipped.
**Prevention:** Always escape HTML special characters before applying custom formatting rules, or use a robust sanitizer library.

## 2026-02-15 - Rate Limiting Bypass via User Input
**Vulnerability:** The AI chat endpoint used `context.name` (user-controlled input) as the rate limit identifier, allowing trivial bypass by changing the name in the request payload.
**Learning:** Security controls like rate limiting must never rely on client-provided identifiers.
**Prevention:** Always use trusted identifiers such as `session.user.id` (for authenticated users) or IP address (from headers) for rate limiting.

## 2026-03-01 - Defense-in-Depth for Debug Routes
**Vulnerability:** Relying solely on `process.env.NODE_ENV` checks within route handlers is fragile; misconfiguration can expose sensitive endpoints like `/api/debug/user-data`.
**Learning:** Centralized security controls at the middleware level provide a critical second layer of defense against accidental exposure of internal routes.
**Prevention:** Explicitly block sensitive path patterns (e.g., `/api/debug*`) in `middleware.ts` for production environments, ensuring protection even if individual route checks fail or are omitted.

## 2025-05-21 - Unbounded Anonymous Token Input
**Vulnerability:** Anonymous user tokens were accepted without length validation, allowing generation of massive email strings and potential DOS/Storage exhaustion.
**Learning:** Endpoints supporting anonymous users via client-generated tokens must strictly validate token format and length before using them in database queries or identifiers.
**Prevention:** Always sanitize and limit length of identifiers (like tokens) coming from the client, especially when used to construct other unique keys (like emails).

## 2025-05-21 - Type Validation for Input
**Vulnerability:** Potential 500 errors or unhandled exceptions when API inputs are not of expected primitive type (e.g. number instead of string).
**Learning:** `req.json()` returns `any`, so explicit type checking (e.g. `typeof variable === 'string'`) is crucial before performing string operations or length checks.
**Prevention:** Always validate `typeof` for all user inputs before processing.
