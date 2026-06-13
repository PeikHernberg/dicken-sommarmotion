import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getSupabase } from "../lib/supabase";

const ACCESS_CODE = "DickenF12";
const ACCESS_KEY = "dicken-access-v1";

function CodeGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);

  function attempt() {
    if (input.trim() === ACCESS_CODE) {
      localStorage.setItem(ACCESS_KEY, "1");
      onUnlock();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setInput("");
    }
  }

  function onKey(e) {
    if (e.key === "Enter") attempt();
  }

  return (
    <>
      <Head>
        <title>Dicken · Sommarmotion 2026</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="gate-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');
          *{box-sizing:border-box;margin:0;padding:0;}
          html,body{height:100%;}
          .gate-root{
            min-height:100vh;
            background:radial-gradient(120% 140% at 0% 0%, #17374F 0%, #0E2A52 55%);
            display:flex;align-items:center;justify-content:center;
            font-family:'Barlow',system-ui,sans-serif;
            -webkit-font-smoothing:antialiased;
            padding:20px;
          }
          .gate-card{
            background:#fff;border-radius:20px;padding:40px 36px 36px;
            width:100%;max-width:380px;
            box-shadow:0 24px 60px -16px rgba(8,20,35,.5);
          }
          .gate-eye{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;
            letter-spacing:.22em;text-transform:uppercase;font-size:12px;
            color:#E11926;margin-bottom:12px;
          }
          .gate-title{
            font-family:'Barlow Condensed',sans-serif;font-weight:800;
            font-size:32px;line-height:1.1;color:#15233D;margin-bottom:6px;
          }
          .gate-sub{font-size:14px;color:#6C7F9A;margin-bottom:28px;font-weight:500;}
          .gate-label{display:block;font-size:12.5px;font-weight:600;color:#6C7F9A;margin-bottom:6px;letter-spacing:.04em;}
          .gate-input{
            width:100%;border:1.5px solid #E2E8F1;border-radius:10px;
            padding:13px 14px;font-size:16px;font-family:inherit;color:#15233D;
            letter-spacing:.08em;transition:border-color .15s;
          }
          .gate-input:focus{outline:none;border-color:#E11926;}
          .gate-btn{
            width:100%;margin-top:14px;border:none;border-radius:10px;padding:14px;
            background:#E11926;color:#fff;font-family:'Barlow Condensed',sans-serif;
            font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:16px;
            cursor:pointer;transition:background .15s;
          }
          .gate-btn:hover{background:#C0141F;}
          @keyframes shake{
            0%,100%{transform:translateX(0);}
            20%,60%{transform:translateX(-8px);}
            40%,80%{transform:translateX(8px);}
          }
          .gate-shake{animation:shake .4s ease;}
        `}</style>
        <div className="gate-card">
          <div className="gate-eye">Dicken · Sommarmotion 2026</div>
          <div className="gate-title">Ange tillgångskod</div>
          <div className="gate-sub">Bara Dicken-spelare har tillgång. Koden får du av tränaren.</div>
          <label className="gate-label" htmlFor="gate-input">Kod</label>
          <input
            id="gate-input"
            className={`gate-input${shake ? " gate-shake" : ""}`}
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="••••••••••"
            autoFocus
          />
          <button className="gate-btn" onClick={attempt}>Gå vidare</button>
          <p style={{marginTop:"18px",textAlign:"center",fontSize:"12.5px",color:"#9FB4D2"}}>
            Genom att fortsätta godkänner du våra{" "}
            <a href="/villkor" style={{color:"#6C7F9A",textDecoration:"underline"}}>användarvillkor & integritetspolicy</a>.
          </p>
        </div>
      </div>
    </>
  );
}

const TYPES = [
  "Löpning",
  "Promenad",
  "Simning",
  "Cykling",
  "Gym & styrka",
  "Bollsport",
  "Annat",
];

const MILESTONES = [
  { goal: 1000, perWeek: 10 },
  { goal: 1500, perWeek: 15 },
  { goal: 2000, perWeek: 20 },
];
const MAX_GOAL = 2000;

const PERIOD_START = "2026-06-01";
const PERIOD_END = "2026-07-31";

const fmt = (n) =>
  Number(n).toLocaleString("sv-SE", { maximumFractionDigits: 1 });

function todayInPeriod() {
  const t = new Date();
  const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
  if (iso < PERIOD_START) return PERIOD_START;
  if (iso > PERIOD_END) return PERIOD_END;
  return iso;
}

function prettyDate(iso) {
  const months = [
    "jan", "feb", "mars", "apr", "maj", "juni",
    "juli", "aug", "sep", "okt", "nov", "dec",
  ];
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]}`;
}

export default function Page() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_KEY) === "1") setUnlocked(true);
    setChecking(false);
  }, []);

  if (checking) return null;
  if (!unlocked) return <CodeGate onUnlock={() => setUnlocked(true)} />;
  return <SommarMotion />;
}

