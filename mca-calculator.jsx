import { useState, useCallback } from "react";

const TERM_TYPES = ["Days", "Weeks", "Months"];

function termToDays(value, type) {
  if (type === "Days") return value;
  if (type === "Weeks") return value * 5;
  if (type === "Months") return value * 20;
  return value;
}

function daysToWeeks(days) { return Math.round(days / 5 * 10) / 10; }
function daysToMonths(days) { return Math.round(days / 20 * 10) / 10; }

function calcPayments(fundingAmount, factorRate, termValue, termType) {
  const paybackAmount = Math.round(fundingAmount * factorRate);
  const days = termToDays(termValue, termType);
  const weeks = daysToWeeks(days);
  const months = daysToMonths(days);
  const dailyPayment = days > 0 ? Math.round(paybackAmount / days) : 0;
  const weeklyPayment = weeks > 0 ? Math.round(paybackAmount / weeks) : 0;
  const monthlyPayment = months > 0 ? Math.round(paybackAmount / months) : 0;
  return { paybackAmount, days, weeks, months, dailyPayment, weeklyPayment, monthlyPayment };
}

function fmt(n) {
  return "$" + Number(n).toLocaleString();
}

function OptionCard({ option, index, onChange, onDelete, showDelete }) {
  const { fundingAmount, factorRate, termValue, termType } = option;
  const [amountFocused, setAmountFocused] = useState(false);
  const calc = calcPayments(fundingAmount, factorRate, termValue, termType);

  const highlighted = termType === "Days" ? "days" : termType === "Weeks" ? "weeks" : "months";

  const adjustAmount = (delta) => {
    onChange({ ...option, fundingAmount: Math.max(0, fundingAmount + delta) });
  };

  const adjustFactor = (delta) => {
    const val = Math.round((factorRate + delta) * 100) / 100;
    onChange({ ...option, factorRate: Math.max(1, val) });
  };

  const adjustTerm = (delta) => {
    onChange({ ...option, termValue: Math.max(1, termValue + delta) });
  };

  return (
    <div style={{
      background: "white",
      borderRadius: 12,
      padding: "24px",
      marginBottom: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Option {index + 1}</span>
        {showDelete && (
          <button onClick={onDelete} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#aaa", fontSize: 18, padding: "2px 6px",
            borderRadius: 4, lineHeight: 1
          }}>🗑</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {/* Left: inputs */}
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, fontSize: 14, display: "block", marginBottom: 6 }}>Funding Amount</label>
            <div style={{
              display: "flex", alignItems: "center",
              border: "1px solid #dde3ec", borderRadius: 8,
              background: "#eef2f7", padding: "10px 14px", gap: 6
            }}>
              <span style={{ color: "#64748b", fontSize: 14, userSelect: "none" }}>$</span>
              {amountFocused ? (
                <input
                  type="number"
                  autoFocus
                  value={fundingAmount}
                  onChange={e => onChange({ ...option, fundingAmount: Number(e.target.value) || 0 })}
                  onBlur={() => setAmountFocused(false)}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: 14, width: "100%", fontFamily: "inherit", color: "#1e293b"
                  }}
                />
              ) : (
                <span
                  onClick={() => setAmountFocused(true)}
                  style={{ fontSize: 14, color: "#1e293b", cursor: "text", width: "100%", display: "block" }}
                >
                  {Number(fundingAmount).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Quick adjust buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
            {[100, 1000, 10000].map(v => (
              <button key={v} onClick={() => adjustAmount(v)} style={{
                padding: "8px 4px", borderRadius: 8, border: "none",
                background: "#dcfce7", color: "#16a34a", fontWeight: 600,
                fontSize: 13, cursor: "pointer"
              }}>+{v >= 1000 ? (v / 1000) + "k" : v}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 20 }}>
            {[100, 1000, 10000].map(v => (
              <button key={v} onClick={() => adjustAmount(-v)} style={{
                padding: "8px 4px", borderRadius: 8, border: "none",
                background: "#fee2e2", color: "#dc2626", fontWeight: 600,
                fontSize: 13, cursor: "pointer"
              }}>-{v >= 1000 ? (v / 1000) + "k" : v}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {/* Factor Rate */}
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, fontSize: 14, display: "block", marginBottom: 6 }}>Factor Rate</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px" }}>
                <button onClick={() => adjustFactor(-0.01)} style={spinBtn}>−</button>
                <span style={{ flex: 1, textAlign: "center", fontSize: 14 }}>{factorRate.toFixed(2)}</span>
                <button onClick={() => adjustFactor(0.01)} style={spinBtn}>+</button>
              </div>
            </div>

            {/* Term */}
            <div style={{ flex: 2 }}>
              <label style={{ fontWeight: 500, fontSize: 14, display: "block", marginBottom: 6 }}>Term</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select
                  value={termType}
                  onChange={e => onChange({ ...option, termType: e.target.value })}
                  style={{
                    border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px",
                    fontSize: 14, background: "white", cursor: "pointer", fontFamily: "inherit",
                    outline: "none"
                  }}
                >
                  {TERM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px" }}>
                  <button onClick={() => adjustTerm(-1)} style={spinBtn}>−</button>
                  <span style={{ minWidth: 28, textAlign: "center", fontSize: 14 }}>{termValue}</span>
                  <button onClick={() => adjustTerm(1)} style={spinBtn}>+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Repayment Overview */}
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Repayment Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <Cell label="Funding Amount" value={fmt(fundingAmount)} valueColor="#16a34a" />
            <Cell label="Factor Rate" value={factorRate.toFixed(2)} />
            <Cell label="Payback Amount" value={fmt(calc.paybackAmount)} valueColor="#dc2626" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <Cell label="Days" value={calc.days} highlight={highlighted === "days"} />
            <Cell label="Weeks" value={calc.weeks} highlight={highlighted === "weeks"} />
            <Cell label="Months" value={calc.months} highlight={highlighted === "months"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Cell label="Daily Payment" value={fmt(calc.dailyPayment)} highlight={highlighted === "days"} />
            <Cell label="Weekly Payment" value={fmt(calc.weeklyPayment)} highlight={highlighted === "weeks"} />
            <Cell label="Monthly Payment" value={fmt(calc.monthlyPayment)} highlight={highlighted === "months"} />
          </div>
        </div>
      </div>
    </div>
  );
}

const spinBtn = {
  background: "none", border: "none", cursor: "pointer",
  fontWeight: 700, fontSize: 16, color: "#374151", padding: "0 2px",
  lineHeight: 1
};

function Cell({ label, value, valueColor, highlight }) {
  return (
    <div style={{
      background: highlight ? "#fef9c3" : "#f8fafc",
      border: highlight ? "1.5px solid #fde047" : "1px solid #e2e8f0",
      borderRadius: 8, padding: "14px 8px", textAlign: "center"
    }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: valueColor || "#1e293b" }}>{value}</div>
    </div>
  );
}

const SUMMARY_FIELDS = [
  { key: "fundingAmount", label: "Funding Amount" },
  { key: "factorRate", label: "Factor Rate" },
  { key: "termLength", label: "Term Length" },
  { key: "payment", label: "Payment" },
  { key: "paybackAmount", label: "Payback Amount" },
];

function getSummaryText(options, displayedFields) {
  return options.map((opt, i) => {
    const calc = calcPayments(opt.fundingAmount, opt.factorRate, opt.termValue, opt.termType);
    const paymentLabel = opt.termType === "Days" ? "Daily" : opt.termType === "Weeks" ? "Weekly" : "Monthly";
    const paymentAmt = opt.termType === "Days" ? calc.dailyPayment : opt.termType === "Weeks" ? calc.weeklyPayment : calc.monthlyPayment;

    let lines = [`Option ${i + 1}`];
    if (displayedFields.fundingAmount) lines.push(`Funding Amount: ${fmt(opt.fundingAmount)}`);
    if (displayedFields.factorRate) lines.push(`Factor Rate: ${opt.factorRate.toFixed(2)}`);
    if (displayedFields.termLength) lines.push(`Term Length: ${opt.termValue} ${opt.termType.toLowerCase()}`);
    if (displayedFields.payment) lines.push(`${paymentLabel} Payments: ${fmt(paymentAmt)}`);
    if (displayedFields.paybackAmount) lines.push(`Payback Amount: ${fmt(calc.paybackAmount)}`);
    return lines.join("\n");
  }).join("\n\n");
}

function SummaryCard({ option, index, onDelete, displayedFields }) {
  const calc = calcPayments(option.fundingAmount, option.factorRate, option.termValue, option.termType);
  const paymentLabel = option.termType === "Days" ? "Daily" : option.termType === "Weeks" ? "Weekly" : "Monthly";
  const paymentAmt = option.termType === "Days" ? calc.dailyPayment : option.termType === "Weeks" ? calc.weeklyPayment : calc.monthlyPayment;

  const text = [
    displayedFields.fundingAmount && `Funding Amount: ${fmt(option.fundingAmount)}`,
    displayedFields.factorRate && `Factor Rate: ${option.factorRate.toFixed(2)}`,
    displayedFields.termLength && `Term Length: ${option.termValue} ${option.termType.toLowerCase()}`,
    displayedFields.payment && `${paymentLabel} Payments: ${fmt(paymentAmt)}`,
    displayedFields.paybackAmount && `Payback Amount: ${fmt(calc.paybackAmount)}`,
  ].filter(Boolean).join("\n");

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 10, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <strong style={{ fontSize: 14 }}>Option {index + 1}</strong>
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, lineHeight: 1 }}>🗑</button>
      </div>
      <div style={{ fontSize: 13, color: "#374151", marginTop: 6, lineHeight: 1.7, whiteSpace: "pre-line" }}>{text}</div>
    </div>
  );
}

