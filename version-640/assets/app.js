(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    if (!cards.length) return;
    var activeFilter = "";

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-info") || "")).toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle("is-filter-hidden", !(matchQuery && matchFilter));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "";
        filters.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      if (!video || !button) return;
      var url = video.getAttribute("data-play");
      var hls = null;

      function run() {
        if (!url) return;
        button.classList.add("is-hidden");
        video.controls = true;
        if (video.getAttribute("data-loaded") === "1") {
          var resumed = video.play();
          if (resumed && resumed.catch) resumed.catch(function () {});
          return;
        }
        video.setAttribute("data-loaded", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          var nativePlay = video.play();
          if (nativePlay && nativePlay.catch) nativePlay.catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var parsedPlay = video.play();
            if (parsedPlay && parsedPlay.catch) parsedPlay.catch(function () {});
          });
          return;
        }
        video.src = url;
        var directPlay = video.play();
        if (directPlay && directPlay.catch) directPlay.catch(function () {});
      }

      button.addEventListener("click", run);
      box.addEventListener("click", function (event) {
        if (event.target === video && video.getAttribute("data-loaded") !== "1") {
          run();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) hls.destroy();
      });
    });
  }

  onReady(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
