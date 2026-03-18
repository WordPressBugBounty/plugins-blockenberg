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

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function init() {
        document.querySelectorAll('.bkbg-kc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                question: '',
                options: [],
                explanation: '',
                showExplanation: true,
                revealLabel: 'Reveal Answer',
                correctLabel: '✓ Correct!',
                incorrectLabel: '✗ Incorrect',
                allowRetry: true,
                retryLabel: 'Try Again',
                shuffleOptions: false,
                showIcon: true,
                icon: '💡',
                difficulty: '',
                topic: '',
                style: 'card',
                borderRadius: 12,
                bgColor: '#f8fafc',
                borderColor: '#e2e8f0',
                questionColor: '#0f172a',
                optionBg: '#ffffff',
                optionColor: '#334155',
                optionBorderColor: '#cbd5e1',
                correctBg: '#dcfce7',
                correctColor: '#15803d',
                incorrectBg: '#fee2e2',
                incorrectColor: '#b91c1c',
                accentColor: '#6366f1',
                explanationBg: '#eff6ff',
                explanationColor: '#1e40af',
                revealBg: '#6366f1',
                revealColor: '#ffffff'
            }, opts);

            var options = o.shuffleOptions ? shuffle(o.options) : o.options.slice();
            var revealed = false;
            var selected = null;

            // ── build block ──────────────────────────────────────────────────────
            var block = document.createElement('div');
            block.className = 'bkbg-kc-block bkbg-kc-style-' + o.style;
            block.style.background = o.bgColor;
            block.style.borderColor = o.borderColor;
            block.style.borderRadius = o.borderRadius + 'px';
            typoCssVarsForEl(block, o.questionTypo, '--bkbg-kc-q-');
            typoCssVarsForEl(block, o.optionTypo, '--bkbg-kc-o-');
            typoCssVarsForEl(block, o.resultTypo, '--bkbg-kc-r-');

            // Header
            var header = document.createElement('div');
            header.className = 'bkbg-kc-header';
            if (o.showIcon && o.icon) {
                var iconEl = document.createElement('span');
                iconEl.className = 'bkbg-kc-icon';
                iconEl.textContent = o.icon;
                header.appendChild(iconEl);
            }
            if (o.topic || o.difficulty) {
                var meta = document.createElement('div');
                meta.className = 'bkbg-kc-meta';
                if (o.topic) {
                    var topicEl = document.createElement('span');
                    topicEl.className = 'bkbg-kc-topic';
                    topicEl.textContent = o.topic;
                    topicEl.style.color = o.accentColor;
                    topicEl.style.borderColor = o.accentColor;
                    meta.appendChild(topicEl);
                }
                if (o.difficulty) {
                    var diffEl = document.createElement('span');
                    diffEl.className = 'bkbg-kc-difficulty';
                    diffEl.textContent = o.difficulty;
                    meta.appendChild(diffEl);
                }
                header.appendChild(meta);
            }
            block.appendChild(header);

            // Question
            var qEl = document.createElement('p');
            qEl.className = 'bkbg-kc-question';
            qEl.textContent = o.question;
            qEl.style.color = o.questionColor;
            block.appendChild(qEl);

            // Options
            var optionsWrap = document.createElement('div');
            optionsWrap.className = 'bkbg-kc-options';

            var optEls = options.map(function (opt, i) {
                var label = document.createElement('div');
                label.className = 'bkbg-kc-option';
                label.style.background = o.optionBg;
                label.style.color = o.optionColor;
                label.style.borderColor = o.optionBorderColor;
                label.style.borderRadius = Math.max(0, o.borderRadius - 4) + 'px';
                label.setAttribute('role', 'button');
                label.setAttribute('tabindex', '0');

                var letter = document.createElement('span');
                letter.className = 'bkbg-kc-opt-letter';
                letter.textContent = String.fromCharCode(65 + i);
                letter.style.background = o.accentColor;
                letter.style.color = '#fff';

                var txt = document.createElement('span');
                txt.className = 'bkbg-kc-opt-text';
                txt.textContent = opt.text;

                label.appendChild(letter);
                label.appendChild(txt);
                optionsWrap.appendChild(label);

                function pick() {
                    if (revealed) return;
                    selected = i;
                    optEls.forEach(function (el, j) {
                        el.classList.toggle('is-selected', j === i);
                        el.style.background = j === i ? o.optionBg : o.optionBg;
                        el.style.borderColor = j === i ? o.accentColor : o.optionBorderColor;
                    });
                }

                label.addEventListener('click', pick);
                label.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
                });

                return label;
            });

            block.appendChild(optionsWrap);

            // Result badge
            var resultEl = document.createElement('div');
            resultEl.className = 'bkbg-kc-result';
            block.appendChild(resultEl);

            // Explanation
            var explEl = document.createElement('div');
            explEl.className = 'bkbg-kc-explanation';
            explEl.style.background = o.explanationBg;
            explEl.style.color = o.explanationColor;
            explEl.style.borderRadius = Math.max(0, o.borderRadius - 4) + 'px';
            if (o.showExplanation && o.explanation) {
                var explStrong = document.createElement('strong');
                explStrong.textContent = 'Explanation: ';
                explEl.appendChild(explStrong);
                explEl.appendChild(document.createTextNode(o.explanation));
            }
            block.appendChild(explEl);

            // Actions
            var actionsEl = document.createElement('div');
            actionsEl.className = 'bkbg-kc-actions';

            var revealBtn = document.createElement('button');
            revealBtn.className = 'bkbg-kc-reveal-btn';
            revealBtn.textContent = o.revealLabel;
            revealBtn.style.background = o.revealBg;
            revealBtn.style.color = o.revealColor;
            revealBtn.style.borderRadius = Math.max(0, o.borderRadius - 2) + 'px';

            var retryBtn = document.createElement('button');
            retryBtn.className = 'bkbg-kc-retry-btn';
            retryBtn.textContent = o.retryLabel;
            retryBtn.style.borderRadius = Math.max(0, o.borderRadius - 2) + 'px';

            actionsEl.appendChild(revealBtn);
            if (o.allowRetry) actionsEl.appendChild(retryBtn);
            block.appendChild(actionsEl);

            function reveal() {
                revealed = true;
                revealBtn.style.display = 'none';

                optEls.forEach(function (el, i) {
                    var opt = options[i];
                    if (opt.correct) {
                        el.style.background = o.correctBg;
                        el.style.color = o.correctColor;
                        el.style.borderColor = o.correctColor;
                        el.classList.add('is-correct');
                        el.querySelector('.bkbg-kc-opt-letter').style.background = o.correctColor;
                    } else if (i === selected) {
                        el.style.background = o.incorrectBg;
                        el.style.color = o.incorrectColor;
                        el.style.borderColor = o.incorrectColor;
                        el.classList.add('is-incorrect');
                        el.querySelector('.bkbg-kc-opt-letter').style.background = o.incorrectColor;
                    }
                });

                var isCorrect = selected !== null && options[selected] && options[selected].correct;
                resultEl.textContent = isCorrect ? o.correctLabel : o.incorrectLabel;
                resultEl.style.color = isCorrect ? o.correctColor : o.incorrectColor;
                resultEl.classList.add('is-visible');

                if (o.showExplanation && o.explanation) {
                    explEl.classList.add('is-visible');
                }

                if (o.allowRetry) {
                    retryBtn.classList.add('is-visible');
                }
            }

            function retry() {
                revealed = false;
                selected = null;
                revealBtn.style.display = '';
                retryBtn.classList.remove('is-visible');
                resultEl.classList.remove('is-visible');
                explEl.classList.remove('is-visible');
                optEls.forEach(function (el, i) {
                    el.className = 'bkbg-kc-option';
                    el.style.background = o.optionBg;
                    el.style.color = o.optionColor;
                    el.style.borderColor = o.optionBorderColor;
                    el.querySelector('.bkbg-kc-opt-letter').style.background = o.accentColor;
                });
            }

            revealBtn.addEventListener('click', reveal);
            retryBtn.addEventListener('click', retry);

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
