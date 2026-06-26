import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import BIMTerm from "@/components/shared/BIMTerm";

export default function HeadlineSection() {
  return (
    <section className="bg-[#F8F5F0] py-20 px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
        <span className="text-gray-900">La rigueur du </span>
        <span className="text-orange-800">terrain</span>
        <span className="text-gray-900">,</span>
        <br />
        <span className="text-gray-900">la précision du </span>
        <span className="text-orange-600">code</span>
        <span className="text-gray-900">.</span>
      </h2>
      <p className="text-gray-600 text-lg max-w-xl mx-auto mb-10">
        10 ans dans le bâtiment, <BIMTerm>BIM</BIMTerm> Manager sur l&apos;extension en mer de la ville de Monaco.
        Depuis 2022, le même soin appliqué au code. Une reconversion qui n&apos;en est pas une.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
          <Link to="/projects" onClick={() => window.scrollTo(0, 0)}>
            Voir mes projets <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
        >
          <a href="/cv-gilles-cobigo.pdf" download>
            Télécharger le CV <Download size={16} className="ml-1" />
          </a>
        </Button>
      </div>
    </section>
  );
}
