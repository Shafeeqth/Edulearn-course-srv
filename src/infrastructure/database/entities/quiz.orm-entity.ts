import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CourseOrmEntity } from "./course.orm-entity";
import { MCQQuestion } from "src/domain/entities/quiz.entity";

@Entity("quizzes")
export class QuizOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  courseId: string;

  @ManyToOne(() => CourseOrmEntity, (course) => course.quizzes)
  course: CourseOrmEntity;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  timeLimit: number; // in minutes

  @Column()
  passingScore: number; // percentage (0-100)

  @Column("jsonb")
  questions: MCQQuestion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
