(function () {
    'use strict';

    function initReadMore(wrap) {
        var content = wrap.querySelector('.bkrm-content');
        var btn     = wrap.querySelector('.bkrm-btn');
        var label   = wrap.querySelector('.bkrm-label');

        if (!content || !btn) return;

        var readMoreText = label ? label.textContent : (btn.dataset.readMore || 'Read more');
        var showLessText = btn.dataset.showLess || 'Show less';

        // Read data-attributes set by block (fallback to CSS var)
        if (btn.dataset) {
            // labels may be stored in data attributes or scanned from DOM at build time
        }

        btn.addEventListener('click', function () {
            var isExpanded = content.classList.contains('bkrm-expanded');

            if (isExpanded) {
                // Collapse: set fixed height first, then remove class
                content.style.maxHeight = content.scrollHeight + 'px';
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        content.classList.remove('bkrm-expanded');
                        content.classList.add('bkrm-collapsed');
                        btn.setAttribute('aria-expanded', 'false');
                        if (label) label.textContent = readMoreText;
                    });
                });
            } else {
                // Expand: set max-height to scrollHeight for transition
                content.classList.remove('bkrm-collapsed');
                content.classList.add('bkrm-expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                btn.setAttribute('aria-expanded', 'true');
                if (label) label.textContent = showLessText;

                // After transition remove inline style so it stays open
                var transEnd = function () {
                    content.style.maxHeight = '';
                    content.removeEventListener('transitionend', transEnd);
                };
                content.addEventListener('transitionend', transEnd);
            }
        });

        // Check if content is actually taller than collapsed height — hide btn if not
        var collapsedPx = parseFloat(getComputedStyle(content).getPropertyValue('--bkrm-collapsed') || '180');
        var text = content.querySelector('.bkrm-text');
        if (text && text.scrollHeight <= collapsedPx + 10) {
            // Content fits — remove collapse, hide button
            content.classList.remove('bkrm-collapsed');
            content.classList.add('bkrm-expanded');
            var btnWrap = wrap.querySelector('.bkrm-btn-wrap');
            if (btnWrap) btnWrap.style.display = 'none';
        }
    }

    function init() {
        document.querySelectorAll('.bkrm-wrap').forEach(initReadMore);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
