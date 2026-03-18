(function () {
    function esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function starsHTML(rating, color) {
        var full = Math.floor(rating);
        var half = (rating - full) >= 0.5;
        var html = '<span class="bkbg-pru-stars" style="color:' + esc(color) + '">';
        for (var i = 0; i < 5; i++) {
            if (i < full) html += '★';
            else if (i === full && half) html += '½';
            else html += '☆';
        }
        html += '</span><span class="bkbg-pru-rating-num">(' + Number(rating).toFixed(1) + ')</span>';
        return html;
    }

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-pru-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                sectionTitle: 'Our Top Picks',
                sectionSubtitle: '',
                showSubtitle: true,
                products: [],
                layout: 'list',
                showRank: true,
                showRating: true,
                showPros: true,
                showCons: true,
                showPrice: true,
                showImage: true,
                openInNewTab: true,
                bgColor: '#ffffff',
                borderColor: '#e2e8f0',
                headingColor: '#0f172a',
                subtitleColor: '#64748b',
                cardBg: '#ffffff',
                cardBorder: '#e2e8f0',
                rankBg: '#0f172a',
                rankColor: '#ffffff',
                badgeBg: '#f59e0b',
                badgeColor: '#ffffff',
                nameColor: '#0f172a',
                ratingColor: '#f59e0b',
                summaryColor: '#475569',
                prosColor: '#16a34a',
                consColor: '#dc2626',
                priceColor: '#0f172a',
                ctaBg: '#0f172a',
                ctaColor: '#ffffff',
                borderRadius: 10,
                cardRadius: 8,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-pru-wrap';
            wrap.style.cssText = [
                'background:' + o.bgColor,
                'border-radius:' + o.borderRadius + 'px',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px'
            ].join(';');

            typoCssVarsForEl(wrap, o.titleTypo, '--bkbg-pru-tt-');
            typoCssVarsForEl(wrap, o.subtitleTypo, '--bkbg-pru-st-');
            typoCssVarsForEl(wrap, o.nameTypo, '--bkbg-pru-nm-');
            typoCssVarsForEl(wrap, o.summaryTypo, '--bkbg-pru-sm-');

            /* header */
            if (o.sectionTitle) {
                var h2 = document.createElement('h2');
                h2.className = 'bkbg-pru-title';
                h2.style.color = o.headingColor;
                h2.innerHTML = o.sectionTitle;
                wrap.appendChild(h2);
            }
            if (o.showSubtitle && o.sectionSubtitle) {
                var sub = document.createElement('p');
                sub.className = 'bkbg-pru-subtitle';
                sub.style.color = o.subtitleColor;
                sub.innerHTML = o.sectionSubtitle;
                wrap.appendChild(sub);
            }

            /* grid */
            var grid = document.createElement('div');
            grid.className = 'bkbg-pru-grid ' + (o.layout === 'grid' ? 'bkbg-pru-grid-2col' : 'bkbg-pru-list');

            (o.products || []).forEach(function (prod, idx) {
                var card = document.createElement('div');
                card.className = 'bkbg-pru-card';
                card.style.cssText = [
                    'background:' + o.cardBg,
                    'border:1px solid ' + o.cardBorder,
                    'border-radius:' + o.cardRadius + 'px'
                ].join(';');
                if (idx === 0 && o.showRank) {
                    card.style.borderTop = '3px solid ' + o.badgeBg;
                }

                /* header row */
                var head = document.createElement('div');
                head.className = 'bkbg-pru-card-header';

                if (o.showRank) {
                    var rankEl = document.createElement('div');
                    rankEl.className = 'bkbg-pru-rank';
                    rankEl.style.cssText = 'background:' + o.rankBg + ';color:' + o.rankColor;
                    rankEl.textContent = '#' + (prod.rank || idx + 1);
                    head.appendChild(rankEl);
                }

                if (o.showImage && prod.image) {
                    var img = document.createElement('img');
                    img.className = 'bkbg-pru-image';
                    img.src = prod.image;
                    img.alt = esc(prod.name || '');
                    img.loading = 'lazy';
                    head.appendChild(img);
                }

                var meta = document.createElement('div');
                meta.className = 'bkbg-pru-meta';

                var nameRow = document.createElement('div');
                nameRow.className = 'bkbg-pru-name-row';

                var nameEl = document.createElement('span');
                nameEl.className = 'bkbg-pru-name';
                nameEl.style.color = o.nameColor;
                nameEl.innerHTML = prod.name || '';
                nameRow.appendChild(nameEl);

                if (prod.showBadge && prod.badge) {
                    var badge = document.createElement('span');
                    badge.className = 'bkbg-pru-badge';
                    badge.style.cssText = 'background:' + o.badgeBg + ';color:' + o.badgeColor;
                    badge.textContent = prod.badge;
                    nameRow.appendChild(badge);
                }
                meta.appendChild(nameRow);

                if (o.showRating) {
                    var ratingEl = document.createElement('div');
                    ratingEl.innerHTML = starsHTML(prod.rating || 0, o.ratingColor);
                    meta.appendChild(ratingEl);
                }
                head.appendChild(meta);
                card.appendChild(head);

                /* body */
                var body = document.createElement('div');
                body.className = 'bkbg-pru-card-body';

                if (prod.summary) {
                    var sumEl = document.createElement('p');
                    sumEl.className = 'bkbg-pru-summary';
                    sumEl.style.color = o.summaryColor;
                    sumEl.innerHTML = prod.summary;
                    body.appendChild(sumEl);
                }

                if ((o.showPros && (prod.pros || []).some(Boolean)) || (o.showCons && (prod.cons || []).some(Boolean))) {
                    var pcGrid = document.createElement('div');
                    pcGrid.className = 'bkbg-pru-pros-cons';

                    if (o.showPros) {
                        var prosDiv = document.createElement('div');
                        prosDiv.className = 'bkbg-pru-pros';
                        var prosLabel = document.createElement('div');
                        prosLabel.className = 'bkbg-pru-pc-label';
                        prosLabel.style.color = o.prosColor;
                        prosLabel.textContent = '✓ Pros';
                        prosDiv.appendChild(prosLabel);
                        var prosList = document.createElement('ul');
                        prosList.className = 'bkbg-pru-pc-list';
                        (prod.pros || []).filter(Boolean).forEach(function (pro) {
                            var li = document.createElement('li');
                            li.className = 'bkbg-pru-pc-item';
                            li.style.color = o.summaryColor;
                            li.textContent = pro;
                            prosList.appendChild(li);
                        });
                        prosDiv.appendChild(prosList);
                        pcGrid.appendChild(prosDiv);
                    }

                    if (o.showCons) {
                        var consDiv = document.createElement('div');
                        consDiv.className = 'bkbg-pru-cons';
                        var consLabel = document.createElement('div');
                        consLabel.className = 'bkbg-pru-pc-label';
                        consLabel.style.color = o.consColor;
                        consLabel.textContent = '✗ Cons';
                        consDiv.appendChild(consLabel);
                        var consList = document.createElement('ul');
                        consList.className = 'bkbg-pru-pc-list';
                        (prod.cons || []).filter(Boolean).forEach(function (con) {
                            var li = document.createElement('li');
                            li.className = 'bkbg-pru-pc-item';
                            li.style.color = o.summaryColor;
                            li.textContent = con;
                            consList.appendChild(li);
                        });
                        consDiv.appendChild(consList);
                        pcGrid.appendChild(consDiv);
                    }

                    body.appendChild(pcGrid);
                }
                card.appendChild(body);

                /* footer */
                var footer = document.createElement('div');
                footer.className = 'bkbg-pru-card-footer';
                footer.style.borderTopColor = o.cardBorder;

                var priceEl = document.createElement('span');
                if (o.showPrice && prod.price) {
                    priceEl.className = 'bkbg-pru-price';
                    priceEl.style.color = o.priceColor;
                    priceEl.textContent = prod.price;
                }
                footer.appendChild(priceEl);

                if (prod.ctaLabel && prod.ctaUrl) {
                    var cta = document.createElement('a');
                    cta.className = 'bkbg-pru-cta';
                    cta.href = prod.ctaUrl;
                    cta.textContent = prod.ctaLabel;
                    cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                    if (o.openInNewTab) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
                    footer.appendChild(cta);
                }

                card.appendChild(footer);
                grid.appendChild(card);
            });

            wrap.appendChild(grid);
            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
