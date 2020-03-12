/* eslint-disable no-undef */
const stories = {};

// Fetch the stories
fetch('http://127.0.0.1:3000/stories')
    .then(response => response.text())
    .then(text => JSON.parse(text))
    .then(stories => {
        stories.forEach((i) => {
            requestStory(i);
        });
    })
    .catch(err => {
        console.error(err);
    });

function requestStory (story) {
    // For the life of me can't figure out why this doesn't work when it's not parsed twice...
    fetch('http://127.0.0.1:3000/stories/' + story)
        .then(response => response.text())
        .then(text => JSON.parse(JSON.parse(text)))
        .then(json => {
            stories[story] = json;
            return json;
        })
        .then(json => loadStoryToDOM(story, json))
        .catch(err => {
            console.error(err);
        });
}

function loadStoryToDOM (id, json) {
    if (json === undefined) {
        return;
    }

    console.log(`Story received: ${id}, loading: `, json);

    // Load data from JSON
    const template = document.getElementById('post-card-template');
    const card = document.importNode(template.content, true);
    card.querySelector('.author').textContent = 'by ' + json.author;
    card.querySelector('.date').textContent = new Date(json.date).toUTCString();
    card.querySelector('.title').textContent = json.title;
    card.querySelector('.subtitle').textContent = json.subtitle;
    card.querySelector('.header-image').setAttribute('src', 'http://127.0.0.1:3000/images/' + id + '/' + json.images[0]);
    card.querySelector('.text-body').textContent = json.body + '...';
    card.querySelector('.post-card').setAttribute('story', id);

    const $card = $(card.querySelector('.post-card-wrapper'));
    const $readMore = $(card.querySelector('button'));

    // Animations
    $card.hover(() => {
        // On hover
        $card.children().animate({
            opacity: 0.5
        }, {
            duration: 200,
            queue: false
        });

        $readMore.animate({
            opacity: 1
        }, {
            duration: 200,
            queue: false
        });
    },
    () => {
        // On unhover
        $card.children().animate({
            opacity: 1
        }, {
            duration: 200,
            queue: false
        });

        $readMore.animate({
            opacity: 0
        }, {
            duration: 200,
            queue: false
        });
    });

    document.querySelector('#stories').appendChild(card);
}
