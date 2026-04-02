import {
  connectPrisma,
  disconnectPrisma,
  cleanDatabase,
  getPrismaClient,
} from './_setup/prisma-test-client';
import { PrismaCategoryRepository } from '@sagepoint/database';
import { Category } from '@sagepoint/domain';

describe('PrismaCategoryRepository (integration)', () => {
  let repo: PrismaCategoryRepository;

  const NOW = new Date('2026-01-01');

  function buildCategory(overrides: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return new Category(
      overrides.id,
      overrides.name,
      overrides.slug,
      overrides.description,
      overrides.parentId,
      overrides.createdAt ?? NOW,
      overrides.updatedAt ?? NOW,
    );
  }

  beforeAll(async () => {
    await connectPrisma();
    repo = new PrismaCategoryRepository(getPrismaClient());
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('save + findById', () => {
    it('creates a new category and retrieves it', async () => {
      const cat = buildCategory({
        id: '00000000-0000-0000-0000-00000000ca01',
        name: 'Web Dev',
        slug: 'web-dev',
        description: 'Frontend & backend',
      });

      await repo.save(cat);
      const found = await repo.findById('00000000-0000-0000-0000-00000000ca01');

      expect(found).not.toBeNull();
      expect(found!.name).toBe('Web Dev');
      expect(found!.slug).toBe('web-dev');
      expect(found!.description).toBe('Frontend & backend');
    });

    it('updates an existing category on second save', async () => {
      const cat = buildCategory({
        id: '00000000-0000-0000-0000-00000000ca01',
        name: 'Web Dev',
        slug: 'web-dev',
      });
      await repo.save(cat);

      const updated = buildCategory({
        id: '00000000-0000-0000-0000-00000000ca01',
        name: 'Web Development',
        slug: 'web-dev',
      });
      await repo.save(updated);

      const found = await repo.findById('00000000-0000-0000-0000-00000000ca01');
      expect(found!.name).toBe('Web Development');
    });
  });

  describe('findBySlug', () => {
    it('returns category by slug', async () => {
      await repo.save(
        buildCategory({
          id: '00000000-0000-0000-0000-00000000ca01',
          name: 'ML',
          slug: 'machine-learning',
        }),
      );

      const found = await repo.findBySlug('machine-learning');
      expect(found).not.toBeNull();
      expect(found!.id).toBe('00000000-0000-0000-0000-00000000ca01');
    });

    it('returns null for non-existent slug', async () => {
      const found = await repo.findBySlug('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('list', () => {
    it('returns all categories', async () => {
      await repo.save(
        buildCategory({
          id: '00000000-0000-0000-0000-00000000ca01',
          name: 'A',
          slug: 'a',
        }),
      );
      await repo.save(
        buildCategory({
          id: '00000000-0000-0000-0000-00000000ca02',
          name: 'B',
          slug: 'b',
        }),
      );

      const all = await repo.list();
      expect(all).toHaveLength(2);
    });

    it('returns empty array when no categories exist', async () => {
      const all = await repo.list();
      expect(all).toEqual([]);
    });
  });

  describe('delete', () => {
    it('removes a category', async () => {
      await repo.save(
        buildCategory({
          id: '00000000-0000-0000-0000-00000000ca01',
          name: 'X',
          slug: 'x',
        }),
      );

      await repo.delete('00000000-0000-0000-0000-00000000ca01');

      const found = await repo.findById('00000000-0000-0000-0000-00000000ca01');
      expect(found).toBeNull();
    });
  });
});
