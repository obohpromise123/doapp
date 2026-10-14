import { useEffect, useRef, useState } from 'react'
import { useTasks } from './context/TaskContext'
import { useTheme } from './hooks/useTheme'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import FilterBar from './components/FilterBar'

function isTypingTarget(el) {
  return el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
}

export default function App() {
  const { error } = useTasks()
  const { theme, toggleTheme } = useTheme()
  const [filter, setFilter] = useState('all')
  const titleRef = useRef(null)

  // Global shortcut: N focuses the new-task input (ignored while typing).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== 'n' || e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      titleRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <span aria-hidden="true">✅</span> TaskFlow
          </h1>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-full p-2 text-xl hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <TaskForm ref={titleRef} />
        </section>

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            Couldn&apos;t sync with the server: {error}
          </p>
        )}

        <div className="mb-4">
          <FilterBar filter={filter} onChange={setFilter} />
        </div>

        <TaskList filter={filter} />

        <footer className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
          <kbd>N</kbd> new task · <kbd>Enter</kbd> edit / save · <kbd>Esc</kbd> cancel · <kbd>Space</kbd> toggle ·{' '}
          <kbd>Delete</kbd> remove
        </footer>
      </main>
    </div>
  )
}
