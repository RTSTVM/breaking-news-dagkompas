import { createFileRoute } from "@tanstack/react-router";
import { PublicVideos } from "@/components/PublicNews";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Breaking News — Video's" },
      { name: "description", content: "Alle video's en uitzendingen van Breaking News, met Chris en Anna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  return <PublicVideos />;
}
