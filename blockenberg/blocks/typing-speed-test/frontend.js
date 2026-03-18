(function () {
    'use strict';

    var TEXTS = {
        easy: [
            'The sun is bright and the sky is blue. Birds fly over the trees and flowers bloom in the field. A gentle breeze blows through the leaves.',
            'She walked to the store to buy some fruit. The apples were red and the bananas were yellow. She also picked up some bread and milk.',
            'The cat sat on the mat and looked at the dog. The dog wagged its tail and ran around the yard. They were good friends who loved to play.'
        ],
        medium: [
            'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump in the fog.',
            'Technology is rapidly changing the way we live and work. Smartphones and computers have become essential tools for communication and productivity in modern society.',
            'Scientists have discovered that regular exercise improves both physical and mental health. Even a short daily walk can significantly reduce stress and boost mood levels.'
        ],
        hard: [
            'Cryptography encompasses the techniques used to secure communication in the presence of adversarial behavior. Modern cryptographic systems rely on mathematical problems believed to be computationally intractable.',
            'Quantum mechanics describes the behavior of matter and energy at the subatomic scale, where classical physics breaks down entirely. Particles can exhibit wave-particle duality and exist in superposition states.',
            'The Byzantine Generals Problem illustrates the challenge of achieving consensus in distributed systems where components may fail or act maliciously. Practical solutions form the basis of blockchain consensus algorithms.'
        ]
    };

    function getRank(wpm) {
        if (wpm >= 100) return { label: 'Stenographer',  emoji: '🏆', color: '#f59e0b' };
        if (wpm >= 80)  return { label: 'Professional',  emoji: '🥇', color: '#6366f1' };
        if (wpm >= 60)  return { label: 'Advanced',      emoji: '🥈', color: '#0ea5e9' };
        if (wpm >= 40)  return { label: 'Average',       emoji: '🥉', color: '#22c55e' };
        if (wpm >= 20)  return { label: 'Beginner',      emoji: '📝', color: '#f97316' };
        return              { label: 'Novice',           emoji: '🌱', color: '#ef4444' };
    }

    function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        var a = opts;
        var totalSeconds = parseInt(a.duration) || 60;
        var difficulty   = a.defaultDifficulty || 'medium';
        var targetText   = '';
        var typed        = '';
        var started      = false;
        var finished     = false;
        var timerInterval = null;
        var timeLeft     = totalSeconds;
        var errors       = 0;
        var totalTyped   = 0;

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-tst-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        root.appendChild(wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-tst-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }
        if (a.showSubtitle) {
            var s = document.createElement('div');
            s.className = 'bkbg-tst-subtitle';
            s.style.color = a.subtitleColor;
            s.textContent = a.subtitle;
            wrap.appendChild(s);
        }

        /* Stats bar */
        var statsBar = document.createElement('div');
        statsBar.className = 'bkbg-tst-stats';
        statsBar.style.background = a.cardBg;
        wrap.appendChild(statsBar);

        function makeStat(id, label) {
            var box = document.createElement('div');
            box.className = 'bkbg-tst-stat';
            var val = document.createElement('div');
            val.className = 'bkbg-tst-stat-val';
            val.id = 'bkbg-tst-' + id + '-' + Math.random().toString(36).slice(2);
            val.style.color = a.accentColor;
            val.textContent = id === 'time' ? totalSeconds + 's' : '–';
            var lbl = document.createElement('div');
            lbl.className = 'bkbg-tst-stat-lbl';
            lbl.style.color = a.subtitleColor;
            lbl.textContent = label;
            box.appendChild(val);
            box.appendChild(lbl);
            statsBar.appendChild(box);
            return val;
        }

        var timeEl    = makeStat('time', 'Time');
        var wpmEl     = a.showLiveWpm  ? makeStat('wpm',  'WPM')      : null;
        var accEl     = a.showAccuracy ? makeStat('acc',  'Accuracy')  : null;
        var errEl     = a.showErrors   ? makeStat('err',  'Errors')    : null;

        /* Time bar */
        var timeBarWrap = document.createElement('div');
        timeBarWrap.className = 'bkbg-tst-time-bar-wrap';
        wrap.appendChild(timeBarWrap);
        var timeBar = document.createElement('div');
        timeBar.className = 'bkbg-tst-time-bar';
        timeBar.style.cssText = 'width:100%;background:' + a.accentColor + ';';
        timeBarWrap.appendChild(timeBar);

        /* Difficulty buttons */
        var diffRow = null;
        if (a.showDifficultyBtn) {
            diffRow = document.createElement('div');
            diffRow.className = 'bkbg-tst-diff-btns';
            wrap.appendChild(diffRow);
            ['easy', 'medium', 'hard'].forEach(function (d) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-tst-diff-btn';
                btn.textContent = d.charAt(0).toUpperCase() + d.slice(1);
                setDiffStyle(btn, d === difficulty);
                btn.addEventListener('click', function () {
                    if (started) return;
                    difficulty = d;
                    diffRow.querySelectorAll('.bkbg-tst-diff-btn').forEach(function (b, i) {
                        setDiffStyle(b, ['easy','medium','hard'][i] === difficulty);
                    });
                    resetTest();
                });
                diffRow.appendChild(btn);
            });
        }

        function setDiffStyle(btn, active) {
            btn.style.cssText = 'background:' + (active ? a.accentColor : '#e5e7eb') + ';color:' + (active ? '#fff' : '#374151') + ';';
        }

        /* Text box */
        var textBox = document.createElement('div');
        textBox.className = 'bkbg-tst-text-box';
        textBox.style.cssText = 'background:' + a.textAreaBg + ';color:' + a.textAreaColor + ';';
        wrap.appendChild(textBox);

        /* Input */
        var inputEl = document.createElement('textarea');
        inputEl.className = 'bkbg-tst-input';
        inputEl.placeholder = 'Click here and start typing to begin the test…';
        inputEl.style.cssText = 'background:' + a.cardBg + ';color:' + a.labelColor + ';border-color:' + a.accentColor + ';';
        inputEl.disabled = false;
        wrap.appendChild(inputEl);

        /* Actions */
        var actionsRow = document.createElement('div');
        actionsRow.className = 'bkbg-tst-actions';
        wrap.appendChild(actionsRow);

        var startBtn = document.createElement('button');
        startBtn.className = 'bkbg-tst-btn';
        startBtn.style.background = a.accentColor;
        startBtn.textContent = '▶ Start Test';
        actionsRow.appendChild(startBtn);

        var resetBtn = document.createElement('button');
        resetBtn.className = 'bkbg-tst-btn bkbg-tst-btn-outline';
        resetBtn.style.cssText = 'color:' + a.accentColor + ';border-color:' + a.accentColor + ';display:none;';
        resetBtn.textContent = '↺ Try Again';
        actionsRow.appendChild(resetBtn);

        /* Results */
        var resultsEl = document.createElement('div');
        resultsEl.className = 'bkbg-tst-results';
        resultsEl.style.background = a.cardBg;
        wrap.appendChild(resultsEl);

        function renderTextBox() {
            textBox.innerHTML = '';
            for (var i = 0; i < targetText.length; i++) {
                var span = document.createElement('span');
                span.className = 'bkbg-tst-char';
                span.textContent = targetText[i] === ' ' ? '\u00a0' : targetText[i];

                if (i < typed.length) {
                    if (typed[i] === targetText[i]) {
                        span.className += ' bkbg-tst-char-correct';
                        span.style.color = a.correctColor;
                    } else {
                        span.className += ' bkbg-tst-char-error';
                        span.style.cssText = 'color:' + a.errorColor + ';background:rgba(239,68,68,0.15);';
                    }
                } else if (i === typed.length) {
                    span.className += ' bkbg-tst-char-cursor';
                    span.style.color = a.textAreaColor;
                    span.querySelector  = null;
                    var cursorStyle = document.createElement('style');
                    var uid = 'cur' + i;
                    span.style.position = 'relative';
                    var cursor = document.createElement('span');
                    cursor.style.cssText = 'position:absolute;left:0;top:2px;bottom:2px;width:2px;background:' + a.accentColor + ';border-radius:1px;animation:bkbg-tst-blink 1s step-end infinite;';
                    span.insertBefore(cursor, span.firstChild);
                } else {
                    span.style.color = a.textAreaColor;
                }
                textBox.appendChild(span);
            }
        }

        function calcWpm() {
            var correctChars = 0;
            for (var i = 0; i < typed.length && i < targetText.length; i++) {
                if (typed[i] === targetText[i]) correctChars++;
            }
            var elapsed = totalSeconds - timeLeft;
            if (elapsed === 0) return 0;
            return Math.round((correctChars / 5) / (elapsed / 60));
        }

        function calcAccuracy() {
            if (totalTyped === 0) return 100;
            var correct = totalTyped - errors;
            return Math.round((correct / totalTyped) * 100);
        }

        function updateStats() {
            if (wpmEl) wpmEl.textContent = calcWpm();
            if (accEl) accEl.textContent = calcAccuracy() + '%';
            if (errEl) errEl.textContent = errors;
        }

        function startTimer() {
            timerInterval = setInterval(function () {
                timeLeft--;
                var pct = (timeLeft / totalSeconds) * 100;
                timeBar.style.width = pct + '%';
                timeEl.textContent = timeLeft + 's';
                if (timeLeft <= 10) timeEl.style.color = a.errorColor;
                updateStats();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    endTest();
                }
            }, 1000);
        }

        function endTest() {
            finished = true;
            started = false;
            inputEl.disabled = true;
            startBtn.style.display = 'none';
            resetBtn.style.display = '';
            showResults();
        }

        function showResults() {
            var wpm = calcWpm();
            var acc = calcAccuracy();
            var rank = getRank(wpm);

            resultsEl.innerHTML = '';
            resultsEl.classList.add('bkbg-tst-show');

            var icon = document.createElement('div');
            icon.className = 'bkbg-tst-results-icon';
            icon.textContent = rank.emoji;
            resultsEl.appendChild(icon);

            var htitle = document.createElement('h3');
            htitle.style.cssText = 'margin:0 0 6px;color:' + a.titleColor + ';font-size:20px;';
            htitle.textContent = 'Test Complete!';
            resultsEl.appendChild(htitle);

            var grid = document.createElement('div');
            grid.className = 'bkbg-tst-results-grid';

            [
                { val: wpm,              lbl: 'WPM',      color: a.accentColor  },
                { val: acc + '%',        lbl: 'Accuracy', color: a.correctColor  },
                { val: errors,           lbl: 'Errors',   color: errors > 5 ? a.errorColor : a.correctColor }
            ].forEach(function (item) {
                var box = document.createElement('div');
                box.className = 'bkbg-tst-result-item';
                box.style.background = a.sectionBg;
                var v = document.createElement('div');
                v.className = 'bkbg-tst-result-val';
                v.style.color = item.color;
                v.textContent = item.val;
                var l = document.createElement('div');
                l.className = 'bkbg-tst-result-lbl';
                l.style.color = a.subtitleColor;
                l.textContent = item.lbl;
                box.appendChild(v);
                box.appendChild(l);
                grid.appendChild(box);
            });

            resultsEl.appendChild(grid);

            var rankBadge = document.createElement('div');
            rankBadge.className = 'bkbg-tst-rank';
            rankBadge.style.background = rank.color;
            rankBadge.textContent = 'Rank: ' + rank.label;
            resultsEl.appendChild(rankBadge);
        }

        function resetTest() {
            clearInterval(timerInterval);
            started = false;
            finished = false;
            timeLeft = totalSeconds;
            typed = '';
            errors = 0;
            totalTyped = 0;
            inputEl.value = '';
            inputEl.disabled = false;
            startBtn.style.display = '';
            startBtn.textContent = '▶ Start Test';
            resetBtn.style.display = 'none';
            timeEl.textContent = totalSeconds + 's';
            timeEl.style.color = a.accentColor;
            if (wpmEl) wpmEl.textContent = '–';
            if (accEl) accEl.textContent = '–';
            if (errEl) errEl.textContent = '–';
            timeBar.style.transition = 'none';
            timeBar.style.width = '100%';
            setTimeout(function () { timeBar.style.transition = 'width 1s linear'; }, 50);
            resultsEl.classList.remove('bkbg-tst-show');
            targetText = randomItem(TEXTS[difficulty] || TEXTS.medium);
            renderTextBox();
        }

        inputEl.addEventListener('focus', function () {
            if (!started && !finished) {
                started = true;
                startBtn.textContent = '■ Stop';
                startTimer();
            }
        });

        inputEl.addEventListener('input', function () {
            if (!started || finished) return;
            var newVal = inputEl.value;
            if (newVal.length > targetText.length) {
                inputEl.value = newVal.slice(0, targetText.length);
                return;
            }
            var delta = newVal.length - typed.length;
            if (delta > 0) {
                totalTyped += delta;
                var newChar = newVal[newVal.length - 1];
                var expected = targetText[newVal.length - 1];
                if (newChar !== expected) errors++;
            }
            typed = newVal;
            renderTextBox();
            updateStats();

            if (typed === targetText) {
                clearInterval(timerInterval);
                endTest();
            }
        });

        startBtn.addEventListener('click', function () {
            if (started) {
                clearInterval(timerInterval);
                endTest();
            } else {
                inputEl.focus();
            }
        });

        resetBtn.addEventListener('click', function () { resetTest(); });

        resetTest();
    }

    function init() {
        document.querySelectorAll('.bkbg-tst-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
