import { Link } from "@tanstack/react-router";
import logo from "@/assets/breaking-news-logo.png.asset.json";
import studio from "@/assets/breaking-news-studio.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { REFRESH_MS, RUBRIEKEN, amsDate, amsDateFromIso, byCategory, getPublicData, type PublicData, type Item, type Rubriek, type Show, type Video } from "@/data/publicApi";
import { useHydrated } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";

function usePublicData() {
  const hydrated = useHydrated();
  return useQuery({ queryKey: ["public-news"], queryFn: getPublicData, enabled: hydrated, refetchInterval: REFRESH_MS, staleTime: 0 });
}

function Loading() {
  return <p className="m">Het nieuws wordt geladen</p>;
}

function Header({ active, home }: { active?: Rubriek; home: boolean }) {
  return <><header className="public-header"><div className="wrap header-inner">
    <Link to="/" aria-label="Breaking News — Laatste nieuws"><img className="logo" src={logo.url} alt="Breaking News" /></Link>
    <span className="header-spacer" /><span className="m header-date">{useHydrated() ? amsDate() : ""}</span>
    <Button asChild variant="ghost" className="live live-link"><Link to="/" hash="live">Kijk live</Link></Button>
  </div></header><nav className="rubric-nav" aria-label="Rubrieken"><div className="wrap">
    <Link to="/" className={home ? "active" : ""} aria-current={home ? "page" : undefined}>Laatste nieuws</Link>
    {RUBRIEKEN.map(category => <Link key={category.slug} to="/rubriek/$slug" params={{ slug: category.slug }} className={active === category.name ? "active" : ""} aria-current={active === category.name ? "page" : undefined}>{category.name}</Link>)}
  </div></nav></>;
}

function SectionTitle({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return <h2 className="sec">{children}{extra && <b>{extra}</b>}</h2>;
}

function Headline({ item, className = "" }: { item: Item; className?: string }) {
  return <div className={`t ${className}`}><Link to="/artikel/$id" params={{ id: item.id }} className="art-link">{item.headline}</Link>{item.sources.length > 0 && <details className="m"><summary>Bronnen</summary>{item.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></span>)}</details>}</div>;
}

const PATHS = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  vol: "M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z",
  mute: "M3 9v6h4l5 5V4L7 9H3zm13.6 3 2.7-2.7-1.4-1.4-2.7 2.7-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4z",
  full: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
};

