/** Publieke nieuwsdata uit de Dagkompas-feeds; vervang uitsluitend deze laag voor een andere bron. */
export type Rubriek = "Binnenland" | "Buitenland" | "Economie" | "Tech" | "Sport" | "Cultuur en leven";
export interface Source { name: string; url: string }
export interface Item {
  id: string; time: string; headline: string; summary: string; rubriek: Rubriek;
  status: "geverifieerd" | "controle"; score: number; at: string; sources: Source[];
  videoDuration?: string; videoUrl?: string; presenter?: string;
}
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
interface RawNews { id: string; headline_nl: string; summary_nl?: string; rubriek: string; score?: number; verified_at: string; sources?: RawSource[] }
interface RawVideo { position: number; presenter?: string; cluster_id: string; headline_nl: string; summary_nl?: string; rubriek: string; score?: number; chosen_at: string; produced?: boolean; sources?: RawSource[] }
export interface Feed { generated?: string; news?: RawNews[] }
export interface Items { date?: string; items?: RawVideo[] }

export function amsTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("nl-NL", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });
}
export function amsDate(now = new Date()): string {
  return now.toLocaleDateString("nl-NL", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
const isRubriek = (r: string): r is Rubriek => RUBRIEKEN.some(x => x.name === r);
const sources = (s?: RawSource[]): Source[] => (s ?? []).filter((x): x is Source => !!x.name && !!x.url);

export function mapNews(feed: Feed): Item[] {
  return (feed.news ?? []).filter(n => isRubriek(n.rubriek)).map(n => ({
    id: n.id, time: amsTime(n.verified_at), headline: n.headline_nl, summary: n.summary_nl ?? "",
    rubriek: n.rubriek as Rubriek, status: "geverifieerd" as const, score: n.score ?? 0, at: n.verified_at, sources: sources(n.sources),
  }));
}
export function mapVideos(items: Items): Item[] {
  return (items.items ?? []).filter(v => v.produced && isRubriek(v.rubriek)).sort((a, b) => a.position - b.position).slice(0, 6).map(v => ({
    id: v.cluster_id, time: amsTime(v.chosen_at), headline: v.headline_nl, summary: v.summary_nl ?? "",
    rubriek: v.rubriek as Rubriek, status: "geverifieerd" as const, score: v.score ?? 0, at: v.chosen_at,
    sources: sources(v.sources), ...(v.presenter ? { presenter: v.presenter } : {}),
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
export interface PublicData { latest: Item[]; topNews: Item[]; latestVideos: Item[]; categories: { rubriek: Rubriek; items: Item[] }[]; generated?: string }
export function buildPublicData(feed: Feed, items: Items, now = Date.now()): PublicData {
  const latest = mapNews(feed);
  return { latest, topNews: topNews(latest, now), latestVideos: mapVideos(items),
    categories: FEATURED_CATEGORIES.map(rubriek => ({ rubriek, items: byCategory(latest, rubriek) })), ...(feed.generated ? { generated: feed.generated } : {}) };
}
export async function getPublicData(): Promise<PublicData> {
  const [feed, items] = await Promise.all([getJson<Feed>("feed.json"), getJson<Items>("items.json").catch(() => ({}) as Items)]);
  return buildPublicData(feed, items);
}
