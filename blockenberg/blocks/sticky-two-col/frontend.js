(function () {
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
        document.querySelectorAll('.bkbg-s2c-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                items: [], stickyPosition: 'right', splitRatio: '50-50',
                stickyOffset: 80, imageRadius: 16, showDivider: true, showProgressBar: true,
                iconSize: 36, gap: 80, paddingTop: 0, paddingBottom: 0,
                bgColor: '', panelBg: '#f8f8fc', eyebrowColor: '#6366f1',
                titleColor: '#111827', textColor: '#6b7280', iconBg: '#ede9fe',
                dividerColor: '#e5e7eb', accentColor: '#6366f1'
            }, opts);

            var items = o.items || [];
            if (!items.length) { appEl.style.display = 'none'; return; }

            var ratioMap = { '50-50': [50, 50], '45-55': [45, 55], '55-45': [55, 45], '40-60': [40, 60], '60-40': [60, 40] };
            var ratio = ratioMap[o.splitRatio] || [50, 50];
            var isStickRight = o.stickyPosition === 'right';

            function mk(tag, cls, style) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                return n;
            }

            /* Section */
            var section = mk('div', 'bkbg-s2c-section', {
                background: o.bgColor || '',
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });
            typoCssVarsForEl(section, o.eyebrowTypo, '--bks2c-eb-');
            typoCssVarsForEl(section, o.titleTypo, '--bks2c-tt-');
            typoCssVarsForEl(section, o.bodyTypo, '--bks2c-bd-');
            section.style.setProperty('--bks2c-title-fw', o.titleFontWeight || '800');
            section.style.setProperty('--bks2c-title-lh', String(o.titleLineHeight || 1.2));
            section.style.setProperty('--bks2c-body-lh', String(o.bodyLineHeight || 1.7));

            var shell = mk('div', 'bkbg-s2c-shell');

            /* Sticky panel */
            var stickyColW = (isStickRight ? ratio[1] : ratio[0]);
            var scrollColW = (isStickRight ? ratio[0] : ratio[1]);

            var stickyCol = mk('div', 'bkbg-s2c-sticky', {
                width: stickyColW + '%',
                top: o.stickyOffset + 'px'
            });

            var panelImg = mk('div', 'bkbg-s2c-panel-img', {
                borderRadius: o.imageRadius + 'px',
                background: o.panelBg
            });

            var firstItem = items[0] || {};
            var stickyImg = null;
            var stickyPlaceholder = null;

            if (firstItem.imageUrl) {
                stickyImg = document.createElement('img');
                stickyImg.src = firstItem.imageUrl;
                stickyImg.alt = firstItem.imageAlt || '';
                panelImg.appendChild(stickyImg);
            } else {
                stickyPlaceholder = mk('div', 'bkbg-s2c-panel-placeholder', {
                    background: ((firstItem.accentColor || o.accentColor) + '15'),
                    minHeight: '280px'
                });
                var _IP0 = window.bkbgIconPicker;
                var _t0 = firstItem.iconType || 'custom-char';
                if (_IP0 && _t0 !== 'custom-char') {
                    var _n0 = _IP0.buildFrontendIcon(_t0, firstItem.icon, firstItem.iconDashicon, firstItem.iconImageUrl, firstItem.iconDashiconColor);
                    if (_n0) stickyPlaceholder.appendChild(_n0); else stickyPlaceholder.textContent = firstItem.icon || '🖼️';
                } else { stickyPlaceholder.textContent = firstItem.icon || '🖼️'; }
                panelImg.appendChild(stickyPlaceholder);
            }

            stickyCol.appendChild(panelImg);

            /* Progress bar */
            var progressBar = null;
            var progressFill = null;
            if (o.showProgressBar) {
                progressBar = mk('div', 'bkbg-s2c-progress', { marginTop: '16px' });
                progressFill = mk('div', 'bkbg-s2c-progress-fill', { background: o.accentColor });
                progressBar.appendChild(progressFill);
                stickyCol.appendChild(progressBar);
            }

            /* Scrolling items column */
            var scrollCol = mk('div', 'bkbg-s2c-scroll', {
                width: scrollColW + '%',
                borderLeft: isStickRight && o.showDivider ? ('1px solid ' + o.dividerColor) : 'none',
                borderRight: !isStickRight && o.showDivider ? ('1px solid ' + o.dividerColor) : 'none',
                paddingLeft: isStickRight && o.showDivider ? '0' : '0'
            });

            var itemEls = [];
            var activeIdx = 0;

            function updateSticky(idx) {
                activeIdx = idx;
                var it = items[idx];
                var accent = it.accentColor || o.accentColor;

                /* update progress */
                if (progressFill) {
                    progressFill.style.width = ((idx + 1) / items.length * 100) + '%';
                    progressFill.style.background = accent;
                }

                /* update image */
                if (it.imageUrl) {
                    if (!stickyImg) {
                        stickyImg = document.createElement('img');
                        stickyImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transition:opacity 0.4s ease;border-radius:' + o.imageRadius + 'px';
                        if (stickyPlaceholder) { panelImg.replaceChild(stickyImg, stickyPlaceholder); stickyPlaceholder = null; }
                        else { panelImg.appendChild(stickyImg); }
                    }
                    panelImg.classList.add('fading');
                    setTimeout(function () {
                        stickyImg.src = it.imageUrl;
                        stickyImg.alt = it.imageAlt || '';
                        panelImg.classList.remove('fading');
                    }, 200);
                } else {
                    if (!stickyPlaceholder) {
                        stickyPlaceholder = mk('div', 'bkbg-s2c-panel-placeholder', { minHeight: '280px' });
                        if (stickyImg) { panelImg.replaceChild(stickyPlaceholder, stickyImg); stickyImg = null; }
                        else { panelImg.appendChild(stickyPlaceholder); }
                    }
                    var _IP2 = window.bkbgIconPicker;
                    var _pType = it.iconType || 'custom-char';
                    if (_IP2 && _pType !== 'custom-char') {
                        stickyPlaceholder.innerHTML = '';
                        var _pn = _IP2.buildFrontendIcon(_pType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor);
                        if (_pn) stickyPlaceholder.appendChild(_pn); else stickyPlaceholder.textContent = it.icon || '🖼️';
                    } else { stickyPlaceholder.textContent = it.icon || '🖼️'; }
                    stickyPlaceholder.style.background = accent + '15';
                }

                /* update items active state */
                itemEls.forEach(function (info, i) {
                    var isAct = i === idx;
                    var iAccent = items[i].accentColor || o.accentColor;
                    info.el.classList.toggle('active', isAct);
                    if (isStickRight) {
                        info.el.style.borderLeft = '3px solid ' + (isAct ? iAccent : 'transparent');
                        info.el.style.paddingLeft = '24px';
                    } else {
                        info.el.style.borderRight = '3px solid ' + (isAct ? iAccent : 'transparent');
                        info.el.style.paddingRight = '24px';
                    }
                    info.icon.style.background = isAct ? (iAccent + '20') : o.iconBg;
                    info.eyebrow.style.color = isAct ? iAccent : o.textColor;
                });
            }

            items.forEach(function (it, idx) {
                var accent = it.accentColor || o.accentColor;
                var wrapper = mk('div', 'bkbg-s2c-item' + (idx === 0 ? ' active' : ''), {
                    paddingBottom: idx < items.length - 1 ? o.gap + 'px' : '28px',
                    paddingTop: '28px',
                    borderLeft: isStickRight ? ('3px solid ' + (idx === 0 ? accent : 'transparent')) : 'none',
                    paddingLeft: isStickRight ? '24px' : '0',
                    borderRight: !isStickRight ? ('3px solid ' + (idx === 0 ? accent : 'transparent')) : 'none',
                    paddingRight: !isStickRight ? '24px' : '0'
                });

                var inner = mk('div', 'bkbg-s2c-item-inner');

                var iconEl = mk('div', 'bkbg-s2c-icon', {
                    width: o.iconSize + 'px',
                    height: o.iconSize + 'px',
                    background: idx === 0 ? (accent + '20') : o.iconBg,
                    fontSize: Math.round(o.iconSize * 0.55) + 'px'
                });
                var _IP = window.bkbgIconPicker;
                var _iType = it.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor);
                    if (_in) iconEl.appendChild(_in); else iconEl.textContent = it.icon || '●';
                } else { iconEl.textContent = it.icon || '●'; }
                inner.appendChild(iconEl);

                var textWrap = mk('div', 'bkbg-s2c-item-text');
                var eyebrow = mk('div', 'bkbg-s2c-eyebrow', { color: idx === 0 ? accent : o.textColor });
                eyebrow.textContent = it.eyebrow || '';
                textWrap.appendChild(eyebrow);

                var titleEl = mk('h3', 'bkbg-s2c-title', { color: o.titleColor });
                titleEl.innerHTML = it.title || '';
                textWrap.appendChild(titleEl);

                var textEl = mk('p', 'bkbg-s2c-text', { color: o.textColor });
                textEl.innerHTML = it.text || '';
                textWrap.appendChild(textEl);

                inner.appendChild(textWrap);
                wrapper.appendChild(inner);
                scrollCol.appendChild(wrapper);
                itemEls.push({ el: wrapper, icon: iconEl, eyebrow: eyebrow });
            });

            /* IntersectionObserver */
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var idx = itemEls.findIndex(function (info) { return info.el === entry.target; });
                        if (idx < 0) {
                            /* IE-safe fallback */
                            for (var j = 0; j < itemEls.length; j++) {
                                if (itemEls[j].el === entry.target) { idx = j; break; }
                            }
                        }
                        if (idx >= 0) updateSticky(idx);
                    }
                });
            }, { threshold: 0.5 });

            itemEls.forEach(function (info) { obs.observe(info.el); });

            if (isStickRight) {
                shell.appendChild(scrollCol);
                shell.appendChild(stickyCol);
            } else {
                shell.appendChild(stickyCol);
                shell.appendChild(scrollCol);
            }

            section.appendChild(shell);
            updateSticky(0);
            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
