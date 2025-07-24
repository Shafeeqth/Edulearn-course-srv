export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-based)
  explanation?: string; // Optional explanation for the correct answer
}

export class Quiz {
  constructor(
    private readonly id: string,
    private readonly courseId: string,
    private title: string,
    private description: string,
    private timeLimit: number, // in minutes
    private passingScore: number, // percentage (0-100)
    private questions: MCQQuestion[],
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
  getDescription(): string {
    return this.description;
  }
  getTimeLimit(): number {
    return this.timeLimit;
  }
  getPassingScore(): number {
    return this.passingScore;
  }
  getQuestions(): MCQQuestion[] {
    return this.questions;
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

  updateDetails(
    title: string, 
    description: string, 
    timeLimit: number, 
    passingScore: number, 
    questions: MCQQuestion[]
  ): void {
    this.title = title;
    this.description = description;
    this.timeLimit = timeLimit;
    this.passingScore = passingScore;
    this.questions = questions;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
