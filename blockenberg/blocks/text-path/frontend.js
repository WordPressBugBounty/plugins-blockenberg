(function () {
    'use strict';

    var svgNS = 'http://www.w3.org/2000/svg';

    function buildPath(opts) {
        var W = opts.svgWidth || 800;
        var H = opts.svgHeight || 200;
        var type = opts.pathType || 'arc';

        if (type === 'arc') {
            var r = opts.arcRadius || 300;
            var cx = W / 2;
            var cy = opts.arcDirection === 'bottom' ? H - r - 20 : r + 20;
            var x1 = cx - r, x2 = cx + r;
            var sweep = opts.arcDirection === 'bottom' ? 0 : 1;
            return 'M ' + x1 + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + x2 + ' ' + cy;
        }

        if (type === 'wave') {
            var amp  = opts.waveAmplitude || 40;
            var freq = opts.waveFrequency || 2;
            var midY = H / 2;
            var step = W / (freq * 2);
            var d = 'M 0 ' + midY;
            for (var i = 0; i < freq * 2; i++) {
                var cpX = step * (i + 0.5);
                var cpY = i % 2 === 0 ? midY - amp : midY + amp;
                var eX  = step * (i + 1);
                var eY  = midY;
                d += ' Q ' + cpX + ' ' + cpY + ' ' + eX + ' ' + eY;
            }
            return d;
        }

        if (type === 'circle') {
            var cr = Math.min(W, H) / 2 - 20;
            var ccx = W / 2, ccy = H / 2;
            return 'M ' + (ccx - cr) + ' ' + ccy +
                   ' A ' + cr + ' ' + cr + ' 0 1 1 ' + (ccx + cr) + ' ' + ccy +
                   ' A ' + cr + ' ' + cr + ' 0 1 1 ' + (ccx - cr) + ' ' + ccy;
        }

        if (type === 'scurve') {
            var midX2 = W / 2, sH = H;
            return 'M 0 ' + (sH * 0.7) + ' C ' + (midX2 * 0.5) + ' ' + (sH * 0.7) + ' ' + (midX2 * 0.5) + ' ' + (sH * 0.3) + ' ' + midX2 + ' ' + (sH * 0.5) + ' S ' + (midX2 + midX2 * 0.5) + ' ' + (sH * 0.8) + ' ' + W + ' ' + (sH * 0.3);
        }

        return 'M 0 ' + (H / 2) + ' L ' + W + ' ' + (H / 2);
    }

    document.querySelectorAll('.bkbg-tp-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var W       = opts.svgWidth   || 800;
        var H       = opts.svgHeight  || 200;
        var text    = opts.text       || '';
        var align2  = opts.align2     || 'center';
        var sectionBg = opts.sectionBg || '';

        if (sectionBg) app.style.background = sectionBg;

        var pathD   = buildPath(opts);
        var pathId  = 'bkbg-tp-path-' + Math.random().toString(36).slice(2, 7);

        // Create SVG
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
        svg.setAttribute('width', '100%');
        svg.style.display = 'block';
        svg.style.maxWidth = W + 'px';
        svg.style.margin = align2 === 'center' ? '0 auto' : align2 === 'right' ? '0 0 0 auto' : '0';
        svg.style.overflow = 'visible';

        // defs
        var defs = document.createElementNS(svgNS, 'defs');
        var pathDef = document.createElementNS(svgNS, 'path');
        pathDef.setAttribute('id', pathId);
        pathDef.setAttribute('d', pathD);
        defs.appendChild(pathDef);
        svg.appendChild(defs);

        // Optional visible path stroke
        if (opts.showPath) {
            var pathVisible = document.createElementNS(svgNS, 'path');
            pathVisible.setAttribute('d', pathD);
            pathVisible.setAttribute('fill', 'none');
            pathVisible.setAttribute('stroke', opts.pathStrokeColor || '#e2e8f0');
            pathVisible.setAttribute('stroke-width', opts.pathStrokeWidth || 1);
            svg.appendChild(pathVisible);
        }

        // Text
        var textEl = document.createElementNS(svgNS, 'text');
        textEl.setAttribute('fill', opts.textColor || '#0f172a');

        var textPath = document.createElementNS(svgNS, 'textPath');
        textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + pathId);
        textPath.setAttribute('href', '#' + pathId);
        textPath.setAttribute('startOffset', (opts.startOffset || 10) + '%');
        textPath.setAttribute('textAnchor', opts.textAnchor || 'start');
        textPath.textContent = text;

        // Animation: scroll startOffset
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (opts.animate && !reducedMotion) {
            var anim = document.createElementNS(svgNS, 'animate');
            anim.setAttribute('attributeName', 'startOffset');
            anim.setAttribute('from', '0%');
            anim.setAttribute('to', '100%');
            anim.setAttribute('dur', (opts.animateDuration || 12) + 's');
            anim.setAttribute('repeatCount', opts.repeatCount || 'indefinite');
            anim.setAttribute('calcMode', 'linear');
            textPath.appendChild(anim);
        }

        textEl.appendChild(textPath);
        svg.appendChild(textEl);

        // Wrap the SVG
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-tp-wrap';
        wrap.style.textAlign = align2;
        wrap.appendChild(svg);
        app.appendChild(wrap);
    });
})();
