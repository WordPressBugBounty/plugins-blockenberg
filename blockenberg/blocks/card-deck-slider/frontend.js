(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    document.querySelectorAll('.bkbg-cds-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var cards = opts.cards || [];
        if (!cards.length) return;

        var deckStyle       = opts.deckStyle || 'fan';
        var cardWidth       = opts.cardWidth || 360;
        var cardHeight      = opts.cardHeight || 480;
        var cardRadius      = opts.cardRadius || 20;
        var stackCount      = Math.min(opts.stackCount || 3, 4);
        var stackAngle      = opts.stackAngle || 8;
        var stackOffset     = opts.stackOffset || 18;
        var stackScale      = opts.stackScale || 0.06;
        var dur             = opts.transitionDuration || 500;
        var autoPlay        = opts.autoPlay || false;
        var autoInterval    = opts.autoInterval || 3500;
        var showDots        = opts.showDots !== false;
        var showArrows      = opts.showArrows !== false;
        var showTag         = opts.showTag !== false;
        var showTitle       = opts.showTitle !== false;
        var showDescription = opts.showDescription !== false;
        var showLink        = opts.showLink !== false;
        var overlayStr      = (opts.overlayStrength || 50) / 100;
        var imageFit        = opts.imageFit || 'cover';
        var tagBg           = opts.tagBg || '#6366f1';
        var tagColor        = opts.tagColor || '#ffffff';
        var tagSize         = opts.tagSize || 11;
        var titleColor      = opts.titleColor || '#ffffff';
        var titleSize       = opts.titleSize || 24;
        var descColor       = opts.descColor || '#94a3b8';
        var descSize        = opts.descSize || 15;
        var linkColor       = opts.linkColor || '#818cf8';
        var cardBg          = opts.cardBg || '#1e293b';
        var dotColor        = opts.dotColor || '#6366f1';
        var arrowBg         = opts.arrowBg || '#ffffff';
        var arrowColor      = opts.arrowColor || '#0f172a';
        var sectionBg       = opts.sectionBg || '';

        // CSS vars
        app.style.setProperty('--cds-dur', dur + 'ms');
        app.style.setProperty('--cds-arrow-bg', arrowBg);
        app.style.setProperty('--cds-arrow-clr', arrowColor);
        app.style.setProperty('--cds-dot-clr', dotColor);
        if (sectionBg) app.style.background = sectionBg;

        typoCssVarsForEl(opts.typoTitle, '--bkbg-cds-tt-', app);
        typoCssVarsForEl(opts.typoDesc, '--bkbg-cds-td-', app);

        var currentIndex = 0;
        var animating = false;
        var autoTimer = null;

        // Build stage
        var stage = document.createElement('div');
        stage.className = 'bkbg-cds-stage';
        stage.style.width = cardWidth + 'px';
        stage.style.height = cardHeight + 'px';
        app.appendChild(stage);

        // Build card DOM
        function buildCard(card) {
            var cardEl = document.createElement('div');
            cardEl.className = 'bkbg-cds-card';
            cardEl.style.width = cardWidth + 'px';
            cardEl.style.height = cardHeight + 'px';
            cardEl.style.borderRadius = cardRadius + 'px';
            cardEl.style.background = cardBg;
            cardEl.style.overflow = 'hidden';
            cardEl.style.position = 'absolute';
            cardEl.style.top = '0';
            cardEl.style.left = '0';

            if (card.imageUrl) {
                var img = document.createElement('img');
                img.src = card.imageUrl;
                img.alt = card.imageAlt || '';
                img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:' + imageFit + ';pointer-events:none;';
                cardEl.appendChild(img);
            }

            // Gradient overlay
            var overlay = document.createElement('div');
            overlay.className = 'bkbg-cds-overlay';
            overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,' + overlayStr + ') 40%, transparent 100%)';
            cardEl.appendChild(overlay);

            // Content
            var content = document.createElement('div');
            content.className = 'bkbg-cds-content';

            if (showTag && card.tag) {
                var tag = document.createElement('span');
                tag.className = 'bkbg-cds-tag';
                tag.textContent = card.tag;
                tag.style.background = tagBg;
                tag.style.color = tagColor;
                tag.style.fontSize = tagSize + 'px';
                content.appendChild(tag);
            }

            if (showTitle && card.title) {
                var title = document.createElement('div');
                title.className = 'bkbg-cds-title';
                title.textContent = card.title;
                title.style.color = titleColor;
                content.appendChild(title);
            }

            if (showDescription && card.description) {
                var desc = document.createElement('div');
                desc.className = 'bkbg-cds-desc';
                desc.textContent = card.description;
                desc.style.color = descColor;
                content.appendChild(desc);
            }

            if (showLink && card.linkLabel) {
                var link = card.linkUrl
                    ? document.createElement('a')
                    : document.createElement('span');
                link.className = 'bkbg-cds-link';
                link.textContent = card.linkLabel + ' →';
                link.style.color = linkColor;
                if (card.linkUrl) {
                    link.href = card.linkUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
                content.appendChild(link);
            }

            cardEl.appendChild(content);
            return cardEl;
        }

        var cardEls = cards.map(buildCard);
        cardEls.forEach(function (el) { stage.appendChild(el); });

        /* ── Position cards in deck ── */
        function getTransform(depth, direction) {
            if (depth === 0) return { transform: 'none', opacity: 1, zIndex: cards.length + 1 };

            var angle = 0, offsetX = 0, offsetY = 0, scale = 1 - depth * stackScale;

            if (deckStyle === 'fan') {
                // Alternate rotation left/right
                var sign = (depth % 2 === 0) ? 1 : -1;
                angle = sign * stackAngle * depth;
            } else if (deckStyle === 'stack') {
                offsetY = -depth * stackOffset;
            } else if (deckStyle === 'cascade') {
                offsetX = -depth * stackOffset;
                angle = depth * 2;
            }

            return {
                transform: 'rotate(' + angle + 'deg) translateX(' + offsetX + 'px) translateY(' + offsetY + 'px) scale(' + scale + ')',
                opacity: Math.max(0, 1 - depth * 0.18),
                zIndex: cards.length - depth
            };
        }

        function applyDeckPositions(direction) {
            cardEls.forEach(function (el, i) {
                // Get depth: how far behind the current front card
                var depth = (i - currentIndex + cards.length) % cards.length;
                if (depth > stackCount) {
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    el.style.zIndex = '0';
                    return;
                }
                el.classList.toggle('bkbg-cds-card--active', depth === 0);
                el.style.pointerEvents = depth === 0 ? '' : 'none';

                var t = getTransform(depth, direction);
                el.style.transform = t.transform;
                el.style.opacity = t.opacity;
                el.style.zIndex = t.zIndex;
            });
        }

        /* ── Animate to next/prev ── */
        function goTo(newIndex, direction) {
            if (animating || newIndex === currentIndex) return;
            animating = true;

            var outEl = cardEls[currentIndex];
            // Fly out the current card
            var exitClass = direction === 'next' ? 'bkbg-cds-card--exit-left' : 'bkbg-cds-card--exit-right';
            outEl.classList.add(exitClass);

            currentIndex = (newIndex + cards.length) % cards.length;

            // After brief delay, reorder & clean up
            setTimeout(function () {
                outEl.classList.remove(exitClass);
                applyDeckPositions(direction);
                updateDots();
                setTimeout(function () { animating = false; }, dur);
            }, dur * 0.4);
        }

        function next() {
            goTo(currentIndex + 1, 'next');
        }

        function prev() {
            goTo(currentIndex - 1, 'prev');
        }

        // Initial position
        applyDeckPositions('next');

        /* ── Controls ── */
        var controls = document.createElement('div');
        controls.className = 'bkbg-cds-controls';

        if (showArrows) {
            var btnPrev = document.createElement('button');
            btnPrev.className = 'bkbg-cds-arrow';
            btnPrev.setAttribute('aria-label', 'Previous card');
            btnPrev.innerHTML = '&#8592;';
            btnPrev.addEventListener('click', function () {
                stopAuto();
                prev();
            });
            controls.appendChild(btnPrev);
        }

        if (showArrows) {
            var btnNext = document.createElement('button');
            btnNext.className = 'bkbg-cds-arrow';
            btnNext.setAttribute('aria-label', 'Next card');
            btnNext.innerHTML = '&#8594;';
            btnNext.addEventListener('click', function () {
                stopAuto();
                next();
            });
            controls.appendChild(btnNext);
        }

        if (showArrows) app.appendChild(controls);

        /* ── Dots ── */
        var dotsEl = null;
        var dotEls = [];

        if (showDots) {
            dotsEl = document.createElement('div');
            dotsEl.className = 'bkbg-cds-dots';
            cards.forEach(function (_, i) {
                var dot = document.createElement('div');
                dot.className = 'bkbg-cds-dot' + (i === 0 ? ' bkbg-cds-dot--active' : '');
                dot.addEventListener('click', function () {
                    stopAuto();
                    goTo(i, i > currentIndex ? 'next' : 'prev');
                });
                dotEls.push(dot);
                dotsEl.appendChild(dot);
            });
            app.appendChild(dotsEl);
        }

        function updateDots() {
            dotEls.forEach(function (dot, i) {
                dot.classList.toggle('bkbg-cds-dot--active', i === currentIndex);
            });
        }

        /* ── Touch / swipe ── */
        var touchStartX = 0;
        stage.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        stage.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                stopAuto();
                if (diff > 0) next(); else prev();
            }
        });

        /* ── Auto play ── */
        function startAuto() {
            if (!autoPlay) return;
            autoTimer = setInterval(next, autoInterval);
        }

        function stopAuto() {
            clearInterval(autoTimer);
            autoTimer = null;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) startAuto();
                else stopAuto();
            });
        }, { threshold: 0.3 });
        io.observe(app);
    });
})();
