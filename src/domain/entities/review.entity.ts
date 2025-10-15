import {  ReviewException } from "../exceptions/domain.exceptions";

export class Review {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly courseId: string,
    private rating: number, // 1 to 5
    private comment: string,
    private createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {}

  // Getters
  getId(): string {
    return this.id;
  }
  getUserId(): string {
    return this.userId;
  }
  getCourseId(): string {
    return this.courseId;
  }
  getRating(): number {
    return this.rating;
  }
  getComment(): string {
    return this.comment;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Update review
  update(rating: number, comment: string): void {
    this.rating = rating;
    this.comment = comment;
    this.updatedAt = new Date();
  }

  // Validate rating
  validateRating(): void {
    if (this.rating < 1 || this.rating > 5) {
      throw new ReviewException("Rating must be between 1 and 5");
    }
  }
}
