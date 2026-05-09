"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

const LIFE_EXPECTANCY_YEARS = 77;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["S","M","T","W","T","F","S"];

const QUOTES = [
  "You are not promised tomorrow.", "The clock does not pause for the living.",
  "Every sunrise is borrowed time.", "Death is the only appointment you will never miss.",
  "You have already used some of your last days.", "The grave makes no exceptions.",
  "Time stolen cannot be returned.", "You are older now than you have ever been.",
  "The hours you waste are the hours you lose.", "No one escapes the final accounting.",
  "You will not remember most of today.", "The years ahead are fewer than the years behind.",
  "Live as if the clock were visible.", "Nothing lasts. Not even you.",
  "The calendar does not lie.", "Each X was a day you cannot reclaim.",
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
  "Every unlived day is a small death of its own.", "Time does not care about your plans.",
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
  "Make your days memorable before they become Xs.", "The present moment always will have been.",
  "You get one shot at today.", "Every ending was once a beginning.",
  "Your finite days are what make them precious.", "The world is richer for your being here - for now.",
  "Do not let the weight of tomorrow crush today.", "Even the longest life is a short story.",
  "You are already in the middle of your story.", "The past is fixed. The future is not. Now is.",
  "Each day is a door that closes behind you.", "You only regret the love you did not give.",
  "The universe does not keep score. You do.", "Your time is the only thing you can truly give.",
  "There are no ordinary moments.", "You are burning. Make it bright.",
  "Live so that the Xs were worth marking.", "The finale comes for everyone.",
  "You are not guaranteed a graceful exit.", "What matters will become clear at the end.",
  "The shortness of life is not an excuse - it is a reason.", "You already know what to do.",
  "Make the Xs count.", "The silence after is very long.",
  "Your unfinished business will stay unfinished.", "You are the only one who can waste your time.",
  "This moment, once gone, is gone entirely.", "Live as though death is real - because it is.",
  "You are a brief visitor in an ancient world.", "Time is the one thing you cannot make more of.",
  "The discipline of today is the freedom of tomorrow.", "Your days are a gift you did not earn.",
  "The march is constant and indifferent.", "You have enough days if you use them.",
  "Act now. The later you imagine may not come.", "The unlived life ends the same as the lived one.",
  "You are already on the other side of many lasts.", "What is enough? You may never know unless you ask.",
  "The ticking you hear is not a metaphor.", "You are running out of new first times.",
  "Even this sentence is consuming your finite days.", "Make it mean something.",
  "The question is not if. It is when.", "Live in a way that would make your final self proud.",
  "You are mortal. So is everyone you love.", "The world will be fine without you. Be fine with that.",
  "There is no version of this that does not end.", "Your life is happening right now.",
  "The exit is already decided. The path is not.", "Leave nothing important unsaid.",
  "You are the author of the days that remain.", "Time does not wait for grief to pass.",
  "The only day you can change is today.", "Your remaining Xs are not yet written.",
  "Death is certain. Meaning is optional. Choose.", "You are always in the middle of your only life.",
  "The last day will feel like any other. Until it does not.", "Begin.",
  "Every moment is the last of its kind.", "You cannot be remembered for what you did not do.",
  "The present is your only address.", "What you love, love now.",
  "The calendar is filling up whether you live or not.", "Do not die with a perfect plan and no action.",
  "Your life is not a waiting room.", "The hardest part is believing your time is valuable.",
  "Time reveals what matters. So does death.", "You are here. Briefly. Make it count.",
  "The finite life is the only kind there is.", "Start with today. Today is enough.",
  "Nothing is promised past this breath.", "The weight of what you did not do is the heaviest.",
  "Live so that every X was a day fully claimed.", "The light you carry is borrowed. Burn bright.",
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

function MonthGrid({ year, monthIdx, birthTs, today }) {
  const firstDay    = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p style={{
        fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
        letterSpacing: "0.06em",
        color: "#f0e8d8",
        marginBottom: "0.5rem",
        fontWeight: "bold",
        fontFamily: "Courier New, monospace",
      }}>
        {MONTH_NAMES[monthIdx]}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: "0.3rem" }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{
            textAlign: "center",
            fontSize: "clamp(0.6rem, 1vw, 0.72rem)",
            color: i === 0 || i === 6 ? "#e07060" : "#d8cfc4",
            letterSpacing: "0.03em",
            paddingBottom: "0.25rem",
            fontFamily: "Courier New, monospace",
            fontWeight: "600",
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: "2px" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const thisDate  = new Date(year, monthIdx, d);
          const isToday   = today.getFullYear() === year && today.getMonth() === monthIdx && today.getDate() === d;
          const isPast    = thisDate < today && !isToday;
          const isBefore  = birthTs !== null && thisDate < new Date(birthTs);
          const colIdx    = i % 7;
          const isWeekend = colIdx === 0 || colIdx === 6;

          let color = "#d8cfc4";
          if (isToday)        color = "#ff6030";
          else if (isBefore)  color = "rgba(120,100,80,0.4)";
          else if (isPast)    color = "rgba(160,110,90,0.7)";
          else if (isWeekend) color = "#d06650";

          return (
            <div key={i} style={{
              position: "relative",
              textAlign: "center",
              fontSize: "clamp(0.6rem, 1vw, 0.72rem)",
              lineHeight: "1.9em",
              color,
              borderRadius: isToday ? "50%" : 0,
              background: isToday ? "rgba(180,40,10,0.28)" : "transparent",
              boxShadow: isToday
                ? "0 0 12px 4px rgba(200,60,20,0.55), inset 0 -2px 6px rgba(200,60,20,0.35)"
                : "none",
              userSelect: "none",
            }}>
              {isPast && !isBefore && (
                <svg viewBox="0 0 10 10" style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  pointerEvents: "none", opacity: 0.75,
                }}>
                  <line x1="2" y1="2" x2="8" y2="8" stroke="#c04030" strokeWidth="1.6" strokeLinecap="round" />
                  <line x1="8" y1="2" x2="2" y2="8" stroke="#c04030" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
              {isToday && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "44%", borderRadius: "0 0 50% 50%",
                  background: "linear-gradient(to top, rgba(220,60,10,0.7), transparent)",
                  pointerEvents: "none",
                  animation: "mm-burn 1.8s ease-in-out infinite alternate",
                }} />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LifeCalendar({ birthTs, deathTs, onBack }) {
  const birthDate = new Date(birthTs);
  const birthYear = birthDate.getFullYear();
  const deathYear = birthYear + LIFE_EXPECTANCY_YEARS;
  const today     = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const totalDays   = Math.round((deathTs - birthTs) / 86400000);
  const elapsedDays = Math.max(0, Math.round((Date.now() - birthTs) / 86400000));
  const remainDays  = Math.max(0, totalDays - elapsedDays);
  const pct         = ((elapsedDays / totalDays) * 100).toFixed(1);

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c0c",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      fontFamily: "Courier New, monospace",
      color: "#f0e8d8",
    }}>
      <style>{`
        @keyframes mm-burn {
          from { opacity: 0.5; transform: scaleX(0.85); }
          to   { opacity: 1;   transform: scaleX(1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0c0c0c; min-height: 100vh; }

        .lc-nav-btn {
          background: transparent;
          border: 1px solid rgba(220,200,160,0.35);
          color: #e8dcc8;
          font-family: Courier New, monospace;
          font-size: clamp(0.7rem, 1.2vw, 0.85rem);
          letter-spacing: 0.15em;
          padding: 0.5rem 1.4rem;
          cursor: pointer;
          transition: all 0.18s;
          font-weight: 600;
        }
        .lc-nav-btn:hover {
          border-color: rgba(220,200,160,0.8);
          color: #ffffff;
          background: rgba(220,200,160,0.08);
        }
        .lc-nav-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }
        .lc-back {
          background: transparent;
          border: none;
          color: #c4b490;
          font-family: Courier New, monospace;
          font-size: 0.78rem;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0.4rem;
        }
        .lc-back:hover { color: #f0e8d8; }
        .lc-face { color: #c4b490; transition: color 0.2s; }
        .lc-face:hover { color: #f0e8d8; text-shadow: 0 0 20px rgba(220,200,160,0.4); }

        ::selection { background: rgba(220,200,160,0.2); color: #f0e8d8; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0c0c0c; }
        ::-webkit-scrollbar-thumb { background: rgba(220,200,160,0.2); }

        .lc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(1.2rem, 2.5vw, 2.5rem) clamp(1.4rem, 3vw, 3rem);
          width: 100%;
        }
        @media (max-width: 700px) {
          .lc-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.2rem 0.8rem;
          }
        }
        @media (max-width: 420px) {
          .lc-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem 0.6rem;
          }
        }
      `}</style>

      <BgCanvas />
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.82) 100%)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none", opacity: 0.3, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")` }} />
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

      <div style={{
        position: "relative", zIndex: 5, width: "100%",
        maxWidth: 1200, padding: "3rem 2rem 4rem",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "2rem",
      }}>

        {/* title */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", width: "100%" }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(220,200,160,0.45), transparent)" }} />
          <h1 style={{
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: "bold", letterSpacing: "0.3em",
            color: "#f0e8d8", margin: 0, whiteSpace: "nowrap",
            textShadow: "0 0 60px rgba(220,200,160,0.2)",
          }}>YOUR LIFE</h1>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(220,200,160,0.45), transparent)" }} />
        </div>

        {/* year nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <button
            className="lc-nav-btn"
            onClick={() => viewYear > birthYear && setViewYear(v => v - 1)}
            disabled={viewYear <= birthYear}
          >← PREV</button>

          <div style={{ textAlign: "center", minWidth: 130 }}>
            <p style={{
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              fontWeight: "bold", letterSpacing: "0.2em",
              color: "#f0e8d8", margin: 0,
              textShadow: "0 0 30px rgba(220,200,160,0.25)",
            }}>{viewYear}</p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#c4b490", marginTop: "0.2rem" }}>
              AGE {viewYear - birthYear}
            </p>
          </div>

          <button
            className="lc-nav-btn"
            onClick={() => viewYear < deathYear && setViewYear(v => v + 1)}
            disabled={viewYear >= deathYear}
          >NEXT →</button>
        </div>

        {/* calendar grid */}
        <div className="lc-grid">
          {months.map(m => (
            <MonthGrid key={m} year={viewYear} monthIdx={m} birthTs={birthTs} today={today} />
          ))}
        </div>

        {/* back */}
        <button className="lc-back" onClick={onBack}>← back</button>

        {/* quote */}
        <div style={{
          maxWidth: 520, textAlign: "center",
          width: "100%",
        }}>
          <p style={{
            fontSize: "clamp(0.78rem, 1.3vw, 0.92rem)",
            fontStyle: "italic",
            color: "#c4b490",
            letterSpacing: "0.05em",
            lineHeight: 2,
          }}>"{quote}"</p>
        </div>

        {/* footer */}
        <div style={{
          fontSize: "0.65rem", letterSpacing: "0.28em",
          color: "#c4b490", textAlign: "center", lineHeight: 2,
        }}>
          * MEMENTO MORI * TEMPUS FUGIT * CARPE DIEM *<br />
          <span style={{ letterSpacing: "0.15em", fontSize: "0.62rem" }}>
            made by{" "}
            <Link href="https://artt-folio.vercel.app/" target="_self" rel="noopener noreferrer">
              <span className="lc-face">pemba sherpa</span>
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
}
