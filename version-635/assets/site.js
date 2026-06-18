document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
});

function setupMobileMenu() {
  var button = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', function () {
    menu.classList.toggle('open');
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero-carousel]');

  if (!hero) {
    return;
  }

  var slides = Array.from(hero.querySelectorAll('.hero-slide'));
  var dots = Array.from(hero.querySelectorAll('.hero-dot'));
  var previous = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
      dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  if (previous) {
    previous.addEventListener('click', function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      restart();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      restart();
    });
  });

  show(0);
  restart();
}

function setupFilters() {
  var panels = document.querySelectorAll('[data-filter-panel]');

  panels.forEach(function (panel) {
    var root = panel.parentElement || document;
    var input = panel.querySelector('[data-search-input]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var result = panel.querySelector('[data-filter-result]');
    var cards = Array.from(root.querySelectorAll('.movie-card'));

    function matchesYear(card, value) {
      if (!value || value === '全部年份') {
        return true;
      }

      var year = card.getAttribute('data-year') || '';

      if (value === '更早') {
        var numericYear = parseInt(year, 10);
        return !numericYear || numericYear < 2017;
      }

      return year.indexOf(value) !== -1;
    }

    function apply() {
      var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      var year = yearSelect ? yearSelect.value : '全部年份';
      var type = typeSelect ? typeSelect.value : '全部类型';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();

        var typeValue = card.getAttribute('data-type') || '';
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }

        if (!matchesYear(card, year)) {
          ok = false;
        }

        if (type && type !== '全部类型' && typeValue.indexOf(type) === -1) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);

        if (ok) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }

    apply();
  });
}

function setupPlayers() {
  var playerCards = document.querySelectorAll('[data-player-card]');

  playerCards.forEach(function (card) {
    var video = card.querySelector('video[data-src]');
    var overlay = card.querySelector('[data-play-overlay]');

    if (!video || !overlay) {
      return;
    }

    function attachSource() {
      if (video.dataset.ready === 'true') {
        return Promise.resolve();
      }

      var source = video.getAttribute('data-src');

      if (!source) {
        return Promise.reject(new Error('Missing video source'));
      }

      video.dataset.ready = 'true';

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      return Promise.resolve();
    }

    function play() {
      attachSource()
        .then(function () {
          overlay.classList.add('hidden');
          return video.play();
        })
        .catch(function () {
          overlay.classList.remove('hidden');
          overlay.querySelector('[data-play-text]').textContent = '播放源加载失败，请刷新后重试';
        });
    }

    overlay.addEventListener('click', play);
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
  });
}
