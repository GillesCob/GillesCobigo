import { Link } from "react-router-dom";

// Navbar des pages articles (mockup Projets/Portfolio/mockups/articles-v5.html, .nav) : logo + nom
// identiques à la topbar de la home, un seul lien à droite qui ramène à la section Articles de la
// home (mode Dev forcé à l'arrivée par NewHome.tsx, cf DEV_ONLY_HASH_SECTIONS). Plus de bascule
// dark/light ni de "Me contacter", plus de menu hamburger mobile. Styles : Articles.v5.css.
export default function ArticlesNavbar() {
  return (
    <nav className="av5-nav">
      <div className="av5-nav-inner">
        <div className="av5-nav-row">
          <Link className="av5-brand" to="/">
            <img src="/images/logo-gc-black.png" alt="Gilles Cobigo" />
            Gilles Cobigo
          </Link>
          <Link className="av5-nav-back" to="/#articles">
            ← Portfolio · Articles
          </Link>
        </div>
      </div>
    </nav>
  );
}
