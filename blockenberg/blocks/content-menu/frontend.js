(function () {
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

    function init() {
        document.querySelectorAll('.bkbg-cm-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                links: [], position: 'inline', menuStyle: 'pills',
                showIcons: true, showNumbers: false, animateScroll: true,
                fixedTop: 50, fixedOffset: 24, menuWidth: 180, borderRadius: 12,
                paddingTop: 0, paddingBottom: 0,
                bgColor: '#ffffff', linkColor: '#374151', activeBg: '#6366f1',
                activeColor: '#ffffff', borderColor: '#e5e7eb',
                shadowColor: 'rgba(0,0,0,0.08)', accentColor: '#6366f1'
            }, opts);

            var links = o.links || [];
            if (!links.length) { appEl.style.display = 'none'; return; }

            function mk(tag, cls, style) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                return n;
            }

            var isFixed = o.position === 'fixed-left' || o.position === 'fixed-right';
            var isDots = o.menuStyle === 'dots';
            var isTabs = o.menuStyle === 'tabs';
            var isList = o.menuStyle === 'list';
            var isPills = o.menuStyle === 'pills';

            /* Nav container */
            var navClasses = 'bkbg-cm-nav cm-' + o.menuStyle;
            if (isFixed) navClasses += ' cm-' + o.position;

            var nav = mk('nav', navClasses, {
                background: o.bgColor,
                border: '1px solid ' + o.borderColor,
                borderRadius: o.borderRadius + 'px',
                boxShadow: '0 2px 16px ' + o.shadowColor,
                maxWidth: o.menuWidth + 'px',
                zIndex: '9999'
            });

            if (isFixed) {
                nav.style.position = 'fixed';
                nav.style.top = o.fixedTop + 'vh';
                nav.style.transform = 'translateY(-50%)';
                if (o.position === 'fixed-left') { nav.style.left = o.fixedOffset + 'px'; }
                else { nav.style.right = o.fixedOffset + 'px'; }
            }

            var linkEls = [];
            var dotEls = [];
            var activeIdx = 0;

            function setActive(idx) {
                activeIdx = idx;
                linkEls.forEach(function (info, i) {
                    var isAct = i === idx;
                    if (isDots) {
                        info.dot.style.width = isAct ? '22px' : '10px';
                        info.dot.style.background = isAct ? o.activeBg : o.borderColor;
                    } else if (isPills) {
                        info.el.style.background = isAct ? o.activeBg : 'transparent';
                        info.el.style.color = isAct ? o.activeColor : o.linkColor;
                        info.el.style.fontWeight = isAct ? '700' : '500';
                    } else if (isList) {
                        info.el.style.color = isAct ? o.accentColor : o.linkColor;
                        info.el.style.borderLeftColor = isAct ? o.accentColor : 'transparent';
                        info.el.style.fontWeight = isAct ? '700' : '500';
                    } else if (isTabs) {
                        info.el.style.color = isAct ? o.accentColor : o.linkColor;
                        info.el.style.borderBottomColor = isAct ? o.accentColor : 'transparent';
                        info.el.style.fontWeight = isAct ? '700' : '500';
                    }
                });
            }

            links.forEach(function (lk, idx) {
                if (isDots) {
                    var dot = mk('div', 'bkbg-cm-dot', {
                        width: idx === 0 ? '22px' : '10px',
                        background: idx === 0 ? o.activeBg : o.borderColor,
                        cursor: 'pointer'
                    });
                    dot.title = lk.label;
                    dot.addEventListener('click', function () {
                        scrollToAnchor(lk.anchor);
                        setActive(idx);
                    });
                    nav.appendChild(dot);
                    linkEls.push({ dot: dot });
                    return;
                }

                var linkEl = mk('div', 'bkbg-cm-link' + (idx === 0 ? ' active' : ''), {
                    color: idx === 0 ? (isPills ? o.activeColor : o.accentColor) : o.linkColor,
                    background: idx === 0 && isPills ? o.activeBg : 'transparent',
                    fontWeight: idx === 0 ? '700' : '500',
                    padding: isPills ? '7px 16px' : isList ? '9px 14px' : '9px 18px',
                    borderRadius: isPills ? '8px' : '0',
                    borderLeft: isList ? ('3px solid ' + (idx === 0 ? o.accentColor : 'transparent')) : 'none',
                    borderBottom: isTabs ? ('2px solid ' + (idx === 0 ? o.accentColor : 'transparent')) : 'none',
                    userSelect: 'none'
                });

                if (o.showNumbers) {
                    var num = mk('span', 'bkbg-cm-num');
                    num.textContent = (idx + 1) + '.';
                    linkEl.appendChild(num);
                }

                if (o.showIcons && lk.icon) {
                    var icon = mk('span', 'bkbg-cm-link-icon');
                    var _IP = window.bkbgIconPicker;
                    var _iType = lk.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, lk.icon, lk.iconDashicon, lk.iconImageUrl, lk.iconDashiconColor);
                        if (_in) icon.appendChild(_in);
                        else icon.textContent = lk.icon;
                    } else {
                        icon.textContent = lk.icon;
                    }
                    linkEl.appendChild(icon);
                }

                var label = mk('span', '');
                label.textContent = lk.label;
                linkEl.appendChild(label);

                linkEl.addEventListener('click', function () {
                    scrollToAnchor(lk.anchor);
                    setActive(idx);
                });

                nav.appendChild(linkEl);
                linkEls.push({ el: linkEl });
            });

            function scrollToAnchor(anchor) {
                var target = document.getElementById(anchor) || document.querySelector('[name="' + anchor + '"]');
                if (!target) return;
                if (o.animateScroll) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    target.scrollIntoView();
                }
            }

            /* Apply typography vars (new system) */
            typoCssVarsForEl(o.typoLink, '--bkcm-link-', nav);

            var targets = links.map(function (lk) {
                return document.getElementById(lk.anchor) || document.querySelector('[name="' + lk.anchor + '"]');
            });

            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var idx = targets.indexOf(entry.target);
                        if (idx >= 0) setActive(idx);
                    }
                });
            }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

            targets.forEach(function (t) { if (t) obs.observe(t); });

            /* Inline: insert nav as a block, fixed: append to body */
            if (isFixed) {
                document.body.appendChild(nav);
            } else {
                var wrapper = mk('div', 'bkbg-cm-wrap', {
                    paddingTop: o.paddingTop + 'px',
                    paddingBottom: o.paddingBottom + 'px'
                });
                wrapper.appendChild(nav);
                appEl.parentNode.insertBefore(wrapper, appEl);
            }
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
