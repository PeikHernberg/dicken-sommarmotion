import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getSupabase } from "../lib/supabase";

const NAME_KEY = "dicken-name-v1";
const PERIOD_START = "2026-06-01";
const PERIOD_END = "2026-07-31";

function todayInPeriod() {
  const t = new Date();
  const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
  if (iso < PERIOD_START) return PERIOD_START;
  if (iso > PERIOD_END) return PERIOD_END;
  return iso;
}

const WARMUP = {
  title: "Uppvärmning",
  note: "Före BÅDA passen · ~10 min",
  items: [
    { name: "Lätt jogg / lätta skippings", reps: "3 min" },
    { name: "Bensvingar, gående utfall med bålvridning, höftöppnare", reps: "5 var" },
    {
      name: "A-skips, höga knän, sidoförflyttningar",
      reps: "2 × 15 m",
      video: "https://www.youtube.com/results?search_query=a+skip+running+drill+technique",
    },
    {
      name: "Pogo-hopp + mjuka landningar",
      reps: "2 × 8",
      video: "https://www.youtube.com/results?search_query=pogo+hops+soft+landing+drill",
    },
    {
      name: "Axelförberedelse: armcirklar + wall slides",
      reps: "10 var",
      video: "https://www.youtube.com/results?search_query=wall+slide+shoulder+mobility+exercise",
    },
  ],
};

const PASS_A = {
  tag: "Pass A",
  title: "Styrka & power",
  note: "~40 min",
  items: [
    {
      part: "Power",
      name: "Längdhopp från stående – landa stabilt",
      reps: "4 × 3",
      video: "https://www.youtube.com/results?search_query=standing+broad+jump+stick+landing+technique",
    },
    {
      part: "Power",
      name: "Tuck-hopp eller knäböjshopp – mjuk landning",
      reps: "3 × 4",
      video: "https://www.youtube.com/results?search_query=tuck+jump+exercise+form",
    },
    {
      part: "Underkropp",
      name: "Knäböj med egen kroppsvikt",
      hint: "Tyngre: 3 sek nedåt, eller paus i botten",
      reps: "3 × 10",
      video: "https://www.youtube.com/results?search_query=bodyweight+squat+proper+form",
    },
    {
      part: "Underkropp",
      name: "Bakåtutfall → utveckla till långsamma split squats",
      reps: "3 × 6 / ben",
      video: "https://www.youtube.com/results?search_query=reverse+lunge+technique",
    },
    {
      part: "Baksida",
      name: "Höftlyft på ett ben + hamstring-walkouts",
      reps: "3 × 8",
      video: "https://www.youtube.com/results?search_query=single+leg+glute+bridge+form",
      video2: "https://www.youtube.com/results?search_query=hamstring+walkout+exercise",
      video2Label: "▶ walkout",
    },
    {
      part: "Övre press",
      name: "Armhävningar: på knä → fulla",
      reps: "3 × så många med bra teknik",
      video: "https://www.youtube.com/results?search_query=push+up+progression+knee+to+full",
    },
    {
      part: "Övre drag",
      name: 'Superman "W-drag" (på mage, kläm ihop skulderbladen)',
      reps: "3 × 10",
      video: "https://www.youtube.com/results?search_query=prone+superman+W+raise+back+exercise",
    },
    {
      part: "Bål",
      name: "Dead bugs + omvända crunches",
      reps: "3 × 8",
      video: "https://www.youtube.com/results?search_query=dead+bug+exercise+tutorial",
    },
    {
      part: "Bål",
      name: "Rak planka",
      reps: "3 × 20–40 s",
      video: "https://www.youtube.com/results?search_query=front+plank+proper+form",
    },
  ],
  cooldown: "Nedvarvning: lätt stretch + 1 min lugn andning.",
};

