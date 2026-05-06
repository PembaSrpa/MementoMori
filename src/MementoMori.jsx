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

const MONTHS     = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTH_FULL = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const LIFE_EXPECTANCY_YEARS = 77;

function daysInMonth(monthIdx, year) {
  return new Date(year, monthIdx + 1, 0).getDate();
}

function getElapsed(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  return { seconds: s, minutes: s / 60, hours: s / 3600, nights: s / 86400, weeks: s / 604800 };
}

function getDeathTs(birthTs) {
  return birthTs + LIFE_EXPECTANCY_YEARS * 365.25 * 86400 * 1000;
}

function getRemaining(birthTs, deathTs) {
  const s = Math.max(0, (deathTs - Date.now()) / 1000);
  return { seconds: s, minutes: s / 60, hours: s / 3600, nights: s / 86400, weeks: s / 604800 };
}

function fmtVal(v, mode) {
  const n = Math.floor(v);
  if (mode === "weeks")  return String(n).padStart(6,  "0");
  if (mode === "nights") return String(n).padStart(6,  "0");
  if (mode === "hours")  return String(n).padStart(9,  "0");
  return String(n).padStart(12, "0");
}

function useRaf(cb, active) {
  const r = useRef(null);
  const c = useRef(cb);
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
    const t = setTimeout(() => setAnim(false), 180);
    return () => clearTimeout(t);
  }, [ch]);
  return (
    <span style={{
      display: "inline-block", width: "0.62em", textAlign: "center",
      transition: "opacity 0.15s, transform 0.15s",
      opacity: anim ? 0.1 : 1,
      transform: anim ? "translateY(-5px) scaleY(0.75)" : "translateY(0) scaleY(1)",
    }}>{ch}</span>
  );
}

function AnimDigits({ value, mode }) {
  const str = fmtVal(value, mode);
  const chunks = [];
  for (let i = 0; i < str.length; i += 3) chunks.push(str.slice(i, i + 3));
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.08em" }}>
      {chunks.map((chunk, ci) => (
        <span key={ci} style={{ display: "inline-flex" }}>
          {chunk.split("").map((ch, di) => <Digit key={ci * 3 + di} ch={ch} />)}
          {ci < chunks.length - 1 && (
            <span style={{ opacity: 0.2, margin: "0 0.06em", fontSize: "0.4em", alignSelf: "center" }}>·</span>
          )}
        </span>
      ))}
    </span>
  );
}

const ITEM_H = 52;

