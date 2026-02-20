type EmailCta = {
  label: string;
  url: string;
};

type NorsemanEmailLayoutInput = {
  siteUrl?: string | null;
  title: string;
  greeting: string;
  lead?: string;
  bodyHtml?: string;
  cta?: EmailCta;
  footerSignature?: string;
};

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderNorsemanEmailLayout(
  input: NorsemanEmailLayoutInput,
): string {
  const siteUrl = input.siteUrl?.replace(/\/$/, "") ?? "";
  const logoSrc = siteUrl ? `${siteUrl}/logonew.png` : "";
  const signature = input.footerSignature ?? "Norseman Adventures";

  const leadHtml = input.lead
    ? `
                <p
                  style="
                    margin: 0;
                    margin-top: 8px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #9ca3af;
                  "
                >
                  ${input.lead}
                </p>
              `
    : "";

  const ctaHtml = input.cta
    ? `
                <a
                  href="${input.cta.url}"
                  style="
                    display: inline-block;
                    padding: 10px 22px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, #f97316, #fb923c);
                    color: #111827;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    text-decoration: none;
                  "
                >
                  ${escapeHtml(input.cta.label)}
                </a>
              `
    : "";

  const bodyHtml = input.bodyHtml
    ? `
            <tr>
              <td style="padding-bottom: 16px;">
                ${input.bodyHtml}
              </td>
            </tr>
          `
    : "";

  return `<!DOCTYPE html>
<html lang="no">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(input.title)} – Norseman Adventures</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #050816;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
        sans-serif;
      color: #e5e7eb;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color: #050816; padding: 32px 0;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="
              max-width: 520px;
              background-color: #020617;
              border-radius: 16px;
              border: 1px solid #1f2933;
              padding: 32px 28px 28px 28px;
            "
          >
            <tr>
              <td align="center" style="padding-bottom: 16px;">
                ${logoSrc ? `<img src="${logoSrc}" alt="Norseman Adventures" width="64" height="64" style="display:block; border-radius:12px;" />` : ""}
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom: 8px;">
                <h1
                  style="
                    margin: 0;
                    font-size: 22px;
                    line-height: 1.3;
                    color: #f9fafb;
                  "
                >
                  ${escapeHtml(input.title)}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding-bottom: 16px;">
                <p
                  style="
                    margin: 0;
                    margin-top: 8px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #e5e7eb;
                  "
                >
                  ${input.greeting}
                </p>
                ${leadHtml}
              </td>
            </tr>

            ${input.cta ? `<tr><td align="center" style="padding: 12px 0 20px 0;">${ctaHtml}</td></tr>` : ""}

            ${bodyHtml}

            <tr>
              <td style="padding-top: 8px;">
                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #9ca3af;
                  "
                >
                  Hilsen<br />
                  <span style="font-weight: 600; color: #f9fafb;">${escapeHtml(signature)}</span>
                </p>
              </td>
            </tr>
          </table>

          <p
            style="
              margin: 16px 0 0 0;
              font-size: 11px;
              color: #6b7280;
            "
          >
            Denne e-posten ble sendt automatisk, vennligst ikke svar på den.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildLinkLine(url: string, label: string): string {
  return `<p style="margin: 0; margin-top: 12px; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
    <a href="${url}" style="color: #fb923c; text-decoration: underline;">${escapeHtml(label)}</a>
  </p>`;
}

export function buildWaitlistConfirmationEmail(input: {
  siteUrl?: string | null;
  name: string;
  tourTitle: string;
  position: number;
  bookingUrl: string;
}): { subject: string; html: string } {
  const subject = `Bekreftelse på venteliste: ${input.tourTitle}`;
  const safeName = escapeHtml(input.name.trim());
  const safeTourTitle = escapeHtml(input.tourTitle);

  const bodyHtml = `
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
      Du er nå lagt til på ventelisten for <strong>${safeTourTitle}</strong>.
    </p>
    <p style="margin: 0; margin-top: 8px; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
      Din plass i køen er <strong>#${input.position}</strong>.
    </p>
    <p style="margin: 0; margin-top: 8px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      Vi sender deg e-post når du er først i køen.
    </p>
    ${buildLinkLine(input.bookingUrl, "Gå til bestillingssiden")}
  `;

  const html = renderNorsemanEmailLayout({
    siteUrl: input.siteUrl,
    title: "Venteliste bekreftet",
    greeting: `Hei ${safeName},`,
    bodyHtml,
  });

  return { subject, html };
}

export function buildFirstInLineEmail(input: {
  siteUrl?: string | null;
  name: string;
  tourTitle: string;
  bookingUrl: string;
}): { subject: string; html: string } {
  const subject = `Du er først i køen: ${input.tourTitle}`;
  const safeName = escapeHtml(input.name.trim());
  const safeTourTitle = escapeHtml(input.tourTitle);

  const bodyHtml = `
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e5e7eb;">
      Du er nå <strong>først i køen</strong> for <strong>${safeTourTitle}</strong>.
    </p>
    <p style="margin: 0; margin-top: 8px; font-size: 14px; line-height: 1.6; color: #9ca3af;">
      Du kan bestille manuelt via lenken under.
    </p>
    ${buildLinkLine(input.bookingUrl, "Gå til bestillingssiden")}
  `;

  const html = renderNorsemanEmailLayout({
    siteUrl: input.siteUrl,
    title: "Du er først i køen",
    greeting: `Hei ${safeName},`,
    bodyHtml,
  });

  return { subject, html };
}
