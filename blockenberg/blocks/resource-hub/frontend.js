(function () {
    var typeIcons = { guide: '📖', video: '🎬', template: '📋', tool: '🛠', podcast: '🎙', other: '📌' };

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + _typoKeys[k], String(v));
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-rhb-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Free Resources', heading: 'Level Up Your Skills',
                subtext: 'Guides, templates, and tools to help you grow faster.',
                resources: [
                    { title: 'The Ultimate SEO Checklist', description: 'A comprehensive SEO audit checklist.', category: 'Guides', type: 'guide', imageUrl: '', url: '#', featured: false },
                    { title: 'Email Marketing Templates', description: '10 proven email sequences.', category: 'Templates', type: 'template', imageUrl: '', url: '#', featured: false }
                ],
                showFilter: true, layout: 'grid', columns: 3, showType: true,
                ctaLabel: 'Download Free',
                bgColor: '#ffffff', headingColor: '#111827', subColor: '#6b7280', eyebrowColor: '#6366f1',
                cardBg: '#f8fafc', cardBorder: '#e2e8f0', titleColor: '#111827', descColor: '#6b7280',
                filterBg: '#f1f5f9', filterColor: '#6b7280', filterActiveBg: '#6366f1', filterActiveColor: '#ffffff',
                ctaBg: '#6366f1', ctaColor: '#ffffff', accentColor: '#6366f1',
                maxWidth: 1200, paddingTop: 80, paddingBottom: 80
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-rhb-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            typoCssVarsForEl(o.headingTypo, '--bkrh-ht-', inner);
            typoCssVarsForEl(o.subtextTypo, '--bkrh-st-', inner);

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-rhb-header';
            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-rhb-eyebrow';
            eyebrow.style.color = o.eyebrowColor;
            eyebrow.innerHTML = o.eyebrow;
            var heading = document.createElement('h2');
            heading.className = 'bkbg-rhb-heading';
            heading.style.color = o.headingColor;
            heading.innerHTML = o.heading;
            var sub = document.createElement('p');
            sub.className = 'bkbg-rhb-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;
            header.appendChild(eyebrow);
            header.appendChild(heading);
            header.appendChild(sub);
            inner.appendChild(header);

            /* Derive unique categories */
            var allCats = ['All'];
            (o.resources || []).forEach(function (r) {
                if (r.category && allCats.indexOf(r.category) === -1) allCats.push(r.category);
            });

            /* Filter */
            var activeFilter = 'All';
            var cardEls = [];

            if (o.showFilter) {
                var filterRow = document.createElement('div');
                filterRow.className = 'bkbg-rhb-filter';

                allCats.forEach(function (cat) {
                    var pill = document.createElement('button');
                    pill.className = 'bkbg-rhb-pill';
                    pill.textContent = cat;
                    pill.style.cssText = (cat === activeFilter)
                        ? 'background:' + o.filterActiveBg + ';color:' + o.filterActiveColor
                        : 'background:' + o.filterBg + ';color:' + o.filterColor;

                    pill.addEventListener('click', function () {
                        activeFilter = cat;
                        filterRow.querySelectorAll('.bkbg-rhb-pill').forEach(function (p) {
                            p.style.cssText = (p.textContent === activeFilter)
                                ? 'background:' + o.filterActiveBg + ';color:' + o.filterActiveColor
                                : 'background:' + o.filterBg + ';color:' + o.filterColor;
                        });
                        cardEls.forEach(function (info) {
                            info.card.classList.toggle('hidden', activeFilter !== 'All' && info.category !== activeFilter);
                        });
                    });

                    filterRow.appendChild(pill);
                });

                inner.appendChild(filterRow);
            }

            /* Grid */
            var isList = o.layout === 'list';
            var isFeatured = o.layout === 'featured';

            var grid = document.createElement('div');
            grid.className = 'bkbg-rhb-grid layout-' + o.layout;
            if (!isList) {
                grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';
            }

            (o.resources || []).forEach(function (r) {
                var card = document.createElement('div');
                card.className = 'bkbg-rhb-card' + (r.featured && isFeatured ? ' featured' : '');
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;

                /* Thumbnail or placeholder */
                if (r.imageUrl) {
                    var img = document.createElement('img');
                    img.className = 'bkbg-rhb-card-thumb';
                    img.src = r.imageUrl;
                    img.alt = r.title;
                    card.appendChild(img);
                } else {
                    var placeholder = document.createElement('div');
                    placeholder.className = 'bkbg-rhb-card-placeholder';
                    placeholder.style.cssText = 'background:linear-gradient(135deg,' + o.accentColor + '22,' + o.accentColor + '44)';
                    placeholder.textContent = typeIcons[r.type] || '📌';
                    card.appendChild(placeholder);
                }

                /* Body */
                var body = document.createElement('div');
                body.className = 'bkbg-rhb-card-body';

                if (o.showType && r.type) {
                    var typeLabel = document.createElement('span');
                    typeLabel.className = 'bkbg-rhb-type-label';
                    typeLabel.style.color = o.accentColor;
                    typeLabel.textContent = (typeIcons[r.type] || '') + ' ' + r.type;
                    body.appendChild(typeLabel);
                }

                var title = document.createElement('div');
                title.className = 'bkbg-rhb-card-title';
                title.style.color = o.titleColor;
                title.textContent = r.title;

                var desc = document.createElement('div');
                desc.className = 'bkbg-rhb-card-desc';
                desc.style.color = o.descColor;
                desc.textContent = r.description;

                var cta = document.createElement('a');
                cta.className = 'bkbg-rhb-card-cta';
                cta.href = r.url;
                cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                cta.textContent = o.ctaLabel;

                body.appendChild(title);
                body.appendChild(desc);
                body.appendChild(cta);
                card.appendChild(body);
                grid.appendChild(card);

                cardEls.push({ card: card, category: r.category });
            });

            inner.appendChild(grid);
            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
