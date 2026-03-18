(function () {
    'use strict';

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
        Object.keys(_typoKeys).forEach(function(k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    document.querySelectorAll('.bkbg-rss-app').forEach(function (root) {
        var a;
        try { a = JSON.parse(root.dataset.opts || '{}'); } catch (e) { return; }

        var bg = a.bgColor || '#ffffff';
        var ptop = a.paddingTop !== undefined ? a.paddingTop : 80;
        var pbot = a.paddingBottom !== undefined ? a.paddingBottom : 80;
        var maxW = a.maxWidth || 1100;
        var metrics = a.metrics || [];
        var metricStyle = a.metricStyle || 'cards';

        root.style.backgroundColor = bg;
        root.style.paddingTop = ptop + 'px';
        root.style.paddingBottom = pbot + 'px';

        typoCssVarsForEl(root, a.headingTypo, '--bkrs-ht-');
        typoCssVarsForEl(root, a.bodyTypo, '--bkrs-bt-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-rss-inner';
        inner.style.maxWidth = maxW + 'px';

        // === Header ===
        var header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '48px';

        if (a.showEyebrow !== false && a.eyebrow) {
            var eyebrow = document.createElement('span');
            eyebrow.style.cssText = 'display:inline-block;background:' + (a.eyebrowBg || '#f3f0ff') + ';color:' + (a.eyebrowColor || '#7c3aed') + ';font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;padding:5px 14px;border-radius:999px;margin-bottom:16px;';
            eyebrow.textContent = a.eyebrow;
            header.appendChild(eyebrow);
        }

        var heading = document.createElement('h2');
        heading.className = 'bkbg-rss-heading';
        heading.style.cssText = 'color:' + (a.headingColor || '#111827') + ';margin:0 0 16px;';
        heading.innerHTML = a.heading || '';
        header.appendChild(heading);

        if (a.showSubtext !== false && a.subtext) {
            var subtext = document.createElement('p');
            subtext.className = 'bkbg-rss-subtext';
            subtext.style.cssText = 'color:' + (a.subtextColor || '#6b7280') + ';margin:0 auto;max-width:680px;';
            subtext.innerHTML = a.subtext;
            header.appendChild(subtext);
        }

        inner.appendChild(header);

        // === Metrics grid ===
        var grid = document.createElement('div');
        grid.className = 'bkbg-rss-metrics';
        var cols = Math.min(metrics.length, 3);
        grid.style.cssText = 'grid-template-columns:repeat(' + cols + ',1fr);margin-bottom:' + (a.showCaseStudy ? 40 : 0) + 'px;';

        metrics.forEach(function (m) {
            var isDarkCard = metricStyle === 'dark';
            var cardBgVal = isDarkCard ? '#1f2937' : (metricStyle === 'cards' ? (a.metricCardBg || '#f9fafb') : 'transparent');
            var borderStr = (metricStyle === 'borderless') ? 'none' : ('1px solid ' + (a.metricCardBorder || '#e5e7eb'));

            var card = document.createElement('div');
            card.className = 'bkbg-rss-metric-card' + (isDarkCard ? ' bkbg-rss-metric-card--dark' : '') + (metricStyle === 'borderless' ? ' bkbg-rss-metric-card--borderless' : '');
            card.style.cssText = 'background:' + cardBgVal + ';border:' + borderStr + ';';

            // Change badge
            var isDown = m.direction === 'down';
            var changeBadge = document.createElement('span');
            changeBadge.className = 'bkbg-rss-change';
            changeBadge.style.cssText = 'background:' + (isDown ? (a.changeDownBg || '#fffbeb') : (a.changeUpBg || '#f0fdf4')) + ';color:' + (isDown ? (a.changeDownColor || '#b45309') : (a.changeUpColor || '#15803d')) + ';';
            changeBadge.textContent = (isDown ? '▼ ' : '▲ ') + m.change;
            card.appendChild(changeBadge);

            // Before → After
            var valRow = document.createElement('div');
            valRow.className = 'bkbg-rss-values';

            var beforeEl = document.createElement('span');
            beforeEl.className = 'bkbg-rss-before';
            beforeEl.style.color = a.metricBeforeColor || '#9ca3af';
            beforeEl.textContent = m.before;
            valRow.appendChild(beforeEl);

            var arrow = document.createElement('span');
            arrow.className = 'bkbg-rss-arrow';
            arrow.style.color = a.metricBeforeColor || '#9ca3af';
            arrow.textContent = '→';
            valRow.appendChild(arrow);

            var afterEl = document.createElement('span');
            afterEl.className = 'bkbg-rss-after';
            afterEl.style.cssText = 'font-size:' + (a.metricAfterSize || 36) + 'px;color:' + (isDarkCard ? '#ffffff' : (a.metricAfterColor || '#111827')) + ';';
            afterEl.textContent = m.after;
            valRow.appendChild(afterEl);
            card.appendChild(valRow);

            var labelEl = document.createElement('p');
            labelEl.className = 'bkbg-rss-label';
            labelEl.style.color = isDarkCard ? '#d1d5db' : (a.metricLabelColor || '#374151');
            labelEl.textContent = m.label;
            card.appendChild(labelEl);

            if (m.description) {
                var descEl = document.createElement('p');
                descEl.className = 'bkbg-rss-desc';
                descEl.style.color = isDarkCard ? '#9ca3af' : (a.subtextColor || '#6b7280');
                descEl.textContent = m.description;
                card.appendChild(descEl);
            }

            grid.appendChild(card);
        });

        inner.appendChild(grid);

        // === Case study ===
        if (a.showCaseStudy !== false) {
            var caseCard = document.createElement('div');
            caseCard.className = 'bkbg-rss-case';
            caseCard.style.cssText = 'background:' + (a.caseBg || '#f8f5ff') + ';border-left-color:' + (a.accentColor || '#7c3aed') + ';';

            var caseHeader = document.createElement('div');
            caseHeader.className = 'bkbg-rss-case-header';

            if (a.clientLogoUrl) {
                var logo = document.createElement('img');
                logo.className = 'bkbg-rss-case-logo';
                logo.src = a.clientLogoUrl;
                logo.alt = a.clientLogoAlt || '';
                caseHeader.appendChild(logo);
            }

            var caseName = document.createElement('p');
            caseName.className = 'bkbg-rss-case-name';
            caseName.style.color = a.caseNameColor || '#111827';
            caseName.textContent = a.caseStudyName || '';
            caseHeader.appendChild(caseName);

            caseCard.appendChild(caseHeader);

            var summary = document.createElement('p');
            summary.className = 'bkbg-rss-case-summary';
            summary.style.color = a.caseSummaryColor || '#374151';
            summary.innerHTML = a.caseStudySummary || '';
            caseCard.appendChild(summary);

            if (a.clientName) {
                var attr = document.createElement('span');
                attr.className = 'bkbg-rss-case-attribution';
                attr.style.color = a.subtextColor || '#6b7280';
                attr.textContent = '\u2014 ' + a.clientName;
                caseCard.appendChild(attr);
            }

            inner.appendChild(caseCard);
        }

        // === CTA ===
        if (a.showCtaRow !== false && a.ctaLabel) {
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-rss-cta-row';

            var ctaLink = document.createElement('a');
            ctaLink.className = 'bkbg-rss-cta';
            ctaLink.href = a.ctaUrl || '#';
            ctaLink.textContent = a.ctaLabel;
            ctaLink.style.cssText = 'background:' + (a.ctaBg || '#7c3aed') + ';color:' + (a.ctaColor || '#ffffff') + ';';
            ctaRow.appendChild(ctaLink);
            inner.appendChild(ctaRow);
        }

        root.appendChild(inner);
    });
})();
