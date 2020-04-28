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

  ApiClient.submitArticle(data)
    .then((res) => {
      console.log(res);
      if (res.ok) {
        window.location = window.location.origin;
      } else {
        // Show some invalid message
      }
    })
    .catch((e) => console.error(e));
});
