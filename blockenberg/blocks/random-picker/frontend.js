(function () {
    'use strict';

    function parseItems(text, mode) {
        if (mode === 'comma') {
            return text.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
        }
        return text.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    }

    var _typoKeys = {
        titleTypo:    '--bkrpk-tt-',
        subtitleTypo: '--bkrpk-st-',
        winnerTypo:   '--bkrpk-wn-'
    };
    var _tvf; function _getTV() { return _tvf || (_tvf = window.bkbgTypoCssVars); }
    function typoCssVarsForEl(opts, el) {
        var fn = _getTV(); if (!fn) return;
        Object.keys(_typoKeys).forEach(function (k) {
            var vars = fn(opts[k] || {}, _typoKeys[k]);
            Object.keys(vars).forEach(function (p) { el.style.setProperty(p, vars[p]); });
        });
    }

    function initRandomPicker(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var accent       = opts.accentColor   || '#6c3fb5';
        var cardBg       = opts.cardBg        || '#ffffff';
        var winnerBg     = opts.winnerBg      || '#6c3fb5';
        var winnerColor  = opts.winnerColor   || '#ffffff';
        var itemBg       = opts.itemBg        || '#f5f3ff';
        var itemColor    = opts.itemColor     || '#374151';
        var highlightBg  = opts.highlightBg   || '#ede9fe';
        var historyBg    = opts.historyBg     || '#f9fafb';
        var historyColor = opts.historyColor  || '#6b7280';
        var labelColor   = opts.labelColor    || '#374151';
        var titleColor   = opts.titleColor    || '#1f2937';
        var subtitleColor= opts.subtitleColor || '#6b7280';
        var sectionBg    = opts.sectionBg     || '';
        var maxWidth     = opts.maxWidth      || 520;
        var cardRadius   = opts.cardRadius    || 16;
        var itemRadius   = opts.itemRadius    || 8;

        var padTop       = opts.paddingTop    || 60;
        var padBot       = opts.paddingBottom || 60;
        var showTitle    = opts.showTitle     !== false;
        var showSub      = opts.showSubtitle  !== false;
        var showHistory  = opts.showHistory   !== false;
        var allowRepick  = opts.allowRepick   !== false;
        var animSteps    = opts.animSteps     || 12;
        var animSpeed    = opts.animSpeedMs   || 60;
        var buttonLabel  = opts.buttonLabel   || 'Pick Random!';
        var inputMode    = opts.inputMode     || 'lines';

        var currentItems = parseItems(opts.defaultItems || 'Alice\nBob\nCarol\nDave\nEve\nFrank', inputMode);
        var history      = [];
        var winner       = null;
        var picking      = false;

        // Layout
        app.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        if (sectionBg) app.style.background = sectionBg;
        app.style.paddingTop    = padTop + 'px';
        app.style.paddingBottom = padBot + 'px';
        typoCssVarsForEl(opts, app);

        var card = document.createElement('div');
        card.className = 'bkbg-rpk-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;padding:36px 32px;max-width:' + maxWidth + 'px;margin:0 auto;';
        app.appendChild(card);

        // Header
        if (showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-rpk-title';
            titleEl.style.cssText = 'color:' + titleColor + ';margin-bottom:6px;';
            titleEl.textContent = opts.title;
            card.appendChild(titleEl);
        }
        if (showSub && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.className = 'bkbg-rpk-subtitle';
            subEl.style.cssText = 'color:' + subtitleColor + ';margin-bottom:20px;';
            subEl.textContent = opts.subtitle;
            card.appendChild(subEl);
        }

        // Textarea
        var textareaWrap = document.createElement('div');
        textareaWrap.style.marginBottom = '16px';
        var textareaLbl = document.createElement('label');
        textareaLbl.style.cssText = 'display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:' + labelColor + ';margin-bottom:6px;';
        textareaLbl.textContent = 'Items (' + currentItems.length + ')';
        var textarea = document.createElement('textarea');
        textarea.className = 'bkbg-rpk-textarea';
        textarea.rows = 6;
        textarea.value = opts.defaultItems || 'Alice\nBob\nCarol\nDave\nEve\nFrank';
        textarea.style.borderRadius = itemRadius + 'px';
        textarea.addEventListener('input', function() {
            currentItems = parseItems(textarea.value, inputMode);
            textareaLbl.textContent = 'Items (' + currentItems.length + ')';
            winner = null;
            winnerBox.style.display = 'none';
            renderChips(-1, null);
        });
        textareaWrap.appendChild(textareaLbl);
        textareaWrap.appendChild(textarea);
        card.appendChild(textareaWrap);

        // Pick button
        var pickBtn = document.createElement('button');
        pickBtn.className = 'bkbg-rpk-btn';
        pickBtn.style.cssText = 'background:' + accent + ';color:' + (opts.buttonColor||'#fff') + ';border-radius:' + itemRadius + 'px;';
        pickBtn.textContent = buttonLabel;
        pickBtn.addEventListener('click', doPick);
        card.appendChild(pickBtn);

        // Chips container
        var chipsWrap = document.createElement('div');
        chipsWrap.className = 'bkbg-rpk-items';
        card.appendChild(chipsWrap);

        // Winner box
        var winnerBox = document.createElement('div');
        winnerBox.className = 'bkbg-rpk-winner-box';
        winnerBox.style.cssText = 'display:none;background:' + winnerBg + ';border-radius:' + itemRadius + 'px;padding:20px;text-align:center;margin-bottom:16px;';
        var winnerSubLbl = document.createElement('div');
        winnerSubLbl.style.cssText = 'font-size:13px;font-weight:600;color:' + winnerColor + ';opacity:.8;margin-bottom:6px;';
        winnerSubLbl.textContent = '🎉 Winner!';
        var winnerText = document.createElement('div');
        winnerText.className = 'bkbg-rpk-winner-text';
        winnerText.style.cssText = 'color:' + winnerColor + ';';
        winnerBox.appendChild(winnerSubLbl);
        winnerBox.appendChild(winnerText);
        card.appendChild(winnerBox);

        // History
        var historySection;
        var historyChips;
        if (showHistory) {
            historySection = document.createElement('div');
            historySection.className = 'bkbg-rpk-history';
            historySection.style.cssText = 'display:none;background:' + historyBg + ';border-radius:' + itemRadius + 'px;';
            var histLbl = document.createElement('div');
            histLbl.className = 'bkbg-rpk-history-label';
            histLbl.style.color = labelColor;
            histLbl.textContent = 'Pick History';
            historyChips = document.createElement('div');
            historyChips.className = 'bkbg-rpk-history-chips';
            historySection.appendChild(histLbl);
            historySection.appendChild(historyChips);
            card.appendChild(historySection);
        }

        function renderChips(highlightIdx, winnerItem) {
            chipsWrap.innerHTML = '';
            currentItems.forEach(function(item, idx) {
                var chip = document.createElement('div');
                chip.className = 'bkbg-rpk-chip';
                chip.style.borderRadius = itemRadius + 'px';
                var isWin = winnerItem === item && highlightIdx === idx;
                var isHi  = highlightIdx === idx && !winnerItem;
                chip.style.background = isWin ? winnerBg : isHi ? highlightBg : itemBg;
                chip.style.color      = isWin ? winnerColor : itemColor;
                chip.style.fontWeight = isWin ? '700' : '500';
                chip.style.transform  = (isWin||isHi) ? 'scale(1.06)' : 'scale(1)';
                chip.textContent = item;
                chipsWrap.appendChild(chip);
            });
        }

        function doPick() {
            if (picking || currentItems.length === 0) return;
            picking = true;
            winner  = null;
            winnerBox.style.display = 'none';
            pickBtn.disabled = true;
            pickBtn.textContent = 'Picking…';

            var count = 0;
            var totalSteps = animSteps;

            function step() {
                var idx = Math.floor(Math.random() * currentItems.length);
                renderChips(idx, null);
                count++;
                if (count < totalSteps) {
                    setTimeout(step, animSpeed + count * 8);
                } else {
                    var finalIdx = Math.floor(Math.random() * currentItems.length);
                    winner = currentItems[finalIdx];
                    renderChips(finalIdx, winner);
                    winnerText.textContent = winner;
                    winnerBox.style.display = 'block';
                    winnerBox.style.animation = 'none';
                    void winnerBox.offsetWidth;
                    winnerBox.style.animation = '';
                    if (showHistory) {
                        history.unshift(winner);
                        if (history.length > 10) history.pop();
                        historyChips.innerHTML = '';
                        history.forEach(function(h) {
                            var chip = document.createElement('span');
                            chip.className = 'bkbg-rpk-history-chip';
                            chip.style.color = historyColor;
                            chip.textContent = h;
                            historyChips.appendChild(chip);
                        });
                        historySection.style.display = 'block';
                    }
                    picking = false;
                    pickBtn.disabled = false;
                    pickBtn.textContent = buttonLabel;
                }
            }
            step();
        }

        renderChips(-1, null);
    }

    document.querySelectorAll('.bkbg-rpk-app').forEach(initRandomPicker);
})();
