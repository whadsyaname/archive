# MongoDB 실행 방법 (백엔드 연결 오류 해결)

`MongoSocketOpenException: Connection refused` 는 **MongoDB가 실행 중이지 않을 때** 발생합니다.

## 1. MongoDB 설치 (Windows)

1. https://www.mongodb.com/try/download/community 에서 Windows MSI 다운로드
2. 설치 시 **"Install MongoDB as a Service"** 옵션 선택하면 PC 켤 때마다 자동 실행됨
3. 설치 후 서비스가 자동으로 시작됨 (포트 27017)

## 2. 이미 설치했는데 실행이 안 될 때

- **서비스로 설치한 경우**:  
  `Win + R` → `services.msc` → "MongoDB Server" 찾아서 **시작**
- **수동 실행**:  
  MongoDB가 설치된 폴더의 `bin` 안에서:
  ```powershell
  .\mongod.exe
  ```
  (기본 데이터 경로: `C:\data\db` — 없으면 먼저 `mkdir C:\data\db`)

## 3. Docker로 실행

```powershell
docker run -d -p 27017:27017 --name mongo mongo:7
```

## 4. 확인

- 브라우저에서 http://localhost:27017 접속  
  → "It looks like you are trying to access MongoDB over HTTP..." 메시지가 보이면 정상
- 그 다음 백엔드 다시 실행

## MongoDB 없이 쓰고 싶다면

백엔드를 H2(파일 DB)로 바꾸면 MongoDB 설치·실행 없이 사용할 수 있습니다.  
원하면 프로젝트를 H2용으로 수정해 드릴 수 있습니다.
