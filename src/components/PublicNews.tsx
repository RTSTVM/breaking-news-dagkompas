import { Link } from "@tanstack/react-router";
import logo from "@/assets/breaking-news-logo.png.asset.json";
import studio from "@/assets/breaking-news-studio.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { REFRESH_MS, RUBRIEKEN, amsDate, amsTime, byCategory, getPublicData, type PublicData, type Item, type Rubriek, type Show, type Video } from "@/data/publicApi";
import { useHydrated } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

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
  return <div className={`t ${className}`}><VerifiedBadge status={item.status} />{item.headline}{item.sources.length > 0 && <details className="m"><summary>Bronnen</summary>{item.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></span>)}</details>}</div>;
}

function LiveArea({ items }: { items: Item[] }) {
  return <section className="st" id="live" aria-label="Breaking News Live"><div className="wrap sg">
    <div className="live-player"><img src={studio.url} alt="Breaking News-studio met Chris en Anna" /><span className="live live-corner">Live</span>
      <div className="live-caption"><div className="live-caption-label">Breaking News Live</div><h1 className="t">{items[0]?.headline ?? "Het nieuws wordt geladen"}</h1></div>
    </div>
    <div className="top-news"><h2 className="top-heading">Top nieuws</h2>
      {items.length === 0 && <Loading />}{items.map((item, i) => <div className="top-row" key={item.id}><b className="top-number">{i + 1}</b><div><Headline item={item} className="top-title" /><div className="top-meta">{item.time} · {item.rubriek}</div></div></div>)}
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

function ShowBlock({ show }: { show: Show | null }) {
  const [open, setOpen] = useState(false);
  if (!show) return null;
  return <section className="show-section"><SectionTitle>De uitzending</SectionTitle>
    <button type="button" className="show-block" onClick={() => setOpen(true)}>
      <div className="show-media"><img src={show.thumbUrl} alt={show.title} /><span className="video-duration">{show.duration}</span><span className="show-play">Bekijken</span></div>
      <div className="show-info"><div className="t show-title">{show.title}</div><div className="m">{show.date}</div></div>
    </button>
    {open && <Lightbox video={{ videoUrl: show.videoUrl, headline: show.title }} onClose={() => setOpen(false)} />}
  </section>;
}

function LatestVideos({ items }: { items: Video[] }) {
  const [open, setOpen] = useState<Video | null>(null);
  if (items.length === 0) return null;
  return <section className="videos-section"><SectionTitle extra="Alle video's">Laatste 6 video's</SectionTitle><div className="vids">
    {items.map((item, i) => <button type="button" key={item.id} className="video-item" onClick={() => setOpen(item)}><div className="video-thumbnail">
      <img src={item.thumbUrl} alt={`${item.presenter} presenteert ${item.headline}`} /><span className="video-number">{i + 1}</span><span className="video-duration">{item.duration}</span>
    </div><div className="t video-title">{item.headline}</div><div className="m">{item.presenter}</div></button>)}
  </div>{open && <Lightbox video={open} onClose={() => setOpen(null)} />}</section>;
}

function CategoryNews({ categories }: { categories: PublicData["categories"] }) {
  return <section className="categories-section"><SectionTitle>Nieuws per categorie</SectionTitle><div className="cols">
    {categories.map(({ rubriek, items }) => {
      const [lead, ...rest] = items;
      return <div key={rubriek}><SectionTitle>{rubriek}</SectionTitle><div className="ph">Foto</div>{lead && <><Headline item={lead} className="category-lead" /><div className="m category-time">{lead.time}</div></>}
        {rest.slice(0, 3).map(item => <div className="row" key={item.id}><Headline item={item} className="category-small" /><span className="m">{item.time}</span></div>)}
      </div>;
    })}
  </div></section>;
}

export function NewsList({ items }: { items: Item[] }) {
  return <div className="latest-grid">{items.map(item => <div key={item.id} className="row"><span className="m latest-time">{item.time}</span><Headline item={item} className="latest-title" /></div>)}</div>;
}

function Footer() {
  return <><footer className="foot"><div className="wrap">Breaking News · Over ons · Zo werkt verificatie · Contact · Privacy</div></footer>
</>;
}

export function PublicHome() {
  const { data: d } = usePublicData();
  const data: PublicData = d ?? { latest: [], topNews: [], latestVideos: [], show: null, categories: [] };
  const empty = data.latest.length === 0;
  return <div className="bn-public"><Header home /><main><LiveArea items={data.topNews} /><div className="wrap"><ShowBlock show={data.show} /><LatestVideos items={data.latestVideos} />{!empty && <CategoryNews categories={data.categories.filter(c => c.items.length > 0)} />}<section className="latest-section"><SectionTitle extra={data.generated ? amsTime(data.generated) : undefined}>Laatste nieuws</SectionTitle>{empty ? <Loading /> : <NewsList items={data.latest} />}</section></div></main><Footer /></div>;
}

export function PublicCategory({ rubriek }: { rubriek: Rubriek }) {
  const { data, isSuccess } = usePublicData();
  const items = data ? byCategory(data.latest, rubriek) : [];
  return <div className="bn-public"><Header home={false} active={rubriek} /><main className="wrap category-page"><h1 className="sec">{rubriek}</h1><NewsList items={items} />{!isSuccess ? <Loading /> : items.length === 0 && <p className="m">Geen berichten in deze rubriek.</p>}</main><Footer /></div>;
}