import { createFileRoute, notFound } from "@tanstack/react-router";
import { PublicCategory } from "@/components/PublicNews";
import { RUBRIEKEN } from "@/data/publicApi";

export const Route = createFileRoute("/rubriek/$slug")({
  loader: ({ params }) => {
    const category = RUBRIEKEN.find(item => item.slug === params.slug);
    if (!category) throw notFound();
    return { rubriek: category.name };
  },
  head: ({ loaderData }) => {
    const title = `Breaking News — ${loaderData?.rubriek ?? "Rubriek niet gevonden"}`;
    const description = `Het laatste ${loaderData?.rubriek.toLowerCase() ?? "actuele"} nieuws van Breaking News, met verificatiestatus per bericht.`;
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  return <PublicCategory {...Route.useLoaderData()} />;
}