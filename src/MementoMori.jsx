"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const MODES = [
  { key: "seconds", label: "SECONDS" },
  { key: "minutes", label: "MINUTES" },
  { key: "hours",   label: "HOURS"   },
  { key: "nights",  label: "NIGHTS"  },
  { key: "weeks",   label: "WEEKS"   },
];

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTH_FULL = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const LIFE_EXPECTANCY_YEARS = 77;

function daysIn(monthIdx, year) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

function getElapsed(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  return { seconds: s, minutes: s/60, hours: s/3600, nights: s/86400, weeks: s/604800 };
}

function getRemaining(ts) {
  const deathTs = ts + LIFE_EXPECTANCY_YEARS * 365.25 * 86400 * 1000;
  const s = Math.max(0, (deathTs - Date.now()) / 1000);
  return { seconds: s, minutes: s/60, hours: s/3600, nights: s/86400, weeks: s/604800 };
}

function fmtVal(v, mode) {
  const n = Math.floor(v);
  if (mode === "weeks")  return String(n).padStart(6,  "0");
  if (mode === "nights") return String(n).padStart(6,  "0");
  if (mode === "hours")  return String(n).padStart(9,  "0");
  return String(n).padStart(12, "0");
}

function useRaf(cb, active) {
  const r = useRef(null), c = useRef(cb);
  c.current = cb;
  useEffect(() => {
    if (!active) { cancelAnimationFrame(r.current); return; }
    const loop = () => { c.current(); r.current = requestAnimationFrame(loop); };
    r.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(r.current);
  }, [active]);
}

function Digit({ ch }) {
  const [anim, setAnim] = useState(false);
  const p = useRef(ch);
  useEffect(() => {
    if (p.current === ch) return;
    p.current = ch;
    setAnim(true);
    const t = setTimeout(() => setAnim(false), 120);
    return () => clearTimeout(t);
  }, [ch]);
  return (
    <span style={{
      display: "inline-block", width: "0.6em", textAlign: "center",
      transition: "opacity 0.1s, transform 0.1s",
      opacity: anim ? 0.15 : 1,
      transform: anim ? "translateY(-4px) scaleY(0.8)" : "translateY(0) scaleY(1)",
    }}>{ch}</span>
  );
}

function AnimDigits({ value, mode }) {
  const str = fmtVal(value, mode);
  const chunks = [];
  for (let i = 0; i < str.length; i += 3) chunks.push(str.slice(i, i+3));
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.06em" }}>
      {chunks.map((chunk, ci) => (
        <span key={ci} style={{ display: "inline-flex" }}>
          {chunk.split("").map((ch, di) => <Digit key={ci*3+di} ch={ch} />)}
          {ci < chunks.length - 1 && (
            <span style={{ opacity: 0.25, margin: "0 0.04em", fontSize: "0.45em", alignSelf: "center" }}>·</span>
          )}
        </span>
      ))}
    </span>
  );
}

const ITEM_H = 52;

