(function () {
    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-ir-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                imageUrl: '',
                imageAlt: '',
                trigger: 'scroll',
                direction: 'left',
                revealStyle: 'sweep',
                aspectRatio: '16-9',
                borderRadius: 8,
                showOverlayLabel: true,
                overlayLabel: 'Hover to reveal',
                revealedLabel: '',
                showRevealedLabel: false,
                caption: '',
                showCaption: false,
                overlayOpacity: 75,
                animationDuration: 600,
                revealOnce: true,
                scrollThreshold: 30,
                overlayBg: '#1e1b4b',
                overlayTextColor: '#ffffff',
                captionColor: '#6b7280',
                labelSize: 18,
                maxWidth: 0,
            }, opts);

            if (!o.imageUrl) return;

            // Aspect ratio
            var RATIO_MAP = {
                '1-1': '100%',
                '4-3': '75%',
                '3-2': '66.67%',
                '16-9': '56.25%',
                '21-9': '42.86%',
                '9-16': '177.78%',
            };

            // Figure
            var figure = document.createElement('figure');
            figure.className = 'bkbg-ir-figure';
            figure.style.margin = '0';
            figure.style.position = 'relative';
            typoCssVarsForEl(o.labelTypo, '--bkbg-ir-lb-', figure);
            typoCssVarsForEl(o.captionTypo, '--bkbg-ir-cp-', figure);

            // Container
            var container = document.createElement('div');
            container.className = 'bkbg-ir-container trigger-' + o.trigger;
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.borderRadius = o.borderRadius + 'px';
            container.style.lineHeight = '0';
            if (o.maxWidth > 0) {
                container.style.maxWidth = o.maxWidth + 'px';
                container.style.margin = '0 auto';
            }

            if (o.aspectRatio !== 'auto' && RATIO_MAP[o.aspectRatio]) {
                container.classList.add('is-fixed-ratio');
                container.style.paddingTop = RATIO_MAP[o.aspectRatio];
                container.style.height = '0';
            } else {
                container.classList.add('is-auto-ratio');
            }

            // Image
            var img = document.createElement('img');
            img.src = o.imageUrl;
            img.alt = o.imageAlt;
            img.className = 'bkbg-ir-img style-' + o.revealStyle;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.display = 'block';
            img.style.objectFit = 'cover';
            img.style.transitionDuration = o.animationDuration + 'ms';
            if (o.aspectRatio !== 'auto') {
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';
            }

            // Overlay
            var overlay = document.createElement('div');
            overlay.className = 'bkbg-ir-overlay style-' + o.revealStyle;
            overlay.style.position = 'absolute';
            overlay.style.inset = '0';
            overlay.style.background = o.overlayBg;
            overlay.style.opacity = String(o.overlayOpacity / 100);
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.transitionDuration = o.animationDuration + 'ms';

            if (o.revealStyle === 'sweep') {
                overlay.classList.add('dir-' + o.direction);
            }

            if (o.showOverlayLabel && o.overlayLabel) {
                var labelEl = document.createElement('div');
                labelEl.className = 'bkbg-ir-overlay-label';
                labelEl.textContent = o.overlayLabel;
                labelEl.style.color = o.overlayTextColor;
                labelEl.style.pointerEvents = 'none';
                overlay.appendChild(labelEl);
            }

            // Revealed label
            var revealedLabelEl = null;
            if (o.showRevealedLabel && o.revealedLabel) {
                revealedLabelEl = document.createElement('div');
                revealedLabelEl.className = 'bkbg-ir-revealed-label';
                revealedLabelEl.textContent = o.revealedLabel;
                revealedLabelEl.style.color = o.overlayTextColor;
                revealedLabelEl.style.fontSize = o.labelSize + 'px';
                revealedLabelEl.style.fontWeight = '600';
                revealedLabelEl.style.position = 'absolute';
                revealedLabelEl.style.bottom = '12px';
                revealedLabelEl.style.left = '12px';
                revealedLabelEl.style.right = '12px';
                revealedLabelEl.style.textAlign = 'center';
                revealedLabelEl.style.opacity = '0';
                revealedLabelEl.style.transition = 'opacity 0.3s ease 0.3s';
                revealedLabelEl.style.pointerEvents = 'none';
                // Add semi-transparent background for readability
                revealedLabelEl.style.background = 'rgba(0,0,0,0.4)';
                revealedLabelEl.style.borderRadius = '4px';
                revealedLabelEl.style.padding = '6px 10px';
            }

            container.appendChild(img);
            container.appendChild(overlay);
            if (revealedLabelEl) container.appendChild(revealedLabelEl);
            figure.appendChild(container);

            // Caption
            if (o.showCaption && o.caption) {
                var cap = document.createElement('figcaption');
                cap.className = 'bkbg-ir-caption';
                cap.textContent = o.caption;
                cap.style.color = o.captionColor;
                figure.appendChild(cap);
            }

            // Reveal function
            var revealed = false;
            function reveal() {
                if (revealed && o.revealOnce) return;
                revealed = true;
                container.classList.add('is-revealed');
                if (revealedLabelEl) revealedLabelEl.style.opacity = '1';
            }
            function unreveal() {
                if (o.revealOnce) return;
                revealed = false;
                container.classList.remove('is-revealed');
                if (revealedLabelEl) revealedLabelEl.style.opacity = '0';
            }

            // Trigger
            if (o.trigger === 'hover') {
                container.style.cursor = 'default';
                container.addEventListener('mouseenter', reveal);
                container.addEventListener('mouseleave', unreveal);
            } else if (o.trigger === 'click') {
                container.style.cursor = 'pointer';
                container.addEventListener('click', function () {
                    if (revealed) { unreveal(); } else { reveal(); }
                });
            } else {
                // Scroll — IntersectionObserver
                var threshold = Math.max(0.05, Math.min(0.95, o.scrollThreshold / 100));
                if ('IntersectionObserver' in window) {
                    var io = new IntersectionObserver(function (entries) {
                        entries.forEach(function (entry) {
                            if (entry.isIntersecting) {
                                reveal();
                                if (o.revealOnce) io.unobserve(container);
                            } else {
                                unreveal();
                            }
                        });
                    }, { threshold: threshold });
                    io.observe(container);
                } else {
                    // Fallback: reveal immediately
                    reveal();
                }
            }

            appEl.parentNode.insertBefore(figure, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
