const express = require('express');
const app = express();
const storyManager = require('./story-manager');
const Comment = require('./comment');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/stories-list', (req, res) => {
  const sort = 'sort' in req.query ? String(req.query.sort) : 'date-descending';
  const search = 'search' in req.query && req.query.search.length >= 3 ? String(req.query.search) : null;

  if (!(sort in storyManager.sorts)) {
    return res.sendStatus(400);
  }

  return res.status(200).json(storyManager.listStories(sort, search));
});

app.get('/stories/:storyId', function (req, res) {
  const story = req.params.storyId;

  if (story in storyManager.stories) {
    storyManager.stories[story].addView();
    return res.status(200).json(storyManager.stories[story]);
  }

  return res.sendStatus(400);
});

app.get('/stories/:storyId/images/:imageId', function (req, res) {
  const story = req.params.storyId;

  if (!(story in storyManager.stories)) {
    return res.sendStatus(400);
  }

  const imgId = req.params.imageId;
  const img = storyManager.stories[story].getImage(imgId);

  if (!img) {
    return res.sendStatus(400);
  }

  return res
    .set({ 'Content-Type': 'image/png' })
    .status(200)
    .sendFile(process.cwd() + '/' + img);
});

app.post('/stories/:storyId/comment', function (req, res) {
  var author = String(req.body.author);
  var body = String(req.body.body);
  const story = req.params.storyId;

  // Author length: min 1, max 40 (chars)
  if (author.length <= 0 || author.length > 40) {
    return res.status(400).send('Invalid author length!');
  }

  // Body length: min 1, max 240 (chars)
  if (body.length <= 0 || body.length > 240) {
    return res.status(400).send('Invalid comment length!');
  }

  if (!(story in storyManager.stories)) {
    return res.sendStatus(400);
  }

  const cmt = new Comment(author, Date.now(), body);
  storyManager.stories[story].addComment(cmt);
  return res.status(200).json(cmt);
});

module.exports = app;
