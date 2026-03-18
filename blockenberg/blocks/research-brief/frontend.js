(function () {
    'use strict';

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function tx(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function ap(parent) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }

    var studyTypeLabels = {
        'survey':       '📊 Survey',
        'experiment':   '🔬 Experiment',
        'meta-analysis':'📚 Meta-Analysis',
        'case-study':   '🗂️ Case Study',
        'review':       '🔍 Review'
    };

    function sectionHead(label, a) {
        return tx('div', 'bkbg-rb-section-head', label, { color: a.accentColor || '#0284c7', borderBottomColor: a.accentColor || '#0284c7' });
    }

    function sigInfo(sig, a) {
        if (sig === 'high')   return { label: '🟢 High',   bg: a.highBg || '#dcfce7', color: a.highColor || '#14532d' };
        if (sig === 'medium') return { label: '🟡 Medium', bg: a.medBg  || '#fef9c3', color: a.medColor  || '#713f12' };
        return                       { label: '⚪ Low',    bg: a.lowBg  || '#f1f5f9', color: a.lowColor  || '#374151' };
    }

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
        document.querySelectorAll('.bkbg-research-brief-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var a;
            try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { return; }

            var wrap = mk('div', 'bkbg-rb-wrap', {
                border: '1px solid ' + (a.borderColor || '#e5e7eb'),
                borderRadius: (a.borderRadius || 12) + 'px',
                overflow: 'hidden',
                background: a.bgColor || '#fff'
            });
            typoCssVarsForEl(a.titleTypo, '--bkrb-tt-', wrap);
            typoCssVarsForEl(a.bodyTypo, '--bkrb-bt-', wrap);

            // ── Header ───────────────────────────────────────────────────
            var header = mk('div', 'bkbg-rb-header', { background: a.headerBg || '#0f172a' });

            var metaRow = mk('div', 'bkbg-rb-header-meta');
            ap(metaRow, tx('span', 'bkbg-rb-type-badge', studyTypeLabels[a.studyType] || a.studyType || 'Study', { background: a.typeBadgeBg || '#e0f2fe', color: a.typeBadgeColor || '#0c4a6e' }));
            if (a.publicationYear) ap(metaRow, tx('span', 'bkbg-rb-year', a.publicationYear, { color: a.metaColor || '#94a3b8' }));
            ap(header, metaRow);

            var titleEl = mk('h2', 'bkbg-rb-title', { color: a.headerColor || '#f8fafc' });
            titleEl.textContent = a.studyTitle || '';
            ap(header, titleEl);

            var authorRow = mk('div', 'bkbg-rb-author-row');
            if (a.authors)     ap(authorRow, tx('span', 'bkbg-rb-meta-item', '✍️ ' + a.authors,     { color: a.metaColor || '#94a3b8' }));
            if (a.publication) ap(authorRow, tx('span', 'bkbg-rb-meta-item', '📰 ' + a.publication, { color: a.metaColor || '#94a3b8' }));
            ap(header, authorRow);
            ap(wrap, header);

            // ── Sample strip ─────────────────────────────────────────────
            if (a.sampleSize) {
                var strip = mk('div', 'bkbg-rb-sample-strip', { borderBottomColor: a.borderColor || '#e5e7eb' });
                var strong = tx('strong', '', 'Sample: ');
                strip.appendChild(strong);
                strip.appendChild(document.createTextNode(a.sampleSize));
                ap(wrap, strip);
            }

            // ── Body ─────────────────────────────────────────────────────
            var body = mk('div', 'bkbg-rb-body');

            // Methodology
            if (a.showMethodology && a.methodology) {
                var methSection = mk('div');
                ap(methSection, sectionHead('Methodology', a));
                var methP = mk('p', 'bkbg-rb-method', { background: a.methodBg || '#f0f9ff', color: a.methodColor || '#374151', margin: 0 });
                methP.textContent = a.methodology;
                ap(methSection, methP);
                ap(body, methSection);
            }

            // Findings
            if (a.showFindings && a.findings && a.findings.length) {
                var findSection = mk('div');
                ap(findSection, sectionHead(a.findingsLabel || 'Key Findings', a));
                a.findings.forEach(function (f) {
                    var row = mk('div', 'bkbg-rb-finding', { borderLeftColor: a.accentColor || '#0284c7' });
                    var si = sigInfo(f.significance, a);
                    ap(row, tx('span', 'bkbg-rb-sig-badge', si.label, { background: si.bg, color: si.color }));
                    var p = mk('p', 'bkbg-rb-finding-text', { color: '#374151' });
                    p.textContent = f.finding;
                    ap(row, p);
                    ap(findSection, row);
                });
                ap(body, findSection);
            }

            // Limitations
            if (a.showLimitations && a.limitations && a.limitations.length) {
                var limSection = mk('div');
                ap(limSection, sectionHead(a.limitationsLabel || 'Limitations', a));
                var ul = mk('ul', 'bkbg-rb-limit-list', { color: a.limitColor || '#7c3aed' });
                a.limitations.forEach(function (l) { ap(ul, tx('li', '', l)); });
                ap(limSection, ul);
                ap(body, limSection);
            }

            // Takeaways
            if (a.showTakeaways && a.takeaways && a.takeaways.length) {
                var tSection = mk('div');
                ap(tSection, sectionHead(a.takeawaysLabel || 'Practical Takeaways', a));
                a.takeaways.forEach(function (t) {
                    var row = mk('div', 'bkbg-rb-takeaway', { background: a.takeawayBg || '#f0fdf4', borderLeftColor: a.takeawayBorder || '#16a34a' });
                    ap(row, tx('span', 'bkbg-rb-takeaway-check', '✓', { color: a.takeawayBorder || '#16a34a' }));
                    ap(row, tx('span', '', t, { color: a.takeawayColor || '#166534' }));
                    ap(tSection, row);
                });
                ap(body, tSection);
            }

            // Source
            if (a.showSource && a.doi) {
                var srcDiv = mk('div', 'bkbg-rb-source', { borderTopColor: a.borderColor || '#e5e7eb', color: a.metaColor || '#94a3b8' });
                srcDiv.appendChild(document.createTextNode('DOI: '));
                var doiLink = mk('a');
                doiLink.href = a.sourceUrl || '#';
                doiLink.target = '_blank';
                doiLink.rel = 'noopener';
                doiLink.style.color = a.accentColor || '#0284c7';
                doiLink.textContent = a.doi;
                ap(srcDiv, doiLink);
                ap(body, srcDiv);
            }

            ap(wrap, body);
            appEl.appendChild(wrap);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
