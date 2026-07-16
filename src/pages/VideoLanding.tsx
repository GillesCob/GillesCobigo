import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BIMTerm from "@/components/shared/BIMTerm";
import { videoLinks } from "@/data/videoLinks";
import NotFound from "@/pages/NotFound";

export default function VideoLanding() {
  const { token } = useParams<{ token: string }>();
  const [playing, setPlaying] = useState(false);
  const video = token ? videoLinks[token] : undefined;

  if (!video) return <NotFound />;

  return (
    <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl lg:max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Gilles Cobigo</h1>
        <p className="text-gray-600 text-base md:text-lg max-w-md mb-6 leading-relaxed">
          10 ans dans le bâtiment, <BIMTerm>BIM Manager</BIMTerm> sur l&apos;extension en mer de Monaco. Aujourd&apos;hui
          développeur fullstack.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-8">
          <Badge variant="secondary">Node.js</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">React</Badge>
        </div>

        <div className="relative aspect-video rounded-xl border border-gray-200 bg-white overflow-hidden mb-10">
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
              <span className="w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center transition-transform group-hover:scale-105 group-disabled:opacity-40 group-disabled:group-hover:scale-100">
                <Play size={22} className="text-white ml-0.5" fill="white" />
              </span>
              {!video.videoUrl && (
                <span className="absolute bottom-3 left-4 text-xs font-medium text-gray-500">Vidéo à venir</span>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-2.5">
          <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 whitespace-nowrap">
            <a href="https://gillescobigo.com">
              gillescobigo.com <ArrowRight size={16} className="ml-1" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white whitespace-nowrap"
          >
            <Link to="/projects">Voir mes projets</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white whitespace-nowrap"
          >
            <Link to="/articles">Lire mes articles</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white whitespace-nowrap"
          >
            <a href="/cv-gilles-cobigo.pdf" download>
              Télécharger le CV <Download size={16} className="ml-1" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            className="bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white whitespace-nowrap"
          >
            <Link to="/contact">Me contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