export default function MCACalculator() {
  const [options, setOptions] = useState([
    { id: 1, fundingAmount: 10000, factorRate: 1.49, termValue: 36, termType: "Weeks" }
  ]);
  const [displayedFields, setDisplayedFields] = useState({
    fundingAmount: true, factorRate: true, termLength: true, payment: true, paybackAmount: true
  });
  const [aiComparison, setAiComparison] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const updateOption = (id, updated) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...updated, id } : o));
  };

  const deleteOption = (id) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const addOption = () => {
    const newId = Date.now();
    setOptions(prev => [...prev, { id: newId, fundingAmount: 10000, factorRate: 1.49, termValue: 36, termType: "Weeks" }]);
  };

  const toggleField = (key) => {
    setDisplayedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyAll = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const generateAI = async () => {
    setAiLoading(true);
    setAiComparison("");
    const summaryText = getSummaryText(options, displayedFields);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an MCA (Merchant Cash Advance) funding advisor. Given the following funding options, provide a brief, clear comparison to help a business owner decide. Be concise (3-5 sentences), highlight key trade-offs (cost, payment burden, flexibility), and give a recommendation.\n\n${summaryText}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Unable to generate comparison.";
      setAiComparison(text);
    } catch {
      setAiComparison("Error generating comparison. Please try again.");
    }
    setAiLoading(false);
  };

  const allSummaryText = getSummaryText(options, displayedFields);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#eef2f7",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "32px 16px"
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: "#1e293b" }}>MCA Calculator</h1>
        <p style={{ color: "#64748b", marginTop: 6, fontSize: 15 }}>Compare repayments and generate summaries for your funding options.</p>
      </div>

      <div style={{ display: "flex", gap: 20, maxWidth: 1400, margin: "0 auto", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left: Options */}
        <div style={{ flex: "1 1 600px", minWidth: 320 }}>
          {options.map((opt, i) => (
            <OptionCard
              key={opt.id}
              option={opt}
              index={i}
              onChange={updated => updateOption(opt.id, updated)}
              onDelete={() => deleteOption(opt.id)}
              showDelete={options.length > 1}
            />
          ))}
          <button onClick={addOption} style={{
            width: "100%", padding: "14px", background: "white",
            border: "1.5px dashed #cbd5e1", borderRadius: 12, cursor: "pointer",
            fontSize: 14, color: "#64748b", fontWeight: 500, fontFamily: "inherit"
          }}>+ Add Funding Option</button>
        </div>

        {/* Right: Funding Summary */}
        <div style={{
          flex: "0 0 300px", minWidth: 280,
          background: "white", borderRadius: 12,
          padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
        }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Funding Summary</h2>
          <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: 13 }}>Copy and paste offers.</p>

          {/* Displayed Fields checkboxes */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#374151" }}>Displayed Fields</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
              {SUMMARY_FIELDS.map(f => (
                <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={displayedFields[f.key]}
                    onChange={() => toggleField(f.key)}
                    style={{ accentColor: "#3b82f6", width: 14, height: 14 }}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => copyAll(allSummaryText)} style={copyBtn}>
            📋 {copiedAll ? "Copied!" : "Copy All"}
          </button>

          <div style={{ marginTop: 14 }}>
            {options.map((opt, i) => (
              <SummaryCard
                key={opt.id}
                option={opt}
                index={i}
                displayedFields={displayedFields}
                onDelete={() => deleteOption(opt.id)}
              />
            ))}
          </div>

          <button onClick={() => copyAll(allSummaryText)} style={{ ...copyBtn, marginBottom: 10 }}>
            📋 Copy All
          </button>

          <button
            onClick={generateAI}
            disabled={aiLoading}
            style={{
              width: "100%", padding: "12px",
              background: aiLoading ? "#93c5fd" : "#38bdf8",
              border: "none", borderRadius: 8, cursor: aiLoading ? "not-allowed" : "pointer",
              fontSize: 14, fontWeight: 600, color: "white",
              marginBottom: 10, fontFamily: "inherit",
              transition: "background 0.2s"
            }}
          >
            {aiLoading ? "Generating..." : "Generate AI Comparison"}
          </button>

          {aiComparison && (
            <div style={{
              background: "#f0f9ff", border: "1px solid #bae6fd",
              borderRadius: 8, padding: 12, fontSize: 13, color: "#1e293b",
              lineHeight: 1.6, marginBottom: 10
            }}>
              {aiComparison}
            </div>
          )}

          <button onClick={() => copyAll(aiComparison || allSummaryText)} style={copyBtn}>
            📋 Copy All
          </button>
        </div>
      </div>
    </div>
  );
}

const copyBtn = {
  width: "100%", padding: "10px",
  background: "white", border: "1px solid #e2e8f0",
  borderRadius: 8, cursor: "pointer",
  fontSize: 13, color: "#374151", fontWeight: 500,
  fontFamily: "inherit", display: "flex",
  alignItems: "center", justifyContent: "center", gap: 6
};
