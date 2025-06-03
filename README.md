# Course Service - EduLearn Microservices Project

The **Course Service** is a microservice in the EduLearn platform responsible for managing courses, sections, lessons, quizzes, enrollments, and user progress. It is built using **NestJS**, **gRPC** for inter-service communication, **Kafka** for async communication, **Redis** for caching, and **TypeORM** with **PostgreSQL** for persistence. The service adheres to **Clean Architecture**, **SOLID principles**, and **NestJS best practices**.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Service](#running-the-service)
- [API Documentation](#api-documentation)
  - [gRPC Endpoints](#grpc-endpoints)
  - [HTTP Endpoints](#http-endpoints)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Course Management**: Create, retrieve, and update courses, sections, lessons, and quizzes.
- **Enrollment**: Enroll users in courses and track their progress.
- **Progress Tracking**: Update and retrieve user progress for lessons.
- **Async Communication**: Publish events (e.g., enrollment, lesson completion) to Kafka.
- **Caching**: Use Redis to cache frequently accessed course data.
- **Inter-Service Communication**: Communicate with other services (e.g., User Service) via gRPC.
- **Monitoring**: Expose metrics via Prometheus for observability.
- **Health Checks**: Provide an HTTP endpoint for monitoring the service's health.

## Technologies

- **NestJS**: Framework for building scalable Node.js applications.
- **gRPC**: High-performance RPC framework for inter-service communication.
- **Kafka**: Distributed event streaming platform for async communication.
- **Redis**: In-memory data store for caching.
- **TypeORM**: ORM for PostgreSQL database interactions.
- **PostgreSQL**: Relational database for persistent storage.
- **Prometheus**: Monitoring and alerting toolkit for metrics.
- **Winston**: Logging library for structured logging.
- **Jest**: Testing framework for unit and integration tests.

## Prerequisites

Before setting up the Course Service, ensure you have the following installed:

- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **PostgreSQL** (v15.x or later)
- **Redis** (v7.x or later)
- **Kafka** (v3.x or later, with Zookeeper)
- **Docker** (optional, for running dependencies in containers)

You’ll also need:

- A running **User Service** (for gRPC communication to fetch user details).
- Access to a Kafka broker for async events.
- Access to a Redis instance for caching.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/edulearn/course-service.git
cd course-service
```

API Documentation
gRPC Endpoints

The Course Service exposes the following gRPC endpoints. The service definition is available in src/infrastructure/grpc/proto/course.proto.
Service: CourseService

    URL: localhost:3001
    Package: course

Method Request Type Response Type Description
CreateCourse CreateCourseRequest CourseResponse Creates a new course.
GetCourse GetCourseRequest CourseResponse Retrieves a course by ID.
EnrollCourse EnrollCourseRequest EnrollmentResponse Enrolls a user in a course.
UpdateProgress UpdateProgressRequest ProgressResponse Updates user progress for a lesson.
AddSection AddSectionRequest SectionResponse Adds a section to a course.
AddLesson AddLessonRequest LessonResponse Adds a lesson to a section.
AddQuiz AddQuizRequest QuizResponse Adds a quiz to a course.
Example: Create a Course

Request:
proto
message CreateCourseRequest {
string title = 1;
string description = 2;
string instructor_id = 3;
}

Response:
proto
message CourseResponse {
string id = 1;
string title = 2;
string description = 3;
string instructor_id = 4;
repeated SectionResponse sections = 5;
repeated QuizResponse quizzes = 6;
string created_at = 7;
string updated_at = 8;
}
HTTP Endpoints

The Course Service exposes HTTP endpoints for health checks and metrics.
Health Check

    Endpoint: GET /health
    Description: Returns the health status of the service.
    Response:
    json

    {
      "status": "ok",
      "service": "Course Service",
      "timestamp": "2025-06-01T03:38:00.000Z"
    }

Metrics

    Endpoint: GET /health/metrics
    Description: Exposes Prometheus metrics for monitoring.
    Response: Prometheus-compatible metrics (text format).

Testing
Run Unit Tests
bash
npm run test
Run Integration Tests

Integration tests require a test database (edulearn_test) and running dependencies (PostgreSQL, Redis, Kafka).
bash
npm run test:integration
Monitoring

The Course Service exposes metrics via Prometheus, which can be scraped from the /health/metrics endpoint. Key metrics include:

    course_service_grpc_requests_total: Total number of gRPC requests.
    course_service_grpc_request_duration_seconds: Latency of gRPC requests.

To set up monitoring:

    Configure Prometheus to scrape the /health/metrics endpoint.
    Use Grafana to visualize the me

course-service/
├── src/
│ ├── domain/
│ │ ├── entities/
│ │ │ ├── course.entity.ts
│ │ │ ├── section.entity.ts
│ │ │ ├── lesson.entity.ts
│ │ │ ├── quiz.entity.ts
│ │ │ ├── enrollment.entity.ts
│ │ │ └── progress.entity.ts
│ │ ├── repositories/
│ │ │ ├── course.repository.ts
│ │ │ ├── enrollment.repository.ts
│ │ │ └── progress.repository.ts
│ │ ├── services/
│ │ │ └── course.service.ts
│ │ └── exceptions/
│ │ └── domain.exceptions.ts
│ ├── application/
│ │ ├── use-cases/
│ │ │ ├── create-course.use-case.ts
│ │ │ ├── get-course.use-case.ts
│ │ │ ├── enroll-course.use-case.ts
│ │ │ └── update-progress.use-case.ts
│ │ ├── dtos/
│ │ │ ├── course.dto.ts
│ │ │ ├── section.dto.ts
│ │ │ ├── lesson.dto.ts
│ │ │ ├── quiz.dto.ts
│ │ │ ├── enrollment.dto.ts
│ │ │ └── progress.dto.ts
│ │ └── interfaces/
│ │ ├── course.interface.ts
│ │ └── enrollment.interface.ts
│ ├── infrastructure/
│ │ ├── database/
│ │ │ ├── entities/
│ │ │ │ ├── course.orm-entity.ts
│ │ │ │ ├── section.orm-entity.ts
│ │ │ │ ├── lesson.orm-entity.ts
│ │ │ │ ├── quiz.orm-entity.ts
│ │ │ │ ├── enrollment.orm-entity.ts
│ │ │ │ └── progress.orm-entity.ts
│ │ │ ├── repositories/
│ │ │ │ ├── course-typeorm.repository.ts
│ │ │ │ ├── enrollment-typeorm.repository.ts
│ │ │ │ └── progress-typeorm.repository.ts
│ │ │ └── database.module.ts
│ │ ├── kafka/
│ │ │ ├── kafka.module.ts
│ │ │ ├── kafka.producer.ts
│ │ │ └── kafka.consumer.ts
│ │ ├── redis/
│ │ │ ├── redis.module.ts
│ │ │ └── redis.service.ts
│ │ ├── grpc/
│ │ │ ├── proto/
│ │ │ │ ├── course.proto
│ │ │ │ └── user.proto
│ │ │ ├── clients/
│ │ │ │ └── user.client.ts
│ │ │ └── grpc.module.ts
│ │ ├── config/
│ │ │ └── config.service.ts
│ │ ├── logging/
│ │ │ └── logger.service.ts
│ │ └── monitoring/
│ │ └── metrics.service.ts
│ ├── presentation/
│ │ ├── grpc/
│ │ │ ├── course-grpc.controller.ts
│ │ │ └── grpc.module.ts
│ │ └── http/
│ │ ├── health.controller.ts
│ │ └── http.module.ts
│ ├── core/
│ │ ├── constants/
│ │ │ └── constants.ts
│ │ └── types/
│ │ └── types.ts
│ ├── main.ts
│ └── app.module.ts
├── tests/
│ ├── unit/
│ │ ├── domain/
│ │ ├── application/
│ │ ├── infrastructure/
│ │ └── presentation/
│ ├── integration/
│ └── jest.config.ts
├── Dockerfile
├── .dockerignore
├── package.json
├── tsconfig.json
└── README.md
