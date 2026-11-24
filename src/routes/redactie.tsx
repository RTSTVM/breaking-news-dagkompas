import { createFileRoute } from "@tanstack/react-router";
import { Productiesite } from "@/components/Productiesite";

export const Route = createFileRoute("/redactie")({
  head: () => ({ meta: [
    { title: "Breaking News — Redactie en productie" },
    { name: "description", content: "Productiesite van Breaking News: nieuwsscanner, redactie, productie en social media." },
    { property: "og:title", content: "Breaking News — Redactie en productie" },
    { property: "og:description", content: "Dagkompas voor de redactie en productie van Breaking News met Chris en Anna." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Productiesite,
});