import { describe, expect, it } from 'vitest'
import { createTask, filterTasks, formatDueDate, isOverdue, sortTasks, todayISO } from '../src/utils/tasks'
import { taskReducer } from '../src/context/taskReducer'

const t = (over) => ({
  id: Math.random().toString(),
  title: 'x',
  description: '',
  completed: false,
  priority: 'medium',
  dueDate: null,
  createdAt: '2026-10-01T00:00:00Z',
  ...over,
})

describe('createTask', () => {
  it('trims input and applies defaults', () => {
    const task = createTask({ title: '  Buy milk  ', description: ' 2L ' })
    expect(task).toMatchObject({ title: 'Buy milk', description: '2L', completed: false, priority: 'medium', dueDate: null })
    expect(task.id).toBeTruthy()
    expect(Date.parse(task.createdAt)).not.toBeNaN()
  })

  it('rejects empty titles and unknown priorities', () => {
    expect(() => createTask({ title: '   ' })).toThrow()
    expect(createTask({ title: 'a', priority: 'urgent' }).priority).toBe('medium')
  })
})

describe('filterTasks', () => {
  const tasks = [t({ completed: true }), t(), t()]
  it('filters by status', () => {
    expect(filterTasks(tasks, 'all')).toHaveLength(3)
    expect(filterTasks(tasks, 'active')).toHaveLength(2)
    expect(filterTasks(tasks, 'completed')).toHaveLength(1)
  })
})

describe('sortTasks', () => {
  it('puts incomplete first, then due date, then priority', () => {
    const done = t({ title: 'done', completed: true, dueDate: '2026-01-01' })
    const later = t({ title: 'later', dueDate: '2026-12-01' })
    const soon = t({ title: 'soon', dueDate: '2026-10-15' })
    const high = t({ title: 'high', priority: 'high' })
    const low = t({ title: 'low', priority: 'low' })
    expect(sortTasks([done, low, high, later, soon]).map((x) => x.title)).toEqual(['soon', 'later', 'high', 'low', 'done'])
  })
})

describe('dates', () => {
  const now = new Date(2026, 9, 14, 12)
  it('formats relative due dates', () => {
    expect(todayISO(now)).toBe('2026-10-14')
    expect(formatDueDate('2026-10-14', now)).toBe('Today')
    expect(formatDueDate('2026-10-15', now)).toBe('Tomorrow')
    expect(formatDueDate('', now)).toBe('')
  })
  it('detects overdue incomplete tasks only', () => {
    expect(isOverdue(t({ dueDate: '2026-10-13' }), now)).toBe(true)
    expect(isOverdue(t({ dueDate: '2026-10-13', completed: true }), now)).toBe(false)
    expect(isOverdue(t({ dueDate: '2026-10-14' }), now)).toBe(false)
  })
})

describe('taskReducer', () => {
  it('handles add, update, delete, and clearCompleted', () => {
    const a = t({ id: 'a' })
    const b = t({ id: 'b', completed: true })
    let s = taskReducer([], { type: 'add', task: a })
    s = taskReducer(s, { type: 'add', task: b })
    expect(s.map((x) => x.id)).toEqual(['b', 'a'])
    s = taskReducer(s, { type: 'update', id: 'a', changes: { title: 'new' } })
    expect(s.find((x) => x.id === 'a').title).toBe('new')
    s = taskReducer(s, { type: 'clearCompleted' })
    expect(s.map((x) => x.id)).toEqual(['a'])
    s = taskReducer(s, { type: 'delete', id: 'a' })
    expect(s).toEqual([])
  })
})
