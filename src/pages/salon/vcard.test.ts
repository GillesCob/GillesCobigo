import { describe, expect, it } from "vitest";
import { buildVCard, escapeVCardText, foldVCardLine, type IVCardContact } from "./vcard";

const CONTACT: IVCardContact = {
  first: "Gilles",
  last: "Cobigo",
  title: "Développeur fullstack",
  email: "contact@gillescobigo.com",
  tel: "+33679629460",
  url: "https://gillescobigo.com",
  linkedin: "https://www.linkedin.com/in/gillescobigo",
  note: "Rencontré au Salon du numérique du Pays Basque, 24/09/2026",
};

const NOW = new Date("2026-09-24T11:30:05.123Z");
const utf8Length = (s: string) => new TextEncoder().encode(s).length;

describe("buildVCard", () => {
  it("produit la fiche du mockup, lignes CRLF, dans l'ordre exact", () => {
    expect(buildVCard(CONTACT, NOW)).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Cobigo;Gilles;;;",
        "FN:Gilles Cobigo",
        "TITLE:Développeur fullstack",
        "EMAIL;TYPE=INTERNET,PREF:contact@gillescobigo.com",
        "TEL;TYPE=CELL,VOICE:+33679629460",
        "URL:https://gillescobigo.com",
        "X-SOCIALPROFILE;type=linkedin:https://www.linkedin.com/in/gillescobigo",
        "NOTE:Rencontré au Salon du numérique du Pays Basque\\, 24/09/2026",
        "REV:2026-09-24T11:30:05Z",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("échappe les champs texte (N, FN, TITLE, NOTE) mais pas les URI", () => {
    const vcard = buildVCard({ ...CONTACT, last: "Co;bi,go", title: "A\\B", url: "https://x.fr/a,b" }, NOW);
    expect(vcard).toContain("N:Co\\;bi\\,go;Gilles;;;");
    expect(vcard).toContain("FN:Gilles Co\\;bi\\,go");
    expect(vcard).toContain("TITLE:A\\\\B");
    expect(vcard).toContain("URL:https://x.fr/a,b");
  });

  it("plie une ligne trop longue sans casser la fiche", () => {
    const vcard = buildVCard({ ...CONTACT, note: "é".repeat(60) }, NOW);
    const lines = vcard.split("\r\n");
    lines.forEach((line) => expect(utf8Length(line)).toBeLessThanOrEqual(75));
    const unfolded = vcard.replace(/\r\n /g, "");
    expect(unfolded).toContain(`NOTE:${"é".repeat(60)}`);
  });

  it("accepte des champs texte vides", () => {
    const vcard = buildVCard({ ...CONTACT, title: "", note: "" }, NOW);
    expect(vcard).toContain("\r\nTITLE:\r\n");
    expect(vcard).toContain("\r\nNOTE:\r\n");
  });

  it("lève une erreur sur une date invalide plutôt que d'écrire une REV fausse", () => {
    expect(() => buildVCard(CONTACT, new Date("pas une date"))).toThrow(RangeError);
  });
});

describe("escapeVCardText (RFC 2426 §4)", () => {
  it("échappe \\ ; , et les sauts de ligne", () => {
    expect(escapeVCardText("a\\b;c,d\ne\r\nf")).toBe("a\\\\b\\;c\\,d\\ne\\nf");
  });

  it("échappe l'antislash avant le reste (pas de double échappement)", () => {
    expect(escapeVCardText("\\;")).toBe("\\\\\\;");
  });

  it("laisse une chaîne vide vide", () => {
    expect(escapeVCardText("")).toBe("");
  });
});

describe("foldVCardLine (75 octets UTF-8)", () => {
  it("ne touche pas une ligne de 75 octets", () => {
    const line = "x".repeat(75);
    expect(foldVCardLine(line)).toBe(line);
  });

  it("plie à 75 octets puis 74 + espace de continuation", () => {
    const folded = foldVCardLine("x".repeat(200));
    const parts = folded.split("\r\n");
    expect(parts[0]).toHaveLength(75);
    parts.slice(1).forEach((p) => {
      expect(p.startsWith(" ")).toBe(true);
      expect(utf8Length(p)).toBeLessThanOrEqual(75);
    });
    expect(folded.replace(/\r\n /g, "")).toBe("x".repeat(200));
  });

  it("ne coupe jamais un caractère multi-octets", () => {
    const line = "a" + "é".repeat(50);
    const folded = foldVCardLine(line);
    expect(folded).not.toContain("�");
    expect(folded.replace(/\r\n /g, "")).toBe(line);
    folded.split("\r\n").forEach((p) => expect(utf8Length(p)).toBeLessThanOrEqual(75));
  });

  it("laisse une ligne vide vide", () => {
    expect(foldVCardLine("")).toBe("");
  });
});