function DrumWheel({ values, selected, onChange, fmt, width = 88 }) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const snapTimer = useRef(null);

  const idx = values.indexOf(selected);

  const scrollTo = useCallback((i, smooth = true) => {
    if (!ref.current) return;
    ref.current.scrollTo({ top: i * ITEM_H, behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => { scrollTo(idx, false); }, []);

  const commitScroll = useCallback(() => {
    if (!ref.current) return;
    const i = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(i, values.length - 1));
    onChange(values[clamped]);
    scrollTo(clamped, true);
  }, [values, onChange, scrollTo]);

  const onScroll = useCallback(() => {
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(commitScroll, 100);
  }, [commitScroll]);

  const startDrag = useCallback((clientY) => {
    isDragging.current = true;
    startY.current = clientY;
    startScroll.current = ref.current?.scrollTop ?? 0;
    lastY.current = clientY;
    lastT.current = performance.now();
    velocity.current = 0;
    if (ref.current) ref.current.style.scrollBehavior = "auto";
  }, []);

  const moveDrag = useCallback((clientY) => {
    if (!isDragging.current || !ref.current) return;
    ref.current.scrollTop = startScroll.current + (startY.current - clientY);
    const now = performance.now();
    const dt = now - lastT.current;
    if (dt > 0) velocity.current = (lastY.current - clientY) / dt;
    lastY.current = clientY;
    lastT.current = now;
  }, []);

  const endDrag = useCallback(() => {
    if (!isDragging.current || !ref.current) return;
    isDragging.current = false;
    if (ref.current) ref.current.style.scrollBehavior = "";
    ref.current.scrollTop += velocity.current * 150;
    setTimeout(commitScroll, 80);
  }, [commitScroll]);

  useEffect(() => {
    const move = (e) => moveDrag(e.clientY);
    const up   = ()  => endDrag();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [moveDrag, endDrag]);

  return (
    <div
      style={{ position: "relative", height: ITEM_H * 5, width, overflow: "hidden", cursor: "ns-resize", flexShrink: 0 }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientY); }}
      onTouchStart={(e) => startDrag(e.touches[0].clientY)}
      onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
      onTouchEnd={endDrag}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"38%", zIndex:2, pointerEvents:"none",
        background:"linear-gradient(to bottom, #0c0c0c 0%, transparent 100%)" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"38%", zIndex:2, pointerEvents:"none",
        background:"linear-gradient(to top, #0c0c0c 0%, transparent 100%)" }} />
      <div style={{ position:"absolute", top:"50%", left:8, right:8, height:ITEM_H,
        transform:"translateY(-50%)", zIndex:1, pointerEvents:"none",
        borderTop:"1px solid rgba(220,200,175,0.35)", borderBottom:"1px solid rgba(220,200,175,0.35)" }} />
      <div ref={ref} onScroll={onScroll}
        style={{ height:"100%", overflowY:"scroll", overscrollBehavior:"none",
          scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        <div style={{ height: ITEM_H * 2 }} />
        {values.map((v, i) => {
          const dist = Math.abs(i - idx);
          return (
            <div key={v} onClick={() => { onChange(v); scrollTo(i); }}
              style={{
                height: ITEM_H, display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Courier New', monospace", fontWeight:"bold",
                fontSize: dist === 0 ? "1.1rem" : dist === 1 ? "0.88rem" : "0.72rem",
                color: dist === 0 ? "#f0e8d8" : dist === 1 ? "rgba(220,200,175,0.5)" : "rgba(220,200,175,0.18)",
                letterSpacing: dist === 0 ? "0.14em" : "0.06em",
                transition: "all 0.12s ease",
                cursor: "pointer", userSelect: "none",
              }}
            >{fmt ? fmt(v) : v}</div>
          );
        })}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

const now = new Date();
const YEARS_ARR = Array.from({ length: 105 }, (_, i) => now.getFullYear() - i);

export default function MementoMori() {
  const [phase, setPhase] = useState("input");
  const [monthIdx, setMonthIdx] = useState(11);
  const [day, setDay] = useState(22);
  const [year, setYear] = useState(2002);
  const [mode, setMode] = useState("seconds");
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [birthTs, setBirthTs] = useState(null);
  const [exiting, setExiting] = useState(false);
  const [particles, setParticles] = useState([]);

  const maxDay = daysIn(monthIdx, year);
  const dayArr = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [monthIdx, year, maxDay]);

  useRaf(() => {
    if (!birthTs) return;
    setElapsed(getElapsed(birthTs)[mode]);
    setRemaining(getRemaining(birthTs)[mode]);
  }, phase === "reveal");

  useEffect(() => {
    if (phase !== "reveal") return;
    setParticles(Array.from({ length: 22 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.6,
      speedY: Math.random() * 0.01 + 0.003,
      driftX: (Math.random() - 0.5) * 0.005,
      opacity: Math.random() * 0.18 + 0.06,
    })));
  }, [phase]);

  useRaf(() => {
    setParticles(p => p.map(pt => ({
      ...pt,
      y: (pt.y - pt.speedY + 100) % 100,
      x: (pt.x + pt.driftX + 100) % 100,
    })));
  }, phase === "reveal");

  const handleReveal = () => {
    const ts = new Date(year, monthIdx, day).getTime();
    if (ts >= Date.now()) return;
    setBirthTs(ts);
    setExiting(true);
    setTimeout(() => { setPhase("reveal"); setExiting(false); }, 500);
  };

  const reset = () => {
    setExiting(true);
    setTimeout(() => { setPhase("input"); setBirthTs(null); setExiting(false); }, 400);
  };

  const curMode = MODES.find(m => m.key === mode);

  return (
    <div style={s.root}>
      <style>{css}</style>
      <BgCanvas />
      <div style={s.vignette} />
      <div style={s.grain} />
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

      {phase === "input" && (
        <div style={s.scene} className={exiting ? "scene-exit" : "scene-enter"}>

          <div style={s.glyphRow}>
            <span className="breathe" style={{ fontSize:"1rem", color:"#c8b898", animationDelay:"0s" }}>✦</span>
            <span className="breathe" style={{ fontSize:"2rem", color:"#d4c0a0", animationDelay:"1.5s" }}>☽</span>
            <span className="breathe" style={{ fontSize:"1rem", color:"#c8b898", animationDelay:"3s" }}>✦</span>
          </div>

          <div style={s.titleWrap}>
            <div style={s.titleRow}>
              <div style={s.titleLine} />
              <h1 style={s.title}>MEMENTO MORI</h1>
              <div style={s.titleLine} />
            </div>
            <p style={s.titleSub}>remember · you · will · die</p>
          </div>

          <p style={s.question}>when were you summoned into existence?</p>

          <div style={s.wheelOuter}>
            <div style={s.wheelLabels}>
              <span style={{ width: 96, textAlign:"center" }}>MONTH</span>
              <span style={{ width: 76, textAlign:"center" }}>DAY</span>
              <span style={{ width: 88, textAlign:"center" }}>YEAR</span>
            </div>
            <div style={s.wheelRow}>
              <DrumWheel values={Array.from({length:12},(_,i)=>i)} selected={monthIdx} onChange={setMonthIdx} fmt={v=>MONTHS[v]} width={96} />
              <div style={s.wheelSep} />
              <DrumWheel values={dayArr} selected={day} onChange={setDay} fmt={v=>String(v).padStart(2,"0")} width={76} />
              <div style={s.wheelSep} />
              <DrumWheel values={YEARS_ARR} selected={year} onChange={setYear} fmt={v=>String(v)} width={88} />
            </div>
          </div>

          <button onClick={handleReveal} className="face-btn" style={s.faceBtn}>
            FACE YOUR TIME
          </button>
        </div>
      )}

      {phase === "reveal" && (
        <div style={s.scene} className={exiting ? "scene-exit" : "scene-enter"}>
          {particles.map(p => (
            <div key={p.id} style={{
              position:"fixed", left:`${p.x}%`, top:`${p.y}%`,
              width:p.size, height:p.size, borderRadius:"50%",
              background:"#c8b898", opacity:p.opacity,
              pointerEvents:"none", zIndex:1,
            }} />
          ))}

          <p style={s.epigraph}>
            "It is not that we have a short time to live,<br/>
            but that we waste a great deal of it." — Seneca
          </p>

          <span style={s.dateDisplay}>
            {MONTH_FULL[monthIdx]} {String(day).padStart(2,"0")}, {year}
          </span>

          <div style={s.block}>
            <p style={s.blockEyebrow}>YOU HAVE SURVIVED</p>
            <div style={s.counterWrap}>
              <AnimDigits value={elapsed} mode={mode} />
            </div>
            <p style={s.blockUnit}>{curMode.label}</p>
          </div>

          <div style={s.divider}>
            <div style={s.divLine} />
            <span style={s.divText}>& YET</span>
            <div style={s.divLine} />
          </div>

          <div style={{ ...s.block, ...s.blockFaded }}>
            <p style={{ ...s.blockEyebrow, color:"#b0a080" }}>
              YOU HAVE LEFT ABOUT
            </p>
            <div style={{ ...s.counterWrap, color:"#c8b480" }}>
              <AnimDigits value={remaining} mode={mode} />
            </div>
            <p style={{ ...s.blockUnit, color:"#a89870" }}>{curMode.label} REMAINING</p>
            <p style={s.blockNote}>or you could die tomorrow — you never know</p>
          </div>

          <div style={s.modeRow}>
            {MODES.map(m => (
              <button key={m.key} onClick={() => setMode(m.key)} className="mode-btn"
                style={{ ...s.modeBtn, ...(mode === m.key ? s.modeBtnOn : {}) }}>
                {m.label}
              </button>
            ))}
          </div>

          <button onClick={reset} style={s.back} className="back-btn">← begin again</button>

          <p style={s.quote}>
            "The hour which you give to another is taken from your life."
          </p>
        </div>
      )}

      <div style={s.footer}>✦ MEMENTO MORI ✦ TEMPUS FUGIT ✦ CARPE DIEM ✦ <br /> 
        <span style={s.quote}>made by <Link href="https://artt-folio.vercel.app/" target="_blank" rel="noopener noreferrer">
          
          <span className="face-btn ">pemba sherpa</span></Link> 
            ←
          </span>
      </div>
    </div>
  );
}

