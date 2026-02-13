# 재미나이 MCP 서버

Gemini API를 MCP 프로토콜로 감싸는 서버입니다.

## 설치

```bash
cd mcp-server
pip install -r requirements.txt
```

## 실행

```bash
python jaeminai_server.py
```

## 환경 변수

- `GEMINI_API_KEY`: Google Gemini API 키

## 기능

- **chat 프롬프트**: 대화 이력을 유지하며 Gemini와 대화
- **add_todo 도구**: 할 일 추가 (Spring Boot API 연동 필요)

## Spring Boot 연동

Spring Boot에서 이 MCP 서버를 subprocess로 실행하고, stdio를 통해 JSON-RPC 2.0 메시지를 주고받습니다.