const PASS_B = {
  tag: "Pass B",
  title: "Snabbhet, smidighet & kondition",
  note: "~40 min",
  items: [
    {
      part: "Snabbhet",
      name: "Accelerationssprinter, ~20 m, gå tillbaka",
      reps: "6 reps",
      video: "https://www.youtube.com/results?search_query=acceleration+sprint+drill+technique",
    },
    {
      part: "Smidighet",
      name: "5-10-5 shuttle (skor/flaskor som markörer)",
      hint: "Kontrollera vändningen",
      reps: "4–6 reps",
      video: "https://www.youtube.com/results?search_query=5-10-5+pro+agility+shuttle+drill",
    },
    {
      part: "Smidighet",
      name: "Snabba fötter över en linje (in-ut, sida till sida)",
      reps: "3–4 × 20 s",
      video: "https://www.youtube.com/results?search_query=line+hops+fast+feet+drill",
    },
    {
      part: "Plyo",
      name: "Sidohopp – landa stabilt varje gång",
      reps: "3 × 4 / sida",
      video: "https://www.youtube.com/results?search_query=lateral+bound+stick+landing+drill",
    },
    {
      part: "Plyo",
      name: "Enbenshopp för kontroll",
      reps: "3 × 3 / ben",
      video: "https://www.youtube.com/results?search_query=single+leg+hop+control+drill",
    },
    {
      part: "Kondition",
      name: "Shuttle-intervaller: 30 s hårt / 30 s lugnt",
      reps: "6–10 varv",
      video: "https://www.youtube.com/results?search_query=shuttle+run+conditioning+drill",
    },
    {
      part: "Bål",
      name: "Sidoplanka",
      reps: "3 × 20–30 s / sida",
      video: "https://www.youtube.com/results?search_query=side+plank+proper+form",
    },
    {
      part: "Baksida",
      name: "Höftlyft → höftlyft på ett ben",
      reps: "3 × 10",
      video: "https://www.youtube.com/results?search_query=glute+bridge+exercise+form",
    },
  ],
  cooldown: "Nedvarvning: stretch + extra axelrörlighet för kastarna.",
};

// Default logged hours per pass: ~10 min warm-up + ~40 min pass ≈ 50 min.
const PASS_HOURS = 0.75;

