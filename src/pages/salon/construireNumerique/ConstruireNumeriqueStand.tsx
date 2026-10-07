// Import relatif vers public/ en `?raw`, même raison que SalonStand.tsx. Fichier généré avec
// l'algorithme renderQR() du mockup, URL NUMERIQUE_QR_URL (même script que qr-habitat-expo.svg,
// reproduit à l'octet près avant génération).
import qrSvg from "../../../../public/images/qr-construire-en-numerique.svg?raw";
import SalonStandScreen from "../SalonStandScreen";
import { useDocumentIcon } from "../useDocumentIcon";
import { NUMERIQUE_DISPLAY_URL, NUMERIQUE_ROLE } from "./construireNumeriqueContent";

// Écran stand de la journée Construire en numérique (mockup
// carte-salon-construire-en-numerique.html, #stand).
export default function ConstruireNumeriqueStand() {
  useDocumentIcon("/images/favicon.png");
  return <SalonStandScreen role={NUMERIQUE_ROLE} qrSvg={qrSvg} displayUrl={NUMERIQUE_DISPLAY_URL} />;
}
