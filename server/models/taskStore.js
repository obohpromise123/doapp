import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export const PRIORITIES = ['low', 'medium', 'high']

/** Validate and pick allowed fields. Returns { value } or { error }. */
export function validateTask(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object') return { error: 'Body must be a JSON object' }
  const out = {}
  if ('title' in input || !partial) {
    if (typeof input.title !== 'string' || !input.title.trim()) return { error: 'title is required' }
    out.title = input.title.trim()
  }
  if ('description' in input) {
    if (typeof input.description !== 'string') return { error: 'description must be a string' }
    out.description = input.description.trim()
  }
  if ('completed' in input) {
    if (typeof input.completed !== 'boolean') return { error: 'completed must be a boolean' }
    out.completed = input.completed
  }
  if ('priority' in input) {
    if (!PRIORITIES.includes(input.priority)) return { error: `priority must be one of ${PRIORITIES.join(', ')}` }
    out.priority = input.priority
  }
  if ('dueDate' in input) {
    if (input.dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
      return { error: 'dueDate must be YYYY-MM-DD or null' }
    }
    out.dueDate = input.dueDate
  }
  return { value: out }
}

/**
 * Minimal task store. Keeps tasks in memory and, when given a file path,
 * persists them as JSON so they survive restarts.
 */
export function createTaskStore(filePath) {
  let tasks = null

  async function load() {
    if (tasks) return tasks
    if (!filePath) return (tasks = [])
    try {
      tasks = JSON.parse(await readFile(filePath, 'utf8'))
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
      tasks = []
    }
    return tasks
  }

  async function save() {
    if (!filePath) return
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, JSON.stringify(tasks, null, 2))
  }

  return {
    async list() {
      return load()
    },
    async get(id) {
      return (await load()).find((t) => t.id === id) ?? null
    },
    async create(data, id) {
      await load()
      const task = {
        id: typeof id === 'string' && id ? id : randomUUID(),
        description: '',
        completed: false,
        priority: 'medium',
        dueDate: null,
        ...data,
        createdAt: new Date().toISOString(),
      }
      if (tasks.some((t) => t.id === task.id)) return null
      tasks.unshift(task)
      await save()
      return task
    },
    async update(id, changes) {
      await load()
      const i = tasks.findIndex((t) => t.id === id)
      if (i === -1) return null
      tasks[i] = { ...tasks[i], ...changes }
      await save()
      return tasks[i]
    },
    async remove(id) {
      await load()
      const before = tasks.length
      tasks = tasks.filter((t) => t.id !== id)
      if (tasks.length === before) return false
      await save()
      return true
    },
  }
}
