const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export const isApiEnabled = Boolean(BASE_URL)

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed with status ${res.status}`)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  list: () => request('/tasks'),
  create: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, changes) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}
