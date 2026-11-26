import { Link } from "@tanstack/react-router";
import logo from "@/assets/breaking-news-logo.png.asset.json";
import studio from "@/assets/breaking-news-studio.jpg.asset.json";
import { REFRESH_MS, RUBRIEKEN, amsDate, amsDateFromIso, byCategory, getPublicData, type PublicData, type Item, type Rubriek, type Show, type Video, type Article, type Source } from "@/data/publicApi";
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

function Header({ active, home, videos }: { active?: Rubriek; home: boolean; videos?: boolean }) {
  const { data } = usePublicData();
  const [live, setLive] = useState(false);
  const heads = (data?.latest ?? []).slice(0, 8);
  return <>{heads.length > 0 && <div className="mq" aria-hidden="true"><div className="mq-track">{heads.map(h => <span key={h.id}><b>{h.time}</b>{h.headline}</span>)}</div></div>}<header className="public-header"><div className="wrap header-inner">
    <Link to="/" aria-label="Breaking News — Laatste nieuws"><img className="logo" src={logo.url} alt="Breaking News" /></Link><span className="bn24" aria-hidden="true">24</span>
    <span className="header-spacer" /><span className="m header-date">{useHydrated() ? amsDate() : ""}</span>
    <button type="button" className="live live-link" onClick={() => { if (data && data.show) setLive(true); else { const el = document.getElementById("live"); if (el) el.scrollIntoView({ behavior: "smooth" }); } }}>Kijk live</button>
  </div></header><nav className="rubric-nav" aria-label="Rubrieken"><div className="wrap">
    <Link to="/" className={home ? "active" : ""} aria-current={home ? "page" : undefined}>Laatste nieuws</Link>
    {RUBRIEKEN.map(category => <Link key={category.slug} to="/rubriek/$slug" params={{ slug: category.slug }} className={active === category.name ? "active" : ""} aria-current={active === category.name ? "page" : undefined}>{category.name}</Link>)}
    <Link to="/videos" className={videos ? "active" : ""} aria-current={videos ? "page" : undefined}>Video's</Link>
  </div></nav>{live && data && data.show && <Lightbox video={{ videoUrl: data.show.videoUrl, headline: data.show.title }} onClose={() => setLive(false)} fullscreen />}</>;
}

function SectionTitle({ children, extra }: { children: ReactNode; extra?: ReactNode }) {
  return <h2 className="sec">{children}{extra && <b>{extra}</b>}</h2>;
}

