import { Resend } from "resend";

const SENDER_EMAIL = "no-reply@norsemanadventure.no";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("Resend API key is missing; skipping email:", { to, subject });
    return;
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
