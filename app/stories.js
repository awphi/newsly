const fs = require('fs');
const path = require('path');

// TODO save stories cache + comments back to disk on server shutdown
const stories = {
  cache: {},
  comments: {},
  images: {},
  orders: {},
  sorts: [
    {
      id: 'date-ascending',
      comparator: (a, b) => stories.cache[a].date - stories.cache[b].date
    },
    {
      id: 'date-descending',
      comparator: (a, b) => stories.cache[b].date - stories.cache[a].date
    },
    {
      id: 'comments-ascending',
      comparator: (a, b) => stories.comments[a].length - stories.comments[b].length
    },
    {
      id: 'comments-descending',
      comparator: (a, b) => stories.comments[b].length - stories.comments[a].length
    },
    {
      id: 'popularity-ascending',
      comparator: (a, b) => stories.cache[a].views - stories.cache[b].views
    },
    {
      id: 'popularity-descending',
      comparator: (a, b) => stories.cache[b].views - stories.cache[a].views
    }
  ]
};

stories.getSort = function (st) {
  for (let i = 0; i < this.sorts.length; i++) {
    const s = st.match(this.sorts[i].id);
    if (s !== null && s[0].length === st.length) {
      return st;
    }
  }

  return null;
};

stories.getStories = function (sort, lowerBound, upperBound, search = null) {
  if (search === null) {
    return stories.orders[sort].slice(lowerBound, upperBound + 1);
  }

  // Simple, non-case-senstive, linear search of title field
  const result = [];
  stories.orders[sort].forEach(i => {
    if (stories.cache[i].title.toLowerCase().includes(search.toLowerCase())) {
      result.push(i);
    }
  });

  return result;
};

stories.getIndices = function (indices) {
  const exe = /(\d+)-(\d+)/g.exec(indices);
  if (exe[0].length === indices.length) {
    const a = Number(exe[1]);
    const b = Number(exe[2]);

    // Ensures: non-negative values && return[1] > return[0] && no more than 10 stories at once
    if (a <= b && a >= 0 && b >= 0 && Math.abs(b - a) < 10) {
      return [a, b];
    }
  }

  return null;
};

stories.getJson = function (loc) {
  return new Promise((resolve, reject) => {
    fs.readFile(loc, 'utf8', function (err, contents) {
      // Handling error
      if (err) {
        reject(new Error(err));
      } else {
        resolve(JSON.parse(contents));
      }
    });
  });
};

stories.getImage = function (id, img) {
  if (id in stories.images && img in stories.images[id]) {
    return stories.images[id][img];
  }

  return false;
};

stories.updateImage = function (id, img) {
  const file = path.join('data', id, img + '.png');

  fs.access(file, fs.constants.F_OK, err => {
    if (err) {
      return console.error(`Error encountered when reading image of story ${id}, ${img}: ${err}`);
    }

    if (!(id in stories.images)) {
      stories.images[id] = {};
    }

    stories.images[id][img] = file;
  });
};

stories.updateImages = function (id) {
  stories.cache[id].images.forEach(i => {
    stories.updateImage(id, i);
  });
};

stories.updateComments = function (id) {
  return stories
    .getJson(path.join('data', id, 'comments.json'))
    .then(json => {
      stories.comments[id] = json;
      return json;
    })
    .catch(err => {
      console.error(`Error encountered when reading comments of story ${id}: ${err}`);
    });
};

stories.cacheStory = function (i) {
  return stories
    .getJson(path.join('data', i, 'post.json'))
    .then(json => {
      stories.cache[i] = json;
      return json;
    })
    .catch(err => {
      console.error(`Error encountered when reading story: ${err}`);
    });
};

stories.resort = function () {
  // Sort the stories
  stories.sorts.forEach(i => {
    stories.orders[i.id] = Object.keys(stories.cache).sort(i.comparator);
  });
};

stories.update = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join('data'), function (err, files) {
      if (err) {
        return reject(err);
      }

      const promises = [];

      files.forEach(i => {
        // Cache the story itself
        promises.push(stories.cacheStory(i));
      });

      // Cache the comments
      files.forEach(i => {
        promises.push(stories.updateComments(i));
      });

      // Once all stories + comments are in the cache:
      Promise.all(promises)
        .then(promises => {
          // Update images
          Object.keys(stories.cache).forEach(i => {
            stories.updateImages(i);
          });

          stories.resort();
        })
        .catch(e => {
          console.error(e);
        })
        .finally(() => resolve(stories.cache));
    });
  });
};

module.exports = stories;
