import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("progress")
export class ProgressOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  enrollmentId: string;

  @Column()
  lessonId: string;

  @Column()
  completed: boolean;

  @Column({ nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
