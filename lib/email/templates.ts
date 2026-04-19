function readGreetingName(name: string | null | undefined) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "there";
  }

  return trimmedName;
}

export function buildEmailVerificationEmail(input: {
  name: string | null | undefined;
  verificationUrl: string;
}) {
  const greetingName = readGreetingName(input.name);

  return {
    subject: "Verify your CV Builder email address",
    text: [
      `Hi ${greetingName},`,
      "",
      "Please verify your email address for CV Builder by opening the link below:",
      input.verificationUrl,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${greetingName},</p>
        <p>Please verify your email address for <strong>CV Builder</strong> by clicking the button below.</p>
        <p>
          <a
            href="${input.verificationUrl}"
            style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:12px;"
          >
            Verify Email
          </a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p><a href="${input.verificationUrl}">${input.verificationUrl}</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  };
}

export function buildPasswordResetEmail(input: {
  name: string | null | undefined;
  resetUrl: string;
}) {
  const greetingName = readGreetingName(input.name);

  return {
    subject: "Reset your CV Builder password",
    text: [
      `Hi ${greetingName},`,
      "",
      "A password reset was requested for your CV Builder account.",
      "Open the link below to set a new password:",
      input.resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${greetingName},</p>
        <p>A password reset was requested for your <strong>CV Builder</strong> account.</p>
        <p>
          <a
            href="${input.resetUrl}"
            style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:12px;"
          >
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  };
}