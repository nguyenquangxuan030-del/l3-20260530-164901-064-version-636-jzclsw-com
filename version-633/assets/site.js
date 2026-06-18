(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slides[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    slides[0].classList.add('is-active');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }
    restartHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var counter = document.querySelector('[data-filter-count]');
  var noResults = document.querySelector('.no-results');

  function updateCards() {
    if (!cards.length) {
      return;
    }
    var term = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var keywords = card.getAttribute('data-keywords') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var ok = true;

      if (term && keywords.indexOf(term) === -1) {
        ok = false;
      }
      if (region && cardRegion !== region) {
        ok = false;
      }
      if (type && cardType !== type) {
        ok = false;
      }
      if (year && cardYear !== year) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (counter) {
      counter.textContent = '显示 ' + visible + ' 部作品';
    }
    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  if (cards.length) {
    [filterInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', updateCards);
        control.addEventListener('change', updateCards);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && filterInput) {
      filterInput.value = query;
    }
    updateCards();
  }
})();
