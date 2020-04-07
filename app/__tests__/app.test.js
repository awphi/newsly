/* eslint-disable no-undef */
const app = require('../app');
const request = require('supertest');
const stories = require('../story-manager');
const mock = require('mock-fs');
const fs = require('fs');

const testData = {
  data: {
    test_story_1: {
      'post.json': JSON.stringify({
        title: 'Test Story 1 CATDOG',
        views: 13,
        subtitle: 'Irrelevant subtitle here.',
        author: 'John Doe',
        date: 1583430030752,
        body:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        images: ['image1', 'image2']
      }),
      'comments.json': JSON.stringify([{ author: 'Julio Marucci', date: 1583430279222, content: 'Refried beans!' }]),
      'image1.png': Buffer.from([0xdeadbeef]),
      'image2.png': Buffer.from([0])
    },
    test_story_2: {
      'post.json': JSON.stringify({
        title: 'Test Story 2',
        views: 2,
        subtitle: 'Irrelevant subtitle here.',
        author: 'John Doe',
        date: 1580430030752,
        body:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        images: ['image']
      }),
      'comments.json': JSON.stringify([{ author: 'Julio Marucci', date: 1483430279222, content: 'Refried beans!' }]),
      'image.png': Buffer.from([0])
    },
    test_story_3: {
      'post.json': JSON.stringify({
        title: 'Test Story 3',
        views: 14,
        subtitle: 'Irrelevant subtitle here.',
        author: 'John Doe',
        date: 1283430030752,
        body:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        images: ['header']
      }),
      'comments.json': JSON.stringify([{ author: 'Julio Marucci', date: 1383430279222, content: 'Refried beans!' }]),
      'header.png': Buffer.from([0])
    }
  }
};

beforeAll(() => {
  mock(testData);
  return stories.load();
});

beforeEach(() => {
  mock(testData);
});

afterEach(() => {
  mock.restore();
});

describe('GET endpoints', () => {
  it('reading data/test_story_1/image1.png gives 0xDEADBEEF (testing mocked fs)', () => {
    const file = fs.readFileSync('data/test_story_1/image1.png');
    expect(file).toEqual(Buffer.from([0xdeadbeef]));
  });

  it('/stories/test_story_1/images/image1 returns PNG 200 (OK)', (done) => {
    request(app).get('/stories/test_story_1/images/image1').expect('Content-Type', 'image/png').expect(200, done);
  });

  it('/stories-list/null returns 400 (bad request)', (done) => {
    request(app).get('/stories-list/null').expect(400, done);
  });

  it('/stories-list 302s (redirects) to /stories-list/date-descending', (done) => {
    request(app).get('/stories-list').expect('Location', '/stories-list/date-descending').expect(302, done);
  });

  it('/stories-list/date-descending returns JSON list', (done) => {
    request(app)
      .get('/stories-list/date-descending')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(typeof res.body).toEqual('object'))
      .expect(200, done);
  });

  it('/stories-list/date-descending?search=CATDOG returns test_story_1 only', (done) => {
    request(app)
      .get('/stories-list/date-descending?search=CATDOG')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body.length).toEqual(1))
      .expect((res) => expect(res.body[0]).toEqual('test_story_1'))
      .expect(200, done);
  });

  it('/stories-list/popularity-descending returns test stories 3, 1 then 2', (done) => {
    request(app)
      .get('/stories-list/popularity-descending')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body).toEqual(['test_story_3', 'test_story_1', 'test_story_2']))
      .expect(200, done);
  });
});
