import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { App } from 'supertest/types';

const clearDatabase = async (dataSource: DataSource) => {
  await dataSource.query(`DELETE FROM "user";`);
};

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

    await clearDatabase(dataSource);

    httpServer = app.getHttpServer() as App;
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  const registerUser = () =>
    request(httpServer).post('/auth/register').send({
      email: 'test@example.com',
      password: 'securepass',
    });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const res = await registerUser().expect(HttpStatus.CREATED);
      expect(res.body).toHaveProperty('access_token');
    });

    it('should not allow duplicate registration', async () => {
      await registerUser();
      await request(httpServer)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'anotherpass',
        })
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login the user and return token', async () => {
      await registerUser();
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
      await registerUser();
      await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpass',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
