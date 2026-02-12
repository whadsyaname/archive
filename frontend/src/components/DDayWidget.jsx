import { useState, useEffect } from 'react'
import { api } from '../api'
import './DDayWidget.css'

function daysUntil(dateStr) {
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = target - today
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function DDayWidget({ onSelectMenu }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.ddayList()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="dday-widget-wrap"><p className="dday-widget-loading">로딩 중…</p></div>
  if (!list.length) return null

  return (
    <section className="dday-widget-wrap" aria-label="디데이">
      <div className="dday-widget-header">
        <h3 className="dday-widget-title">D-Day</h3>
        <button type="button" className="dday-widget-manage" onClick={() => onSelectMenu?.('dday')}>
          관리
        </button>
      </div>
      <ul className="dday-widget-list">
        {list.slice(0, 5).map((d) => {
          const days = daysUntil(d.targetDate)
          const isPast = days < 0
          const isToday = days === 0
          let label = `D${days}`
          if (isToday) label = 'D-Day'
          else if (isPast) label = `D+${Math.abs(days)}`
          return (
            <li key={d.id} className="dday-widget-item">
              <span className="dday-widget-name">{d.title}</span>
              <span className={`dday-widget-badge ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
