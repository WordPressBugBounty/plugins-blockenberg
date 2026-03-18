(function () {
    'use strict';

    var LINES = [
        [0,1,2],[3,4,5],[6,7,8], // rows
        [0,3,6],[1,4,7],[2,5,8], // cols
        [0,4,8],[2,4,6]          // diagonals
    ];

    function checkWinner(board) {
        for (var i = 0; i < LINES.length; i++) {
            var a = LINES[i][0], b = LINES[i][1], c = LINES[i][2];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { sym: board[a], line: LINES[i] };
            }
        }
        return null;
    }

    function isFull(board) {
        return board.every(function (c) { return c !== ''; });
    }

    /* Minimax for hard AI */
    function minimax(board, depth, isMax, aiSym, playerSym) {
        var w = checkWinner(board);
        if (w) return w.sym === aiSym ? 10 - depth : depth - 10;
        if (isFull(board)) return 0;

        var best = isMax ? -Infinity : Infinity;
        for (var i = 0; i < 9; i++) {
            if (board[i] !== '') continue;
            board[i] = isMax ? aiSym : playerSym;
            var score = minimax(board, depth + 1, !isMax, aiSym, playerSym);
            board[i] = '';
            best = isMax ? Math.max(best, score) : Math.min(best, score);
        }
        return best;
    }

    function bestMoveHard(board, aiSym, playerSym) {
        var best = -Infinity, move = -1;
        for (var i = 0; i < 9; i++) {
            if (board[i] !== '') continue;
            board[i] = aiSym;
            var score = minimax(board, 0, false, aiSym, playerSym);
            board[i] = '';
            if (score > best) { best = score; move = i; }
        }
        return move;
    }

    function bestMoveMedium(board, aiSym, playerSym) {
        // Win if possible
        for (var i = 0; i < 9; i++) {
            if (board[i] !== '') continue;
            board[i] = aiSym;
            if (checkWinner(board)) { board[i] = ''; return i; }
            board[i] = '';
        }
        // Block player
        for (var j = 0; j < 9; j++) {
            if (board[j] !== '') continue;
            board[j] = playerSym;
            if (checkWinner(board)) { board[j] = ''; return j; }
            board[j] = '';
        }
        // Center
        if (board[4] === '') return 4;
        // Random
        return bestMoveRandom(board);
    }

    function bestMoveRandom(board) {
        var empties = [];
        for (var i = 0; i < 9; i++) {
            if (board[i] === '') empties.push(i);
        }
        return empties[Math.floor(Math.random() * empties.length)];
    }

    function initBlock(root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch (e) {}

        var playerSym    = opts.playerSymbol  || 'X';
        var aiSym        = opts.aiSymbol      || 'O';
        var mode         = opts.defaultMode   || 'ai';      // 'ai' | 'pvp'
        var aiDiff       = opts.aiDifficulty  || 'hard';
        var showScore    = opts.showScore    !== false;
        var accentColor  = opts.accentColor  || '#6366f1';
        var xColor       = opts.xColor       || '#ef4444';
        var oColor       = opts.oColor       || '#3b82f6';
        var cellBg       = opts.cellBg       || '#ffffff';
        var winLineBg    = opts.winLineBg    || '#22c55e';
        var gridLine     = opts.gridLine     || '#d1d5db';
        var sectionBg    = opts.sectionBg    || '#eef2ff';
        var cardBg       = opts.cardBg       || '#ffffff';
        var titleColor   = opts.titleColor   || '#312e81';
        var fontSize     = opts.fontSize     || 28;
        var subtitleSize = opts.subtitleSize || 15;

        // Unique ID for localStorage
        var uid = root.getAttribute('data-uid') || root.id || Math.random().toString(36).slice(2);

        // Score persistence
        var storeKey = 'bkbg_ttt_' + uid;
        var stored   = {};
        try { stored = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (e) {}
        var score = {
            player: parseInt(stored.player || 0, 10),
            ai:     parseInt(stored.ai     || 0, 10),
            draws:  parseInt(stored.draws  || 0, 10)
        };

        // Game state
        var board        = ['','','','','','','','',''];
        var currentPlayer = playerSym;  // who plays next (pvp uses player1/player2)
        var player1 = playerSym, player2 = aiSym;
        var gameOver     = false;
        var aiThinking   = false;
        var currentMode  = mode;

        // ----- Render helpers -----
        function saveScore() {
            try { localStorage.setItem(storeKey, JSON.stringify(score)); } catch (e) {}
        }

        function render() {
            root.innerHTML = '';
            root.style.background = sectionBg;
            root.style.borderRadius = '16px';
            root.style.padding = '28px 20px';
            root.style.textAlign = 'center';

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-ttt-wrap';
            wrap.style.padding = '0';

            // Title
            var titleEl = root.parentElement && root.parentElement.querySelector('.bkbg-ttt-title-ext');
            // Title/Subtitle are output by save() outside .bkbg-ttt-app — just render score + board here

            // Score
            if (showScore) {
                var scoreRow = document.createElement('div');
                scoreRow.className = 'bkbg-ttt-score';
                var scoreItems = [
                    { label: currentMode === 'ai' ? 'You' : 'Player 1', val: score.player, color: xColor },
                    { label: 'Draw', val: score.draws, color: '#6b7280' },
                    { label: currentMode === 'ai' ? 'AI' : 'Player 2', val: score.ai, color: oColor }
                ];
                scoreItems.forEach(function (s) {
                    var box = document.createElement('div');
                    box.className = 'bkbg-ttt-score-box';
                    box.style.background = cardBg;
                    box.style.borderTop = '4px solid ' + s.color;
                    var val = document.createElement('div');
                    val.className = 'bkbg-ttt-score-val';
                    val.style.color = s.color;
                    val.textContent = s.val;
                    var lbl = document.createElement('div');
                    lbl.className = 'bkbg-ttt-score-lbl';
                    lbl.style.color = titleColor;
                    lbl.textContent = s.label;
                    box.appendChild(val);
                    box.appendChild(lbl);
                    scoreRow.appendChild(box);
                });
                wrap.appendChild(scoreRow);
            }

            // Mode toggle
            var modeRow = document.createElement('div');
            modeRow.className = 'bkbg-ttt-mode-row';
            ['ai','pvp'].forEach(function (m) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-ttt-mode-btn';
                btn.textContent = m === 'ai' ? 'vs AI' : 'vs Player';
                btn.style.borderColor = accentColor;
                btn.style.background  = currentMode === m ? accentColor : 'transparent';
                btn.style.color       = currentMode === m ? '#fff' : accentColor;
                btn.addEventListener('click', function () {
                    if (currentMode !== m) { currentMode = m; resetGame(); }
                });
                modeRow.appendChild(btn);
            });
            wrap.appendChild(modeRow);

            // Status
            var status = document.createElement('div');
            status.className = 'bkbg-ttt-status';
            status.id = 'bkbg-ttt-status-' + uid;
            status.style.background = accentColor;
            status.style.color = '#fff';
            updateStatusEl(status);
            wrap.appendChild(status);

            // Board
            var boardEl = document.createElement('div');
            boardEl.className = 'bkbg-ttt-board';
            boardEl.id = 'bkbg-ttt-board-' + uid;

            var result = checkWinner(board);
            var winLine = result ? result.line : null;

            for (var i = 0; i < 9; i++) {
                (function (idx) {
                    var cell = document.createElement('div');
                    cell.className = 'bkbg-ttt-cell' + (board[idx] ? ' bkbg-ttt-taken' : '');
                    cell.style.background = cellBg;
                    cell.style.borderColor = gridLine;

                    if (winLine && winLine.indexOf(idx) !== -1) {
                        cell.classList.add('bkbg-ttt-win');
                        cell.style.background = winLineBg;
                    }

                    if (board[idx]) {
                        var sym = document.createElement('span');
                        sym.textContent = board[idx];
                        sym.style.color = board[idx] === playerSym ? xColor : oColor;
                        cell.appendChild(sym);
                    }

                    cell.addEventListener('click', function () { onCellClick(idx); });
                    boardEl.appendChild(cell);
                })(i);
            }
            wrap.appendChild(boardEl);

            // AI thinking dots
            var thinkEl = document.createElement('div');
            thinkEl.id = 'bkbg-ttt-think-' + uid;
            thinkEl.style.height = '24px';
            thinkEl.style.marginBottom = '8px';
            if (aiThinking) {
                var dots = document.createElement('div');
                dots.className = 'bkbg-ttt-thinking';
                for (var d = 0; d < 3; d++) {
                    var sp = document.createElement('span');
                    sp.style.background = accentColor;
                    dots.appendChild(sp);
                }
                thinkEl.appendChild(dots);
            }
            wrap.appendChild(thinkEl);

            // Actions
            var actions = document.createElement('div');
            actions.className = 'bkbg-ttt-actions';

            var resetBtn = document.createElement('button');
            resetBtn.className = 'bkbg-ttt-btn';
            resetBtn.style.background = accentColor;
            resetBtn.textContent = 'New Game';
            resetBtn.addEventListener('click', function () { resetGame(); });

            var clearBtn = document.createElement('button');
            clearBtn.className = 'bkbg-ttt-btn bkbg-ttt-btn-outline';
            clearBtn.style.borderColor = '#6b7280';
            clearBtn.style.color = '#6b7280';
            clearBtn.textContent = 'Reset Score';
            clearBtn.addEventListener('click', function () {
                score = { player: 0, ai: 0, draws: 0 };
                saveScore();
                render();
            });

            actions.appendChild(resetBtn);
            actions.appendChild(clearBtn);
            wrap.appendChild(actions);

            root.appendChild(wrap);
        }

        function updateStatusEl(el) {
            if (!el) return;
            var result = checkWinner(board);
            if (result) {
                var sym = result.sym;
                if (sym === playerSym) {
                    el.textContent = currentMode === 'ai' ? '🎉 You Win!' : '🎉 Player 1 Wins!';
                } else {
                    el.textContent = currentMode === 'ai' ? '🤖 AI Wins!' : '🎉 Player 2 Wins!';
                }
            } else if (isFull(board)) {
                el.textContent = "It's a Draw!";
            } else {
                if (currentMode === 'ai') {
                    el.textContent = currentPlayer === playerSym ? 'Your turn (' + playerSym + ')' : 'AI thinking…';
                } else {
                    el.textContent = (currentPlayer === player1 ? 'Player 1' : 'Player 2') + ' — ' + currentPlayer;
                }
            }
        }

        function onCellClick(idx) {
            if (gameOver || aiThinking || board[idx] !== '') return;
            if (currentMode === 'ai' && currentPlayer !== playerSym) return;

            placeSymbol(idx, currentPlayer);
        }

        function placeSymbol(idx, sym) {
            board[idx] = sym;
            var result = checkWinner(board);

            if (result) {
                gameOver = true;
                if (result.sym === playerSym) score.player++;
                else score.ai++;
                saveScore();
                render();
                return;
            }

            if (isFull(board)) {
                gameOver = true;
                score.draws++;
                saveScore();
                render();
                return;
            }

            // Switch turn
            currentPlayer = (currentPlayer === player1) ? player2 : player1;
            render();

            if (currentMode === 'ai' && currentPlayer === aiSym && !gameOver) {
                scheduleAI();
            }
        }

        function scheduleAI() {
            aiThinking = true;
            render();
            var delay = aiDiff === 'easy' ? 200 : (aiDiff === 'medium' ? 350 : 550);
            setTimeout(function () {
                aiThinking = false;
                var move;
                if (aiDiff === 'hard')        move = bestMoveHard(board.slice(), aiSym, playerSym);
                else if (aiDiff === 'medium')  move = bestMoveMedium(board.slice(), aiSym, playerSym);
                else                           move = bestMoveRandom(board);

                if (move !== undefined && move !== -1) {
                    placeSymbol(move, aiSym);
                }
            }, delay);
        }

        function resetGame() {
            board = ['','','','','','','','',''];
            currentPlayer = player1;
            gameOver      = false;
            aiThinking    = false;
            render();
        }

        resetGame();
    }

    function init() {
        document.querySelectorAll('.bkbg-ttt-app').forEach(function (root) {
            initBlock(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
