import { Injectable } from "@nestjs/common";
import { CourseRepository } from "../../../domain/repositories/course.repository";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { CourseNotFoundException } from "src/domain/exceptions/domain.exeptions";

@Injectable()
export class DeleteCourseUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(courseId: string): Promise<void> {
    return this.tracer.startActiveSpan(
      "DeleteCourseUseCase.execute",
      async (span) => {
        this.logger.log(`Deleting course ${courseId}`, {
          ct: DeleteCourseUseCase.name,
        });

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
          throw new CourseNotFoundException(courseId);
        }
        span.setAttributes({
          "course.id": courseId,
        });

        course.softDelete();
        await this.courseRepository.delete(course);
        span.setAttributes({
          "course.deleted": true,
        });

        this.logger.log(`Course ${courseId} deleted`, {
          ctx: DeleteCourseUseCase.name,
        });
      },
    );
  }
}
