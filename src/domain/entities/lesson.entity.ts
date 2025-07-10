export class Lesson {
  constructor(
    private readonly id: string,
    private readonly sectionId: string,
    private title: string,
    private content: string,
    private duration: number,
    private createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    private deletedAt?: Date,
  ) {}

  getId(): string {
    return this.id;
  }
  getSectionId(): string {
    return this.sectionId;
  }
  getTitle(): string {
    return this.title;
  }
  getContent(): string {
    return this.content;
  }
  getDuration(): number {
    return this.duration;
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

  updateDetails(title: string, content: string, duration: number): void {
    this.title = title;
    this.content = content;
    this.duration = duration;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