function Corner({ pos }) {
  const base = { position:"fixed", width:24, height:24, borderColor:"rgba(220,200,175,0.3)", zIndex:6, pointerEvents:"none" };
  const map = {
    tl: { top:20, left:20, borderTop:"1px solid", borderLeft:"1px solid" },
    tr: { top:20, right:20, borderTop:"1px solid", borderRight:"1px solid" },
    bl: { bottom:20, left:20, borderBottom:"1px solid", borderLeft:"1px solid" },
    br: { bottom:20, right:20, borderBottom:"1px solid", borderRight:"1px solid" },
  };
  return <div style={{ ...base, ...map[pos] }} />;
}

function BgCanvas() {
  useEffect(() => {
    const canvas = document.getElementById("mm-bg");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const lines = Array.from({ length: 10 }, (_, i) => ({
      x: (i / 9) * 1.1 - 0.05, phase: Math.random() * Math.PI * 2,
      amp: 0.03 + Math.random() * 0.05,
    }));
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      lines.forEach(l => {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 3) {
          const x = l.x * w + Math.sin(y * 0.006 + t + l.phase) * l.amp * w;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(180,160,130,0.03)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      t += 0.004;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas id="mm-bg" style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />;
}

const s = {
  root: {
    height: "100vh",
    overflow: "hidden",
    background: "#0c0c0c",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    position: "relative",
    fontFamily: "'Courier New', monospace",
    color: "#d8ccb8",
  },
  vignette: {
    position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
    background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.88) 100%)",
  },
  grain: {
    position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.4,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
  },
  scene: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem",
    zIndex: 5, textAlign: "center", padding: "1rem 1.5rem",
    maxWidth: 620, width: "100%",
  },
  glyphRow: { display: "flex", gap: "1.4rem", alignItems: "center" },
  titleWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" },
  titleRow: { display: "flex", alignItems: "center", gap: "1.2rem", width: "100%" },
  titleLine: { flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(220,200,160,0.4), transparent)" },
  title: {
    fontSize: "clamp(2rem, 6.5vw, 4rem)", fontWeight: "bold",
    letterSpacing: "0.32em", color: "#f0e8d5", margin: 0,
    textShadow: "0 0 60px rgba(220,200,160,0.15), 0 2px 4px rgba(0,0,0,0.8)",
  },
  titleSub: {
    fontSize: "0.72rem", letterSpacing: "0.38em", color: "#b8aa88", margin: 0,
  },
  question: {
    fontSize: "0.85rem", letterSpacing: "0.12em", color: "#c4b490", fontStyle: "italic",
  },
  wheelOuter: {
    position: "relative", background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(220,200,160,0.2)", padding: "1rem 1.2rem 0.8rem",
  },
  wheelLabels: {
    display: "flex", gap: 0, justifyContent: "space-between",
    fontSize: "0.6rem", letterSpacing: "0.25em", color: "#a89870",
    marginBottom: "0.4rem", paddingLeft: 2,
  },
  wheelRow: { display: "flex", alignItems: "center" },
  wheelSep: {
    width: 1, height: ITEM_H * 3,
    background: "linear-gradient(to bottom, transparent, rgba(220,200,160,0.2), transparent)",
    margin: "0 0.15rem",
  },
  faceBtn: {
    background: "transparent",
    border: "1px solid rgba(220,200,160,0.45)",
    color: "#c8b898",
    fontFamily: "'Courier New', monospace",
    fontSize: "0.78rem", letterSpacing: "0.3em",
    padding: "0.9rem 2.8rem",
    cursor: "pointer", transition: "all 0.25s",
    marginTop: "0.4rem",
  },
  epigraph: {
    fontSize: "0.68rem", fontStyle: "italic", lineHeight: 1.7,
    color: "#8a7e68", letterSpacing: "0.04em", maxWidth: 380,
  },
  dateDisplay: {
    fontSize: "0.8rem", letterSpacing: "0.28em", color: "#b0a080",
  },
  block: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.55rem",
    padding: "1.6rem 2rem",
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(220,200,160,0.15)",
    width: "100%",
  },
  blockFaded: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(220,200,160,0.08)",
  },
  blockEyebrow: {
    fontSize: "0.68rem", letterSpacing: "0.32em", color: "#c4b490", margin: 0,
  },
  counterWrap: {
    fontSize: "clamp(1.6rem, 5vw, 3rem)", fontWeight: "bold",
    letterSpacing: "0.04em", color: "#e8d8c0",
    textShadow: "0 0 40px rgba(230,210,170,0.2)",
    fontVariantNumeric: "tabular-nums",
  },
  blockUnit: {
    fontSize: "0.65rem", letterSpacing: "0.45em", color: "#a89870", margin: 0,
  },
  blockNote: {
    fontSize: "0.72rem", fontStyle: "italic", letterSpacing: "0.06em",
    color: "#a08870", marginTop: "0.2rem",
  },
  divider: {
    display: "flex", alignItems: "center", gap: "1rem",
    width: "75%", margin: "-0.5rem 0",
  },
  divLine: { flex: 1, height: 1, background: "rgba(220,200,160,0.15)" },
  divText: { fontSize: "0.65rem", letterSpacing: "0.28em", color: "#a89870" },
  modeRow: { display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "center" },
  modeBtn: {
    background: "transparent",
    border: "1px solid rgba(220,200,175,0.18)",
    color: "#a89870",
    fontFamily: "'Courier New', monospace",
    fontSize: "0.65rem", letterSpacing: "0.2em",
    padding: "0.5rem 1.1rem",
    cursor: "pointer", transition: "all 0.18s",
  },
  modeBtnOn: {
    border: "1px solid rgba(220,200,175,0.6)",
    borderColor: "rgba(220,200,160,0.6)",
    color: "#d8c8a8",
    background: "rgba(220,200,160,0.07)",
    textShadow: "0 0 12px rgba(220,200,160,0.3)",
  },
  back: {
    background: "transparent", border: "none",
    color: "#9a8e78",
    fontFamily: "'Courier New', monospace",
    fontSize: "0.7rem", letterSpacing: "0.15em",
    cursor: "pointer", transition: "color 0.2s", padding: "0.3rem",
  },
  quote: {
    fontSize: "0.72rem", fontStyle: "italic",
    color: "#8a7e68", letterSpacing: "0.05em",
    maxWidth: 360, lineHeight: 2,
    alignItems: "center", display: "flex", gap: "0.3rem", justifyContent: "center",
  },
  footer: {
    position: "relative",
    fontSize: "0.55rem", letterSpacing: "0.38em",
    color: "#7a6e58", zIndex: 6,
    marginTop: "1rem",
    paddingBottom: "1.5rem",
  },
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { background: #0c0c0c; min-height: 100vh; }

  @keyframes enter {
    from { opacity:0; transform:translateY(22px); filter:blur(8px); }
    to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
  }
  @keyframes exit {
    from { opacity:1; transform:translateY(0);     filter:blur(0);   }
    to   { opacity:0; transform:translateY(-22px); filter:blur(8px); }
  }
  @keyframes breathe {
    0%,100% { opacity:0.55; transform:scale(1); }
    50%     { opacity:0.85; transform:scale(1.08); }
  }

  .scene-enter { animation: enter 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
  .scene-exit  { animation: exit  0.45s cubic-bezier(0.7,0,1,1) forwards; pointer-events:none; }
  .breathe     { animation: breathe 6s ease-in-out infinite; }

  .face-btn:hover {
    border-color: rgba(220,200,160,0.8) !important;
    color: #f0e0c0 !important;
    background: rgba(220,200,160,0.05) !important;
    text-shadow: 0 0 20px rgba(220,200,160,0.3);
  }
  .mode-btn:hover {
    border-color: rgba(220,200,160,0.4) !important;
    color: #c8b888 !important;
  }
  .back-btn:hover { color: #c4b490 !important; }

  div[style*="overflowY"]::-webkit-scrollbar,
  div[style*="overflow-y"]::-webkit-scrollbar { display: none; }

  ::selection { background: rgba(220,200,160,0.18); color: #f0e8d5; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #0c0c0c; }
  ::-webkit-scrollbar-thumb { background: rgba(220,200,160,0.15); }
`;