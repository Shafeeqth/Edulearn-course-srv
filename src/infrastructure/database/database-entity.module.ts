import { Module } from "@nestjs/common";
import { CourseOrmEntity } from "./entities/course.orm-entity";
import { SectionOrmEntity } from "./entities/section.orm-entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppConfigService } from "../config/config.service";
import { LessonOrmEntity } from "./entities/lesson.orm-entity";
import { QuizOrmEntity } from "./entities/quiz.orm-entity";
import { EnrollmentOrmEntity } from "./entities/enrollment.orm-entity";
import { ProgressOrmEntity } from "./entities/progress.orm-entity";
import { ReviewOrmEntity } from "./entities/review.entity";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: AppConfigService) => ({
        type: "postgres",
        host: configService.databaseHost,
        port: Number(configService.databasePort),
        username: configService.databaseUsername,
        password: configService.databasePassword,
        database: configService.databaseName,
        autoLoadEntities: true, // Auto load entities registered with @Entity()
        synchronize: configService.nodeEnv !== "production", // Auto schema sync (dev only!)
        logging: configService.nodeEnv !== "production" && ["error"], // Auto schema sync (dev only!)
        poolSize: 10, // Maximum number of connections in the pool
        extra: {
          max: 50, // Maximum number of connections
          min: 5, // Minimum number of connections to keep alive
          idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
          connectionTimeoutMillis: 2000, // Timeout for acquiring a connection
        },
      }),
      inject: [AppConfigService],
    }),
    TypeOrmModule.forFeature([
      CourseOrmEntity,
      SectionOrmEntity,
      LessonOrmEntity,
      QuizOrmEntity,
      EnrollmentOrmEntity,
      ProgressOrmEntity,
      ReviewOrmEntity,
    ]),
  ],
  providers: [
    CourseOrmEntity,
    SectionOrmEntity,
    LessonOrmEntity,
    QuizOrmEntity,
    EnrollmentOrmEntity,
    ProgressOrmEntity,
    ReviewOrmEntity,
  ],
  exports: [
    TypeOrmModule,
    CourseOrmEntity,
    SectionOrmEntity,
    LessonOrmEntity,
    QuizOrmEntity,
    EnrollmentOrmEntity,
    ProgressOrmEntity,
    ReviewOrmEntity,
  ],
})
export class DatabaseEntityModule {}
