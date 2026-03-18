function typoCssVarsForEl(typo, prefix, el) {
    if (!typo || typeof typo !== 'object') return;
    var map = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        transform: 'text-transform', decoration: 'text-decoration',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        sizeUnit: null,
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        lineHeightUnit: null,
        letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        letterSpacingUnit: null,
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m',
        wordSpacingUnit: null
    };
    var sizeU = typo.sizeUnit || 'px';
    var lhU   = typo.lineHeightUnit || '';
    var lsU   = typo.letterSpacingUnit || 'px';
    var wsU   = typo.wordSpacingUnit || 'px';
    Object.keys(map).forEach(function (k) {
        var css = map[k]; if (!css) return;
        var v = typo[k]; if (v === undefined || v === '' || v === null) return;
        if (/size|spacing/i.test(k)) {
            var u = /letterSpacing/.test(k) ? lsU : /wordSpacing/.test(k) ? wsU : /lineHeight/.test(k) ? lhU : sizeU;
            v = v + u;
        }
        el.style.setProperty(prefix + css, v);
    });
}

(function () {
    var SVG_NS = 'http://www.w3.org/2000/svg';

    function pad2(n) { return String(Math.max(0, n)).padStart(2, '0'); }

    function parseEnd(endDate) {
        if (endDate) {
            var d = new Date(endDate);
            if (!isNaN(d)) return d;
        }
        var fallback = new Date();
        fallback.setDate(fallback.getDate() + 14);
        return fallback;
    }

    function diffParts(end) {
        var now = Date.now();
        var total = Math.max(0, end.getTime() - now);
        var days  = Math.floor(total / 86400000);
        var hours = Math.floor((total % 86400000) / 3600000);
        var mins  = Math.floor((total % 3600000) / 60000);
        var secs  = Math.floor((total % 60000) / 1000);
        return { days: days, hours: hours, mins: mins, secs: secs, total: total };
    }

    /* SVG ring helpers */
    function makeSvgRing(radius, strokeWidth, ringBg, ringColor) {
        var cx = radius + strokeWidth, cy = radius + strokeWidth;
        var size = cx * 2;
        var svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

        var track = document.createElementNS(SVG_NS, 'circle');
        track.setAttribute('cx', cx); track.setAttribute('cy', cy);
        track.setAttribute('r', radius);
        track.setAttribute('stroke', ringBg);
        track.setAttribute('stroke-width', strokeWidth);
        track.setAttribute('fill', 'none');
        track.setAttribute('stroke-linecap', 'round');
        svg.appendChild(track);

        var fill = document.createElementNS(SVG_NS, 'circle');
        fill.setAttribute('cx', cx); fill.setAttribute('cy', cy);
        fill.setAttribute('r', radius);
        fill.setAttribute('stroke', ringColor);
        fill.setAttribute('stroke-width', strokeWidth);
        fill.setAttribute('fill', 'none');
        fill.setAttribute('stroke-linecap', 'round');
        fill.style.transform = 'rotate(-90deg)';
        fill.style.transformOrigin = 'center';
        svg.appendChild(fill);

        return { svg: svg, fill: fill, circumference: 2 * Math.PI * radius };
    }

    function updateRing(fillEl, circumference, pct) {
        var dash = pct * circumference;
        fillEl.setAttribute('stroke-dasharray', circumference);
        fillEl.setAttribute('stroke-dashoffset', circumference - dash);
    }

    /* Unit constructors */
    function makeRingUnit(o, unit) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cdp-ring-wrap';

        var ring = makeSvgRing(o.radius, o.strokeWidth, o.ringBg || '#1e293b', o.ringColor || '#6366f1');
        wrap.appendChild(ring.svg);

        var labels = document.createElement('div');
        labels.className = 'bkbg-cdp-ring-labels';
        labels.style.color = o.numColor || '#fff';

        var numEl = document.createElement('span');
        numEl.className = 'bkbg-cdp-num';
        numEl.textContent = '--';
        labels.appendChild(numEl);

        if (o.showLabels) {
            var unitEl = document.createElement('span');
            unitEl.className = 'bkbg-cdp-unit';
            unitEl.style.color = o.labelColor || '#94a3b8';
            unitEl.textContent = unit;
            labels.appendChild(unitEl);
        }

        wrap.appendChild(labels);
        return { wrap: wrap, numEl: numEl, fill: ring.fill, circumference: ring.circumference };
    }

    function makeBarUnit(o, unit) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cdp-bar-unit';

        var numEl = document.createElement('div');
        numEl.className = 'bkbg-cdp-bar-num';
        numEl.style.color = o.numColor || '#fff';
        numEl.textContent = '--';
        wrap.appendChild(numEl);

        if (o.showLabels) {
            var labelEl = document.createElement('div');
            labelEl.className = 'bkbg-cdp-bar-label';
            labelEl.style.color = o.labelColor || '#94a3b8';
            labelEl.textContent = unit;
            wrap.appendChild(labelEl);
        }

        var track = document.createElement('div');
        track.className = 'bkbg-cdp-bar-track';
        track.style.background = o.barBg || o.ringBg || '#1e293b';

        var fill = document.createElement('div');
        fill.className = 'bkbg-cdp-bar-fill';
        fill.style.background = o.barColor || o.ringColor || '#6366f1';
        fill.style.width = '0%';
        track.appendChild(fill);
        wrap.appendChild(track);

        return { wrap: wrap, numEl: numEl, fill: fill };
    }

    function init() {
        document.querySelectorAll('.bkbg-cdp-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                heading: 'Launching In', subtext: 'Don\'t miss out — get notified when we go live.',
                endDate: '', style: 'ring', showDays: true, showHours: true, showMins: true, showSecs: true,
                showLabels: true, radius: 60, strokeWidth: 10, maxWidth: 900, paddingTop: 80, paddingBottom: 80,
                bgColor: '#0f172a', headingColor: '#ffffff', subColor: '#94a3b8',
                ringColor: '#6366f1', ringBg: '#1e293b', numColor: '#ffffff', labelColor: '#94a3b8',
                barColor: '#6366f1', barBg: '#1e293b'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            typoCssVarsForEl(o.typoHeading, '--bkbg-cdp-h-', el);
            typoCssVarsForEl(o.typoSub, '--bkbg-cdp-sub-', el);
            typoCssVarsForEl(o.typoNum, '--bkbg-cdp-num-', el);
            typoCssVarsForEl(o.typoUnit, '--bkbg-cdp-unit-', el);

            var inner = document.createElement('div');
            inner.className = 'bkbg-cdp-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;text-align:center;';

            var h2 = document.createElement('h2');
            h2.className = 'bkbg-cdp-heading';
            h2.style.color = o.headingColor;
            h2.innerHTML = o.heading;

            var sub = document.createElement('p');
            sub.className = 'bkbg-cdp-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;

            inner.appendChild(h2);
            inner.appendChild(sub);

            var endDate = parseEnd(o.endDate);

            /* Build unit widgets */
            var unitDefs = [
                { key: 'days', show: o.showDays, label: 'Days', max: 30 },
                { key: 'hours', show: o.showHours, label: 'Hours', max: 24 },
                { key: 'mins', show: o.showMins, label: 'Mins', max: 60 },
                { key: 'secs', show: o.showSecs, label: 'Secs', max: 60 }
            ];

            var unitsRow = document.createElement('div');
            unitsRow.className = 'bkbg-cdp-units style-' + o.style;
            inner.appendChild(unitsRow);

            var units = [];
            unitDefs.forEach(function (def) {
                if (!def.show) return;
                var u;
                if (o.style === 'ring') {
                    u = makeRingUnit(o, def.label);
                    unitsRow.appendChild(u.wrap);
                } else {
                    u = makeBarUnit(o, def.label);
                    unitsRow.appendChild(u.wrap);
                }
                u.key = def.key;
                u.max = def.max;
                units.push(u);
            });

            el.appendChild(inner);

            function tick() {
                var parts = diffParts(endDate);
                units.forEach(function (u) {
                    var val = parts[u.key];
                    var pct = val / u.max;
                    u.numEl.textContent = pad2(val);
                    if (o.style === 'ring') {
                        updateRing(u.fill, u.circumference, pct);
                    } else {
                        u.fill.style.width = (pct * 100) + '%';
                    }
                });
                if (parts.total <= 0) { clearInterval(timer); }
            }

            tick();
            var timer = setInterval(tick, 1000);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
