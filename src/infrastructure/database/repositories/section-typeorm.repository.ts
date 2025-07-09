import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SectionOrmEntity } from "../entities/section.orm-entity";
import { SectionRepository } from "../../../domain/repositories/section.repository";
import { Section } from "../../../domain/entities/section.entity";
import { RedisService } from "../../redis/redis.service";
import { LoggingService } from "src/infrastructure/observability/logging/logging.service";
import { TracingService } from "src/infrastructure/observability/tracing/trace.service";
import { MetricsService } from "src/infrastructure/observability/metrics/metrics.service";
import { LessonOrmEntity } from "../entities/lesson.orm-entity";
import { Lesson } from "src/domain/entities/lesson.entity";

@Injectable()
export class SectionTypeOrmRepository implements SectionRepository {
  constructor(
    @InjectRepository(SectionOrmEntity)
    private readonly repo: Repository<SectionOrmEntity>,
    private readonly redisService: RedisService,
    private readonly logger: LoggingService,
    private readonly tracer: TracingService,
    private readonly metrics: MetricsService,
  ) {}

  async save(section: Section): Promise<void> {
    return this.tracer.startActiveSpan(
      "SectionTypeOrmRepository.save",
      async (span) => {
        span.setAttributes({
          "db.operation": "INSERT",
          "section.title": section.getTitle(),
        });
        const ormEntity = this.toOrmEntity(section);

        this.metrics.incrementDBRequestCounter("INSERT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "section.save",
          "INSERT",
        );
        await this.repo.save(ormEntity);
        end();

        await Promise.all([
          await this.redisService.del(`section:${section.getId()}`),
          await this.redisService.del(
            `sections:course:${section.getCourseId()}`,
          ),
        ]);
        span.setAttributes({
          "invalidated.cache.keys": `[ section:${section.getId()}, sections:course:${section.getCourseId()} ]`,
        });

        this.logger.debug(`Invalidated cache for section ${section.getId()}`, {
          ctx: SectionTypeOrmRepository.name,
        });
      },
    );
  }

  async findById(id: string): Promise<Section | null> {
    return this.tracer.startActiveSpan(
      "SectionTypeOrmRepository.findById",
      async (span) => {
        span.setAttributes({
          "db.operation": "SELECT",
          "section.id": id,
        });
        const cacheKey = `section:${id}`;
        const cachedSection =
          await this.redisService.get<SectionOrmEntity>(cacheKey);
        if (cachedSection) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(`Cache hit for section ${id}`, {
            ctx: SectionTypeOrmRepository.name,
          });
          return this.toDomainEntity(cachedSection);
        }
        span.setAttribute("cache.hit", false);

        this.metrics.incrementDBRequestCounter("SELECT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "section.findById",
          "SELECT",
        );
        const ormEntity = await this.repo.findOne({
          where: { id, deletedAt: null },
          relations: ["lessons"],
        });
        end();

        if (!ormEntity) {
          span.setAttribute("section.db.found", false);
          return null;
        }

        span.setAttribute("section.db.found", true);
        const section = this.toDomainEntity(ormEntity);
        await this.redisService.set(cacheKey, ormEntity, 3600);
        this.logger.debug(`Cached section ${id}`, {
          ctx: SectionTypeOrmRepository.name,
        });

        span.setAttribute("section.cache.set", true);
        return section;
      },
    );
  }

  async findByCourseId(courseId: string): Promise<Section[]> {
    return this.tracer.startActiveSpan(
      "SectionTypeOrmRepository.findByCourseId",
      async (span) => {
        span.setAttributes({
          "db.operation": "SELECT",
          "course.id": courseId,
        });
        const cacheKey = `sections:course:${courseId}`;
        const cachedSections =
          await this.redisService.get<SectionOrmEntity[]>(cacheKey);
        if (cachedSections) {
          span.setAttribute("cache.hit", true);
          this.logger.debug(`Cache hit for sections of course ${courseId}`, {
            ctx: SectionTypeOrmRepository.name,
          });
          return cachedSections.map(this.toDomainEntity);
        }
        span.setAttribute("cache.hit", false);

        this.metrics.incrementDBRequestCounter("SELECT");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "section.findByCourseId",
          "SELECT",
        );
        const ormEntities = await this.repo.find({
          where: { courseId, deletedAt: null },
          relations: ["lessons"],
        });
        end();

        const sections = ormEntities.map(this.toDomainEntity);
        await this.redisService.set(cacheKey, ormEntities, 3600);
        this.logger.debug(`Cached sections for course ${courseId}`, {
          ctx: SectionTypeOrmRepository.name,
        });
        return sections;
      },
    );
  }

  async delete(section: Section): Promise<void> {
    return this.tracer.startActiveSpan(
      "SectionTypeOrmRepository.delete",
      async (span) => {
        span.setAttributes({
          "db.operation": "INSERT",
          "section.id": section.getId(),
          "section.title": section.getTitle(),
        });
        section.softDelete();
        const ormEntity = this.toOrmEntity(section);

        this.metrics.incrementDBRequestCounter("DELETE");
        // Measure DB operation delay
        const end = this.metrics.measureDBOperationDuration(
          "section.delete",
          "INSERT",
        );
        await this.repo.save(ormEntity);
        end();

        await Promise.all([
          await this.redisService.del(`section:${section.getId()}`),
          await this.redisService.del(
            `sections:course:${section.getCourseId()}`,
          ),
        ]);
        span.setAttributes({
          "invalidated.cache.keys": `[ section:${section.getId()}, sections:course:${section.getCourseId()} ]`,
        });

        this.logger.debug(`Invalidated cache for section ${section.getId()}`, {
          ctx: SectionTypeOrmRepository.name,
        });
      },
    );
  }

  private toOrmEntity(section: Section): SectionOrmEntity {
    const ormEntity = new SectionOrmEntity();
    ormEntity.id = section.getId();
    ormEntity.courseId = section.getCourseId();
    ormEntity.title = section.getTitle();
    ormEntity.lessons = section.getLessons().map((lesson) => {
      const lessonOrm = new LessonOrmEntity();
      lessonOrm.id = lesson.getId();
      lessonOrm.sectionId = lesson.getSectionId();
      lessonOrm.title = lesson.getTitle();
      lessonOrm.content = lesson.getContent();
      lessonOrm.duration = lesson.getDuration();
      lessonOrm.createdAt = lesson.getCreatedAt();
      lessonOrm.updatedAt = lesson.getUpdatedAt();
      lessonOrm.deletedAt = lesson.getDeletedAt();
      return lessonOrm;
    });
    ormEntity.createdAt = section.getCreatedAt();
    ormEntity.updatedAt = section.getUpdatedAt();
    ormEntity.deletedAt = section.getDeletedAt();
    return ormEntity;
  }

  private toDomainEntity(ormEntity: SectionOrmEntity): Section {
    return new Section(
      ormEntity.id,
      ormEntity.courseId,
      ormEntity.title,
      ormEntity.lessons.map(
        (lessonOrm) =>
          new Lesson(
            lessonOrm.id,
            lessonOrm.sectionId,
            lessonOrm.title,
            lessonOrm.content,
            lessonOrm.duration,
            lessonOrm.createdAt,
            lessonOrm.updatedAt,
            lessonOrm.deletedAt,
          ),
      ),
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt,
    );
  }
}
