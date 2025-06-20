import { Injectable } from "@nestjs/common";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { CourseNotFoundException } from "src/domain/exceptions/domain.exeptions";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { CourseRepository } from "src/domain/repositories/course.repository";
import { CourseDto } from "src/application/dtos/course.dto";

@Injectable()
export class GetCourseUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly redisService: RedisService,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(id: string): Promise<CourseDto> {
    return this.tracer.startActiveSpan(
      "GetCourseUseCase.execute",
      async (span) => {
        try {
          this.logger.info(
            `Fetching course with ID: ${id} in ${GetCourseUseCase.name}`,
          );

          span.setAttribute("course.id", id);

          const cacheKey = `course:${id}`;
          const subSpan = this.tracer.startSpan("RedisService.get", {
            "cache.key": cacheKey,
            "course.id": id,
          });
          try {
            const cachedCourse = await this.redisService.get(cacheKey);
            if (cachedCourse) {
              this.logger.debug(`Cache hit for course ${id}`);
              subSpan.setAttribute("cache.hit", true);
              subSpan.setAttribute("course.id", id);
              return cachedCourse as CourseDto;
            }
            this.logger.debug(`Cache miss for course ${id}`);
            subSpan.setAttribute("cache.hit", false);
            subSpan.setAttribute("course.id", id);
          } catch (error) {
            subSpan.setAttribute("error", true);
            subSpan.recordException(error);
            this.logger.error(
              `Failed to fetch data from redis : ${error.message}`,
              {
                error,
              },
            );

            throw error;
          }

          this.logger.debug(`Query DB for course ${id}`);
          const course = await this.courseRepository.findById(id);
          if (!course) {
            this.logger.debug(`Course not found in DB with Id: ${id}`);
            throw new CourseNotFoundException(id);
          }

          const courseDto = CourseDto.fromDomain(course);

          await this.redisService.set(cacheKey, courseDto, 3600); // Cache for 1 hour
          this.logger.debug(`Cache miss, stored course ${id} in cache`);

          return courseDto;
        } catch (error) {
          span.setAttribute("error", true);
          span.recordException(error);
          this.logger.error(
            `Failed to fetch data for course ID: ${id} \n${error.message}`,
            {
              error,
            },
          );

          throw error;
        } finally {
          span.end();
        }
      },
    );
  }
}
