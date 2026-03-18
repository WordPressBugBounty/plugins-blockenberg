(function () {
    'use strict';

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initAnimatedText(el) {
        var rawWords = el.getAttribute('data-words');
        var words;
        try { words = JSON.parse(rawWords); } catch (e) { return; }

        if (!words || words.length < 1) return;

        var effect        = el.getAttribute('data-effect') || 'typewriter';
        var typingSpeed   = parseInt(el.getAttribute('data-typing-speed'), 10)   || 80;
        var deletingSpeed = parseInt(el.getAttribute('data-deleting-speed'), 10) || 40;
        var pause         = parseInt(el.getAttribute('data-pause'), 10)           || 2000;
        var loop          = el.getAttribute('data-loop') !== '0';
        var showCursor    = el.getAttribute('data-cursor') !== '0';
        var cursorChar    = el.getAttribute('data-cursor-char') || '|';

        var wordText = el.querySelector('.bkbg-at-word-text');
        var cursorEl = el.querySelector('.bkbg-at-cursor');

        if (!wordText) return;

        // If reduced motion — just show first word statically
        if (reducedMotion) {
            wordText.textContent = words[0] || '';
            if (cursorEl) cursorEl.remove();
            return;
        }

        var currentIndex = 0;

        if (effect === 'typewriter') {
            // ── Typewriter engine ─────────────────────────────────────────────
            var currentText = '';
            var isDeleting = false;
            var isPaused = false;

            function tick() {
                var word = words[currentIndex] || '';
                if (isDeleting) {
                    currentText = word.substring(0, currentText.length - 1);
                } else {
                    currentText = word.substring(0, currentText.length + 1);
                }

                wordText.textContent = currentText;

                var nextDelay;

                if (!isDeleting && currentText === word) {
                    // Finished typing — pause then delete
                    if (!loop && currentIndex === words.length - 1) return; // stop at last word
                    nextDelay = pause;
                    isDeleting = true;
                } else if (isDeleting && currentText === '') {
                    // Finished deleting — move to next word
                    isDeleting = false;
                    currentIndex = (currentIndex + 1) % words.length;
                    nextDelay = 200;
                } else {
                    nextDelay = isDeleting ? deletingSpeed : typingSpeed;
                    // Natural randomness
                    nextDelay += Math.floor(Math.random() * 30) - 15;
                    if (nextDelay < 5) nextDelay = 5;
                }

                setTimeout(tick, nextDelay);
            }

            // Start after a brief initial delay
            setTimeout(tick, 600);

        } else {
            // ── CSS animation cycling ─────────────────────────────────────────
            var animDuration = 350; // ms — matches CSS animation durations

            function showWord(index) {
                wordText.textContent = words[index];
                el.classList.remove('is-leaving');
                el.classList.add('is-entering');

                // Remove entering class after animation
                setTimeout(function () {
                    el.classList.remove('is-entering');
                }, animDuration);
            }

            function nextWord() {
                // Trigger leave animation
                el.classList.add('is-leaving');

                setTimeout(function () {
                    // Advance index
                    if (!loop && currentIndex === words.length - 1) {
                        el.classList.remove('is-leaving');
                        return; // stop
                    }
                    currentIndex = (currentIndex + 1) % words.length;
                    showWord(currentIndex);
                }, animDuration);
            }

            // Show first word (no animation on first)
            showWord(0);

            // Start cycling
            if (words.length > 1) {
                setInterval(nextWord, pause + animDuration * 2);
            }
        }
    }

    function init() {
        var elements = Array.prototype.slice.call(document.querySelectorAll('.bkbg-at-animated-word'));
        elements.forEach(function (el) {
            if (el.getAttribute('data-words')) {
                initAnimatedText(el);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
