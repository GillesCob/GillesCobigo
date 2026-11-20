import { useState } from "react";
import { ArrowRight } from "lucide-react";

/** Colonne de droite : « Les plus » (toujours ouvert) et « Besoin de plus d'infos ? » (repliable), maquette S-203. */
export default function TarifAsideCards() {
  const [infosOpen, setInfosOpen] = useState(false);

  return (
    <div className="colonne-droite">
      <div className="dd">
        <button type="button" className="dd-btn fige" aria-expanded="true" disabled>
          Les plus
        </button>
        <div className="dd-corps">
          <div className="dd-int">
            <ul className="plus">
              <li>
                <span className="v">✓</span>
                <span>Vous bénéficiez d'un interlocuteur unique qui vous accompagne personnellement sur votre projet</span>
              </li>
              <li>
                <span className="v">✓</span>
                <span>
                  Vous vous focalisez sur le contenu et le design de votre site, l'aspect technique et la sécurisation sont
                  inclus dans mes services.
                </span>
              </li>
              <li>
                <span className="v">✓</span>
                <span>
                  Vous êtes propriétaire de votre site, l'export du code vous sera fourni lors de sa mise en ligne ou à votre
                  demande.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="dd">
        <button
          type="button"
          className="dd-btn"
          aria-expanded={infosOpen}
          aria-controls="tarif-infos"
          onClick={() => setInfosOpen((o) => !o)}
        >
          Besoin de plus d'infos ?<span className="dd-fl" aria-hidden="true">▾</span>
        </button>
        <div className="dd-corps" id="tarif-infos" hidden={!infosOpen}>
          <div className="dd-int">
            <p className="mut">
              Suivez la création du site du Dressing de Maïlys, de la 1ère version à la version finale ! Je vous propose de
              parcourir les échanges que j'ai eus avec Mylène, gérante du Dressing de Maïlys, afin de mieux comprendre comment
              nous travaillerons ensemble à la réalisation de votre nouveau site.
            </p>
            <a className="btn btn-sm" href="/cas-client/v1" target="_blank" rel="noopener noreferrer">
              Suivre le parcours de création d'un site <ArrowRight />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