function DrumWheel({ values, selected, onChange, fmt, width = 88 }) {
  const scrollRef   = useRef(null);
  const isDragging  = useRef(false);
  const startY      = useRef(0);
  const startScroll = useRef(0);
  const velocity    = useRef(0);
  const lastY       = useRef(0);
  const lastT       = useRef(0);
  const snapTimer   = useRef(null);

  const idx = values.indexOf(selected);

  const scrollTo = useCallback((i, smooth = true) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: i * ITEM_H, behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollTo(idx, false), 50);
    return () => clearTimeout(t);
  }, [idx, scrollTo]);

  const commitScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const i = Math.round(scrollRef.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(i, values.length - 1));
    onChange(values[clamped]);
    scrollTo(clamped, true);
  }, [values, onChange, scrollTo]);

  const onScroll = useCallback(() => {
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(commitScroll, 100);
  }, [commitScroll]);

  const startDrag = useCallback((clientY) => {
    isDragging.current  = true;
    startY.current      = clientY;
    startScroll.current = scrollRef.current?.scrollTop ?? 0;
    lastY.current       = clientY;
    lastT.current       = performance.now();
    velocity.current    = 0;
    if (scrollRef.current) scrollRef.current.style.scrollBehavior = "auto";
  }, []);

  const moveDrag = useCallback((clientY) => {
    if (!isDragging.current || !scrollRef.current) return;
    scrollRef.current.scrollTop = startScroll.current + (startY.current - clientY);
    const now = performance.now();
    const dt  = now - lastT.current;
    if (dt > 0) velocity.current = (lastY.current - clientY) / dt;
    lastY.current = clientY;
    lastT.current = now;
  }, []);

  const endDrag = useCallback(() => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.scrollBehavior = "";
    scrollRef.current.scrollTop += velocity.current * 150;
    setTimeout(commitScroll, 80);
  }, [commitScroll]);

  useEffect(() => {
    const move = (e) => moveDrag(e.clientY);
    const up   = ()  => endDrag();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup",   up);
    };
  }, [moveDrag, endDrag]);

  return (
    <div
      style={{ position: "relative", height: ITEM_H * 5, width, overflow: "hidden", cursor: "ns-resize", flexShrink: 0 }}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientY); }}
      onTouchStart={(e) => startDrag(e.touches[0].clientY)}
      onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientY); }}
      onTouchEnd={endDrag}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "38%", zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to bottom, var(--c-bg) 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to top, var(--c-bg) 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", top: "50%", left: 8, right: 8, height: ITEM_H,
        transform: "translateY(-50%)", zIndex: 1, pointerEvents: "none",
        borderTop: "1px solid var(--c-border-strong)", borderBottom: "1px solid var(--c-border-strong)" }} />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="drum-scroll"
        style={{ height: "100%", overflowY: "scroll", overscrollBehavior: "none",
          scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        <div style={{ height: ITEM_H * 2 }} />
        {values.map((v, i) => {
          const dist = Math.abs(i - idx);
          return (
            <div
              key={v}
              onClick={() => { onChange(v); scrollTo(i); }}
              style={{
                height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-data)",
                fontWeight: "bold",
                fontSize: dist === 0 ? "1.1rem" : dist === 1 ? "0.88rem" : "0.72rem",
                color: dist === 0 ? "var(--c-fg)" : dist === 1 ? "var(--c-muted)" : "var(--c-faint)",
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

function Lever({ onPull, disabled }) {
  const [pulling, setPulling] = useState(false);

  const handleClick = () => {
    if (pulling || disabled) return;
    setPulling(true);
    setTimeout(() => {
      setPulling(false);
      onPull();
    }, 520);
  };

  return (
    <div
      onClick={handleClick}
      title={disabled ? "Select a past date" : "Pull to reveal"}
      aria-label={disabled ? "Select a past date to reveal" : "Pull lever to reveal your time"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", width: 52, flexShrink: 0,
        height: ITEM_H * 5, cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none", marginLeft: 4,
        opacity: disabled ? 0.35 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div style={{ position: "relative", width: 52, height: ITEM_H * 5,
        display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          position: "absolute", left: "50%", top: 10, bottom: 10,
          width: 5, transform: "translateX(-50%)",
          background: "rgba(180,160,120,0.2)", borderRadius: 3,
          border: "0.5px solid rgba(220,200,160,0.25)",
        }} />
        <div style={{
          position: "absolute", bottom: 18, left: "50%",
          transform: "translateX(-50%)",
          width: 14, height: 22, borderRadius: 7,
          background: "rgba(100,85,60,0.7)",
          border: "1px solid rgba(220,200,160,0.3)",
        }} />
        <div style={{
          position: "absolute", left: "50%",
          top: pulling ? "62%" : "14%",
          transform: "translateX(-50%)",
          transition: pulling
            ? "top 0.22s cubic-bezier(.4,0,.2,1)"
            : "top 0.28s cubic-bezier(.2,1.4,.4,1)",
          display: "flex", flexDirection: "column", alignItems: "center",
          zIndex: 2,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "radial-gradient(circle at 38% 35%, rgba(220,200,160,0.18), rgba(50,42,28,0.95))",
            border: "1px solid rgba(220,200,160,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 1px 2px rgba(220,200,160,0.1)",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "rgba(220,200,160,0.35)",
              border: "0.5px solid rgba(220,200,160,0.5)",
            }} />
          </div>
          <div style={{
            width: 4, height: 44,
            background: "linear-gradient(to bottom, rgba(200,180,140,0.7), rgba(160,140,100,0.4))",
            borderRadius: 2,
          }} />
        </div>
      </div>
    </div>
  );
}

function Corner({ pos }) {
  const base = { position: "fixed", width: 24, height: 24, borderColor: "var(--c-border)", zIndex: 6, pointerEvents: "none" };
  const map = {
    tl: { top: 20, left: 20, borderTop: "1px solid", borderLeft: "1px solid" },
    tr: { top: 20, right: 20, borderTop: "1px solid", borderRight: "1px solid" },
    bl: { bottom: 20, left: 20, borderBottom: "1px solid", borderLeft: "1px solid" },
    br: { bottom: 20, right: 20, borderBottom: "1px solid", borderRight: "1px solid" },
  };
  return <div style={{ ...base, ...map[pos] }} />;
}

function BgCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const lines = Array.from({ length: 10 }, (_, i) => ({
      x: (i / 9) * 1.1 - 0.05,
      phase: Math.random() * Math.PI * 2,
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
        ctx.strokeStyle = "rgba(180,160,130,0.045)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      t += 0.004;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

export default function MementoMori() {
  const now = new Date();
  const YEARS_ARR = Array.from({ length: 105 }, (_, i) => now.getFullYear() - i);

  const [phase,     setPhase]     = useState("input");
  const [monthIdx,  setMonthIdx]  = useState(11);
  const [day,       setDay]       = useState(22);
  const [year,      setYear]      = useState(2002);
  const [mode,      setMode]      = useState("seconds");
  const [elapsed,   setElapsed]   = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [birthTs,   setBirthTs]   = useState(null);
  const [deathTs,   setDeathTs]   = useState(null);
  const [exiting,   setExiting]   = useState(false);
  const [dateError, setDateError] = useState(false);

  const maxDay = daysInMonth(monthIdx, year);
  const dayArr = Array.from({ length: maxDay }, (_, i) => i + 1);

  const selectedTs  = new Date(year, monthIdx, day).getTime();
  const isValidDate = selectedTs < Date.now();

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [monthIdx, year, maxDay]);

  useEffect(() => {
    setDateError(false);
  }, [monthIdx, day, year]);

  useRaf(() => {
    if (!birthTs || !deathTs) return;
    setElapsed(getElapsed(birthTs)[mode]);
    setRemaining(getRemaining(birthTs, deathTs)[mode]);
  }, phase === "reveal");

  const handleReveal = () => {
    if (!isValidDate) {
      setDateError(true);
      return;
    }
    const ts = new Date(year, monthIdx, day).getTime();
    const dts = getDeathTs(ts);
    setBirthTs(ts);
    setDeathTs(dts);
    setExiting(true);
    setTimeout(() => { setPhase("reveal"); setExiting(false); }, 500);
  };

  const reset = () => {
    setExiting(true);
    setTimeout(() => {
      setPhase("input");
      setBirthTs(null);
      setDeathTs(null);
      setExiting(false);
    }, 400);
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
        <div style={s.inputScene} className={exiting ? "scene-exit" : "scene-enter"}>
          <div style={s.titleWrap}>
            <div style={s.titleRow}>
              <div style={s.titleLine} />
              <h1 style={s.title}>MEMENTO MORI</h1>
              <div style={s.titleLine} />
            </div>
            <p style={s.titleSub}>remember · you · must · die</p>
          </div>

          <p style={s.question}>when were you summoned into existence?</p>

          <div style={s.wheelOuter}>
            <div style={s.wheelLabels}>
              <span style={s.wheelLabelMonth}>MONTH</span>
              <span style={s.wheelLabelDay}>DAY</span>
              <span style={s.wheelLabelYear}>YEAR</span>
              <span style={s.wheelLabelLever}>PULL</span>
            </div>
            <div style={s.wheelRow}>
              <DrumWheel values={Array.from({ length: 12 }, (_, i) => i)} selected={monthIdx} onChange={setMonthIdx} fmt={v => MONTHS[v]} width={96} />
              <div style={s.wheelSep} />
              <DrumWheel values={dayArr} selected={day} onChange={setDay} fmt={v => String(v).padStart(2, "0")} width={76} />
              <div style={s.wheelSep} />
              <DrumWheel values={YEARS_ARR} selected={year} onChange={setYear} fmt={v => String(v)} width={88} />
              <div style={s.wheelSep} />
              <Lever onPull={handleReveal} disabled={!isValidDate} />
            </div>
            {dateError && (
              <p style={s.dateError} role="alert">select a date in the past</p>
            )}
          </div>
        </div>
      )}

      {phase === "reveal" && (
        <div style={s.revealScroll} className={`mm-reveal-scroll${exiting ? " scene-exit" : " scene-enter"}`}>
          <div style={s.revealInner}>
            <div style={s.footer}>
              * VIVAMUS MORIENDUM EST *<br />
            </div>
            <span style={s.dateDisplay}>
              {MONTH_FULL[monthIdx]} {String(day).padStart(2, "0")}, {year}
            </span>

            <div style={s.block}>
              <p style={s.blockEyebrow}>YOU HAVE SURVIVED</p>
              <div style={s.counterWrap}>
                <AnimDigits value={elapsed} mode={mode} />
              </div>
              <p style={s.blockUnit}>{curMode.label}</p>
            </div>

            <div style={s.modeRow}>
              {MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className="mode-btn"
                  style={{ ...s.modeBtn, ...(mode === m.key ? s.modeBtnOn : {}) }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div style={s.divider}>
              <div style={s.divLine} />
              <span style={s.divText}>& YET</span>
              <div style={s.divLine} />
            </div>

            <div style={{ ...s.block, ...s.blockRemaining }}>
              <p style={{ ...s.blockEyebrow, color: "var(--c-gold-muted)" }}>
                YOU HAVE LEFT ABOUT
              </p>
              <div style={{ ...s.counterWrap, color: "var(--c-gold)", textShadow: "0 0 40px rgba(210,175,80,0.25)" }}>
                <AnimDigits value={remaining} mode={mode} />
              </div>
              <p style={{ ...s.blockUnit, color: "var(--c-gold-faint)" }}>{curMode.label} REMAINING</p>
              <p style={s.blockNote}>or you could die tomorrow — you never know</p>
            </div>

            <button onClick={reset} style={s.back} className="back-btn">← begin again</button>

            <p style={s.quote}>
              "The time which you give to another is taken from your life."
            </p>
          </div>
        </div>
      )}

      <div style={s.footer}>
        * MEMENTO MORI * TEMPUS FUGIT * CARPE DIEM *<br />
        <span style={s.footerBy}>made by <Link href="https://artt-folio.vercel.app/" target="_self" rel="noopener noreferrer">
          <span className="face-btn">pemba sherpa</span>
        </Link></span>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "var(--c-bg)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    position: "relative",
    fontFamily: "var(--font-display)",
    color: "var(--c-fg)",
  },
  vignette: {
    position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none",
    background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.88) 100%)",
  },
  grain: {
    position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.4,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
  },
  inputScene: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem",
    zIndex: 5, textAlign: "center", padding: "1rem 1.5rem",
    maxWidth: 640, width: "100%",
  },
  revealScroll: {
    width: "100%",
    maxHeight: "100vh",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    zIndex: 5,
    display: "flex", justifyContent: "center",
    scrollbarWidth: "none",
  },
  revealInner: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem",
    textAlign: "center", padding: "1.2rem 1.5rem 2rem",
    maxWidth: 620, width: "100%",
  },
  titleWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" },
  titleRow:  { display: "flex", alignItems: "center", gap: "1.2rem", width: "100%" },
  titleLine: { flex: 1, height: 1, background: "linear-gradient(to right, transparent, var(--c-border-strong), transparent)" },
  title: {
    fontSize: "clamp(1.8rem, 6.5vw, 4rem)", fontWeight: "bold",
    letterSpacing: "0.32em", color: "var(--c-fg)", margin: 0,
    fontFamily: "var(--font-display)",
    textShadow: "0 0 60px rgba(220,200,160,0.15), 0 2px 4px rgba(0,0,0,0.8)",
    whiteSpace: "nowrap",
  },
  titleSub: {
    fontSize: "0.7rem", letterSpacing: "0.35em", color: "var(--c-muted)", margin: 0,
    fontFamily: "var(--font-data)",
  },
  question: {
    fontSize: "0.85rem", letterSpacing: "0.1em", color: "var(--c-mid)", fontStyle: "italic",
    fontFamily: "var(--font-display)",
  },
  wheelOuter: {
    position: "relative", background: "rgba(255,255,255,0.025)",
    border: "1px solid var(--c-border)",
    padding: "0.8rem 1rem 0.6rem",
    width: "100%", maxWidth: 380,
  },
  wheelLabels: {
    display: "flex",
    fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--c-faint)",
    marginBottom: "0.4rem",
    fontFamily: "var(--font-data)",
  },
  wheelLabelMonth: { width: 96, textAlign: "center", flexShrink: 0 },
  wheelLabelDay:   { width: 76, textAlign: "center", flexShrink: 0, marginLeft: 9 },
  wheelLabelYear:  { width: 88, textAlign: "center", flexShrink: 0, marginLeft: 9 },
  wheelLabelLever: { width: 52, textAlign: "center", flexShrink: 0, marginLeft: 13 },
  wheelRow: { display: "flex", alignItems: "center" },
  wheelSep: {
    width: 1, height: ITEM_H * 3,
    background: "linear-gradient(to bottom, transparent, var(--c-border), transparent)",
    margin: "0 0.15rem",
  },
  dateDisplay: {
    fontSize: "0.78rem", letterSpacing: "0.25em", color: "var(--c-muted)",
    fontFamily: "var(--font-data)",
  },
  dateError: {
    fontSize: "0.62rem", letterSpacing: "0.18em", color: "var(--c-error)",
    marginTop: "0.5rem", textAlign: "center",
    fontFamily: "var(--font-data)",
    animation: "fadeIn 0.2s ease",
  },
  block: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
    padding: "1rem 2rem",
    background: "rgba(255,255,255,0.025)",
    border: "1px solid var(--c-border)",
    width: "100%",
  },
  blockRemaining: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(200,170,80,0.14)",
  },
  blockEyebrow: {
    fontSize: "0.65rem", letterSpacing: "0.3em", color: "var(--c-mid)", margin: 0,
    fontFamily: "var(--font-data)",
  },
  counterWrap: {
    fontSize: "clamp(1.4rem, 5vw, 3rem)", fontWeight: "bold",
    letterSpacing: "0.04em", color: "var(--c-fg)",
    textShadow: "0 0 40px rgba(230,210,170,0.2)",
    fontFamily: "var(--font-data)",
  },
  blockUnit: {
    fontSize: "0.62rem", letterSpacing: "0.4em", color: "var(--c-faint)", margin: 0,
    fontFamily: "var(--font-data)",
  },
  blockNote: {
    fontSize: "0.7rem", fontStyle: "italic", letterSpacing: "0.05em",
    color: "var(--c-mid)", marginTop: "0.3rem",
    fontFamily: "var(--font-display)",
  },
  divider: {
    display: "flex", alignItems: "center", gap: "1rem",
    width: "75%", margin: "0.4rem 0",
  },
  divLine: { flex: 1, height: 1, background: "var(--c-border)" },
  divText: { fontSize: "0.62rem", letterSpacing: "0.25em", color: "var(--c-faint)", fontFamily: "var(--font-data)" },
  modeRow: {
    display: "flex", gap: "0.3rem", flexWrap: "wrap", justifyContent: "center",
    padding: "0.5rem 0",
    borderTop: "1px solid var(--c-border)",
    borderBottom: "1px solid var(--c-border)",
    width: "100%",
    marginTop: "0.2rem",
  },
  modeBtn: {
    background: "transparent",
    border: "1px solid var(--c-border)",
    color: "var(--c-faint)",
    fontFamily: "var(--font-data)",
    fontSize: "0.62rem", letterSpacing: "0.2em",
    padding: "0.5rem 1rem",
    cursor: "pointer", transition: "all 0.18s",
  },
  modeBtnOn: {
    border: "1px solid var(--c-border-strong)",
    color: "var(--c-fg)",
    background: "rgba(220,200,160,0.07)",
    textShadow: "0 0 12px rgba(220,200,160,0.3)",
  },
  back: {
    background: "transparent", border: "none",
    color: "var(--c-muted)",
    fontFamily: "var(--font-data)",
    fontSize: "0.68rem", letterSpacing: "0.15em",
    cursor: "pointer", transition: "color 0.2s", padding: "0.3rem",
    marginTop: "0.4rem",
  },
  quote: {
    fontSize: "0.72rem", fontStyle: "italic",
    color: "var(--c-fg)", letterSpacing: "0.04em",
    maxWidth: 360, lineHeight: 2,
    fontFamily: "var(--font-display)",
  },
  footer: {
    position: "relative",
    fontSize: "0.60rem", letterSpacing: "0.30em",
    color: "var(--c-mid)", zIndex: 6,
    marginTop: "1rem",
    paddingBottom: "1.5rem",
    textAlign: "center",
    lineHeight: 2,
    fontFamily: "var(--font-data)",
  },
  footerBy: {
    letterSpacing: "0.15em",
    fontSize: "0.6rem",
  },
};

const css = `
  :root {
    --c-bg:            #0c0c0c;
    --c-fg:            #f0e8d8;
    --c-mid:           #c4b490;
    --c-muted:         #a89870;
    --c-faint:         rgba(220, 200, 175, 0.69);
    --c-border:        rgba(220,200,160,0.14);
    --c-border-strong: rgba(220,200,160,0.4);
    --c-gold:          #d4b44a;
    --c-gold-muted:    #b09838;
    --c-gold-faint:    #7a6820;
    --c-error:         #c47a5a;
    --font-display:    'Courier New', monospace;
    --font-data:       'Courier New', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: var(--c-bg); min-height: 100vh; }

  @keyframes enter {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes exit {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-20px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .scene-enter { animation: enter 0.75s cubic-bezier(0.16,1,0.3,1) forwards; }
  .scene-exit  { animation: exit  0.4s cubic-bezier(0.7,0,1,1) forwards; pointer-events: none; }

  .drum-scroll::-webkit-scrollbar { display: none; }
  .mm-reveal-scroll::-webkit-scrollbar { display: none; }

  .face-btn { transition: color 0.2s; }
  .face-btn:hover {
    color: var(--c-fg) !important;
    text-shadow: 0 0 20px rgba(220,200,160,0.3);
  }
  .mode-btn:hover {
    border-color: var(--c-border-strong) !important;
    color: var(--c-mid) !important;
  }
  .back-btn:hover { color: var(--c-mid) !important; }

  ::selection { background: rgba(220,200,160,0.18); color: var(--c-fg); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--c-bg); }
  ::-webkit-scrollbar-thumb { background: var(--c-border); }

  @media (max-width: 420px) {
    .wheel-outer-wrap {
      padding: 0.6rem 0.5rem 0.5rem;
    }
  }
`;
