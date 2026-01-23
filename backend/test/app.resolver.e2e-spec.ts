import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Chance } from 'chance';
import { AppModule } from 'src/app.module';

const chance = new Chance();

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/hello (GET) - should return "Hello World!"', () => {
    return request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect((res) => {
        expect(res.text).toBe('Hello World!');
      });
  });

  it('/hello/:name (GET) - should return "Hello {name}!"', () => {
    const name = chance.name();
    return request(app.getHttpServer())
      .get(`/hello/${name}`)
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain(`Hello ${name}`);
      });
  });
});
