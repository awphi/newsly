const stories = {}

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
    })


function requestStory(story) {
    // For the life of me can't figure out why this doesn't work when it's not parsed twice...
    fetch('http://127.0.0.1:3000/stories/' + story)
        .then(response => response.text())
        .then(text => JSON.parse(JSON.parse(text)))
        .then(json => stories[story] = json)
        .then(json => loadStoryToDOM(story, json))
        .catch(err => {
            console.error(err);
        });
}

function loadStoryToDOM(id, json) {
    console.log(json);
    const wrapper = document.createElement('div');
    wrapper.classList.add('post-card-wrapper', 'd-flex', 'p-3', 'rounded', 'shadow-sm');

    const div = document.createElement('div');
    div.classList.add('post-card', 'd-flex', 'flex-column');
    div.setAttribute('story', id);

    const titleBox = document.createElement('div');
    titleBox.classList.add('d-flex', 'flex-column', 'w-100');

    const title = document.createElement('h2');
    title.classList.add('m-0');
    title.textContent = json.title;
    titleBox.append(title);


    const author = document.createElement('p');
    author.classList.add('mb-1', 'muted');
    author.textContent = 'by ' + json.author;

    titleBox.append(author);

    const box = document.createElement('div');
    box.classList.add('d-flex', 'flex-row');

    const hr = document.createElement('hr');
    hr.classList.add('mt-0', 'w-100');


    const img = document.createElement('img');
    img.classList.add('post-card-img', 'shadow-sm', 'rounded')
    img.setAttribute('src', 'http://127.0.0.1:3000/images/' + id + '/' + json.images[0]);
    box.append(img);

    const body = document.createElement('p');
    body.classList.add('mb-0')
    body.textContent = json.body.substring(0, 280) + '...';

    const readMore = document.createElement('button');
    readMore.classList.add('read-more-btn', 'btn', 'btn-secondary');
    readMore.textContent = "Read more..."


    box.append(body);

    div.append(titleBox)
    div.append(hr);
    div.append(box);

    wrapper.append(div);
    wrapper.append(readMore);

    const $div = $(div);
    const $readMore = $(readMore);

    $div.hover(() => {
        // On hover
        $div.children().animate({
            opacity: 0.5
        }, {duration: 200, queue: false});

        $readMore.animate({
            opacity: 1
        }, {duration: 200, queue: false});
    },
    () => {
        $div.children().animate({
            opacity: 1
        }, {duration: 200, queue: false});

        $readMore.animate({
            opacity: 0
        }, {duration: 200, queue: false});
    });

    $('#stories').append(wrapper);
}