const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require("docx");
const LOGO_BASE64 = require("./logo.js");

const ADVISOR_EMAIL = "viralbhatt@moneymantra.info";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "fsp@moneymantra.info";
const LOGO_WIDTH = 180;
const LOGO_HEIGHT = 87;

async function buildDocx(fspText, clientName) {
  const lines = fspText.split("\n");
  const logoBuffer = Buffer.from(LOGO_BASE64, "base64");
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data: logoBuffer, transformation: { width: LOGO_WIDTH, height: LOGO_HEIGHT }, type: "png" })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Financial Solution Plan - Prepared for: ${clientName}`, size: 24, color: "555555" })],
      spacing: { after: 360 },
    }),
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { children.push(new Paragraph({ text: "" })); continue; }
    const isHeading = /^#{1,3}\s/.test(line) || (/^[A-Z0-9 .,:&()/-]+$/.test(line) && line.length < 70 && line.length > 3);
    if (isHeading) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: line.replace(/^#{1,3}\s/, ""), bold: true, color: "B35900" })],
        spacing: { before: 240, after: 120 },
      }));
    } else {
      children.push(new Paragraph({ children: [new TextRun({ text: line })], spacing: { after: 100 } }));
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children,
    }],
  });
  return Packer.toBuffer(doc);
}

async function sendEmail({ to, subject, html, attachments }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: `Money Mantra <${FROM_EMAIL}>`, to: [to], subject, html, attachments }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Email send failed");
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, form, pdfBase64 } = req.body;

  if (!form || !form.clientEmail || !form.clientName) return res.status(400).json({ error: "Missing client details" });

  // Second call: attach browser-generated PDF to email
  if (prompt === "__email_pdf_only__" && pdfBase64) {
    const safeName = form.clientName.replace(/\s+/g, "_");
    const attachments = [{ filename: `FSP_${safeName}_MoneyMantra.pdf`, content: pdfBase64 }];
    try {
      await sendEmail({
        to: form.clientEmail,
        subject: `Your Financial Solution Plan (PDF) - Money Mantra`,
        html: `<p>Dear ${form.clientName},</p><p>Please find attached your Financial Solution Plan in PDF format.</p><p>Warm regards,<br/>Viral Bhatt<br/>Founder, Money Mantra<br/>AMFI Registered Mutual Fund Distributor<br/>As featured in CNBC Awaaz &amp; Zee Business</p>`,
        attachments,
      });
      await sendEmail({
        to: ADVISOR_EMAIL,
        subject: `FSP PDF for: ${form.clientName} (${form.clientMobile || "no mobile"})`,
        html: `<p>PDF copy of FSP for ${form.clientName} (${form.clientEmail}, ${form.clientMobile || "-"}).</p>`,
        attachments,
      });
    } catch (e) { console.error("PDF email failed:", e); }
    return res.status(200).json({ ok: true });
  }

  if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "Missing prompt" });

  // Step 1: Generate FSP text via Claude
  let fspText;
  try {
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
    });
    const aiData = await aiResponse.json();
    if (!aiResponse.ok || !aiData.content?.[0]) {
      console.error("Anthropic error:", aiData);
      return res.status(502).json({ error: aiData.error?.message || "Generation failed" });
    }
    fspText = aiData.content[0].text;
  } catch (e) {
    console.error("Anthropic call failed:", e);
    return res.status(500).json({ error: "Network error reaching AI service" });
  }

  // Step 2: Build DOCX
  let docxBuffer;
  try {
    docxBuffer = await buildDocx(fspText, form.clientName);
  } catch (e) {
    console.error("DOCX build failed:", e);
    return res.status(200).json({ fspText, emailStatus: { clientSent: false, error: "Could not build Word document: " + e.message } });
  }

  // Step 3: Email DOCX (PDF will follow in second call from browser)
  const safeName = form.clientName.replace(/\s+/g, "_");
  const attachments = [{ filename: `FSP_${safeName}_MoneyMantra.docx`, content: docxBuffer.toString("base64") }];

  let clientSent = false, advisorSent = false, emailError = null;

  if (!process.env.RESEND_API_KEY) {
    emailError = "Email not configured (missing RESEND_API_KEY)";
  } else {
    try {
      await sendEmail({
        to: form.clientEmail,
        subject: `Your Financial Solution Plan - Money Mantra`,
        html: `<p>Dear ${form.clientName},</p><p>Please find attached your Financial Solution Plan (Word format). A PDF copy will follow shortly.</p><p>Warm regards,<br/>Viral Bhatt<br/>Founder, Money Mantra<br/>AMFI Registered Mutual Fund Distributor<br/>As featured in CNBC Awaaz &amp; Zee Business</p>`,
        attachments,
      });
      clientSent = true;
    } catch (e) {
      console.error("Client email failed:", e);
      emailError = e.message;
    }

    try {
      await sendEmail({
        to: ADVISOR_EMAIL,
        subject: `New FSP Lead: ${form.clientName} (${form.clientMobile || "no mobile"})`,
        html: `<p>New FSP generated.</p><p><b>Name:</b> ${form.clientName}<br/><b>Email:</b> ${form.clientEmail}<br/><b>Mobile:</b> ${form.clientMobile || "-"}<br/><b>City:</b> ${form.city || "-"}<br/><b>Goals:</b> ${form.goals || "-"}</p>`,
        attachments,
      });
      advisorSent = true;
    } catch (e) {
      console.error("Advisor email failed:", e);
      if (!emailError) emailError = e.message;
    }
  }

  return res.status(200).json({
    fspText,
    emailStatus: { clientSent, advisorSent, error: clientSent ? null : emailError },
  });
};
