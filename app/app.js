const express = require('express');
const app = express();
const storyManager = require('./story-manager');

// Body Parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);

// Handle CORS
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.get('/stories-list', (req, res) => {
  const sort = 'sort' in req.query ? storyManager.getSortFromString(String(req.query.sort)) : 'date-descending';
  const search = 'search' in req.query && req.query.search.length >= 3 ? String(req.query.search) : null;

  if (sort === null || search === null) {
    return res.sendStatus(400);
  }

  return res.status(200).json(storyManager.listStories(req.params.sort, search));
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

module.exports = app;
