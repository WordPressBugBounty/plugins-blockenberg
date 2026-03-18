(function () {
    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    function initToggle(wrap) {
        var trigger = wrap.querySelector('.bkbg-tgl-trigger');
        var content = wrap.querySelector('.bkbg-tgl-content');
        if (!trigger || !content) return;

        var speed = parseInt(wrap.getAttribute('data-speed'), 10) || 280;

        // Set initial max-height for open state
        if (wrap.classList.contains('is-open')) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }

        trigger.addEventListener('click', function () {
            var isOpen = wrap.classList.contains('is-open');

            if (isOpen) {
                // Closing: set explicit height first, then animate to 0
                content.style.maxHeight = content.scrollHeight + 'px';
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        content.style.maxHeight = '0';
                        wrap.classList.remove('is-open');
                        trigger.setAttribute('aria-expanded', 'false');
                        content.setAttribute('aria-hidden', 'true');
                    });
                });
            } else {
                // Opening
                wrap.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
                content.setAttribute('aria-hidden', 'false');
                content.style.maxHeight = content.scrollHeight + 'px';

                content.addEventListener('transitionend', function onEnd() {
                    if (wrap.classList.contains('is-open')) {
                        content.style.maxHeight = 'none';
                    }
                    content.removeEventListener('transitionend', onEnd);
                });
            }
        });

        // Keyboard support
        trigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
        });
    }

    function init() {
        toArray(document.querySelectorAll('.bkbg-tgl-wrap')).forEach(initToggle);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
