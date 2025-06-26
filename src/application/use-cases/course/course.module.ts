import { Module } from "@nestjs/common";
import { DatabaseRepositoryModule } from "src/infrastructure/database/database-repository.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { CreateCourseUseCase } from "./create-course.use-case";
import { GetCourseUseCase } from "./get-course.use-case";
import { UpdateCourseUseCase } from "./update-course.use-case";
import { DeleteCourseUseCase } from "./delete-course.use-case";
import { GetCoursesByInstructorUseCase } from "./get-courses-by-instructor.use-case";
import { GetEnrolledCoursesUseCase } from "./get-enrolled-courses.use-case";
import { KafkaModule } from "src/infrastructure/kafka/kafka.module";
import { GetAllCoursesUseCase } from "./get-all-courses.use-case";

@Module({
  imports: [DatabaseRepositoryModule, RedisModule, KafkaModule],
  providers: [
    CreateCourseUseCase,
    GetCourseUseCase,
    GetAllCoursesUseCase,
    UpdateCourseUseCase,
    DeleteCourseUseCase,
    GetCoursesByInstructorUseCase,
    GetEnrolledCoursesUseCase,
  ],
  exports: [
    CreateCourseUseCase,
    GetCourseUseCase,
    GetAllCoursesUseCase,
    UpdateCourseUseCase,
    DeleteCourseUseCase,
    GetCoursesByInstructorUseCase,
    GetEnrolledCoursesUseCase,
  ],
})
export class CourseModule {}
