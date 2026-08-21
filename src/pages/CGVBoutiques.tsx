import { useEffect, useState } from "react";

// Page publique des CGV du flux "Boutiques" (prospection a froid de commerces locaux, cf
// Projets/Boutiques/ dans le vault). Contenu porte depuis le mockup de reference
// _templates/cgv-template-v1.html (vault), source de verite pour toute evolution future (cf
// Moi/regle-portage-mockup-prod.md section 6) : ne jamais modifier ce fichier directement sans
// passer par le mockup d'abord.
// Layout bare (pas de navbar/footer du portfolio), meme traitement que /cas-client et /preview,
// cf App.tsx isBareLayout. Theme force clair (themeStore.ts, isProspectFacing), aucun bouton de
// bascule sur cette page (20/08, alignee sur le mockup).

// Repartition du forfait 500€ (20/08) : 30€ fixes pour la mise en ligne (deploiement technique,
// pas un round de conception), le reste (470€) divise a parts egales sur les 5 rounds de
// conception (V2 a V6) = 94€ chacun. Remplace l'ancienne repartition egale sur 6 etapes (500/6),
// qui surevaluait la mise en ligne au meme niveau qu'un round de conception.
const BASE_STEPS = ["V2", "V3", "V4", "V5", "V6"];
const MISE_EN_LIGNE_VALUE = 30;
const ROUND_VALUE = (500 - MISE_EN_LIGNE_VALUE) / BASE_STEPS.length;
const BASE_ACQUIS = BASE_STEPS.map((_, i) => Math.round(ROUND_VALUE * (i + 1)));
const V6_ACQUIS = BASE_ACQUIS[BASE_ACQUIS.length - 1];
// Formule Serenite (75€) : 20€ nom de domaine (acquis immediatement, meme regle que l'option
// domaine seule) + 55€ pour 2 allers-retours inclus, acquis seulement au fur et a mesure de
// leur utilisation (27,50€ chacun). Un allers-retours utilise pour une version supplementaire
// (V7, V8...) avant la mise en ligne ajoute une ligne au tableau ; utilisee apres la mise en
// ligne, elle n'a aucun impact ici (plus de remboursement possible a ce stade de toute facon).
const MODIF_CREDIT_VALUE = 27.5;

type Scenario = "none" | "domain" | "serenite";

