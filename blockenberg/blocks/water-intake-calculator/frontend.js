(function () {
    'use strict';

    var ACTIVITY_FACTOR = { sedentary: 30, light: 33, moderate: 35, active: 38, very_active: 42 };
    var CLIMATE_FACTOR  = { temperate: 0, hot: 500, cold: -200 };

    function calcWater(weightKg, activity, climate) {
        var base = weightKg * (ACTIVITY_FACTOR[activity] || 35);
        base += (CLIMATE_FACTOR[climate] || 0);
        return Math.max(500, base);
    }

    function getTips(activity, climate) {
        var list = [
            'Drink a glass of water first thing in the morning.',
            'Carry a reusable water bottle throughout the day.'
        ];
        if (activity === 'active' || activity === 'very_active') {
            list.push('Drink 500 ml extra for every hour of intense exercise.');
        }
        if (climate === 'hot') list.push('Hot climates increase sweat loss — drink more frequently.');
        if (climate === 'cold') list.push('Cold weather can reduce thirst sensation — stay mindful of drinking.');
        list.push('Herbal teas and water-rich foods count toward your daily intake.');
        return list;
    }

    function init(app) {
        var a;
        try { a = JSON.parse(app.getAttribute('data-opts')); } catch (e) { return; }

        var accent = a.accentColor || '#3b82f6';

        app.style.paddingTop    = (a.paddingTop    || 60) + 'px';
        app.style.paddingBottom = (a.paddingBottom || 60) + 'px';
        if (a.sectionBg) app.style.background = a.sectionBg;
        app.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-wic-wrap';
        wrap.style.maxWidth     = (a.maxWidth    || 500) + 'px';
        wrap.style.borderRadius = (a.cardRadius  || 16)  + 'px';
        wrap.style.background   = a.cardBg || '#fff';
        app.appendChild(wrap);

        if (a.showTitle || a.showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-wic-header';
            if (a.showTitle && a.title) {
                var title = document.createElement('div');
                title.className = 'bkbg-wic-title';
                title.textContent = a.title;
                if (a.titleColor) title.style.color = a.titleColor;
                header.appendChild(title);
            }
            if (a.showSubtitle && a.subtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-wic-subtitle';
                sub.textContent = a.subtitle;
                if (a.subtitleColor) sub.style.color = a.subtitleColor;
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        var ir = (a.inputRadius || 8) + 'px';
        var ib = '1.5px solid ' + (a.inputBorder || '#e5e7eb');
        var currentUnit = a.defaultUnit || 'kg';

        // Weight field
        var weightField = document.createElement('div');
        weightField.className = 'bkbg-wic-field';

        var weightLabelRow = document.createElement('div');
        weightLabelRow.className = 'bkbg-wic-label';
        if (a.labelColor) weightLabelRow.style.color = a.labelColor;

        var weightLabelSpan = document.createElement('span');
        weightLabelSpan.textContent = 'Body Weight';

        var unitToggle = document.createElement('div');
        unitToggle.className = 'bkbg-wic-unit-toggle';

        ['kg','lbs'].forEach(function(u) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-wic-unit-btn';
            btn.textContent = u;
            btn.dataset.unit = u;
            btn.style.background = u === currentUnit ? accent : '#e5e7eb';
            btn.style.color      = u === currentUnit ? '#fff'  : '#374151';
            btn.addEventListener('click', function() {
                var old = currentUnit;
                currentUnit = u;
                var cur = parseFloat(weightInput.value) || 0;
                if (old === 'kg' && u === 'lbs') weightInput.value = (cur * 2.20462).toFixed(1);
                else if (old === 'lbs' && u === 'kg') weightInput.value = (cur * 0.453592).toFixed(1);
                unitToggle.querySelectorAll('.bkbg-wic-unit-btn').forEach(function(b) {
                    var active = b.dataset.unit === currentUnit;
                    b.style.background = active ? accent : '#e5e7eb';
                    b.style.color      = active ? '#fff'  : '#374151';
                });
                recalculate();
            });
            unitToggle.appendChild(btn);
        });

        weightLabelRow.appendChild(weightLabelSpan);
        weightLabelRow.appendChild(unitToggle);
        weightField.appendChild(weightLabelRow);

        var weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.className = 'bkbg-wic-input';
        weightInput.value = String(a.defaultWeight || 70);
        weightInput.min = '1';
        weightInput.style.borderRadius = ir;
        weightInput.style.border = ib;
        weightInput.addEventListener('input', recalculate);
        weightField.appendChild(weightInput);
        wrap.appendChild(weightField);

        function makeSelect(labelText, options, defaultVal) {
            var field = document.createElement('div');
            field.className = 'bkbg-wic-field';
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-wic-label';
            lbl.textContent = labelText;
            if (a.labelColor) lbl.style.color = a.labelColor;
            var sel = document.createElement('select');
            sel.className = 'bkbg-wic-select';
            sel.style.borderRadius = ir;
            sel.style.border = ib;
            options.forEach(function(o) {
                var opt = document.createElement('option');
                opt.value = o[0];
                opt.textContent = o[1];
                if (o[0] === defaultVal) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', recalculate);
            field.appendChild(lbl);
            field.appendChild(sel);
            wrap.appendChild(field);
            return sel;
        }

        var actSel = makeSelect('Activity Level', [
            ['sedentary',  'Sedentary (little or no exercise)'],
            ['light',      'Light (light exercise 1-3 days/wk)'],
            ['moderate',   'Moderate (exercise 3-5 days/wk)'],
            ['active',     'Active (hard exercise 6-7 days/wk)'],
            ['very_active','Very Active (athlete / physical job)']
        ], a.defaultActivity || 'moderate');

        var climSel = makeSelect('Climate', [
            ['temperate','Temperate (cool/mild climate)'],
            ['hot',      'Hot / Humid Climate'],
            ['cold',     'Cold / Dry Climate']
        ], a.defaultClimate || 'temperate');

        // Result card
        var resultCard = document.createElement('div');
        resultCard.className = 'bkbg-wic-result';
        resultCard.style.background   = a.resultBg || accent;
        resultCard.style.borderRadius = ir;

        var resultLbl   = document.createElement('div'); resultLbl.className   = 'bkbg-wic-result-label';  resultLbl.style.color = a.resultColor||'#fff'; resultLbl.textContent = 'Daily Water Recommendation';
        var resultMain  = document.createElement('div'); resultMain.className  = 'bkbg-wic-result-main';   resultMain.style.color = a.resultColor||'#fff'; resultMain.style.fontSize = (a.resultSize||56)+'px';
        var resultSub   = document.createElement('div'); resultSub.className   = 'bkbg-wic-result-sub';    resultSub.style.color  = a.resultColor||'#fff';
        resultCard.appendChild(resultLbl); resultCard.appendChild(resultMain); resultCard.appendChild(resultSub);
        wrap.appendChild(resultCard);

        // Glasses
        var glassesEl = null;
        if (a.showGlasses) {
            glassesEl = document.createElement('div');
            glassesEl.className = 'bkbg-wic-glasses';
            glassesEl.style.background   = a.glassBg || '#eff6ff';
            glassesEl.style.borderRadius = ir;
            wrap.appendChild(glassesEl);
        }

        // Tips
        var tipsEl = null;
        if (a.showTips) {
            tipsEl = document.createElement('div');
            tipsEl.className = 'bkbg-wic-tips';
            tipsEl.style.background  = a.tipsBg  || '#f0fdf4';
            tipsEl.style.borderColor = a.tipsBorder || '#bbf7d0';
            tipsEl.style.borderRadius = ir;
            wrap.appendChild(tipsEl);
        }

        function recalculate() {
            var wt      = parseFloat(weightInput.value) || (a.defaultWeight || 70);
            var activity= actSel.value;
            var climate = climSel.value;
            var wKg     = currentUnit === 'lbs' ? wt * 0.453592 : wt;
            var ml      = calcWater(wKg, activity, climate);
            var liters  = (ml / 1000).toFixed(1);
            var oz      = Math.round(ml / 29.574);
            var glasses = Math.round(ml / (a.glassSize || 250));

            resultMain.textContent = liters + ' L';
            resultSub.textContent  = oz + ' fl oz · ' + Math.round(ml) + ' ml';

            if (glassesEl) {
                glassesEl.innerHTML = '';
                var glLbl = document.createElement('div');
                glLbl.className = 'bkbg-wic-glasses-label';
                glLbl.style.color = a.glassColor || accent;
                glLbl.textContent = '= ' + glasses + ' glasses of ' + (a.glassSize || 250) + ' ml';
                var glRow = document.createElement('div');
                glRow.className = 'bkbg-wic-glasses-row';
                var limit = Math.min(glasses, 16);
                for (var i = 0; i < limit; i++) {
                    var ico = document.createElement('span');
                    ico.className = 'bkbg-wic-glass-icon';
                    ico.textContent = '💧';
                    glRow.appendChild(ico);
                }
                if (glasses > 16) {
                    var more = document.createElement('span');
                    more.className = 'bkbg-wic-glass-more';
                    more.style.color = a.glassColor || accent;
                    more.textContent = '+' + (glasses - 16) + ' more';
                    glRow.appendChild(more);
                }
                glassesEl.appendChild(glLbl);
                glassesEl.appendChild(glRow);
            }

            if (tipsEl) {
                tipsEl.innerHTML = '';
                var tipHead = document.createElement('div');
                tipHead.className = 'bkbg-wic-tips-heading';
                tipHead.style.color = a.tipsColor || '#166534';
                tipHead.textContent = '💡 Hydration Tips';
                var ul = document.createElement('ul');
                ul.className = 'bkbg-wic-tips-list';
                getTips(activity, climate).forEach(function(tip) {
                    var li = document.createElement('li');
                    li.textContent = tip;
                    li.style.color = a.tipsColor || '#166534';
                    ul.appendChild(li);
                });
                tipsEl.appendChild(tipHead);
                tipsEl.appendChild(ul);
            }
        }

        recalculate();
    }

    document.querySelectorAll('.bkbg-wic-app').forEach(init);
})();
