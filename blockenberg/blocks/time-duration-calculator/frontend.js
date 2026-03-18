(function () {
    'use strict';

    function pad2(n) { return String(Math.abs(Math.floor(n))).padStart(2,'0'); }

    function fmtHMS(totalSec) {
        var neg = totalSec < 0;
        var s = Math.abs(totalSec);
        var h = Math.floor(s / 3600); s -= h * 3600;
        var m = Math.floor(s / 60);   s -= m * 60;
        return (neg ? '−' : '') + pad2(h) + ':' + pad2(m) + ':' + pad2(s);
    }

    function toSec(h, m, s) {
        return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    }

    function initBlock(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accent       = opts.accentColor    || '#6c3fb5';
        var resultBg     = opts.resultBg       || accent;
        var resultColor  = opts.resultColor    || '#fff';
        var statBg       = opts.statBg         || '#f3f4f6';
        var statBorder   = opts.statBorder     || '#e5e7eb';
        var statValue    = opts.statValue      || '#111827';
        var statLabel    = opts.statLabel      || '#6b7280';
        var opActiveBg   = opts.opActiveBg     || accent;
        var opActiveClr  = opts.opActiveColor  || '#fff';
        var opInactiveBg = opts.opInactiveBg   || '#f3f4f6';
        var opInactiveClr= opts.opInactiveColor|| '#374151';
        var inputBorder  = opts.inputBorder    || '#e5e7eb';
        var labelColor   = opts.labelColor     || '#374151';
        var cardRadius   = (opts.cardRadius    !== undefined ? opts.cardRadius  : 16) + 'px';
        var inputRadius  = (opts.inputRadius   !== undefined ? opts.inputRadius : 8)  + 'px';
        var showSec      = opts.showSeconds    !== false;
        var showTotalSec = opts.showTotalSec   !== false;
        var showDays     = opts.showDaysBreakdown !== false;

        var state = { op: opts.defaultOp || 'add' };

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-tdc-wrap';
        wrap.style.borderRadius = cardRadius;
        if (opts.cardBg) wrap.style.background = opts.cardBg;
        app.appendChild(wrap);

        // Header
        if (opts.showTitle || opts.showSubtitle) {
            var hdr = document.createElement('div'); hdr.className = 'bkbg-tdc-header';
            if (opts.showTitle && opts.title) {
                var ti = document.createElement('div'); ti.className = 'bkbg-tdc-title';
                if (opts.titleColor) ti.style.color = opts.titleColor;
                ti.textContent = opts.title; hdr.appendChild(ti);
            }
            if (opts.showSubtitle && opts.subtitle) {
                var su = document.createElement('div'); su.className = 'bkbg-tdc-subtitle';
                if (opts.subtitleColor) su.style.color = opts.subtitleColor;
                su.textContent = opts.subtitle; hdr.appendChild(su);
            }
            wrap.appendChild(hdr);
        }

        // Op buttons
        var opsRow = document.createElement('div'); opsRow.className = 'bkbg-tdc-ops';
        var btnAdd = document.createElement('button'); btnAdd.className = 'bkbg-tdc-op'; btnAdd.type = 'button'; btnAdd.textContent = '+ Add';
        var btnSub = document.createElement('button'); btnSub.className = 'bkbg-tdc-op'; btnSub.type = 'button'; btnSub.textContent = '− Subtract';
        opsRow.appendChild(btnAdd); opsRow.appendChild(btnSub); wrap.appendChild(opsRow);

        function styleOp() {
            [btnAdd, btnSub].forEach(function(btn, i) {
                var active = (i === 0 && state.op === 'add') || (i === 1 && state.op === 'sub');
                btn.style.background = active ? opActiveBg : opInactiveBg;
                btn.style.color = active ? opActiveClr : opInactiveClr;
                btn.classList.toggle('active', active);
            });
            opSymEl.textContent = state.op === 'add' ? '+' : '−';
            resultLabelEl.textContent = state.op === 'add' ? 'Total Duration' : 'Difference';
            calc();
        }

        btnAdd.addEventListener('click', function(){ state.op = 'add'; styleOp(); });
        btnSub.addEventListener('click', function(){ state.op = 'sub'; styleOp(); });

        // Duration builder helper
        function makeDurBlock(label, defH, defM, defS) {
            var block = document.createElement('div'); block.className = 'bkbg-tdc-dur-block';
            var lbl = document.createElement('div'); lbl.className = 'bkbg-tdc-dur-lbl'; lbl.style.color = labelColor; lbl.textContent = label;
            var grid = document.createElement('div'); grid.className = 'bkbg-tdc-dur-grid' + (showSec ? '' : ' no-sec');
            block.appendChild(lbl); block.appendChild(grid);

            var inputs = {};
            [['h', 'Hours', defH], ['m', 'Minutes', defM], showSec && ['s', 'Seconds', defS]].forEach(function(f) {
                if (!f) return;
                var cell = document.createElement('div');
                var fl = document.createElement('label'); fl.className = 'bkbg-tdc-field-label'; fl.style.color = labelColor; fl.textContent = f[1];
                var fi = document.createElement('input'); fi.type = 'number'; fi.className = 'bkbg-tdc-input'; fi.min = 0; fi.value = f[2];
                fi.style.borderColor = inputBorder; fi.style.borderRadius = inputRadius;
                fi.addEventListener('input', calc);
                cell.appendChild(fl); cell.appendChild(fi); grid.appendChild(cell);
                inputs[f[0]] = fi;
            });
            if (!showSec) inputs['s'] = { value: '0' };
            return { block: block, inputs: inputs };
        }

        var dur1 = makeDurBlock('Duration A', opts.defaultH1 || 1, opts.defaultM1 || 30, opts.defaultS1 || 0);
        wrap.appendChild(dur1.block);

        var opSymEl = document.createElement('div'); opSymEl.className = 'bkbg-tdc-operator'; opSymEl.style.color = accent; opSymEl.textContent = '+';
        wrap.appendChild(opSymEl);

        var dur2 = makeDurBlock('Duration B', opts.defaultH2 || 0, opts.defaultM2 || 45, opts.defaultS2 || 0);
        wrap.appendChild(dur2.block);

        // Spacer
        var spacer = document.createElement('div'); spacer.style.height = '16px'; wrap.appendChild(spacer);

        // Result card
        var resultCard = document.createElement('div'); resultCard.className = 'bkbg-tdc-result';
        resultCard.style.background = resultBg; resultCard.style.color = resultColor; resultCard.style.borderRadius = '12px';
        var resultLabelEl = document.createElement('div'); resultLabelEl.className = 'bkbg-tdc-result-label'; resultLabelEl.textContent = 'Total Duration';
        var resultTimeEl  = document.createElement('div'); resultTimeEl.className  = 'bkbg-tdc-result-time';
        resultCard.appendChild(resultLabelEl); resultCard.appendChild(resultTimeEl); wrap.appendChild(resultCard);

        // Stats
        var statsRow = document.createElement('div'); statsRow.className = 'bkbg-tdc-stats'; wrap.appendChild(statsRow);
        var statEls = {};
        function makeStat(key, label) {
            var s = document.createElement('div'); s.className = 'bkbg-tdc-stat'; s.style.background = statBg; s.style.borderColor = statBorder;
            var v = document.createElement('div'); v.className = 'bkbg-tdc-stat-val'; v.style.color = statValue;
            var l = document.createElement('div'); l.className = 'bkbg-tdc-stat-lbl'; l.style.color = statLabel; l.textContent = label;
            s.appendChild(v); s.appendChild(l); statsRow.appendChild(s);
            statEls[key] = v;
            return s;
        }
        var daysStat = showDays       ? makeStat('days','Days')    : null;
        makeStat('hours','Hours'); makeStat('mins','Minutes');
        var secsStat   = showSec      ? makeStat('secs','Seconds')         : null;
        var totalSecSt = showTotalSec ? makeStat('tsec','Total Seconds')   : null;

        function calc() {
            var t1 = toSec(dur1.inputs.h.value, dur1.inputs.m.value, dur1.inputs.s.value);
            var t2 = toSec(dur2.inputs.h.value, dur2.inputs.m.value, dur2.inputs.s.value);
            var total = state.op === 'add' ? t1 + t2 : t1 - t2;
            var abs = Math.abs(total);
            var days  = Math.floor(abs / 86400);
            var hours = Math.floor((abs % 86400) / 3600);
            var mins  = Math.floor((abs % 3600) / 60);
            var secs  = abs % 60;

            resultTimeEl.textContent = fmtHMS(total);
            if (statEls.days)  statEls.days.textContent  = days;
            if (statEls.hours) statEls.hours.textContent = hours;
            if (statEls.mins)  statEls.mins.textContent  = mins;
            if (statEls.secs)  statEls.secs.textContent  = secs;
            if (statEls.tsec)  statEls.tsec.textContent  = abs.toLocaleString();
        }

        styleOp();
    }

    function init() { document.querySelectorAll('.bkbg-tdc-app').forEach(initBlock); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
