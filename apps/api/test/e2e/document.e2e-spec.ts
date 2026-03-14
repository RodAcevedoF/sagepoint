import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { createTestApp, type TestContext } from './_setup/create-test-app';

describe('Document (e2e)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /documents', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/documents')
        .expect(401);
    });
  });

  describe('GET /documents/user/me', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/documents/user/me')
        .expect(401);
    });
  });

  describe('POST /documents', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/documents')
        .expect(401);
    });
  });

  describe('GET /documents/:id', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/documents/some-id')
        .expect(401);
    });
  });

  describe('DELETE /documents/:id', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/documents/some-id')
        .expect(401);
    });
  });
});
