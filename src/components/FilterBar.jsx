import { useTasks } from '../context/TaskContext'
import { FILTERS } from '../utils/tasks'

const labels = { all: 'All', active: 'Active', completed: 'Completed' }

export default function FilterBar({ filter, onChange }) {
  const { tasks, clearCompleted } = useTasks()
  const activeCount = tasks.filter((t) => !t.completed).length
  const completedCount = tasks.length - activeCount

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p aria-live="polite" className="text-slate-500 dark:text-slate-400">
        {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
      </p>
      <div role="group" aria-label="Filter tasks" className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => onChange(f)}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              filter === f
                ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {labels[f]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={clearCompleted}
        disabled={completedCount === 0}
        className="text-slate-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:text-red-400"
      >
        Clear completed ({completedCount})
      </button>
    </div>
  )
}
