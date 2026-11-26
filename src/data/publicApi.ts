/** Publieke nieuwsdata uit de Dagkompas-feeds; vervang uitsluitend deze laag voor een andere bron. */
export type Rubriek = "Binnenland" | "Buitenland" | "Economie" | "Tech" | "Sport" | "Cultuur en leven";
export interface Source { name: string; url: string }
export interface Item {
  id: string; time: string; headline: string; summary: string; rubriek: Rubriek;
  status: "geverifieerd" | "controle"; score: number; at: string; sources: Source[]; image?: ArticleImage | null; hasVideo?: boolean;
}
export interface Video { id: string; headline: string; presenter: string; duration: string; videoUrl: string; thumbUrl: string; at: string }
export interface Show { id: string; title: string; duration: string; videoUrl: string; thumbUrl: string; date: string }
export interface ArticleImage { url: string; credit: string; creditUrl: string; origin: string }
export interface ArticleVideo { videoUrl: string; thumbUrl: string; duration: string }
export interface Article { id: string; headline: string; rubriek: Rubriek; lead: string; body: string; at: string; time: string; sources: Source[]; image: ArticleImage | null; video: ArticleVideo | null }
export const RUBRIEKEN: { slug: string; name: Rubriek }[] = [
  {slug:"binnenland",name:"Binnenland"},{slug:"buitenland",name:"Buitenland"},
  {slug:"economie",name:"Economie"},{slug:"tech",name:"Tech"},
  {slug:"sport",name:"Sport"},{slug:"cultuur-en-leven",name:"Cultuur en leven"},
];
export const FEATURED_CATEGORIES: Rubriek[] = ["Buitenland", "Economie", "Tech", "Sport"];
const BASE = "https://raw.githubusercontent.com/RTSTVM/breaking-news-dagkompas/main/public/data/";
export const REFRESH_MS = 5 * 60_000;
const TZ = "Europe/Amsterdam";

interface RawSource { name?: string; url?: string }
interface RawNews { id: string; headline_nl: string; summary_nl?: string; rubriek: string; score?: number; verified_at: string; posted_at?: string; sources?: RawSource[] }
interface RawVideo { date?: string; position?: number; presenter?: string; cluster_id: string; headline_nl: string; rubriek?: string; duration_s?: number; video_url?: string; thumb_url?: string; produced_at: string }
interface RawShow { date?: string; title?: string; duration_s?: number; video_url?: string; thumb_url?: string; produced_at?: string }
interface RawArticle { id: string; headline: string; rubriek: string; lead?: string; body: string; published_at: string; sources?: RawSource[]; image?: { url?: string; credit?: string; credit_url?: string; origin?: string } | null; video?: { video_url?: string; thumb_url?: string; duration_s?: number } | null }
export interface Articles { articles?: RawArticle[] }
export interface Feed { generated?: string; news?: RawNews[] }
export interface Videos { generated?: string; videos?: RawVideo[]; show?: RawShow }

