import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { App } from 'supertest/types';
import { Account } from '../src/accounts/entities/account.entity';

describe('Accounts API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtToken: string;
  let httpServer: App;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleRef.get(DataSource);
    await dataSource.synchronize(true);

    httpServer = app.getHttpServer() as App;
  });

  beforeEach(async () => {
    // register a user for testing
    await request(httpServer)
      .post('/auth/register')
      .send({ email: 'frog@bank.com', password: 'secret123' })
      .expect(201);

    const res = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'frog@bank.com', password: 'secret123' })
      .expect(200);
    jwtToken = (res.body as { access_token: string }).access_token;
  });

  afterEach(async () => {
    await dataSource.query(`DELETE FROM "account";`);
    await dataSource.query(`DELETE FROM "user";`);
  });

  afterAll(async () => {
    await app.close();
  });

  const createAccount = () =>
    request(httpServer)
      .post('/accounts')
      .set('Authorization', `Bearer ${jwtToken}`);

  it('should create an account', async () => {
    const res = await createAccount().expect(201);

    expect(res.body).toHaveProperty('accountNumber');
    expect(res.body).toHaveProperty('balance', 0.0);
  });

  it('should return accounts owned by the user', async () => {
    await createAccount();
    const res = await request(httpServer)
      .get('/accounts')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as Account[])[0]).toHaveProperty('accountNumber');
  });

  it('should fail to access accounts without JWT', async () => {
    await request(httpServer).get('/accounts').expect(401);
  });
});
