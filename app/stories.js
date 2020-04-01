const fs = require('fs');
const path = require('path');

const stories = {
  cache: {},
  comments: {},
  images: {}
};

stories.getJson = function(loc) {
  return new Promise((resolve, reject) => {
    fs.readFile(loc, 'utf8', function(err, contents) {
      // Handling error
      if (err) {
        reject(new Error(err));
      } else {
        resolve(JSON.parse(contents));
      }
    });
  });
};

stories.getImage = function(id, img) {
  if (id in stories.images && img in stories.images[id]) {
    return stories.images[id][img];
  }

  return false;
};

stories.updateImage = function(id, img) {
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

stories.updateImages = function(id) {
  stories.cache[id].images.forEach(i => {
    stories.updateImage(id, i);
  });
};

stories.updateComments = function(id) {
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

stories.cacheStory = function(i) {
  return stories
    .getJson(path.join(__dirname, '..', 'data', i, 'post.json'))
    .then(json => {
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

stories.update = function() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, '..', 'data'), function(err, files) {
      if (err) {
        return reject(err);
      }

      const promises = [];

      files.forEach(i => {
        // Cache the story itself
        promises.push(stories.cacheStory(i));
      });

      Promise.all(promises).finally(() => resolve(stories.cache));
    });
  });
};

module.exports = stories;
