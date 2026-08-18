import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface IThemeStore {
  theme: Theme
  toggleTheme: () => void
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

// Sombre par defaut sur tout le portfolio (public recruteurs/devs), sauf sur les pages Boutiques
// tournees vers un prospect a froid (/preview, /cas-client), pensees pour un fond clair des le
// premier chargement (cf mockups Projets/V1-Echanges/mockups/, "clair par defaut, jamais le
// sombre implicite"). Meme regle de route reprise dans main.tsx pour peindre la bonne classe avant
// le premier rendu React (evite le flash sombre->clair).
//
// Ces pages ignorent volontairement le "theme" partage en localStorage (18/08, corrige apres coup :
// une premiere version le consultait en priorite, donc un choix fait ailleurs sur le portfolio
// sombre par defaut, meme des semaines plus tot, ecrasait silencieusement le clair natif attendu
// ici a chaque nouvelle visite). "Nativement clair" = toujours clair au chargement d'une page
// /preview ou /cas-client, sans exception, quel que soit l'historique de ce visiteur ailleurs sur
// le site. Le bouton de bascule sur ces pages continue de fonctionner normalement le temps de la
// session (etat React), simplement sans influencer le prochain chargement de page.
export function getDefaultTheme(): Theme {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const isProspectFacing = /^\/(preview|cas-client)(\/|$)/.test(path)
  if (isProspectFacing) return 'light'
  const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem('theme') as Theme | null) : null
  return saved ?? 'dark'
}

export const useThemeStore = create<IThemeStore>((set, get) => ({
  theme: getDefaultTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
}))
