// Chemin relatif vers public/ (et non "/images/...") : Vite refuse l'import JS d'un asset servi
// depuis public/ par son URL, mais lit le fichier source sans souci. Même fichier que celui servi
// en statique sur /images/qr-salon-pays-basque.svg, une seule source.
import qrSvg from "../../../public/images/qr-salon-pays-basque.svg?raw";
import SalonStandScreen from "./SalonStandScreen";

// Écran stand du Salon du numérique du Pays Basque (mockup carte-salon.html, #stand).
export default function SalonStand() {
  return <SalonStandScreen role="Développeur fullstack" qrSvg={qrSvg} displayUrl="gillescobigo.com/salon-pays-basque" />;
}
