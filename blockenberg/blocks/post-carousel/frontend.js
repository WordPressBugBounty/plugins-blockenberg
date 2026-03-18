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

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function trimWords(html, count) {
        var text = html.replace(/<[^>]+>/g, '');
        var words = text.split(/\s+/).filter(Boolean);
        return words.slice(0, count).join(' ') + (words.length > count ? '…' : '');
    }

    function initCarousel(wrap) {
        var d = wrap.dataset;

        var postType     = d.postType    || 'post';
        var orderby      = d.orderby     || 'date';
        var order        = d.order       || 'desc';
        var perPage      = parseInt(d.perPage,   10) || 6;
        var excerptLen   = parseInt(d.excerptLen, 10) || 20;
        var gap          = parseInt(d.gap,        10) || 24;
        var spvDesk      = parseInt(d.spv,        10) || 3;
        var spvTablet    = parseInt(d.spvTablet,  10) || 2;
        var spvMobile    = parseInt(d.spvMobile,  10) || 1;
        var autoplay     = d.autoplay    !== '0';
        var apSpeed      = parseInt(d.apSpeed,    10) || 4000;
        var pauseHover   = d.pauseHover  !== '0';
        var loop         = d.loop        !== '0';
        var showArrows   = d.arrows      !== '0';
        var arrowStyle   = d.arrowStyle  || 'circle';
        var showDots     = d.dots        !== '0';
        var showImage    = d.showImage   !== '0';
        var showMeta     = d.showMeta    !== '0';
        var showExcerpt  = d.showExcerpt !== '0';
        var showRm       = d.showRm      !== '0';
        var rmLabel      = d.rmLabel     || 'Read More';
        var ratio        = d.ratio       || '56.25';
        var cardStyle    = d.cardStyle   || 'shadow';
        var cardBg       = d.cardBg      || '#ffffff';
        var cardRadius   = d.cardRadius  || '10';
        var titleC       = d.titleC      || '#111827';
        var excerptC     = d.excerptC    || '#6b7280';
        var metaC        = d.metaC       || '#9ca3af';
        var linkC        = d.linkC       || '#2563eb';
        var arrowBg      = d.arrowBg     || '#ffffff';
        var arrowC       = d.arrowC      || '#111827';
        var dotC         = d.dotC        || '#d1d5db';
        var dotActiveC   = d.dotActive   || '#111827';

        var titleTypo   = JSON.parse(d.titleTypo || '{}');
        var excerptTypo = JSON.parse(d.excerptTypo || '{}');
        var metaTypo    = JSON.parse(d.metaTypo || '{}');

        /* Loading placeholder */
        wrap.innerHTML = '<div class="bkbg-poc-loading">Loading posts…</div>';

        /* Determine REST base */
        var restBase = (window.blockenbergData && window.blockenbergData.restUrl)
            ? window.blockenbergData.restUrl
            : window.location.origin + '/wp-json/';

        var endpoint = restBase + 'wp/v2/' + postType +
            '?per_page=' + perPage +
            '&orderby=' + orderby +
            '&order=' + order +
            '&_embed=1';

        fetch(endpoint)
            .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
            .then(function (posts) { buildCarousel(posts); })
            .catch(function () {
                wrap.innerHTML = '<div class="bkbg-poc-loading">Could not load posts.</div>';
            });

        function getSpv() {
            var w = window.innerWidth;
            if (w < 600) return spvMobile;
            if (w < 960) return spvTablet;
            return spvDesk;
        }

        function buildCarousel(posts) {
            if (!posts || !posts.length) {
                wrap.innerHTML = '<div class="bkbg-poc-loading">No posts found.</div>';
                return;
            }
            wrap.innerHTML = '';

            typoCssVarsForEl(wrap, titleTypo, '--bkbg-poc-tt-');
            typoCssVarsForEl(wrap, excerptTypo, '--bkbg-poc-ex-');
            typoCssVarsForEl(wrap, metaTypo, '--bkbg-poc-mt-');

            /* Track outer */
            var trackOuter = document.createElement('div');
            trackOuter.className = 'bkbg-poc-track-outer';
            var track = document.createElement('div');
            track.className = 'bkbg-poc-track';

            posts.forEach(function (post) {
                var card = document.createElement('div');
                card.className = 'bkbg-poc-card bkbg-poc-card--' + cardStyle;
                card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;';

                /* Image */
                if (showImage) {
                    var thumb = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
                    var imgUrl= thumb ? (thumb.media_details && thumb.media_details.sizes && thumb.media_details.sizes.medium_large
                        ? thumb.media_details.sizes.medium_large.source_url
                        : thumb.source_url) : '';
                    var imgWrap = document.createElement('div');
                    imgWrap.className = 'bkbg-poc-img-wrap';
                    imgWrap.style.paddingBottom = ratio + '%';
                    if (imgUrl) {
                        var img = document.createElement('img');
                        img.src     = imgUrl;
                        img.alt     = post.title && post.title.rendered ? post.title.rendered : '';
                        img.loading = 'lazy';
                        imgWrap.appendChild(img);
                    }
                    card.appendChild(imgWrap);
                }

                /* Body */
                var body = document.createElement('div');
                body.className = 'bkbg-poc-body';

                if (showMeta) {
                    var meta = document.createElement('p');
                    meta.className = 'bkbg-poc-meta';
                    meta.style.color = metaC;
                    meta.textContent = new Date(post.date).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
                    body.appendChild(meta);
                }

                var titleLink = document.createElement('a');
                titleLink.className = 'bkbg-poc-title';
                titleLink.href      = post.link;
                titleLink.style.color = titleC;
                titleLink.innerHTML = post.title ? post.title.rendered : '';
                body.appendChild(titleLink);

                if (showExcerpt) {
                    var ex = document.createElement('p');
                    ex.className = 'bkbg-poc-excerpt';
                    ex.style.color = excerptC;
                    var rawExcerpt = post.excerpt ? post.excerpt.rendered : '';
                    ex.textContent = trimWords(rawExcerpt, excerptLen);
                    body.appendChild(ex);
                }

                if (showRm) {
                    var rm = document.createElement('a');
                    rm.className = 'bkbg-poc-rm';
                    rm.href      = post.link;
                    rm.style.color = linkC;
                    rm.textContent = rmLabel + ' →';
                    body.appendChild(rm);
                }

                card.appendChild(body);
                track.appendChild(card);
            });

            trackOuter.appendChild(track);
            wrap.appendChild(trackOuter);

            /* Navigation */
            var navDiv = document.createElement('div');
            navDiv.className = 'bkbg-poc-nav';

            var prevBtn, nextBtn, dotsContainer;
            if (showArrows) {
                var arrowsDiv = document.createElement('div');
                arrowsDiv.className = 'bkbg-poc-arrows';

                prevBtn = document.createElement('button');
                prevBtn.className = 'bkbg-poc-arrow bkbg-poc-arrow--' + arrowStyle;
                prevBtn.innerHTML = '‹';
                prevBtn.style.background = arrowBg;
                prevBtn.style.color      = arrowC;
                prevBtn.style.boxShadow  = '0 2px 8px rgba(0,0,0,0.12)';

                nextBtn = document.createElement('button');
                nextBtn.className = 'bkbg-poc-arrow bkbg-poc-arrow--' + arrowStyle;
                nextBtn.innerHTML = '›';
                nextBtn.style.background = arrowBg;
                nextBtn.style.color      = arrowC;
                nextBtn.style.boxShadow  = '0 2px 8px rgba(0,0,0,0.12)';

                arrowsDiv.appendChild(prevBtn);
                arrowsDiv.appendChild(nextBtn);
                navDiv.appendChild(arrowsDiv);
            }

            if (showDots) {
                dotsContainer = document.createElement('div');
                dotsContainer.className = 'bkbg-poc-dots';
                var numDots = Math.ceil(posts.length / getSpv());
                for (var di = 0; di < numDots; di++) {
                    (function (i) {
                        var dot = document.createElement('button');
                        dot.className = 'bkbg-poc-dot' + (i === 0 ? ' is-active' : '');
                        dot.style.background = i === 0 ? dotActiveC : dotC;
                        dot.addEventListener('click', function () { goTo(i); });
                        dotsContainer.appendChild(dot);
                    })(di);
                }
                navDiv.appendChild(dotsContainer);
            }

            wrap.appendChild(navDiv);

            /* State */
            var currentIndex = 0;

            function updateCardWidths() {
                var spv = getSpv();
                var totalGap = gap * (spv - 1);
                var cardW = 'calc((' + (100 / spv) + '%) - ' + (totalGap / spv) + 'px)';
                var cards = track.querySelectorAll('.bkbg-poc-card');
                cards.forEach(function (c) {
                    c.style.width      = cardW;
                    c.style.marginRight = gap + 'px';
                });
                if (cards.length) {
                    cards[cards.length - 1].style.marginRight = '0';
                }
            }

            function goTo(idx) {
                var spv   = getSpv();
                var total = posts.length;
                var max   = loop ? total - spv : Math.max(0, total - spv);

                if (loop) {
                    if (idx >= total) idx = 0;
                    if (idx < 0)      idx = total - 1;
                } else {
                    if (idx > max) idx = max;
                    if (idx < 0)   idx = 0;
                }
                currentIndex = idx;

                var cards     = track.querySelectorAll('.bkbg-poc-card');
                if (!cards.length) return;
                var cardW = cards[0].offsetWidth + gap;
                track.style.transform = 'translateX(-' + (cardW * currentIndex) + 'px)';

                /* Update dots */
                if (dotsContainer) {
                    var dots = dotsContainer.querySelectorAll('.bkbg-poc-dot');
                    var activeGroup = Math.floor(currentIndex / spv);
                    dots.forEach(function (dot, i) {
                        var isActive = i === activeGroup;
                        dot.classList.toggle('is-active', isActive);
                        dot.style.background = isActive ? dotActiveC : dotC;
                    });
                }

                /* Disable arrows at ends */
                if (prevBtn && !loop) { prevBtn.disabled = currentIndex === 0; prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1'; }
                if (nextBtn && !loop) { nextBtn.disabled = currentIndex >= max; nextBtn.style.opacity = currentIndex >= max ? '0.4' : '1'; }
            }

            /* Autoplay */
            var apTimer;
            function startAutoplay() {
                if (!autoplay) return;
                apTimer = setInterval(function () { goTo(currentIndex + 1); }, apSpeed);
            }
            function stopAutoplay() { clearInterval(apTimer); }

            /* Events */
            if (prevBtn) prevBtn.addEventListener('click', function () { stopAutoplay(); goTo(currentIndex - 1); startAutoplay(); });
            if (nextBtn) nextBtn.addEventListener('click', function () { stopAutoplay(); goTo(currentIndex + 1); startAutoplay(); });

            if (pauseHover) {
                wrap.addEventListener('mouseenter', stopAutoplay);
                wrap.addEventListener('mouseleave', startAutoplay);
            }

            /* Touch swipe */
            var touchStartX = 0;
            trackOuter.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
            trackOuter.addEventListener('touchend', function (e) {
                var diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) { goTo(currentIndex + (diff > 0 ? 1 : -1)); }
            });

            window.addEventListener('resize', function () {
                updateCardWidths();
                goTo(currentIndex);
            });

            /* Init */
            updateCardWidths();
            goTo(0);
            startAutoplay();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-poc-wrap[data-post-type]').forEach(initCarousel);
    });
})();
