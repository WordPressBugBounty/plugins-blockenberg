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

    var ACTIVITY_MULT = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9};
    var GOAL_MULT     = {lose_fast:0.75, lose_slow:0.85, maintain:1, gain_slow:1.1, gain_fast:1.2};
    var MACRO_RATIOS  = {
        lose_fast:[0.40,0.30,0.30], lose_slow:[0.35,0.35,0.30], maintain:[0.30,0.40,0.30],
        gain_slow:[0.30,0.45,0.25], gain_fast:[0.30,0.50,0.20]
    };
    var ACTIVITY_OPTS = [
        {label:'Sedentary (little/no exercise)', value:'sedentary'},
        {label:'Light (1-3 days/week)',          value:'light'},
        {label:'Moderate (3-5 days/week)',        value:'moderate'},
        {label:'Active (6-7 days/week)',          value:'active'},
        {label:'Very Active (twice/day)',         value:'very_active'}
    ];
    var GOAL_OPTS = [
        {label:'Lose weight fast (–25%)',  value:'lose_fast'},
        {label:'Lose weight slow (–15%)',  value:'lose_slow'},
        {label:'Maintain weight',           value:'maintain'},
        {label:'Gain muscle slow (+10%)',  value:'gain_slow'},
        {label:'Gain muscle fast (+20%)',  value:'gain_fast'}
    ];

    function calcMacros(gender, age, weightKg, heightCm, activity, goal) {
        var bmr = gender === 'female'
            ? 10*weightKg + 6.25*heightCm - 5*age - 161
            : 10*weightKg + 6.25*heightCm - 5*age + 5;
        var tdee     = bmr * (ACTIVITY_MULT[activity] || 1.55);
        var calories = Math.round(tdee * (GOAL_MULT[goal] || 1));
        var ratio    = MACRO_RATIOS[goal] || MACRO_RATIOS['maintain'];
        return {
            calories: calories,
            protein:  Math.round((calories * ratio[0]) / 4),
            carbs:    Math.round((calories * ratio[1]) / 4),
            fat:      Math.round((calories * ratio[2]) / 9),
            bmr:      Math.round(bmr),
            tdee:     Math.round(tdee)
        };
    }

    function buildDonut(r, protClr, carbClr, fatClr) {
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox','0 0 100 100');
        svg.className = 'bkbg-mcr-donut-svg';
        svg.style.cssText = 'width:110px;height:110px;display:block';

        var total = r.protein*4 + r.carbs*4 + r.fat*9;
        var p1 = total > 0 ? r.protein*4/total : 0.33;
        var p2 = total > 0 ? r.carbs*4/total   : 0.34;

        function makeArc(pct, offset, color) {
            var c  = 2 * Math.PI * 40;
            var sd = c * (1 - pct);
            var el = document.createElementNS(ns, 'circle');
            el.setAttribute('cx','50'); el.setAttribute('cy','50'); el.setAttribute('r','40');
            el.setAttribute('fill','none'); el.setAttribute('stroke', color); el.setAttribute('stroke-width','18');
            el.setAttribute('stroke-dasharray', c); el.setAttribute('stroke-dashoffset', sd);
            el.setAttribute('transform','rotate('+(offset*360-90)+' 50 50)');
            return el;
        }
        svg.appendChild(makeArc(p1, 0,       protClr));
        svg.appendChild(makeArc(p2, p1,      carbClr));
        svg.appendChild(makeArc(1-p1-p2, p1+p2, fatClr));

        var tVal = document.createElementNS(ns,'text');
        tVal.setAttribute('x','50'); tVal.setAttribute('y','48'); tVal.setAttribute('text-anchor','middle');
        tVal.setAttribute('font-size','12'); tVal.setAttribute('fill','#374151'); tVal.setAttribute('font-weight','700');
        tVal.textContent = r.calories;
        var tLbl = document.createElementNS(ns,'text');
        tLbl.setAttribute('x','50'); tLbl.setAttribute('y','60'); tLbl.setAttribute('text-anchor','middle');
        tLbl.setAttribute('font-size','7'); tLbl.setAttribute('fill','#6b7280');
        tLbl.textContent = 'kcal/day';
        svg.appendChild(tVal); svg.appendChild(tLbl);
        return svg;
    }

    function initMacro(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        var accent       = opts.accentColor  || '#6c3fb5';
        var cardBg       = opts.cardBg       || '#ffffff';
        var calorieBg    = opts.calorieBg    || accent;
        var calorieColor = opts.calorieColor || '#ffffff';
        var protClr      = opts.proteinColor || '#3b82f6';
        var carbClr      = opts.carbColor    || '#f59e0b';
        var fatClr       = opts.fatColor     || '#ef4444';
        var statBg       = opts.statBg       || '#f3f4f6';
        var statBorder   = opts.statBorder   || '#e5e7eb';
        var inputBorder  = opts.inputBorder  || '#e5e7eb';
        var labelColor   = opts.labelColor   || '#374151';
        var sectionBg    = opts.sectionBg    || '';

        var cardRadius   = (opts.cardRadius  || 16) + 'px';
        var inputRadius  = (opts.inputRadius || 8)  + 'px';
        var maxWidth     = (opts.maxWidth    || 580) + 'px';
        var calorieSize  = (opts.calorieSize || 52)  + 'px';
        var titleSize    = (opts.titleSize   || 28)  + 'px';
        var paddingTop    = (opts.paddingTop    != null ? opts.paddingTop    : 60) + 'px';
        var paddingBottom = (opts.paddingBottom != null ? opts.paddingBottom : 60) + 'px';

        var showPieChart  = opts.showPieChart !== false;

        app.style.setProperty('--bkbg-mcr-accent', accent);
        typoCssVarsForEl(app, opts.titleTypo, '--bkbg-mcr-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bkbg-mcr-st-');
        app.style.paddingTop    = paddingTop;
        app.style.paddingBottom = paddingBottom;
        if (sectionBg) app.style.background = sectionBg;

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mcr-wrap';
        wrap.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + ';max-width:' + maxWidth;
        app.appendChild(wrap);

        // Header
        if ((opts.showTitle && opts.title) || (opts.showSubtitle && opts.subtitle)) {
            var hdr = document.createElement('div'); hdr.className = 'bkbg-mcr-header';
            if (opts.showTitle && opts.title) {
                var t = document.createElement('div'); t.className = 'bkbg-mcr-title';
                if (opts.titleColor) t.style.color = opts.titleColor;
                t.textContent = opts.title; hdr.appendChild(t);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var s = document.createElement('div'); s.className = 'bkbg-mcr-subtitle';
                if (opts.subtitleColor) s.style.color = opts.subtitleColor;
                s.textContent = opts.subtitle; hdr.appendChild(s);
            }
            wrap.appendChild(hdr);
        }

        // State
        var state = {
            unit:     opts.defaultUnit     || 'metric',
            gender:   opts.defaultGender   || 'male',
            age:      opts.defaultAge      || 30,
            weight:   opts.defaultWeight   || 75,
            height:   opts.defaultHeight   || 175,
            activity: opts.defaultActivity || 'moderate',
            goal:     opts.defaultGoal     || 'maintain'
        };

        function inputStyle() { return 'border:1.5px solid '+inputBorder+';border-radius:'+inputRadius; }
        function makeLabel(text) {
            var l = document.createElement('label');
            l.className = 'bkbg-mcr-label'; l.style.color = labelColor;
            l.textContent = text; return l;
        }

        // Unit toggle row
        var toggleRow = document.createElement('div'); toggleRow.className = 'bkbg-mcr-toggle-row';

        function makeToggle(options, current, onChange, labelText) {
            var grp = document.createElement('div'); grp.className = 'bkbg-mcr-toggle-group';
            var lbl = makeLabel(labelText); grp.appendChild(lbl);
            var btns = document.createElement('div');
            btns.className = 'bkbg-mcr-toggle-btns';
            btns.style.cssText = 'border:1.5px solid '+inputBorder+';border-radius:8px;overflow:hidden';
            var btnEls = [];
            options.forEach(function(o) {
                var b = document.createElement('button');
                b.className = 'bkbg-mcr-toggle-btn'; b.dataset.val = o.value;
                b.textContent = o.label;
                b.style.cssText = 'background:' + (current===o.value?accent:'#fff') + ';color:' + (current===o.value?'#fff':'#374151');
                b.addEventListener('click', function() {
                    current = o.value;
                    btnEls.forEach(function(be) {
                        be.style.background = be.dataset.val===current ? accent : '#fff';
                        be.style.color = be.dataset.val===current ? '#fff' : '#374151';
                    });
                    onChange(o.value);
                    refresh();
                });
                btnEls.push(b); btns.appendChild(b);
            });
            grp.appendChild(btns); return grp;
        }

        var unitToggle = makeToggle([{label:'Metric',value:'metric'},{label:'Imperial',value:'imperial'}], state.unit, function(v){ state.unit=v; updateLabels(); }, 'Unit');
        var genderToggle = makeToggle([{label:'Male',value:'male'},{label:'Female',value:'female'}], state.gender, function(v){ state.gender=v; }, 'Gender');
        toggleRow.appendChild(unitToggle); toggleRow.appendChild(genderToggle);
        wrap.appendChild(toggleRow);

        // Age / Weight / Height grid
        var grid3 = document.createElement('div'); grid3.className = 'bkbg-mcr-grid-3';

        function makeNumberField(labelText, val, min, onChange) {
            var field = document.createElement('div');
            var lbl = makeLabel(labelText); field.appendChild(lbl);
            var inp = document.createElement('input');
            inp.type = 'number'; inp.value = val; inp.min = min;
            inp.className = 'bkbg-mcr-input'; inp.style.cssText = inputStyle();
            inp.addEventListener('input', function() { onChange(parseFloat(inp.value) || 0); refresh(); });
            field.appendChild(inp); return { field:field, inp:inp };
        }

        var ageF    = makeNumberField('Age',    state.age,    10, function(v){state.age=v;});
        var weightF = makeNumberField('Weight (kg)', state.weight, 30, function(v){state.weight=v;});
        var heightF = makeNumberField('Height (cm)', state.height, 50, function(v){state.height=v;});

        function updateLabels() {
            weightF.inp.previousSibling.textContent = state.unit==='imperial' ? 'Weight (lbs)' : 'Weight (kg)';
            heightF.inp.previousSibling.textContent = state.unit==='imperial' ? 'Height (in)'  : 'Height (cm)';
        }

        grid3.appendChild(ageF.field); grid3.appendChild(weightF.field); grid3.appendChild(heightF.field);
        wrap.appendChild(grid3);

        // Activity + Goal selects
        var grid2 = document.createElement('div'); grid2.className = 'bkbg-mcr-grid-2';
        function makeSelect(labelText, options, val, onChange) {
            var field = document.createElement('div');
            var lbl = makeLabel(labelText); field.appendChild(lbl);
            var sel = document.createElement('select');
            sel.className = 'bkbg-mcr-select'; sel.style.cssText = inputStyle();
            options.forEach(function(o) { var op=document.createElement('option'); op.value=o.value; op.textContent=o.label; if(o.value===val) op.selected=true; sel.appendChild(op); });
            sel.addEventListener('change', function() { onChange(sel.value); refresh(); });
            field.appendChild(sel); return field;
        }
        grid2.appendChild(makeSelect('Activity Level', ACTIVITY_OPTS, state.activity, function(v){state.activity=v;}));
        grid2.appendChild(makeSelect('Goal', GOAL_OPTS, state.goal, function(v){state.goal=v;}));
        wrap.appendChild(grid2);

        // Calorie result card
        var calorieCard = document.createElement('div'); calorieCard.className = 'bkbg-mcr-calorie-card';
        calorieCard.style.cssText = 'background:' + calorieBg + ';color:' + calorieColor;
        var cLbl = document.createElement('div'); cLbl.className = 'bkbg-mcr-calorie-lbl'; cLbl.textContent = 'Daily Calories';
        var cVal = document.createElement('div'); cVal.className = 'bkbg-mcr-calorie-val'; cVal.style.fontSize = calorieSize;
        var cSub = document.createElement('div'); cSub.className = 'bkbg-mcr-calorie-sub';
        calorieCard.appendChild(cLbl); calorieCard.appendChild(cVal); calorieCard.appendChild(cSub);
        wrap.appendChild(calorieCard);

        // Macros row
        var macrosRow = document.createElement('div'); macrosRow.className = 'bkbg-mcr-macros-row';

        var donutWrap;
        if (showPieChart) { donutWrap = document.createElement('div'); donutWrap.className = 'bkbg-mcr-donut'; macrosRow.appendChild(donutWrap); }

        var macroList = document.createElement('div'); macroList.className = 'bkbg-mcr-macro-list';
        var macroItems = [
            {key:'protein', label:'Protein',       unit:'g', note:'(4 kcal/g)', color:protClr},
            {key:'carbs',   label:'Carbohydrates', unit:'g', note:'(4 kcal/g)', color:carbClr},
            {key:'fat',     label:'Fat',           unit:'g', note:'(9 kcal/g)', color:fatClr}
        ];
        var macroValEls = {};
        macroItems.forEach(function(m) {
            var item = document.createElement('div'); item.className = 'bkbg-mcr-macro-item';
            item.style.cssText = 'background:' + statBg + ';border:1px solid ' + statBorder;
            var left = document.createElement('div'); left.className = 'bkbg-mcr-macro-left';
            var dot  = document.createElement('div'); dot.className  = 'bkbg-mcr-macro-dot'; dot.style.background = m.color;
            var name = document.createElement('span'); name.className = 'bkbg-mcr-macro-name'; name.style.color = labelColor; name.textContent = m.label;
            var note = document.createElement('span'); note.className = 'bkbg-mcr-macro-note'; note.textContent = m.note;
            left.appendChild(dot); left.appendChild(name); left.appendChild(note);
            var val = document.createElement('span'); val.className = 'bkbg-mcr-macro-val'; val.style.color = m.color;
            macroValEls[m.key] = val;
            item.appendChild(left); item.appendChild(val); macroList.appendChild(item);
        });
        macrosRow.appendChild(macroList);
        wrap.appendChild(macrosRow);

        // BMR / TDEE stats
        var statRow = document.createElement('div'); statRow.className = 'bkbg-mcr-stat-row';
        var bmrStat  = document.createElement('div'); bmrStat.className  = 'bkbg-mcr-stat'; bmrStat.style.cssText = 'background:'+statBg+';border:1px solid '+statBorder;
        var tdeeStat = document.createElement('div'); tdeeStat.className = 'bkbg-mcr-stat'; tdeeStat.style.cssText = 'background:'+statBg+';border:1px solid '+statBorder;
        var bmrV = document.createElement('div'); bmrV.className = 'bkbg-mcr-stat-val'; bmrV.style.color = '#111827';
        var bmrL = document.createElement('div'); bmrL.className = 'bkbg-mcr-stat-lbl'; bmrL.style.color = '#6b7280'; bmrL.textContent = 'BMR (base metabolic rate)';
        var tdeeV = document.createElement('div'); tdeeV.className = 'bkbg-mcr-stat-val'; tdeeV.style.color = '#111827';
        var tdeeL = document.createElement('div'); tdeeL.className = 'bkbg-mcr-stat-lbl'; tdeeL.style.color = '#6b7280'; tdeeL.textContent = 'TDEE (maintenance calories)';
        bmrStat.appendChild(bmrV); bmrStat.appendChild(bmrL);
        tdeeStat.appendChild(tdeeV); tdeeStat.appendChild(tdeeL);
        statRow.appendChild(bmrStat); statRow.appendChild(tdeeStat);
        wrap.appendChild(statRow);

        function refresh() {
            var weightKg = state.unit === 'imperial' ? state.weight * 0.453592 : state.weight;
            var heightCm = state.unit === 'imperial' ? state.height * 2.54     : state.height;
            var r = calcMacros(state.gender, state.age, weightKg, heightCm, state.activity, state.goal);

            cVal.textContent = r.calories;
            cSub.textContent = 'BMR: ' + r.bmr + ' · TDEE: ' + r.tdee + ' kcal';
            macroValEls.protein.textContent = r.protein + 'g';
            macroValEls.carbs.textContent   = r.carbs   + 'g';
            macroValEls.fat.textContent     = r.fat     + 'g';
            bmrV.textContent  = r.bmr;
            tdeeV.textContent = r.tdee;

            if (showPieChart && donutWrap) {
                donutWrap.innerHTML = '';
                donutWrap.appendChild(buildDonut(r, protClr, carbClr, fatClr));
            }
        }

        refresh();
    }

    document.querySelectorAll('.bkbg-mcr-app').forEach(initMacro);
})();
