(function () {
  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.onload = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn(false);
      });
    };
    document.head.appendChild(script);
  }

  window.setupPlayer = function (id, stream) {
    var box = document.getElementById(id);
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var started = false;

    function start() {
      if (!video || started) {
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add("hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    }
  };
})();
