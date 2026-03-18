/* Job Listing — frontend */
(function () {
    'use strict';

    function init() {
        document.querySelectorAll('.bkjl-wrap').forEach(function (wrap) {
            if (wrap._bkjlInit) { return; }
            wrap._bkjlInit = true;

            /* Secondary button hover — mirror primary button colour */
            var applyBtn = wrap.querySelector('.bkjl-btn-apply');
            var secBtn   = wrap.querySelector('.bkjl-btn-secondary');

            if (applyBtn && secBtn) {
                var primaryBg   = applyBtn.style.background || applyBtn.style.backgroundColor || '#6c3fb5';
                var primaryText = applyBtn.style.color || '#ffffff';

                var origBg    = secBtn.style.background || secBtn.style.backgroundColor || '';
                var origColor = secBtn.style.color || '';

                secBtn.addEventListener('mouseenter', function () {
                    secBtn.style.background = primaryBg;
                    secBtn.style.color      = primaryText;
                });

                secBtn.addEventListener('mouseleave', function () {
                    secBtn.style.background = origBg;
                    secBtn.style.color      = origColor;
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
