/* Bubble Chart — frontend */
( function () {
  function parseHex(hex, alpha) {
    hex = (hex||'#6c3fb5').replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }

  function parseBubbles(text) {
    return (text||'').split('\n').filter(Boolean).map(function(line) {
      var parts = line.split(',').map(function(s){return parseFloat(s)||0;});
      return { x: parts[0]||0, y: parts[1]||0, r: parts[2]||8 };
    });
  }

  function renderAll() {
    document.querySelectorAll('.bkbbl-wrap[data-chart]').forEach(function(wrap) {
      var canvas = wrap.querySelector('.bkbbl-canvas');
      if (!canvas || canvas._bkbblInit) return;
      canvas._bkbblInit = true;
      try {
        var d = JSON.parse(wrap.getAttribute('data-chart'));
        var alpha = d.fillAlpha||50;
        var datasets;
        try { datasets = JSON.parse(d.datasetsJson||'[]'); } catch(e){ datasets=[]; }
        var dsData = datasets.map(function(ds) {
          return {
            label: ds.label||'',
            data: parseBubbles(ds.bubbles),
            backgroundColor: parseHex(ds.color||'#6c3fb5', alpha),
            borderColor: ds.color||'#6c3fb5',
            borderWidth: 2
          };
        });
        new window.Chart(canvas, {
          type: 'bubble',
          data: { datasets: dsData },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { display: !!d.showLegend, position: d.legendPos||'bottom' },
              title: { display: !!(d.showTitle&&d.chartTitle), text: d.chartTitle||'' }
            },
            scales: {
              x: { grid: { display: d.showGrid!==false } },
              y: { grid: { display: d.showGrid!==false } }
            }
          }
        });
      } catch(e) { console.warn('bkbbl chart error', e); }
    });
  }

  function init() {
    if (window.Chart) { renderAll(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    s.onload = renderAll;
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}() );
