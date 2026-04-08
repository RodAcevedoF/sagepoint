import type { ResourceLimits } from "../entities/resource-limits.entity";

export const RESOURCE_LIMITS_REPOSITORY = Symbol("RESOURCE_LIMITS_REPOSITORY");

export interface IResourceLimitsRepository {
  findByUserId(userId: string): Promise<ResourceLimits | null>;
  save(limits: ResourceLimits): Promise<void>;
}
