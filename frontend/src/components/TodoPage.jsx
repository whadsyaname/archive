import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { clearAuth } from '../auth'
import './TodoPage.css'

export function TodoPage({ onLogout }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTodos = useCallback(async () => {
    try {
      setError(null)
      const list = await api.todoList()
      setTodos(list)
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('로그인이 필요')) {
        clearAuth()
        onLogout?.()
      } else {
        setError(e.message || '할 일 목록을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setError(null)
    try {
      await api.todoAdd(title.trim())
      setTitle('')
      fetchTodos()
    } catch (e) {
      setError(e.message || '추가에 실패했습니다.')
    }
  }

  const handleToggle = async (id) => {
    try {
      await api.todoToggle(id)
      fetchTodos()
    } catch (e) {
      setError(e.message || '상태 변경에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.todoDelete(id)
      fetchTodos()
    } catch (e) {
      setError(e.message || '삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return <div className="todo-page"><p className="todo-loading">불러오는 중…</p></div>
  }

  return (
    <div className="todo-page">
      <h2 className="page-title">공유 To-do</h2>
      <p className="page-desc">함께 보고 수정할 수 있는 할 일 목록입니다. Conversation에서 &quot;투두에 &#39;할 일&#39; 추가해줘&quot;라고 말해도 등록됩니다.</p>

      <form onSubmit={handleAdd} className="todo-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일 입력..."
          className="todo-input"
        />
        <button type="submit" className="todo-add-btn">추가</button>
      </form>

      {error && <div className="todo-error" role="alert">{error}</div>}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'todo-item--completed' : ''}`}
          >
            <button
              type="button"
              className="todo-check"
              onClick={() => handleToggle(todo.id)}
              aria-label={todo.completed ? '완료 해제' : '완료'}
            >
              <span className="todo-checkbox">{todo.completed ? '✓' : ''}</span>
            </button>
            <span className="todo-title">{todo.title}</span>
            <span className="todo-by">
              등록: {todo.createdBy}
              {todo.completed && todo.completedBy && (
                <> · 완료: {todo.completedBy}</>
              )}
            </span>
            <button
              type="button"
              className="todo-delete-btn"
              onClick={() => handleDelete(todo.id)}
              title="삭제"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      {!todos.length && <p className="todo-empty">등록된 할 일이 없습니다.</p>}
    </div>
  )
}
