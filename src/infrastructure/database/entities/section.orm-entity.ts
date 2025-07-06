import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { CourseOrmEntity } from "./course.orm-entity";
import { LessonOrmEntity } from "./lesson.orm-entity";

@Entity("sections")
export class SectionOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  courseId: string;

  @ManyToOne(() => CourseOrmEntity, (course) => course.sections)
  @Index("idx_section_course_id") // Index for joining with courses
  course: CourseOrmEntity;

  @OneToMany(() => LessonOrmEntity, (lesson) => lesson.section, {
    cascade: true,
  })
  lessons: LessonOrmEntity[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  @Index("idx_section_deleted_at")
  deletedAt: Date | null;
}
