(function () {
    'use strict';

    /* ── Helpers ──────────────────────────────────────────────────────────── */
    function formatTime(secs) {
        if (isNaN(secs) || secs < 0) return '0:00';
        var m = Math.floor(secs / 60);
        var s = Math.floor(secs % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    /* ── Build SVG element ────────────────────────────────────────────────── */
    function svgIcon(d, size) {
        size = size || 22;
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'currentColor');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svg.appendChild(path);
        return svg;
    }

    var PLAY_PATH  = 'M8 5v14l11-7z';
    var PAUSE_PATH = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

    /* ── Init one player ──────────────────────────────────────────────────── */
    function initAudioPlayer(wrapper) {
        var playerEl = wrapper.querySelector('.bkbg-ap-player');
        if (!playerEl) return;

        var audioUrl  = playerEl.dataset.audioUrl;
        var audioType = playerEl.dataset.audioType || 'audio/mpeg';
        if (!audioUrl) return;

        var autoplay     = playerEl.dataset.autoplay === '1';
        var loop         = playerEl.dataset.loop === '1';
        var preload      = playerEl.dataset.preload || 'metadata';
        var showVolume   = playerEl.dataset.showVolume !== '0';
        var showSpeed    = playerEl.dataset.showSpeed !== '0';

        /* Audio element */
        var audio = new Audio();
        audio.src = audioUrl;
        audio.preload = preload;
        audio.loop = loop;
        if (autoplay) { audio.autoplay = true; }

        /* DOM refs */
        var playBtn      = playerEl.querySelector('.bkbg-ap-play-btn');
        var progressTrack = playerEl.querySelector('.bkbg-ap-progress-track');
        var progressFill = playerEl.querySelector('.bkbg-ap-progress-fill');
        var progressThumb = playerEl.querySelector('.bkbg-ap-progress-thumb');
        var currentEl    = playerEl.querySelector('.bkbg-ap-current');
        var durationEl   = playerEl.querySelector('.bkbg-ap-duration');
        var volSlider    = playerEl.querySelector('.bkbg-ap-vol-slider');
        var speedBtn     = playerEl.querySelector('.bkbg-ap-speed-btn');

        /* ── Build play button icons ────────────────────────────────────── */
        if (playBtn) {
            playBtn.innerHTML = '';
            var iconPlay  = svgIcon(PLAY_PATH, 22);
            iconPlay.classList.add('bkbg-ap-icon-play');
            var iconPause = svgIcon(PAUSE_PATH, 22);
            iconPause.classList.add('bkbg-ap-icon-pause');
            iconPause.style.display = 'none';
            playBtn.appendChild(iconPlay);
            playBtn.appendChild(iconPause);
        }

        /* ── Play/Pause ─────────────────────────────────────────────────── */
        function updatePlayState(playing) {
            wrapper.classList.toggle('bkbg-ap-playing', playing);
            if (!playBtn) return;
            var ip  = playBtn.querySelector('.bkbg-ap-icon-play');
            var ipa = playBtn.querySelector('.bkbg-ap-icon-pause');
            if (ip)  ip.style.display  = playing ? 'none'  : 'block';
            if (ipa) ipa.style.display = playing ? 'block' : 'none';
            playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        }

        if (playBtn) {
            playBtn.addEventListener('click', function () {
                if (audio.paused) {
                    audio.play().catch(function () {});
                } else {
                    audio.pause();
                }
            });
        }

        audio.addEventListener('play',  function () { updatePlayState(true); });
        audio.addEventListener('pause', function () { updatePlayState(false); });
        audio.addEventListener('ended', function () { updatePlayState(false); });

        /* ── Progress ───────────────────────────────────────────────────── */
        audio.addEventListener('loadedmetadata', function () {
            if (durationEl) durationEl.textContent = formatTime(audio.duration);
        });

        audio.addEventListener('timeupdate', function () {
            if (!audio.duration) return;
            var pct = (audio.currentTime / audio.duration) * 100;
            if (progressFill)  progressFill.style.width = pct + '%';
            if (progressThumb) progressThumb.style.left = pct + '%';
            if (currentEl) currentEl.textContent = formatTime(audio.currentTime);
        });

        /* Seek by clicking the track */
        function seek(e) {
            if (!progressTrack || !audio.duration) return;
            var rect = progressTrack.getBoundingClientRect();
            var x    = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            var pct  = Math.min(1, Math.max(0, x / rect.width));
            audio.currentTime = pct * audio.duration;
        }

        if (progressTrack) {
            var seeking = false;
            progressTrack.addEventListener('mousedown', function (e) {
                seeking = true;
                seek(e);
            });
            progressTrack.addEventListener('touchstart', function (e) {
                seeking = true;
                seek(e);
            }, { passive: true });
            document.addEventListener('mousemove', function (e) { if (seeking) seek(e); });
            document.addEventListener('touchmove', function (e) { if (seeking) seek(e); }, { passive: true });
            document.addEventListener('mouseup',  function () { seeking = false; });
            document.addEventListener('touchend', function () { seeking = false; });
        }

        /* ── Volume ─────────────────────────────────────────────────────── */
        if (volSlider && showVolume) {
            volSlider.value = audio.volume;
            volSlider.addEventListener('input', function () {
                audio.volume = parseFloat(volSlider.value);
            });
        }

        /* ── Playback speed ─────────────────────────────────────────────── */
        var SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
        var speedIdx = 2; // default 1×

        if (speedBtn && showSpeed) {
            speedBtn.addEventListener('click', function () {
                speedIdx = (speedIdx + 1) % SPEEDS.length;
                audio.playbackRate = SPEEDS[speedIdx];
                speedBtn.textContent = SPEEDS[speedIdx] + '×';
            });
        }
    }

    /* ── Init all players on page ─────────────────────────────────────────── */
    function initAll() {
        var wrappers = document.querySelectorAll('.bkbg-ap-wrapper');
        wrappers.forEach(initAudioPlayer);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
