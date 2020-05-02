// eslint-disable-next-line no-undef
const { v4 } = require('uuid');
const uuidv4 = v4;
const promiseFs = require('./promise-fs');
const path = require('path');
const favicon = require('serve-favicon');

const express = require('express');
const app = express();

const cors = require('cors');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage()
});

const storyManager = require('./story-manager');
const Comment = require('./comment');
const Story = require('./story');

const ImageRegExp = RegExp('^image/.*$');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

if (process.env.NODE_ENV !== 'test') {
  app.use(favicon(path.join(__dirname, '../public', 'img', 'ico', 'favicon.ico')));
  app.set('views', path.join(__dirname, '../views'));
  app.use(express.static(path.join(__dirname, '../public')));
}

app.set('view engine', 'pug');

// Static page routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/submit', (req, res) => {
  res.render('submit');
});

// API routes
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
  var author = req.body.author ? String(req.body.author) : '';
  var body = req.body.body ? String(req.body.body) : '';
  const story = req.params.storyId;

  // Author length: min 1, max 40 (chars)
  if (author.length <= 0 || author.length > 40) {
    return res.sendStatus(400);
  }

  // Body length: min 1, max 240 (chars)
  if (body.length <= 0 || body.length > 240) {
    return res.sendStatus(400);
  }

  if (!(story in storyManager.stories)) {
    return res.sendStatus(400);
  }

  const cmt = new Comment(author, Date.now(), body);
  storyManager.stories[story].addComment(cmt);
  return res.status(200).json(cmt);
});

app.post('/submit-story', upload.array('images', 10), function (req, res) {
  for (let i = 0; i < req.files.length; i++) {
    const format = req.files[i].mimetype;
    if (!ImageRegExp.test(format)) {
      return res.sendStatus(400);
    }
  }

  var author = req.body.author ? String(req.body.author) : ''; // 40 chars max
  var body = req.body.body ? String(req.body.body) : ''; // 20000 chars max
  var title = req.body.title ? String(req.body.title) : ''; // 80 chars max
  var subtitle = req.body.subtitle ? String(req.body.subtitle) : ''; // 80 chars max

  if (author.length <= 0 || author.length > 40) {
    return res.sendStatus(400);
  }

  if (body.length <= 0 || body.length > 20000) {
    return res.sendStatus(400);
  }

  if (title.length <= 0 || title.length > 80) {
    return res.sendStatus(400);
  }

  if (subtitle.length <= 0 || subtitle.length > 80) {
    return res.sendStatus(400);
  }

  const storyId = uuidv4();
  const story = new Story(storyId);

  story.author = req.body.author;
  story.body = req.body.body;
  story.title = req.body.title;
  story.subtitle = req.body.subtitle;

  storyManager.stories[storyId] = story;

  promiseFs
    .promiseMkdir(story.getPath())
    .then(() =>
      Promise.all(
        req.files.map((file) => {
          const uid = uuidv4();
          story.images.push(uid);
          return promiseFs.promiseWriteFile(story.getImage(uid), file.buffer);
        })
      )
    )
    .then(() => {
      req.files = null;
      res.sendStatus(200);
    })
    .catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
});

module.exports = app;
