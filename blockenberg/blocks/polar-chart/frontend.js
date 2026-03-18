/* Polar Area Chart — frontend */
( function () {
  function parseHex(hex, alpha) {
    hex = (hex||'#6c3fb5').replace('#','');
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    return 'rgba('+r+','+g+','+b+','+(alpha/100).toFixed(2)+')';
  }

  function renderAll() {
    document.querySelectorAll('.bkpca-wrap[data-chart]').forEach(function(wrap) {
      var canvas = wrap.querySelector('.bkpca-canvas');
      if (!canvas || canvas._bkpcaInit) return;
      canvas._bkpcaInit = true;
      try {
        var d = JSON.parse(wrap.getAttribute('data-chart'));
        var labels = (d.labels||'').split(',').map(function(s){return s.trim();});
        var vals = (d.values||'').split(',').map(function(s){return parseFloat(s.trim())||0;});
        var cols = (d.colors||'').split(',').map(function(s){return s.trim();});
        var alpha = d.fillAlpha||75;
        var bgColors = cols.map(function(c){return parseHex(c, alpha);});
        new window.Chart(canvas, {
          type: 'polarArea',
          data: { labels: labels, datasets: [{ data: vals, backgroundColor: bgColors, borderColor: cols, borderWidth: 2 }] },
          options: {
            responsive: true,
            plugins: {
              legend: { display: !!d.showLegend, position: d.legendPos||'bottom' },
              title: { display: !!(d.showTitle && d.chartTitle), text: d.chartTitle||'' }
            }
          }
        });
      } catch(e) { console.warn('bkpca chart error', e); }
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
