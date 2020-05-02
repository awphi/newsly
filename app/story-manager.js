const path = require('path');
const Story = require('./story');
const promiseFs = require('./promise-fs');

const storyManager = {
  stories: {},
  sorts: {
    'date-ascending': (a, b) => storyManager.stories[a].date - storyManager.stories[b].date,
    'date-descending': (a, b) => storyManager.stories[b].date - storyManager.stories[a].date,
    'comments-ascending': (a, b) => storyManager.stories[a].comments.length - storyManager.stories[b].comments.length,
    'comments-descending': (a, b) => storyManager.stories[b].comments.length - storyManager.stories[a].comments.length,
    'popularity-ascending': (a, b) => storyManager.stories[a].views - storyManager.stories[b].views,
    'popularity-descending': (a, b) => storyManager.stories[b].views - storyManager.stories[a].views
  }
};

storyManager.loadStory = function (id, story = new Story(id)) {
  storyManager.stories[id] = story;
  return storyManager.stories[id].load();
};

storyManager.loadAll = function () {
  return promiseFs
    .promiseDirectoryContents(path.join('data'))
    .then((files) => Promise.all(files.map((i) => storyManager.loadStory(i))))
    .catch((err) => {
      console.error(err);
    });
};

storyManager.saveAll = function () {
  // Save all stories and return a composite promise
  return Promise.all(storyManager.keys().map((i) => storyManager.stories[i].save()));
};

storyManager.keys = function () {
  return Object.keys(storyManager.stories);
};

storyManager.listStories = function (sortMode, search = null) {
  // Performance could be obviously improved with caching but out of the scope for this project
  const keys = storyManager.keys().sort(storyManager.sorts[sortMode]);

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
