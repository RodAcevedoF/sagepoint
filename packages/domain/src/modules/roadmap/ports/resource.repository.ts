import { Resource } from '../entities/resource.entity';

export const RESOURCE_REPOSITORY = Symbol('RESOURCE_REPOSITORY');

export interface IResourceRepository {
  save(resource: Resource): Promise<Resource>;
  saveMany(resources: Resource[]): Promise<Resource[]>;
  findByRoadmapId(roadmapId: string): Promise<Resource[]>;
  findByConceptId(conceptId: string): Promise<Resource[]>;
  deleteByRoadmapId(roadmapId: string): Promise<void>;
}
