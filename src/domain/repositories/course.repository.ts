import { Course } from "../entities/course.entity";

export abstract class CourseRepository {
  abstract save(course: Course): Promise<void>;
  abstract findById(id: string): Promise<Course | null>;
  abstract findByTitle(title: string): Promise<Course | null>;
  abstract findByInstructorId(
    instructorId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "ASC" | "DESC"
  ): Promise<{ courses: Course[]; total: number }>;
  abstract update(course: Course): Promise<void>;
  abstract delete(course: Course): Promise<void>;
  abstract findByUserId(
    userId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "ASC" | "DESC"
  ): Promise<{ courses: Course[]; total: number }>;
  abstract findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: "ASC" | "DESC"
  ): Promise<{ courses: Course[]; total: number }>;
}

export const COURSE_REPOSITORY = "COURSE_REPOSITORY";
