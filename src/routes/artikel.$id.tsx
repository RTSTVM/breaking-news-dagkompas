import { createFileRoute } from "@tanstack/react-router";
import { PublicArticle } from "@/components/PublicNews";

export const Route = createFileRoute("/artikel/$id")({
  head: () => ({
    meta: [
      { title: "Breaking News — Artikel" },
      { name: "description", content: "Nieuwsartikel van Breaking News." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { id } = Route.useParams();
  return <PublicArticle id={id} />;
}
