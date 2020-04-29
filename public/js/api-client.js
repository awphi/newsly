/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
const ApiClient = {
  cache: {},
  loaded: function () {
    return Object.keys(this.cache).filter((a) => this.cache[a] !== undefined);
  },
  commentOnStory: function (id, comment) {
    console.log(`Commenting on story: ${id}`, comment);
    return fetch(`http://127.0.0.1:3000/stories/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    });
  },
  submitArticle: function (article) {
    console.log('Submitting new article:', article);
    return fetch('http://127.0.0.1:3000/submit-story', {
      method: 'POST',
      body: article
    });
  },
  loadStory: function (id) {
    console.log(`Requesting story: ${id}`);
    return fetch(`http://127.0.0.1:3000/stories/${id}`)
      .then((response) => response.json())
      .then((json) => {
        this.cache[id] = json;
        return json;
      })
      .catch((err) => {
        console.error(err);
      });
  },
  loadStories: function (sort = 'date-descending', search = null, lowerBound = 0, upperBound = 10) {
    return this.listStories(sort, search).then((list) => {
      const promises = [];

      list.slice(lowerBound, upperBound).forEach((i) => {
        if (!(i in this.cache)) {
          promises.push(this.loadStory(i));
        } else {
          promises.push(Promise.resolve(this.cache[i]));
        }
      });

      return Promise.all(promises);
    });
  },
  listStories: function (sort, search) {
    var query = `http://127.0.0.1:3000/stories-list?sort=${sort}`;
    if (search !== null) {
      query += `&search=${search}`;
    }

    return fetch(query).then((response) => response.json());
  }
};
