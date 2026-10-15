# ---- Backend (Spring Boot, Java 21) ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /build
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package

FROM eclipse-temurin:21-jre
RUN useradd --system --uid 1001 app
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
USER app
EXPOSE 8080
ENV JAVA_OPTS="-Xmx512m -Duser.timezone=Asia/Kolkata"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
