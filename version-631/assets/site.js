(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero-slider]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    function getSearchText(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
    }

    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
        var empty = document.querySelector(".no-results");

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var matched = !keyword || getSearchText(card).indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visibleCount === 0);
            }
        });
    });

    function renderSearchResults() {
        var resultRoot = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-page-input]");

        if (!resultRoot || !input || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function cardTemplate(item) {
            return [
                '<a class="movie-card compact-card" href="./' + item.href + '" data-title="' + escapeHtml(item.title) + '" data-region="' + escapeHtml(item.region) + '" data-year="' + escapeHtml(item.year) + '" data-type="' + escapeHtml(item.type) + '" data-genre="' + escapeHtml(item.genre) + '">',
                '    <span class="poster-frame">',
                '        <img src="./' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="play-mark">▶</span>',
                '    </span>',
                '    <span class="movie-card-body">',
                '        <strong>' + escapeHtml(item.title) + '</strong>',
                '        <span class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span>',
                '        <span class="card-desc">' + escapeHtml(item.oneLine) + '</span>',
                '    </span>',
                '</a>'
            ].join("");
        }

        function escapeHtml(text) {
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function runSearch(nextQuery) {
            var keyword = nextQuery.trim().toLowerCase();
            var list = window.MOVIE_SEARCH_INDEX;

            if (keyword) {
                list = list.filter(function (item) {
                    return [
                        item.title,
                        item.region,
                        item.type,
                        item.year,
                        item.genre,
                        item.tags,
                        item.oneLine
                    ].join(" ").toLowerCase().indexOf(keyword) !== -1;
                });
            }

            resultRoot.innerHTML = list.slice(0, 240).map(cardTemplate).join("");

            var empty = document.querySelector(".no-results");
            if (empty) {
                empty.classList.toggle("show", list.length === 0);
            }
        }

        input.addEventListener("input", function () {
            runSearch(input.value);
        });

        runSearch(query);
    }

    renderSearchResults();

    function bindPlayer(player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".player-start");
        var layer = player.querySelector(".player-layer");
        var source = player.getAttribute("data-source");

        if (!video || !source) {
            return;
        }

        function startPlayback() {
            if (player.getAttribute("data-ready") === "1") {
                video.play().catch(function () {});
                return;
            }

            player.setAttribute("data-ready", "1");
            player.classList.add("is-loading");

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                video._hls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    player.classList.remove("is-loading");
                    player.classList.add("is-playing");
                    video.play().catch(function () {});
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        player.classList.add("has-error");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    player.classList.remove("is-loading");
                    player.classList.add("is-playing");
                    video.play().catch(function () {});
                }, { once: true });
            } else {
                video.src = source;
                player.classList.remove("is-loading");
                player.classList.add("is-playing");
                video.play().catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (layer) {
            layer.addEventListener("click", function () {
                startPlayback();
            });
        }

        video.addEventListener("click", function () {
            if (player.getAttribute("data-ready") !== "1") {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });
    }

    document.querySelectorAll(".video-player").forEach(bindPlayer);
})();
