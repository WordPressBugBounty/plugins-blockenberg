/* Color Palette — frontend */
(function () {
    'use strict';

    function hexToRgb(hex) {
        var clean = (hex || '').replace('#', '');
        if (clean.length === 3) { clean = clean.split('').map(function (c) { return c + c; }).join(''); }
        var r = parseInt(clean.substring(0, 2), 16) || 0;
        var g = parseInt(clean.substring(2, 4), 16) || 0;
        var b = parseInt(clean.substring(4, 6), 16) || 0;
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    function init() {
        document.querySelectorAll('.bkcp-wrap').forEach(function (wrap) {
            if (wrap._bkcpInit) { return; }
            wrap._bkcpInit = true;

            /* fill in RGB labels */
            wrap.querySelectorAll('.bkcp-rgb[data-hex]').forEach(function (el) {
                el.textContent = hexToRgb(el.getAttribute('data-hex'));
            });

            /* copy buttons */
            wrap.querySelectorAll('.bkcp-copy').forEach(function (btn) {
                /* pre-populate rgb data attr */
                var hex    = btn.getAttribute('data-hex') || '';
                var rgb    = hexToRgb(hex);
                var cssVar = btn.getAttribute('data-cssvar') || '';
                var format = btn.getAttribute('data-format') || 'hex';

                btn.setAttribute('data-rgb', rgb);

                btn.addEventListener('click', function () {
                    var text = format === 'rgb'  ? rgb
                             : format === 'css'  ? (cssVar || hex)
                             : hex.toUpperCase();

                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(function () { showCopied(btn); });
                    } else {
                        /* fallback */
                        var ta = document.createElement('textarea');
                        ta.value = text;
                        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        showCopied(btn);
                    }
                });
            });
        });
    }

    function showCopied(btn) {
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('bkcp-copied');
        setTimeout(function () {
            btn.textContent = orig;
            btn.classList.remove('bkcp-copied');
        }, 1800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
