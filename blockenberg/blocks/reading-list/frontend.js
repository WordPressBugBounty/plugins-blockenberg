(function () {
    'use strict';

    document.querySelectorAll('.bkbg-rl-list').forEach(function (list) {
        var opts = {};
        try { opts = JSON.parse(list.dataset.opts || '{}'); } catch (e) {}

        if (!opts.filterByStatus) return;

        var cards = list.querySelectorAll('.bkbg-rl-card');

        // Collect unique statuses
        var statuses = [];
        cards.forEach(function (card) {
            var s = card.dataset.status;
            if (s && statuses.indexOf(s) === -1) statuses.push(s);
        });

        if (statuses.length < 2) return;

        var STATUS_LABELS = {
            'read': 'Read',
            'reading': 'Currently Reading',
            'want-to-read': 'Want to Read',
            'recommended': 'Recommended',
            'dnf': 'Did Not Finish'
        };

        // Build filter bar
        var bar = document.createElement('div');
        bar.className = 'bkbg-rl-filter-bar';
        bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;';

        function setFilter(active) {
            bar.querySelectorAll('.bkbg-rl-filter-btn').forEach(function (btn) {
                var isActive = btn.dataset.status === active || (active === 'all' && btn.dataset.status === 'all');
                btn.style.opacity = isActive ? '1' : '0.55';
                btn.style.fontWeight = isActive ? '700' : '400';
            });
            cards.forEach(function (card) {
                var show = active === 'all' || card.dataset.status === active;
                card.style.display = show ? '' : 'none';
            });
        }

        // All button
        var allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.dataset.status = 'all';
        allBtn.className = 'bkbg-rl-filter-btn';
        allBtn.textContent = 'All';
        allBtn.style.cssText = 'padding:4px 14px;border-radius:999px;border:1px solid #d1d5db;background:#fff;cursor:pointer;font-size:13px;';
        allBtn.addEventListener('click', function () { setFilter('all'); });
        bar.appendChild(allBtn);

        statuses.forEach(function (s) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.status = s;
            btn.className = 'bkbg-rl-filter-btn';
            btn.textContent = STATUS_LABELS[s] || s;
            btn.style.cssText = 'padding:4px 14px;border-radius:999px;border:1px solid #d1d5db;background:#fff;cursor:pointer;font-size:13px;opacity:0.55;';
            btn.addEventListener('click', function () { setFilter(s); });
            bar.appendChild(btn);
        });

        list.parentNode.insertBefore(bar, list);
        setFilter('all');

        // Entrance animation
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'none';
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            cards.forEach(function (card, i) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(16px)';
                card.style.transition = 'opacity 0.4s ' + (i * 0.06) + 's, transform 0.4s ' + (i * 0.06) + 's';
                io.observe(card);
            });
        }
    });
})();
