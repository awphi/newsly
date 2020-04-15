/* eslint-disable no-undef */
var currentSort = '';
var currentSeach = null;
var isStoryOpen = false;

Node.prototype.empty = function () {
  while (this.firstChild) {
    this.firstChild.remove();
  }
};

document.querySelectorAll('#sort a').forEach((i) => {
  i.onclick = function () {
    currentSort = this.getAttribute('sort-by');

    const b = document.querySelector('#sort button');
    b.empty();

    b.textContent = 'Sort: ' + this.text;
    b.appendChild(this.children[0].cloneNode());

    // Refetch & reload stories
    reloadStories();
  };
});

document.querySelector('#outside-area').onclick = closeStory;

document.querySelector('.search-field').onkeydown = function (e) {
  if (e.keyCode === 13) {
    document.querySelector('.search-btn').click();
  }
};

document.querySelector('.search-btn').onclick = function () {
  const search = document.querySelector('.search-field').value;
  currentSeach = search === '' ? null : search;
  reloadStories();
};

document.querySelector('#sort a[sort-by=date-descending]').click();

function openStory(storyId) {
  if (isStoryOpen) {
    return;
  }

  isStoryOpen = true;

  const viewer = document.querySelector('#story-viewer');
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

  viewer.style.display = 'block';
  // TODO dim outside area + stop scrolling of outside area
}

function closeStory(story) {
  if (!isStoryOpen) {
    return;
  }

  isStoryOpen = false;
  document.querySelector('#story-viewer').style.display = 'none';
}

function reloadStories() {
  ApiClient.loadStories(currentSort, currentSeach).then((stories) => {
    document.querySelector('#stories').empty();
    stories.forEach((i) => {
      loadStoryToDOM(i);
    });
  });
}

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
    openStory(e.target.parentElement.querySelector('.post-card').getAttribute('story'));
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