function SommarMotion() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  const [name, setName] = useState("");
  const [hours, setHours] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [other, setOther] = useState("");
  const [date, setDate] = useState(todayInPeriod());
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setDbError(false);
    const { data, error: fetchError } = await getSupabase()
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (fetchError) {
      setDbError(true);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(
    () => entries.reduce((s, e) => s + (Number(e.hours) || 0), 0),
    [entries]
  );

  const leaderboard = useMemo(() => {
    const map = new Map();
    for (const e of entries) {
      const key = e.name.trim().toLowerCase();
      const cur = map.get(key) || { name: e.name.trim(), hours: 0, sessions: 0 };
      cur.hours += Number(e.hours) || 0;
      cur.sessions += 1;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.hours - a.hours);
  }, [entries]);

  const feed = useMemo(
    () =>
      [...entries].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return (b.created_at || 0) - (a.created_at || 0);
      }),
    [entries]
  );

  const fillPct = Math.min(total / MAX_GOAL, 1) * 100;
  const reachedCount = MILESTONES.filter((m) => total >= m.goal).length;

  async function add() {
    setError("");
    const cleanName = name.trim();
    const h = parseFloat(String(hours).replace(",", "."));
    if (!cleanName) return setError("Skriv ditt namn så vi vet vems timmar det är.");
    if (!hours || isNaN(h) || h <= 0)
      return setError("Ange hur många timmar du tränat.");
    if (h > 12) return setError("Max 12 timmar per pass. Dela upp långa dagar på flera rader.");
    if (type === "Annat" && !other.trim())
      return setError("Skriv kort vad du gjorde.");

    setSaving(true);
    const { data, error: insertError } = await getSupabase()
      .from("entries")
      .insert({
        name: cleanName,
        hours: Math.round(h * 100) / 100,
        type: type === "Annat" ? other.trim() : type,
        date,
        created_at: Date.now(),
      })
      .select()
      .single();

    if (insertError) {
      setError("Kunde inte spara passet. Försök igen.");
    } else {
      setEntries((prev) => [data, ...prev]);
      setHours("");
      setOther("");
    }
    setSaving(false);
  }

  async function remove(id) {
    const { error: delError } = await getSupabase()
      .from("entries")
      .delete()
      .eq("id", id);
    if (!delError) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setConfirmId(null);
  }

  return (
    <>
      <Head>
        <title>Dicken · Sommarmotion 2026</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Logga era träningstimmar för Dickens sommarmotion 2026" />
      </Head>
      <div className="sm-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');

          *{box-sizing:border-box;margin:0;padding:0;}
          html,body{height:100%;}

          .sm-root{
            --ink:#15233D; --panel:#0E2A52;
            --paper:#ECF0F6; --card:#FFFFFF; --line:#E2E8F1;
            --muted:#6C7F9A; --muted-d:#9FB4D2;
            --red:#E11926; --red-2:#FF3742; --blue:#2E7BD6; --blue-l:#7DB6FF;
            font-family:'Barlow',system-ui,-apple-system,sans-serif;
            color:var(--ink); background:var(--paper);
            padding:20px 14px 48px; min-height:100vh;
            -webkit-font-smoothing:antialiased;
          }
          .sm-wrap{max-width:880px;margin:0 auto;}

          .sm-hero{
            background:radial-gradient(120% 140% at 0% 0%, #17374F 0%, var(--panel) 55%);
            border-radius:18px; padding:28px 26px 30px; color:#EAF1F8;
            box-shadow:0 14px 40px -22px rgba(8,20,35,.6);
          }
          .sm-eyebrow{
            font-family:'Barlow Condensed',sans-serif; font-weight:700;
            letter-spacing:.22em; text-transform:uppercase; font-size:13px;
            color:var(--red-2);
          }
          .sm-total{
            font-family:'Barlow Condensed',sans-serif; font-weight:800;
            font-size:84px; line-height:.9; letter-spacing:-.01em;
            margin:8px 0 2px; font-variant-numeric:tabular-nums;
          }
          .sm-total small{font-size:30px;font-weight:700;color:var(--muted-d);margin-left:8px;}
          .sm-sub{color:var(--muted-d);font-size:15px;font-weight:500;margin-top:6px;}

          .sm-track{
            margin:26px 0 8px; height:18px; border-radius:20px;
            background:#0A1A2A; position:relative; overflow:hidden;
            border:1px solid rgba(255,255,255,.06);
          }
          .sm-fill{
            height:100%; border-radius:20px;
            background:linear-gradient(90deg,var(--red),var(--red-2));
            transition:width .9s cubic-bezier(.22,1,.36,1);
          }
          .sm-tick{position:absolute;top:-5px;bottom:-5px;width:2px;background:rgba(125,182,255,.55);}

          .sm-mile{
            display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px;
          }
          .sm-mcard{
            background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
            border-radius:12px;padding:12px 13px;
          }
          .sm-mcard.reached{border-color:rgba(46,123,214,.6);background:rgba(46,123,214,.16);}
          .sm-mtag{font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.12em;
            text-transform:uppercase;font-size:11px;color:var(--muted-d);}
          .sm-mgoal{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:26px;line-height:1;margin:3px 0 2px;color:#EAF1F8;}
          .sm-mnote{font-size:12.5px;color:var(--muted-d);}
          .sm-mstate{font-size:12.5px;font-weight:600;margin-top:6px;color:var(--red-2);}
          .sm-mstate.done{color:var(--blue-l);}

          .sm-stats{display:flex;gap:22px;margin-top:22px;flex-wrap:wrap;}
          .sm-stat b{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:22px;color:#EAF1F8;display:block;}
          .sm-stat span{display:block;font-size:12px;color:var(--muted-d);letter-spacing:.04em;}

          .sm-plan{
            display:inline-flex;align-items:center;gap:8px;margin-top:22px;
            font-family:'Barlow Condensed',sans-serif;font-weight:700;
            letter-spacing:.06em;text-transform:uppercase;font-size:14px;
            color:#EAF1F8;background:rgba(255,255,255,.08);
            border:1px solid rgba(255,255,255,.16);border-radius:10px;
            padding:11px 18px;text-decoration:none;transition:background .15s;
          }
          .sm-plan:hover{background:rgba(255,255,255,.16);}
          .sm-plan span{color:var(--red-2);}

          .sm-cols{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;margin-top:18px;}
          .sm-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px 20px 22px;}
          .sm-h{font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;
            letter-spacing:.1em;font-size:15px;color:var(--ink);margin:0 0 14px;}

          .sm-label{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin:0 0 5px;letter-spacing:.02em;}
          .sm-field{margin-bottom:13px;}
          .sm-input,.sm-select{
            width:100%;border:1.5px solid var(--line);border-radius:10px;
            padding:11px 12px;font-size:15px;font-family:inherit;color:var(--ink);background:#fff;
            transition:border-color .15s;
          }
          .sm-input:focus,.sm-select:focus{outline:none;border-color:var(--red);}
          .sm-row2{display:grid;grid-template-columns:1fr 1fr;gap:11px;}

          .sm-btn{
            width:100%;border:none;border-radius:10px;padding:13px;cursor:pointer;
            background:var(--red);color:#fff;font-family:'Barlow Condensed',sans-serif;
            font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:16px;
            transition:transform .08s, background .15s;margin-top:2px;
          }
          .sm-btn:hover{background:#C0141F;}
          .sm-btn:active{transform:translateY(1px);}
          .sm-btn:disabled{opacity:.6;cursor:default;}
          .sm-err{color:#C53B2E;font-size:13.5px;margin-top:9px;font-weight:500;}

          .sm-lb{list-style:none;}
          .sm-lbrow{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);}
          .sm-lbrow:last-child{border-bottom:none;}
          .sm-rank{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:18px;
            width:26px;color:var(--muted);text-align:center;flex-shrink:0;}
          .sm-rank.top{color:var(--red);}
          .sm-lbname{flex:1;font-weight:600;font-size:14.5px;min-width:0;}
          .sm-lbsess{font-size:12px;color:var(--muted);font-weight:500;}
          .sm-lbh{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:20px;font-variant-numeric:tabular-nums;}

          .sm-feed{margin-top:16px;}
          .sm-frow{display:flex;align-items:center;gap:13px;padding:12px 0;border-bottom:1px solid var(--line);}
          .sm-frow:last-child{border-bottom:none;}
          .sm-fmain{flex:1;min-width:0;}
          .sm-fname{font-weight:600;font-size:14.5px;}
          .sm-fmeta{font-size:12.5px;color:var(--muted);margin-top:1px;}
          .sm-fh{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:19px;white-space:nowrap;font-variant-numeric:tabular-nums;}
          .sm-x{background:none;border:none;color:var(--muted);font-size:12.5px;font-weight:600;cursor:pointer;padding:6px 8px;border-radius:7px;font-family:inherit;}
          .sm-x:hover{color:#C53B2E;background:#FBEDEB;}
          .sm-confirm{display:flex;gap:6px;}
          .sm-confirm button{font-size:12.5px;font-weight:600;border:none;border-radius:7px;padding:6px 10px;cursor:pointer;font-family:inherit;}
          .sm-yes{background:#C53B2E;color:#fff;}
          .sm-no{background:var(--line);color:var(--ink);}

          .sm-empty{color:var(--muted);font-size:14px;padding:14px 0;}
          .sm-foot{text-align:center;color:var(--muted);font-size:12.5px;margin-top:22px;}
          .sm-foot button{background:none;border:none;color:var(--red);font-weight:600;cursor:pointer;font-family:inherit;font-size:12.5px;text-decoration:underline;}
          .sm-warn{background:#FFF4E8;border:1px solid #FFD9AE;color:#8A4B12;border-radius:10px;padding:11px 13px;font-size:13px;margin-top:14px;}

          @media (max-width:640px){
            .sm-total{font-size:64px;}
            .sm-cols{grid-template-columns:1fr;}
            .sm-mile{grid-template-columns:1fr;}
          }
          @media (prefers-reduced-motion:reduce){
            .sm-fill{transition:none;}
          }
        `}</style>

        <div className="sm-wrap">
          <section className="sm-hero">
            <div className="sm-eyebrow">Dicken · sommarmotion · 1 juni–31 juli</div>
            <div className="sm-total">
              {loading ? "—" : fmt(total)}
              <small>h tillsammans</small>
            </div>
            <div className="sm-sub">
              {reachedCount === 0
                ? "Första delmålet väntar. Logga ert första pass nedan."
                : reachedCount === MILESTONES.length
                ? "Alla tre delmål uppnådda — starkt jobbat, hela laget!"
                : `${reachedCount} av 3 delmål klara. Fortsätt så!`}
            </div>

            <div
              className="sm-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={MAX_GOAL}
              aria-valuenow={Math.round(total)}
            >
              <div className="sm-fill" style={{ width: `${fillPct}%` }} />
              {MILESTONES.slice(0, -1).map((m) => (
                <div
                  key={m.goal}
                  className="sm-tick"
                  style={{ left: `${(m.goal / MAX_GOAL) * 100}%` }}
                />
              ))}
            </div>

            <div className="sm-mile">
              {MILESTONES.map((m, i) => {
                const done = total >= m.goal;
                const left = Math.max(0, m.goal - total);
                return (
                  <div key={m.goal} className={`sm-mcard${done ? " reached" : ""}`}>
                    <div className="sm-mtag">Delmål {i + 1}</div>
                    <div className="sm-mgoal">{m.goal} h</div>
                    <div className="sm-mnote">≈ {m.perWeek} h per spelare och vecka</div>
                    <div className={`sm-mstate${done ? " done" : ""}`}>
                      {done ? "Uppnått" : `${fmt(left)} h kvar`}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sm-stats">
              <div className="sm-stat">
                <b>{entries.length}</b>
                <span>pass loggade</span>
              </div>
              <div className="sm-stat">
                <b>{leaderboard.length}</b>
                <span>spelare med</span>
              </div>
              <div className="sm-stat">
                <b>{leaderboard.length ? fmt(total / leaderboard.length) : "0"}</b>
                <span>h i snitt per spelare</span>
              </div>
            </div>

            <Link href="/traningsplan" className="sm-plan">
              <span>▶</span> Sommarens två träningspass
            </Link>
          </section>

          {dbError && (
            <div className="sm-warn">
              Kunde inte ansluta till databasen. Kontrollera din anslutning och ladda om sidan.
            </div>
          )}

          <div className="sm-cols">
            <div className="sm-card">
              <h2 className="sm-h">Lägg till pass</h2>

              <div className="sm-field">
                <label className="sm-label" htmlFor="sm-name">Namn</label>
                <input
                  id="sm-name"
                  className="sm-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ditt namn"
                />
              </div>

              <div className="sm-row2">
                <div className="sm-field">
                  <label className="sm-label" htmlFor="sm-hours">Timmar</label>
                  <input
                    id="sm-hours"
                    className="sm-input"
                    type="number"
                    min="0.25"
                    max="12"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="t.ex. 1,5"
                  />
                </div>
                <div className="sm-field">
                  <label className="sm-label" htmlFor="sm-date">Datum</label>
                  <input
                    id="sm-date"
                    className="sm-input"
                    type="date"
                    value={date}
                    min={PERIOD_START}
                    max={PERIOD_END}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm-field">
                <label className="sm-label" htmlFor="sm-type">Hur tränade du?</label>
                <select
                  id="sm-type"
                  className="sm-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {type === "Annat" && (
                <div className="sm-field">
                  <label className="sm-label" htmlFor="sm-other">Vad gjorde du?</label>
                  <input
                    id="sm-other"
                    className="sm-input"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    placeholder="t.ex. paddling"
                  />
                </div>
              )}

              <button className="sm-btn" onClick={add} disabled={saving}>
                {saving ? "Sparar…" : "Lägg till timmar"}
              </button>
              {error && <div className="sm-err">{error}</div>}
            </div>

            <div className="sm-card">
              <h2 className="sm-h">Topplista</h2>
              {leaderboard.length === 0 ? (
                <p className="sm-empty">Ingen har loggat något än. Bli först!</p>
              ) : (
                <ol className="sm-lb">
                  {leaderboard.map((p, i) => (
                    <li key={p.name + i} className="sm-lbrow">
                      <span className={`sm-rank${i === 0 ? " top" : ""}`}>{i + 1}</span>
                      <span className="sm-lbname">
                        {p.name}
                        <span className="sm-lbsess"> · {p.sessions} pass</span>
                      </span>
                      <span className="sm-lbh">{fmt(p.hours)} h</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="sm-card sm-feed">
            <h2 className="sm-h">Senaste passen</h2>
            {feed.length === 0 ? (
              <p className="sm-empty">Här dyker era pass upp efter hand.</p>
            ) : (
              feed.map((e) => (
                <div key={e.id} className="sm-frow">
                  <div className="sm-fmain">
                    <div className="sm-fname">{e.name}</div>
                    <div className="sm-fmeta">{e.type} · {prettyDate(e.date)}</div>
                  </div>
                  <div className="sm-fh">{fmt(e.hours)} h</div>
                  {confirmId === e.id ? (
                    <div className="sm-confirm">
                      <button className="sm-yes" onClick={() => remove(e.id)}>Ta bort</button>
                      <button className="sm-no" onClick={() => setConfirmId(null)}>Avbryt</button>
                    </div>
                  ) : (
                    <button className="sm-x" onClick={() => setConfirmId(e.id)}>Ta bort</button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="sm-foot">
            Alla timmar samlas i en gemensam lista som alla med länken ser och kan fylla på.{" "}
            <button onClick={load}>Uppdatera</button>
            <br />
            <a href="/villkor" style={{color:"#6C7F9A",textDecoration:"underline",marginTop:"8px",display:"inline-block"}}>
              Användarvillkor & integritetspolicy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
