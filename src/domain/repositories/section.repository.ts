import { Section } from "../entities/section.entity";

export abstract class SectionRepository {
  abstract save(section: Section): Promise<void>;
  abstract findById(id: string): Promise<Section | null>;
  abstract findByCourseId(courseId: string): Promise<Section[]>;
  abstract delete(section: Section): Promise<void>;
}
