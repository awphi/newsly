/* eslint-disable no-undef */
const STORY_STEP = 10;

var currentSort = '';
var currentSeach = null;
var storyOpen = null;
var storyCounter = 0;

// TODO comment posting events etc.

Node.prototype.empty = function () {
  while (this.firstChild) {
    this.firstChild.remove();
  }
};

document.querySelector('#comment-btn').onclick = function () {
  const comment = {
    author: document.querySelector('#comment-user-input').value,
    body: document.querySelector('#comment-content-input').value
  };

  ApiClient.commentOnStory(storyOpen, comment)
    .then((res) => {
      if (res.ok) {
        res.json().then((json) => {
          clearCommentFields();
          loadCommentToDOMViewer(json);
        });
      }
    })
    .catch((e) => console.error(e));
};

document.querySelector('#load-more-btn').onclick = function () {
  loadStories(false);
};

document.querySelectorAll('#sort a').forEach((i) => {
  i.onclick = function () {
    currentSort = this.getAttribute('sort-by');

    const b = document.querySelector('#sort button');
    b.empty();

    b.textContent = 'Sort: ' + this.text;
    b.appendChild(this.children[0].cloneNode());

    // Refetch & reload stories
    loadStories(true);
  };
});

// Close the story if anywhere outside the story box is clicked
document.querySelector('#story-viewer-wrapper').onclick = closeStory;

// Stop the click event from bubbling up to the wrapper element
document.querySelector('.story-viewer-box').onclick = function (e) {
  e.cancelBubble = true;
};

// Emulate the search button being pressed on enter
document.querySelector('.search-field').onkeydown = function (e) {
  if (e.keyCode === 13) {
    document.querySelector('.search-btn').click();
  }
};

// Reload the stories when the search button is pressed
document.querySelector('.search-btn').onclick = function () {
  const search = document.querySelector('.search-field').value;
  currentSeach = search === '' ? null : search;
  loadStories(true);
};

// Initially load stories on document open by emulating a change in sort mode
document.querySelector('#sort a[sort-by=date-descending]').click();

function clearCommentFields() {
  document.querySelector('#comment-content-input').value = '';
  document.querySelector('#comment-user-input').value = '';
}

// Function to open a specific story into the viewer using its ID
function openStory(storyId) {
  if (storyOpen !== null) {
    return;
  }

  storyOpen = storyId;

  const viewer = document.querySelector('#story-viewer-wrapper');
  const json = ApiClient.cache[storyId];

  viewer.querySelector('.title').textContent = json.title;
  viewer.querySelector('.subtitle').textContent = json.subtitle;
  viewer.querySelector('.author').textContent = 'by ' + json.author;
  viewer.querySelector('.date').textContent = new Date(json.date).toUTCString();
  viewer.querySelector('.text-body').textContent = json.body;

  const carousel = viewer.querySelector('.carousel-inner');
  carousel.empty();

  for (let i = 0; i < json.images.length; i++) {
    const element = json.images[i];
    const div = document.createElement('div');
    const img = document.createElement('div');

    div.classList.add('carousel-item');
    if (i === 0) {
      div.classList.add('active');
    }

    img.style.backgroundImage = 'url(http://127.0.0.1:3000/stories/' + storyId + '/images/' + element + ')';
    div.appendChild(img);
    carousel.appendChild(div);
  }

  json.comments.forEach((i) => loadCommentToDOMViewer(i));

  clearCommentFields();
  viewer.style.display = null;
  document.querySelector('body').classList.add('modal-open');
}

function loadCommentToDOMViewer(comment) {
  const template = document.getElementById('comment-template');
  const card = document.importNode(template.content, true);
  card.querySelector('.date').textContent = new Date(comment.date).toUTCString();
  card.querySelector('.author').textContent = comment.author;
  card.querySelector('.text-body').textContent = comment.body;
  document.querySelector('#story-viewer-wrapper .comments').appendChild(card);
}

// Close the currently viewed story (if open)
function closeStory() {
  if (storyOpen === null) {
    return;
  }

  storyOpen = null;
  document.querySelector('#story-viewer-wrapper').style.display = 'none';
  document.querySelector('#story-viewer-wrapper .comments').empty();
  document.querySelector('body').classList.remove('modal-open');
}

// Uses the ApiClient to load and then subsequently load the stories to the DOM
function loadStories(dirty = false) {
  document.querySelector('#stories-spinner').style.display = null;
  document.querySelector('#load-more-btn').style.display = 'none';
  document.querySelector('#no-more-stories').style.display = 'none';

  if (dirty) {
    storyCounter = 0;
    document.querySelector('#stories').empty();
  }

  ApiClient.loadStories(currentSort, currentSeach, storyCounter, storyCounter + STORY_STEP)
    .then((stories) => {
      if (stories.length === 0) {
        document.querySelector('#load-more-btn').style.display = 'none';
        document.querySelector('#stories-spinner').style.display = 'none';
        document.querySelector('#no-more-stories').style.display = null;
      } else {
        document.querySelector('#stories-spinner').style.display = 'none';
        document.querySelector('#load-more-btn').style.display = null;
        stories.forEach((i) => {
          loadStoryToDOM(i);
        });
        storyCounter += stories.length;
      }
    })
    .catch((e) => console.error(e));
}

// Loads a story to the DOM using the story-box template and the cached JSON data from the server
function loadStoryToDOM(json) {
  const id = json._id;

  if (json === undefined) {
    return;
  }

  console.log(`Story loading to DOM: ${id}:`, json);

  // Load data from JSON
  const template = document.getElementById('post-card-template');
  const card = document.importNode(template.content, true);
  card.querySelector('.author').textContent = 'by ' + json.author;
  card.querySelector('.date').textContent = new Date(json.date).toUTCString();
  card.querySelector('.title').textContent = json.title;
  card.querySelector('.subtitle').textContent = json.subtitle;
  card.querySelector('.header-image').setAttribute('src', 'http://127.0.0.1:3000/stories/' + id + '/images/' + json.images[0]);
  card.querySelector('.text-body').textContent = json.body + '...';
  card.querySelector('.post-card').setAttribute('story', id);

  const btn = card.querySelector('button');
  const $card = $(card.querySelector('.post-card-wrapper'));
  const $readMore = $(btn);

  btn.onclick = (e) => {
    e.cancelBubble = true;
    const id = e.target.parentElement.querySelector('.post-card').getAttribute('story');
    // Refreshes the story from the server first, then opens it up
    ApiClient.loadStory(id).then(() => openStory(id));
  };

  // jQuery animation for read more (simplest way to implement this seeing as how bootstrap requires jQuery anyways)
  $card.hover(
    () => {
      // On hover
      $card.children().animate(
        {
          opacity: 0.5
        },
        {
          duration: 200,
          queue: false
        }
      );

      $readMore.animate(
        {
          opacity: 1
        },
        {
          duration: 200,
          queue: false
        }
      );
    },
    () => {
      // On unhover
      $card.children().animate(
        {
          opacity: 1
        },
        {
          duration: 200,
          queue: false
        }
      );

      $readMore.animate(
        {
          opacity: 0
        },
        {
          duration: 200,
          queue: false
        }
      );
    }
  );

  document.querySelector('#stories').appendChild(card);
}
