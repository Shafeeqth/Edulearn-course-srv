import { Injectable } from "@nestjs/common";
import { SectionDto } from "src/application/dtos/section.dto";
import { Section } from "src/domain/entities/section.entity";
import { CourseNotFoundException } from "src/domain/exceptions/domain.exeptions";
import { CourseRepository } from "src/domain/repositories/course.repository";
import { SectionRepository } from "src/domain/repositories/section.repository";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CreateSectionUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly sectionRepository: SectionRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(courseId: string, title: string): Promise<SectionDto> {
    return this.tracer.startActiveSpan(
      "CreateSectionUseCase.execute",
      async (span) => {
        span.setAttributes({
          "course.id": courseId,
        });
        this.logger.log(`Creating section for course ${courseId}`, {
          ctx: CreateSectionUseCase.name,
        });

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
          span.setAttribute("course.found", false);
          throw new CourseNotFoundException(courseId);
        }
        span.setAttribute("course.found", true);

        const section = new Section(uuidv4(), courseId, title);
        await this.sectionRepository.save(section);

        span.setAttribute("course.section.created", true);

        this.logger.log(`Section created for course ${courseId}`, {
          ctx: CreateSectionUseCase.name,
        });
        return SectionDto.fromDomain(section);
      },
    );
  }
}
