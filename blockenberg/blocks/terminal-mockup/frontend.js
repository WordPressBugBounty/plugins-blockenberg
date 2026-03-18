(function () {
    'use strict';

    function splitGraphemes(str) {
        try {
            if (window.Intl && Intl.Segmenter) {
                var seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
                return Array.from(seg.segment(str), function (s) { return s.segment; });
            }
        } catch (e) {}
        return Array.from(str);
    }

    // WordPress's emoji script (twemoji) may replace some symbols (e.g. ✔) with <img>.
    // For Terminal Mockup we want to render text as text. U+FE0E forces text presentation.
    function forceTextPresentation(str) {
        if (!str) return str;
        return String(str).replace(/\u2714(?![\uFE0E\uFE0F])/g, '\u2714\uFE0E');
    }

    function initTerminal(el) {
        var typewriterOn = el.dataset.typewriter === '1';
        if (!typewriterOn) return;

        var speed = parseInt(el.dataset.speed, 10) || 35;
        var showCursor = el.dataset.cursor === '1';
        var lines = Array.from(el.querySelectorAll('.bkbg-term-line:not(.bkbg-term-line--blank), .bkbg-terminal-line:not(.bkbg-terminal-line--blank)'));
        var blanks = Array.from(el.querySelectorAll('.bkbg-term-line--blank, .bkbg-terminal-line--blank'));

        /* Hide all lines initially */
        lines.forEach(function (line) { line.classList.add('bkbg-tw-hidden'); });
        blanks.forEach(function (b) { b.style.visibility = 'hidden'; });

        var allNodes = Array.from(el.querySelectorAll('.bkbg-term-line, .bkbg-terminal-line'));
        var cursor = showCursor ? (el.querySelector('.bkbg-term-cursor') || el.querySelector('.bkbg-terminal-cursor')) : null;
        if (showCursor && !cursor) {
            cursor = document.createElement('span');
            cursor.className = 'bkbg-term-cursor';
        }

        function typeLine(lineEl, cb) {
            lineEl.classList.remove('bkbg-tw-hidden');
            lineEl.classList.add('bkbg-tw-typing');
            var textSpan = lineEl.querySelector('.bkbg-term-text') || lineEl.querySelector('.bkbg-terminal-text');
            if (!textSpan) {
                lineEl.classList.remove('bkbg-tw-typing');
                cb();
                return;
            }

            var fullText = textSpan.getAttribute('data-bkbg-fulltext');
            if (fullText === null) {
                fullText = textSpan.textContent;
                textSpan.setAttribute('data-bkbg-fulltext', fullText);
            }

            // Prevent ✔ -> <img class="emoji"> conversion.
            fullText = forceTextPresentation(fullText);

            var chars = splitGraphemes(fullText);

            textSpan.textContent = '';
            if (cursor) {
                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                try {
                    var col = window.getComputedStyle(textSpan).color;
                    cursor.style.background = col;
                    cursor.style.color = col;
                } catch (e) {}
                lineEl.appendChild(cursor);
            }

            var i = 0;
            function tick() {
                if (i < chars.length) {
                    textSpan.textContent += chars[i];
                    i++;
                    setTimeout(tick, speed + Math.random() * 12);
                } else {
                    lineEl.classList.remove('bkbg-tw-typing');
                    // Ensure the final rendered text is exact (no missing glyphs).
                    textSpan.textContent = fullText;
                    if (cursor && lineEl !== allNodes[allNodes.length - 1]) lineEl.removeChild(cursor);
                    cb();
                }
            }
            tick();
        }

        function playNode(idx) {
            if (idx >= allNodes.length) return;
            var node = allNodes[idx];
            if (node.classList.contains('bkbg-term-line--blank') || node.classList.contains('bkbg-terminal-line--blank')) {
                node.style.visibility = '';
                setTimeout(function () { playNode(idx + 1); }, speed * 2);
                return;
            }
            typeLine(node, function () {
                setTimeout(function () { playNode(idx + 1); }, speed * 3);
            });
        }

        playNode(0);
    }

    function observe(el) {
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        io.unobserve(entry.target);
                        initTerminal(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            io.observe(el);
        } else {
            initTerminal(el);
        }
    }

    document.querySelectorAll('.bkbg-terminal, .bkbg-terminal-window').forEach(observe);
}());
