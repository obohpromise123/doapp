import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createTaskStore } from './models/taskStore.js'
import { tasksRouter } from './routes/tasks.js'

export function createApp(store = createTaskStore()) {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use('/api/tasks', tasksRouter(store))
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' })
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })
  return app
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.loadEnvFile('.env')
  } catch {
    // No .env file — fall back to defaults.
  }
  const port = Number(process.env.PORT) || 5000
  const dataFile = resolve(process.env.DATABASE_URL || 'server/data/tasks.json')
  createApp(createTaskStore(dataFile)).listen(port, () => {
    console.log(`TaskFlow API listening on http://localhost:${port}/api (data: ${dataFile})`)
  })
}
