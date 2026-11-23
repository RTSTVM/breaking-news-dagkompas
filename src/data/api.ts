/**
 * Datalaag voor de productiesite. Alle schermen halen data uitsluitend via deze module.
 * Voorlopig mockdata (deterministische generator per datum); later te vervangen door een echte backend.
 */
export type Rights = "g" | "o" | "r";
export type NewsStatus = "ctl" | "ver" | "off" | "cor";
export type StepState = 0 | 1 | 2;

export interface NewsItem {
  time: string;
  headline: string;
  source: string;
  rights: Rights;
  status: NewsStatus;
  sourceType: string;
  link: string;
  secondConfirmation: string;
  rightsNote: string;
}
export interface Pick {
  title: string;
  reason: string;
  actueel: number;
  belang: number;
  urgent: number;
  score: number;
}
export interface Dropped {
  title: string;
  label: string;
  reason: string;
}
export interface DayData {
  day: string;
  today: boolean;
  scanned: number;
  news: NewsItem[];
  picks: Pick[];
  dropped: Dropped[];
  presenters: string[];
  durations: string[];
  production: StepState[][];
  /** Per item, per kanaal: "" = nog niet, "HH:MM" = gepost, "sHH:MM" = ingepland */
  posts: string[][];
  posted: number;
  confirmed: number;
  checking: number;
}

export const TODAY = "2026-11-23";
export const MIN_DAY = "2026-11-09";
export const TEST_DAY = "2026-11-18";
export const CHANNELS = ["YouTube", "Shorts", "TikTok", "Reels", "Facebook", "X", "LinkedIn", "FAST"];
export const STEPS = ["Tekst", "Stem", "Lipsync", "B-roll", "Render", "16:9", "9:16"];

