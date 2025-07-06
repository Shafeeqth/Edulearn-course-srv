import { Lesson } from "./lesson.entity";

export class Section {
  constructor(
    private readonly id: string,
    private readonly courseId: string,
    private title: string,
    private lessons: Lesson[] = [],
    private createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    private deletedAt?: Date,
  ) {}

  getId(): string {
    return this.id;
  }
  getCourseId(): string {
    return this.courseId;
  }
  getTitle(): string {
    return this.title;
  }
  getLessons(): Lesson[] {
    return this.lessons;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
