(function () {
    'use strict';

    function initCodeBlock(wrap) {
        var copyBtn = wrap.querySelector('.bkbg-cb-copy-btn');
        var pre     = wrap.querySelector('.bkbg-cb-pre');

        if (copyBtn && pre) {
            var copyLabel   = copyBtn.dataset.copyLabel   || 'Copy';
            var copiedLabel = copyBtn.dataset.copiedLabel || 'Copied!';
            var labelEl     = copyBtn.querySelector('.bkbg-cb-copy-label');
            var timer;

            copyBtn.addEventListener('click', function () {
                var text = pre.textContent;
                var setCopied = function () {
                    clearTimeout(timer);
                    copyBtn.classList.add('is-copied');
                    if (labelEl) labelEl.textContent = copiedLabel;
                    timer = setTimeout(function () {
                        copyBtn.classList.remove('is-copied');
                        if (labelEl) labelEl.textContent = copyLabel;
                    }, 2000);
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(setCopied).catch(function () {
                        fallbackCopy(text, setCopied);
                    });
                } else {
                    fallbackCopy(text, setCopied);
                }
            });
        }
    }

    function fallbackCopy(text, cb) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            if (cb) cb();
        } catch (e) {}
    }

    function initAll() {
        var blocks = document.querySelectorAll('.bkbg-cb-wrap');
        blocks.forEach(initCodeBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
