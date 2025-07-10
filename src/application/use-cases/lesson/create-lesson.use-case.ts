import { Injectable } from "@nestjs/common";
import { LessonDto } from "src/application/dtos/lesson.dto";
import { Lesson } from "src/domain/entities/lesson.entity";
import { SectionNotFoundException } from "src/domain/exceptions/domain.exceptions";
import { LessonRepository } from "src/domain/repositories/lesson.repository";
import { SectionRepository } from "src/domain/repositories/section.repository";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CreateLessonUseCase {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    sectionId: string,
    title: string,
    content: string,
    duration: number,
  ): Promise<LessonDto> {
    return this.tracer.startActiveSpan(
      "CreateLessonUseCase.execute",
      async (span) => {
        span.setAttributes({
          "section.id": sectionId,
          "lesson.title": title,
        });
        this.logger.log(`Creating lesson for section ${sectionId}`, {
          ctx: CreateLessonUseCase.name,
        });

        const section = await this.sectionRepository.findById(sectionId);
        if (!section) {
          span.setAttribute("section.found", false);
          throw new SectionNotFoundException(`Section ${sectionId} not found`);
        }
        span.setAttribute("section.found", true);

        const lesson = new Lesson(
          uuidv4(),
          sectionId,
          title,
          content,
          duration,
        );
        await this.lessonRepository.save(lesson);
        span.setAttribute("lesson.saved", true);

        this.logger.log(`Lesson created for section ${sectionId}`, {
          ctx: CreateLessonUseCase.name,
        });
        return LessonDto.fromDomain(lesson);
      },
    );
  }
}