function SourceBadge({ sources, align = "left" }: { sources: Source[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  const uniq = sources.filter((s, i, a) => a.findIndex(x => x.name === s.name) === i).slice(0, 4);
  const n = uniq.length;
  if (n === 0) return null;
  const heights = [4, 6, 9, 12];
  return <span ref={ref} className={"sb" + (n === 1 ? " one" : "") + (align === "right" ? " right" : "")}>
    <span role="button" tabIndex={0} className="sb-btn" aria-expanded={open} aria-label={"Bronnen tonen: " + n} onClick={() => setOpen(o => !o)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}>
      <span className="bars">{heights.map((h, k) => <i key={k} className={k < n ? "" : "off"} style={{ height: h }} />)}</span>{n} {n === 1 ? "bron" : "bronnen"}
    </span>
    {open && <span className="pop"><b>{n === 1 ? "Gemeld door 1 bron" : "Gemeld door " + n + " bronnen"}</b>{uniq.map(s => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}<em>↗</em></a>)}<small>Klik op een bron voor het oorspronkelijke bericht</small></span>}
  </span>;
}

function Headline({ item, className = "" }: { item: Item; className?: string }) {
  return <div className={"t " + className}><Link to="/artikel/$id" params={{ id: item.id }} className="art-link">{item.headline}</Link><div className="sbl"><SourceBadge sources={item.sources} /></div></div>;
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
    <video ref={vid} src={show.videoUrl} poster={show.thumbUrl} title={show.title} autoPlay loop muted playsInline preload="metadata" onClick={toggle}
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

function LiveArea({ videos, show }: { videos: Video[]; show: Show | null }) {
  const [open, setOpen] = useState<Video | null>(null);
  return <section className="st" id="live" aria-label="Breaking News Live"><div className="wrap sg">
    <div className="live-player">{show ? <ShowPlayer show={show} /> : <><img src={studio.url} alt="Breaking News-studio met Chris en Anna" /><span className="live live-corner">Live</span></>}</div>
    <div className="side-videos"><div className="sv-head"><h2 className="top-heading">Laatste video's</h2><Link to="/videos" className="sv-all">Alle video's →</Link></div>
      {videos.length === 0 && <Loading />}
      {videos.map(vid => <button type="button" key={vid.id} className="vl" onClick={() => setOpen(vid)}><span className="vt"><img src={vid.thumbUrl} alt="" loading="lazy" /><span className="vd">{vid.duration}</span></span><span className="vtitle">{vid.headline}</span></button>)}
    </div>
    {open && <Lightbox video={open} onClose={() => setOpen(null)} />}
  </div></section>;
}

function Lightbox({ video, onClose, fullscreen = false }: { video: { videoUrl: string; headline: string }; onClose: () => void; fullscreen?: boolean }) {
  const vref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (fullscreen && vref.current && vref.current.requestFullscreen) { vref.current.requestFullscreen().catch(() => {}); } }, [fullscreen]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label={video.headline} onClick={onClose}>
    <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Sluiten">×</button>
      <video ref={vref} controls autoPlay playsInline src={video.videoUrl} />
      <div className="t lightbox-title">{video.headline}</div>
    </div>
  </div>;
}

function Magazine({ latest, top, articles }: { latest: Item[]; top: Item[]; articles: Article[] }) {
  const now = Date.now();
  const pool = (hours: number, min: number) => latest.filter(i => i.image && now - Date.parse(i.at) <= hours * 3600_000 && i.score >= min).sort((x, y) => y.score - x.score || Date.parse(y.at) - Date.parse(x.at))[0];
  const feature = pool(4, 5.5) ?? pool(24, 0) ?? top.find(i => i.image) ?? latest.find(i => i.image) ?? latest[0];
  if (!feature) return null;
  const lead = articles.find(a => a.id === feature.id)?.lead || feature.summary;
  const minis = latest.filter(i => i.image && i.id !== feature.id).slice(0, 2);
  const net = latest.filter(i => i.id !== feature.id).slice(0, 6);
  return <section className="mag">
    <div className="mag-net"><div className="mag-h">Net binnen<small>LIVE</small></div>
      {net.map(i => <div key={i.id} className="nb"><Link to="/artikel/$id" params={{ id: i.id }} className="nb-link"><div className="nb-m">{i.time} · {i.rubriek}</div><b>{i.headline}</b></Link><div className="sbl"><SourceBadge sources={i.sources} /></div></div>)}
      <Link to="/" hash="laatste" className="mag-all">● Al het nieuws →</Link>
    </div>
    <div className="mag-main">
      <Link to="/artikel/$id" params={{ id: feature.id }} className="mag-feat">
        {feature.image && <img className="mag-img" src={feature.image.url} alt="" />}
        <div className="mag-m">{feature.rubriek} · {feature.time}</div>
        <h2 className="mag-title">{feature.headline}</h2>
        {lead && <p className="mag-lead">{lead}</p>}
      </Link>
      <div className="sbl" style={{ margin: "-4px 0 14px -4px" }}><SourceBadge sources={feature.sources} /></div>
      {minis.length > 0 && <div className="mini">{minis.map(i => <div key={i.id} className="mini-item"><Link to="/artikel/$id" params={{ id: i.id }} className="mini-link">{i.image && <img src={i.image.url} alt="" loading="lazy" />}<span><span className="nb-m">{i.rubriek} · {i.time}</span><b>{i.headline}</b></span></Link><div className="sbl"><SourceBadge sources={i.sources} /></div></div>)}</div>}
    </div>
  </section>;
}

function CategoryNews({ categories }: { categories: PublicData["categories"] }) {
  return <section className="categories-section"><SectionTitle>Nieuws per categorie</SectionTitle><div className="cols">
    {categories.map(({ rubriek, items }) => {
      const [lead, ...rest] = items;
      return <div key={rubriek}><SectionTitle>{rubriek}</SectionTitle>{lead?.image && <img className="otv-img" src={lead.image.url} alt="" loading="lazy" />}{lead && <><Headline item={lead} className="category-lead" /><div className="m category-time">{lead.time}</div></>}
        {rest.slice(0, 3).map(item => <div className="row" key={item.id}><Headline item={item} className="category-small" /><span className="m">{item.time}</span></div>)}
      </div>;
    })}
    <div className="sp-slot"><span className="sp-label">Advertentie</span><div className="sp-box"><b>Hier kan jouw advertentie staan</b><span>Bereik de lezers en kijkers van Breaking News.</span><Link to="/info/$slug" params={{ slug: "contact" }} className="sp-link">Neem contact op</Link></div></div>
  </div></section>;
}

export function NewsList({ items, collapsed = false }: { items: Item[]; collapsed?: boolean }) {
  const groups: { day: string; items: Item[] }[] = [];
  for (const item of [...items].sort((x, y) => Date.parse(y.at) - Date.parse(x.at))) {
    const day = amsDateFromIso(item.at);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(item); else groups.push({ day, items: [item] });
  }
  return <div>{groups.map((g, gi) => <details key={g.day} open={!collapsed && gi === 0}>
    <summary className="m" style={{ margin: "20px 0 6px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{g.day.charAt(0).toUpperCase() + g.day.slice(1)} · {g.items.length} berichten</summary>
    {g.items.map(item => <div key={item.id} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "6px 0", borderTop: "1px solid rgba(128,128,128,.18)" }}>
      <span className="m latest-time" style={{ minWidth: 44 }}>{item.time}</span><Link to="/artikel/$id" params={{ id: item.id }} className="t latest-title art-link">{item.headline}</Link><span style={{ marginLeft: "auto" }}><SourceBadge sources={item.sources} align="right" /></span>
    </div>)}
  </details>)}</div>;
}

function Footer() {
  return <footer className="foot"><div className="wrap">
    <span>Breaking News</span><span aria-hidden="true">·</span>
    <Link to="/info/$slug" params={{ slug: "over-ons" }}>Over ons</Link><span aria-hidden="true">·</span>
    <Link to="/info/$slug" params={{ slug: "verificatie" }}>Zo werkt verificatie</Link><span aria-hidden="true">·</span>
    <Link to="/info/$slug" params={{ slug: "contact" }}>Contact</Link><span aria-hidden="true">·</span>
    <Link to="/info/$slug" params={{ slug: "privacy" }}>Privacy</Link>
  </div></footer>;
}

export function PublicHome() {
  const { data: d } = usePublicData();
  const data: PublicData = d ?? { latest: [], topNews: [], latestVideos: [], allVideos: [], show: null, articles: [], categories: [] };
  const empty = data.latest.length === 0;
  return <div className="bn-public"><Header home /><main><h1 className="sr-only">Breaking News — laatste nieuws en live</h1><LiveArea videos={data.latestVideos} show={data.show} /><div className="wrap">{!empty && <Magazine latest={data.latest} top={data.topNews} articles={data.articles} />}{!empty && <CategoryNews categories={data.categories.filter(c => c.items.length > 0)} />}<section className="latest-section" id="laatste"><SectionTitle>Laatste nieuws</SectionTitle>{empty ? <Loading /> : <NewsList items={data.latest} />}</section></div></main><Footer /></div>;
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
  const sorted = data ? byCategory(data.latest, rubriek).sort((x, y) => Date.parse(y.at) - Date.parse(x.at)) : [];
  const todayKey = amsDateFromIso(new Date().toISOString());
  const yesterdayKey = amsDateFromIso(new Date(Date.now() - 86_400_000).toISOString());
  const recent = sorted.filter(i => { const d = amsDateFromIso(i.at); return d === todayKey || d === yesterdayKey; });
  const older = sorted.filter(i => !recent.includes(i));
  const featured = recent.slice(0, 3);
  const rest = recent.slice(3);
  const days = [todayKey, yesterdayKey].map(key => ({ key, list: rest.filter(i => amsDateFromIso(i.at) === key) })).filter(d => d.list.length > 0);
  return <div className="bn-public"><Header home={false} active={rubriek} /><main className="otv-page">
    <div className="otv-hero"><div className="wrap"><h1 className="otv-title">{rubriek}</h1><p className="otv-sub">Het laatste {rubriek.toLowerCase()} nieuws, dagelijks bijgewerkt.</p></div></div>
    <div className="otv-white"><div className="wrap otv-body">
      {!isSuccess ? <Loading /> : sorted.length === 0 ? <p className="m">Geen berichten in deze rubriek.</p> : <>
        {featured.length > 0 && <><h2 className="otv-sec">Uitgelicht</h2>
        <div className="otv-feat">{featured[0] && <NewsCard item={featured[0]} big />}<div className="otv-side">{featured.slice(1).map(i => <NewsCard key={i.id} item={i} />)}</div></div></>}
        {days.map(d => <div key={d.key}><h2 className="otv-sec">{d.key.charAt(0).toUpperCase() + d.key.slice(1)}</h2><div className="otv-grid" style={{ marginBottom: 36 }}>{d.list.map(i => <NewsCard key={i.id} item={i} />)}</div></div>)}
        {older.length > 0 && <><h2 className="otv-sec">Eerder</h2><NewsList items={older} collapsed /></>}
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
      <div className="otv-meta"><Link to="/rubriek/$slug" params={{ slug }}>{art.rubriek}</Link> · {amsDateFromIso(art.at)} · {art.time} <SourceBadge sources={art.sources} /></div>
      <h1 className="otv-article-title">{art.headline}</h1>
      {art.lead && <p className="otv-lead">{art.lead}</p>}
      {art.video ? <video className="otv-video" controls playsInline preload="metadata" poster={art.video.thumbUrl} src={art.video.videoUrl} />
        : art.image && <figure className="otv-fig"><img src={art.image.url} alt="" /><figcaption>{art.image.origin === "bron" ? "© " : "Foto: "}<a href={art.image.creditUrl} target="_blank" rel="noopener noreferrer">{art.image.credit}</a>{art.image.origin === "bron" ? "" : " / Pexels"}</figcaption></figure>}
      <div className="otv-text">{art.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div>
      {art.sources.length > 0 && <div className="otv-src"><b>Bronnen: </b>{art.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></span>)}</div>}
      {related.length > 0 && <div className="otv-related"><h2 className="otv-sec">Meer {art.rubriek.toLowerCase()}</h2><div className="otv-grid">{related.map(i => <NewsCard key={i.id} item={i} />)}</div></div>}
    </>}
  </div></div></main><Footer /></div>;
}


export function PublicVideos() {
  const { data, isSuccess } = usePublicData();
  const [open, setOpen] = useState<{ videoUrl: string; headline: string } | null>(null);
  const vids = data?.allVideos ?? [];
  const show = data?.show;
  return <div className="bn-public"><Header home={false} videos /><main className="otv-page">
    <div className="otv-hero"><div className="wrap"><h1 className="otv-title">Video's</h1><p className="otv-sub">Alle video's en uitzendingen van Breaking News, gepresenteerd door Chris en Anna.</p></div></div>
    <div className="otv-white"><div className="wrap otv-body">
      {!isSuccess ? <Loading /> : <>
        {show && <><h2 className="otv-sec">De uitzending</h2>
          <button type="button" className="show-block" onClick={() => setOpen({ videoUrl: show.videoUrl, headline: show.title })}>
            <div className="show-media"><img src={show.thumbUrl} alt={show.title} /><span className="video-duration">{show.duration}</span><span className="show-play">Bekijken</span></div>
            <div className="show-info"><div className="t show-title">{show.title}</div><div className="m">{show.date}</div></div>
          </button></>}
        <h2 className="otv-sec" style={{ marginTop: 36 }}>Alle video's</h2>
        {vids.length === 0 ? <p className="m">Nog geen video's.</p> : <div className="vids">{vids.map(vid => <button type="button" key={vid.id} className="video-item" onClick={() => setOpen({ videoUrl: vid.videoUrl, headline: vid.headline })}>
          <div className="video-thumbnail"><img src={vid.thumbUrl} alt="" loading="lazy" /><span className="video-duration">{vid.duration}</span></div>
          <div className="t video-title">{vid.headline}</div><div className="m">{amsDateFromIso(vid.at)}</div>
        </button>)}</div>}
      </>}
    </div></div>
    {open && <Lightbox video={open} onClose={() => setOpen(null)} />}
  </main><Footer /></div>;
}

