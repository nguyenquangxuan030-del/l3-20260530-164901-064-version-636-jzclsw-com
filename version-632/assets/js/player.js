const MoviePlayer = (function () {
    let hlsInstance = null;
    let initialized = false;

    function mount(src) {
        const video = document.querySelector("[data-video-player]");
        const cover = document.querySelector("[data-play-cover]");
        const playButton = document.querySelector("[data-play-button]");

        if (!video || !src) {
            return;
        }

        function attach() {
            if (initialized) {
                return;
            }
            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener("click", function () {
            if (!initialized) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    return {
        mount: mount
    };
})();
