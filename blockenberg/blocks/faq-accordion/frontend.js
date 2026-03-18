(function () {
    'use strict';

    function initAccordion(wrap) {
        var allowMultiple = wrap.dataset.allowMultiple === '1';
        var items = Array.from(wrap.querySelectorAll('[data-faq-item]'));

        items.forEach(function (item) {
            var btn = item.querySelector('.bkbg-fa-question');
            var answer = item.querySelector('.bkbg-fa-answer');
            if (!btn || !answer) return;

            btn.addEventListener('click', function () {
                var isOpen = item.classList.contains('bkbg-fa-item--open');

                // Close all if single-open mode
                if (!allowMultiple) {
                    items.forEach(function (other) {
                        if (other !== item) {
                            other.classList.remove('bkbg-fa-item--open');
                            var ob = other.querySelector('.bkbg-fa-question');
                            var oa = other.querySelector('.bkbg-fa-answer');
                            if (ob) ob.setAttribute('aria-expanded', 'false');
                            if (oa) oa.hidden = true;
                        }
                    });
                }

                if (isOpen) {
                    item.classList.remove('bkbg-fa-item--open');
                    btn.setAttribute('aria-expanded', 'false');
                    answer.hidden = true;
                } else {
                    item.classList.add('bkbg-fa-item--open');
                    btn.setAttribute('aria-expanded', 'true');
                    answer.hidden = false;
                }
            });
        });
    }

    document.querySelectorAll('.bkbg-fa-wrap').forEach(initAccordion);
})();
