(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-aser-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                seriesTitle: 'Article Series',
                seriesDescription: '',
                currentPart: 1,
                parts: [],
                showProgress: true,
                showExcerpt: true,
                showNumbers: true,
                showSeriesDescription: true,
                layout: 'list',
                borderRadius: 12,
                bgColor: '#f8fafc',
                borderColor: '#e2e8f0',
                titleColor: '#0f172a',
                descColor: '#64748b',
                itemBg: '#ffffff',
                itemColor: '#334155',
                itemBorderColor: '#e2e8f0',
                excerptColor: '#94a3b8',
                currentBg: '#eff6ff',
                currentColor: '#1d4ed8',
                currentBorderColor: '#3b82f6',
                accentColor: '#3b82f6',
                progressBg: '#e2e8f0',
                progressColor: '#3b82f6',
                numberBg: '#e2e8f0',
                numberColor: '#64748b',
                currentNumberBg: '#3b82f6',
                currentNumberColor: '#ffffff'
            }, opts);

            var total = o.parts.length;
            var pct = total > 0 ? Math.round((o.currentPart / total) * 100) : 0;

            // ── build block ──────────────────────────────────────────────────────
            var block = document.createElement('div');
            block.className = 'bkbg-aser-block';
            block.style.background = o.bgColor;
            block.style.borderColor = o.borderColor;
            block.style.borderRadius = o.borderRadius + 'px';
            block.style.setProperty('--bkbg-aser-title-sz', (o.titleFontSize || 20) + 'px');
            block.style.setProperty('--bkbg-aser-desc-sz',  (o.descFontSize  || 14) + 'px');
            block.style.setProperty('--bkbg-aser-pt-sz',    (o.partTitleFontSize || 14) + 'px');
            block.style.setProperty('--bkbg-aser-exc-sz',   (o.excerptFontSize || 12) + 'px');
            typoCssVarsForEl(o.titleTypo,     '--bkbg-aser-title-', block);
            typoCssVarsForEl(o.descTypo,      '--bkbg-aser-desc-',  block);
            typoCssVarsForEl(o.partTitleTypo, '--bkbg-aser-pt-',    block);
            typoCssVarsForEl(o.excerptTypo,   '--bkbg-aser-exc-',   block);

            // Header
            var header = document.createElement('div');
            header.className = 'bkbg-aser-header';

            var label = document.createElement('div');
            label.className = 'bkbg-aser-series-label';
            label.textContent = 'Article Series';
            label.style.color = o.accentColor;
            header.appendChild(label);

            var titleEl = document.createElement('h3');
            titleEl.className = 'bkbg-aser-title';
            titleEl.textContent = o.seriesTitle;
            titleEl.style.color = o.titleColor;
            header.appendChild(titleEl);

            if (o.showSeriesDescription && o.seriesDescription) {
                var descEl = document.createElement('p');
                descEl.className = 'bkbg-aser-desc';
                descEl.textContent = o.seriesDescription;
                descEl.style.color = o.descColor;
                header.appendChild(descEl);
            }
            block.appendChild(header);

            // Progress
            if (o.showProgress && total > 0) {
                var progressWrap = document.createElement('div');
                progressWrap.className = 'bkbg-aser-progress-wrap';

                var bar = document.createElement('div');
                bar.className = 'bkbg-aser-progress-bar';
                bar.style.background = o.progressBg;

                var fill = document.createElement('div');
                fill.className = 'bkbg-aser-progress-fill';
                fill.style.background = o.progressColor;
                fill.style.width = pct + '%';
                bar.appendChild(fill);

                var progLabel = document.createElement('span');
                progLabel.className = 'bkbg-aser-progress-label';
                progLabel.textContent = 'Part ' + o.currentPart + ' of ' + total;
                progLabel.style.color = o.descColor;

                progressWrap.appendChild(bar);
                progressWrap.appendChild(progLabel);
                block.appendChild(progressWrap);
            }

            // Parts list
            var list = document.createElement('ol');
            list.className = 'bkbg-aser-list bkbg-aser-layout-' + o.layout;
            list.style.listStyle = 'none';
            list.style.margin = '0';
            list.style.padding = '0';

            o.parts.forEach(function (part, i) {
                var isCurrent = i + 1 === o.currentPart;

                var li = document.createElement('li');
                li.className = 'bkbg-aser-item' + (isCurrent ? ' is-current' : '');

                if (!isCurrent && part.url && part.url !== '#') {
                    // Make non-current items clickable (wrap inner content in link)
                    li.style.cursor = 'pointer';
                    li.addEventListener('click', function () { window.location.href = part.url; });
                }

                li.style.background = isCurrent ? o.currentBg : o.itemBg;
                li.style.color = isCurrent ? o.currentColor : o.itemColor;
                li.style.borderColor = isCurrent ? o.currentBorderColor : o.itemBorderColor;
                li.style.borderRadius = Math.max(0, o.borderRadius - 4) + 'px';
                if (isCurrent) {
                    li.style.borderLeftWidth = '3px';
                    li.style.paddingLeft = '12px';
                }

                if (o.showNumbers) {
                    var num = document.createElement('span');
                    num.className = 'bkbg-aser-num';
                    num.textContent = String(i + 1);
                    num.style.background = isCurrent ? o.currentNumberBg : o.numberBg;
                    num.style.color = isCurrent ? o.currentNumberColor : o.numberColor;
                    li.appendChild(num);
                }

                var body = document.createElement('div');
                body.className = 'bkbg-aser-item-body';

                var partTitle = document.createElement('span');
                partTitle.className = 'bkbg-aser-part-title';
                partTitle.textContent = part.title;
                partTitle.style.color = isCurrent ? o.currentColor : o.itemColor;
                body.appendChild(partTitle);

                if (o.showExcerpt && part.excerpt) {
                    var excerpt = document.createElement('span');
                    excerpt.className = 'bkbg-aser-excerpt';
                    excerpt.textContent = part.excerpt;
                    excerpt.style.color = isCurrent ? o.currentColor : o.excerptColor;
                    body.appendChild(excerpt);
                }

                li.appendChild(body);

                if (isCurrent) {
                    var badge = document.createElement('span');
                    badge.className = 'bkbg-aser-current-badge';
                    badge.textContent = 'Current';
                    badge.style.background = o.accentColor;
                    li.appendChild(badge);
                }

                list.appendChild(li);
            });

            block.appendChild(list);

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
