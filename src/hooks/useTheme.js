import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('taskflow:theme', null)
  const resolved = theme ?? systemTheme()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark')
  return { theme: resolved, toggleTheme }
}
