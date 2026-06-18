(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('.mobile-menu a').forEach(function (link) {
        link.addEventListener('click', function () {
            body.classList.remove('menu-open');
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(current - 1);
            resetHero();
        });
    });

    document.querySelectorAll('[data-hero-next]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(current + 1);
            resetHero();
        });
    });

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll('[data-search-input]').forEach(function (input) {
        var target = input.getAttribute('data-search-input') || document.body;
        var scope = target === 'body' ? document.body : document.querySelector(target);
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card-wrap')) : [];

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var meta = (card.getAttribute('data-meta') || '').toLowerCase();
                var matched = !keyword || title.indexOf(keyword) > -1 || meta.indexOf(keyword) > -1;
                card.classList.toggle('is-hidden', !matched);
            });
        });
    });

    document.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
            var group = button.closest('[data-filter-group]');
            var value = button.getAttribute('data-filter');
            var scopeSelector = group ? group.getAttribute('data-filter-scope') : null;
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document.body;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card-wrap'));

            if (group) {
                group.querySelectorAll('[data-filter]').forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
            }

            cards.forEach(function (card) {
                var type = card.getAttribute('data-type') || '';
                var matched = value === 'all' || type === value;
                card.classList.toggle('is-hidden', !matched);
            });
        });
    });
})();

function initMoviePlayer(streamUrl) {
    var root = document.querySelector('[data-player-root]');
    if (!root) {
        return;
    }

    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var started = false;
    var hlsInstance = null;

    function attachStream() {
        if (started) {
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        attachStream();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
