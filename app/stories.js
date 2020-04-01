const fs = require('fs');
const path = require('path');

const stories = {
  cache: {},
  comments: {},
  images: {},
  // Only tracks views this server session - unneeded for the scope of this project to to save back to disk & load from disk
  views: {},
  orders: {},
  sorts: [
    {
      id: 'date-ascending',
      comparator: (a, b) => a.date - b.date
    },
    {
      id: 'date-descending',
      comparator: (a, b) => b.date - a.date
    },
    {
      id: 'comments-ascending',
      comparator: (a, b) => this.comments[a].length - this.comments[b].length
    },
    {
      id: 'comments-descending',
      comparator: (a, b) => this.comments[b].length - this.comments[a].length
    },
    {
      id: 'popularity-ascending',
      comparator: (a, b) => this.views[a] - this.views[b]
    },
    {
      id: 'popularity-descending',
      comparator: (a, b) => this.views[b] - this.views[a]
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
  const file = path.join(__dirname, '..', 'data', id, img + '.png');

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
  stories
    .getJson(path.join(__dirname, '..', 'data', id, 'comments.json'))
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
    .getJson(path.join(__dirname, '..', 'data', i, 'post.json'))
    .then(json => {
      stories.views[i] = 0;
      stories.cache[i] = json;
      return json;
    })
    .then(() => stories.updateImages(i))
    .then(() => {
      // Update the comments if we have no record of them
      if (!(i in stories.comments)) {
        stories.updateComments(i);
      }
    })
    .catch(err => {
      console.error(`Error encountered when reading story: ${err}`);
    });
};

stories.update = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, '..', 'data'), function (err, files) {
      if (err) {
        return reject(err);
      }

      const promises = [];

      files.forEach(i => {
        // Cache the story itself
        promises.push(stories.cacheStory(i));
      });

      Promise.all(promises)
        .then(p => {
          stories.sorts.forEach(i => {
            stories.orders[i.id] = Object.keys(stories.cache).sort(i.comparator);
          });
        })
        .finally(() => resolve(stories.cache));
    });
  });
};

module.exports = stories;
