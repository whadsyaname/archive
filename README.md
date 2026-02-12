# 갤러리 앱

로컬 PC에서 서버처럼 실행해 두고, 외부에서 접속해 사진을 업로드하면 **외장 SSD**에 저장되는 갤러리 앱입니다.

- **백엔드**: Spring Boot (Java 17)
- **프론트엔드**: React (Vite)
- **DB**: MongoDB (사진 메타데이터만 저장, 파일은 디스크에 저장)

## 사전 요구사항

- **Java 17+**
- **Maven 3.8+** (또는 IDE에서 Spring Boot 실행)
- **Node.js 18+** (프론트 빌드/실행용)
- **MongoDB** (로컬 설치 또는 MongoDB Atlas 등 원격 URI)

## 1. 외장 SSD에 저장하기

사진 파일은 MongoDB가 아니라 **로컬(또는 외장 SSD) 디스크**에 저장됩니다. 경로는 환경 변수로 지정합니다.

### Windows (외장 SSD가 `D:` 드라이브인 경우)

```powershell
$env:GALLERY_STORAGE_PATH = "D:\gallery-photos"
```

### Mac / Linux (외장 SSD가 `/Volumes/SSD` 인 경우)

```bash
export GALLERY_STORAGE_PATH="/Volumes/SSD/gallery-photos"
```

또는 `backend/src/main/resources/application.yml` 에서 `gallery.storage.path` 값을 직접 수정해도 됩니다.  
경로가 없으면 자동으로 생성됩니다.

## 2. MongoDB 연결

로컬 MongoDB 기본 URI: `mongodb://localhost:27017/gallery`

다른 URI를 쓰려면 환경 변수로 지정:

```powershell
$env:MONGODB_URI = "mongodb://localhost:27017/gallery"
```

## 2-1. 재미나이(Google Gemini) API 키 (선택)

로그인 후 **Conversation** 메뉴에서 재미나이와 대화하려면 API 키가 필요합니다.

