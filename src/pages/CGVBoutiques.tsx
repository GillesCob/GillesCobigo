import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

// Page publique des CGV du flux "Boutiques" (prospection a froid de commerces locaux, cf
// Projets/Boutiques/ dans le vault). Contenu copie tel quel depuis le brouillon valide dans
// Projets/Boutiques/suivi.html (section CGV), y compris le tableau de remboursement par etape.
// Layout bare (pas de navbar/footer du portfolio), meme traitement que /cas-client et /preview,
// cf App.tsx isBareLayout.

const REFUND_STEPS = ["V2", "V3", "V4", "V5", "V6", "Mise en ligne"];
// 500E repartis sur les 6 etapes payantes (V2 a mise en ligne), la V1 etant gratuite/prospection.
const ACQUIS_SANS_DOMAINE = [83, 167, 250, 333, 417, 500];

export default function CGVBoutiques() {
  const { theme, toggleTheme } = useThemeStore();
  const [withDomain, setWithDomain] = useState(false);
  const total = withDomain ? 520 : 500;

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

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
                <li>Version supplémentaire (V7, V8...) ou modification après mise en ligne : 40€ (30€ avec la Formule Sérénité).</li>
                <li>Formule Sérénité : 75€ pour 12 mois (nom de domaine inclus pour cette période, 2 modifications, délai prioritaire 48h ouvrées, tarif réduit sur les modifications suivantes). Non reconduite automatiquement : à reprendre l'année suivante si vous le souhaitez.</li>
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

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">5. Durée et résiliation</h2>
              <p className="mb-4">
                Le forfait est réglé à la signature. La V1 (premier jet) est réalisée gratuitement dans le
                cadre de la prospection, avant tout engagement : le forfait couvre les versions V2 à V6 et la
                mise en ligne. En cas d'arrêt entre la signature et la mise en ligne, seules les étapes déjà
                livrées sont dues, le reste est remboursé au prorata (détail ci-dessous). Une fois le site en
                ligne, la prestation est considérée comme rendue en totalité, aucun remboursement.
              </p>

              <div className="inline-flex rounded-md border border-border overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => setWithDomain(false)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    !withDomain ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sans nom de domaine (500€)
                </button>
                <button
                  type="button"
                  onClick={() => setWithDomain(true)}
                  className={`px-3 py-1.5 text-xs font-medium border-l border-border transition-colors ${
                    withDomain ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Avec nom de domaine (520€)
                </button>
              </div>

              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="font-medium py-1.5 pr-2">Étape livrée</th>
                    <th className="font-medium py-1.5 pr-2">Acquis (non remboursable)</th>
                    <th className="font-medium py-1.5">Remboursable si arrêt</th>
                  </tr>
                </thead>
                <tbody>
                  {REFUND_STEPS.map((label, i) => {
                    const acquis = ACQUIS_SANS_DOMAINE[i] + (withDomain ? 20 : 0);
                    return (
                      <tr key={label} className="border-b border-border/60">
                        <td className="py-1.5 pr-2">{label}</td>
                        <td className="py-1.5 pr-2">{acquis}€</td>
                        <td className="py-1.5">{total - acquis}€</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground">
                Montants arrondis à l'euro (500€ répartis sur les 6 étapes V2 à mise en ligne). Le nom de
                domaine, une fois acheté, est immédiatement enregistré à votre nom : les 20€ sont acquis dès la
                signature, indépendamment de la suite.
              </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
