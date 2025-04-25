# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build the application
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Set the entry point to run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 