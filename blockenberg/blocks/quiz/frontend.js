(function () {
    'use strict';

    document.querySelectorAll('.bkbg-qz-card').forEach(function (card) {
        var oneAtATime   = card.getAttribute('data-one-at-a-time') !== 'false';
        var shouldRandom = card.getAttribute('data-randomize')     === 'true';
        var progressStyle = card.getAttribute('data-progress-style') || 'bar';
        var showProgress  = card.getAttribute('data-show-progress') !== 'false';

        var questionsWrap  = card.querySelector('.bkbg-qz-questions-wrap');
        var resultsWrap    = card.querySelector('.bkbg-qz-results-wrap');
        var progressWrap   = card.querySelector('.bkbg-qz-progress-wrap');

        if (!questionsWrap || !resultsWrap) return;

        var questionEls = Array.prototype.slice.call(questionsWrap.querySelectorAll('.bkbg-qz-question'));
        var total = questionEls.length;
        if (total === 0) return;

        /* Randomise order if needed */
        if (shouldRandom) {
            questionEls.forEach(function (q) { q.parentNode.removeChild(q); });
            questionEls.sort(function () { return Math.random() - 0.5; });
            questionEls.forEach(function (q) { questionsWrap.appendChild(q); });
        }

        var answers = {};  /* { questionId: pointsValue } */
        var currentIdx = 0;

        /* ── Progress UI builder ─────────────────────────────────── */
        function buildProgressUI() {
            progressWrap.innerHTML = '';
            if (!showProgress) return;

            if (progressStyle === 'fraction') {
                var frac = document.createElement('div');
                frac.className = 'bkbg-qz-progress-fraction';
                frac.textContent = (currentIdx + 1) + ' / ' + total;
                progressWrap.appendChild(frac);

            } else if (progressStyle === 'dots') {
                var dotsRow = document.createElement('div');
                dotsRow.className = 'bkbg-qz-progress-dots';
                for (var d = 0; d < total; d++) {
                    var dot = document.createElement('div');
                    dot.className = 'bkbg-qz-progress-dot' + (d <= currentIdx ? ' is-done' : '');
                    dotsRow.appendChild(dot);
                }
                progressWrap.appendChild(dotsRow);

            } else { /* bar */
                var barRow = document.createElement('div');
                barRow.className = 'bkbg-qz-progress-bar-row';
                var leftLabel = document.createElement('span');
                leftLabel.textContent = 'Question ' + (currentIdx + 1);
                var rightLabel = document.createElement('span');
                rightLabel.textContent = total + ' total';
                barRow.appendChild(leftLabel);
                barRow.appendChild(rightLabel);

                var track = document.createElement('div');
                track.className = 'bkbg-qz-progress-track';
                var fill = document.createElement('div');
                fill.className = 'bkbg-qz-progress-fill';
                var pct = total > 1 ? (currentIdx / (total - 1)) * 100 : 0;
                fill.style.width = pct + '%';
                track.appendChild(fill);

                progressWrap.appendChild(barRow);
                progressWrap.appendChild(track);
            }
        }

        /* ── Show a specific question ─────────────────────────────── */
        function showQuestion(idx) {
            currentIdx = idx;
            questionEls.forEach(function (q, i) {
                var show = !oneAtATime || i === idx;
                q.style.display = show ? 'block' : 'none';
                q.setAttribute('aria-hidden', show ? 'false' : 'true');
            });
            buildProgressUI();
        }

        /* ── Compute total score and show result ──────────────────── */
        function submitQuiz() {
            var score = 0;
            Object.keys(answers).forEach(function (k) { score += (answers[k] || 0); });

            var resultEls = resultsWrap.querySelectorAll('.bkbg-qz-result');
            var matched = null;
            resultEls.forEach(function (r) {
                var min = parseInt(r.getAttribute('data-min'), 10);
                var max = parseInt(r.getAttribute('data-max'), 10);
                if (score >= min && score <= max) matched = r;
            });
            if (!matched && resultEls.length > 0) {
                /* fall back to first result */
                matched = resultEls[0];
            }

            /* Hide questions, show result */
            questionsWrap.style.display = 'none';
            progressWrap.innerHTML = '';
            resultsWrap.classList.remove('is-hidden');
            resultEls.forEach(function (r) {
                r.style.display = r === matched ? 'block' : 'none';
            });
        }

        /* ── Retake ───────────────────────────────────────────────── */
        resultsWrap.querySelectorAll('.bkbg-qz-retake').forEach(function (btn) {
            btn.addEventListener('click', function () {
                answers = {};
                currentIdx = 0;

                /* Reset question states */
                questionEls.forEach(function (q) {
                    q.querySelectorAll('.bkbg-qz-option').forEach(function (o) {
                        o.classList.remove('is-selected');
                    });
                    var nextBtn = q.querySelector('.bkbg-qz-btn-next');
                    if (nextBtn) nextBtn.disabled = true;
                });

                /* Hide results, show questions */
                resultsWrap.classList.add('is-hidden');
                resultsWrap.querySelectorAll('.bkbg-qz-result').forEach(function (r) { r.style.display = 'none'; });
                questionsWrap.style.display = 'block';
                showQuestion(0);
            });
        });

        /* ── Wire up each question ────────────────────────────────── */
        questionEls.forEach(function (questionEl, qi) {
            var qId      = questionEl.getAttribute('data-question-id') || String(qi);
            var options  = questionEl.querySelectorAll('.bkbg-qz-option');
            var nextBtn  = questionEl.querySelector('.bkbg-qz-btn-next');
            var isLast   = nextBtn && nextBtn.getAttribute('data-is-last') === 'true';

            options.forEach(function (opt) {
                opt.addEventListener('click', function () {
                    var pts = parseInt(opt.getAttribute('data-points'), 10) || 0;
                    answers[qId] = pts;

                    options.forEach(function (o) { o.classList.remove('is-selected'); });
                    opt.classList.add('is-selected');

                    if (nextBtn) nextBtn.disabled = false;
                });
            });

            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    if (nextBtn.disabled) return;
                    if (isLast) {
                        submitQuiz();
                    } else {
                        showQuestion(qi + 1);
                    }
                });
            }
        });

        /* ── Initial state ────────────────────────────────────────── */
        showQuestion(0);
    });
})();
