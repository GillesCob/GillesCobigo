import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewHome from "@/pages/NewHome";
import Articles from "@/pages/Articles";
import ArticlePage from "@/pages/ArticlePage";
import VideoLanding from "@/pages/VideoLanding";
import PreviewHome from "@/pages/PreviewHome";
import PreviewRound from "@/pages/PreviewRound";
import CaseStudyRound from "@/pages/CaseStudyRound";
import CGVBoutiques from "@/pages/CGVBoutiques";
import SalonRecruiter from "@/pages/salon/SalonRecruiter";
import SalonStand from "@/pages/salon/SalonStand";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ScrollReset from "@/components/layout/ScrollReset";

// Bascule du 18/09 : /new devient la page d'accueil (décision de Gilles, la refonte v5 est
// pixel-perfect sur toutes ses sections, cf PR #204/#205), puis /new lui-même retiré du routeur
// le même jour (doublon devenu inutile une fois / sur le même composant NewHome, cf PR #206 et
// commit suivant). L'ancien site public (Home, Projects, CocotteVersions, Contact) est retiré du
// routeur mais PAS supprimé du code (fichiers intacts dans src/pages, imports simplement retirés
// ici) : toute URL qui pointait dessus retombe sur le catch-all `*` (NotFound), comme n'importe
// quelle route inexistante. Exception : les pages articles (/articles, /articles/scheduled,
// /articles/:slug/*) sont réactivées avec la palette v5 et leur propre navbar (mockup
// Projets/Portfolio/mockups/articles-v5.html), reliées à la section Articles de la home. Les
// mécanismes clients en cours (vidéo de prospection, preview, cas client, CGV Boutiques) restent
// inchangés et actifs, cf commentaires isBareLayout ci-dessous.
export default function App() {
  const location = useLocation();
  // Navbar/Footer globaux jamais utilises par aucune route de ce routeur : / (refonte v5,
  // toggle Dev/Batiment) a sa propre topbar (ModeToggle) et sa propre section Contact
  // inline, les pages articles ont leur propre navbar v5 (ArticlesNavbar, logo + nom calés
  // sur la topbar de la home, sans footer comme avant : sidebar et sommaire fixes sur toute la
  // hauteur le recouvriraient), les pages partagees par lien direct (video, preview, cas
  // client, CGV) n'en ont jamais eu besoin, et le catch-all 404 (`*`) vient de perdre le sien
  // le 18/09 sur demande de Gilles (page 404 sans navbar, fond blanc, logo noir, cf
  // NotFound.tsx). Si une future route a besoin du Navbar/Footer globaux, reintroduire une
  // condition ici plutot que de les supprimer.
  const isBareLayout = true;
  const hideFooter = isBareLayout;

  return (
    <div>
      <ScrollReset />
      {!isBareLayout && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<NewHome />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/scheduled" element={<Articles scheduledOnly />} />
          <Route path="/articles/:slug/*" element={<ArticlePage />} />
          <Route path="/v/:token" element={<VideoLanding />} />
          <Route path="/preview/:project/:secret" element={<PreviewHome />} />
          <Route path="/preview/:project/:secret/:round" element={<PreviewRound />} />
          <Route path="/cas-client/:round" element={<CaseStudyRound />} />
          <Route path="/cgv-boutiques" element={<CGVBoutiques />} />
          {/* Carte salon du 24/09 (mockup Projets/Portfolio/mockups/carte-salon.html) : page
              recruteur ouverte par le QR, et écran QR affiché au stand. noindex, cf useSalonDocument. */}
          <Route path="/salon-pays-basque" element={<SalonRecruiter />} />
          <Route path="/salon-pays-basque/stand" element={<SalonStand />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      {/* Absent du mockup /new (contrairement aux autres pages "bare layout" type /preview/*, qui
          le gardent) : exclusion scopée à /, seule route qui sert encore ce contenu depuis le
          retrait de /new le 18/09 (doublon devenu inutile une fois / passé sur le même composant). */}
      {/* Exclu aussi des pages salon : bouton absent du mockup carte-salon.html. */}
      {location.pathname !== "/" && !location.pathname.startsWith("/salon-pays-basque") && <ScrollToTop />}
    </div>
  );
}
