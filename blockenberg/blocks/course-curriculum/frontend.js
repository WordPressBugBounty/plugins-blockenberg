(function () {
    function initCurriculum(card) {
        var expandAll  = card.dataset.expandAll  === '1';
        var defaultOpen = parseInt(card.dataset.defaultOpen, 10) || 0;

        var sections = card.querySelectorAll('.bkbg-cc-section');

        sections.forEach(function (section, idx) {
            var hdr     = section.querySelector('.bkbg-cc-sec-hdr');
            var lessons = section.querySelector('.bkbg-cc-lessons');
            if (!hdr || !lessons) return;

            var shouldOpen = expandAll || idx === defaultOpen;
            hdr.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
            lessons.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');

            hdr.addEventListener('click', function () {
                var isOpen = hdr.getAttribute('aria-expanded') === 'true';
                hdr.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
                lessons.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
            });

            hdr.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    hdr.click();
                }
            });
        });
    }

    function init() {
        var cards = document.querySelectorAll('.bkbg-cc-card');
        cards.forEach(initCurriculum);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
