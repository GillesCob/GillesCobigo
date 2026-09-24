// vCard 3.0 générée côté client, reprise exacte du script du mockup
// Projets/Portfolio/mockups/carte-salon.html (CONTACT, esc, fold, buildVCard).
// Seul écart : la date de révision (REV) est passée en paramètre au lieu d'un `new Date()`
// interne, pour garder la fonction pure et testable.

export interface IVCardContact {
  first: string;
  last: string;
  title: string;
  email: string;
  tel: string;
  url: string;
  linkedin: string;
  note: string;
}

// RFC 2426 §4 : échapper \ ; , et les sauts de ligne dans les valeurs texte.
export function escapeVCardText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

const MAX_LINE_BYTES = 75;

// Pliage à 75 octets UTF-8, sans couper un caractère multi-octets. Les lignes de continuation
// commencent par un espace, d'où la limite de 74 octets de contenu après la première.
export function foldVCardLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= MAX_LINE_BYTES) return line;
  const parts: string[] = [];
  let current = "";
  let limit = MAX_LINE_BYTES;
  for (const char of line) {
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = "";
      limit = MAX_LINE_BYTES - 1;
    }
    current += char;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildVCard(contact: IVCardContact, revision: Date): string {
  return (
    [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCardText(contact.last)};${escapeVCardText(contact.first)};;;`,
      `FN:${escapeVCardText(`${contact.first} ${contact.last}`)}`,
      `TITLE:${escapeVCardText(contact.title)}`,
      `EMAIL;TYPE=INTERNET,PREF:${contact.email}`,
      `TEL;TYPE=CELL,VOICE:${contact.tel}`,
      `URL:${contact.url}`,
      `X-SOCIALPROFILE;type=linkedin:${contact.linkedin}`,
      `NOTE:${escapeVCardText(contact.note)}`,
      `REV:${revision.toISOString().replace(/\.\d{3}/, "")}`,
      "END:VCARD",
    ]
      .map(foldVCardLine)
      .join("\r\n") + "\r\n"
  );
}
