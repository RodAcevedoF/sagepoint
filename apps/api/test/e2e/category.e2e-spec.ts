import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { createTestApp, type TestContext } from './_setup/create-test-app';
import { Server } from 'http';

describe('Category (e2e)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /categories', () => {
    it('should return an array of categories', async () => {
      await request(app.getHttpServer() as Server)
        .get('/categories')
        .expect(200);
    });
  });

  describe('POST /categories', () => {
    it('should create a category', async () => {
      await request(app.getHttpServer() as Server)
        .post('/categories')
        .send({ name: 'Machine Learning', slug: 'machine-learning' })
        .expect(201);
    });

    it('should reject with missing name', async () => {
      await request(app.getHttpServer() as Server)
        .post('/categories')
        .send({ slug: 'test' })
        .expect(400);
    });

    it('should reject with missing slug', async () => {
      await request(app.getHttpServer() as Server)
        .post('/categories')
        .send({ name: 'Test' })
        .expect(400);
    });

    it('should reject unknown fields', async () => {
      await request(app.getHttpServer() as Server)
        .post('/categories')
        .send({ name: 'Test', slug: 'test', extraField: true })
        .expect(400);
    });
  });
});
