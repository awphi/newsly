const fs = require('fs');
const { promisify } = require('util');

const pReadFile = promisify(fs.readFile);
const pReadDirectory = promisify(fs.readdir);
const pWriteFile = promisify(fs.writeFile);
const pMkdir = promisify(fs.mkdir);

module.exports = {
  promiseJson: function (loc) {
    return pReadFile(loc, 'utf8').then((content) => JSON.parse(content));
  },
  promiseDirectoryContents: pReadDirectory,
  promiseWriteFile: pWriteFile,
  promiseMkdir: pMkdir
};
