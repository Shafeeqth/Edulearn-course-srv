import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { CourseRepository } from "src/domain/repositories/course.repository";
import { EnrollmentRepository } from "src/domain/repositories/enrollment.repository";
import { UserClient } from "src/infrastructure/grpc/clients/user.client";
import { KafkaProducer } from "src/infrastructure/kafka/kafka.producer";
import { AlreadyEnrolledException, CourseNotFoundException, UserDomainException } from "src/domain/exceptions/domain.exceptions";
import { EnrollmentDto } from "src/application/dtos/enrollment.dto";
import { Enrollment } from "src/domain/entities/enrollment.entity";

@Injectable()
export class CreateEnrollmentUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly userClient: UserClient,
    private readonly kafkaProducer: KafkaProducer,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService
  ) {}

  async execute(userId: string, courseId: string): Promise<EnrollmentDto> {
    return await this.tracer.startActiveSpan(
      "CreateEnrollmentUseCase.execute",
      async (span) => {
        span.setAttributes({
          "user.id": userId,
          "course.id": courseId,
        });
        this.logger.log(`Enrolling user ${userId} in course ${courseId}`, {
          ctx: CreateEnrollmentUseCase.name,
        });

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
          span.setAttribute("course.found", false);
          throw new CourseNotFoundException(`Course with ID ${courseId} not found`);
        }
        span.setAttribute("course.found", true);

        this.tracer.startActiveSpan("userClient.getUser", async (span) => {
          try {
            await this.userClient.getUser(userId);
            span.setAttribute("user.found", true);
          } catch (error) {
            span.setAttribute("user.found", false);
            this.logger.error(`User ${userId} not found`, {
              ctx: CreateEnrollmentUseCase.name,
              error,
            });
            throw new UserDomainException(`User ${userId} not found`);
          }
        });

        const existingEnrollment =
          await this.enrollmentRepository.findByUserIdAndCourseId(
            userId,
            courseId
          );
        if (existingEnrollment) {
          span.setAttribute("already.enrolled", true);
          throw new AlreadyEnrolledException("User is already enrolled in this course");
        }

        const enrollment = new Enrollment(uuidv4(), userId, courseId);
        await this.enrollmentRepository.save(enrollment);

        span.setAttribute("course.enrolled", true);
        await this.kafkaProducer.sendMessage("course-events", {
          event: "USER_ENROLLED",
          userId,
          courseId,
          enrollmentId: enrollment.getId(),
          timestamp: new Date().toISOString(),
        });
        span.setAttribute("enrolled.event.published", true);

        this.logger.log(`User ${userId} enrolled in course ${courseId}`, {
          ctx: CreateEnrollmentUseCase.name,
        });
        return EnrollmentDto.fromDomain(enrollment);
      }
    );
  }
}
