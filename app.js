const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// TODO write a timer that re-reads the stories every 5 minutes into some array
// only return the last x stories (chronologically)

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
    fs.readdir(path.join(__dirname, 'data'), function (err, files) {
        // handling error
        if (err) {
            res.status(500);
            return res.send('Error!');
        }

        res.status(200);
        return res.json(files);
    });
});

app.get('/stories/*', function (req, res) {
    const wildcard = req.url.split('/stories/')[1];
    handleJsonRequest(path.join(__dirname, 'data', wildcard, 'post.json'), req, res);
});

app.get('/images/*', function (req, res) {
    const wildcard = req.url.split('/images/')[1];
    const split = wildcard.split('/');
    const file = path.join(__dirname, 'data', split[0], split[1] + '.png');

    fs.access(file, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(500);

            // TODO replace
            return res.send('Error!');
        }

        res.set({ 'Content-Type': 'image/png' });
        res.status(200);
        res.sendFile(file);
    });
});

app.get('/comments/*', function (req, res) {
    const wildcard = req.url.split('/comments/')[1];
    console.log(wildcard);
    handleJsonRequest(path.join(__dirname, 'data', wildcard, 'comments.json'), req, res);
});

function handleJsonRequest (loc, req, res) {
    fs.readFile(loc, 'utf8', function (err, contents) {
        // Handling error
        if (err) {
            res.status(500);

            // TODO replace
            return res.send('Error!');
        }

        res.status(200);

        // Removes line endings
        contents = JSON.stringify(JSON.parse(contents));

        res.json(contents);
    });
}

module.exports = app;
