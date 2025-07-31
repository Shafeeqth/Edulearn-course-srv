import { EnrollmentStatus } from "src/domain/entities/enrollment.entity";
import { Entity, Column, PrimaryColumn, Index } from "typeorm";

@Entity("enrollments")
export class EnrollmentOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  @Index("idx_enrollment_user_id") // Index for queries by user
  userId: string;

  @Column()
  @Index("idx_enrollment_course_id") // Index for queries by course
  courseId: string;

  @Column()
  createdAt: Date;

  @Column({default: 0, type: "decimal"})
  progress: number;

  @Column({ type: "enum", enum: [EnrollmentStatus] })
  status: EnrollmentStatus;

  @Column({ nullable: true })
  enrolledAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  completedAt: Date

  @Column({ nullable: true })
  @Index("idx_enrollment_deleted_at")
  deletedAt: Date | null;
}
