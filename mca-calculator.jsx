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

function OptionCard({ option, index, onChange, onDelete, displayedFields, showDelete }) {
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
        <span style={{ fontWeight: 600, fontSize: 15 }}>
          Option {index + 1}{option.label ? ` — ${option.label}` : ""}
        </span>
        {showDelete && (
          <button onClick={onDelete} style={{
            background: "none", border: "1px solid #e2e8f0", cursor: "pointer",
            color: "#94a3b8", fontSize: 13, padding: "5px 8px",
            borderRadius: 6, lineHeight: 1
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

function getSingleOptionText(opt, index, displayedFields) {
  const calc = calcPayments(opt.fundingAmount, opt.factorRate, opt.termValue, opt.termType);
  const paymentLabel = opt.termType === "Days" ? "Daily" : opt.termType === "Weeks" ? "Weekly" : "Monthly";
  const paymentAmt = opt.termType === "Days" ? calc.dailyPayment : opt.termType === "Weeks" ? calc.weeklyPayment : calc.monthlyPayment;
  const label = opt.label ? `Option ${index + 1} - ${opt.label}` : `Option ${index + 1}`;
  let lines = [label];
  if (displayedFields.fundingAmount) lines.push(`Funding Amount: ${fmt(opt.fundingAmount)}`);
  if (displayedFields.factorRate) lines.push(`Factor Rate: ${opt.factorRate.toFixed(2)}`);
  if (displayedFields.termLength) lines.push(`Term Length: ${opt.termValue} ${opt.termType.toLowerCase()}`);
  if (displayedFields.payment) lines.push(`${paymentLabel} Payments: ${fmt(paymentAmt)}`);
  if (displayedFields.paybackAmount) lines.push(`Payback Amount: ${fmt(calc.paybackAmount)}`);
  return lines.join("\n");
}

function getSummaryText(options, displayedFields) {
  return options.map((opt, i) => getSingleOptionText(opt, i, displayedFields)).join("\n\n");
}

function SummaryCard({ option, index, displayedFields }) {
  const [copied, setCopied] = useState(false);
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

  const fullText = (option.label ? `Option ${index + 1} - ${option.label}` : `Option ${index + 1}`) + "\n" + text;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <strong style={{ fontSize: 14 }}>Option {index + 1}{option.label ? ` — ${option.label}` : ""}</strong>
        <button onClick={handleCopy} style={{
          background: copied ? "#dcfce7" : "#f1f5f9",
          border: "1px solid " + (copied ? "#bbf7d0" : "#e2e8f0"),
          borderRadius: 6, cursor: "pointer",
          color: copied ? "#15803d" : "#374151",
          fontSize: 11, fontWeight: 500, padding: "4px 9px",
          fontFamily: "inherit", display: "flex", alignItems: "center", gap: 3,
          whiteSpace: "nowrap"
        }}>
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>
      <div style={{ fontSize: 13, color: "#374151", marginTop: 6, lineHeight: 1.7, whiteSpace: "pre-line" }}>{text}</div>
    </div>
  );
}

// Parse a formula like "Kapitus 166k / 1.399 / 120 weeks"
// Returns { label, fundingAmount, factorRate, termValue, termType } or null
function parseFormula(line) {
  if (!line.trim()) return null;
  // Normalize: collapse whitespace
  const s = line.trim();

  // Extract funding amount: number followed by optional k/m (case-insensitive)
  const amtMatch = s.match(/(\d[\d,.]*)([kKmM]?)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)\s*(days?|weeks?|months?)/i);
  if (!amtMatch) return null;

  let rawAmt = parseFloat(amtMatch[1].replace(/,/g, ""));
  const multiplier = amtMatch[2].toLowerCase();
  if (multiplier === "k") rawAmt *= 1000;
  if (multiplier === "m") rawAmt *= 1000000;

  const factorRate = parseFloat(amtMatch[3]);
  const termValue = parseFloat(amtMatch[4]);
  const termRaw = amtMatch[5].toLowerCase();
  let termType = "Days";
  if (termRaw.startsWith("week")) termType = "Weeks";
  else if (termRaw.startsWith("month")) termType = "Months";

  // Try to extract a label: text before the first number+k pattern
  const labelMatch = s.match(/^([a-zA-Z][a-zA-Z\s]*?)(?=\s*[\d])/);
  const label = labelMatch ? labelMatch[1].trim() : "";

  if (isNaN(rawAmt) || isNaN(factorRate) || isNaN(termValue)) return null;

  return { label, fundingAmount: rawAmt, factorRate, termValue, termType };
}

function getBadges(p, allParsed) {
  const badges = [];
  const days = p.termType === "Days" ? p.termValue : p.termType === "Weeks" ? p.termValue * 5 : p.termValue * 20;
  const allDays = allParsed.map(x => x.termType === "Days" ? x.termValue : x.termType === "Weeks" ? x.termValue * 5 : x.termValue * 20);

  const maxAmt = Math.max(...allParsed.map(x => x.fundingAmount));
  const minRate = Math.min(...allParsed.map(x => x.factorRate));
  const maxDays = Math.max(...allDays);
  const minPayback = Math.min(...allParsed.map(x => x.fundingAmount * x.factorRate));
  const minCost = Math.min(...allParsed.map(x => x.fundingAmount * x.factorRate - x.fundingAmount));

  if (p.fundingAmount === maxAmt) badges.push({ label: "💰 Highest Amount", color: "#1d4ed8", bg: "#dbeafe" });
  if (p.factorRate === minRate) badges.push({ label: "📉 Lowest Rate", color: "#15803d", bg: "#dcfce7" });
  if (days === maxDays) badges.push({ label: "📅 Longest Term", color: "#7c3aed", bg: "#ede9fe" });
  if (p.fundingAmount * p.factorRate === minPayback) badges.push({ label: "✅ Lowest Payback", color: "#b45309", bg: "#fef3c7" });
  if (p.fundingAmount * p.factorRate - p.fundingAmount === minCost) badges.push({ label: "💡 Lowest Cost", color: "#0f766e", bg: "#ccfbf1" });

  return badges;
}

function QuickPaste({ onAdd }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (val) => {
    setText(val);
    setError("");
    if (!val.trim()) { setParsed([]); setSelected([]); return; }

    const lines = val.split(/\n/).filter(l => l.trim());
    const results = lines.map(l => parseFormula(l)).filter(Boolean);
    setParsed(results);
    setSelected(results.map((_, i) => i)); // select all by default
    if (lines.length > 0 && results.length === 0) {
      setError("Couldn't parse. Try: Kapitus 166k / 1.399 / 120 weeks");
    }
  };

  const toggleSelect = (i) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === parsed.length ? [] : parsed.map((_, i) => i));
  };

  const handleAdd = () => {
    const toAdd = parsed.filter((_, i) => selected.includes(i));
    if (toAdd.length === 0) return;
    toAdd.forEach(p => onAdd(p));
    setText("");
    setParsed([]);
    setSelected([]);
  };

  return (
    <div style={{
      background: "white", borderRadius: 12, padding: "20px 24px",
      marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>⚡ Quick Paste</div>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
        Paste one or multiple offers — e.g. <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>Kapitus 166k / 1.399 / 120 weeks</code>
      </div>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder={"Kapitus 166k / 1.399 / 120 weeks\nAspire 75k / 1.499 / 32 weeks\nRapid 86k / 1.499 / 60 weeks"}
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box",
          border: error ? "1.5px solid #fca5a5" : "1px solid #e2e8f0",
          borderRadius: 8, padding: "10px 12px",
          fontSize: 13, fontFamily: "inherit", resize: "vertical",
          outline: "none", color: "#1e293b", lineHeight: 1.5,
          background: "#f8fafc"
        }}
      />
      {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</div>}

      {parsed.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Detected <strong>{parsed.length}</strong> offer{parsed.length > 1 ? "s" : ""} — <strong>{selected.length}</strong> selected
            </div>
            <button onClick={toggleAll} style={{
              background: "none", border: "1px solid #e2e8f0", borderRadius: 6,
              padding: "3px 10px", fontSize: 12, cursor: "pointer", color: "#374151", fontFamily: "inherit"
            }}>
              {selected.length === parsed.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {parsed.map((p, i) => {
            const isSelected = selected.includes(i);
            const badges = getBadges(p, parsed);
            const payback = Math.round(p.fundingAmount * p.factorRate);
            const cost = payback - p.fundingAmount;
            return (
              <div
                key={i}
                onClick={() => toggleSelect(i)}
                style={{
                  border: isSelected ? "2px solid #0ea5e9" : "1.5px solid #e2e8f0",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 6,
                  cursor: "pointer", background: isSelected ? "#f0f9ff" : "#fafafa",
                  transition: "all 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: isSelected ? "2px solid #0ea5e9" : "2px solid #cbd5e1",
                    background: isSelected ? "#0ea5e9" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {isSelected && <span style={{ color: "white", fontSize: 11, lineHeight: 1 }}>✓</span>}
                  </div>

                  {/* Main info + badges */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: badges.length > 0 ? 6 : 0 }}>
                      {p.label && <strong style={{ fontSize: 13, color: "#0f172a" }}>{p.label}</strong>}
                      <span style={{ fontSize: 13, color: "#334155" }}>{fmt(p.fundingAmount)}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>× {p.factorRate}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{p.termValue} {p.termType}</span>
                      <span style={{ fontSize: 12, color: "#475569" }}>→ payback <strong>{fmt(payback)}</strong></span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>(cost: {fmt(cost)})</span>
                    </div>
                    {badges.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {badges.map((b, bi) => (
                          <span key={bi} style={{
                            background: b.bg, color: b.color,
                            fontSize: 11, fontWeight: 600,
                            padding: "2px 7px", borderRadius: 20
                          }}>{b.label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={handleAdd}
              disabled={selected.length === 0}
              style={{
                padding: "9px 20px",
                background: selected.length === 0 ? "#cbd5e1" : "#0ea5e9",
                color: "white", border: "none", borderRadius: 8,
                cursor: selected.length === 0 ? "not-allowed" : "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit"
              }}
            >
              + Add {selected.length > 1 ? `${selected.length} Options` : selected.length === 1 ? "1 Option" : "Options"}
            </button>
          </div>
        </div>
      )}
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

  const addOptionFromPaste = ({ label, fundingAmount, factorRate, termValue, termType }) => {
    const newId = Date.now() + Math.random();
    setOptions(prev => [...prev, { id: newId, label, fundingAmount, factorRate, termValue, termType }]);
  };

  const toggleField = (key) => {
    setDisplayedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyAll = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
          <QuickPaste onAdd={addOptionFromPaste} />
          {options.map((opt, i) => (
            <OptionCard
              key={opt.id}
              option={opt}
              index={i}
              onChange={updated => updateOption(opt.id, updated)}
              onDelete={() => deleteOption(opt.id)}
              displayedFields={displayedFields}
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
              />
            ))}
          </div>

          <button onClick={() => copyAll(allSummaryText)} style={{ ...copyBtn, marginTop: 4 }}>
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
