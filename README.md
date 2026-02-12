# 개인 포털

갤러리, 할 일, D-Day, AI 대화를 한곳에 모아 쓰는 **개인 포털** 앱입니다.  
로컬 PC에서 서버처럼 실행해 두고, 같은 네트워크나 외부에서 접속해 사용할 수 있습니다.  
사진은 지정한 경로(예: 외장 SSD)에 저장되고, 나머지 데이터는 MongoDB에 저장됩니다.

## 기능

- **갤러리** — 사진 업로드·조회 (파일은 디스크, 메타데이터는 DB)
- **할 일(Todo)** — 할 일 목록 관리
- **D-Day** — D-Day 관리 및 위젯
- **대화(Conversation)** — 재미나이(Google Gemini)와 채팅 (API 키 설정 시)
- **로그인** — 회원가입·로그인, JWT 인증

## 사전 요구사항

- **Java 17+**
- **Maven 3.8+** (또는 IDE에서 Spring Boot 실행)
- **Node.js 18+** (프론트 빌드/실행용)
- **MongoDB** (로컬 또는 MongoDB Atlas 등)

## 설정

### 사진 저장 경로 (선택)

사진 파일을 저장할 폴더 경로. 지정하지 않으면 기본값 사용(또는 `application.yml`의 `gallery.storage.path` 수정).

- Windows: `$env:GALLERY_STORAGE_PATH = "D:\gallery-photos"`
- Mac/Linux: `export GALLERY_STORAGE_PATH="/Volumes/SSD/gallery-photos"`

경로가 없으면 자동으로 생성됩니다.

### MongoDB (선택)

기본: `mongodb://localhost:27017/gallery`  
다른 URI 사용 시: `MONGODB_URI` 환경 변수로 지정.

### 재미나이 API 키 (선택)

**Conversation** 메뉴를 쓰려면 [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급 후:

- `JAEMINAI_API_KEY` 환경 변수에 설정하거나
- `backend/src/main/resources/application.yml`의 `gallery.conversation.api-key`에 설정

(API 키는 저장소에 올리지 말고 로컬/서버 환경 변수로만 두는 것을 권장합니다.)

## 실행

### 백엔드

```bash
cd backend
./mvnw spring-boot:run
```

Windows: `.\mvnw.cmd spring-boot:run`  
기본 포트: **8080**

### 프론트엔드 (개발)

```bash
cd frontend
npm install
npm run dev
```

브라우저: http://localhost:3000  
개발 시 API는 Vite 프록시로 백엔드(8080)에 연결됩니다.

### 한 주소로 서비스 (프론트 빌드 후)

다른 기기에서 접속할 때는 프론트를 빌드한 뒤 백엔드에서 정적 파일을 서빙하는 편이 좋습니다.

```bash
cd frontend
npm run build
```

이후 `frontend/dist` 내용을 `backend/src/main/resources/static`에 복사하고 백엔드를 재시작하면, `http://<접속주소>:8080` 하나로 앱을 이용할 수 있습니다.

- Windows 예: `Copy-Item -Path frontend\dist\* -Destination backend\src\main\resources\static\ -Recurse -Force`

같은 네트워크·외부에서 접속하려면 방화벽에서 8080 허용, 필요 시 포트 포워딩·터널(ngrok 등)은 배포 환경에 맞게 설정하면 됩니다.

## 기술 스택

- **백엔드**: Spring Boot (Java 17), MongoDB, JWT
- **프론트엔드**: React, Vite

## API 요약 (참고)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/photos | 사진 목록 |
| POST | /api/photos | 사진 업로드 |
| GET | /api/photos/{id} | 단일 사진 메타데이터 |
| GET | /api/photos/{id}/file | 사진 파일 |

그 외 로그인, Todo, D-Day, Conversation API는 백엔드 컨트롤러 참고.
