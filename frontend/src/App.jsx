import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  Users, Bot, Cloud, TrendingUp, TrendingDown, AlertTriangle, RefreshCw,
  Loader2, Zap, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight,
  Sparkles, MessageSquare, Send, X
} from "lucide-react";
import { api } from "./services/api";

const fmt = (n) => "$" + Math.abs(Math.round(n)).toLocaleString();
const fmtPct = (n) => (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MO = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CAT = {
  people: { label: "People", desc: "Salaries, overtime & contractors", icon: Users, color: "#a78bfa", key: "people" },
  ai_llm: { label: "AI / LLM", desc: "API calls & model usage", icon: Bot, color: "#f472b6", key: "ai_llm" },
  saas_cloud: { label: "SaaS & Cloud", desc: "Subscriptions & infrastructure", icon: Cloud, color: "#38bdf8", key: "saas_cloud" },
};

const S = {
  page: { minHeight: "100vh", background: "#09090b", color: "#e4e4e7", fontFamily: "'DM Sans', system-ui, sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 50, background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  headerInner: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #a78bfa, #ec4899)" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" },
  section: { marginBottom: 32 },
  hero: { textAlign: "center", position: "relative", overflow: "hidden", borderRadius: 24, border: "1px solid rgba(239,68,68,0.12)", padding: "56px 32px", background: "linear-gradient(180deg, rgba(239,68,68,0.05) 0%, transparent 60%)" },
  heroGlow: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", opacity: 0.03, filter: "blur(80px)", background: "#ef4444" },
  pill: { display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.12)", marginBottom: 24 },
  pillText: { fontSize: 11, fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.15em" },
  bigNum: { fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 800, color: "#fff", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.04em", lineHeight: 1 },
  bigSuffix: { fontSize: 24, color: "rgba(252,165,165,0.5)", fontWeight: 500, marginLeft: 8 },
  annualized: { marginTop: 16, fontSize: 16, color: "#71717a" },
  annualNum: { color: "#fca5a5", fontWeight: 700, fontFamily: "'DM Mono', monospace" },
  miniPills: { display: "flex", justifyContent: "center", gap: 12, marginTop: 32, flexWrap: "wrap" },
  miniPill: { display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 50, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" },
  miniPillText: { fontSize: 11, color: "#a1a1aa" },
  miniPillVal: { fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 },
  card: (sel, color) => ({
    position: "relative", textAlign: "center", borderRadius: 20, padding: 28, cursor: "pointer",
    border: sel ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
    background: sel ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
    transform: sel ? "scale(1.03)" : "scale(1)",
    boxShadow: sel ? "0 20px 60px rgba(0,0,0,0.3)" : "none",
    transition: "all 0.3s ease",
    borderTop: sel ? `2px solid ${color}50` : "1px solid rgba(255,255,255,0.04)",
  }),
  cardIcon: (color, sel) => ({
    width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
    background: color + "15", boxShadow: sel ? `0 0 30px ${color}20` : "none",
  }),
  cardLabel: { fontSize: 15, fontWeight: 600, color: "#d4d4d8", marginBottom: 2 },
  cardDesc: { fontSize: 11, color: "#52525b", marginBottom: 16 },
  cardNum: { fontSize: 28, fontWeight: 800, fontFamily: "'DM Mono', monospace" },
  cardPct: { fontSize: 12, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
  chartBox: { borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", overflow: "hidden" },
  chartHeader: { padding: "24px 24px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: "#e4e4e7" },
  chartSub: { fontSize: 12, color: "#52525b", marginTop: 2 },
  tabBar: { display: "flex", gap: 2, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4, border: "1px solid rgba(255,255,255,0.04)" },
  tab: (sel, color) => ({
    padding: "6px 16px", fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none",
    background: sel ? color + "25" : "transparent", color: sel ? color : "#71717a", transition: "all 0.2s",
  }),
  drifterBox: { display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.1)", background: "rgba(239,68,68,0.025)", flexWrap: "wrap" },
  drifterIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  drifterText: { fontSize: 14, color: "#d4d4d8" },
  drifterName: { fontWeight: 800, color: "#f87171" },
  drifterSub: { fontSize: 12, color: "#71717a", marginTop: 4 },
  drifterNum: { color: "#f87171", fontWeight: 700, fontFamily: "'DM Mono', monospace" },
  tableBox: { borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", overflow: "hidden" },
  tableHeader: { padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  tableTitle: { fontSize: 15, fontWeight: 700, color: "#e4e4e7" },
  tableSub: { fontSize: 12, color: "#52525b", marginTop: 2 },
  badge: { fontSize: 10, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", color: "#71717a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.04)" },
  th: { padding: "12px 24px", fontSize: 11, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.1em", borderTop: "1px solid rgba(255,255,255,0.04)" },
  td: { padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.03)" },
  mono: { fontFamily: "'DM Mono', monospace", fontSize: 12 },
  footer: { borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 32, padding: "32px 0" },
  footerInner: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 },
  footerText: { fontSize: 11, color: "#3f3f46" },
  
  // AI Styles
  aiButton: { display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg, #a78bfa, #ec4899)", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 20px rgba(236, 72, 153, 0.3)" },
  aiBox: { marginTop: 32, borderRadius: 24, background: "rgba(167, 139, 250, 0.03)", border: "1px solid rgba(167, 139, 250, 0.1)", padding: 32, position: "relative", overflow: "hidden" },
  aiHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  aiTitle: { fontSize: 18, fontWeight: 700, background: "linear-gradient(135deg, #e4e4e7, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  markdown: { color: "#d4d4d8", fontSize: 15, lineHeight: 1.7 },
  chatBox: { marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 },
  chatInput: { width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "#fff", outline: "none", fontSize: 14 },
  chatMsg: (user) => ({ padding: "8px 12px", borderRadius: 8, background: user ? "rgba(255,255,255,0.05)" : "rgba(167, 139, 250, 0.1)", marginBottom: 8, maxWidth: "80%", marginLeft: user ? "auto" : 0, color: user ? "#d4d4d8" : "#e9d5ff", fontSize: 14 }),
};

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("people");
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  const load = () => {
    setLoading(true); setError(null);
    api.getDrift()
      .then((r) => { setData(r); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };
  
  useEffect(load, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const runAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await api.analyze(data);
      setAiAnalysis(res.markdown);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatHistory(h => [...h, { role: "user", content: msg }]);
    
    try {
      const res = await api.chat(msg, chatHistory, data);
      setChatHistory(h => [...h, { role: "assistant", content: res.response }]);
    } catch (e) {
      setChatHistory(h => [...h, { role: "assistant", content: "Error connecting to AI." }]);
    }
  };

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ ...S.logo, width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px" }}>
          <BarChart3 size={28} color="#fff" />
        </div>
        <p style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>PayDrift</p>
        <p style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>Analyzing spend drift…</p>
        <Loader2 size={20} color="#a78bfa" style={{ margin: "20px auto 0", animation: "spin 1s linear infinite" }} />
      </div>
    </div>
  );

  if (error) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        <AlertTriangle size={40} color="#f87171" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>Connection Failed</p>
        <p style={{ color: "#71717a", fontSize: 14, marginTop: 8 }}>Backend not running on port 8000.</p>
        <code style={{ display: "block", fontSize: 12, color: "#52525b", background: "#18181b", borderRadius: 8, padding: "8px 12px", marginTop: 12 }}>{error}</code>
        <button onClick={load} style={{ marginTop: 16, padding: "8px 20px", background: "#27272a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </div>
  );

  const { total_monthly_drift: tmd, annualized_drift: ad, categories, monthly_trends: trends } = data;
  const active = categories.find((c) => c.category === tab) || categories[0];
  const m = CAT[active.category];
  const top = active.items[0];

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} 
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} 
        table{border-collapse:collapse} 
        button{cursor:pointer;border:none;background:none;font-family:inherit}
        .markdown ul { list-style: disc; padding-left: 20px; margin-bottom: 16px; }
        .markdown li { margin-bottom: 8px; }
        .markdown strong { color: #fff; font-weight: 700; }
        .markdown h3 { font-size: 16px; color: #f472b6; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>

      {/* HEADER */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.logo}><TrendingUp size={16} color="#fff" /></div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>PayDrift</span>
            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Beta</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Jan–Jun 2025</span>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.06)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse 2s ease infinite" }} />
              <span style={{ fontSize: 11, color: "#71717a" }}>Live</span>
            </div>
          </div>
        </div>
      </header>

      <div style={S.content}>

        {/* HERO */}
        <div style={{ ...S.hero, ...S.section }}>
          <div style={S.heroGlow} />
          <div style={{ position: "relative" }}>
            <div style={S.pill}>
              <Zap size={14} color="#f87171" />
              <span style={S.pillText}>Unplanned Spend Detected</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center" }}>
              <span style={S.bigNum}>{fmt(tmd)}</span>
              <span style={S.bigSuffix}>/mo</span>
            </div>
            <p style={S.annualized}>
              That's <span style={S.annualNum}>{fmt(ad)}</span> <span style={{ color: "#a1a1aa" }}>/year</span> in unbudgeted drift
            </p>
            
            {/* AI BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
               <button onClick={runAnalysis} disabled={aiLoading || aiAnalysis} style={{ ...S.aiButton, opacity: aiLoading || aiAnalysis ? 0.7 : 1 }}>
                 {aiLoading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={18} />}
                 {aiLoading ? "Analyzing Data..." : aiAnalysis ? "Analysis Complete" : "Analyze with PayDrift AI"}
               </button>
            </div>

            <div style={S.miniPills}>
              {categories.map((c) => {
                const cm = CAT[c.category]; const up = c.total_drift > 0;
                const Icon = cm.icon;
                return (
                  <div key={c.category} style={S.miniPill}>
                    <Icon size={14} color={cm.color} />
                    <span style={S.miniPillText}>{cm.label}</span>
                    <span style={{ ...S.miniPillVal, color: up ? "#f87171" : "#34d399" }}>
                      {up ? "↑" : "↓"}{fmt(c.total_drift)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* AI INSIGHTS PANEL */}
        {(aiAnalysis || aiLoading) && (
          <div style={{ ...S.aiBox, ...S.section }}>
            <div style={S.aiHeader}>
              <Sparkles size={24} color="#a78bfa" />
              <span style={S.aiTitle}>CFO Advisor Insights</span>
            </div>
            
            {aiLoading ? (
              <div style={{ color: "#71717a", fontSize: 14 }}>Reading financial signals and drift patterns...</div>
            ) : (
              <>
                <div className="markdown" style={S.markdown}>
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>

                {/* CHAT INTERFACE */}
                <div style={S.chatBox}>
                  <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
                    {chatHistory.map((msg, i) => (
                      <div key={i} style={S.chatMsg(msg.role === "user")}>{msg.content}</div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <input 
                      style={S.chatInput} 
                      placeholder="Ask a follow-up question (e.g. 'How do we cut AI spend?')" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    />
                    <button onClick={sendChat} style={{ ...S.aiButton, padding: "0 20px" }}><Send size={16} /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CARDS */}
        <div style={{ ...S.grid, ...S.section }}>
          {categories.map((c) => {
            const cm = CAT[c.category]; const up = c.total_drift > 0; const sel = tab === c.category;
            const Icon = cm.icon; const Arr = up ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={c.category} onClick={() => setTab(c.category)} style={S.card(sel, cm.color)}>
                <div style={S.cardIcon(cm.color, sel)}><Icon size={22} color={cm.color} /></div>
                <p style={S.cardLabel}>{cm.label}</p>
                <p style={S.cardDesc}>{cm.desc}</p>
                <p style={S.cardNum}>
                  <span style={{ color: up ? "#f87171" : "#34d399" }}>{up ? "+" : ""}{fmt(c.total_drift)}</span>
                </p>
                <div style={{ ...S.cardPct, color: up ? "rgba(248,113,113,0.5)" : "rgba(52,211,153,0.5)" }}>
                  <Arr size={14} /> <span style={{ fontWeight: 600 }}>{fmtPct(c.drift_pct)} drift</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHART */}
        <div style={{ ...S.chartBox, ...S.section }}>
          <div style={S.chartHeader}>
            <div>
              <p style={S.chartTitle}>Monthly Spend Trend</p>
              <p style={S.chartSub}>{m.label} · 6-month analysis window</p>
            </div>
            <div style={S.tabBar}>
              {categories.map((c) => {
                const cm = CAT[c.category];
                return <button key={c.category} onClick={() => setTab(c.category)} style={S.tab(tab === c.category, cm.color)}>{cm.label}</button>;
              })}
            </div>
          </div>
          <div style={{ padding: "8px 12px 20px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trends} margin={{ top: 15, right: 15, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={m.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => MO[parseInt(v.split("-")[1]) - 1] || v} />
                <YAxis tick={{ fill: "#52525b", fontSize: 11, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v) => "$" + (v >= 1e6 ? (v/1e6).toFixed(1)+"M" : v >= 1000 ? Math.round(v/1000)+"k" : v)} />
                <Tooltip
                  contentStyle={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, fontFamily: "'DM Mono'", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: "12px 16px" }}
                  labelStyle={{ color: "#71717a", marginBottom: 6, fontSize: 11 }}
                  formatter={(v) => ["$" + Math.round(v).toLocaleString(), m.label]}
                  labelFormatter={(v) => { const p = v.split("-"); return FULL_MO[parseInt(p[1])-1] + " " + p[0]; }}
                  cursor={{ stroke: m.color, strokeWidth: 1, strokeOpacity: 0.2 }}
                />
                <Area type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2.5} fill="url(#grad)" dot={false}
                  activeDot={{ r: 6, fill: m.color, stroke: "#09090b", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP DRIFTER */}
        {top && top.drift > 0 && (
          <div style={{ ...S.drifterBox, ...S.section }}>
            <div style={S.drifterIcon}><DollarSign size={20} color="#f87171" /></div>
            <div>
              <p style={S.drifterText}><span style={S.drifterName}>{top.item}</span> is your biggest drifter in {m.label.toLowerCase()}</p>
              <p style={S.drifterSub}>Increased by <span style={S.drifterNum}>{fmt(top.drift)}/mo</span> ({fmtPct(top.drift_pct)}) vs. prior 3-month avg</p>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div style={S.tableBox}>
          <div style={S.tableHeader}>
            <div>
              <p style={S.tableTitle}>Drift Breakdown</p>
              <p style={S.tableSub}>{m.label} · Sorted by absolute impact</p>
            </div>
            <span style={S.badge}>{active.items.length} items</span>
          </div>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ ...S.th, textAlign: "left" }}>Item</th>
                <th style={{ ...S.th, textAlign: "right" }}>Before</th>
                <th style={{ ...S.th, textAlign: "right" }}>After</th>
                <th style={{ ...S.th, textAlign: "right" }}>Drift</th>
                <th style={{ ...S.th, textAlign: "right" }}>Change</th>
                <th style={{ ...S.th, textAlign: "center", width: 140 }}>Impact</th>
              </tr>
            </thead>
            <tbody>
              {active.items.map((r, i) => {
                const up = r.drift > 0;
                const ap = Math.abs(r.drift_pct || 0);
                const bg = ap > 50 ? "rgba(239,68,68,0.05)" : ap > 20 ? "rgba(239,68,68,0.025)" : "transparent";
                const mx = Math.max(...active.items.map((x) => Math.abs(x.drift)));
                const bw = mx > 0 ? (Math.abs(r.drift) / mx) * 100 : 0;
                return (
                  <tr key={i} style={{ background: bg }}>
                    <td style={{ ...S.td, textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: up ? "#ef4444" : "#10b981", flexShrink: 0 }} />
                        <span style={{ color: "#e4e4e7", fontWeight: 600, fontSize: 13 }}>{r.item}</span>
                      </div>
                    </td>
                    <td style={{ ...S.td, ...S.mono, textAlign: "right", color: "#71717a" }}>{fmt(r.avg_before)}</td>
                    <td style={{ ...S.td, ...S.mono, textAlign: "right", color: "#d4d4d8" }}>{fmt(r.avg_after)}</td>
                    <td style={{ ...S.td, ...S.mono, textAlign: "right", fontWeight: 800, color: up ? "#f87171" : "#34d399" }}>
                      {up ? "+" : "-"}{fmt(r.drift)}
                    </td>
                    <td style={{ ...S.td, ...S.mono, textAlign: "right", fontSize: 11, color: up ? "rgba(248,113,113,0.6)" : "rgba(52,211,153,0.6)" }}>
                      {fmtPct(r.drift_pct)}
                    </td>
                    <td style={S.td}>
                      <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 4, width: `${bw}%`, transition: "width 0.7s ease",
                          background: up ? `linear-gradient(90deg, ${m.color}50, #ef444480)` : `linear-gradient(90deg, ${m.color}50, #10b98180)` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...S.logo, width: 20, height: 20, borderRadius: 4 }}><TrendingUp size={10} color="#fff" /></div>
            <span style={S.footerText}>PayDrift · Spend Drift Intelligence</span>
          </div>
          <span style={S.footerText}>Data period Jan–Jun 2025</span>
        </div>
      </footer>
    </div>
  );
}

export default App;