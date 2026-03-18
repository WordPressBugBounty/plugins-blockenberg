(function () {
    'use strict';

    function calcBEP(fixedCosts, pricePerUnit, varCostUnit, unitsToSell) {
        var contribution  = pricePerUnit - varCostUnit;
        var bepUnits      = contribution > 0 ? fixedCosts / contribution : Infinity;
        var bepRevenue    = isFinite(bepUnits) ? bepUnits * pricePerUnit : Infinity;
        var profitAtUnits = unitsToSell * contribution - fixedCosts;
        var marginRatio   = pricePerUnit > 0 ? (contribution / pricePerUnit) * 100 : 0;
        return {
            bepUnits:      Math.ceil(bepUnits),
            bepRevenue:    bepRevenue,
            contribution:  contribution,
            profitAtUnits: profitAtUnits,
            marginRatio:   marginRatio,
            revenue:       unitsToSell * pricePerUnit,
            totalCosts:    fixedCosts + unitsToSell * varCostUnit
        };
    }

    function fmtCur(n, cur) { return cur + Math.abs(n).toLocaleString('en-US', {minimumFractionDigits:0,maximumFractionDigits:0}); }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function initBEP(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        var accent       = opts.accentColor  || '#6c3fb5';
        var cardBg       = opts.cardBg       || '#ffffff';
        var resultBg     = opts.resultBg     || accent;
        var resultColor  = opts.resultColor  || '#ffffff';
        var profitColor  = opts.profitColor  || '#10b981';
        var lossColor    = opts.lossColor    || '#ef4444';
        var barBg        = opts.barBg        || '#e5e7eb';
        var statBg       = opts.statBg       || '#f3f4f6';
        var statBorder   = opts.statBorder   || '#e5e7eb';
        var inputBorder  = opts.inputBorder  || '#e5e7eb';
        var labelColor   = opts.labelColor   || '#374151';
        var cur          = opts.currency     || '$';

        var cardRadius   = (opts.cardRadius  || 16) + 'px';
        var inputRadius  = (opts.inputRadius || 8)  + 'px';
        var maxWidth     = (opts.maxWidth    || 580) + 'px';
        var resultSize   = (opts.resultSize  || 46)  + 'px';
        var titleSize    = (opts.titleSize   || 28)  + 'px';
        var paddingTop    = (opts.paddingTop    != null ? opts.paddingTop    : 60) + 'px';
        var paddingBottom = (opts.paddingBottom != null ? opts.paddingBottom : 60) + 'px';

        var showProfitZone   = opts.showProfitZone   !== false;
        var showContribution = opts.showContribution !== false;
        var showMarginRatio  = opts.showMarginRatio  !== false;

        app.style.setProperty('--bkbg-bep-accent', accent);
        typoCssVarsForEl(opts.typoTitle, '--bkbg-bep-title-', app);
        typoCssVarsForEl(opts.typoSubtitle, '--bkbg-bep-sub-', app);
        app.style.paddingTop    = paddingTop;
        app.style.paddingBottom = paddingBottom;
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        var wrap = document.createElement('div'); wrap.className = 'bkbg-bep-wrap';
        wrap.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + ';max-width:' + maxWidth;
        app.appendChild(wrap);

        // Header
        if ((opts.showTitle && opts.title) || (opts.showSubtitle && opts.subtitle)) {
            var hdr = document.createElement('div'); hdr.className = 'bkbg-bep-header';
            if (opts.showTitle && opts.title) {
                var t = document.createElement('div'); t.className = 'bkbg-bep-title';
                if (opts.titleColor) t.style.color = opts.titleColor;
                t.textContent = opts.title; hdr.appendChild(t);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var s = document.createElement('div'); s.className = 'bkbg-bep-subtitle';
                if (opts.subtitleColor) s.style.color = opts.subtitleColor;
                s.textContent = opts.subtitle; hdr.appendChild(s);
            }
            wrap.appendChild(hdr);
        }

        function makeLabel(text) {
            var l = document.createElement('label');
            l.className = 'bkbg-bep-label'; l.style.color = labelColor; l.textContent = text; return l;
        }
        function makeInputField(labelText, defaultVal, hasCur) {
            var field = document.createElement('div');
            field.appendChild(makeLabel(labelText));
            var wrap2 = document.createElement('div'); wrap2.className = 'bkbg-bep-input-wrap';
            if (hasCur) {
                var pfx = document.createElement('span'); pfx.className = 'bkbg-bep-prefix'; pfx.textContent = cur;
                wrap2.appendChild(pfx);
            }
            var inp = document.createElement('input');
            inp.type='number'; inp.value=defaultVal; inp.min='0';
            inp.className = 'bkbg-bep-input' + (hasCur ? ' has-prefix' : '');
            inp.style.cssText = 'border:1.5px solid ' + inputBorder + ';border-radius:' + inputRadius;
            wrap2.appendChild(inp); field.appendChild(wrap2);
            return { field:field, inp:inp };
        }

        var grid1 = document.createElement('div'); grid1.className = 'bkbg-bep-grid';
        var fixedF  = makeInputField('Fixed Costs',          opts.defaultFixedCosts   || 10000, true);
        var unitsF  = makeInputField('Units to Sell', opts.defaultUnitsToSell  || 500,   false);
        grid1.appendChild(fixedF.field); grid1.appendChild(unitsF.field); wrap.appendChild(grid1);

        var grid2 = document.createElement('div'); grid2.className = 'bkbg-bep-grid'; grid2.style.marginBottom = '20px';
        var priceF  = makeInputField('Price per Unit',       opts.defaultPricePerUnit || 50,    true);
        var varF    = makeInputField('Variable Cost / Unit', opts.defaultVarCostUnit  || 20,    true);
        grid2.appendChild(priceF.field); grid2.appendChild(varF.field); wrap.appendChild(grid2);

        // Result card
        var resultCard = document.createElement('div'); resultCard.className = 'bkbg-bep-result-card';
        resultCard.style.cssText = 'background:' + resultBg + ';color:' + resultColor;
        var rLbl = document.createElement('div'); rLbl.className = 'bkbg-bep-result-label'; rLbl.textContent = 'Break-Even Point';
        var rVal = document.createElement('div'); rVal.className = 'bkbg-bep-result-value'; rVal.style.fontSize = resultSize;
        var rSub = document.createElement('div'); rSub.className = 'bkbg-bep-result-sub';
        resultCard.appendChild(rLbl); resultCard.appendChild(rVal); resultCard.appendChild(rSub);
        wrap.appendChild(resultCard);

        // Progress bar
        var progressSection, fillEl, midlineEl, progressNote, progressRight;
        if (showProfitZone) {
            progressSection = document.createElement('div'); progressSection.className = 'bkbg-bep-progress-section';
            var progressHdr = document.createElement('div'); progressHdr.className = 'bkbg-bep-progress-header';
            var progressLeft = document.createElement('span'); progressLeft.textContent = '0 units';
            progressRight = document.createElement('span');
            progressHdr.appendChild(progressLeft); progressHdr.appendChild(progressRight);
            var track = document.createElement('div'); track.className = 'bkbg-bep-track';
            track.style.background = barBg;
            fillEl = document.createElement('div'); fillEl.className = 'bkbg-bep-fill';
            midlineEl = document.createElement('div'); midlineEl.className = 'bkbg-bep-midline';
            midlineEl.style.left = '50%';
            track.appendChild(fillEl); track.appendChild(midlineEl);
            progressNote = document.createElement('div'); progressNote.className = 'bkbg-bep-progress-note';
            progressSection.appendChild(progressHdr);
            progressSection.appendChild(track);
            progressSection.appendChild(progressNote);
            wrap.appendChild(progressSection);
        }

        // Stats row
        var statsRow = document.createElement('div'); statsRow.className = 'bkbg-bep-stats';
        function makeStat(lbl, color) {
            var card = document.createElement('div'); card.className = 'bkbg-bep-stat';
            card.style.cssText = 'background:' + statBg + ';border:1px solid ' + statBorder;
            var v = document.createElement('div'); v.className = 'bkbg-bep-stat-val'; if(color) v.style.color=color;
            var l = document.createElement('div'); l.className = 'bkbg-bep-stat-lbl'; l.textContent=lbl;
            card.appendChild(v); card.appendChild(l); return {card:card,val:v};
        }
        var profitStat  = makeStat('Profit / Loss');
        var revStat     = makeStat('Total Revenue');
        var costStat    = makeStat('Total Costs');
        statsRow.appendChild(profitStat.card); statsRow.appendChild(revStat.card); statsRow.appendChild(costStat.card);
        wrap.appendChild(statsRow);

        var extrasRow;
        if (showContribution || showMarginRatio) {
            extrasRow = document.createElement('div'); extrasRow.className = 'bkbg-bep-extras';
            if (showContribution) { var cm = makeStat('Contribution Margin / Unit'); cm.val.style.color=accent; extrasRow.appendChild(cm.card); wrap._cmStat=cm; }
            if (showMarginRatio)  { var mr = makeStat('Contribution Margin Ratio');  mr.val.style.color=accent; extrasRow.appendChild(mr.card); wrap._mrStat=mr; }
            wrap.appendChild(extrasRow);
        }

        function refresh() {
            var fc  = parseFloat(fixedF.inp.value)  || 0;
            var pu  = parseFloat(priceF.inp.value)  || 0;
            var vc  = parseFloat(varF.inp.value)    || 0;
            var u   = parseFloat(unitsF.inp.value)  || 0;
            var r   = calcBEP(fc, pu, vc, u);
            var pos = r.profitAtUnits >= 0;

            rVal.textContent = isFinite(r.bepUnits) ? r.bepUnits.toLocaleString() + ' units' : '∞';
            rSub.textContent = isFinite(r.bepRevenue)
                ? 'Revenue needed: ' + fmtCur(r.bepRevenue, cur)
                : 'Price must exceed variable cost';

            profitStat.val.textContent = (r.profitAtUnits<0?'-':'') + fmtCur(r.profitAtUnits, cur);
            profitStat.val.style.color = pos ? profitColor : lossColor;
            revStat.val.textContent    = fmtCur(r.revenue, cur);    revStat.val.style.color = '#111827';
            costStat.val.textContent   = fmtCur(r.totalCosts, cur); costStat.val.style.color = '#111827';

            if (showContribution && wrap._cmStat) wrap._cmStat.val.textContent = fmtCur(r.contribution, cur);
            if (showMarginRatio  && wrap._mrStat) wrap._mrStat.val.textContent  = r.marginRatio.toFixed(1) + '%';

            if (showProfitZone && isFinite(r.bepUnits)) {
                var progress = r.bepUnits > 0 ? Math.min(100, (u / r.bepUnits) * 100) : 100;
                fillEl.style.width      = progress + '%';
                fillEl.style.background = pos ? profitColor : lossColor;
                progressRight.textContent = u.toLocaleString() + ' units → ' + (pos ? '✓ PROFIT' : '✗ LOSS');
                progressRight.style.color = pos ? profitColor : lossColor;
                progressNote.textContent  = '↑ Break-even at ' + r.bepUnits.toLocaleString() + ' units';
            }
        }

        [fixedF.inp, priceF.inp, varF.inp, unitsF.inp].forEach(function(inp) {
            inp.addEventListener('input', refresh);
        });
        refresh();
    }

    document.querySelectorAll('.bkbg-bep-app').forEach(initBEP);
})();
