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

# 빌드된 JAR 복사
COPY --from=build /app/target/*.jar app.jar

# 포트 노출
EXPOSE 8080

# 환경 변수 (Render에서 설정할 것들)
ENV MONGODB_URI=""
ENV JWT_SECRET=""
ENV GALLERY_STORAGE_PATH="/app/gallery-storage"
ENV JAEMINAI_API_KEY=""

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
