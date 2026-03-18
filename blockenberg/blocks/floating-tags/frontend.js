(function () {
    'use strict';

    /* ── Typography CSS-var helper ──────────────────────────────── */
    var defined = function (v) { return v !== undefined && v !== null && v !== ''; };
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family:              'font-family',
            weight:              'font-weight',
            style:               'font-style',
            decoration:          'text-decoration',
            transform:           'text-transform',
            sizeDesktop:         'font-size-d',
            sizeTablet:          'font-size-t',
            sizeMobile:          'font-size-m',
            lineHeightDesktop:   'line-height-d',
            lineHeightTablet:    'line-height-t',
            lineHeightMobile:    'line-height-m',
            letterSpacingDesktop:'letter-spacing-d',
            letterSpacingTablet: 'letter-spacing-t',
            letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop:  'word-spacing-d',
            wordSpacingTablet:   'word-spacing-t',
            wordSpacingMobile:   'word-spacing-m'
        };
        var needsPx = { sizeDesktop:1,sizeTablet:1,sizeMobile:1,letterSpacingDesktop:1,letterSpacingTablet:1,letterSpacingMobile:1,wordSpacingDesktop:1,wordSpacingTablet:1,wordSpacingMobile:1 };
        Object.keys(m).forEach(function (k) {
            if (defined(typo[k])) {
                var v = typo[k];
                if (needsPx[k] && typeof v === 'number') v = v + (typo[k.replace(/Desktop|Tablet|Mobile/, 'Unit')] || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
        if (defined(typo.family)) el.style.setProperty(prefix + 'font-family', typo.family + ', sans-serif');
    }

    document.querySelectorAll('.bkbg-ft-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var tags          = Array.isArray(o.tags) ? o.tags : [];
        var minFontSize   = o.minFontSize   || 13;
        var maxFontSize   = o.maxFontSize   || 26;
        var tagRadius     = o.tagRadius     || 100;
        var tagPaddingH   = o.tagPaddingH   || 14;
        var tagPaddingV   = o.tagPaddingV   || 7;
        var gap           = o.gap           || 10;
        var animateFloat  = !!o.animateFloat;
        var floatAmp      = o.floatAmplitude || 8;
        var floatSpeed    = o.floatSpeed    || 3;
        var hoverScale    = o.hoverScale    || 1.1;
        var showSizes     = !!o.showSizes;
        var alignment     = o.alignment     || 'center';
        var tagBg         = o.tagBg         || '#f1f5f9';
        var tagColor      = o.tagColor      || '#334155';
        var tagHoverBg    = o.tagHoverBg    || '#6366f1';
        var tagHoverColor = o.tagHoverColor || '#ffffff';
        var tagBorder     = o.tagBorder     || '#e2e8f0';
        var sectionBg     = o.sectionBg     || '';

        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (sectionBg) app.style.background = sectionBg;

        typoCssVarsForEl(o.typoTag, '--bkbg-ft-tg-', app);

        /* ── CSS vars on app ── */
        app.style.setProperty('--ft-hover-bg',  tagHoverBg);
        app.style.setProperty('--ft-hover-clr', tagHoverColor);
        app.style.setProperty('--ft-border',    tagBorder);

        /* ── Build cloud ── */
        var cloud = document.createElement('div');
        cloud.className = 'bkbg-ft-cloud';
        cloud.style.gap = gap + 'px';
        cloud.style.justifyContent = alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';
        cloud.style.padding = '16px 0';

        tags.forEach(function (tag, idx) {
            var s = Math.max(1, Math.min(3, tag.size || 1));
            var t = showSizes ? (s - 1) / 2 : 0.5;
            var fs = Math.round(minFontSize + t * (maxFontSize - minFontSize));
            var fw = s >= 3 ? 700 : s >= 2 ? 600 : 400;

            var el;
            if (tag.url) {
                el = document.createElement('a');
                el.href = tag.url;
            } else {
                el = document.createElement('span');
            }

            el.className = 'bkbg-ft-tag';
            el.textContent = tag.text || '';

            el.style.fontSize   = fs + 'px';
            el.style.fontWeight = fw;
            el.style.background = tagBg;
            el.style.color      = tagColor;
            el.style.borderRadius = tagRadius + 'px';
            el.style.padding    = tagPaddingV + 'px ' + tagPaddingH + 'px';

            /* float animation */
            if (animateFloat && !reducedMotion) {
                var delay  = (idx * 317) % (floatSpeed * 1000);
                var dur    = floatSpeed + (idx % 3) * 0.6;
                el.style.setProperty('--ft-amp',   '-' + floatAmp + 'px');
                el.style.setProperty('--ft-dur',   dur + 's');
                el.style.setProperty('--ft-delay', (delay / 1000) + 's');
                el.classList.add('bkbg-ft-floating');
            }

            /* hover scale */
            el.addEventListener('mouseenter', function () {
                el.style.transform = 'scale(' + hoverScale + ')';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });

            cloud.appendChild(el);
        });

        app.appendChild(cloud);
    });
}());
