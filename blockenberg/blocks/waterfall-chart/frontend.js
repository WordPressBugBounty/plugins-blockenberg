/* Waterfall Chart — frontend.js (Chart.js floating bars) */
(function () {
    'use strict';

    var CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

    function loadChartJs(cb) {
        if (window.Chart) { cb(); return; }
        var s = document.createElement('script');
        s.src = CHARTJS_CDN;
        s.onload = cb;
        document.head.appendChild(s);
    }

    function hexToRgb(hex) {
        var r = parseInt((hex || '#000000').slice(1, 3), 16);
        var g = parseInt((hex || '#000000').slice(3, 5), 16);
        var b = parseInt((hex || '#000000').slice(5, 7), 16);
        return r + ',' + g + ',' + b;
    }

    function abbr(n, prefix, suffix, doAbbr) {
        var abs = Math.abs(n);
        var sign = n < 0 ? '-' : '';
        var str;
        if (!doAbbr || abs < 1000) {
            str = abs.toLocaleString();
        } else if (abs < 1000000) {
            str = (abs / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else if (abs < 1000000000) {
            str = (abs / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else {
            str = (abs / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        }
        return sign + prefix + str + suffix;
    }

    function typeColor(type, o) {
        if (type === 'start')    return o.startColor;
        if (type === 'increase') return o.increaseColor;
        if (type === 'decrease') return o.decreaseColor;
        return o.totalColor;
    }

    /* Compute [base, top] for each bar */
    function computeFloats(items, o) {
        var running = 0;
        return items.map(function (item) {
            var v = parseFloat(item.value) || 0;
            var type = item.type || 'increase';
            var base, top;

            if (type === 'start') {
                base = 0; top = v; running = v;
            } else if (type === 'total') {
                base = 0; top = running;
            } else if (type === 'increase') {
                base = running; top = running + v; running = top;
            } else { /* decrease */
                top = running; base = running + v; running = base;
            }

            return {
                label: item.label,
                type: type,
                floatY: [Math.min(base, top), Math.max(base, top)],
                displayValue: v,
                barColor: typeColor(type, o),
                running: running
            };
        });
    }

    function initChart(appEl, o) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-wfc-wrap';
        wrap.style.background = o.bgColor;
        wrap.style.borderRadius = '10px';
        wrap.style.padding = (o.paddingTop || 24) + 'px 24px ' + (o.paddingBottom || 24) + 'px';
        wrap.style.maxWidth = o.maxWidth + 'px';
        wrap.style.margin = '0 auto';

        if (o.showTitle && o.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-wfc-title';
            titleEl.textContent = o.title;
            titleEl.style.color = o.titleColor;
            wrap.appendChild(titleEl);
        }

        var canvasWrap = document.createElement('div');
        canvasWrap.className = 'bkbg-wfc-canvas-wrap';
        canvasWrap.style.height = o.height + 'px';

        var canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvasWrap.appendChild(canvas);
        wrap.appendChild(canvasWrap);

        /* tooltip */
        var tooltip = document.createElement('div');
        tooltip.className = 'bkbg-wfc-tooltip';
        canvasWrap.appendChild(tooltip);

        /* legend */
        if (o.showLegend) {
            var legend = document.createElement('div');
            legend.className = 'bkbg-wfc-legend';

            var legendItems = [
                { type: 'start',    label: 'Start',    color: o.startColor },
                { type: 'increase', label: 'Increase', color: o.increaseColor },
                { type: 'decrease', label: 'Decrease', color: o.decreaseColor },
                { type: 'total',    label: 'Total',    color: o.totalColor }
            ];
            legendItems.forEach(function (li) {
                var item = document.createElement('div');
                item.className = 'bkbg-wfc-legend-item';
                item.style.color = o.labelColor;

                var dot = document.createElement('span');
                dot.className = 'bkbg-wfc-legend-dot';
                dot.style.background = li.color;

                var lbl = document.createElement('span');
                lbl.textContent = li.label;

                item.appendChild(dot);
                item.appendChild(lbl);
                legend.appendChild(item);
            });
            wrap.appendChild(legend);
        }

        appEl.parentNode.insertBefore(wrap, appEl);
        appEl.style.display = 'none';

        loadChartJs(function () {
            var segs = computeFloats(o.items || [], o);

            var labels = segs.map(function (s) { return s.label; });
            var floatData = segs.map(function (s) { return s.floatY; });
            var barColors = segs.map(function (s) { return 'rgba(' + hexToRgb(s.barColor) + ',0.88)'; });
            var barColorsBorder = segs.map(function (s) { return s.barColor; });
            var displayValues = segs.map(function (s) { return s.displayValue; });

            /* Connector lines via custom plugin */
            var bR = o.borderRadius || 0;

            var connectorPlugin = {
                id: 'bkbg-wfc-connectors',
                afterDatasetsDraw: function (chart) {
                    if (!o.showConnectors) return;
                    var ctx = chart.ctx;
                    var meta = chart.getDatasetMeta(0);
                    ctx.save();
                    ctx.strokeStyle = o.connectorColor || '#9ca3af';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([5, 4]);

                    for (var i = 0; i < meta.data.length - 1; i++) {
                        var curr = meta.data[i];
                        var next = meta.data[i + 1];
                        if (!curr || !next) continue;
                        var seg = segs[i];
                        /* connect from top of current to top of next start */
                        var connY = seg.type === 'decrease'
                            ? chart.scales.y.getPixelForValue(seg.floatY[1])
                            : chart.scales.y.getPixelForValue(seg.floatY[1]);

                        ctx.beginPath();
                        ctx.moveTo(curr.x + curr.width / 2, connY);
                        ctx.lineTo(next.x - next.width / 2, connY);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            };

            new window.Chart(canvas, {
                type: 'bar',
                plugins: [connectorPlugin],
                data: {
                    labels: labels,
                    datasets: [{
                        data: floatData,
                        backgroundColor: barColors,
                        borderColor: barColorsBorder,
                        borderWidth: 0,
                        borderRadius: bR,
                        borderSkipped: false,
                        barThickness: o.barThickness || 48
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: function (context) {
                                var tooltipModel = context.tooltip;
                                if (!tooltipModel || tooltipModel.opacity === 0) {
                                    tooltip.classList.remove('is-visible');
                                    return;
                                }
                                var idx = tooltipModel.dataPoints[0].dataIndex;
                                var seg = segs[idx];
                                tooltip.innerHTML =
                                    '<div class="bkbg-wfc-tooltip-label">' + (seg.label || '') + '</div>' +
                                    '<div class="bkbg-wfc-tooltip-value">' + abbr(seg.displayValue, o.valuePrefix || '', o.valueSuffix || '', o.abbreviate !== false) + '</div>';
                                tooltip.style.left = tooltipModel.caretX + 'px';
                                tooltip.style.top = (tooltipModel.caretY - 60) + 'px';
                                tooltip.classList.add('is-visible');
                            }
                        },
                        datalabels: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: o.labelColor || '#6b7280',
                                font: { size: o.labelSize || 12 }
                            },
                            border: { display: false }
                        },
                        y: {
                            grid: {
                                display: o.showGrid !== false,
                                color: o.gridColor || '#e5e7eb'
                            },
                            ticks: {
                                color: o.labelColor || '#6b7280',
                                font: { size: o.labelSize || 12 },
                                callback: function (v) {
                                    return abbr(v, o.valuePrefix || '', o.valueSuffix || '', o.abbreviate !== false);
                                }
                            },
                            border: { display: false }
                        }
                    }
                }
            });

            /* Data labels on top of bars when showDataLabels is enabled */
            if (o.showDataLabels) {
                var chartInstance = window.Chart.getChart(canvas);
                if (!chartInstance) return;
                var originalDraw = chartInstance.draw.bind(chartInstance);
                chartInstance.draw = function () {
                    originalDraw();
                    var ctx2 = canvas.getContext('2d');
                    var meta2 = chartInstance.getDatasetMeta(0);
                    ctx2.save();
                    ctx2.font = 'bold ' + (o.valueSize || 11) + 'px system-ui, sans-serif';
                    ctx2.textAlign = 'center';
                    ctx2.textBaseline = 'bottom';
                    meta2.data.forEach(function (bar, i) {
                        var seg = segs[i];
                        var txt = abbr(seg.displayValue, o.valuePrefix || '', o.valueSuffix || '', o.abbreviate !== false);
                        ctx2.fillStyle = seg.type === 'decrease' ? o.decreaseColor : seg.barColor;
                        var topY = chartInstance.scales.y.getPixelForValue(seg.floatY[1]);
                        ctx2.fillText(txt, bar.x, topY - 4);
                    });
                    ctx2.restore();
                };
                chartInstance.draw();
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-wfc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                title: 'Revenue Waterfall',
                showTitle: true,
                items: [],
                valuePrefix: '$',
                valueSuffix: '',
                abbreviate: true,
                height: 380,
                barThickness: 48,
                showConnectors: true,
                showDataLabels: true,
                showGrid: true,
                showLegend: true,
                borderRadius: 4,
                maxWidth: 800,
                paddingTop: 24,
                paddingBottom: 24,
                titleSize: 20,
                labelSize: 12,
                valueSize: 11,
                startColor: '#6366f1',
                increaseColor: '#10b981',
                decreaseColor: '#ef4444',
                totalColor: '#8b5cf6',
                connectorColor: '#9ca3af',
                bgColor: '#ffffff',
                titleColor: '#111827',
                labelColor: '#6b7280',
                gridColor: '#e5e7eb'
            }, opts);

            initChart(appEl, o);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
