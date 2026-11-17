import { describe, it, expect, beforeEach } from 'vitest'
import { getDefaultTheme } from './themeStore'

function setPath(path: string) {
  window.history.pushState({}, '', path)
}

describe('getDefaultTheme sur /preview', () => {
  beforeEach(() => localStorage.clear())

  it('reste clair pour une page sans defaultTheme', () => {
    setPath('/preview/dressing-mailys/EuMLnfc8Uk')
    expect(getDefaultTheme()).toBe('light')
  })

  it('est sombre par defaut pour Philippe (accueil et /v1)', () => {
    setPath('/preview/cours-guitare-philippe-andre/3677b1ae2b81935e')
    expect(getDefaultTheme()).toBe('dark')
    setPath('/preview/cours-guitare-philippe-andre/3677b1ae2b81935e/v1')
    expect(getDefaultTheme()).toBe('dark')
  })

  it('respecte le choix memorise par le visiteur sur cette page', () => {
    localStorage.setItem('theme-preview-3677b1ae2b81935e', 'light')
    setPath('/preview/cours-guitare-philippe-andre/3677b1ae2b81935e/v1')
    expect(getDefaultTheme()).toBe('light')
  })

  it('ignore le theme partage du portfolio', () => {
    localStorage.setItem('theme', 'light')
    setPath('/preview/cours-guitare-philippe-andre/3677b1ae2b81935e')
    expect(getDefaultTheme()).toBe('dark')
  })
})
