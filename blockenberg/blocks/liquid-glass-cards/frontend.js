(function () {
    'use strict';

    function hexToRgb(c) {
        if (!c) return null;
        var m = c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (m) return parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16);
        // Try to extract from rgba if already that format
        var rm = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return rm ? rm[1] + ',' + rm[2] + ',' + rm[3] : '255,255,255';
    }

    function initBlock(root) {
        var app = root.querySelector('.bkbg-lgc-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var blur          = Number(o.blurAmount)      || 20;
        var glassOp       = (Number(o.glassOpacity)   || 18) / 100;
        var borderOp      = (Number(o.borderOpacity)  || 30) / 100;
        var parallax      = Number(o.parallaxStrength) || 8;
        var glassColor    = o.glassColor    || '#ffffff';
        var borderColor   = o.borderColor   || 'rgba(255,255,255,0.3)';
        var shadowColor   = o.shadowColor   || 'rgba(0,0,0,0.2)';
        var iconBg        = o.iconBg        || 'rgba(255,255,255,0.2)';
        var titleColor    = o.titleColor    || '#ffffff';
        var descColor     = o.descColor     || 'rgba(255,255,255,0.8)';
        var linkColor     = o.linkColor     || '#ffffff';

        var glassRgb  = hexToRgb(glassColor);
        var borderRgb = hexToRgb(borderColor);

        // Set CSS variable for blur
        app.style.setProperty('--bkbg-lgc-blur', blur + 'px');

        var cards = app.querySelectorAll('.bkbg-lgc-card');

        cards.forEach(function (card) {
            // Apply glass styles
            card.style.background      = 'rgba(' + glassRgb + ',' + glassOp + ')';
            card.style.backdropFilter  = 'blur(' + blur + 'px)';
            card.style.webkitBackdropFilter = 'blur(' + blur + 'px)';
            card.style.border          = '1px solid rgba(' + borderRgb + ',' + borderOp + ')';
            card.style.boxShadow       = '0 8px 32px ' + shadowColor;

            // Apply text colors
            var iconEl     = card.querySelector('.bkbg-lgc-icon');
            var titleEl    = card.querySelector('.bkbg-lgc-title');
            var descEl     = card.querySelector('.bkbg-lgc-desc');
            var linkEl     = card.querySelector('.bkbg-lgc-link');

            if (iconEl)  { iconEl.style.background = iconBg; }
            if (titleEl) { titleEl.style.color = titleColor; }
            if (descEl)  { descEl.style.color = descColor; }
            if (linkEl)  { linkEl.style.color = linkColor; }

            // Parallax on mouse move
            if (parallax > 0) {
                var raf = null;
                var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
                var inside = false;

                function animate() {
                    currentX += (targetX - currentX) * 0.1;
                    currentY += (targetY - currentY) * 0.1;
                    card.style.transform = 'translate(' + currentX + 'px,' + currentY + 'px)';

                    if (inside || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
                        raf = requestAnimationFrame(animate);
                    } else {
                        card.style.transform = '';
                        raf = null;
                    }
                }

                card.addEventListener('mousemove', function (e) {
                    var rect = app.getBoundingClientRect();
                    var cx = app.offsetWidth / 2;
                    var cy = app.offsetHeight / 2;
                    var dx = e.clientX - rect.left - cx;
                    var dy = e.clientY - rect.top  - cy;
                    // Each card moves at slightly different rate based on position
                    var cardRect = card.getBoundingClientRect();
                    var cardCX   = cardRect.left + cardRect.width / 2 - rect.left;
                    var cardCY   = cardRect.top  + cardRect.height / 2 - rect.top;
                    var distX = (cardCX - cx) / (app.offsetWidth  / 2 + 1);
                    var distY = (cardCY - cy) / (app.offsetHeight / 2 + 1);
                    targetX = -dx * 0.02 * parallax * (1 - Math.abs(distX) * 0.5);
                    targetY = -dy * 0.02 * parallax * (1 - Math.abs(distY) * 0.5);
                    if (!raf) { inside = true; raf = requestAnimationFrame(animate); }
                });

                app.addEventListener('mouseleave', function () {
                    inside = false;
                    targetX = 0; targetY = 0;
                    if (!raf) raf = requestAnimationFrame(animate);
                });
            }
        });
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-liquid-glass-cards').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
