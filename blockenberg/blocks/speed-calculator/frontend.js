(function () {
    'use strict';

    var _typoKeys = [['family','font-family'],['weight','font-weight'],['style','font-style'],['decoration','text-decoration'],['transform','text-transform'],['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],['sizeUnit','*unit'],['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        var unit = obj.sizeUnit || 'px';
        for (var i = 0; i < _typoKeys.length; i++) {
            var k = _typoKeys[i][0], p = _typoKeys[i][1];
            if (p === '*unit' || obj[k] == null || obj[k] === '') continue;
            var v = obj[k];
            if (p === 'font-size-d' || p === 'font-size-t' || p === 'font-size-m') v = v + unit;
            el.style.setProperty(prefix + p, '' + v);
        }
    }

    // ── Unit conversion tables ──────────────────────────────────────────────
    var DIST_TO_M = {
        'm':              1,
        'km':             1000,
        'miles':          1609.344,
        'feet':           0.3048,
        'nautical miles': 1852
    };

    var TIME_TO_S = {
        'seconds': 1,
        'minutes': 60,
        'hours':   3600,
        'days':    86400
    };

    var MPS_TO_SPEED = {
        'm/s':   1,
        'km/h':  3.6,
        'mph':   2.23694,
        'knots': 1.94384
    };

    var SPEED_UNITS = ['km/h', 'mph', 'm/s', 'knots'];
    var DIST_UNITS  = ['km', 'miles', 'm', 'feet', 'nautical miles'];
    var TIME_UNITS  = ['seconds', 'minutes', 'hours', 'days'];

    var REAL_WORLD = [
        { label:'Walking pace',         speed:'5 km/h',   dist:'',        time:''    },
        { label:'City cycling',         speed:'20 km/h',  dist:'',        time:''    },
        { label:'Highway car',          speed:'110 km/h', dist:'',        time:''    },
        { label:'Commercial aircraft',  speed:'900 km/h', dist:'',        time:''    },
        { label:'Speed of sound',       speed:'1235 km/h',dist:'',        time:''    },
        { label:'Earth orbit speed',    speed:'28000 km/h',dist:'',       time:''    }
    ];

    // ── Helper: format number neatly ────────────────────────────────────────
    function fmt(n) {
        if (!isFinite(n)) return '—';
        if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
        if (Math.abs(n) >= 1)    return parseFloat(n.toFixed(4)).toString();
        return parseFloat(n.toFixed(6)).toString();
    }

    // ── Helper: format seconds as human readable duration ──────────────────
    function fmtDuration(secs) {
        if (!isFinite(secs) || secs < 0) return '—';
        var d = Math.floor(secs / 86400);
        var h = Math.floor((secs % 86400) / 3600);
        var m = Math.floor((secs % 3600) / 60);
        var s = secs % 60;
        var parts = [];
        if (d > 0) parts.push(d + 'd');
        if (h > 0) parts.push(h + 'h');
        if (m > 0) parts.push(m + 'min');
        if (s > 0 || parts.length === 0) parts.push(parseFloat(s.toFixed(2)) + 's');
        return parts.join(' ');
    }

    // ── Helper: create DOM element ──────────────────────────────────────────
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'style') {
                    Object.assign(node.style, attrs[k]);
                } else if (k === 'class') {
                    node.className = attrs[k];
                } else {
                    node.setAttribute(k, attrs[k]);
                }
            });
        }
        if (children) {
            if (typeof children === 'string') {
                node.textContent = children;
            } else if (Array.isArray(children)) {
                children.forEach(function (c) { if (c) node.appendChild(c); });
            } else {
                node.appendChild(children);
            }
        }
        return node;
    }

    function text(str) { return document.createTextNode(str); }

    function makeSelect(options, selected) {
        var sel = document.createElement('select');
        sel.className = 'bkbg-spd-unit-select';
        options.forEach(function (opt) {
            var o = document.createElement('option');
            o.value = opt; o.textContent = opt;
            if (opt === selected) o.selected = true;
            sel.appendChild(o);
        });
        return sel;
    }

    function makeInput(placeholder, value) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.className = 'bkbg-spd-input';
        inp.placeholder = placeholder || 'Enter value…';
        inp.min = '0';
        inp.step = 'any';
        if (value !== undefined && value !== '') inp.value = value;
        return inp;
    }

    // ── Build block ─────────────────────────────────────────────────────────
    function buildBlock(root) {
        var o;
        try { o = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        // CSS variables
        root.style.setProperty('--spd-accent',       o.accentColor   || '#3b82f6');
        root.style.setProperty('--spd-speed-color',  o.speedColor    || '#8b5cf6');
        root.style.setProperty('--spd-dist-color',   o.distColor     || '#0ea5e9');
        root.style.setProperty('--spd-time-color',   o.timeColor     || '#22c55e');
        root.style.setProperty('--spd-title-color',  o.titleColor    || '#111827');
        root.style.setProperty('--spd-subtitle-color',o.subtitleColor|| '#6b7280');
        root.style.setProperty('--spd-label-color',  o.labelColor    || '#374151');
        root.style.setProperty('--spd-max-width',    (o.contentMaxWidth || 680) + 'px');
        root.style.setProperty('--spd-card-bg',      o.cardBg        || '#ffffff');
        root.style.setProperty('--spd-input-bg',     o.inputBg       || '#f8fafc');
        root.style.setProperty('--spd-result-bg',    o.resultBg      || '#dbeafe');
        typoCssVarsForEl(root, o.titleTypo, '--bkspd-tt-');
        typoCssVarsForEl(root, o.subtitleTypo, '--bkspd-st-');

        // State
        var solveFor  = o.defaultSolveFor  || 'speed';
        var speedUnit = o.defaultSpeedUnit || 'km/h';
        var distUnit  = o.defaultDistUnit  || 'km';
        var timeUnit  = o.defaultTimeUnit  || 'hours';

        var FIELDS = {
            speed: { label:'⚡ Speed',    color:o.speedColor||'#8b5cf6', units:SPEED_UNITS, getUnit:function(){ return speedUnit; }, setUnit:function(u){ speedUnit=u; } },
            dist:  { label:'📏 Distance', color:o.distColor ||'#0ea5e9', units:DIST_UNITS,  getUnit:function(){ return distUnit;  }, setUnit:function(u){ distUnit=u;  } },
            time:  { label:'⏱️ Time',    color:o.timeColor ||'#22c55e', units:TIME_UNITS,  getUnit:function(){ return timeUnit;  }, setUnit:function(u){ timeUnit=u;  } }
        };

        // Wrap
        var wrap = el('div', { class:'bkbg-spd-wrap', style:{ background: o.sectionBg || '#eff6ff' } });
        root.appendChild(wrap);

        // Title + subtitle
        if (o.title) {
            var titleEl = el('h3', { class:'bkbg-spd-title' }, o.title);
            wrap.appendChild(titleEl);
        }
        if (o.subtitle) {
            var sub = el('p', { class:'bkbg-spd-subtitle' }, o.subtitle);
            wrap.appendChild(sub);
        }

        // Solve-for tabs
        wrap.appendChild(el('div', { class:'bkbg-spd-tab-label' }, 'Solve for…'));
        var tabsRow = el('div', { class:'bkbg-spd-tabs' });
        wrap.appendChild(tabsRow);

        var tabBtns = {};
        ['speed','dist','time'].forEach(function (key) {
            var f = FIELDS[key];
            var btn = el('button', { class:'bkbg-spd-tab' + (key === solveFor ? ' active' : '') }, f.label);
            tabBtns[key] = btn;
            tabsRow.appendChild(btn);
        });

        // Input fields
        var inputsGrid = el('div', { class:'bkbg-spd-inputs' });
        wrap.appendChild(inputsGrid);

        var inputEls  = {};   // key → input element
        var selectEls = {};   // key → select element
        var fieldDivs = {};   // key → field wrapper div

        ['speed','dist','time'].forEach(function (key) {
            var f = FIELDS[key];
            var isRes = key === solveFor;

            var fieldDiv = el('div', {
                class: 'bkbg-spd-field' + (isRes ? ' is-result' : ''),
                style: { background: isRes ? '' : (o.cardBg||'#fff') }
            });
            fieldDivs[key] = fieldDiv;

            var lbl = el('div', { class:'bkbg-spd-field-label', style:{ color: f.color } },
                f.label + (isRes ? ' (Result)' : ''));
            fieldDiv.appendChild(lbl);

            var inp = makeInput('Enter value…');
            inp.disabled = isRes;
            if (isRes) { inp.value = ''; inp.placeholder = '—'; }
            inputEls[key] = inp;
            fieldDiv.appendChild(inp);

            var sel = makeSelect(f.units, f.getUnit());
            selectEls[key] = sel;
            fieldDiv.appendChild(sel);

            inputsGrid.appendChild(fieldDiv);
        });

        // Calculate button
        var calcBtn = el('button', { class:'bkbg-spd-calc-btn' }, '⚡ Calculate');
        wrap.appendChild(calcBtn);

        // Result zone (conversions + formula)
        var resultZone = el('div', {});
        wrap.appendChild(resultZone);

        // ── Core calculation ──
        function solve() {
            resultZone.innerHTML = '';

            var speedVal = parseFloat(inputEls.speed.value);
            var distVal  = parseFloat(inputEls.dist.value);
            var timeVal  = parseFloat(inputEls.time.value);

            // Convert inputs to SI base units
            var speedMPS = speedVal * (1 / (MPS_TO_SPEED[speedUnit] || 1));
            var distM    = distVal  * (DIST_TO_M[distUnit] || 1);
            var timeS    = timeVal  * (TIME_TO_S[timeUnit] || 1);

            var resultStr = '—';
            var resultUnit = '';

            if (solveFor === 'speed') {
                var mps = distM / timeS;
                var out = mps * (MPS_TO_SPEED[speedUnit] || 1);
                inputEls.speed.value = isFinite(out) ? fmt(out) : '';
                inputEls.speed.placeholder = isFinite(out) ? '' : 'Need valid inputs';
                resultStr = isFinite(out) ? fmt(out) + ' ' + speedUnit : '—';
                resultUnit = 'speed';

                if (isFinite(mps) && o.showUnitConversions) {
                    appendConversions(resultZone, 'Speed', o.speedColor||'#8b5cf6', SPEED_UNITS, function(u){
                        return fmt(mps * (MPS_TO_SPEED[u]||1)) + ' ' + u;
                    });
                }
            } else if (solveFor === 'dist') {
                var dm   = speedMPS * timeS;
                var outD = dm / (DIST_TO_M[distUnit] || 1);
                inputEls.dist.value = isFinite(outD) ? fmt(outD) : '';
                inputEls.dist.placeholder = isFinite(outD) ? '' : 'Need valid inputs';
                resultStr = isFinite(outD) ? fmt(outD) + ' ' + distUnit : '—';
                resultUnit = 'dist';

                if (isFinite(dm) && o.showUnitConversions) {
                    appendConversions(resultZone, 'Distance', o.distColor||'#0ea5e9', DIST_UNITS, function(u){
                        return fmt(dm / (DIST_TO_M[u]||1)) + ' ' + u;
                    });
                }
            } else {
                var ts  = distM / speedMPS;
                var outT = ts / (TIME_TO_S[timeUnit] || 1);
                inputEls.time.value = isFinite(outT) ? fmt(outT) : '';
                inputEls.time.placeholder = isFinite(outT) ? '' : 'Need valid inputs';
                resultStr = isFinite(ts) ? fmtDuration(ts) : '—';
                resultUnit = 'time';

                if (isFinite(ts) && o.showUnitConversions) {
                    appendConversions(resultZone, 'Time', o.timeColor||'#22c55e', TIME_UNITS, function(u){
                        return fmt(ts / (TIME_TO_S[u]||1)) + ' ' + u;
                    });
                }
            }

            if (o.showFormula) appendFormula(resultZone);
            if (o.showExamples) appendExamples(resultZone);
        }

        function appendConversions(zone, heading, color, units, fmtFn) {
            var conv = el('div', { class:'bkbg-spd-conversions', style:{ background: o.cardBg||'#fff' } });
            var h    = el('div', { class:'bkbg-spd-conv-heading' }, '🔁 ' + heading + ' in all units');
            conv.appendChild(h);

            var grid = el('div', { class:'bkbg-spd-conv-grid' });
            units.forEach(function (u) {
                var item  = el('div', { class:'bkbg-spd-conv-item' });
                var uLbl  = el('div', { class:'bkbg-spd-conv-unit' }, u);
                var uVal  = el('div', { class:'bkbg-spd-conv-val', style:{ color: color } }, fmtFn(u));
                item.appendChild(uLbl);
                item.appendChild(uVal);
                grid.appendChild(item);
            });
            conv.appendChild(grid);
            zone.appendChild(conv);
        }

        function appendFormula(zone) {
            var box = el('div', { class:'bkbg-spd-formula', style:{ background: o.cardBg||'#fff' } });
            [
                { label:'⚡ Speed = Distance ÷ Time', color: o.speedColor||'#8b5cf6' },
                { label:'📏 Distance = Speed × Time', color: o.distColor ||'#0ea5e9' },
                { label:'⏱️ Time = Distance ÷ Speed', color: o.timeColor ||'#22c55e' }
            ].forEach(function (f) {
                box.appendChild(el('span', { class:'bkbg-spd-formula-item', style:{ color: f.color } }, f.label));
            });
            zone.appendChild(box);
        }

        function appendExamples(zone) {
            var box = el('div', { class:'bkbg-spd-examples', style:{ background: o.cardBg||'#fff' } });
            box.appendChild(el('div', { class:'bkbg-spd-examples-heading' }, '🌍 Real-world speeds'));
            REAL_WORLD.forEach(function (ex) {
                var row = el('div', { class:'bkbg-spd-example-row' });
                row.appendChild(text(ex.label));
                row.appendChild(el('strong', { style:{ color: o.accentColor||'#3b82f6' } }, ex.speed));
                box.appendChild(row);
            });
            zone.appendChild(box);
        }

        // ── Apply solve-for mode ──
        function applySolveFor(key) {
            solveFor = key;

            // Update tab buttons
            ['speed','dist','time'].forEach(function (k) {
                tabBtns[k].className = 'bkbg-spd-tab' + (k === key ? ' active' : '');
            });

            // Update field classes + input disabled state + label
            var f = FIELDS[key];
            ['speed','dist','time'].forEach(function (k) {
                var isRes = k === key;
                var fd   = fieldDivs[k];
                fd.className = 'bkbg-spd-field' + (isRes ? ' is-result' : '');
                fd.style.background = isRes ? '' : (o.cardBg||'#fff');
                inputEls[k].disabled = isRes;
                if (isRes) { inputEls[k].value = ''; inputEls[k].placeholder = '—'; }
                // Update label text
                fd.querySelector('.bkbg-spd-field-label').textContent = FIELDS[k].label + (isRes ? ' (Result)' : '');
            });

            resultZone.innerHTML = '';
            if (o.showFormula)   appendFormula(resultZone);
            if (o.showExamples)  appendExamples(resultZone);
        }

        // ── Wire events ──
        ['speed','dist','time'].forEach(function (key) {
            tabBtns[key].addEventListener('click', function () { applySolveFor(key); });

            selectEls[key].addEventListener('change', function () {
                FIELDS[key].setUnit(selectEls[key].value);
                if (key === 'speed') speedUnit = selectEls[key].value;
                if (key === 'dist')  distUnit  = selectEls[key].value;
                if (key === 'time')  timeUnit  = selectEls[key].value;
            });

            inputEls[key].addEventListener('input', function () {
                // auto-calculate only when 2 non-result inputs are filled
                var keys = ['speed','dist','time'].filter(function(k){ return k !== solveFor; });
                var bothFilled = keys.every(function(k){ return inputEls[k].value.trim() !== '' && !isNaN(parseFloat(inputEls[k].value)); });
                if (bothFilled) solve();
            });
        });

        calcBtn.addEventListener('click', solve);

        // ── Initial state ──
        if (o.showFormula)  appendFormula(resultZone);
        if (o.showExamples) appendExamples(resultZone);
    }

    // ── Init all blocks on page ─────────────────────────────────────────────
    document.querySelectorAll('.bkbg-spd-app').forEach(buildBlock);

})();
