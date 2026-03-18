(function () {
    'use strict';

    var slugCount = {};

    function slugify(text) {
        var base = text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        if (!base) base = 'heading';
        if (slugCount[base] === undefined) {
            slugCount[base] = 0;
        } else {
            slugCount[base]++;
            base = base + '-' + slugCount[base];
        }
        return base;
    }

    function getLevelNum(tag) {
        return parseInt(tag.replace(/[^0-9]/, ''), 10) || 2;
    }

    function initTOC(wrapper) {
        var nav       = wrapper.querySelector('.bkbg-toc-nav');
        var body      = wrapper.querySelector('.bkbg-toc-body');
        var toggle    = wrapper.querySelector('.bkbg-toc-toggle');
        if (!nav || !body) return;

        var include    = (wrapper.dataset.include || 'h2,h3').split(',').filter(Boolean);
        var listStyle  = wrapper.dataset.listStyle  || 'none';
        var smooth     = wrapper.dataset.smooth     !== '0';
        var offset     = parseInt(wrapper.dataset.offset || '80', 10);
        var indent     = wrapper.dataset.indent     !== '0';
        var maxH       = parseInt(wrapper.dataset.maxHeight || '0', 10);
        var collapsed  = wrapper.dataset.collapsed  === '1';

        if (collapsed) body.classList.add('bkbg-toc-hidden');

        /* ── Toggle ─────────────────────────────────────────────────────── */
        if (toggle) {
            toggle.textContent = collapsed ? '▸' : '▾';
            toggle.addEventListener('click', function () {
                var open = body.classList.toggle('bkbg-toc-hidden');
                toggle.textContent  = body.classList.contains('bkbg-toc-hidden') ? '▸' : '▾';
                toggle.setAttribute('aria-expanded', !body.classList.contains('bkbg-toc-hidden'));
            });
        }

        /* ── Collect headings ───────────────────────────────────────────── */
        var scope = document.querySelector('.entry-content, .post-content, article, main') || document.body;
        var selector = include.join(',');
        var headings = Array.prototype.slice.call(scope.querySelectorAll(selector));

        // Filter out headings that are inside the TOC itself
        headings = headings.filter(function (h) { return !wrapper.contains(h); });

        if (!headings.length) return;

        slugCount = {};

        /* ── Assign IDs ─────────────────────────────────────────────────── */
        headings.forEach(function (h) {
            if (!h.id) {
                h.id = slugify(h.textContent || h.innerText || '');
            }
        });

        /* ── Build list ─────────────────────────────────────────────────── */
        var listTag  = listStyle === 'decimal' ? 'ol' : 'ul';
        var list     = document.createElement(listTag);
        list.className = 'bkbg-toc-list bkbg-toc-ls-' + listStyle;

        if (maxH > 0) {
            list.style.maxHeight = maxH + 'px';
            list.style.overflowY = 'auto';
        }

        var anchorMap = [];

        headings.forEach(function (h) {
            var level = getLevelNum(h.tagName);
            var tag   = h.tagName.toLowerCase();
            var li    = document.createElement('li');
            li.className = 'bkbg-toc-item bkbg-toc-' + tag;
            if (indent && level > 2) li.classList.add('bkbg-toc-nested');

            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent || h.innerText || '';

            if (smooth) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    var target = document.getElementById(h.id);
                    if (!target) return;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                    history.pushState(null, '', '#' + h.id);
                });
            }

            li.appendChild(a);
            list.appendChild(li);
            anchorMap.push({ h: h, a: a });
        });

        body.appendChild(list);

        /* ── IntersectionObserver — active link highlight ────────────────── */
        if (window.IntersectionObserver) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var match = anchorMap.find(function (m) { return m.h === entry.target; });
                    if (match) {
                        if (entry.isIntersecting) {
                            anchorMap.forEach(function (m) { m.a.classList.remove('bkbg-toc-active'); });
                            match.a.classList.add('bkbg-toc-active');
                        }
                    }
                });
            }, { rootMargin: '-10% 0px -60% 0px', threshold: 0 });

            headings.forEach(function (h) { io.observe(h); });
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-toc-wrapper').forEach(initTOC);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
