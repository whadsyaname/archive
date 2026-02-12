import { useState, useRef, useEffect } from 'react'
import { api } from '../api'
import { clearAuth } from '../auth'
import './ConversationPage.css'

export function ConversationPage({ onLogout }) {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [todoToast, setTodoToast] = useState(null)
  const resultRef = useRef(null)

  useEffect(() => {
    if (resultRef.current && result) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight
    }
  }, [result])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const data = await api.conversation(prompt.trim())
      setResult(data)
      if (data.todoAdded && data.todoTitle) {
        setTodoToast(`할 일이 추가되었습니다: "${data.todoTitle}"`)
        setTimeout(() => setTodoToast(null), 4000)
      }
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('로그인이 필요')) {
        clearAuth()
        onLogout?.()
      } else {
        setError(e.message || '재미나이 응답을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="conversation-page">
      <h2 className="page-title">Conversation</h2>
      <p className="page-desc">재미나이 MCP에 프롬프트를 보내 대화 결과를 확인하세요. &quot;투두에 &#39;탄이 간식 사기&#39; 추가해줘&quot;처럼 말하면 공유 To-do에 자동 등록됩니다.</p>

      <form onSubmit={handleSubmit} className="conversation-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="프롬프트를 입력하세요..."
          className="conversation-input"
          rows={3}
          disabled={loading}
        />
        <button type="submit" className="conversation-submit" disabled={loading || !prompt.trim()}>
          {loading ? '전송 중…' : '재미나이에게 보내기'}
        </button>
      </form>

      {todoToast && (
        <div className="conversation-todo-toast" role="status">
          {todoToast}
        </div>
      )}

      {error && (
        <div className="conversation-error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="conversation-result-wrap">
          <h3 className="conversation-result-title">응답</h3>
          <div ref={resultRef} className="conversation-result">
            {result.text != null && <p className="conversation-result-text">{result.text}</p>}
            {result.response != null && <p className="conversation-result-text">{result.response}</p>}
            {result.content != null && <p className="conversation-result-text">{result.content}</p>}
            {typeof result === 'string' && <p className="conversation-result-text">{result}</p>}
            {result.text == null && result.response == null && result.content == null && typeof result !== 'string' && (
              <pre className="conversation-result-json">{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
