/* eslint-disable no-undef */
const app = require('./app');
const request = require('supertest');

test('GET / succeeds', () => {
  return request(app).get('/').expect(200);
});

test('GET /stories returns JSON', () => {
  return request(app)
    .get('/stories')
    .expect('Content-type', 'application/json; charset=utf-8');
});
