(function () {

    /* ── Typography CSS-var helper ─────────────────────────────────────── */
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            transform:'text-transform', decoration:'text-decoration',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', sizeUnit:'font-size-unit',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', lineHeightUnit:'line-height-unit',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', letterSpacingUnit:'letter-spacing-unit',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m', wordSpacingUnit:'word-spacing-unit'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                var css = map[k];
                if (css.indexOf('size-d') !== -1 || css.indexOf('size-t') !== -1 || css.indexOf('size-m') !== -1 ||
                    css.indexOf('height-d') !== -1 || css.indexOf('height-t') !== -1 || css.indexOf('height-m') !== -1 ||
                    css.indexOf('spacing-d') !== -1 || css.indexOf('spacing-t') !== -1 || css.indexOf('spacing-m') !== -1) {
                    var unitKey = css.replace(/-[dtm]$/, '-unit');
                    var unit = '';
                    Object.keys(map).forEach(function(k2) { if (map[k2] === unitKey && typo[k2]) unit = typo[k2]; });
                    if (!unit) unit = css.indexOf('size') !== -1 ? 'px' : '';
                    v = v + unit;
                }
                el.style.setProperty(prefix + css, v);
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-crs-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Customer Success', heading: 'Real Teams, Real Results',
                subtext: 'See how companies like yours are achieving measurable growth.',
                results: [], layout: 'grid', columns: 3,
                showMetrics: true, showTags: true, showAuthor: true, showLogo: true,
                maxWidth: 1200, paddingTop: 80, paddingBottom: 80,
                bgColor: '#f8fafc', headingColor: '#111827', subColor: '#6b7280', eyebrowColor: '#6366f1',
                cardBg: '#ffffff', cardBorder: '#e2e8f0', quoteColor: '#374151',
                authorColor: '#111827', titleColor: '#6b7280',
                metricNumColor: '#6366f1', metricLabelColor: '#6b7280',
                tagBg: '#ede9fe', tagColor: '#6d28d9', logoBg: '#f1f5f9', accentColor: '#6366f1'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-crs-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Apply typography CSS vars on inner */
            inner.style.setProperty('--bkbg-crs-eye-fs', (o.eyebrowFontSize || 14) + 'px');
            inner.style.setProperty('--bkbg-crs-hdg-fs', (o.headingFontSize || 28) + 'px');
            inner.style.setProperty('--bkbg-crs-sub-fs', (o.subtextFontSize || 16) + 'px');
            typoCssVarsForEl(o.typoEyebrow, '--bkbg-crs-eye-', inner);
            typoCssVarsForEl(o.typoHeading, '--bkbg-crs-hdg-', inner);
            typoCssVarsForEl(o.typoSubtext, '--bkbg-crs-sub-', inner);

            /* Header */
            var header = document.createElement('div');
            header.style.cssText = 'text-align:center;margin-bottom:48px;';
            var ey = document.createElement('p'); ey.className = 'bkbg-crs-eyebrow'; ey.style.color = o.eyebrowColor; ey.innerHTML = o.eyebrow;
            var h2 = document.createElement('h2'); h2.className = 'bkbg-crs-heading'; h2.style.color = o.headingColor; h2.innerHTML = o.heading;
            var sub = document.createElement('p'); sub.className = 'bkbg-crs-sub'; sub.style.color = o.subColor; sub.innerHTML = o.subtext;
            header.appendChild(ey); header.appendChild(h2); header.appendChild(sub);
            inner.appendChild(header);

            /* Grid */
            var grid = document.createElement('div');
            grid.className = 'bkbg-crs-grid layout-' + o.layout;
            if (o.layout === 'grid') grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';

            (o.results || []).forEach(function (result) {
                var card = document.createElement('div');
                card.className = 'bkbg-crs-card';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;

                /* Company */
                if (o.showLogo) {
                    var compRow = document.createElement('div');
                    compRow.className = 'bkbg-crs-company-row';
                    compRow.style.background = o.logoBg;
                    if (result.companyLogo) {
                        var logo = document.createElement('img');
                        logo.className = 'bkbg-crs-company-logo'; logo.src = result.companyLogo; logo.alt = result.companyName;
                        compRow.appendChild(logo);
                    } else {
                        var nameEl = document.createElement('div');
                        nameEl.className = 'bkbg-crs-company-name-fallback'; nameEl.style.color = o.accentColor; nameEl.textContent = result.companyName;
                        compRow.appendChild(nameEl);
                    }
                    card.appendChild(compRow);
                }

                /* Quote */
                var quote = document.createElement('blockquote');
                quote.className = 'bkbg-crs-quote'; quote.style.color = o.quoteColor;
                quote.textContent = '\u201C' + result.quote + '\u201D';
                card.appendChild(quote);

                /* Author */
                if (o.showAuthor) {
                    var authorRow = document.createElement('div');
                    authorRow.className = 'bkbg-crs-author-row';
                    var aName = document.createElement('div'); aName.className = 'bkbg-crs-author-name'; aName.style.color = o.authorColor; aName.textContent = result.authorName;
                    var aTitle = document.createElement('div'); aTitle.className = 'bkbg-crs-author-title'; aTitle.style.color = o.titleColor; aTitle.textContent = result.authorTitle;
                    authorRow.appendChild(aName); authorRow.appendChild(aTitle);
                    card.appendChild(authorRow);
                }

                /* Metrics */
                if (o.showMetrics && result.metrics && result.metrics.length) {
                    var metrics = document.createElement('div');
                    metrics.className = 'bkbg-crs-metrics';
                    result.metrics.forEach(function (m) {
                        var mEl = document.createElement('div'); mEl.className = 'bkbg-crs-metric';
                        var mVal = document.createElement('div'); mVal.className = 'bkbg-crs-metric-val'; mVal.style.color = o.metricNumColor; mVal.textContent = m.value;
                        var mLab = document.createElement('div'); mLab.className = 'bkbg-crs-metric-label'; mLab.style.color = o.metricLabelColor; mLab.textContent = m.label;
                        mEl.appendChild(mVal); mEl.appendChild(mLab);
                        metrics.appendChild(mEl);
                    });
                    card.appendChild(metrics);
                }

                /* Tags */
                if (o.showTags && result.tags && result.tags.length) {
                    var tags = document.createElement('div');
                    tags.className = 'bkbg-crs-tags';
                    result.tags.forEach(function (tag) {
                        var t = document.createElement('span');
                        t.className = 'bkbg-crs-tag'; t.style.cssText = 'background:' + o.tagBg + ';color:' + o.tagColor; t.textContent = tag;
                        tags.appendChild(t);
                    });
                    card.appendChild(tags);
                }

                grid.appendChild(card);
            });

            inner.appendChild(grid);
            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
