import { Injectable } from "@nestjs/common";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { CourseNotFoundException } from "src/domain/exceptions/domain.exceptions";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { CourseRepository } from "src/domain/repositories/course.repository";
import { CourseDto } from "src/application/dtos/course.dto";

@Injectable()
export class GetCourseBySlugUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly redisService: RedisService,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService
  ) {}

  async execute(slug: string): Promise<CourseDto> {
    return await this.tracer.startActiveSpan(
      "GetCourseBySlugUseCase.execute",
      async (span) => {
        try {
          this.logger.info(
            `Fetching course with slug: ${slug} in ${GetCourseBySlugUseCase.name}`
          );

          span.setAttribute("course.slug", slug);

          const cacheKey = `course:${slug}`;
          const subSpan = this.tracer.startSpan("RedisService.get", {
            "cache.key": cacheKey,
            "course.slug": slug,
          });
          try {
            const cachedCourse = await this.redisService.get(cacheKey);
            if (cachedCourse) {
              this.logger.debug(`Cache hit for course ${slug}`);
              subSpan.setAttribute("cache.hit", true);
              subSpan.setAttribute("course.slug", slug);
              return cachedCourse as CourseDto;
            }
            this.logger.debug(`Cache miss for course ${slug}`);
            subSpan.setAttribute("cache.hit", false);
            subSpan.setAttribute("course.slug", slug);
          } catch (error) {
            subSpan.setAttribute("error", true);
            subSpan.recordException(error);
            this.logger.error(
              `Failed to fetch data from redis : ${error.message}`,
              {
                error,
              }
            );

            throw error;
          }

          this.logger.debug(`Query DB for course ${slug}`);
          const course = await this.courseRepository.findBySlug(slug);
          if (!course) {
            this.logger.debug(`Course not found in DB with slug: ${slug}`);
            throw new CourseNotFoundException(
              `Course with slug ${slug} is not found`
            );
          }

          const courseDto = CourseDto.fromDomain(course);

          await this.redisService.set(cacheKey, courseDto, 3600); // Cache for 1 hour
          this.logger.debug(`Cache miss, stored course ${slug} in cache`);

          return courseDto;
        } catch (error) {
          span.setAttribute("error", true);
          this.logger.error(
            `Failed to fetch data for course slug: ${slug} \n${error.message}`,
            {
              error,
            }
          );

          throw error;
        }
      }
    );
  }
}
