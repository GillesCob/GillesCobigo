// Import relatif vers public/ en `?raw`, même raison que SalonStand.tsx. Fichier généré avec
// l'algorithme renderQR() du mockup carte-salon-habitat.html, URL HABITAT_QR_URL.
import qrSvg from "../../../../public/images/qr-habitat-expo.svg?raw";
import SalonStandScreen from "../SalonStandScreen";
import { useDocumentIcon } from "../useDocumentIcon";
import { HABITAT_DISPLAY_URL, HABITAT_ROLE } from "./habitatExpoContent";

// Écran stand du salon Habitat Expo (mockup carte-salon-habitat.html, #stand).
export default function HabitatExpoStand() {
  useDocumentIcon("/images/favicon.png");
  return <SalonStandScreen role={HABITAT_ROLE} qrSvg={qrSvg} displayUrl={HABITAT_DISPLAY_URL} />;
}
