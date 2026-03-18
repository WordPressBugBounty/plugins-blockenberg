(function () {
    'use strict';

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

    var ACTIVITY_OPTIONS = [
        { value: 'sedentary', label: 'Sedentary (little/no exercise)',       mult: 1.200 },
        { value: 'light',     label: 'Lightly active (1–3 days/week)',        mult: 1.375 },
        { value: 'moderate',  label: 'Moderately active (3–5 days/week)',     mult: 1.550 },
        { value: 'very',      label: 'Very active (6–7 days/week)',           mult: 1.725 },
        { value: 'extra',     label: 'Extra active (physical job + hard ex)', mult: 1.900 },
    ];

    var GOAL_OPTIONS = [
        { value: 'lose2',    label: 'Lose weight fast (−1000 kcal)', adj: -1000 },
        { value: 'lose1',    label: 'Lose weight (−500 kcal)',        adj: -500  },
        { value: 'maintain', label: 'Maintain weight',                adj: 0     },
        { value: 'gain1',    label: 'Gain weight (+300 kcal)',        adj: +300  },
        { value: 'gain2',    label: 'Build muscle (+500 kcal)',       adj: +500  },
    ];

    function calcBMR(gender, weightKg, heightCm, age) {
        var base = 10 * weightKg + 6.25 * heightCm - 5 * age;
        return gender === 'female' ? base - 161 : base + 5;
    }

    function actMult(activity) {
        var opt = ACTIVITY_OPTIONS.filter(function (o) { return o.value === activity; })[0];
        return opt ? opt.mult : 1.55;
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent   = opts.accentColor   || '#6c3fb5';
        var cardBg   = opts.cardBg        || '#ffffff';
        var resultBg = opts.resultBg      || '#f5f3ff';
        var resultBdr= opts.resultBorder  || '#ede9fe';
        var cRadius  = (opts.cardRadius   || 16) + 'px';
        var iRadius  = (opts.inputRadius  || 8)  + 'px';
        var maxW     = (opts.maxWidth     || 620) + 'px';
        var ptop     = (opts.paddingTop   || 60) + 'px';
        var pbot     = (opts.paddingBottom|| 60) + 'px';
        var tdeeSize = (opts.tdeeSize     || 52) + 'px';
        var titleSz  = (opts.titleSize    || 26) + 'px';
        var lclr     = opts.labelColor    || '#374151';
        var proPct   = opts.proteinPct    || 25;
        var crbPct   = opts.carbPct       || 45;
        var fatPct   = opts.fatPct        || 30;

        /* State */
        var state = {
            units:    opts.defaultUnits    || 'metric',
            gender:   opts.defaultGender   || 'male',
            age:      opts.defaultAge      || 30,
            weight:   opts.defaultWeight   || 70,
            height:   opts.defaultHeight   || 170,
            activity: opts.defaultActivity || 'moderate',
            goal:     'maintain',
        };

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-cal-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cRadius + ';max-width:' + maxW + ';margin:0 auto;padding:' + ptop + ' 32px ' + pbot;
        app.innerHTML = '';
        app.appendChild(card);
        typoCssVarsForEl(opts.typoTitle, '--bkbg-cal-tt-', card);
        typoCssVarsForEl(opts.typoSub, '--bkbg-cal-ts-', card);

        /* Title */
        if (opts.showTitle !== false && opts.title) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-cal-title';
            h2.style.cssText = 'color:' + (opts.titleColor||'#1e1b4b') + ';margin:0 0 8px';
            h2.textContent = opts.title;
            card.appendChild(h2);
        }
        if (opts.showSubtitle !== false && opts.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-cal-subtitle';
            sub.style.cssText = 'color:' + (opts.subtitleColor||'#6b7280') + ';text-align:center;margin:0 0 24px';
            sub.textContent = opts.subtitle;
            card.appendChild(sub);
        }

        /* Helpers */
        function mkLabel(txt) {
            var l = document.createElement('label');
            l.className = 'bkbg-cal-label';
            l.style.cssText = 'font-size:13px;font-weight:600;color:' + lclr + ';display:block;margin-bottom:4px';
            l.textContent = txt;
            return l;
        }
        function mkField(label, input) {
            var d = document.createElement('div');
            d.className = 'bkbg-cal-field';
            d.style.marginBottom = '14px';
            if (label) d.appendChild(mkLabel(label));
            d.appendChild(input);
            return d;
        }

        var inpCSS = 'width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:' + iRadius + ';font-size:15px;box-sizing:border-box;outline:none;background:#fff;color:' + lclr;
        var selCSS = inpCSS + ';appearance:auto';

        /* Units toggle */
        var unitsRow = document.createElement('div');
        unitsRow.className = 'bkbg-cal-units-row';
        unitsRow.style.cssText = 'display:flex;gap:10px;margin-bottom:14px';
        var uBtns = {};
        ['metric','imperial'].forEach(function (u) {
            var b = document.createElement('button');
            b.className = 'bkbg-cal-toggle-btn' + (state.units===u?' active':'');
            b.style.cssText = 'flex:1;padding:10px;border:2px solid '+(state.units===u?accent:'#e5e7eb')+';border-radius:'+iRadius+';background:'+(state.units===u?accent:'#fff')+';color:'+(state.units===u?'#fff':lclr)+';font-weight:600;cursor:pointer;font-size:13px';
            b.textContent = u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/in)';
            b.addEventListener('click', function () { state.units = u; refreshUnitBtns(); updateLabels(); update(); });
            uBtns[u] = b;
            unitsRow.appendChild(b);
        });
        card.appendChild(unitsRow);

        function refreshUnitBtns() {
            ['metric','imperial'].forEach(function (u) {
                var active = state.units === u;
                uBtns[u].style.background    = active ? accent : '#fff';
                uBtns[u].style.borderColor   = active ? accent : '#e5e7eb';
                uBtns[u].style.color         = active ? '#fff' : lclr;
            });
        }

        /* Gender toggle */
        card.appendChild(mkLabel('Gender'));
        var genderRow = document.createElement('div');
        genderRow.style.cssText = 'display:flex;gap:10px;margin-bottom:14px';
        var gBtns = {};
        ['male','female'].forEach(function (g) {
            var b = document.createElement('button');
            b.style.cssText = 'flex:1;padding:10px;border:2px solid '+(state.gender===g?accent:'#e5e7eb')+';border-radius:'+iRadius+';background:'+(state.gender===g?accent:'#fff')+';color:'+(state.gender===g?'#fff':lclr)+';font-weight:600;cursor:pointer;font-size:14px';
            b.textContent = g === 'male' ? '♂ Male' : '♀ Female';
            b.addEventListener('click', function () {
                state.gender = g;
                ['male','female'].forEach(function (x) {
                    var ac = state.gender === x;
                    gBtns[x].style.background  = ac ? accent : '#fff';
                    gBtns[x].style.borderColor = ac ? accent : '#e5e7eb';
                    gBtns[x].style.color       = ac ? '#fff' : lclr;
                });
                update();
            });
            gBtns[g] = b;
            genderRow.appendChild(b);
        });
        card.appendChild(genderRow);

        /* Number inputs */
        var ageInp = document.createElement('input');
        ageInp.type = 'number'; ageInp.min = 10; ageInp.max = 100; ageInp.value = state.age; ageInp.className = 'bkbg-cal-input'; ageInp.style.cssText = inpCSS;
        ageInp.addEventListener('input', function () { state.age = parseInt(ageInp.value)||1; update(); });

        var heightInp = document.createElement('input');
        heightInp.type = 'number'; heightInp.value = state.height; heightInp.className = 'bkbg-cal-input'; heightInp.style.cssText = inpCSS;
        heightInp.addEventListener('input', function () { state.height = parseFloat(heightInp.value)||170; update(); });

        var weightInp = document.createElement('input');
        weightInp.type = 'number'; weightInp.value = state.weight; weightInp.className = 'bkbg-cal-input'; weightInp.style.cssText = inpCSS;
        weightInp.addEventListener('input', function () { state.weight = parseFloat(weightInp.value)||70; update(); });

        var heightFld = mkField('Height (cm)', heightInp);
        var weightFld = mkField('Weight (kg)', weightInp);

        function updateLabels() {
            var wU = state.units === 'imperial' ? 'lbs' : 'kg';
            var hU = state.units === 'imperial' ? 'in'  : 'cm';
            heightFld.querySelector('label').textContent = 'Height (' + hU + ')';
            weightFld.querySelector('label').textContent = 'Weight (' + wU + ')';
        }

        card.appendChild(mkField('Age (years)', ageInp));
        card.appendChild(heightFld);
        card.appendChild(weightFld);

        /* Activity */
        var actSel = document.createElement('select');
        actSel.className = 'bkbg-cal-select'; actSel.style.cssText = selCSS;
        ACTIVITY_OPTIONS.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o.value; opt.textContent = o.label;
            if (o.value === state.activity) opt.selected = true;
            actSel.appendChild(opt);
        });
        actSel.addEventListener('change', function () { state.activity = actSel.value; update(); });
        card.appendChild(mkField('Activity level', actSel));

        /* Goal */
        if (opts.showGoalCalc !== false) {
            var goalSel = document.createElement('select');
            goalSel.className = 'bkbg-cal-select'; goalSel.style.cssText = selCSS;
            GOAL_OPTIONS.forEach(function (o) {
                var opt = document.createElement('option');
                opt.value = o.value; opt.textContent = o.label;
                if (o.value === 'maintain') opt.selected = true;
                goalSel.appendChild(opt);
            });
            goalSel.addEventListener('change', function () { state.goal = goalSel.value; update(); });
            card.appendChild(mkField('Goal', goalSel));
        }

        /* Result box */
        var resultBox = document.createElement('div');
        resultBox.className = 'bkbg-cal-result';
        resultBox.style.cssText = 'background:' + resultBg + ';border:1.5px solid ' + resultBdr + ';border-radius:' + cRadius + ';padding:24px;text-align:center;margin-bottom:20px';

        var resultLbl = document.createElement('div');
        resultLbl.className = 'bkbg-cal-result-label';
        resultLbl.style.cssText = 'font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px';
        resultLbl.textContent = 'Daily Calories (TDEE)';
        resultBox.appendChild(resultLbl);

        var tdeeNum = document.createElement('div');
        tdeeNum.className = 'bkbg-cal-tdee';
        tdeeNum.style.cssText = 'font-size:' + tdeeSize + ';font-weight:800;color:' + (opts.tdeeColor||accent) + ';line-height:1;margin-bottom:4px';
        resultBox.appendChild(tdeeNum);

        var kcalLbl = document.createElement('div');
        kcalLbl.className = 'bkbg-cal-kcal';
        kcalLbl.style.cssText = 'font-size:13px;color:#9ca3af';
        kcalLbl.textContent = 'kcal / day';
        resultBox.appendChild(kcalLbl);

        var bmrLbl = document.createElement('div');
        bmrLbl.className = 'bkbg-cal-bmr';
        bmrLbl.style.cssText = 'margin-top:12px;font-size:13px;color:' + (opts.bmrColor||'#8b5cf6');
        if (opts.showBMR !== false) resultBox.appendChild(bmrLbl);

        card.appendChild(resultBox);

        /* Macros */
        var macroSection;
        var macroBar, proNum, crbNum, fatNum;
        if (opts.showMacros !== false) {
            macroSection = document.createElement('div');

            macroBar = document.createElement('div');
            macroBar.className = 'bkbg-cal-macro-bar';
            macroBar.style.cssText = 'display:flex;border-radius:8px;overflow:hidden;height:12px;margin-bottom:16px';
            var barPro = document.createElement('div');
            barPro.style.cssText = 'flex:' + proPct + ';background:' + (opts.proColor||'#ef4444');
            var barCrb = document.createElement('div');
            barCrb.style.cssText = 'flex:' + crbPct + ';background:' + (opts.carbColor||'#f59e0b');
            var barFat = document.createElement('div');
            barFat.style.cssText = 'flex:' + fatPct + ';background:' + (opts.fatColor||'#3b82f6');
            macroBar.appendChild(barPro); macroBar.appendChild(barCrb); macroBar.appendChild(barFat);
            macroSection.appendChild(macroBar);

            var macroGrid = document.createElement('div');
            macroGrid.className = 'bkbg-cal-macros';
            macroGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px';

            function mkMacroCard(name, color, pct) {
                var mc = document.createElement('div');
                mc.className = 'bkbg-cal-macro-card';
                mc.style.cssText = 'text-align:center;background:#fff;border-radius:10px;padding:12px 8px;border:1.5px solid #e5e7eb';
                mc.innerHTML = '<div class="bkbg-cal-macro-name" style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;margin-bottom:4px">' + name + '</div>' +
                    '<div class="bkbg-cal-macro-num" style="font-size:24px;font-weight:800;line-height:1;color:' + color + '">—g</div>' +
                    '<div class="bkbg-cal-macro-pct" style="font-size:12px;color:#9ca3af;margin-top:2px">' + pct + '%</div>';
                return mc;
            }

            var proCrd = mkMacroCard('Protein', opts.proColor||'#ef4444', proPct);
            var crbCrd = mkMacroCard('Carbs',   opts.carbColor||'#f59e0b', crbPct);
            var fatCrd = mkMacroCard('Fat',     opts.fatColor||'#3b82f6',  fatPct);
            proNum = proCrd.querySelector('.bkbg-cal-macro-num');
            crbNum = crbCrd.querySelector('.bkbg-cal-macro-num');
            fatNum = fatCrd.querySelector('.bkbg-cal-macro-num');
            macroGrid.appendChild(proCrd); macroGrid.appendChild(crbCrd); macroGrid.appendChild(fatCrd);
            macroSection.appendChild(macroGrid);
            card.appendChild(macroSection);
        }

        /* Update function */
        function update() {
            var wkg = state.units === 'imperial' ? state.weight * 0.453592 : state.weight;
            var hcm = state.units === 'imperial' ? state.height * 2.54     : state.height;
            var bmr  = Math.round(calcBMR(state.gender, wkg, hcm, state.age));
            var tdee = Math.round(bmr * actMult(state.activity));
            var gOpt = GOAL_OPTIONS.filter(function (o) { return o.value === (state.goal||'maintain'); })[0];
            var adj  = gOpt ? gOpt.adj : 0;
            var target = tdee + adj;
            tdeeNum.textContent = target.toLocaleString();
            if (opts.showBMR !== false) bmrLbl.textContent = 'Basal Metabolic Rate (BMR): ' + bmr.toLocaleString() + ' kcal/day';
            if (opts.showMacros !== false) {
                proNum.textContent = Math.round(target * proPct / 100 / 4) + 'g';
                crbNum.textContent = Math.round(target * crbPct / 100 / 4) + 'g';
                fatNum.textContent = Math.round(target * fatPct / 100 / 9) + 'g';
            }
        }

        update();
    }

    document.querySelectorAll('.bkbg-cal-app').forEach(buildApp);
})();
