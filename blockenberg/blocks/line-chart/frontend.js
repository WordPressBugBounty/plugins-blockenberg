/* Line Chart — frontend.js (Chart.js via CDN) */
( function () {
  var CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

  function loadChartJs( cb ) {
    if ( window.Chart ) { cb(); return; }
    var s = document.createElement('script');
    s.src = CHARTJS_CDN;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function initChart( wrap ) {
    var canvas   = wrap.querySelector('canvas');
    if (!canvas) return;

    var labels   = (wrap.dataset.labels  || '').split(',').map(s=>s.trim());
    var datasets = JSON.parse(wrap.dataset.datasets || '[]');
    var height   = parseInt(wrap.dataset.height) || 340;
    var showGrid = wrap.dataset.grid !== '0';
    var showLeg  = wrap.dataset.legend !== '0';
    var legPos   = wrap.dataset.legendPos || 'top';
    var ptStyle  = wrap.dataset.pointStyle || 'circle';

    canvas.height = height;

    var chartDatasets = datasets.map(function(ds) {
      var rgb = hexToRgb(ds.color || '#6c3fb5');
      return {
        label:           ds.label,
        data:            (ds.data||'').split(',').map(Number),
        borderColor:     ds.color,
        backgroundColor: ds.fill ? ('rgba('+rgb+',0.15)') : 'transparent',
        fill:            !!ds.fill,
        tension:         ds.tension !== undefined ? ds.tension : 0.4,
        pointStyle:      ptStyle === 'false' ? false : ptStyle,
        pointRadius:     ptStyle === 'false' ? 0 : 5,
        borderWidth:     2,
      };
    });

    new window.Chart(canvas, {
      type: 'line',
      data: { labels: labels, datasets: chartDatasets },
      options: {
        responsive: true,
        plugins: {
          legend: { display: showLeg, position: legPos },
        },
        scales: {
          x: { grid: { display: showGrid } },
          y: { grid: { display: showGrid } },
        },
      }
    });
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return r+','+g+','+b;
  }

  function init() {
    var wraps = document.querySelectorAll('.bklc-wrap[data-type]');
    if (!wraps.length) return;
    loadChartJs(function() { wraps.forEach(initChart); });
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}() );
