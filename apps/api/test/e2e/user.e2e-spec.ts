import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { createTestApp, type TestContext } from './_setup/create-test-app';

describe('User (e2e)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/users')
        .send({ email: 'new@example.com', name: 'New User' })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String) as unknown,
        email: 'new@example.com',
        name: 'New User',
      });
    });
  });

  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer() as Server)
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /users/me', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/users/me')
        .send({ name: 'Updated Name' })
        .expect(401);
    });
  });

  describe('POST /users/me/onboarding', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/users/me/onboarding')
        .send({ status: 'COMPLETED', interests: ['ai'] })
        .expect(401);
    });
  });
});
