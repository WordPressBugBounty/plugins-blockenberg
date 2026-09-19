(function () {
    'use strict';

    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        _typoKeys.forEach(function (pair) {
            var val = obj[pair[0]];
            if (val !== undefined && val !== '') el.style.setProperty(prefix + pair[1], String(val));
        });
        if (obj.sizeUnit && obj.sizeUnit !== 'px') {
            ['sizeDesktop','sizeTablet','sizeMobile'].forEach(function (k, i) {
                var v = obj[k]; if (v !== undefined && v !== '') el.style.setProperty(prefix + ['font-size-d','font-size-t','font-size-m'][i], v + obj.sizeUnit);
            });
        }
    }

    function number(value, fallback, min, max) {
        var n = parseFloat(value);
        return Number.isFinite(n) ? Math.min(max === undefined ? Infinity : max, Math.max(min || 0, n)) : fallback;
    }

    function fmt(sym, n) {
        return sym + n.toFixed(2);
    }

    function init(app) {
        try {
            var a = JSON.parse(app.getAttribute('data-opts'));
        } catch(e) { return; }
        if (!a || typeof a !== 'object' || Array.isArray(a)) return;

        var labels = Object.assign({ bill:'Bill Amount', people:'Number of People', tip:'Tip Percentage', result:'Each person pays', subtotal:'Bill Subtotal', tipTotal:'Tip', total:'Total', split:'Split {n} ways', each:'each', validation:'Enter a valid bill, tip (0–100%), and whole number of people (at least 1).' }, a.labels || {});
        var sym    = a.currencySymbol || '$';
        var accent = a.accentColor    || '#6c3fb5';
        var tipPresets = String(a.tipPresets || '10,15,20,25').split(',').map(function(s){ return number(s.trim(), 0, 0, 100); });

        var billVal   = number(a.defaultBill, 100);
        var tipVal    = number(a.defaultTip, 15, 0, 100);
        var peopleVal = Math.floor(number(a.defaultPeople, 4, 1));

        // Build DOM
        app.innerHTML = '';
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sbc-wrap';
        wrap.style.maxWidth    = (a.maxWidth || 500) + 'px';
        wrap.style.borderRadius = number(a.cardRadius, 16) + 'px';
        wrap.style.background  = a.cardBg || '#fff';
        app.style.paddingTop    = number(a.paddingTop, 60) + 'px';
        app.style.paddingBottom = number(a.paddingBottom, 60) + 'px';
        if (a.sectionBg) app.style.background = a.sectionBg;

        typoCssVarsForEl(app, a.titleTypo, '--bksbc-tt-');
        typoCssVarsForEl(app, a.subtitleTypo, '--bksbc-st-');
        typoCssVarsForEl(app, a.resultTypo, '--bksbc-rs-');

        app.appendChild(wrap);

        // Header
        if (a.showTitle || a.showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-sbc-header';
            if (a.showTitle && a.title) {
                var title = document.createElement('h2');
                title.className = 'bkbg-sbc-title';
                title.textContent = a.title;
                title.style.color = a.titleColor || '';
                header.appendChild(title);
            }
            if (a.showSubtitle && a.subtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-sbc-subtitle';
                sub.textContent = a.subtitle;
                sub.style.color = a.subtitleColor || '';
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        var inputRadius = number(a.inputRadius, 8) + 'px';
        var inputBorder = '1.5px solid ' + (a.inputBorder || '#e5e7eb');

        function makeField(labelText) {
            var field = document.createElement('div');
            field.className = 'bkbg-sbc-field';
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-sbc-label';
            lbl.style.color = a.labelColor || '#374151';
            lbl.textContent = labelText;
            field.appendChild(lbl);
            return field;
        }

        function makeInput(type, val) {
            var inp = document.createElement('input');
            inp.type = type;
            inp.className = 'bkbg-sbc-input';
            inp.value = val;
            inp.min = '0';
            inp.style.borderRadius = inputRadius;
            inp.style.border = inputBorder;
            inp.style.fontSize = '16px';
            return inp;
        }

        // Bill field
        var billField = makeField(labels.bill);
        var billInput = makeInput('number', billVal);
        billInput.setAttribute('aria-label', labels.bill);
        billInput.step = 'any';
        billField.appendChild(billInput);
        wrap.appendChild(billField);

        // People field
        var peopleField = makeField(labels.people);
        var peopleInput = makeInput('number', peopleVal);
        peopleInput.min = '1';
        peopleInput.step = '1';
        peopleInput.setAttribute('aria-label', labels.people);
        peopleField.appendChild(peopleInput);
        wrap.appendChild(peopleField);

        // Tip field
        var tipField = makeField(labels.tip);

        var customTipInput;
        if (a.showTipPresets) {
            var presetsRow = document.createElement('div');
            presetsRow.className = 'bkbg-sbc-presets';

            tipPresets.forEach(function(p) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-sbc-preset-btn';
                btn.type = 'button';
                btn.setAttribute('aria-pressed', p === tipVal ? 'true' : 'false');
                btn.textContent = p + '%';
                btn.style.background = p === tipVal ? (a.presetActiveBg || accent) : (a.presetBg || '#f3f4f6');
                btn.style.borderColor = p === tipVal ? (a.presetActiveBg || accent) : '#e5e7eb';
                btn.style.color = p === tipVal ? (a.presetActiveColor || '#fff') : (a.presetColor || '#374151');
                btn.addEventListener('click', function() {
                    tipVal = p;
                    if (customTipInput) customTipInput.value = p;
                    updatePresetButtons();
                    recalculate();
                });
                presetsRow.appendChild(btn);
            });

            customTipInput = document.createElement('input');
            customTipInput.type = 'number';
            customTipInput.className = 'bkbg-sbc-tip-custom';
            customTipInput.value = tipVal;
            customTipInput.min = '0';
            customTipInput.max = '100';
            customTipInput.step = 'any';
            customTipInput.setAttribute('aria-label', labels.tip);
            customTipInput.style.borderRadius = inputRadius;
            customTipInput.style.border = inputBorder;
            customTipInput.addEventListener('input', function() {
                tipVal = number(this.value, 0, 0, 100);
                updatePresetButtons();
                recalculate();
            });
            presetsRow.appendChild(customTipInput);
            tipField.appendChild(presetsRow);
        } else {
            var tipInputDirect = makeInput('number', tipVal);
            tipInputDirect.max = '100';
            tipInputDirect.step = 'any';
            tipInputDirect.setAttribute('aria-label', labels.tip);
            tipInputDirect.addEventListener('input', function(){ tipVal = number(this.value, 0, 0, 100); recalculate(); });
            tipField.appendChild(tipInputDirect);
        }
        wrap.appendChild(tipField);

        function updatePresetButtons() {
            var btns = presetsRow ? presetsRow.querySelectorAll('.bkbg-sbc-preset-btn') : [];
            tipPresets.forEach(function(p, i) {
                var active = p === tipVal;
                btns[i].setAttribute('aria-pressed', active ? 'true' : 'false');
                btns[i].style.background  = active ? (a.presetActiveBg || accent)  : (a.presetBg || '#f3f4f6');
                btns[i].style.borderColor = active ? (a.presetActiveBg || accent)  : '#e5e7eb';
                btns[i].style.color       = active ? (a.presetActiveColor || '#fff'): (a.presetColor || '#374151');
            });
        }

        // Result card
        var resultCard = document.createElement('div');
        resultCard.className = 'bkbg-sbc-result';
        resultCard.setAttribute('aria-live', 'polite');
        resultCard.setAttribute('aria-atomic', 'true');
        resultCard.style.background   = a.resultBg || accent;
        resultCard.style.borderRadius = inputRadius;
        resultCard.style.marginBottom = a.showBreakdown ? '16px' : '0';

        var resultLabel = document.createElement('div');
        resultLabel.className = 'bkbg-sbc-result-label';
        resultLabel.style.color = a.resultColor || '#fff';
        resultLabel.textContent = labels.result;

        var resultAmount = document.createElement('div');
        resultAmount.className = 'bkbg-sbc-result-amount';
        resultAmount.style.color = a.resultColor || '#fff';

        resultCard.appendChild(resultLabel);
        resultCard.appendChild(resultAmount);
        wrap.appendChild(resultCard);

        // Breakdown
        var breakdownEl = null;
        var rows = {};
        if (a.showBreakdown) {
            breakdownEl = document.createElement('div');
            breakdownEl.className = 'bkbg-sbc-breakdown';
            breakdownEl.style.background   = a.breakdownBg || '#f5f3ff';
            breakdownEl.style.borderColor  = a.breakdownBorder || '#ede9fe';
            breakdownEl.style.borderRadius = inputRadius;

            ['Bill Subtotal', 'Tip', 'Total', 'Split'].forEach(function(key) {
                var row = document.createElement('div');
                row.className = 'bkbg-sbc-breakdown-row';
                row.style.borderBottomColor = a.breakdownBorder || '#ede9fe';
                row.style.color = a.labelColor || '#374151';
                var lbl = document.createElement('span');
                var val = document.createElement('strong');
                row.appendChild(lbl);
                row.appendChild(val);
                breakdownEl.appendChild(row);
                rows[key] = { lbl: lbl, val: val };
            });
            wrap.appendChild(breakdownEl);
        }

        function recalculate() {
            billVal   = number(billInput.value, 0);
            peopleVal = Math.floor(number(peopleInput.value, 1, 1));

            var currentTip = customTipInput || tipInputDirect;
            var valid = billInput.value !== '' && billInput.validity.valid && peopleInput.value !== '' && peopleInput.validity.valid && currentTip.value !== '' && currentTip.validity.valid;
            resultLabel.textContent = valid ? labels.result : labels.validation;
            if (breakdownEl) breakdownEl.hidden = !valid;
            [billInput, peopleInput, currentTip].forEach(function (input) { input.setAttribute('aria-invalid', input.value === '' || !input.validity.valid ? 'true' : 'false'); });
            if (!valid) { resultAmount.textContent = '—'; return; }

            var tipAmt  = billVal * tipVal / 100;
            var total   = billVal + tipAmt;
            var perPerson = a.roundUp
                ? Math.ceil(total / peopleVal * 100) / 100
                : total / peopleVal;

            resultAmount.textContent = fmt(sym, perPerson);

            if (a.showBreakdown && rows) {
                rows['Bill Subtotal'].lbl.textContent  = labels.subtotal;
                rows['Bill Subtotal'].val.textContent  = fmt(sym, billVal);
                rows['Tip'].lbl.textContent            = labels.tipTotal + ' (' + tipVal + '%)';
                rows['Tip'].val.textContent            = '+' + fmt(sym, tipAmt);
                rows['Total'].lbl.textContent          = labels.total;
                rows['Total'].val.textContent          = fmt(sym, total);
                rows['Split'].lbl.textContent          = labels.split.replace('{n}', peopleVal);
                rows['Split'].val.textContent          = fmt(sym, perPerson) + ' ' + labels.each;
            }
        }

        billInput.addEventListener('input', recalculate);
        peopleInput.addEventListener('input', recalculate);
        if (!a.showTipPresets && typeof tipInputDirect !== 'undefined') {
            // already attached above
        }

        recalculate();
    }

    document.querySelectorAll('.bkbg-sbc-app').forEach(init);
})();
