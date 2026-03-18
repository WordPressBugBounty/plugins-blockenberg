(function () {
    'use strict';

    var svgNS = 'http://www.w3.org/2000/svg';
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.bkbg-hw-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var text         = opts.text        || '';
        var fontFamily   = opts.fontFamily  || "'Dancing Script', cursive";
        var fontSize     = opts.fontSize    || 72;
        var fontWeight   = opts.fontWeight  || '700';
        var svgWidth     = opts.svgWidth    || 900;
        var svgHeight    = opts.svgHeight   || 140;
        var textX        = opts.textX       || 50;
        var textY        = opts.textY       || 110;
        var textAnchor   = opts.textAnchor  || 'middle';
        var strokeWidth  = opts.strokeWidth || 2;
        var duration     = opts.duration    || 3;
        var delay        = opts.delay       || 0.3;
        var trigger      = opts.trigger     || 'scroll';
        var fillOnComplete = opts.fillOnComplete !== false;
        var fillDuration = opts.fillDuration || 0.8;
        var repeatAnim   = opts.repeatAnimation || false;
        var easing       = opts.easing      || 'ease-in-out';
        var textColor    = opts.textColor   || '#0f172a';
        var strokeColor  = opts.strokeColor || '#6366f1';
        var align2       = opts.align2      || 'center';
        var sectionBg    = opts.sectionBg   || '';
        var showUnderline  = opts.showUnderline || false;
        var underlineColor = opts.underlineColor || '#6366f1';
        var underlineWidth = opts.underlineWidth || 4;
        var underlineOffsetY = opts.underlineOffsetY || 12;
        var underlineDuration = opts.underlineDuration || 0.6;

        if (sectionBg) app.style.background = sectionBg;

        /* typography CSS vars */
        if (window.typoCssVarsForEl) window.typoCssVarsForEl(opts.typoText, '--bkbg-hw-tt-', app);

        // Build SVG
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight);
        svg.setAttribute('width', '100%');
        svg.style.cssText = 'display:block;overflow:visible;max-width:' + svgWidth + 'px;' +
            'margin:' + (align2 === 'center' ? '0 auto' : align2 === 'right' ? '0 0 0 auto' : '0');

        // Text element
        var textEl = document.createElementNS(svgNS, 'text');
        textEl.className.baseVal = 'bkbg-hw-text';
        textEl.setAttribute('x', textX + '%');
        textEl.setAttribute('y', textY);
        textEl.setAttribute('text-anchor', textAnchor);
        textEl.setAttribute('stroke', strokeColor);
        textEl.setAttribute('stroke-width', strokeWidth);
        textEl.textContent = text;

        svg.appendChild(textEl);

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-hw-wrap';
        wrap.style.textAlign = align2;
        wrap.appendChild(svg);
        app.appendChild(wrap);

        // Need text in DOM before measuring
        // Use requestAnimationFrame to let browser render
        requestAnimationFrame(function () {
            var len = 5000; // large fallback
            try { len = textEl.getComputedTextLength() || 5000; } catch (e) { }
            len = Math.max(len, textEl.getTotalLength ? textEl.getTotalLength() : len);

            // Also build underline path if requested
            var ulEl = null;
            var ulLen = 0;
            if (showUnderline) {
                // Get bounding box to draw underline across actual text width
                var bbox = { x: 0, width: svgWidth };
                try { bbox = textEl.getBBox(); } catch (e) { }
                var ulY  = parseFloat(textY) + underlineOffsetY;
                var ulX1 = bbox.x;
                var ulX2 = bbox.x + bbox.width;

                ulEl = document.createElementNS(svgNS, 'path');
                ulEl.className.baseVal = 'bkbg-hw-underline';
                ulEl.setAttribute('d', 'M ' + ulX1 + ' ' + ulY + ' L ' + ulX2 + ' ' + ulY);
                ulEl.setAttribute('stroke', underlineColor);
                ulEl.setAttribute('stroke-width', underlineWidth);
                ulEl.setAttribute('stroke-linecap', 'round');
                svg.appendChild(ulEl);

                ulLen = (ulX2 - ulX1) || svgWidth;
            }

            function setupInitialState() {
                if (reducedMotion) {
                    // Show immediately
                    textEl.setAttribute('fill', textColor);
                    textEl.setAttribute('stroke', 'none');
                    if (ulEl) {
                        ulEl.style.strokeDasharray = '';
                        ulEl.style.strokeDashoffset = '';
                    }
                    return;
                }

                // Set dash = full length = hidden
                textEl.style.strokeDasharray = len;
                textEl.style.strokeDashoffset = len;
                textEl.setAttribute('fill', 'transparent');
                textEl.style.transition = 'none';

                if (ulEl) {
                    ulEl.style.strokeDasharray = ulLen;
                    ulEl.style.strokeDashoffset = ulLen;
                    ulEl.style.transition = 'none';
                }
            }

            function startAnimation() {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        // Draw stroke
                        textEl.style.transition = 'stroke-dashoffset ' + duration + 's ' + easing + ' ' + delay + 's';
                        textEl.style.strokeDashoffset = 0;

                        // Underline draws after text
                        if (ulEl) {
                            var ulDelay = delay + duration * 0.9;
                            ulEl.style.transition = 'stroke-dashoffset ' + underlineDuration + 's ease-out ' + ulDelay + 's';
                            ulEl.style.strokeDashoffset = 0;
                        }

                        // Fill text after stroke completes
                        if (fillOnComplete) {
                            var fillDelay = delay + duration;
                            setTimeout(function () {
                                textEl.classList.add('bkbg-hw-filled');
                                textEl.style.fill = textColor;
                                textEl.style.fillOpacity = '1';
                                textEl.style.transitionProperty = 'fill';
                                textEl.style.transitionDuration = fillDuration + 's';
                                textEl.style.transitionTimingFunction = 'ease-in-out';
                            }, fillDelay * 1000);
                        }
                    });
                });
            }

            function resetAnimation() {
                textEl.style.transition = 'none';
                textEl.style.strokeDashoffset = len;
                textEl.setAttribute('fill', 'transparent');
                textEl.classList.remove('bkbg-hw-filled');
                if (ulEl) {
                    ulEl.style.transition = 'none';
                    ulEl.style.strokeDashoffset = ulLen;
                }
            }

            setupInitialState();

            if (reducedMotion) return; // Don't animate for reduced motion users

            if (trigger === 'load') {
                startAnimation();
            } else if (trigger === 'click') {
                app.style.cursor = 'pointer';
                var played = false;
                app.addEventListener('click', function () {
                    if (played) resetAnimation();
                    setTimeout(startAnimation, played ? 50 : 0);
                    played = true;
                });
            } else {
                // scroll (IntersectionObserver)
                var played2 = false;
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting && !played2) {
                            played2 = true;
                            startAnimation();
                            if (!repeatAnim) io.unobserve(app);
                        } else if (!entry.isIntersecting && repeatAnim && played2) {
                            played2 = false;
                            resetAnimation();
                        }
                    });
                }, { threshold: 0.3 });
                io.observe(app);
            }
        });
    });
})();
