(function () {
    var CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

    function loadChart(cb) {
        if (window.Chart) { cb(window.Chart); return; }
        var s = document.createElement('script');
        s.src = CDN;
        s.onload = function () { cb(window.Chart); };
        document.head.appendChild(s);
    }

    function parsePoints(text) {
        if (!text) return [];
        return text.trim().split('\n').map(function (line) {
            var parts = line.split(',');
            if (parts.length < 2) return null;
            var x = parseFloat(parts[0].trim());
            var y = parseFloat(parts[1].trim());
            if (isNaN(x) || isNaN(y)) return null;
            return { x: x, y: y };
        }).filter(Boolean);
    }

    function hexToRgba(hex, alpha) {
        if (!hex) return 'rgba(108,63,181,' + alpha + ')';
        var c = hex.replace('#', '');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function initChart(card) {
        if (card.dataset.initialized) return;
        card.dataset.initialized = '1';

        var rawData = card.getAttribute('data-chart');
        var height = parseInt(card.getAttribute('data-height') || '400', 10);
        if (!rawData) return;

        var opts;
        try { opts = JSON.parse(rawData); } catch (e) { return; }

        var canvas = card.querySelector('.bkbg-sc-canvas');
        if (!canvas) { canvas = document.createElement('canvas'); card.appendChild(canvas); }
        canvas.height = height;

        loadChart(function (ChartJS) {
            var datasets = [];
            try {
                var raw = JSON.parse(opts.datasetsJson || '[]');
                raw.forEach(function (ds) {
                    var pts = parsePoints(ds.points);
                    var alpha = (opts.fillAlpha || 85) / 100;
                    datasets.push({
                        label: ds.label,
                        data: pts,
                        backgroundColor: hexToRgba(ds.color, alpha),
                        borderColor: ds.color || '#6c3fb5',
                        pointRadius: opts.pointSize || 7,
                        pointHoverRadius: (opts.pointSize || 7) + 2,
                        pointStyle: opts.pointStyle || 'circle',
                    });
                });
            } catch (e) {}

            var scaleX = { type: 'linear', title: { display: !!opts.xLabel, text: opts.xLabel || '' }, grid: { display: !!opts.showGrid } };
            var scaleY = { title: { display: !!opts.yLabel, text: opts.yLabel || '' }, grid: { display: !!opts.showGrid } };
            if (opts.xMin !== undefined && opts.xMin !== '') scaleX.min = parseFloat(opts.xMin);
            if (opts.xMax !== undefined && opts.xMax !== '') scaleX.max = parseFloat(opts.xMax);
            if (opts.yMin !== undefined && opts.yMin !== '') scaleY.min = parseFloat(opts.yMin);
            if (opts.yMax !== undefined && opts.yMax !== '') scaleY.max = parseFloat(opts.yMax);

            new ChartJS(canvas, {
                type: 'scatter',
                data: { datasets: datasets },
                options: {
                    responsive: true,
                    animation: { duration: opts.animate ? 800 : 0 },
                    plugins: {
                        legend: { display: !!opts.showLegend, position: opts.legendPos || 'bottom' },
                    },
                    scales: { x: scaleX, y: scaleY },
                }
            });
        });
    }

    function init() {
        var cards = document.querySelectorAll('.bkbg-sc-card');
        if (!cards.length) return;
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) { if (e.isIntersecting) { initChart(e.target); obs.unobserve(e.target); } });
            }, { threshold: 0.15 });
            cards.forEach(function (card) { obs.observe(card); });
        } else {
            cards.forEach(initChart);
        }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
}());
