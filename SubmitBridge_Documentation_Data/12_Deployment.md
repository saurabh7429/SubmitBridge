# 12. Deployment Guide & Production Configuration — SubmitBridge

This document details the live cloud deployment architecture, hosting providers, environment configuration, build pipelines, and production routing for **SubmitBridge**.

---

## 1. Live Deployment Infrastructure

| Service Component | Hosting Platform | Live URL / Endpoint | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Web Application** | Vercel | `https://submit-bridge.vercel.app/` | Production React SPA served via global Edge CDN |
| **Backend API Service** | Render | `https://submitbridge.onrender.com/` | Node.js / Express web service running in cloud container |
| **Database & File Storage**| Supabase | `https://cskjibvzpbkehsoiomry.supabase.co` | PostgreSQL 17.6 database & `submissions` storage bucket |
| **Source Code Repository** | GitHub | `https://github.com/saurabh7429/SubmitBridge` | Version control & continuous integration triggers |

---

## 2. Frontend Deployment (Vercel)

### A. Deployment Configuration
- **Framework Preset:** Vite
- **Root Directory:** `client`
- **Node.js Version:** `18.x` or `20.x`
- **Build Command:** `vite build`
- **Output Directory:** `dist`
- **Development Command:** `vite`

### B. SPA Routing Rewrite (`client/vercel.json`)
Because React Router DOM manages routing on the client side, accessing deep links (such as `/submit/:id` or `/dashboard`) directly in the browser requires Vercel to route all incoming requests to `index.html`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### C. Frontend Environment Variables (Vercel Project Settings)
```env
VITE_API_URL=https://submitbridge.onrender.com
VITE_SUPABASE_URL=https://cskjibvzpbkehsoiomry.supabase.co
VITE_SUPABASE_ANON_KEY=[REDACTED]
```

---

## 3. Backend Deployment (Render)

### A. Deployment Configuration
- **Service Type:** Web Service (Node.js Environment)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Auto-Deploy:** Enabled on Git push to `main` branch
- **Health Check Path:** `GET /`

### B. Dynamic Client Origin Handling
In `server/routes/assignments.js`, the backend dynamically infers the public client URL to construct shareable assignment links and QR codes:
```javascript
function getClientBaseUrl(req) {
  if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost")) {
    return process.env.CLIENT_URL.replace(/\/+$/, "");
  }
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
  if (origin && !origin.includes("localhost")) {
    return origin.replace(/\/+$/, "");
  }
  return (process.env.CLIENT_URL || "https://submit-bridge.vercel.app").replace(/\/+$/, "");
}
```
This guarantees that whether assignments are created from local testing or live production, valid public HTTPS links are always generated for student QR codes.

### C. Backend Environment Variables (Render Dashboard)
```env
PORT=5000
CLIENT_URL=https://submit-bridge.vercel.app
JWT_SECRET=[REDACTED]
SUPABASE_URL=https://cskjibvzpbkehsoiomry.supabase.co
SUPABASE_ANON_KEY=[REDACTED]
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]
AZURE_OPENAI_ENDPOINT=[REDACTED]
AZURE_OPENAI_API_KEY=[REDACTED]
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
SAPLING_API_KEYS=[REDACTED]
RESEND_API_KEY=[REDACTED]
RESEND_FROM_EMAIL=SubmitBridge <onboarding@resend.dev>
```

---

## 4. Supabase Database & Storage Setup

1. **Database Region:** `ap-south-1` (Mumbai, India) to minimize latency for Indian institutions.
2. **Schema Deployment:** Tables (`teachers`, `assignments`, `submissions`) created using PostgreSQL DDL scripts.
3. **Storage Bucket:** Public bucket `submissions` created with a 10MB limit and MIME type whitelisting.

---

## 5. Step-by-Step Production Deployment Procedure

### Deploying the Backend on Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect the GitHub repository: `saurabh7429/SubmitBridge`.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install` and **Start Command** to `node server.js`.
5. Under **Environment Variables**, supply all backend secrets (`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AZURE_OPENAI_KEY`, etc.).
6. Click **Deploy**. Note the assigned URL (`https://submitbridge.onrender.com`).

### Deploying the Frontend on Vercel
1. Import the repository on [Vercel](https://vercel.com/).
2. Select **Root Directory** as `client`.
3. Verify that **Framework Preset** is detected as `Vite`.
4. Under **Environment Variables**, set `VITE_API_URL` to the Render backend URL (`https://submitbridge.onrender.com`), alongside `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Click **Deploy**. Vercel will build and assign the custom domain `https://submit-bridge.vercel.app`.
