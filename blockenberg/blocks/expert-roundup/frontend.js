(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', style:'font-style',
            transform:'text-transform', decoration:'text-decoration',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', sizeUnit:'font-size-unit',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', lineHeightUnit:'line-height-unit',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', letterSpacingUnit:'letter-spacing-unit',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m', wordSpacingUnit:'word-spacing-unit' };
        var su = typo.sizeUnit || 'px', lu = typo.lineHeightUnit || '', lsu = typo.letterSpacingUnit || 'px', wu = typo.wordSpacingUnit || 'px';
        for (var k in m) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], css = m[k];
                if (css === 'font-size-d' || css === 'font-size-t' || css === 'font-size-m') v = v + su;
                else if ((css === 'line-height-d' || css === 'line-height-t' || css === 'line-height-m') && lu) v = v + lu;
                else if (css === 'letter-spacing-d' || css === 'letter-spacing-t' || css === 'letter-spacing-m') v = v + lsu;
                else if (css === 'word-spacing-d' || css === 'word-spacing-t' || css === 'word-spacing-m') v = v + wu;
                el.style.setProperty(prefix + css, '' + v);
            }
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-erp-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Expert Roundup', heading: 'Experts Share Their Insights',
                subtext: '', experts: [], layout: 'cards', columns: 2,
                showCompany: true, showNumber: true, quoteStyle: 'block',
                maxWidth: 1100, paddingTop: 80, paddingBottom: 80,
                bgColor: '#f8fafc', eyebrowColor: '#6366f1', headingColor: '#111827', subColor: '#6b7280',
                cardBg: '#ffffff', cardBorder: '#e2e8f0', nameColor: '#111827',
                titleColor: '#6b7280', companyColor: '#6366f1', quoteColor: '#374151',
                numberBg: '#6366f1', numberColor: '#ffffff', avatarBg: '#ede9fe',
                avatarColor: '#6366f1', accentColor: '#6366f1', borderRadius: 12
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            el.classList.add('bkbg-erp-wrap');
            typoCssVarsForEl(o.typoEyebrow || {}, '--bkbg-erp-ey-', el);
            typoCssVarsForEl(o.typoHeading || {}, '--bkbg-erp-hd-', el);
            typoCssVarsForEl(o.typoSubtext || {}, '--bkbg-erp-st-', el);
            typoCssVarsForEl(o.typoQuote || {}, '--bkbg-erp-qt-', el);

            var inner = document.createElement('div');
            inner.className = 'bkbg-erp-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Header */
            var header = document.createElement('div'); header.className = 'bkbg-erp-header';
            var ey = document.createElement('span'); ey.className = 'bkbg-erp-eyebrow'; ey.style.color = o.eyebrowColor; ey.textContent = o.eyebrow;
            var h2 = document.createElement('h2'); h2.className = 'bkbg-erp-heading'; h2.style.color = o.headingColor; h2.innerHTML = o.heading;
            var sub = document.createElement('p'); sub.className = 'bkbg-erp-sub'; sub.style.color = o.subColor; sub.innerHTML = o.subtext;
            header.appendChild(ey); header.appendChild(h2);
            if (o.subtext) header.appendChild(sub);
            inner.appendChild(header);

            /* Grid / list */
            var grid = document.createElement('div');
            grid.className = o.layout === 'cards' ? 'bkbg-erp-grid' : 'bkbg-erp-list';
            if (o.layout === 'cards') grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';

            (o.experts || []).forEach(function (expert, idx) {
                var card = document.createElement('div'); card.className = 'bkbg-erp-card';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder + ';border-radius:' + o.borderRadius + 'px;padding:24px;';

                /* Number badge */
                if (o.showNumber) {
                    var num = document.createElement('div'); num.className = 'bkbg-erp-number';
                    num.style.cssText = 'background:' + o.numberBg + ';color:' + o.numberColor;
                    num.textContent = idx + 1;
                    card.appendChild(num);
                }

                /* Expert header */
                var expertHeader = document.createElement('div'); expertHeader.className = 'bkbg-erp-expert-header';
                var avatarEl;
                var initials = (expert.name || 'E').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
                if (expert.avatarUrl) {
                    avatarEl = document.createElement('img'); avatarEl.className = 'bkbg-erp-avatar';
                    avatarEl.src = expert.avatarUrl; avatarEl.alt = expert.name;
                } else {
                    avatarEl = document.createElement('div'); avatarEl.className = 'bkbg-erp-avatar-initials';
                    avatarEl.style.cssText = 'background:' + o.avatarBg + ';color:' + o.avatarColor;
                    avatarEl.textContent = initials;
                }
                expertHeader.appendChild(avatarEl);

                var info = document.createElement('div');
                var nameEl = document.createElement('p'); nameEl.className = 'bkbg-erp-name'; nameEl.style.color = o.nameColor; nameEl.textContent = expert.name;
                var titleEl = document.createElement('p'); titleEl.className = 'bkbg-erp-title'; titleEl.style.color = o.titleColor; titleEl.textContent = expert.title;
                info.appendChild(nameEl); info.appendChild(titleEl);
                if (o.showCompany && expert.company) {
                    var compEl = document.createElement('p'); compEl.className = 'bkbg-erp-company'; compEl.style.color = o.companyColor; compEl.textContent = expert.company;
                    info.appendChild(compEl);
                }
                expertHeader.appendChild(info);

                var content = document.createElement('div'); content.className = 'bkbg-erp-content';
                content.appendChild(expertHeader);

                /* Quote */
                var quote = document.createElement('p');
                if (o.quoteStyle === 'block') {
                    quote.className = 'bkbg-erp-quote-block';
                    quote.style.cssText = 'border-left-color:' + o.accentColor + ';color:' + o.quoteColor;
                } else if (o.quoteStyle === 'bubble') {
                    quote.className = 'bkbg-erp-quote-bubble';
                    quote.style.cssText = 'background:' + o.cardBorder + ';color:' + o.quoteColor;
                    expert.contribution = '\u201C' + expert.contribution + '\u201D';
                } else {
                    quote.className = 'bkbg-erp-quote-plain';
                    quote.style.color = o.quoteColor;
                }
                quote.textContent = expert.contribution;
                content.appendChild(quote);

                if (o.layout === 'list') { card.appendChild(expertHeader); card.appendChild(content); }
                else { card.appendChild(content); }

                grid.appendChild(card);
            });

            inner.appendChild(grid);
            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
