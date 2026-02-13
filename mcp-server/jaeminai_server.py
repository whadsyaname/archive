import asyncio
import os
from typing import Any
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)
import mcp.types as types
import google.generativeai as genai

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# MCP 서버 생성
server = Server("jaeminai-mcp")

# 대화 이력 저장 (세션별)
conversations = {}


@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """사용 가능한 도구 목록"""
    return [
        Tool(
            name="add_todo",
            description="할 일 목록에 새로운 항목을 추가합니다.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "할 일 제목",
                    },
                },
                "required": ["title"],
            },
        ),
    ]


@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any] | None
) -> list[TextContent | ImageContent | EmbeddedResource]:
    """도구 실행"""
    if name == "add_todo":
        title = arguments.get("title", "") if arguments else ""
        # 실제로는 Spring Boot API를 호출해야 하지만, 여기서는 응답만 반환
        return [
            TextContent(
                type="text",
                text=f"✅ '{title}' 항목을 할 일 목록에 추가했습니다.",
            )
        ]
    else:
        raise ValueError(f"Unknown tool: {name}")


@server.list_prompts()
async def handle_list_prompts() -> list[types.Prompt]:
    """프롬프트 템플릿"""
    return [
        types.Prompt(
            name="chat",
            description="재미나이와 자연스러운 대화",
            arguments=[
                types.PromptArgument(
                    name="message",
                    description="사용자 메시지",
                    required=True,
                )
            ],
        )
    ]


@server.get_prompt()
async def handle_get_prompt(
    name: str, arguments: dict[str, str] | None
) -> types.GetPromptResult:
    """프롬프트 실행 - Gemini 호출"""
    if name != "chat":
        raise ValueError(f"Unknown prompt: {name}")

    if not arguments or "message" not in arguments:
        raise ValueError("message argument required")

    user_message = arguments["message"]
    session_id = arguments.get("session_id", "default")

    # API 키 체크
    if not GEMINI_API_KEY:
        return types.GetPromptResult(
            description="재미나이 API 키가 설정되지 않았습니다.",
            messages=[
                types.PromptMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text="재미나이 API 키를 설정해 주세요. GEMINI_API_KEY 환경 변수에 발급받은 키를 넣으세요.",
                    ),
                )
            ],
        )

    try:
        # Gemini 모델 생성
        model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # 세션별 대화 이력 가져오기
        if session_id not in conversations:
            conversations[session_id] = model.start_chat(history=[])
        chat = conversations[session_id]

        # 메시지 전송 & 응답 받기
        response = chat.send_message(user_message)

        return types.GetPromptResult(
            description=f"재미나이의 응답",
            messages=[
                types.PromptMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=response.text,
                    ),
                )
            ],
        )

    except Exception as e:
        return types.GetPromptResult(
            description="오류 발생",
            messages=[
                types.PromptMessage(
                    role="assistant",
                    content=TextContent(
                        type="text",
                        text=f"재미나이 API 호출 중 오류가 발생했습니다: {str(e)}",
                    ),
                )
            ],
        )


async def main():
    """MCP 서버 실행 (stdio)"""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="jaeminai-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    asyncio.run(main())
