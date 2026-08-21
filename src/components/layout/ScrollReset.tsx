import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCaseStudyTourStore } from '@/store/caseStudyTourStore'

export default function ScrollReset() {
  const { pathname } = useLocation()
  // Ignore pendant une visite guidee active (21/08, bug trouve en investiguant "gros mt avant
  // la bulle a l'etape 4") : chaque changement de round (V2 -> V6) navigue vers une nouvelle
  // URL (/cas-client/v6), ce composant remettait alors le scroll a 0 en concurrence directe
  // avec le scrollIntoView de CaseStudyTour.tsx, qui gere deja lui-meme le scroll pendant le
  // tour (bulle + verrou). Le conflit entre les deux laissait la page a une position aleatoire.
  const isTouring = useCaseStudyTourStore((s) => s.status === 'active')

  useEffect(() => {
    if (isTouring) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.documentElement.scrollTo({ top: 0, behavior: 'instant' })
    document.body.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, isTouring])

  return null
}
