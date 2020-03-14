const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const stories = require('./stories');

// Todo control with environment var?
const UPDATE_TIME = 300;

// Every 300 seconds (5 minutes) - update the stories into the cache
setInterval(stories.update, UPDATE_TIME * 1000);
stories.update();

// Favicon
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// CSS, scripts etc.
app.use(express.static(path.join(__dirname, 'public')));

// Views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

app.get('/', (req, res) => {
    res.status(200);
    return res.render('index', { title: 'Home' });
});

app.get('/submit', (req, res) => {
    res.status(200);
    return res.render('submit', { title: 'Submit Article' });
});

app.get('/stories', (req, res) => {
    res.status(200);
    return res.json(Object.keys(stories.cache) || []);
});

app.get('/stories/:storyId', function (req, res) {
    const story = req.params.storyId;
    if (story in stories.cache) {
        res.status(200);
        return res.json(stories.cache[story]);
    }

    res.status(500);
    return res.send('Error!');
});

app.get('/stories/:storyId/images/:imageId', function (req, res) {
    const img = stories.getImage(req.params.storyId, req.params.imageId);
    if (!img) {
        res.status(500);
        // TODO replace
        return res.send('Error!');
    }

    res.set({ 'Content-Type': 'image/png' });
    res.status(200);
    return res.sendFile(img);
});

app.get('/stories/:storyId/comments', function (req, res) {
    const story = req.params.storyId;
    if (story in stories.comments) {
        res.status(200);
        return res.json(stories.comments[story]);
    }

    res.status(500);
    return res.send('Error!');
});

module.exports = app;
