const path = require('path');
const Story = require('./story');
const promiseFs = require('./promise-fs');

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

storyManager.addStory = function (id) {
  storyManager.stories[id] = new Story(id);
  return storyManager.stories[id].load().catch((e) => console.error(e));
};

storyManager.loadAll = function () {
  return promiseFs
    .promiseDirectoryContents(path.join('data'))
    .then((files) => {
      const promises = [];

      files.forEach((i) => {
        promises.push(storyManager.addStory(i));
      });

      return Promise.all(promises);
    })
    .catch((err) => {
      console.error(err);
    });
};

storyManager.saveAll = function () {
  const promises = [];

  storyManager.keys().forEach((i) => {
    promises.push(storyManager.stories[i].save());
  });

  return Promise.all(promises);
};

storyManager.getSortFromString = function (st) {
  if (st in storyManager.sorts) {
    return storyManager.sorts[st];
  }

  return null;
};

storyManager.keys = function () {
  return Object.keys(storyManager.stories);
};

storyManager.listStories = function (sort, search = null) {
  // Performance could be obviously improved with caching but out of the scope for this project
  const keys = storyManager.keys().sort(storyManager.sorts[sort]);

  if (search === null) {
    return keys;
  }

  // Simple, non-case-senstive, linear search of title field (again obviously improved with caching)
  const result = [];
  keys.forEach((i) => {
    if (storyManager.stories[i].title.toLowerCase().includes(search.toLowerCase())) {
      result.push(i);
    }
  });

  return result;
};

module.exports = storyManager;
