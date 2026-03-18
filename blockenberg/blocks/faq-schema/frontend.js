(function () {
    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    function initFaqSchema(wrap) {
        var allowMultiple = wrap.getAttribute('data-allow-multiple') === '1';
        var speed = parseInt(wrap.getAttribute('data-speed'), 10) || 300;
        var items = toArray(wrap.querySelectorAll('.bkbg-faq-item'));
        var questions = toArray(wrap.querySelectorAll('.bkbg-faq-question'));

        // Generate accessible IDs
        var blockId = 'bkbg-faq-' + Math.random().toString(36).substr(2, 9);

        questions.forEach(function (question, index) {
            var item = items[index];
            var answer = item ? item.querySelector('.bkbg-faq-answer') : null;

            var qId = blockId + '-q-' + index;
            var aId = blockId + '-a-' + index;

            question.id = qId;
            question.setAttribute('aria-controls', aId);

            if (answer) {
                answer.id = aId;
                answer.setAttribute('aria-labelledby', qId);

                // Set proper max-height based on initial state
                var isActive = item.classList.contains('is-active');
                if (isActive) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            }

            question.addEventListener('click', function () {
                var isExpanded = question.getAttribute('aria-expanded') === 'true';

                if (!allowMultiple && !isExpanded) {
                    // Close all other items
                    items.forEach(function (otherItem, otherIndex) {
                        if (otherIndex !== index) {
                            var otherQ = questions[otherIndex];
                            var otherA = otherItem.querySelector('.bkbg-faq-answer');
                            if (otherQ.getAttribute('aria-expanded') === 'true') {
                                otherQ.setAttribute('aria-expanded', 'false');
                                otherItem.classList.remove('is-active');
                                if (otherA) {
                                    otherA.setAttribute('aria-hidden', 'true');
                                    otherA.style.maxHeight = '0';
                                }
                            }
                        }
                    });
                }

                // Toggle current
                var newState = !isExpanded;
                question.setAttribute('aria-expanded', newState ? 'true' : 'false');
                item.classList.toggle('is-active', newState);

                if (answer) {
                    answer.setAttribute('aria-hidden', newState ? 'false' : 'true');
                    if (newState) {
                        // Force repaint to allow transition
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        // After transition, set to 'none' so auto-height changes work
                        answer.addEventListener('transitionend', function onEnd() {
                            if (item.classList.contains('is-active')) {
                                answer.style.maxHeight = 'none';
                            }
                            answer.removeEventListener('transitionend', onEnd);
                        });
                    } else {
                        // Must set exact height before animating to 0
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        requestAnimationFrame(function () {
                            requestAnimationFrame(function () {
                                answer.style.maxHeight = '0';
                            });
                        });
                    }
                }
            });
        });

        // Keyboard navigation (arrow keys between questions)
        questions.forEach(function (question, index) {
            question.addEventListener('keydown', function (e) {
                var nextIndex = -1;
                switch (e.key) {
                    case 'ArrowDown':
                        nextIndex = (index + 1) % questions.length;
                        e.preventDefault();
                        break;
                    case 'ArrowUp':
                        nextIndex = (index - 1 + questions.length) % questions.length;
                        e.preventDefault();
                        break;
                    case 'Home':
                        nextIndex = 0;
                        e.preventDefault();
                        break;
                    case 'End':
                        nextIndex = questions.length - 1;
                        e.preventDefault();
                        break;
                }
                if (nextIndex >= 0 && questions[nextIndex]) {
                    questions[nextIndex].focus();
                }
            });
        });
    }

    function init() {
        toArray(document.querySelectorAll('.bkbg-faq-wrap')).forEach(initFaqSchema);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
