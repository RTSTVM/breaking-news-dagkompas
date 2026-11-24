import { describe, expect, it } from "vitest";
import { getLatest, getLatestVideos, getNewsByCategory, getTopNews } from "@/data/publicApi";

describe("Public news mockup data", () => {
  it("returns the four top stories", async () => {
    expect(await getTopNews()).toHaveLength(4);
  });
  it("returns six horizontal video items with alternating presenters", async () => {
    const items = await getLatestVideos();
    expect(items).toHaveLength(6);
    expect(items.map(item => item.presenter)).toEqual(["Chris", "Anna", "Chris", "Anna", "Chris", "Anna"]);
  });
  it("filters reused news by category without introducing other stories", async () => {
    const all = await getLatest();
    const items = await getNewsByCategory("Economie");
    expect(items.map(item => item.id)).toEqual(["news-1", "news-2", "news-8", "news-12"]);
    expect(items).toEqual(all.filter(item => item.rubriek === "Economie"));
  });
  it("keeps stories under review distinct from verified ones", async () => {
    const items = await getLatest();
    expect(items.find(item => item.id === "news-6")?.status).toBe("controle");
    expect(items.find(item => item.id === "news-1")?.status).toBe("geverifieerd");
  });
});