import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("reviews")
export class ReviewOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  courseId: string;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
