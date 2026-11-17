import { create } from 'zustand'
import { previewProjects } from '@/data/previewProjects'

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
  const secret = getPreviewDefaultTheme()?.secret
  if (secret) localStorage.setItem(`theme-preview-${secret}`, theme)
}

// Page d'echanges dont l'entree previewProjects porte un defaultTheme (ex. Philippe Andre) :
// cle de stockage propre a cette page, distincte du "theme" partage du portfolio (que /preview ignore).
function getPreviewDefaultTheme(): { secret: string; theme: Theme } | null {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const match = /^\/preview\/[^/]+\/([^/]+)(\/|$)/.exec(path)
  const secret = match?.[1]
  const theme = secret ? previewProjects[secret]?.defaultTheme : undefined
  return secret && theme ? { secret, theme } : null
}

// Sombre par defaut sur tout le portfolio (public recruteurs/devs), sauf sur les pages Boutiques
// tournees vers un prospect a froid (/preview, /cas-client, /cgv-boutiques depuis le 20/08),
// pensees pour un fond clair des le premier chargement (cf mockups Projets/V1-Echanges/mockups/,
// "clair par defaut, jamais le sombre implicite"). Meme regle de route reprise dans main.tsx pour
// peindre la bonne classe avant le premier rendu React (evite le flash sombre->clair).
//
// Ces pages ignorent volontairement le "theme" partage en localStorage (18/08, corrige apres coup :
// une premiere version le consultait en priorite, donc un choix fait ailleurs sur le portfolio
// sombre par defaut, meme des semaines plus tot, ecrasait silencieusement le clair natif attendu
// ici a chaque nouvelle visite). "Nativement clair" = toujours clair au chargement d'une page
// /preview, /cas-client ou /cgv-boutiques, sans exception, quel que soit l'historique de ce
// visiteur ailleurs sur le site. /cgv-boutiques n'a plus de bouton de bascule du tout (20/08,
// aligne sur le mockup _templates/cgv-template-v1.html), contrairement a /preview et /cas-client
// qui le conservent hors contexte prospect a froid.
export function getDefaultTheme(): Theme {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const isProspectFacing = /^\/(preview|cas-client|cgv-boutiques)(\/|$)/.test(path)
  if (isProspectFacing) {
    const preview = getPreviewDefaultTheme()
    if (!preview) return 'light'
    // Theme par defaut propre a cette page, sauf choix deja fait par le visiteur sur cette page.
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(`theme-preview-${preview.secret}`) : null
    return stored === 'dark' || stored === 'light' ? stored : preview.theme
  }
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
