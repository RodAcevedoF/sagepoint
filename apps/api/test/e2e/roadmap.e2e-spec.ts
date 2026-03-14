import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { createTestApp, type TestContext } from './_setup/create-test-app';

describe('Roadmap (e2e)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /roadmaps/public', () => {
    it('should return an array of public roadmaps', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/roadmaps/public')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /roadmaps/:id', () => {
    it('should return 404 for non-existent roadmap', async () => {
      await request(app.getHttpServer() as Server)
        .get('/roadmaps/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /roadmaps (protected)', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/roadmaps')
        .send({ documentId: 'doc-1' })
        .expect(401);
    });
  });

  describe('POST /roadmaps/from-topic (protected)', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/roadmaps/from-topic')
        .send({ topic: 'Machine Learning' })
        .expect(401);
    });
  });

  describe('GET /roadmaps/user/me (protected)', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/roadmaps/user/me')
        .expect(401);
    });
  });

  describe('PATCH /roadmaps/:id/visibility (protected)', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/roadmaps/some-id/visibility')
        .send({ visibility: 'PUBLIC' })
        .expect(401);
    });
  });

  describe('DELETE /roadmaps/:id (protected)', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/roadmaps/some-id')
        .expect(401);
    });
  });
});
