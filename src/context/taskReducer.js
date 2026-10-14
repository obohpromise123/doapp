export function taskReducer(state, action) {
  switch (action.type) {
    case 'set':
      return action.tasks
    case 'add':
      return [action.task, ...state]
    case 'update':
      return state.map((t) => (t.id === action.id ? { ...t, ...action.changes } : t))
    case 'delete':
      return state.filter((t) => t.id !== action.id)
    case 'clearCompleted':
      return state.filter((t) => !t.completed)
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}
