import { afterEach, describe, expect, it, vi } from "vitest";
import { FORMSPREE_ENDPOINT, computePricing, sendContactRequest } from "./boutiquesPricing";

describe("computePricing", () => {
  it("forfait seul : 500", () => {
    expect(computePricing({ withSubscription: false, withDomain: false })).toEqual({ total: 500, domainActive: false });
  });
  it("nom de domaine seul : 520", () => {
    expect(computePricing({ withSubscription: false, withDomain: true })).toEqual({ total: 520, domainActive: true });
  });
  it("Formule Sérénité : 575, le domaine n'est jamais facture en plus", () => {
    expect(computePricing({ withSubscription: true, withDomain: false }).total).toBe(575);
    expect(computePricing({ withSubscription: true, withDomain: true })).toEqual({ total: 575, domainActive: false });
  });
});

describe("sendContactRequest", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("envoie la charge attendue a Formspree et renvoie true", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const ok = await sendContactRequest({ projectName: "Atelier Fictif", withSubscription: true, withDomain: false, contact: "06 00 00 00 00" });
    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(url).toBe(FORMSPREE_ENDPOINT);
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body).toMatchObject({ source: "Boutiques - PricingCard", projet: "Atelier Fictif", formule: "575€ (avec Formule Sérénité)", contact: "06 00 00 00 00" });
    expect(body.message).toBe("Atelier Fictif est intéressé(e) par son site, première facture à 575€ (avec Formule Sérénité). Rappel : 06 00 00 00 00.");
  });

  it("contact vide : « Non précisé » et « canal non précisé » ; domaine seul mentionné", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    await sendContactRequest({ projectName: "P", withSubscription: false, withDomain: true, contact: "" });
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, { body: string }])[1].body) as Record<string, string>;
    expect(body.contact).toBe("Non précisé");
    expect(body.formule).toBe("520€ (sans Formule Sérénité, avec nom de domaine)");
    expect(body.message).toContain("canal non précisé");
  });

  it("reponse non ok ou erreur reseau : false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await sendContactRequest({ projectName: "P", withSubscription: false, withDomain: false, contact: "x" })).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("réseau")));
    expect(await sendContactRequest({ projectName: "P", withSubscription: false, withDomain: false, contact: "x" })).toBe(false);
  });
});
