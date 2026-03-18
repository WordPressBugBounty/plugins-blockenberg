(function () {
    'use strict';

    /* ── Calculation helpers ──────────────────────────────────────────────── */
    function calcBMI(system, weightKg, heightCm, weightLbs, heightFt, heightIn) {
        var bmi;
        if (system === 'metric') {
            var hM = heightCm / 100;
            bmi = hM > 0 ? weightKg / (hM * hM) : 0;
        } else {
            var totalIn = (heightFt * 12) + heightIn;
            bmi = totalIn > 0 ? (703 * weightLbs) / (totalIn * totalIn) : 0;
        }
        return Math.round(bmi * 10) / 10;
    }

    function bmiCategory(bmi) {
        if (bmi < 18.5) return 'underweight';
        if (bmi < 25)   return 'normal';
        if (bmi < 30)   return 'overweight';
        return 'obese';
    }

    function bmiPct(bmi) {
        var clamped = Math.min(Math.max(bmi, 10), 40);
        return ((clamped - 10) / 30) * 100;
    }

    function idealRange(system, heightCm, heightFt, heightIn) {
        var minBMI = 18.5, maxBMI = 24.9;
        if (system === 'metric') {
            var hM = heightCm / 100;
            return { min: (minBMI * hM * hM).toFixed(1), max: (maxBMI * hM * hM).toFixed(1), unit: 'kg' };
        } else {
            var totalIn = heightFt * 12 + heightIn;
            return {
                min: ((minBMI * totalIn * totalIn) / 703).toFixed(1),
                max: ((maxBMI * totalIn * totalIn) / 703).toFixed(1),
                unit: 'lbs'
            };
        }
    }

    var CAT_INTERP = {
        underweight: 'Consider speaking with a healthcare professional about healthy weight gain.',
        normal:      'Great job! You are in a healthy weight range.',
        overweight:  'Small lifestyle changes can bring you into a healthy range.',
        obese:       'Consult a healthcare professional for personalized guidance.',
    };

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

    /* ── Build the full UI into the app container ─────────────────────────── */
    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) {}

        var system     = opts.unitSystem      || 'metric';
        var showToggle = opts.showUnitToggle  !== false;

        /* current values */
        var weightKg  = opts.weightDefaultKg  || 70;
        var heightCm  = opts.heightDefaultCm  || 170;
        var weightLbs = opts.weightDefaultLbs || 154;
        var heightFt  = opts.heightDefaultFt  || 5;
        var heightIn  = parseInt(opts.heightDefaultIn) || 7;

        var catColors = {
            underweight: opts.underweightColor || '#3b82f6',
            normal:      opts.normalColor      || '#10b981',
            overweight:  opts.overweightColor  || '#f59e0b',
            obese:       opts.obeseColor       || '#ef4444',
        };
        var catLabels = { underweight: 'Underweight', normal: 'Normal', overweight: 'Overweight', obese: 'Obese' };
        var accent    = opts.accentColor  || '#6c3fb5';
        var cardBg    = opts.cardBg       || '#ffffff';
        var resultBg  = opts.resultBg     || '#f5f3ff';
        var resultBdr = opts.resultBorder || '#ede9fe';
        var labelColor= opts.labelColor   || '#374151';
        var radius    = (opts.cardRadius  || 16) + 'px';
        var btnR      = (opts.btnRadius   || 8)  + 'px';
        var maxW      = (opts.maxWidth    || 680) + 'px';
        var ptop      = (opts.paddingTop  || 60) + 'px';
        var pbot      = (opts.paddingBottom || 60) + 'px';

        /* --- Outer container --- */
        app.innerHTML = '';
        app.style.cssText = 'box-sizing:border-box;';

        var card = document.createElement('div');
        card.className = 'bkbg-bmi-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + radius + ';padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:' + maxW + ';margin:0 auto;padding-top:' + ptop + ';padding-bottom:' + pbot + ';box-sizing:border-box;';
        app.appendChild(card);

        /* --- Unit toggle --- */
        if (showToggle) {
            var toggleRow = document.createElement('div');
            toggleRow.className = 'bkbg-bmi-unit-toggle';
            ['metric', 'imperial'].forEach(function(s) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-bmi-unit-btn' + (system === s ? ' active' : '');
                btn.textContent = s === 'metric' ? 'Metric (kg / cm)' : 'Imperial (lbs / ft)';
                btn.style.cssText = 'border-radius:' + btnR + ';background:' + (system === s ? accent : '#f3f4f6') + ';color:' + (system === s ? '#fff' : '#374151') + ';';
                btn.dataset.sys = s;
                toggleRow.appendChild(btn);
            });
            card.appendChild(toggleRow);
        }

        /* --- Input fields --- */
        var inputWrap = document.createElement('div');
        inputWrap.className = 'bkbg-bmi-inputs ' + system;
        card.appendChild(inputWrap);

        function makeField(label, id, value, min, max) {
            var wrap = document.createElement('div');
            var lbl  = document.createElement('label');
            lbl.htmlFor = id;
            lbl.textContent = label;
            lbl.className = 'bkbg-bmi-label';
            lbl.style.color = labelColor;
            var inp = document.createElement('input');
            inp.id   = id;
            inp.type = 'number';
            inp.className = 'bkbg-bmi-input';
            inp.value = value;
            inp.min   = min;
            inp.max   = max;
            inp.style.accentColor = accent;
            wrap.appendChild(lbl);
            wrap.appendChild(inp);
            inputWrap.appendChild(wrap);
            return inp;
        }

        var inpWKg, inpHCm, inpWLbs, inpHFt, inpHIn;
        function buildInputs() {
            inputWrap.innerHTML = '';
            inputWrap.className = 'bkbg-bmi-inputs ' + system;
            if (system === 'metric') {
                inpWKg = makeField('Weight (kg)', 'bmi-wkg', weightKg, opts.weightMinKg || 20, opts.weightMaxKg || 200);
                inpHCm = makeField('Height (cm)', 'bmi-hcm', heightCm, opts.heightMinCm || 100, opts.heightMaxCm || 220);
            } else {
                inpWLbs = makeField('Weight (lbs)', 'bmi-wlbs', weightLbs, opts.weightMinLbs || 44, opts.weightMaxLbs || 440);
                inpHFt  = makeField('Height (ft)', 'bmi-hft', heightFt, 3, 8);
                inpHIn  = makeField('Height (in)', 'bmi-hin', heightIn, 0, 11);
            }
        }
        buildInputs();

        /* --- Result area --- */
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-bmi-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + radius + ';';
        card.appendChild(resultBox);

        var bmiNumEl   = document.createElement('div'); bmiNumEl.className = 'bkbg-bmi-number';
        var bmiCatEl   = document.createElement('div'); bmiCatEl.className = 'bkbg-bmi-cat-label';
        var gaugeWrap, gaugeTrack, gaugeNeedle, gaugeLabels;
        var legendEl;
        var idealEl;
        var interpEl;

        resultBox.appendChild(bmiNumEl);
        resultBox.appendChild(bmiCatEl);

        if (opts.showGauge !== false) {
            gaugeWrap   = document.createElement('div');   gaugeWrap.className = 'bkbg-bmi-gauge-wrap';
            gaugeTrack  = document.createElement('div');   gaugeTrack.className = 'bkbg-bmi-gauge-track';
            gaugeTrack.style.background = 'linear-gradient(to right,' + catColors.underweight + ' 0%,' + catColors.normal + ' 30%,' + catColors.overweight + ' 60%,' + catColors.obese + ' 100%)';
            gaugeNeedle = document.createElement('div');   gaugeNeedle.className = 'bkbg-bmi-gauge-needle';
            gaugeLabels = document.createElement('div');   gaugeLabels.className = 'bkbg-bmi-gauge-labels';
            gaugeLabels.innerHTML = '<span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>';
            gaugeTrack.appendChild(gaugeNeedle);
            gaugeWrap.appendChild(gaugeTrack);
            gaugeWrap.appendChild(gaugeLabels);
            resultBox.appendChild(gaugeWrap);
        }

        if (opts.showCategories !== false) {
            legendEl = document.createElement('div');
            legendEl.className = 'bkbg-bmi-legend';
            Object.keys(catColors).forEach(function(k) {
                var item = document.createElement('div'); item.className = 'bkbg-bmi-legend-item';
                var dot  = document.createElement('span'); dot.className = 'bkbg-bmi-legend-dot'; dot.style.background = catColors[k];
                var txt  = document.createElement('span'); txt.textContent = catLabels[k];
                item.appendChild(dot); item.appendChild(txt);
                legendEl.appendChild(item);
            });
            resultBox.appendChild(legendEl);
        }

        if (opts.showIdealWeight !== false) {
            idealEl = document.createElement('p');
            idealEl.className = 'bkbg-bmi-ideal';
            resultBox.appendChild(idealEl);
        }

        if (opts.showInterpretation !== false) {
            interpEl = document.createElement('p');
            interpEl.className = 'bkbg-bmi-interp';
            resultBox.appendChild(interpEl);
        }

        if (opts.showDisclaimer !== false && opts.disclaimer) {
            var disc = document.createElement('p');
            disc.className = 'bkbg-bmi-disclaimer';
            disc.textContent = opts.disclaimer;
            card.appendChild(disc);
        }

        /* --- Update display --- */
        function update() {
            if (system === 'metric') {
                weightKg = parseFloat(inpWKg.value) || 70;
                heightCm = parseFloat(inpHCm.value) || 170;
            } else {
                weightLbs = parseFloat(inpWLbs.value) || 154;
                heightFt  = parseInt(inpHFt.value)    || 5;
                heightIn  = parseInt(inpHIn.value)     || 0;
            }

            var bmi  = calcBMI(system, weightKg, heightCm, weightLbs, heightFt, heightIn);
            var cat  = bmiCategory(bmi);
            var col  = catColors[cat];
            var pct  = bmiPct(bmi);

            bmiNumEl.textContent = bmi.toFixed(1);
            bmiNumEl.style.color = col;
            bmiCatEl.textContent = catLabels[cat];
            bmiCatEl.style.color = col;

            if (gaugeNeedle) {
                gaugeNeedle.style.left = pct + '%';
                gaugeNeedle.style.color = col;
                gaugeNeedle.style.borderColor = col;
            }

            if (idealEl) {
                var ir = idealRange(system, heightCm, heightFt, heightIn);
                idealEl.innerHTML = 'Ideal weight range: <strong>' + ir.min + '–' + ir.max + ' ' + ir.unit + '</strong>';
            }

            if (interpEl) {
                interpEl.textContent = CAT_INTERP[cat] || '';
                interpEl.style.color = col;
            }
        }

        /* --- Event bindings --- */
        function bindInputs() {
            var allInputs = inputWrap.querySelectorAll('input');
            allInputs.forEach(function(inp) {
                inp.addEventListener('input', update);
            });
        }
        bindInputs();
        update();

        /* Unit toggle events */
        if (showToggle) {
            card.querySelector('.bkbg-bmi-unit-toggle').addEventListener('click', function(e) {
                var btn = e.target.closest('.bkbg-bmi-unit-btn');
                if (!btn) return;
                system = btn.dataset.sys;
                card.querySelectorAll('.bkbg-bmi-unit-btn').forEach(function(b) {
                    var active = b.dataset.sys === system;
                    b.classList.toggle('active', active);
                    b.style.background = active ? accent : '#f3f4f6';
                    b.style.color = active ? '#fff' : '#374151';
                });
                buildInputs();
                bindInputs();
                update();
            });
        }

        typoCssVarsForEl(opts.typoTitle, '--bkbg-bmi-title-', app);
        typoCssVarsForEl(opts.typoBmi, '--bkbg-bmi-number-', app);
    }

    document.querySelectorAll('.bkbg-bmi-app').forEach(buildApp);
})();
