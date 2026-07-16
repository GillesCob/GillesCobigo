import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import Articles from "@/pages/Articles";
import ArticlePage from "@/pages/ArticlePage";
import Contact from "@/pages/Contact";
import VideoLanding from "@/pages/VideoLanding";
import NotFound from "@/pages/NotFound";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ScrollReset from "@/components/layout/ScrollReset";

export default function App() {
  const location = useLocation();
  // Page vidéo de prospection : partagée telle quelle par lien, sans navbar ni footer du site.
  const isVideoLanding = location.pathname.startsWith("/v/");
  // Les pages articles ont une sidebar + un sommaire en position fixed sur toute la hauteur
  // de l'écran : un footer en dessous se ferait toujours recouvrir par ces deux panneaux.
  const hideFooter = location.pathname.startsWith("/articles") || isVideoLanding;

  return (
    <>
      <ScrollReset />
      {!isVideoLanding && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/scheduled" element={<Articles scheduledOnly />} />
          <Route path="/articles/:slug/*" element={<ArticlePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/v/:token" element={<VideoLanding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <ScrollToTop />
    </>
  );
}
