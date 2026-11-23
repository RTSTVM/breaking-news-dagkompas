import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import logo from "@/assets/breaking-news-logo.png.asset.json";
import {
  CHANNELS, MIN_DAY, STEPS, TODAY, addDays, getDay, hhmm, longDate, shortDay,
  type DayData, type NewsStatus, type Rights,
} from "@/data/api";

const ST: Record<NewsStatus, [string, string]> = {
  ctl: ["Controle loopt", "c-ctl"], ver: ["Geverifieerd", "c-ver"], off: ["Officieel bevestigd", "c-off"], cor: ["Gecorrigeerd", "c-cor"],
};
const RG: Record<Rights, string> = { g: "Groen", o: "Oranje", r: "Rood" };
const RIGHTS_TEXT: Record<Rights, string> = { g: "Groen: vrij te gebruiken", o: "Oranje: voorwaarden of licentie controleren", r: "Rood: alleen als nieuwssignaal" };
type Tab = "scan" | "red" | "prod" | "soc";
type Filter = "alle" | NewsStatus;

function Chip({ k, t }: { k: NewsStatus; t: string }) {
  return <span className={`chip ${ST[k][1]}`}>{k === "cor" && t ? "Gecorrigeerd " + t.replace(":", ".") : ST[k][0]}</span>;
}
function Legend() {
  return (
    <div className="legend">
      <span><span className="dot g" />Groen: vrij bruikbaar</span>
      <span><span className="dot o" />Oranje: voorwaarden checken</span>
      <span><span className="dot r" />Rood: alleen als nieuwssignaal</span>
    </div>
  );
}

function Scan({ D, flt, setFlt, open, setOpen }: { D: DayData; flt: Filter; setFlt: (f: Filter) => void; open: number; setOpen: (i: number) => void }) {
  const f: [Filter, string][] = [["alle", "Alles"], ["ctl", "Controle loopt"], ["ver", "Geverifieerd"], ["off", "Officieel bevestigd"], ["cor", "Gecorrigeerd"]];
  const rows = D.news.map((n, i) => ({ n, i })).filter(({ n }) => flt === "alle" || n.status === flt);
  return (
    <>
      <div className="filters">
        {f.map(([k, l]) => (
          <button key={k} className={k === flt ? "on" : ""} onClick={() => { setFlt(k); setOpen(-1); }}>{l}</button>
        ))}
      </div>
      <table>
        <tbody>
          <tr><th>Tijd</th><th>Bericht</th><th>Bron</th><th>Rechten</th><th>Status</th></tr>
          {rows.map(({ n, i }) => [
            <tr key={i} className={`click ${i === open ? "open" : ""}`} onClick={() => setOpen(open === i ? -1 : i)}>
              <td className="mut nw">{n.time}</td>
              <td className="hd">{n.headline}</td>
              <td className="mut sm">{n.source}</td>
              <td className="nw"><span className={`dot ${n.rights}`} />{RG[n.rights]}</td>
              <td><Chip k={n.status} t={n.time} /></td>
            </tr>,
            i === open && (
              <tr key={i + "d"} className="det">
                <td colSpan={5}>
                  <div className="kv">
                    <div className="k">Bron</div><div>{n.source} · {n.sourceType}</div>
                    <div className="k">Link</div><div className="mut">{n.link}</div>
                    <div className="k">Ontvangen</div><div>{n.time}</div>
                    <div className="k">Tweede bevestiging</div><div>{n.secondConfirmation}</div>
                    <div className="k">Rechtenstatus</div><div>{n.rightsNote || RIGHTS_TEXT[n.rights]}</div>
                    <div className="k">Akkoord door</div><div>{n.status === "ctl" ? "—" : "Redactie"}</div>
                  </div>
                  {n.status === "ctl" && (
                    <div className="rule">Wordt pas een volledig item zodra ANP of Reuters het meldt. De status wisselt dan automatisch.</div>
                  )}
                </td>
              </tr>
            ),
          ])}
        </tbody>
      </table>
      <Legend />
    </>
  );
}

