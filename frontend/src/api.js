import { getToken } from './auth'

// 개발: Vite 프록시로 /api → localhost:8080
// 프로덕션(Vercel): VITE_API_URL 환경 변수 또는 자동 감지
function getApiBase() {
  // 환경 변수 우선
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Vercel 배포 감지 (vercel.app 도메인)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://archive-ig7i.onrender.com/api'
  }
  
  // 로컬 개발
  return '/api'
}

const API_BASE = getApiBase()

function authHeaders() {
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function handleResponse(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `오류 ${res.status}`)
  }
  return res.json()
}

export const api = {
  async list() {
    const res = await fetch(`${API_BASE}/photos`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async upload(file) {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    const headers = authHeaders()
    const res = await fetch(`${API_BASE}/photos`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return handleResponse(res)
  },

  async delete(id) {
    const res = await fetch(`${API_BASE}/photos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `오류 ${res.status}`)
    }
  },

  /** 이미지 URL. 로그인 시 쿼리 token 포함 (img src에서 Authorization 헤더를 못 보내므로) */
  fileUrl(id) {
    const base = `${API_BASE}/photos/${id}/file`
    const token = getToken()
    if (token) return `${base}?token=${encodeURIComponent(token)}`
    return base
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || '로그인 실패')
    return data
  },

  async register(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || '회원가입 실패')
    return data
  },

  /** 재미나이 MCP 대화: 프롬프트 전송 후 응답 반환 (todoAdded 시 공유 투두에 반영됨) */
  async conversation(prompt) {
    const res = await fetch(`${API_BASE}/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ prompt }),
    })
    return handleResponse(res)
  },

  async todoList() {
    const res = await fetch(`${API_BASE}/todos`, { headers: authHeaders() })
    return handleResponse(res)
  },
  async todoAdd(title) {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title }),
    })
    return handleResponse(res)
  },
  async todoToggle(id) {
    const res = await fetch(`${API_BASE}/todos/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },
  async todoDelete(id) {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `오류 ${res.status}`)
    }
  },

  async ddayList() {
    const res = await fetch(`${API_BASE}/ddays`, { headers: authHeaders() })
    return handleResponse(res)
  },
  async ddayAdd(title, targetDate) {
    const res = await fetch(`${API_BASE}/ddays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title, targetDate }),
    })
    return handleResponse(res)
  },
  async ddayUpdate(id, title, targetDate) {
    const res = await fetch(`${API_BASE}/ddays/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ title, targetDate }),
    })
    return handleResponse(res)
  },
  async ddayDelete(id) {
    const res = await fetch(`${API_BASE}/ddays/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `오류 ${res.status}`)
    }
  },
}
