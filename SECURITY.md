# Security Policy

## Supported versions

Only the latest release, deployed from `main` to [nawaetu.com](https://nawaetu.com), receives security fixes. Older releases and forks are not patched.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately through GitHub's [Report a vulnerability](https://github.com/hadianr/nawaetu/security/advisories/new) form, or email [hadian.rahmat@gmail.com](mailto:hadian.rahmat@gmail.com) with the subject **"Nawaetu security"** and include:

- what the issue is and where it is (URL, API route, or file);
- steps to reproduce it;
- what an attacker could do with it, such as reading another user's data.

Please give us time to fix the issue before disclosing it publicly.

## Scope

In scope: the web app at nawaetu.com, its API routes, and the code in this repository, including the browser extension and Android wrapper.

Out of scope: third-party services Nawaetu uses (for example Quran.com, Aladhan, Supabase, Vercel and the AI providers), denial-of-service tests, and social engineering.

## How Nawaetu protects users

- Secrets stay on the server in environment variables and are never committed (`.env.local` is ignored).
- API routes check authentication and ownership, validate input, and are rate limited (`src/lib/rate-limit.ts`).
- Intentions and reflections are private to the account and are not sent to AI providers; see the [privacy policy](https://nawaetu.com/privacy).
- CodeQL scans the code in CI.
