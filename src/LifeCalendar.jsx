"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const LIFE_EXPECTANCY_YEARS = 77;
const WEEKS_PER_YEAR = 52;
const HALF = 26;

const DE_DAYS = ["SONN", "MON", "DIENS", "MITT", "DONN", "FREI", "SAMS"];

const QUOTES = [
  "You are not promised tomorrow.", "The clock does not pause for the living.",
  "Every sunrise is borrowed time.", "Death is the only appointment you will never miss.",
  "You have already used some of your last days.", "The grave makes no exceptions.",
  "Time stolen cannot be returned.", "You are older now than you have ever been.",
  "The hours you waste are the hours you lose.", "No one escapes the final accounting.",
  "You will not remember most of today.", "The years ahead are fewer than the years behind.",
  "Live as if the clock were visible.", "Nothing lasts. Not even you.",
  "The calendar does not lie.", "Each square was a week you cannot reclaim.",
  "Urgency is the only rational response.", "The unexamined life ends the same way.",
  "You are a brief arrangement of matter.", "Most of your life has already happened.",
  "The moment you read this is already gone.", "Death is not waiting - it is arriving.",
  "You have been dying since the day you were born.", "There is no later. Only now.",
  "The future shrinks with every breath.", "Do not mistake busyness for living.",
  "The final day looks like any other.", "You will not sense your last moment approaching.",
  "Regret is the heaviest thing you can carry.", "Every choice forecloses another.",
  "The graveyard is full of essential people.", "Time is the only currency that cannot be earned back.",
  "You are already en route.", "The hourglass has no pause button.",
  "Nothing you postpone will wait forever.", "You are not as permanent as you feel.",
  "The universe existed without you and will again.", "Comfort is the enemy of urgency.",
  "Your name will be forgotten within three generations.", "Act as if this year is your last.",
  "The body keeps the score. So does time.", "Every good thing you delay may never happen.",
  "You are closer to the end than the beginning.", "The dead had plans too.",
  "Mortality is not a problem to be solved.", "The present moment is the only one you own.",
  "Your story has already begun its final act.", "Stop waiting for permission to live.",
  "The world will not pause when you go.", "Even this moment is passing.",
  "You cannot save time, only spend it.", "The average life is shorter than it feels.",
  "Comfort today is often regret tomorrow.", "The end is the same for everyone.",
  "Live less out of habit and more out of intent.", "You are made of finite days.",
  "The stars will not mourn you.", "Be ruthless with what you give your hours to.",
  "You are burning through your allocation.", "Do not let someone else write your story.",
  "The only certainty is the uncertainty of time remaining.", "You will forget 90% of today by next week.",
  "The grains of sand do not slow down.", "Act while your hands still work.",
  "Most people die with their music still inside them.", "You are not in rehearsal.",
  "The exit is unmarked but inevitable.", "Even mountains erode.",
  "You will blink and a decade will pass.", "Nothing is too small to be a last time.",
  "Live as though you love the life you have.", "The comfortable path leads to the same end.",
  "Your days are numbered. Number them.", "The eulogy is already being written.",
  "Everything you delay is a bet against yourself.", "You are never as stuck as you think.",
  "The present is always slipping into the past.", "There is no practice round.",
  "Death is not your enemy. Unlived life is.", "The finite makes things meaningful.",
  "Your future self is watching you decide.", "A year from now you will wish you started today.",
  "The clock on the wall is not decoration.", "Urgency and peace are not opposites.",
  "You have been given today. That is not guaranteed.", "Every season of life is also its last season.",
  "The brevity of life is a gift if you accept it.", "You are not behind - you are just mortal.",
  "The window is open now. Not forever.", "Make the call. Send the letter. Go.",
  "Your life is not a rough draft.", "The path of least resistance leads to an average life.",
  "You will not regret the risks you took for love.", "The greatest waste is an unlived day.",
  "Impermanence is the only constant.", "Time is the fire in which we burn.",
  "You have a limited number of Mondays left.", "The good life requires choosing it daily.",
  "Do not mistake safety for living.", "You are a visitor here.",
  "What would you do if this were your last year?", "Your presence is already temporary.",
  "The second you are reading this will never return.", "Nothing about this life is guaranteed.",
  "Act as if you are already dying - because you are.", "The regret of inaction outlives the fear of action.",
  "Your hours have weight. Spend them accordingly.", "There is no such thing as killing time.",
  "The future you imagine requires action today.", "Be here. This is the only here there is.",
  "Live forward. You cannot live backward.", "The body is a loan you will repay.",
  "You are always running out of time.", "Make your peace before you need it.",
  "The cost of delay is paid in regret.", "You cannot get yesterday back for any price.",
  "Even joy is fleeting. Especially joy.", "Do not waste your finite attention on infinite noise.",
  "You are not immortal. Act accordingly.", "The grave does not distinguish the busy from the idle.",
  "Your ambitions have an expiration date.", "The distance between dreams and action is time.",
  "Stop postponing your life.", "Nothing stays. Not grief, not joy, not you.",
  "You have a finite number of conversations left.", "Every person you meet is also dying.",
  "The length of life matters less than its depth.", "You will not always have this opportunity.",
  "The last chapter has already begun.", "Your remaining days are the only currency you have.",
  "The only way out is through - and then it is over.", "What are you saving yourself for?",
  "You will not be remembered for your comfort.", "The cost of the unlived life is paid at the end.",
  "Your attention is your life. Guard it.", "You are being consumed by time regardless.",
  "The brave die once. The fearful die daily.", "Everything is temporary, including your chance.",
  "The life you want requires the risk you are avoiding.", "Do not let the urgent crowd out the important.",
  "Your ancestors struggled so you could be here. Use it.", "There is no safe harbor from time.",
  "What is left undone when you die stays undone.", "The present is the only tense that matters.",
  "You are spending your life whether you intend to or not.", "Choose what you give your finite days to.",
  "The world is not waiting for you to be ready.", "You are already enough to begin.",
  "Tomorrow is a promise no one can keep.", "The meaning is in the doing, not the waiting.",
  "You cannot outrun your mortality. You can outrun your fear.", "The cost of waiting is always higher than it seems.",
  "Every unlived week is a small death of its own.", "Time does not care about your plans.",
  "You are always one breath closer to the last.", "The ordinary days are the extraordinary ones.",
  "Nothing important happens without a deadline.", "Your one life is not practice.",
  "The risk of living fully is far less than the risk of not.", "You will become the sum of your chosen hours.",
  "The future does not exist yet. This moment does.", "Your limitations are real but not permanent.",
  "The door closes slowly and then all at once.", "Nothing dulls the finality of time.",
  "You are writing the story whether you try to or not.", "Act from love, not from fear of running out.",
  "What would a person with one year left prioritize?", "The luxury of delay is not available to you.",
  "You are not owed more time. You are given today.", "The days are long but the decades are short.",
  "Meaning does not find you. You find it.", "Every distraction is a choice against what matters.",
  "Your mortality is your greatest motivator.", "You have already outlived some version of yourself.",
  "The life you want is on the other side of your excuses.", "Time is not money. It is more valuable than money.",
  "You will never be younger than you are right now.", "The ordinary is the extraordinary, seen clearly.",
  "Your death will surprise you. Your life should not.", "The present is the gift you keep ignoring.",
  "You are a finite being in an indifferent universe - make it matter.", "Someday is the most dangerous word.",
  "Do not let comfort become your cage.", "The last sunrise is indistinguishable from any other.",
  "Everything is borrowed. Nothing is kept.", "You have this one life to test your ideas.",
  "The purpose of death is to make life meaningful.", "You are never too late until you are.",
  "Stop performing your life. Start living it.", "The weight of unlived dreams is heavier than any failure.",
  "You are always choosing - even when you choose not to choose.", "What would you do if you knew the date?",
  "The end gives the beginning its meaning.", "You have exactly enough time if you start now.",
  "Live with the kind of urgency that comes from love.", "The only failure is the one you did not attempt.",
  "Your death is not the problem. How you live is.", "Nothing is more motivating than a deadline.",
  "The brevity of life is not a tragedy. The waste of it is.", "You are a brief light in a long darkness.",
  "Make your weeks memorable before they become filled squares.", "The present moment always will have been.",
  "You get one shot at today.", "Every ending was once a beginning.",
  "Your finite weeks are what make them precious.", "The world is richer for your being here - for now.",
  "Do not let the weight of tomorrow crush today.", "Even the longest life is a short story.",
  "You are already in the middle of your story.", "The past is fixed. The future is not. Now is.",
  "Each week is a door that closes behind you.", "You only regret the love you did not give.",
  "The universe does not keep score. You do.", "Your time is the only thing you can truly give.",
  "There are no ordinary moments.", "You are burning. Make it bright.",
  "Live so that the filled squares were worth marking.", "The finale comes for everyone.",
  "You are not guaranteed a graceful exit.", "What matters will become clear at the end.",
  "The shortness of life is not an excuse - it is a reason.", "You already know what to do.",
  "Make the weeks count.", "The silence after is very long.",
  "Your unfinished business will stay unfinished.", "You are the only one who can waste your time.",
  "This moment, once gone, is gone entirely.", "Live as though death is real - because it is.",
  "You are a brief visitor in an ancient world.", "Time is the one thing you cannot make more of.",
  "The discipline of today is the freedom of tomorrow.", "Your days are a gift you did not earn.",
  "The march is constant and indifferent.", "You have enough weeks if you use them.",
  "Act now. The later you imagine may not come.", "The unlived life ends the same as the lived one.",
  "You are already on the other side of many lasts.", "What is enough? You may never know unless you ask.",
  "The ticking you hear is not a metaphor.", "You are running out of new first times.",
  "Even this sentence is consuming your finite days.", "Make it mean something.",
  "The question is not if. It is when.", "Live in a way that would make your final self proud.",
  "You are mortal. So is everyone you love.", "The world will be fine without you. Be fine with that.",
  "There is no version of this that does not end.", "Your life is happening right now.",
  "The exit is already decided. The path is not.", "Leave nothing important unsaid.",
  "You are the author of the weeks that remain.", "Time does not wait for grief to pass.",
  "The only week you can change is this one.", "Your remaining squares are not yet filled.",
  "Death is certain. Meaning is optional. Choose.", "You are always in the middle of your only life.",
  "The last week will feel like any other. Until it does not.", "Begin.",
  "Every moment is the last of its kind.", "You cannot be remembered for what you did not do.",
  "The present is your only address.", "What you love, love now.",
  "The grid is filling whether you live or not.", "Do not die with a perfect plan and no action.",
  "Your life is not a waiting room.", "The hardest part is believing your time is valuable.",
  "Time reveals what matters. So does death.", "You are here. Briefly. Make it count.",
  "The finite life is the only kind there is.", "Start with today. Today is enough.",
  "Nothing is promised past this breath.", "The weight of what you did not do is the heaviest.",
  "Live so that every filled square was a week fully claimed.", "The light you carry is borrowed. Burn bright.",
  "You are already someone's memory of the past.", "Remember. You must die.",
];

