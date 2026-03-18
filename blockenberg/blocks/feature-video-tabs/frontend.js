(function () {
    'use strict';

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function make(tag, className, styles) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (styles) applyCSS(el, styles);
        return el;
    }

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

    function init() {
        document.querySelectorAll('.bkbg-fvtb-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                tabs: [],
                layout: 'right-video',
                tabStyle: 'pills',
                defaultActive: 0,
                autoAdvance: false,
                autoAdvanceDelay: 5000,
                videoAutoPlay: true,
                videoLoop: true,
                videoMuted: true,
                aspect: '16/9',
                videoRadius: 12,
                videoShadow: true,
                showIcons: true,
                showBullets: true,
                showCta: true,
                gap: 48,
                tabAreaWidth: 40,
                paddingTop: 60,
                paddingBottom: 60,
                headlineSize: 26,
                descSize: 15,
                bulletSize: 14,
                tabLabelSize: 14,
                iconSize: 24,
                bgColor: '',
                accentColor: '#6366f1',
                activeTabBg: '#6366f1',
                activeTabColor: '#ffffff',
                idleTabBg: '',
                idleTabColor: '#374151',
                headlineColor: '#111827',
                descColor: '#4b5563',
                bulletColor: '#374151',
                bulletDot: '#6366f1',
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                videoBg: '#000000'
            }, opts);

            var tabs = o.tabs;
            if (!tabs || tabs.length === 0) return;

            var activeIdx = Math.min(o.defaultActive || 0, tabs.length - 1);
            var autoTimer = null;

            /* ── Aspect ratio ── */
            var aspParts = (o.aspect || '16/9').split('/');
            var aspPB = (+aspParts[1] / +aspParts[0] * 100).toFixed(2) + '%';

            /* ── Outer ── */
            var wrap = make('div', 'bkbg-fvtb-wrap', {
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px',
                background: o.bgColor || '',
                gap: o.gap + 'px'
            });

            typoCssVarsForEl(o.typoHeadline, '--bkbg-fvtb-th-', wrap);
            typoCssVarsForEl(o.typoDesc,     '--bkbg-fvtb-td-', wrap);
            typoCssVarsForEl(o.typoTabLabel,  '--bkbg-fvtb-tl-', wrap);
            typoCssVarsForEl(o.typoBullet,    '--bkbg-fvtb-tb-', wrap);

            /* ── Tab/content column ── */
            var leftCol = make('div', 'bkbg-fvtb-left', {
                width: o.tabAreaWidth + '%',
                gap: '20px'
            });

            /* Tab buttons */
            var tabsEl = make('div', 'bkbg-fvtb-tabs');
            var tabBtns = [];

            /* Content panels */
            var contentPanels = [];

            /* Video elements (one per tab) */
            var videoPanels = [];
            var videoEls = [];

            /* ── Media column ── */
            var mediaCol = make('div', 'bkbg-fvtb-media', { flex: 1 });
            var videoWrap = make('div', 'bkbg-fvtb-video-wrap', {
                paddingBottom: aspPB,
                background: o.videoBg,
                borderRadius: o.videoRadius + 'px',
                boxShadow: o.videoShadow ? '0 20px 40px rgba(0,0,0,0.15)' : 'none'
            });
            mediaCol.appendChild(videoWrap);

            /* ── Build tabs & content ── */
            function buildTabStyles(isActive, idx) {
                var tabBg    = isActive ? (o.activeTabBg || '#6366f1') : (o.idleTabBg || 'transparent');
                var tabColor = isActive ? (o.activeTabColor || '#fff') : (o.idleTabColor || '#374151');
                var btn = tabBtns[idx];
                applyCSS(btn, { background: tabBg, color: tabColor });

                if (o.tabStyle === 'lines') {
                    applyCSS(btn, {
                        background: 'transparent',
                        borderLeft: '3px solid ' + (isActive ? (o.activeTabBg || '#6366f1') : 'transparent')
                    });
                    btn.style.color = isActive ? (o.activeTabBg || '#6366f1') : (o.idleTabColor || '#374151');
                }
            }

            function switchTo(idx) {
                /* Deactivate all */
                tabBtns.forEach(function (btn, i) { btn.classList.toggle('is-active', i === idx); buildTabStyles(i === idx, i); });
                contentPanels.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
                videoPanels.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });

                /* Pause / play videos */
                videoEls.forEach(function (vid, i) {
                    if (!vid) return;
                    if (i === idx) {
                        if (o.videoAutoPlay) vid.play().catch(function () {});
                    } else {
                        vid.pause();
                    }
                });

                activeIdx = idx;
            }

            tabs.forEach(function (tab, idx) {
                /* ── Tab button ── */
                var btn = make('button', 'bkbg-fvtb-tab', {
                    padding: o.tabStyle === 'pills' ? '10px 16px' : (o.tabStyle === 'cards' ? '14px 16px' : '12px 0'),
                    borderRadius: o.tabStyle === 'pills' ? '50px' : (o.tabStyle === 'cards' ? '10px' : '0')
                });
                btn.setAttribute('type', 'button');

                if (o.showIcons && tab.icon) {
                    var iconEl = make('span', 'bkbg-fvtb-tab-icon', { fontSize: o.iconSize + 'px' });
                    var _IP = window.bkbgIconPicker;
                    var _iType = tab.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, tab.icon, tab.iconDashicon, tab.iconImageUrl, tab.iconDashiconColor);
                        if (_in) iconEl.appendChild(_in); else iconEl.textContent = tab.icon || '';
                    } else {
                        iconEl.textContent = tab.icon || '';
                    }
                    btn.appendChild(iconEl);
                }

                var labelEl = make('span', 'bkbg-fvtb-tab-label');
                labelEl.textContent = tab.label || 'Tab ' + (idx + 1);
                btn.appendChild(labelEl);

                btn.addEventListener('click', function () {
                    if (autoTimer) clearInterval(autoTimer);
                    switchTo(idx);
                    if (o.autoAdvance) startAuto();
                });

                tabsEl.appendChild(btn);
                tabBtns.push(btn);

                /* ── Content panel ── */
                var panel = make('div', 'bkbg-fvtb-content');

                var hl = document.createElement('h3');
                hl.className = 'bkbg-fvtb-headline';
                hl.textContent = tab.headline || '';
                applyCSS(hl, { color: o.headlineColor, margin: '0' });
                panel.appendChild(hl);

                var desc = make('p', 'bkbg-fvtb-desc', { color: o.descColor });
                desc.textContent = tab.description || '';
                panel.appendChild(desc);

                if (o.showBullets && tab.bullets && tab.bullets.length) {
                    var ul = make('ul', 'bkbg-fvtb-bullets');
                    tab.bullets.filter(Boolean).forEach(function (b) {
                        var li = make('li', 'bkbg-fvtb-bullet');
                        var dot = make('span', 'bkbg-fvtb-bullet-dot', { color: o.bulletDot });
                        dot.textContent = '✓';
                        var txt = make('span', 'bkbg-fvtb-bullet-text', { color: o.bulletColor });
                        txt.textContent = b;
                        li.appendChild(dot);
                        li.appendChild(txt);
                        ul.appendChild(li);
                    });
                    panel.appendChild(ul);
                }

                if (o.showCta && tab.ctaLabel) {
                    var cta = make('a', 'bkbg-fvtb-cta', {
                        padding: (o.descSize - 2) + 'px ' + (o.descSize + 10) + 'px',
                        background: o.ctaBg,
                        color: o.ctaColor
                    });
                    cta.textContent = tab.ctaLabel;
                    cta.href = tab.ctaUrl || '#';
                    panel.appendChild(cta);
                }

                leftCol.appendChild(panel);
                contentPanels.push(panel);

                /* ── Video panel ── */
                var vPanel = make('div', 'bkbg-fvtb-video-panel');

                var vid = null;
                if (tab.videoUrl) {
                    vid = document.createElement('video');
                    vid.src = tab.videoUrl;
                    if (tab.videoPoster) vid.poster = tab.videoPoster;
                    vid.muted   = true;
                    vid.loop    = !!o.videoLoop;
                    vid.playsInline = true;
                    vid.preload = 'metadata';
                    if (o.videoAutoPlay && idx === activeIdx) vid.autoplay = true;
                    vPanel.appendChild(vid);
                } else if (tab.fallbackImageUrl) {
                    var img = document.createElement('img');
                    img.src = tab.fallbackImageUrl;
                    img.alt = tab.headline || '';
                    vPanel.appendChild(img);
                } else {
                    var placeholder = make('div', 'bkbg-fvtb-video-placeholder', { position: 'absolute', inset: 0 });
                    var playIcon = make('div', '', { fontSize: '48px', opacity: '0.4' });
                    playIcon.textContent = '▶';
                    placeholder.appendChild(playIcon);
                    vPanel.appendChild(placeholder);
                }

                videoWrap.appendChild(vPanel);
                videoPanels.push(vPanel);
                videoEls.push(vid);
            });

            leftCol.insertBefore(tabsEl, leftCol.firstChild);

            /* ── Auto-advance ── */
            function startAuto() {
                if (!o.autoAdvance || tabs.length < 2) return;
                autoTimer = setInterval(function () {
                    var next = (activeIdx + 1) % tabs.length;
                    switchTo(next);
                }, o.autoAdvanceDelay);
            }

            /* ── Keyboard ── */
            tabsEl.setAttribute('role', 'tablist');
            tabsEl.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    switchTo((activeIdx + 1) % tabs.length);
                    tabBtns[(activeIdx) % tabs.length].focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    switchTo((activeIdx - 1 + tabs.length) % tabs.length);
                    tabBtns[activeIdx].focus();
                }
            });

            /* ── Assemble ── */
            var isRightVideo = o.layout !== 'left-video';
            if (isRightVideo) {
                wrap.appendChild(leftCol);
                wrap.appendChild(mediaCol);
            } else {
                wrap.appendChild(mediaCol);
                wrap.appendChild(leftCol);
            }

            /* ── Activate first tab ── */
            switchTo(activeIdx);
            startAuto();

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
