(function () {
    'use strict';

    var SPEEDS = { slow: 180, medium: 120, fast: 70, insane: 35 };

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
            var v = obj[k]; if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    function initBlock(root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch (e) {}

        var snakeColor    = opts.snakeColor    || '#22c55e';
        var snakeHeadColor= opts.snakeHeadColor|| '#16a34a';
        var foodColor     = opts.foodColor     || '#ef4444';
        var gridColor     = opts.gridColor     || '#f3f4f6';
        var boardBg       = opts.boardBg       || '#ffffff';
        var sectionBg     = opts.sectionBg     || '#f0fdf4';
        var accentColor   = opts.accentColor   || '#22c55e';
        var titleColor    = opts.titleColor    || '#14532d';
        var gridSize      = parseInt(opts.gridSize   || 20, 10);
        var canvasSize    = parseInt(opts.canvasSize || 400, 10);
        var wallsKill     = opts.wallsKill    === true;
        var showHighScore = opts.showHighScore !== false;
        var showControls  = opts.showControls !== false;
        var defaultSpeed  = opts.defaultSpeed  || 'medium';
        var fontSize      = opts.fontSize      || 28;
        var subtitleSize  = opts.subtitleSize  || 14;

        root.style.background   = sectionBg;
        root.style.borderRadius = '16px';
        root.style.padding      = '28px 20px';
        root.style.textAlign    = 'center';

        var titleEl = root.querySelector('.bkbg-snk-title');
        var subEl   = root.querySelector('.bkbg-snk-subtitle');
        if (titleEl) { titleEl.style.color = titleColor; titleEl.style.margin = '0 0 4px'; }
        if (subEl)   { subEl.style.color = titleColor + 'bb'; subEl.style.margin = '0 0 14px'; }

        // Apply typography CSS vars to root
        typoCssVarsForEl(root, opts.titleTypo, '--bksnk-tt-');
        typoCssVarsForEl(root, opts.subtitleTypo, '--bksnk-st-');

        var uid = Math.random().toString(36).slice(2);
        var highScoreKey = 'bkbg_snake_hs_' + uid;
        var highScore = parseInt(localStorage.getItem(highScoreKey) || 0, 10);

        var cell = canvasSize / gridSize;
        var currentSpeed = defaultSpeed;
        var snake, dir, nextDir, food, score, running, gameOver, loop;

        var inner = document.createElement('div');
        root.appendChild(inner);

        function buildUI() {
            inner.innerHTML = '';

            // Score row
            var scoreRow = document.createElement('div');
            scoreRow.className = 'bkbg-snk-score-row';
            var scoreEl = document.createElement('div');
            scoreEl.id = 'bkbg-snk-score-' + uid;
            scoreEl.textContent = 'Score: ' + (score || 0);
            scoreEl.style.color = titleColor;
            scoreRow.appendChild(scoreEl);
            if (showHighScore) {
                var hsEl = document.createElement('div');
                hsEl.id = 'bkbg-snk-hs-' + uid;
                hsEl.textContent = 'Best: ' + highScore;
                hsEl.style.color = accentColor;
                scoreRow.appendChild(hsEl);
            }
            inner.appendChild(scoreRow);

            // Speed tabs
            var speedRow = document.createElement('div');
            speedRow.className = 'bkbg-snk-speed-row';
            ['slow','medium','fast','insane'].forEach(function (sp) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-snk-speed-btn';
                btn.textContent = sp.charAt(0).toUpperCase() + sp.slice(1);
                btn.style.borderColor = accentColor;
                var active = sp === currentSpeed;
                btn.style.background = active ? accentColor : 'transparent';
                btn.style.color      = active ? '#fff' : accentColor;
                btn.addEventListener('click', function () {
                    currentSpeed = sp;
                    buildUI();
                    startGame();
                });
                speedRow.appendChild(btn);
            });
            inner.appendChild(speedRow);

            // Canvas
            var canvasWrap = document.createElement('div');
            canvasWrap.className = 'bkbg-snk-canvas-wrap';
            var canvas = document.createElement('canvas');
            canvas.className = 'bkbg-snk-canvas';
            canvas.width  = canvasSize;
            canvas.height = canvasSize;
            canvas.tabIndex = 0;
            canvas.style.borderColor = accentColor;
            canvas.style.maxWidth = '100%';
            canvasWrap.appendChild(canvas);
            inner.appendChild(canvasWrap);

            // Touch controls
            if (showControls) {
                var ctrls = document.createElement('div');
                ctrls.className = 'bkbg-snk-controls';
                var upRow = document.createElement('div');
                upRow.className = 'bkbg-snk-ctrl-row';
                var midRow = document.createElement('div');
                midRow.className = 'bkbg-snk-ctrl-row';

                function makeCtrl(label, action) {
                    var b = document.createElement('button');
                    b.className = 'bkbg-snk-ctrl-btn';
                    b.textContent = label;
                    b.style.borderColor = accentColor;
                    b.style.color       = accentColor;
                    b.addEventListener('click', action);
                    return b;
                }
                upRow.appendChild(makeCtrl('▲', function () { tryDir('UP'); }));
                midRow.appendChild(makeCtrl('◀', function () { tryDir('LEFT'); }));
                midRow.appendChild(makeCtrl('▼', function () { tryDir('DOWN'); }));
                midRow.appendChild(makeCtrl('▶', function () { tryDir('RIGHT'); }));
                ctrls.appendChild(upRow);
                ctrls.appendChild(midRow);
                inner.appendChild(ctrls);
            }

            // Actions
            var actions = document.createElement('div');
            actions.className = 'bkbg-snk-actions';
            var startBtn = document.createElement('button');
            startBtn.className = 'bkbg-snk-btn';
            startBtn.style.background = accentColor;
            startBtn.textContent = 'New Game';
            startBtn.addEventListener('click', function () { buildUI(); startGame(); });
            actions.appendChild(startBtn);
            inner.appendChild(actions);

            // Keyboard
            var handleKey = function (e) {
                if (!running) { if (e.key === ' ') { startGame(); } return; }
                var map = { ArrowUp:'UP', ArrowDown:'DOWN', ArrowLeft:'LEFT', ArrowRight:'RIGHT', w:'UP', s:'DOWN', a:'LEFT', d:'RIGHT' };
                if (map[e.key]) { e.preventDefault(); tryDir(map[e.key]); }
            };
            document.addEventListener('keydown', handleKey);

            // Draw initial idle state
            draw(canvas, null, null, false);

            return canvas;
        }

        function tryDir(d) {
            var opposite = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' };
            if (dir !== opposite[d]) nextDir = d;
        }

        function startGame() {
            clearInterval(loop);
            running  = true;
            gameOver = false;
            score    = 0;
            dir      = 'RIGHT';
            nextDir  = 'RIGHT';
            var mid = Math.floor(gridSize / 2);
            snake = [[mid, mid],[mid-1, mid],[mid-2, mid]];
            placeFood();
            updateScoreUI();

            var canvas = inner.querySelector('canvas');
            if (!canvas) return;

            loop = setInterval(function () {
                if (!running) { clearInterval(loop); return; }
                tick();
                draw(canvas, snake, food, true);
            }, SPEEDS[currentSpeed] || 120);
        }

        function tick() {
            dir = nextDir;
            var head = snake[0].slice();
            if (dir === 'UP')    head[1]--;
            if (dir === 'DOWN')  head[1]++;
            if (dir === 'LEFT')  head[0]--;
            if (dir === 'RIGHT') head[0]++;

            // Wall collision
            if (wallsKill) {
                if (head[0] < 0 || head[0] >= gridSize || head[1] < 0 || head[1] >= gridSize) {
                    endGame(); return;
                }
            } else {
                head[0] = (head[0] + gridSize) % gridSize;
                head[1] = (head[1] + gridSize) % gridSize;
            }

            // Self collision
            for (var i = 0; i < snake.length; i++) {
                if (snake[i][0] === head[0] && snake[i][1] === head[1]) { endGame(); return; }
            }

            snake.unshift(head);

            // Food eaten
            if (head[0] === food[0] && head[1] === food[1]) {
                score += 10;
                if (score > highScore) { highScore = score; localStorage.setItem(highScoreKey, highScore); }
                updateScoreUI();
                placeFood();
            } else {
                snake.pop();
            }
        }

        function placeFood() {
            var empty = [];
            for (var x = 0; x < gridSize; x++) {
                for (var y = 0; y < gridSize; y++) {
                    var onSnake = snake.some(function (s) { return s[0] === x && s[1] === y; });
                    if (!onSnake) empty.push([x, y]);
                }
            }
            food = empty[Math.floor(Math.random() * empty.length)] || [gridSize-1, gridSize-1];
        }

        function endGame() {
            running  = false;
            gameOver = true;
            clearInterval(loop);
            var canvas = inner.querySelector('canvas');
            if (canvas) drawGameOver(canvas);
        }

        function updateScoreUI() {
            var se = document.getElementById('bkbg-snk-score-' + uid);
            if (se) se.textContent = 'Score: ' + score;
            var he = document.getElementById('bkbg-snk-hs-' + uid);
            if (he) he.textContent = 'Best: ' + highScore;
        }

        function draw(canvas, snk, fd, started) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = boardBg;
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // Grid
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 0.5;
            for (var i = 0; i <= gridSize; i++) {
                ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvasSize); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(canvasSize, i * cell); ctx.stroke();
            }

            if (!started) {
                // Idle message
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                ctx.fillRect(canvasSize/2-90, canvasSize/2-20, 180, 40);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px system-ui';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Press SPACE or New Game', canvasSize/2, canvasSize/2);
                return;
            }

            // Food
            ctx.fillStyle = foodColor;
            ctx.beginPath();
            ctx.arc(fd[0]*cell + cell/2, fd[1]*cell + cell/2, cell/2 - 1, 0, Math.PI*2);
            ctx.fill();

            // Snake body
            ctx.fillStyle = snakeColor;
            for (var j = 1; j < snk.length; j++) {
                ctx.beginPath();
                ctx.roundRect(snk[j][0]*cell+1, snk[j][1]*cell+1, cell-2, cell-2, 3);
                ctx.fill();
            }

            // Snake head
            ctx.fillStyle = snakeHeadColor;
            ctx.beginPath();
            ctx.roundRect(snk[0][0]*cell+1, snk[0][1]*cell+1, cell-2, cell-2, 5);
            ctx.fill();
        }

        function drawGameOver(canvas) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Game Over', canvasSize/2, canvasSize/2 - 20);
            ctx.font = '16px system-ui';
            ctx.fillText('Score: ' + score, canvasSize/2, canvasSize/2 + 14);
            ctx.font = '14px system-ui';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText('Press Space or New Game', canvasSize/2, canvasSize/2 + 42);
        }

        buildUI();
    }

    function init() {
        document.querySelectorAll('.bkbg-snk-app').forEach(function (root) {
            initBlock(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
