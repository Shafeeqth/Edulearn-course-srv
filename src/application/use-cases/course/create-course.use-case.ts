import { Injectable } from "@nestjs/common";
import { CourseRepository } from "../../../domain/repositories/course.repository";
import { CourseDto } from "../../dtos/course.dto";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { Course } from "src/domain/entities/course.entity";
import { v4 as uuidv4 } from "uuid";
import { CourseAlreadyExistException } from "src/domain/exceptions/domain.exeptions";

@Injectable()
export class CreateCourseUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    title: string,
    description: string,
    instructorId: string,
  ): Promise<CourseDto> {
    return this.tracer.startActiveSpan(
      "CreateCourseUseCase.execute",
      async (span) => {
        this.logger.info(
          `Creating course: ${title} in ${CreateCourseUseCase.name}`,
        );

        span.setAttribute("course.title", title);
        span.setAttribute("instructor.id", instructorId);

        const courseTitleExist = await this.courseRepository.findByTitle(title);
        if (courseTitleExist) {
          span.setAttribute("course.title.already_exist", true);
          throw new CourseAlreadyExistException(courseTitleExist.getTitle());
        }

        span.setAttribute("course.title.already_exist", false);
        const course = new Course(uuidv4(), title, description, instructorId);

        await this.courseRepository.save(course);

        this.logger.info(
          `Course created with ID: ${course.getId()} in 
            ${CreateCourseUseCase.name}`,
        );
        return CourseDto.fromDomain(course);
      },
    );
  }
}
