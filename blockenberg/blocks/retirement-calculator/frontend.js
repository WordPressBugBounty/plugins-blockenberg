(function () {
    'use strict';

    function calcRetirement(curAge, retAge, curSavings, monthlyContrib, annualReturn, inflationRate) {
        var years          = Math.max(0, retAge - curAge);
        var monthlyRate    = annualReturn / 100 / 12;
        var months         = years * 12;
        var futureExisting = curSavings * Math.pow(1 + monthlyRate, months);
        var futureContribs = monthlyRate > 0
            ? monthlyContrib * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
            : monthlyContrib * months;
        var total         = futureExisting + futureContribs;
        var totalContribs = curSavings + monthlyContrib * months;
        var growth        = total - totalContribs;
        var inflFactor    = Math.pow(1 + inflationRate / 100, years);
        var inflAdjusted  = total / inflFactor;
        return { years: years, total: total, totalContribs: totalContribs, growth: growth, inflAdjusted: inflAdjusted };
    }

    function fmtM(val, cur, pos) {
        var n = parseFloat(val);
        var s;
        if (n >= 1e6)      { s = (n / 1e6).toFixed(2) + 'M'; }
        else if (n >= 1e3) { s = (n / 1e3).toFixed(1)  + 'K'; }
        else               { s = n.toFixed(0); }
        return pos === 'after' ? s + cur : cur + s;
    }
    function fmtFull(val, cur, pos) {
        var s = Number(parseFloat(val).toFixed(0)).toLocaleString();
        return pos === 'after' ? s + cur : cur + s;
    }

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

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var o        = opts;
        var currency = o.currency    || '$';
        var curPos   = o.currencyPos || 'before';
        var radius   = (o.cardRadius || 16) + 'px';
        var inpRad   = (o.inputRadius || 8)  + 'px';
        var accentC  = o.accentColor    || '#6c3fb5';
        var totalC   = o.totalColor     || '#6c3fb5';
        var inflC    = o.inflationColor || '#3b82f6';
        var contribC = o.contribColor   || '#10b981';
        var growthC  = o.growthColor    || '#f59e0b';
        var barBg    = o.barTrackBg     || '#e5e7eb';
        var labelC   = o.labelColor     || '#374151';
        var pjA      = o.projBgA        || '#f0fdf4';
        var pjB      = o.projBgB        || '#eff6ff';
        var resultBg = o.resultBg       || '#f5f3ff';
        var resultBr = o.resultBorder   || '#ede9fe';

        var curAge  = parseFloat(o.currentAge)    || 30;
        var retAge  = parseFloat(o.retirementAge) || 65;
        var curSav  = parseFloat(o.currentSavings)|| 10000;
        var contrib = parseFloat(o.monthlyContrib)|| 500;
        var retRate = parseFloat(o.annualReturn)  || 7;
        var inflRate= parseFloat(o.inflationRate) || 2.5;

        app.innerHTML = '';
        app.style.fontFamily = 'inherit';
        app.style.boxSizing  = 'border-box';

        typoCssVarsForEl(app, o.titleTypo, '--bkrc-tt-');
        typoCssVarsForEl(app, o.bodyTypo, '--bkrc-bt-');

        // Section
        var section = document.createElement('div');
        section.style.paddingTop    = (o.paddingTop || 60) + 'px';
        section.style.paddingBottom = (o.paddingBottom || 60) + 'px';
        section.style.background    = o.sectionBg || '';
        app.appendChild(section);

        var card = document.createElement('div');
        card.style.cssText = 'background:' + (o.cardBg || '#fff') + ';border-radius:' + radius + ';padding:36px 32px;max-width:' + (o.maxWidth || 620) + 'px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.09);box-sizing:border-box;';
        section.appendChild(card);

        // Title / subtitle
        if (o.showTitle || o.showSubtitle) {
            var hdr = document.createElement('div');
            hdr.style.marginBottom = '20px';
            if (o.showTitle) {
                var ttl = document.createElement('div');
                ttl.textContent   = o.title || 'Retirement Calculator';
                ttl.className     = 'bkbg-ret-title';
                ttl.style.cssText = 'color:' + (o.titleColor || '#1e1b4b') + ';margin-bottom:6px;';
                hdr.appendChild(ttl);
            }
            if (o.showSubtitle && o.subtitle) {
                var sub = document.createElement('div');
                sub.textContent = o.subtitle;
                sub.className   = 'bkbg-ret-subtitle';
                sub.style.color = o.subtitleColor || '#6b7280';
                hdr.appendChild(sub);
            }
            card.appendChild(hdr);
        }

        // Input grid
        var grid = document.createElement('div');
        grid.className = 'bkbg-ret-input-grid';
        grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0 20px;margin-bottom:24px;';
        card.appendChild(grid);

        function makeInput(labelTxt, initVal, min2, max2, step2, suffix, onChange) {
            var wrap = document.createElement('div');
            wrap.style.marginBottom = '14px';
            var lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:' + labelC + ';margin-bottom:5px;';
            var lblMain = document.createElement('span'); lblMain.textContent = labelTxt;
            var lblSuf  = document.createElement('span'); lblSuf.textContent = suffix || ''; lblSuf.style.cssText = 'font-weight:400;color:#9ca3af;';
            lbl.appendChild(lblMain); lbl.appendChild(lblSuf);
            wrap.appendChild(lbl);
            var inp = document.createElement('input');
            inp.type  = 'number'; inp.value = initVal; inp.min = min2; inp.max = max2; inp.step = step2;
            inp.style.cssText = 'width:100%;padding:10px 14px;border-radius:' + inpRad + ';border:1.5px solid #e5e7eb;font-size:16px;outline:none;box-sizing:border-box;';
            inp.addEventListener('focus', function () { inp.style.borderColor = accentC; inp.style.boxShadow = '0 0 0 3px rgba(108,63,181,.15)'; });
            inp.addEventListener('blur',  function () { inp.style.borderColor = '#e5e7eb'; inp.style.boxShadow = ''; });
            inp.addEventListener('input', function () { onChange(parseFloat(inp.value) || 0); update(); });
            wrap.appendChild(inp);
            return wrap;
        }

        grid.appendChild(makeInput('Current Age', curAge, 18, 80, 1, '', function (v) { curAge = v; }));
        grid.appendChild(makeInput('Retirement Age', retAge, 40, 90, 1, '', function (v) { retAge = v; }));
        grid.appendChild(makeInput('Current Savings', curSav, 0, 10000000, 1000, currency, function (v) { curSav = v; }));
        grid.appendChild(makeInput('Monthly Contribution', contrib, 0, 100000, 50, currency + '/mo', function (v) { contrib = v; }));
        grid.appendChild(makeInput('Annual Return', retRate, 0, 20, 0.1, '%', function (v) { retRate = v; }));
        if (o.showInflation) {
            grid.appendChild(makeInput('Inflation Rate', inflRate, 0, 15, 0.1, '%', function (v) { inflRate = v; }));
        }

        // Hero result
        var hero = document.createElement('div');
        hero.style.cssText = 'background:' + resultBg + ';border:2px solid ' + resultBr + ';border-radius:' + radius + ';padding:28px 28px 22px;margin-bottom:16px;text-align:center;';
        card.appendChild(hero);

        // Mini cards row
        var miniRow = document.createElement('div');
        miniRow.style.cssText = 'display:grid;grid-template-columns:' + (o.showInflation ? '1fr 1fr' : '1fr') + ';gap:12px;margin-bottom:16px;';
        card.appendChild(miniRow);

        // Breakdown
        var breakdown = null;
        if (o.showBreakdown) {
            breakdown = document.createElement('div');
            card.appendChild(breakdown);
        }

        function update() {
            var r = calcRetirement(curAge, retAge, curSav, contrib, retRate, inflRate);
            var contribFrac = r.total > 0 ? Math.min(1, r.totalContribs / r.total) : 0;
            var growthFrac  = r.total > 0 ? Math.min(1, r.growth / r.total)        : 0;
            var totalSz     = o.totalSize || 52;

            // Hero
            hero.innerHTML = '';
            var heroLabel = document.createElement('div');
            heroLabel.textContent  = 'Projected savings at age ' + Math.round(retAge) + ' (' + r.years + ' years)';
            heroLabel.style.cssText = 'font-size:13px;font-weight:600;color:' + labelC + ';margin-bottom:6px;';
            hero.appendChild(heroLabel);
            var heroAmt = document.createElement('div');
            heroAmt.textContent  = fmtM(r.total, currency, curPos);
            heroAmt.style.cssText = 'font-size:' + totalSz + 'px;font-weight:800;color:' + totalC + ';line-height:1.1;margin-bottom:6px;';
            hero.appendChild(heroAmt);
            var heroFull = document.createElement('div');
            heroFull.textContent  = '(' + fmtFull(r.total, currency, curPos) + ' total)';
            heroFull.style.cssText = 'font-size:13px;color:' + labelC + ';';
            hero.appendChild(heroFull);

            // Mini cards
            miniRow.innerHTML = '';
            if (o.showInflation) {
                var inflCard = document.createElement('div');
                inflCard.className = 'bkbg-ret-mini-card';
                inflCard.style.cssText = 'background:' + pjB + ';border-radius:' + radius + ';padding:16px 18px;';
                inflCard.innerHTML = '<div style="font-size:11px;font-weight:700;color:' + inflC + ';text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Inflation-Adjusted</div>' +
                    '<div style="font-size:24px;font-weight:800;color:' + inflC + ';">' + fmtM(r.inflAdjusted, currency, curPos) + '</div>' +
                    '<div style="font-size:11px;color:' + labelC + ';margin-top:2px;">In today\'s dollars</div>';
                miniRow.appendChild(inflCard);
            }
            var contribCard = document.createElement('div');
            contribCard.className = 'bkbg-ret-mini-card';
            contribCard.style.cssText = 'background:' + pjA + ';border-radius:' + radius + ';padding:16px 18px;';
            contribCard.innerHTML = '<div style="font-size:11px;font-weight:700;color:' + contribC + ';text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Total Contributions</div>' +
                '<div style="font-size:24px;font-weight:800;color:' + contribC + ';">' + fmtM(r.totalContribs, currency, curPos) + '</div>' +
                '<div style="font-size:11px;color:' + labelC + ';margin-top:2px;">What you put in</div>';
            miniRow.appendChild(contribCard);

            // Breakdown bar
            if (breakdown) {
                breakdown.innerHTML = '';
                var brLabels = document.createElement('div');
                brLabels.style.cssText = 'display:flex;justify-content:space-between;font-size:12px;color:' + labelC + ';margin-bottom:6px;';
                brLabels.innerHTML = '<span>Contributions</span><span>Investment Growth</span>';
                breakdown.appendChild(brLabels);

                var track = document.createElement('div');
                track.className = 'bkbg-ret-bar-track';
                track.style.cssText = 'height:14px;border-radius:100px;background:' + barBg + ';overflow:hidden;display:flex;';

                var cBar = document.createElement('div');
                cBar.className = 'bkbg-ret-bar-contrib';
                cBar.style.cssText = 'width:0%;height:100%;background:' + contribC + ';border-radius:100px 0 0 100px;transition:width .4s;';
                var gBar = document.createElement('div');
                gBar.className = 'bkbg-ret-bar-growth';
                gBar.style.cssText = 'width:0%;height:100%;background:' + growthC + ';border-radius:0 100px 100px 0;transition:width .4s;';

                track.appendChild(cBar); track.appendChild(gBar);
                breakdown.appendChild(track);
                setTimeout(function () {
                    cBar.style.width = (contribFrac * 100).toFixed(1) + '%';
                    gBar.style.width = (growthFrac * 100).toFixed(1) + '%';
                }, 30);

                var legend = document.createElement('div');
                legend.style.cssText = 'display:flex;gap:16px;margin-top:8px;font-size:12px;color:' + labelC + ';flex-wrap:wrap;';
                legend.innerHTML = '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + contribC + ';margin-right:5px;vertical-align:middle;"></span>Contributions: ' + fmtM(r.totalContribs, currency, curPos) + '</span>' +
                    '<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + growthC + ';margin-right:5px;vertical-align:middle;"></span>Growth: ' + fmtM(r.growth, currency, curPos) + '</span>';
                breakdown.appendChild(legend);
            }
        }

        update();
    }

    document.querySelectorAll('.bkbg-ret-app').forEach(buildApp);
})();
