(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Typography CSS vars helper ──────────────────────────────── */
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

    /* ── Scatter vector helpers ────────────────────────────────────── */
    function randBetween(a, b) { return a + Math.random() * (b - a); }

    function getScatterVector(mode, radius, index, total) {
        switch (mode) {
            case 'rain': {
                var angle = randBetween(-0.4, 0.4) * Math.PI + Math.PI / 2;
                return {
                    x: Math.cos(angle) * randBetween(radius * 0.2, radius * 0.6),
                    y: Math.sin(angle) * randBetween(radius * 0.6, radius),
                    rot: randBetween(-60, 60)
                };
            }
            case 'float': {
                return {
                    x: randBetween(-radius * 0.3, radius * 0.3),
                    y: -randBetween(radius * 0.5, radius),
                    rot: randBetween(-30, 30)
                };
            }
            case 'spin': {
                var a = (index / total) * Math.PI * 2 + randBetween(-0.5, 0.5);
                var r = randBetween(radius * 0.5, radius);
                return { x: Math.cos(a) * r, y: Math.sin(a) * r, rot: randBetween(-180, 180) };
            }
            default: { /* explode */
                var ang = randBetween(0, Math.PI * 2);
                var rad = randBetween(radius * 0.4, radius);
                return { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, rot: randBetween(-90, 90) };
            }
        }
    }

    /* ── Build & animate one kinetic text block ──────────────────────── */
    function initBlock(root) {
        var app = root.querySelector('.bkbg-kt-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var text           = o.text           || '';
        var tag            = o.tag            || 'h2';
        var trigger        = o.trigger        || 'hover';
        var mode           = o.scatterMode    || 'explode';
        var radius         = Number(o.scatterRadius)  || 120;
        var scatterDur     = Number(o.scatterDuration) || 400;
        var returnDur      = Number(o.returnDuration)  || 600;
        var stagger        = Number(o.stagger)         || 20;
        var fontSize       = Number(o.fontSize)        || 56;
        var fontWeight     = Number(o.fontWeight)      || 700;
        var letterSpacing  = Number(o.letterSpacing)   || 0;
        var textAlign      = o.textAlign      || 'center';
        var textColor      = o.textColor      || '#0f172a';
        var hoverColor     = o.hoverColor     || '#6366f1';
        var bgColor        = o.bgColor        || 'transparent';

        /* ── Parent wrapper ─────────────────────────────────────────── */
        root.style.background = bgColor;
        typoCssVarsForEl(root, o.textTypo, '--bkbg-kt-tx-');

        var container = document.createElement(tag);
        container.className = 'bkbg-kt-text';
        container.style.cssText = [
            'text-align:'    + textAlign,
            'justify-content:' + (textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'),
            'display:flex',
            'flex-wrap:wrap',
            'align-items:baseline',
            'margin:0',
            'user-select:none',
            'cursor:default'
        ].join(';');

        /* ── Split into spans ──────────────────────────────────────── */
        var chars = text.split('');
        var spans = chars.map(function (ch) {
            var span = document.createElement('span');
            span.className = 'bkbg-kt-char';
            span.textContent = ch === ' ' ? '\u00a0' : ch;
            span.style.color = textColor;
            container.appendChild(span);
            return span;
        });

        app.appendChild(container);
        if (reduced) return;

        /* ── Scatter state ────────────────────────────────────────── */
        var scattered = false;
        var vectors   = [];

        function computeVectors() {
            vectors = spans.map(function (_, i) {
                return getScatterVector(mode, radius, i, spans.length);
            });
        }
        computeVectors();

        function scatter() {
            if (scattered) return;
            scattered = true;
            spans.forEach(function (span, i) {
                var v   = vectors[i];
                var del = i * stagger;
                span.classList.add('bkbg-kt-scattered');
                span.style.transitionDuration  = scatterDur + 'ms';
                span.style.transitionDelay     = del + 'ms';
                span.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px) rotate(' + v.rot + 'deg)';
                span.style.opacity   = '0';
                span.style.color     = hoverColor;
            });
        }

        function collect() {
            if (!scattered) return;
            scattered = false;
            computeVectors();
            spans.forEach(function (span, i) {
                var del = (spans.length - 1 - i) * stagger * 0.5;
                span.classList.remove('bkbg-kt-scattered');
                span.style.transitionDuration = returnDur + 'ms';
                span.style.transitionDelay    = del + 'ms';
                span.style.transform = 'translate(0,0) rotate(0deg)';
                span.style.opacity   = '1';
                span.style.color     = textColor;
            });
        }

        /* ── Attach trigger ───────────────────────────────────────── */
        if (trigger === 'hover') {
            container.addEventListener('mouseenter', scatter);
            container.addEventListener('mouseleave', collect);
        } else if (trigger === 'click') {
            container.addEventListener('click', function () {
                scattered ? collect() : scatter();
            });
        } else if (trigger === 'auto') {
            var loopTimeout;
            function loopScatter() {
                scatter();
                loopTimeout = setTimeout(function () {
                    collect();
                    loopTimeout = setTimeout(loopScatter, returnDur + 800);
                }, scatterDur + spans.length * stagger + 400);
            }
            loopScatter();
        }
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-kinetic-text').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
