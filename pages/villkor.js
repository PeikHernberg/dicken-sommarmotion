import Head from "next/head";
import Link from "next/link";

export default function Villkor() {
  return (
    <>
      <Head>
        <title>Användarvillkor & Integritetspolicy · Dicken</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="v-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800&display=swap');
          *{box-sizing:border-box;margin:0;padding:0;}
          html,body{height:100%;}
          .v-root{
            font-family:'Barlow',system-ui,sans-serif;
            background:#ECF0F6;color:#15233D;
            padding:32px 16px 64px;
            -webkit-font-smoothing:antialiased;
          }
          .v-wrap{max-width:640px;margin:0 auto;}
          .v-back{
            display:inline-flex;align-items:center;gap:6px;
            font-size:13.5px;font-weight:600;color:#6C7F9A;
            text-decoration:none;margin-bottom:28px;
          }
          .v-back:hover{color:#E11926;}
          .v-eyebrow{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;
            letter-spacing:.2em;text-transform:uppercase;font-size:12px;
            color:#E11926;margin-bottom:10px;
          }
          .v-title{
            font-family:'Barlow Condensed',sans-serif;font-weight:800;
            font-size:36px;color:#15233D;margin-bottom:6px;
          }
          .v-updated{font-size:13px;color:#6C7F9A;margin-bottom:36px;}
          .v-section{margin-bottom:32px;}
          .v-section h2{
            font-family:'Barlow Condensed',sans-serif;font-weight:700;
            font-size:18px;text-transform:uppercase;letter-spacing:.08em;
            color:#15233D;margin-bottom:10px;padding-bottom:8px;
            border-bottom:2px solid #E2E8F1;
          }
          .v-section p{font-size:15px;line-height:1.65;color:#334155;margin-bottom:10px;}
          .v-section ul{padding-left:20px;margin-top:6px;}
          .v-section li{font-size:15px;line-height:1.65;color:#334155;margin-bottom:6px;}
          .v-section a{color:#E11926;text-decoration:underline;}
          .v-highlight{
            background:#fff;border:1px solid #E2E8F1;border-radius:12px;
            padding:16px 18px;margin-top:10px;
          }
          .v-highlight p{margin:0;}
        `}</style>

        <div className="v-wrap">
          <Link href="/" className="v-back">← Tillbaka till appen</Link>

          <div className="v-eyebrow">Dicken · Sommarmotion 2026</div>
          <h1 className="v-title">Användarvillkor & Integritetspolicy</h1>
          <p className="v-updated">Gäller från 1 juni 2026</p>

          <div className="v-section">
            <h2>Vad appen gör</h2>
            <p>Den här appen låter dig och dina lagkamrater logga träningstimmar under sommaren. Alla med koden kan se varandras träning och topplistan.</p>
          </div>

          <div className="v-section">
            <h2>Vad vi sparar</h2>
            <p>Vi sparar följande information när du loggar ett pass:</p>
            <ul>
              <li><strong>Ditt namn</strong> — det du skriver in</li>
              <li><strong>Antal timmar</strong></li>
              <li><strong>Typ av träning</strong></li>
              <li><strong>Datum</strong></li>
            </ul>
            <div className="v-highlight">
              <p>Inget annat. Inget konto, ingen e-post, inget lösenord.</p>
            </div>
          </div>

          <div className="v-section">
            <h2>Vem ser din data?</h2>
            <p>Alla som har tillgångskoden kan se allt som loggas — namn, timmar och träningstyp. Tänk på det innan du skriver in ditt namn.</p>
          </div>

          <div className="v-section">
            <h2>Hur länge sparas datan?</h2>
            <p>Uppgifterna sparas under sommarcampets varaktighet och tas bort när perioden är slut (efter 31 juli 2026).</p>
          </div>

          <div className="v-section">
            <h2>GDPR — dina rättigheter</h2>
            <p>Enligt GDPR har du rätt att:</p>
            <ul>
              <li><strong>Se</strong> vad som sparats om dig</li>
              <li><strong>Rätta</strong> felaktiga uppgifter</li>
              <li><strong>Ta bort</strong> dina inlägg — det gör du direkt i appen via "Ta bort"-knappen</li>
            </ul>
            <p>Vill du ha hjälp med något av ovanstående, kontakta tränaren.</p>
          </div>

          <div className="v-section">
            <h2>Tredjepartstjänster</h2>
            <p>Appen använder <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a> för att lagra data. Supabase följer GDPR och datan lagras inom EU (Frankfurt, Tyskland).</p>
          </div>

          <div className="v-section">
            <h2>Kontakt</h2>
            <p>Frågor? Hör av dig till tränaren.</p>
          </div>
        </div>
      </div>
    </>
  );
}
