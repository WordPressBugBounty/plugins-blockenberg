(function () {
    /* ── typography CSS-var helper ──────────────────────────── */
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

    function init() {
        document.querySelectorAll('.bkbg-sty-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                chapters: [], defaultBgUrl: '',
                stickyHeight: '70vh', textPosition: 'left',
                showProgress: true, transitionStyle: 'fade', panelWidth: 420,
                eyebrowColor: '#a5b4fc', titleColor: '#ffffff', textColor: '#e5e7eb',
                textBg: '', progressColor: '#6366f1', accentColor: '#6366f1',
                paddingTop: 0, paddingBottom: 0
            }, opts);

            var chapters = o.chapters || [];
            if (!chapters.length) { appEl.style.display = 'none'; return; }

            function mk(tag, cls, style) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                return n;
            }

            /* Section wrapper */
            var section = mk('div', 'bkbg-sty-section', {
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });

            typoCssVarsForEl(section, o.titleTypo, '--bksty-tt-');
            typoCssVarsForEl(section, o.eyebrowTypo, '--bksty-et-');
            typoCssVarsForEl(section, o.bodyTypo, '--bksty-bt-');

            /* Sticky background */
            var sticky = mk('div', 'bkbg-sty-sticky', { height: o.stickyHeight });

            /* Two bg layers for crossfade */
            var bgA = mk('div', 'bkbg-sty-bg-layer');
            var bgB = mk('div', 'bkbg-sty-bg-layer');
            var overlay = mk('div', 'bkbg-sty-overlay');

            var firstBg = chapters[0].imageUrl || o.defaultBgUrl;
            if (firstBg) {
                bgA.style.backgroundImage = 'url(' + firstBg + ')';
                bgA.style.opacity = '1';
            }
            bgB.style.opacity = '0';

            sticky.appendChild(bgA);
            sticky.appendChild(bgB);
            sticky.appendChild(overlay);
            section.appendChild(sticky);

            /* Text panels */
            var panelsWrap = mk('div', 'bkbg-sty-panels');
            /* Pull panels UP to overlap sticky (sticky is pos:sticky so panels scroll over it) */
            panelsWrap.style.marginTop = '-' + o.stickyHeight;

            var panelEls = [];

            chapters.forEach(function (ch) {
                var panel = mk('div', 'bkbg-sty-panel sty-pos-' + o.textPosition, {
                    minHeight: o.stickyHeight,
                    padding: '0 48px'
                });

                var inner = mk('div', 'bkbg-sty-panel-inner', {
                    width: o.panelWidth + 'px',
                    background: o.textBg || 'rgba(0,0,0,0.45)',
                    color: o.textColor
                });

                if (ch.eyebrow) {
                    var ew = mk('span', 'bkbg-sty-eyebrow', { color: o.eyebrowColor });
                    ew.textContent = ch.eyebrow;
                    inner.appendChild(ew);
                }

                var titleEl = mk('h2', 'bkbg-sty-title', { color: o.titleColor });
                titleEl.innerHTML = ch.title || '';
                inner.appendChild(titleEl);

                if (ch.text) {
                    var textEl = mk('p', 'bkbg-sty-text', { color: o.textColor });
                    textEl.innerHTML = ch.text;
                    inner.appendChild(textEl);
                }

                panel.appendChild(inner);
                panelsWrap.appendChild(panel);
                panelEls.push(panel);
            });

            section.appendChild(panelsWrap);

            /* Progress indicator */
            var progressEl = null;
            var progressDots = [];
            if (o.showProgress) {
                progressEl = mk('div', 'bkbg-sty-progress');
                chapters.forEach(function (_, i) {
                    var dot = mk('div', 'bkbg-sty-progress-dot' + (i === 0 ? ' active' : ''), {
                        background: i === 0 ? o.progressColor : 'rgba(255,255,255,0.4)',
                        border: '2px solid ' + o.progressColor
                    });
                    dot.title = chapters[i].title || '';
                    dot.dataset.index = i;
                    dot.addEventListener('click', function () {
                        panelEls[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                    progressEl.appendChild(dot);
                    progressDots.push(dot);
                });
                section.appendChild(progressEl);
            }

            /* IntersectionObserver for chapter changes */
            var activeBgUrl = firstBg;
            var activeLayer = bgA; /* currently shown */
            var hiddenLayer = bgB;
            var activeIndex = -1;

            function setActiveChapter(idx) {
                if (idx === activeIndex) return;
                activeIndex = idx;
                var ch = chapters[idx];

                /* swap overlay */
                var opacity = (ch.overlayOpacity || 0) / 100;
                overlay.style.background = ch.overlayColor
                    ? 'rgba(' + hexToRgb(ch.overlayColor) + ',' + opacity + ')'
                    : 'rgba(0,0,0,' + opacity + ')';

                /* bg transition */
                var newUrl = ch.imageUrl || o.defaultBgUrl;
                if (newUrl !== activeBgUrl) {
                    hiddenLayer.style.backgroundImage = 'url(' + newUrl + ')';

                    if (o.transitionStyle === 'slide') {
                        hiddenLayer.style.transform = 'translateX(100%)';
                        hiddenLayer.style.opacity = '1';
                        hiddenLayer.style.transition = 'transform 0.6s ease, opacity 0.1s';
                        activeLayer.style.transition = 'transform 0.6s ease';
                        requestAnimationFrame(function () {
                            hiddenLayer.style.transform = 'translateX(0)';
                            activeLayer.style.transform = 'translateX(-100%)';
                        });
                    } else {
                        hiddenLayer.style.opacity = '0';
                        hiddenLayer.style.transition = 'opacity 0.6s ease';
                        activeLayer.style.transition = 'opacity 0.6s ease';
                        requestAnimationFrame(function () {
                            hiddenLayer.style.opacity = '1';
                            activeLayer.style.opacity = '0';
                        });
                    }

                    /* swap references */
                    var tmp = activeLayer; activeLayer = hiddenLayer; hiddenLayer = tmp;
                    activeBgUrl = newUrl;

                    /* reset hidden layer after transition */
                    setTimeout(function () {
                        hiddenLayer.style.transform = '';
                        hiddenLayer.style.transition = '';
                    }, 700);
                }

                /* progress dots */
                if (progressDots.length) {
                    progressDots.forEach(function (d, i) {
                        d.classList.toggle('active', i === idx);
                        d.style.background = i === idx ? o.progressColor : 'rgba(255,255,255,0.4)';
                    });
                }
            }

            /* helper: hex to rgb */
            function hexToRgb(hex) {
                var r = parseInt(hex.slice(1, 3), 16);
                var g = parseInt(hex.slice(3, 5), 16);
                var b = parseInt(hex.slice(5, 7), 16);
                return r + ',' + g + ',' + b;
            }

            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var idx = panelEls.indexOf(entry.target);
                        if (idx > -1) setActiveChapter(idx);
                    }
                });
                /* show progress when section is in view */
                if (progressEl) {
                    var anyVisible = entries.some(function (e) { return e.isIntersecting; });
                    if (anyVisible) progressEl.classList.add('visible');
                }
            }, { threshold: 0.4 });

            panelEls.forEach(function (p) { obs.observe(p); });
            if (activeIndex === -1 && panelEls.length) setActiveChapter(0);

            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
