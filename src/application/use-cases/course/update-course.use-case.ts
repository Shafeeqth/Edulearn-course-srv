import { Injectable } from "@nestjs/common";
import { CourseRepository } from "../../../domain/repositories/course.repository";
import { CourseDto } from "../../dtos/course.dto";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { CourseNotFoundException } from "src/domain/exceptions/domain.exeptions";

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    courseId: string,
    title: string,
    description: string,
  ): Promise<CourseDto> {
    return this.tracer.startActiveSpan(
      "UpdateCourseUseCase.execute",
      async (span) => {
        this.logger.info(`Updating course ${courseId}`, {
          ctx: UpdateCourseUseCase.name,
        });
        span.setAttributes({
          "course.id": courseId,
          "course.title": title,
        });

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
          span.setAttribute("course.found", false);
          throw new CourseNotFoundException(courseId);
        }
        span.setAttribute("course.found", true);

        course.updateDetails(title, description);
        await this.courseRepository.update(course);
        span.setAttribute("course.updated", true);

        this.logger.log(`Course ${courseId} updated`, {
          ctx: UpdateCourseUseCase.name,
        });
        return CourseDto.fromDomain(course);
      },
    );
  }
}
