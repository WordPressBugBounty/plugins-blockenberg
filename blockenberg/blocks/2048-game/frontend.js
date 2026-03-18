(function () {
    'use strict';

    var TILE_COLORS = {
        0:    { bg: '#cdc1b4', text: '#776e65' },
        2:    { bg: '#eee4da', text: '#776e65' },
        4:    { bg: '#ede0c8', text: '#776e65' },
        8:    { bg: '#f2b179', text: '#f9f6f2' },
        16:   { bg: '#f59563', text: '#f9f6f2' },
        32:   { bg: '#f67c5f', text: '#f9f6f2' },
        64:   { bg: '#f65e3b', text: '#f9f6f2' },
        128:  { bg: '#edcf72', text: '#f9f6f2' },
        256:  { bg: '#edcc61', text: '#f9f6f2' },
        512:  { bg: '#edc850', text: '#f9f6f2' },
        1024: { bg: '#edc53f', text: '#f9f6f2' },
        2048: { bg: '#edc22e', text: '#f9f6f2' }
    };

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty('--' + prefix + prop, v);
        });
    }

    function getTileColor(val) {
        return TILE_COLORS[val] || { bg: '#3c3a32', text: '#f9f6f2' };
    }

    function makeEmptyGrid() {
        return [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    }

    function cloneGrid(g) { return g.map(function (r) { return r.slice(); }); }

    function emptyPositions(g) {
        var pos = [];
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (!g[r][c]) pos.push([r,c]);
        return pos;
    }

    function addRandom(g) {
        var empty = emptyPositions(g);
        if (!empty.length) return;
        var pick = empty[Math.floor(Math.random() * empty.length)];
        g[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
        return [pick[0], pick[1]];
    }

    function slideRow(row) {
        // Remove zeros
        var nums = row.filter(function (v) { return v !== 0; });
        var merged = [];
        var i = 0;
        while (i < nums.length) {
            if (i + 1 < nums.length && nums[i] === nums[i+1]) {
                merged.push(nums[i] * 2);
                i += 2;
            } else {
                merged.push(nums[i]);
                i++;
            }
        }
        while (merged.length < 4) merged.push(0);
        return merged;
    }

    function moveLeft(g) {
        var next = makeEmptyGrid();
        var score = 0;
        for (var r = 0; r < 4; r++) {
            var orig = g[r];
            var slid = slideRow(orig.slice());
            next[r] = slid;
            slid.forEach(function (v, c) { if (v > orig[c]) score += v; });
        }
        return { grid: next, score: score };
    }

    function rotateRight(g) {
        var n = makeEmptyGrid();
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) n[c][3-r] = g[r][c];
        return n;
    }

    function rotateLeft(g) {
        var n = makeEmptyGrid();
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) n[3-c][r] = g[r][c];
        return n;
    }

    function moveRight(g) { var res = moveLeft(rotateRight(rotateRight(g))); return { grid: rotateLeft(rotateLeft(res.grid)), score: res.score }; }
    function moveUp(g)    { var res = moveLeft(rotateRight(g)); return { grid: rotateLeft(res.grid), score: res.score }; }
    function moveDown(g)  { var res = moveLeft(rotateLeft(g));  return { grid: rotateRight(res.grid), score: res.score }; }

    function gridsEqual(a, b) {
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (a[r][c] !== b[r][c]) return false;
        return true;
    }

    function hasMoves(g) {
        if (emptyPositions(g).length) return true;
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                if (c < 3 && g[r][c] === g[r][c+1]) return true;
                if (r < 3 && g[r][c] === g[r+1][c]) return true;
            }
        }
        return false;
    }

    function hasWon(g) {
        for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (g[r][c] >= 2048) return true;
        return false;
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var uid          = root.getAttribute('id') || ('g48_' + Date.now());
        var boardSize    = opts.boardSize    || 380;
        var gridGap      = opts.gridGap      || 10;
        var tileRadius   = opts.tileRadius   || 8;
        var gridBg       = opts.gridBg       || '#bbada0';
        var tileBg       = opts.tileBg       || '#cdc1b4';
        var sectionBg    = opts.sectionBg    || '';
        var titleColor   = opts.titleColor   || '#776e65';
        var scoreHdrBg   = opts.scoreHeaderBg|| '#bbada0';
        var newGameBg    = opts.newGameBg    || '#8f7a66';
        var animate      = opts.animateTiles !== false;

        // Apply typography CSS vars
        typoCssVarsForEl(root, opts.titleTypo, 'bkg48-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, 'bkg48-st-');

        if (sectionBg) root.style.background = sectionBg;

        // Apply title styles
        var titleEl = root.querySelector('.bkbg-g48-title');
        if (titleEl) { titleEl.style.color = titleColor; }
        var subEl = root.querySelector('.bkbg-g48-subtitle');
        if (subEl) { subEl.style.color = titleColor; }

        // Game state
        var grid  = makeEmptyGrid();
        var score = 0;
        var best  = parseInt(localStorage.getItem('bkbg_2048_best_' + uid)) || 0;
        var won   = false;
        var over  = false;
        var newTile = null; // [r, c] of recently added tile
        var mergedTiles = []; // [[r,c],...] that just merged

        addRandom(grid);
        addRandom(grid);

        // Header
        var header = document.createElement('div');
        header.className = 'bkbg-g48-header';

        var titleBlock = document.createElement('div');
        var titleEl2 = root.querySelector('.bkbg-g48-title');
        var subEl2   = root.querySelector('.bkbg-g48-subtitle');
        if (titleEl2) titleBlock.appendChild(titleEl2.cloneNode(true));
        if (subEl2)   titleBlock.appendChild(subEl2.cloneNode(true));
        header.appendChild(titleBlock);

        // Score section
        var scoresDiv = document.createElement('div');
        scoresDiv.className = 'bkbg-g48-scores';

        var scoreBox = null, scorVal = null, bestBox = null, bestVal = null;

        function makeScoreBox(label, val, bg) {
            var box = document.createElement('div');
            box.className = 'bkbg-g48-score-box';
            box.style.background = bg;
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-g48-score-label';
            lbl.style.color = '#eee4da';
            lbl.textContent = label;
            var vEl = document.createElement('div');
            vEl.className = 'bkbg-g48-score-value';
            vEl.style.color = '#fff';
            vEl.textContent = val;
            box.appendChild(lbl);
            box.appendChild(vEl);
            return { box: box, valEl: vEl };
        }

        if (opts.showScore !== false) {
            var sb = makeScoreBox('Score', '0', scoreHdrBg);
            scoreBox = sb.box; scorVal = sb.valEl;
            scoresDiv.appendChild(scoreBox);
        }
        if (opts.showBestScore !== false) {
            var bb = makeScoreBox('Best', best || '0', scoreHdrBg);
            bestBox = bb.box; bestVal = bb.valEl;
            scoresDiv.appendChild(bestBox);
        }

        var newBtn = document.createElement('button');
        newBtn.className = 'bkbg-g48-new-btn';
        newBtn.style.background = newGameBg;
        newBtn.textContent = 'New Game';
        newBtn.addEventListener('click', newGame);
        scoresDiv.appendChild(newBtn);

        header.appendChild(scoresDiv);
        root.appendChild(header);

        // Board
        var boardWrap = document.createElement('div');
        boardWrap.className = 'bkbg-g48-board-wrap';

        var boardEl = document.createElement('div');
        boardEl.className = 'bkbg-g48-grid';
        boardEl.style.background    = gridBg;
        boardEl.style.gap           = gridGap + 'px';
        boardEl.style.padding       = gridGap + 'px';
        boardEl.style.borderRadius  = (tileRadius + gridGap) + 'px';
        boardEl.style.width         = boardSize + 'px';
        boardEl.style.height        = boardSize + 'px';
        boardEl.style.boxSizing     = 'border-box';
        boardEl.style.touchAction   = 'none';
        boardEl.style.position      = 'relative';

        // 16 tile divs
        var tileDivs = [];
        for (var i = 0; i < 16; i++) {
            var td = document.createElement('div');
            td.className = 'bkbg-g48-tile';
            td.style.borderRadius = tileRadius + 'px';
            td.style.fontSize = '36px';
            boardEl.appendChild(td);
            tileDivs.push(td);
        }

        boardWrap.appendChild(boardEl);
        root.appendChild(boardWrap);

        // Hint
        var hint = document.createElement('p');
        hint.className = 'bkbg-g48-hint';
        hint.style.color = titleColor;
        hint.textContent = '\u2190 \u2192 \u2191 \u2193 arrow keys or swipe to play';
        root.appendChild(hint);

        function updateScoreUI() {
            if (scorVal) scorVal.textContent = score;
            if (bestVal) bestVal.textContent = best;
        }

        function renderGrid() {
            for (var r = 0; r < 4; r++) {
                for (var c = 0; c < 4; c++) {
                    var val = grid[r][c];
                    var td  = tileDivs[r * 4 + c];
                    var tc  = val ? getTileColor(val) : { bg: tileBg, text: '#776e65' };
                    td.style.background = tc.bg;
                    td.style.color      = tc.text;
                    td.textContent      = val || '';
                    var fs = val < 100 ? 30 : val < 1000 ? 22 : val < 10000 ? 17 : 13;
                    td.style.fontSize   = fs + 'px';

                    // Animations
                    td.classList.remove('bkbg-g48-pop', 'bkbg-g48-new');
                    if (animate) {
                        if (newTile && newTile[0] === r && newTile[1] === c) {
                            td.classList.add('bkbg-g48-new');
                        }
                        var isMerge = mergedTiles.some(function (mt) { return mt[0] === r && mt[1] === c; });
                        if (isMerge) {
                            void td.offsetWidth; // reflow
                            td.classList.add('bkbg-g48-pop');
                        }
                    }
                }
            }
        }

        function showOverlay(msg, sub) {
            var existing = boardEl.querySelector('.bkbg-g48-overlay');
            if (existing) existing.remove();

            var ov = document.createElement('div');
            ov.className = 'bkbg-g48-overlay';
            ov.style.background    = 'rgba(238,228,218,0.73)';
            ov.style.borderRadius  = (tileRadius + gridGap) + 'px';
            ov.style.color         = '#776e65';

            var msgEl = document.createElement('div');
            msgEl.className = 'bkbg-g48-overlay-msg';
            msgEl.textContent = msg;

            var subEl = document.createElement('div');
            subEl.className = 'bkbg-g48-overlay-sub';
            subEl.textContent = sub;

            var btn = document.createElement('button');
            btn.className = 'bkbg-g48-new-btn';
            btn.style.background = newGameBg;
            btn.textContent = 'Try Again';
            btn.addEventListener('click', newGame);

            ov.appendChild(msgEl);
            ov.appendChild(subEl);
            ov.appendChild(btn);
            boardEl.appendChild(ov);
        }

        function removeOverlay() {
            var ov = boardEl.querySelector('.bkbg-g48-overlay');
            if (ov) ov.remove();
        }

        function findMerged(before, after) {
            var res = [];
            for (var r = 0; r < 4; r++) {
                for (var c = 0; c < 4; c++) {
                    if (after[r][c] && after[r][c] === before[r][c] * 2) res.push([r, c]);
                }
            }
            return res;
        }

        function doMove(moveFn) {
            if (over) return;
            var before = cloneGrid(grid);
            var res    = moveFn(grid);
            if (gridsEqual(before, res.grid)) return; // no change
            grid  = res.grid;
            score += res.score;
            if (score > best) { best = score; localStorage.setItem('bkbg_2048_best_' + uid, best); }
            mergedTiles = findMerged(before, grid);
            var pos = addRandom(grid);
            newTile = pos || null;
            renderGrid();
            updateScoreUI();
            if (!won && hasWon(grid)) { won = true; showOverlay('\uD83C\uDF89 You Win!', 'Score: ' + score); }
            else if (!hasMoves(grid)) { over = true; showOverlay('\uD83D\uDC80 Game Over', 'Score: ' + score); }
        }

        function newGame() {
            grid  = makeEmptyGrid();
            score = 0;
            won   = false;
            over  = false;
            newTile = null;
            mergedTiles = [];
            addRandom(grid);
            addRandom(grid);
            removeOverlay();
            renderGrid();
            updateScoreUI();
        }

        renderGrid();
        updateScoreUI();

        // Keyboard
        document.addEventListener('keydown', function (e) {
            if (!boardEl.closest('body')) return; // guard if removed
            switch (e.key) {
            case 'ArrowLeft':  e.preventDefault(); doMove(moveLeft);  break;
            case 'ArrowRight': e.preventDefault(); doMove(moveRight); break;
            case 'ArrowUp':    e.preventDefault(); doMove(moveUp);    break;
            case 'ArrowDown':  e.preventDefault(); doMove(moveDown);  break;
            }
        });

        // Touch / swipe
        var touchStart = null;
        boardEl.addEventListener('touchstart', function (e) {
            var t = e.touches[0];
            touchStart = { x: t.clientX, y: t.clientY };
        }, { passive: true });

        boardEl.addEventListener('touchend', function (e) {
            if (!touchStart) return;
            var t  = e.changedTouches[0];
            var dx = t.clientX - touchStart.x;
            var dy = t.clientY - touchStart.y;
            touchStart = null;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) doMove(moveRight); else doMove(moveLeft);
            } else {
                if (dy > 0) doMove(moveDown); else doMove(moveUp);
            }
        }, { passive: true });
    }

    document.querySelectorAll('.bkbg-g48-app').forEach(function (root) {
        initBlock(root);
    });
})();
