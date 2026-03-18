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
    /* ── Sparkline SVG builder ─────────────────────────────────────── */
    function buildSparkline(container, sparkStr, color, fill, width, height) {
        var nums = (sparkStr || '').split(',').map(Number).filter(function (n) { return !isNaN(n); });
        if (nums.length < 2) return;
        var minV = Math.min.apply(null, nums);
        var maxV = Math.max.apply(null, nums);
        var range = maxV - minV || 1;
        var h = height; var w = width;
        var step = w / (nums.length - 1);
        var pts = nums.map(function (n, i) {
            return (i * step).toFixed(1) + ',' + ((1 - (n - minV) / range) * (h - 4) + 2).toFixed(1);
        });
        var polyPts = pts.join(' ');
        var fillD = 'M ' + pts.join(' L ') + ' L ' + w + ',' + h + ' L 0,' + h + ' Z';

        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        svg.setAttribute('width', w);
        svg.setAttribute('height', h);
        svg.classList.add('bkbg-kpi-spark');
        svg.style.overflow = 'visible';

        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', fillD);
        path.setAttribute('fill', fill);
        path.setAttribute('stroke', 'none');
        svg.appendChild(path);

        var poly = document.createElementNS(ns, 'polyline');
        poly.setAttribute('points', polyPts);
        poly.setAttribute('fill', 'none');
        poly.setAttribute('stroke', color);
        poly.setAttribute('stroke-width', '2');
        poly.setAttribute('stroke-linecap', 'round');
        poly.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(poly);

        container.appendChild(svg);
    }

    /* ── Trend helpers ─────────────────────────────────────────────── */
    function trendIcon(dir) {
        return dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'down-good' ? '↓' : '→';
    }
    function trendClass(dir) {
        return dir === 'up' ? 'bkbg-kpi-trend-up' :
               dir === 'down' ? 'bkbg-kpi-trend-down' :
               dir === 'down-good' ? 'bkbg-kpi-trend-downgood' : 'bkbg-kpi-trend-neutral';
    }
    function trendBgColor(dir, o) {
        return dir === 'up' ? o.upColor :
               dir === 'down' ? o.downColor :
               dir === 'down-good' ? o.downGoodColor : '#64748b';
    }

    /* ── Number animation counter ──────────────────────────────────── */
    function animateValue(el, endStr, duration) {
        /* Extract leading/trailing non-numeric for display */
        var match = endStr.match(/^([^0-9]*)([0-9,\.]+)([^0-9]*)$/);
        if (!match) return; /* not a simple number */
        var pre   = match[1];
        var numStr = match[2].replace(/,/g, '');
        var suf   = match[3];
        var end   = parseFloat(numStr);
        if (isNaN(end)) return;
        var isInt = Number.isInteger(end);
        var start = 0;
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased    = 1 - Math.pow(1 - progress, 3);
            var cur      = start + (end - start) * eased;
            var display  = isInt ? Math.round(cur).toLocaleString() : cur.toFixed(1);
            el.textContent = pre + display + suf;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ── Build one tile ────────────────────────────────────────────── */
    function buildTile(tile, o) {
        var dir = tile.direction || 'up';
        var tileEl = document.createElement('div');
        tileEl.className = 'bkbg-kpi-tile';
        tileEl.style.cssText = [
            'background:'    + o.cardBg,
            'border-radius:' + o.cardRadius + 'px',
            'padding:'       + o.cardPadding + 'px',
            'border:1px solid ' + (o.borderColor || 'transparent'),
            'box-shadow:0 2px 16px ' + (o.cardShadow || 'rgba(0,0,0,0.08)')
        ].join(';');

        /* Top row */
        var top = document.createElement('div');
        top.className = 'bkbg-kpi-top';

        if (o.showIcon !== false && tile.icon) {
            var icon = document.createElement('span');
            icon.className = 'bkbg-kpi-icon';
            icon.style.fontSize = o.iconSize + 'px';
            var _IP = window.bkbgIconPicker;
            var _iType = tile.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, tile.icon, tile.iconDashicon, tile.iconImageUrl, tile.iconDashiconColor);
                if (_in) icon.appendChild(_in); else icon.textContent = tile.icon;
            } else { icon.textContent = tile.icon; }
            top.appendChild(icon);
        }

        if (o.showTrend !== false && tile.trend) {
            var trend = document.createElement('span');
            trend.className = 'bkbg-kpi-trend ' + trendClass(dir);
            trend.style.color = trendBgColor(dir, o);
            trend.textContent = trendIcon(dir) + ' ' + tile.trend;
            top.appendChild(trend);
        }
        tileEl.appendChild(top);

        /* Value */
        var val = document.createElement('div');
        val.className = 'bkbg-kpi-value';
        val.style.color    = o.valueColor || '#0f172a';
        val.textContent    = tile.value || '—';
        tileEl.appendChild(val);

        /* Label */
        var lbl = document.createElement('div');
        lbl.className = 'bkbg-kpi-label';
        lbl.style.color    = o.labelColor || '#64748b';
        lbl.textContent    = tile.label || '';
        tileEl.appendChild(lbl);

        /* Sparkline */
        if (o.showSparkline !== false && tile.sparkline) {
            buildSparkline(tileEl, tile.sparkline,
                o.sparklineColor || '#6366f1',
                o.sparklineFill  || 'rgba(99,102,241,0.12)',
                o.sparklineWidth || 120,
                o.sparklineHeight || 48
            );
        }

        return { el: tileEl, valEl: val, tile: tile };
    }

    /* ── Intersection observer for number animation ─────────────────── */
    function observeTiles(items, o) {
        if (!o.animateNumbers || !window.IntersectionObserver) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var target = entry.target;
                var idx = parseInt(target.dataset.kpiIdx, 10);
                if (!isNaN(idx) && items[idx]) {
                    animateValue(items[idx].valEl, items[idx].tile.value, 1200);
                }
                io.unobserve(target);
            });
        }, { threshold: 0.3 });

        items.forEach(function (item, idx) {
            item.el.dataset.kpiIdx = idx;
            io.observe(item.el);
        });
    }

    /* ── Mount ─────────────────────────────────────────────────────── */
    function initBlock(root) {
        var app = root.querySelector('.bkbg-kpi-app');
        if (!app) return;

        var raw = app.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var tiles = Array.isArray(o.tiles) ? o.tiles : [];
        var cols  = Number(o.columns) || 4;

        typoCssVarsForEl(root, o.valueTypo, '--bkbg-kpi-v-');
        typoCssVarsForEl(root, o.labelTypo, '--bkbg-kpi-l-');
        typoCssVarsForEl(root, o.trendTypo, '--bkbg-kpi-tr-');

        var grid = document.createElement('div');
        grid.className = 'bkbg-kpi-grid';
        grid.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

        var items = tiles.map(function (tile) {
            var item = buildTile(tile, o);
            grid.appendChild(item.el);
            return item;
        });

        app.appendChild(grid);
        observeTiles(items, o);
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-kpi-tiles').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
