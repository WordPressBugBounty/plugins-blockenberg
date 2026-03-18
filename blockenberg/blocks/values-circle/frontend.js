(function () {
    'use strict';

    var svgNS = 'http://www.w3.org/2000/svg';

    function mkEl(tag, attrs, text) {
        var el = document.createElementNS(svgNS, tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
        if (text != null) el.textContent = text;
        return el;
    }

    document.querySelectorAll('.bkbg-vc-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var values         = Array.isArray(o.values) ? o.values : [];
        var centerText     = o.centerText     || 'Our Values';
        var size           = o.size           || 520;
        var orbitRadius    = o.orbitRadius    || 38;
        var centerRadius   = o.centerRadius   || 22;
        var iconSize       = o.iconSize       || 32;
        var labelSize      = o.labelSize      || 14;
        var descSize       = o.descSize       || 12;
        var centerTextSize = o.centerTextSize || 20;
        var showDesc       = !!o.showDescription;
        var animate        = !!o.animate;
        var animDur        = o.animateDuration || 800;
        var lineStyle      = o.lineStyle      || 'dashed';
        var nodeBg         = o.nodeBg         || '#6366f1';
        var centerBg       = o.centerBg       || '#0f172a';
        var centerColor    = o.centerColor    || '#ffffff';
        var lineColor      = o.lineColor      || '#cbd5e1';
        var labelColor     = o.labelColor     || '#0f172a';
        var descColor      = o.descColor      || '#64748b';
        var sectionBg      = o.sectionBg      || '';

        if (sectionBg) app.style.background = sectionBg;

        var n  = values.length;
        if (n === 0) return;

        var cx    = size / 2;
        var cy    = size / 2;
        var OR    = (size / 2) * (orbitRadius  / 100);
        var CR    = (size / 2) * (centerRadius / 100);
        var nodeR = CR * 0.75;
        var dash  = lineStyle === 'dashed' ? '6 4' : 'none';

        /* ── Build SVG ── */
        var svg = mkEl('svg', {
            viewBox: '0 0 ' + size + ' ' + size,
            width: '100%',
            style: 'max-width:' + size + 'px;overflow:visible;display:block;margin:0 auto'
        });

        var nodes = values.map(function (v, i) {
            var angle = (2 * Math.PI * i / n) - Math.PI / 2;
            return { x: cx + OR * Math.cos(angle), y: cy + OR * Math.sin(angle), v: v, angle: angle };
        });

        /* connector lines */
        nodes.forEach(function (node, i) {
            var line = mkEl('line', {
                x1: cx, y1: cy, x2: node.x, y2: node.y,
                stroke: lineColor, 'stroke-width': 1.5,
                'stroke-dasharray': dash, opacity: 0.7,
                class: 'bkbg-vc-line'
            });
            svg.appendChild(line);
        });

        /* orbit ring */
        svg.appendChild(mkEl('circle', {
            cx: cx, cy: cy, r: OR,
            fill: 'none', stroke: lineColor, 'stroke-width': 1,
            'stroke-dasharray': '4 6', opacity: 0.4
        }));

        /* center circle */
        svg.appendChild(mkEl('circle', { cx: cx, cy: cy, r: CR, fill: centerBg }));
        var cText = mkEl('text', {
            x: cx, y: cy,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            'font-size': centerTextSize, 'font-weight': 700, fill: centerColor,
            'font-family': 'inherit'
        }, centerText);
        svg.appendChild(cText);

        /* nodes */
        nodes.forEach(function (node, i) {
            var g = mkEl('g', { class: 'bkbg-vc-node-g' });
            if (animate) {
                g.style.setProperty('--vc-cx', cx + 'px');
                g.style.setProperty('--vc-cy', cy + 'px');
                g.style.transitionDelay = (i * (animDur / n)) + 'ms';
            }

            /* node circle */
            var circle = mkEl('circle', {
                cx: node.x, cy: node.y, r: nodeR,
                fill: nodeBg, class: 'bkbg-vc-node-circle'
            });
            g.appendChild(circle);

            /* icon */
            var _IP = window.bkbgIconPicker;
            var _iType = node.v.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _built = _IP.buildFrontendIcon(_iType, node.v.icon, node.v.iconDashicon, node.v.iconImageUrl, node.v.iconDashiconColor);
                if (_built) {
                    var fo = document.createElementNS(svgNS, 'foreignObject');
                    fo.setAttribute('x', node.x - nodeR * 0.5);
                    fo.setAttribute('y', node.y - nodeR * 0.5);
                    fo.setAttribute('width', nodeR);
                    fo.setAttribute('height', nodeR);
                    var foDiv = document.createElement('div');
                    foDiv.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:' + (iconSize * 0.55) + 'px;line-height:1;';
                    foDiv.appendChild(_built);
                    fo.appendChild(foDiv);
                    g.appendChild(fo);
                } else {
                    g.appendChild(mkEl('text', {
                        x: node.x, y: node.y,
                        'text-anchor': 'middle', 'dominant-baseline': 'middle',
                        'font-size': iconSize * 0.55, 'font-family': 'inherit'
                    }, node.v.icon || ''));
                }
            } else {
                g.appendChild(mkEl('text', {
                    x: node.x, y: node.y,
                    'text-anchor': 'middle', 'dominant-baseline': 'middle',
                    'font-size': iconSize * 0.55, 'font-family': 'inherit'
                }, node.v.icon || ''));
            }

            /* label */
            var ta = node.x > cx + 5 ? 'start' : node.x < cx - 5 ? 'end' : 'middle';
            var labelX = node.x + (node.x > cx ? 1 : -1) * (nodeR + 8);
            var labelEl = mkEl('text', {
                x: labelX, y: node.y - (descSize + 2),
                'text-anchor': ta, 'font-size': labelSize,
                'font-weight': 700, fill: labelColor, 'font-family': 'inherit'
            }, node.v.label || '');
            g.appendChild(labelEl);

            /* description */
            if (showDesc && node.v.description) {
                var descEl = mkEl('text', {
                    x: labelX, y: node.y + descSize,
                    'text-anchor': ta, 'font-size': descSize,
                    fill: descColor, 'font-family': 'inherit'
                }, node.v.description);
                g.appendChild(descEl);
            }

            svg.appendChild(g);
        });

        app.appendChild(svg);

        /* ── Animate on scroll ── */
        if (animate) {
            app.classList.add('bkbg-vc-animate');
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        app.classList.add('bkbg-vc-visible');
                        observer.unobserve(app);
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(app);
        }
    });
}());
