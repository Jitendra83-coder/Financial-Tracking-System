import { useState, useMemo } from "react";

const fmt = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");
const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(0) : 0);

const CATS = {
  income: ["Salary", "Freelance", "Investment", "Bonus", "Other Income"],
  expense: ["Groceries", "Utilities", "Transport", "Dining", "Healthcare", "Entertainment", "Other"],
  loan: ["Home Loan", "Car Loan", "Personal Loan", "Credit Card"],
  saving: ["Fixed Deposit", "Mutual Fund", "Gold", "Emergency Fund"],
};

const TYPE_META = {
  income:  { color: "#1D9E75", light: "#E1F5EE", label: "Income",   icon: "📈" },
  expense: { color: "#D85A30", light: "#FAECE7", label: "Expense",  icon: "📉" },
  loan:    { color: "#BA7517", light: "#FAEEDA", label: "Loan",     icon: "🏦" },
  saving:  { color: "#185FA5", light: "#E6F1FB", label: "Saving",   icon: "💰" },
};

const SEED = [
  { id: 1, date: "2026-05-01", type: "income",  category: "Salary",     amount: 85000, desc: "Monthly salary" },
  { id: 2, date: "2026-05-03", type: "expense", category: "Groceries",  amount: 4200,  desc: "Weekly groceries" },
  { id: 3, date: "2026-05-05", type: "saving",  category: "Mutual Fund",amount: 10000, desc: "SIP installment" },
  { id: 4, date: "2026-05-07", type: "expense", category: "Utilities",  amount: 1800,  desc: "Electricity bill" },
  { id: 5, date: "2026-05-10", type: "income",  category: "Freelance",  amount: 22000, desc: "Web project" },
  { id: 6, date: "2026-05-12", type: "loan",    category: "Home Loan",  amount: 15000, desc: "EMI" },
  { id: 7, date: "2026-05-14", type: "expense", category: "Dining",     amount: 2500,  desc: "Family dinner" },
  { id: 8, date: "2026-05-15", type: "saving",  category: "Gold",       amount: 5000,  desc: "Gold bond" },
];

const ASSETS = [
  { name: "Real Estate", units: 1,  pct: 45, value: 4200000 },
  { name: "Mutual Funds",units: 12, pct: 28, value: 185000  },
  { name: "Gold",        units: 5,  pct: 15, value: 42000   },
  { name: "Fixed Deposit",units:3,  pct: 8,  value: 125000  },
  { name: "Stocks",      units: 8,  pct: 4,  value: 38000   },
];

const NAV = [
  { id:"dashboard", icon:"🏠", label:"Home" },
  { id:"transactions",icon:"💳",label:"Spending" },
  { id:"assets", icon:"📊", label:"Portfolio" },
  { id:"analysis", icon:"📉", label:"Analysis" },
  { id:"settings", icon:"⚙️", label:"Settings" },
];

