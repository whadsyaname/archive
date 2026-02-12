# 배포 가이드

## 백엔드 배포 (Render)

### 1. Render에서 새 Web Service 생성
- **Repository**: GitHub 저장소 연결
- **Root Directory**: `backend`
- **Environment**: Docker

### 2. 환경 변수 설정 (Render Dashboard)
| 변수 | 값 |
|------|-----|
| `MONGODB_URI` | `mongodb+srv://...` (Atlas connection string) |
| `JWT_SECRET` | 강력한 랜덤 문자열 (최소 256비트) |
| `GALLERY_STORAGE_PATH` | `/app/gallery-storage` (기본값 사용) |
| `JAEMINAI_API_KEY` | Google Gemini API 키 (선택) |

⚠️ **주의**: Render 무료 플랜은 재시작 시 디스크가 초기화됩니다. 사진을 계속 보관하려면:
- Render 유료 플랜 사용 (Persistent Disk)
- 또는 AWS S3, Cloudinary 등 외부 스토리지로 변경

### 3. 배포
Render가 자동으로 `backend/Dockerfile`을 찾아 빌드·배포합니다.  
배포 완료 후 URL 확인 (예: `https://your-backend.onrender.com`)

---

## 프론트엔드 배포 (Vercel)

### 1. Vercel에서 프로젝트 Import
- **Repository**: GitHub 저장소 연결
- **Root Directory**: `frontend`
- **Framework Preset**: Vite

### 2. 환경 변수 설정 (Vercel Dashboard)
| 변수 | 값 |
|------|-----|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

백엔드 URL + `/api`를 꼭 포함해야 합니다.

### 3. 빌드 설정
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. 배포
Vercel이 자동으로 빌드·배포합니다.

---

## CORS 확인

백엔드 `WebConfig.java`에서 이미 모든 origin을 허용하고 있어 별도 설정 불필요합니다.

---

## 배포 후 확인 사항

1. Vercel URL로 접속해 회원가입·로그인 테스트
2. 사진 업로드 테스트 (⚠️ Render 무료는 재시작 시 사진 삭제됨)
3. Todo, D-Day, Conversation 기능 테스트
4. MongoDB Atlas에서 데이터 확인