export function amsTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("nl-NL", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
}
const fmtDate = (d: Date) => d.toLocaleDateString("nl-NL", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
export function amsDate(now = new Date()): string { return fmtDate(now); }
/** Datum in Nederlandse tijd; lege string bij een onbekende datum. */
export function amsDateFromIso(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : fmtDate(d);
}
const isRubriek = (r: string): r is Rubriek => RUBRIEKEN.some(x => x.name === r);
const sources = (s?: RawSource[]): Source[] => (s ?? []).filter((x): x is Source => !!x.name && !!x.url);

export function mapNews(feed: Feed): Item[] {
  return (feed.news ?? []).filter(n => isRubriek(n.rubriek)).map(n => ({
    id: n.id, time: amsTime(n.posted_at ?? n.verified_at), headline: n.headline_nl, summary: n.summary_nl ?? "",
    rubriek: n.rubriek as Rubriek, status: "geverifieerd" as const, score: n.score ?? 0, at: n.posted_at ?? n.verified_at, sources: sources(n.sources),
  }));
}
export const duration = (sec = 0) => { const t = Math.max(0, Math.round(sec)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
/** De 6 nieuwste geproduceerde video's op produced_at. */
export function mapVideos(v: Videos): Video[] {
  return (v.videos ?? []).filter(x => x.video_url && x.thumb_url && !isNaN(Date.parse(x.produced_at)))
    .sort((a, b) => Date.parse(b.produced_at) - Date.parse(a.produced_at)).slice(0, 6)
    .map(x => ({ id: `${x.cluster_id}-${x.produced_at}`, headline: x.headline_nl, presenter: x.presenter ?? "", duration: duration(x.duration_s), videoUrl: x.video_url!, thumbUrl: x.thumb_url!, at: x.produced_at }));
}
/** De volledige uitzending; nul als "show" ontbreekt of beeld/bron mist. */
export function mapShow(v: Videos): Show | null {
  const s = v.show;
  if (!s || !s.video_url || !s.thumb_url) return null;
  const iso = s.date ?? s.produced_at ?? "";
  return { id: `show-${iso}`, title: s.title ?? "De uitzending", duration: duration(s.duration_s),
    videoUrl: s.video_url, thumbUrl: s.thumb_url, date: iso ? amsDateFromIso(iso) : "" };
}
/** Artikelen uit articles.json; leeg als het bestand ontbreekt. */
export function mapArticles(a: Articles): Article[] {
  return (a.articles ?? []).filter(x => x.id && x.body && isRubriek(x.rubriek)).map(x => ({
    id: x.id, headline: x.headline, rubriek: x.rubriek as Rubriek, lead: x.lead ?? "", body: x.body, at: x.published_at, time: amsTime(x.published_at), sources: sources(x.sources),
    image: x.image?.url ? { url: x.image.url, credit: x.image.credit ?? "", creditUrl: x.image.credit_url ?? "", origin: x.image.origin ?? "pexels" } : null,
    video: x.video?.video_url ? { videoUrl: x.video.video_url, thumbUrl: x.video.thumb_url ?? "", duration: duration(x.video.duration_s) } : null,
  }));
}
/** Hoogste score van de laatste 24 uur, bij gelijke score de nieuwste; 4 stuks. */
export function topNews(news: Item[], now = Date.now()): Item[] {
  return news.filter(n => now - new Date(n.at).getTime() <= 24 * 3600_000)
    .sort((a, b) => b.score - a.score || new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 4);
}
export const byCategory = (news: Item[], r: Rubriek) => news.filter(n => n.rubriek === r);

async function getJson<T>(file: string): Promise<T> {
  const res = await fetch(BASE + file, { cache: "no-store" });
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  return res.json() as Promise<T>;
}
export interface PublicData { latest: Item[]; topNews: Item[]; latestVideos: Video[]; show: Show | null; articles: Article[]; categories: { rubriek: Rubriek; items: Item[] }[]; generated?: string }
export function buildPublicData(feed: Feed, videos: Videos, now = Date.now(), articlesRaw: Articles = {}): PublicData {
  const articles = mapArticles(articlesRaw);
  const byId = new Map(articles.map(a => [a.id, a]));
  const merged = mapNews(feed).map(n => { const a = byId.get(n.id); return a ? { ...n, image: a.image, hasVideo: !!a.video } : n; });
  // Alleen berichten met artikel; ontbreekt articles.json helemaal, toon dan alles (vangnet)
  const latest = articles.length ? merged.filter(n => byId.has(n.id)) : merged;
  return { latest, topNews: topNews(latest, now), latestVideos: mapVideos(videos), show: mapShow(videos), articles,
    categories: FEATURED_CATEGORIES.map(rubriek => ({ rubriek, items: byCategory(latest, rubriek) })), ...(feed.generated ? { generated: feed.generated } : {}) };
}
export async function getPublicData(): Promise<PublicData> {
  const [feed, videos, articles] = await Promise.all([getJson<Feed>("feed.json"), getJson<Videos>("videos.json").catch(() => ({}) as Videos), getJson<Articles>("articles.json").catch(() => ({}) as Articles)]);
  return buildPublicData(feed, videos, Date.now(), articles);
}
