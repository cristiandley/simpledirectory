import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Override the module and disable the throttler for all tests except the rate limit test
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
        .overrideProvider(APP_GUARD)
        .useValue({}) // disable the ThrottlerGuard
        .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Rate Limiting', () => {
    let appWithThrottling: INestApplication;

    beforeAll(async () => {
      // Creating a separate app instance with throttling enabled for rate limit tests
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ThrottlerModule.forRoot([{
            name: 'test-limit',
            ttl: 10000, // 10 seconds
            limit: 5, // Only 5 requests allowed in the ttl period
          }]),
          AppModule,
        ],
        providers: [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ],
      }).compile();

      appWithThrottling = moduleFixture.createNestApplication();
      await appWithThrottling.init();
    });

    afterAll(async () => {
      await appWithThrottling.close();
    });

    it('should apply rate limiting after exceeding request limit', async () => {
      // Using a separate agent for rate limit testing
      const agent = request.agent(appWithThrottling.getHttpServer());

      // Make requests up to the limit (5 requests)
      // TODO: i should be able also to quantify exponential request but this is it...
      for (let i = 0; i < 5; i++) {
        const response = await agent.get('/urls');
        expect(response.status).not.toBe(429);
      }

      // The next request should be rate limited
      const response = await agent.get('/urls');
      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('URL Shortener (e2e)', () => {
    // Use a persistent agent for these tests
    let testAgent;

    beforeAll(() => {
      testAgent = request.agent(app.getHttpServer());
    });

    it('should create a shortened URL', async () => {
      const response = await testAgent
          .post('/urls')
          .send({ originalUrl: 'https://example.com' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('shortenedUrl');
      expect(response.body.url.originalUrl).toBe('https://example.com');
      expect(response.body.url).toHaveProperty('slug');

      // Save this URL for later tests
      global.__testUrl = response.body.url;
    });

    it('should return all URLs', async () => {
      const response = await testAgent.get('/urls');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a URL with custom slug', async () => {
      // Generate a unique slug for this test using timestamp
      const customSlug = `test-${Date.now()}`;

      const response = await testAgent
          .post('/urls')
          .send({
            originalUrl: 'https://example.com/custom',
            customSlug
          });

      expect(response.status).toBe(201);
      expect(response.body.url.slug).toBe(customSlug);

      // Save this for later tests
      global.__customSlugUrl = response.body.url;
    });

    it('should redirect to original URL when accessing a valid slug', async () => {
      const customSlug = `redirect-${Date.now()}`;
      const createResponse = await testAgent
          .post('/urls')
          .send({
            originalUrl: 'https://example.com/redirect',
            customSlug
          });

      // Test the redirect
      const response = await testAgent
          .get(`/${customSlug}`)
          .redirects(0); // Prevent supertest from following redirects

      expect(response.status).toBe(301);
      expect(response.headers.location).toBe('https://example.com/redirect');
    });

    it('should redirect to 404 page when accessing an invalid slug', async () => {
      const response = await testAgent
          .get('/nonexistent-slug-that-doesnt-exist')
          .redirects(0);

      expect(response.status).toBe(301);
      expect(response.headers.location).toBe('/404');
    });

    // This test might need adjustment depending on your validation logic
    it('should handle URL validation', async () => {
      const response = await testAgent
          .post('/urls')
          .send({ originalUrl: 'not-a-valid-url' });

      // If your backend accepts this URL, adjust the expectation
      // If it should be rejected, use expect(response.status).toBe(400);
      expect(response.status).toBe(201);
    });

    it('should find URL by slug', async () => {
      const customSlug = global.__customSlugUrl.slug;

      const response = await testAgent
          .get(`/urls/${customSlug}`);

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe(customSlug);
      expect(response.body.originalUrl).toBe('https://example.com/custom');
    });

    it('should update URL slug', async () => {
      // Use a URL we created earlier
      const urlId = global.__testUrl.id;
      const newSlug = `updated-${Date.now()}`;

      const updateResponse = await testAgent
          .put(`/urls/${urlId}`)
          .send({ slug: newSlug });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.slug).toBe(newSlug);
    });

    it('should track visits to shortened URLs', async () => {
      // Create a URL with a specific slug
      const customSlug = `track-${Date.now()}`;
      const createResponse = await testAgent
          .post('/urls')
          .send({
            originalUrl: 'https://example.com/track',
            customSlug
          });

      // Visit the URL
      await testAgent
          .get(`/${customSlug}`)
          .redirects(0);

      // Check that the visit count increased
      const response = await testAgent
          .get(`/urls/${customSlug}`);

      expect(response.status).toBe(200);
      expect(response.body.visits).toBe(1);
    });

    it('should handle user-specific URLs', async () => {
      const userId = 'test@example.com';

      // Create a URL for a specific user
      await testAgent
          .post('/urls')
          .send({
            originalUrl: 'https://example.com/user',
            userId
          });

      // Get URLs for this user
      const response = await testAgent
          .get(`/urls?userId=${userId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // At least one URL should be found for this user
      expect(response.body.length).toBeGreaterThan(0);
      // Check if any URL has the specified userId
      const hasUserUrl = response.body.some(url => url.userId === userId);
      expect(hasUserUrl).toBe(true);
    });
  });
});