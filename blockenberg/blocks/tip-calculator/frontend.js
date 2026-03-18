(function () {
    'use strict';

    function fmtMoney(val, currency, pos) {
        var s = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return pos === 'after' ? s + currency : currency + s;
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) {}

        var bill       = opts.defaultBill    || 50;
        var tipPct     = opts.defaultTip     || 15;
        var customTip  = '';
        var people     = opts.defaultPeople  || 2;
        var currency   = opts.currency       || '$';
        var pos        = opts.currencyPos    || 'before';
        var quickTips  = opts.quickTips && opts.quickTips.length ? opts.quickTips : [10, 15, 18, 20, 25];

        var accent     = opts.accentColor    || '#6c3fb5';
        var actBg      = opts.activeBtnBg    || accent;
        var actCol     = opts.activeBtnColor || '#ffffff';
        var inBg       = opts.quickBtnBg     || '#f3f4f6';
        var inCol      = opts.quickBtnColor  || '#374151';
        var cardBg     = opts.cardBg         || '#ffffff';
        var resultBg   = opts.resultBg       || '#f5f3ff';
        var resultBdr  = opts.resultBorder   || '#ede9fe';
        var resultCol  = opts.resultNumColor || accent;
        var labelColor = opts.labelColor     || '#374151';
        var titleColor = opts.titleColor     || '#1e1b4b';
        var subColor   = opts.subtitleColor  || '#6b7280';
        var cRadius    = (opts.cardRadius    || 16) + 'px';
        var btnR       = (opts.btnRadius     || 8)  + 'px';
        var maxW       = (opts.maxWidth      || 520) + 'px';
        var ptop       = (opts.paddingTop    || 60)  + 'px';
        var pbot       = (opts.paddingBottom || 60)  + 'px';


        /* Build card */
        app.innerHTML = '';
        var card = document.createElement('div');
        card.className = 'bkbg-tc-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cRadius + ';padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:' + maxW + ';margin:0 auto;padding-top:' + ptop + ';padding-bottom:' + pbot + ';box-sizing:border-box;';
        app.appendChild(card);

        if (opts.showTitle !== false && opts.title) {
            var titleEl = document.createElement('h2');
            titleEl.className = 'bkbg-tc-title';
            titleEl.textContent = opts.title;
            titleEl.style.cssText = 'color:' + titleColor + ';';
            card.appendChild(titleEl);
        }
        if (opts.showSubtitle !== false && opts.subtitle) {
            var subEl = document.createElement('p');
            subEl.className = 'bkbg-tc-subtitle';
            subEl.textContent = opts.subtitle;
            subEl.style.color = subColor;
            card.appendChild(subEl);
        }

        /* Bill input */
        var billField   = document.createElement('div'); billField.className = 'bkbg-tc-field';
        var billLabel   = document.createElement('label'); billLabel.className = 'bkbg-tc-label'; billLabel.textContent = 'Bill Amount'; billLabel.style.color = labelColor;
        var billWrap    = document.createElement('div'); billWrap.className   = 'bkbg-tc-input-wrap';
        var billPrefix  = document.createElement('span'); billPrefix.className = 'bkbg-tc-prefix'; billPrefix.textContent = pos === 'before' ? currency : '';
        var billInp     = document.createElement('input');
        billInp.type = 'number'; billInp.className = 'bkbg-tc-input' + (pos === 'before' ? ' with-prefix' : ''); billInp.value = bill; billInp.min = 0; billInp.step = '0.01';
        billInp.style.accentColor = accent;
        billWrap.appendChild(billPrefix); billWrap.appendChild(billInp);
        billField.appendChild(billLabel); billField.appendChild(billWrap);
        card.appendChild(billField);

        /* Quick tip buttons */
        var tipField  = document.createElement('div'); tipField.className = 'bkbg-tc-field';
        var tipLabel  = document.createElement('label'); tipLabel.className = 'bkbg-tc-label'; tipLabel.textContent = 'Tip Percentage'; tipLabel.style.color = labelColor;
        var tipsRow   = document.createElement('div'); tipsRow.className = 'bkbg-tc-tips';

        var tipBtns = [];
        quickTips.forEach(function(pct) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-tc-tip-btn';
            btn.textContent = pct + '%';
            btn.dataset.pct = pct;
            btn.style.borderRadius = btnR;
            tipsRow.appendChild(btn);
            tipBtns.push(btn);
        });

        var customInp = null;
        if (opts.allowCustomTip !== false) {
            customInp = document.createElement('input');
            customInp.type = 'number'; customInp.className = 'bkbg-tc-custom-tip';
            customInp.placeholder = 'Custom %'; customInp.min = 0; customInp.max = 100;
            customInp.style.borderRadius = btnR;
            tipsRow.appendChild(customInp);
        }

        tipField.appendChild(tipLabel); tipField.appendChild(tipsRow);
        card.appendChild(tipField);

        function updateTipBtns() {
            tipBtns.forEach(function(btn) {
                var isActive = customTip === '' && parseInt(btn.dataset.pct) === tipPct;
                btn.style.background = isActive ? actBg : inBg;
                btn.style.color      = isActive ? actCol: inCol;
            });
            if (customInp) {
                customInp.style.borderColor = customTip !== '' ? accent : '#e5e7eb';
            }
        }
        updateTipBtns();

        /* People splitter */
        var peopleField = null;
        var peopleNum   = null;
        if (opts.showSplitter !== false) {
            peopleField = document.createElement('div'); peopleField.className = 'bkbg-tc-field';
            var pLabel  = document.createElement('label'); pLabel.className = 'bkbg-tc-label'; pLabel.textContent = 'Number of People'; pLabel.style.color = labelColor;
            var pRow    = document.createElement('div'); pRow.className = 'bkbg-tc-people-row';
            var minusBtn = document.createElement('button'); minusBtn.className = 'bkbg-tc-count-btn'; minusBtn.textContent = '−'; minusBtn.style.cssText = 'color:' + accent + ';border-color:' + accent + ';';
            peopleNum   = document.createElement('span'); peopleNum.className = 'bkbg-tc-count-num'; peopleNum.textContent = people; peopleNum.style.color = titleColor;
            var plusBtn  = document.createElement('button'); plusBtn.className = 'bkbg-tc-count-btn plus'; plusBtn.textContent = '+'; plusBtn.style.cssText = 'color:#fff;background:' + accent + ';border-color:' + accent + ';';
            pRow.appendChild(minusBtn); pRow.appendChild(peopleNum); pRow.appendChild(plusBtn);
            peopleField.appendChild(pLabel); peopleField.appendChild(pRow);
            card.appendChild(peopleField);

            minusBtn.addEventListener('click', function() { people = Math.max(1, people - 1); peopleNum.textContent = people; update(); });
            plusBtn.addEventListener('click',  function() { people++; peopleNum.textContent = people; update(); });
        }

        /* Results */
        var cols = 0;
        if (opts.showTipAmount !== false) cols++;
        if (opts.showTotal !== false) cols++;
        var resultsBox = document.createElement('div');
        resultsBox.className = 'bkbg-tc-results';
        resultsBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius + ';grid-template-columns:' + (cols > 1 ? '1fr 1fr' : '1fr') + ';';
        card.appendChild(resultsBox);

        var tipAmtEl = null, totalEl = null, perPersonEl = null;

        if (opts.showTipAmount !== false) {
            var tipAmtBox = document.createElement('div'); tipAmtBox.className = 'bkbg-tc-result-item';
            var tipAmtLbl = document.createElement('div'); tipAmtLbl.className = 'bkbg-tc-result-label'; tipAmtLbl.textContent = 'Tip Amount';
            tipAmtEl      = document.createElement('div'); tipAmtEl.className = 'bkbg-tc-result-value'; tipAmtEl.style.cssText = 'font-size:28px;color:' + accent + ';';
            tipAmtBox.appendChild(tipAmtLbl); tipAmtBox.appendChild(tipAmtEl);
            resultsBox.appendChild(tipAmtBox);
        }

        if (opts.showTotal !== false) {
            var totalBox = document.createElement('div'); totalBox.className = 'bkbg-tc-result-item';
            var totalLbl = document.createElement('div'); totalLbl.className = 'bkbg-tc-result-label'; totalLbl.textContent = 'Total';
            totalEl      = document.createElement('div'); totalEl.className = 'bkbg-tc-result-value'; totalEl.style.cssText = 'font-size:28px;color:' + titleColor + ';';
            totalBox.appendChild(totalLbl); totalBox.appendChild(totalEl);
            resultsBox.appendChild(totalBox);
        }

        if (opts.showSplitter !== false && opts.showPerPerson !== false) {
            var ppBox = document.createElement('div'); ppBox.className = 'bkbg-tc-result-item bkbg-tc-per-person';
            ppBox.style.borderTopColor = resultBdr;
            var ppLbl = document.createElement('div'); ppLbl.className = 'bkbg-tc-result-label'; ppLbl.textContent = 'Per Person';
            perPersonEl = document.createElement('div'); perPersonEl.className = 'bkbg-tc-result-value bkbg-tc-per-person-value'; perPersonEl.style.cssText = 'color:' + resultCol + ';';
            ppBox.appendChild(ppLbl); ppBox.appendChild(perPersonEl);
            resultsBox.appendChild(ppBox);
        }

        /* Compute & update */
        function update() {
            var eff  = customTip !== '' ? parseFloat(customTip) : tipPct;
            if (isNaN(eff)) eff = 0;
            var tipAmt    = bill * eff / 100;
            var total     = bill + tipAmt;
            var perPerson = people > 0 ? total / people : total;
            if (tipAmtEl)   tipAmtEl.textContent   = fmtMoney(tipAmt, currency, pos);
            if (totalEl)    totalEl.textContent     = fmtMoney(total,  currency, pos);
            if (perPersonEl) perPersonEl.textContent = fmtMoney(perPerson, currency, pos);
        }
        update();

        /* Events */
        billInp.addEventListener('input', function() { bill = parseFloat(this.value) || 0; update(); });

        tipsRow.addEventListener('click', function(e) {
            var btn = e.target.closest('.bkbg-tc-tip-btn');
            if (!btn) return;
            tipPct    = parseInt(btn.dataset.pct);
            customTip = '';
            if (customInp) customInp.value = '';
            updateTipBtns();
            update();
        });

        if (customInp) {
            customInp.addEventListener('input', function() {
                customTip = this.value;
                updateTipBtns();
                update();
            });
        }
    }

    document.querySelectorAll('.bkbg-tc-app').forEach(buildApp);
})();
