import { useState } from 'react'
import { api } from '../api'
import { setToken } from '../auth'
import './AuthForm.css'

export function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const data = await api.login(username.trim(), password)
        setToken(data.token, data.username)
      } else {
        const data = await api.register(username.trim(), password)
        setToken(data.token, data.username)
      }
      onSuccess?.()
    } catch (e) {
      setError(e.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-card">
        <h2 className="auth-title">{mode === 'login' ? '로그인' : '회원가입'}</h2>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Archive에 접속하려면 로그인하세요.' : '새 계정을 만들어 Archive에 참여하세요.'}
        </p>
        <form onSubmit={submit} className="auth-form">
          <label className="auth-label">
            아이디
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder="아이디"
              autoComplete="username"
              required
            />
          </label>
          <label className="auth-label">
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="비밀번호"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '처리 중…' : mode === 'login' ? '로그인' : '가입'}
          </button>
        </form>
        <button
          type="button"
          className="auth-switch"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
        >
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  )
}
