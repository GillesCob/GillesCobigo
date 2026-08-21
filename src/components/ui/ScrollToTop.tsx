import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useCaseStudyTourStore } from '@/store/caseStudyTourStore'

// Page finale du funnel (/preview/:project/:secret, la landing tarif avec le CTA de fin de
// visite) : jamais ce bouton, meme hors visite guidee (21/08, demande explicite de Gilles,
// "retire egalement le retour en haut de page via le bouton sur la page finale"). Exclut
// specifiquement PreviewHome, pas PreviewRound (/preview/:project/:secret/:round, 3 segments).
const FINAL_PAGE_PATTERN = /^\/preview\/[^/]+\/[^/]+\/?$/

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()
  // Retire ce bouton pendant une visite guidee active (21/08, demande explicite de Gilles :
  // "partout tant qu'on est dans la visite guidee"), le verrou de scroll de CaseStudyTour.tsx
  // contraint deja le scroll a une fenetre limitee autour de la bulle courante, "remonter tout
  // en haut de la page" n'a plus de sens pendant le tour. Bouton monte globalement (toutes les
  // pages), lit le store directement plutot que de conditionner son montage depuis le layout.
  const isTouring = useCaseStudyTourStore((s) => s.status === 'active')
  const isFinalPage = FINAL_PAGE_PATTERN.test(pathname)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && !isTouring && !isFinalPage && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Retour en haut"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 p-3 rounded-full bg-[#D85A30] text-white shadow-lg hover:bg-[#c24f27] transition-colors"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
