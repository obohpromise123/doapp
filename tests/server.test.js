// @vitest-environment node
import { describe, expect, it, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../server/index.js'
import { createTaskStore } from '../server/models/taskStore.js'

let app
beforeEach(() => {
  app = createApp(createTaskStore())
})

describe('Tasks API', () => {
  it('runs a full CRUD cycle', async () => {
    expect((await request(app).get('/api/tasks')).body).toEqual([])

    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Buy groceries', description: 'Milk', priority: 'high', dueDate: '2026-10-20' })
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject({ title: 'Buy groceries', completed: false, priority: 'high', dueDate: '2026-10-20' })
    const { id } = created.body

    expect((await request(app).get(`/api/tasks/${id}`)).body.title).toBe('Buy groceries')

    const updated = await request(app).put(`/api/tasks/${id}`).send({ completed: true })
    expect(updated.body).toMatchObject({ completed: true, title: 'Buy groceries' })

    expect((await request(app).delete(`/api/tasks/${id}`)).status).toBe(204)
    expect((await request(app).get(`/api/tasks/${id}`)).status).toBe(404)
  })

  it('accepts client-provided ids and rejects duplicates', async () => {
    expect((await request(app).post('/api/tasks').send({ id: 'abc', title: 'x' })).body.id).toBe('abc')
    expect((await request(app).post('/api/tasks').send({ id: 'abc', title: 'y' })).status).toBe(409)
  })

  it('validates input', async () => {
    expect((await request(app).post('/api/tasks').send({ title: '' })).status).toBe(400)
    expect((await request(app).post('/api/tasks').send({ title: 'a', priority: 'urgent' })).status).toBe(400)
    expect((await request(app).post('/api/tasks').send({ title: 'a', dueDate: 'tomorrow' })).status).toBe(400)
    expect(
      (await request(app).post('/api/tasks').set('Content-Type', 'application/json').send('{bad')).status,
    ).toBe(400)
    expect((await request(app).put('/api/tasks/missing').send({ completed: true })).status).toBe(404)
    expect((await request(app).delete('/api/tasks/missing')).status).toBe(404)
  })
})
