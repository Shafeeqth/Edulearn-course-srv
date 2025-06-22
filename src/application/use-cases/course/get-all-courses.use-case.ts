import { Injectable } from "@nestjs/common";
import { CourseRepository } from "../../../domain/repositories/course.repository";
import { CourseDto } from "../../dtos/course.dto";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";

@Injectable()
export class GetAllCoursesUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "ASC" | "DESC",
  ): Promise<{ courses: CourseDto[]; total: number }> {
    return this.tracer.startActiveSpan(
      "GetAllCoursesUseCase.execute",
      async (span) => {
        this.logger.log(`Fetching all available courses `, {
          ctx: GetAllCoursesUseCase.name,
        });

        const { courses, total } = await this.courseRepository.findAll(
          page,
          limit,
          sortBy,
          sortOrder,
        );
        const courseDtos = courses.map(CourseDto.fromDomain);

        span.setAttribute("course.length", courseDtos.length);

        this.logger.log(`Fetch all available courses`, {
          ctx: GetAllCoursesUseCase.name,
        });
        return { courses: courseDtos, total };
      },
    );
  }
}
