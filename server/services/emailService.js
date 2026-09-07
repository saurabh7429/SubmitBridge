const { Resend } = require("resend");

/**
 * Send Faculty Verification OTP Email via Resend or Brevo
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - Teacher's full name
 * @param {string} options.otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendOtpEmail({ to, name, otp }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "SubmitBridge <onboarding@resend.dev>";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
          .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: #4f46e5; border-radius: 10px; margin-bottom: 20px; color: #ffffff; font-size: 20px; }
          h2 { margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
          p { margin: 0 0 16px; font-size: 15px; line-height: 1.5; color: #475569; }
          .otp-card { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #312e81; font-family: monospace; }
          .footer-note { font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-badge">🎓</div>
          <h2>Faculty Verification Code</h2>
          <p>Hello <strong>${name || "Professor"}</strong>,</p>
          <p>Thank you for registering on <strong>SubmitBridge</strong>. Please use the verification code below to verify your email address and activate your faculty portal account:</p>
          
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
          </div>

          <p style="font-size: 14px; color: #64748b;">This code will expire in <strong>10 minutes</strong>. If you did not request this registration, please safely ignore this email.</p>

          <div class="footer-note">
            SubmitBridge Academic Portal &copy; ${new Date().getFullYear()} — Secure Academic Assignment Tracking
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Try Resend if API Key is configured
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: `Your SubmitBridge Verification Code: ${otp}`,
        html: emailHtml,
      });

      if (error) {
        console.error("Resend API error:", error);
        return { success: false, error: error.message };
      }

      console.log(`[EmailService] OTP email sent via Resend to ${to} (ID: ${data?.id})`);
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("Resend delivery exception:", err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Try Brevo API if BREVO_API_KEY is configured
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "SubmitBridge", email: process.env.BREVO_SENDER_EMAIL || "verify@submitbridge.edu" },
          to: [{ email: to, name: name || "Faculty" }],
          subject: `Your SubmitBridge Verification Code: ${otp}`,
          htmlContent: emailHtml,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Brevo API error:", errorData);
        return { success: false, error: errorData.message };
      }

      console.log(`[EmailService] OTP email sent via Brevo to ${to}`);
      return { success: true };
    } catch (err) {
      console.error("Brevo delivery exception:", err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Fallback: Log to server console if no external provider key configured yet
  console.log("--------------------------------------------------");
  console.log(`[EMAIL NOTICE] No RESEND_API_KEY or BREVO_API_KEY configured.`);
  console.log(`To: ${to}`);
  console.log(`Verification OTP: ${otp}`);
  console.log("--------------------------------------------------");

  return {
    success: true,
    warning: "Email printed to console (Configure RESEND_API_KEY in server/.env for live inbox delivery)",
  };
}

module.exports = {
  sendOtpEmail,
};
