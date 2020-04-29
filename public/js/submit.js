/* eslint-disable no-undef */
document.querySelector('.custom-file-input').addEventListener('change', function (e) {
  var fileName = '';
  const files = document.getElementById('imagesInput').files;
  for (var i = 0; i < files.length; i++) {
    if (i > 0) {
      fileName += ', ';
    }

    fileName += files[i].name;
  }
  var nextSibling = e.target.previousElementSibling;
  nextSibling.innerText = fileName;
});

document.querySelector('#submitArticleBtn').addEventListener('click', function (e) {
  const form = document.querySelector('#submitArticleForm');
  if (!form.checkValidity()) {
    return form.reportValidity();
  }

  const inputs = document.querySelectorAll('#submitArticleForm input, textarea');
  const data = new FormData();

  for (let i = 0; i < inputs.length; i++) {
    const el = inputs[i];
    if (el.name === 'images') {
      for (let j = 0; j < el.files.length; j++) {
        data.append('images', el.files[j]);
      }
    } else {
      data.append(el.name, el.value);
    }
  }

  document.querySelector('#post-spinner').style.display = null;
  document.querySelector('#post-success').style.display = 'none';
  document.querySelector('#post-fail').style.display = 'none';
  document.querySelector('#submitArticleForm').style.display = 'none';
  ApiClient.submitArticle(data)
    .then((res) => {
      document.querySelector('#post-spinner').style.display = 'none';
      if (res.ok) {
        document.querySelector('#post-success').style.display = null;
      } else {
        document.querySelector('#post-fail').style.display = null;
        document.querySelector('#submitArticleForm').style.display = null;
      }
    })
    .catch((e) => {
      document.querySelector('#submitArticleForm').style.display = null;
      document.querySelector('#post-spinner').style.display = 'none';
      document.querySelector('#post-fail').style.display = null;
      console.error(e);
    });
});
