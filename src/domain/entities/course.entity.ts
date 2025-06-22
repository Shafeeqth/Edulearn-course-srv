import { Quiz } from "./quiz.entity";
import { Section } from "./section.entity";

export class Course {
  constructor(
    private readonly id: string,
    private title: string,
    private description: string,
    private instructorId: string,
    private sections: Section[] = [],
    private quizzes: Quiz[] = [],
    private createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    private deletedAt?: Date, // For soft delete
  ) {}

  // Getters
  getId(): string {
    return this.id;
  }
  getTitle(): string {
    return this.title;
  }
  getDescription(): string {
    return this.description;
  }
  getInstructorId(): string {
    return this.instructorId;
  }
  getSections(): Section[] {
    return this.sections;
  }
  getQuizzes(): Quiz[] {
    return this.quizzes;
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

  // Update course details
  updateDetails(title: string, description: string): void {
    this.title = title;
    this.description = description;
    this.updatedAt = new Date();
  }

  // Soft delete
  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  addSection(section: Section): void {
    this.sections.push(section);
    this.updatedAt = new Date();
  }

  addQuiz(quiz: Quiz): void {
    this.quizzes.push(quiz);
    this.updatedAt = new Date();
  }
}
