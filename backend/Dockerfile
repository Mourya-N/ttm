# ============================================================
# Stage 1: Build the JAR with Maven
# ============================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom first to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -q

# ============================================================
# Stage 2: Minimal runtime image
# ============================================================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the built JAR
COPY --from=builder /app/target/*.jar app.jar

# Railway injects PORT at runtime
EXPOSE 8080

# Use exec form for signal handling
ENTRYPOINT ["java", "-jar", "app.jar"]
