/* Doughnut Chart — frontend.js (Chart.js via CDN) */
( function () {
  var CHARTJS_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

  function loadChartJs(cb) {
    if (window.Chart) { cb(); return; }
    var s=document.createElement('script'); s.src=CHARTJS_CDN; s.onload=cb; document.head.appendChild(s);
  }

  function initChart(wrap) {
    var canvas  = wrap.querySelector('canvas');
    if (!canvas) return;
    var slices  = JSON.parse(wrap.dataset.slices||'[]');
    var cutout  = (wrap.dataset.cutout||'60')+'%';
    var size    = parseInt(wrap.dataset.size)||300;
    var showLeg = wrap.dataset.legend!=='0';
    var legPos  = wrap.dataset.legendPos||'bottom';

    var canvasWrap = wrap.querySelector('.bkdc-canvas-wrap');
    if (canvasWrap) { canvasWrap.style.width=size+'px'; canvasWrap.style.height=size+'px'; }

    canvas.width  = size;
    canvas.height = size;

    new window.Chart(canvas,{
      type:'doughnut',
      data:{
        labels: slices.map(s=>s.label),
        datasets:[{
          data:            slices.map(s=>s.value),
          backgroundColor: slices.map(s=>s.color),
          borderWidth:     2,
          borderColor:     '#fff',
        }]
      },
      options:{
        cutout: cutout,
        responsive:false,
        plugins:{legend:{display:showLeg,position:legPos}},
      }
    });
  }

  function init(){
    var wraps=document.querySelectorAll('.bkdc-wrap[data-type]');
    if(!wraps.length) return;
    loadChartJs(function(){wraps.forEach(initChart);});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
}() );