function Red({ D }: { D: DayData }) {
  return (
    <>
      {D.picks.map((p, i) => (
        <div className="item" key={i}>
          <div className="n">{i + 1}</div>
          <div>
            <div className="t">{p.title}</div>
            <div className="why">{p.reason}</div>
            <div className="bars">
              <span>Actueel</span><i className="h"><b style={{ width: p.actueel + "%" }} /></i>
              <span>Belang</span><i><b style={{ width: p.belang + "%" }} /></i>
              <span>Urgent</span><i><b style={{ width: p.urgent + "%" }} /></i>
            </div>
          </div>
          <div><span className="who">{D.presenters[i]}</span></div>
          <div className="sc">{String(p.score).replace(".", ",")}</div>
        </div>
      ))}
      <div className="drop">
        <h4>Afgevallen</h4>
        <table><tbody>
          {D.dropped.map((d, i) => (
            <tr key={i}><td className="hd">{d.title}</td><td><span className="pill">{d.label}</span></td><td className="mut sm">{d.reason}</td></tr>
          ))}
        </tbody></table>
      </div>
      <div className="rule"><b>Regel:</b> een gerucht van social media wordt pas een volledig item als ANP of Reuters het ook meldt. Gevoelige onderwerpen worden alleen gebracht met de tekst van de wire.</div>
      <div className="drop">
        <h4>Zo kiest de redactie</h4>
        <table><tbody>
          <tr><td className="hd">Actualiteit (40%)</td><td>hoe vers; wire-melding in de laatste 30 minuten telt zwaarst</td></tr>
          <tr><td className="hd">Belang (35%)</td><td>bereik: hoeveel mensen raakt het</td></tr>
          <tr><td className="hd">Urgentie (25%)</td><td>moet het vandaag, of kan het morgen</td></tr>
          <tr><td className="hd">Ondergrens</td><td>score 6,0; daaronder valt een bericht af</td></tr>
          <tr><td className="hd">Spreiding</td><td>maximaal 2 berichten per onderwerp; Chris en Anna wisselen af</td></tr>
        </tbody></table>
      </div>
    </>
  );
}

function Prod({ D }: { D: DayData }) {
  const t = D.today;
  return (
    <>
      {t ? (
        <div className="agent"><span className="l">Agent</span> Bezig met item 4 · lipsync · gestart 12:41</div>
      ) : (
        <div className="agent done"><span className="l">Klaar</span> Alle 6 items geproduceerd · laatste export {hhmm(660 + D.picks.length * 9)}</div>
      )}
      <table><tbody>
        <tr><th>#</th><th>Item</th><th>Wie</th><th>Duur</th><th>Stappen</th></tr>
        {D.picks.map((p, i) => (
          <tr key={i}>
            <td className="hd">{i + 1}</td><td className="hd">{p.title}</td><td className="nw">{D.presenters[i]}</td><td className="mut">{D.durations[i]}</td>
            <td><div className="steps">{D.production[i]!.map((s, j) => (
              <span key={j} className={`st ${s === 2 ? "ok" : s === 1 ? "run" : ""}`}>{STEPS[j]}</span>
            ))}</div></td>
          </tr>
        ))}
      </tbody></table>
      <div className="rule">Totale uitzending: intro → 6 items → outro. Het tijdlabel (laatste update) staat alleen in de losse item-exports, niet in de totale uitzending.</div>
      <div className="log">
        <b>{t ? "12:41" : "11:02"}</b> agent: item {t ? 4 : 6} lipsync gestart (HeyGen)<br />
        <b>{t ? "12:33" : "10:51"}</b> agent: item {t ? 3 : 5} export 16:9 klaar<br />
        <b>{t ? "12:20" : "10:40"}</b> agent: bumpers en banners geplaatst<br />
        <b>{t ? "12:05" : "10:12"}</b> agent: zes items gekozen door de redactie
      </div>
    </>
  );
}

