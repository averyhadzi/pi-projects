var errorCallback = function(e) {
    console.log('Reeeejected!', e);
  };

  // Chrome only prefix
  navigator.webkitGetUserMedia({video: true, audio: false}, function(localMediaStream) {
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(localMediaStream);

    // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
    // See crbug.com/110938.
    video.onloadedmetadata = function(e) {
    var idx = 0;
    var filters = [
      'grayscale',
      'sepia',
      'blur',
      'brightness',
      'contrast',
      'hue-rotate', 'hue-rotate2', 'hue-rotate3',
      'saturate',
      'invert',
      ''
    ];

    function changeFilter(e) {
      console.log('changed filter');
      var el = e.target;
      el.className = '';
      var effect = filters[idx++ % filters.length]; // loop through filters.
      if (effect) {
        el.classList.add(effect);
      }
    }

    document.querySelector('video').addEventListener(
        'click', changeFilter, false);
    };
  }, errorCallback);

