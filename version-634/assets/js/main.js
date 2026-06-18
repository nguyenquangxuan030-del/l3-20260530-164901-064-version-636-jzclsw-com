(function () {
    const body = document.body;
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    const panel = document.querySelector('[data-search-panel]');
    const openButtons = document.querySelectorAll('[data-search-open]');
    const closeButtons = document.querySelectorAll('[data-search-close]');
    const globalInput = document.querySelector('[data-global-search]');
    const globalResults = document.querySelector('[data-global-results]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function openSearch() {
        if (!panel) {
            return;
        }
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
        if (globalInput) {
            setTimeout(function () {
                globalInput.focus();
            }, 50);
        }
    }

    function closeSearch() {
        if (!panel) {
            return;
        }
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
    }

    openButtons.forEach(function (button) {
        button.addEventListener('click', openSearch);
    });

    closeButtons.forEach(function (button) {
        button.addEventListener('click', closeSearch);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeSearch();
        }
    });

    function renderSearchResults(keyword) {
        if (!globalResults || !Array.isArray(window.MOVIE_DATA)) {
            return;
        }

        const query = normalize(keyword);
        if (!query) {
            globalResults.innerHTML = '<div class="search-empty">输入关键词后显示匹配影片。</div>';
            return;
        }

        const results = window.MOVIE_DATA.filter(function (movie) {
            const haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' ')
            ].join(' '));
            return haystack.includes(query);
        }).slice(0, 18);

        if (results.length === 0) {
            globalResults.innerHTML = '<div class="search-empty">没有找到匹配影片。</div>';
            return;
        }

        globalResults.innerHTML = results.map(function (movie) {
            const prefix = location.pathname.includes('/video/') || location.pathname.includes('/category/') ? '../' : '';
            return [
                '<a class="search-result" href="' + prefix + movie.url + '">',
                '    <img src="' + prefix + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                '    <span>',
                '        <strong>' + escapeHtml(movie.title) + '</strong>',
                '        <span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span>',
                '    </span>',
                '    <em>进入</em>',
                '</a>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    if (globalInput) {
        renderSearchResults('');
        globalInput.addEventListener('input', function () {
            renderSearchResults(globalInput.value);
        });
    }

    document.querySelectorAll('[data-page-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            const query = normalize(input.value);
            document.querySelectorAll('[data-search]').forEach(function (card) {
                const haystack = normalize(card.getAttribute('data-search'));
                const visible = !query || haystack.includes(query);
                card.setAttribute('data-hidden-by-filter', visible ? 'false' : 'true');
            });
        });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }
})();
