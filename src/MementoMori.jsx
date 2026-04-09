"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const MODES = [
  { key: "seconds", label: "SECONDS", sub: "YOU HAVE CONSUMED" },
  { key: "minutes", label: "MINUTES", sub: "YOU HAVE CONSUMED" },
  { key: "hours",   label: "HOURS",   sub: "YOU HAVE CONSUMED" },
  { key: "nights",  label: "NIGHTS",  sub: "YOU HAVE SURVIVED" },
];

const MONTHS = [
  "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"
];

function getElapsed(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  return { seconds: s, minutes: s / 60, hours: s / 3600, nights: s / 86400 };
}

function useRaf(callback, active) {
  const cbRef = useRef(callback);
  const rafRef = useRef(null);
  cbRef.current = callback;
  useEffect(() => {
    if (!active) { cancelAnimationFrame(rafRef.current); return; }
    const loop = () => { cbRef.current(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}

function AnimatedDigits({ value, digits = 12 }) {
  const str = String(Math.floor(value)).padStart(digits, "0");
  return (
    <span style={{ display: "inline-flex", gap: "0.05em" }}>
      {str.split("").map((ch, i) => (
        <Digit key={i} value={ch} index={i} total={str.length} />
      ))}
    </span>
  );
}

function Digit({ value, index, total }) {
  const [displayed, setDisplayed] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayed(value);
      setAnimating(false);
    }, 80);
    return () => clearTimeout(t);
  }, [value]);

  const isSep = (total === 12 && (index === 3 || index === 6 || index === 9));

  return (
    <>
      <span
        style={{
          display: "inline-block",
          width: "0.62em",
          textAlign: "center",
          transition: "opacity 0.06s, transform 0.06s",
          opacity: animating ? 0.3 : 1,
          transform: animating ? "translateY(-3px)" : "translateY(0)",
          color: animating ? "rgba(180,160,140,0.5)" : undefined,
        }}
      >
        {displayed}
      </span>
      {isSep && (
        <span style={{ opacity: 0.2, width: "0.25em", textAlign: "center" }}>·</span>
      )}
    </>
  );
}

function DateWheel({ label, values, selected, onChange }) {
  const listRef = useRef(null);
  const itemH = 44;

  useEffect(() => {
    const idx = values.indexOf(selected);
    if (listRef.current) {
      listRef.current.scrollTo({ top: idx * itemH, behavior: "smooth" });
    }
  }, [selected, values]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const idx = Math.round(listRef.current.scrollTop / itemH);
    const clamped = Math.max(0, Math.min(idx, values.length - 1));
    if (values[clamped] !== selected) onChange(values[clamped]);
  }, [values, selected, onChange]);

  return (
    <div style={dw.wrap}>
      <div style={dw.label}>{label}</div>
      <div style={dw.drum}>
        <div style={dw.fadeTop} />
        <div style={dw.fadeBot} />
        <div style={dw.selector} />
        <div
          ref={listRef}
          onScroll={handleScroll}
          style={dw.list}
        >
          <div style={{ height: itemH * 2 }} />
          {values.map((v) => (
            <div
              key={v}
              onClick={() => onChange(v)}
              style={{
                ...dw.item,
                color: selected === v ? "#e8ddd0" : "rgba(200,185,165,0.25)",
                fontSize: selected === v ? "1.05rem" : "0.85rem",
                letterSpacing: selected === v ? "0.12em" : "0.06em",
                cursor: "pointer",
              }}
            >
              {typeof v === "number" ? String(v).padStart(2, "0") : v}
            </div>
          ))}
          <div style={{ height: itemH * 2 }} />
        </div>
      </div>
    </div>
  );
}

const dw = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" },
  label: { fontSize: "0.5rem", letterSpacing: "0.3em", color: "rgba(200,185,165,0.25)", textTransform: "uppercase" },
  drum: { position: "relative", height: 220, width: 90, overflow: "hidden" },
  fadeTop: {
    position: "absolute", top: 0, left: 0, right: 0, height: "38%", zIndex: 2,
    background: "linear-gradient(to bottom, #080808 0%, transparent 100%)", pointerEvents: "none",
  },
  fadeBot: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", zIndex: 2,
    background: "linear-gradient(to top, #080808 0%, transparent 100%)", pointerEvents: "none",
  },
  selector: {
    position: "absolute", top: "50%", left: "8px", right: "8px", height: 44,
    transform: "translateY(-50%)", zIndex: 1,
    borderTop: "1px solid rgba(200,185,165,0.18)",
    borderBottom: "1px solid rgba(200,185,165,0.18)",
    pointerEvents: "none",
  },
  list: {
    height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory",
    scrollbarWidth: "none", msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  },
  item: {
    height: 44, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Courier New', monospace", fontWeight: "bold",
    scrollSnapAlign: "center", transition: "all 0.15s ease", userSelect: "none",
  },
};

