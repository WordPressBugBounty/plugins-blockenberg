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

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function lerp(a, b, t) { return a + (b - a) * t; }

    /* ── Build one card DOM ──────────────────────────────────────────── */
    function buildCard(card, o) {
        var w = o.cardWidth  || 320;
        var h = o.cardHeight || 420;
        var r = o.cardRadius || 24;

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-pdc-card';
        wrap.style.cssText = [
            'width:'  + w + 'px',
            'height:' + h + 'px',
            'border-radius:' + r + 'px',
            'background:' + (card.bgImage
                ? 'url(' + card.bgImage + ') center/cover no-repeat, ' + (card.bgColor || '#1a1035')
                : (card.bgColor || '#1a1035'))
        ].join(';');

        /* overlay */
        var overlay = document.createElement('div');
        overlay.className = 'bkbg-pdc-overlay';
        overlay.style.background = o.overlayColor || 'rgba(0,0,0,0.25)';
        wrap.appendChild(overlay);

        /* glow orb */
        var glow = document.createElement('div');
        glow.className = 'bkbg-pdc-layer bkbg-pdc-glow';
        glow.dataset.depth = '1';
        glow.style.cssText = 'position:absolute;width:180px;height:180px;border-radius:50%' +
            ';background:' + (o.glowColor || 'rgba(99,102,241,0.5)') +
            ';filter:blur(60px);top:10%;left:60%;pointer-events:none';
        wrap.appendChild(glow);

        /* badge */
        if (o.showBadge !== false && card.badge) {
            var badge = document.createElement('div');
            badge.className = 'bkbg-pdc-layer bkbg-pdc-badge';
            badge.dataset.depth = '2';
            badge.style.cssText = [
                'position:absolute', 'top:20px', 'left:20px',
                'background:' + (o.badgeBg || '#6366f1'),
                'color:' + (o.badgeColor || '#ffffff'),
                'font-size:' + (o.badgeFontSize || 11) + 'px',
                'font-weight:700', 'padding:4px 12px',
                'border-radius:99px', 'letter-spacing:0.08em',
                'text-transform:uppercase'
            ].join(';');
            badge.textContent = card.badge;
            wrap.appendChild(badge);
        }

        /* icon */
        if (o.showIcon !== false && card.icon) {
            var icon = document.createElement('div');
            icon.className = 'bkbg-pdc-layer bkbg-pdc-icon';
            icon.dataset.depth = '3';
            icon.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)' +
                ';font-size:' + (o.iconSize || 48) + 'px;line-height:1' +
                ';filter:drop-shadow(0 8px 24px rgba(0,0,0,0.5))';
            var _IP = window.bkbgIconPicker;
            var _iType = card.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor);
                if (_in) icon.appendChild(_in); else icon.textContent = card.icon;
            } else { icon.textContent = card.icon; }
            wrap.appendChild(icon);
        }

        /* content */
        var content = document.createElement('div');
        content.className = 'bkbg-pdc-layer bkbg-pdc-content';
        content.dataset.depth = '1.5';
        content.style.cssText = 'position:absolute;bottom:0;left:0;right:0;padding:24px' +
            ';background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 100%)';

        if (o.showTag !== false && card.tag) {
            var tag = document.createElement('div');
            tag.style.cssText = 'display:inline-block;background:' + (o.tagBg || 'rgba(255,255,255,0.15)') +
                ';color:' + (o.tagColor || '#ffffff') +
                ';font-size:11px;font-weight:600;padding:2px 10px;border-radius:99px;margin-bottom:8px;backdrop-filter:blur(4px)';
            tag.textContent = card.tag;
            content.appendChild(tag);
        }

        var title = document.createElement('div');
        title.className = 'bkbg-pdc-title';
        title.style.color = o.titleColor || '#ffffff';
        title.style.marginBottom = '4px';
        title.textContent = card.title || '';
        content.appendChild(title);

        var sub = document.createElement('div');
        sub.className = 'bkbg-pdc-subtitle';
        sub.style.color = o.subtitleColor || 'rgba(255,255,255,0.7)';
        sub.textContent = card.subtitle || '';
        content.appendChild(sub);

        wrap.appendChild(content);

        return wrap;
    }

    /* ── Parallax logic for one card ─────────────────────────────────── */
    function attachParallax(card, o) {
        if (reduced) return;

        var tilt  = o.tiltStrength  || 20;
        var depth = o.depthStrength || 30;

        var currX = 0, currY = 0;
        var targetX = 0, targetY = 0;
        var rafId;

        function tick() {
            currX = lerp(currX, targetX, 0.08);
            currY = lerp(currY, targetY, 0.08);

            card.style.transform = 'perspective(900px) rotateX(' + (-currY * tilt).toFixed(2) + 'deg) rotateY(' + (currX * tilt).toFixed(2) + 'deg)';

            card.querySelectorAll('.bkbg-pdc-layer[data-depth]').forEach(function (layer) {
                var d = parseFloat(layer.dataset.depth) || 1;
                var tx = (currX * depth * d).toFixed(2);
                var ty = (currY * depth * d).toFixed(2);
                layer.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px, ' + (d * 8) + 'px)';
            });

            if (Math.abs(currX - targetX) > 0.001 || Math.abs(currY - targetY) > 0.001) {
                rafId = requestAnimationFrame(tick);
            }
        }

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            targetX  = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
            targetY  = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(tick);
        });

        card.addEventListener('mouseleave', function () {
            targetX = 0; targetY = 0;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(tick);
        });
    }

    /* ── Mount ─────────────────────────────────────────────────────── */
    function initBlock(root) {
        var app = root.querySelector('.bkbg-pdc-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        typoCssVarsForEl(app, o.titleTypo, '--bkbg-pdc-tt-');
        typoCssVarsForEl(app, o.subtitleTypo, '--bkbg-pdc-st-');

        var cards = Array.isArray(o.cards) ? o.cards : [];
        var cols  = Number(o.columns) || 3;

        var grid = document.createElement('div');
        grid.className = 'bkbg-pdc-grid';
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:24px;justify-content:center';

        cards.forEach(function (card) {
            var cardEl = buildCard(card, o);
            attachParallax(cardEl, o);
            grid.appendChild(cardEl);
        });

        app.appendChild(grid);
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-parallax-depth-cards').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
