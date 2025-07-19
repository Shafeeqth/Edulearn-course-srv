import {
  Enrollment,
  EnrollmentStatus,
} from "../../domain/entities/enrollment.entity";

export class EnrollmentDto {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: EnrollmentStatus;
  progress: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  static fromDomain(enrollment: Enrollment): EnrollmentDto {
    const dto = new EnrollmentDto();
    dto.id = enrollment.getId();
    dto.userId = enrollment.getUserId();
    dto.completedAt = enrollment.getCompletedAt();
    dto.progress = enrollment.getProgress();
    dto.courseId = enrollment.getCourseId();
    dto.enrolledAt = enrollment.getEnrolledAt();
    dto.status = enrollment.getStatus();
    dto.createdAt = enrollment.getCreatedAt();
    dto.updatedAt = enrollment.getUpdatedAt();
    dto.deletedAt = enrollment.getDeletedAt();
    return dto;
  }
}
