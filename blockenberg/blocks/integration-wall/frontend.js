(function () {
    function logoLetter(name) { return (name || '?').charAt(0).toUpperCase(); }

    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-igw-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Ecosystem', heading: 'Works With Your Favourite Tools',
                subtext: 'Connect to 200+ apps and automate your workflow.',
                integrations: [], showFilter: true, cardStyle: 'card', columns: 4,
                showDesc: true, showCta: true, ctaLabel: 'Browse All Integrations →', ctaUrl: '#',
                maxWidth: 1200, paddingTop: 80, paddingBottom: 80,
                bgColor: '#ffffff', headingColor: '#111827', subColor: '#6b7280', eyebrowColor: '#6366f1',
                cardBg: '#f8fafc', cardBorder: '#e2e8f0', nameColor: '#111827', descColor: '#6b7280',
                logoBg: '#e0e7ff', logoColor: '#4338ca',
                filterBg: '#f1f5f9', filterColor: '#64748b', filterActiveBg: '#6366f1', filterActiveColor: '#ffffff',
                accentColor: '#6366f1'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-igw-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';
            typoCssVarsForEl(o.headingTypo, '--bkbg-igw-h-', inner);
            typoCssVarsForEl(o.subtextTypo, '--bkbg-igw-st-', inner);
            typoCssVarsForEl(o.nameTypo, '--bkbg-igw-nm-', inner);

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-igw-header';
            header.style.cssText = 'text-align:center;margin-bottom:40px;';

            var ey = document.createElement('p'); ey.className = 'bkbg-igw-eyebrow'; ey.style.color = o.eyebrowColor; ey.innerHTML = o.eyebrow;
            var h2 = document.createElement('h2'); h2.className = 'bkbg-igw-heading'; h2.style.color = o.headingColor; h2.innerHTML = o.heading;
            var sub = document.createElement('p'); sub.className = 'bkbg-igw-sub'; sub.style.color = o.subColor; sub.innerHTML = o.subtext;
            header.appendChild(ey); header.appendChild(h2); header.appendChild(sub);
            inner.appendChild(header);

            /* Categories */
            var cats = ['All'];
            (o.integrations || []).forEach(function (it) { if (it.category && cats.indexOf(it.category) === -1) cats.push(it.category); });

            var activeFilter = 'All';
            var cardEls = [];

            /* Filter */
            if (o.showFilter) {
                var filterRow = document.createElement('div');
                filterRow.className = 'bkbg-igw-filter';

                cats.forEach(function (cat) {
                    var pill = document.createElement('button');
                    pill.className = 'bkbg-igw-pill';
                    pill.textContent = cat;
                    pill.style.cssText = cat === 'All' ? 'background:' + o.filterActiveBg + ';color:' + o.filterActiveColor : 'background:' + o.filterBg + ';color:' + o.filterColor;
                    pill.addEventListener('click', function () {
                        activeFilter = cat;
                        filterRow.querySelectorAll('.bkbg-igw-pill').forEach(function (p) {
                            p.style.cssText = p.textContent === activeFilter ? 'background:' + o.filterActiveBg + ';color:' + o.filterActiveColor : 'background:' + o.filterBg + ';color:' + o.filterColor;
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
            var grid = document.createElement('div');
            grid.className = 'bkbg-igw-grid card-style-' + o.cardStyle;
            grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';

            (o.integrations || []).forEach(function (integ) {
                var card = document.createElement(integ.url && integ.url !== '#' ? 'a' : 'div');
                card.className = 'bkbg-igw-card';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;
                if (integ.url) { card.href = integ.url; card.target = '_blank'; card.rel = 'noopener'; }

                if (integ.logoUrl) {
                    var img = document.createElement('img');
                    img.className = 'bkbg-igw-logo-img'; img.src = integ.logoUrl; img.alt = integ.name;
                    card.appendChild(img);
                } else {
                    var fallback = document.createElement('div');
                    fallback.className = 'bkbg-igw-logo-fallback';
                    fallback.style.cssText = 'background:' + o.logoBg + ';color:' + o.logoColor;
                    fallback.textContent = logoLetter(integ.name);
                    card.appendChild(fallback);
                }

                var body = document.createElement('div');
                body.className = 'bkbg-igw-card-body';

                var name = document.createElement('div');
                name.className = 'bkbg-igw-integ-name'; name.style.color = o.nameColor; name.textContent = integ.name;
                body.appendChild(name);

                if (o.showDesc && integ.description) {
                    var desc = document.createElement('div');
                    desc.className = 'bkbg-igw-integ-desc'; desc.style.color = o.descColor; desc.textContent = integ.description;
                    body.appendChild(desc);
                }
                card.appendChild(body);
                grid.appendChild(card);
                cardEls.push({ card: card, category: integ.category });
            });

            inner.appendChild(grid);

            if (o.showCta) {
                var ctaRow = document.createElement('div');
                ctaRow.className = 'bkbg-igw-cta-row';
                var cta = document.createElement('a');
                cta.className = 'bkbg-igw-cta'; cta.href = o.ctaUrl; cta.style.color = o.accentColor; cta.textContent = o.ctaLabel;
                ctaRow.appendChild(cta);
                inner.appendChild(ctaRow);
            }

            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
