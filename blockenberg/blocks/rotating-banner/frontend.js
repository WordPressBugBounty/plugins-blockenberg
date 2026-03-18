(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function setCookie(name, val, days) {
        var d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + val + ';expires=' + d.toUTCString() + ';path=/';
    }

    function getCookie(name) {
        var n = name + '=', ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(n) === 0) return c.substring(n.length);
        }
        return '';
    }

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function formatCountdown(ms) {
        if (ms <= 0) return '00:00:00';
        var s = Math.floor(ms / 1000);
        var d = Math.floor(s / 86400);
        s %= 86400;
        var h = Math.floor(s / 3600);
        s %= 3600;
        var m = Math.floor(s / 60);
        s %= 60;
        if (d > 0) return d + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s);
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function init() {
        document.querySelectorAll('.bkbg-rbnr-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                messages: [],
                autoPlay: true,
                interval: 5000,
                animationType: 'slide',
                showArrows: true,
                showDots: true,
                showClose: true,
                cookieDays: 7,
                height: 44,
                fontSize: 14,
                fontWeight: '500',
                linkStyle: 'inline',
                arrowBg: 'rgba(0,0,0,0.15)',
                arrowColor: '#ffffff',
                dotColor: 'rgba(255,255,255,0.4)',
                dotActiveColor: '#ffffff',
                closeBg: 'rgba(0,0,0,0.15)',
                closeColor: '#ffffff'
            }, opts);

            var msgs = o.messages;
            if (!msgs || msgs.length === 0) return;

            /* Check cookie dismiss */
            var cookieName = 'bkbg_rbnr_' + (appEl.dataset.uid || btoa(JSON.stringify(msgs)).slice(0, 12));
            if (o.showClose && o.cookieDays > 0 && getCookie(cookieName) === 'dismissed') return;

            var activeIdx = 0;
            var autoTimer = null;

            /* ── Outer wrap ── */
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-rbnr-wrap' + (o.showClose ? ' has-close' : '');
            wrap.dataset.anim = o.animationType;
            typoCssVarsForEl(wrap, o.messageTypo, '--bkrbnr-mt-');

            /* ── Viewport ── */
            var viewport = document.createElement('div');
            viewport.className = 'bkbg-rbnr-viewport';
            viewport.style.height = o.height + 'px';

            /* ── Track (slides) ── */
            var track = document.createElement('div');
            track.className = 'bkbg-rbnr-track';
            if (o.animationType !== 'fade') {
                track.style.height = o.height + 'px';
            }

            var slides = [];
            var cdTimers = []; /* countdown interval refs per slide */

            msgs.forEach(function (msg, idx) {
                var slide = document.createElement('div');
                slide.className = 'bkbg-rbnr-slide' + (idx === 0 && o.animationType === 'fade' ? ' is-active' : '');
                applyCSS(slide, {
                    background: msg.bgColor || '#6366f1',
                    color: msg.textColor || '#ffffff',
                    height: o.height + 'px',
                    padding: o.showArrows ? '0 ' + (o.showClose ? '76px' : '48px') : (o.showClose ? '0 32px' : '0 16px'),
                    boxSizing: 'border-box'
                });

                /* Content */
                var content = document.createElement('div');
                content.className = 'bkbg-rbnr-content';

                var textEl = document.createElement('span');
                textEl.className = 'bkbg-rbnr-text';
                textEl.textContent = msg.text || '';
                content.appendChild(textEl);

                /* Link */
                if (msg.linkLabel && msg.linkUrl && o.linkStyle !== 'none') {
                    var link = document.createElement('a');
                    link.textContent = msg.linkLabel;
                    link.href = msg.linkUrl || '#';
                    link.target = msg.linkTarget || '_self';
                    if (o.linkStyle === 'button') {
                        link.className = 'bkbg-rbnr-link-btn';
                        link.style.background = msg.textColor || '#ffffff';
                        link.style.color = msg.bgColor || '#6366f1';
                    } else {
                        link.className = 'bkbg-rbnr-link-inline';
                    }
                    content.appendChild(link);
                }

                /* Countdown */
                if (msg.countdownTo) {
                    var target = new Date(msg.countdownTo).getTime();
                    if (!isNaN(target)) {
                        var cdEl = document.createElement('span');
                        cdEl.className = 'bkbg-rbnr-countdown';
                        cdEl.textContent = formatCountdown(target - Date.now());
                        content.appendChild(cdEl);
                        cdTimers[idx] = setInterval(function () {
                            cdEl.textContent = formatCountdown(target - Date.now());
                        }, 1000);
                    }
                }

                slide.appendChild(content);
                track.appendChild(slide);
                slides.push(slide);
            });

            viewport.appendChild(track);
            wrap.appendChild(viewport);

            /* ── Navigate ── */
            function goTo(idx, suppressAuto) {
                var next = (idx + msgs.length) % msgs.length;
                if (o.animationType === 'fade') {
                    slides[activeIdx].classList.remove('is-active');
                    slides[next].classList.add('is-active');
                } else {
                    track.style.transform = 'translateX(-' + (next * 100) + '%)';
                }
                /* Update dots */
                if (dotBtns.length) {
                    dotBtns[activeIdx].style.background = o.dotColor;
                    dotBtns[next].style.background = o.dotActiveColor;
                }
                activeIdx = next;
                if (!suppressAuto) resetAuto();
            }

            /* ── Auto-play ── */
            function resetAuto() {
                if (autoTimer) clearInterval(autoTimer);
                if (o.autoPlay && msgs.length > 1) {
                    autoTimer = setInterval(function () { goTo(activeIdx + 1, true); }, o.interval);
                }
            }

            resetAuto();

            /* ── Arrows ── */
            if (o.showArrows && msgs.length > 1) {
                var prevBtn = document.createElement('button');
                prevBtn.className = 'bkbg-rbnr-arrow is-prev';
                prevBtn.innerHTML = '&#8249;';
                applyCSS(prevBtn, { background: o.arrowBg, color: o.arrowColor });
                prevBtn.addEventListener('click', function () { goTo(activeIdx - 1); });
                wrap.appendChild(prevBtn);

                var nextBtn = document.createElement('button');
                nextBtn.className = 'bkbg-rbnr-arrow is-next';
                nextBtn.innerHTML = '&#8250;';
                applyCSS(nextBtn, { background: o.arrowBg, color: o.arrowColor });
                nextBtn.addEventListener('click', function () { goTo(activeIdx + 1); });
                wrap.appendChild(nextBtn);
            }

            /* ── Dots ── */
            var dotBtns = [];
            if (o.showDots && msgs.length > 1) {
                var dotsEl = document.createElement('div');
                dotsEl.className = 'bkbg-rbnr-dots';
                msgs.forEach(function (_, di) {
                    var dot = document.createElement('button');
                    dot.className = 'bkbg-rbnr-dot';
                    dot.style.background = di === 0 ? o.dotActiveColor : o.dotColor;
                    dot.addEventListener('click', function () { goTo(di); });
                    dotsEl.appendChild(dot);
                    dotBtns.push(dot);
                });
                wrap.appendChild(dotsEl);
            }

            /* ── Close button ── */
            if (o.showClose) {
                var closeBtn = document.createElement('button');
                closeBtn.className = 'bkbg-rbnr-close';
                closeBtn.innerHTML = '&times;';
                applyCSS(closeBtn, { background: o.closeBg, color: o.closeColor });
                closeBtn.addEventListener('click', function () {
                    wrap.classList.add('is-dismissed');
                    if (autoTimer) clearInterval(autoTimer);
                    cdTimers.forEach(function (t) { if (t) clearInterval(t); });
                    if (o.cookieDays > 0) setCookie(cookieName, 'dismissed', o.cookieDays);
                });
                wrap.appendChild(closeBtn);
            }

            /* ── Keyboard ── */
            wrap.setAttribute('tabindex', '0');
            wrap.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowLeft') goTo(activeIdx - 1);
                if (e.key === 'ArrowRight') goTo(activeIdx + 1);
            });

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
