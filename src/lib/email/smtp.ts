import nodemailer from "nodemailer";

function env(key: string): string | undefined {
  const raw = process.env[key]?.trim();
  if (!raw) return undefined;
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }
  return raw;
}

export function isSmtpConfigured(): boolean {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

function createTransporter() {
  const port = parseInt(env("SMTP_PORT") || "465", 10);
  const secureFlag = env("SMTP_SECURE");
  const secure =
    secureFlag === "true" || (secureFlag !== "false" && port === 465);

  return nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure,
    auth: {
      user: env("SMTP_USER"),
      pass: env("SMTP_PASS"),
    },
    tls: {
      minVersion: "TLSv1.2",
    },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEmailViaSmtp(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, error: "SMTP not configured" };
  }

  const smtpUser = env("SMTP_USER")!;
  const fromAddress = env("SMTP_FROM") || smtpUser;
  const transporter = createTransporter();

  const mail = {
    from: `"RentAwas" <${fromAddress}>`,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };

  try {
    await transporter.verify();
    try {
      await transporter.sendMail(mail);
      return { ok: true };
    } catch (firstErr: unknown) {
      if (fromAddress.toLowerCase() !== smtpUser.toLowerCase()) {
        console.warn("SMTP: retry send using SMTP_USER as From address");
        await transporter.sendMail({
          ...mail,
          from: `"RentAwas" <${smtpUser}>`,
        });
        return { ok: true };
      }
      throw firstErr;
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "SMTP send failed";
    console.error("SMTP send error:", errorMessage);
    return { ok: false, error: errorMessage };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<{ ok: boolean; error?: string }> {
  const safeLink = escapeHtml(resetLink);
  const subject = "Reset your RentAwas password";

  const text = [
    "Reset your RentAwas password",
    "",
    "Click the link below to choose a new password:",
    resetLink,
    "",
    "If you did not request this, you can ignore this email.",
    "This link expires after a short time.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a;">
      <h2 style="margin:0 0 12px;color:#0B132B;">Reset your RentAwas password</h2>
      <p style="color:#475569;line-height:1.6;">We received a request to reset the password for your RentAwas account.</p>
      <p style="margin:24px 0;">
        <a href="${safeLink}" style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:bold;">
          Reset Password
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${safeLink}">${safeLink}</a></p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you did not request this email, you can safely ignore it.</p>
    </div>
  `;

  return sendEmailViaSmtp({ to: email, subject, text, html });
}
