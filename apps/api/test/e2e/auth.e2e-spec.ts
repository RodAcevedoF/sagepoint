import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { createTestApp, type TestContext } from './_setup/create-test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── POST /auth/register ────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        })
        .expect(201);

      expect(res.body).toEqual({ message: expect.any(String) as unknown });
    });

    it('should reject registration with missing fields', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should reject registration with invalid email', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({ email: 'not-an-email', name: 'Test', password: 'password123' })
        .expect(400);
    });

    it('should reject registration with short password', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({ email: 'short@example.com', name: 'Test', password: '12345' })
        .expect(400);
    });

    it('should reject unknown fields (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({
          email: 'extra@example.com',
          name: 'Test',
          password: 'password123',
          role: 'ADMIN',
        })
        .expect(400);
    });
  });

  // ─── POST /auth/login ──────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' })
        .expect(401);
    });
  });

  // ─── GET /auth/me ──────────────────────────────────────────────────────────

  describe('GET /auth/me', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/auth/me')
        .expect(401);
    });
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/logout')
        .expect(401);
    });
  });

  // ─── POST /auth/refresh ───────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    it('should return 401 without refresh token cookie', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/refresh')
        .expect(401);
    });
  });

  // ─── GET /auth/verify ─────────────────────────────────────────────────────

  describe('GET /auth/verify', () => {
    it('should return 401 for invalid verification token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/auth/verify')
        .query({ token: 'invalid-token' })
        .expect(401);
    });
  });
});
