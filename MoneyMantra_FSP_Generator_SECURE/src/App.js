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

function actionBtn(bg, color) {
  return { padding: "9px 18px", background: bg, border: "none", borderRadius: 8, color, fontFamily: "sans-serif", fontSize: 13, cursor: "pointer", fontWeight: 500 };
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
      // Step 1: Get FSP text + DOCX from server
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(), form }),
      });
      const data = await response.json();
      if (!data.fspText) { setError(data.error || "Generation failed. Please try again."); setLoading(false); return; }

      const fspText = data.fspText;
      setGeneratedFSP(fspText);

      // Step 2: Generate PDF in browser using jsPDF (full Unicode support — handles ₹ and all symbols)
      let pdfBase64 = null;
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 56;
        const maxWidth = pageWidth - margin * 2;
        const orange = [179, 89, 0];
        let y = margin + 10;

        const addPage = () => { doc.addPage(); y = margin + 10; };

        // Logo
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = "/logo.png";
        });
        if (img.complete && img.naturalWidth > 0) {
          const logoW = 180, logoH = 87;
          doc.addImage(img, "PNG", (pageWidth - logoW) / 2, y, logoW, logoH);
          y += logoH + 14;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.text(`Financial Solution Plan - Prepared for: ${form.clientName}`, pageWidth / 2, y, { align: "center" });
        y += 28;

        for (const rawLine of fspText.split("\n")) {
          const line = rawLine.trim();
          if (!line) { y += 10; if (y > pageHeight - margin) addPage(); continue; }
          const isHeading = /^#{1,3}\s/.test(line) || (/^[A-Z0-9 .,:&()\/\-₹]+$/.test(line) && line.length < 70 && line.length > 3);
          const cleanLine = line.replace(/^#{1,3}\s/, "");
          if (isHeading) {
            y += 8;
            doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(...orange);
          } else {
            doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(30, 30, 30);
          }
          const lineH = (isHeading ? 12.5 : 10.5) + 6;
          const wrapped = doc.splitTextToSize(cleanLine, maxWidth);
          for (const wLine of wrapped) {
            if (y + lineH > pageHeight - margin) addPage();
            doc.text(wLine, margin, y);
            y += lineH;
          }
        }

        // Footer on last page
        doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
        doc.text("Prepared by: Viral Bhatt | Founder, Money Mantra | AMFI Registered Mutual Fund Distributor | As featured in CNBC Awaaz & Zee Business", pageWidth / 2, pageHeight - 30, { align: "center", maxWidth: maxWidth });

        pdfBase64 = doc.output("datauristring").split(",")[1];
      } catch (pdfErr) {
        console.error("Browser PDF generation failed:", pdfErr);
        // Continue without PDF — DOCX will still be emailed
      }

      // Step 3: Send PDF base64 back to server to attach to email
      if (pdfBase64) {
        try {
          await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "__email_pdf_only__", form, pdfBase64, fspText }),
          });
        } catch (e) { console.error("PDF email send failed:", e); }
      }

      setEmailStatus(data.emailStatus || null);
      setStep(7);
    } catch (e) { setError("Network error. Please try again."); }
    setLoading(false);
  };

  const downloadPdf = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 56;
      const maxWidth = pageWidth - margin * 2;
      const orange = [179, 89, 0];
      let y = margin + 10;
      const addPage = () => { doc.addPage(); y = margin + 10; };

      const img = document.querySelector("img[alt='Money Mantra']");
      if (img) { doc.addImage(img, "PNG", (pageWidth - 180) / 2, y, 180, 87); y += 101; }

      doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(80, 80, 80);
      doc.text(`Financial Solution Plan - Prepared for: ${form.clientName}`, pageWidth / 2, y, { align: "center" });
      y += 28;

      for (const rawLine of generatedFSP.split("\n")) {
        const line = rawLine.trim();
        if (!line) { y += 10; if (y > pageHeight - margin) addPage(); continue; }
        const isHeading = /^#{1,3}\s/.test(line) || (/^[A-Z0-9 .,:&()\/\-₹]+$/.test(line) && line.length < 70 && line.length > 3);
        const cleanLine = line.replace(/^#{1,3}\s/, "");
        if (isHeading) { y += 8; doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(...orange); }
        else { doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(30, 30, 30); }
        const lineH = (isHeading ? 12.5 : 10.5) + 6;
        for (const wLine of doc.splitTextToSize(cleanLine, maxWidth)) {
          if (y + lineH > pageHeight - margin) addPage();
          doc.text(wLine, margin, y); y += lineH;
        }
      }
      doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(150, 150, 150);
      doc.text("Prepared by: Viral Bhatt | Founder, Money Mantra | AMFI Registered Mutual Fund Distributor | As featured in CNBC Awaaz & Zee Business", pageWidth / 2, pageHeight - 30, { align: "center", maxWidth });
      doc.save(`FSP_${form.clientName.replace(/\s+/g, "_")}_MoneyMantra.pdf`);
    } catch (e) { alert("PDF download failed: " + e.message); }
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
          <div>
            <div style={{ background: "rgba(255,140,0,0.1)", border: `2px solid ${ORANGE}`, borderRadius: 12, padding: "16px 24px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: ORANGE }}>✅ FSP Generated!</div>
                <div style={{ fontSize: 13, opacity: 0.7, fontFamily: "sans-serif" }}>Financial Solution Plan for {form.clientName}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => navigator.clipboard.writeText(generatedFSP)} style={actionBtn("#333", "#fff")}>📋 Copy</button>
                <button onClick={downloadPdf} style={actionBtn(DARK_ORANGE, "#fff")}>⬇️ Download PDF</button>
                <button onClick={reset} style={actionBtn(ORANGE, "#fff")}>🔄 New FSP</button>
              </div>
            </div>
            {emailStatus && (
              <div style={{ background: emailStatus.clientSent ? "rgba(76,175,80,0.1)" : "#ff000022", border: `1px solid ${emailStatus.clientSent ? "#4CAF50" : "#ff4444"}`, borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontFamily: "sans-serif", fontSize: 13.5 }}>
                {emailStatus.clientSent
                  ? `📧 PDF & Word copies sent to ${form.clientEmail}${emailStatus.advisorSent ? " and Viral Bhatt" : ""}.`
                  : `⚠️ Could not send email (${emailStatus.error || "unknown error"}). Use Copy/Download above to share manually.`}
              </div>
            )}
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ORANGE}33`, borderRadius: 12, padding: "28px 32px", fontFamily: "sans-serif", fontSize: 13.5, lineHeight: 1.7, color: "#e8e8e8", whiteSpace: "pre-wrap", maxHeight: "70vh", overflowY: "auto" }}>
              {generatedFSP}
            </div>
            <div style={{ marginTop: 16, padding: "12px 20px", background: "rgba(255,140,0,0.06)", borderRadius: 8, fontFamily: "sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              💡 PDF and Word copies emailed to {form.clientEmail}. Use "Download PDF" above for an instant copy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
