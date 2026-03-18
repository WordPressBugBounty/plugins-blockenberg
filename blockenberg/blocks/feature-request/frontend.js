(function () {
    'use strict';

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

    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    function statusInfo(s, a) {
        var map = {
            'planned':      { label: 'Planned',      bg: a.plannedBg,      color: a.plannedColor },
            'in-progress':  { label: 'In Progress',  bg: a.inProgressBg,   color: a.inProgressColor },
            'done':         { label: 'Done',          bg: a.doneBg,         color: a.doneColor },
            'declined':     { label: 'Declined',      bg: a.declinedBg,     color: a.declinedColor },
            'under-review': { label: 'Under Review',  bg: a.underReviewBg,  color: a.underReviewColor }
        };
        return map[s] || map['planned'];
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            boardTitle: 'Feature Requests', description: '', showDescription: true,
            requests: [], showVotes: true, showCategory: true, showDate: true,
            fontSize: 14, titleFontSize: 22, cardTitleSize: 16, lineHeight: 160,
            borderRadius: 12, cardRadius: 10,
            bgColor: '#f8fafc', cardBg: '#ffffff', borderColor: '#e2e8f0',
            titleColor: '#0f172a', descColor: '#64748b',
            cardTitleColor: '#1e293b', cardDescColor: '#64748b',
            votesBg: '#f1f5f9', votesColor: '#334155',
            categoryBg: '#f1f5f9', categoryColor: '#475569', dateColor: '#94a3b8',
            plannedBg: '#dbeafe', plannedColor: '#1e40af',
            inProgressBg: '#ede9fe', inProgressColor: '#5b21b6',
            doneBg: '#dcfce7', doneColor: '#14532d',
            declinedBg: '#fee2e2', declinedColor: '#991b1b',
            underReviewBg: '#fef9c3', underReviewColor: '#713f12'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);
        var sorted = a.requests.slice().sort(function (x, y) { return y.votes - x.votes; });

        var wrap = mk('div', 'bkbg-fr-wrap');
        wrap.style.cssText = 'background:' + a.bgColor + ';border-radius:' + a.borderRadius + 'px;padding:32px';
        typoCssVarsForEl(a.typoTitle, '--bkbg-fr-tt-', wrap);
        typoCssVarsForEl(a.typoBody, '--bkbg-fr-bd-', wrap);
        typoCssVarsForEl(a.typoCardTitle, '--bkbg-fr-ct-', wrap);

        var header = mk('div', 'bkbg-fr-header');
        var title = tx('h2', 'bkbg-fr-title', a.boardTitle);
        title.style.color = a.titleColor;
        ap(header, title);
        if (a.showDescription && a.description) {
            var desc = tx('p', 'bkbg-fr-desc', a.description);
            desc.style.color = a.descColor;
            ap(header, desc);
        }
        ap(wrap, header);

        var grid = mk('div', 'bkbg-fr-grid');

        sorted.forEach(function (req) {
            var si = statusInfo(req.status, a);
            var card = mk('div', 'bkbg-fr-card');
            card.style.cssText = 'background:' + a.cardBg + ';border:1px solid ' + a.borderColor + ';border-radius:' + a.cardRadius + 'px';

            var top = mk('div', 'bkbg-fr-card-top');
            var info = mk('div', 'bkbg-fr-card-info');
            var cardTitle = tx('div', 'bkbg-fr-card-title', req.title);
            cardTitle.style.color = a.cardTitleColor;
            var cardDesc = tx('div', 'bkbg-fr-card-desc', req.description);
            cardDesc.style.color = a.cardDescColor;
            ap(info, cardTitle, cardDesc);
            ap(top, info);

            if (a.showVotes) {
                var votes = mk('div', 'bkbg-fr-votes');
                votes.style.cssText = 'background:' + a.votesBg + ';color:' + a.votesColor;
                var arr = tx('span', 'bkbg-fr-votes-arrow', '▲');
                var cnt = tx('span', null, String(req.votes));
                ap(votes, arr, cnt);
                ap(top, votes);
            }
            ap(card, top);

            var bottom = mk('div', 'bkbg-fr-card-bottom');
            var badge = tx('span', 'bkbg-fr-status-badge', si.label);
            badge.style.cssText = 'background:' + si.bg + ';color:' + si.color;
            ap(bottom, badge);
            if (a.showCategory && req.category) {
                var cat = tx('span', 'bkbg-fr-category', req.category);
                cat.style.cssText = 'background:' + a.categoryBg + ';color:' + a.categoryColor;
                ap(bottom, cat);
            }
            if (a.showDate && req.date) {
                var date = tx('span', 'bkbg-fr-date', req.date);
                date.style.color = a.dateColor;
                ap(bottom, date);
            }
            ap(card, bottom);
            ap(grid, card);
        });

        ap(wrap, grid);
        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() { document.querySelectorAll('.bkbg-feature-request-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
