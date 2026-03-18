(function () {
    'use strict';

    // ── Parse video URL → {type, src, ...} ─────────────────────────────────────
    function parseVideoUrl(url, autoplay, muted) {
        if (!url || !url.trim()) return null;
        url = url.trim();

        // YouTube: watch, embed, shorts, youtu.be
        var ytMatch = url.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        if (ytMatch) {
            var ytId = ytMatch[1];
            var ytQ  = 'autoplay=' + (autoplay ? '1' : '0')
                     + '&mute='      + (muted    ? '1' : '0')
                     + '&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';
            return { type: 'iframe', src: 'https://www.youtube.com/embed/' + ytId + '?' + ytQ };
        }

        // Vimeo: vimeo.com/ID or player.vimeo.com/video/ID
        var vmMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vmMatch) {
            var vmId = vmMatch[1];
            var vmQ  = 'autoplay=' + (autoplay ? '1' : '0')
                     + '&muted='   + (muted    ? '1' : '0')
                     + '&byline=0&portrait=0&title=0';
            return { type: 'iframe', src: 'https://player.vimeo.com/video/' + vmId + '?' + vmQ };
        }

        // Direct video file
        if (/\.(mp4|webm|ogv|ogg)(\?|#|$)/i.test(url)) {
            return { type: 'video', src: url, autoplay: autoplay, muted: muted };
        }

        // Fallback — use as-is inside an iframe
        return { type: 'iframe', src: url };
    }

    // ── Close icon SVG ─────────────────────────────────────────────────────────
    function closeSvg(color) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"'
             + ' fill="none" stroke="' + color + '" stroke-width="2.2" stroke-linecap="round">'
             + '<line x1="18" y1="6" x2="6" y2="18"/>'
             + '<line x1="6" y1="6" x2="18" y2="18"/></svg>';
    }

    // ── Open popup modal ───────────────────────────────────────────────────────
    function openModal(opts, triggerBtn) {
        var video = parseVideoUrl(opts.url, opts.autoplay, opts.muted);
        if (!video) return;

        var ratioMap = { '16-9': '56.25%', '4-3': '75%', '1-1': '100%', '21-9': '42.86%' };
        var padPct   = ratioMap[opts.aspectRatio] || '56.25%';
        var blur     = parseInt(opts.blur, 10) || 0;

        // ── Overlay ────────────────────────────────────────────────────────────
        var overlay = document.createElement('div');
        overlay.className = 'bkbg-vp-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Video popup');
        overlay.style.backgroundColor = opts.overlayColor;
        if (blur > 0) {
            overlay.style.backdropFilter       = 'blur(' + blur + 'px)';
            overlay.style.webkitBackdropFilter = 'blur(' + blur + 'px)';
        }

        // ── Content card ───────────────────────────────────────────────────────
        var content = document.createElement('div');
        content.className          = 'bkbg-vp-modal-content';
        content.style.maxWidth     = opts.maxWidth + 'px';
        content.style.borderRadius = opts.radius   + 'px';

        // ── Close button ───────────────────────────────────────────────────────
        var closeBtn = document.createElement('button');
        closeBtn.className = 'bkbg-vp-modal-close';
        closeBtn.type      = 'button';
        closeBtn.setAttribute('aria-label', 'Close video');
        closeBtn.style.color = opts.closeColor;
        closeBtn.innerHTML   = closeSvg(opts.closeColor);

        // ── Iframe / video wrapper ─────────────────────────────────────────────
        var iWrap = document.createElement('div');
        iWrap.className          = 'bkbg-vp-modal-iframe-wrap';
        iWrap.style.paddingBottom = padPct;

        // ── Loading spinner ────────────────────────────────────────────────────
        var loader = document.createElement('div');
        loader.className = 'bkbg-vp-modal-loader';

        // ── Media element ──────────────────────────────────────────────────────
        var mediaEl;
        if (video.type === 'video') {
            mediaEl             = document.createElement('video');
            mediaEl.src         = video.src;
            mediaEl.controls    = true;
            mediaEl.autoplay    = video.autoplay;
            mediaEl.muted       = video.muted;
            mediaEl.playsInline = true;
            mediaEl.tabIndex    = 0;
            mediaEl.addEventListener('canplay', function () {
                loader.classList.add('is-hidden');
            });
        } else {
            mediaEl = document.createElement('iframe');
            mediaEl.src = video.src;
            mediaEl.setAttribute('allowfullscreen', 'true');
            mediaEl.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write');
            mediaEl.setAttribute('title', 'Video');
            mediaEl.tabIndex = 0;
            mediaEl.style.border = 'none';
            mediaEl.addEventListener('load', function () {
                loader.classList.add('is-hidden');
            });
        }

        // ── Assemble DOM ───────────────────────────────────────────────────────
        iWrap.appendChild(loader);
        iWrap.appendChild(mediaEl);
        content.appendChild(closeBtn);
        content.appendChild(iWrap);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // ── Animate in (double RAF ensures transition fires) ───────────────────
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                overlay.classList.add('is-open');
                closeBtn.focus();
            });
        });

        // ── Teardown ───────────────────────────────────────────────────────────
        function close() {
            overlay.classList.remove('is-open');
            document.removeEventListener('keydown', onKeyDown);

            // Stop playback immediately by clearing src
            if (mediaEl.tagName.toLowerCase() === 'iframe') {
                mediaEl.src = '';
            } else {
                try { mediaEl.pause(); } catch (e) { /* noop */ }
                mediaEl.removeAttribute('src');
                mediaEl.load();
            }

            setTimeout(function () {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                document.body.style.overflow = '';
                if (triggerBtn) {
                    triggerBtn.focus();
                }
            }, 320); // matches CSS transition duration
        }

        // Close on close button
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            close();
        });

        // Close on overlay click (if enabled)
        if (opts.closeOverlay === '1') {
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) {
                    close();
                }
            });
        }

        // ESC key + basic focus trap
        function onKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                close();
                return;
            }
            // Tab cycles focus between close button and iframe/video
            if (e.key === 'Tab') {
                e.preventDefault();
                if (document.activeElement === closeBtn) {
                    mediaEl.focus();
                } else {
                    closeBtn.focus();
                }
            }
        }

        document.addEventListener('keydown', onKeyDown);
    }

    // ── Initialise all blocks on page ──────────────────────────────────────────
    function init() {
        var blocks = document.querySelectorAll('.bkbg-vp-outer[data-vp-url]');

        blocks.forEach(function (block) {
            var btn = block.querySelector('.bkbg-vp-btn');
            if (!btn) return;

            var opts = {
                url:          block.dataset.vpUrl          || '',
                autoplay:     block.dataset.vpAutoplay     !== '0',
                muted:        block.dataset.vpMuted        === '1',
                maxWidth:     parseInt(block.dataset.vpMaxWidth,  10) || 900,
                radius:       parseInt(block.dataset.vpRadius,    10) || 12,
                aspectRatio:  block.dataset.vpRatio        || '16-9',
                overlayColor: block.dataset.vpOverlay      || 'rgba(0,0,0,0.88)',
                blur:         block.dataset.vpBlur         || '0',
                closeOverlay: block.dataset.vpCloseOverlay || '1',
                closeColor:   block.dataset.vpCloseColor   || '#ffffff'
            };

            // Skip blocks with no URL set
            if (!opts.url) {
                btn.setAttribute('aria-disabled', 'true');
                btn.style.opacity = '0.5';
                btn.style.cursor  = 'not-allowed';
                return;
            }

            // ── JS hover color swap ─────────────────────────────────────────────
            var hoverBg  = btn.dataset.vpBgHover;
            var hoverTxt = btn.dataset.vpTextHover;

            if (hoverBg || hoverTxt) {
                var cachedBg    = btn.style.background;
                var cachedColor = btn.style.color;

                btn.addEventListener('mouseenter', function () {
                    if (hoverBg)  btn.style.background = hoverBg;
                    if (hoverTxt) btn.style.color       = hoverTxt;
                });
                btn.addEventListener('mouseleave', function () {
                    btn.style.background = cachedBg;
                    btn.style.color      = cachedColor;
                });
            }

            // ── Click → open modal ──────────────────────────────────────────────
            btn.addEventListener('click', function () {
                openModal(opts, btn);
            });
        });
    }

    // ── Boot ───────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
