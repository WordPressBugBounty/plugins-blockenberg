(function () {

    function buildCard(item, currency, a) {
        var isHl = !!item.highlighted;
        var card = document.createElement('div');
        card.className = 'bkbg-cpc-card' + (isHl ? ' is-highlighted' : '');

        /* Badge */
        if (item.badge) {
            var badge = document.createElement('div');
            badge.className = 'bkbg-cpc-badge';
            badge.textContent = item.badge;
            card.appendChild(badge);
        }

        /* Header */
        var header = document.createElement('div');
        header.className = 'bkbg-cpc-card-header';
        var titleEl = document.createElement('p');
        titleEl.className = 'bkbg-cpc-card-title';
        titleEl.textContent = item.title;
        header.appendChild(titleEl);
        if (item.subtitle) {
            var sub = document.createElement('p'); sub.className = 'bkbg-cpc-card-subtitle'; sub.textContent = item.subtitle; header.appendChild(sub);
        }
        card.appendChild(header);

        /* Price */
        var priceRow = document.createElement('div');
        priceRow.className = 'bkbg-cpc-price-row';
        var price = document.createElement('span');
        price.className = 'bkbg-cpc-price';
        price.textContent = (currency || '$') + item.price;
        priceRow.appendChild(price);
        if (item.period) {
            var period = document.createElement('span'); period.className = 'bkbg-cpc-period'; period.textContent = '/' + item.period; priceRow.appendChild(period);
        }
        card.appendChild(priceRow);

        /* Features */
        var feats = document.createElement('div');
        feats.className = 'bkbg-cpc-features';
        (item.features || []).forEach(function (f) {
            var row = document.createElement('div');
            row.className = 'bkbg-cpc-feature';
            var icon = document.createElement('span');
            icon.className = 'bkbg-cpc-icon-' + (f.type || 'dash');
            icon.textContent = f.type === 'check' ? '✓' : f.type === 'cross' ? '✗' : '—';
            var text = document.createElement('span');
            text.textContent = f.text;
            row.appendChild(icon);
            row.appendChild(text);
            feats.appendChild(row);
        });
        card.appendChild(feats);

        /* CTA */
        if (item.ctaLabel) {
            var ctaWrap = document.createElement('div');
            ctaWrap.className = 'bkbg-cpc-cta-wrap';
            var cta = document.createElement('a');
            cta.className = 'bkbg-cpc-cta';
            cta.textContent = item.ctaLabel;
            cta.href = item.ctaUrl || '#';
            if (item.ctaNewTab) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
            ctaWrap.appendChild(cta);
            card.appendChild(ctaWrap);
        }

        return card;
    }

    function initCompCards(wrapper) {
        if (wrapper.dataset.initialized) return;
        wrapper.dataset.initialized = '1';

        var gridEl = wrapper.querySelector('.bkbg-cpc-grid');
        if (!gridEl) return;

        var items = [];
        var currency = gridEl.getAttribute('data-currency') || '$';
        var showVs   = gridEl.getAttribute('data-show-vs') === '1';
        try { items = JSON.parse(gridEl.getAttribute('data-items') || '[]'); } catch (e) {}

        gridEl.style.display = 'flex';
        gridEl.style.alignItems = 'flex-end';
        gridEl.style.flexWrap = 'wrap';

        items.forEach(function (item, idx) {
            var card = buildCard(item, currency, {});
            gridEl.appendChild(card);

            if (showVs && idx < items.length - 1) {
                var vs = document.createElement('div');
                vs.className = 'bkbg-cpc-vs';
                vs.textContent = 'vs';
                gridEl.appendChild(vs);
            }
        });

        /* Staggered entrance */
        var cards = gridEl.querySelectorAll('.bkbg-cpc-card');
        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        var idx2 = Array.prototype.indexOf.call(cards, e.target);
                        setTimeout(function () { e.target.classList.add('is-visible'); }, idx2 * 100);
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
        document.querySelectorAll('.bkbg-cpc-wrapper').forEach(initCompCards);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
}());
