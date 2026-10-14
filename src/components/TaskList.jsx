import { useTasks } from '../context/TaskContext'
import { filterTasks, sortTasks } from '../utils/tasks'
import TaskItem from './TaskItem'

const emptyMessages = {
  all: 'No tasks yet. Add one above to get started!',
  active: 'Nothing left to do. 🎉',
  completed: 'No completed tasks yet.',
}

export default function TaskList({ filter }) {
  const { tasks, loading } = useTasks()

  if (loading) {
    return <p className="py-10 text-center text-slate-500 dark:text-slate-400">Loading tasks…</p>
  }

  const visible = sortTasks(filterTasks(tasks, filter))

  if (visible.length === 0) {
    return <p className="py-10 text-center text-slate-500 dark:text-slate-400">{emptyMessages[filter]}</p>
  }

  return (
    <ul aria-label="Tasks" className="space-y-2">
      {visible.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
