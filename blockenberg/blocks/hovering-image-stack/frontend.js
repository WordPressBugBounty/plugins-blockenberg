(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Compute transform per card ──────────────────────────────────── */
    function getTransform(idx, total, spreadAngle, spreadDist, hovered) {
        var mid   = (total - 1) / 2;
        var diff  = idx - mid;
        var angle = diff * spreadAngle;
        var tx    = diff * 18;
        var ty    = Math.abs(diff) * 4;
        var scale = 1 - Math.abs(diff) * 0.03;
        if (hovered) {
            tx    = diff * spreadDist;
            angle = 0;
            ty    = 0;
            scale = 1;
        }
        return 'translateX(' + tx + 'px) translateY(' + ty + 'px) rotate(' + angle + 'deg) scale(' + scale + ')';
    }

    function initBlock(root) {
        var app = root.querySelector('.bkbg-his-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var images        = Array.isArray(o.images) ? o.images : [];
        var imageWidth    = Number(o.imageWidth)    || 200;
        var imageHeight   = Number(o.imageHeight)   || 280;
        var imageRadius   = Number(o.imageRadius)   || 16;
        var spreadAngle   = Number(o.spreadAngle)   || 15;
        var spreadDist    = Number(o.spreadDist)    || 60;
        var borderWidth   = Number(o.borderWidth)   || 3;
        var borderColor   = o.borderColor           || '#ffffff';
        var shadowAlpha   = (Number(o.shadowStrength) / 100 || 0.3).toFixed(2);
        var showCaption   = !!o.showCaption;
        var captionSize   = Number(o.captionSize)   || 13;
        var captionColor  = o.captionColor          || '#0f172a';
        var captionBg     = o.captionBg             || '#ffffff';
        var bgColor       = o.bgColor               || 'transparent';

        if (images.length === 0) return;

        /* typography CSS vars */
        typoCssVarsForEl(o.captionTypo, '--bkbg-his-cap-', root);
        if (captionSize && captionSize !== 13) root.style.setProperty('--bkbg-his-cap-sz', captionSize + 'px');

        /* ── Outer wrapper ─────────────────────────────────────────── */
        var outer = document.createElement('div');
        outer.className = 'bkbg-his-outer';
        outer.style.background = bgColor;

        /* ── Stack ──────────────────────────────────────────────────── */
        var stack = document.createElement('div');
        stack.className = 'bkbg-his-stack';
        var total   = images.length;
        var mid     = (total - 1) / 2;
        stack.style.height   = imageHeight + 'px';
        stack.style.minWidth = (imageWidth + total * Math.max(spreadDist, 30)) + 'px';

        var cards = images.map(function (img, i) {
            var card = document.createElement('div');
            card.className = 'bkbg-his-card';
            card.style.cssText = [
                'width:'         + imageWidth    + 'px',
                'height:'        + imageHeight   + 'px',
                'border-radius:' + imageRadius   + 'px',
                'border:'        + borderWidth   + 'px solid ' + borderColor,
                'box-shadow:0 8px 32px rgba(0,0,0,' + shadowAlpha + ')',
                'z-index:'       + i,
                'transform:'     + getTransform(i, total, spreadAngle, 0, false)
            ].join(';');

            var imgEl = document.createElement('img');
            imgEl.src     = img.url || '';
            imgEl.alt     = img.alt || '';
            imgEl.loading = 'lazy';
            imgEl.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none';
            card.appendChild(imgEl);

            if (showCaption && img.caption) {
                var cap = document.createElement('div');
                cap.className = 'bkbg-his-caption';
                cap.textContent = img.caption;
                cap.style.color = captionColor;
                cap.style.background = captionBg;
                card.appendChild(cap);
            }

            stack.appendChild(card);
            return card;
        });

        outer.appendChild(stack);
        app.appendChild(outer);

        if (reduced) return;

        /* ── Hover interaction ──────────────────────────────────────── */
        stack.addEventListener('mouseenter', function () {
            cards.forEach(function (card, i) {
                card.style.transform = getTransform(i, total, spreadAngle, spreadDist, true);
                card.style.zIndex    = total - i;
                card.style.boxShadow = '0 12px 40px rgba(0,0,0,' + Math.min(parseFloat(shadowAlpha) * 1.5, 0.6) + ')';
            });
        });

        stack.addEventListener('mouseleave', function () {
            cards.forEach(function (card, i) {
                card.style.transform = getTransform(i, total, spreadAngle, 0, false);
                card.style.zIndex    = i;
                card.style.boxShadow = '0 8px 32px rgba(0,0,0,' + shadowAlpha + ')';
            });
        });
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-hovering-image-stack').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
