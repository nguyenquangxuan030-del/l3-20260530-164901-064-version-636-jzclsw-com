(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function yearMatches(yearValue, rule) {
        if (!rule) {
            return true;
        }
        var year = parseInt(yearValue, 10);
        if (!Number.isFinite(year)) {
            return false;
        }
        if (rule === "2020") {
            return year >= 2020;
        }
        if (rule === "2010") {
            return year >= 2010 && year <= 2019;
        }
        if (rule === "2000") {
            return year >= 2000 && year <= 2009;
        }
        if (rule === "1990") {
            return year >= 1990 && year <= 1999;
        }
        if (rule === "old") {
            return year < 1990;
        }
        return true;
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
                document.body.classList.toggle("is-locked", menu.classList.contains("is-open"));
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer;

            function show(target) {
                if (!slides.length) {
                    return;
                }
                index = (target + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function restart() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var section = panel.parentElement;
            var grid = section ? section.querySelector("[data-filter-grid]") : null;
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
            var keyword = panel.querySelector("[data-filter-keyword]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var reset = panel.querySelector("[data-filter-reset]");
            var empty = section.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query && keyword) {
                keyword.value = query;
            }

            function apply() {
                var q = normalize(keyword && keyword.value);
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var y = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var match = true;
                    if (q && text.indexOf(q) === -1) {
                        match = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        match = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        match = false;
                    }
                    if (!yearMatches(card.getAttribute("data-year"), y)) {
                        match = false;
                    }
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [keyword, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (keyword) {
                        keyword.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    });
})();
