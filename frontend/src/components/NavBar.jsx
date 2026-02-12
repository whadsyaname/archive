import { getUsername } from '../auth'
import './NavBar.css'

const MENUS = [
  { id: 'main', label: 'Main' },
  { id: 'todo', label: 'To-do' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'dday', label: 'D-Day' },
]

export function NavBar({ currentMenu, onSelectMenu, onLogout }) {
  return (
    <nav className="navbar" aria-label="대메뉴">
      <div className="navbar-inner">
        <span className="navbar-brand">Archive</span>
        <ul className="navbar-menu">
          {MENUS.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`navbar-item ${currentMenu === m.id ? 'active' : ''}`}
                onClick={() => onSelectMenu(m.id)}
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="navbar-right">
          <span className="navbar-user">{getUsername()}님</span>
          <button type="button" className="navbar-logout" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  )
}
