/** Publieke mockdata uit voorkant-F2-mockup.html; vervang uitsluitend deze laag voor echte data. */
export type Rubriek = "Binnenland" | "Buitenland" | "Economie" | "Tech" | "Sport" | "Cultuur en leven";
export interface Item {
  id: string; time: string; headline: string; summary: string; rubriek: Rubriek;
  status: "geverifieerd" | "controle"; videoDuration?: string; videoUrl?: string; presenter?: string;
}
export const RUBRIEKEN: { slug: string; name: Rubriek }[] = [
  {slug:"binnenland",name:"Binnenland"},{slug:"buitenland",name:"Buitenland"},
  {slug:"economie",name:"Economie"},{slug:"tech",name:"Tech"},
  {slug:"sport",name:"Sport"},{slug:"cultuur-en-leven",name:"Cultuur en leven"},
];
export const PUBLIC_EDITION = {
  date: "dinsdag 24 november 2026", updated: "12:12",
  liveLabel: "Breaking News Live · item 2 van 6",
  liveHeadline: "Sanofi koopt Insmed voor 41 miljard dollar",
};
export const FEATURED_CATEGORIES: Rubriek[] = ["Buitenland", "Economie", "Tech", "Sport"];
const news: Item[] = [
  {
    "id": "news-1",
    "time": "12:05",
    "headline": "Jensen Huang keert terug als topman van Nvidia, markten stijgen sterk",
    "summary": "",
    "rubriek": "Economie",
    "status": "geverifieerd",
    "videoDuration": "0:48"
  },
  {
    "id": "news-2",
    "time": "11:52",
    "headline": "Sanofi koopt Insmed voor 41 miljard dollar",
    "summary": "",
    "rubriek": "Economie",
    "status": "geverifieerd",
    "videoDuration": "0:52"
  },
  {
    "id": "news-3",
    "time": "11:40",
    "headline": "Iran houdt vast aan standpunt richting VS, Israël overweegt escalatie",
    "summary": "",
    "rubriek": "Buitenland",
    "status": "geverifieerd",
    "videoDuration": "0:44"
  },
  {
    "id": "news-4",
    "time": "11:31",
    "headline": "VS zet Megaspeed en zes andere bedrijven op handelszwarte lijst",
    "summary": "",
    "rubriek": "Tech",
    "status": "geverifieerd"
  },
  {
    "id": "news-5",
    "time": "11:18",
    "headline": "Russische aanval op Zaporizhzhia doodt twee mensen, dertig gewonden",
    "summary": "",
    "rubriek": "Buitenland",
    "status": "geverifieerd"
  },
  {
    "id": "news-6",
    "time": "11:12",
    "headline": "Iran meldt drie tankers op mijnen in Hormuz",
    "summary": "",
    "rubriek": "Buitenland",
    "status": "controle"
  },
  {
    "id": "news-7",
    "time": "11:02",
    "headline": "Autobom verwoest gebouwen van gouverneur in Villavicencio",
    "summary": "",
    "rubriek": "Buitenland",
    "status": "geverifieerd"
  },
  {
    "id": "news-8",
    "time": "10:47",
    "headline": "Opkomende markten stijgen het sterkst sinds juli",
    "summary": "",
    "rubriek": "Economie",
    "status": "geverifieerd"
  },
  {
    "id": "news-9",
    "time": "10:30",
    "headline": "Poolse luchtmacht: Russische drone kort in Pools luchtruim",
    "summary": "",
    "rubriek": "Buitenland",
    "status": "controle"
  },
  {
    "id": "news-10",
    "time": "10:12",
    "headline": "PSV neemt het dinsdagavond op tegen Real Madrid",
    "summary": "",
    "rubriek": "Sport",
    "status": "geverifieerd"
  },
  {
    "id": "news-11",
    "time": "09:58",
    "headline": "Chelsea houdt vast aan Xabi Alonso",
    "summary": "",
    "rubriek": "Sport",
    "status": "geverifieerd"
  },
  {
    "id": "news-12",
    "time": "09:40",
    "headline": "Japan wil meer LNG kopen op de spotmarkt",
    "summary": "",
    "rubriek": "Economie",
    "status": "geverifieerd"
  },
  {
    "id": "news-13",
    "time": "09:20",
    "headline": "Nieuwe chip-exportregels: wat verandert er voor Europese bedrijven?",
    "summary": "",
    "rubriek": "Tech",
    "status": "geverifieerd"
  }
];
const videos: Item[] = [
  {
    "id": "video-1",
    "time": "",
    "headline": "Belastingplan op het nippertje rond",
    "summary": "",
    "rubriek": "Binnenland",
    "status": "geverifieerd",
    "videoDuration": "0:48",
    "presenter": "Chris"
  },
  {
    "id": "video-2",
    "time": "",
    "headline": "Dieselprijs stijgt: hogere marges bij raffinaderijen",
    "summary": "",
    "rubriek": "Economie",
    "status": "geverifieerd",
    "videoDuration": "0:52",
    "presenter": "Anna"
  },
  {
    "id": "video-3",
    "time": "",
    "headline": "Black Friday: kortingen bij Amazon vaak schijn",
    "summary": "",
    "rubriek": "Economie",
    "status": "geverifieerd",
    "videoDuration": "0:44",
    "presenter": "Chris"
  },
  {
    "id": "video-4",
    "time": "",
    "headline": "AI-rally jaagt de dollar op",
    "summary": "",
    "rubriek": "Tech",
    "status": "geverifieerd",
    "videoDuration": "0:57",
    "presenter": "Anna"
  },
  {
    "id": "video-5",
    "time": "",
    "headline": "Japan stelt nieuwe staatsobligaties uit",
    "summary": "",
    "rubriek": "Buitenland",
    "status": "geverifieerd",
    "videoDuration": "0:41",
    "presenter": "Chris"
  },
  {
    "id": "video-6",
    "time": "",
    "headline": "Aldi koopt cacao eerlijker in",
    "summary": "",
    "rubriek": "Cultuur en leven",
    "status": "geverifieerd",
    "videoDuration": "0:46",
    "presenter": "Anna"
  }
];
export async function getTopNews(): Promise<Item[]> { return news.slice(0, 4); }
export async function getLatestVideos(): Promise<Item[]> { return videos; }
export async function getNewsByCategory(rubriek: Rubriek): Promise<Item[]> { return news.filter(item => item.rubriek === rubriek); }
export async function getLatest(): Promise<Item[]> { return news; }
export async function getPublicHome() {
  const [topNews, latestVideos, latest, categories] = await Promise.all([
    getTopNews(), getLatestVideos(), getLatest(),
    Promise.all(FEATURED_CATEGORIES.map(async rubriek => ({ rubriek, items: await getNewsByCategory(rubriek) }))),
  ]);
  return { topNews, latestVideos, latest, categories };
}
