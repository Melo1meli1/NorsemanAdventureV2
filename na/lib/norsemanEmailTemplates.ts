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
                    margin-top: 20px;
                    padding: 12px 24px;
                    background-color: #ef5b25;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  "
                >
                  ${input.cta.label}
                </a>
              `
    : "";

  const bodyHtml = input.bodyHtml
    ? `
            <div style="margin-bottom: 20px; white-space: pre-wrap;">
                ${input.bodyHtml}
            </div>
          `
    : "";

  return `
<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${input.title}</title>
</head>
<body style="
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
">
    <div style="
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: white;
    ">
        <!-- Header -->
        <div style="
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 8px;
        ">
            ${
              logoSrc
                ? `
            <div style="margin-bottom: 15px;">
                <img src="${logoSrc}" alt="Norseman Adventures" style="width: 60px; height: 60px;">
            </div>
            `
                : ""
            }
            <div style="
                color: white;
                font-size: 24px;
                font-weight: bold;
                margin: 0;
            ">
                NORSEMAN<br>
                <span style="color: #ef5b25;">ADVENTURES</span>
            </div>
            <p style="color: #cbd5e1; margin: 10px 0 0 0; font-size: 14px;">
                The Spirit of the North
            </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 0;">
            <h1 style="
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #1e293b;
            ">
                ${input.title}
            </h1>

            <p style="
                font-size: 16px;
                color: #64748b;
                margin-bottom: 20px;
            ">
                ${input.greeting}
            </p>

            ${leadHtml}

            ${bodyHtml}

            ${ctaHtml}
        </div>

        <!-- Footer -->
        <div style="
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #64748b;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
        ">
            <div style="margin: 15px 0;">
                <a href="https://www.facebook.com/norseman.adventures?mibextid=wwXIfr&rdid=7MlJOe9Mhv9bkoR5&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17vdLqFNXh%2F%3Fmibextid%3DwwXIfr%26ref%3D1" style="color: #64748b; text-decoration: none; margin: 0 10px;">Facebook</a>
                <a href="#" style="color: #64748b; text-decoration: none; margin: 0 10px;">Instagram</a>
                <a href="#" style="color: #64748b; text-decoration: none; margin: 0 10px;">YouTube</a>
            </div>
            
            <p> 2026 Norseman Adventures. Alle rettigheter reservert.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

function buildLinkLine(url: string, text: string): string {
  return `
    <a
      href="${url}"
      style="
        display: inline-block;
        margin-top: 16px;
        padding: 12px 24px;
        background-color: #ef5b25;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      "
    >
      ${text}
    </a>
  `;
}

export function buildWaitlistConfirmationEmail(input: {
  siteUrl?: string | null;
  name: string;
  tourTitle: string;
  bookingUrl: string;
}): { subject: string; html: string } {
  const safeName = escapeHtml(input.name);
  const subject = `Venteliste bekreftet: ${input.tourTitle}`;

  const bodyHtml = `
    <p>
      Du er nå på ventelisten for <strong>${escapeHtml(input.tourTitle)}</strong>.
    </p>
    <p>
      Vi sender deg en e-post så snart en plass blir ledig. Da har du 24 timer på deg til å fullføre bestillingen.
    </p>
    ${buildLinkLine(input.bookingUrl, "Gå til bestillingssiden")}
  `;

  const html = renderNorsemanEmailLayout({
    siteUrl: input.siteUrl,
    title: "Venteliste bekreftet",
    greeting: `Hei ${safeName},`,
    bodyHtml,
    footerSignature: "Norseman Adventures",
  });

  return { subject, html };
}

export function buildFirstInLineEmail(input: {
  siteUrl?: string | null;
  name: string;
  tourTitle: string;
  bookingUrl: string;
}): { subject: string; html: string } {
  const safeName = escapeHtml(input.name);
  const subject = `Du er først i køen: ${input.tourTitle}`;

  const bodyHtml = `
    <p>
      Godt nytt! En plass har blitt ledig på <strong>${escapeHtml(input.tourTitle)}</strong>, og du er først i køen.
    </p>
    <p>
      Du har 24 timer på deg til å fullføre bestillingen din. Etter det vil plassen bli tilbudt til neste person på ventelisten.
    </p>
    ${buildLinkLine(input.bookingUrl, "Gå til bestillingssiden")}
  `;

  const html = renderNorsemanEmailLayout({
    siteUrl: input.siteUrl,
    title: "Du er først i køen",
    greeting: `Hei ${safeName},`,
    bodyHtml,
    footerSignature: "Norseman Adventures",
  });

  return { subject, html };
}

// Newsletter functions
export interface NewsletterData {
  title: string;
  short_description: string;
  content: string | null;
  image_url: string | null;
  published_at: string;
}

export function buildNewsletterEmail(input: {
  siteUrl?: string | null;
  data: NewsletterData;
}): { subject: string; html: string } {
  const subject = `Norseman Adventures: ${input.data.title}`;
  const baseUrl = input.siteUrl || "https://www.cherrytech.no";

  let bodyHtml = "";

  if (input.data.image_url) {
    bodyHtml += `
      <div style="margin-bottom: 20px;">
        <img src="${input.data.image_url}" alt="${escapeHtml(input.data.title)}" style="width: 100%; max-width: 540px; height: auto; border-radius: 8px;">
      </div>
    `;
  }

  if (input.data.short_description) {
    bodyHtml += `
      <div style="font-size: 18px; font-weight: 500; margin-bottom: 20px; color: #475569;">
        ${input.data.short_description}
      </div>
    `;
  }

  if (input.data.content) {
    bodyHtml += `
      <div style="margin-bottom: 25px; white-space: pre-wrap;">
        ${input.data.content}
      </div>
    `;
  }

  bodyHtml += `
    <p style="margin-bottom: 20px;">
      Publisert ${new Date(input.data.published_at).toLocaleDateString(
        "nb-NO",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      )}
    </p>
  `;

  const html = renderNorsemanEmailLayout({
    siteUrl: input.siteUrl,
    title: input.data.title,
    greeting: "Hei,",
    lead: input.data.short_description,
    bodyHtml,
    cta: {
      label: "SE VÅRE TURER",
      url: `${baseUrl}/public/tours`,
    },
    footerSignature: "Norseman Adventures",
  });

  return { subject, html };
}
