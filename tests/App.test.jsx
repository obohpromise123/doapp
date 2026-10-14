import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskProvider } from '../src/context/TaskContext'
import App from '../src/App'

function renderApp() {
  const user = userEvent.setup()
  render(
    <TaskProvider useApi={false}>
      <App />
    </TaskProvider>,
  )
  return { user }
}

async function addTask(user, title) {
  await user.type(screen.getByLabelText('New task'), `${title}{Enter}`)
}

const list = () => screen.getByRole('list', { name: 'Tasks' })

describe('TaskFlow app', () => {
  it('shows an empty state', () => {
    renderApp()
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument()
  })

  it('adds a task and persists it to localStorage', async () => {
    const { user } = renderApp()
    await addTask(user, 'Buy groceries')
    expect(within(list()).getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByLabelText('New task')).toHaveValue('')
    expect(JSON.parse(localStorage.getItem('taskflow:tasks'))[0].title).toBe('Buy groceries')
  })

  it('validates empty titles', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a task title')
  })

  it('adds a task with description, priority, and due date', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: 'Add details' }))
    await user.type(screen.getByLabelText('New task'), 'Report')
    await user.type(screen.getByLabelText('Description'), 'Q3 numbers')
    await user.selectOptions(screen.getByLabelText('Priority'), 'high')
    await user.type(screen.getByLabelText('Due date'), '2099-01-02')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    const item = within(list()).getByRole('listitem')
    expect(item).toHaveTextContent('Q3 numbers')
    expect(item).toHaveTextContent('high')
    expect(item.querySelector('time')).toHaveAttribute('datetime', '2099-01-02')
  })

  it('loads saved tasks on start', () => {
    localStorage.setItem(
      'taskflow:tasks',
      JSON.stringify([
        { id: '1', title: 'Saved', description: '', completed: false, priority: 'low', dueDate: null, createdAt: '2026-01-01T00:00:00Z' },
      ]),
    )
    renderApp()
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('toggles, filters, and clears completed tasks', async () => {
    const { user } = renderApp()
    await addTask(user, 'One')
    await addTask(user, 'Two')
    await user.click(screen.getByRole('checkbox', { name: 'Mark "One" as complete' }))
    expect(screen.getByText('1 task left')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Active' }))
    expect(within(list()).queryByText('One')).not.toBeInTheDocument()
    expect(within(list()).getByText('Two')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(within(list()).getByText('One')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Clear completed/ }))
    expect(screen.getByText('No completed tasks yet.')).toBeInTheDocument()
  })

  it('edits a task inline and cancels with Escape', async () => {
    const { user } = renderApp()
    await addTask(user, 'Old title')
    await user.click(screen.getByRole('button', { name: 'Edit "Old title"' }))
    const input = screen.getByLabelText('Title')
    await user.clear(input)
    await user.type(input, 'New title{Enter}')
    expect(screen.getByText('New title')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit "New title"' }))
    await user.type(screen.getByLabelText('Title'), ' changed{Escape}')
    expect(screen.getByText('New title')).toBeInTheDocument()
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument()
  })

  it('deletes a task', async () => {
    const { user } = renderApp()
    await addTask(user, 'Trash me')
    await user.click(screen.getByRole('button', { name: 'Delete "Trash me"' }))
    expect(screen.queryByText('Trash me')).not.toBeInTheDocument()
  })

  it('supports keyboard shortcuts', async () => {
    const { user } = renderApp()
    await addTask(user, 'Keyboard')
    await user.click(document.body)

    await user.keyboard('n')
    expect(screen.getByLabelText('New task')).toHaveFocus()
    expect(screen.getByLabelText('New task')).toHaveValue('')

    const item = within(list()).getByRole('listitem')
    item.focus()
    await user.keyboard(' ')
    expect(screen.getByRole('checkbox')).toBeChecked()

    item.focus()
    await user.keyboard('{Delete}')
    expect(screen.queryByText('Keyboard')).not.toBeInTheDocument()
  })

  it('toggles dark mode and remembers it', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(JSON.parse(localStorage.getItem('taskflow:theme'))).toBe('dark')
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement).not.toHaveClass('dark')
  })
})
