import { Module } from "@nestjs/common";
import { DatabaseEntityModule } from "./database-entity.module";
import { CourseTypeOrmRepository } from "./repositories/course-typeorm.repository";
import { CourseRepository } from "src/domain/repositories/course.repository";
import { EnrollmentRepository } from "src/domain/repositories/enrollment.repository";
import { EnrollmentTypeOrmRepository } from "./repositories/enrollment-typeorm.reposity";
import { LessonRepository } from "src/domain/repositories/lesson.repository";
import { LessonTypeOrmRepository } from "./repositories/lesson-typeorm.repository";
import { SectionTypeOrmRepository } from "./repositories/section-typeorm.repository";
import { SectionRepository } from "src/domain/repositories/section.repository";
import { ProgressRepository } from "src/domain/repositories/progress.repository";
import { ProgressTypeOrmRepository } from "./repositories/progress-typeorm.repository";
import { QuizTypeOrmRepository } from "./repositories/quiz-typeorm.repository";
import { QuizRepository } from "src/domain/repositories/quiz.repository";
import { ReviewRepository } from "src/domain/repositories/review.repository";
import { ReviewTypeOrmRepository } from "./repositories/review-typeorm.repository";
import { RedisModule } from "../redis/redis.module";
import { KafkaModule } from "../kafka/kafka.module";

@Module({
  imports: [DatabaseEntityModule, RedisModule, KafkaModule],
  providers: [
    { provide: CourseRepository, useClass: CourseTypeOrmRepository },
    { provide: EnrollmentRepository, useClass: EnrollmentTypeOrmRepository },
    { provide: LessonRepository, useClass: LessonTypeOrmRepository },
    { provide: SectionRepository, useClass: SectionTypeOrmRepository },
    { provide: ProgressRepository, useClass: ProgressTypeOrmRepository },
    { provide: QuizRepository, useClass: QuizTypeOrmRepository },
    { provide: ReviewRepository, useClass: ReviewTypeOrmRepository },
  ],
  exports: [
    DatabaseEntityModule,
    CourseRepository,
    EnrollmentRepository,
    LessonRepository,
    SectionRepository,
    ProgressRepository,
    QuizRepository,
    ReviewRepository,
  ],
})
export class DatabaseRepositoryModule {}
