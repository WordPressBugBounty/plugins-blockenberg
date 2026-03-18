(function () {
    var CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

    function loadChart(cb) {
        if (window.Chart) { cb(window.Chart); return; }
        var s = document.createElement('script');
        s.src = CDN;
        s.onload = function () { cb(window.Chart); };
        document.head.appendChild(s);
    }

    function hexToRgba(hex, alpha) {
        hex = (hex || '#000000').replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        var r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
        return 'rgba('+r+','+g+','+b+','+(alpha/100)+')';
    }

    function parseLines(str) {
        return (str || '').split('\n').map(function(s){ return parseFloat(s.trim()); }).filter(function(v){ return !isNaN(v); });
    }

    function parseLabels(str) {
        return (str || '').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    }

    function initChart(card) {
        var raw = card.getAttribute('data-chart');
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch(e) { return; }

        var canvas = card.querySelector('.bkbg-mc-canvas');
        if (!canvas) return;

        var labels = parseLabels(opts.labels);
        var datasetsRaw = [];
        try { datasetsRaw = JSON.parse(opts.datasetsJson || '[]'); } catch(e) {}

        var datasets = datasetsRaw.map(function(ds) {
            var data = parseLines(ds.data);
            var base = {
                label:       ds.label || '',
                type:        ds.type || 'bar',
                data:        data,
                yAxisID:     ds.yAxis || 'y',
                backgroundColor: ds.type === 'line' ? 'transparent' : hexToRgba(ds.color || '#6c3fb5', opts.fillAlpha || 85),
                borderColor:     ds.color || '#6c3fb5',
                borderWidth:     ds.type === 'line' ? (opts.lineWidth || 2) : 0,
                borderRadius:    ds.type === 'bar'  ? (opts.barRadius || 4)  : 0,
                pointRadius:     ds.type === 'line' ? (opts.dotSize  || 4)  : 0,
                pointBackgroundColor: ds.color || '#6c3fb5',
                tension:     0.4,
                fill:        false,
            };
            return base;
        });

        var scalesOpts = {
            x: { grid: { display: opts.showGrid !== false } },
            y: {
                position: 'left',
                title: { display: !!opts.yLabel, text: opts.yLabel || '' },
                grid: { display: opts.showGrid !== false },
            }
        };
        if (opts.dualAxis) {
            scalesOpts.y1 = {
                position: 'right',
                title: { display: !!opts.y1Label, text: opts.y1Label || '' },
                grid: { drawOnChartArea: false },
            };
        }

        if (canvas._chartInstance) { canvas._chartInstance.destroy(); }

        canvas.style.height = (opts.chartHeight || 400) + 'px';

        canvas._chartInstance = new window.Chart(canvas, {
            type: 'bar',
            data: { labels: labels, datasets: datasets },
            options: {
                responsive:          true,
                maintainAspectRatio: false,
                animation:           opts.animate !== false ? { duration: 900, easing: 'easeOutQuart' } : false,
                plugins: {
                    legend: { display: opts.showLegend !== false, position: opts.legendPos || 'top' },
                    tooltip: { mode: 'index', intersect: false },
                },
                scales: scalesOpts,
            }
        });
    }

    function init() {
        loadChart(function () {
            var cards = document.querySelectorAll('.bkbg-mc-card[data-chart]');
            cards.forEach(function (card) {
                var io = new IntersectionObserver(function (entries, obs) {
                    if (entries[0].isIntersecting) {
                        obs.disconnect();
                        initChart(card);
                    }
                }, { threshold: 0.15 });
                io.observe(card);
            });
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
