(function () {
    'use strict';

    function clamp(n, min, max) {
        n = parseFloat(n);
        if (isNaN(n)) n = min;
        return Math.max(min, Math.min(max, n));
    }

    function buildSrc(root) {
        var id = root.getAttribute('data-video-id') || '';
        if (!id) return '';

        var privacy = root.getAttribute('data-privacy') === '1';
        var host = privacy ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';

        var controls = root.getAttribute('data-controls') === '1';
        var rel = root.getAttribute('data-rel') === '1';
        var mute = root.getAttribute('data-mute') === '1';
        var loop = root.getAttribute('data-loop') === '1';
        var start = clamp(root.getAttribute('data-start') || 0, 0, 86400);

        var params = [];
        params.push('autoplay=1');
        params.push('controls=' + (controls ? '1' : '0'));
        params.push('rel=' + (rel ? '1' : '0'));
        if (mute) params.push('mute=1');
        if (start > 0) params.push('start=' + Math.floor(start));
        if (loop) {
            params.push('loop=1');
            params.push('playlist=' + encodeURIComponent(id));
        }

        return host + '/embed/' + encodeURIComponent(id) + '?' + params.join('&');
    }

    function fallbackPosterImg(img) {
        if (!img || !img.getAttribute) return;
        img.addEventListener('error', function () {
            var src = img.getAttribute('src') || '';
            if (src.indexOf('maxresdefault.jpg') !== -1) {
                img.setAttribute('src', src.replace('maxresdefault.jpg', 'hqdefault.jpg'));
            }
        });
    }

    function initOne(root) {
        if (!root || root.__bkbgYtpInit) return;
        root.__bkbgYtpInit = true;

        var btn = root.querySelector('.bkbg-ytp-play');
        var mount = root.querySelector('.bkbg-ytp-embed');
        var posterImg = root.querySelector('.bkbg-ytp-poster-img');

        if (posterImg) fallbackPosterImg(posterImg);

        if (!btn || !mount) return;

        function play() {
            if (root.classList.contains('is-playing')) return;
            var src = buildSrc(root);
            if (!src) return;

            var iframe = document.createElement('iframe');
            iframe.className = 'bkbg-ytp-iframe';
            iframe.src = src;
            iframe.title = 'YouTube video';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.allowFullscreen = true;

            mount.innerHTML = '';
            mount.appendChild(iframe);

            root.classList.add('is-playing');
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
        var nodes = document.querySelectorAll('.bkbg-ytp-wrap');
        for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
