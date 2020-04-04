const path = require('path');
const Story = require('./story');
const io = require('./io-helper');

const storyManager = {
  stories: {},
  sorts: {
    'date-ascending': (a, b) => storyManager.stories[a].date - storyManager.stories[b].date,
    'date-descending': (a, b) => storyManager.stories[b].date - storyManager.stories[a].date,
    'comments-ascending': (a, b) => storyManager.stories[a].comments.length - storyManager.stories[b].comments.length,
    'comments-descending': (a, b) => storyManager.stories[b].length - storyManager.stories[a].length,
    'popularity-ascending': (a, b) => storyManager.stories[a].views - storyManager.stories[b].views,
    'popularity-descending': (a, b) => storyManager.stories[b].views - storyManager.stories[a].views
  }
};

storyManager.load = function () {
  return new Promise((resolve, reject) => {
    io.promiseDirectoryContents(path.join('data'))
      .then((files) => {
        const promises = [];

        files.forEach((i) => {
          this.stories[i] = new Story(i);
          promises.push(this.stories[i].load());
        });

        Promise.all(promises).finally(() => {
          resolve(this.stories);
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

storyManager.getIndices = function (indices) {
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

storyManager.getSortFromString = function (st) {
  if (st in this.sorts) {
    return this.sorts[st];
  }

  return null;
};

storyManager.keys = function () {
  return Object.keys(this.stories);
};

storyManager.listStories = function (sort, lowerBound, upperBound, search = null) {
  const slice = this.keys()
    .sort(this.sorts[sort])
    .slice(lowerBound, upperBound + 1);
  if (search === null) {
    return slice;
  }

  // Simple, non-case-senstive, linear search of title field, to widen search range increase the indices values
  const result = [];
  slice.forEach((i) => {
    if (this.stories[i].title.toLowerCase().includes(search.toLowerCase())) {
      result.push(i);
    }
  });

  return result;
};

module.exports = storyManager;
