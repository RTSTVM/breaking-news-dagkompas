import { createFileRoute } from "@tanstack/react-router";
import { Productiesite } from "@/components/Productiesite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breaking News — Productie" },
      { name: "description", content: "Productiesite van het AI-nieuwsprogramma Breaking News: nieuwsscanner, redactie, productie en social media." },
      { property: "og:title", content: "Breaking News — Productie" },
      { property: "og:description", content: "Productiesite van het AI-nieuwsprogramma Breaking News met Chris en Anna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Productiesite,
});
