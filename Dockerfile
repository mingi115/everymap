FROM eclipse-temurin:17-jdk-alpine
LABEL authors="mingi"
COPY build/libs/every-0.0.1-SNAPSHOT.jar /everymap.jar
ENTRYPOINT ["java", "-jar", "/everymap.jar"]
