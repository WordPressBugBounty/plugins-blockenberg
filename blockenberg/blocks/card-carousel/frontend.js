(function () {
    var ASPECT_PADDING = {
        '1-1': '100%', '4-3': '75%', '3-2': '66.67%', '16-9': '56.25%', '21-9': '42.86%',
    };
    var SHADOWS = {
        none: 'none',
        sm:   '0 1px 6px rgba(0,0,0,0.08)',
        md:   '0 4px 16px rgba(0,0,0,0.12)',
        lg:   '0 8px 32px rgba(0,0,0,0.16)',
    };

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
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function buildCard(item, o) {
        var shadow = SHADOWS[o.cardShadow] || SHADOWS.sm;
        var layout = o.cardLayout || 'stacked';

        var card = document.createElement('div');
        card.className = 'bkbg-cc-card shadow-' + o.cardShadow + ' layout-' + layout;
        card.style.borderRadius = o.cardBorderRadius + 'px';
        card.style.background = layout !== 'overlay' ? o.cardBg : 'transparent';
        card.style.boxShadow = layout !== 'overlay' ? shadow : 'none';
        if (o.cardMinHeight > 0) card.style.minHeight = o.cardMinHeight + 'px';

        // Image
        if (layout !== 'text') {
            var imgWrap = document.createElement('div');
            imgWrap.className = 'bkbg-cc-img-wrap';

            if (layout === 'overlay') {
                imgWrap.style.position = 'absolute';
                imgWrap.style.inset = '0';
            }

            if (item.imageUrl) {
                if (layout === 'stacked' || layout === 'text') {
                    var ratio = document.createElement('div');
                    ratio.className = 'bkbg-cc-img-ratio';
                    ratio.style.paddingTop = ASPECT_PADDING[o.imageAspect] || '56.25%';
                    var img = document.createElement('img');
                    img.src = item.imageUrl;
                    img.alt = item.imageAlt || '';
                    img.loading = 'lazy';
                    ratio.appendChild(img);
                    imgWrap.appendChild(ratio);
                } else if (layout === 'horizontal') {
                    imgWrap.style.width = '40%';
                    imgWrap.style.flexShrink = '0';
                    var img2 = document.createElement('img');
                    img2.src = item.imageUrl;
                    img2.alt = item.imageAlt || '';
                    img2.loading = 'lazy';
                    img2.style.width = '100%';
                    img2.style.height = '100%';
                    img2.style.objectFit = o.imageFit || 'cover';
                    img2.style.display = 'block';
                    imgWrap.appendChild(img2);
                } else {
                    // overlay
                    var img3 = document.createElement('img');
                    img3.src = item.imageUrl;
                    img3.alt = item.imageAlt || '';
                    img3.loading = 'lazy';
                    img3.style.width = '100%';
                    img3.style.height = '100%';
                    img3.style.objectFit = o.imageFit || 'cover';
                    img3.style.display = 'block';
                    imgWrap.appendChild(img3);
                }
            } else if (layout !== 'overlay') {
                imgWrap.className += ' bkbg-cc-img-placeholder';
                var ratio2 = document.createElement('div');
                ratio2.className = 'bkbg-cc-img-ratio';
                ratio2.style.paddingTop = ASPECT_PADDING[o.imageAspect] || '56.25%';
                imgWrap.style.fontSize = '28px';
                imgWrap.appendChild(ratio2);
            }

            card.appendChild(imgWrap);
        }

        // Body
        var body = document.createElement('div');
        body.className = 'bkbg-cc-body';
        body.style.padding = o.cardPadding + 'px';
        var isOverlay = layout === 'overlay';
        if (isOverlay) {
            body.style.position = 'relative';
            body.style.zIndex = '1';
            body.style.marginTop = 'auto';
            body.style.background = 'linear-gradient(180deg, transparent 10%, rgba(0,0,0,0.75) 100%)';
        }

        var accentColor = item.accentColor || o.eyebrowColor;

        // Badge
        if (o.showBadge && item.badge) {
            var badge = document.createElement('span');
            badge.className = 'bkbg-cc-badge';
            badge.style.background = o.badgeBg;
            badge.style.color = o.badgeColor;
            badge.textContent = item.badge;
            body.appendChild(badge);
        }

        // Eyebrow
        if (o.showEyebrow && item.eyebrow) {
            var eyebrow = document.createElement('div');
            eyebrow.className = 'bkbg-cc-eyebrow';
            eyebrow.style.color = isOverlay ? 'rgba(255,255,255,0.75)' : accentColor;
            eyebrow.textContent = item.eyebrow;
            body.appendChild(eyebrow);
        }

        // Heading
        var heading = document.createElement('h3');
        heading.className = 'bkbg-cc-heading';
        heading.style.color = isOverlay ? '#fff' : o.headingColor;
        heading.textContent = item.heading || '';
        body.appendChild(heading);

        // Description
        if (o.showDescription && item.description) {
            var desc = document.createElement('p');
            desc.className = 'bkbg-cc-desc';
            desc.style.color = isOverlay ? 'rgba(255,255,255,0.8)' : o.textColor;
            desc.textContent = item.description;
            body.appendChild(desc);
        }

        // Link
        if (o.showLink && item.link) {
            var link = document.createElement('a');
            link.className = 'bkbg-cc-link style-' + (o.linkStyle || 'arrow');
            link.href = item.link;
            link.style.color = isOverlay ? '#fff' : o.linkColor;
            if (o.linkStyle === 'button') {
                link.style.background = isOverlay ? 'rgba(255,255,255,0.15)' : o.linkColor;
                link.style.color = isOverlay ? '#fff' : '#fff';
            }
            var linkText = item.linkLabel || 'Learn more';
            link.textContent = o.linkStyle === 'arrow' ? linkText + ' →' : linkText;
            body.appendChild(link);
        }

        card.appendChild(body);
        return card;
    }

    function initCarousel(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var opts;
        try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
        var o = Object.assign({
            items:           [],
            cardLayout:      'stacked',
            imageAspect:     '16-9',
            desktopCols:     3,
            tabletCols:      2,
            mobileCols:      1,
            gap:             24,
            cardMinHeight:   0,
            cardBorderRadius:12,
            cardShadow:      'sm',
            showArrows:      true,
            showDots:        true,
            loop:            true,
            autoplay:        false,
            autoplaySpeed:   3000,
            pauseOnHover:    true,
            showBadge:       true,
            showEyebrow:     true,
            showDescription: true,
            showLink:        true,
            linkStyle:       'arrow',
            imageFit:        'cover',
            padding:         0,
            cardPadding:     20,
            // colors
            containerBg:     '',
            cardBg:          '#ffffff',
            eyebrowColor:    '#6366f1',
            headingColor:    '#111827',
            textColor:       '#6b7280',
            linkColor:       '#6366f1',
            badgeBg:         '#ede9fe',
            badgeColor:      '#6366f1',
            arrowBg:         '#ffffff',
            arrowColor:      '#111827',
            dotActiveColor:  '#6366f1',
            dotInactiveColor:'#d1d5db',
            headingSize:     18,
            textSize:        14,
            eyebrowSize:     11,
        }, opts);

        if (!o.items || !o.items.length) return;

        // Root wrapper
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cc-wrap';
        if (o.containerBg) wrap.style.background = o.containerBg;
        if (o.padding > 0) wrap.style.padding = o.padding + 'px';

        typoCssVarsForEl(o.typoHeading, '--bkbg-cc-h-', wrap);
        typoCssVarsForEl(o.typoDesc, '--bkbg-cc-d-', wrap);
        typoCssVarsForEl(o.typoEyebrow, '--bkbg-cc-e-', wrap);

        // Viewport
        var viewport = document.createElement('div');
        viewport.className = 'bkbg-cc-viewport';
        wrap.appendChild(viewport);

        // Track
        var track = document.createElement('div');
        track.className = 'bkbg-cc-track';
        viewport.appendChild(track);

        // Build cards
        o.items.forEach(function (item) {
            var card = buildCard(item, o);
            track.appendChild(card);
        });

        // Responsive columns helper
        function getCols() {
            var w = window.innerWidth;
            if (w <= 600) return o.mobileCols;
            if (w <= 1024) return o.tabletCols;
            return o.desktopCols;
        }

        var total = o.items.length;
        var currentIndex = 0;
        var autoplayTimer = null;

        // Compute & apply card widths
        function applyCardWidths() {
            var cols = getCols();
            var totalGap = o.gap * (cols - 1);
            var cardWidth = (viewport.offsetWidth - totalGap) / cols;
            track.querySelectorAll('.bkbg-cc-card').forEach(function (card) {
                card.style.width = cardWidth + 'px';
                card.style.marginRight = o.gap + 'px';
            });
            goTo(currentIndex, false);
        }

        function getCardWidth() {
            var cols = getCols();
            var totalGap = o.gap * (cols - 1);
            return (viewport.offsetWidth - totalGap) / cols;
        }

        function getStepWidth() {
            return getCardWidth() + o.gap;
        }

        function maxIndex() {
            var cols = getCols();
            return o.loop ? total - 1 : Math.max(0, total - cols);
        }

        function goTo(idx, animate) {
            if (animate === undefined) animate = true;
            if (o.loop) {
                idx = ((idx % total) + total) % total;
            } else {
                idx = clamp(idx, 0, maxIndex());
            }
            currentIndex = idx;
            var offset = idx * getStepWidth();
            track.style.transition = animate ? 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
            track.style.transform = 'translateX(-' + offset + 'px)';
            updateDots();
            updateArrows();
        }

        function next() { goTo(currentIndex + 1); }
        function prev() { goTo(currentIndex - 1); }

        // Arrows
        var arrowWrap = null;
        if (o.showArrows) {
            arrowWrap = document.createElement('div');
            arrowWrap.className = 'bkbg-cc-arrows';

            var btnPrev = document.createElement('button');
            btnPrev.className = 'bkbg-cc-arrow';
            btnPrev.style.background = o.arrowBg;
            btnPrev.style.color = o.arrowColor;
            btnPrev.innerHTML = '&#8592;';
            btnPrev.addEventListener('click', function () { prev(); resetAutoplay(); });
            arrowWrap.appendChild(btnPrev);

            var btnNext = document.createElement('button');
            btnNext.className = 'bkbg-cc-arrow';
            btnNext.style.background = o.arrowBg;
            btnNext.style.color = o.arrowColor;
            btnNext.innerHTML = '&#8594;';
            btnNext.addEventListener('click', function () { next(); resetAutoplay(); });
            arrowWrap.appendChild(btnNext);

            // Position arrows relative to viewport
            viewport.style.position = 'relative';
            wrap.style.position = 'relative';
            wrap.appendChild(arrowWrap);
        }

        function updateArrows() {
            if (!arrowWrap) return;
            var arrows = arrowWrap.querySelectorAll('.bkbg-cc-arrow');
            if (!o.loop) {
                arrows[0].classList.toggle('is-disabled', currentIndex <= 0);
                arrows[0].disabled = currentIndex <= 0;
                arrows[1].classList.toggle('is-disabled', currentIndex >= maxIndex());
                arrows[1].disabled = currentIndex >= maxIndex();
            }
        }

        // Dots
        var dotsWrap = null;
        var dotEls = [];
        if (o.showDots) {
            dotsWrap = document.createElement('div');
            dotsWrap.className = 'bkbg-cc-dots';
            for (var d = 0; d < total; d++) {
                (function (di) {
                    var dot = document.createElement('button');
                    dot.className = 'bkbg-cc-dot' + (di === 0 ? ' is-active' : '');
                    dot.style.background = di === 0 ? o.dotActiveColor : o.dotInactiveColor;
                    dot.addEventListener('click', function () { goTo(di); resetAutoplay(); });
                    dotEls.push(dot);
                    dotsWrap.appendChild(dot);
                })(d);
            }
            wrap.appendChild(dotsWrap);
        }

        function updateDots() {
            dotEls.forEach(function (dot, i) {
                var active = i === currentIndex;
                dot.classList.toggle('is-active', active);
                dot.style.background = active ? o.dotActiveColor : o.dotInactiveColor;
                dot.style.width = active ? '20px' : '8px';
            });
        }

        // Autoplay
        function startAutoplay() {
            if (!o.autoplay) return;
            autoplayTimer = setInterval(function () { next(); }, o.autoplaySpeed);
        }

        function stopAutoplay() {
            if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        if (o.autoplay && o.pauseOnHover) {
            wrap.addEventListener('mouseenter', stopAutoplay);
            wrap.addEventListener('mouseleave', startAutoplay);
        }

        // Drag / swipe
        var dragStartX = 0;
        var dragDeltaX = 0;
        var isDragging = false;

        function onDragStart(x) {
            isDragging = true;
            dragStartX = x;
            dragDeltaX = 0;
            track.classList.add('is-dragging');
            stopAutoplay();
        }

        function onDragMove(x) {
            if (!isDragging) return;
            dragDeltaX = x - dragStartX;
            var offset = (currentIndex * getStepWidth()) - dragDeltaX;
            track.style.transition = 'none';
            track.style.transform = 'translateX(-' + offset + 'px)';
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('is-dragging');
            var threshold = getStepWidth() * 0.2;
            if (dragDeltaX < -threshold) {
                next();
            } else if (dragDeltaX > threshold) {
                prev();
            } else {
                goTo(currentIndex);
            }
            startAutoplay();
        }

        // Touch events
        track.addEventListener('touchstart', function (e) {
            onDragStart(e.touches[0].clientX);
        }, { passive: true });
        track.addEventListener('touchmove', function (e) {
            onDragMove(e.touches[0].clientX);
        }, { passive: true });
        track.addEventListener('touchend', function () { onDragEnd(); });

        // Mouse drag
        track.addEventListener('mousedown', function (e) {
            e.preventDefault();
            onDragStart(e.clientX);
        });
        document.addEventListener('mousemove', function (e) {
            if (isDragging) onDragMove(e.clientX);
        });
        document.addEventListener('mouseup', function () {
            if (isDragging) onDragEnd();
        });

        // Prevent click on links during drag
        track.addEventListener('click', function (e) {
            if (Math.abs(dragDeltaX) > 5) e.preventDefault();
        });

        // Resize
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(applyCardWidths, 100);
        });

        // Initialize
        appEl.parentNode.insertBefore(wrap, appEl);
        appEl.style.display = 'none';

        // Delay to let layout settle
        requestAnimationFrame(function () {
            applyCardWidths();
            startAutoplay();
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-cc-app').forEach(initCarousel);
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
