// eslint-disable-next-line no-undef
const fs = jest.genMockFromModule('fs');
const path = require('path');
var mockFiles = {};

fs.__setMockFiles = function (data) {
  mockFiles = data;
};

fs.__getMockFile = function (loc) {
  const split = loc.split(path.sep);
  var c = mockFiles;

  for (let i = 0; i < split.length; i++) {
    const el = split[i];
    if (el in c) {
      c = c[el];
    } else {
      return null;
    }
  }

  return c;
};

fs.__exists = function (file) {
  return file === null ? new Error('File: ' + file + " doesn't exist.") : null;
};

fs.__isDir = function (file) {
  return typeof file !== 'object' ? new Error('File: ' + file + ' is not a directory.') : null;
};

fs.readFile = function (loc, encoding, callback) {
  const file = fs.__getMockFile(loc);
  return callback(fs.__exists(file), file);
};

fs.readFile = function (loc, encoding, callback) {
  const file = fs.__getMockFile(loc);
  return callback(fs.__exists(file), file);
};

fs.access = function (loc, con, callback) {
  const file = fs.__getMockFile(loc);
  return callback(fs.__exists(file));
};

fs.readdir = function (loc, callback) {
  const file = fs.__getMockFile(loc);
  return callback(fs.__exists(file) || fs.__isDir(file), Object.keys(file));
};

module.exports = fs;
