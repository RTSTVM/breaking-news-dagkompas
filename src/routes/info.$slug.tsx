import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/PublicNews";

export const Route = createFileRoute("/info/$slug")({
  head: () => ({
    meta: [
      { title: "Breaking News — Informatie" },
      { name: "description", content: "Informatie over Breaking News: wie we zijn, hoe we nieuws controleren en hoe je contact opneemt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InfoRoute,
});

function InfoRoute() {
  const { slug } = Route.useParams();
  return <InfoPage slug={slug} />;
}
