import { useState } from 'react'
import { NavBar } from './components/NavBar'
import { MainBoard } from './components/MainBoard'
import { GalleryPage } from './components/GalleryPage'
import { ConversationPage } from './components/ConversationPage'
import { TodoPage } from './components/TodoPage'
import { DDayPage } from './components/DDayPage'
import { AuthForm } from './components/AuthForm'
import { isLoggedIn, clearAuth } from './auth'
import './App.css'

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())
  const [currentMenu, setCurrentMenu] = useState('main')

  const handleLogout = () => {
    clearAuth()
    setLoggedIn(false)
  }

  if (!loggedIn) {
    return (
      <div className="app">
        <header className="header">
          <h1>Archive</h1>
          <p className="subtitle">로그인 후 이용할 수 있습니다</p>
        </header>
        <AuthForm onSuccess={() => setLoggedIn(true)} />
      </div>
    )
  }

  return (
    <div className="app">
      <NavBar
        currentMenu={currentMenu}
        onSelectMenu={setCurrentMenu}
        onLogout={handleLogout}
      />
      <main className="app-main">
        {currentMenu === 'main' && <MainBoard onSelectMenu={setCurrentMenu} />}
        {currentMenu === 'todo' && <TodoPage onLogout={handleLogout} />}
        {currentMenu === 'gallery' && <GalleryPage onLogout={handleLogout} />}
        {currentMenu === 'conversation' && <ConversationPage onLogout={handleLogout} />}
        {currentMenu === 'dday' && <DDayPage onLogout={handleLogout} />}
      </main>
    </div>
  )
}

export default App
