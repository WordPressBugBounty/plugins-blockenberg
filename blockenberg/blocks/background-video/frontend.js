/* Background Video — frontend */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Hosted video ─────────────────────────────────────────────────────── */
    function initHosted(outer, media, cfg) {
        var video = document.createElement('video');
        video.src = cfg.url;
        video.muted = true;
        video.autoplay = false;
        video.loop = cfg.loop;
        video.playsInline = true;
        video.playbackRate = cfg.rate;
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:' + cfg.fit + ';object-position:' + cfg.pos + ';pointer-events:none;';
        media.appendChild(video);

        var playing = false;

        function tryPlay() {
            if (playing) { return; }
            video.play().then(function () {
                playing = true;
                outer.classList.add('bkbv--playing');
            }).catch(function () {});
        }
        function tryPause() {
            if (!playing) { return; }
            video.pause();
            playing = false;
        }

        if (cfg.inView) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { tryPlay(); }
                    else { tryPause(); }
                });
            }, { threshold: 0.1 });
            obs.observe(outer);
        } else {
            tryPlay();
        }

        if (cfg.pauseHover) {
            outer.addEventListener('mouseenter', function () { video.pause(); playing = false; });
            outer.addEventListener('mouseleave', function () { tryPlay(); });
        }
    }

    /* ── YouTube iframe ───────────────────────────────────────────────────── */
    function initYouTube(outer, media, cfg) {
        var id = cfg.youtubeId;
        if (!id) { return; }

        var params = [
            'autoplay=1', 'mute=1', 'controls=0', 'disablekb=1', 'fs=0',
            'iv_load_policy=3', 'modestbranding=1', 'rel=0', 'showinfo=0',
            'loop=' + (cfg.loop ? '1' : '0'),
            cfg.loop ? 'playlist=' + id : '',
        ].filter(Boolean).join('&');

        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + params;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('aria-hidden', 'true');
        media.appendChild(iframe);

        iframe.addEventListener('load', function () {
            outer.classList.add('bkbv--playing');
        });
    }

    /* ── Vimeo iframe ─────────────────────────────────────────────────────── */
    function initVimeo(outer, media, cfg) {
        var id = cfg.vimeoId;
        if (!id) { return; }

        var params = [
            'autoplay=1', 'muted=1', 'controls=0', 'loop=' + (cfg.loop ? '1' : '0'),
            'background=1', 'dnt=1',
        ].join('&');

        var iframe = document.createElement('iframe');
        iframe.src = 'https://player.vimeo.com/video/' + id + '?' + params;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('aria-hidden', 'true');
        media.appendChild(iframe);

        iframe.addEventListener('load', function () {
            outer.classList.add('bkbv--playing');
        });
    }

    /* ── init one block ───────────────────────────────────────────────────── */
    function initBlock(outer) {
        if (outer._bkbvInit) { return; }
        outer._bkbvInit = true;

        if (reducedMotion) { return; }

        var media = outer.querySelector('.bkbv-media');
        if (!media) { return; }

        var cfg = {
            type:      outer.getAttribute('data-video-type') || 'hosted',
            url:       outer.getAttribute('data-video-url')  || '',
            youtubeId: outer.getAttribute('data-youtube-id') || '',
            vimeoId:   outer.getAttribute('data-vimeo-id')   || '',
            loop:      outer.getAttribute('data-loop')       !== '0',
            inView:    outer.getAttribute('data-in-view')    !== '0',
            pauseHover:outer.getAttribute('data-pause-hover') === '1',
            rate:      parseFloat(outer.getAttribute('data-rate')) || 1,
            fit:       outer.getAttribute('data-object-fit') || 'cover',
            pos:       outer.getAttribute('data-object-pos') || 'center center',
        };

        if (cfg.type === 'hosted' && cfg.url) {
            initHosted(outer, media, cfg);
        } else if (cfg.type === 'youtube' && cfg.youtubeId) {
            initYouTube(outer, media, cfg);
        } else if (cfg.type === 'vimeo' && cfg.vimeoId) {
            initVimeo(outer, media, cfg);
        }
    }

    /* ── boot ────────────────────────────────────────────────────────────── */
    function init() {
        document.querySelectorAll('.bkbv-outer[data-video-type]').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
