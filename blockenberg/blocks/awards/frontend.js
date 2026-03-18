(function () {

    function hexLuma(hex) {
        if (!hex) return 0;
        var c = hex.replace('#','');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
        return 0.299*r + 0.587*g + 0.114*b;
    }

    function buildAwardCard(aw, opts) {
        var card = document.createElement('div');
        card.className = 'bkbg-aw-card';

        if (aw.url) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function () { window.open(aw.url, '_blank', 'noopener'); });
        }

        /* Icon */
        var iconWrap = document.createElement('div');
        iconWrap.className = 'bkbg-aw-icon-wrap';
        iconWrap.style.background = aw.color || '';
        var iconTextColor = hexLuma(aw.color || '#6c3fb5') > 140 ? '#333' : '#fff';
        iconWrap.style.color = iconTextColor;

        if (aw.imageUrl) {
            var img = document.createElement('img');
            img.src = aw.imageUrl; img.alt = aw.title;
            iconWrap.appendChild(img);
        } else {
            var iconSpan = document.createElement('span');
            var _IP = window.bkbgIconPicker;
            var _iType = aw.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, aw.icon, aw.iconDashicon, aw.iconImageUrl, aw.iconDashiconColor);
                if (_in) iconSpan.appendChild(_in);
                else iconSpan.textContent = aw.icon || '🏆';
            } else {
                iconSpan.textContent = aw.icon || '🏆';
            }
            iconWrap.appendChild(iconSpan);
        }
        card.appendChild(iconWrap);

        /* Content */
        var content = document.createElement('div');
        content.className = 'bkbg-aw-content';

        var titleRow = document.createElement('div');
        titleRow.className = 'bkbg-aw-title-row';

        var awardTitle = document.createElement('p');
        awardTitle.className = 'bkbg-aw-award-title';
        awardTitle.textContent = aw.title;
        titleRow.appendChild(awardTitle);

        if (opts.showYear && aw.year) {
            var year = document.createElement('span');
            year.className = 'bkbg-aw-year';
            year.textContent = aw.year;
            titleRow.appendChild(year);
        }
        content.appendChild(titleRow);

        if (opts.showIssuer && aw.issuer) {
            var issuer = document.createElement('p');
            issuer.className = 'bkbg-aw-issuer';
            issuer.textContent = aw.issuer;
            content.appendChild(issuer);
        }

        if (opts.showDesc && aw.description) {
            var desc = document.createElement('p');
            desc.className = 'bkbg-aw-desc';
            desc.textContent = aw.description;
            content.appendChild(desc);
        }

        card.appendChild(content);
        return card;
    }

    function initAwards(wrapper) {
        if (wrapper.dataset.initialized) return;
        wrapper.dataset.initialized = '1';

        var gridEl = wrapper.querySelector('.bkbg-aw-grid');
        if (!gridEl) return;

        var awards = [];
        try { awards = JSON.parse(gridEl.getAttribute('data-awards') || '[]'); } catch (e) {}

        var opts = {
            layout:   gridEl.getAttribute('data-layout')      || 'grid',
            showYear: gridEl.getAttribute('data-show-year')   === '1',
            showIssuer: gridEl.getAttribute('data-show-issuer') === '1',
            showDesc: gridEl.getAttribute('data-show-desc')   === '1',
        };

        if (opts.layout === 'list') {
            gridEl.classList.remove('bkbg-aw-grid');
            gridEl.classList.add('bkbg-aw-list');
        }

        awards.forEach(function (aw) {
            gridEl.appendChild(buildAwardCard(aw, opts));
        });

        /* Staggered entrance animation */
        var cards = gridEl.querySelectorAll('.bkbg-aw-card');
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        var idx = Array.prototype.indexOf.call(cards, e.target);
                        setTimeout(function () { e.target.classList.add('is-visible'); }, idx * 80);
                        obs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.1 });
            cards.forEach(function (c) { obs.observe(c); });
        } else {
            cards.forEach(function (c) { c.classList.add('is-visible'); });
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-aw-wrapper').forEach(initAwards);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
}());
