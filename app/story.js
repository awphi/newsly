const fs = require('fs');
const path = require('path');
const Comment = require('./comment');
const promiseFs = require('./promise-fs');

module.exports = class Story {
  constructor(id) {
    this.images = {};
    this.id = id;
    this.comments = [];
  }

  get views() {
    return this._views;
  }

  getImage(id) {
    return this.images[id];
  }

  loadImage(img) {
    const file = path.join('data', this.id, img + '.png');
    return fs.access(file, fs.constants.F_OK, (err) => {
      if (err) {
        return console.error(`Error encountered when reading image of story ${this.id}, ${img}: ${err}`);
      }

      this.images[img] = file;
    });
  }

  loadImages() {
    return this._imageIds.forEach((i) => {
      this.loadImage(i);
    });
  }

  loadComments() {
    return promiseFs
      .promiseJson(path.join('data', this.id, 'comments.json'))
      .then((json) => {
        this.comments.push(new Comment(json.author, json.date, json.body));
        return json;
      })
      .catch((err) => {
        console.error(`Error encountered when reading comments of story ${this.id}: ${err}`);
      });
  }

  loadContent() {
    return promiseFs
      .promiseJson(path.join('data', this.id, 'post.json'))
      .then((json) => {
        this.body = json.body;
        this.title = json.title;
        this.author = json.author;
        this.subtitle = json.subtitle;
        this.date = json.date;
        this._imageIds = json.images;
        this._views = json.views;
        return this;
      })
      .catch((err) => {
        console.error(`Error encountered when reading story: ${err}`);
      });
  }

  removeComment(comment) {
    this.comments.remove(comment);
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  save() {
    // TODO Save to disk
  }

  load() {
    return Promise.all([this.loadContent(), this.loadComments()]).then(() => {
      this.loadImages();
    });
  }

  addView() {
    this._views++;
    return this._views;
  }
};
