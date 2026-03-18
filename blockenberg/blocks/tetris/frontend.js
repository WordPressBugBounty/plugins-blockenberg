(function () {
    'use strict';

    // ---- Tetromino definitions (all rotations) ----
    var PIECES = {
        I: { rotations: [[[0,1],[1,1],[2,1],[3,1]],[[1,0],[1,1],[1,2],[1,3]],[[0,2],[1,2],[2,2],[3,2]],[[2,0],[2,1],[2,2],[2,3]]], color: '#06b6d4' },
        O: { rotations: [[[0,0],[0,1],[1,0],[1,1]]], color: '#f59e0b' },
        T: { rotations: [[[0,1],[1,0],[1,1],[1,2]],[[0,1],[1,1],[1,2],[2,1]],[[1,0],[1,1],[1,2],[2,1]],[[0,1],[1,0],[1,1],[2,1]]], color: '#a855f7' },
        S: { rotations: [[[0,1],[0,2],[1,0],[1,1]],[[0,1],[1,1],[1,2],[2,2]]], color: '#22c55e' },
        Z: { rotations: [[[0,0],[0,1],[1,1],[1,2]],[[0,2],[1,1],[1,2],[2,1]]], color: '#ef4444' },
        L: { rotations: [[[0,2],[1,0],[1,1],[1,2]],[[0,1],[1,1],[2,1],[2,2]],[[1,0],[1,1],[1,2],[2,0]],[[0,0],[0,1],[1,1],[2,1]]], color: '#f97316' },
        J: { rotations: [[[0,0],[1,0],[1,1],[1,2]],[[0,1],[0,2],[1,1],[2,1]],[[1,0],[1,1],[1,2],[2,2]],[[0,1],[1,1],[2,0],[2,1]]], color: '#3b82f6' }
    };

    var PIECE_KEYS = Object.keys(PIECES);

    // Points for clearing lines (classic Tetris scoring)
    var LINE_POINTS = [0, 100, 300, 500, 800];

    // Gravity interval in ms per level (level 1 = 800ms, each level -60ms, min 50ms)
    function levelInterval(level) { return Math.max(50, 800 - (level - 1) * 60); }

    function makeBoard(W, H) {
        var b = [];
        for (var r = 0; r < H; r++) { b.push(new Array(W).fill(null)); }
        return b;
    }

    function randomPiece() {
        var key = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
        return { key: key, rot: 0, row: 0, col: 3 };
    }

    function getCells(piece) {
        var p = PIECES[piece.key];
        var offsets = p.rotations[piece.rot % p.rotations.length];
        return offsets.map(function (o) { return [o[0] + piece.row, o[1] + piece.col]; });
    }

    function isValid(board, piece, W, H) {
        var cells = getCells(piece);
        for (var i = 0; i < cells.length; i++) {
            var r = cells[i][0], c = cells[i][1];
            if (c < 0 || c >= W || r >= H) return false;
            if (r >= 0 && board[r][c]) return false;
        }
        return true;
    }

    function placePiece(board, piece) {
        var cells = getCells(piece);
        var color = PIECES[piece.key].color;
        cells.forEach(function (rc) { if (rc[0] >= 0) board[rc[0]][rc[1]] = color; });
    }

    function clearLines(board, W, H) {
        var cleared = [];
        var newBoard = [];
        board.forEach(function (row, i) {
            if (row.every(Boolean)) { cleared.push(i); }
            else { newBoard.push(row); }
        });
        while (newBoard.length < H) newBoard.unshift(new Array(W).fill(null));
        return { board: newBoard, cleared: cleared.length };
    }

    function ghostRow(board, piece, W, H) {
        var ghost = Object.assign({}, piece);
        while (true) {
            var next = Object.assign({}, ghost, { row: ghost.row + 1 });
            if (!isValid(board, next, W, H)) break;
            ghost = next;
        }
        return ghost.row;
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var W          = opts.boardWidth  || 10;
        var H          = opts.boardHeight || 20;
        var CS         = opts.cellSize    || 30;
        var bgColor    = opts.bgColor     || '#0f0e17';
        var boardBg    = opts.boardBg     || '#1a1a2e';
        var gridColor  = opts.gridColor   || '#16213e';
        var ghostColor = opts.ghostColor  || 'rgba(255,255,255,0.12)';
        var titleColor = opts.titleColor  || '#fffffe';
        var accentColor= opts.accentColor || '#ff8906';
        var showGhost  = opts.showGhost !== false;
        var showNext   = opts.showNext !== false;
        var startLevel = opts.startLevel || 1;

        if (opts.sectionBg) root.style.background = opts.sectionBg;

        // Style existing title/subtitle
        var titleEl = root.querySelector('.bkbg-ttr-title');
        if (titleEl) { titleEl.style.color = titleColor; }
        var subEl = root.querySelector('.bkbg-ttr-subtitle');
        if (subEl) { subEl.style.color = titleColor; }

        // ---- Build UI ----
        var layout = document.createElement('div');
        layout.className = 'bkbg-ttr-layout';
        root.appendChild(layout);

        // Board canvas
        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-ttr-canvas';
        canvas.width  = W * CS;
        canvas.height = H * CS;
        canvas.style.border = '2px solid ' + accentColor + '55';
        layout.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        // Side panel
        var panel = document.createElement('div');
        panel.className = 'bkbg-ttr-panel';
        layout.appendChild(panel);

        // Start/Pause button
        var startBtn = document.createElement('button');
        startBtn.className = 'bkbg-ttr-start-btn';
        startBtn.style.background = accentColor;
        startBtn.style.color = '#fff';
        startBtn.textContent = 'Start';
        panel.appendChild(startBtn);

        // Next piece preview
        var nextCanvas = null;
        if (showNext) {
            var nextWrap = document.createElement('div');
            nextWrap.className = 'bkbg-ttr-stat-box';
            nextWrap.style.background = bgColor;
            nextWrap.style.border = '1px solid ' + accentColor + '33';
            var nextLabel = document.createElement('div');
            nextLabel.className = 'bkbg-ttr-stat-label';
            nextLabel.style.color = accentColor;
            nextLabel.textContent = 'NEXT';
            nextCanvas = document.createElement('canvas');
            nextCanvas.className = 'bkbg-ttr-next-canvas';
            nextCanvas.width  = 4 * 24;
            nextCanvas.height = 4 * 24;
            nextWrap.appendChild(nextLabel);
            nextWrap.appendChild(nextCanvas);
            panel.appendChild(nextWrap);
        }

        // Stat boxes
        function makeStatBox(label) {
            var box = document.createElement('div');
            box.className = 'bkbg-ttr-stat-box';
            box.style.background = bgColor;
            box.style.border = '1px solid ' + accentColor + '33';
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-ttr-stat-label';
            lbl.style.color = accentColor;
            lbl.textContent = label;
            var val = document.createElement('div');
            val.className = 'bkbg-ttr-stat-value';
            val.style.color = titleColor;
            val.textContent = '0';
            box.appendChild(lbl);
            box.appendChild(val);
            panel.appendChild(box);
            return val;
        }

        var scoreEl = opts.showScore !== false ? makeStatBox('SCORE') : null;
        var levelEl = opts.showLevel !== false ? makeStatBox('LEVEL') : null;
        var linesEl = opts.showLines !== false ? makeStatBox('LINES') : null;
        if (levelEl) levelEl.textContent = startLevel;

        // On-screen controls
        var ctrlDiv = document.createElement('div');
        ctrlDiv.className = 'bkbg-ttr-controls';

        function makeCtrl(label) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-ttr-btn';
            btn.style.background = accentColor + '33';
            btn.style.color = titleColor;
            btn.textContent = label;
            return btn;
        }

        var btnUp    = makeCtrl('↑');
        var btnLeft  = makeCtrl('←');
        var btnDown  = makeCtrl('↓');
        var btnRight = makeCtrl('→');
        var btnDrop  = makeCtrl('⤓');
        btnDrop.style.width = '98px';

        var row1 = document.createElement('div'); row1.className = 'bkbg-ttr-ctrl-row'; row1.appendChild(btnUp);
        var row2 = document.createElement('div'); row2.className = 'bkbg-ttr-ctrl-row';
        [btnLeft, btnDown, btnRight].forEach(function (b) { row2.appendChild(b); });
        var row3 = document.createElement('div'); row3.className = 'bkbg-ttr-ctrl-row'; row3.appendChild(btnDrop);

        ctrlDiv.appendChild(row1);
        ctrlDiv.appendChild(row2);
        ctrlDiv.appendChild(row3);

        var hint = document.createElement('div');
        hint.className = 'bkbg-ttr-keys-hint';
        hint.style.color = titleColor;
        hint.innerHTML = '← → Move &nbsp; ↑ Rotate<br>↓ Soft Drop &nbsp; Space: Hard Drop';
        ctrlDiv.appendChild(hint);
        panel.appendChild(ctrlDiv);

        // ---- Game state ----
        var board, current, next, score, level, lines;
        var running = false, paused = false, over = false;
        var dropTimer = 0, lastTime = 0;
        var rafId = null;

        function initState() {
            board   = makeBoard(W, H);
            current = randomPiece();
            next    = randomPiece();
            score   = 0;
            level   = startLevel;
            lines   = 0;
            over    = false;
            if (scoreEl) scoreEl.textContent = 0;
            if (levelEl) levelEl.textContent = level;
            if (linesEl) linesEl.textContent = 0;
        }

        // ---- Drawing ----
        function drawCell(ctx, c, r, color, cellSize) {
            var x = c * cellSize, y = r * cellSize, s = cellSize - 1;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, s - 1, s - 1, cellSize > 20 ? 3 : 1);
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.fillRect(x + 2, y + 2, s - 2, 3);
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(x + 2, y + s - 2, s - 2, 2);
        }

        function drawBoard() {
            // Background
            ctx.fillStyle = boardBg;
            ctx.fillRect(0, 0, W * CS, H * CS);

            // Grid lines
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 0.5;
            for (var c = 0; c <= W; c++) { ctx.beginPath(); ctx.moveTo(c * CS, 0); ctx.lineTo(c * CS, H * CS); ctx.stroke(); }
            for (var r = 0; r <= H; r++) { ctx.beginPath(); ctx.moveTo(0, r * CS); ctx.lineTo(W * CS, r * CS); ctx.stroke(); }

            // Placed pieces
            board.forEach(function (row, r) {
                row.forEach(function (color, c) {
                    if (color) drawCell(ctx, c, r, color, CS);
                });
            });

            if (!running || over) return;

            // Ghost piece
            if (showGhost && current) {
                var gRow = ghostRow(board, current, W, H);
                getCells(Object.assign({}, current, { row: gRow })).forEach(function (rc) {
                    if (rc[0] >= 0) {
                        ctx.fillStyle = ghostColor;
                        ctx.fillRect(rc[1] * CS + 1, rc[0] * CS + 1, CS - 2, CS - 2);
                    }
                });
            }

            // Current piece
            if (current) {
                getCells(current).forEach(function (rc) {
                    if (rc[0] >= 0) drawCell(ctx, rc[1], rc[0], PIECES[current.key].color, CS);
                });
            }
        }

        function drawNext() {
            if (!nextCanvas || !next) return;
            var nctx = nextCanvas.getContext('2d');
            nctx.fillStyle = bgColor;
            nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
            var cells = getCells(Object.assign({}, next, { row: 0, col: 0 }));
            var minC = Math.min.apply(null, cells.map(function (c) { return c[1]; }));
            var minR = Math.min.apply(null, cells.map(function (c) { return c[0]; }));
            cells.forEach(function (rc) {
                var c = rc[1] - minC, r = rc[0] - minR;
                drawCell(nctx, c + 0.5, r + 0.5, PIECES[next.key].color, 20);
            });
        }

        function drawOverlay(msg) {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(0, 0, W * CS, H * CS);
            ctx.fillStyle = titleColor;
            ctx.font = 'bold ' + CS + 'px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(msg, W * CS / 2, H * CS / 2);
            ctx.font = '14px system-ui';
            ctx.fillStyle = accentColor;
            ctx.fillText('Press Start', W * CS / 2, H * CS / 2 + CS + 10);
        }

        // ---- Spawn & lock ----
        function spawn() {
            current = next;
            next    = randomPiece();
            drawNext();
            if (!isValid(board, current, W, H)) {
                over    = true;
                running = false;
                drawBoard();
                drawOverlay('GAME OVER');
                startBtn.textContent = 'Restart';
                if (rafId) cancelAnimationFrame(rafId);
            }
        }

        function lockPiece() {
            placePiece(board, current);
            var result = clearLines(board, W, H);
            board = result.board;
            lines += result.cleared;
            score += LINE_POINTS[result.cleared] * level;
            level = startLevel + Math.floor(lines / 10);
            if (scoreEl) scoreEl.textContent = score;
            if (levelEl) levelEl.textContent = level;
            if (linesEl) linesEl.textContent = lines;
            spawn();
        }

        // ---- Move helpers ----
        function tryMove(dr, dc) {
            if (!running || paused || over) return false;
            var moved = Object.assign({}, current, { row: current.row + dr, col: current.col + dc });
            if (isValid(board, moved, W, H)) { current = moved; return true; }
            return false;
        }

        function rotate() {
            if (!running || paused || over) return;
            var p = PIECES[current.key];
            var nextRot = (current.rot + 1) % p.rotations.length;
            var rotated = Object.assign({}, current, { rot: nextRot });
            // Wall kick: try center, -1, +1, -2, +2
            var kicks = [0, -1, 1, -2, 2];
            for (var i = 0; i < kicks.length; i++) {
                var kicked = Object.assign({}, rotated, { col: rotated.col + kicks[i] });
                if (isValid(board, kicked, W, H)) { current = kicked; return; }
            }
        }

        function hardDrop() {
            if (!running || paused || over) return;
            while (tryMove(1, 0)) {}
            lockPiece();
            dropTimer = 0;
        }

        // ---- Game loop ----
        function loop(ts) {
            var dt = ts - lastTime;
            lastTime = ts;
            if (!paused && !over) {
                dropTimer += dt;
                if (dropTimer >= levelInterval(level)) {
                    dropTimer = 0;
                    if (!tryMove(1, 0)) lockPiece();
                }
            }
            drawBoard();
            if (rafId !== null) rafId = requestAnimationFrame(loop);
        }

        function startGame() {
            if (rafId) cancelAnimationFrame(rafId);
            initState();
            running  = true;
            paused   = false;
            dropTimer = 0;
            lastTime  = performance.now();
            spawn();
            drawNext();
            rafId = requestAnimationFrame(loop);
            startBtn.textContent = 'Pause';
        }

        function togglePause() {
            if (!running || over) return;
            paused = !paused;
            startBtn.textContent = paused ? 'Resume' : 'Pause';
        }

        startBtn.addEventListener('click', function () {
            if (!running || over) startGame();
            else togglePause();
        });

        // Touch-friendly controls
        btnLeft.addEventListener('click',  function () { tryMove(0, -1); });
        btnRight.addEventListener('click', function () { tryMove(0, 1);  });
        btnDown.addEventListener('click',  function () { if (!tryMove(1, 0)) lockPiece(); dropTimer = 0; });
        btnUp.addEventListener('click',    function () { rotate(); });
        btnDrop.addEventListener('click',  function () { hardDrop(); });

        // Keyboard — only when canvas is focused/visible
        document.addEventListener('keydown', function (e) {
            if (!canvas.closest('body')) return;
            if (!running) return;
            switch (e.key) {
            case 'ArrowLeft':  e.preventDefault(); tryMove(0, -1); break;
            case 'ArrowRight': e.preventDefault(); tryMove(0, 1);  break;
            case 'ArrowDown':  e.preventDefault(); if (!tryMove(1, 0)) lockPiece(); dropTimer = 0; break;
            case 'ArrowUp':    e.preventDefault(); rotate(); break;
            case ' ':          e.preventDefault(); hardDrop(); break;
            case 'p': case 'P': togglePause(); break;
            }
        });

        // Initial draw
        initState();
        drawBoard();
        drawOverlay('TETRIS');
    }

    document.querySelectorAll('.bkbg-ttr-app').forEach(function (root) {
        initBlock(root);
    });
})();
