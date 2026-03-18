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

    function initBlock(root) {
        var wrap = root.querySelector('.bkbg-mgb-wrap');
        if (!wrap) return;

        var raw = wrap.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var magnetStrength = Number(o.magnetStrength) || 40;
        var magnetRadius   = Number(o.magnetRadius)   || 120;
        var ripple         = o.ripple !== false;
        var buttonStyle    = o.buttonStyle || 'filled';
        var paddingX       = Number(o.paddingX) || 40;
        var paddingY       = Number(o.paddingY) || 18;
        var borderRadius   = Number(o.borderRadius) || 999;
        var borderWidth    = Number(o.borderWidth)  || 2;
        var btnBg          = o.btnBg          || '#6366f1';
        var btnColor       = o.btnColor       || '#ffffff';
        var btnBorderColor = o.btnBorderColor || '#6366f1';
        var hoverBg        = o.hoverBg        || '#4f46e5';
        var hoverColor     = o.hoverColor     || '#ffffff';
        var rippleColor    = o.rippleColor    || 'rgba(255,255,255,0.35)';
        var shadowColor    = o.shadowColor    || 'rgba(99,102,241,0.4)';

        var btn = wrap.querySelector('.bkbg-mgb-btn');
        if (!btn) return;

        var isOutline = buttonStyle === 'outline';
        var isGhost   = buttonStyle === 'ghost';

        // Apply base styles
        btn.style.padding      = paddingY + 'px ' + paddingX + 'px';
        btn.style.borderRadius = borderRadius + 'px';
        btn.style.background   = isOutline || isGhost ? 'transparent' : btnBg;
        btn.style.color        = isOutline || isGhost ? btnBg : btnColor;
        btn.style.border       = isGhost ? 'none' : borderWidth + 'px solid ' + btnBorderColor;
        btn.style.boxShadow    = isOutline || isGhost ? 'none' : '0 4px 20px ' + shadowColor;

        // Apply typography CSS vars on root
        typoCssVarsForEl(root, o.textTypo, '--bkbg-mgb-tx-');

        // Respect reduced-motion
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ── Magnetic tracking ────────────────────────────────────────────
        var raf = null;
        var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        var isHovered = false;
        var isNear    = false;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function animate() {
            currentX = lerp(currentX, targetX, 0.15);
            currentY = lerp(currentY, targetY, 0.15);

            btn.style.transform = 'translate(' + currentX + 'px,' + currentY + 'px)';

            if (isNear || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
                raf = requestAnimationFrame(animate);
            } else {
                btn.style.transform = '';
                raf = null;
            }
        }

        function getCenter() {
            var r = btn.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }

        document.addEventListener('mousemove', function (e) {
            if (reducedMotion) return;
            var center = getCenter();
            var dx = e.clientX - center.x;
            var dy = e.clientY - center.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < magnetRadius) {
                isNear = true;
                var power = (1 - dist / magnetRadius); // 0→1 as cursor gets closer
                targetX = dx * power * (magnetStrength / 100);
                targetY = dy * power * (magnetStrength / 100);
                if (!raf) raf = requestAnimationFrame(animate);
            } else if (isNear) {
                isNear = false;
                targetX = 0;
                targetY = 0;
                if (!raf) raf = requestAnimationFrame(animate);
            }
        }, { passive: true });

        // ── Hover colour swap ────────────────────────────────────────────
        btn.addEventListener('mouseenter', function () {
            isHovered = true;
            btn.style.background = isOutline || isGhost ? (isGhost ? 'transparent' : 'transparent') : hoverBg;
            btn.style.color      = isOutline || isGhost ? hoverBg : hoverColor;
            btn.style.boxShadow  = isOutline || isGhost ? 'none' : '0 8px 32px ' + shadowColor;
        });

        btn.addEventListener('mouseleave', function () {
            isHovered = false;
            btn.style.background = isOutline || isGhost ? 'transparent' : btnBg;
            btn.style.color      = isOutline || isGhost ? btnBg : btnColor;
            btn.style.boxShadow  = isOutline || isGhost ? 'none' : '0 4px 20px ' + shadowColor;
        });

        // ── Ripple on click ──────────────────────────────────────────────
        if (ripple) {
            btn.addEventListener('click', function (e) {
                var r   = btn.getBoundingClientRect();
                var x   = e.clientX - r.left;
                var y   = e.clientY - r.top;
                var size = Math.max(r.width, r.height);

                var rpl = document.createElement('span');
                rpl.className = 'bkbg-mgb-ripple';
                rpl.style.cssText = [
                    'width:' + size + 'px',
                    'height:' + size + 'px',
                    'left:' + (x - size / 2) + 'px',
                    'top:' + (y - size / 2) + 'px',
                    'background:' + rippleColor
                ].join(';');

                btn.appendChild(rpl);
                rpl.addEventListener('animationend', function () { rpl.remove(); });
            });
        }
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-magnetic-button').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
