function getQueryParam(name) {
  var params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function setupMobileMenu() {
  var button = document.querySelector("[data-mobile-menu-button]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
    button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
  });
}

function setupSearchForms() {
  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      var keyword = input ? input.value.trim() : "";
      if (!keyword) {
        event.preventDefault();
        return;
      }
      form.action = "./search.html";
    });
  });
}

function setupHeroSlider() {
  var slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
  var previous = slider.querySelector("[data-hero-prev]");
  var next = slider.querySelector("[data-hero-next]");
  var current = 0;
  function show(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }
  if (previous) {
    previous.addEventListener("click", function () {
      show(current - 1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
    });
  });
  show(0);
  window.setInterval(function () {
    show(current + 1);
  }, 5000);
}

function setupCategoryFilters() {
  var filterRoot = document.querySelector("[data-filter-root]");
  if (!filterRoot) {
    return;
  }
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var keywordInput = filterRoot.querySelector("[data-filter-keyword]");
  var regionSelect = filterRoot.querySelector("[data-filter-region]");
  var yearSelect = filterRoot.querySelector("[data-filter-year]");
  var typeSelect = filterRoot.querySelector("[data-filter-type]");
  var result = document.querySelector("[data-filter-result]");
  function currentValue(element) {
    return element ? normalizeText(element.value) : "";
  }
  function applyFilters() {
    var keyword = currentValue(keywordInput);
    var region = currentValue(regionSelect);
    var year = currentValue(yearSelect);
    var type = currentValue(typeSelect);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      var matched = true;
      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }
      if (region && normalizeText(card.dataset.region).indexOf(region) === -1) {
        matched = false;
      }
      if (year && normalizeText(card.dataset.year) !== year) {
        matched = false;
      }
      if (type && normalizeText(card.dataset.type).indexOf(type) === -1) {
        matched = false;
      }
      card.classList.toggle("is-filter-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (result) {
      result.textContent = "当前显示 " + visible + " 部影片";
    }
  }
  [keywordInput, regionSelect, yearSelect, typeSelect].forEach(function (element) {
    if (element) {
      element.addEventListener("input", applyFilters);
      element.addEventListener("change", applyFilters);
    }
  });
  applyFilters();
}

function createSearchCard(movie) {
  var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');
  return '' +
    '<article class="movie-card">' +
      '<a href="' + escapeHtml(movie.url) + '" class="movie-card__link">' +
        '<div class="movie-card__cover">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-card__score">★ ' + escapeHtml(movie.score) + '</span>' +
        '</div>' +
        '<div class="movie-card__body">' +
          '<span class="movie-card__category">' + escapeHtml(movie.category) + '</span>' +
          '<h3>' + escapeHtml(movie.title) + '</h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-card__meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<div class="movie-card__tags">' + tags + '</div>' +
        '</div>' +
      '</a>' +
    '</article>';
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setupSearchPage() {
  var results = document.querySelector("[data-search-results]");
  var count = document.querySelector("[data-search-count]");
  var input = document.querySelector("[data-search-page-input]");
  if (!results || typeof MOVIE_SEARCH_DATA === "undefined") {
    return;
  }
  var keyword = getQueryParam("q");
  if (input) {
    input.value = keyword;
  }
  var normalized = normalizeText(keyword);
  var matched = MOVIE_SEARCH_DATA.filter(function (movie) {
    if (!normalized) {
      return true;
    }
    var haystack = normalizeText([
      movie.title,
      movie.region,
      movie.year,
      movie.type,
      movie.genre,
      (movie.tags || []).join(" "),
      movie.oneLine
    ].join(" "));
    return haystack.indexOf(normalized) !== -1;
  }).slice(0, 240);
  if (count) {
    if (keyword) {
      count.textContent = "关键词“" + keyword + "”共匹配 " + matched.length + " 部影片";
    } else {
      count.textContent = "展示片库中的前 " + matched.length + " 部影片，可输入关键词继续筛选";
    }
  }
  if (!matched.length) {
    results.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试其他关键词。</div>';
    return;
  }
  results.innerHTML = matched.map(createSearchCard).join("");
}

function setupMoviePlayer(source) {
  var video = document.getElementById("movie-video");
  var overlay = document.getElementById("play-overlay");
  if (!video || !overlay || !source) {
    return;
  }
  var hlsInstance = null;
  function bindSource() {
    if (video.dataset.bound === "true") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    video.dataset.bound = "true";
  }
  function startPlayback() {
    bindSource();
    overlay.classList.add("is-hidden");
    var playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }
  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      overlay.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupSearchForms();
  setupHeroSlider();
  setupCategoryFilters();
  setupSearchPage();
});
