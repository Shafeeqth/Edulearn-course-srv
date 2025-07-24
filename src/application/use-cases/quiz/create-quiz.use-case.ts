import { Injectable } from "@nestjs/common";
import { QuizDto } from "src/application/dtos/quiz.dto";
import { Quiz, MCQQuestion } from "src/domain/entities/quiz.entity";
import { CourseNotFoundException } from "src/domain/exceptions/domain.exceptions";
import { CourseRepository } from "src/domain/repositories/course.repository";
import { QuizRepository } from "src/domain/repositories/quiz.repository";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CreateQuizUseCase {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly quizRepository: QuizRepository,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
  ) {}

  async execute(
    courseId: string,
    title: string,
    description: string,
    timeLimit: number,
    passingScore: number,
    questions: MCQQuestion[],
  ): Promise<QuizDto> {
    return this.tracer.startActiveSpan(
      "CreateQuizUseCase.execute",
      async (span) => {
        span.setAttributes({
          "course.id": courseId,
          "quiz.title": title,
          "quiz.timeLimit": timeLimit,
          "quiz.passingScore": passingScore,
          "quiz.questionsCount": questions.length,
        });
        this.logger.log(`Creating quiz for course ${courseId}`, {
          ctx: CreateQuizUseCase.name,
        });

        const course = await this.courseRepository.findById(courseId);
        if (!course) {
          span.setAttribute("course.found", false);
          throw new CourseNotFoundException(courseId);
        }
        span.setAttribute("course.found", true);

        const quiz = new Quiz(uuidv4(), courseId, title, description, timeLimit, passingScore, questions);
        await this.quizRepository.save(quiz);
        span.setAttribute("quiz.saved", true);

        this.logger.log(`Quiz created for course ${courseId}`, {
          ctx: CreateQuizUseCase.name,
        });
        return QuizDto.fromDomain(quiz);
      },
    );
  }
}
