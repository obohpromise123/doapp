export const PRIORITIES = ['low', 'medium', 'high']
export const FILTERS = ['all', 'active', 'completed']

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

/** Build a normalized task object from user input. Throws if the title is empty. */
export function createTask({ title, description = '', priority = 'medium', dueDate = null }) {
  const trimmed = (title ?? '').trim()
  if (!trimmed) throw new Error('Task title is required')
  return {
    id: generateId(),
    title: trimmed,
    description: description.trim(),
    completed: false,
    priority: PRIORITIES.includes(priority) ? priority : 'medium',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
  }
}

export function filterTasks(tasks, filter) {
  switch (filter) {
    case 'active':
      return tasks.filter((t) => !t.completed)
    case 'completed':
      return tasks.filter((t) => t.completed)
    default:
      return tasks
  }
}

/** Incomplete first, then by due date (soonest first, undated last), then priority, then newest. */
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate < b.dueDate ? -1 : 1
    }
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    if (p !== 0) return p
    return b.createdAt.localeCompare(a.createdAt)
  })
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayISO(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isOverdue(task, now = new Date()) {
  return Boolean(task.dueDate) && !task.completed && task.dueDate < todayISO(now)
}

export function formatDueDate(dueDate, now = new Date()) {
  if (!dueDate) return ''
  const today = todayISO(now)
  if (dueDate === today) return 'Today'
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (dueDate === todayISO(tomorrow)) return 'Tomorrow'
  const [y, m, d] = dueDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: y === now.getFullYear() ? undefined : 'numeric',
  })
}
