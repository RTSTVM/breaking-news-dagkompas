import { createFileRoute } from "@tanstack/react-router";
import { PublicHome } from "@/components/PublicNews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breaking News — Laatste nieuws en live" },
      { name: "description", content: "Het laatste nieuws uit binnen- en buitenland, economie, tech en sport. Kijk Breaking News live met Chris en Anna." },
      { property: "og:title", content: "Breaking News — Laatste nieuws en live" },
      { property: "og:description", content: "Actueel nieuws, geverifieerde berichten en de laatste video's van Breaking News met Chris en Anna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return <PublicHome />;
}