const INFO: Record<string, { title: string; text: ReactNode }> = {
  "over-ons": { title: "Over Breaking News", text: <>
    <p>Breaking News is een Nederlandstalig nieuwsprogramma en nieuwssite van TV Media Partners, de organisatie achter Ondernemers TV. Elke dag brengen we het belangrijkste nieuws uit binnen- en buitenland, economie, tech, sport en cultuur, als artikel en als korte video.</p>
    <h2>Gemaakt met AI</h2>
    <p>Breaking News wordt grotendeels automatisch gemaakt. Berichten van betrouwbare bronnen worden verzameld, bij elkaar gezet en beoordeeld op belang. De artikelen worden met behulp van kunstmatige intelligentie geschreven op basis van die berichten. De presentatoren Chris en Anna, hun stemmen en een deel van de beelden zijn met AI gemaakt.</p>
    <h2>Bronnen en foto's</h2>
    <p>Onder elk artikel staan de bronnen waarop het is gebaseerd. Bij elke foto staat de herkomst vermeld.</p>
    <h2>Een tip of een fout gezien?</h2>
    <p>Laat het ons weten via de pagina <Link to="/info/$slug" params={{ slug: "contact" }} className="art-link">Contact</Link>.</p>
  </> },
  "verificatie": { title: "Zo werkt verificatie", text: <>
    <p>Breaking News publiceert alleen nieuws waarvan we kunnen laten zien waar het vandaan komt. Zo gaan we te werk:</p>
    <ul>
      <li><b>Bronnen.</b> We volgen een vaste lijst van nieuwsbronnen, zoals persbureaus, kranten, omroepen en officiële instanties.</li>
      <li><b>Groeperen.</b> Berichten over dezelfde gebeurtenis worden bij elkaar gezet, zodat we kunnen zien wie wat meldt.</li>
      <li><b>Alleen wat de bronnen melden.</b> Een artikel gebruikt uitsluitend feiten uit de berichten van de bronnen. Wat daar niet in staat, nemen we niet op.</li>
      <li><b>Voorzichtig met beschuldigingen.</b> Geruchten brengen we niet als vaststaand feit. Persoonlijke beschuldigingen over met naam genoemde personen laten we weg, tenzij ze officieel zijn bevestigd.</li>
      <li><b>Bronvermelding.</b> Onder elk artikel staan de bronnen, met een link naar het oorspronkelijke bericht.</li>
    </ul>
    <p>Omdat een groot deel van dit proces automatisch gaat, kunnen er fouten insluipen. Zie je er een, meld het dan via <Link to="/info/$slug" params={{ slug: "contact" }} className="art-link">Contact</Link>.</p>
  </> },
  "contact": { title: "Contact", text: <>
    <p>Heb je een tip, een vraag of zie je een fout in een artikel? Neem contact op met de redactie via <a href="https://ondernemerstv.nl/contact" target="_blank" rel="noopener noreferrer" className="art-link">het contactformulier van Ondernemers TV</a>. Vermeld bij een fout het artikel waar het om gaat.</p>
  </> },
  "privacy": { title: "Privacy", text: <>
    <p>Breaking News is een nieuwssite die je zonder account of inlog kunt lezen. We vragen je niet om persoonsgegevens om de site te gebruiken.</p>
    <h2>Technische gegevens</h2>
    <p>Technische gegevens, zoals je IP-adres en browsertype, kunnen kortdurend worden verwerkt door onze hostingpartij om de site veilig en beschikbaar te houden. We gebruiken die gegevens niet om je te volgen of te profileren.</p>
    <h2>Berichten aan ons</h2>
    <p>Stuur je ons een bericht via het contactformulier, dan gebruiken we je gegevens alleen om te reageren.</p>
    <h2>Diensten van derden</h2>
    <p>De lettertypes van deze site worden geladen van Google Fonts, waarbij je IP-adres aan Google wordt doorgegeven. Links naar bronnen en foto's leiden naar sites van derden, waarop hun eigen privacyregels gelden.</p>
    <h2>Vragen</h2>
    <p>Heb je een vraag over privacy? Neem contact met ons op via de pagina <Link to="/info/$slug" params={{ slug: "contact" }} className="art-link">Contact</Link>.</p>
  </> },
};

export function InfoPage({ slug }: { slug: string }) {
  const page = INFO[slug];
  return <div className="bn-public"><Header home={false} /><main className="otv-page"><div className="otv-white"><div className="wrap otv-article">
    {page ? <><h1 className="otv-article-title">{page.title}</h1><div className="otv-text">{page.text}</div></> : <p className="m">Deze pagina bestaat niet. <Link to="/" className="art-link">Terug naar het laatste nieuws</Link></p>}
  </div></div></main><Footer /></div>;
}
