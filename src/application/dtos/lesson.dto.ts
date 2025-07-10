import { Lesson } from "../../domain/entities/lesson.entity";

export class LessonDto {
  id: string;
  sectionId: string;
  title: string;
  content: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  static fromDomain(lesson: Lesson): LessonDto {
    const dto = new LessonDto();
    dto.id = lesson.getId();
    dto.sectionId = lesson.getSectionId();
    dto.title = lesson.getTitle();
    dto.content = lesson.getContent();
    dto.duration = lesson.getDuration();
    dto.createdAt = lesson.getCreatedAt();
    dto.updatedAt = lesson.getUpdatedAt();
    dto.deletedAt = lesson.getDeletedAt();
    return dto;
  }
}
