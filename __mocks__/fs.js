// Memory-based file system mock
const { fs, vol } = require('memfs');

const flatData = {
  './test_story_1/post.json':
    '{"title":"Test Story 1 CATDOG","views":13,"subtitle":"Irrelevant subtitle here.","author":"John Doe","date":1583430030752,"comments":[{"author":"Julio Marucci","date":1583430279222,"content":"Refried beans!"}],"body":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","images":["image1","image2"]}',
  './test_story_1/image1.png': 'IMAGEDATA',
  './test_story_1/image2.png': 'IMAGEDATA',
  './test_story_2/post.json':
    '{"title":"Test Story 2","views":2,"subtitle":"Irrelevant subtitle here.","author":"John Doe","comments":[{"author":"Julio Marucci","date":1583430279222,"content":"Refried beans!"}],"date":1580430030752,"body":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","images":["image"]}',
  './test_story_2/image.png': 'IMAGEDATA',
  './test_story_3/post.json':
    '{"title":"Test Story 3","views":14,"subtitle":"Irrelevant subtitle here.","comments":[{"author":"Julio Marucci","date":1583430279222,"content":"Refried beans!"}],"author":"John Doe","date":1283430030752,"body":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","images":["header"]}',
  './test_story_3/header.png': 'IMAGEDATA'
};

vol.fromJSON(flatData, 'data');
module.exports = fs;
