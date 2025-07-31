export enum EnrollmentStatus {
  "ACTIVE",
  "COMPLETED",
  "DROPPED",
}

export class Enrollment {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly courseId: string,
    private readonly enrolledAt: Date = new Date(),
    private status: EnrollmentStatus = EnrollmentStatus.ACTIVE,
    private progress?: number, 
    private completedAt?: Date,
    private createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    private deletedAt?: Date,
  ) {}

  getId(): string {
    return this.id;
  }
  getUserId(): string {
    return this.userId;
  }
  getCompletedAt(): Date {
    return this.completedAt;
  }

  getProgress(): number {
    return this.progress;
  }

  getCourseId(): string {
    return this.courseId;
  }
  getEnrolledAt(): Date {
    return this.enrolledAt;
  }
  getStatus(): EnrollmentStatus {
    return this.status;
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

  updateStatus(status: EnrollmentStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
