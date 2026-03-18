(function () {
    'use strict';

    var GRADE_SCALE = [
        {letter:'A+', min:97, dflt:'#059669'},
        {letter:'A',  min:93, dflt:'#10b981'},
        {letter:'A−', min:90, dflt:'#34d399'},
        {letter:'B+', min:87, dflt:'#2563eb'},
        {letter:'B',  min:83, dflt:'#3b82f6'},
        {letter:'B−', min:80, dflt:'#60a5fa'},
        {letter:'C+', min:77, dflt:'#d97706'},
        {letter:'C',  min:73, dflt:'#f59e0b'},
        {letter:'C−', min:70, dflt:'#fbbf24'},
        {letter:'D+', min:67, dflt:'#dc2626'},
        {letter:'D',  min:63, dflt:'#ef4444'},
        {letter:'D−', min:60, dflt:'#f87171'},
        {letter:'F',  min:0,  dflt:'#6b7280'}
    ];

    var GRADE_COLOR_KEYS = {
        'A+':'gradeAColor','A':'gradeAColor','A−':'gradeAColor',
        'B+':'gradeBColor','B':'gradeBColor','B−':'gradeBColor',
        'C+':'gradeCColor','C':'gradeCColor','C−':'gradeCColor',
        'D+':'gradeDColor','D':'gradeDColor','D−':'gradeDColor',
        'F':'gradeFColor'
    };

    function getLetter(pct, opts) {
        for (var i = 0; i < GRADE_SCALE.length; i++) {
            if (pct >= GRADE_SCALE[i].min) {
                var key = GRADE_COLOR_KEYS[GRADE_SCALE[i].letter];
                return {letter: GRADE_SCALE[i].letter, color: (opts[key] || GRADE_SCALE[i].dflt), dflt: GRADE_SCALE[i].dflt};
            }
        }
        return {letter: 'F', color: opts.gradeFColor || '#6b7280', dflt: '#6b7280'};
    }

    function calcAvg(subjects, mode) {
        if (!subjects.length) return 0;
        if (mode === 'simple') {
            var sum = 0, total = 0;
            subjects.forEach(function(s) {
                sum += parseFloat(s.score) || 0;
                total += parseFloat(s.max) || 100;
            });
            return total > 0 ? (sum / total) * 100 : 0;
        }
        var totalWeight = 0, weightedSum = 0;
        subjects.forEach(function(s) {
            var sc = parseFloat(s.score) || 0;
            var mx = parseFloat(s.max) || 100;
            var wt = parseFloat(s.weight) || 0;
            var pct = mx > 0 ? (sc / mx) * 100 : 0;
            weightedSum += pct * wt;
            totalWeight += wt;
        });
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    function setStyle(el, styles) {
        Object.keys(styles).forEach(function(k) { el.style[k] = styles[k]; });
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function makeEl(tag, attrs, children) {
        var el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function(k) {
                if (k === 'className') { el.className = attrs[k]; }
                else if (k === 'textContent') { el.textContent = attrs[k]; }
                else if (k === 'style' && typeof attrs[k] === 'object') { setStyle(el, attrs[k]); }
                else { el.setAttribute(k, attrs[k]); }
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function(c) {
                if (c == null) return;
                if (typeof c === 'string') { el.appendChild(document.createTextNode(c)); }
                else { el.appendChild(c); }
            });
        }
        return el;
    }

    function input(type, value, placeholder, onChange) {
        var el = document.createElement('input');
        el.type = type;
        el.value = value;
        el.className = 'bkbg-grc-input';
        if (placeholder) el.placeholder = placeholder;
        el.addEventListener('input', function() { onChange(el.value); });
        return el;
    }

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { return; }

        var accent    = opts.accentColor || '#6c3fb5';
        var cardBg    = opts.cardBg || '#fff';
        var resultBg  = opts.resultBg || accent;
        var resultClr = opts.resultColor || '#fff';
        var cardR     = (opts.cardRadius || 16) + 'px';
        var inpR      = (opts.inputRadius || 8) + 'px';
        var maxW      = (opts.maxWidth || 640) + 'px';
        var ptop      = (opts.paddingTop || 60) + 'px';
        var pbot      = (opts.paddingBottom || 60) + 'px';

        var subjects = [
            {id:1, name:'Math',    score:90, max:100, weight:30},
            {id:2, name:'English', score:85, max:100, weight:30},
            {id:3, name:'Science', score:78, max:100, weight:20},
            {id:4, name:'History', score:92, max:100, weight:20}
        ];
        var nextId = 10;

        app.style.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
        app.style.paddingTop = ptop;
        app.style.paddingBottom = pbot;
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        typoCssVarsForEl(opts.typoTitle,  '--bkbg-grc-tt-', app);
        typoCssVarsForEl(opts.typoResult, '--bkbg-grc-rs-', app);
        typoCssVarsForEl(opts.typoLetter, '--bkbg-grc-lt-', app);

        /* ── Card ── */
        var card = makeEl('div', {className:'bkbg-grc-card', style:{
            background: cardBg,
            borderRadius: cardR,
            padding: '32px',
            maxWidth: maxW,
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,.09)'
        }});

        /* ── Header ── */
        if (opts.showTitle && opts.title) {
            var titleEl = makeEl('div', {className:'bkbg-grc-title', style:{
                color: opts.titleColor || '#1e1b4b'
            }, textContent: opts.title});
            card.appendChild(titleEl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var subEl = makeEl('div', {className:'bkbg-grc-subtitle', style:{
                color: opts.subtitleColor || '#6b7280'
            }, textContent: opts.subtitle});
            card.appendChild(subEl);
        }

        /* ── Result card ── */
        var resultCard = makeEl('div', {className:'bkbg-grc-result-card', style:{
            background: resultBg,
            color: resultClr,
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '20px',
            flexWrap: 'wrap'
        }});

        var pctEl  = makeEl('div', {className:'bkbg-grc-result-pct'});
        var modeEl = makeEl('div', {className:'bkbg-grc-result-label', style:{fontSize:'14px',opacity:'0.8',marginTop:'4px'}});
        modeEl.textContent = opts.gradeMode === 'simple' ? 'Simple Average' : 'Weighted Average';
        var avgBlock = makeEl('div', {className:'bkbg-grc-result-avg'}, [pctEl, modeEl]);
        resultCard.appendChild(avgBlock);

        var letterEl;
        if (opts.showLetterGrade !== false) {
            var divider = makeEl('div', {className:'bkbg-grc-result-divider', style:{width:'1px',height:'60px',background:'rgba(255,255,255,.25)',flexShrink:'0'}});
            resultCard.appendChild(divider);
            letterEl = makeEl('div', {className:'bkbg-grc-result-letter'});
            var letterLabel = makeEl('div',{className:'bkbg-grc-result-letter-label',style:{fontSize:'13px',opacity:'0.8',marginTop:'4px'},textContent:'Letter Grade'});
            var letterBlock = makeEl('div',{className:'bkbg-grc-result-letter-block',style:{textAlign:'center'}},[letterEl,letterLabel]);
            resultCard.appendChild(letterBlock);
        }
        card.appendChild(resultCard);

        /* ── Subjects table ── */
        var tableWrap = makeEl('div', {className:'bkbg-grc-breakdown'});
        if (opts.showBreakdown !== false) {
            var tHead = makeEl('div',{className:'bkbg-grc-table-header',style:{
                display:'grid',
                gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',
                gap:'6px',
                padding:'6px 10px',
                marginBottom:'4px'
            }});
            ['Subject','Score','Max','Weight %',''].forEach(function(txt){
                tHead.appendChild(makeEl('div',{className:'bkbg-grc-table-header-cell',style:{fontSize:'12px',fontWeight:'600',color:opts.labelColor||'#374151'},textContent:txt}));
            });
            tableWrap.appendChild(tHead);
            card.appendChild(tableWrap);
        }

        /* ── Add Subject button ── */
        var addBtn = makeEl('button',{className:'bkbg-grc-add-btn',style:{
            marginTop:'8px',
            padding:'9px 18px',
            background:accent,
            color:'#fff',
            border:'none',
            borderRadius:inpR,
            fontWeight:'700',
            cursor:'pointer',
            fontSize:'14px'
        },textContent:'+ Add Subject'});

        /* ── Grade scale ── */
        var scaleSection = makeEl('div',{style:{display: opts.showGradeScale !== false ? 'block' : 'none'}});

        /* ── Render ── */
        function renderSubjects() {
            // Remove old rows (all except header)
            var rows = tableWrap.querySelectorAll('.bkbg-grc-subject-row');
            rows.forEach(function(r) { r.parentNode.removeChild(r); });

            subjects.forEach(function(s) {
                var spct = (parseFloat(s.max)||100) > 0 ? ((parseFloat(s.score)||0)/(parseFloat(s.max)||100))*100 : 0;
                var sg = getLetter(spct, opts);

                var row = makeEl('div',{className:'bkbg-grc-subject-row', style:{
                    display:'grid',
                    gridTemplateColumns:'2fr 1fr 1fr 1fr 80px',
                    gap:'6px',
                    alignItems:'center',
                    background:opts.rowBg||'#f9fafb',
                    border:'1px solid '+(opts.rowBorder||'#e5e7eb'),
                    borderRadius:'8px',
                    padding:'8px 10px',
                    marginBottom:'6px'
                }});

                var nameInp = input('text', s.name, 'Subject', function(v){ s.name=v; updateResult(); });
                nameInp.style.borderRadius = inpR;
                nameInp.style.borderColor = opts.inputBorder || '#e5e7eb';
                var scoreInp = input('number', s.score, '', function(v){ s.score=parseFloat(v)||0; renderSubjects(); updateResult(); });
                scoreInp.style.borderRadius = inpR;
                scoreInp.style.borderColor = opts.inputBorder || '#e5e7eb';
                var maxInp = input('number', s.max, '', function(v){ s.max=parseFloat(v)||100; renderSubjects(); updateResult(); });
                maxInp.style.borderRadius = inpR;
                maxInp.style.borderColor = opts.inputBorder || '#e5e7eb';
                var wInp = input('number', s.weight, '', function(v){ s.weight=parseFloat(v)||0; updateResult(); });
                wInp.style.borderRadius = inpR;
                wInp.style.borderColor = opts.inputBorder || '#e5e7eb';

                var badge = makeEl('span',{className:'bkbg-grc-grade-badge',style:{fontWeight:'700',fontSize:'13px',color:sg.color,minWidth:'28px',textAlign:'center'},textContent:sg.letter});
                var removeBtn = makeEl('button',{className:'bkbg-grc-remove-btn',textContent:'×'});
                removeBtn.addEventListener('click', function(){
                    subjects = subjects.filter(function(x){ return x.id !== s.id; });
                    renderSubjects();
                    updateResult();
                });

                var actions = makeEl('div',{style:{display:'flex',alignItems:'center',gap:'6px',justifyContent:'flex-end'}},[badge,removeBtn]);
                row.appendChild(nameInp);
                row.appendChild(scoreInp);
                row.appendChild(maxInp);
                row.appendChild(wInp);
                row.appendChild(actions);
                tableWrap.appendChild(row);
            });
        }

        function updateResult() {
            var avg = calcAvg(subjects, opts.gradeMode || 'weighted');
            pctEl.textContent = avg.toFixed(1) + '%';
            if (letterEl) {
                var info = getLetter(avg, opts);
                letterEl.textContent = info.letter;
            }
            renderScale();
        }

        /* ── Grade scale rendering ── */
        function renderScale() {
            scaleSection.innerHTML = '';
            if (opts.showGradeScale === false) return;
            var avg = calcAvg(subjects, opts.gradeMode || 'weighted');

            scaleSection.appendChild(makeEl('div',{className:'bkbg-grc-scale-title',style:{
                fontSize:'12px',fontWeight:'700',color:opts.labelColor||'#374151',
                textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'10px'
            },textContent:'Grade Scale'}));

            var grid = makeEl('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px'}});
            GRADE_SCALE.forEach(function(gs) {
                var key = GRADE_COLOR_KEYS[gs.letter];
                var clr = opts[key] || gs.dflt;
                var active = avg >= gs.min && (gs.min === 0 || avg < (GRADE_SCALE[GRADE_SCALE.indexOf(gs)-1]||{min:101}).min);
                var item = makeEl('div',{style:{
                    background: active ? clr+'22' : (opts.scaleBg||'#f3f4f6'),
                    border: '2px solid ' + clr,
                    borderRadius:'6px',
                    padding:'5px 10px',
                    textAlign:'center',
                    minWidth:'52px',
                    transition:'background .2s'
                }});
                item.appendChild(makeEl('div',{style:{fontWeight:'800',fontSize:'14px',color:clr},textContent:gs.letter}));
                item.appendChild(makeEl('div',{style:{fontSize:'11px',color:'#6b7280'},textContent:gs.min+'%+'}));
                grid.appendChild(item);
            });
            scaleSection.appendChild(grid);
        }

        addBtn.addEventListener('click', function(){
            nextId++;
            subjects.push({id:nextId, name:'', score:0, max:100, weight:0});
            renderSubjects();
            updateResult();
        });

        var scaleWrap = makeEl('div',{style:{
            marginTop:'20px',
            background: opts.scaleBg||'#f3f4f6',
            border:'1px solid '+(opts.scaleBorder||'#e5e7eb'),
            borderRadius:'10px',
            padding:'14px 16px'
        }});
        scaleWrap.appendChild(scaleSection);

        if (opts.showBreakdown !== false) {
            tableWrap.appendChild(addBtn);
        }
        card.appendChild(scaleWrap);
        app.appendChild(card);

        renderSubjects();
        updateResult();
    }

    document.querySelectorAll('.bkbg-grc-app').forEach(initApp);
})();
