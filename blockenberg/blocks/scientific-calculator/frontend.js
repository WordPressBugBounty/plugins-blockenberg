(function () {
    'use strict';

    var BTNS = [
        'MC','MR','MS','M+','M−',
        '2nd','π','e','C','⌫',
        'x²','xʸ','√x','ʸ√x','1/x',
        'sin','cos','tan','log','ln',
        'sin⁻¹','cos⁻¹','tan⁻¹','10ˣ','eˣ',
        '(',')', '%','÷','',
        '7','8','9','×','',
        '4','5','6','−','',
        '1','2','3','+','',
        '±','0','.','=',''
    ];

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { return; }

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

        var accent   = opts.accentColor   || '#6c3fb5';
        var cardBg   = opts.cardBg        || '#1a1a2e';
        var dispBg   = opts.displayBg     || '#0d0d1a';
        var dispClr  = opts.displayColor  || '#ffffff';
        var cardR    = (opts.cardRadius   || 20) + 'px';
        var btnR     = (opts.btnRadius    || 10) + 'px';
        var btnSz    = (opts.btnSize      || 15) + 'px';
        var dispSz   = (opts.displaySize  || 36) + 'px';
        var maxW     = (opts.maxWidth     || 420) + 'px';
        var ptop     = (opts.paddingTop   || 60) + 'px';
        var pbot     = (opts.paddingBottom|| 60) + 'px';
        var histMax  = opts.historyMax    || 10;
        var prec     = opts.precision     || 10;

        var display   = '0';
        var expr      = '';
        var memory    = 0;
        var angleMode = opts.angleMode || 'deg';
        var history   = [];

        app.style.paddingTop    = ptop;
        app.style.paddingBottom = pbot;
        if (opts.sectionBg) app.style.background = opts.sectionBg;
        typoCssVarsForEl(app, opts.titleTypo, '--bksc-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bksc-st-');

        /* Header */
        if (opts.showTitle && opts.title) {
            var hdr = document.createElement('div');
            hdr.className = 'bkbg-sc-header';
            var ttl = document.createElement('div');
            ttl.className = 'bkbg-sc-title';
            ttl.textContent = opts.title;
            if (opts.titleColor) ttl.style.color = opts.titleColor;
            hdr.appendChild(ttl);
            if (opts.showSubtitle && opts.subtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-sc-subtitle';
                sub.textContent = opts.subtitle;
                if (opts.subtitleColor) sub.style.color = opts.subtitleColor;
                hdr.appendChild(sub);
            }
            app.appendChild(hdr);
        }

        /* Calc body */
        var calc = document.createElement('div');
        calc.className = 'bkbg-sc-calc';
        Object.assign(calc.style, {background:cardBg, borderRadius:cardR, maxWidth:maxW});
        app.appendChild(calc);

        /* Top bar */
        var topbar = document.createElement('div');
        topbar.className = 'bkbg-sc-topbar';
        calc.appendChild(topbar);

        var angleToggle = document.createElement('div');
        angleToggle.className = 'bkbg-sc-angle-toggle';
        ['deg','rad'].forEach(function(m) {
            var b = document.createElement('button');
            b.className = 'bkbg-sc-angle-btn';
            b.textContent = m.toUpperCase();
            b.dataset.mode = m;
            b.addEventListener('click', function() {
                angleMode = m;
                angleToggle.querySelectorAll('.bkbg-sc-angle-btn').forEach(function(x){
                    var active = x.dataset.mode === angleMode;
                    x.style.background = active ? accent : 'rgba(255,255,255,.1)';
                    x.style.color      = active ? '#fff' : 'rgba(255,255,255,.5)';
                });
            });
            b.style.background = m === angleMode ? accent : 'rgba(255,255,255,.1)';
            b.style.color      = m === angleMode ? '#fff' : 'rgba(255,255,255,.5)';
            angleToggle.appendChild(b);
        });
        topbar.appendChild(angleToggle);

        var memEl = document.createElement('div');
        memEl.className = 'bkbg-sc-mem-indicator';
        if (opts.memColor) memEl.style.color = opts.memColor;
        if (opts.showMemory !== false) topbar.appendChild(memEl);

        /* Expression */
        var exprEl = document.createElement('div');
        exprEl.className = 'bkbg-sc-expr';
        calc.appendChild(exprEl);

        /* Display */
        var dispEl = document.createElement('div');
        dispEl.className = 'bkbg-sc-display';
        Object.assign(dispEl.style, {background:dispBg, color:dispClr, fontSize:dispSz});
        dispEl.textContent = '0';
        calc.appendChild(dispEl);

        /* Button grid */
        var grid = document.createElement('div');
        grid.className = 'bkbg-sc-grid';
        calc.appendChild(grid);

        /* History */
        var histEl, histList;
        if (opts.showHistory !== false) {
            histEl = document.createElement('div');
            histEl.className = 'bkbg-sc-history';
            histEl.style.display = 'none';
            if (opts.historyBg) histEl.style.background = opts.historyBg;
            var hLabel = document.createElement('div');
            hLabel.className = 'bkbg-sc-history-label';
            hLabel.textContent = 'History';
            histEl.appendChild(hLabel);
            histList = document.createElement('div');
            histEl.appendChild(histList);
            calc.appendChild(histEl);
        }

        /* State update functions */
        function updateDisplay() {
            dispEl.textContent = display;
            exprEl.textContent = expr || '\u00a0';
            if (opts.showMemory !== false) memEl.textContent = memory !== 0 ? 'M: ' + memory : '';
        }

        function addHistory(entry) {
            if (!histEl) return;
            history.unshift({expr:entry});
            if (history.length > histMax) history.pop();
            histList.innerHTML = '';
            history.forEach(function(h) {
                var row = document.createElement('div');
                row.className = 'bkbg-sc-history-entry';
                if (opts.historyColor) row.style.color = opts.historyColor;
                row.textContent = h.expr;
                row.addEventListener('click', function(){
                    var parts = h.expr.split('=');
                    if (parts.length > 1) { display = parts[parts.length-1]; updateDisplay(); }
                });
                histList.appendChild(row);
            });
            histEl.style.display = 'block';
        }

        function evaluateExpr(e) {
            try {
                var toRad = function(v){ return angleMode==='deg' ? v*Math.PI/180 : v; };
                var safe = e
                    .replace(/×/g,'*').replace(/÷/g,'/')
                    .replace(/−/g,'-').replace(/π/g,'('+Math.PI+')')
                    .replace(/\be\b/g,'('+Math.E+')');
                var r = Function('"use strict"; return (' + safe + ')')();
                if (!isFinite(r)) return 'Error';
                return (parseFloat(r.toPrecision(prec))).toString();
            } catch(err) { return 'Error'; }
        }

        function handleBtn(lbl) {
            if (lbl === '') return;
            var num = parseFloat(display) || 0;
            var toRad = function(v){ return angleMode==='deg' ? v*Math.PI/180 : v; };
            var fromRad = function(v){ return angleMode==='deg' ? v*180/Math.PI : v; };
            var p = function(v){ return (parseFloat(v.toPrecision(prec))+''); };

            if (lbl === 'C')  { display='0'; expr=''; updateDisplay(); return; }
            if (lbl === '⌫')  { display=display.length>1?display.slice(0,-1):'0'; updateDisplay(); return; }
            if (lbl === '±')  { display=display.startsWith('-')?display.slice(1):('-'+display); updateDisplay(); return; }
            if (lbl === 'π')  { display=p(Math.PI); updateDisplay(); return; }
            if (lbl === 'e')  { display=p(Math.E);  updateDisplay(); return; }
            if (lbl === '=')  {
                var full = expr + display;
                var res = evaluateExpr(full);
                if (opts.showHistory !== false) addHistory(full + ' = ' + res);
                expr=''; display=res; updateDisplay(); return;
            }
            if (lbl === 'MC') { memory=0; updateDisplay(); return; }
            if (lbl === 'MR') { display=memory.toString(); updateDisplay(); return; }
            if (lbl === 'MS') { memory=num; updateDisplay(); return; }
            if (lbl === 'M+') { memory+=num; updateDisplay(); return; }
            if (lbl === 'M−') { memory-=num; updateDisplay(); return; }
            if (lbl === '2nd') return; // shift handled visually

            var UNARY = {
                'x²':    function(v){ return p(v*v); },
                '√x':    function(v){ return p(Math.sqrt(v)); },
                '1/x':   function(v){ return p(1/v); },
                'sin':   function(v){ return p(Math.sin(toRad(v))); },
                'cos':   function(v){ return p(Math.cos(toRad(v))); },
                'tan':   function(v){ return p(Math.tan(toRad(v))); },
                'sin⁻¹': function(v){ return p(fromRad(Math.asin(v))); },
                'cos⁻¹': function(v){ return p(fromRad(Math.acos(v))); },
                'tan⁻¹': function(v){ return p(fromRad(Math.atan(v))); },
                'log':   function(v){ return p(Math.log10(v)); },
                'ln':    function(v){ return p(Math.log(v)); },
                '10ˣ':   function(v){ return p(Math.pow(10,v)); },
                'eˣ':    function(v){ return p(Math.exp(v)); },
                '%':     function(v){ return p(v/100); }
            };
            if (UNARY[lbl]) { display=UNARY[lbl](num); updateDisplay(); return; }

            var OPS = ['+','−','×','÷','xʸ','ʸ√x'];
            if (OPS.includes(lbl)) { expr=expr+display+lbl; display='0'; updateDisplay(); return; }
            if (lbl==='('||lbl===')') { expr+=lbl; updateDisplay(); return; }

            // Digits and decimal
            if (display==='0'||display==='Error') { display=lbl; }
            else { if (lbl==='.'&&display.includes('.')) return; display+=lbl; }
            updateDisplay();
        }

        /* Create buttons */
        function getBtnClass(lbl) {
            if (lbl==='=')                                    return 'bkbg-sc-btn bkbg-sc-btn-eq';
            if (lbl==='C'||lbl==='⌫')                        return 'bkbg-sc-btn bkbg-sc-btn-clear';
            if (['MC','MR','MS','M+','M−'].includes(lbl))    return 'bkbg-sc-btn bkbg-sc-btn-mem';
            if (['+','−','×','÷','%','xʸ','ʸ√x','(',')'].includes(lbl)) return 'bkbg-sc-btn bkbg-sc-btn-op';
            if (['0','1','2','3','4','5','6','7','8','9','.','±'].includes(lbl)) return 'bkbg-sc-btn bkbg-sc-btn-num';
            return 'bkbg-sc-btn bkbg-sc-btn-fn';
        }
        function getBtnStyle(lbl) {
            var s = {fontSize:btnSz, borderRadius:btnR};
            if (lbl==='=')                                    { s.background=opts.btnEqBg||accent; s.color=opts.btnEqColor||'#fff'; }
            else if (lbl==='C'||lbl==='⌫')                   { s.background=opts.btnClearBg||'#7f1d1d'; s.color=opts.btnClearColor||'#fecaca'; }
            else if (['MC','MR','MS','M+','M−'].includes(lbl)){ s.background=opts.btnFnBg||'#1e2a4a'; s.color=opts.memColor||'#86efac'; }
            else if (['+','−','×','÷','%','xʸ','ʸ√x','(',')'].includes(lbl)){ s.background=opts.btnOpBg||'#3d2d6a'; s.color=opts.btnOpColor||'#c4b5fd'; }
            else if (['0','1','2','3','4','5','6','7','8','9','.','±'].includes(lbl)){ s.background=opts.btnNumBg||'#2d2d4a'; s.color=opts.btnNumColor||'#fff'; }
            else { s.background=opts.btnFnBg||'#1e2a4a'; s.color=opts.btnFnColor||'#93c5fd'; }
            return s;
        }

        BTNS.forEach(function(lbl) {
            if (lbl === '') { grid.appendChild(document.createElement('div')); return; }
            var btn = document.createElement('button');
            btn.className = getBtnClass(lbl);
            btn.textContent = lbl;
            var st = getBtnStyle(lbl);
            Object.assign(btn.style, st);
            btn.addEventListener('click', function(){ handleBtn(lbl); });
            grid.appendChild(btn);
        });

        /* Keyboard support */
        document.addEventListener('keydown', function(ev) {
            if (!app.closest('body')) return;
            var map = {
                'Enter':'=','Backspace':'⌫','Escape':'C',
                '+':'+','-':'−','*':'×','/':'÷','%':'%',
                '(':'(', ')':')'
            };
            var key = ev.key;
            if (map[key]) { ev.preventDefault(); handleBtn(map[key]); return; }
            if (/^[0-9\.]$/.test(key)) { ev.preventDefault(); handleBtn(key); }
        });

        updateDisplay();
    }

    document.querySelectorAll('.bkbg-sc-app').forEach(initApp);
})();
