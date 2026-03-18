(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initVideoSections();
        initStatCounters();
    });

    /* ── Poster → Play ─────────────────────────────────────────────────
       Clicking the poster/play-button area swaps in the actual iframe or
       <video> element so the page loads fast (no eager iframe load).
       ──────────────────────────────────────────────────────────────── */
    function initVideoSections() {
        document.querySelectorAll('.bkbg-vs-poster-wrap').forEach(function (posterWrap) {
            posterWrap.addEventListener('click', function () {
                var aspect  = posterWrap.closest('.bkbg-vs-aspect');
                var wrapper = posterWrap.closest('.bkbg-vs-wrapper');
                if (!aspect || !wrapper) return;

                var videoType = wrapper.dataset.videoType || 'youtube';
                var youtubeId = wrapper.dataset.youtubeId;
                var vimeoId   = wrapper.dataset.vimeoId;
                var selfUrl   = wrapper.dataset.videoUrl;

                /* Mark poster as playing (CSS fades it out) */
                posterWrap.classList.add('is-playing');

                var player;

                if (videoType === 'self' && selfUrl) {
                    player = document.createElement('video');
                    player.src        = selfUrl;
                    player.autoplay   = true;
                    player.controls   = true;
                    player.className  = 'bkbg-vs-video';
                    player.playsInline = true;
                } else {
                    /* Embed iframe */
                    player = document.createElement('iframe');
                    player.className   = 'bkbg-vs-iframe';
                    player.allowFullscreen = true;
                    player.allow       = 'autoplay; encrypted-media; picture-in-picture';

                    if (videoType === 'vimeo' && vimeoId) {
                        player.src = 'https://player.vimeo.com/video/' + vimeoId + '?autoplay=1&color=6c3fb5';
                    } else if (youtubeId) {
                        player.src = 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1&rel=0';
                    } else {
                        return; /* no ID configured */
                    }
                }

                aspect.appendChild(player);

                /* Fade out poster after player is appended */
                setTimeout(function () {
                    posterWrap.style.display = 'none';
                }, 400);
            });
        });
    }

    /* ── Stat counter animation ────────────────────────────────────────
       Detects numeric parts in stat-value text and animates count-up
       when the stat strip scrolls into view.
       ──────────────────────────────────────────────────────────────── */
    function initStatCounters() {
        if (!('IntersectionObserver' in window)) return;

        document.querySelectorAll('.bkbg-vs-stats').forEach(function (strip) {
            var stats = strip.querySelectorAll('.bkbg-vs-stat');
            if (!stats.length) return;

            var animated = false;

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !animated) {
                        animated = true;
                        animateStats(stats);
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(strip);
        });
    }

    function animateStats(statEls) {
        statEls.forEach(function (stat, i) {
            var valueEl = stat.querySelector('.bkbg-vs-stat-value');
            if (!valueEl) return;

            stat.classList.add('bkbg-vs-animate');

            var original = valueEl.textContent;
            /* Extract leading/trailing non-numeric parts and the numeric part */
            var match = original.match(/^([^0-9]*)(\d+(?:[.,]\d+)?)(.*)$/);
            if (!match) return;

            var prefix  = match[1];
            var numStr  = match[2].replace(',', '.');
            var suffix  = match[3];
            var target  = parseFloat(numStr);
            var isFloat = numStr.indexOf('.') !== -1;
            var decimals = isFloat ? (numStr.split('.')[1] || '').length : 0;
            var duration = 1200;
            var start    = null;
            var delay    = i * 100;

            setTimeout(function () {
                requestAnimationFrame(function step(ts) {
                    if (!start) start = ts;
                    var progress = Math.min((ts - start) / duration, 1);
                    var ease = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
                    var current = target * ease;
                    valueEl.textContent = prefix + (isFloat ? current.toFixed(decimals) : Math.round(current)) + suffix;
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        valueEl.textContent = original; /* restore exact original */
                    }
                });
            }, delay);
        });
    }
})();
