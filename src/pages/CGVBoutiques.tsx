import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Page publique des CGV du flux "Boutiques" (prospection a froid de commerces locaux, cf
// Projets/Boutiques/ dans le vault). Contenu porte depuis le mockup de reference
// _templates/cgv-template-v1.html (vault), source de verite pour toute evolution future (cf
// Moi/regle-portage-mockup-prod.md section 6) : ne jamais modifier ce fichier directement sans
// passer par le mockup d'abord.
// Layout bare (pas de navbar/footer du portfolio), meme traitement que /cas-client et /preview,
// cf App.tsx isBareLayout. Theme force clair (themeStore.ts, isProspectFacing), aucun bouton de
// bascule sur cette page (20/08, alignee sur le mockup).

// Tarif (decision du 25/11/2026) : 2 allers-retours (V1 et V2, V0 = version gratuite envoyee) a 90€
// chacun + mise en ligne 50€ (deploiement technique, pas un round de conception) = a partir de 230€.
// Aller-retour supplementaire ou modification apres la mise en ligne : 90€, sans plafond ni palier.
const BASE_STEPS = ["V1", "V2"];
const MISE_EN_LIGNE_VALUE = 50;
const ROUND_VALUE = 90;
const BASE_TOTAL = ROUND_VALUE * BASE_STEPS.length + MISE_EN_LIGNE_VALUE;
const BASE_ACQUIS = BASE_STEPS.map((_, i) => Math.round(ROUND_VALUE * (i + 1)));

type Scenario = "none" | "domain";

export default function CGVBoutiques() {
  const [scenario, setScenario] = useState<Scenario>("none");

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

  const total = scenario === "domain" ? BASE_TOTAL + 20 : BASE_TOTAL;
  const domainPart = scenario === "domain" ? 20 : 0;

  const rows: { label: string; acquis: number }[] = BASE_STEPS.map((label, i) => ({
    label,
    acquis: BASE_ACQUIS[i] + domainPart,
  }));
  rows.push({ label: "Mise en ligne", acquis: total });

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      <div className="flex-1 px-6 md:px-12 py-14 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Conditions générales de vente</h1>
          <p className="text-sm text-muted-foreground mb-10">Création de site vitrine pour professionnels locaux</p>

          <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Prestation</h2>
              <p>La prestation est la création d'un site vitrine one page, en HTML, CSS et JavaScript. Elle comprend :</p>
              <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                <li>la création du site</li>
                <li>la V0 (deux propositions réalisées gratuitement avant tout engagement)</li>
                <li>2 allers-retours*, de la V1 à la V2, pour aller jusqu'au site que vous souhaitez</li>
                <li>la mise en ligne</li>
                <li>un site qui vous appartient, avec l'export complet de son code pour le faire reprendre par la personne de votre choix</li>
                <li>une notice (README) qui accompagne le code</li>
                <li>la correction gratuite, sans limite de durée, de tout ce qui devait fonctionner au moment de la mise en ligne du site</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                * Un aller-retour consiste à lister par écrit les modifications souhaitées sur la version
                en cours. Elles sont appliquées dans la version suivante (V1 après le premier
                aller-retour, V2 après le deuxième). Une version peut proposer plusieurs variations à
                comparer (couleurs, polices). Cela reste un seul aller-retour.{" "}
                <Link to="/cas-client/v1" target="_blank" rel="noopener" className="underline hover:text-foreground">
                  Voir un exemple d'allers-retours
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Tarifs</h2>
              <ul className="list-disc list-outside pl-5 space-y-1">
                <li>À partir de 230€ : 2 allers-retours à 90€ et la mise en ligne à 50€.</li>
                <li>Aller-retour supplémentaire, ou modification du site après la mise en ligne : 90€, sans plafond.</li>
                <li>Gestion de votre nom de domaine par le prestataire : 20€/an, renouvellement et gestion technique compris.</li>
                <li>Gestion de votre nom de domaine par vos soins : toute demande technique fait l'objet d'un devis, à partir de 40€ (article 8).</li>
                <li>Toute évolution ou projet plus ambitieux : devis séparé.</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">TVA non applicable, art. 293 B du CGI.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Propriété et réversibilité du code</h2>
              <p>
                Le site vous appartient entièrement. Le nom de domaine est toujours enregistré à votre nom. Le
                code source reste hébergé sur un repository privé chez le prestataire. Un export complet du
                code vous est fourni dès la mise en ligne du site. Le prestataire reste disponible pour vous le
                renvoyer à tout moment par la suite.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Nom de domaine</h2>
              <p>Deux possibilités existent pour votre nom de domaine.</p>
              <h3 className="font-semibold text-foreground mt-3">1. Vous gérez vous-même votre nom de domaine</h3>
              <p className="mt-1">
                Vous gardez votre nom de domaine sur le site où vous l'avez acheté (votre registrar) et vous le
                gérez vous-même.
              </p>
              <p className="mt-2">Tout besoin technique est facturé conformément à l'article 2 (tarifs).</p>
              <h3 className="font-semibold text-foreground mt-3">2. Le prestataire gère votre nom de domaine</h3>
              <p className="mt-1">
                Le forfait de l'article 2 couvre le renouvellement du domaine et sa gestion technique.
              </p>
              <p className="mt-2">
                Il s'applique que le prestataire achète le domaine pour votre compte ou que vous le fassiez
                transférer chez lui.
              </p>
              <p className="mt-2">
                Ce forfait est facturé dès la première année, quelle que soit la date d'échéance de votre domaine.
              </p>
              <p className="mt-2">
                Si le prestataire achète le domaine pour votre compte, son renouvellement annuel est facturé avant
                chaque échéance (environ 2 mois à l'avance). Sans règlement à cette date, le domaine n'est pas
                renouvelé : le prestataire ne prend jamais en charge un renouvellement non payé.
              </p>
              <p className="mt-2">
                Si vous souhaitez transférer chez le prestataire un nom de domaine que vous avez déjà acheté, vous
                en faites vous-même la demande auprès du site où vous l'avez acheté (déverrouillage du domaine et
                code de transfert). Le prestataire vous accompagne pour réaliser ces démarches.
              </p>
            </section>

            <section id="remboursement">
              <h2 className="text-base font-semibold text-foreground mb-2">5. Durée et résiliation</h2>
              <p>
                Le forfait est réglé à la signature et se répartit en 90€ par aller-retour et 50€ pour
                la mise en ligne (détail dans le tableau ci-dessous).
              </p>
              <p className="mt-2">
                En cas d'arrêt avant la mise en ligne, seuls les allers-retours déjà livrés sont dus, le reste est
                remboursé au prorata.
              </p>
              <p className="mt-2">
                Il n'est pas nécessaire d'aller jusqu'à la V2 pour être mis en ligne : dès qu'une version
                vous convient, elle peut être mise en ligne moyennant les 50€ de mise en ligne, les allers-retours
                restants étant alors remboursés comme pour tout arrêt anticipé.
              </p>
              <p className="mt-2 mb-4">
                Une prestation arrêtée de manière anticipée reste facturée au tarif du forfait, soit 90€ par
                aller-retour déjà livré. Chaque nouvel aller-retour demandé au-delà des 2 inclus (V1 et V2), ou
                chaque modification du site après la mise en ligne, est facturé 90€.
              </p>

              <div className="inline-flex rounded-md border border-border overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => setScenario("none")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    scenario === "none" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sans nom de domaine (230€)
                </button>
                <button
                  type="button"
                  onClick={() => setScenario("domain")}
                  className={`px-3 py-1.5 text-xs font-medium border-l border-border transition-colors ${
                    scenario === "domain" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Avec nom de domaine (250€)
                </button>
              </div>

              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="font-medium py-1.5 pr-2">Version livrée</th>
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
                  Montants arrondis à l'euro. Les 50€ de mise en ligne correspondent au déploiement
                  technique, pas à une version de conception. Les 20€ du nom de domaine sont acquis
                  dès la signature, indépendamment de la suite.
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

            <section id="assistance">
              <h2 className="text-base font-semibold text-foreground mb-2">8. Assistance après la mise en ligne</h2>
              <p>
                Si vous gérez vous-même votre nom de domaine, tout souci technique (domaine, DNS, mail, site qui
                ne fonctionne plus...) fait l'objet d'un devis, facturé 40€ de l'heure avec un minimum de 40€ par
                demande. Le montant facturé est celui du devis.
              </p>
              <p className="mt-2">
                Le devis ne couvre que les problématiques qui y sont listées. Toute demande ajoutée donne lieu
                à un nouveau devis.
              </p>
              <p className="mt-2">
                Si le prestataire gère votre nom de domaine (20€ par an), ses interventions techniques sont
                comprises dans ce forfait.
              </p>
              <p className="mt-2">
                Un problème lié à la mise en place réalisée par le prestataire (défaut de sa livraison) est
                toujours compris dans ce que vous avez déjà payé, sans devis ni limite de durée.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