function Corner({ pos }) {
  const base = { position: "fixed", width: 24, height: 24, borderColor: "rgba(220,200,160,0.25)", zIndex: 6, pointerEvents: "none" };
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

function WeekPopup({ weekIndex, birthTs, onClose }) {
  const [dayPct, setDayPct] = useState(0);
  const birthDate = new Date(birthTs);
  const weekStart = new Date(birthTs + weekIndex * 7 * 24 * 3600 * 1000);
  const weekEnd   = new Date(birthTs + (weekIndex + 1) * 7 * 24 * 3600 * 1000 - 86400000);
  const today     = new Date();

  const fmt = (d) => d.toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });

  const getDayPct = () => {
    const n = new Date();
    return (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()) / 86400 * 100;
  };

  useEffect(() => {
    setDayPct(getDayPct());
    const t = setInterval(() => setDayPct(getDayPct()), 1000);
    return () => clearInterval(t);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    const isPast  = d < today && !isToday;
    return { d, isToday, isPast, dow: d.getDay() };
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#161410",
          border: "1px solid rgba(220,200,160,0.25)",
          width: "100%", maxWidth: 360,
          fontFamily: "Courier New, monospace",
          animation: "popup-in 0.22s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 12px", borderBottom: "1px solid rgba(220,200,160,0.1)" }}>
          <div>
            <p style={{ fontSize: "9px", letterSpacing: "0.28em", color: "rgb(220, 200, 160)", margin: "0 0 3px" }}>
              WEEK {weekIndex + 1} OF YOUR LIFE
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "1px solid rgba(220,200,160,0.2)", color: "rgba(220, 200, 160, 0.9)", width: 16, height: 16, cursor: "pointer", fontFamily: "Courier New,monospace", fontSize: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>

        <div style={{ padding: "12px 18px 16px" }}>
          {days.map(({ d, isToday, isPast, dow }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < 6 ? "1px solid rgba(220, 200, 160, 0.1)" : "none" }}>
              <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: isToday ? "#c4b490" : "rgba(220, 200, 160, 0.87)", width: 36, flexShrink: 0 }}>
                {DE_DAYS[dow]}
              </span>
              <span style={{ fontSize: "10px", color: "rgba(220, 200, 160, 0.93)", width: 18, textAlign: "right", flexShrink: 0 }}>
                {d.getDate()}
              </span>

              {isPast && (
                <div style={{ flex: 1, height: 9, position: "relative", overflow: "hidden" }}>
                  <svg width="100%" height="9" viewBox="0 0 100 9" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                    <line x1="0" y1="0" x2="100" y2="9" stroke="#7a2010" strokeWidth="1.4" />
                    <line x1="0" y1="9" x2="100" y2="0" stroke="#7a2010" strokeWidth="1.4" />
                  </svg>
                </div>
              )}

              {isToday && (
                <>
                  <div style={{ flex: 1, height: 9, background: "rgba(220,200,160,0.06)", border: "1px solid rgba(220,200,160,0.1)", position: "relative", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${dayPct}%`, background: "#9a2a18", transition: "width 0.8s linear" }} />
                  </div>
                </>
              )}

              {!isPast && !isToday && (
                <div style={{ flex: 1, height: 9, border: "1px solid rgba(220,200,160,0.1)" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "0 18px 12px", fontSize: "8px", letterSpacing: "0.2em", color: "rgba(220, 200, 160, 0.81)", textAlign: "center" }}>
          {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

export default function LifeCalendar({ birthTs, deathTs, onBack }) {
  const birthDate  = new Date(birthTs);
  const birthYear  = birthDate.getFullYear();
  const today      = new Date();
  const weeksLived = Math.floor((today - birthDate) / (7 * 24 * 3600 * 1000));
  const totalWeeks = LIFE_EXPECTANCY_YEARS * WEEKS_PER_YEAR;
  const weeksLeft  = Math.max(0, totalWeeks - weeksLived);
  const pct        = ((Math.min(weeksLived, totalWeeks) / totalWeeks) * 100).toFixed(1);

  const [activeWeek, setActiveWeek] = useState(null);
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  
  // 1. ADDED REF HERE
  const currentWeekRef = useRef(null);

  // 2. ADDED SCROLL EFFECT HERE
  useEffect(() => {
    if (currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  const SQ  = 14;
  const GAP = 2;

  const handleSquareClick = useCallback((idx) => {
    if (idx === weeksLived) setActiveWeek(idx);
  }, [weeksLived]);

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", display: "flex", flexDirection: "column", position: "relative", fontFamily: "Courier New, monospace", color: "#f0e8d8" }}>
      <style>{`
        @keyframes mm-pulse {
          0%, 100% { box-shadow: 0 0 4px 2px rgba(220,80,30,0.9); }
          50%       { box-shadow: 0 0 10px 4px rgba(220,80,30,0.5); }
        }
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; font-size: 16px; }
        html, body { background: #0c0c0c; min-height: 100vh; }
        .lc-back { background: transparent; border: none; color: #c4b490; font-family: Courier New, monospace; font-size: 0.78rem; letter-spacing: 0.15em; cursor: pointer; transition: color 0.2s; padding: 0.2rem; }
        .lc-back:hover { color: #f0e8d8; }
        .lc-face { color: #c4b490; transition: color 0.2s; }
        .lc-face:hover { color: #f0e8d8; }
        .lc-sq-current { cursor: pointer; }
        .lc-sq-current:hover { box-shadow: 0 0 14px 5px rgba(220,80,30,1) !important; }
        ::selection { background: rgba(220,200,160,0.2); color: #f0e8d8; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: #0c0c0c; }
        ::-webkit-scrollbar-thumb { background: rgba(220,200,160,0.2); }

        @media (max-width: 500px) {
          .lc-row-desktop { display: none !important; }
          .lc-row-mobile  { display: flex !important; }
          .lc-grid-sq { width: 10px !important; height: 10px !important; }
          .lc-year-label { font-size: 7px !important; min-width: 24px !important; }
        }
        @media (min-width: 501px) {
          .lc-row-desktop { display: flex !important; }
          .lc-row-mobile  { display: none !important; }
        }
      `}</style>

      <BgCanvas />
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.82) 100%)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.3, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")` }} />
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

      {/* ── fixed header ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, width: "100%", background: "rgba(12,12,12,0.95)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", padding: "1.2rem 1.5rem 0.9rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.9rem" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", width: "100%" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(220,200,160,0.4), transparent)" }} />
            <h1 style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: "bold", letterSpacing: "0.3em", color: "#f0e8d8", margin: 0, whiteSpace: "nowrap" }}>
              MEMENTO MORI
            </h1>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(220,200,160,0.4), transparent)" }} />
          </div>

          <p style={{ fontSize: "clamp(0.7rem, 1.3vw, 0.85rem)", fontStyle: "italic", color: "#c4b490", letterSpacing: "0.05em", lineHeight: 1.8, textAlign: "center", maxWidth: 520 }}>
            "{quote}"
          </p>
        </div>
      </div>

      {/* ── grid ── */}
      <div style={{ position: "relative", zIndex: 5, width: "100%", flex: 1, padding: "1.5rem 1rem 0", paddingTop: "120px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.8rem", paddingBottom: "3rem" }}>

          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", flexDirection: "column" }}>
            {Array.from({ length: LIFE_EXPECTANCY_YEARS }, (_, y) => {
              const age      = y;
              const rowA     = Array.from({ length: HALF }, (_, w) => y * WEEKS_PER_YEAR + w);
              const rowB     = Array.from({ length: HALF }, (_, w) => y * WEEKS_PER_YEAR + HALF + w);
              const showLabel = age % 5 === 0;

              const allWeeks = Array.from({ length: WEEKS_PER_YEAR }, (_, w) => y * WEEKS_PER_YEAR + w);

              return (
                <div key={y} style={{ display: "flex", alignItems: "center", gap: GAP, marginBottom: GAP }}>
                  <div
                    className="lc-year-label"
                    style={{ fontSize: "8px", color: showLabel ? "rgba(220,200,160,0.75)" : "transparent", minWidth: 36, textAlign: "right", paddingRight: 6, fontFamily: "Courier New,monospace", userSelect: "none", flexShrink: 0 }}
                  >
                    {showLabel ? birthYear + y : ""}
                  </div>

                  {/* desktop: 1 row of 52 */}
                  <div className="lc-row-desktop" style={{ display: "flex", gap: GAP }}>
                    {allWeeks.map((idx) => {
                      const isPast    = idx < weeksLived;
                      const isCurrent = idx === weeksLived;
                      return (
                        <div
                          key={idx}
                          className={isCurrent ? "lc-grid-sq lc-sq-current" : "lc-grid-sq"}
                          title={isCurrent ? "Click for this week" : undefined}
                          onClick={() => handleSquareClick(idx)}
                          style={{
                            width: SQ, height: SQ,
                            borderRadius: 1,
                            flexShrink: 0,
                            background: isPast ? "#9a2a18" : "transparent",
                            border: isCurrent ? "2px solid rgb(245,51,7)" : "1px solid rgba(220,200,160,0.2)",
                            animation: isCurrent ? "mm-pulse 1.6s ease-in-out infinite" : "none",
                            cursor: isCurrent ? "pointer" : "default",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* mobile: 2 rows of 26 */}
                  <div className="lc-row-mobile" style={{ display: "none", flexDirection: "column", gap: GAP }}>
                    {[rowA, rowB].map((row, ri) => (
                      <div key={ri} style={{ display: "flex", gap: GAP }}>
                        {row.map((idx) => {
                          const isPast    = idx < weeksLived;
                          const isCurrent = idx === weeksLived;
                          return (
                            <div
                              key={idx}
                              // 4. ALSO ATTACHED REF HERE FOR MOBILE VIEW
                              ref={isCurrent ? currentWeekRef : null}
                              className={isCurrent ? "lc-grid-sq lc-sq-current" : "lc-grid-sq"}
                              title={isCurrent ? "Click for this week" : undefined}
                              onClick={() => handleSquareClick(idx)}
                              style={{
                                width: SQ, height: SQ,
                                borderRadius: 1,
                                flexShrink: 0,
                                background: isPast ? "#9a2a18" : "transparent",
                                border: isCurrent ? "2px solid rgb(245,51,7)" : "1px solid rgba(220,200,160,0.2)",
                                animation: isCurrent ? "mm-pulse 1.6s ease-in-out infinite" : "none",
                                cursor: isCurrent ? "pointer" : "default",
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <button className="lc-back" style={{ alignSelf: "center" }} onClick={onBack}>← back</button>

          <div style={{ fontSize: "0.62rem", letterSpacing: "0.25em", color: "#c4b490", textAlign: "center", lineHeight: 2, alignSelf: "center" }}>
            * MEMENTO MORI * TEMPUS FUGIT * CARPE DIEM *<br />
            <span style={{ letterSpacing: "0.12em", fontSize: "0.58rem" }}>
              made by{" "}
              <Link href="https://artt-folio.vercel.app/" target="_self" rel="noopener noreferrer">
                <span className="lc-face">Pemba Sherpa</span>
              </Link>
            </span>
          </div>
        </div>
      </div>

      {activeWeek !== null && (
        <WeekPopup
          weekIndex={activeWeek}
          birthTs={birthTs}
          onClose={() => setActiveWeek(null)}
        />
      )}
    </div>
  );
}