const DG = ["ZONDAG", "MAANDAG", "DINSDAG", "WOENSDAG", "DONDERDAG", "VRIJDAG", "ZATERDAG"];
const MD = ["JANUARI", "FEBRUARI", "MAART", "APRIL", "MEI", "JUNI", "JULI", "AUGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DECEMBER"];
const dt = (s: string) => new Date(s + "T12:00:00");
const iso = (d: Date) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const addDays = (s: string, n: number) => {
  const d = dt(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
export const longDate = (s: string) => {
  const d = dt(s);
  return DG[d.getDay()] + " " + d.getDate() + " " + MD[d.getMonth()] + " " + d.getFullYear();
};
export const shortDay = (s: string) => {
  const d = dt(s);
  return (DG[d.getDay()] ?? "").slice(0, 2) + " " + d.getDate();
};
export const hhmm = (m: number) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

function mulberry(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Row = [string, string, string, Rights, NewsStatus, string, string, string, string];
const SRC: [string, Rights, string][] = [["ANP","g","Wire"],["Reuters","g","Wire"],["ANP","g","Wire"],["Reuters","g","Wire"],["NOS","o","Media"],["RTL Nieuws","o","Media"],["Bloomberg-bericht","o","Media"],["X (trending)","r","Social"],["Instagram / TikTok","r","Social"],["Eigen redactie","g","Redactie"]];
const POOL = ["Rente blijft ongewijzigd na vergadering centrale bank","Treinen rijden minder door werkzaamheden aan het spoor","Nieuwe cijfers: werkloosheid licht gedaald","Energieprijzen dalen voor de derde week op rij","Meer faillissementen in de horeca","Huizenprijzen stijgen in grote steden","Brandstofaccijns blijft voorlopig gelijk","Havenbedrijf meldt record aan containers","Inflatie lager dan verwacht","Supermarkten verlagen prijzen van basisproducten","Storm veroorzaakt hinder op wegen en spoor","Cyberaanval legt gemeentelijke diensten stil","Techbedrijf kondigt ontslagronde aan","Onderzoek: thuiswerken blijft populair","Vliegverkeer rond Schiphol loopt vertraging op","Nieuwe regels voor zzp'ers aangekondigd","Goudprijs bereikt hoogste stand van het jaar","Verkoop elektrische auto's neemt toe","Overheid investeert in netcongestie","Grote bank verhoogt spaarrente","Pakketbezorgers verwachten drukte","Boeren protesteren tegen nieuwe stikstofregels","Staking bij openbaar vervoer aangekondigd","Staatsobligaties onder druk door onzekerheid"];
const TESTNEWS: Row[] = [["12:05","Belastingplan op het nippertje aangenomen","ANP","g","off","Wire","Tweede Kamer, ANP-bericht","Officiële bron","Groen: feiten vrij te gebruiken, beeld via licentie"],["11:52","Dieselprijs stijgt: hogere marges bij raffinaderijen","Reuters","g","ver","Wire","reuters.com/…","ANP 11:55",""],["11:40","Gerucht: grote overname in de bouwsector","X (trending)","r","ctl","Social","x.com/… (trending)","Wacht op wire",""],["11:31","Black Friday: kortingen bij Amazon vaak schijn","Reuters","g","ver","Wire","reuters.com/…","WSJ-onderzoek",""],["11:18","AI-rally jaagt de dollar op","Reuters","g","ver","Wire","reuters.com/…","Bloomberg 11:22",""],["11:02","Japan stelt nieuwe staatsobligaties uit","Bloomberg-bericht","o","ver","Media","bloomberg.com/…","Reuters 11:20",""],["10:47","Brand bij chemisch bedrijf, omwonenden gewaarschuwd","Instagram / TikTok","r","ctl","Social","instagram.com/… (video)","Wacht op wire",""],["10:30","Aldi koopt cacao eerlijker in","RTL Nieuws","o","ver","Media","rtl.nl/…","ANP 10:41",""],["10:12","Correctie: dieselprijs gemiddeld € 2,35","Eigen redactie","g","cor","Redactie","intern","Prijsbord Shell",""]];
const TESTPICK: [string, string, number, number, number, number][] = [["Belastingplan aangenomen","Wire-bevestigd · raakt iedereen",88,92,70,9.1],["Dieselprijs stijgt","Prijs aan de pomp · 2 wires",80,84,75,8.6],["Black Friday-kortingen schijn","Seizoensgebonden · veel zoekverkeer",75,70,60,7.9],["AI-rally jaagt dollar op","Markt · alleen na wire-bevestiging",70,78,55,7.6],["Japan stelt obligaties uit","Ongebruikelijk · internationaal",66,74,50,7.2],["Aldi koopt cacao eerlijker in","Positief nieuws · afsluiter",55,60,40,6.5]];

const toNews = (x: Row): NewsItem => ({ time: x[0], headline: x[1], source: x[2], rights: x[3], status: x[4], sourceType: x[5], link: x[6], secondConfirmation: x[7], rightsNote: x[8] });

function generate(day: string): DayData {
  const today = day === TODAY;
  const r = mulberry(+day.replace(/-/g, ""));
  let rows: Row[] = [];
  let picks: Pick[];
  let scanned: number;
  if (day === TEST_DAY) {
    rows = TESTNEWS.map((x) => [...x] as Row);
    picks = TESTPICK.map((p) => ({ title: p[0], reason: p[1], actueel: p[2], belang: p[3], urgent: p[4], score: p[5] }));
    scanned = 143;
  } else {
    const start = Math.floor(r() * POOL.length), base = today ? 752 : 722;
    for (let i = 0; i < 12; i++) {
      const s = SRC[Math.floor(r() * SRC.length)]!;
      const head = POOL[(start + i * 5) % POOL.length]!;
      const m = base - i * (18 + Math.floor(r() * 14));
      let st: NewsStatus = "ver";
      let sec = s[0] === "ANP" ? "Reuters " + hhmm(m + 6) : "ANP " + hhmm(m + 9);
      if (s[1] === "r") {
        if ((today && i < 3) || r() > 0.6) { st = "ctl"; sec = "Wacht op wire"; } else sec = "ANP " + hhmm(m + 12);
      } else if (s[2] === "Wire" && r() > 0.6) st = "off";
      if (s[2] === "Redactie") { st = "cor"; sec = "Prijsbord / bronnen"; }
      rows.push([hhmm(m), head, s[0], s[1], st, s[2], s[0].toLowerCase().replace(/[^a-z]/g, "") + ".nl/…", sec, ""]);
    }
    const good = rows.filter((n) => n[4] !== "ctl").slice(0, 6);
    picks = good.map((n, i) => ({
      title: n[1],
      reason: i === 0 ? "Wire-bevestigd · raakt iedereen" : i % 2 ? "Veel zoekverkeer · 2 bronnen" : "Actueel · wire-bevestigd",
      actueel: Math.round(88 - i * 6 - r() * 3),
      belang: Math.round(90 - i * 6 - r() * 4),
      urgent: Math.round(72 - i * 6 - r() * 3),
      score: Math.round((9.2 - i * 0.55 - r() * 0.15) * 10) / 10,
    }));
    scanned = Math.round(118 + r() * 50);
  }
  const news = rows.map(toNews);
  const used = picks.map((p) => p.title);
  const dropped = news.filter((n) => !used.includes(n.headline)).slice(0, 3).map((n) => ({
    title: n.headline,
    label: n.status === "ctl" ? "Wacht op wire" : "Te laag",
    reason: n.status === "ctl" ? "Geen wire-bevestiging, niet als volledig item" : "Score onder de grens van 6,0",
  }));
  const presenters = picks.map((_, i) => (i % 2 ? "Anna" : "Chris"));
  const durations = picks.map(() => { const s = 36 + Math.floor(r() * 45); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); });
  const TP: StepState[][] = [[2,2,2,2,2,2,2],[2,2,2,2,2,2,2],[2,2,2,2,2,2,1],[2,2,1,2,0,0,0],[2,1,0,0,0,0,0],[1,0,0,0,0,0,0]];
  const production = picks.map((_, i) => (today ? TP[i]! : [2,2,2,2,2,2,2] as StepState[]));
  const t0 = day === TEST_DAY ? 610 : 630;
  const posts = picks.map((_, i) => CHANNELS.map((c, j) => {
    if (!today) return (c === "LinkedIn" || c === "X") && i === 1 && day !== TEST_DAY && r() > 0.5 ? "" : hhmm(t0 + i * 30 + j * 2 + (c === "FAST" ? 10 : 0));
    const doneN = [8,7,5,0,0,0][i]!, sched = [0,0,3,6,0,0][i]!;
    if (j < doneN && !(i === 1 && c === "LinkedIn")) return hhmm(750 + i * 30 + j * 2);
    if (j < doneN + sched && i >= 2) return "s" + hhmm(840 + i * 5 + j);
    return "";
  }));
  return {
    day, today, scanned, news, picks, dropped, presenters, durations, production, posts,
    posted: posts.filter((row) => row.some((v) => v && v[0] !== "s")).length,
    confirmed: news.filter((n) => n.status === "ver" || n.status === "off").length,
    checking: news.filter((n) => n.status === "ctl").length,
  };
}

/** Haal alle data van één dag op (YYYY-MM-DD). Async zodat een echte backend later past. */
export async function getDay(date: string): Promise<DayData> {
  return generate(date);
}
