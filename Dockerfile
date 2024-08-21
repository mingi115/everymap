FROM eclipse-temurin:17-jdk-alpine
LABEL authors="mingi"
ARG JAR_FILE
COPY ${JAR_FILE} /everymap.jar
ENTRYPOINT ["java", "-jar", "/everymap.jar"]
