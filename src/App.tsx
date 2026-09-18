import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewHome from "@/pages/NewHome";
import VideoLanding from "@/pages/VideoLanding";
import PreviewHome from "@/pages/PreviewHome";
import PreviewRound from "@/pages/PreviewRound";
import CaseStudyRound from "@/pages/CaseStudyRound";
import CGVBoutiques from "@/pages/CGVBoutiques";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ScrollReset from "@/components/layout/ScrollReset";

// Bascule du 18/09 : /new devient la page d'accueil (décision de Gilles, la refonte v5 est
// pixel-perfect sur toutes ses sections, cf PR #204/#205), puis /new lui-même retiré du routeur
// le même jour (doublon devenu inutile une fois / sur le même composant NewHome, cf PR #206 et
// commit suivant). L'ancien site public (Home, Projects, CocotteVersions, Articles, ArticlePage,
// Contact) est retiré du routeur mais PAS supprimé du code (fichiers intacts dans src/pages,
// imports simplement retirés ici) : toute URL qui pointait dessus retombe sur le catch-all `*`
// (NotFound), comme n'importe quelle route inexistante. Les mécanismes clients en cours (vidéo de
// prospection, preview, cas client, CGV Boutiques) restent inchangés et actifs, cf commentaires
// isBareLayout ci-dessous.
export default function App() {
  const location = useLocation();
  // Pages partagées telles quelles par lien direct (prospection vidéo, preview client) : sans navbar ni footer du site.
  // / (refonte v5, toggle Dev/Bâtiment, devenue la home le 18/09) a sa propre topbar (ModeToggle)
  // et sa propre section Contact inline : le Navbar/Footer globaux (toujours fond sombre #0A0A0A
  // quel que soit le thème) feraient doublon avec ce header et casseraient le rendu clair/sombre
  // suivant le thème du visiteur.
  const isBareLayout =
    location.pathname.startsWith("/v/") ||
    location.pathname.startsWith("/preview/") ||
    location.pathname.startsWith("/cas-client/") ||
    location.pathname.startsWith("/cgv-boutiques") ||
    location.pathname === "/";
  const hideFooter = isBareLayout;

  return (
    <div>
      <ScrollReset />
      {!isBareLayout && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<NewHome />} />
          <Route path="/v/:token" element={<VideoLanding />} />
          <Route path="/preview/:project/:secret" element={<PreviewHome />} />
          <Route path="/preview/:project/:secret/:round" element={<PreviewRound />} />
          <Route path="/cas-client/:round" element={<CaseStudyRound />} />
          <Route path="/cgv-boutiques" element={<CGVBoutiques />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      {/* Absent du mockup /new (contrairement aux autres pages "bare layout" type /preview/*, qui
          le gardent) : exclusion scopée à /, seule route qui sert encore ce contenu depuis le
          retrait de /new le 18/09 (doublon devenu inutile une fois / passé sur le même composant). */}
      {location.pathname !== "/" && <ScrollToTop />}
    </div>
  );
}
