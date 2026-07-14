const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require("docx");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const LOGO_BASE64 = require("./logo.js");

const ADVISOR_EMAIL = "viralbhatt@moneymantra.info";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "fsp@moneymantra.info";
const LOGO_WIDTH = 180;
const LOGO_HEIGHT = 87;

// Sanitize text for pdf-lib (WinAnsi encoding — no Unicode beyond Latin-1)
const sanitizeForPdf = (str) => str
  .replace(/₹/g, "Rs.")
  .replace(/—/g, "-")
  .replace(/–/g, "-")
  .replace(/\u2019/g, "'")   // right single quote
  .replace(/\u2018/g, "'")   // left single quote
  .replace(/\u201C/g, '"')   // left double quote
  .replace(/\u201D/g, '"')   // right double quote
  .replace(/\u2022/g, "*")   // bullet
  .replace(/[^\x00-\xFF]/g, ""); // strip remaining non-latin (emojis etc.)

// ---------- Build a Word document from the plain-text FSP ----------
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
      children: [new TextRun({ text: `Financial Solution Plan — Prepared for: ${clientName}`, size: 24, color: "555555" })],
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
      children.push(new Paragraph({
        children: [new TextRun({ text: line })],
        spacing: { after: 100 },
      }));
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

// ---------- Build a PDF from the plain-text FSP ----------
async function buildPdf(fspText, clientName) {
  // Sanitize all text for WinAnsi encoding before rendering
  fspText = sanitizeForPdf(fspText);
  clientName = sanitizeForPdf(clientName);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612, pageHeight = 792;
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  const orange = rgb(0.7, 0.35, 0);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addPageIfNeeded = (lineHeight) => {
    if (y - lineHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const wrapText = (text, useFont, size) => {
    const words = text.split(" ");
    const wrapped = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (useFont.widthOfTextAtSize(test, size) > maxWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) wrapped.push(current);
    return wrapped;
  };

  // Logo
  const logoBuffer = Buffer.from(LOGO_BASE64, "base64");
  const logoImage = await pdfDoc.embedPng(logoBuffer);
  const logoDims = logoImage.scale(LOGO_WIDTH / logoImage.width);
  const logoX = (pageWidth - logoDims.width) / 2;
  page.drawImage(logoImage, { x: logoX, y: y - logoDims.height, width: logoDims.width, height: logoDims.height });
  y -= logoDims.height + 14;
  page.drawText(`Financial Solution Plan - Prepared for: ${clientName}`, { x: margin, y, size: 11, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 28;

  const lines = fspText.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { y -= 10; addPageIfNeeded(10); continue; }

    const isHeading = /^#{1,3}\s/.test(line) || (/^[A-Z0-9 .,:&()\/\-]+$/.test(line) && line.length < 70 && line.length > 3);
    const cleanLine = line.replace(/^#{1,3}\s/, "");
    const useFont = isHeading ? boldFont : font;
    const size = isHeading ? 12.5 : 10.5;
    const color = isHeading ? orange : rgb(0.15, 0.15, 0.15);
    const lineHeight = size + 6;

    const wrapped = wrapText(cleanLine, useFont, size);
    for (const wLine of wrapped) {
      addPageIfNeeded(lineHeight);
      if (isHeading) y -= 6;
      page.drawText(wLine, { x: margin, y, size, font: useFont, color });
      y -= lineHeight;
    }
  }

  return pdfDoc.save();
}

// ---------- Send email with attachments via Resend ----------
async function sendEmail({ to, subject, html, attachments }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `Money Mantra <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      attachments,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Email send failed");
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, form } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }
  if (!form || !form.clientEmail || !form.clientName) {
    return res.status(400).json({ error: "Missing client name/email" });
  }

  // 1. Generate FSP text via Claude
  let fspText;
  try {
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const aiData = await aiResponse.json();
    if (!aiResponse.ok || !aiData.content || !aiData.content[0]) {
      console.error("Anthropic API error:", aiData);
      return res.status(502).json({ error: aiData.error?.message || "Generation failed" });
    }
    fspText = aiData.content[0].text;
  } catch (e) {
    console.error("Anthropic call failed:", e);
    return res.status(500).json({ error: "Network error reaching AI service" });
  }

  // 2. Build DOCX and PDF
  let docxBuffer, pdfBuffer;
  try {
    [docxBuffer, pdfBuffer] = await Promise.all([
      buildDocx(fspText, form.clientName),
      buildPdf(fspText, form.clientName),
    ]);
  } catch (e) {
    console.error("Document build failed:", e);
    return res.status(200).json({ fspText, emailStatus: { clientSent: false, error: "Could not build documents: " + e.message } });
  }

  const safeName = form.clientName.replace(/\s+/g, "_");
  const attachments = [
    { filename: `FSP_${safeName}_MoneyMantra.pdf`, content: pdfBuffer.toString("base64") },
    { filename: `FSP_${safeName}_MoneyMantra.docx`, content: docxBuffer.toString("base64") },
  ];

  // 3. Email client + advisor
  let clientSent = false, advisorSent = false, emailError = null;

  if (!process.env.RESEND_API_KEY) {
    emailError = "Email not configured (missing RESEND_API_KEY)";
  } else {
    try {
      await sendEmail({
        to: form.clientEmail,
        subject: `Your Financial Solution Plan — Money Mantra`,
        html: `<p>Dear ${form.clientName},</p><p>Please find attached your personalised Financial Solution Plan (PDF and Word formats), prepared by Money Mantra.</p><p>Warm regards,<br/>Viral Bhatt<br/>Founder, Money Mantra<br/>AMFI Registered Mutual Fund Distributor<br/>As featured in CNBC Awaaz &amp; Zee Business</p>`,
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
        html: `<p>New FSP generated on the website.</p><p><b>Name:</b> ${form.clientName}<br/><b>Email:</b> ${form.clientEmail}<br/><b>Mobile:</b> ${form.clientMobile || "—"}<br/><b>City:</b> ${form.city || "—"}<br/><b>Goals:</b> ${form.goals || "—"}</p><p>Full PDF/Word attached.</p>`,
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
