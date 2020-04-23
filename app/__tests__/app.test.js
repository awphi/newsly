/* eslint-disable no-undef */
const app = require('../app');
const request = require('supertest');
const stories = require('../story-manager');

// eslint-disable-next-line no-unused-vars
const fs = require('fs');
jest.mock('fs');

beforeAll(() => {
  return stories.loadAll();
});

describe('GET endpoints', () => {
  it('/stories/test_story_1/images/image1 returns PNG 200 (OK)', (done) => {
    request(app).get('/stories/test_story_1/images/image1').expect('Content-Type', 'image/png').expect(200, done);
  });

  it('/stories-list returns JSON list', (done) => {
    request(app)
      .get('/stories-list')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(typeof res.body).toEqual('object'))
      .expect(200, done);
  });

  it('/stories-list?search=CATDOG returns test_story_1 only', (done) => {
    request(app)
      .get('/stories-list?search=CATDOG')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body.length).toEqual(1))
      .expect((res) => expect(res.body[0]).toEqual('test_story_1'))
      .expect(200, done);
  });

  it('/stories-list?sort=popularity-descending returns test stories 3, 1 then 2', (done) => {
    request(app)
      .get('/stories-list?sort=popularity-descending')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body).toEqual(['test_story_3', 'test_story_1', 'test_story_2']))
      .expect(200, done);
  });
});

describe('POST endpoints', () => {
  it('/stories/test_story_1/comment with no username in body returns 400', (done) => {
    request(app).post('/stories/test_story_1/comment').send({ body: 'Body', author: undefined }).expect(400, done);
  });

  it('/stories/test_story_1/comment with username and body in body returns 200', (done) => {
    request(app).post('/stories/test_story_1/comment').send({ body: 'Body', author: 'Author' }).expect(200, done);
  });
});