function Soc({ D }: { D: DayData }) {
  return (
    <>
      <table><tbody>
        <tr><th>Item</th>{CHANNELS.map((c) => <th key={c} className="ch">{c}</th>)}</tr>
        {D.picks.map((p, i) => (
          <tr key={i}>
            <td className="hd nw">{i + 1} {p.title.split(" ").slice(0, 2).join(" ")}</td>
            {D.posts[i]!.map((v, j) => (
              <td key={j} className="ch">
                {v ? <span className={`mk ${v[0] === "s" ? "m-sch" : "m-ok"}`}>{v.replace("s", "")}</span> : <span className="mk m-no">—</span>}
              </td>
            ))}
          </tr>
        ))}
      </tbody></table>
      <div className="legend">
        <span><span className="mk m-ok">12:10</span> gepost</span>
        <span><span className="mk m-sch">14:00</span> ingepland</span>
        <span><span className="mk m-no">—</span> nog niet</span>
      </div>
      <div className="rule">Volledige uitzending: YouTube 12:00 · FAST 12:20 (herhaling 18:00). Verticale items alleen naar Shorts, TikTok en Reels.</div>
    </>
  );
}

export function Productiesite() {
  const [cur, setCur] = useState(TODAY);
  const [tab, setTab] = useState<Tab>("scan");
  const [flt, setFlt] = useState<Filter>("alle");
  const [open, setOpen] = useState(-1);
  const { data: D } = useQuery({ queryKey: ["day", cur], queryFn: () => getDay(cur), placeholderData: keepPreviousData });

  const go = (d: string) => { if (d < MIN_DAY || d > TODAY) return; setCur(d); setOpen(-1); setFlt("alle"); };
  const panels: [Tab, string, string][] = [
    ["scan", "NIEUWSSCANNER", "AL HET LAATSTE NIEUWS"],
    ["red", "REDACTIE", cur === TODAY ? "DE ITEMS VAN VANDAAG" : "DE ITEMS VAN " + longDate(cur).split(" ").slice(0, 3).join(" ")],
    ["prod", "PRODUCTIE", "STATUS VAN DE PRODUCTIE AGENT"],
    ["soc", "SOCIAL MEDIA", "GEPOST PER KANAAL"],
  ];
  const p = panels.find((x) => x[0] === tab)!;
  const strip = Array.from({ length: 9 }, (_, k) => addDays(TODAY, -(8 - k)));

  return (
    <div className="bn">
      <div className="top">
        <div className="in">
          <img src={logo.url} alt="Breaking News" />
          <div className="sp" />
          <div className="datebox">
            <button title="Vorige dag" disabled={cur <= MIN_DAY} onClick={() => go(addDays(cur, -1))}>◀</button>
            <div className="d">{longDate(cur)}</div>
            <button title="Volgende dag" disabled={cur >= TODAY} onClick={() => go(addDays(cur, 1))}>▶</button>
            <input type="date" min={MIN_DAY} max={TODAY} value={cur} onChange={(e) => e.target.value && go(e.target.value)} aria-label="Kies datum" />
            <button className="today" onClick={() => go(TODAY)}>Vandaag</button>
          </div>
        </div>
        <div className="strip">
          {strip.map((d) => (
            <button key={d} className={d === cur ? "on" : ""} onClick={() => go(d)}>{d === TODAY ? "Vandaag" : shortDay(d)}</button>
          ))}
        </div>
      </div>
      <div className="kpis">
        {D && (
          <>
            <div className="kpi"><b>{D.scanned}</b><span>Gescand</span></div>
            <div className="kpi"><b>{D.confirmed}</b><span>Bevestigd</span></div>
            <div className="kpi hot"><b>{D.checking}</b><span>Controle loopt</span></div>
            <div className="kpi"><b>6 / 6</b><span>Items gekozen</span></div>
            <div className="kpi"><b>{D.posted} / 6</b><span>Items gepost</span></div>
          </>
        )}
      </div>
      <nav>
        {panels.map(([k, name]) => (
          <button key={k} className={k === tab ? "on" : ""} onClick={() => setTab(k)}>{name}</button>
        ))}
      </nav>
      <main>
        {D && (
          <section className="panel">
            <div className="ph"><span className="tab">{p[2]}</span><div className="bar">{p[1]}</div></div>
            <div className="pb">
              {tab === "scan" && <Scan D={D} flt={flt} setFlt={setFlt} open={open} setOpen={setOpen} />}
              {tab === "red" && <Red D={D} />}
              {tab === "prod" && <Prod D={D} />}
              {tab === "soc" && <Soc D={D} />}
            </div>
          </section>
        )}
      </main>
      <div className="note">Mockup · alle namen, tijden en cijfers zijn voorbeeldwaarden · de editie van 18 november is de testuitzending.</div>
    </div>
  );
}
