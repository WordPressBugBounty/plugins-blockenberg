(function () {
    'use strict';

    // Flash notification element
    var flash = null;
    function showFlash(hex) {
        if (!flash) {
            flash = document.createElement('div');
            flash.className = 'bkbg-ct-copied-flash';
            document.body.appendChild(flash);
        }
        flash.textContent = 'Copied ' + hex;
        flash.classList.add('show');
        clearTimeout(flash._timer);
        flash._timer = setTimeout(function () { flash.classList.remove('show'); }, 1600);
    }

    function init() {
        document.querySelectorAll('.bkbg-ct-wrap').forEach(function (wrap) {
            if (wrap.dataset.ctReady) return;
            wrap.dataset.ctReady = '1';

            wrap.querySelectorAll('.bkbg-ct-color-block').forEach(function (block) {
                var hex = block.dataset.hex;
                if (!hex) return;
                block.addEventListener('click', function () {
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(hex).then(function () { showFlash(hex); });
                    } else {
                        var ta = document.createElement('textarea');
                        ta.value = hex;
                        ta.style.position = 'fixed';
                        ta.style.opacity = '0';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        showFlash(hex);
                    }
                });
            });
        });
    }

    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
