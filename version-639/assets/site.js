(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        showSlide(idx);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search-input"));

    inputs.forEach(function (input) {
      if (q) {
        input.value = q;
      }
      var scope = input.closest(".filter-scope") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      function filter() {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("hide-card", keyword && text.indexOf(keyword) === -1);
        });
      }
      input.addEventListener("input", filter);
      filter();
    });
  });
})();