const now = new Date();
const YEARS = Array.from({ length: 100 }, (_, i) => now.getFullYear() - i);
const DAYS_FOR = (m, y) => new Date(y, MONTHS.indexOf(m) + 1, 0).getDate();

export default function MementoMori() {
  const [phase, setPhase] = useState("input");
  const [month, setMonth] = useState("JANUARY");
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(1995);
  const [mode, setMode] = useState("seconds");
  const [value, setValue] = useState(0);
  const [birthTs, setBirthTs] = useState(null);
  const [entered, setEntered] = useState(false);
  const [particles, setParticles] = useState([]);

  const maxDay = DAYS_FOR(month, year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [month, year, maxDay]);

  useRaf(() => {
    if (birthTs) {
      const e = getElapsed(birthTs);
      setValue(e[mode]);
    }
  }, phase === "reveal");

  useEffect(() => {
    if (phase !== "reveal") return;
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.015 + 0.005,
      opacity: Math.random() * 0.15 + 0.03,
      drift: (Math.random() - 0.5) * 0.008,
    }));
    setParticles(pts);
  }, [phase]);

  const particleRef = useRef([]);
  particleRef.current = particles;

  useRaf(() => {
    setParticles(prev =>
      prev.map(p => ({
        ...p,
        y: (p.y - p.speed + 100) % 100,
        x: (p.x + p.drift + 100) % 100,
      }))
    );
  }, phase === "reveal" && particles.length > 0);

  const handleReveal = () => {
    const monthIdx = MONTHS.indexOf(month);
    const ts = new Date(year, monthIdx, day).getTime();
    if (ts >= Date.now()) return;
    setBirthTs(ts);
    setEntered(true);
    setTimeout(() => { setPhase("reveal"); setEntered(false); }, 600);
  };

  const handleModeChange = (k) => {
    if (k === mode) return;
    setMode(k);
    if (birthTs) setValue(getElapsed(birthTs)[k]);
  };

  const digitCount = mode === "nights" ? 6 : 12;
  const currentMode = MODES.find(m => m.key === mode);

  return (
    <div style={s.root}>
      <style>{css}</style>

      <canvas id="bg-canvas" style={s.canvas} />
      <BgCanvas />

      <div style={s.vignette} />
      <div style={s.grain} />

      <div style={{ ...s.cornerTL, ...s.corner }} />
      <div style={{ ...s.cornerTR, ...s.corner }} />
      <div style={{ ...s.cornerBL, ...s.corner }} />
      <div style={{ ...s.cornerBR, ...s.corner }} />

      {phase === "input" && (
        <div style={s.scene} className={entered ? "exit-up" : "enter-down"}>
          <div style={s.skull}>☽</div>

          <div style={s.titleBlock}>
            <h1 style={s.title}>MEMENTO<br />MORI</h1>
            <p style={s.titleSub}>remember · you · will · die</p>
          </div>

          <p style={s.question}>when were you born?</p>

          <div style={s.wheelRow}>
            <DateWheel
              label="month"
              values={MONTHS}
              selected={month}
              onChange={setMonth}
            />
            <div style={s.wheelDivider} />
            <DateWheel
              label="day"
              values={days}
              selected={day}
              onChange={setDay}
            />
            <div style={s.wheelDivider} />
            <DateWheel
              label="year"
              values={YEARS}
              selected={year}
              onChange={setYear}
            />
          </div>

          <button onClick={handleReveal} style={s.revealBtn} className="reveal-btn">
            <span style={s.revealBtnInner}>FACE YOUR TIME</span>
            <div style={s.revealBtnLine} />
          </button>

          <p style={s.epigraph}>
            "Do not act as if you had ten thousand years to live."
          </p>
        </div>
      )}

      {phase === "reveal" && (
        <div style={s.scene} className="enter-down">
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: "fixed",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: "rgba(200,185,165,0.6)",
                opacity: p.opacity,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          ))}

          <div style={s.revealTop}>
            <span style={s.revealSub}>{currentMode.sub}</span>
          </div>

          <div style={s.counterBlock}>
            <div style={s.counterInner}>
              <AnimatedDigits value={value} digits={digitCount} />
            </div>
            <div style={s.counterLabel}>{currentMode.label}</div>
          </div>

          <div style={s.modeRow}>
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => handleModeChange(m.key)}
                style={{
                  ...s.modeBtn,
                  ...(mode === m.key ? s.modeBtnActive : {}),
                }}
                className="mode-btn"
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={s.dividerLine} />

          <p style={s.quoteReveal}>
            "The hour which you give to another is taken from your life."
          </p>

          <button
            onClick={() => { setPhase("input"); setBirthTs(null); }}
            style={s.back}
            className="back-btn"
          >
            ← begin again
          </button>
        </div>
      )}

      <div style={s.footer}>✦ MEMENTO MORI ✦</div>
    </div>
  );
}

function BgCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const lines = Array.from({ length: 8 }, (_, i) => ({
      x: (i / 7) * 1.2 - 0.1,
      speed: 0.00015 + Math.random() * 0.0001,
      phase: Math.random() * Math.PI * 2,
      amp: 0.04 + Math.random() * 0.06,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      lines.forEach(line => {
        ctx.beginPath();
        for (let y = 0; y <= h; y += 4) {
          const xBase = line.x * w;
          const wave = Math.sin(y * 0.008 + t * 2 + line.phase) * line.amp * w;
          const x = xBase + wave;
          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(180,160,140,0.025)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      t += 0.003;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return null;
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#080808",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Courier New', Courier, monospace",
    color: "#c8bfb0",
    userSelect: "none",
  },
  canvas: {
    position: "fixed", inset: 0, width: "100%", height: "100%",
    pointerEvents: "none", zIndex: 0,
  },
  vignette: {
    position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
    background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
  },
  grain: {
    position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.55,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
  },
  corner: {
    position: "fixed", width: 20, height: 20, zIndex: 3, pointerEvents: "none",
    borderColor: "rgba(200,185,165,0.15)",
  },
  cornerTL: { top: 20, left: 20, borderTop: "1px solid", borderLeft: "1px solid" },
  cornerTR: { top: 20, right: 20, borderTop: "1px solid", borderRight: "1px solid" },
  cornerBL: { bottom: 20, left: 20, borderBottom: "1px solid", borderLeft: "1px solid" },
  cornerBR: { bottom: 20, right: 20, borderBottom: "1px solid", borderRight: "1px solid" },
  scene: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "1.8rem", zIndex: 5, textAlign: "center",
    padding: "2rem 1rem", maxWidth: 640, width: "100%",
  },
  skull: {
    fontSize: "2rem", opacity: 0.35, letterSpacing: "0.2em",
    animation: "breathe 6s ease-in-out infinite",
  },
  titleBlock: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" },
  title: {
    fontSize: "clamp(2.8rem, 8vw, 5rem)", fontWeight: "bold",
    letterSpacing: "0.3em", lineHeight: 1.05, margin: 0,
    color: "#e8ddd0",
    textShadow: "0 0 60px rgba(200,185,165,0.08)",
  },
  titleSub: {
    fontSize: "0.55rem", letterSpacing: "0.35em",
    color: "rgba(200,185,165,0.3)", margin: 0,
  },
  question: {
    fontSize: "0.75rem", letterSpacing: "0.2em",
    color: "rgba(200,185,165,0.4)", margin: 0,
    fontStyle: "italic",
  },
  wheelRow: {
    display: "flex", alignItems: "center", gap: "0",
    background: "rgba(255,255,255,0.015)",
    border: "1px solid rgba(200,185,165,0.1)",
    padding: "0.5rem 1rem",
  },
  wheelDivider: {
    width: 1, height: 120,
    background: "linear-gradient(to bottom, transparent, rgba(200,185,165,0.12), transparent)",
    margin: "0 0.25rem",
  },
  revealBtn: {
    background: "transparent", border: "none",
    cursor: "pointer", display: "flex", flexDirection: "column",
    alignItems: "center", gap: "0.5rem", padding: "0.5rem 2rem",
    position: "relative",
  },
  revealBtnInner: {
    fontSize: "0.65rem", letterSpacing: "0.35em",
    color: "rgba(200,185,165,0.6)", fontFamily: "'Courier New', monospace",
    transition: "color 0.3s",
  },
  revealBtnLine: {
    width: "100%", height: 1,
    background: "linear-gradient(to right, transparent, rgba(200,185,165,0.4), transparent)",
    transition: "opacity 0.3s",
  },
  epigraph: {
    fontSize: "0.65rem", fontStyle: "italic",
    color: "rgba(200,185,165,0.2)", letterSpacing: "0.06em",
    maxWidth: 380, lineHeight: 1.8, margin: 0,
  },
  revealTop: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" },
  revealSub: {
    fontSize: "0.55rem", letterSpacing: "0.4em",
    color: "rgba(200,185,165,0.3)",
  },
  counterBlock: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem",
    padding: "1.5rem 2rem",
    background: "rgba(255,255,255,0.018)",
    border: "1px solid rgba(200,185,165,0.08)",
    position: "relative",
  },
  counterInner: {
    fontSize: "clamp(1.8rem, 5.5vw, 3.2rem)", fontWeight: "bold",
    letterSpacing: "0.05em", color: "#ddd4c4",
    fontVariantNumeric: "tabular-nums",
    textShadow: "0 0 40px rgba(220,210,190,0.15)",
  },
  counterLabel: {
    fontSize: "0.5rem", letterSpacing: "0.5em",
    color: "rgba(200,185,165,0.25)",
  },
  modeRow: {
    display: "flex", gap: "0.3rem", flexWrap: "wrap", justifyContent: "center",
  },
  modeBtn: {
    background: "transparent",
    border: "1px solid rgba(200,185,165,0.1)",
    color: "rgba(200,185,165,0.25)",
    fontFamily: "'Courier New', monospace",
    fontSize: "0.55rem", letterSpacing: "0.25em",
    padding: "0.5rem 1.1rem", cursor: "pointer",
    transition: "all 0.2s",
  },
  modeBtnActive: {
    borderColor: "rgba(200,185,165,0.45)",
    color: "#c8bfb0",
    background: "rgba(200,185,165,0.04)",
    textShadow: "0 0 12px rgba(200,185,165,0.3)",
  },
  dividerLine: {
    width: 120, height: 1,
    background: "linear-gradient(to right, transparent, rgba(200,185,165,0.15), transparent)",
  },
  quoteReveal: {
    fontSize: "0.62rem", fontStyle: "italic",
    color: "rgba(200,185,165,0.2)", letterSpacing: "0.05em",
    maxWidth: 360, lineHeight: 1.9, margin: 0,
  },
  back: {
    background: "transparent", border: "none",
    color: "rgba(200,185,165,0.2)", fontFamily: "'Courier New', monospace",
    fontSize: "0.58rem", letterSpacing: "0.15em",
    cursor: "pointer", padding: "0.3rem",
    transition: "color 0.2s",
  },
  footer: {
    position: "fixed", bottom: "1.2rem",
    fontSize: "0.45rem", letterSpacing: "0.5em",
    color: "rgba(200,185,165,0.1)", zIndex: 5,
  },
};

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #080808; }

  @keyframes breathe {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(1.04); }
  }
  @keyframes enter {
    from { opacity: 0; transform: translateY(18px); filter: blur(4px); }
    to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
  }
  @keyframes exit {
    from { opacity: 1; transform: translateY(0);     filter: blur(0); }
    to   { opacity: 0; transform: translateY(-18px); filter: blur(4px); }
  }

  .enter-down { animation: enter 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
  .exit-up    { animation: exit  0.5s cubic-bezier(0.7,0,1,1) forwards; pointer-events: none; }

  .reveal-btn:hover span {
    color: rgba(220,210,190,0.9) !important;
    text-shadow: 0 0 20px rgba(200,185,165,0.3);
  }
  .mode-btn:hover {
    border-color: rgba(200,185,165,0.3) !important;
    color: rgba(200,185,165,0.6) !important;
  }
  .back-btn:hover { color: rgba(200,185,165,0.5) !important; }

  div[style*="overflow-y: scroll"]::-webkit-scrollbar { display: none; }

  ::selection { background: rgba(200,185,165,0.15); color: #e8ddd0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: rgba(200,185,165,0.15); }
`;
