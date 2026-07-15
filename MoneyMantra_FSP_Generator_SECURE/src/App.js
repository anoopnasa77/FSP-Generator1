const ORANGE = "#FF8C00";
const DARK_ORANGE = "#B35900";

const steps = [
  { id: 1, title: "Client Info", icon: "👤" },
  { id: 2, title: "Income & Expenses", icon: "💰" },
  { id: 3, title: "Assets & Loans", icon: "🏦" },
  { id: 4, title: "Insurance", icon: "🛡️" },
  { id: 5, title: "Goals", icon: "🎯" },
  { id: 6, title: "Generate FSP", icon: "✨" },
];

const initialForm = {
  clientName: "", clientAge: "", clientEmail: "", clientMobile: "", spouseName: "", spouseAge: "",
  children: "", city: "",
  monthlyIncome: "", spouseIncome: "", monthlyExpenses: "", monthlyEMI: "", monthlySavings: "",
  bankBalance: "", mutualFunds: "", ppfEpf: "", gold: "", property: "",
  homeLoan: "", homeLoanEMI: "", personalLoan: "", personalLoanEMI: "", carLoan: "", carLoanEMI: "",
  lifeInsurance: "", termCover: "", healthInsurance: "", accidentInsurance: "",
  goals: "", retirementAge: "", riskProfile: "Moderate",
};

function Field({ label, name, value, onChange, placeholder, type = "text", prefix }) {
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: ORANGE, fontFamily: "sans-serif" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", fontSize: 14 }}>{prefix}</span>}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${ORANGE}55`, borderRadius: 8, padding: prefix ? "10px 12px 10px 28px" : "10px 12px", color: "#fff", fontFamily: "sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }}
          onFocus={e => e.target.style.borderColor = ORANGE}
          onBlur={e => e.target.style.borderColor = `${ORANGE}55`} />
      </div>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>{children}</div>;
}

