(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        if (typo.family) el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight) el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform) el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style) el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        ['size', 'lineHeight', 'letterSpacing', 'wordSpacing'].forEach(function (prop) {
            var unit = typo[prop + 'Unit'] || 'px';
            var d = typo[prop + 'Desktop'], t = typo[prop + 'Tablet'], m = typo[prop + 'Mobile'];
            var css = { size: 'font-size', lineHeight: 'line-height', letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing' }[prop];
            if (d !== undefined && d !== '') el.style.setProperty(prefix + css + '-d', d + unit);
            if (t !== undefined && t !== '') el.style.setProperty(prefix + css + '-t', t + unit);
            if (m !== undefined && m !== '') el.style.setProperty(prefix + css + '-m', m + unit);
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

    function luminance(hex) {
        var c = (hex || '#000').replace('#', '');
        return 0.299 * parseInt(c.slice(0, 2), 16) + 0.587 * parseInt(c.slice(2, 4), 16) + 0.114 * parseInt(c.slice(4, 6), 16);
    }

    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        var a = opts;
        var rawCards;
        try { rawCards = JSON.parse(a.cards); } catch (e) { rawCards = []; }

        var deck = rawCards.map(function (c) { return { id: c.id, front: c.front, back: c.back, known: false }; });
        var currentIndex = 0;
        var isFlipped = false;

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-fc-wrap';
        wrap.style.cssText = 'background:' + a.sectionBg + ';max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        wrap.setAttribute('tabindex', '-1');
        root.appendChild(wrap);
        typoCssVarsForEl(a.typoTitle, '--bkbg-flash-tt-', wrap);
        typoCssVarsForEl(a.typoSubtitle, '--bkbg-flash-ts-', wrap);
        typoCssVarsForEl(a.typoCard, '--bkbg-flash-tc-', wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-fc-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        if (a.showSubtitle) {
            var s = document.createElement('div');
            s.className = 'bkbg-fc-subtitle';
            s.style.color = a.subtitleColor;
            s.textContent = a.subtitle;
            wrap.appendChild(s);
        }

        var progressBarWrap = null;
        var progressBar = null;
        var progressLabel = null;

        if (a.showProgress) {
            var progressRow = document.createElement('div');
            progressRow.className = 'bkbg-fc-progress-row';
            var pLabel = document.createElement('span');
            pLabel.style.color = a.labelColor;
            pLabel.textContent = 'Progress';
            progressLabel = document.createElement('span');
            progressLabel.style.color = a.labelColor;
            progressRow.appendChild(pLabel);
            progressRow.appendChild(progressLabel);
            wrap.appendChild(progressRow);
            progressBarWrap = document.createElement('div');
            progressBarWrap.className = 'bkbg-fc-progress-bar-wrap';
            progressBar = document.createElement('div');
            progressBar.className = 'bkbg-fc-progress-bar';
            progressBar.style.background = a.knownColor;
            progressBarWrap.appendChild(progressBar);
            wrap.appendChild(progressBarWrap);
        }

        // Card scene
        var scene = document.createElement('div');
        scene.className = 'bkbg-fc-scene';
        scene.style.height = a.cardHeight + 'px';
        wrap.appendChild(scene);

        var card = document.createElement('div');
        card.className = 'bkbg-fc-card';
        card.style.height = a.cardHeight + 'px';
        scene.appendChild(card);

        var front = document.createElement('div');
        front.className = 'bkbg-fc-face bkbg-fc-front';
        front.style.cssText = 'background:' + a.cardFrontBg + ';color:' + a.labelColor + ';';
        card.appendChild(front);

        var back = document.createElement('div');
        back.className = 'bkbg-fc-face bkbg-fc-back';
        back.style.cssText = 'background:' + a.cardBackBg + ';color:' + a.cardBackColor + ';';
        card.appendChild(back);

        var flipHint = document.createElement('div');
        flipHint.className = 'bkbg-fc-flip-hint';
        flipHint.style.color = a.labelColor;
        flipHint.textContent = 'Click to flip';
        front.appendChild(flipHint);

        card.addEventListener('click', function () {
            isFlipped = !isFlipped;
            card.classList.toggle('bkbg-fc-flipped', isFlipped);
        });

        // Navigation
        var nav = document.createElement('div');
        nav.className = 'bkbg-fc-nav';
        wrap.appendChild(nav);

        var prevBtn = document.createElement('button');
        prevBtn.className = 'bkbg-fc-nav-btn';
        prevBtn.textContent = '←';
        prevBtn.setAttribute('aria-label', 'Previous card');
        nav.appendChild(prevBtn);

        if (a.showKnownBtn) {
            var knownBtn = document.createElement('button');
            knownBtn.className = 'bkbg-fc-known-btn';
            knownBtn.style.background = a.knownColor;
            knownBtn.textContent = '✓ Know it';
            knownBtn.addEventListener('click', function () {
                deck[currentIndex].known = true;
                render();
                if (currentIndex < deck.length - 1) {
                    currentIndex++;
                    isFlipped = false;
                    card.classList.remove('bkbg-fc-flipped');
                    render();
                } else {
                    showSummary();
                }
            });
            nav.appendChild(knownBtn);
        }

        var nextBtn = document.createElement('button');
        nextBtn.className = 'bkbg-fc-nav-btn';
        nextBtn.textContent = '→';
        nextBtn.setAttribute('aria-label', 'Next card');
        nav.appendChild(nextBtn);

        var counterRow = document.createElement('div');
        counterRow.className = 'bkbg-fc-counter-row';
        counterRow.style.color = a.labelColor;
        wrap.appendChild(counterRow);

        var counter = document.createElement('span');
        counter.className = 'bkbg-fc-counter';
        counterRow.appendChild(counter);

        if (a.showShuffleBtn) {
            var shuffleBtn = document.createElement('button');
            shuffleBtn.className = 'bkbg-fc-action-btn';
            shuffleBtn.style.cssText = 'border:1px solid ' + a.accentColor + ';color:' + a.accentColor + ';';
            shuffleBtn.textContent = '⇌ Shuffle';
            shuffleBtn.addEventListener('click', function () {
                deck = shuffle(deck);
                currentIndex = 0;
                isFlipped = false;
                card.classList.remove('bkbg-fc-flipped');
                render();
            });
            counterRow.appendChild(shuffleBtn);
        }

        var resetBtn = document.createElement('button');
        resetBtn.className = 'bkbg-fc-action-btn';
        resetBtn.style.cssText = 'border:1px solid #e5e7eb;color:' + a.subtitleColor + ';';
        resetBtn.textContent = '↺ Reset';
        resetBtn.addEventListener('click', function () {
            deck.forEach(function (c) { c.known = false; });
            currentIndex = 0;
            isFlipped = false;
            card.classList.remove('bkbg-fc-flipped');
            scene.style.display = '';
            nav.style.display = '';
            counterRow.style.display = '';
            if (skHint) skHint.style.display = '';
            if (summaryEl) summaryEl.remove(), summaryEl = null;
            render();
        });
        counterRow.appendChild(resetBtn);

        var skHint = null;
        if (a.showKeyboardHint) {
            skHint = document.createElement('div');
            skHint.className = 'bkbg-fc-keyboard-hint';
            skHint.style.color = a.subtitleColor;
            skHint.textContent = '← → Arrow keys to navigate  •  Space to flip';
            wrap.appendChild(skHint);
        }

        prevBtn.addEventListener('click', function () {
            if (currentIndex > 0) {
                currentIndex--;
                isFlipped = false;
                card.classList.remove('bkbg-fc-flipped');
                render();
            }
        });

        nextBtn.addEventListener('click', function () {
            if (currentIndex < deck.length - 1) {
                currentIndex++;
                isFlipped = false;
                card.classList.remove('bkbg-fc-flipped');
                render();
            }
        });

        var summaryEl = null;

        function showSummary() {
            scene.style.display = 'none';
            nav.style.display = 'none';
            counterRow.style.display = 'none';
            if (skHint) skHint.style.display = 'none';

            summaryEl = document.createElement('div');
            summaryEl.className = 'bkbg-fc-summary';
            summaryEl.style.color = a.labelColor;

            var knownCount = deck.filter(function (c) { return c.known; }).length;
            var icon = knownCount === deck.length ? '🎉' : '📚';
            summaryEl.innerHTML = '<div class="bkbg-fc-summary-icon">' + icon + '</div>' +
                '<h3 style="color:' + a.titleColor + '">Deck Complete!</h3>' +
                '<p>' + knownCount + ' of ' + deck.length + ' cards marked as known</p>';

            var rsBtn = document.createElement('button');
            rsBtn.className = 'bkbg-fc-restart-btn';
            rsBtn.style.background = a.accentColor;
            rsBtn.textContent = '↺ Study Again';
            rsBtn.addEventListener('click', function () {
                deck.forEach(function (c) { c.known = false; });
                currentIndex = 0;
                isFlipped = false;
                card.classList.remove('bkbg-fc-flipped');
                scene.style.display = '';
                nav.style.display = '';
                counterRow.style.display = '';
                if (skHint) skHint.style.display = '';
                summaryEl.remove();
                summaryEl = null;
                render();
            });
            summaryEl.appendChild(rsBtn);
            wrap.appendChild(summaryEl);
        }

        function render() {
            var c = deck[currentIndex];
            if (!c) return;

            // known badge
            front.querySelectorAll('.bkbg-fc-known-badge').forEach(function (el) { el.remove(); });
            if (c.known) {
                var badge = document.createElement('div');
                badge.className = 'bkbg-fc-known-badge';
                badge.style.cssText = 'background:' + a.knownColor + ';color:#fff;';
                badge.textContent = '✓ Known';
                front.prepend(badge);
            }

            // front text
            var frontText = front.querySelector('.bkbg-fc-text');
            if (!frontText) {
                frontText = document.createElement('div');
                frontText.className = 'bkbg-fc-text';
                front.insertBefore(frontText, flipHint);
            }
            frontText.textContent = c.front;

            // back text
            back.textContent = c.back;

            // counter
            counter.textContent = (currentIndex + 1) + ' / ' + deck.length;

            // nav buttons
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === deck.length - 1;

            // progress
            if (progressBar && progressLabel) {
                var knownCount = deck.filter(function (d) { return d.known; }).length;
                progressBar.style.width = (knownCount / deck.length * 100) + '%';
                progressLabel.textContent = knownCount + ' / ' + deck.length + ' known';
            }
        }

        // Keyboard nav
        document.addEventListener('keydown', function (e) {
            if (!root.closest(':focus-within') && document.activeElement !== document.body) {
                var rect = root.getBoundingClientRect();
                if (rect.top > window.innerHeight || rect.bottom < 0) return;
            }
            if (e.key === 'ArrowLeft') { prevBtn.click(); }
            if (e.key === 'ArrowRight') { nextBtn.click(); }
            if (e.key === ' ') { e.preventDefault(); card.click(); }
        });

        render();
    }

    function init() {
        document.querySelectorAll('.bkbg-fc-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
