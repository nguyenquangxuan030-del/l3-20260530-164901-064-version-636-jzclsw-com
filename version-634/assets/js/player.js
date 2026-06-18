(function () {
    function setupPlayer(playerCard) {
        const video = playerCard.querySelector('video');
        const button = playerCard.querySelector('[data-player-start]');
        const sourceUrl = playerCard.getAttribute('data-video-url');
        let hlsInstance = null;
        let isReady = false;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (isReady) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else {
                video.src = sourceUrl;
            }

            isReady = true;
        }

        function playVideo() {
            attachSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('error', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            isReady = false;
        });
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
