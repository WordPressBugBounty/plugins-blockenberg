(function () {
    'use strict';

    function initTextStroke(wrap) {
        var hoverFill   = wrap.dataset.hoverFill;
        var hoverStroke = wrap.dataset.hoverStroke;

        if (hoverFill)   wrap.style.setProperty('--bkts-hover-fill',   hoverFill);
        if (hoverStroke) wrap.style.setProperty('--bkts-hover-stroke', hoverStroke);
    }

    function init() {
        document.querySelectorAll('.bkts-wrap[data-hover]').forEach(initTextStroke);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
