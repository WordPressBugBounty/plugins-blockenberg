(function () {
    'use strict';

    var WORD_POOLS = {
        animals: {
            easy:   ['BEAR','WOLF','FROG','DUCK','LION','GOAT','CRAB','MOLE','NEWT','WREN'],
            medium: ['PARROT','JAGUAR','DONKEY','RABBIT','MONKEY','TOUCAN','WALRUS','FALCON'],
            hard:   ['ALLIGATOR','CHAMELEON','RHINOCEROS','CHIMPANZEE','CATERPILLAR','HUMMINGBIRD']
        },
        countries: {
            easy:   ['PERU','CUBA','IRAN','IRAQ','MALI','LAOS','OMAN','FIJI','CHAD','TOGO'],
            medium: ['FRANCE','BRAZIL','CANADA','MEXICO','GREECE','NORWAY','SWEDEN','TURKEY'],
            hard:   ['AUSTRALIA','INDONESIA','SWITZERLAND','NETHERLANDS','MOZAMBIQUE','PHILIPPINES']
        },
        foods: {
            easy:   ['RICE','BEEF','CORN','MILK','CAKE','TACO','SOUP','PLUM','LIME','BEET'],
            medium: ['POTATO','CARROT','TOMATO','SALMON','MUFFIN','QUINOA','SHRIMP','PAPAYA'],
            hard:   ['CROISSANT','ARTICHOKE','BRUSCHETTA','QUESADILLA','GUACAMOLE','PROSCIUTTO']
        },
        tech: {
            easy:   ['CODE','DATA','WIFI','BYTE','CHIP','NODE','LOOP','BOOT','HTML','JSON'],
            medium: ['PYTHON','DOCKER','GITHUB','KERNEL','CURSOR','SYNTAX','BINARY','ROUTER'],
            hard:   ['ALGORITHM','JAVASCRIPT','ENCRYPTION','KUBERNETES','BLOCKCHAIN','CRYPTOCURRENCY']
        }
    };

    var CATEGORIES = { animals: 'Animals', countries: 'Countries', foods: 'Foods', tech: 'Technology' };
    var DIFFICULTIES = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

    // Points per correct answer
    var PTS = { easy: 10, medium: 20, hard: 35 };

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function scrambleWord(word) {
        var letters = word.split('');
        var s = shuffle(letters).join('');
        if (s === word && word.length > 1) return scrambleWord(word);
        return s;
    }

    function initBlock(root) {
        var opts = {};
        try { opts = JSON.parse(root.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accentColor  = opts.accentColor  || '#f59e0b';
        var correctColor = opts.correctColor || '#22c55e';
        var wrongColor   = opts.wrongColor   || '#ef4444';
        var sectionBg    = opts.sectionBg    || '#fffbeb';
        var cardBg       = opts.cardBg       || '#ffffff';
        var titleColor   = opts.titleColor   || '#92400e';
        var buttonBg     = opts.buttonBg     || accentColor;
        var showTimer    = opts.showTimer   !== false;
        var showScore    = opts.showScore   !== false;
        var showStreak   = opts.showStreak  !== false;
        var hintsAllowed = parseInt(opts.hintsAllowed || 3, 10);
        var timeLimit    = parseInt(opts.timeLimit   || 60, 10);
        var fontSize     = opts.fontSize    || 28;
        var subtitleSize = opts.subtitleSize || 14;

        // Apply root styling
        root.style.background   = sectionBg;
        root.style.borderRadius = '16px';
        root.style.padding      = '28px 20px';
        root.style.textAlign    = 'center';
        root.style.setProperty('--bkbg-wsc-accent', accentColor);

        // Style existing title/subtitle rendered by save()
        var titleEl = root.querySelector('.bkbg-wsc-title');
        var subEl   = root.querySelector('.bkbg-wsc-subtitle');
        if (titleEl) { titleEl.style.color = titleColor; titleEl.style.margin = '0 0 4px'; }
        if (subEl)   { subEl.style.color = titleColor + 'bb'; subEl.style.margin = '0 0 16px'; }

        // Game state
        var currentCat   = opts.defaultCategory   || 'animals';
        var currentDiff  = opts.defaultDifficulty || 'medium';
        var wordQueue    = [];
        var currentWord  = '';
        var scrambled    = '';
        var score        = 0;
        var streak       = 0;
        var hintsLeft    = hintsAllowed;
        var timeLeft     = timeLimit;
        var timer        = null;
        var revealed     = [];   // indices revealed by hints
        var gameActive   = false;

        // Root inner container (after title/subtitle)
        var inner = document.createElement('div');
        root.appendChild(inner);

        // ---- DOM refs ----
        var scoreValEl, streakValEl, timerValEl, timerBarEl;
        var categoryRow, diffRow;
        var cardEl, categoryLbl, tilesRow, inputEl, feedbackEl;
        var hintBtn, skipBtn;
        var timerBarWrap;

        function buildUI() {
            inner.innerHTML = '';

            // Stats
            var stats = document.createElement('div');
            stats.className = 'bkbg-wsc-stats';

            if (showScore) {
                var scoreBox = mkStatBox(accentColor);
                scoreValEl = scoreBox.val;
                scoreValEl.textContent = score;
                scoreBox.lbl.textContent = 'Score';
                stats.appendChild(scoreBox.el);
            }
            if (showStreak) {
                var streakBox = mkStatBox('#f97316');
                streakValEl = streakBox.val;
                streakValEl.textContent = '🔥 ' + streak;
                streakBox.lbl.textContent = 'Streak';
                stats.appendChild(streakBox.el);
            }
            if (showTimer) {
                var timerBox = mkStatBox('#6366f1');
                timerValEl = timerBox.val;
                timerValEl.textContent = timeLeft + 's';
                timerBox.lbl.textContent = 'Time';
                stats.appendChild(timerBox.el);
            }
            inner.appendChild(stats);

            // Timer bar
            if (showTimer) {
                timerBarWrap = document.createElement('div');
                timerBarWrap.className = 'bkbg-wsc-timer-bar-wrap';
                timerBarEl = document.createElement('div');
                timerBarEl.className = 'bkbg-wsc-timer-bar';
                timerBarEl.style.width = '100%';
                timerBarEl.style.background = accentColor;
                timerBarWrap.appendChild(timerBarEl);
                inner.appendChild(timerBarWrap);
            }

            // Category tabs
            categoryRow = document.createElement('div');
            categoryRow.className = 'bkbg-wsc-tab-row';
            Object.keys(CATEGORIES).forEach(function (cat) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-wsc-tab';
                btn.textContent = CATEGORIES[cat];
                styleTab(btn, cat === currentCat);
                btn.addEventListener('click', function () { currentCat = cat; newRound(); });
                categoryRow.appendChild(btn);
            });
            inner.appendChild(categoryRow);

            // Difficulty tabs
            diffRow = document.createElement('div');
            diffRow.className = 'bkbg-wsc-tab-row';
            Object.keys(DIFFICULTIES).forEach(function (d) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-wsc-tab';
                btn.textContent = DIFFICULTIES[d];
                styleTab(btn, d === currentDiff);
                btn.addEventListener('click', function () { currentDiff = d; newRound(); });
                diffRow.appendChild(btn);
            });
            inner.appendChild(diffRow);

            // Card
            cardEl = document.createElement('div');
            cardEl.className = 'bkbg-wsc-card';
            cardEl.style.background = cardBg;

            categoryLbl = document.createElement('div');
            categoryLbl.className = 'bkbg-wsc-category';
            categoryLbl.style.color = titleColor + '88';
            cardEl.appendChild(categoryLbl);

            tilesRow = document.createElement('div');
            tilesRow.className = 'bkbg-wsc-tiles';
            cardEl.appendChild(tilesRow);

            inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.className = 'bkbg-wsc-input';
            inputEl.placeholder = 'Type your answer…';
            inputEl.setAttribute('autocomplete', 'off');
            inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkAnswer(); });
            cardEl.appendChild(inputEl);

            feedbackEl = document.createElement('div');
            feedbackEl.className = 'bkbg-wsc-feedback';
            cardEl.appendChild(feedbackEl);

            inner.appendChild(cardEl);

            // Actions
            var actions = document.createElement('div');
            actions.className = 'bkbg-wsc-actions';

            var checkBtn = document.createElement('button');
            checkBtn.className = 'bkbg-wsc-btn';
            checkBtn.style.background = accentColor;
            checkBtn.textContent = 'Check';
            checkBtn.addEventListener('click', checkAnswer);
            actions.appendChild(checkBtn);

            hintBtn = document.createElement('button');
            hintBtn.className = 'bkbg-wsc-btn bkbg-wsc-btn-outline';
            hintBtn.style.borderColor = accentColor;
            hintBtn.style.color = accentColor;
            hintBtn.addEventListener('click', useHint);
            actions.appendChild(hintBtn);

            skipBtn = document.createElement('button');
            skipBtn.className = 'bkbg-wsc-btn bkbg-wsc-btn-outline';
            skipBtn.style.borderColor = '#6b7280';
            skipBtn.style.color = '#6b7280';
            skipBtn.textContent = 'Skip';
            skipBtn.addEventListener('click', function () {
                streak = 0;
                updateStreak();
                newRound();
            });
            actions.appendChild(skipBtn);

            inner.appendChild(actions);
        }

        function mkStatBox(color) {
            var box = document.createElement('div');
            box.className = 'bkbg-wsc-stat';
            box.style.background = cardBg;
            box.style.borderTop = '4px solid ' + color;
            var val = document.createElement('div');
            val.className = 'bkbg-wsc-stat-val';
            val.style.color = color;
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-wsc-stat-lbl';
            lbl.style.color = titleColor;
            box.appendChild(val);
            box.appendChild(lbl);
            return { el: box, val: val, lbl: lbl };
        }

        function styleTab(btn, active) {
            btn.style.borderColor = accentColor;
            btn.style.background  = active ? accentColor : 'transparent';
            btn.style.color       = active ? '#fff' : accentColor;
        }

        function getWordPool() {
            var pool = (WORD_POOLS[currentCat] || WORD_POOLS['animals'])[currentDiff] || WORD_POOLS['animals']['medium'];
            return shuffle(pool.slice());
        }

        function newRound() {
            clearInterval(timer);
            if (!wordQueue.length) wordQueue = getWordPool();
            currentWord = wordQueue.shift();
            scrambled   = scrambleWord(currentWord);
            revealed    = [];
            hintsLeft   = hintsAllowed;
            timeLeft    = timeLimit;
            gameActive  = true;

            // Refresh tabs
            refreshTabs();

            // Category label
            if (categoryLbl) {
                categoryLbl.textContent = CATEGORIES[currentCat] + ' — ' + DIFFICULTIES[currentDiff];
            }

            // Tiles
            renderTiles();

            // Input
            if (inputEl) {
                inputEl.value = '';
                inputEl.className = 'bkbg-wsc-input';
                inputEl.focus();
            }

            // Feedback
            if (feedbackEl) feedbackEl.textContent = '';

            // Hint button
            updateHintBtn();

            // Timer
            if (showTimer) {
                updateTimerDisplay();
                timer = setInterval(function () {
                    if (!gameActive) { clearInterval(timer); return; }
                    timeLeft--;
                    updateTimerDisplay();
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        gameActive = false;
                        showGameOver();
                    }
                }, 1000);
            }
        }

        function refreshTabs() {
            if (!categoryRow || !diffRow) return;
            var catBtns  = categoryRow.querySelectorAll('.bkbg-wsc-tab');
            var catKeys  = Object.keys(CATEGORIES);
            catBtns.forEach(function (btn, i) { styleTab(btn, catKeys[i] === currentCat); });

            var diffBtns = diffRow.querySelectorAll('.bkbg-wsc-tab');
            var diffKeys = Object.keys(DIFFICULTIES);
            diffBtns.forEach(function (btn, i) { styleTab(btn, diffKeys[i] === currentDiff); });
        }

        function renderTiles() {
            if (!tilesRow) return;
            tilesRow.innerHTML = '';
            scrambled.split('').forEach(function (ch, i) {
                var tile = document.createElement('div');
                tile.className = 'bkbg-wsc-tile';
                tile.style.borderColor = accentColor;
                tile.style.color       = accentColor;
                tile.style.background  = sectionBg;
                // If hint revealed this index in the ANSWER, mark it
                if (revealed.indexOf(i) !== -1) {
                    tile.classList.add('bkbg-wsc-hint');
                }
                tile.textContent = ch;
                tilesRow.appendChild(tile);
            });
        }

        function updateTimerDisplay() {
            if (timerValEl) timerValEl.textContent = timeLeft + 's';
            if (timerBarEl) {
                var pct = (timeLeft / timeLimit) * 100;
                timerBarEl.style.width = pct + '%';
                timerBarEl.style.background = pct > 50 ? accentColor : (pct > 25 ? '#f97316' : '#ef4444');
            }
        }

        function updateHintBtn() {
            if (!hintBtn) return;
            hintBtn.textContent = '💡 Hint (' + hintsLeft + ')';
            hintBtn.disabled = (hintsLeft <= 0);
            hintBtn.style.opacity = hintsLeft > 0 ? '1' : '0.4';
        }

        function updateScore() { if (scoreValEl) scoreValEl.textContent = score; }
        function updateStreak() { if (streakValEl) streakValEl.textContent = '🔥 ' + streak; }

        function checkAnswer() {
            if (!gameActive) return;
            var ans = (inputEl.value || '').trim().toUpperCase();
            if (!ans) return;

            if (ans === currentWord) {
                var pts = PTS[currentDiff] || 10;
                var hintPenalty = (hintsAllowed - hintsLeft) * 2;
                score += Math.max(1, pts - hintPenalty);
                streak++;
                updateScore();
                updateStreak();
                feedback('✅ Correct! +' + Math.max(1, pts - hintPenalty) + ' pts', correctColor);
                inputEl.className = 'bkbg-wsc-input bkbg-wsc-correct';
                gameActive = false;
                clearInterval(timer);
                setTimeout(function () {
                    inputEl.className = 'bkbg-wsc-input';
                    newRound();
                }, 900);
            } else {
                feedback('❌ Try again!', wrongColor);
                inputEl.className = 'bkbg-wsc-input bkbg-wsc-wrong';
                setTimeout(function () { inputEl.className = 'bkbg-wsc-input'; }, 500);
                streak = 0;
                updateStreak();
            }
        }

        function useHint() {
            if (hintsLeft <= 0 || !gameActive) return;
            // Reveal next letter in the answer that hasn't been revealed yet
            for (var i = 0; i < currentWord.length; i++) {
                if (revealed.indexOf(i) === -1) {
                    revealed.push(i);
                    hintsLeft--;
                    break;
                }
            }
            // Show revealed letters in tiles
            // Re-map: scrambled[i] → answer hint overlay
            // Actually we show a "cheat" version: replace tile at returned index with answer letter
            var tiles = tilesRow.querySelectorAll('.bkbg-wsc-tile');
            // Find a tile showing a letter that doesn't match its answer position
            // Simpler: replace revealed.length-th tile with answer char
            var ri = revealed[revealed.length - 1];
            if (tiles[ri]) {
                tiles[ri].textContent = currentWord[ri];
                tiles[ri].classList.add('bkbg-wsc-hint');
            }
            updateHintBtn();
            feedback('💡 Hint used! Letter revealed.', accentColor);
        }

        function feedback(msg, color) {
            if (!feedbackEl) return;
            feedbackEl.textContent = msg;
            feedbackEl.style.color = color;
        }

        function showGameOver() {
            clearInterval(timer);
            inner.innerHTML = '';

            var go = document.createElement('div');
            go.className = 'bkbg-wsc-gameover';

            var emoji = document.createElement('div');
            emoji.className = 'bkbg-wsc-gameover-emoji';
            emoji.textContent = streak >= 5 ? '🏆' : score > 0 ? '🎉' : '😅';

            var t = document.createElement('div');
            t.className = 'bkbg-wsc-gameover-title';
            t.style.color = titleColor;
            t.textContent = 'Time\'s Up!';

            var s = document.createElement('div');
            s.className = 'bkbg-wsc-gameover-score';
            s.style.color = accentColor;
            s.textContent = 'Your score: ' + score + ' pts   |   Best streak: ' + streak;

            var replayBtn = document.createElement('button');
            replayBtn.className = 'bkbg-wsc-btn';
            replayBtn.style.background = accentColor;
            replayBtn.textContent = 'Play Again';
            replayBtn.addEventListener('click', function () {
                score = 0; streak = 0; timeLeft = timeLimit; wordQueue = [];
                buildUI();
                newRound();
            });

            go.appendChild(emoji);
            go.appendChild(t);
            go.appendChild(s);
            go.appendChild(replayBtn);
            inner.appendChild(go);
        }

        buildUI();
        newRound();
    }

    function init() {
        document.querySelectorAll('.bkbg-wsc-app').forEach(function (root) {
            initBlock(root);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
