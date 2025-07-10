import { Injectable } from "@nestjs/common";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { LessonRepository } from "src/domain/repositories/lesson.repository";
import { LessonNotFoundException } from "src/domain/exceptions/domain.exceptions";

@Injectable()
export class DeleteLessonUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(lessonId: string): Promise<void> {
    return this.tracer.startActiveSpan(
      "DeleteLessonUseCase.execute",
      async (span) => {
        span.setAttributes({
          "lesson.id": lessonId,
        });
        this.logger.log(`Deleting lesson ${lessonId}`, {
          ctx: DeleteLessonUseCase.name,
        });

        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) {
          span.setAttribute("lesson.found", false);
          throw new LessonNotFoundException(`Lesson ${lessonId} not found`);
        }

        await this.lessonRepository.delete(lesson);
        span.setAttribute("lesson.deleted", true);
        this.logger.log(`Lesson ${lessonId} deleted`, {
          ctx: DeleteLessonUseCase.name,
        });
      },
    );
  }
}
