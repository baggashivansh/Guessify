# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn -q -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/guessify-backend-1.0.0.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xmx256m"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
