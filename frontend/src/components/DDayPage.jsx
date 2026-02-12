import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import { clearAuth } from '../auth'
import './DDayPage.css'

function daysUntil(dateStr) {
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function DDayPage({ onLogout }) {
  const [list, setList] = useState([])
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchList = useCallback(async () => {
    try {
      setError(null)
      const data = await api.ddayList()
      setList(data)
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('로그인이 필요')) {
        clearAuth()
        onLogout?.()
      } else {
        setError(e.message || '디데이 목록을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [onLogout])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim() || !targetDate) return
    setError(null)
    try {
      await api.ddayAdd(title.trim(), targetDate)
      setTitle('')
      setTargetDate('')
      fetchList()
    } catch (e) {
      setError(e.message || '추가에 실패했습니다.')
    }
  }

  const startEdit = (d) => {
    setEditingId(d.id)
    setEditTitle(d.title)
    setEditDate(d.targetDate)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDate('')
  }

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim() || !editDate) return
    setError(null)
    try {
      await api.ddayUpdate(editingId, editTitle.trim(), editDate)
      cancelEdit()
      fetchList()
    } catch (e) {
      setError(e.message || '수정에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('이 디데이를 삭제할까요?')) return
    try {
      await api.ddayDelete(id)
      fetchList()
    } catch (e) {
      setError(e.message || '삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return <div className="dday-page"><p className="dday-loading">불러오는 중…</p></div>
  }

  return (
    <div className="dday-page">
      <h2 className="page-title">D-Day 관리</h2>
      <p className="page-desc">중요한 기념일을 등록하면 메인 화면 상단에 카운트다운으로 표시됩니다.</p>

      <form onSubmit={handleAdd} className="dday-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 은혜랑 만난 날"
          className="dday-input dday-input--title"
        />
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="dday-input dday-input--date"
        />
        <button type="submit" className="dday-add-btn">추가</button>
      </form>

      {error && <div className="dday-error" role="alert">{error}</div>}

      <ul className="dday-list">
        {list.map((d) => {
          const days = daysUntil(d.targetDate)
          const label = days === 0 ? 'D-Day' : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`
          const isEditing = editingId === d.id
          return (
            <li key={d.id} className="dday-item">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="dday-edit-input"
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="dday-edit-date"
                  />
                  <button type="button" className="dday-save-btn" onClick={saveEdit}>저장</button>
                  <button type="button" className="dday-cancel-btn" onClick={cancelEdit}>취소</button>
                </>
              ) : (
                <>
                  <span className="dday-item-title">{d.title}</span>
                  <span className="dday-item-date">{d.targetDate}</span>
                  <span className="dday-item-badge">{label}</span>
                  <button type="button" className="dday-edit-btn" onClick={() => startEdit(d)}>수정</button>
                  <button type="button" className="dday-delete-btn" onClick={() => handleDelete(d.id)}>삭제</button>
                </>
              )}
            </li>
          )
        })}
      </ul>
      {!list.length && <p className="dday-empty">등록된 디데이가 없습니다.</p>}
    </div>
  )
}
