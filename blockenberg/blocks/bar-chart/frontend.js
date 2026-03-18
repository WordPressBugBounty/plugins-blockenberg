/* Bar Chart — frontend.js (Chart.js via CDN) */
( function () {
  var CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

  function loadChartJs(cb) {
    if (window.Chart) { cb(); return; }
    var s=document.createElement('script'); s.src=CHARTJS_CDN; s.onload=cb; document.head.appendChild(s);
  }

  function hexToRgb(hex) {
    return parseInt(hex.slice(1,3),16)+','+parseInt(hex.slice(3,5),16)+','+parseInt(hex.slice(5,7),16);
  }

  function initChart(wrap) {
    var canvas   = wrap.querySelector('canvas');
    if (!canvas) return;
    var labels     = (wrap.dataset.labels||'').split(',').map(s=>s.trim());
    var datasets   = JSON.parse(wrap.dataset.datasets||'[]');
    var orient     = wrap.dataset.orientation==='horizontal';
    var stacked    = wrap.dataset.stacked==='1';
    var barRadius  = parseInt(wrap.dataset.barRadius)||0;
    var height     = parseInt(wrap.dataset.height)||340;
    var showGrid   = wrap.dataset.grid!=='0';
    var showLeg    = wrap.dataset.legend!=='0';
    var legPos     = wrap.dataset.legendPos||'top';

    canvas.height = height;

    var chartDatasets = datasets.map(function(ds) {
      var rgb=hexToRgb(ds.color||'#6c3fb5');
      return {
        label:           ds.label,
        data:            (ds.data||'').split(',').map(Number),
        backgroundColor: 'rgba('+rgb+',0.82)',
        borderColor:     ds.color,
        borderWidth:     1,
        borderRadius:    barRadius,
        borderSkipped:   false,
      };
    });

    new window.Chart(canvas,{
      type: orient ? 'bar' : 'bar',
      data: {labels:labels,datasets:chartDatasets},
      options:{
        indexAxis: orient ? 'y' : 'x',
        responsive:true,
        plugins:{legend:{display:showLeg,position:legPos}},
        scales:{
          x:{stacked:stacked,grid:{display:showGrid}},
          y:{stacked:stacked,grid:{display:showGrid}},
        },
      }
    });
  }

  function init(){
    var wraps=document.querySelectorAll('.bkbc-wrap[data-type]');
    if(!wraps.length) return;
    loadChartJs(function(){ wraps.forEach(initChart); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}() );
