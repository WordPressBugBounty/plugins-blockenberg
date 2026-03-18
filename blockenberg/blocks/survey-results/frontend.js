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

    function fmtN(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
        return String(n);
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            surveyTitle: '', organization: '', respondents: 0, respondentsLabel: 'respondents',
            surveyDate: '', showMeta: true, questions: [],
            showPercentages: true, showCounts: false, showBars: true, highlightWinner: true,
            methodology: '', showMethodology: true,
            fontSize: 14, titleFontSize: 22, lineHeight: 168, borderRadius: 12, barHeight: 10,
            bgColor: '#ffffff', borderColor: '#e5e7eb', headerBg: '#0f172a', headerColor: '#ffffff',
            metaColor: '#94a3b8', questionColor: '#111827', labelColor: '#374151',
            percentColor: '#111827', countColor: '#6b7280',
            barBg: '#f1f5f9', barFill: '#3b82f6', barFillWinner: '#1d4ed8', winnerBg: '#eff6ff',
            methodologyBg: '#f8fafc', methodologyColor: '#6b7280'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var wrap = mk('div', 'bkbg-sr-wrap');
        wrap.style.border = '1px solid ' + a.borderColor;
        wrap.style.borderRadius = a.borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.background = a.bgColor;

        typoCssVarsForEl(wrap, a.titleTypo, '--bksr-tt-');
        typoCssVarsForEl(wrap, a.textTypo, '--bksr-tx-');

        // ---- Header ----
        var header = mk('div', 'bkbg-sr-header');
        header.style.background = a.headerBg;

        var title = tx('h2', 'bkbg-sr-title', a.surveyTitle);
        title.style.color = a.headerColor;
        ap(header, title);

        if (a.showMeta) {
            var meta = mk('div', 'bkbg-sr-meta');
            var metaItems = [];
            if (a.organization) metaItems.push('🏢 ' + a.organization);
            if (a.respondents)  metaItems.push('👥 ' + Number(a.respondents).toLocaleString() + ' ' + a.respondentsLabel);
            if (a.surveyDate)   metaItems.push('📅 ' + a.surveyDate);
            metaItems.forEach(function (m) {
                var s = tx('span', 'bkbg-sr-meta-item', m);
                s.style.color = a.metaColor;
                ap(meta, s);
            });
            ap(header, meta);
        }
        ap(wrap, header);

        // ---- Questions ----
        a.questions.forEach(function (q, qi) {
            var maxPct = Math.max.apply(null, q.options.map(function (o) { return o.percent; }));

            var qDiv = mk('div', 'bkbg-sr-question');
            if (qi > 0) {
                qDiv.style.borderTopColor = a.borderColor;
            }

            var qText = tx('p', 'bkbg-sr-q-text', (qi + 1) + '. ' + q.question);
            qText.style.color = a.questionColor;
            ap(qDiv, qText);

            q.options.forEach(function (opt) {
                var isWinner = a.highlightWinner && opt.percent === maxPct;

                var optDiv = mk('div', 'bkbg-sr-option');
                if (isWinner) optDiv.style.background = a.winnerBg;

                // Label row
                var row = mk('div', 'bkbg-sr-option-row');
                var label = tx('span', 'bkbg-sr-option-label' + (isWinner ? ' winner' : ''), opt.label);
                label.style.color = a.labelColor;

                var stats = mk('span', 'bkbg-sr-option-stats');
                if (a.showPercentages) {
                    var pct = tx('strong', 'bkbg-sr-pct', opt.percent + '%');
                    pct.style.color = a.percentColor;
                    ap(stats, pct);
                }
                if (a.showCounts && opt.count) {
                    var cnt = tx('span', 'bkbg-sr-count', '(' + fmtN(opt.count) + ')');
                    cnt.style.color = a.countColor;
                    ap(stats, cnt);
                }
                ap(row, label, stats);
                ap(optDiv, row);

                // Bar
                if (a.showBars) {
                    var track = mk('div', 'bkbg-sr-bar-track');
                    track.style.height = a.barHeight + 'px';
                    track.style.background = a.barBg;
                    var fill = mk('div', 'bkbg-sr-bar-fill');
                    fill.style.width = opt.percent + '%';
                    fill.style.height = '100%';
                    fill.style.background = isWinner ? a.barFillWinner : a.barFill;
                    ap(track, fill);
                    ap(optDiv, track);
                }

                ap(qDiv, optDiv);
            });

            ap(wrap, qDiv);
        });

        // ---- Methodology ----
        if (a.showMethodology && a.methodology) {
            var mDiv = mk('div', 'bkbg-sr-methodology');
            mDiv.style.background = a.methodologyBg;
            mDiv.style.borderTop = '1px solid ' + a.borderColor;

            var mText = document.createElement('p');
            mText.className = 'bkbg-sr-method-text';
            mText.style.color = a.methodologyColor;
            mText.style.fontSize = (a.fontSize - 1) + 'px';

            var strong = document.createElement('strong');
            strong.textContent = 'Methodology: ';
            mText.appendChild(strong);
            mText.appendChild(document.createTextNode(a.methodology));
            ap(mDiv, mText);
            ap(wrap, mDiv);
        }

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-survey-results-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
