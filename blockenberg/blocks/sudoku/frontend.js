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

    /* ================================================================
       Sudoku Generator & Solver
    ================================================================ */
    var CELLS_TO_REMOVE = { easy: 35, medium: 45, hard: 52, expert: 58 };

    function shuffleArr(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function makeEmpty() {
        return Array.from({ length: 9 }, function () { return new Array(9).fill(0); });
    }

    function isValid(grid, row, col, num) {
        // Row
        for (var c = 0; c < 9; c++) { if (grid[row][c] === num) return false; }
        // Col
        for (var r = 0; r < 9; r++) { if (grid[r][col] === num) return false; }
        // Box
        var br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
        for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
            if (grid[br + i][bc + j] === num) return false;
        }
        return true;
    }

    function fillGrid(grid) {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                if (grid[row][col] !== 0) continue;
                var nums = shuffleArr([1,2,3,4,5,6,7,8,9]);
                for (var k = 0; k < 9; k++) {
                    if (isValid(grid, row, col, nums[k])) {
                        grid[row][col] = nums[k];
                        if (fillGrid(grid)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    function generatePuzzle(difficulty) {
        var solution = makeEmpty();
        fillGrid(solution);

        // Deep-copy solution → puzzle
        var puzzle = solution.map(function (r) { return r.slice(); });
        var toRemove = CELLS_TO_REMOVE[difficulty] || 45;
        var positions = shuffleArr(
            Array.from({ length: 81 }, function (_, i) { return i; })
        );
        var removed = 0;
        for (var i = 0; i < positions.length && removed < toRemove; i++) {
            var row = Math.floor(positions[i] / 9);
            var col = positions[i] % 9;
            puzzle[row][col] = 0;
            removed++;
        }
        return { puzzle: puzzle, solution: solution };
    }

    /* ================================================================
       Block initializer
    ================================================================ */
    function initBlock(root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accentColor       = opts.accentColor       || '#6366f1';
        var givenColor        = opts.givenColor        || '#1e1b4b';
        var enteredColor      = opts.enteredColor      || '#6366f1';
        var errorColor        = opts.errorColor        || '#ef4444';
        var highlightBg       = opts.highlightBg       || '#e0e7ff';
        var selectedBg        = opts.selectedBg        || '#c7d2fe';
        var gridBg            = opts.gridBg            || '#ffffff';
        var sectionBg         = opts.sectionBg         || '#f5f3ff';
        var titleColor        = opts.titleColor        || '#1e1b4b';
        var showTimer         = opts.showTimer        !== false;
        var showMistakes      = opts.showMistakes     !== false;
        var highlightRelated  = opts.highlightRelated !== false;
        var highlightSame     = opts.highlightSameNumber !== false;
        var maxMistakes       = parseInt(opts.maxMistakes  || 3, 10);
        var hintsAllowed      = parseInt(opts.hintsAllowed || 3, 10);
        var defaultDiff       = opts.defaultDifficulty    || 'medium';
        var fontSize          = opts.fontSize   || 28;
        var subtitleSize      = opts.subtitleSize || 14;

        root.style.background   = sectionBg;
        root.style.borderRadius = '16px';
        root.style.padding      = '28px 20px';
        root.style.textAlign    = 'center';
        root.style.fontFamily   = 'system-ui,-apple-system,sans-serif';
        root.style.boxSizing    = 'border-box';
        root.classList.add('bkbg-sdk-wrap');

        typoCssVarsForEl(root, opts.titleTypo, '--bksdk-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, '--bksdk-st-');

        // Style title/subtitle from save()
        var titleEl = root.querySelector('.bkbg-sdk-title');
        var subEl   = root.querySelector('.bkbg-sdk-subtitle');
        if (titleEl) { titleEl.style.color = titleColor; titleEl.style.margin = '0 0 4px'; }
        if (subEl)   { subEl.style.color = titleColor + 'bb'; subEl.style.margin = '0 0 18px'; }

        // State
        var currentDiff = defaultDiff;
        var puzzle      = null;
        var solution    = null;
        var userGrid    = null;  // 0 = empty, positive = value (including givens)
        var given       = null;  // boolean mask for givens
        var notes       = null;  // notes[r][c] = Set of numbers
        var selected    = null;  // { r, c }
        var mistakes    = 0;
        var hintsLeft   = hintsAllowed;
        var pencilMode  = false;
        var gameOver    = false;
        var won         = false;
        var timerSecs   = 0;
        var timerInt    = null;

        var inner = document.createElement('div');
        root.appendChild(inner);

        /* ---- helpers ---- */
        function startTimer() {
            clearInterval(timerInt);
            timerSecs = 0;
            timerInt = setInterval(function () {
                if (gameOver) return;
                timerSecs++;
                var el = document.getElementById('bkbg-sdk-timer-' + _uid);
                if (el) el.textContent = '⏱ ' + formatTime(timerSecs);
            }, 1000);
        }

        function formatTime(s) {
            var m = Math.floor(s / 60);
            return m + ':' + ('0' + (s % 60)).slice(-2);
        }

        var _uid = Math.random().toString(36).slice(2);

        function newGame() {
            var result = generatePuzzle(currentDiff);
            puzzle   = result.puzzle;
            solution = result.solution;
            userGrid = puzzle.map(function (r) { return r.slice(); });
            given    = puzzle.map(function (r) { return r.map(function (v) { return v !== 0; }); });
            notes    = Array.from({ length: 9 }, function () {
                return Array.from({ length: 9 }, function () { return {}; });
            });
            selected    = null;
            mistakes    = 0;
            hintsLeft   = hintsAllowed;
            pencilMode  = false;
            gameOver    = false;
            won         = false;
            render();
            startTimer();
        }

        function render() {
            inner.innerHTML = '';

            // Difficulty tabs
            var diffRow = document.createElement('div');
            diffRow.className = 'bkbg-sdk-diff-row';
            ['easy','medium','hard','expert'].forEach(function (d) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-sdk-diff-btn';
                btn.textContent = d.charAt(0).toUpperCase() + d.slice(1);
                btn.style.borderColor = accentColor;
                if (d === currentDiff) { btn.style.background = accentColor; btn.style.color = '#fff'; }
                else { btn.style.background = 'transparent'; btn.style.color = accentColor; }
                btn.addEventListener('click', function () { currentDiff = d; newGame(); });
                diffRow.appendChild(btn);
            });
            inner.appendChild(diffRow);

            if (gameOver) {
                renderOverlay();
                return;
            }

            // Info bar
            var info = document.createElement('div');
            info.className = 'bkbg-sdk-info';
            if (showTimer) {
                var timerEl = document.createElement('div');
                timerEl.id = 'bkbg-sdk-timer-' + _uid;
                timerEl.style.color = titleColor;
                timerEl.textContent = '⏱ ' + formatTime(timerSecs);
                info.appendChild(timerEl);
            }
            if (showMistakes) {
                var mistEl = document.createElement('div');
                mistEl.style.color = errorColor;
                mistEl.textContent = '✕ ' + mistakes + ' / ' + maxMistakes;
                info.appendChild(mistEl);
            }
            var hintEl = document.createElement('div');
            hintEl.style.color = accentColor;
            hintEl.textContent = '💡 ' + hintsLeft;
            info.appendChild(hintEl);
            inner.appendChild(info);

            // Grid
            var boardWrap = document.createElement('div');
            boardWrap.className = 'bkbg-sdk-board-wrap';
            var grid = document.createElement('div');
            grid.className = 'bkbg-sdk-grid';
            grid.style.borderColor = givenColor;

            for (var r = 0; r < 9; r++) {
                for (var c = 0; c < 9; c++) {
                    (function (row, col) {
                        var cell = document.createElement('div');
                        cell.className = 'bkbg-sdk-cell';

                        // Thick borders for box boundaries
                        if (col === 2 || col === 5) { cell.style.borderRightWidth = '2px'; cell.style.borderRightColor = givenColor; }
                        else cell.style.borderRightColor = '#d1d5db';
                        if (row === 2 || row === 5) { cell.style.borderBottomWidth = '2px'; cell.style.borderBottomColor = givenColor; }
                        else cell.style.borderBottomColor = '#d1d5db';
                        if (col === 8) cell.style.borderRightWidth = '0';
                        if (row === 8) cell.style.borderBottomWidth = '0';

                        var val = userGrid[row][col];
                        var isGiven = given[row][col];
                        var isSelected = selected && selected.r === row && selected.c === col;
                        var isRelated = !isSelected && selected && highlightRelated && (
                            selected.r === row || selected.c === col ||
                            (Math.floor(selected.r/3)===Math.floor(row/3) && Math.floor(selected.c/3)===Math.floor(col/3))
                        );
                        var isSame = !isSelected && selected && highlightSame && val && userGrid[selected.r][selected.c] === val;
                        var isError = val && !isGiven && solution && val !== solution[row][col];

                        cell.style.background = isSelected ? selectedBg
                            : isSame ? (selectedBg + 'aa')
                            : isRelated ? highlightBg
                            : gridBg;

                        if (val) {
                            if (Object.keys(notes[row][col]).length === 0) {
                                // Show value
                                cell.textContent = val;
                                cell.style.color = isError ? errorColor : (isGiven ? givenColor : enteredColor);
                                cell.style.fontWeight = isGiven ? '900' : '700';
                            } else {
                                // Has notes + value — show value
                                cell.textContent = val;
                                cell.style.color = isError ? errorColor : (isGiven ? givenColor : enteredColor);
                            }
                        } else if (Object.keys(notes[row][col]).length > 0) {
                            // Show notes
                            var noteGrid = document.createElement('div');
                            noteGrid.className = 'bkbg-sdk-notes';
                            for (var n = 1; n <= 9; n++) {
                                var nd = document.createElement('div');
                                nd.className = 'bkbg-sdk-note';
                                nd.textContent = notes[row][col][n] ? n : '';
                                nd.style.color = accentColor + 'cc';
                                noteGrid.appendChild(nd);
                            }
                            cell.appendChild(noteGrid);
                        }

                        cell.addEventListener('click', function () {
                            if (isGiven) { selected = { r: row, c: col }; render(); return; }
                            selected = { r: row, c: col };
                            render();
                        });

                        grid.appendChild(cell);
                    })(r, c);
                }
            }
            boardWrap.appendChild(grid);
            inner.appendChild(boardWrap);

            // Number pad
            var numPad = document.createElement('div');
            numPad.className = 'bkbg-sdk-numpad';

            // Pencil toggle
            var pencilBtn = document.createElement('button');
            pencilBtn.className = 'bkbg-sdk-pencil-btn';
            pencilBtn.title = 'Pencil / Notes mode';
            pencilBtn.textContent = '✏️';
            pencilBtn.style.borderColor = pencilMode ? accentColor : '#9ca3af';
            pencilBtn.style.background  = pencilMode ? accentColor + '22' : 'transparent';
            pencilBtn.style.color       = pencilMode ? accentColor : '#9ca3af';
            pencilBtn.addEventListener('click', function () { pencilMode = !pencilMode; render(); });
            numPad.appendChild(pencilBtn);

            for (var n = 1; n <= 9; n++) {
                (function (num) {
                    var btn = document.createElement('button');
                    btn.className = 'bkbg-sdk-num-btn';
                    btn.textContent = num;
                    btn.style.borderColor = accentColor;
                    btn.style.background  = 'transparent';
                    btn.style.color       = accentColor;
                    btn.addEventListener('click', function () { enterNumber(num); });
                    numPad.appendChild(btn);
                })(n);
            }

            var eraseBtn = document.createElement('button');
            eraseBtn.className = 'bkbg-sdk-num-btn bkbg-sdk-erase-btn';
            eraseBtn.textContent = '✕';
            eraseBtn.addEventListener('click', function () { enterNumber(0); });
            numPad.appendChild(eraseBtn);
            inner.appendChild(numPad);

            // Actions
            var actions = document.createElement('div');
            actions.className = 'bkbg-sdk-actions';

            var newBtn = document.createElement('button');
            newBtn.className = 'bkbg-sdk-btn';
            newBtn.style.background = accentColor;
            newBtn.textContent = 'New Game';
            newBtn.addEventListener('click', newGame);
            actions.appendChild(newBtn);

            var hintActionBtn = document.createElement('button');
            hintActionBtn.className = 'bkbg-sdk-btn bkbg-sdk-btn-outline';
            hintActionBtn.style.borderColor = accentColor;
            hintActionBtn.style.color = accentColor;
            hintActionBtn.textContent = '💡 Hint (' + hintsLeft + ')';
            hintActionBtn.disabled = hintsLeft <= 0;
            hintActionBtn.style.opacity = hintsLeft > 0 ? 1 : 0.4;
            hintActionBtn.addEventListener('click', useHint);
            actions.appendChild(hintActionBtn);

            inner.appendChild(actions);

            // Keyboard support
            root.setAttribute('tabindex', '0');
        }

        function enterNumber(num) {
            if (!selected || gameOver) return;
            var r = selected.r, c = selected.c;
            if (given[r][c]) return;

            if (pencilMode && num > 0) {
                if (notes[r][c][num]) delete notes[r][c][num];
                else notes[r][c][num] = true;
                userGrid[r][c] = 0;
            } else {
                notes[r][c] = {};
                userGrid[r][c] = num;
                if (num > 0 && num !== solution[r][c]) {
                    mistakes++;
                    if (mistakes >= maxMistakes) { gameOver = true; won = false; clearInterval(timerInt); render(); return; }
                }
            }
            render();
            checkWin();
        }

        function useHint() {
            if (hintsLeft <= 0 || !selected || gameOver) return;
            var r = selected.r, c = selected.c;
            if (given[r][c] || userGrid[r][c] === solution[r][c]) {
                // Find first empty cell
                for (var row = 0; row < 9; row++) {
                    for (var col = 0; col < 9; col++) {
                        if (!given[row][col] && userGrid[row][col] !== solution[row][col]) {
                            selected = { r: row, c: col };
                            return useHint();
                        }
                    }
                }
                return;
            }
            notes[r][c] = {};
            userGrid[r][c] = solution[r][c];
            hintsLeft--;
            render();
            checkWin();
        }

        function checkWin() {
            for (var r = 0; r < 9; r++) {
                for (var c = 0; c < 9; c++) {
                    if (userGrid[r][c] !== solution[r][c]) return;
                }
            }
            won = true;
            gameOver = true;
            clearInterval(timerInt);
            render();
        }

        function renderOverlay() {
            var ov = document.createElement('div');
            ov.className = 'bkbg-sdk-overlay';

            var emoji = document.createElement('div');
            emoji.className = 'bkbg-sdk-overlay-emoji';
            emoji.textContent = won ? '🎉' : '💀';

            var title = document.createElement('div');
            title.className = 'bkbg-sdk-overlay-title';
            title.style.color = titleColor;
            title.textContent = won ? 'Puzzle Solved!' : 'Game Over!';

            var sub = document.createElement('div');
            sub.className = 'bkbg-sdk-overlay-sub';
            sub.style.color = titleColor + 'aa';
            sub.textContent = won
                ? 'Completed in ' + formatTime(timerSecs) + ' with ' + mistakes + ' mistake(s)'
                : 'You reached ' + maxMistakes + ' mistakes. Try again!';

            var reBtn = document.createElement('button');
            reBtn.className = 'bkbg-sdk-btn';
            reBtn.style.background = accentColor;
            reBtn.textContent = 'Play Again';
            reBtn.addEventListener('click', newGame);

            ov.appendChild(emoji);
            ov.appendChild(title);
            ov.appendChild(sub);
            ov.appendChild(reBtn);
            inner.appendChild(ov);
        }

        // Keyboard input
        root.addEventListener('keydown', function (e) {
            if (!selected || gameOver) return;
            if (e.key >= '1' && e.key <= '9') { enterNumber(parseInt(e.key, 10)); }
            else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') { enterNumber(0); }
            else if (e.key === 'ArrowUp'    && selected.r > 0) { selected.r--; render(); }
            else if (e.key === 'ArrowDown'  && selected.r < 8) { selected.r++; render(); }
            else if (e.key === 'ArrowLeft'  && selected.c > 0) { selected.c--; render(); }
            else if (e.key === 'ArrowRight' && selected.c < 8) { selected.c++; render(); }
        });

        newGame();
    }

    function init() {
        document.querySelectorAll('.bkbg-sdk-app').forEach(function (root) {
            initBlock(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
