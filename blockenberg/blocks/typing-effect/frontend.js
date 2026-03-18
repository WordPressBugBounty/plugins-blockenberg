( function () {
  function initTyping(wrap) {
    var typed       = wrap.querySelector('.bkte-typed');
    var cursor      = wrap.querySelector('.bkte-cursor');
    if (!typed) return;

    var phrasesRaw  = wrap.dataset.phrases || '';
    var typeSpeed   = parseInt(wrap.dataset.typeSpeed, 10) || 80;
    var deleteSpeed = parseInt(wrap.dataset.deleteSpeed, 10) || 40;
    var pause       = parseInt(wrap.dataset.pause, 10) || 1800;
    var loop        = wrap.dataset.loop !== '0';
    var cursorBlink = wrap.dataset.cursorBlink !== '0';

    if (cursorBlink && cursor) cursor.style.animation = 'bkteCursorBlink 0.75s step-end infinite';

    var phrases = phrasesRaw.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    if (!phrases.length) return;

    var idx = 0;
    var charIdx = 0;
    var deleting = false;

    function tick() {
      var current = phrases[idx];
      if (!deleting) {
        charIdx++;
        typed.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          deleting = true;
          setTimeout(tick, pause);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIdx--;
        typed.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          idx++;
          if (idx >= phrases.length) {
            if (!loop) return;
            idx = 0;
          }
        }
        setTimeout(tick, deleting ? deleteSpeed : typeSpeed + 20);
      }
    }

    // Start typing after a short delay
    setTimeout(tick, 600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkte-wrap[data-phrases]').forEach(initTyping);
  });
}() );
