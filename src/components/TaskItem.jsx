import { useEffect, useRef, useState } from 'react'
import { useTasks } from '../context/TaskContext'
import { PRIORITIES, formatDueDate, isOverdue } from '../utils/tasks'
import { inputClass } from '../utils/styles'

const priorityStyles = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

function EditForm({ task, onDone }) {
  const { updateTask } = useTasks()
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ?? '',
  })
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
    titleRef.current?.select()
  }, [])

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  const save = (e) => {
    e?.preventDefault()
    const title = draft.title.trim()
    if (!title) return
    updateTask(task.id, {
      title,
      description: draft.description.trim(),
      priority: draft.priority,
      dueDate: draft.dueDate || null,
    })
    onDone()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onDone()
    }
  }

  return (
    <form onSubmit={save} onKeyDown={handleKeyDown} className="w-full space-y-2" aria-label={`Edit ${task.title}`}>
      <label className="sr-only" htmlFor={`edit-title-${task.id}`}>
        Title
      </label>
      <input id={`edit-title-${task.id}`} ref={titleRef} className={inputClass} value={draft.title} onChange={set('title')} />
      <label className="sr-only" htmlFor={`edit-desc-${task.id}`}>
        Description
      </label>
      <textarea
        id={`edit-desc-${task.id}`}
        rows={2}
        className={inputClass}
        placeholder="Description"
        value={draft.description}
        onChange={set('description')}
      />
      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor={`edit-priority-${task.id}`}>
          Priority
        </label>
        <select
          id={`edit-priority-${task.id}`}
          className={`${inputClass} w-auto`}
          value={draft.priority}
          onChange={set('priority')}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p[0].toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`edit-due-${task.id}`}>
          Due date
        </label>
        <input
          id={`edit-due-${task.id}`}
          type="date"
          className={`${inputClass} w-auto`}
          value={draft.dueDate}
          onChange={set('dueDate')}
        />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

export default function TaskItem({ task }) {
  const { toggleTask, deleteTask } = useTasks()
  const [editing, setEditing] = useState(false)
  const itemRef = useRef(null)
  const overdue = isOverdue(task)

  const stopEditing = () => {
    setEditing(false)
    // Return focus to the row so keyboard users keep their place.
    requestAnimationFrame(() => itemRef.current?.focus())
  }

  // Row-level shortcuts only fire when the row itself (not a child control) has focus.
  const handleKeyDown = (e) => {
    if (editing || e.target !== e.currentTarget) return
    if (e.key === ' ') {
      e.preventDefault()
      toggleTask(task.id)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      const next = e.currentTarget.nextElementSibling || e.currentTarget.previousElementSibling
      deleteTask(task.id)
      next?.focus()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setEditing(true)
    }
  }

  return (
    <li
      ref={itemRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${task.title}${task.completed ? ', completed' : ''}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
    >
      {editing ? (
        <EditForm task={task} onDone={stopEditing} />
      ) : (
        <>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-indigo-600"
          />
          <div className="min-w-0 flex-1" onDoubleClick={() => setEditing(true)}>
            <p
              className={`break-words font-medium ${
                task.completed ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="mt-0.5 break-words text-sm text-slate-500 dark:text-slate-400">{task.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium capitalize ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
              {task.dueDate && (
                <span
                  className={
                    overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                  }
                >
                  <time dateTime={task.dueDate}>
                    {overdue ? 'Overdue · ' : 'Due '}
                    {formatDueDate(task.dueDate)}
                  </time>
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:group-focus:opacity-100">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit "${task.title}"`}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M13.6 3.3a2 2 0 0 1 2.9 2.9l-.8.8-2.9-2.9.8-.8ZM11.7 5.2 3 13.9V17h3.1l8.7-8.7-3.1-3.1Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => deleteTask(task.id)}
              aria-label={`Delete "${task.title}"`}
              className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M8 2h4a1 1 0 0 1 1 1v1h4v2H3V4h4V3a1 1 0 0 1 1-1Zm-3 6h10l-.8 9.1A1 1 0 0 1 13.2 18H6.8a1 1 0 0 1-1-.9L5 8Z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  )
}
