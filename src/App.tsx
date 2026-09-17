import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import NewHome from "@/pages/NewHome";
import Projects from "@/pages/Projects";
import CocotteVersions from "@/pages/CocotteVersions";
import Articles from "@/pages/Articles";
import ArticlePage from "@/pages/ArticlePage";
import Contact from "@/pages/Contact";
import VideoLanding from "@/pages/VideoLanding";
import PreviewHome from "@/pages/PreviewHome";
import PreviewRound from "@/pages/PreviewRound";
import CaseStudyRound from "@/pages/CaseStudyRound";
import CGVBoutiques from "@/pages/CGVBoutiques";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ScrollReset from "@/components/layout/ScrollReset";

export default function App() {
  const location = useLocation();
  // Pages partagées telles quelles par lien direct (prospection vidéo, preview client) : sans navbar ni footer du site.
  // /new (brouillon refonte v5, toggle Dev/Bâtiment) a sa propre topbar (ModeToggle) et sa propre
  // section Contact inline : le Navbar/Footer globaux (toujours fond sombre #0A0A0A quel que soit
  // le thème) feraient doublon avec son header et casseraient le rendu clair/sombre suivant le
  // thème du visiteur.
  const isBareLayout =
    location.pathname.startsWith("/v/") ||
    location.pathname.startsWith("/preview/") ||
    location.pathname.startsWith("/cas-client/") ||
    location.pathname.startsWith("/cgv-boutiques") ||
    location.pathname === "/new";
  // Les pages articles ont une sidebar + un sommaire en position fixed sur toute la hauteur
  // de l'écran : un footer en dessous se ferait toujours recouvrir par ces deux panneaux.
  const hideFooter = location.pathname.startsWith("/articles") || isBareLayout;
  // Contenu court : sans ça le footer remonte juste sous le formulaire au lieu de rester en bas d'écran.
  const isContactPage = location.pathname === "/contact";

  return (
    <div className={isContactPage ? "min-h-dvh flex flex-col" : undefined}>
      <ScrollReset />
      {!isBareLayout && <Navbar />}
      <main className={isContactPage ? "flex-1" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<NewHome />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/cocotte-eclair/versions" element={<CocotteVersions />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/scheduled" element={<Articles scheduledOnly />} />
          <Route path="/articles/:slug/*" element={<ArticlePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/v/:token" element={<VideoLanding />} />
          <Route path="/preview/:project/:secret" element={<PreviewHome />} />
          <Route path="/preview/:project/:secret/:round" element={<PreviewRound />} />
          <Route path="/cas-client/:round" element={<CaseStudyRound />} />
          <Route path="/cgv-boutiques" element={<CGVBoutiques />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <ScrollToTop />
    </div>
  );
}
