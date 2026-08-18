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
// le premier rendu React (evite le flash sombre->clair). Un choix deja explicitement fait par ce
// visiteur (toggle precedent, cf localStorage) reste toujours prioritaire sur ce defaut par route.
export function getDefaultTheme(): Theme {
  const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem('theme') as Theme | null) : null
  if (saved) return saved
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const isProspectFacing = /^\/(preview|cas-client)(\/|$)/.test(path)
  return isProspectFacing ? 'light' : 'dark'
}

export const useThemeStore = create<IThemeStore>((set, get) => ({
  theme: getDefaultTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
}))
