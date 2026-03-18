(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    function rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    function parseSides(die) {
        // d100 = 1-100, d10 special case already covered
        return parseInt(die.replace('d', ''), 10) || 6;
    }

    function buildBlock(root) {
        var o;
        try { o = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        // CSS vars
        root.style.setProperty('--dr-accent',       o.accentColor   || '#dc2626');
        root.style.setProperty('--dr-die-bg',        o.dieColor      || '#1e1b4b');
        root.style.setProperty('--dr-die-face',      o.dieFace       || '#ffffff');
        root.style.setProperty('--dr-total-bg',      o.totalBg       || '#fef2f2');
        root.style.setProperty('--dr-total-color',   o.totalColor    || '#dc2626');
        root.style.setProperty('--dr-title-color',   o.titleColor    || '#111827');
        root.style.setProperty('--dr-subtitle-color',o.subtitleColor || '#6b7280');
        root.style.setProperty('--dr-label-color',   o.labelColor    || '#374151');
        root.style.setProperty('--dr-max-width',     (o.contentMaxWidth||580)+'px');
        root.style.setProperty('--bkbg-dr-ttl-fs',   (o.titleFontSize ||26)+'px');
        root.style.setProperty('--bkbg-dr-sub-fs',   (o.subtitleFontSize||14)+'px');
        if (o.typoTitle) typoCssVarsForEl(o.typoTitle, '--bkbg-dr-ttl-', root);
        if (o.typoSubtitle) typoCssVarsForEl(o.typoSubtitle, '--bkbg-dr-sub-', root);

        var DICE_TYPES = ['d4','d6','d8','d10','d12','d20','d100'];

        // State
        var currentDie   = o.defaultDie   || 'd6';
        var currentCount = o.defaultCount  || 2;
        var modifier     = 0;
        var history      = [];
        var maxHistory   = o.historySize   || 8;

        // Build wrap
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-dr-wrap';
        wrap.style.background = o.sectionBg || '#fff1f2';
        root.appendChild(wrap);

        if (o.showTitle && o.title) {
            var h = document.createElement('h3');
            h.className = 'bkbg-dr-title';
            h.textContent = o.title;
            wrap.appendChild(h);
        }
        if (o.showSubtitle && o.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-dr-subtitle';
            sub.textContent = o.subtitle;
            wrap.appendChild(sub);
        }

        // Controls
        var controls = document.createElement('div');
        controls.className = 'bkbg-dr-controls';
        wrap.appendChild(controls);

        // Die selector
        var dieGroup = document.createElement('div');
        dieGroup.className = 'bkbg-dr-ctrl-group';
        var dieLbl = document.createElement('div');
        dieLbl.className = 'bkbg-dr-ctrl-label';
        dieLbl.textContent = 'Die Type';
        var dieSelect = document.createElement('select');
        dieSelect.className = 'bkbg-dr-select';
        DICE_TYPES.forEach(function (d) {
            var opt = document.createElement('option');
            opt.value = d; opt.textContent = d;
            if (d === currentDie) opt.selected = true;
            dieSelect.appendChild(opt);
        });
        dieSelect.addEventListener('change', function () { currentDie = dieSelect.value; updateRollBtn(); });
        dieGroup.appendChild(dieLbl);
        dieGroup.appendChild(dieSelect);
        controls.appendChild(dieGroup);

        // Count control
        var cntGroup = document.createElement('div');
        cntGroup.className = 'bkbg-dr-ctrl-group';
        var cntLbl = document.createElement('div');
        cntLbl.className = 'bkbg-dr-ctrl-label';
        cntLbl.textContent = 'Number';
        var counter = document.createElement('div');
        counter.className = 'bkbg-dr-counter';
        var minusBtn = document.createElement('button');
        minusBtn.className = 'bkbg-dr-counter-btn';
        minusBtn.textContent = '−';
        var countVal = document.createElement('span');
        countVal.className = 'bkbg-dr-counter-val';
        countVal.textContent = currentCount;
        var plusBtn = document.createElement('button');
        plusBtn.className = 'bkbg-dr-counter-btn';
        plusBtn.textContent = '+';
        minusBtn.addEventListener('click', function () {
            if (currentCount > 1) { currentCount--; countVal.textContent = currentCount; updateRollBtn(); }
        });
        plusBtn.addEventListener('click', function () {
            if (currentCount < 10) { currentCount++; countVal.textContent = currentCount; updateRollBtn(); }
        });
        counter.appendChild(minusBtn);
        counter.appendChild(countVal);
        counter.appendChild(plusBtn);
        cntGroup.appendChild(cntLbl);
        cntGroup.appendChild(counter);
        controls.appendChild(cntGroup);

        // Modifier
        var modInput = null;
        if (o.showModifier) {
            var modGroup = document.createElement('div');
            modGroup.className = 'bkbg-dr-ctrl-group';
            var modLbl = document.createElement('div');
            modLbl.className = 'bkbg-dr-ctrl-label';
            modLbl.textContent = 'Modifier';
            modInput = document.createElement('input');
            modInput.type = 'number';
            modInput.className = 'bkbg-dr-mod-input';
            modInput.value = '0';
            modInput.addEventListener('input', function () {
                modifier = parseInt(modInput.value, 10) || 0;
            });
            modGroup.appendChild(modLbl);
            modGroup.appendChild(modInput);
            controls.appendChild(modGroup);
        }

        // Roll button
        var rollBtn = document.createElement('button');
        rollBtn.className = 'bkbg-dr-roll-btn';
        wrap.appendChild(rollBtn);

        function updateRollBtn() {
            rollBtn.textContent = '🎲 Roll ' + currentCount + currentDie;
        }
        updateRollBtn();

        // Dice display
        var diceRow = document.createElement('div');
        diceRow.className = 'bkbg-dr-dice-row';
        wrap.appendChild(diceRow);

        // Total
        var totalWrap = null, totalVal = null;
        if (o.showTotal) {
            totalWrap = document.createElement('div');
            totalWrap.className = 'bkbg-dr-total-wrap';
            var totalLabel = document.createElement('span');
            totalLabel.className = 'bkbg-dr-total-label';
            totalLabel.textContent = 'Total';
            totalVal = document.createElement('span');
            totalVal.className = 'bkbg-dr-total-val';
            totalVal.textContent = '—';
            totalWrap.appendChild(totalLabel);
            totalWrap.appendChild(totalVal);
            wrap.appendChild(totalWrap);
        }

        // History
        var histEl = null, histBody = null, histCount = null;
        if (o.showHistory) {
            histEl = document.createElement('div');
            histEl.className = 'bkbg-dr-history';
            histEl.style.background = o.histBg || '#f9fafb';
            var histHead = document.createElement('div');
            histHead.className = 'bkbg-dr-hist-head';
            var histTitle = document.createElement('span');
            histTitle.textContent = 'Roll History';
            histCount = document.createElement('span');
            histCount.textContent = '0 rolls';
            histHead.appendChild(histTitle);
            histHead.appendChild(histCount);
            histBody = document.createElement('div');
            histEl.appendChild(histHead);
            histEl.appendChild(histBody);
            wrap.appendChild(histEl);
        }

        // ── Perform roll ──
        function doRoll(savedResults) {
            var sides   = parseSides(currentDie);
            var results = savedResults || Array.from({ length: currentCount }, function () { return rollDie(sides); });
            var rawSum  = results.reduce(function (s, v) { return s + v; }, 0);
            var total   = rawSum + modifier;

            // Animate button
            rollBtn.classList.add('rolling');
            setTimeout(function () { rollBtn.classList.remove('rolling'); }, 400);

            // Render dice
            diceRow.innerHTML = '';
            results.forEach(function (val) {
                var die = document.createElement('div');
                die.className = 'bkbg-dr-die rolling';
                die.textContent = val;
                diceRow.appendChild(die);
                setTimeout(function () { die.classList.remove('rolling'); }, 400);
            });

            // Update total
            if (totalVal) {
                var label = modifier !== 0 ? total + (modifier > 0 ? ' (+'+modifier+')' : ' ('+modifier+')') : String(total);
                totalVal.textContent = label;
            }

            // Update history
            if (!savedResults) {
                var entry = {
                    label: currentCount + currentDie,
                    results: results,
                    total: total,
                    modifier: modifier
                };
                history.unshift(entry);
                if (history.length > maxHistory) history.pop();
                renderHistory();
            }
        }

        function renderHistory() {
            if (!histBody) return;
            histBody.innerHTML = '';
            if (histCount) histCount.textContent = history.length + ' roll' + (history.length !== 1 ? 's' : '');
            if (history.length === 0) {
                var empty = document.createElement('div');
                empty.style.cssText = 'padding:14px;text-align:center;font-size:13px;opacity:.5;color:var(--dr-label-color,#374151)';
                empty.textContent = 'No rolls yet — press Roll!';
                histBody.appendChild(empty);
                return;
            }
            history.forEach(function (entry, idx) {
                var row = document.createElement('div');
                row.className = 'bkbg-dr-hist-row';
                var info = document.createElement('span');
                var modStr = entry.modifier ? (entry.modifier > 0 ? ' +'+entry.modifier : ' '+entry.modifier) : '';
                info.textContent = '#' + (history.length - idx) + ' — ' + entry.label + modStr + ' — [' + entry.results.join(', ') + '] = ' + entry.total;
                var rerollBtn = document.createElement('button');
                rerollBtn.className = 'bkbg-dr-hist-reroll';
                rerollBtn.textContent = '↺';
                rerollBtn.setAttribute('title', 'Reroll same dice');
                rerollBtn.addEventListener('click', function () {
                    currentDie   = entry.label.replace(/^\d+/, '') || 'd6';
                    currentCount = parseInt(entry.label, 10) || currentCount;
                    modifier     = entry.modifier;
                    dieSelect.value = currentDie;
                    countVal.textContent = currentCount;
                    if (modInput) modInput.value = modifier;
                    updateRollBtn();
                    doRoll();
                });
                row.appendChild(info);
                row.appendChild(rerollBtn);
                histBody.appendChild(row);
            });
        }

        rollBtn.addEventListener('click', function () { doRoll(); });
        renderHistory();
    }

    document.querySelectorAll('.bkbg-dr-app').forEach(buildBlock);
})();
