import { Category, ICategoryRepository } from '@sagepoint/domain';
import type { Category as PrismaCategory } from '@sagepoint/database';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infra/database/prisma.service';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(category: Category): Promise<Category> {
    const saved = await this.prisma.category.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      update: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parentId,
        updatedAt: new Date(),
      },
    });
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const found = await this.prisma.category.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const found = await this.prisma.category.findUnique({ where: { slug } });
    return found ? this.toDomain(found) : null;
  }

  async list(): Promise<Category[]> {
    const found = await this.prisma.category.findMany();
    return found.map((c) => this.toDomain(c));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  private toDomain(model: PrismaCategory): Category {
    return new Category(
      model.id,
      model.name,
      model.slug,
      model.description ?? undefined,
      model.parentId ?? undefined,
      model.createdAt,
      model.updatedAt,
    );
  }
}
