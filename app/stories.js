const fs = require('fs');
const path = require('path');
const stories = {};

stories.cache = {};
stories.comments = {};
stories.images = {};

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
      console.log(
        `Error encountered when reading image of story ${id}, ${img}: ${err}`
      );
      return;
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
    .catch(err =>
      console.log(
        `Error encountered when reading comments of story ${id}: ${err}`
      )
    );
};

stories.update = function() {
  fs.readdir(path.join(__dirname, '..', 'data'), function(err, files) {
    if (err) {
      return;
    }

    files.forEach(i => {
      // Cache the story itself
      stories
        .getJson(path.join(__dirname, '..', 'data', i, 'post.json'))
        .then(json => {
          stories.cache[i] = json;
          return json;
        })
        .then(() => stories.updateImages(i))
        .catch(err =>
          console.log(`Error encountered when reading story: ${err}`)
        );

      // Update the comments if we have no record of them - otherwise posting a new comment forces an update
      if (!(i in stories.comments)) {
        stories.updateComments(i);
      }
    });
  });
};

module.exports = stories;
