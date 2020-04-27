const fs = require('fs');
const { promisify } = require('util');

module.exports = {
  promiseFileContent: promisify(fs.readFile),
  promiseJson: function (loc) {
    return this.promiseFileContent(loc, 'utf8').then((content) => JSON.parse(content));
  },
  promiseDirectoryContents: promisify(fs.readdir),
  promiseWriteFile: promisify(fs.writeFile),
  promiseMkdir: promisify(fs.mkdir)
};
