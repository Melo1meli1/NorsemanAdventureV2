// na/lib/mail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER_EMAIL = "no-reply@norsemanadventure.no";

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key mangler, logger e-post:", { to, subject });
    return;
  }

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Feil ved sending av e-post:", error);
  }
};