function VideoLink({ href, label = "▶ Se video" }) {
  return (
    <a className="tp-video" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function ExerciseRow({ item }) {
  return (
    <li className="tp-row">
      <div className="tp-rmain">
        {item.part && <span className="tp-part">{item.part}</span>}
        <span className="tp-name">{item.name}</span>
        {item.hint && <span className="tp-hint">{item.hint}</span>}
        <div className="tp-links">
          {item.video && <VideoLink href={item.video} />}
          {item.video2 && <VideoLink href={item.video2} label={item.video2Label} />}
        </div>
      </div>
      <span className="tp-reps">{item.reps}</span>
    </li>
  );
}

function PassCard({ pass, onStart, completedCount }) {
  return (
    <section className="tp-card">
      <div className="tp-chead">
        <span className="tp-ctag">{pass.tag}</span>
        <h2 className="tp-ctitle">{pass.title}</h2>
        <span className="tp-cnote">{pass.note}</span>
        {completedCount > 0 && (
          <span className="tp-count">
            ✅ Klarat {completedCount} {completedCount === 1 ? "gång" : "gånger"}
          </span>
        )}
      </div>
      <button className="tp-start" onClick={onStart}>
        ▶ Starta passet
      </button>
      <ul className="tp-list">
        {pass.items.map((item, i) => (
          <ExerciseRow key={i} item={item} />
        ))}
      </ul>
      <p className="tp-cooldown">{pass.cooldown}</p>
    </section>
  );
}

// Guided, one-exercise-at-a-time player with logging at the end.
function PassPlayer({ pass, onClose, onLogged }) {
  const steps = [
    ...WARMUP.items.map((it) => ({ ...it, part: it.part || "Uppvärmning" })),
    ...pass.items,
  ];
  const total = steps.length;

  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false); // reached completion screen
  const [name, setName] = useState("");
  const [hours, setHours] = useState(String(PASS_HOURS));
  const [date, setDate] = useState(todayInPeriod());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(NAME_KEY);
    if (stored) setName(stored);
  }, []);

  function next() {
    if (idx < total - 1) setIdx(idx + 1);
    else setDone(true);
  }
  function prev() {
    if (done) setDone(false);
    else if (idx > 0) setIdx(idx - 1);
  }

  async function logPass() {
    setError("");
    const cleanName = name.trim();
    const h = parseFloat(String(hours).replace(",", "."));
    if (!cleanName) return setError("Skriv ditt namn så passet hamnar på rätt spelare.");
    if (!hours || isNaN(h) || h <= 0) return setError("Ange hur länge passet tog.");
    if (h > 12) return setError("Max 12 timmar per pass.");

    setSaving(true);
    localStorage.setItem(NAME_KEY, cleanName);
    const { data, error: insertError } = await getSupabase()
      .from("entries")
      .insert({
        name: cleanName,
        hours: Math.round(h * 100) / 100,
        type: `${pass.tag} · ${pass.title}`,
        date,
        created_at: Date.now(),
      })
      .select()
      .single();
    if (insertError) setError("Kunde inte logga passet. Försök igen.");
    else {
      setSaved(true);
      onLogged?.(data, cleanName);
    }
    setSaving(false);
  }

  const step = steps[idx];
  const progress = done ? 100 : (idx / total) * 100;

  return (
    <div className="pp-root" role="dialog" aria-modal="true">
      <style>{`
        .pp-root{
          position:fixed;inset:0;z-index:50;
          background:radial-gradient(120% 120% at 0% 0%, #17374F 0%, #0E2A52 60%);
          color:#EAF1F8;display:flex;flex-direction:column;
          font-family:'Barlow',system-ui,sans-serif;-webkit-font-smoothing:antialiased;
        }
        .pp-top{display:flex;align-items:center;gap:14px;padding:18px 18px 0;}
        .pp-close{
          background:rgba(255,255,255,.1);border:none;color:#EAF1F8;border-radius:9px;
          width:38px;height:38px;font-size:18px;cursor:pointer;flex-shrink:0;
        }
        .pp-close:hover{background:rgba(255,255,255,.2);}
        .pp-passlabel{font-family:'Barlow Condensed',sans-serif;font-weight:700;
          letter-spacing:.14em;text-transform:uppercase;font-size:13px;color:#9FB4D2;}
        .pp-bar{height:6px;border-radius:6px;background:rgba(255,255,255,.12);
          margin:16px 18px 0;overflow:hidden;}
        .pp-barfill{height:100%;background:linear-gradient(90deg,#E11926,#FF3742);
          border-radius:6px;transition:width .35s ease;}
        .pp-body{flex:1;display:flex;flex-direction:column;justify-content:center;
          padding:24px 22px;max-width:620px;margin:0 auto;width:100%;}

        .pp-count{font-family:'Barlow Condensed',sans-serif;font-weight:700;
          letter-spacing:.1em;text-transform:uppercase;font-size:13px;color:#9FB4D2;margin-bottom:14px;}
        .pp-part{display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;
          letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#fff;
          background:#E11926;border-radius:6px;padding:3px 10px;margin-bottom:16px;}
        .pp-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;
          font-size:34px;line-height:1.1;margin-bottom:14px;}
        .pp-reps{font-family:'Barlow Condensed',sans-serif;font-weight:800;
          font-size:48px;line-height:1;color:#FF3742;font-variant-numeric:tabular-nums;margin-bottom:14px;}
        .pp-hint{font-size:15px;color:#9FB4D2;font-style:italic;line-height:1.5;margin-bottom:18px;}
        .pp-vids{display:flex;flex-wrap:wrap;gap:18px;margin-bottom:8px;}
        .pp-vid{font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.04em;
          font-size:16px;color:#7DB6FF;text-decoration:none;}
        .pp-vid:hover{text-decoration:underline;}

        .pp-nav{display:flex;gap:12px;padding:18px 22px 28px;max-width:620px;margin:0 auto;width:100%;}
        .pp-prev{flex:0 0 auto;background:rgba(255,255,255,.1);border:none;color:#EAF1F8;
          border-radius:12px;padding:16px 20px;font-family:'Barlow Condensed',sans-serif;
          font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:15px;cursor:pointer;}
        .pp-prev:hover{background:rgba(255,255,255,.2);}
        .pp-prev:disabled{opacity:.35;cursor:default;}
        .pp-next{flex:1;background:#E11926;border:none;color:#fff;border-radius:12px;padding:16px;
          font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:.06em;
          text-transform:uppercase;font-size:17px;cursor:pointer;transition:background .15s;}
        .pp-next:hover{background:#C0141F;}

        .pp-doneicon{font-size:56px;text-align:center;margin-bottom:8px;}
        .pp-donetitle{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:34px;
          text-align:center;line-height:1.1;margin-bottom:6px;}
        .pp-donesub{text-align:center;color:#9FB4D2;font-size:15px;margin-bottom:24px;line-height:1.5;}
        .pp-form{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
          border-radius:16px;padding:18px;}
        .pp-label{display:block;font-size:12.5px;font-weight:600;color:#9FB4D2;
          margin:0 0 5px;letter-spacing:.02em;}
        .pp-field{margin-bottom:13px;}
        .pp-row2{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
        .pp-input{width:100%;border:1.5px solid rgba(255,255,255,.18);border-radius:10px;
          padding:12px;font-size:16px;font-family:inherit;color:#EAF1F8;background:rgba(255,255,255,.06);}
        .pp-input:focus{outline:none;border-color:#FF3742;}
        .pp-input::placeholder{color:#6C7F9A;}
        .pp-logbtn{width:100%;margin-top:4px;border:none;border-radius:12px;padding:15px;
          background:#E11926;color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:800;
          letter-spacing:.06em;text-transform:uppercase;font-size:17px;cursor:pointer;}
        .pp-logbtn:hover{background:#C0141F;}
        .pp-logbtn:disabled{opacity:.6;cursor:default;}
        .pp-err{color:#FF8A80;font-size:14px;margin-top:10px;font-weight:500;}
        .pp-savedbtn{display:inline-flex;align-items:center;justify-content:center;width:100%;
          margin-top:16px;background:rgba(255,255,255,.1);border:none;color:#EAF1F8;border-radius:12px;
          padding:15px;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.06em;
          text-transform:uppercase;font-size:16px;text-decoration:none;cursor:pointer;}
        .pp-savedbtn:hover{background:rgba(255,255,255,.2);}

        @media (max-width:560px){
          .pp-name{font-size:28px;}
          .pp-reps{font-size:40px;}
        }
      `}</style>

      <div className="pp-top">
        <button className="pp-close" onClick={onClose} aria-label="Avsluta passet">✕</button>
        <span className="pp-passlabel">{pass.tag} · {pass.title}</span>
      </div>
      <div className="pp-bar"><div className="pp-barfill" style={{ width: `${progress}%` }} /></div>

      {!done ? (
        <>
          <div className="pp-body">
            <div className="pp-count">Steg {idx + 1} av {total}</div>
            <span className="pp-part">{step.part}</span>
            <div className="pp-name">{step.name}</div>
            <div className="pp-reps">{step.reps}</div>
            {step.hint && <div className="pp-hint">{step.hint}</div>}
            {(step.video || step.video2) && (
              <div className="pp-vids">
                {step.video && (
                  <a className="pp-vid" href={step.video} target="_blank" rel="noopener noreferrer">▶ Se video</a>
                )}
                {step.video2 && (
                  <a className="pp-vid" href={step.video2} target="_blank" rel="noopener noreferrer">{step.video2Label}</a>
                )}
              </div>
            )}
          </div>
          <div className="pp-nav">
            <button className="pp-prev" onClick={prev} disabled={idx === 0}>← Tillbaka</button>
            <button className="pp-next" onClick={next}>
              {idx === total - 1 ? "Klar med passet ✓" : "Klart – nästa →"}
            </button>
          </div>
        </>
      ) : (
        <div className="pp-body">
          {saved ? (
            <>
              <div className="pp-doneicon">✅</div>
              <div className="pp-donetitle">Passet är loggat!</div>
              <div className="pp-donesub">
                Snyggt jobbat. Dina {fmtHours(hours)} h är tillagda i topplistan.
              </div>
              <Link href="/" className="pp-savedbtn">Se topplistan →</Link>
              <button className="pp-savedbtn" onClick={onClose}>Tillbaka till planen</button>
            </>
          ) : (
            <>
              <div className="pp-doneicon">💪</div>
              <div className="pp-donetitle">Bra jobbat – {pass.tag} klart!</div>
              <div className="pp-donesub">Logga passet så räknas det i lagets gemensamma timmar.</div>
              <div className="pp-form">
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-name">Namn</label>
                  <input
                    id="pp-name"
                    className="pp-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ditt namn"
                  />
                </div>
                <div className="pp-row2">
                  <div className="pp-field">
                    <label className="pp-label" htmlFor="pp-hours">Timmar</label>
                    <input
                      id="pp-hours"
                      className="pp-input"
                      type="number"
                      min="0.25"
                      max="12"
                      step="0.25"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  <div className="pp-field">
                    <label className="pp-label" htmlFor="pp-date">Datum</label>
                    <input
                      id="pp-date"
                      className="pp-input"
                      type="date"
                      value={date}
                      min={PERIOD_START}
                      max={PERIOD_END}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <button className="pp-logbtn" onClick={logPass} disabled={saving}>
                  {saving ? "Loggar…" : "Logga passet"}
                </button>
                {error && <div className="pp-err">{error}</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function fmtHours(h) {
  return Number(String(h).replace(",", ".")).toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

export default function Traningsplan() {
  const [active, setActive] = useState(null); // PASS_A | PASS_B | null
  const [entries, setEntries] = useState([]);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(NAME_KEY);
    if (stored) setPlayerName(stored);

    getSupabase()
      .from("entries")
      .select("*")
      .then(({ data, error }) => {
        if (!error) setEntries(data || []);
      });
  }, []);

  const sessionCounts = useMemo(() => {
    const key = playerName.trim().toLowerCase();
    const counts = { [PASS_A.tag]: 0, [PASS_B.tag]: 0 };
    if (!key) return counts;
    for (const e of entries) {
      if (e.name.trim().toLowerCase() !== key) continue;
      if (e.type?.startsWith(PASS_A.tag)) counts[PASS_A.tag] += 1;
      else if (e.type?.startsWith(PASS_B.tag)) counts[PASS_B.tag] += 1;
    }
    return counts;
  }, [entries, playerName]);

  function handleLogged(entry, name) {
    setEntries((prev) => [entry, ...prev]);
    setPlayerName(name);
  }

  return (
    <>
      <Head>
        <title>Sommarens två träningspass · Dicken</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="De två träningspassen att följa under sommaren — styrka, power, snabbhet och kondition." />
      </Head>
      <div className="tp-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');
          *{box-sizing:border-box;margin:0;padding:0;}
          html,body{height:100%;}
          .tp-root{
            --ink:#15233D;--panel:#0E2A52;--paper:#ECF0F6;--card:#FFFFFF;
            --line:#E2E8F1;--muted:#6C7F9A;--muted-d:#9FB4D2;--red:#E11926;--red-2:#FF3742;
            font-family:'Barlow',system-ui,-apple-system,sans-serif;
            background:var(--paper);color:var(--ink);
            padding:24px 14px 56px;min-height:100vh;
            -webkit-font-smoothing:antialiased;
          }
          .tp-wrap{max-width:760px;margin:0 auto;}
          .tp-back{
            display:inline-flex;align-items:center;gap:6px;
            font-size:13.5px;font-weight:600;color:var(--muted);
            text-decoration:none;margin-bottom:22px;
          }
          .tp-back:hover{color:var(--red);}

          .tp-hero{
            background:radial-gradient(120% 140% at 0% 0%, #17374F 0%, var(--panel) 55%);
            border-radius:18px;padding:26px 24px 28px;color:#EAF1F8;
            box-shadow:0 14px 40px -22px rgba(8,20,35,.6);margin-bottom:18px;
          }
          .tp-eyebrow{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;
            letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:var(--red-2);
          }
          .tp-title{
            font-family:'Barlow Condensed',sans-serif;font-weight:800;
            font-size:36px;line-height:1.05;margin:8px 0 8px;
          }
          .tp-intro{color:var(--muted-d);font-size:14.5px;line-height:1.6;font-weight:500;}
          .tp-you{color:var(--muted-d);font-size:13px;font-weight:600;margin-top:10px;}

          .tp-tips{
            background:#fff;border:1px solid var(--line);border-radius:14px;
            padding:16px 18px;margin-bottom:18px;
          }
          .tp-tips h3{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;
            letter-spacing:.1em;font-size:14px;color:var(--ink);margin-bottom:10px;
          }
          .tp-tips ul{padding-left:18px;}
          .tp-tips li{font-size:14px;line-height:1.6;color:#334155;margin-bottom:6px;}

          .tp-card{
            background:var(--card);border:1px solid var(--line);border-radius:16px;
            padding:18px 18px 20px;margin-bottom:18px;
          }
          .tp-chead{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px;margin-bottom:14px;
            padding-bottom:12px;border-bottom:2px solid var(--line);}
          .tp-ctag{
            font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:13px;
            letter-spacing:.1em;text-transform:uppercase;color:#fff;background:var(--red);
            border-radius:6px;padding:3px 9px;
          }
          .tp-ctitle{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:24px;
            line-height:1;color:var(--ink);}
          .tp-cnote{font-size:13px;color:var(--muted);font-weight:600;margin-left:auto;}
          .tp-count{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:12.5px;
            letter-spacing:.03em;color:#0F7A3D;background:#E6F6EC;
            border-radius:7px;padding:4px 9px;width:100%;
          }

          .tp-start{
            width:100%;border:none;border-radius:11px;padding:14px;cursor:pointer;
            background:var(--red);color:#fff;font-family:'Barlow Condensed',sans-serif;
            font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:16px;
            margin-bottom:16px;transition:background .15s,transform .08s;
          }
          .tp-start:hover{background:#C0141F;}
          .tp-start:active{transform:translateY(1px);}

          .tp-list{list-style:none;}
          .tp-row{display:flex;align-items:flex-start;gap:14px;padding:13px 0;
            border-bottom:1px solid var(--line);}
          .tp-row:last-child{border-bottom:none;}
          .tp-rmain{flex:1;min-width:0;}
          .tp-part{
            display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;
            letter-spacing:.08em;text-transform:uppercase;font-size:10.5px;color:var(--muted);
            background:var(--paper);border-radius:5px;padding:2px 7px;margin-bottom:5px;
          }
          .tp-name{display:block;font-weight:600;font-size:15px;line-height:1.4;color:var(--ink);}
          .tp-hint{display:block;font-size:12.5px;color:var(--muted);font-style:italic;margin-top:2px;}
          .tp-links{display:flex;flex-wrap:wrap;gap:14px;margin-top:7px;}
          .tp-video{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.04em;
            font-size:13px;color:var(--red);text-decoration:none;
          }
          .tp-video:hover{text-decoration:underline;}
          .tp-reps{
            font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:16px;
            color:var(--ink);white-space:nowrap;text-align:right;flex-shrink:0;
            font-variant-numeric:tabular-nums;padding-top:1px;
          }
          .tp-cooldown{margin-top:14px;font-size:13.5px;color:var(--muted);
            font-style:italic;line-height:1.5;}
          .tp-wnote{margin-top:4px;font-size:13px;color:var(--muted);line-height:1.5;}

          .tp-foot{text-align:center;margin-top:24px;}
          .tp-foot a{
            display:inline-flex;align-items:center;gap:6px;font-family:'Barlow Condensed',sans-serif;
            font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:14px;
            color:#fff;background:var(--red);border-radius:10px;padding:12px 22px;text-decoration:none;
          }
          .tp-foot a:hover{background:#C0141F;}

          @media (max-width:560px){
            .tp-title{font-size:30px;}
            .tp-cnote{margin-left:0;width:100%;}
          }
        `}</style>

        <div className="tp-wrap">
          <Link href="/" className="tp-back">← Tillbaka till appen</Link>

          <section className="tp-hero">
            <div className="tp-eyebrow">Dicken · Sommarträning</div>
            <h1 className="tp-title">Sommarens två träningspass</h1>
            <p className="tp-intro">
              Två pass i veckan, ingen utrustning krävs. Tryck <strong>▶ Starta passet</strong> så
              guidas du genom uppvärmning och alla övningar – en i taget – och loggar passet när du
              är klar.
            </p>
            {playerName && (
              <p className="tp-you">Visar din statistik som <strong>{playerName}</strong>.</p>
            )}
          </section>

          <div className="tp-tips">
            <h3>Tänk på</h3>
            <ul>
              <li>Allt går att göra helt utan utrustning.</li>
              <li>Hopp och landningar är <strong>kvalitet före kvantitet</strong> — mjuka, tysta landningar med knäna i linje med tårna.</li>
              <li>Det är det viktigaste i hela planen, och bästa skyddet för knän och korsband.</li>
            </ul>
          </div>

          <section className="tp-card">
            <div className="tp-chead">
              <span className="tp-ctag">Före varje pass</span>
              <h2 className="tp-ctitle">{WARMUP.title}</h2>
              <span className="tp-cnote">{WARMUP.note}</span>
            </div>
            <ul className="tp-list">
              {WARMUP.items.map((item, i) => (
                <ExerciseRow key={i} item={item} />
              ))}
            </ul>
            <p className="tp-wnote">Uppvärmningen ingår automatiskt när du startar Pass A eller Pass B.</p>
          </section>

          <PassCard
            pass={PASS_A}
            onStart={() => setActive(PASS_A)}
            completedCount={sessionCounts[PASS_A.tag]}
          />
          <PassCard
            pass={PASS_B}
            onStart={() => setActive(PASS_B)}
            completedCount={sessionCounts[PASS_B.tag]}
          />

          <div className="tp-foot">
            <Link href="/">Till topplistan →</Link>
          </div>
        </div>
      </div>

      {active && (
        <PassPlayer pass={active} onClose={() => setActive(null)} onLogged={handleLogged} />
      )}
    </>
  );
}
