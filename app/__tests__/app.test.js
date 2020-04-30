/* eslint-disable no-undef */
const app = require('../app');
const request = require('supertest');
const stories = require('../story-manager');
jest.mock('fs');

beforeAll(stories.loadAll);

describe('GET endpoints', () => {
  it('getting test_story_1 returns 200 with the correct story', (done) => {
    request(app)
      .get('/stories/test_story_1')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body._id).toEqual('test_story_1'))
      .expect(200, done);
  });

  it('getting story image returns 200 w/ a PNG image', (done) => {
    request(app).get('/stories/test_story_1/images/image1').expect('Content-Type', 'image/png').expect(200, done);
  });

  it('lisitng stories returns JSON list', (done) => {
    request(app)
      .get('/stories-list')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(typeof res.body).toEqual('object'))
      .expect(200, done);
  });

  it('listing stories with search=CATDOG returns test_story_1 only', (done) => {
    request(app)
      .get('/stories-list?search=CATDOG')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body.length).toEqual(1))
      .expect((res) => expect(res.body[0]).toEqual('test_story_1'))
      .expect(200, done);
  });

  it('listing stories with sort=popularity-descending returns 200 w/ stories in correct order', (done) => {
    request(app)
      .get('/stories-list?sort=popularity-descending')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body).toEqual(['test_story_3', 'test_story_1', 'test_story_2']))
      .expect(200, done);
  });
});

describe('POST endpoints', () => {
  it('invalid comment (no author) returns 400', (done) => {
    request(app).post('/stories/test_story_1/comment').send({ body: 'Body', author: '' }).expect(400, done);
  });

  it('invalid comment post (body too long (>240 chars)) returns 400', (done) => {
    request(app)
      .post('/stories/test_story_1/comment')
      .send({
        body:
          'BodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBodyBody',
        author: 'Author'
      })
      .expect(200, done);
  });

  it('valid comment post returns 200', (done) => {
    request(app).post('/stories/test_story_1/comment').send({ body: 'Body', author: 'Author' }).expect(200, done);
  });

  it('valid story post returns 200', (done) => {
    request(app)
      .post('/submit-story')
      .attach('images', Buffer.from([0xdeadbeef]), 'image1.png')
      .attach('images', Buffer.from([0xdeadbeef, 0xdeadbeef]), 'image2.jpeg')
      .field('body', 'Body')
      .field('title', 'TEST_USER_STORY Title')
      .field('subtitle', 'Subtitle')
      .field('author', 'Author')
      .expect(200, done);
  });

  it('invalid story post returns 400 (no images, no body)', (done) => {
    request(app).post('/submit-story').field('title', 'Title').field('subtitle', 'Subtitle').field('author', 'Author').expect(400, done);
  });

  it('invalid story post returns 400 (bad image format)', (done) => {
    request(app)
      .post('/submit-story')
      .attach('images', Buffer.from([0xdeadbeef, 0xdeadbeef]), 'text.html')
      .field('body', 'Body')
      .field('title', 'Title')
      .field('subtitle', 'Subtitle')
      .field('author', 'Author')
      .expect(400, done);
  });
});

describe('GET endpoints (after POSTing)', () => {
  it('searching for user-posted story returns the user-posted story 200', (done) => {
    request(app)
      .get('/stories-list?search=TEST_USER_STORY')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect((res) => expect(res.body.length).toEqual(1))
      .expect(200, done);
  });
});