function PlayerIcon({ name, size = 22 }: { name: keyof typeof PATHS; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={PATHS[name]} /></svg>;
}

function clock(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return m + ":" + (r < 10 ? "0" : "") + r;
}

function ShowPlayer({ show }: { show: Show }) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [ui, setUi] = useState(true);
  const wake = () => { setUi(true); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setUi(false), 2500); };
  useEffect(() => { vid.current?.play().catch(() => {}); return () => window.clearTimeout(timer.current); }, []);
  const toggle = () => { const v = vid.current; if (!v) return; if (v.paused) void v.play(); else v.pause(); wake(); };
  const toggleMute = () => { const v = vid.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); wake(); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { const v = vid.current; if (!v || !dur) return; const r = e.currentTarget.getBoundingClientRect(); v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur; wake(); };
  const full = () => {
    const el = box.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null; const v = vid.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) { void document.exitFullscreen(); return; }
    if (el?.requestFullscreen) void el.requestFullscreen(); else if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };
  const show_ui = ui || !playing;
  const btn = { background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" } as const;
  return <div ref={box} onMouseMove={wake} onMouseLeave={() => playing && setUi(false)} style={{ position: "relative", width: "100%", height: "100%", aspectRatio: "16 / 9", background: "#000", overflow: "hidden", cursor: show_ui ? "default" : "none" }}>
    <video ref={vid} src={show.videoUrl} poster={show.thumbUrl} title={show.title} autoPlay muted playsInline preload="metadata" onClick={toggle}
      onPlay={() => { setPlaying(true); wake(); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
      onTimeUpdate={e => setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => setDur(e.currentTarget.duration)} onDurationChange={e => setDur(e.currentTarget.duration)} onVolumeChange={e => setMuted(e.currentTarget.muted)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    <span style={{ position: "absolute", top: 12, left: 12, background: "#d62020", color: "#fff", padding: "3px 10px", borderRadius: 3, fontSize: 12, fontWeight: 600, letterSpacing: ".04em" }}>UITZENDING</span>
    {muted && <button type="button" onClick={toggleMute} aria-label="Geluid aan" style={{ position: "absolute", top: 10, right: 12, background: "rgba(0,0,0,.68)", color: "#fff", border: 0, borderRadius: 18, padding: "6px 12px", fontSize: 13, display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}><PlayerIcon name="mute" size={18} />Geluid aan</button>}
    {!playing && <button type="button" onClick={toggle} aria-label="Afspelen" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 72, height: 72, borderRadius: "50%", border: 0, background: "rgba(214,32,32,.92)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PlayerIcon name="play" size={36} /></button>}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "28px 14px 10px", background: "linear-gradient(0deg, rgba(0,0,0,.75), rgba(0,0,0,0))", display: "flex", alignItems: "center", gap: 12, color: "#fff", fontSize: 13, opacity: show_ui ? 1 : 0, transition: "opacity .25s", pointerEvents: show_ui ? "auto" : "none" }}>
      <button type="button" style={btn} onClick={toggle} aria-label={playing ? "Pauzeren" : "Afspelen"}><PlayerIcon name={playing ? "pause" : "play"} /></button>
      <span style={{ minWidth: 38, fontVariantNumeric: "tabular-nums" }}>{clock(time)}</span>
      <div onClick={seek} role="slider" aria-label="Positie in de uitzending" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(time)} style={{ flex: 1, height: 18, display: "flex", alignItems: "center", cursor: "pointer" }}>
        <div style={{ position: "relative", width: "100%", height: 4, background: "rgba(255,255,255,.3)", borderRadius: 2 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (dur ? (time / dur) * 100 : 0) + "%", background: "#d62020", borderRadius: 2 }} />
          <div style={{ position: "absolute", top: -4, left: (dur ? (time / dur) * 100 : 0) + "%", width: 12, height: 12, marginLeft: -6, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>
      <span style={{ minWidth: 38, fontVariantNumeric: "tabular-nums" }}>{clock(dur)}</span>
      <button type="button" style={btn} onClick={toggleMute} aria-label={muted ? "Geluid aan" : "Geluid uit"}><PlayerIcon name={muted ? "mute" : "vol"} /></button>
      <button type="button" style={btn} onClick={full} aria-label="Volledig scherm"><PlayerIcon name="full" /></button>
    </div>
  </div>;
}

function LiveArea({ items, show }: { items: Item[]; show: Show | null }) {
  return <section className="st" id="live" aria-label="Breaking News Live"><div className="wrap sg">
    <div className="live-player">{show ? <ShowPlayer show={show} /> : <><img src={studio.url} alt="Breaking News-studio met Chris en Anna" /><span className="live live-corner">Live</span>
      <div className="live-caption"><div className="live-caption-label">Breaking News Live</div><h1 className="t">{items[0]?.headline ?? "Het nieuws wordt geladen"}</h1></div></>}
    </div>
    <div className="top-news"><h2 className="top-heading">Top nieuws</h2>
      {items.length === 0 && <Loading />}{items.map(item => <div className="top-row" key={item.id}><div><Headline item={item} className="top-title" /><div className="top-meta">{item.time} · {item.rubriek}</div></div></div>)}
    </div>
  </div></section>;
}

function Lightbox({ video, onClose }: { video: { videoUrl: string; headline: string }; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label={video.headline} onClick={onClose}>
    <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Sluiten">×</button>
      <video controls autoPlay playsInline src={video.videoUrl} />
      <div className="t lightbox-title">{video.headline}</div>
    </div>
  </div>;
}

function LatestVideos({ items }: { items: Video[] }) {
  const [open, setOpen] = useState<Video | null>(null);
  if (items.length === 0) return null;
  return <section className="videos-section"><SectionTitle extra="Alle video's">LAATSTE VIDEO'S</SectionTitle><div className="vids">
    {items.map(item => <button type="button" key={item.id} className="video-item" onClick={() => setOpen(item)}><div className="video-thumbnail">
      <img src={item.thumbUrl} alt={`${item.presenter} presenteert ${item.headline}`} /><span className="video-duration">{item.duration}</span>
    </div><div className="t video-title">{item.headline}</div></button>)}
  </div>{open && <Lightbox video={open} onClose={() => setOpen(null)} />}</section>;
}

function CategoryNews({ categories }: { categories: PublicData["categories"] }) {
  return <section className="categories-section"><SectionTitle>Nieuws per categorie</SectionTitle><div className="cols">
    {categories.map(({ rubriek, items }) => {
      const [lead, ...rest] = items;
      return <div key={rubriek}><SectionTitle>{rubriek}</SectionTitle>{lead?.image && <img className="otv-img" src={lead.image.url} alt="" loading="lazy" />}{lead && <><Headline item={lead} className="category-lead" /><div className="m category-time">{lead.time}</div></>}
        {rest.slice(0, 3).map(item => <div className="row" key={item.id}><Headline item={item} className="category-small" /><span className="m">{item.time}</span></div>)}
      </div>;
    })}
  </div></section>;
}

export function NewsList({ items }: { items: Item[] }) {
  const groups: { day: string; items: Item[] }[] = [];
  for (const item of [...items].sort((x, y) => Date.parse(y.at) - Date.parse(x.at))) {
    const day = amsDateFromIso(item.at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item); else groups.push({ day, items: [item] });
  }
  return <div>{groups.map((g, gi) => <details key={g.day} open={gi === 0}>
    <summary className="m" style={{ margin: "20px 0 6px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{g.day.charAt(0).toUpperCase() + g.day.slice(1)} · {g.items.length} berichten</summary>
    {g.items.map(item => <div key={item.id} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "6px 0", borderTop: "1px solid rgba(128,128,128,.18)" }}>
      <span className="m latest-time" style={{ minWidth: 44 }}>{item.time}</span><Link to="/artikel/$id" params={{ id: item.id }} className="t latest-title art-link">{item.headline}</Link>
    </div>)}
  </details>)}</div>;
}

function Footer() {
  return <><footer className="foot"><div className="wrap">Breaking News · Over ons · Zo werkt verificatie · Contact · Privacy</div></footer>
</>;
}

export function PublicHome() {
  const { data: d } = usePublicData();
  const data: PublicData = d ?? { latest: [], topNews: [], latestVideos: [], show: null, articles: [], categories: [] };
  const empty = data.latest.length === 0;
  return <div className="bn-public"><Header home /><main><LiveArea items={data.topNews} show={data.show} /><div className="wrap"><LatestVideos items={data.latestVideos} />{!empty && <CategoryNews categories={data.categories.filter(c => c.items.length > 0)} />}<section className="latest-section"><SectionTitle>Laatste nieuws</SectionTitle>{empty ? <Loading /> : <NewsList items={data.latest} />}</section></div></main><Footer /></div>;
}

function ago(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (m < 60) return m + " min geleden";
  const h = Math.round(m / 60);
  if (h < 24) return h + " uur geleden";
  const d = Math.round(h / 24);
  return d + (d === 1 ? " dag geleden" : " dagen geleden");
}

function NewsCard({ item, big = false }: { item: Item; big?: boolean }) {
  return <Link to="/artikel/$id" params={{ id: item.id }} className={"otv-card" + (big ? " otv-big" : "")}>
    {item.image && <img className="otv-img" src={item.image.url} alt="" loading="lazy" />}
    <div className="otv-meta">{item.rubriek} · {ago(item.at)}</div>
    <div className={big ? "otv-h-big" : "otv-h"}>{item.headline}</div>
    {big && item.summary && <p className="otv-sum">{item.summary}</p>}
  </Link>;
}

export function PublicCategory({ rubriek }: { rubriek: Rubriek }) {
  const { data, isSuccess } = usePublicData();
  const items = data ? byCategory(data.latest, rubriek).sort((x, y) => Date.parse(y.at) - Date.parse(x.at)) : [];
  const featured = items.slice(0, 3);
  const more = items.slice(3);
  return <div className="bn-public"><Header home={false} active={rubriek} /><main className="otv-page">
    <div className="otv-hero"><div className="wrap"><h1 className="otv-title">{rubriek}</h1><p className="otv-sub">Het laatste {rubriek.toLowerCase()} nieuws, dagelijks bijgewerkt.</p></div></div>
    <div className="otv-white"><div className="wrap otv-body">
      {!isSuccess ? <Loading /> : items.length === 0 ? <p className="m">Geen berichten in deze rubriek.</p> : <>
        <h2 className="otv-sec">Uitgelicht</h2>
        <div className="otv-feat">{featured[0] && <NewsCard item={featured[0]} big />}<div className="otv-side">{featured.slice(1).map(i => <NewsCard key={i.id} item={i} />)}</div></div>
        {more.length > 0 && <><h2 className="otv-sec">Meer nieuws</h2><div className="otv-grid">{more.map(i => <NewsCard key={i.id} item={i} />)}</div></>}
      </>}
    </div></div>
  </main><Footer /></div>;
}

export function PublicArticle({ id }: { id: string }) {
  const { data, isSuccess } = usePublicData();
  const art = data?.articles.find(x => x.id === id);
  const related = data && art ? data.latest.filter(i => i.rubriek === art.rubriek && i.id !== id).slice(0, 4) : [];
  const slug = art ? RUBRIEKEN.find(r => r.name === art.rubriek)?.slug ?? "" : "";
  return <div className="bn-public"><Header home={false} active={art?.rubriek} /><main className="otv-page"><div className="otv-white"><div className="wrap otv-article">
    {!isSuccess ? <Loading /> : !art ? <><p className="m">Dit artikel is niet beschikbaar.</p><p className="m"><Link to="/" className="art-link">Terug naar het laatste nieuws</Link></p></> : <>
      <div className="otv-meta"><Link to="/rubriek/$slug" params={{ slug }}>{art.rubriek}</Link> · {amsDateFromIso(art.at)} · {art.time}</div>
      <h1 className="otv-article-title">{art.headline}</h1>
      {art.lead && <p className="otv-lead">{art.lead}</p>}
      {art.video ? <video className="otv-video" controls playsInline preload="metadata" poster={art.video.thumbUrl} src={art.video.videoUrl} />
        : art.image && <figure className="otv-fig"><img src={art.image.url} alt="" /><figcaption>Foto: <a href={art.image.creditUrl} target="_blank" rel="noopener noreferrer">{art.image.credit}</a> / Pexels</figcaption></figure>}
      <div className="otv-text">{art.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div>
      {art.sources.length > 0 && <div className="otv-src"><b>Bronnen: </b>{art.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></span>)}</div>}
      {related.length > 0 && <div className="otv-related"><h2 className="otv-sec">Meer {art.rubriek.toLowerCase()}</h2><div className="otv-grid">{related.map(i => <NewsCard key={i.id} item={i} />)}</div></div>}
    </>}
  </div></div></main><Footer /></div>;
}
