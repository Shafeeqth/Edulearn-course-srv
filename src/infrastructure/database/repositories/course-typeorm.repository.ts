import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CourseOrmEntity } from "../entities/course.orm-entity";
import { CourseRepository } from "../../../domain/repositories/course.repository";
import { Course } from "../../../domain/entities/course.entity";
import { RedisService } from "../../redis/redis.service";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { MetricsService } from "src/infrastructure/observability/metrics/metrics.service";
import { SectionOrmEntity } from "../entities/section.orm-entity";
import { LessonOrmEntity } from "../entities/lesson.orm-entity";
import { QuizOrmEntity } from "../entities/quiz.orm-entity";
import { Section } from "src/domain/entities/section.entity";
import { Lesson } from "src/domain/entities/lesson.entity";
import { Quiz } from "src/domain/entities/quiz.entity";

@Injectable()
export class CourseTypeOrmRepository implements CourseRepository {
  constructor(
    @InjectRepository(CourseOrmEntity)
    private readonly repo: Repository<CourseOrmEntity>,
    private readonly redisService: RedisService,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
    private readonly metrics: MetricsService,
  ) {}

  async save(course: Course): Promise<void> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.save",
      async (span) => {
        span.setAttributes({
          "db.operation": "INSERT",
          "course.title": course.getTitle(),
        });
        const ormEntity = this.toOrmEntity(course);

        this.metrics.incrementDBRequestCounter("INSERT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.save",
          "INSERT",
        );
        await this.repo.save(ormEntity);
        end(); // End the delay calculation

        // Invalidate cache for this course
        const cacheKey = `course:${course.getId()}`;
        this.logger.debug(`Invalidated cache for course ${course.getId()}`, {
          ctx: CourseTypeOrmRepository.name,
        });

        await Promise.allSettled([
          this.redisService.del(cacheKey),
          // Invalidate cache for instructor and user-related queries
          this.redisService.del(
            `courses:instructor:${course.getInstructorId()}`,
          ),
          this.redisService.del(`course:title:${course.getTitle()}`),
        ]);
      },
    );
  }

  async update(course: Course): Promise<void> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.update",
      async (span) => {
        span.setAttributes({
          "db.course.operation": "INSERT",
          "course.title": course.getTitle(),
        });
        const ormEntity = this.toOrmEntity(course);

        this.metrics.incrementDBRequestCounter("INSERT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.update",
          "UPDATE",
        );
        await this.repo.save(ormEntity);
        end(); // End the delay calculation

        // Invalidate cache for this course
        const cacheKey = `course:${course.getId()}`;
        this.logger.debug(`Invalidated cache for course ${course.getId()}`, {
          ctx: CourseTypeOrmRepository.name,
        });

        await Promise.allSettled([
          this.redisService.del(cacheKey),
          // Invalidate cache for instructor and user-related queries
          this.redisService.del(
            `courses:instructor:${course.getInstructorId()}`,
          ),
          this.redisService.del(`course:title:${course.getTitle()}`),
        ]);
      },
    );
  }

  async findById(id: string): Promise<Course | null> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.findById",
      async (span) => {
        span.setAttributes({
          "db.course.operation": "SELECT",
          "course.id": id,
        });
        const cacheKey = `course:${id}`;
        const cachedCourse =
          await this.redisService.get<CourseOrmEntity>(cacheKey);

        if (cachedCourse) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(`Cache hit for course ${id}`, {
            ctx: CourseTypeOrmRepository.name,
          });
          return this.toDomainEntity(cachedCourse);
        }
        span.setAttribute("cache.hit", false);

        this.metrics.incrementDBRequestCounter("SELECT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.findById",
          "SELECT",
        );
        const ormEntity = await this.repo.findOne({
          where: { id, deletedAt: null },
          relations: ["sections", "sections.lessons", "quizzes"],
        });
        end();

        if (!ormEntity) {
          span.setAttribute("course.found", false);
          return null;
        }
        span.setAttribute("course.found", true);

        const course = this.toDomainEntity(ormEntity);
        await this.redisService.set(cacheKey, ormEntity, 3600); // Cache for 1 hour
        this.logger.debug(`Cached course ${id}`, {
          ctx: CourseTypeOrmRepository.name,
        });
        return course;
      },
    );
  }
  async findByTitle(title: string): Promise<Course | null> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.findByTitle",
      async (span) => {
        span.setAttributes({
          "db.course.operation": "SELECT",
          "course.title": title,
        });
        const cacheKey = `course:title:${title}`;
        const cachedCourse =
          await this.redisService.get<CourseOrmEntity>(cacheKey);

        if (cachedCourse) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(`Cache hit for course ${title}`, {
            ctx: CourseTypeOrmRepository.name,
          });
          return this.toDomainEntity(cachedCourse);
        }
        span.setAttribute("cache.hit", false);

        this.metrics.incrementDBRequestCounter("SELECT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.findByTitle",
          "SELECT",
        );
        const ormEntity = await this.repo.findOne({
          where: { title, deletedAt: null },
          relations: ["sections", "sections.lessons", "quizzes"],
        });
        end();

        if (!ormEntity) {
          span.setAttribute("course.found", false);
          return null;
        }
        span.setAttribute("course.found", true);

        const course = this.toDomainEntity(ormEntity);
        await this.redisService.set(cacheKey, ormEntity, 3600); // Cache for 1 hour
        this.logger.debug(`Cached course ${title}`, {
          ctx: CourseTypeOrmRepository.name,
        });
        return course;
      },
    );
  }
  async findByInstructorId(
    instructorId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "ASC" | "DESC" = "ASC",
  ): Promise<{ courses: Course[]; total: number }> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.findByInstructorId",
      async (span) => {
        span.setAttributes({
          "db.course.operation": "SELECT",
          "course.instructor": instructorId,
          "course.page": page,
          "course.sortBy": sortBy,
          "course.sortOrder": sortOrder,
        });

        const cacheKey = `courses:instructor:${instructorId}:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;

        const cachedResult = await this.redisService.get<{
          courses: CourseOrmEntity[];
          total: number;
        }>(cacheKey);
        if (cachedResult) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(
            `Cache hit for courses by instructor ${instructorId}`,
            { ctx: CourseTypeOrmRepository.name },
          );
          const { courses, total } = cachedResult;

          return {
            courses: courses.map(this.toDomainEntity),
            total: total,
          };
        }
        span.setAttribute("cache.hit", false);

        this.metrics.incrementDBRequestCounter("SELECT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.findByInstructorId",
          "SELECT",
        );
        const queryBuilder = this.repo
          .createQueryBuilder("course")
          .where("course.deletedAt IS NULL")
          .andWhere("course.instructorId = :instructorId", {
            instructorId,
          })
          .leftJoinAndSelect("course.sections", "sections")
          .leftJoinAndSelect("sections.lessons", "lessons")
          .leftJoinAndSelect("course.quizzes", "quizzes")
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy(`course.${sortBy}`, sortOrder);
        const [ormEntities, total] = await queryBuilder.getManyAndCount();
        end();

        const courses = ormEntities.map(this.toDomainEntity);
        await this.redisService.set(
          cacheKey,
          { courses: ormEntities, total },
          3600,
        ); // Cache for 1 hour
        this.logger.debug(`Cached courses for instructor ${instructorId}`, {
          ctx: CourseTypeOrmRepository.name,
        });
        span.setAttribute("redis.cache.course.set", true);
        return { courses, total };
      },
    );
  }
  async findAll(
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "ASC" | "DESC" = "ASC",
  ): Promise<{ courses: Course[]; total: number }> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.findAll",
      async (span) => {
        span.setAttributes({
          "db.course.operation": "SELECT",
        });

        const cacheKey = `courses:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;
        const cachedResult = await this.redisService.get<{
          courses: CourseOrmEntity[];
          total: number;
        }>(cacheKey);
        if (cachedResult) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(`Cache hit for courses `, {
            ctx: CourseTypeOrmRepository.name,
          });
          const { courses, total } = cachedResult;
          return { courses: courses.map(this.toDomainEntity), total };
        }
        span.setAttribute("cache.hit", false);

        this.metrics.incrementDBRequestCounter("SELECT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.findAll",
          "SELECT",
        );
        const queryBuilder = this.repo
          .createQueryBuilder("course")
          .where("course.deletedAt IS NULL")
          .leftJoinAndSelect("course.sections", "sections")
          .leftJoinAndSelect("sections.lessons", "lessons")
          .leftJoinAndSelect("course.quizzes", "quizzes")
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy(`course.${sortBy}`, sortOrder);

        const [ormEntities, total] = await queryBuilder.getManyAndCount();
        end();

        const courses = ormEntities.map(this.toDomainEntity);
        await this.redisService.set(
          cacheKey,
          { courses: ormEntities, total },
          3600,
        ); // Cache for 1 hour
        this.logger.debug(`Cached courses `, {
          ctx: CourseTypeOrmRepository.name,
        });
        span.setAttribute("redis.cache.course.set", true);
        return { courses, total };
      },
    );
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "ASC" | "DESC" = "ASC",
  ): Promise<{ courses: Course[]; total: number }> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.findByUserId",
      async (span) => {
        span.setAttributes({
          "db.course.operation": "SELECT",
          "course.user.id": userId,
        });
        const cacheKey = `courses:user:${userId}:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;
        const cachedResult = await this.redisService.get<{
          courses: CourseOrmEntity[];
          total: number;
        }>(cacheKey);
        if (cachedResult) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(`Cache hit for courses by user ${userId}`, {
            ctx: CourseTypeOrmRepository.name,
          });
          const { courses, total } = cachedResult;
          return { courses: courses.map(this.toDomainEntity), total };
        }
        span.setAttribute("cache.hit", false);

        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.findByUserId",
          "SELECT",
        );
        const queryBuilder = this.repo
          .createQueryBuilder("course")
          .innerJoin(
            "course_enrollments",
            "enrollment",
            "enrollment.courseId = course.id",
          )
          .where("course.deletedAt IS NULL")
          .andWhere("enrollment.userId = :userId", { userId })
          .leftJoinAndSelect("course.sections", "sections")
          .leftJoinAndSelect("sections.lessons", "lessons")
          .leftJoinAndSelect("course.quizzes", "quizzes")
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy(`course.${sortBy}`, sortOrder);

        const [ormEntities, total] = await queryBuilder.getManyAndCount();

        end();
        this.metrics.incrementDBRequestCounter("SELECT");

        const courses = ormEntities.map(this.toDomainEntity);
        await this.redisService.set(
          cacheKey,
          { courses: ormEntities, total },
          3600,
        ); // Cache for 1 hour
        this.logger.debug(`Cached courses for user ${userId}`, {
          ctx: CourseTypeOrmRepository.name,
        });
        span.setAttribute("redis.cache.course.set", true);
        return { courses, total };
      },
    );
  }

  async delete(course: Course): Promise<void> {
    return this.tracer.startActiveSpan(
      "CourseTypeOrmRepository.delete",
      async (span) => {
        course.softDelete();

        span.setAttributes({
          "db.operation": "DELETE",
          "course.id": course.getId(),
        });
        const ormEntity = this.toOrmEntity(course);

        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "course.save",
          "DELETE",
        );
        await this.repo.save(ormEntity);
        end();
        this.metrics.incrementDBRequestCounter("DELETE");
        span.setAttribute("course.deleted", true);

        await Promise.all([
          this.redisService.del(
            `courses:instructor:${course.getInstructorId()}`,
          ),
          this.redisService.del(`course:${course.getId()}`),
          this.redisService.del(`course:title:${course.getTitle()}`),
        ]);

        span.setAttribute(
          "cache.invalidated.keys",
          `[courses:instructor:${course.getInstructorId()}, course:${course.getId()}, course:title:${course.getTitle()}]`,
        );
        this.logger.debug(`Invalidated cache for course ${course.getId()}`, {
          ctx: CourseTypeOrmRepository.name,
        });
      },
    );
  }

  private toOrmEntity(course: Course): CourseOrmEntity {
    const ormEntity = new CourseOrmEntity();
    ormEntity.id = course.getId();
    ormEntity.title = course.getTitle();
    ormEntity.description = course.getDescription();
    ormEntity.instructorId = course.getInstructorId();
    ormEntity.sections = course.getSections().map((section) => {
      const sectionOrm = new SectionOrmEntity();
      sectionOrm.id = section.getId();
      sectionOrm.courseId = section.getCourseId();
      sectionOrm.title = section.getTitle();
      sectionOrm.lessons = section.getLessons().map((lesson) => {
        const lessonOrm = new LessonOrmEntity();
        lessonOrm.id = lesson.getId();
        lessonOrm.sectionId = lesson.getSectionId();
        lessonOrm.title = lesson.getTitle();
        lessonOrm.content = lesson.getContent();
        lessonOrm.duration = lesson.getDuration();
        lessonOrm.createdAt = lesson.getCreatedAt();
        lessonOrm.updatedAt = lesson.getUpdatedAt();
        return lessonOrm;
      });
      sectionOrm.createdAt = section.getCreatedAt();
      sectionOrm.updatedAt = section.getUpdatedAt();
      return sectionOrm;
    });
    ormEntity.quizzes = course.getQuizzes().map((quiz) => {
      const quizOrm = new QuizOrmEntity();
      quizOrm.id = quiz.getId();
      quizOrm.courseId = quiz.getCourseId();
      quizOrm.title = quiz.getTitle();
      quizOrm.questions = quiz.getQuestions();
      quizOrm.createdAt = quiz.getCreatedAt();
      quizOrm.updatedAt = quiz.getUpdatedAt();
      return quizOrm;
    });
    ormEntity.createdAt = course.getCreatedAt();
    ormEntity.updatedAt = course.getUpdatedAt();
    ormEntity.deletedAt = course.getDeletedAt();
    return ormEntity;
  }

  private toDomainEntity(ormEntity: CourseOrmEntity): Course {
    return new Course(
      ormEntity.id,
      ormEntity.title,
      ormEntity.description,
      ormEntity.instructorId,
      ormEntity.sections.map(
        (sectionOrm) =>
          new Section(
            sectionOrm.id,
            sectionOrm.courseId,
            sectionOrm.title,
            sectionOrm.lessons.map(
              (lessonOrm) =>
                new Lesson(
                  lessonOrm.id,
                  lessonOrm.sectionId,
                  lessonOrm.title,
                  lessonOrm.content,
                  lessonOrm.duration,
                  lessonOrm.createdAt,
                  lessonOrm.updatedAt,
                ),
            ),
            sectionOrm.createdAt,
            sectionOrm.updatedAt,
          ),
      ),
      ormEntity.quizzes.map(
        (quizOrm) =>
          new Quiz(
            quizOrm.id,
            quizOrm.courseId,
            quizOrm.title,
            quizOrm.questions,
            quizOrm.createdAt,
            quizOrm.updatedAt,
          ),
      ),
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt,
    );
  }
}
