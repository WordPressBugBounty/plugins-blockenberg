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
        Object.keys(_typoKeys).forEach(function(k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var anchors = document.querySelectorAll('.bkbg-rp-anchor[data-position]');
        if (!anchors.length) return;

        anchors.forEach(function (anchor) {
            var d        = anchor.dataset;
            var height   = parseInt(d.height, 10)  || 4;
            var position = d.position || 'top';
            var color    = d.color    || '#2563eb';
            var bgColor  = d.bg       || '#e5e7eb';
            var showPct  = d.pct      === '1';
            var zIndex   = parseInt(d.zindex, 10)  || 9999;
            var smooth   = d.animation !== 'none';
            var gradient = d.gradient || '';

            var labelTypo;
            try { labelTypo = JSON.parse(anchor.getAttribute('data-label-typo') || '{}'); } catch(e) { labelTypo = {}; }

            var barBg = gradient
                ? 'linear-gradient(90deg,' + color + ',' + gradient + ')'
                : color;

            /* Create bar wrapper */
            var wrap = document.createElement('div');
            wrap.className  = 'bkbg-rp-bar-wrap bkbg-rp-' + position;
            wrap.style.cssText = [
                '--bkbg-rp-h:'     + height   + 'px',
                '--bkbg-rp-bg:'    + bgColor,
                '--bkbg-rp-color:' + color,
                '--bkbg-rp-z:'     + zIndex,
            ].join(';');

            typoCssVarsForEl(wrap, labelTypo, '--bkrp-lt-');

            var bar = document.createElement('div');
            bar.className = 'bkbg-rp-bar' + (smooth ? ' bkbg-rp-smooth' : '');
            bar.style.background = barBg;
            wrap.appendChild(bar);

            var pctEl;
            if (showPct) {
                pctEl = document.createElement('span');
                pctEl.className = 'bkbg-rp-pct';
                pctEl.textContent = '0%';
                wrap.appendChild(pctEl);
            }

            document.body.appendChild(wrap);

            /* Scroll handler */
            var ticking = false;
            function update() {
                var scrollTop  = window.scrollY || document.documentElement.scrollTop;
                var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
                var pct        = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
                bar.style.width = pct + '%';
                if (pctEl) pctEl.textContent = pct + '%';
                ticking = false;
            }

            window.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(update);
                    ticking = true;
                }
            }, { passive: true });

            /* Initial render */
            update();
        });
    });
})();