function SectionLabel({ children, style }) {
  return <div style={{ fontSize: 13, fontWeight: "bold", color: ORANGE, fontFamily: "sans-serif", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${ORANGE}33`, ...style }}>{children}</div>;
}

function NavButtons({ step, setStep, canNext }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
      {step > 1 && <button onClick={() => setStep(step - 1)} style={{ padding: "11px 24px", background: "transparent", border: `1px solid ${ORANGE}66`, borderRadius: 8, color: ORANGE, fontFamily: "sans-serif", fontSize: 14, cursor: "pointer" }}>← Back</button>}
      <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
        style={{ flex: 1, padding: "12px", background: canNext ? `linear-gradient(90deg, ${DARK_ORANGE}, ${ORANGE})` : "#333", border: "none", borderRadius: 8, color: canNext ? "#fff" : "#666", fontFamily: "sans-serif", fontSize: 14, fontWeight: "bold", cursor: canNext ? "pointer" : "not-allowed" }}>
        Next →
      </button>
    </div>
  );
}

function FormCard({ title, subtitle, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ORANGE}33`, borderRadius: 14, padding: 28, backdropFilter: "blur(10px)" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: "bold", color: ORANGE }}>{title}</div>
        <div style={{ fontSize: 13, opacity: 0.6, fontFamily: "sans-serif", marginTop: 4 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
      <div style={{ color: "rgba(255,255,255,0.5)", width: 130, flexShrink: 0, fontFamily: "sans-serif" }}>{label}:</div>
      <div style={{ color: "#fff", fontWeight: 500, fontFamily: "sans-serif" }}>{value || "—"}</div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = window.React.useState(1);
  const [form, setForm] = window.React.useState(initialForm);
  const [generatedFSP, setGeneratedFSP] = window.React.useState("");
  const [loading, setLoading] = window.React.useState(false);
  const [error, setError] = window.React.useState("");
  const [emailStatus, setEmailStatus] = window.React.useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const buildPrompt = () => {
    const totalIncome = (parseFloat(form.monthlyIncome) || 0) + (parseFloat(form.spouseIncome) || 0);
    const totalEMI = (parseFloat(form.homeLoanEMI) || 0) + (parseFloat(form.personalLoanEMI) || 0) + (parseFloat(form.carLoanEMI) || 0);
    const totalLoans = (parseFloat(form.homeLoan) || 0) + (parseFloat(form.personalLoan) || 0) + (parseFloat(form.carLoan) || 0);
    const totalAssets = (parseFloat(form.bankBalance) || 0) + (parseFloat(form.mutualFunds) || 0) + (parseFloat(form.ppfEpf) || 0) + (parseFloat(form.gold) || 0) + (parseFloat(form.property) || 0);
    return `You are a financial planner at Money Mantra, headed by Viral Bhatt (AMFI Registered Mutual Fund Distributor, As featured in CNBC Awaaz & Zee Business). Create a comprehensive Financial Solution Plan (FSP).

CLIENT: ${form.clientName}, Age ${form.clientAge} | Spouse: ${form.spouseName || "N/A"} Age ${form.spouseAge || "N/A"} | Children: ${form.children || "None"} | City: ${form.city}
INCOME: Self ₹${form.monthlyIncome}/mo | Spouse ₹${form.spouseIncome || 0}/mo | Total ₹${totalIncome}/mo
EXPENSES: ₹${form.monthlyExpenses}/mo | EMI: ₹${totalEMI}/mo | Savings: ₹${form.monthlySavings}/mo
ASSETS: Bank ₹${form.bankBalance || 0} | MF ₹${form.mutualFunds || 0} | PPF/EPF ₹${form.ppfEpf || 0} | Gold ₹${form.gold || 0} | Property ₹${form.property || 0} | Total ₹${totalAssets}
LOANS: Home ₹${form.homeLoan || 0} (EMI ₹${form.homeLoanEMI || 0}) | Personal ₹${form.personalLoan || 0} (EMI ₹${form.personalLoanEMI || 0}) | Car ₹${form.carLoan || 0} (EMI ₹${form.carLoanEMI || 0}) | Total Debt ₹${totalLoans}
INSURANCE: Life ₹${form.lifeInsurance || 0} | Term ₹${form.termCover || 0} | Health ₹${form.healthInsurance || 0} | Accident ₹${form.accidentInsurance || 0}
GOALS: ${form.goals} | Retirement Age: ${form.retirementAge} | Risk: ${form.riskProfile}

IMPORTANT: Do NOT use emojis or special Unicode symbols in the output. Use plain text alternatives like [OK], [!], [X], Rs. instead of ₹, - instead of em-dash.

Create detailed FSP with EXACTLY these 6 sections:

## SECTION 1: CLIENT SNAPSHOT & KEY FINANCIAL RATIOS
Client overview table + calculate:
1. Savings Rate = (Monthly Savings / Total Income) × 100 → Ideal: 20-30%+
2. EMI-to-Income Ratio = (Total EMI / Total Income) × 100 → Ideal: Max 40%
3. Investment-to-Savings Ratio → Ideal: 80%+
4. Debt-to-Asset Ratio = (Total Debt / Total Assets) × 100 → Ideal: Below 50%
Show status: [Healthy] / [Needs Attention] / [Critical]

## SECTION 2: CONTINGENCY FUND
Required = 6 months (expenses + EMI). Current status, gap, where to park (Liquid Fund/FD/Savings split).

## SECTION 3: INSURANCE & RISK MANAGEMENT
Life Insurance: Ideal = 15-20x annual income, gap analysis. Health: ideal vs current. Term: recommendation. Accident cover recommendation.

## SECTION 4: GOAL-BASED INVESTMENT PLANNING
For each goal: target amount, timeline, monthly SIP needed (12% CAGR), fund categories, asset allocation %.
Include retirement corpus calculation.

## SECTION 5: LOAN REPAYMENT PLAN [HIGH PRIORITY]
Avalanche method (highest interest first). Each loan: outstanding, EMI, rate, payoff date, prepayment advice.

## SECTION 6: TAX PLANNING & ESTATE PLANNING
80C (current vs ₹1.5L limit), 80D, HRA/Home Loan deductions, LTCG harvesting (₹1.25L limit), Will/Nomination, action items.

End with NEXT STEPS table: 5-7 priority actions, owner, timeline.

Footer: "Prepared by: Viral Bhatt | Founder, Money Mantra | AMFI Registered Mutual Fund Distributor | As featured in CNBC Awaaz & Zee Business"`;
  };

  const generateFSP = async () => {
    setLoading(true); setError(""); setGeneratedFSP(""); setEmailStatus(null);
    try {
      // Step 1: Get FSP text + DOCX email from server
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(), form }),
      });
      const data = await response.json();
      if (!data.fspText) { setError(data.error || "Generation failed. Please try again."); setLoading(false); return; }

      const fspText = data.fspText;
      setGeneratedFSP(fspText);

      // Step 2: Generate designed visual PDF in browser
      let pdfBase64 = null;
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const ML = 48, MR = 48;
        const CW = W - ML - MR;
        const orange = [255, 140, 0];
        const darkOrange = [179, 89, 0];
        const darkBg = [26, 10, 0];
        const white = [255, 255, 255];
        const lightOrange = [255, 243, 220];
        const green = [46, 125, 50];
        const lightGreen = [232, 245, 233];
        const blue = [21, 101, 192];
        const lightBlue = [227, 242, 253];
        const gray = [100, 100, 100];

        // Helpers
        const fmt = (n) => n ? `₹${parseFloat(n).toLocaleString("en-IN")}` : "₹0";
        const newPage = () => { doc.addPage(); };

        const drawRect = (x, y, w, h, r, fillColor) => {
          doc.setFillColor(...fillColor);
          doc.roundedRect(x, y, w, h, r, r, "F");
        };
        const label = (text, x, y, size, color, style = "normal", align = "left") => {
          doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
          doc.text(text, x, y, { align });
        };

        // ── PAGE 1: COVER ─────────────────────────────────────────────
        // Dark header band
        drawRect(0, 0, W, 180, 0, darkBg);

        // Logo
        const img = new Image();
        await new Promise((r) => { img.onload = r; img.onerror = r; img.src = "/logo.png"; });
        if (img.complete && img.naturalWidth > 0) doc.addImage(img, "PNG", ML, 18, 150, 73);

        // Title
        label("FINANCIAL SOLUTION PLAN", W - MR, 55, 20, white, "bold", "right");
        label("Personalised Roadmap to Financial Freedom", W - MR, 76, 10, [255, 200, 100], "normal", "right");

        // Client name band
        drawRect(0, 150, W, 50, 0, orange);
        const clientLabel = `${form.clientName}${form.spouseName ? " & " + form.spouseName : ""}  |  Age ${form.clientAge}${form.spouseAge ? " & " + form.spouseAge : ""}  |  ${form.city || ""}`;
        label(clientLabel, W / 2, 181, 13, darkBg, "bold", "center");

        // Date & prepared by
        const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
        label(`Prepared on: ${today}`, ML, 220, 9, gray);
        label("Prepared by: Viral Bhatt | Money Mantra | AMFI Registered Mutual Fund Distributor | As featured in CNBC Awaaz & Zee Business", ML, 234, 8, gray);

        // ── SECTION A: PRESENT SITUATION ──────────────────────────────
        let y = 258;
        drawRect(ML, y, CW, 24, 4, darkOrange);
        label("SECTION 1 — YOUR PRESENT SITUATION", ML + 12, y + 16, 11, white, "bold");
        y += 36;

        const totalIncome = (parseFloat(form.monthlyIncome) || 0) + (parseFloat(form.spouseIncome) || 0);
        const totalEMI = (parseFloat(form.homeLoanEMI) || 0) + (parseFloat(form.personalLoanEMI) || 0) + (parseFloat(form.carLoanEMI) || 0);
        const surplus = totalIncome - (parseFloat(form.monthlyExpenses) || 0) - totalEMI;
        const totalAssets = (parseFloat(form.bankBalance) || 0) + (parseFloat(form.mutualFunds) || 0) + (parseFloat(form.ppfEpf) || 0) + (parseFloat(form.gold) || 0) + (parseFloat(form.property) || 0);
        const totalLoans = (parseFloat(form.homeLoan) || 0) + (parseFloat(form.personalLoan) || 0) + (parseFloat(form.carLoan) || 0);
        const netWorth = totalAssets - totalLoans;
        const savingsRate = totalIncome > 0 ? Math.round((parseFloat(form.monthlySavings) || 0) / totalIncome * 100) : 0;
        const debtRatio = totalIncome > 0 ? Math.round(totalEMI / totalIncome * 100) : 0;

        // Cash flow row — 3 boxes
        const bw = (CW - 16) / 3;
        const cashBoxes = [
          { label: "Monthly Income", val: fmt(totalIncome), color: lightGreen, border: green },
          { label: "Monthly Expenses + EMI", val: fmt((parseFloat(form.monthlyExpenses) || 0) + totalEMI), color: [255, 235, 238], border: [198, 40, 40] },
          { label: "Monthly Surplus", val: fmt(surplus), color: lightOrange, border: darkOrange },
        ];
        cashBoxes.forEach((b, i) => {
          const bx = ML + i * (bw + 8);
          drawRect(bx, y, bw, 52, 5, b.color);
          doc.setDrawColor(...b.border); doc.setLineWidth(1.5);
          doc.roundedRect(bx, y, bw, 52, 5, 5, "S");
          label(b.label, bx + bw / 2, y + 14, 8, gray, "normal", "center");
          label(b.val, bx + bw / 2, y + 34, 13, b.border, "bold", "center");
        });
        y += 64;

        // Net Worth + key ratios row
        const nwBoxes = [
          { label: "Total Assets", val: fmt(totalAssets), color: lightBlue, border: blue },
          { label: "Total Liabilities", val: fmt(totalLoans), color: [255, 235, 238], border: [198, 40, 40] },
          { label: "Net Worth", val: fmt(netWorth), color: netWorth >= 0 ? lightGreen : [255, 235, 238], border: netWorth >= 0 ? green : [198, 40, 40] },
        ];
        nwBoxes.forEach((b, i) => {
          const bx = ML + i * (bw + 8);
          drawRect(bx, y, bw, 52, 5, b.color);
          doc.setDrawColor(...b.border); doc.setLineWidth(1.5);
          doc.roundedRect(bx, y, bw, 52, 5, 5, "S");
          label(b.label, bx + bw / 2, y + 14, 8, gray, "normal", "center");
          label(b.val, bx + bw / 2, y + 34, 13, b.border, "bold", "center");
        });
        y += 64;

        // Key ratios as pills
        const ratios = [
          { name: "Savings Rate", val: `${savingsRate}%`, good: savingsRate >= 20, tip: savingsRate >= 20 ? "Healthy" : "Needs Improvement" },
          { name: "Debt-to-Income", val: `${debtRatio}%`, good: debtRatio <= 40, tip: debtRatio <= 40 ? "Manageable" : "High — Reduce Debt" },
          { name: "Risk Profile", val: form.riskProfile, good: true, tip: "As assessed" },
          { name: "Retirement Age", val: form.retirementAge || "60", good: true, tip: "Target" },
        ];
        const pw = (CW - 24) / 4;
        ratios.forEach((r, i) => {
          const px = ML + i * (pw + 8);
          drawRect(px, y, pw, 46, 5, r.good ? lightGreen : [255, 235, 238]);
          label(r.name, px + pw / 2, y + 12, 7.5, gray, "normal", "center");
          label(r.val, px + pw / 2, y + 27, 11, r.good ? green : [198, 40, 40], "bold", "center");
          label(r.tip, px + pw / 2, y + 40, 7, r.good ? green : [198, 40, 40], "normal", "center");
        });
        y += 60;

        // Asset breakdown mini table
        drawRect(ML, y, CW, 18, 3, [245, 245, 245]);
        label("ASSET BREAKDOWN", ML + 8, y + 12, 8, darkOrange, "bold");
        y += 22;
        const assets = [
          ["Bank / Liquid", fmt(form.bankBalance)],
          ["Mutual Funds", fmt(form.mutualFunds)],
          ["PPF / EPF", fmt(form.ppfEpf)],
          ["Gold", fmt(form.gold)],
          ["Property", fmt(form.property)],
        ];
        const aw = CW / assets.length;
        assets.forEach(([aLabel, aVal], i) => {
          const ax = ML + i * aw;
          if (i % 2 === 0) drawRect(ax, y, aw, 32, 0, [250, 250, 250]);
          label(aLabel, ax + aw / 2, y + 12, 7.5, gray, "normal", "center");
          label(aVal, ax + aw / 2, y + 26, 9, [30, 30, 30], "bold", "center");
        });
        y += 44;

        // ── SECTION B: YOUR GOALS ─────────────────────────────────────
        drawRect(ML, y, CW, 24, 4, [21, 101, 192]);
        label("SECTION 2 — YOUR GOALS", ML + 12, y + 16, 11, white, "bold");
        y += 36;

        // Goals visual
        drawRect(ML, y, CW, 60, 6, lightBlue);
        doc.setDrawColor(...blue); doc.setLineWidth(1);
        doc.roundedRect(ML, y, CW, 60, 6, 6, "S");
        label("Your stated goals:", ML + 12, y + 16, 9, blue, "bold");
        const goalLines = doc.splitTextToSize(form.goals || "Not specified", CW - 24);
        goalLines.slice(0, 3).forEach((gl, gi) => label(gl, ML + 12, y + 30 + gi * 12, 9, [30, 30, 30]));
        y += 74;

        // Journey visual: Present → Journey → Destination
        drawRect(ML, y, CW, 56, 6, lightOrange);
        const jw = CW / 3;
        // Present box
        drawRect(ML + 4, y + 6, jw - 8, 44, 5, white);
        label("WHERE YOU ARE", ML + 4 + (jw - 8) / 2, y + 20, 7.5, gray, "bold", "center");
        label(`Net Worth: ${fmt(netWorth)}`, ML + 4 + (jw - 8) / 2, y + 34, 8, darkOrange, "bold", "center");
        label(`Savings: ${fmt(form.monthlySavings)}/mo`, ML + 4 + (jw - 8) / 2, y + 46, 7.5, gray, "normal", "center");
        // Arrow
        label("→", ML + jw + jw / 2, y + 34, 22, orange, "bold", "center");
        // Destination box
        drawRect(ML + jw * 2 + 4, y + 6, jw - 8, 44, 5, white);
        label("WHERE YOU WANT TO BE", ML + jw * 2 + 4 + (jw - 8) / 2, y + 20, 7.5, gray, "bold", "center");
        label(`Retire at ${form.retirementAge || 60}`, ML + jw * 2 + 4 + (jw - 8) / 2, y + 34, 9, green, "bold", "center");
        label("Financial Freedom", ML + jw * 2 + 4 + (jw - 8) / 2, y + 46, 7.5, gray, "normal", "center");
        y += 70;

        // ── PAGE 2: DETAILED PLAN ──────────────────────────────────────
        newPage();
        drawRect(0, 0, W, 40, 0, darkBg);
        label(`Financial Solution Plan — ${form.clientName}`, ML, 25, 11, white, "bold");
        label("Detailed Analysis & Recommendations", W - MR, 25, 9, [255, 200, 100], "normal", "right");
        y = 60;

        // Section 3 header
        drawRect(ML, y, CW, 24, 4, green);
        label("SECTION 3 — YOUR ROADMAP & RECOMMENDATIONS", ML + 12, y + 16, 11, white, "bold");
        y += 36;

        // Render FSP text cleanly
        doc.setFont("helvetica", "normal");
        const fspLines = fspText.split("\n");
        for (const rawLine of fspLines) {
          const line = rawLine.trim();
          if (!line) { y += 6; if (y > H - 60) { newPage(); drawRect(0, 0, W, 40, 0, darkBg); label(`Financial Solution Plan — ${form.clientName}`, ML, 25, 11, white, "bold"); y = 60; } continue; }
          const isH1 = /^#\s/.test(line);
          const isH2 = /^##\s/.test(line);
          const isH3 = /^###\s/.test(line);
          const cleanLine = line.replace(/^#{1,3}\s/, "").replace(/\*\*/g, "");

          if (isH1) {
            y += 8;
            if (y > H - 80) { newPage(); drawRect(0, 0, W, 40, 0, darkBg); label(`Financial Solution Plan — ${form.clientName}`, ML, 25, 11, white, "bold"); y = 60; }
            drawRect(ML, y - 12, CW, 22, 3, darkOrange);
            label(cleanLine, ML + 10, y + 4, 10, white, "bold");
            y += 18;
          } else if (isH2) {
            y += 6;
            if (y > H - 60) { newPage(); drawRect(0, 0, W, 40, 0, darkBg); label(`Financial Solution Plan — ${form.clientName}`, ML, 25, 11, white, "bold"); y = 60; }
            label(cleanLine, ML, y, 10, darkOrange, "bold");
            doc.setDrawColor(...orange); doc.setLineWidth(0.5);
            doc.line(ML, y + 3, ML + CW, y + 3);
            y += 14;
          } else if (isH3) {
            y += 4;
            label(cleanLine, ML, y, 9.5, [50, 50, 50], "bold");
            y += 13;
          } else {
            const lineH = 13;
            if (y > H - 60) { newPage(); drawRect(0, 0, W, 40, 0, darkBg); label(`Financial Solution Plan — ${form.clientName}`, ML, 25, 11, white, "bold"); y = 60; }
            const wLines = doc.splitTextToSize(cleanLine, CW);
            doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(40, 40, 40);
            for (let wi = 0; wi < wLines.length; wi++) {
              if (y > H - 60) { newPage(); drawRect(0, 0, W, 40, 0, darkBg); label(`Financial Solution Plan — ${form.clientName}`, ML, 25, 11, white, "bold"); y = 60; }
              doc.text(wLines[wi], ML, y); y += lineH;
            }
          }
        }

        // Footer on every page
        const totalPages = doc.internal.pages.length - 1;
        Array.from({ length: totalPages }, (_, i) => i + 1).forEach((p) => {
          doc.setPage(p);
          drawRect(0, H - 28, W, 28, 0, darkBg);
          label("Prepared by: Viral Bhatt | Money Mantra | AMFI Registered Mutual Fund Distributor | As featured in CNBC Awaaz & Zee Business", W / 2, H - 10, 7, [200, 200, 200], "normal", "center");
          label(`Page ${p} of ${totalPages}`, W - MR, H - 10, 7, orange, "normal", "right");
        });

        pdfBase64 = doc.output("datauristring").split(",")[1];
      } catch (pdfErr) {
        console.error("Browser PDF generation failed:", pdfErr);
      }

      // Step 3: Send PDF to server for emailing — AWAIT this so it completes before showing result
      let pdfEmailSent = false;
      if (pdfBase64) {
        try {
          const pdfRes = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "__email_pdf_only__", form: { ...form, _fspText: fspText }, pdfBase64 }),
          });
          if (pdfRes.ok) pdfEmailSent = true;
        } catch (e) { console.error("PDF email send failed:", e); }
      }

      // Combine status — DOCX sent in first call, PDF in second
      const combinedStatus = {
        clientSent: pdfEmailSent,
        advisorSent: pdfEmailSent,
        pdfSent: pdfEmailSent,
        error: pdfEmailSent ? null : "Email sending failed",
      };
      setEmailStatus(combinedStatus);
      setStep(7);
    } catch (e) { setError("Network error. Please try again."); }
    setLoading(false);
  };

  const reset = () => { setStep(1); setForm(initialForm); setGeneratedFSP(""); setError(""); setEmailStatus(null); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0a00 0%, #2d1400 50%, #1a0a00 100%)", fontFamily: "'Georgia', serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ background: "#fff", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `4px solid ${ORANGE}`, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
        <img src="/logo.png" alt="Money Mantra" style={{ height: 56, width: "auto" }} />
        <div style={{ fontSize: 11, textAlign: "right", fontFamily: "sans-serif", color: DARK_ORANGE, lineHeight: 1.6 }}>
          AMFI Registered Mutual Fund Distributor<br/>As featured in CNBC Awaaz &amp; Zee Business
        </div>
      </div>

      {/* Steps */}
      {step <= 6 && (
        <div style={{ padding: "24px 32px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {steps.map(s => (
            <div key={s.id} onClick={() => step > s.id && setStep(s.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, fontSize: 13, fontFamily: "sans-serif", background: step === s.id ? ORANGE : step > s.id ? DARK_ORANGE : "rgba(255,255,255,0.08)", color: step >= s.id ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: step === s.id ? "bold" : "normal", cursor: step > s.id ? "pointer" : "default" }}>
              <span>{s.icon}</span><span>{s.title}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "24px 32px", maxWidth: 800, margin: "0 auto" }}>
        {step === 1 && (
          <FormCard title="👤 Client Information" subtitle="Basic details about the client">
            <Row><Field label="Client Full Name *" name="clientName" value={form.clientName} onChange={handleChange} placeholder="e.g. Rajesh Kumar Shah" /><Field label="Client Age *" name="clientAge" value={form.clientAge} onChange={handleChange} placeholder="e.g. 38" type="number" /></Row>
            <Row><Field label="Email Address *" name="clientEmail" value={form.clientEmail} onChange={handleChange} placeholder="e.g. rajesh@email.com" type="email" /><Field label="Mobile Number *" name="clientMobile" value={form.clientMobile} onChange={handleChange} placeholder="e.g. 9876543210" type="tel" /></Row>
            <Row><Field label="Spouse Name" name="spouseName" value={form.spouseName} onChange={handleChange} placeholder="e.g. Priya Shah" /><Field label="Spouse Age" name="spouseAge" value={form.spouseAge} onChange={handleChange} placeholder="e.g. 35" type="number" /></Row>
            <Row><Field label="Children (ages)" name="children" value={form.children} onChange={handleChange} placeholder="e.g. Son 8, Daughter 5" /><Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" /></Row>
            <NavButtons step={step} setStep={setStep} canNext={form.clientName && form.clientAge && form.clientEmail && form.clientMobile} />
          </FormCard>
        )}
        {step === 2 && (
          <FormCard title="💰 Income & Expenses" subtitle="Monthly cash flow (in ₹)">
            <Row><Field label="Monthly Income (Self) *" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} placeholder="150000" type="number" prefix="₹" /><Field label="Monthly Income (Spouse)" name="spouseIncome" value={form.spouseIncome} onChange={handleChange} placeholder="80000" type="number" prefix="₹" /></Row>
            <Row><Field label="Monthly Expenses *" name="monthlyExpenses" value={form.monthlyExpenses} onChange={handleChange} placeholder="70000" type="number" prefix="₹" /><Field label="Total Monthly EMI" name="monthlyEMI" value={form.monthlyEMI} onChange={handleChange} placeholder="35000" type="number" prefix="₹" /></Row>
            <Field label="Monthly Savings / SIP" name="monthlySavings" value={form.monthlySavings} onChange={handleChange} placeholder="25000" type="number" prefix="₹" />
            <NavButtons step={step} setStep={setStep} canNext={form.monthlyIncome && form.monthlyExpenses} />
          </FormCard>
        )}
        {step === 3 && (
          <FormCard title="🏦 Assets & Liabilities" subtitle="Current financial position (in ₹)">
            <SectionLabel>📈 Assets</SectionLabel>
            <Row><Field label="Bank Balance / FD" name="bankBalance" value={form.bankBalance} onChange={handleChange} placeholder="0" type="number" prefix="₹" /><Field label="Mutual Funds" name="mutualFunds" value={form.mutualFunds} onChange={handleChange} placeholder="0" type="number" prefix="₹" /></Row>
            <Row><Field label="PPF / EPF / NPS" name="ppfEpf" value={form.ppfEpf} onChange={handleChange} placeholder="0" type="number" prefix="₹" /><Field label="Gold (value)" name="gold" value={form.gold} onChange={handleChange} placeholder="0" type="number" prefix="₹" /></Row>
            <Field label="Property Value" name="property" value={form.property} onChange={handleChange} placeholder="0" type="number" prefix="₹" />
            <SectionLabel style={{ marginTop: 20 }}>🏛️ Loans</SectionLabel>
            <Row><Field label="Home Loan Outstanding" name="homeLoan" value={form.homeLoan} onChange={handleChange} placeholder="0" type="number" prefix="₹" /><Field label="Home Loan EMI" name="homeLoanEMI" value={form.homeLoanEMI} onChange={handleChange} placeholder="0" type="number" prefix="₹" /></Row>
            <Row><Field label="Personal Loan Outstanding" name="personalLoan" value={form.personalLoan} onChange={handleChange} placeholder="0" type="number" prefix="₹" /><Field label="Personal Loan EMI" name="personalLoanEMI" value={form.personalLoanEMI} onChange={handleChange} placeholder="0" type="number" prefix="₹" /></Row>
            <Row><Field label="Car Loan Outstanding" name="carLoan" value={form.carLoan} onChange={handleChange} placeholder="0" type="number" prefix="₹" /><Field label="Car Loan EMI" name="carLoanEMI" value={form.carLoanEMI} onChange={handleChange} placeholder="0" type="number" prefix="₹" /></Row>
            <NavButtons step={step} setStep={setStep} canNext={true} />
          </FormCard>
        )}
        {step === 4 && (
          <FormCard title="🛡️ Insurance Coverage" subtitle="Current insurance (sum assured in ₹)">
            <Row><Field label="Life Insurance Cover" name="lifeInsurance" value={form.lifeInsurance} onChange={handleChange} placeholder="5000000" type="number" prefix="₹" /><Field label="Term Insurance Cover" name="termCover" value={form.termCover} onChange={handleChange} placeholder="10000000" type="number" prefix="₹" /></Row>
            <Row><Field label="Health Insurance Cover" name="healthInsurance" value={form.healthInsurance} onChange={handleChange} placeholder="500000" type="number" prefix="₹" /><Field label="Accident Insurance" name="accidentInsurance" value={form.accidentInsurance} onChange={handleChange} placeholder="1000000" type="number" prefix="₹" /></Row>
            <NavButtons step={step} setStep={setStep} canNext={true} />
          </FormCard>
        )}
        {step === 5 && (
          <FormCard title="🎯 Goals & Risk Profile" subtitle="What does the client want to achieve?">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: ORANGE, fontFamily: "sans-serif" }}>Financial Goals *</label>
              <textarea name="goals" value={form.goals} onChange={handleChange} rows={5}
                placeholder={"e.g.\n• Child education in 10 years — ₹30 lakhs\n• Home down payment in 5 years — ₹50 lakhs\n• Retirement at 60 — ₹5 crore corpus"}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${ORANGE}55`, borderRadius: 8, padding: "12px", color: "#fff", fontFamily: "sans-serif", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <Row>
              <Field label="Target Retirement Age" name="retirementAge" value={form.retirementAge} onChange={handleChange} placeholder="60" type="number" />
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6, color: ORANGE, fontFamily: "sans-serif" }}>Risk Profile</label>
                <select name="riskProfile" value={form.riskProfile} onChange={handleChange}
                  style={{ width: "100%", background: "rgba(30,15,0,0.9)", border: `1px solid ${ORANGE}55`, borderRadius: 8, padding: "10px 12px", color: "#fff", fontFamily: "sans-serif", fontSize: 14 }}>
                  <option>Conservative</option><option>Moderate</option><option>Aggressive</option>
                </select>
              </div>
            </Row>
            <NavButtons step={step} setStep={setStep} canNext={form.goals} />
          </FormCard>
        )}
        {step === 6 && (
          <FormCard title="✨ Review & Generate" subtitle="Verify details then generate your FSP">
            <div style={{ background: "rgba(255,140,0,0.08)", border: `1px solid ${ORANGE}44`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <SummaryRow label="Client" value={`${form.clientName}, Age ${form.clientAge}`} />
              <SummaryRow label="Email" value={form.clientEmail} />
              <SummaryRow label="Mobile" value={form.clientMobile} />
              <SummaryRow label="City" value={form.city} />
              <SummaryRow label="Total Income" value={`₹${(parseFloat(form.monthlyIncome)||0)+(parseFloat(form.spouseIncome)||0)}/month`} />
              <SummaryRow label="Monthly Savings" value={`₹${form.monthlySavings}/month`} />
              <SummaryRow label="Risk Profile" value={form.riskProfile} />
              <SummaryRow label="Goals" value={form.goals.substring(0,80)+(form.goals.length>80?"...":"")} />
            </div>
            {error && <div style={{ background: "#ff000022", border: "1px solid #ff4444", borderRadius: 8, padding: 12, marginBottom: 16, fontFamily: "sans-serif", fontSize: 13, color: "#ff8888" }}>⚠️ {error}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(5)} style={{ padding: "12px 24px", background: "transparent", border: `1px solid ${ORANGE}66`, borderRadius: 8, color: ORANGE, fontFamily: "sans-serif", fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={generateFSP} disabled={loading}
                style={{ flex: 1, padding: "14px", background: loading ? "#555" : `linear-gradient(90deg, ${DARK_ORANGE}, ${ORANGE})`, border: "none", borderRadius: 8, color: "#fff", fontFamily: "sans-serif", fontSize: 15, fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "⏳ Generating & Emailing FSP... (30-60 sec)" : "🚀 Generate & Email My FSP"}
              </button>
            </div>
          </FormCard>
        )}
        {step === 7 && generatedFSP && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: ORANGE, marginBottom: 12 }}>FSP Generated Successfully!</div>
            <div style={{ fontSize: 16, opacity: 0.8, fontFamily: "sans-serif", marginBottom: 32 }}>
              Financial Solution Plan for <strong>{form.clientName}</strong> is ready.
            </div>
            <div style={{ background: "rgba(76,175,80,0.12)", border: "1px solid #4CAF50", borderRadius: 12, padding: "20px 32px", marginBottom: 32, fontFamily: "sans-serif", fontSize: 15, maxWidth: 480 }}>
              {emailStatus?.clientSent
                ? <>📧 PDF &amp; Word copies have been emailed to<br /><strong>{form.clientEmail}</strong></>
                : <>⚠️ Could not send email ({emailStatus?.error || "unknown error"}).<br />Please try again.</>}
            </div>
            <button onClick={reset} style={{ padding: "14px 40px", background: `linear-gradient(90deg, ${DARK_ORANGE}, ${ORANGE})`, border: "none", borderRadius: 10, color: "#fff", fontFamily: "sans-serif", fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>
              🔄 Generate Another FSP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
