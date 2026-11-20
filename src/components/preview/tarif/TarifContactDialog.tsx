import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import { CONTACT_ERROR_MESSAGE, sendContactRequest } from "@/lib/boutiquesPricing";
import type { ITarifOptions } from "@/hooks/useTarifOptions";

const MAIL_FALLBACK = "Préfère être contacté par mail";

interface IProps {
  projectName: string;
  options: ITarifOptions;
  /** Ouvre la modale a chaque changement de valeur (compteur incremente par le parent). */
  openSignal: number;
  cssVars: CSSProperties;
}

/** Modale « Comment vous joindre ? » : dialog natif (piege le focus, se ferme avec Echap), un seul envoi Formspree. */
export default function TarifContactDialog({ projectName, options, openSignal, cssVars }: IProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [contact, setContact] = useState("");
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (openSignal === 0) return;
    setContact("");
    setDone(false);
    setFailed(false);
    ref.current?.showModal();
  }, [openSignal]);

  async function send(value: string) {
    if (sending) return;
    setSending(true);
    setFailed(false);
    const ok = await sendContactRequest({
      projectName,
      withSubscription: options.withSubscription,
      withDomain: options.withDomain,
      contact: value,
    });
    setSending(false);
    if (ok) setDone(true);
    else setFailed(true);
  }

  // Clic sur le fond (::backdrop) : la cible est le dialog lui-meme mais le point est hors de son rectangle.
  // Un clic sur le remplissage interne du dialog (dans son rectangle) ne ferme rien.
  function closeOnOutsideClick(e: MouseEvent<HTMLDialogElement>) {
    const dialog = ref.current;
    if (dialog === null || e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    if (outside) dialog.close();
  }

  return (
    <dialog
      ref={ref}
      style={cssVars}
      aria-labelledby="tarif-dlg-titre"
      onClick={closeOnOutsideClick}
    >
      <button type="button" className="dlg-x" aria-label="Fermer" onClick={() => ref.current?.close()}>
        <X />
      </button>
      {done ? (
        <div>
          <CheckCircle2 className="dlg-valid" />
          <h2 className="dlg-t" id="tarif-dlg-titre">C'est noté !</h2>
          <p className="dlg-d fort">Je reviens vers vous rapidement !</p>
        </div>
      ) : (
        <div>
          <div>
            <h2 className="dlg-t" id="tarif-dlg-titre">Comment vous joindre ?</h2>
            <p className="dlg-d">Je vous recontacte au numéro indiqué.</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <input
              className="dlg-champ"
              type="text"
              aria-label="Votre numéro de téléphone"
              placeholder="Indiquez votre numéro"
              autoComplete="off"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="button" className="btn dlg-ok" disabled={sending || contact.trim() === ""} onClick={() => void send(contact.trim())}>
              {sending ? "Envoi..." : "Confirmer"}
            </button>
          </div>
          <button type="button" className="dlg-mail" onClick={() => void send(MAIL_FALLBACK)}>
            Je préfère qu'on échange par mail →
          </button>
          {failed && (
            <p className="dlg-erreur" role="alert">
              {CONTACT_ERROR_MESSAGE}
            </p>
          )}
          <p className="dlg-aucune">Aucune sollicitation commerciale n'aura lieu après ce premier échange.</p>
        </div>
      )}
    </dialog>
  );
}
