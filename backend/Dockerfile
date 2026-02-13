# Multi-stage build: Maven으로 빌드 후 Java 런타임으로 실행
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# pom.xml 먼저 복사 (의존성 캐싱)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 소스 복사 후 빌드
COPY src ./src
RUN mvn clean package -DskipTests

# 실행 이미지 (Debian 기반 - Alpine의 SSL 문제 회피)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Python 설치 (MCP 서버용)
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# 빌드된 JAR 복사
COPY --from=build /app/target/*.jar app.jar

# MCP 서버 복사 (backend/mcp-server)
COPY mcp-server /app/mcp-server

# Python 의존성 설치
RUN cd /app/mcp-server && pip3 install --break-system-packages -r requirements.txt

# 포트 노출
EXPOSE 8080

# 환경 변수 (Render에서 설정할 것들)
ENV MONGODB_URI=""
ENV JWT_SECRET=""
ENV GALLERY_STORAGE_PATH="/app/gallery-storage"
ENV GEMINI_API_KEY=""

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
