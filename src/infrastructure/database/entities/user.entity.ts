import {
  Entity,
  Column,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { CourseOrmEntity } from "src/infrastructure/database/entities/course.orm-entity";

@Entity("course_users")
export class UserOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  avatar: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;
  //   // Relation: A user (student) can be enrolled in many courses
  //   @ManyToMany(() => CourseOrmEntity, (course) => course.students)
  //   enrolledCourses: CourseOrmEntity[];

  // Relation: A user (instructor) can create many courses
  @OneToMany(() => CourseOrmEntity, (course) => course.instructor)
  courses: CourseOrmEntity[];

  @UpdateDateColumn()
  updatedAt: Date;
}
