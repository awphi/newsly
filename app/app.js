const express = require('express');
const app = express();
const stories = require('./stories');

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
  // Default sort is date descending (newest to oldest)
  return res.redirect('/stories-list/date-descending');
});

app.get('/stories-list/:sort', (req, res) => {
  const indices = stories.getIndices('indices' in req.query ? String(req.query.indices) : '0-9');
  const sort = stories.getSortFromString(String(req.params.sort));
  var search = 'search' in req.query ? String(req.query.search) : null;

  if (search !== null && search.length < 3) {
    search = null;
  }

  if (sort === null || indices === null) {
    return res.sendStatus(400);
  }

  return res.status(200).json(stories.listStories(req.params.sort, indices[0], indices[1], search));
});

app.get('/stories/:storyId', function (req, res) {
  const story = req.params.storyId;

  if (story in stories.stories) {
    stories.stories[story].addView();
    return res.status(200).json(stories.stories[story]);
  }

  return res.sendStatus(400);
});

app.get('/stories/:storyId/images/:imageId', function (req, res) {
  const story = req.params.storyId;
  const imgId = req.params.imageId;
  const img = stories.stories[story].getImage(imgId);

  if (!img) {
    return res.sendStatus(400);
  }

  return res.set({ 'Content-Type': 'image/png' }).status(200).sendFile(img);
});

module.exports = app;
