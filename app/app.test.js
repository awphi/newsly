/* eslint-disable no-undef */
const app = require('./app');
const request = require('supertest');
const stories = require('./stories');

beforeAll(stories.update);

describe('GET endpoints', () => {
  it('/stories returns JSON', async done => {
    request(app)
      .get('/stories')
      .expect('Content-type', 'application/json; charset=utf-8')
      .expect(res => expect(typeof res.body).toEqual('object'))
      .expect(200, done);
  });
});
