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

    document.querySelectorAll('.bkbg-rit-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var tiles        = Array.isArray(o.tiles) ? o.tiles : [];
        var columns      = o.columns      || 3;
        var tileWidth    = o.tileWidth    || 300;
        var tileHeight   = o.tileHeight   || 200;
        var tileRadius   = o.tileRadius   || 16;
        var flipDuration = o.flipDuration || 600;
        var staggerDelay = o.staggerDelay || 300;
        var autoFlip     = !!o.autoFlip;
        var autoInterval = o.autoInterval || 3000;
        var flipOnHover  = !!o.flipOnHover;
        var flipAxis     = o.flipAxis === 'X' ? 'X' : 'Y';
        var showLabel    = !!o.showLabel;
        var labelSize    = o.labelSize  || 14;
        var labelColor   = o.labelColor || '#ffffff';
        var labelBg      = o.labelBg    || 'rgba(0,0,0,0.5)';
        var gap          = o.gap        || 16;

        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ── Build grid ── */
        var grid = document.createElement('div');
        grid.className = 'bkbg-rit-grid bkbg-rit-axis-' + flipAxis.toLowerCase();
        grid.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        grid.style.gap = gap + 'px';

        typoCssVarsForEl(app, o.labelTypo, '--bkrit-lt-');

        var tileElements = [];

        tiles.forEach(function (tile, idx) {
            /* outer wrapper (perspective) */
            var wrapper = document.createElement('div');
            wrapper.className = 'bkbg-rit-tile';
            wrapper.style.width  = tileWidth  + 'px';
            wrapper.style.height = tileHeight + 'px';
            wrapper.style.borderRadius = tileRadius + 'px';
            wrapper.style.maxWidth = '100%';

            /* flip inner */
            var inner = document.createElement('div');
            inner.className = 'bkbg-rit-inner';
            inner.style.transitionDuration = (reducedMotion ? 0 : flipDuration) + 'ms';

            /* front face */
            var front = document.createElement('div');
            front.className = 'bkbg-rit-front';
            front.style.borderRadius = tileRadius + 'px';
            if (tile.frontUrl) {
                front.style.backgroundImage = 'url(' + tile.frontUrl + ')';
            } else {
                front.style.background = tile.frontBg || '#6366f1';
            }

            /* back face */
            var back = document.createElement('div');
            back.className = 'bkbg-rit-back';
            back.style.borderRadius = tileRadius + 'px';
            if (tile.backUrl) {
                back.style.backgroundImage = 'url(' + tile.backUrl + ')';
            } else {
                back.style.background = tile.backBg || '#a5b4fc';
            }

            /* label (on back face) */
            if (showLabel && tile.label) {
                var label = document.createElement('div');
                label.className = 'bkbg-rit-label';
                label.textContent = tile.label;
                label.style.color      = labelColor;
                label.style.background = labelBg;
                back.appendChild(label);
            }

            inner.appendChild(front);
            inner.appendChild(back);
            wrapper.appendChild(inner);
            grid.appendChild(wrapper);

            tileElements.push({ wrapper: wrapper, inner: inner, flipped: false });

            /* flip on hover */
            if (flipOnHover && !reducedMotion) {
                wrapper.addEventListener('mouseenter', function () {
                    inner.classList.add('bkbg-rit-flipped');
                    tileElements[idx].flipped = true;
                });
                wrapper.addEventListener('mouseleave', function () {
                    inner.classList.remove('bkbg-rit-flipped');
                    tileElements[idx].flipped = false;
                });
            }

            /* click to flip toggle */
            wrapper.addEventListener('click', function () {
                var tf = tileElements[idx];
                tf.flipped = !tf.flipped;
                tf.inner.classList.toggle('bkbg-rit-flipped', tf.flipped);
            });
        });

        app.appendChild(grid);

        /* ── Auto flip ── */
        if (autoFlip && !reducedMotion) {
            var currentIdx = 0;
            var flipping   = false;

            function flipNext() {
                if (flipping || tileElements.length === 0) return;
                flipping = true;

                var sequence = tileElements.map(function (_, i) { return i; });

                sequence.forEach(function (i, order) {
                    setTimeout(function () {
                        tileElements[i].flipped = true;
                        tileElements[i].inner.classList.add('bkbg-rit-flipped');
                    }, order * staggerDelay);
                });

                var totalDelay = sequence.length * staggerDelay + flipDuration + 200;

                setTimeout(function () {
                    sequence.forEach(function (i, order) {
                        setTimeout(function () {
                            tileElements[i].flipped = false;
                            tileElements[i].inner.classList.remove('bkbg-rit-flipped');
                        }, order * staggerDelay);
                    });

                    setTimeout(function () {
                        flipping = false;
                    }, sequence.length * staggerDelay + flipDuration);
                }, totalDelay);
            }

            /* Use Intersection Observer to trigger only when visible */
            var autoTimer = null;

            function startAuto() {
                if (autoTimer) return;
                autoTimer = setInterval(flipNext, autoInterval + tileElements.length * staggerDelay + flipDuration * 2 + 600);
            }
            function stopAuto() {
                if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { startAuto(); }
                    else { stopAuto(); }
                });
            }, { threshold: 0.1 });

            observer.observe(app);
        }
    });
}());
