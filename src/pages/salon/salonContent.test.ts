import { describe, expect, it } from "vitest";
import { devProjects } from "@/data/devProjects";
import { videoLinks } from "@/data/videoLinks";
import { SALON_APPS, SALON_VIDEO_TOKEN } from "./salonContent";

describe("salonContent", () => {
  it("pointe vers un token vidéo qui existe dans videoLinks.ts", () => {
    expect(videoLinks[SALON_VIDEO_TOKEN]).toBeDefined();
  });

  it("reprend l'URL Ouvra de devProjects.tsx", () => {
    const ouvra = devProjects.find((project) => project.id === "ouvra");
    expect(ouvra?.links?.live).toMatch(/^https:\/\//);
    expect(SALON_APPS.find((app) => app.id === "ouvra")?.href).toBe(ouvra?.links?.live);
  });

  it("n'expose que des liens https absolus", () => {
    SALON_APPS.forEach((app) => expect(app.href).toMatch(/^https:\/\/[^/]+\.gillescobigo\.com(\/|$)/));
  });
});
