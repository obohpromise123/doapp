import { forwardRef, useState } from 'react'
import { useTasks } from '../context/TaskContext'
import { PRIORITIES } from '../utils/tasks'
import { inputClass } from '../utils/styles'

const empty = { title: '', description: '', priority: 'medium', dueDate: '' }

const TaskForm = forwardRef(function TaskForm(_props, titleRef) {
  const { addTask } = useTasks()
  const [form, setForm] = useState(empty)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Please enter a task title.')
      return
    }
    addTask(form)
    setForm(empty)
    setError('')
    titleRef?.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Add task">
      <div className="flex gap-2">
        <label htmlFor="task-title" className="sr-only">
          New task
        </label>
        <input
          id="task-title"
          ref={titleRef}
          className={inputClass}
          placeholder="What needs to be done?  (press N)"
          value={form.title}
          onChange={set('title')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'task-title-error' : undefined}
          autoComplete="off"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          Add
        </button>
      </div>
      {error && (
        <p id="task-title-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowDetails((s) => !s)}
        aria-expanded={showDetails}
        aria-controls="task-details"
        className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {showDetails ? 'Hide details' : 'Add details'}
      </button>

      {showDetails && (
        <div id="task-details" className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="task-description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="task-description"
              rows={2}
              className={inputClass}
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <div>
            <label htmlFor="task-priority" className="mb-1 block text-sm font-medium">
              Priority
            </label>
            <select id="task-priority" className={inputClass} value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-due" className="mb-1 block text-sm font-medium">
              Due date
            </label>
            <input id="task-due" type="date" className={inputClass} value={form.dueDate} onChange={set('dueDate')} />
          </div>
        </div>
      )}
    </form>
  )
})

export default TaskForm
