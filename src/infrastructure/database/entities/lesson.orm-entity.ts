import { Entity, Column, PrimaryColumn, ManyToOne, Index } from "typeorm";
import { SectionOrmEntity } from "./section.orm-entity";

@Entity("lessons")
export class LessonOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  duration: number;

  @Column()
  sectionId: string;

  @ManyToOne(() => SectionOrmEntity, (section) => section.lessons)
  @Index("idx_lesson_section_id") // Index for joining with sections
  section: SectionOrmEntity;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  @Index("idx_lesson_deleted_at")
  deletedAt: Date | null;
}