/* ── Gauge SVG ── */
function Gauge({ pct: p }) {
  const r = 70, cx = 90, cy = 90;
  const arc = (pct, color) => {
    const a = Math.PI * pct - Math.PI;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`;
  };
  const angle = Math.PI * (p / 100) - Math.PI;
  const nx = cx + r * Math.cos(angle), ny = cy + r * Math.sin(angle);
  return (
    <svg viewBox="0 0 180 100" style={{ width: "100%", maxWidth: 180 }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#f0f0f0" strokeWidth="14" strokeLinecap="round"/>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(-Math.PI * 0.33)} ${cy + r * Math.sin(-Math.PI * 0.33)}`} fill="none" stroke="#FAEEDA" strokeWidth="14"/>
      <path d={`M ${cx + r * Math.cos(-Math.PI * 0.33)} ${cy + r * Math.sin(-Math.PI * 0.33)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(-Math.PI * 0.66)} ${cy + r * Math.sin(-Math.PI * 0.66)}`} fill="none" stroke="#F0997B" strokeWidth="14"/>
      <path d={`M ${cx + r * Math.cos(-Math.PI * 0.66)} ${cy + r * Math.sin(-Math.PI * 0.66)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#D85A30" strokeWidth="14"/>
      <path d={arc(p / 100, "#1D9E75")} fill="none" stroke="#1D9E75" strokeWidth="14" strokeLinecap="round"/>
      <circle cx={nx} cy={ny} r="8" fill="#1D9E75" />
    </svg>
  );
}

/* ── Mini Bar Chart ── */
function MiniBar({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex:1, borderRadius:3,
          background: i === data.length - 1 ? color : color + "55",
          height: `${(v / max) * 100}%`,
          minHeight: 4,
          transition:"height 0.4s"
        }}/>
      ))}
    </div>
  );
}

/* ── Donut Chart ── */
function Donut({ slices }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  let angle = -90;
  const paths = slices.map(s => {
    const sweep = (s.value / total) * 360;
    const a1 = (angle * Math.PI) / 180;
    const a2 = ((angle + sweep) * Math.PI) / 180;
    const x1 = 50 + 38 * Math.cos(a1), y1 = 50 + 38 * Math.sin(a1);
    const x2 = 50 + 38 * Math.cos(a2), y2 = 50 + 38 * Math.sin(a2);
    const lg = sweep > 180 ? 1 : 0;
    const d = `M 50 50 L ${x1} ${y1} A 38 38 0 ${lg} 1 ${x2} ${y2} Z`;
    angle += sweep;
    return { ...s, d };
  });
  return (
    <svg viewBox="0 0 100 100" style={{ width:120, height:120 }}>
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth="1.5"/>)}
      <circle cx="50" cy="50" r="22" fill="#fff"/>
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [txns, setTxns] = useState(SEED);
  const [form, setForm] = useState({ type:"expense", category:"Groceries", amount:"", desc:"", date: new Date().toISOString().split("T")[0] });
  const [activeRhythm, setActiveRhythm] = useState("income");
  const [filter, setFilter] = useState("all");
  const [sideOpen, setSideOpen] = useState(false);

  const stats = useMemo(() => {
    const g = (t) => txns.filter(x => x.type === t).reduce((s, x) => s + x.amount, 0);
    const income = g("income"), expense = g("expense"), loan = g("loan"), saving = g("saving");
    return { income, expense, loan, saving, balance: income - expense - loan };
  }, [txns]);

  const addTxn = () => {
    if (!form.amount || !form.desc) return;
    setTxns([{ id: Date.now(), ...form, amount: parseFloat(form.amount) }, ...txns]);
    setForm({ ...form, amount:"", desc:"" });
  };

  const del = (id) => setTxns(txns.filter(t => t.id !== id));

  const filtered = filter === "all" ? txns : txns.filter(t => t.type === filter);
  const savePct = pct(stats.saving, stats.income);
  const healthPct = Math.min(100, parseInt(savePct));

  const byCategory = useMemo(() => {
    const m = {};
    txns.forEach(t => { m[t.category] = (m[t.category] || 0) + t.amount; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [txns]);

  const monthlyIncome = [62000, 71000, 55000, 80000, 107000, stats.income];
  const monthlyExpense = [8200, 9100, 7500, 11000, 9800, stats.expense];

  // ── Styles ──
  const S = {
    root: { fontFamily:"'DM Sans', sans-serif", background:"#F7F6F2", minHeight:"100vh", display:"flex", position:"relative" },
    sidebar: {
      width: sideOpen ? 220 : 70,
      background:"#fff",
      borderRight:"1px solid #EDECE8",
      display:"flex", flexDirection:"column",
      padding:"24px 0",
      transition:"width 0.25s",
      overflow:"hidden",
      position:"sticky", top:0, height:"100vh",
      zIndex:10,
    },
    logo: { padding:"0 20px 28px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" },
    logoIcon: { width:32, height:32, borderRadius:8, background:"#1D9E75", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 },
    logoText: { fontWeight:700, fontSize:16, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden" },
    navItem: (active) => ({
      display:"flex", alignItems:"center", gap:12,
      padding:"10px 20px", margin:"2px 8px",
      borderRadius:10, cursor:"pointer",
      background: active ? "#E1F5EE" : "transparent",
      color: active ? "#1D9E75" : "#6b7280",
      fontWeight: active ? 600 : 400,
      fontSize:14, whiteSpace:"nowrap",
      transition:"all 0.15s",
    }),
    navIcon: { fontSize:18, flexShrink:0 },
    main: { flex:1, padding:"28px 32px", maxWidth:900, overflow:"auto" },
    greeting: { fontSize:22, fontWeight:700, color:"#1a1a1a", marginBottom:4 },
    sub: { fontSize:14, color:"#9ca3af", marginBottom:24 },
    grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 },
    grid3: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:16 },
    card: { background:"#fff", borderRadius:16, padding:20, border:"1px solid #EDECE8" },
    cardSm: { background:"#fff", borderRadius:14, padding:16, border:"1px solid #EDECE8" },
    label: { fontSize:12, color:"#9ca3af", marginBottom:4 },
    bigNum: { fontSize:28, fontWeight:700, color:"#1a1a1a" },
    midNum: { fontSize:20, fontWeight:700, color:"#1a1a1a" },
    badge: (bg, c) => ({ background:bg, color:c, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:20, display:"inline-block" }),
    chip: (active) => ({
      padding:"5px 14px", borderRadius:20, fontSize:13,
      background: active ? "#1D9E75" : "#F7F6F2",
      color: active ? "#fff" : "#6b7280",
      border:"none", cursor:"pointer", fontWeight: active ? 600 : 400,
    }),
    input: { width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #EDECE8", fontSize:14, outline:"none", background:"#FAFAFA", boxSizing:"border-box" },
    select: { width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #EDECE8", fontSize:14, outline:"none", background:"#FAFAFA", boxSizing:"border-box" },
    btn: (bg, c) => ({ padding:"11px 22px", borderRadius:10, background:bg, color:c, border:"none", fontWeight:600, fontSize:14, cursor:"pointer" }),
    txnRow: { display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid #F3F2EE" },
    txnIcon: (color) => ({ width:40, height:40, borderRadius:12, background:color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }),
    right: { marginLeft:"auto", textAlign:"right" },
    bar: (pct, color) => ({ height:6, borderRadius:3, background:"#F0EEE8", overflow:"hidden", position:"relative" }),
    barFill: (pct, color) => ({ height:"100%", width:`${pct}%`, background:color, borderRadius:3 }),
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Pages ──
  const Dashboard = () => (
    <div>
      <div style={S.greeting}>{greeting}, Sulis 👋</div>
      <div style={S.sub}>Here's your financial overview for May 2026</div>

      {/* Total Earning */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={S.label}>Total earning</div>
        <div style={{ ...S.bigNum, marginBottom:2 }}>{fmt(stats.income)}</div>
        <span style={S.badge("#E1F5EE","#0F6E56")}>↑ {pct(stats.income - 62000, 62000)}% from last month</span>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginTop:20 }}>
          {[
            { label:"Income", val:stats.income, sub:"Growth rate", grow:"+20%", c:"#1D9E75" },
            { label:"Expense", val:stats.expense, sub:"Spending growth", grow:"+5%", c:"#D85A30" },
            { label:"Saving", val:stats.saving, sub:"Potential saving", grow:"+21%", c:"#185FA5" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize:12, color:"#9ca3af", marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a", marginBottom:2 }}>{fmt(m.val)}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>{m.sub} <span style={{ color:m.c }}>{m.grow}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16, marginBottom:16 }}>
        {/* Monthly Rhythm */}
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:15, color:"#1a1a1a" }}>Monthly financial rhythm</div>
            <div style={{ display:"flex", gap:6 }}>
              {["income","expense","saving"].map(t => (
                <button key={t} onClick={() => setActiveRhythm(t)} style={S.chip(activeRhythm===t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize:26, fontWeight:700, color:"#1a1a1a", marginBottom:4 }}>
            {fmt(activeRhythm==="income"?stats.income:activeRhythm==="expense"?stats.expense:stats.saving)}
          </div>
          <div style={{ fontSize:13, color:"#9ca3af", marginBottom:16 }}>
            {activeRhythm==="income"?"Total earned":activeRhythm==="expense"?"Total spent":"Total saved"}
          </div>
          <MiniBar
            data={activeRhythm==="income"?monthlyIncome:activeRhythm==="expense"?monthlyExpense:[4000,6000,5500,8000,9000,stats.saving]}
            color={TYPE_META[activeRhythm].color}
          />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            {["Dec","Jan","Feb","Mar","Apr","May"].map(m => (
              <div key={m} style={{ fontSize:11, color:"#c0bdb6" }}>{m}</div>
            ))}
          </div>
        </div>

        {/* Financial Health */}
        <div style={S.card}>
          <div style={{ fontWeight:600, fontSize:15, color:"#1a1a1a", marginBottom:8 }}>Financial health</div>
          <span style={S.badge("#E1F5EE","#0F6E56")}>On track</span>
          <div style={{ fontSize:22, fontWeight:700, color:"#1a1a1a", margin:"12px 0 2px" }}>{fmt(stats.saving)}</div>
          <div style={{ fontSize:12, color:"#1D9E75", marginBottom:8 }}>+{pct(stats.saving - 8000, 8000)}% from last month</div>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ position:"relative", textAlign:"center" }}>
              <Gauge pct={healthPct} />
              <div style={{ position:"absolute", bottom:4, left:0, right:0, fontSize:18, fontWeight:700, color:"#1D9E75" }}>{savePct}%</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>of monthly income saved</div>
            </div>
          </div>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:8 }}>Based on your last 30-day transaction data</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16 }}>
        {/* Asset Distribution */}
        <div style={S.card}>
          <div style={{ fontWeight:600, fontSize:15, color:"#1a1a1a", marginBottom:16 }}>Asset distribution</div>
          <table style={{ width:"100%", fontSize:13, borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ color:"#9ca3af" }}>
                <td style={{ paddingBottom:8 }}>Asset</td>
                <td style={{ paddingBottom:8 }}>Units</td>
                <td style={{ paddingBottom:8, width:100 }}>Allocation</td>
                <td style={{ paddingBottom:8, textAlign:"right" }}>Value</td>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map(a => (
                <tr key={a.name}>
                  <td style={{ padding:"8px 0", fontWeight:500, color:"#1a1a1a" }}>{a.name}</td>
                  <td style={{ color:"#6b7280" }}>{a.units}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={S.bar(a.pct,"#E0EFE8")}>
                        <div style={{ ...S.barFill(a.pct,"#1D9E75"), width:`${a.pct}%` }}/>
                      </div>
                      <span style={{ fontSize:11, color:"#6b7280", whiteSpace:"nowrap" }}>{a.pct}%</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:"#F0EEE8", marginTop:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${a.pct}%`, background:"#1D9E75", borderRadius:3 }}/>
                    </div>
                  </td>
                  <td style={{ textAlign:"right", fontWeight:600, color:"#1a1a1a" }}>₹{a.value.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Insight + Recent Txns */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ ...S.card, background:"#1a1a2e", border:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:50, background:"#1D9E75", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✨</div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"#fff" }}>Weekly AI Insight</div>
                <div style={{ fontSize:11, color:"#6b7280" }}>Generated from your finances</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:12 }}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>Money alert</div>
                <div style={{ fontSize:13, color:"#fff", fontWeight:500 }}>Spending up {pct(stats.expense - 9800, 9800)}% this week</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:12 }}>
                <div style={{ fontSize:11, color:"#6b7280", marginBottom:4 }}>Advice</div>
                <div style={{ fontSize:13, color:"#fff", fontWeight:500 }}>Save {fmt(stats.income * 0.3)} this month</div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontWeight:600, fontSize:14, color:"#1a1a1a", marginBottom:12 }}>Recent transactions</div>
            {txns.slice(0, 3).map(t => (
              <div key={t.id} style={S.txnRow}>
                <div style={S.txnIcon(TYPE_META[t.type].color)}>{TYPE_META[t.type].icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:"#1a1a1a" }}>{t.category}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{t.date}</div>
                </div>
                <div style={{ ...S.right, fontSize:14, fontWeight:600, color: t.type==="income"?"#1D9E75":"#D85A30" }}>
                  {t.type==="income"?"+":"-"}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Transactions = () => (
    <div>
      <div style={S.greeting}>Spending</div>
      <div style={S.sub}>Track and manage all your transactions</div>

      {/* Add Form */}
      <div style={{ ...S.card, marginBottom:20 }}>
        <div style={{ fontWeight:600, fontSize:15, color:"#1a1a1a", marginBottom:14 }}>Add Transaction</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          <select style={S.select} value={form.type} onChange={e => setForm({ ...form, type:e.target.value, category:CATS[e.target.value][0] })}>
            {Object.keys(CATS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <select style={S.select} value={form.category} onChange={e => setForm({ ...form, category:e.target.value })}>
            {(CATS[form.type]||[]).map(c => <option key={c}>{c}</option>)}
          </select>
          <input style={S.input} type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm({ ...form, amount:e.target.value })}/>
          <input style={S.input} type="date" value={form.date} onChange={e => setForm({ ...form, date:e.target.value })}/>
          <input style={{ ...S.input, gridColumn:"1/-1" }} placeholder="Description" value={form.desc} onChange={e => setForm({ ...form, desc:e.target.value })}/>
        </div>
        <button style={{ ...S.btn("#1D9E75","#fff"), marginTop:12 }} onClick={addTxn}>+ Add Transaction</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["all","income","expense","loan","saving"].map(f => (
          <button key={f} style={S.chip(filter===f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div style={S.card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>No transactions found</div>
        ) : filtered.map(t => (
          <div key={t.id} style={S.txnRow}>
            <div style={S.txnIcon(TYPE_META[t.type].color)}>{TYPE_META[t.type].icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:"#1a1a1a" }}>{t.category}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>{t.desc} · {t.date}</div>
            </div>
            <div style={{ fontSize:15, fontWeight:700, color: t.type==="income"?"#1D9E75":"#D85A30", marginRight:10 }}>
              {t.type==="income"?"+":"-"}{fmt(t.amount)}
            </div>
            <button onClick={() => del(t.id)} style={{ background:"#FAECE7", border:"none", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#D85A30", fontSize:13 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );

  const Portfolio = () => (
    <div>
      <div style={S.greeting}>Portfolio</div>
      <div style={S.sub}>Your complete asset overview</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div style={S.card}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:16, color:"#1a1a1a" }}>Asset Allocation</div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
            <Donut slices={[
              { label:"Real Estate", value:45, color:"#1D9E75" },
              { label:"Mutual Funds", value:28, color:"#185FA5" },
              { label:"Gold", value:15, color:"#BA7517" },
              { label:"FD", value:8, color:"#D85A30" },
              { label:"Stocks", value:4, color:"#8b5cf6" },
            ]}/>
          </div>
          {[
            { l:"Real Estate", v:45, c:"#1D9E75" },
            { l:"Mutual Funds", v:28, c:"#185FA5" },
            { l:"Gold", v:15, c:"#BA7517" },
            { l:"FD", v:8, c:"#D85A30" },
            { l:"Stocks", v:4, c:"#8b5cf6" },
          ].map(s => (
            <div key={s.l} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:s.c, flexShrink:0 }}/>
              <div style={{ fontSize:13, color:"#6b7280", flex:1 }}>{s.l}</div>
              <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{s.v}%</div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:16, color:"#1a1a1a" }}>Holdings</div>
          {ASSETS.map(a => (
            <div key={a.name} style={{ padding:"10px 0", borderBottom:"1px solid #F3F2EE" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ fontSize:14, fontWeight:500, color:"#1a1a1a" }}>{a.name}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a" }}>₹{a.value.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ height:5, borderRadius:3, background:"#F0EEE8", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${a.pct}%`, background:"#1D9E75", borderRadius:3 }}/>
              </div>
              <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>{a.pct}% of portfolio · {a.units} units</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Analysis = () => (
    <div>
      <div style={S.greeting}>Financial Analysis</div>
      <div style={S.sub}>Detailed insights into your finances</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
        {Object.entries(TYPE_META).map(([k, m]) => (
          <div key={k} style={{ ...S.cardSm, borderTop:`3px solid ${m.color}` }}>
            <div style={{ fontSize:12, color:"#9ca3af", marginBottom:4 }}>{m.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:m.color }}>{fmt(stats[k])}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16 }}>
        <div style={S.card}>
          <div style={{ fontWeight:600, fontSize:15, color:"#1a1a1a", marginBottom:14 }}>Top Categories</div>
          {byCategory.map(([cat, val], i) => (
            <div key={cat} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ fontSize:13, color:"#1a1a1a" }}>{i+1}. {cat}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{fmt(val)}</div>
              </div>
              <div style={{ height:5, borderRadius:3, background:"#F0EEE8", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct(val, byCategory[0][1])}%`, background:"#1D9E75", borderRadius:3 }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ ...S.card, background:"#E1F5EE", border:"none" }}>
            <div style={{ fontSize:12, color:"#0F6E56" }}>Savings Rate</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#1D9E75" }}>{savePct}%</div>
            <div style={{ fontSize:12, color:"#0F6E56" }}>of total income</div>
          </div>
          <div style={{ ...S.card, background:"#FAECE7", border:"none" }}>
            <div style={{ fontSize:12, color:"#993C1D" }}>Expense Rate</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#D85A30" }}>{pct(stats.expense, stats.income)}%</div>
            <div style={{ fontSize:12, color:"#993C1D" }}>of total income</div>
          </div>
          <div style={S.card}>
            <div style={{ fontSize:12, color:"#9ca3af" }}>Net Balance</div>
            <div style={{ fontSize:24, fontWeight:700, color: stats.balance > 0 ? "#1D9E75" : "#D85A30" }}>{fmt(stats.balance)}</div>
            <div style={{ fontSize:12, color:"#9ca3af" }}>income − expense − loans</div>
          </div>
        </div>
      </div>
    </div>
  );

  const Settings = () => (
    <div>
      <div style={S.greeting}>Settings</div>
      <div style={S.sub}>Manage your account preferences</div>
      <div style={S.card}>
        {[
          { icon:"👤", label:"Profile", sub:"Edit your personal info" },
          { icon:"🔔", label:"Notifications", sub:"Manage alerts & reminders" },
          { icon:"🔒", label:"Security", sub:"Password & 2FA" },
          { icon:"💱", label:"Currency", sub:"INR (₹) · Nepal" },
          { icon:"📊", label:"Export Data", sub:"Download CSV or PDF" },
          { icon:"🌙", label:"Appearance", sub:"Light / Dark mode" },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom: i < arr.length-1 ? "1px solid #F3F2EE" : "none", cursor:"pointer" }}>
            <div style={{ width:40, height:40, borderRadius:12, background:"#F7F6F2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{s.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:"#1a1a1a" }}>{s.label}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>{s.sub}</div>
            </div>
            <div style={{ color:"#9ca3af", fontSize:18 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );

  const pages = { dashboard: <Dashboard/>, transactions: <Transactions/>, assets: <Portfolio/>, analysis: <Analysis/>, settings: <Settings/> };

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.logo} onClick={() => setSideOpen(!sideOpen)}>
          <div style={S.logoIcon}>F</div>
          {sideOpen && <div style={S.logoText}>FinanceNP</div>}
        </div>
        {NAV.map(n => (
          <div key={n.id} style={S.navItem(page===n.id)} onClick={() => setPage(n.id)}>
            <span style={S.navIcon}>{n.icon}</span>
            {sideOpen && <span>{n.label}</span>}
          </div>
        ))}
        <div style={{ marginTop:"auto", padding:"0 8px" }}>
          {sideOpen ? (
            <div style={{ background:"linear-gradient(135deg,#1D9E75,#185FA5)", borderRadius:14, padding:16, color:"#fff" }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>Upgrade to Pro</div>
              <div style={{ fontSize:11, opacity:0.8, marginBottom:10 }}>Unlock AI insights & unlimited history</div>
              <button style={{ ...S.btn("#fff","#1D9E75"), width:"100%", fontSize:12 }}>Upgrade now</button>
            </div>
          ) : (
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div style={{ width:36, height:36, borderRadius:50, background:"linear-gradient(135deg,#1D9E75,#185FA5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, cursor:"pointer" }}>★</div>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        {pages[page]}
      </div>

      {/* Bottom Nav (mobile feel) */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"#fff", borderTop:"1px solid #EDECE8",
        display:"flex", justifyContent:"space-around",
        padding:"10px 0 14px",
        zIndex:20,
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background:"none", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            color: page===n.id ? "#1D9E75" : "#9ca3af",
          }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, fontWeight: page===n.id ? 600 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
