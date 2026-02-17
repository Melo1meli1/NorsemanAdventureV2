const RAW_ALLOWED = process.env.ADMIN_ALLOWED_RESET_EMAILS ?? "";

const allowedEmailsSet: Set<string> = new Set(
  RAW_ALLOWED.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0),
);

/**
 * Returnerer true hvis e-posten er i listen over
 * tillatte admin-eposter som kan bruke "Glemt passord".
 */
export function isAllowedAdminResetEmail(email: string): boolean {
  if (!email) return false;
  return allowedEmailsSet.has(email.trim().toLowerCase());
}

/**
 * Eksponeres kun for eventuell logging/debug
 */
export function getAllowedAdminResetEmails(): string[] {
  return Array.from(allowedEmailsSet);
}
