import { Router } from 'express'
import { validateTask } from '../models/taskStore.js'

export function tasksRouter(store) {
  const router = Router()

  router.get('/', async (_req, res) => {
    res.json(await store.list())
  })

  router.get('/:id', async (req, res) => {
    const task = await store.get(req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    res.json(task)
  })

  router.post('/', async (req, res) => {
    const { value, error } = validateTask(req.body)
    if (error) return res.status(400).json({ error })
    // Clients may supply their own id (the frontend does, for optimistic updates).
    const task = await store.create(value, req.body.id)
    if (!task) return res.status(409).json({ error: 'A task with that id already exists' })
    res.status(201).json(task)
  })

  router.put('/:id', async (req, res) => {
    const { value, error } = validateTask(req.body, { partial: true })
    if (error) return res.status(400).json({ error })
    const task = await store.update(req.params.id, value)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    res.json(task)
  })

  router.delete('/:id', async (req, res) => {
    const removed = await store.remove(req.params.id)
    if (!removed) return res.status(404).json({ error: 'Task not found' })
    res.status(204).end()
  })

  return router
}
