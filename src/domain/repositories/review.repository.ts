import { Review } from "../entities/review.entity";

export abstract class ReviewRepository {
  abstract save(review: Review): Promise<void>;
  abstract delete(review: Review): Promise<void>;
  abstract findById(id: string): Promise<Review | null>;
  abstract findByCourseId(
    courseId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "ASC" | "DESC",
    minRating?: number,
  ): Promise<{ reviews: Review[]; total: number }>;
  abstract findByUserAndCourse(userId: string, courseId: string): Promise<Review | null>;
}
