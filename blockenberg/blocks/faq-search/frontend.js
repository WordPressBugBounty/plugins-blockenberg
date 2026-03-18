wp.domReady(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family: 'font-family', weight: 'font-weight',
            transform: 'text-transform', style: 'font-style', decoration: 'text-decoration'
        };
        Object.keys(m).forEach(function (k) {
            if (typo[k]) el.style.setProperty(prefix + m[k], typo[k]);
        });
        var r = {
            size: 'font-size', lineHeight: 'line-height',
            letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
        };
        Object.keys(r).forEach(function (k) {
            ['Desktop', 'Tablet', 'Mobile'].forEach(function (d, i) {
                var v = typo[k + d];
                if (v === undefined || v === '') return;
                var suffix = ['-d', '-t', '-m'][i];
                var unit = typo[k + 'Unit'] || ('size' === k ? 'px' : (k === 'lineHeight' ? '' : 'px'));
                el.style.setProperty(prefix + r[k] + suffix, v + unit);
            });
        });
    }

    document.querySelectorAll('.bkbg-fs-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var items      = opts.items      || [];
        var itemStyle  = opts.itemStyle  || 'bordered';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-fs-wrap';
        if (opts.bgColor) wrap.style.background = opts.bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 48) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 48) + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-fs-inner';
        inner.style.maxWidth = (opts.maxWidth || 800) + 'px';
        inner.style.setProperty('--bkbg-fs-accent', opts.accentColor || '#7c3aed');
        inner.style.setProperty('--bkbg-fs-border', opts.borderColor || '#e5e7eb');
        inner.style.setProperty('--bkbg-fs-radius', (opts.borderRadius || 10) + 'px');
        typoCssVarsForEl(opts.typoQuestion, '--bkbg-fsrch-qt-', wrap);
        typoCssVarsForEl(opts.typoAnswer, '--bkbg-fsrch-an-', wrap);

        // Search bar
        var searchInput;
        if (opts.showSearch !== false) {
            var searchWrap = document.createElement('div');
            searchWrap.className = 'bkbg-fs-search-wrap';

            var iconEl = document.createElement('span');
            iconEl.className = 'bkbg-fs-search-icon';
            iconEl.textContent = '🔍';

            searchInput = document.createElement('input');
            searchInput.type        = 'search';
            searchInput.className   = 'bkbg-fs-search-input';
            searchInput.placeholder = opts.searchPlaceholder || 'Search FAQs…';
            if (opts.searchBg) searchInput.style.background = opts.searchBg;
            if (opts.searchBorderColor) searchInput.style.borderColor = opts.searchBorderColor;

            searchWrap.appendChild(iconEl);
            searchWrap.appendChild(searchInput);
            inner.appendChild(searchWrap);
        }

        // No results
        var noResults = document.createElement('div');
        noResults.className  = 'bkbg-fs-no-results';
        noResults.textContent = opts.noResultsText || 'No FAQs match your search.';
        inner.appendChild(noResults);

        // FAQ items
        var faqEls = [];

        items.forEach(function (item, i) {
            var faqEl = document.createElement('div');
            faqEl.className = 'bkbg-fs-item bkbg-fs-item--' + itemStyle;
            if (opts.itemBg && itemStyle !== 'plain') faqEl.style.background = opts.itemBg;

            var btn = document.createElement('button');
            btn.className = 'bkbg-fs-question-btn';
            btn.setAttribute('aria-expanded', 'false');

            var qText = document.createElement('span');
            qText.className   = 'bkbg-fs-question-text';
            qText.style.color    = opts.questionColor || '#111827';
            qText.textContent    = item.question;

            var iconSpan = document.createElement('span');
            iconSpan.className   = 'bkbg-fs-icon';
            iconSpan.textContent = '+';
            iconSpan.setAttribute('aria-hidden', 'true');

            btn.appendChild(qText);
            btn.appendChild(iconSpan);

            var answerWrap = document.createElement('div');
            answerWrap.className = 'bkbg-fs-answer-wrap';

            var answerEl = document.createElement('div');
            answerEl.className = 'bkbg-fs-answer';
            answerEl.style.color    = opts.answerColor || '#4b5563';
            answerEl.innerHTML = item.answer;

            answerWrap.appendChild(answerEl);
            faqEl.appendChild(btn);
            faqEl.appendChild(answerWrap);

            // Toggle logic
            btn.addEventListener('click', function () {
                var isOpen = faqEl.classList.contains('bkbg-fs-item--open');

                if (!opts.allowMultiple) {
                    faqEls.forEach(function (el) {
                        el.classList.remove('bkbg-fs-item--open');
                        el.querySelector('.bkbg-fs-question-btn').setAttribute('aria-expanded', 'false');
                    });
                }

                if (!isOpen) {
                    faqEl.classList.add('bkbg-fs-item--open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });

            faqEls.push(faqEl);
            inner.appendChild(faqEl);
        });

        // Open first
        if (opts.openFirst && faqEls.length > 0) {
            faqEls[0].classList.add('bkbg-fs-item--open');
            faqEls[0].querySelector('.bkbg-fs-question-btn').setAttribute('aria-expanded', 'true');
        }

        // Search filter
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                var query = searchInput.value.trim().toLowerCase();
                var visibleCount = 0;

                faqEls.forEach(function (el, i) {
                    var item = items[i];
                    var text = ((item.question || '') + ' ' + (item.answer || '')).toLowerCase();
                    var match = !query || text.includes(query);
                    el.classList.toggle('bkbg-fs-item--hidden', !match);
                    if (match) visibleCount++;
                });

                noResults.classList.toggle('bkbg-fs-no-results--visible', visibleCount === 0);
            });
        }

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});
