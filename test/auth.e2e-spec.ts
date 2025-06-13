import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { App } from 'supertest/types';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = app.get(DataSource);

    // Clear DB between test runs if needed
    await dataSource.query(`DELETE FROM "user";`);

    httpServer = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const res = await request(httpServer)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'securepass',
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('access_token');
    });

    it('should not allow duplicate registration', async () => {
      await request(httpServer)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'anotherpass',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login the user and return token', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securepass',
        })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('access_token');
    });

    it('should reject wrong password', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpass',
        })
        .expect(401);
    });
  });
});
