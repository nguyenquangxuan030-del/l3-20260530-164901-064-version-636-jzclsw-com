(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        initMenu();
        initHero();
        initPlayers();
        initSearch();
    });

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            document.body.classList.toggle("no-scroll", menu.classList.contains("is-open"));
        });
        menu.addEventListener("click", function (event) {
            if (event.target.tagName === "A") {
                menu.classList.remove("is-open");
                document.body.classList.remove("no-scroll");
            }
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var previous = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-video-box]"));
        boxes.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play-button]");
            var stream = box.getAttribute("data-stream");
            var hlsInstance = null;
            var isReady = false;

            if (!video || !stream) {
                return;
            }

            function attachStream() {
                if (isReady) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
                isReady = true;
            }

            function beginPlayback() {
                attachStream();
                if (button) {
                    button.classList.add("is-hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    beginPlayback();
                });
            }

            box.addEventListener("click", function (event) {
                if (event.target === box) {
                    beginPlayback();
                }
            });

            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function initSearch() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var form = document.querySelector("[data-search-form]");
        var title = document.querySelector("[data-search-title]");
        var subtitle = document.querySelector("[data-search-subtitle]");
        if (!results || !input || !window.SiteSearchData) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        input.value = initialQuery;

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function render(items) {
            if (!items.length) {
                results.innerHTML = '<div class="feature-panel"><h2>未找到匹配内容</h2><p>可以换一个片名、类型、地区或关键词继续搜索。</p></div>';
                return;
            }
            results.innerHTML = items.slice(0, 120).map(function (item, index) {
                var rank = index + 1;
                return [
                    '<a class="rank-row" href="' + item.href + '">',
                    '<span class="rank-number">' + (rank < 10 ? '0' + rank : rank) + '</span>',
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '<span class="rank-main">',
                    '<strong>' + escapeHtml(item.title) + '</strong>',
                    '<em>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</em>',
                    '</span>',
                    '<span class="rank-score">' + escapeHtml(item.score) + '</span>',
                    '</a>'
                ].join('');
            }).join('');
        }

        function runSearch(query) {
            var keyword = normalize(query);
            if (!keyword) {
                if (title) {
                    title.textContent = "热门入口";
                }
                if (subtitle) {
                    subtitle.textContent = "也可以从下方推荐条目直接进入影片详情。";
                }
                render(window.SiteSearchData.slice(0, 60));
                return;
            }
            var items = window.SiteSearchData.filter(function (item) {
                return normalize(item.title).indexOf(keyword) > -1 ||
                    normalize(item.region).indexOf(keyword) > -1 ||
                    normalize(item.type).indexOf(keyword) > -1 ||
                    normalize(item.genre).indexOf(keyword) > -1 ||
                    normalize(item.tags).indexOf(keyword) > -1 ||
                    normalize(item.oneLine).indexOf(keyword) > -1;
            });
            if (title) {
                title.textContent = "搜索结果";
            }
            if (subtitle) {
                subtitle.textContent = "以下条目可直接进入影片详情页。";
            }
            render(items);
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var url = new URL(window.location.href);
                if (query) {
                    url.searchParams.set("q", query);
                } else {
                    url.searchParams.delete("q");
                }
                window.history.replaceState({}, "", url.toString());
                runSearch(query);
            });
        }

        input.addEventListener("input", function () {
            runSearch(input.value);
        });

        runSearch(initialQuery);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
})();
