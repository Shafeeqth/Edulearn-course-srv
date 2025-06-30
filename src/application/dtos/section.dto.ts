import { Section } from "../../domain/entities/section.entity";
import { LessonDto } from "./lesson.dto";

export class SectionDto {
  id: string;
  courseId: string;
  title: string;
  lessons: LessonDto[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  static fromDomain(section: Section): SectionDto {
    const dto = new SectionDto();
    dto.id = section.getId();
    dto.courseId = section.getCourseId();
    dto.title = section.getTitle();
    dto.lessons = section.getLessons().map(LessonDto.fromDomain);
    dto.createdAt = section.getCreatedAt();
    dto.updatedAt = section.getUpdatedAt();
    dto.deletedAt = section.getDeletedAt();
    return dto;
  }
}
