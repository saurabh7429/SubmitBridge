# 13. Environment Variables Reference — SubmitBridge

This document catalogs all environment variables used throughout the **SubmitBridge** platform. 

> [!IMPORTANT]
> In accordance with academic project security guidelines, all sensitive API keys, database credentials, tokens, and secrets in this documentation are replaced with `[REDACTED]`.

---

## 1. Backend Environment Variables (`server/.env`)

These variables configure the Node.js/Express backend server, database connection, cloud storage, authentication, AI pipelines, and email dispatchers.

| Variable Name | Used By | Purpose | Required | Example / Safe Placeholder |
| :--- | :--- | :--- | :---: | :--- |
| `PORT` | `server/server.js` | TCP port on which the Express HTTP server listens | Optional (defaults to 5000) | `5000` |
| `CLIENT_URL` | `server/routes/assignments.js` | Base URL of the frontend application used to generate permanent student submission links and QR codes | Yes (in production) | `https://submit-bridge.vercel.app` |
| `JWT_SECRET` | `server/routes/auth.js`, `server/middleware/auth.js` | Cryptographic secret key used to sign and verify faculty JSON Web Tokens (HMAC-SHA256) | Yes | `[REDACTED]` |
| `SUPABASE_URL` | `server/supabase.js` | HTTPS endpoint URL of the managed Supabase PostgreSQL project | Yes | `https://your-project-id.supabase.co` |
| `SUPABASE_ANON_KEY` | `server/supabase.js` | Public anonymous API key for Supabase project | Optional (if service role present) | `[REDACTED]` |
| `SUPABASE_SERVICE_ROLE_KEY` | `server/supabase.js` | Administrative backend service-role key that bypasses RLS to manage tables and storage | Yes | `[REDACTED]` |
| `AZURE_OPENAI_ENDPOINT` | `server/services/aiService.js` | HTTPS endpoint for the Azure OpenAI Service resource | Yes (for Phase 2 AI grading) | `https://your-resource.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY` | `server/services/aiService.js` | Authentication key for accessing Azure OpenAI Service completions | Yes (for Phase 2 AI grading) | `[REDACTED]` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | `server/services/aiService.js` | Model deployment name configured in Azure AI Studio | Optional (defaults to `gpt-5-mini`) | `gpt-5-mini` |
| `SAPLING_API_KEYS` | `server/services/aiService.js` | Comma-separated list of Sapling AI Content Detector API keys for round-robin rotation | Yes (for Phase 3 AI detection) | `[REDACTED],[REDACTED],[REDACTED]` |
| `SAPLING_API_KEY1` ... `10` | `server/services/aiService.js` | Individual sequential Sapling API keys for fine-grained key management | Optional | `[REDACTED]` |
| `RESEND_API_KEY` | `server/services/emailService.js` | API key for the Resend transactional email delivery service | Yes (for live email OTP delivery) | `[REDACTED]` |
| `RESEND_FROM_EMAIL` | `server/services/emailService.js` | Sender identity header for outgoing verification emails | Optional (defaults to Resend onboarding) | `SubmitBridge <onboarding@resend.dev>` |
| `RESEND_TEST_EMAIL` | `server/services/emailService.js` | Verified account owner inbox used for testing OTP forwarding in Resend sandbox mode | Optional | `admin@college.edu` |
| `BREVO_API_KEY` | `server/services/emailService.js` | Fallback API key for Brevo SMTP email service | Optional | `[REDACTED]` |
| `BREVO_SENDER_EMAIL` | `server/services/emailService.js` | Verified sender email for Brevo API | Optional | `verify@submitbridge.edu` |

---

## 2. Frontend Environment Variables (`client/.env`)

These variables are consumed by the React application during the Vite build process. They must be prefixed with `VITE_` to be bundled into browser code.

| Variable Name | Used By | Purpose | Required | Example / Safe Placeholder |
| :--- | :--- | :--- | :---: | :--- |
| `VITE_API_URL` | `client/src/api.js` | Base URL of the backend REST API. If omitted, frontend defaults to local proxy `/api` | Yes (in production) | `https://submitbridge.onrender.com` |
| `VITE_SUPABASE_URL` | `client/src/supabaseClient.js` | Public HTTPS URL of the Supabase project for browser client initialization | Yes | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `client/src/supabaseClient.js` | Public anonymous key allowing client-side Google OAuth popups and session listeners | Yes | `[REDACTED]` |

---

## 3. Configuration Security Best Practices

1. **`.gitignore` Enforcement:** The `.gitignore` files in both root, client, and server explicitly prevent `.env` and `.env.local` files from ever entering git commits.
2. **Template Separation:** Clean, redacted templates (`.env.example`) are provided in the repository to document necessary keys without leaking actual production credentials.
3. **Environment Segregation:** Development keys (such as `localhost:3000` client URLs and test email addresses) are kept separate from production cloud variables set on Vercel and Render.
