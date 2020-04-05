const fs = require('fs');
const { promisify } = require('util');

const pReadFile = promisify(fs.readFile);
const pReadDirectory = promisify(fs.readdir);

module.exports = {
  promiseJson: function (loc) {
    return pReadFile(loc, 'utf8').then((content) => JSON.parse(content));
  },
  promiseDirectoryContents: pReadDirectory
};
