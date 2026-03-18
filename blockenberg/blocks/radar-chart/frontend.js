( function () {
  function hexToRgb( hex ) {
    hex = hex.replace( /^#/, '' );
    if ( hex.length === 3 ) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt( hex, 16 );
    return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
  }

  function loadChartJs( cb ) {
    if ( window.Chart ) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function initRadar( wrap ) {
    var canvas   = wrap.querySelector('.bkrc-canvas');
    if ( !canvas ) return;

    var labelsRaw  = wrap.dataset.labels  || '';
    var size       = parseInt( wrap.dataset.size, 10 ) || 400;
    var scaleMin   = parseFloat( wrap.dataset.scaleMin ) || 0;
    var scaleMax   = parseFloat( wrap.dataset.scaleMax ) || 100;
    var gridLines  = parseInt( wrap.dataset.gridLines, 10 ) || 5;
    var showLegend = wrap.dataset.legend === '1';
    var legendPos  = wrap.dataset.legendPos || 'top';
    var rawDs      = wrap.dataset.datasets || '[]';

    var labels = labelsRaw.split(',').map(l=>l.trim());
    var datasets;
    try { datasets = JSON.parse(rawDs); } catch(e) { datasets = []; }

    canvas.width  = size;
    canvas.height = size;

    var chartDatasets = datasets.map(function(ds) {
      var csvData = ds.data ? ds.data.split(',').map(function(v){ return parseFloat(v.trim()); }) : [];
      var rgb = hexToRgb( ds.color || '#6c3fb5' );
      var alpha = ds.fillAlpha !== undefined ? ds.fillAlpha : 0.2;
      return {
        label: ds.label || '',
        data: csvData,
        borderColor: ds.color || '#6c3fb5',
        backgroundColor: 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')',
        pointBackgroundColor: ds.color || '#6c3fb5',
        fill: true,
        tension: 0.1
      };
    });

    new window.Chart( canvas, {
      type: 'radar',
      data: { labels: labels, datasets: chartDatasets },
      options: {
        responsive: false,
        plugins: {
          legend: { display: showLegend, position: legendPos }
        },
        scales: {
          r: {
            min: scaleMin,
            max: scaleMax,
            ticks: { count: gridLines, backdropColor: 'transparent' },
            grid: { color: 'rgba(0,0,0,0.1)' },
            angleLines: { color: 'rgba(0,0,0,0.1)' }
          }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var wraps = document.querySelectorAll('.bkrc-wrap[data-type="radar"]');
    if ( !wraps.length ) return;
    loadChartJs( function () {
      wraps.forEach( initRadar );
    });
  });
}() );
