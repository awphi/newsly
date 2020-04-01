const express = require('express');
const app = express();
const stories = require('./stories');

// TODO control with environment var
const UPDATE_TIME = 300;

// Every 300 seconds (5 minutes) - update the stories into the cache
setInterval(stories.update, UPDATE_TIME * 1000);
stories.update();

// Body Parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

app.get('/stories', (req, res) => {
  const keys = Object.keys(stories.cache);

  if (keys.length === 0) {
    return res.sendStatus(404);
  }

  return res.status(200).json(keys);
});

app.get('/stories/:storyId', function(req, res) {
  const story = req.params.storyId;
  if (story in stories.cache) {
    return res.status(200).json(stories.cache[story]);
  }

  return res.sendStatus(500);
});

app.get('/stories/:storyId/images/:imageId', function(req, res) {
  const img = stories.getImage(req.params.storyId, req.params.imageId);

  if (!img) {
    return res.sendStatus(500);
  }

  return res
    .set({
      'Content-Type': 'image/png'
    })
    .status(200)
    .sendFile(img);
});

app.get('/stories/:storyId/comments', function(req, res) {
  const story = req.params.storyId;
  if (story in stories.comments) {
    return res.status(200).json(stories.comments[story]);
  }

  return res.sendStatus(500);
});

module.exports = app;
