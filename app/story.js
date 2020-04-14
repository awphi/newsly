const path = require('path');
const Comment = require('./comment');
const promiseFs = require('./promise-fs');

module.exports = class Story {
  constructor(id) {
    this._id = id;
    this.comments = [];
  }

  getImage(id) {
    return path.join('data', this._id, id + '.png');
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

  removeComment(comment) {
    this.comments.remove(comment);
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  load() {
    return promiseFs
      .promiseJson(path.join('data', this._id, 'post.json'))
      .then((json) => {
        this.body = json.body;
        this.title = json.title;
        this.author = json.author;
        this.subtitle = json.subtitle;
        this.date = json.date;
        this.images = json.images;
        this.views = json.views;
        json.comments.forEach((i) => {
          this.comments.push(new Comment(i.author, i.date, i.body));
        });
        return this;
      })
      .catch((err) => {
        console.error(`Error encountered when reading story: ${err}`);
      });
  }

  /**
   * Prunes this of all 'volatile' variables - i.e. variables that should not be serialized or deserialized but are computed
   * at runtime.
   */
  generateWritable() {
    const copy = Object.assign({}, this);
    Object.keys(copy).forEach((i) => {
      if (i.startsWith('_')) {
        delete copy[i];
      }
    });

    return copy;
  }

  save() {
    return promiseFs
      .promiseMkdir(path.join('data', this._id), { recursive: true })
      .then(() => {
        return promiseFs.promiseWriteFile(path.join('data', this._id, 'post.json'), JSON.stringify(this.generateWritable()));
      })
      .catch((err) => {
        console.error(`Error encountered when writing story: ${err}`);
      });
  }

  addView() {
    this.views++;
    return this.views;
  }
};
