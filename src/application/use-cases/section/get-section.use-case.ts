import { Injectable } from "@nestjs/common";
import { SectionDto } from "src/application/dtos/section.dto";
import { SectionRepository } from "src/domain/repositories/section.repository";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";

@Injectable()
export class GetSectionUseCase {
  constructor(
    private readonly sectionRepository: SectionRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(sectionId: string): Promise<SectionDto> {
    return this.tracer.startActiveSpan(
      "GetSectionUseCase.execute",
      async (span) => {
        span.setAttributes({
          "section.id": sectionId,
        });
        this.logger.log(`Fetching section ${sectionId}`, {
          ctx: GetSectionUseCase.name,
        });

        const section = await this.sectionRepository.findById(sectionId);
        if (!section) {
          span.setAttribute("section.found", false);
          throw new Error(`Section ${sectionId} not found`);
        }
        span.setAttribute("section.found", true);

        this.logger.log(`Section ${sectionId} fetched`, {
          ctx: GetSectionUseCase.name,
        });
        return SectionDto.fromDomain(section);
      },
    );
  }
}
