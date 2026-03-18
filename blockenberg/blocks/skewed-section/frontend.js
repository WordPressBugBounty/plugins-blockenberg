(function () {
    'use strict';

    function hexToRgb(hex) {
        if (!hex || hex.charAt(0) !== '#') return '0,0,0';
        return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16);
    }

    function buildClipPath(cfg) {
        var topLeft, topRight, botLeft, botRight;
        var tOff = cfg.topAngle;
        var bOff = cfg.bottomAngle;

        if (cfg.skewTop) {
            if (cfg.topDir === 'left-low') {
                topLeft  = tOff + '%';
                topRight = '0%';
            } else {
                topLeft  = '0%';
                topRight = tOff + '%';
            }
        } else {
            topLeft = topRight = '0%';
        }

        if (cfg.skewBottom) {
            if (cfg.bottomDir === 'left-low') {
                botLeft  = '100%';
                botRight = (100 - bOff) + '%';
            } else {
                botLeft  = (100 - bOff) + '%';
                botRight = '100%';
            }
        } else {
            botLeft = botRight = '100%';
        }

        return 'polygon(0 ' + topLeft + ', 100% ' + topRight + ', 100% ' + botRight + ', 0 ' + botLeft + ')';
    }

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function applySection(wrap) {
        var cfg = {
            skewTop:       wrap.dataset.skewTop        === 'true',
            skewBottom:    wrap.dataset.skewBottom      === 'true',
            topAngle:      parseFloat(wrap.dataset.topAngle)     || 4,
            bottomAngle:   parseFloat(wrap.dataset.bottomAngle)  || 4,
            topDir:        wrap.dataset.topDir          || 'left-low',
            bottomDir:     wrap.dataset.bottomDir       || 'left-high',
            bg:            wrap.dataset.bg              || '#1e40af',
            gradient:      wrap.dataset.gradient        === 'true',
            bgEnd:         wrap.dataset.bgEnd           || '#7c3aed',
            gradAngle:     parseInt(wrap.dataset.gradAngle, 10)  || 135,
            bgImg:         wrap.dataset.bgImg           || '',
            bgSize:        wrap.dataset.bgSize          || 'cover',
            bgPos:         wrap.dataset.bgPos           || 'center center',
            overlayColor:  wrap.dataset.overlayColor    || '#1e40af',
            overlayOp:     parseFloat(wrap.dataset.overlayOpacity) || 0,
            minHeight:     parseInt(wrap.dataset.minHeight, 10)  || 400,
            pt:            parseInt(wrap.dataset.pt, 10)         || 100,
            pb:            parseInt(wrap.dataset.pb, 10)         || 100,
            extraPad:      wrap.dataset.extraPad        !== 'false',
            maxWidth:      parseInt(wrap.dataset.maxWidth, 10)   || 1100,
            textColor:     wrap.dataset.textColor       || '#ffffff',
            textAlign:     wrap.dataset.textAlign       || 'left',
        };

        var mobile = isMobile();

        /* Background */
        if (cfg.bgImg) {
            var overlayStr = cfg.overlayOp > 0
                ? 'linear-gradient(rgba(' + hexToRgb(cfg.overlayColor) + ',' + (cfg.overlayOp / 100) + '),rgba(' + hexToRgb(cfg.overlayColor) + ',' + (cfg.overlayOp / 100) + ')),'
                : '';
            wrap.style.backgroundImage    = overlayStr + 'url(' + cfg.bgImg + ')';
            wrap.style.backgroundSize     = cfg.bgSize;
            wrap.style.backgroundPosition = cfg.bgPos;
        } else if (cfg.gradient) {
            wrap.style.background = 'linear-gradient(' + cfg.gradAngle + 'deg,' + cfg.bg + ',' + cfg.bgEnd + ')';
        } else {
            wrap.style.background = cfg.bg;
        }

        /* Clip-path — skip on mobile */
        if (!mobile) {
            var cp = buildClipPath(cfg);
            wrap.style.clipPath        = cp;
            wrap.style.webkitClipPath  = cp;
        } else {
            // Ensure we remove any previously applied clip-path when
            // resizing from desktop to mobile.
            wrap.style.clipPath        = 'none';
            wrap.style.webkitClipPath  = 'none';
        }

        /* Min-height & padding */
        wrap.style.minHeight = cfg.minHeight + 'px';
        var extraTop    = (cfg.skewTop    && cfg.extraPad && !mobile) ? (cfg.topAngle * 6)    : 0;
        var extraBottom = (cfg.skewBottom && cfg.extraPad && !mobile) ? (cfg.bottomAngle * 6) : 0;
        wrap.style.paddingTop    = (cfg.pt + extraTop)    + 'px';
        wrap.style.paddingBottom = (cfg.pb + extraBottom) + 'px';

        /* Text color */
        wrap.style.color = cfg.textColor;

        /* Content inner restrictions */
        var content = wrap.querySelector('.bksk-content');
        if (content) {
            content.style.maxWidth   = cfg.maxWidth + 'px';
            content.style.margin     = '0 auto';
            content.style.padding    = '0 24px';
            content.style.textAlign  = cfg.textAlign;
        }
    }

    function init() {
        var wraps = document.querySelectorAll('.bksk-wrap[data-bg]');
        wraps.forEach(function (wrap) { applySection(wrap); });

        /* Recompute clip-path on resize (mobile breakpoint) */
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                wraps.forEach(function (wrap) { applySection(wrap); });
            }, 150);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
