/**
 * Full authenticated flow e2e tests.
 *
 * Tests the complete lifecycle: register → verify → login → use protected
 * endpoints → refresh → logout. Exercises controllers, guards, pipes, filters,
 * and cookie handling as a real client would.
 */
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { createTestApp, type TestContext } from './_setup/create-test-app';

describe('Auth flow (e2e)', () => {
  let app: INestApplication;
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register → verify → login → me → refresh → logout', () => {
    const user = {
      email: 'flow@example.com',
      name: 'Flow User',
      password: 'secure123',
    };

    it('step 1: register a new user', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(user)
        .expect(201);

      expect((res.body as Record<string, unknown>).message).toBeDefined();
    });

    it('step 2: verify email with token from email service', async () => {
      const sentEmail = ctx.fakes.emailService.sentEmails.find(
        (e) => e.email === user.email,
      );
      expect(sentEmail).toBeDefined();

      const res = await request(app.getHttpServer() as Server)
        .get('/auth/verify')
        .query({ token: sentEmail!.token })
        .expect(200);

      expect((res.body as Record<string, unknown>).message).toBeDefined();
    });

    let accessToken: string;
    let cookies: string[];

    it('step 3: login with credentials', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(201);

      const body = res.body as {
        accessToken: string;
        refreshToken: string;
        user: { email: string; name: string };
      };
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
      expect(body.user).toMatchObject({
        email: user.email,
        name: user.name,
      });

      accessToken = body.accessToken;
      cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
    });

    it('step 4: access protected endpoint (GET /auth/me) with Bearer token', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        email: user.email,
        name: user.name,
      });
    });

    it('step 5: access protected endpoint via cookie', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/auth/me')
        .set('Cookie', cookies)
        .expect(200);

      expect((res.body as Record<string, unknown>).email).toBe(user.email);
    });

    it('step 6: refresh token', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/refresh')
        .set('Cookie', cookies)
        .expect(201);

      const body = res.body as {
        accessToken: string;
        refreshToken: string;
        user: { email: string };
      };
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
      expect(body.user).toMatchObject({ email: user.email });

      // Update cookies for next requests
      cookies = res.headers['set-cookie'] as unknown as string[];
      accessToken = body.accessToken;
    });

    it('step 7: logout', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect((res.body as Record<string, unknown>).message).toBe(
        'Logged out successfully',
      );
    });
  });

  describe('validation edge cases', () => {
    it('should return 409 when registering duplicate email', async () => {
      const user = {
        email: 'dupe@example.com',
        name: 'First',
        password: 'password123',
      };

      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(user)
        .expect(201);

      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(user)
        .expect(409);
    });

    it('should return 401 with expired/invalid bearer token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });
  });
});
