(function () {
    'use strict';

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    function initOne(root) {
        if (!root || root.__bkbgMqInit) return;
        root.__bkbgMqInit = true;

        var id = root.getAttribute('id') || root.getAttribute('data-instance-id') || 'bkbg-mq-' + Math.random().toString(36).substr(2, 9);
        var cookieName = 'bkbg_mq_closed_' + id;
        var persistDays = parseInt(root.getAttribute('data-close-persist-days') || '7', 10);
        var persist = root.getAttribute('data-close-persist') === '1';

        // Check if already dismissed
        if (persist && getCookie(cookieName)) {
            root.classList.add('is-hidden');
            return;
        }

        var closeBtn = root.querySelector('.bkbg-marquee-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                root.classList.add('is-hidden');
                if (persist) {
                    setCookie(cookieName, '1', persistDays);
                }
            });
        }

        // Pause on click
        var pauseOnClick = root.getAttribute('data-pause-click') === '1';
        if (pauseOnClick) {
            var track = root.querySelector('.bkbg-marquee-track');
            if (track) {
                root.addEventListener('click', function (e) {
                    if (e.target.closest('.bkbg-marquee-close')) return;
                    root.classList.toggle('is-paused');
                });
            }
        }

        // Duplicate content for seamless loop if needed
        var content = root.querySelector('.bkbg-marquee-content');
        var track = root.querySelector('.bkbg-marquee-track');
        if (content && track && track.children.length < 2) {
            var clone = content.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        }
    }

    function initAll() {
        var nodes = document.querySelectorAll('.bkbg-marquee-wrap');
        for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
