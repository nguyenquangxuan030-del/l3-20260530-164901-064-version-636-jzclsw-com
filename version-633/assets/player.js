(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var poster = document.getElementById(options.posterId);
    var button = document.getElementById(options.buttonId);
    var attached = false;
    var hls = null;

    if (!video || !poster || !button) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.stream);
        hls.attachMedia(video);
      } else {
        video.src = options.stream;
      }
    }

    function play() {
      attach();
      poster.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          poster.classList.remove('is-hidden');
        });
      }
    }

    poster.addEventListener('click', play);
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      poster.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      poster.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
