import { Injectable } from "@nestjs/common";
import { CourseRepository } from "../../../domain/repositories/course.repository";
import { CourseDto } from "../../dtos/course.dto";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";

@Injectable()
export class GetCoursesByInstructorUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    instructorId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "ASC" | "DESC",
  ): Promise<{ courses: CourseDto[]; total: number }> {
    return this.tracer.startActiveSpan(
      "GetCoursesByInstructorUseCase.execute",
      async (span) => {
        this.logger.log(`Fetching courses for instructor ${instructorId}`, {
          ctx: GetCoursesByInstructorUseCase.name,
        });

        span.setAttribute("instructor.id", instructorId);

        const { courses, total } =
          await this.courseRepository.findByInstructorId(
            instructorId,
            page,
            limit,
            sortBy,
            sortOrder,
          );
        const courseDtos = courses.map(CourseDto.fromDomain);

        span.setAttribute("instructor.course.length", courseDtos.length);

        this.logger.log(
          `Found ${courseDtos.length} courses for instructor ${instructorId}`,
          { ctx: GetCoursesByInstructorUseCase.name },
        );
        return { courses: courseDtos, total };
      },
    );
  }
}
