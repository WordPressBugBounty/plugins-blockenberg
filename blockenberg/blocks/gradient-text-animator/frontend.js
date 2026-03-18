(function () {
    'use strict';

    function buildGradient(opts) {
        var colors = [opts.color1 || '#f59e0b', opts.color2 || '#ec4899'];
        var stop = opts.stopCount || 4;
        if (stop >= 3) colors.push(opts.color3 || '#8b5cf6');
        if (stop >= 4) colors.push(opts.color4 || '#06b6d4');

        var dir = opts.direction;
        if (dir === 'radial') {
            return 'radial-gradient(circle, ' + colors.join(', ') + ')';
        }
        var angle = dir === 'diagonal' ? '135deg' : '90deg';
        return 'linear-gradient(' + angle + ', ' + colors.join(', ') + ')';
    }

    function initGTA(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        var animType = opts.animationType || 'shift';
        var speed    = (opts.animationSpeed || 4) + 's';
        var gradCss  = buildGradient(opts);
        var bgSize   = (animType === 'shift' || animType === 'rainbow' || animType === 'reveal') ? '300% 300%' : '200% 200%';

        // Outer wrapper
        var outer = document.createElement('div');
        outer.style.padding = (opts.paddingV || 24) + 'px ' + (opts.paddingH || 24) + 'px';
        outer.style.backgroundColor = opts.showBg ? (opts.bgColor || '#0f172a') : '';
        outer.style.borderRadius = (opts.borderRadius || 0) + 'px';
        outer.style.textAlign = opts.textAlign || 'center';
        outer.style.overflow = 'hidden';

        /* typography CSS vars */
        if (window.typoCssVarsForEl) window.typoCssVarsForEl(opts.typoText, '--bkbg-gta-tt-', outer);
        outer.classList.add('bkbg-gta-app');

        // Hover class helpers
        if (opts.pauseOnHover)   outer.classList.add('bkbg-gta-pause-hover');
        if (opts.reverseOnHover) outer.classList.add('bkbg-gta-reverse-hover');

        // Build text element
        var tag = opts.tag || 'h2';
        var textEl = document.createElement(tag);
        textEl.className = 'bkbg-gta-el';
        textEl.style.margin = '0';
        textEl.style.padding = '0';
        textEl.style.display = 'block';

        if (animType === 'wave') {
            // Per-character wave with staggered delay
            var words = (opts.text || '').split('');
            var charIdx = 0;
            words.forEach(function (ch) {
                if (ch === ' ') {
                    textEl.appendChild(document.createTextNode('\u00a0'));
                    charIdx++;
                    return;
                }
                var span = document.createElement('span');
                span.className = 'bkbg-gta-char';
                span.textContent = ch;
                span.style.background = gradCss;
                span.style.backgroundSize = bgSize;
                span.style.animationDuration = speed;
                span.style.animationDelay = (charIdx * 0.06) + 's';
                textEl.appendChild(span);
                charIdx++;
            });
        } else {
            // Single animated text node wrapped in span
            var inner = document.createElement('span');
            inner.className = 'bkbg-gta-text bkbg-gta-anim-' + animType;
            inner.textContent = opts.text || 'Animated Gradient Text';
            inner.style.background = gradCss;
            inner.style.backgroundSize = bgSize;
            inner.style.backgroundClip = 'text';
            inner.style.webkitBackgroundClip = 'text';
            inner.style.webkitTextFillColor = 'transparent';
            inner.style.color = 'transparent';
            inner.style.animationDuration = speed;
            inner.style.display = 'inline-block';
            inner.style.width = '100%';

            if (opts.glowEffect) {
                var blur = opts.glowBlur || 20;
                var opacity = opts.glowOpacity || 0.6;
                // Use a text-shadow-like drop-shadow on the outer element
                inner.style.filter = 'drop-shadow(0 0 ' + blur + 'px rgba(' + hexToRgb(opts.color1 || '#f59e0b') + ',' + opacity + '))';
            }

            textEl.appendChild(inner);
        }

        outer.appendChild(textEl);
        appEl.parentNode.replaceChild(outer, appEl);
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        var n = parseInt(hex, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-gta-app').forEach(initGTA);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-gta-app').forEach(initGTA);
    }
})();
