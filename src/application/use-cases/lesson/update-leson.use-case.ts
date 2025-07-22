import { Injectable } from "@nestjs/common";
import { LessonDto } from "src/application/dtos/lesson.dto";
import { LessonNotFoundException } from "src/domain/exceptions/domain.exceptions";
import { LessonRepository } from "src/domain/repositories/lesson.repository";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";

@Injectable()
export class UpdateLessonUseCase {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    lessonId: string,
    title: string,
    content: string,
    duration: number,
  ): Promise<LessonDto> {
    return this.tracer.startActiveSpan(
      "UpdateLessonUseCase.execute",
      async (span) => {
        span.setAttributes({
          "lesson.id": lessonId,
          "lesson.title": title,
        });
        this.logger.log(`Updating lesson ${lessonId}`, {
          ctx: UpdateLessonUseCase.name,
        });

        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) {
          span.setAttribute("lesson.found", false);
          throw new LessonNotFoundException(`Lesson ${lessonId} not found`);
        }
        span.setAttribute("lesson.found", true);

        lesson.updateDetails(title, content, duration);
        await this.lessonRepository.save(lesson);
        span.setAttribute("db.saved", true);

        this.logger.log(`Lesson ${lessonId} updated`, {
          ctx: UpdateLessonUseCase.name,
        });
        return LessonDto.fromDomain(lesson);
      },
    );
  }
}