- [Google AI Studio](https://aistudio.google.com/app/apikey)에서 API 키 발급
- 환경 변수 또는 `application.yml`에 설정:

```powershell
$env:JAEMINAI_API_KEY = "발급받은_API_키"
```

또는 `backend/src/main/resources/application.yml` 의 `gallery.conversation.api-key` 에 넣어도 됩니다. (키는 코드 저장소에 올리지 말고, 로컬/서버 환경 변수로만 두는 것을 권장합니다.)

## 3. 백엔드 실행

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

기본 포트: **8080**.  
`server.address: 0.0.0.0` 이므로 같은 네트워크의 다른 기기에서 `http://<이 PC IP>:8080` 으로 접근할 수 있습니다.

## 4. 프론트엔드 (개발 모드)

개발 시에는 프론트를 따로 띄우고, API는 백엔드로 프록시됩니다.

```bash
cd frontend
npm install
npm run dev
```

브라우저: http://localhost:3000

**외부에서 접속**하려면 프론트도 같은 PC에서 서비스해야 합니다. 개발 모드에서는 Vite가 기본적으로 `localhost`만 수신하므로, 외부에서 접속할 때는 아래 “5. 외부에서 접속” 절차를 따르거나, 빌드 후 백엔드에서 정적 파일을 서빙하는 방식을 사용하세요.

## 5. 외부에서 접속 (같은 네트워크)

1. **방화벽**: Windows 방화벽에서 **8080**(백엔드), **3000**(프론트 개발 서버) 인바운드 허용.
2. **PC IP 확인**:  
   `ipconfig`(Windows) 또는 `ifconfig`(Mac/Linux)로 이 PC의 로컬 IP를 확인 (예: `192.168.0.10`).
3. **접속 주소**  
   - 같은 PC: http://localhost:3000 (프론트), http://localhost:8080 (API)  
   - 다른 기기: http://192.168.0.10:3000 (프론트), http://192.168.0.10:8080 (API)

프론트를 다른 기기에서 열면 API 호출이 `localhost`가 아니라 해당 PC IP로 가야 하므로, **프론트 빌드 후 백엔드에서 정적 파일 서빙**하는 구성이 더 적합합니다 (아래 6번).

## 6. 프론트 빌드 후 백엔드에서 한 번에 서비스 (권장)

외부에서 **하나의 주소**로만 접속하려면:

```bash
cd frontend
npm run build
```

빌드 결과는 `frontend/dist` 에 생성됩니다. 이 폴더를 Spring Boot에서 정적 리소스로 서빙하도록 설정하면, `http://<IP>:8080` 만 열어두면 됩니다.

백엔드에 정적 리소스 서빙을 추가하려면:

1. `backend/pom.xml`에 프론트 빌드 결과를 복사하는 설정을 두거나,
2. `backend/src/main/resources/static` 에 `frontend/dist` 내용을 복사한 뒤 백엔드를 재시작합니다.

예 (수동 복사):

```powershell
# frontend 빌드 후
Copy-Item -Path frontend\dist\* -Destination backend\src\main\resources\static\ -Recurse -Force
```

이후 `http://<이 PC IP>:8080` 으로 접속하면 갤러리 화면이 열리고, 업로드한 사진은 **설정한 외장 SSD 경로**에 저장됩니다.

## 7. 외부 네트워크(인터넷)에서 접속하기

집/회사 **밖**에서(다른 Wi‑Fi, LTE, 다른 지역 등) 접속하려면 아래 중 하나를 사용합니다.

### 방법 A: 공유기 포트 포워딩

1. **PC 고정 IP 설정**  
   공유기에서 이 PC에 고정 IP(예: `192.168.0.100`)를 부여하거나, PC에서 수동 IP를 지정합니다.

2. **공유기에서 포트 포워딩**  
   관리자 페이지(보통 `192.168.0.1` 또는 `192.168.1.1`)에 로그인 → **포트 포워딩** / **가상 서버** 메뉴에서:
   - 외부 포트: **8080** (또는 원하는 포트)
   - 내부 IP: 위에서 정한 PC IP (예: `192.168.0.100`)
   - 내부 포트: **8080**
   - 프로토콜: TCP  
   저장 후 적용합니다.

3. **공인 IP 확인**  
   PC 브라우저에서 [https://www.google.com/search?q=my+ip](https://www.google.com/search?q=my+ip) 등으로 **공인 IP**를 확인합니다.

4. **접속**  
   외부 네트워크(휴대폰 데이터 등)에서 브라우저로:
   ```text
   http://<공인IP>:8080
   ```
   예: `http://123.456.78.90:8080`

- **주의**: 공인 IP는 통신사가 바꿀 수 있어요. 바뀌면 주소도 바뀝니다. 고정하려면 **동적 DNS(DDNS)** 서비스를 쓰거나, 아래 터널 방식을 쓰면 됩니다.

### 방법 B: 터널 서비스 (ngrok, Cloudflare Tunnel 등)

공유기 설정 없이 **임시 공개 주소**를 만들어 접속하는 방법입니다.

**ngrok 예시** (무료 플랜으로 충분):

1. [ngrok](https://ngrok.com) 가입 후 ngrok 설치.
2. 백엔드가 **8080**에서 떠 있는 상태에서 터미널에서:
   ```bash
   ngrok http 8080
   ```
3. 화면에 나오는 **Forwarding** URL(예: `https://abc123.ngrok.io`)로 외부에서 접속합니다.

- 장점: 포트 포워딩·공인 IP 신경 쓸 필요 없음.  
- 단점: ngrok 재시작 시 URL이 바뀌고(무료), ngrok 서버를 경유하므로 속도/보안은 상황에 따라 고려해야 합니다.

**Cloudflare Tunnel**을 쓰면 고정된 도메인으로 접속할 수 있지만, Cloudflare 계정·도메인 설정이 필요합니다.

### 공통 확인 사항 (외부 접속 시)

- **프론트는 백엔드와 같은 주소로**: 외부에서는 **한 주소(예: `http://공인IP:8080`)** 로만 접속하는 것이 좋습니다. 위 **6번**처럼 프론트를 빌드한 뒤 `backend/src/main/resources/static`에 복사해 두면, 8080 하나만 열면 됩니다.
- **방화벽**: Windows 방화벽에서 **8080** 인바운드 허용.
- **보안**: 실제로 외부에 열 때는 HTTPS와 강한 비밀번호 사용을 권장합니다. JWT 비밀키(`JWT_SECRET`)도 반드시 다른 값으로 변경하세요.

## API 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/photos | 사진 목록 (메타데이터) |
| POST | /api/photos | multipart 파일 업로드 |
| GET | /api/photos/{id} | 단일 사진 메타데이터 |
| GET | /api/photos/{id}/file | 사진 파일 바이너리 |

## 정리

- **사진 파일**: `GALLERY_STORAGE_PATH`(또는 `application.yml`의 `gallery.storage.path`)에 지정한 경로(외장 SSD 권장)에 저장.
- **메타데이터**: MongoDB `gallery` DB의 `photos` 컬렉션에 저장.
- **외부 접속**: 백엔드 `0.0.0.0:8080` + 방화벽 허용 + (선택) 프론트 빌드 후 동일 8080에서 서빙.
