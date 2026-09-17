import { create } from 'zustand'

export type Mode = 'dev' | 'btp'

interface IModeStore {
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

// Meme patron que useThemeStore (src/store/themeStore.ts) : persistance localStorage, valeur
// par defaut resolue avant le premier rendu. Dev par defaut (public cible = recruteurs/devs).
function getDefaultMode(): Mode {
  const saved = typeof localStorage !== 'undefined' ? (localStorage.getItem('mode') as Mode | null) : null
  return saved === 'dev' || saved === 'btp' ? saved : 'dev'
}

function persistMode(mode: Mode): void {
  localStorage.setItem('mode', mode)
}

export const useModeStore = create<IModeStore>((set, get) => ({
  mode: getDefaultMode(),
  setMode: (mode) => {
    persistMode(mode)
    set({ mode })
  },
  toggleMode: () => {
    const next: Mode = get().mode === 'dev' ? 'btp' : 'dev'
    persistMode(next)
    set({ mode: next })
  },
}))
