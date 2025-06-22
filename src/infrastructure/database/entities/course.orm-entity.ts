import { Entity, Column, PrimaryColumn, OneToMany, Index } from "typeorm";
import { SectionOrmEntity } from "./section.orm-entity";
import { QuizOrmEntity } from "./quiz.orm-entity";

@Entity("courses")
export class CourseOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  @Index("idx_course_title") // Index for searching by title
  title: string;

  @Column()
  description: string;

  @Column()
  @Index("idx_course_instructor_id") // GIN index for array (created via migration)
  instructorId: string;

  @OneToMany(() => SectionOrmEntity, (section) => section.course, {
    cascade: true,
  })
  sections: SectionOrmEntity[];

  @OneToMany(() => QuizOrmEntity, (quiz) => quiz.course, { cascade: true })
  quizzes: QuizOrmEntity[];

  @Column()
  @Index("idx_course_created_at") // Index for sorting
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  @Index("idx_course_deleted_at") // Index for soft deletion
  deletedAt: Date | null;
}
