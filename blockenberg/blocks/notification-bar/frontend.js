(function () {
    'use strict';

    var STORAGE_KEY_PREFIX = 'bkbg_nb_';

    function isDismissed(key) {
        try {
            var val = localStorage.getItem(key);
            if (!val) return false;
            var data = JSON.parse(val);
            if (!data.expires) return true;
            return Date.now() < data.expires;
        } catch (e) { return false; }
    }

    function setDismissed(key, days) {
        try {
            var expires = days > 0 ? Date.now() + days * 86400000 : 0;
            localStorage.setItem(key, JSON.stringify({ dismissed: true, expires: expires }));
        } catch (e) { /* ignore */ }
    }

    function initBar(dataWrap) {
        var d = dataWrap.dataset;
        var position    = d.position  || 'top';
        var animation   = d.animation || 'slide';
        var sticky      = d.sticky    !== '0';
        var delay       = parseInt(d.delay,      10) || 0;
        var cookieName  = d.cookie    || STORAGE_KEY_PREFIX + 'dismissed';
        var cookieDays  = parseInt(d.cookieDays, 10);
        if (isNaN(cookieDays)) cookieDays = 1;

        /* already dismissed? skip */
        if (isDismissed(cookieName)) return;

        /* create the outer wrapper that gets appended to body */
        var wrapper = document.createElement('div');
        wrapper.className = 'bkbg-nb-wrap wp-block-blockenberg-notification-bar';

        /* move the saved bar HTML inside the new wrapper */
        var bar = dataWrap.querySelector('.bkbg-nb-bar');
        if (!bar) return;

        wrapper.appendChild(bar);
        document.body.appendChild(wrapper);

        /* hide original placeholder */
        dataWrap.style.display = 'none';

        function show() {
            /* position class */
            if (sticky) {
                wrapper.classList.add('bkbg-nb-wrap--' + position + '-sticky');
                /* push body so content isn't hidden under bar */
                requestAnimationFrame(function () {
                    var h = wrapper.offsetHeight;
                    if (position === 'top') {
                        document.body.classList.add('bkbg-nb-push-top');
                        document.body.style.paddingTop = (parseFloat(getComputedStyle(document.body).paddingTop) + h) + 'px';
                    } else {
                        document.body.classList.add('bkbg-nb-push-bottom');
                        document.body.style.paddingBottom = (parseFloat(getComputedStyle(document.body).paddingBottom) + h) + 'px';
                    }
                });
            }

            /* animation class */
            if (animation !== 'none') {
                wrapper.classList.add('bkbg-nb-wrap--anim-' + animation);
            }
            wrapper.classList.add('bkbg-nb-wrap--visible');
            wrapper.style.opacity = '';
        }

        function dismiss() {
            setDismissed(cookieName, cookieDays);
            wrapper.style.opacity = '0';
            wrapper.style.transition = 'opacity 0.25s ease';
            setTimeout(function () {
                wrapper.style.display = 'none';
                /* remove body padding */
                if (position === 'top') {
                    document.body.classList.remove('bkbg-nb-push-top');
                    document.body.style.paddingTop = '';
                } else {
                    document.body.classList.remove('bkbg-nb-push-bottom');
                    document.body.style.paddingBottom = '';
                }
            }, 280);
        }

        /* close btn */
        var closeBtn = wrapper.querySelector('.bkbg-nb-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', dismiss);
        }

        /* show with optional delay */
        if (delay > 0) {
            setTimeout(show, delay);
        } else {
            show();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        /* Blocks are saved as <div data-position data-animation …> */
        document.querySelectorAll('[data-position][data-animation][data-cookie].wp-block-blockenberg-notification-bar').forEach(function (el) {
            /* Only if not already inside a .bkbg-nb-wrap we created */
            if (!el.closest('.bkbg-nb-wrap') || el.dataset.position) {
                initBar(el);
            }
        });
    });
})();
