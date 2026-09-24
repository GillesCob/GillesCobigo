// Chemin relatif vers public/ (et non "/images/...") : Vite refuse l'import JS d'un asset servi
// depuis public/ par son URL, mais lit le fichier source sans souci. Même fichier que celui servi
// en statique sur /images/qr-salon-pays-basque.svg, une seule source.
import qrSvg from "../../../public/images/qr-salon-pays-basque.svg?raw";
import SalonScreen from "./SalonScreen";
import { useWakeLock } from "./useWakeLock";

// Écran affiché sur le téléphone de Gilles au stand (mockup carte-salon.html, #stand). Le QR est
// un SVG statique pré-généré (même rendu que renderQR() du mockup : qrcode-generator, correction
// d'erreur H, coins #2B4A4A, logo central embarqué), aucune dépendance de génération au runtime.
// Injecté inline comme le <svg id="qr"> du mockup, jamais via <img> : avec une taille de module
// fractionnaire (6,88 px à 390 px de large), un SVG rastérisé comme image place les bords des
// modules 1 px à côté du rendu inline (0,67 % d'écart mesuré au diff pixel). Contenu statique
// généré au build, pas d'entrée utilisateur : dangerouslySetInnerHTML sans risque ici.
export default function SalonStand() {
  useWakeLock();

  return (
    <SalonScreen className="stand">
      <div className="stand-id">
        <img src="/images/logo-gc-black.png" alt="" width="40" height="40" />
        <p>
          <strong id="stand-title">Gilles Cobigo</strong>
          <small>Développeur fullstack</small>
        </p>
      </div>

      <div className="plate-wrap">
        <div className="plate" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      </div>

      <p className="scan-cta">Scannez-moi</p>
      <p className="stand-url">
        ou tapez <b>gillescobigo.com/salon-pays-basque</b>
      </p>
    </SalonScreen>
  );
}
