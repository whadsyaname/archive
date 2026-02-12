import { getUsername } from '../auth'
import { DDayWidget } from './DDayWidget'
import './MainBoard.css'

export function MainBoard({ onSelectMenu }) {
  return (
    <div className="main-board">
      <DDayWidget onSelectMenu={onSelectMenu} />
      <section className="main-board-hero">
        <h2>Main</h2>
        <p className="main-board-welcome">{getUsername()}님, 안녕하세요.</p>
        <p className="main-board-desc">
          상단 메뉴에서 <strong>To-do</strong>, <strong>Gallery</strong>, <strong>Conversation</strong>, <strong>D-Day</strong>를 이용할 수 있습니다. Conversation에서 &quot;투두에 &#39;할 일&#39; 추가해줘&quot;라고 하면 공유 투두에 자동 등록됩니다.
        </p>
      </section>
      <section className="main-board-cards">
        <button type="button" className="main-board-card" onClick={() => onSelectMenu?.('todo')}>
          <span className="main-board-card-title">To-do</span>
          <span className="main-board-card-desc">공유 할 일 목록</span>
        </button>
        <button type="button" className="main-board-card" onClick={() => onSelectMenu?.('gallery')}>
          <span className="main-board-card-title">Gallery</span>
          <span className="main-board-card-desc">사진 업로드 및 목록 보기</span>
        </button>
        <button type="button" className="main-board-card" onClick={() => onSelectMenu?.('conversation')}>
          <span className="main-board-card-title">Conversation</span>
          <span className="main-board-card-desc">재미나이 MCP 대화 결과 보기</span>
        </button>
        <button type="button" className="main-board-card" onClick={() => onSelectMenu?.('dday')}>
          <span className="main-board-card-title">D-Day</span>
          <span className="main-board-card-desc">기념일 카운트다운 관리</span>
        </button>
      </section>
    </div>
  )
}
