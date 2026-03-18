(function () {
    'use strict';

    var THEMES = {
        animals:  ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐸'],
        food:     ['🍕','🍔','🍟','🌮','🌯','🍜','🍣','🍩','🍪','🎂','🍦','🍫'],
        nature:   ['🌸','🌺','🌻','🌹','🌷','🍀','🍁','🍂','🌿','🎋','🌵','🌴'],
        space:    ['🚀','🌍','🌙','⭐','☀️','🪐','🌟','💫','🌌','🔭','👨‍🚀','🛸'],
        sports:   ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🎯'],
        symbols:  ['❤️','⚡','🔥','💎','🎵','🌈','💡','🔑','🎭','🎨','🎪','🎲']
    };

    var DIFFICULTIES = {
        easy:   { pairs: 6,  cols: 3 },
        medium: { pairs: 8,  cols: 4 },
        hard:   { pairs: 12, cols: 6 }
    };

    var STORAGE_KEY = 'bkbg_memory_best';

    function getBest(uid, diff) {
        try {
            var raw = localStorage.getItem(STORAGE_KEY + '_' + uid + '_' + diff);
            return raw ? parseInt(raw) : null;
        } catch (e) { return null; }
    }

    function setBest(uid, diff, moves) {
        try { localStorage.setItem(STORAGE_KEY + '_' + uid + '_' + diff, moves); } catch (e) {}
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    function formatTime(secs) {
        var m = Math.floor(secs / 60), s = secs % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }
        var a = opts;

        var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style', decoration:'text-decoration', transform:'text-transform', sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        function typoCssVarsForEl(el, typo, prefix) {
            if (!typo || typeof typo !== 'object') return;
            Object.keys(_typoKeys).forEach(function (k) {
                if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], typo[k]);
            });
        }
        var uid = root.getAttribute('data-uid') || ('mem' + Math.random().toString(36).slice(2));
        root.setAttribute('data-uid', uid);

        typoCssVarsForEl(root, a.titleTypo, '--bkbg-mem-tt-');
        typoCssVarsForEl(root, a.subtitleTypo, '--bkbg-mem-st-');

        var difficulty  = a.defaultDifficulty || 'medium';
        var theme       = a.defaultTheme      || 'animals';
        var flipDelay   = parseInt(a.flipDelay) || 900;

        /* State */
        var cards = [];
        var flipped = [];
        var matched = [];
        var moves = 0;
        var seconds = 0;
        var timerInterval = null;
        var locked = false;
        var gameStarted = false;

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mem-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        /* Title */
        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-mem-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }
        if (a.showSubtitle) {
            var sub = document.createElement('div');
            sub.className = 'bkbg-mem-subtitle';
            sub.style.color = a.subtitleColor;
            sub.textContent = a.subtitle;
            wrap.appendChild(sub);
        }

        /* Win banner */
        var winBanner = document.createElement('div');
        winBanner.className = 'bkbg-mem-win';
        winBanner.style.background = a.cardMatched;
        winBanner.innerHTML = '<span class="bkbg-mem-win-icon">🎉</span>' +
            '<div class="bkbg-mem-win-title">You Win!</div>' +
            '<div class="bkbg-mem-win-stats" id="bkbg-mem-winstats-' + uid + '"></div>';
        wrap.appendChild(winBanner);

        /* Stats */
        var statsRow = document.createElement('div');
        statsRow.className = 'bkbg-mem-stats';
        wrap.appendChild(statsRow);

        function makeStat(id, label) {
            var box = document.createElement('div');
            box.className = 'bkbg-mem-stat';
            box.style.background = a.cardBg;
            var val = document.createElement('div');
            val.className = 'bkbg-mem-stat-val';
            val.id = 'bkbg-mem-' + id + '-' + uid;
            val.style.color = a.accentColor;
            val.textContent = id === 'time' ? '0:00' : (id === 'best' ? '—' : '0');
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-mem-stat-lbl';
            lbl.style.color = a.subtitleColor;
            lbl.textContent = label;
            box.appendChild(val);
            box.appendChild(lbl);
            statsRow.appendChild(box);
            return val;
        }

        var timeEl  = a.showTimer     ? makeStat('time', 'Time')  : null;
        var movesEl = a.showMoves     ? makeStat('moves', 'Moves') : null;
        var bestEl  = a.showBestScore ? makeStat('best', 'Best')   : null;

        function updateBestDisplay() {
            if (!bestEl) return;
            var b = getBest(uid, difficulty);
            bestEl.textContent = b !== null ? b + ' moves' : '—';
        }
        updateBestDisplay();

        /* Difficulty selectors */
        var diffRow = document.createElement('div');
        diffRow.className = 'bkbg-mem-selectors';
        wrap.appendChild(diffRow);

        ['easy','medium','hard'].forEach(function (d) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-mem-sel-btn';
            btn.textContent = d.charAt(0).toUpperCase() + d.slice(1);
            setDiffBtnStyle(btn, d === difficulty);
            btn.addEventListener('click', function () {
                if (gameStarted && matched.length < cards.length && !confirm('Start new game?')) return;
                difficulty = d;
                updateDiffButtons();
                resetGame();
            });
            diffRow.appendChild(btn);
        });

        /* Theme selectors */
        var themeNames = Object.keys(THEMES);
        var themeRow = document.createElement('div');
        themeRow.className = 'bkbg-mem-selectors';
        themeRow.style.marginTop = '-4px';
        wrap.appendChild(themeRow);

        themeNames.forEach(function (t) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-mem-sel-btn';
            btn.style.fontSize = '11px';
            btn.textContent = t.charAt(0).toUpperCase() + t.slice(1) + ' ' + THEMES[t][0];
            setThemeBtnStyle(btn, t === theme);
            btn.addEventListener('click', function () {
                if (gameStarted && matched.length < cards.length && !confirm('Change theme?')) return;
                theme = t;
                updateThemeButtons();
                resetGame();
            });
            themeRow.appendChild(btn);
        });

        function setDiffBtnStyle(btn, active) {
            btn.style.cssText = 'border-color:' + a.accentColor + ';background:' + (active ? a.accentColor : 'transparent') + ';color:' + (active ? '#fff' : a.accentColor) + ';padding:5px 14px;border-radius:20px;border:2px solid;font-size:13px;font-weight:600;cursor:pointer;';
        }
        function setThemeBtnStyle(btn, active) {
            btn.style.cssText = 'border-color:' + a.accentColor + ';background:' + (active ? a.accentColor + '22' : 'transparent') + ';color:' + a.accentColor + ';padding:4px 10px;border-radius:20px;border:2px solid;font-size:11px;font-weight:600;cursor:pointer;' + (active ? 'outline:2px solid ' + a.accentColor + ';' : '');
        }

        function updateDiffButtons() {
            diffRow.querySelectorAll('.bkbg-mem-sel-btn').forEach(function (btn, i) {
                setDiffBtnStyle(btn, ['easy','medium','hard'][i] === difficulty);
            });
        }
        function updateThemeButtons() {
            themeRow.querySelectorAll('.bkbg-mem-sel-btn').forEach(function (btn, i) {
                setThemeBtnStyle(btn, themeNames[i] === theme);
            });
        }

        /* Card grid */
        var grid = document.createElement('div');
        grid.className = 'bkbg-mem-grid';
        wrap.appendChild(grid);

        /* Actions */
        var actionsEl = document.createElement('div');
        actionsEl.className = 'bkbg-mem-actions';
        wrap.appendChild(actionsEl);

        var startBtn = document.createElement('button');
        startBtn.className = 'bkbg-mem-btn';
        startBtn.style.background = a.accentColor;
        startBtn.textContent = '▶ New Game';
        startBtn.addEventListener('click', function () { resetGame(); });
        actionsEl.appendChild(startBtn);

        function resetGame() {
            clearInterval(timerInterval);
            var cfg = DIFFICULTIES[difficulty] || DIFFICULTIES.medium;
            var pool = (THEMES[theme] || THEMES.animals).slice(0, cfg.pairs);
            var all = shuffle(pool.concat(pool));

            cards   = [];
            flipped = [];
            matched = [];
            moves   = 0;
            seconds = 0;
            locked  = false;
            gameStarted = false;

            if (timeEl)  timeEl.textContent  = '0:00';
            if (movesEl) movesEl.textContent = '0';
            updateBestDisplay();
            winBanner.classList.remove('bkbg-mem-win-show');

            grid.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', 1fr)';
            grid.innerHTML = '';

            all.forEach(function (emoji, idx) {
                var card = document.createElement('div');
                card.className = 'bkbg-mem-card';
                card.dataset.idx = idx;
                card.dataset.emoji = emoji;

                var inner = document.createElement('div');
                inner.className = 'bkbg-mem-card-inner';

                var back = document.createElement('div');
                back.className = 'bkbg-mem-card-back';
                back.style.background = a.cardBack;
                back.textContent = '✦';

                var front = document.createElement('div');
                front.className = 'bkbg-mem-card-front';
                front.style.background = a.cardFront;
                front.textContent = emoji;

                inner.appendChild(back);
                inner.appendChild(front);
                card.appendChild(inner);

                card.addEventListener('click', function () { onCardClick(card); });
                grid.appendChild(card);
                cards.push(card);
            });
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(function () {
                seconds++;
                if (timeEl) timeEl.textContent = formatTime(seconds);
            }, 1000);
        }

        function onCardClick(card) {
            if (locked) return;
            if (card.classList.contains('bkbg-mem-flipped')) return;
            if (card.classList.contains('bkbg-mem-matched')) return;
            if (flipped.length >= 2) return;

            if (!gameStarted) { gameStarted = true; startTimer(); }

            card.classList.add('bkbg-mem-flipped');
            flipped.push(card);

            if (flipped.length === 2) {
                moves++;
                if (movesEl) movesEl.textContent = moves;
                checkMatch();
            }
        }

        function checkMatch() {
            var a2 = flipped[0].dataset.emoji;
            var b2 = flipped[1].dataset.emoji;
            if (a2 === b2) {
                /* Match */
                flipped.forEach(function (c) {
                    c.classList.add('bkbg-mem-matched');
                    c.querySelector('.bkbg-mem-card-front').style.background = a.cardMatched;
                    matched.push(c);
                });
                flipped = [];
                if (matched.length === cards.length) { onWin(); }
            } else {
                /* No match — shake and flip back */
                locked = true;
                flipped.forEach(function (c) { c.classList.add('bkbg-mem-wrong'); });
                setTimeout(function () {
                    flipped.forEach(function (c) {
                        c.classList.remove('bkbg-mem-flipped', 'bkbg-mem-wrong');
                    });
                    flipped = [];
                    locked  = false;
                }, flipDelay);
            }
        }

        function onWin() {
            clearInterval(timerInterval);
            timerInterval = null;
            /* Best score */
            var prev = getBest(uid, difficulty);
            if (prev === null || moves < prev) { setBest(uid, difficulty, moves); }
            updateBestDisplay();
            var statsNode = root.querySelector('#bkbg-mem-winstats-' + uid);
            if (statsNode) statsNode.textContent = moves + ' moves · ' + formatTime(seconds);
            winBanner.classList.add('bkbg-mem-win-show');
            /* Scroll to banner */
            winBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        resetGame();
    }

    function init() {
        document.querySelectorAll('.bkbg-mem-app').forEach(initBlock);
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();