export default function CGVBoutiques() {
  const [scenario, setScenario] = useState<Scenario>("none");
  const [v7Done, setV7Done] = useState(false);
  const [v8Done, setV8Done] = useState(false);

  // Scroll vers l'ancre au chargement (20/08, lien depuis la checklist "Appel" de
  // Boutiques/suivi.html vers /cgv-boutiques#remboursement) : sur une navigation complete
  // (nouvel onglet), le scroll natif du navigateur tente de s'executer avant que React ait
  // peint le DOM, donc rate sa cible. Meme pattern que Home.tsx (scrollIntoView differe apres
  // un court delai plutot que de compter sur le scroll natif).
  // Mise en surbrillance temporaire du titre de la section ciblee (portee le 20/08 depuis
  // _templates/cgv-template-v1.html, seule reference jusqu'ici : le lien "Confidentialite" du
  // bandeau bas des propositions pointe vers /cgv-boutiques#donnees-confidentialite, cette
  // animation n'existait que sur le mockup). Delai de 500ms apres le scroll (pas de callback
  // natif sur scrollIntoView smooth) pour laisser le temps a l'animation de scroll de se
  // terminer avant de declencher le grossissement. Cible le h2 de la section, pas la section
  // entiere (precise par Gilles). Classe retiree a la fin de l'animation (animationend), pour
  // rester rejouable si le hash change a nouveau sans recharger la page.
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    let highlightTimeout: ReturnType<typeof setTimeout> | undefined;
    const scrollTimeout = setTimeout(() => {
      const el = document.getElementById(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const title = el.querySelector("h2");
      if (!title) return;
      highlightTimeout = setTimeout(() => {
        title.classList.add("cgv-highlight");
        title.addEventListener(
          "animationend",
          function onEnd() {
            title.classList.remove("cgv-highlight");
          },
          { once: true },
        );
      }, 500);
    }, 100);
    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(highlightTimeout);
    };
  }, []);

  const total = scenario === "domain" ? 520 : scenario === "serenite" ? 575 : 500;
  const domainPart = scenario === "domain" || scenario === "serenite" ? 20 : 0;
  const modifsUsed = scenario === "serenite" ? (v8Done ? 2 : v7Done ? 1 : 0) : 0;

  const rows: { label: string; acquis: number }[] = BASE_STEPS.map((label, i) => ({
    label,
    acquis: BASE_ACQUIS[i] + domainPart,
  }));
  if (scenario === "serenite") {
    if (modifsUsed >= 1) rows.push({ label: "V7", acquis: V6_ACQUIS + domainPart + MODIF_CREDIT_VALUE });
    if (modifsUsed >= 2) rows.push({ label: "V8", acquis: V6_ACQUIS + domainPart + MODIF_CREDIT_VALUE * 2 });
  }
  rows.push({ label: "Mise en ligne", acquis: total });

  function toggleV7(checked: boolean) {
    setV7Done(checked);
    if (!checked) setV8Done(false);
  }
  function toggleV8(checked: boolean) {
    setV8Done(checked);
    if (checked) setV7Done(true);
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      <div className="flex-1 px-6 md:px-12 py-14 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Conditions générales de vente</h1>
          <p className="text-sm text-muted-foreground mb-10">Création de site vitrine pour commerces locaux</p>

          <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Prestation</h2>
              <p>
                Création d'un site vitrine one-page (HTML/CSS/JS statique), jusqu'à 5 allers-retours de
                retouches (la version finale sera la V6), mise en ligne incluse si vous disposez déjà d'un nom
                de domaine. Une version peut proposer plusieurs variations à comparer (couleurs, polices...),
                ça reste un seul aller-retour.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Tarifs</h2>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>500€ le forfait initial (520€ si un nom de domaine doit être acheté).</li>
                <li>Nom de domaine : 20€/an, ou 85€ pour 5 ans prépayés.</li>
                <li>Version supplémentaire (V7, V8...) ou modification après mise en ligne : 40€.</li>
                <li>
                  Formule Sérénité, +75€ (paiement unique) : nom de domaine inclus pour la période, 2
                  allers-retours inclus (utilisables pour une version en plus avant mise en ligne ou une
                  modification après), retours sous 48h ouvrées. Non reconduite automatiquement.
                </li>
                <li>Toute évolution ou projet plus ambitieux (nouvelle fonctionnalité, boutique en ligne, site multi-pages...) : devis séparé, jamais ce tarif.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">TVA non applicable, art. 293 B du CGI.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Propriété et réversibilité du code</h2>
              <p>
                Le site vous appartient entièrement. Le nom de domaine est toujours enregistré à votre nom. Le
                code source reste hébergé sur un repository privé chez le prestataire. Un export complet du
                code vous est fourni dès la mise en ligne du site, sans que vous ayez à le demander : vous
                disposez de tout dès ce moment-là. Le prestataire reste disponible pour vous le renvoyer à tout
                moment par la suite. Aucune dépendance technique ne vous lie au prestataire : vous pouvez faire
                reprendre le code par un tiers quand vous le souhaitez, une notice (README) accompagne le code
                pour lui faciliter la prise en main.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Nom de domaine</h2>
              <p>
                Si le domaine est acheté par le prestataire pour votre compte, son renouvellement annuel est
                facturé avant chaque échéance (30 jours à l'avance). Sans règlement à cette date, le domaine
                n'est pas renouvelé : le prestataire ne prend jamais en charge un renouvellement non payé.
              </p>
            </section>

            <section id="remboursement">
              <h2 className="text-base font-semibold text-foreground mb-2">5. Durée et résiliation</h2>
              <p className="mb-4">
                Le forfait est réglé à la signature. La V1 (premier jet) est réalisée gratuitement dans le
                cadre de la prospection, avant tout engagement : le forfait couvre les versions V2 à V6 et la
                mise en ligne. En cas d'arrêt entre la signature et la mise en ligne, seules les étapes déjà
                livrées sont dues, le reste est remboursé au prorata (détail ci-dessous). Il n'est pas
                nécessaire d'aller jusqu'à la V6 pour être mis en ligne : dès qu'une version vous convient,
                elle peut être mise en ligne moyennant les 30€ de mise en ligne, les versions restantes du
                forfait étant alors remboursées au prorata comme pour tout arrêt anticipé (détail ci-dessous).
                Si vous demandez ensuite une évolution sur une version déjà remboursée, elle reste facturée
                au tarif du forfait (94€) et non au tarif modification après mise en ligne (40€, cf tarifs) :
                ce tarif réduit ne s'applique qu'au-delà des 6 versions couvertes par le forfait initial (V1
                à V6).
              </p>

              <div className="inline-flex rounded-md border border-border overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => setScenario("none")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    scenario === "none" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sans nom de domaine (500€)
                </button>
                <button
                  type="button"
                  onClick={() => setScenario("domain")}
                  className={`px-3 py-1.5 text-xs font-medium border-l border-border transition-colors ${
                    scenario === "domain" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Avec nom de domaine (520€)
                </button>
                <button
                  type="button"
                  onClick={() => setScenario("serenite")}
                  className={`px-3 py-1.5 text-xs font-medium border-l border-border transition-colors ${
                    scenario === "serenite" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Avec Formule Sérénité (575€)
                </button>
              </div>

              {scenario === "serenite" && (
                <div className="flex items-center flex-wrap gap-3 mb-4">
                  <span className="text-xs text-muted-foreground">Versions supplémentaires déjà livrées avant l'arrêt :</span>
                  <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={v7Done} onChange={(e) => toggleV7(e.target.checked)} />
                    V7
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={v8Done} onChange={(e) => toggleV8(e.target.checked)} />
                    V8
                  </label>
                </div>
              )}

              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="font-medium py-1.5 pr-2">Étape livrée</th>
                    <th className="font-medium py-1.5 pr-2">Acquis (non remboursable)</th>
                    <th className="font-medium py-1.5">Remboursable si arrêt</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const acquis = Math.round(row.acquis);
                    return (
                      <tr key={row.label} className="border-b border-border/60">
                        <td className="py-1.5 pr-2">{row.label}</td>
                        <td className="py-1.5 pr-2">{acquis}€</td>
                        <td className="py-1.5">{total - acquis}€</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer list-none text-foreground hover:underline">+ d'infos sur ce calcul</summary>
                <p className="mt-2">
                  Montants arrondis à l'euro. Les 500€ du forfait se répartissent en 94€ par round de
                  conception (V2 à V6) et 30€ pour la mise en ligne (déploiement technique, pas un round de
                  conception). Le nom de domaine, une fois acheté, est immédiatement enregistré à votre nom :
                  les 20€ (seul ou inclus dans la Formule Sérénité) sont acquis dès la signature,
                  indépendamment de la suite. Avec la Formule Sérénité, les 2 allers-retours inclus (55€) ne
                  sont acquis qu'au fur et à mesure de leur utilisation (27,50€ chacun) : une version
                  supplémentaire (V7, V8...) faite avant l'arrêt ajoute une ligne au tableau, la part non
                  utilisée reste remboursable. Un crédit utilisé pour une modification après la mise en ligne
                  n'apparaît pas ici : une fois le site en ligne, la prestation est de toute façon rendue en
                  totalité (aucun remboursement, cf plus haut).
                </p>
              </details>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">6. Contenus fournis par le client</h2>
              <p>
                Les textes, photos et autres contenus intégrés au site sont ceux que vous fournissez. Vous
                garantissez disposer des droits nécessaires sur ces contenus (droits d'auteur, droit à l'image)
                et en assumez l'entière responsabilité. En cas de réclamation d'un tiers liée à ces contenus,
                vous garantissez le prestataire contre toute conséquence de cette réclamation.
              </p>
            </section>

            <section id="donnees-confidentialite">
              <h2 className="text-base font-semibold text-foreground mb-2">7. Données et confidentialité</h2>
              <p>
                Le prestataire (Gilles Cobigo) traite deux types de données personnelles vous concernant :
                celles que vous transmettez via le formulaire de contact du site (nom, email, message), et un
                suivi de votre progression sur les pages de proposition qui vous sont adressées (quelle page a
                été consultée, à quel moment), pour comprendre où en est l'échange et améliorer la
                présentation. Ce suivi ne dépose aucun cookie ni traceur dans votre navigateur.
              </p>
              <p className="mt-2">
                Ces données sont utilisées uniquement dans le cadre du suivi commercial de votre projet et de
                l'amélioration du service, sur la base de l'intérêt légitime du prestataire à mener sa relation
                commerciale avec vous. Elles ne sont jamais partagées avec un tiers, ni revendues, ni utilisées
                à des fins publicitaires.
              </p>
              <p className="mt-2">
                Conservées le temps de la relation commerciale, puis 3 ans maximum après le dernier échange.
                Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données
                par simple mail au prestataire.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
