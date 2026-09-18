import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCaseStudyTourStore } from '@/store/caseStudyTourStore'

export default function ScrollReset() {
  const { pathname, hash } = useLocation()
  // Ignore pendant une visite guidee active (21/08, bug trouve en investiguant "gros mt avant
  // la bulle a l'etape 4") : chaque changement de round (V2 -> V6) navigue vers une nouvelle
  // URL (/cas-client/v6), ce composant remettait alors le scroll a 0 en concurrence directe
  // avec le scrollIntoView de CaseStudyTour.tsx, qui gere deja lui-meme le scroll pendant le
  // tour (bulle + verrou). Le conflit entre les deux laissait la page a une position aleatoire.
  const isTouring = useCaseStudyTourStore((s) => s.status === 'active')

  useEffect(() => {
    if (isTouring) return
    // Meme conflit qu'avec CaseStudyTour, trouve le 18/09 : un lien externe vers une ancre de la
    // home ("/#projets" depuis VideoLanding.tsx) doit atterrir sur la section visee (NewHome.tsx
    // lit le hash au montage et y scroll), pas etre remis a 0 par ce composant juste apres.
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.documentElement.scrollTo({ top: 0, behavior: 'instant' })
    document.body.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, isTouring])

  return null
}
