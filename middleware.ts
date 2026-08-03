// Edge Middleware Vercel : le portfolio est un SPA React sans rendu serveur,
// donc les robots qui génèrent les cartes de partage (iMessage, Slack...) ne
// voient jamais les changements de titre faits en React (ils ne jouent pas le JS).
// Ce middleware réécrit les balises meta du HTML servi, avant que la réponse
// parte, uniquement pour les routes /preview/<slug>/... concernées.

// Ajouter une entrée ici pour tout nouveau client/projet partagé via /preview/<slug>/...
const PROJECT_TITLES: Record<string, string> = {
  "dressing-mailys": "Échanges Dressing de Maïlys",
};

export const config = {
  matcher: "/preview/:path*",
};

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean); // ["preview", "<slug>", "<secret>", ...]
  const slug = segments[1];
  const title = slug ? PROJECT_TITLES[slug] : undefined;

  const indexRes = await fetch(new URL("/index.html", request.url));
  let html = await indexRes.text();

  if (title) {
    const description = "Suivi du projet avec Gilles Cobigo";
    // \s inclut les retours à la ligne : marche que la balise soit sur une ligne
    // ou éclatée sur plusieurs (insensible au formatage réel du index.html).
    html = html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`)
      .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`)
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${description}" />`,
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${description}" />`,
      )
      .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url.toString()}" />`);
  }

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
