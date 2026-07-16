import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Download, Play, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BIMTerm from "@/components/shared/BIMTerm";
import { videoLinks } from "@/data/videoLinks";
import { useThemeStore } from "@/store/themeStore";
import NotFound from "@/pages/NotFound";

export default function VideoLanding() {
  const { token } = useParams<{ token: string }>();
  const [playing, setPlaying] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const video = token ? videoLinks[token] : undefined;

  if (!video) return <NotFound />;

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4 py-16 relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-xl lg:max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Gilles Cobigo</h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-md mb-6 leading-relaxed">
          10 ans dans le bâtiment, <BIMTerm>BIM Manager</BIMTerm> sur l&apos;extension en mer de Monaco. Aujourd&apos;hui
          développeur fullstack.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-8">
          <Badge variant="secondary">Node.js</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">React</Badge>
        </div>

        <div className="relative aspect-video rounded-xl border border-border bg-zinc-950 overflow-hidden mb-10">
          {playing && video.videoUrl ? (
            <video src={video.videoUrl} controls autoPlay className="w-full h-full object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => video.videoUrl && setPlaying(true)}
              disabled={!video.videoUrl}
              aria-label="Lire la vidéo de présentation"
              className="absolute inset-0 flex items-center justify-center disabled:cursor-default group"
            >
              <img
                src="/images/logo-gc-white.png"
                alt=""
                className="absolute inset-0 m-auto h-20 md:h-28 w-auto opacity-20"
              />
              <span className="relative w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center transition-transform group-hover:scale-105 group-disabled:opacity-40 group-disabled:group-hover:scale-100">
                <Play size={22} className="text-white ml-0.5" fill="white" />
              </span>
              {!video.videoUrl && (
                <span className="absolute bottom-3 left-4 text-xs font-medium text-muted-foreground">
                  Vidéo à venir
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-2.5">
          <Button asChild size="lg" className="whitespace-nowrap">
            <a href="https://gillescobigo.com">
              gillescobigo.com <ArrowRight size={16} className="ml-1" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap">
            <Link to="/projects">Voir mes projets</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap">
            <Link to="/articles">Lire mes articles</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap">
            <a href="/cv-gilles-cobigo.pdf" download>
              Télécharger le CV <Download size={16} className="ml-1" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap">
            <Link to="/contact">Me contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
