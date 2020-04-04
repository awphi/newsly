const fs = require('fs');

module.exports = {
  promiseJson: function (loc) {
    return new Promise((resolve, reject) => {
      fs.readFile(loc, 'utf8', function (err, contents) {
        // Handling error
        if (err) {
          reject(new Error(err));
        } else {
          resolve(JSON.parse(contents));
        }
      });
    });
  },
  promiseDirectoryContents: function (loc) {
    return new Promise((resolve, reject) => {
      fs.readdir(loc, function (err, files) {
        if (err) {
          return reject(err);
        }

        return resolve(files);
      });
    });
  }
};
