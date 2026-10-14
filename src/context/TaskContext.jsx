import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { taskReducer } from './taskReducer'
import { createTask } from '../utils/tasks'
import { api, isApiEnabled } from '../utils/api'

const STORAGE_KEY = 'taskflow:tasks'
const TaskContext = createContext(null)

function loadLocal() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Holds the task list. Persists to localStorage by default, or to the REST
 * backend when VITE_API_URL is set (pass `useApi` to override, e.g. in tests).
 */
export function TaskProvider({ children, useApi = isApiEnabled }) {
  const [tasks, dispatch] = useReducer(taskReducer, undefined, () => (useApi ? [] : loadLocal()))
  const [loading, setLoading] = useState(useApi)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!useApi) return
    api
      .list()
      .then((data) => dispatch({ type: 'set', tasks: data }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [useApi])

  useEffect(() => {
    if (useApi) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Storage unavailable — keep working in memory.
    }
  }, [tasks, useApi])

  // Apply locally first, then sync to the backend. Requests are queued so they reach
  // the server in order (e.g. a create before the toggle that follows it).
  // On failure, surface the error and refetch the server's state.
  const queue = useRef(Promise.resolve())
  const sync = useCallback(
    (request) => {
      if (!useApi) return
      queue.current = queue.current
        .then(request)
        .then(() => setError(null))
        .catch((e) => {
          setError(e.message)
          return api.list().then((data) => dispatch({ type: 'set', tasks: data }), () => {})
        })
    },
    [useApi],
  )

  const addTask = useCallback(
    (input) => {
      const task = createTask(input)
      dispatch({ type: 'add', task })
      sync(() => api.create(task))
      return task
    },
    [sync],
  )

  const updateTask = useCallback(
    (id, changes) => {
      dispatch({ type: 'update', id, changes })
      sync(() => api.update(id, changes))
    },
    [sync],
  )

  const toggleTask = useCallback(
    (id) => {
      const task = tasks.find((t) => t.id === id)
      if (task) updateTask(id, { completed: !task.completed })
    },
    [tasks, updateTask],
  )

  const deleteTask = useCallback(
    (id) => {
      dispatch({ type: 'delete', id })
      sync(() => api.remove(id))
    },
    [sync],
  )

  const clearCompleted = useCallback(() => {
    const done = tasks.filter((t) => t.completed)
    dispatch({ type: 'clearCompleted' })
    sync(() => Promise.all(done.map((t) => api.remove(t.id))))
  }, [tasks, sync])

  const value = useMemo(
    () => ({ tasks, loading, error, addTask, updateTask, toggleTask, deleteTask, clearCompleted }),
    [tasks, loading, error, addTask, updateTask, toggleTask, deleteTask, clearCompleted],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used inside <TaskProvider>')
  return ctx
}
