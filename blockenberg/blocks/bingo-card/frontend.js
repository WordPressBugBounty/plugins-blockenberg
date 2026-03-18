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
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    var COL_LETTERS = ['B','I','N','G','O'];
    var COL_RANGES = [[1,15],[16,30],[31,45],[46,60],[61,75]];
    var COL_BG = ['#e0f2fe','#fef9c3','#dcfce7','#fce7f3','#ede9fe'];

    function generateCard() {
        return COL_LETTERS.map(function (col, ci) {
            var nums = [];
            var lo = COL_RANGES[ci][0], hi = COL_RANGES[ci][1];
            while (nums.length < 5) {
                var n = Math.floor(Math.random() * (hi - lo + 1)) + lo;
                if (nums.indexOf(n) === -1) nums.push(n);
            }
            return nums;
        });
    }

    function checkBingo(marks) {
        var lines = [];
        /* 5 rows */
        for (var r = 0; r < 5; r++) {
            lines.push([[0,r],[1,r],[2,r],[3,r],[4,r]]);
        }
        /* 5 cols */
        for (var c = 0; c < 5; c++) {
            lines.push([[c,0],[c,1],[c,2],[c,3],[c,4]]);
        }
        /* 2 diagonals */
        lines.push([[0,0],[1,1],[2,2],[3,3],[4,4]]);
        lines.push([[4,0],[3,1],[2,2],[1,3],[0,4]]);

        var winLines = lines.filter(function (line) {
            return line.every(function (pos) { return marks[pos[0]][pos[1]]; });
        });
        return winLines;
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }
        var a = opts;

        var card = generateCard();
        var marks = COL_LETTERS.map(function () { return [false,false,false,false,false]; });
        marks[2][2] = true; /* FREE space */

        var calledNumbers = [];
        var allNumbers = [];
        for (var ci = 0; ci < 5; ci++) {
            for (var n = COL_RANGES[ci][0]; n <= COL_RANGES[ci][1]; n++) {
                allNumbers.push({ col: ci, num: n });
            }
        }
        var callPool = allNumbers.slice();
        var lastCalled = null;
        var hasBingo = false;
        var autoTimer = null;

        root.innerHTML = '';

        typoCssVarsForEl(a.titleTypo, '--bkbg-bng-title-', root);
        typoCssVarsForEl(a.subtitleTypo, '--bkbg-bng-sub-', root);

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-bng-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-bng-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }
        if (a.showSubtitle) {
            var sub = document.createElement('div');
            sub.className = 'bkbg-bng-subtitle';
            sub.style.color = '#6b7280';
            sub.textContent = a.subtitle;
            wrap.appendChild(sub);
        }

        /* Win banner */
        var winBanner = document.createElement('div');
        winBanner.className = 'bkbg-bng-win-banner';
        winBanner.style.background = a.bingoColor;
        winBanner.innerHTML = '<span class="bkbg-bng-win-emoji">🎉</span><div class="bkbg-bng-win-text">BINGO!</div><div class="bkbg-bng-win-sub">You got a bingo! Keep going for more!</div>';
        wrap.appendChild(winBanner);

        /* Caller */
        var callerEl = null, calledNumEl = null, callBtn = null, resetBtn = null;
        if (a.showCaller) {
            callerEl = document.createElement('div');
            callerEl.className = 'bkbg-bng-caller';
            callerEl.style.cssText = 'background:' + a.headerBg + ';color:' + a.headerColor + ';';
            wrap.appendChild(callerEl);

            var callerLabel = document.createElement('div');
            callerLabel.className = 'bkbg-bng-caller-label';
            callerLabel.textContent = 'LAST CALLED';
            callerEl.appendChild(callerLabel);

            calledNumEl = document.createElement('div');
            calledNumEl.className = 'bkbg-bng-called-num';
            calledNumEl.textContent = '—';
            callerEl.appendChild(calledNumEl);

            var callerBtns = document.createElement('div');
            callerBtns.className = 'bkbg-bng-caller-btns';
            callerEl.appendChild(callerBtns);

            callBtn = document.createElement('button');
            callBtn.className = 'bkbg-bng-call-btn';
            callBtn.style.background = a.accentColor;
            callBtn.textContent = '▶ Call Number';
            callerBtns.appendChild(callBtn);

            if (a.autoCall) {
                var autoBtn = document.createElement('button');
                autoBtn.className = 'bkbg-bng-call-btn';
                autoBtn.style.background = '#6366f1';
                autoBtn.textContent = '⏱ Auto Call';
                var autoRunning = false;
                autoBtn.addEventListener('click', function () {
                    if (autoRunning) {
                        clearInterval(autoTimer);
                        autoRunning = false;
                        autoBtn.textContent = '⏱ Auto Call';
                        callBtn.disabled = false;
                    } else {
                        autoRunning = true;
                        autoBtn.textContent = '⏹ Stop Auto';
                        callBtn.disabled = true;
                        autoTimer = setInterval(function () {
                            if (!callNumber()) {
                                clearInterval(autoTimer);
                                autoRunning = false;
                                autoBtn.textContent = '⏱ Auto Call';
                                callBtn.disabled = false;
                            }
                        }, (a.autoCallInterval || 5) * 1000);
                    }
                });
                callerBtns.appendChild(autoBtn);
            }
        }

        /* Grid */
        var gridWrap = document.createElement('div');
        gridWrap.className = 'bkbg-bng-grid-wrap';
        gridWrap.style.borderColor = a.headerBg;
        wrap.appendChild(gridWrap);

        var headerRow = document.createElement('div');
        headerRow.className = 'bkbg-bng-header-row';
        COL_LETTERS.forEach(function (col) {
            var hc = document.createElement('div');
            hc.className = 'bkbg-bng-header-cell';
            hc.style.cssText = 'background:' + a.headerBg + ';color:' + a.headerColor + ';';
            hc.textContent = col;
            headerRow.appendChild(hc);
        });
        gridWrap.appendChild(headerRow);

        var cellGrid = document.createElement('div');
        cellGrid.className = 'bkbg-bng-cell-grid';
        gridWrap.appendChild(cellGrid);

        var cellEls = []; /* [col][row] */
        var cellMarkedBg, cellDefaultBg;

        for (var c = 0; c < 5; c++) {
            cellEls[c] = [];
            for (var r = 0; r < 5; r++) {
                (function (ci, ri) {
                    var isFree = (ci === 2 && ri === 2);
                    var cellEl = document.createElement('div');
                    cellEl.className = 'bkbg-bng-cell' + (isFree ? ' bkbg-bng-marked' : '');
                    cellEl.style.cssText = 'border-color:' + a.borderColor + ';background:' + (isFree ? a.freeColor : a.cellBg) + ';color:' + (isFree ? '#fff' : a.cellColor) + ';';

                    if (isFree) {
                        var fl = document.createElement('span');
                        fl.className = 'bkbg-bng-free-label';
                        fl.textContent = 'FREE';
                        cellEl.appendChild(fl);
                    } else {
                        cellEl.textContent = card[ci][ri];
                        cellEl.addEventListener('click', function () {
                            if (marks[ci][ri]) return;
                            marks[ci][ri] = true;
                            cellEl.classList.add('bkbg-bng-marked');
                            cellEl.style.cssText = 'border-color:' + a.borderColor + ';background:' + a.markedColor + ';color:#fff;';
                            checkForBingo();
                        });
                    }

                    cellEls[ci][ri] = cellEl;
                    cellGrid.appendChild(cellEl);
                })(c, r);
            }
        }

        /* Called list */
        var calledChipsEl = null;
        if (a.showCalledList) {
            var calledListEl = document.createElement('div');
            calledListEl.className = 'bkbg-bng-called-list';
            calledListEl.style.cssText = 'background:#fff;border-color:' + a.borderColor + ';margin-top:14px;';
            var clTitle = document.createElement('div');
            clTitle.className = 'bkbg-bng-called-list-title';
            clTitle.style.color = '#6b7280';
            clTitle.textContent = 'Called Numbers';
            calledListEl.appendChild(clTitle);
            calledChipsEl = document.createElement('div');
            calledChipsEl.className = 'bkbg-bng-called-chips';
            calledListEl.appendChild(calledChipsEl);
            wrap.appendChild(calledListEl);
        }

        /* Actions */
        var actionsEl = document.createElement('div');
        actionsEl.className = 'bkbg-bng-actions';
        actionsEl.style.marginTop = '14px';
        wrap.appendChild(actionsEl);

        var newCardBtn = document.createElement('button');
        newCardBtn.className = 'bkbg-bng-call-btn bkbg-bng-call-btn-outline';
        newCardBtn.style.cssText = 'border-color:' + a.headerBg + ';color:' + a.headerBg + ';background:transparent;';
        newCardBtn.textContent = '🔀 New Card';
        actionsEl.appendChild(newCardBtn);

        var resetGameBtn = document.createElement('button');
        resetGameBtn.className = 'bkbg-bng-call-btn bkbg-bng-call-btn-outline';
        resetGameBtn.style.cssText = 'border-color:#6b7280;color:#6b7280;background:transparent;';
        resetGameBtn.textContent = '↺ Reset Game';
        actionsEl.appendChild(resetGameBtn);

        function addChip(colIdx, num) {
            if (!calledChipsEl) return;
            var chip = document.createElement('div');
            chip.className = 'bkbg-bng-chip';
            chip.style.background = a.accentColor;
            chip.textContent = COL_LETTERS[colIdx] + '-' + num;
            calledChipsEl.insertBefore(chip, calledChipsEl.firstChild);
        }

        function callNumber() {
            if (!callPool.length) {
                if (callBtn) callBtn.disabled = true;
                return false;
            }
            var idx = Math.floor(Math.random() * callPool.length);
            var called = callPool.splice(idx, 1)[0];
            calledNumbers.push(called);
            lastCalled = called;

            if (calledNumEl) {
                calledNumEl.classList.remove('bkbg-bng-pop');
                void calledNumEl.offsetWidth;
                calledNumEl.textContent = COL_LETTERS[called.col] + '-' + called.num;
                calledNumEl.classList.add('bkbg-bng-pop');
            }

            addChip(called.col, called.num);

            /* Highlight card if number matches */
            for (var r = 0; r < 5; r++) {
                if (card[called.col][r] === called.num && !marks[called.col][r]) {
                    var ce = cellEls[called.col][r];
                    ce.style.outline = '3px solid ' + a.accentColor;
                }
            }

            if (!callPool.length && callBtn) callBtn.disabled = true;
            return true;
        }

        function checkForBingo() {
            var winLines = checkBingo(marks);
            if (winLines.length && !hasBingo) {
                hasBingo = true;
                winBanner.classList.add('bkbg-bng-show');
                winLines.forEach(function (line) {
                    line.forEach(function (pos) {
                        cellEls[pos[0]][pos[1]].classList.add('bkbg-bng-win-cell');
                        cellEls[pos[0]][pos[1]].style.background = a.bingoColor;
                    });
                });
            }
        }

        function resetGame() {
            clearInterval(autoTimer);
            callPool = allNumbers.slice();
            calledNumbers = [];
            lastCalled = null;
            hasBingo = false;
            winBanner.classList.remove('bkbg-bng-show');
            if (calledNumEl) calledNumEl.textContent = '—';
            if (callBtn) callBtn.disabled = false;
            if (calledChipsEl) calledChipsEl.innerHTML = '';
            marks = COL_LETTERS.map(function () { return [false,false,false,false,false]; });
            marks[2][2] = true;
            for (var ci = 0; ci < 5; ci++) {
                for (var ri = 0; ri < 5; ri++) {
                    var isFree = (ci === 2 && ri === 2);
                    var ce = cellEls[ci][ri];
                    ce.classList.remove('bkbg-bng-marked', 'bkbg-bng-win-cell');
                    ce.style.outline = '';
                    if (isFree) {
                        ce.classList.add('bkbg-bng-marked');
                        ce.style.cssText = 'border-color:' + a.borderColor + ';background:' + a.freeColor + ';color:#fff;';
                    } else {
                        ce.style.cssText = 'border-color:' + a.borderColor + ';background:' + a.cellBg + ';color:' + a.cellColor + ';';
                    }
                }
            }
        }

        function newCard() {
            card = generateCard();
            resetGame();
            for (var ci = 0; ci < 5; ci++) {
                for (var ri = 0; ri < 5; ri++) {
                    if (!(ci === 2 && ri === 2)) {
                        cellEls[ci][ri].textContent = card[ci][ri];
                    }
                }
            }
        }

        if (callBtn) { callBtn.addEventListener('click', callNumber); }
        resetGameBtn.addEventListener('click', resetGame);
        newCardBtn.addEventListener('click', newCard);
    }

    function init() {
        document.querySelectorAll('.bkbg-bng-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
