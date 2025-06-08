import { Course } from "src/domain/entities/course.entity";
import { QuizDto } from "./quiz.dto";
import { SectionDto } from "./section.dto";

export class CourseDto {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  sections: SectionDto[];
  quizzes: QuizDto[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  static fromDomain(course: Course): CourseDto {
    const dto = new CourseDto();
    dto.id = course.getId();
    dto.title = course.getTitle();
    dto.description = course.getDescription();
    dto.instructorId = course.getInstructorId();
    dto.sections = course.getSections().map(SectionDto.fromDomain);
    dto.quizzes = course.getQuizzes().map(QuizDto.fromDomain);
    dto.createdAt = course.getCreatedAt();
    dto.updatedAt = course.getUpdatedAt();
    dto.deletedAt = course.getDeletedAt();
    return dto;
  }
}
