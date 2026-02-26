import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { error: "Alle felt er " },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ugyldig e-postadresse" },
        { status: 400 },
      );
    }

    // Create email content
    const emailHtml = `
      <h2>Ny henvendelse fra kontaktskjema</h2>
      <p><strong>Navn:</strong> ${name}</p>
      <p><strong>E-post:</strong> ${email}</p>
      <p><strong>Emne:</strong> ${subject}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <h3>Melding:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        Sendt fra NorseMan Adventures kontaktskjema
      </p>
    `;

    await sendEmail(
      "post@norsemanadventure.no",
      `Kontaktskjema: ${subject}`,
      emailHtml,
    );

    return NextResponse.json({ success: "Melding sendt!" }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Kunne ikke sende melding" },
      { status: 500 },
    );
  }
}
