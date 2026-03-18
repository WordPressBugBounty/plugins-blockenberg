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

    document.querySelectorAll('.bkbg-sv-app').forEach(function (app) {
        var opts;
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var videoUrl    = opts.videoUrl    || '';
        var videoType   = opts.videoType   || 'youtube';
        var posterUrl   = opts.posterUrl   || '';
        var title       = opts.title       || '';
        var subtitle    = opts.subtitle    || '';
        var showTitle   = opts.showTitle   !== false;
        var autoplay    = !!opts.autoplay;
        var muted       = !!opts.muted;
        var loop        = !!opts.loop;
        var controls    = opts.controls    !== false;
        var aspectRatio = opts.aspectRatio || '16:9';
        var borderRadius = parseInt(opts.borderRadius) || 16;
        var stickyEnabled = opts.stickyEnabled !== false;
        var stickyCorner  = opts.stickyCorner  || 'bottom-right';
        var stickyWidth   = parseInt(opts.stickyWidth)  || 320;
        var stickyOffset  = parseInt(opts.stickyOffset) || 24;
        var stickyRadius  = parseInt(opts.stickyRadius) || 12;
        var stickyOnPlay  = !!opts.stickyOnPlay;
        var showOverlay   = opts.showOverlayPlay !== false;
        var overlayBg     = opts.overlayBg   || 'rgba(0,0,0,0.35)';
        var stickyBg      = opts.stickyBg    || '#1e293b';
        var sectionBg     = opts.sectionBg   || '';

        if (sectionBg) app.style.background = sectionBg;

        // ── Aspect ratio ──
        var parts = aspectRatio.split(':');
        var ratioW = parseFloat(parts[0]) || 16;
        var ratioH = parseFloat(parts[1]) || 9;
        var padBottom = ((ratioH / ratioW) * 100).toFixed(2) + '%';

        // ── Embed URL helpers ──
        function getEmbedUrl(ap) {
            var ytMatch = videoUrl.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
            var vmMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
            var autoParam = ap ? '1' : '0';
            if (videoType === 'youtube' && ytMatch) {
                return 'https://www.youtube.com/embed/' + ytMatch[1]
                    + '?rel=0&autoplay=' + autoParam
                    + (muted ? '&mute=1' : '')
                    + (loop ? '&loop=1&playlist=' + ytMatch[1] : '')
                    + (!controls ? '&controls=0' : '');
            }
            if (videoType === 'vimeo' && vmMatch) {
                return 'https://player.vimeo.com/video/' + vmMatch[1]
                    + '?autoplay=' + autoParam
                    + (muted ? '&muted=1' : '')
                    + (loop ? '&loop=1' : '');
            }
            return videoUrl;
        }

        function el(tag, className) {
            var d = document.createElement(tag);
            if (className) d.className = className;
            return d;
        }

        // ── Build inline player ──
        var wrap = el('div', 'bkbg-sv-wrap');
        typoCssVarsForEl(wrap, opts.titleTypo, '--bksv-tt-');
        typoCssVarsForEl(wrap, opts.subtitleTypo, '--bksv-st-');
        wrap.style.setProperty('--bksv-title-fw', opts.titleFontWeight || '700');
        wrap.style.setProperty('--bksv-title-lh', String(opts.titleLineHeight || 1.2));
        wrap.style.setProperty('--bksv-st-fw', opts.subtitleFontWeight || '400');
        wrap.style.setProperty('--bksv-st-lh', String(opts.subtitleLineHeight || 1.5));
        app.appendChild(wrap);

        var ratioDiv = el('div', 'bkbg-sv-ratio');
        ratioDiv.style.paddingBottom = padBottom;
        ratioDiv.style.borderRadius  = borderRadius + 'px';
        wrap.appendChild(ratioDiv);

        var iframeEl = null;
        var videoEl  = null;
        var isPlaying = false;

        // Poster
        var posterImg = null;
        if (posterUrl) {
            posterImg = el('img', 'bkbg-sv-poster');
            posterImg.src = posterUrl;
            posterImg.alt = title;
            ratioDiv.appendChild(posterImg);
        }

        // Overlay
        var overlay = null;
        if (showOverlay && !autoplay) {
            overlay = el('div', 'bkbg-sv-overlay');
            overlay.style.background = overlayBg;
            var playBtn = el('div', 'bkbg-sv-play-btn');
            playBtn.textContent = '▶';
            overlay.appendChild(playBtn);
            ratioDiv.appendChild(overlay);
        }

        // Title overlay
        if (showTitle && title) {
            var titleOverlay = el('div', 'bkbg-sv-title-overlay');
            var titleEl = el('p', 'bkbg-sv-title-text');
            titleEl.textContent = title;
            titleOverlay.appendChild(titleEl);
            if (subtitle) {
                var subEl = el('p', 'bkbg-sv-subtitle-text');
                subEl.textContent = subtitle;
                titleOverlay.appendChild(subEl);
            }
            ratioDiv.appendChild(titleOverlay);
        }

        // ── Load & play ──
        function startPlay(ap) {
            isPlaying = true;
            if (posterImg) posterImg.classList.add('bkbg-sv-hidden');
            if (overlay)   overlay.classList.add('bkbg-sv-hidden');

            if (videoType === 'self') {
                if (!videoEl) {
                    videoEl = document.createElement('video');
                    videoEl.className = 'bkbg-sv-video';
                    videoEl.src = videoUrl;
                    videoEl.controls = controls;
                    videoEl.muted = muted;
                    videoEl.loop  = loop;
                    ratioDiv.appendChild(videoEl);
                }
                if (ap) videoEl.play().catch(function(){});
            } else {
                if (!iframeEl) {
                    iframeEl = document.createElement('iframe');
                    iframeEl.className = 'bkbg-sv-iframe';
                    iframeEl.allowFullscreen = true;
                    iframeEl.allow = 'autoplay; fullscreen; picture-in-picture';
                    ratioDiv.appendChild(iframeEl);
                }
                iframeEl.src = getEmbedUrl(ap);
            }
        }

        if (autoplay) {
            startPlay(true);
        } else if (overlay) {
            overlay.addEventListener('click', function () {
                startPlay(true);
                if (!stickyOnPlay) isPlayerVisible = false; // will be set properly
            });
        }
        if (posterImg && !overlay) {
            posterImg.addEventListener('click', function () { startPlay(true); });
        }

        // ── Sticky / PiP ──
        if (!stickyEnabled) return;

        var cornerMap = {
            'bottom-right': 'bkbg-sv-corner-br',
            'bottom-left':  'bkbg-sv-corner-bl',
            'top-right':    'bkbg-sv-corner-tr',
            'top-left':     'bkbg-sv-corner-tl'
        };

        var stickyEl = el('div', 'bkbg-sv-sticky ' + (cornerMap[stickyCorner] || 'bkbg-sv-corner-br'));
        stickyEl.style.width        = stickyWidth + 'px';
        stickyEl.style.borderRadius = stickyRadius + 'px';
        stickyEl.style.background   = stickyBg;
        // Apply offset to correct edges
        var offsets = stickyCorner.split('-');
        stickyEl.style[offsets[0]] = stickyOffset + 'px';
        stickyEl.style[offsets[1]] = stickyOffset + 'px';
        // Clear the class-set offsets (override)
        stickyEl.className = 'bkbg-sv-sticky';

        // Sticky inner video ratio
        var stickyInner = el('div', 'bkbg-sv-sticky-inner');
        stickyInner.style.borderRadius = stickyRadius + 'px ' + stickyRadius + 'px 0 0';
        stickyEl.appendChild(stickyInner);

        var stickyRatio = el('div', 'bkbg-sv-ratio');
        stickyRatio.style.paddingBottom = padBottom;
        stickyInner.appendChild(stickyRatio);

        // Sticky bar
        var stickyBar = el('div', 'bkbg-sv-sticky-bar');
        stickyBar.style.background   = stickyBg;
        stickyBar.style.borderRadius = '0 0 ' + stickyRadius + 'px ' + stickyRadius + 'px';

        var stickyTitle = el('span', 'bkbg-sv-sticky-title');
        stickyTitle.textContent = title;
        stickyBar.appendChild(stickyTitle);

        var btnRestore = el('button', 'bkbg-sv-sticky-btn');
        btnRestore.textContent = '⤢';
        btnRestore.title = 'Restore';
        stickyBar.appendChild(btnRestore);

        var btnClose = el('button', 'bkbg-sv-sticky-btn');
        btnClose.textContent = '✕';
        btnClose.title = 'Close';
        stickyBar.appendChild(btnClose);

        stickyEl.appendChild(stickyBar);
        document.body.appendChild(stickyEl);

        var stickyIframe  = null;
        var stickyVideo   = null;
        var isStickyVisible = false;
        var isClosed = false;

        function showSticky() {
            if (isClosed) return;
            if (isStickyVisible) return;
            isStickyVisible = true;
            stickyEl.classList.add('bkbg-sv-sticky-visible');

            // Build sticky content
            if (videoType === 'self') {
                if (!stickyVideo) {
                    stickyVideo = document.createElement('video');
                    stickyVideo.className = 'bkbg-sv-video';
                    stickyVideo.src = videoUrl;
                    stickyVideo.muted = true;
                    stickyVideo.controls = false;
                    stickyVideo.style.borderRadius = stickyRadius + 'px ' + stickyRadius + 'px 0 0';
                    stickyRatio.appendChild(stickyVideo);
                }
            } else {
                if (!stickyIframe) {
                    stickyIframe = document.createElement('iframe');
                    stickyIframe.className = 'bkbg-sv-iframe';
                    stickyIframe.src = getEmbedUrl(true);
                    stickyIframe.allowFullscreen = true;
                    stickyIframe.allow = 'autoplay; fullscreen; picture-in-picture';
                    stickyIframe.style.borderRadius = stickyRadius + 'px ' + stickyRadius + 'px 0 0';
                    stickyRatio.appendChild(stickyIframe);
                    // Mute main iframe to avoid double audio
                    if (iframeEl) iframeEl.src = iframeEl.src.replace('autoplay=1', 'autoplay=0');
                }
            }
        }

        function hideSticky() {
            if (!isStickyVisible) return;
            isStickyVisible = false;
            stickyEl.classList.remove('bkbg-sv-sticky-visible');
        }

        // Restore: scroll back to original player
        btnRestore.addEventListener('click', function () {
            ratioDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            hideSticky();
        });

        // Close: dismiss sticky permanently
        btnClose.addEventListener('click', function () {
            isClosed = true;
            hideSticky();
        });

        // IntersectionObserver to detect when inline player leaves view
        var observer = new IntersectionObserver(function (entries) {
            var entry = entries[0];
            if (entry.isIntersecting) {
                hideSticky();
            } else {
                if (stickyOnPlay && !isPlaying) return;
                showSticky();
            }
        }, { threshold: 0.15 });

        observer.observe(ratioDiv);
    });
})();
