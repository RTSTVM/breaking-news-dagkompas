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
  it("videos: newest 6 by produced_at, duration m:ss", () => {
    const v = (h: number, d: number) => ({ cluster_id: `v${h}`, headline_nl: "x", duration_s: d, video_url: "https://x/v.mp4", thumb_url: "https://x/t.jpg", produced_at: `2026-11-25T0${h}:00:00Z` });
    const out = buildPublicData({}, { videos: [v(1, 5), v(7, 31), v(3, 65), v(2, 0), v(5, 600), v(4, 1), v(6, 59)] }, now).latestVideos;
    expect(out.map(i => i.id.split("-")[0])).toEqual(["v7", "v6", "v5", "v4", "v3", "v2"]);
    expect(out.map(i => i.duration)).toEqual(["0:31", "0:59", "10:00", "0:01", "1:05", "0:00"]);
  });
  it("everything from the feed is verified", () => {
    expect(buildPublicData({ news: [n("a", 1, "2026-11-25T11:00Z")] }, {}, now).latest[0]?.status).toBe("geverifieerd");
  });
});
