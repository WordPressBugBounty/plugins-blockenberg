(function () {
    var CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

    function loadChartJs(cb) {
        if (window.Chart) { cb(); return; }
        var s = document.createElement('script');
        s.src = CHARTJS_CDN;
        s.onload = cb;
        document.head.appendChild(s);
    }

    function parseCSV(str) {
        return (str || '').split(',').map(function (v) { return v.trim(); }).filter(Boolean);
    }

    function initChart(wrap) {
        var canvas = wrap.querySelector('.bkbg-ac-canvas');
        if (!canvas) return;

        var labels        = parseCSV(wrap.dataset.labels);
        var datasets      = JSON.parse(wrap.dataset.datasets || '[]');
        var height        = parseInt(wrap.dataset.height, 10) || 340;
        var showGrid      = wrap.dataset.showGrid !== 'false';
        var showLegend    = wrap.dataset.showLegend !== 'false';
        var legendPos     = wrap.dataset.legendPos || 'top';
        var showPoints    = wrap.dataset.showPoints !== 'false';
        var pointSize     = parseInt(wrap.dataset.pointSize, 10) || 4;
        var lineWidth     = parseInt(wrap.dataset.lineWidth, 10) || 2;
        var gradientFill  = wrap.dataset.gradientFill !== 'false';
        var gradientAlpha = parseInt(wrap.dataset.gradientAlpha, 10) || 20;
        var xLabel        = wrap.dataset.xLabel || '';
        var yLabel        = wrap.dataset.yLabel || '';
        var yMin          = wrap.dataset.yMin !== '' ? parseFloat(wrap.dataset.yMin) : undefined;
        var yMax          = wrap.dataset.yMax !== '' ? parseFloat(wrap.dataset.yMax) : undefined;
        var animate       = wrap.dataset.animate !== 'false';
        var animDuration  = parseInt(wrap.dataset.animDuration, 10) || 800;

        canvas.style.height = height + 'px';
        var ctx = canvas.getContext('2d');

        var chartDatasets = datasets.map(function (ds) {
            var data = parseCSV(ds.data).map(Number);
            var color = ds.color || '#6c3fb5';
            var fill = ds.fill !== false;

            var bg;
            if (gradientFill && fill) {
                var grad = ctx.createLinearGradient(0, 0, 0, height);
                var hex = color.replace('#', '');
                var r = parseInt(hex.substr(0, 2), 16);
                var g = parseInt(hex.substr(2, 2), 16);
                var b = parseInt(hex.substr(4, 2), 16);
                grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + (gradientAlpha / 100) + ')');
                grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
                bg = grad;
            } else if (fill) {
                bg = color + '20';
            } else {
                bg = 'transparent';
            }

            return {
                label: ds.label || '',
                data: data,
                borderColor: color,
                backgroundColor: bg,
                fill: fill,
                tension: ds.tension !== undefined ? ds.tension : 0.45,
                borderWidth: lineWidth,
                pointRadius: showPoints ? pointSize : 0,
                pointHoverRadius: showPoints ? pointSize + 2 : 0,
                pointBackgroundColor: color,
            };
        });

        new window.Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: chartDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: animate ? { duration: animDuration } : false,
                plugins: {
                    legend: {
                        display: showLegend,
                        position: legendPos,
                        labels: { usePointStyle: true, boxWidth: 10 }
                    },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: {
                        grid: { display: showGrid },
                        title: { display: !!xLabel, text: xLabel }
                    },
                    y: {
                        grid: { display: showGrid },
                        min: yMin,
                        max: yMax,
                        title: { display: !!yLabel, text: yLabel },
                        beginAtZero: !yMin
                    }
                }
            }
        });
    }

    function init() {
        var wraps = document.querySelectorAll('.bkbg-ac-card');
        if (!wraps.length) return;
        loadChartJs(function () {
            wraps.forEach(initChart);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
