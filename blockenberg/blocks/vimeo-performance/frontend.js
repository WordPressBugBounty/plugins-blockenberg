(function () {
    'use strict';

    function withParams(baseUrl, updates) {
        if (!baseUrl) return '';
        try {
            var u = new URL(baseUrl, window.location.href);
            Object.keys(updates).forEach(function (k) {
                u.searchParams.set(k, String(updates[k]));
            });
            return u.toString();
        } catch (e) {
            return baseUrl;
        }
    }

    function extractEmbedSrcFromOEmbed(html) {
        if (!html) return '';
        try {
            var tmp = document.createElement('div');
            tmp.innerHTML = html;
            var iframe = tmp.querySelector('iframe');
            return iframe ? (iframe.getAttribute('src') || '') : '';
        } catch (e) {
            return '';
        }
    }

    function fetchOEmbedSrc(videoUrl) {
        if (!videoUrl) return Promise.resolve('');
        var endpoint = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(videoUrl);
        return fetch(endpoint)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                return data && data.html ? extractEmbedSrcFromOEmbed(data.html) : '';
            })
            .catch(function () { return ''; });
    }

    function buildSrc(embedSrc, id, opts) {
        var base = embedSrc || ('https://player.vimeo.com/video/' + encodeURIComponent(id));
        return withParams(base, {
            autoplay: opts.autoplay ? 1 : 0,
            muted: opts.muted ? 1 : 0,
            loop: opts.loop ? 1 : 0,
            dnt: opts.dnt ? 1 : 0,
            title: opts.chrome ? 1 : 0,
            byline: opts.chrome ? 1 : 0,
            portrait: opts.chrome ? 1 : 0
        });
    }

    function initOne(root) {
        if (!root || root.__bkbgVmpInit) return;
        root.__bkbgVmpInit = true;

        var btn = root.querySelector('.bkbg-vmp-play');
        var mount = root.querySelector('.bkbg-vmp-embed');
        if (!btn || !mount) return;

        var embedSrc = root.getAttribute('data-embed-src') || '';
        var id = root.getAttribute('data-video-id') || '';
        var videoUrl = root.getAttribute('data-video-url') || '';

        var opts = {
            dnt: root.getAttribute('data-dnt') === '1',
            autoplay: root.getAttribute('data-autoplay') === '1',
            muted: root.getAttribute('data-muted') === '1',
            loop: root.getAttribute('data-loop') === '1',
            chrome: root.getAttribute('data-chrome') === '1'
        };

        function injectIframe(src) {
            if (!src) return;
            var iframe = document.createElement('iframe');
            iframe.className = 'bkbg-vmp-iframe';
            iframe.src = src;
            iframe.title = 'Vimeo video';
            iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;

            mount.innerHTML = '';
            mount.appendChild(iframe);
            root.classList.add('is-playing');
        }

        function play() {
            if (root.classList.contains('is-playing')) return;

            // If we already have embedSrc (with hash), use it directly
            if (embedSrc) {
                injectIframe(buildSrc(embedSrc, id, opts));
                return;
            }

            // Fallback: fetch oEmbed on the fly to get the proper iframe src with hash
            var urlToFetch = videoUrl || (id ? ('https://vimeo.com/' + id) : '');
            if (!urlToFetch) return;

            btn.disabled = true;
            fetchOEmbedSrc(urlToFetch).then(function (fetchedSrc) {
                btn.disabled = false;
                embedSrc = fetchedSrc; // cache for future
                injectIframe(buildSrc(embedSrc, id, opts));
            });
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            play();
        });

        btn.addEventListener('keydown', function (e) {
            var key = e.key || e.code;
            if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
                e.preventDefault();
                play();
            }
        });
    }

    function initAll() {
        var nodes = document.querySelectorAll('.bkbg-vmp-wrap');
        for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
