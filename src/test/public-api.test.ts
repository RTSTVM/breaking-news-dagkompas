import { describe, expect, it } from "vitest";
import { amsTime, buildPublicData } from "@/data/publicApi";

const n = (id: string, score: number, at: string, rubriek = "Economie") => ({ id, headline_nl: id, rubriek, score, verified_at: at, sources: [{ name: "BBC", url: "https://bbc.com" }] });
const now = Date.parse("2026-11-25T12:00:00Z");

describe("Public news data", () => {
  it("shows times in Europe/Amsterdam", () => { expect(amsTime("2026-11-25T03:03:00Z")).toBe("04:03"); });
  it("top news = 4 highest scores of last 24h", () => {
    const d = buildPublicData({ news: [n("a", 1, "2026-11-25T11:00Z"), n("b", 9, "2026-11-24T10:00Z"), n("c", 5, "2026-11-25T10:00Z"), n("d", 4, "2026-11-25T09:00Z"), n("e", 3, "2026-11-25T08:00Z"), n("f", 2, "2026-11-25T07:00Z")] }, {}, now);
    expect(d.topNews.map(i => i.id)).toEqual(["c", "d", "e", "f"]);
  });
  it("only produced items become videos", () => {
    const v = (p: number, produced: boolean) => ({ position: p, cluster_id: `v${p}`, headline_nl: "x", rubriek: "Tech", chosen_at: "2026-11-25T08:00Z", produced });
    expect(buildPublicData({}, { items: [v(2, true), v(1, false)] }, now).latestVideos.map(i => i.id)).toEqual(["v2"]);
  });
  it("everything from the feed is verified", () => {
    expect(buildPublicData({ news: [n("a", 1, "2026-11-25T11:00Z")] }, {}, now).latest[0]?.status).toBe("geverifieerd");
  });
});
