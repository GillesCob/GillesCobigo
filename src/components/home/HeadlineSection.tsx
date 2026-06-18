import { Link } from 'react-router-dom'
import { ArrowRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeadlineSection() {
  return (
    <section className="bg-[#F8F5F0] py-20 px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
        La rigueur du terrain,
        <br />
        la précision du code.
      </h2>
      <p className="text-gray-600 text-lg max-w-xl mx-auto mb-10">
        10 ans de BIM sur des projets à plusieurs centaines de millions. Depuis 2022, le même soin
        appliqué au code. Une reconversion qui n&apos;en est pas une.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
          <Link to="/projects">
            Voir mes projets <ArrowRight size={16} className="ml-1" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          <a href="/cv-gilles-cobigo.pdf" download>
            Télécharger le CV <Download size={16} className="ml-1" />
          </a>
        </Button>
      </div>
    </section>
  )
}
