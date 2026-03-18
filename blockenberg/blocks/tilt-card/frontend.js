( function () {
  function initTilt(card) {
    var maxTilt    = parseFloat(card.dataset.tiltMax) || 15;
    var scale      = parseFloat(card.dataset.tiltScale) || 1.05;
    var perspective= parseFloat(card.dataset.perspective) || 800;
    var glare      = card.dataset.glare === '1';
    var glareOpacity = parseFloat(card.dataset.glareOpacity) || 0.3;
    var glareEl    = card.querySelector('.bktc2-glare');

    var rect, active = false;

    function getRect() { rect = card.getBoundingClientRect(); }

    function onMove(e) {
      if (!active) return;
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var pctX = (x / rect.width)  - 0.5;  // -0.5 to 0.5
      var pctY = (y / rect.height) - 0.5;
      var rotateY =  pctX * maxTilt * 2;
      var rotateX = -pctY * maxTilt * 2;

      card.style.transform = 'perspective('+perspective+'px) rotateX('+rotateX+'deg) rotateY('+rotateY+'deg) scale('+scale+')';

      if (glare && glareEl) {
        var angle = Math.atan2(pctY, pctX) * (180 / Math.PI);
        glareEl.style.opacity = glareOpacity;
        glareEl.style.background = 'linear-gradient('+angle+'deg, rgba(255,255,255,'+glareOpacity+') 0%, transparent 60%)';
      }
    }

    card.addEventListener('mouseenter', function () {
      active = true;
      getRect();
      card.style.transition = 'none';
    });

    card.addEventListener('mousemove', onMove);

    card.addEventListener('mouseleave', function () {
      active = false;
      card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
      card.style.transform = 'perspective('+perspective+'px) rotateX(0deg) rotateY(0deg) scale(1)';
      if (glare && glareEl) glareEl.style.opacity = 0;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Skip on touch devices
    if ('ontouchstart' in window) return;
    document.querySelectorAll('.bktc2-card[data-tilt-max]').forEach(initTilt);
  });
}() );
