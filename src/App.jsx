import { useState, useEffect, useRef } from "react";

// ─── Brand Tokens ─────────────────────────────────────────
const C = {
  green: "#1B6B47", greenHov: "#155538",
  teal: "#2BAE8E", tealSoft: "#E0F7EF",
  gold: "#ECAD0F", goldSoft: "#FEF9E7",
  coral: "#E8734A", coralSoft: "#FDF0EA",
  dark: "#0D2B1E", mid: "#3B5349",
  gray: "#6B7280", lightGray: "#F3F4F6",
  white: "#FFFFFF", bg: "#F5FBF8",
  border: "#C6E8D8",
};

// ─── Static Data ───────────────────────────────────────────
const SEED_SCHOOLS = [
  { id:"s1",  name:"Starehe Boys Centre",        location:"Nairobi",             votes:234 },
  { id:"s2",  name:"Mangu High School",           location:"Thika, Kiambu",       votes:203 },
  { id:"s3",  name:"Kenya High School",           location:"Nairobi",             votes:178 },
  { id:"s4",  name:"St. Mary's Nairobi",          location:"Nairobi",             votes:167 },
  { id:"s5",  name:"Pangani Girls High School",   location:"Nairobi",             votes:156 },
  { id:"s6",  name:"Thika High School",           location:"Thika, Kiambu",       votes:142 },
  { id:"s7",  name:"Nakuru High School",          location:"Nakuru County",       votes:112 },
  { id:"s8",  name:"Upper Hill School",           location:"Nairobi",             votes:91  },
  { id:"s9",  name:"Alliance High School",        location:"Kikuyu, Kiambu",      votes:89  },
  { id:"s10", name:"Kapsabet Boys High School",   location:"Nandi County",        votes:73  },
  { id:"s11", name:"Machakos School",             location:"Machakos County",     votes:67  },
  { id:"s12", name:"Kisumu Boys High School",     location:"Kisumu County",       votes:45  },
  { id:"s13", name:"Mombasa High School",         location:"Mombasa County",      votes:38  },
  { id:"s14", name:"Chania High School",          location:"Thika, Kiambu",       votes:28  },
  { id:"s15", name:"Kerugoya Girls High School",  location:"Kirinyaga County",    votes:21  },
];

const PRODUCTS = [
  { name:"Olemol Herbal Tea",      desc:"100% natural Kenyan herbs for daily wellness",    price:"KES 250", bg:C.tealSoft,  color:C.teal  },
  { name:"Olemol Immunity Boost",  desc:"Superfoods blend for strong daily immunity",      price:"KES 350", bg:"#E8F4E8",   color:C.green },
  { name:"Olemol Digestive Mix",   desc:"Traditional blend for digestive comfort",         price:"KES 290", bg:"#EDE9FE",   color:"#7C3AED" },
  { name:"Olemol Kids Wellness",   desc:"Gentle natural formula for children's health",   price:"KES 320", bg:C.coralSoft, color:C.coral },
];

const WHATSAPP_NUMBER = "254700000000"; // ← Replace with real number
const APP_URL = "https://olemol.co.ke";

// ─── Helpers ───────────────────────────────────────────────
function totalVotes(schools) { return schools.reduce((s, x) => s + x.votes, 0); }

async function safeGet(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
async function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Sub-components ────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", full, disabled, style: s = {} }) {
  const vs = {
    primary: { background: C.green,     color: C.white, border: "none" },
    outline:  { background: "transparent", color: C.green, border: `2px solid ${C.green}` },
    ghost:    { background: C.tealSoft,  color: C.green, border: "none" },
    gold:     { background: C.gold,     color: C.dark,  border: "none" },
    coral:    { background: C.coral,    color: C.white, border: "none" },
    dark:     { background: C.dark,     color: C.white, border: "none" },
    wa:       { background: "#25D366",  color: C.white, border: "none" },
    fb:       { background: "#1877F2",  color: C.white, border: "none" },
    tw:       { background: "#1DA1F2",  color: C.white, border: "none" },
    ig:       { background: "#E1306C",  color: C.white, border: "none" },
    dimmed:   { background: "rgba(255,255,255,0.12)", color: C.white, border: "1px solid rgba(255,255,255,0.2)" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      padding: "13px 22px", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 600, fontSize: 15, opacity: disabled ? 0.5 : 1,
      width: full ? "100%" : undefined, fontFamily: "inherit",
      transition: "opacity .15s", ...vs[variant], ...s,
    }}>{children}</button>
  );
}

function Tag({ children, color = C.teal }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      color, textTransform: "uppercase" }}>{children}</span>
  );
}

