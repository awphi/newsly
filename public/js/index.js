/* eslint-disable no-undef */
const stories = {};

var sort = '';

Node.prototype.empty = function () {
  while (this.firstChild) {
    this.firstChild.remove();
  }
};

document.querySelectorAll('#sort a').forEach(i => {
  i.onclick = function () {
    sort = this.getAttribute('sort-by');

    const b = document.querySelector('#sort button');
    b.empty();

    b.textContent = 'Sort: ' + this.text;
    b.appendChild(this.children[0].cloneNode());

    // Refetch & reload stories
    reloadStories();
  };
});

document.querySelector('.search-field').onkeydown = function (e) {
  if (e.keyCode === 13) {
    document.querySelector('.search-btn').click();
  }
};

document.querySelector('.search-btn').onclick = function () {
  console.log('searching...');
};

document.querySelector('#sort a[sort-by=date-descending]').click();

function reloadStories() {
  document.querySelector('#stories').empty();
  // Fetch the stories
  fetch(`http://127.0.0.1:3000/stories-list/${sort}?indices=0-9`)
    .then(response => response.json())
    .then(results => {
      const promises = [];
      results.forEach(i => {
        if (!(i in stories)) {
          promises.push(requestStory(i));
        } else {
          promises.push(Promise.resolve(stories[i]));
        }
      });
      return promises;
    })
    .then(promises => {
      Promise.all(promises).then(results => {
        results.forEach(i => loadStoryToDOM(i));
      });
    })
    .catch(err => {
      console.error(err);
    });
}

function requestStory(story) {
  console.log(`Story requested: ${story}`);
  return fetch('http://127.0.0.1:3000/stories/' + story)
    .then(response => response.json())
    .then(json => {
      stories[story] = json;
      stories[story].id = story;
      return json;
    })
    .catch(err => {
      console.error(err);
    });
}

function loadStoryToDOM(json) {
  const id = json.id;

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

  const $card = $(card.querySelector('.post-card-wrapper'));
  const $readMore = $(card.querySelector('button'));

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
