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

    function calcROI(investment, returned, years) {
        var netProfit  = returned - investment;
        var roi        = investment > 0 ? (netProfit / investment) * 100 : 0;
        var annualized = investment > 0 && years > 0 && returned > 0
            ? (Math.pow(returned / investment, 1 / years) - 1) * 100
            : 0;
        var payback    = netProfit > 0 && years > 0
            ? investment / (netProfit / years)
            : null;
        return { netProfit: netProfit, roi: roi, annualized: annualized, payback: payback };
    }

    function fmt(n, cur) {
        var abs = Math.abs(n);
        return (n < 0 ? '-' : '') + cur + abs.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0});
    }
    function fmtPct(n) { return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'; }

    function initROI(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        var accent        = opts.accentColor    || '#6c3fb5';
        var cardBg        = opts.cardBg         || '#ffffff';
        var resultBg      = opts.resultBg       || accent;
        var resultColor   = opts.resultColor    || '#ffffff';
        var positiveColor = opts.positiveColor  || '#10b981';
        var negativeColor = opts.negativeColor  || '#ef4444';
        var statBg        = opts.statBg         || '#f3f4f6';
        var statBorder    = opts.statBorder     || '#e5e7eb';
        var statValueColor= opts.statValueColor || '#111827';
        var statLabelColor= opts.statLabelColor || '#6b7280';
        var inputBorder   = opts.inputBorder    || '#e5e7eb';
        var labelColor    = opts.labelColor     || '#374151';
        var titleColor    = opts.titleColor     || '';
        var subtitleColor = opts.subtitleColor  || '';
        var sectionBg     = opts.sectionBg      || '';
        var cur           = opts.currency       || '$';

        var titleSize     = (opts.titleSize     || 28) + 'px';
        var resultSize    = (opts.resultSize    || 48) + 'px';
        var cardRadius    = (opts.cardRadius    || 16) + 'px';
        var inputRadius   = (opts.inputRadius   || 8)  + 'px';
        var maxWidth      = (opts.maxWidth      || 560) + 'px';
        var paddingTop    = (opts.paddingTop    != null ? opts.paddingTop    : 60) + 'px';
        var paddingBottom = (opts.paddingBottom != null ? opts.paddingBottom : 60) + 'px';

        var showPayback    = opts.showPayback    !== false;
        var showAnnualized = opts.showAnnualized !== false;
        var showBreakdown  = opts.showBreakdown  !== false;

        app.style.setProperty('--bkbg-roi-accent', accent);
        typoCssVarsForEl(app, opts.titleTypo, '--bkroi-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bkroi-st-');
        app.style.paddingTop    = paddingTop;
        app.style.paddingBottom = paddingBottom;
        if (sectionBg) app.style.background = sectionBg;

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-roi-wrap';
        wrap.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + ';max-width:' + maxWidth;
        app.appendChild(wrap);

        // Header
        if ((opts.showTitle && opts.title) || (opts.showSubtitle && opts.subtitle)) {
            var hdr = document.createElement('div');
            hdr.className = 'bkbg-roi-header';
            if (opts.showTitle && opts.title) {
                var t = document.createElement('div');
                t.className = 'bkbg-roi-title';
                if (titleColor) t.style.color = titleColor;
                t.textContent = opts.title;
                hdr.appendChild(t);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var s = document.createElement('div');
                s.className = 'bkbg-roi-subtitle';
                if (subtitleColor) s.style.color = subtitleColor;
                s.textContent = opts.subtitle;
                hdr.appendChild(s);
            }
            wrap.appendChild(hdr);
        }

        function makeInput(labelText, defaultVal, hasCur, step) {
            var field = document.createElement('div');
            field.className = 'bkbg-roi-field';
            var lbl = document.createElement('label');
            lbl.className = 'bkbg-roi-label';
            lbl.style.color = labelColor;
            lbl.textContent = labelText;
            var wrap2 = document.createElement('div');
            wrap2.className = 'bkbg-roi-input-wrap';
            if (hasCur) {
                var pfx = document.createElement('span');
                pfx.className = 'bkbg-roi-prefix';
                pfx.textContent = cur;
                wrap2.appendChild(pfx);
            }
            var inp = document.createElement('input');
            inp.type = 'number'; inp.value = defaultVal; inp.min = '0';
            if (step) inp.step = step;
            inp.className = 'bkbg-roi-input' + (hasCur ? ' has-prefix' : '');
            inp.style.cssText = 'border:1.5px solid ' + inputBorder + ';border-radius:' + inputRadius;
            wrap2.appendChild(inp);
            field.appendChild(lbl);
            field.appendChild(wrap2);
            return { field: field, inp: inp };
        }

        // Row 1: investment + return
        var grid = document.createElement('div');
        grid.className = 'bkbg-roi-grid';
        var invF = makeInput('Initial Investment', opts.defaultInvestment || 10000, true);
        var retF = makeInput('Total Return', opts.defaultReturn || 15000, true);
        grid.appendChild(invF.field);
        grid.appendChild(retF.field);
        wrap.appendChild(grid);

        // Row 2: years (full width)
        var yrsWrap = document.createElement('div');
        yrsWrap.className = 'bkbg-roi-fullrow';
        var yrsLbl = document.createElement('label');
        yrsLbl.className = 'bkbg-roi-label';
        yrsLbl.style.color = labelColor;
        yrsLbl.textContent = 'Investment Period (Years)';
        var yrsInp = document.createElement('input');
        yrsInp.type = 'number'; yrsInp.value = opts.defaultYears || 3;
        yrsInp.min = '0.1'; yrsInp.step = '0.5';
        yrsInp.className = 'bkbg-roi-input';
        yrsInp.style.cssText = 'border:1.5px solid ' + inputBorder + ';border-radius:' + inputRadius;
        yrsWrap.appendChild(yrsLbl);
        yrsWrap.appendChild(yrsInp);
        wrap.appendChild(yrsWrap);

        // Result card
        var resultCard = document.createElement('div');
        resultCard.className = 'bkbg-roi-result-card';
        resultCard.style.cssText = 'background:' + resultBg + ';color:' + resultColor;
        var rLbl = document.createElement('div');
        rLbl.className = 'bkbg-roi-result-label';
        rLbl.textContent = 'Return on Investment';
        var rVal = document.createElement('div');
        rVal.className = 'bkbg-roi-result-value';
        rVal.style.fontSize = resultSize;
        var rSub = document.createElement('div');
        rSub.className = 'bkbg-roi-result-sub';
        resultCard.appendChild(rLbl);
        resultCard.appendChild(rVal);
        resultCard.appendChild(rSub);
        wrap.appendChild(resultCard);

        // Breakdown stats
        var statsRow, statInv, statNet, statTotal;
        if (showBreakdown) {
            statsRow = document.createElement('div');
            statsRow.className = 'bkbg-roi-stats';
            function makeStat(lbl) {
                var card = document.createElement('div');
                card.className = 'bkbg-roi-stat';
                card.style.cssText = 'background:' + statBg + ';border:1px solid ' + statBorder;
                var v = document.createElement('div'); v.className = 'bkbg-roi-stat-val'; v.style.color = statValueColor;
                var l = document.createElement('div'); l.className = 'bkbg-roi-stat-lbl'; l.style.color = statLabelColor;
                l.textContent = lbl;
                card.appendChild(v); card.appendChild(l);
                return { card: card, val: v };
            }
            statInv   = makeStat('Invested');
            statNet   = makeStat('Net Profit');
            statTotal = makeStat('Total Return');
            statsRow.appendChild(statInv.card);
            statsRow.appendChild(statNet.card);
            statsRow.appendChild(statTotal.card);
            wrap.appendChild(statsRow);
        }

        // Extras
        var extrasRow, statAnn, statPay;
        if (showAnnualized || showPayback) {
            extrasRow = document.createElement('div');
            extrasRow.className = 'bkbg-roi-extras';
            function makeExtra(lbl) {
                var card = document.createElement('div');
                card.className = 'bkbg-roi-stat';
                card.style.cssText = 'flex:1;background:' + statBg + ';border:1px solid ' + statBorder;
                var v = document.createElement('div'); v.className = 'bkbg-roi-stat-val'; v.style.color = statValueColor;
                var l = document.createElement('div'); l.className = 'bkbg-roi-stat-lbl'; l.style.color = statLabelColor;
                l.textContent = lbl;
                card.appendChild(v); card.appendChild(l);
                return { card: card, val: v };
            }
            if (showAnnualized) { statAnn = makeExtra('Annualized ROI');   extrasRow.appendChild(statAnn.card); }
            if (showPayback)    { statPay = makeExtra('Payback Period');    extrasRow.appendChild(statPay.card); }
            wrap.appendChild(extrasRow);
        }

        function refresh() {
            var inv  = parseFloat(invF.inp.value) || 0;
            var ret  = parseFloat(retF.inp.value) || 0;
            var yrs  = parseFloat(yrsInp.value)   || 1;
            var r    = calcROI(inv, ret, yrs);
            var pos  = r.netProfit >= 0;

            rVal.textContent = fmtPct(r.roi);
            rSub.textContent = 'Net Profit: ' + fmt(r.netProfit, cur);
            resultCard.style.background = pos ? resultBg : negativeColor;

            if (showBreakdown) {
                statInv.val.textContent   = fmt(inv, cur);
                statNet.val.textContent   = fmt(r.netProfit, cur);
                statNet.val.style.color   = pos ? positiveColor : negativeColor;
                statTotal.val.textContent = fmt(ret, cur);
            }
            if (showAnnualized && statAnn) {
                statAnn.val.textContent = fmtPct(r.annualized);
                statAnn.val.style.color = pos ? positiveColor : negativeColor;
            }
            if (showPayback && statPay) {
                statPay.val.textContent = r.payback != null ? r.payback.toFixed(1) + ' yr' : '—';
            }
        }

        [invF.inp, retF.inp, yrsInp].forEach(function(inp) {
            inp.addEventListener('input', refresh);
        });
        refresh();
    }

    document.querySelectorAll('.bkbg-roi-app').forEach(initROI);
})();