function Bar({ pct, color = C.teal, h = 6 }) {
  return (
    <div style={{ background: C.lightGray, borderRadius: 999, height: h, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.8s ease" }} />
    </div>
  );
}

function Nav({ active, setView }) {
  const tabs = [
    { id:"home",      icon:"⌂", label:"Home"     },
    { id:"upload",    icon:"◈", label:"Scan & Vote" },
    { id:"dashboard", icon:"▣", label:"Schools"  },
    { id:"products",  icon:"◉", label:"Products" },
  ];
  const activeTab = ["upload","scanning","scan_result","vote","recommend","share"].includes(active)
    ? "upload" : active;
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.white,
      borderTop:`1px solid ${C.border}`, display:"flex", zIndex:100,
      padding:"8px 0 env(safe-area-inset-bottom,16px)", backdropFilter:"blur(8px)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setView(t.id)} style={{
          flex:1, border:"none", background:"none", cursor:"pointer",
          display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          color: activeTab===t.id ? C.green : C.gray,
          fontSize:10, fontWeight: activeTab===t.id ? 700 : 400, fontFamily:"inherit",
          paddingBottom: 4,
        }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function PageShell({ children, view, setView, noPad }) {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Outfit',system-ui,sans-serif",
      paddingBottom:90, maxWidth:520, margin:"0 auto" }}>
      {children}
      <Nav active={view} setView={setView} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   HOME
// ═══════════════════════════════════════════════════════════
function HomeView({ schools, setView }) {
  const tv = totalVotes(schools);
  const sorted = [...schools].sort((a,b) => b.votes - a.votes);
  const top3   = sorted.slice(0,3);
  const nextMS = Math.max(Math.ceil(tv / 1000) * 1000, 1000);

  return (
    <PageShell view="home" setView={setView}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(145deg,${C.green} 0%,#0D4B30 100%)`,
        padding:"44px 20px 56px" }}>
        <div style={{ fontSize:11, letterSpacing:"0.15em", color:"rgba(255,255,255,0.65)", marginBottom:6 }}>OLEMOL · BUY TO GIVE</div>
        <h1 style={{ margin:"0 0 10px", fontSize:34, fontWeight:800, color:C.white, lineHeight:1.15 }}>
          Every Purchase<br/>Helps a School
        </h1>
        <p style={{ margin:"0 0 26px", fontSize:15, color:"rgba(255,255,255,0.8)", lineHeight:1.6 }}>
          Buy Olemol, upload your receipt, vote for a school — and share your impact with the world.
        </p>
        <Btn onClick={() => setView("upload")} variant="gold" full style={{ fontSize:16, padding:"16px 22px" }}>
          Scan Receipt &amp; Vote →
        </Btn>
      </div>

      {/* Stats pill */}
      <div style={{ margin:"-22px 16px 0", background:C.white, borderRadius:18, padding:"18px 20px",
        boxShadow:"0 6px 24px rgba(0,0,0,0.09)", display:"flex", gap:16 }}>
        {[
          { val:tv.toLocaleString(),               sub:"Total Votes",  color:C.green },
          { val:Math.floor(tv/20).toLocaleString(), sub:"Child Kits",   color:C.teal  },
          { val:schools.length,                     sub:"Schools",      color:C.coral },
        ].map(({ val, sub, color }, i) => (
          <div key={i} style={{ flex:1, textAlign:"center", borderRight: i<2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontSize:22, fontWeight:800, color }}>{val}</div>
            <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Campaign progress */}
      <div style={{ margin:"22px 16px 0", background:C.white, borderRadius:16, padding:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.dark }}>Next School Activation</span>
          <span style={{ fontSize:13, color:C.gray }}>{tv.toLocaleString()} / {nextMS.toLocaleString()}</span>
        </div>
        <Bar pct={(tv/nextMS)*100} h={10} color={`${C.teal}`} />
        <div style={{ fontSize:12, color:C.gray, marginTop:8 }}>
          {(nextMS - tv).toLocaleString()} more votes needed
        </div>
      </div>

      {/* Top 3 schools */}
      <div style={{ margin:"22px 16px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.dark }}>Top Schools</h2>
          <button onClick={() => setView("dashboard")} style={{ background:"none", border:"none",
            cursor:"pointer", color:C.teal, fontSize:13, fontFamily:"inherit" }}>See all →</button>
        </div>
        {top3.map((school, i) => (
          <div key={school.id} style={{ background:C.white, borderRadius:13, padding:"14px 16px",
            marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, fontWeight:700,
              fontSize:13, color:C.dark, display:"flex", alignItems:"center", justifyContent:"center",
              background: i===0?C.gold : i===1?"#C8C8C8" : "#CD7F32" }}>
              #{i+1}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:C.dark, fontSize:14 }}>{school.name}</div>
              <div style={{ fontSize:12, color:C.gray }}>{school.location}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontWeight:800, color:C.green, fontSize:16 }}>{school.votes.toLocaleString()}</div>
              <div style={{ fontSize:11, color:C.gray }}>votes</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ margin:"22px 16px 0", background:C.tealSoft, borderRadius:16, padding:20 }}>
        <h2 style={{ margin:"0 0 14px", fontSize:17, fontWeight:700, color:C.dark }}>How It Works</h2>
        {[
          ["01", C.teal,   "Buy Olemol",           "Any participating pack — retail or online"],
          ["02","#7C3AED", "Upload Receipt",        "QR code, USSD, or web app"],
          ["03", C.gold,   "Vote for a School",    "From our list or recommend one"],
          ["04", C.coral,  "Share Your Vote",      "Auto-post fires to social media"],
          ["05", C.green,  "School Gets Impact",   "Donation dispatched, UGC floods"],
        ].map(([num, col, title, desc]) => (
          <div key={num} style={{ display:"flex", gap:12, marginBottom:14 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:col, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:11,
              fontWeight:700, color:C.white }}>{num}</div>
            <div>
              <div style={{ fontWeight:600, color:C.dark, fontSize:14 }}>{title}</div>
              <div style={{ fontSize:12, color:C.mid, marginTop:2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Impact formula */}
      <div style={{ margin:"22px 16px 0", background:C.dark, borderRadius:16, padding:20 }}>
        <h2 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, color:C.white }}>Impact Formula</h2>
        {[
          ["1 Product = 1 Vote",                 C.teal    ],
          ["20 Votes = 1 Child Kit Donated",     C.gold    ],
          ["1,000 Votes = 1 School Activation",  C.coral   ],
          ["KES 5/unit → KES 250K at 50K units", "#A78BFA" ],
        ].map(([text, col]) => (
          <div key={text} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:col, flexShrink:0 }} />
            <span style={{ color:C.white, fontSize:13 }}>{text}</span>
          </div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <div style={{ margin:"22px 16px 0" }}>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} style={{
          display:"flex", alignItems:"center", gap:16, background:"#25D366",
          borderRadius:16, padding:20, textDecoration:"none" }}>
          <div style={{ fontSize:36 }}>💬</div>
          <div>
            <div style={{ color:C.white, fontWeight:700, fontSize:16 }}>Chat on WhatsApp</div>
            <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13 }}>Orders, enquiries &amp; support</div>
          </div>
        </a>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   UPLOAD
// ═══════════════════════════════════════════════════════════
function UploadView({ onFile, uploadPreview, hasFile, onScan, scanError, setView }) {
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const handleDrop = e => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile({ target:{ files:[f] } });
  };

  return (
    <PageShell view="upload" setView={setView}>
      {/* Header */}
      <div style={{ padding:"28px 20px 0" }}>
        <Tag color={C.teal}>Step 1 of 3</Tag>
        <h1 style={{ margin:"6px 0 4px", fontSize:26, fontWeight:800, color:C.dark }}>Upload Receipt</h1>
        <p style={{ margin:0, fontSize:14, color:C.gray }}>Our AI scans for Olemol products automatically</p>
      </div>

      <div style={{ padding:"20px 16px" }}>
        {/* Drop zone */}
        <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => !uploadPreview && fileRef.current?.click()}
          style={{ border:`2px dashed ${drag ? C.green : C.border}`, borderRadius:18,
            padding:"28px 20px", textAlign:"center",
            background: drag ? C.tealSoft : C.white, cursor: uploadPreview ? "default" : "pointer",
            transition:"all 0.2s", minHeight:200, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center" }}>
          {uploadPreview
            ? <img src={uploadPreview} alt="Receipt" style={{ maxWidth:"100%", maxHeight:280,
                borderRadius:10, objectFit:"contain" }} />
            : <>
                <div style={{ fontSize:52, marginBottom:14 }}>📄</div>
                <div style={{ fontWeight:700, color:C.dark, fontSize:17 }}>Upload Your Receipt</div>
                <div style={{ color:C.gray, fontSize:13, marginTop:6 }}>Tap to take a photo or pick from gallery</div>
                <div style={{ color:C.gray, fontSize:12, marginTop:4 }}>JPG, PNG or PDF • Max 10 MB</div>
              </>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf"
          style={{ display:"none" }} onChange={onFile} capture="environment" />

        {uploadPreview && (
          <button onClick={() => fileRef.current?.click()}
            style={{ background:"none", border:"none", cursor:"pointer", color:C.teal,
              fontSize:13, marginTop:8, fontFamily:"inherit" }}>
            ↩ Change receipt
          </button>
        )}

        {scanError && (
          <div style={{ marginTop:14, padding:"12px 16px", background:"#FEE2E2",
            borderRadius:10, color:"#DC2626", fontSize:13, lineHeight:1.5 }}>
            {scanError}
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop:20, background:C.tealSoft, borderRadius:14, padding:16 }}>
          <div style={{ fontWeight:600, color:C.dark, fontSize:14, marginBottom:10 }}>Tips for accurate scanning</div>
          {["Entire receipt must be visible","Good lighting — no shadows","Olemol label clearly readable","Photo in sharp focus"].map(t => (
            <div key={t} style={{ display:"flex", gap:8, marginBottom:7, fontSize:13, color:C.mid }}>
              <span style={{ color:C.teal, fontWeight:700 }}>✓</span>{t}
            </div>
          ))}
        </div>

        <Btn onClick={onScan} full disabled={!hasFile} style={{ marginTop:20, fontSize:16, padding:"16px" }}>
          {hasFile ? "Scan with AI →" : "Upload a receipt first"}
        </Btn>

        <div style={{ textAlign:"center", marginTop:14, color:C.gray, fontSize:13 }}>
          No smartphone? Dial <strong style={{ color:C.green }}>*483*OLE#</strong> to vote via USSD
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCANNING
// ═══════════════════════════════════════════════════════════
function ScanningView() {
  return (
    <div style={{ background:C.dark, minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:32,
      fontFamily:"'Outfit',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
      <div style={{ fontSize:64, animation:"spin 2.2s linear infinite", marginBottom:24 }}>🔍</div>
      <h2 style={{ color:C.white, fontSize:24, fontWeight:800, margin:"0 0 10px", textAlign:"center" }}>
        Scanning Receipt
      </h2>
      <p style={{ color:"rgba(255,255,255,0.55)", textAlign:"center", fontSize:15, maxWidth:280, lineHeight:1.6 }}>
        AI is identifying Olemol products and counting your votes…
      </p>
      <div style={{ marginTop:32, display:"flex", gap:10 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:C.teal,
            animation:`blink 1.3s ease-in-out ${i*0.28}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   SCAN RESULT
// ═══════════════════════════════════════════════════════════
function ScanResultView({ scanResult, setView }) {
  if (!scanResult) return null;
  const { found, products=[], total_votes=0, store, date, note } = scanResult;

  return (
    <PageShell view="upload" setView={setView}>
      <div style={{ padding:"28px 20px 0" }}>
        <button onClick={() => setView("upload")} style={{ background:"none", border:"none",
          cursor:"pointer", color:C.green, fontSize:14, fontFamily:"inherit", padding:"4px 0", marginBottom:8 }}>
          ← Back
        </button>
        <Tag color={C.teal}>Step 2 of 3</Tag>
        <h1 style={{ margin:"6px 0 4px", fontSize:26, fontWeight:800, color:C.dark }}>Scan Results</h1>
      </div>

      <div style={{ padding:"16px 16px" }}>
        {found ? (
          <>
            <div style={{ background:C.green, borderRadius:18, padding:"24px 20px",
              textAlign:"center", color:C.white, marginBottom:18 }}>
              <div style={{ fontSize:50, marginBottom:10 }}>✅</div>
              <h2 style={{ margin:"0 0 6px", fontSize:22, fontWeight:800 }}>Olemol Found!</h2>
              <p style={{ margin:0, opacity:.85, fontSize:15 }}>
                You earned <strong>{total_votes} vote{total_votes!==1?"s":""}</strong> to cast for a school
              </p>
            </div>

            {(store || date) && (
              <div style={{ background:C.white, borderRadius:12, padding:"12px 16px",
                marginBottom:12, fontSize:13, color:C.gray }}>
                {store && <><strong style={{ color:C.dark }}>🏪 {store}</strong></>}
                {date  && <>&nbsp;·&nbsp;<strong style={{ color:C.dark }}>{date}</strong></>}
              </div>
            )}

            <div style={{ background:C.white, borderRadius:16, padding:18, marginBottom:18 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.dark, marginBottom:12 }}>Products Detected</div>
              {products.map((p,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between",
                  padding:"10px 0", borderBottom: i<products.length-1?`1px solid ${C.border}`:"none" }}>
                  <div>
                    <div style={{ fontWeight:500, fontSize:14, color:C.dark }}>{p.name}</div>
                    {p.unit_price>0 && <div style={{ fontSize:12, color:C.gray }}>KES {p.unit_price}</div>}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700, color:C.green, fontSize:14 }}>×{p.quantity}</div>
                    <div style={{ fontSize:12, color:C.teal }}>{p.quantity} vote{p.quantity!==1?"s":""}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`,
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:700, color:C.dark }}>Total Votes Earned</span>
                <span style={{ fontWeight:800, color:C.green, fontSize:22 }}>{total_votes}</span>
              </div>
            </div>

            <Btn onClick={() => setView("vote")} full style={{ fontSize:16, padding:"16px" }}>
              Vote for a School →
            </Btn>
          </>
        ) : (
          <>
            <div style={{ background:"#FEF3C7", borderRadius:18, padding:"28px 20px",
              textAlign:"center", marginBottom:18 }}>
              <div style={{ fontSize:50, marginBottom:12 }}>🤔</div>
              <h2 style={{ margin:"0 0 6px", fontSize:20, fontWeight:800, color:"#92400E" }}>
                No Olemol Products Found
              </h2>
              <p style={{ margin:0, color:"#92400E", opacity:.8, fontSize:14, lineHeight:1.6 }}>
                {note || "We couldn't identify Olemol products on this receipt. Please try with a clearer image or check that the brand name is visible."}
              </p>
            </div>
            <Btn onClick={() => setView("upload")} full style={{ marginBottom:10 }}>Try Again</Btn>
            <Btn onClick={() => setView("home")} variant="ghost" full>Back to Home</Btn>
          </>
        )}
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   VOTE
// ═══════════════════════════════════════════════════════════
function VoteView({ schools, scanResult, onVote, setView }) {
  const [q, setQ] = useState("");
  const filtered = [...schools]
    .filter(s => s.name.toLowerCase().includes(q.toLowerCase()) ||
                 s.location.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b) => b.votes - a.votes);
  const maxV = filtered.length ? Math.max(...filtered.map(s => s.votes)) : 1;
  const canVote = scanResult?.found;

  return (
    <PageShell view="upload" setView={setView}>
      <div style={{ padding:"28px 20px 0" }}>
        <button onClick={() => setView("scan_result")} style={{ background:"none", border:"none",
          cursor:"pointer", color:C.green, fontSize:14, fontFamily:"inherit", marginBottom:8 }}>
          ← Back
        </button>
        <Tag color={C.teal}>Step 3 of 3</Tag>
        <h1 style={{ margin:"6px 0 4px", fontSize:26, fontWeight:800, color:C.dark }}>Vote for a School</h1>
        <p style={{ margin:"0 0 16px", fontSize:14, color:C.gray }}>
          {canVote
            ? `You have ${scanResult.total_votes} vote${scanResult.total_votes!==1?"s":""} to cast`
            : "Browse schools — scan a receipt to vote"}
        </p>
      </div>

      <div style={{ padding:"0 16px" }}>
        <input type="text" placeholder="Search by school name or county…" value={q}
          onChange={e => setQ(e.target.value)}
          style={{ width:"100%", padding:"12px 16px", borderRadius:12,
            border:`1px solid ${C.border}`, fontSize:14, background:C.white,
            boxSizing:"border-box", outline:"none", color:C.dark, fontFamily:"inherit" }} />
        <div style={{ textAlign:"right", marginTop:8 }}>
          <button onClick={() => setView("recommend")} style={{ background:"none", border:"none",
            cursor:"pointer", color:C.teal, fontSize:13, fontFamily:"inherit" }}>
            + Can't find your school? Recommend it
          </button>
        </div>
      </div>

      <div style={{ padding:"8px 16px" }}>
        {filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:40, color:C.gray }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:15 }}>No schools match "<strong>{q}</strong>"</div>
            <button onClick={() => setView("recommend")} style={{ background:"none", border:"none",
              cursor:"pointer", color:C.teal, marginTop:8, fontSize:14, fontFamily:"inherit" }}>
              Recommend this school →
            </button>
          </div>
        ) : filtered.map(school => (
          <div key={school.id} style={{ background:C.white, borderRadius:14, padding:16, marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ flex:1, paddingRight:12 }}>
                <div style={{ fontWeight:700, color:C.dark, fontSize:15 }}>{school.name}</div>
                <div style={{ fontSize:12, color:C.gray, marginTop:2 }}>📍 {school.location}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontWeight:800, color:C.green, fontSize:16 }}>{school.votes.toLocaleString()}</div>
                <div style={{ fontSize:11, color:C.gray }}>votes</div>
              </div>
            </div>
            <Bar pct={(school.votes/maxV)*100} />
            <Btn onClick={() => canVote ? onVote(school) : alert("Please scan an Olemol receipt first to earn votes!")}
              variant={canVote ? "primary" : "ghost"}
              full style={{ marginTop:12, fontSize:14, padding:"11px 16px" }}>
              {canVote
                ? `Cast ${scanResult.total_votes} vote${scanResult.total_votes!==1?"s":""} for this school`
                : "Vote for this school"}
            </Btn>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   RECOMMEND
// ═══════════════════════════════════════════════════════════
function RecommendView({ setView, onSubmit }) {
  const [form, setForm] = useState({ name:"", location:"", contact:"", reason:"" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inputStyle = {
    width:"100%", padding:"12px 16px", borderRadius:10, border:`1px solid ${C.border}`,
    fontSize:14, background:C.bg, boxSizing:"border-box", outline:"none",
    color:C.dark, fontFamily:"inherit",
  };

  return (
    <PageShell view="upload" setView={setView}>
      <div style={{ padding:"28px 20px 0" }}>
        <button onClick={() => setView("vote")} style={{ background:"none", border:"none",
          cursor:"pointer", color:C.green, fontSize:14, fontFamily:"inherit", marginBottom:8 }}>
          ← Back to schools
        </button>
        <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:800, color:C.dark }}>Recommend a School</h1>
        <p style={{ margin:0, fontSize:14, color:C.gray }}>We review &amp; add new schools every week</p>
      </div>

      <div style={{ padding:"20px 16px" }}>
        <div style={{ background:C.white, borderRadius:16, padding:20 }}>
          {[
            { k:"name",     label:"School Name",            ph:"e.g., Nairobi Primary School",    req:true  },
            { k:"location", label:"Location / County",      ph:"e.g., Nairobi County",            req:false },
            { k:"contact",  label:"Your contact (optional)",ph:"Phone or email for follow-up",    req:false },
            { k:"reason",   label:"Why this school?",       ph:"Tell us about the school's need…",req:false, ta:true },
          ].map(({ k, label, ph, req, ta }) => (
            <div key={k} style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>
                {label}{req && <span style={{ color:C.coral }}> *</span>}
              </label>
              {ta
                ? <textarea value={form[k]} onChange={set(k)} placeholder={ph} rows={3}
                    style={{ ...inputStyle, resize:"vertical" }} />
                : <input type="text" value={form[k]} onChange={set(k)} placeholder={ph}
                    style={inputStyle} />
              }
            </div>
          ))}

          <div style={{ background:C.tealSoft, borderRadius:10, padding:13, fontSize:13,
            color:C.mid, marginBottom:18, lineHeight:1.6 }}>
            Schools added to the platform become eligible for donation events and supply drives.
            Our team will review your submission within 7 days.
          </div>

          <Btn onClick={() => form.name ? onSubmit(form) : undefined}
            full disabled={!form.name} style={{ fontSize:15 }}>
            Submit Recommendation
          </Btn>
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   SHARE
// ═══════════════════════════════════════════════════════════
function ShareView({ voteData, setView }) {
  const [copied, setCopied] = useState(false);
  const { school, votesAdded, products=[] } = voteData || {};

  const shareText = `I just bought Olemol products and voted for ${school?.name} to receive school supplies! Every purchase = 1 vote for a school in Kenya. Join me 🌱 #OlemolCares #EducationForAll`;
  const shareUrl  = APP_URL;
  const full      = encodeURIComponent(`${shareText}\n\n${shareUrl}`);

  const openLink = url => window.open(url, "_blank");
  const copyIG = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ background:C.dark, minHeight:"100vh", fontFamily:"'Outfit',system-ui,sans-serif",
      paddingBottom:90, maxWidth:520, margin:"0 auto" }}>
      <style>{`
        @keyframes confetti { from{transform:translateY(110vh) rotate(0deg);opacity:1} to{transform:translateY(-10vh) rotate(480deg);opacity:0} }
        @keyframes bounceIn { 0%{transform:scale(.25);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes fadeUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* Confetti burst */}
      {[C.gold, C.teal, C.coral, "#A78BFA", "#fff"].flatMap((col, ci) =>
        [0,1,2,3,4].map(j => (
          <div key={`${ci}-${j}`} style={{ position:"fixed",
            bottom:"-10%", left:`${8+ci*18+j*2}%`,
            width:9, height:9, borderRadius:j%2===0?2:"50%",
            background:col, pointerEvents:"none",
            animation:`confetti ${1.4+j*.25}s ease-out ${j*.08}s forwards` }} />
        ))
      )}

      <div style={{ padding:"56px 24px 28px", textAlign:"center" }}>
        <div style={{ fontSize:74, animation:"bounceIn .7s ease-out", display:"block" }}>🎉</div>
        <div style={{ animation:"fadeUp .5s ease-out .3s both" }}>
          <Tag color={C.teal}>Vote Cast Successfully</Tag>
          <h1 style={{ color:C.white, fontSize:30, fontWeight:800, margin:"10px 0 8px", lineHeight:1.2 }}>
            You just made<br/>a difference!
          </h1>

          {voteData && (
            <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:16, padding:"18px 20px",
              margin:"20px 0", textAlign:"left" }}>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13, marginBottom:4 }}>Voted for</div>
              <div style={{ color:C.white, fontWeight:800, fontSize:19 }}>{school?.name}</div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:13 }}>📍 {school?.location}</div>
              <div style={{ marginTop:12, color:C.gold, fontWeight:700, fontSize:15 }}>
                +{votesAdded} vote{votesAdded!==1?"s":""} added to their total
              </div>
              {products.length>0 && (
                <div style={{ marginTop:6, color:"rgba(255,255,255,0.6)", fontSize:13 }}>
                  {products.map(p=>`${p.name} ×${p.quantity}`).join(" · ")}
                </div>
              )}
            </div>
          )}

          <p style={{ color:"rgba(255,255,255,0.65)", fontSize:15, lineHeight:1.7, margin:"0 0 24px" }}>
            Share your vote and inspire others to buy Olemol &amp; support schools!
          </p>
        </div>
      </div>

      {/* Share buttons */}
      <div style={{ padding:"0 20px", animation:"fadeUp .5s ease-out .5s both" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <Btn variant="fb" onClick={() => openLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`)}>
            Facebook
          </Btn>
          <Btn variant="tw" onClick={() => openLink(`https://twitter.com/intent/tweet?text=${full}`)}>
            Twitter / X
          </Btn>
          <Btn variant="wa" onClick={() => openLink(`https://wa.me/?text=${full}`)}>
            WhatsApp
          </Btn>
          <Btn variant="ig" onClick={copyIG}>
            {copied ? "Copied! ✓" : "Copy for IG"}
          </Btn>
        </div>

        <button onClick={() => setView("dashboard")} style={{
          width:"100%", padding:16, borderRadius:12, border:"1px solid rgba(255,255,255,0.2)",
          background:"transparent", color:C.white, fontWeight:600, fontSize:15,
          cursor:"pointer", fontFamily:"inherit" }}>
          View School Leaderboard →
        </button>
        <button onClick={() => setView("upload")} style={{
          width:"100%", padding:14, borderRadius:12, border:"none",
          background:"transparent", color:"rgba(255,255,255,0.45)", fontWeight:500, fontSize:14,
          cursor:"pointer", fontFamily:"inherit", marginTop:8 }}>
          Scan another receipt
        </button>
      </div>

      <Nav active="upload" setView={setView} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//   DASHBOARD
// ═══════════════════════════════════════════════════════════
function DashboardView({ schools, setView }) {
  const tv = totalVotes(schools);
  const sorted = [...schools].sort((a,b) => b.votes - a.votes);
  const maxV   = sorted[0]?.votes || 1;
  const nextMS = Math.max(Math.ceil(tv/1000)*1000, 1000);

  const milestones = [
    { votes:20,   label:"1 Child Kit",        done: tv>=20   },
    { votes:100,  label:"Supply Bundle",       done: tv>=100  },
    { votes:500,  label:"Classroom Kit",       done: tv>=500  },
    { votes:1000, label:"School Activation",   done: tv>=1000 },
  ];

  return (
    <PageShell view="dashboard" setView={setView}>
      <div style={{ padding:"28px 20px 0" }}>
        <Tag color={C.teal}>Live Leaderboard</Tag>
        <h1 style={{ margin:"6px 0 4px", fontSize:26, fontWeight:800, color:C.dark }}>School Rankings</h1>
        <p style={{ margin:0, fontSize:14, color:C.gray }}>Updated in real-time as votes come in</p>
      </div>

      <div style={{ padding:"16px 16px 0" }}>
        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
          {[
            { val:tv.toLocaleString(),                sub:"Total Votes", color:C.green },
            { val:Math.floor(tv/20).toLocaleString(), sub:"Child Kits",  color:C.teal  },
            { val:schools.length,                     sub:"Schools",     color:C.coral },
          ].map(({ val, sub, color }) => (
            <div key={sub} style={{ background:C.white, borderRadius:12, padding:"14px 10px", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:800, color }}>{val}</div>
              <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Campaign progress */}
        <div style={{ background:C.white, borderRadius:16, padding:18, marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontWeight:600, fontSize:13, color:C.dark }}>Campaign Progress</span>
            <span style={{ fontSize:13, color:C.gray }}>{tv.toLocaleString()} / {nextMS.toLocaleString()}</span>
          </div>
          <Bar pct={(tv/nextMS)*100} h={10} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            <span style={{ fontSize:12, color:C.gray }}>Target: School Activation</span>
            <span style={{ fontSize:12, color:C.teal, fontWeight:600 }}>{(nextMS-tv).toLocaleString()} to go</span>
          </div>
        </div>

        {/* Milestones */}
        <div style={{ background:C.dark, borderRadius:16, padding:20, marginBottom:18 }}>
          <div style={{ fontWeight:700, fontSize:15, color:C.white, marginBottom:14 }}>Donation Milestones</div>
          {milestones.map(m => (
            <div key={m.votes} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
                background: m.done ? C.teal : "rgba(255,255,255,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, color:C.white, fontWeight:700 }}>
                {m.done ? "✓" : "○"}
              </div>
              <div style={{ flex:1, color:C.white, fontSize:13 }}>
                <strong>{m.votes.toLocaleString()} votes</strong> → {m.label}
              </div>
              {m.done && <span style={{ color:C.teal, fontSize:12, fontWeight:600 }}>Done!</span>}
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <h2 style={{ margin:"0 0 12px", fontSize:18, fontWeight:700, color:C.dark }}>All Schools</h2>
        {sorted.map((school, i) => (
          <div key={school.id} style={{ background:C.white, borderRadius:14, padding:"14px 16px", marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0,
                background: i===0?C.gold : i===1?"#C8C8C8" : i===2?"#CD7F32" : C.lightGray,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800, color: i<3?C.dark:C.gray }}>
                #{i+1}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.dark }}>{school.name}</div>
                <div style={{ fontSize:12, color:C.gray }}>{school.location}</div>
              </div>
              <div style={{ fontWeight:800, color:C.green, fontSize:16 }}>{school.votes.toLocaleString()}</div>
            </div>
            <Bar pct={(school.votes/maxV)*100} color={ i<3 ? C.teal : C.border } />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   PRODUCTS
// ═══════════════════════════════════════════════════════════
function ProductsView({ setView }) {
  return (
    <PageShell view="products" setView={setView}>
      <div style={{ padding:"28px 20px 0" }}>
        <Tag color={C.teal}>Olemol Products</Tag>
        <h1 style={{ margin:"6px 0 4px", fontSize:26, fontWeight:800, color:C.dark }}>Our Products</h1>
        <p style={{ margin:0, fontSize:14, color:C.gray }}>Every purchase = 1 vote for a Kenyan school</p>
      </div>

      <div style={{ padding:"16px 16px" }}>
        {PRODUCTS.map(p => (
          <div key={p.name} style={{ background:p.bg, borderRadius:16, padding:20, marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1, paddingRight:12 }}>
                <div style={{ fontWeight:800, fontSize:17, color:C.dark }}>{p.name}</div>
                <div style={{ fontSize:14, color:C.mid, marginTop:5, lineHeight:1.5 }}>{p.desc}</div>
              </div>
              <div style={{ fontWeight:800, color:p.color, fontSize:15, flexShrink:0 }}>{p.price}</div>
            </div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'd like to order ${p.name} (${p.price}). Please assist.`)}`}
              style={{ display:"block", marginTop:14, padding:"10px 16px", background:"#25D366",
                color:C.white, borderRadius:10, textDecoration:"none", textAlign:"center",
                fontWeight:600, fontSize:13 }}>
              Order on WhatsApp
            </a>
          </div>
        ))}

        {/* About */}
        <div style={{ background:C.white, borderRadius:16, padding:20, marginBottom:14 }}>
          <h2 style={{ margin:"0 0 12px", fontSize:18, fontWeight:700, color:C.dark }}>About Olemol</h2>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.7, margin:"0 0 10px" }}>
            Olemol is a Kenyan herbal products brand rooted in natural wellness and community impact.
            Each product we create uses locally sourced ingredients and supports local farmers.
          </p>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.7, margin:0 }}>
            Our Buy-to-Give campaign turns everyday wellness purchases into school donations —
            building a healthier, more educated Kenya.
          </p>
        </div>

        {/* Contact */}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} style={{
          display:"flex", alignItems:"center", gap:16, background:"#25D366",
          borderRadius:14, padding:18, textDecoration:"none", marginBottom:14 }}>
          <div style={{ fontSize:36 }}>💬</div>
          <div>
            <div style={{ color:C.white, fontWeight:700, fontSize:16 }}>Chat on WhatsApp</div>
            <div style={{ color:"rgba(255,255,255,0.85)", fontSize:13 }}>Orders, enquiries &amp; support</div>
          </div>
        </a>

        {/* Social links */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { label:"Facebook", url:"https://facebook.com/olemol", bg:"#1877F2" },
            { label:"Instagram", url:"https://instagram.com/olemol", bg:"#E1306C" },
          ].map(({ label, url, bg }) => (
            <a key={label} href={url} style={{
              display:"flex", alignItems:"center", justifyContent:"center", padding:"14px",
              background:bg, borderRadius:12, textDecoration:"none",
              color:C.white, fontWeight:600, fontSize:14 }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════
//   MAIN APP
// ═══════════════════════════════════════════════════════════
export default function OlemolImpact() {
  const [view,       setView]       = useState("home");
  const [schools,    setSchools]    = useState(SEED_SCHOOLS);
  const [uploadFile, setUploadFile] = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanError,  setScanError]  = useState(null);
  const [voteData,   setVoteData]   = useState(null);

  // ── Load Google Fonts & persistent data
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    loadSchools();
  }, []);

  async function loadSchools() {
    const saved = await safeGet("olemol:schools");
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setSchools(saved);
    } else {
      await safeSet("olemol:schools", SEED_SCHOOLS);
    }
  }

  // ── File upload
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setScanError(null);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  // ── AI receipt scan
  async function scanReceipt() {
    if (!uploadFile) return;
    setView("scanning");
    setScanError(null);

    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload  = e => res(e.target.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(uploadFile);
      });

      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type:"image", source:{ type:"base64", media_type: uploadFile.type||"image/jpeg", data:base64 } },
              { type:"text",  text:`You are an AI receipt scanner for Olemol, a Kenyan herbal products brand.
Carefully examine this receipt image and identify any Olemol products purchased.

Olemol products include herbal teas, immunity boosters, digestive remedies, and kids wellness products sold under the "Olemol" or "OLEMOL" brand name.

Respond ONLY with valid JSON — no markdown, no extra text:
{
  "found": boolean,
  "products": [{"name":"exact product name","quantity":number,"unit_price":number}],
  "total_votes": number,
  "store": "store name or null",
  "date": "date string or null",
  "note": "optional message if not a receipt or unclear"
}

Rules:
- found = true only if at least one Olemol product appears on the receipt
- Each unit purchased counts as 1 vote; total_votes = sum of all Olemol quantities
- If no Olemol products found, return found:false, products:[], total_votes:0
- If the image is not a receipt, set found:false and explain in "note"` }
            ]
          }]
        })
      });

      const data = await resp.json();
      const raw  = (data.content || []).map(c => c.text||"").join("");
      const json = raw.replace(/```json|```/g,"").trim();
      setScanResult(JSON.parse(json));
      setView("scan_result");
    } catch (err) {
      console.error(err);
      setScanError("Could not scan receipt. Please check your connection and try again with a clearer image.");
      setView("upload");
    }
  }

  // ── Cast vote
  async function castVote(school) {
    const n = scanResult?.total_votes || 1;
    const updated = schools.map(s =>
      s.id===school.id ? { ...s, votes: s.votes+n } : s
    );
    setSchools(updated);
    await safeSet("olemol:schools", updated);
    setVoteData({ school, votesAdded: n, products: scanResult?.products || [] });
    setView("share");
  }

  // ── Recommend school
  async function submitRec(form) {
    const recs = (await safeGet("olemol:recs")) || [];
    recs.push({ ...form, id:`rec_${Date.now()}`, ts: new Date().toISOString() });
    await safeSet("olemol:recs", recs);
    alert("Thank you! Your recommendation has been submitted. Our team will review it within 7 days.");
    setView("vote");
  }

  // ── Router
  if (view==="home")       return <HomeView       schools={schools} setView={setView} />;
  if (view==="upload")     return <UploadView      onFile={handleFile} uploadPreview={preview}
                                    hasFile={!!uploadFile} onScan={scanReceipt}
                                    scanError={scanError} setView={setView} />;
  if (view==="scanning")   return <ScanningView    />;
  if (view==="scan_result")return <ScanResultView  scanResult={scanResult} setView={setView} />;
  if (view==="vote")       return <VoteView        schools={schools} scanResult={scanResult}
                                    onVote={castVote} setView={setView} />;
  if (view==="recommend")  return <RecommendView   setView={setView} onSubmit={submitRec} />;
  if (view==="share")      return <ShareView       voteData={voteData} setView={setView} />;
  if (view==="dashboard")  return <DashboardView   schools={schools} setView={setView} />;
  if (view==="products")   return <ProductsView    setView={setView} />;
  return null;
}
