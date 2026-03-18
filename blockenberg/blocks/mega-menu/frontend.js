(function () {
    'use strict';

    document.querySelectorAll('.bkbg-mm-app').forEach(function (app) {
        var opts;
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style', decoration:'text-decoration', transform:'text-transform', sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m', lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m', letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m', wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        function typoCssVarsForEl(el, typo, prefix) {
            if (!typo || typeof typo !== 'object') return;
            Object.keys(_typoKeys).forEach(function (k) {
                if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], typo[k]);
            });
        }

        var items         = opts.items         || [];
        var logoUrl       = opts.logoUrl       || '';
        var logoAlt       = opts.logoAlt       || 'Logo';
        var logoWidth     = parseInt(opts.logoWidth) || 140;
        var ctaLabel      = opts.ctaLabel      || 'Get Started';
        var ctaUrl        = opts.ctaUrl        || '#';
        var showCta       = opts.showCta       !== false;
        var ctaStyle      = opts.ctaStyle      || 'filled';
        var showIcons     = opts.showIcons     !== false;
        var showDescs     = opts.showDescriptions !== false;
        var panelWidth    = parseInt(opts.panelWidth)  || 820;
        var panelRadius   = parseInt(opts.panelRadius) || 16;
        var menuHeight    = parseInt(opts.menuHeight)  || 64;
        var sticky        = opts.sticky        !== false;
        var openOnHover   = opts.openOnHover   !== false;
        var menuBg        = opts.menuBg        || '#ffffff';
        var menuText      = opts.menuText      || '#0f172a';
        var menuBorder    = opts.menuBorder    || '#e2e8f0';
        var panelBg       = opts.panelBg       || '#ffffff';
        var panelText     = opts.panelText     || '#0f172a';
        var accentColor   = opts.accentColor   || '#6366f1';
        var ctaBg         = opts.ctaBg         || '#6366f1';
        var ctaColor      = opts.ctaColor      || '#ffffff';
        var featuredBg    = opts.featuredBg    || '#ede9fe';

        // CSS vars
        app.style.setProperty('--mm-accent',     accentColor);
        app.style.setProperty('--mm-menu-bg',    menuBg);
        app.style.setProperty('--mm-text',       menuText);
        app.style.setProperty('--mm-border',     menuBorder);
        app.style.setProperty('--mm-panel-bg',   panelBg);
        app.style.setProperty('--mm-panel-text', panelText);
        app.style.setProperty('--mm-cta-bg',     ctaBg);
        app.style.setProperty('--mm-cta-clr',    ctaColor);
        app.style.setProperty('--mm-feat-bg',    featuredBg);
        app.style.setProperty('--mm-height',     menuHeight + 'px');

        typoCssVarsForEl(app, opts.navTypo, '--bkbg-mm-nv-');
        typoCssVarsForEl(app, opts.colHeadingTypo, '--bkbg-mm-ch-');
        typoCssVarsForEl(app, opts.linkTypo, '--bkbg-mm-lk-');

        function el(tag, className) {
            var d = document.createElement(tag);
            if (className) d.className = className;
            return d;
        }

        // ── Bar ──
        var bar = el('nav', 'bkbg-mm-bar');
        bar.style.height = menuHeight + 'px';
        app.appendChild(bar);

        // Spacer for sticky offset
        var spacer = el('div', 'bkbg-mm-spacer');
        spacer.style.height = menuHeight + 'px';
        app.appendChild(spacer);

        if (sticky) bar.classList.add('bkbg-mm-sticky');

        // Logo
        var logoLink = el('a', 'bkbg-mm-logo');
        logoLink.href = '/';
        if (logoUrl) {
            var logoImg = el('img');
            logoImg.src = logoUrl;
            logoImg.alt = logoAlt;
            logoImg.style.width  = logoWidth + 'px';
            logoImg.style.maxHeight = (menuHeight - 20) + 'px';
            logoImg.style.objectFit = 'contain';
            logoLink.appendChild(logoImg);
        } else {
            var logoText = el('span', 'bkbg-mm-logo-text');
            logoText.textContent = logoAlt;
            logoLink.appendChild(logoText);
        }
        bar.appendChild(logoLink);

        // Nav
        var nav = el('ul', 'bkbg-mm-nav');
        bar.appendChild(nav);

        // CTA
        if (showCta && ctaLabel) {
            var ctaEl = el('a', 'bkbg-mm-cta bkbg-mm-cta-' + ctaStyle);
            ctaEl.href = ctaUrl;
            ctaEl.textContent = ctaLabel;
            bar.appendChild(ctaEl);
        }

        // Hamburger
        var hamburger = el('button', 'bkbg-mm-hamburger');
        hamburger.setAttribute('aria-label', 'Toggle menu');
        hamburger.setAttribute('aria-expanded', 'false');
        [1,2,3].forEach(function() {
            hamburger.appendChild(el('span', 'bkbg-mm-ham-line'));
        });
        bar.appendChild(hamburger);

        // Mobile drawer
        var drawer = el('div', 'bkbg-mm-drawer');
        app.appendChild(drawer);

        hamburger.addEventListener('click', function () {
            var open = drawer.classList.toggle('bkbg-mm-drawer-open');
            hamburger.classList.toggle('bkbg-mm-open', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // ── State ──
        var openPanel   = null;
        var panelEls    = [];
        var navLinkEls  = [];

        function closeAll() {
            panelEls.forEach(function (p) { p.classList.remove('bkbg-mm-panel-open'); });
            navLinkEls.forEach(function (l) { l.classList.remove('bkbg-mm-active'); });
            openPanel = null;
        }

        function openPanelFor(idx) {
            closeAll();
            if (panelEls[idx]) {
                panelEls[idx].classList.add('bkbg-mm-panel-open');
                navLinkEls[idx].classList.add('bkbg-mm-active');
                openPanel = idx;
            }
        }

        // ── Build nav items ──
        items.forEach(function (item, idx) {
            var li = el('li', 'bkbg-mm-nav-item');
            nav.appendChild(li);

            var link = el('button', 'bkbg-mm-nav-link');
            link.textContent = item.label || '';
            li.appendChild(link);
            navLinkEls.push(link);

            if (!item.hasMega || !(item.columns || []).length) {
                link.addEventListener('click', function () {
                    if (item.url && item.url !== '#') window.location.href = item.url;
                });
                panelEls.push(null);

                // Mobile drawer simple link
                var dLink = el('a', 'bkbg-mm-drawer-link');
                dLink.href = item.url || '#';
                dLink.textContent = item.label;
                drawer.appendChild(dLink);
                return;
            }

            // Chevron
            var chev = el('span', 'bkbg-mm-chevron');
            chev.textContent = '▾';
            link.appendChild(chev);

            // ── Panel ──
            var panel = el('div', 'bkbg-mm-panel');
            panel.style.width        = panelWidth + 'px';
            panel.style.borderRadius = panelRadius + 'px';
            li.appendChild(panel);
            panelEls.push(panel);

            var panelInner = el('div', 'bkbg-mm-panel-inner');
            panel.appendChild(panelInner);

            // Columns
            var columnsDiv = el('div', 'bkbg-mm-columns');
            panelInner.appendChild(columnsDiv);

            (item.columns || []).forEach(function (col) {
                var colDiv = el('div', 'bkbg-mm-col');
                var heading = el('p', 'bkbg-mm-col-heading');
                heading.textContent = col.heading || '';
                colDiv.appendChild(heading);

                var linkList = el('ul', 'bkbg-mm-link-list');
                (col.links || []).forEach(function (lnk) {
                    var li2 = el('li', 'bkbg-mm-link-item');
                    var a   = el('a');
                    a.href = lnk.url || '#';

                    if (showIcons && (lnk.icon || lnk.iconType === 'dashicon' || lnk.iconType === 'image')) {
                        var icon = el('span', 'bkbg-mm-link-icon');
                        var _IP = window.bkbgIconPicker;
                        var _it = lnk.iconType || 'custom-char';
                        if (_IP && _it !== 'custom-char') {
                            var _in = _IP.buildFrontendIcon(_it, lnk.icon, lnk.iconDashicon, lnk.iconImageUrl, lnk.iconDashiconColor);
                            if (_in) icon.appendChild(_in); else icon.textContent = lnk.icon || '';
                        } else { icon.textContent = lnk.icon || ''; }
                        a.appendChild(icon);
                    }

                    var body = el('div', 'bkbg-mm-link-body');
                    var label = el('span', 'bkbg-mm-link-label');
                    label.textContent = lnk.label || '';
                    body.appendChild(label);

                    if (showDescs && lnk.desc) {
                        var desc = el('span', 'bkbg-mm-link-desc');
                        desc.textContent = lnk.desc;
                        body.appendChild(desc);
                    }
                    a.appendChild(body);
                    li2.appendChild(a);
                    linkList.appendChild(li2);
                });
                colDiv.appendChild(linkList);
                columnsDiv.appendChild(colDiv);
            });

            // Featured panel
            if (item.showFeatured) {
                var featDiv = el('div', 'bkbg-mm-featured');
                if (item.featuredImageUrl) {
                    var featImg = el('img', 'bkbg-mm-feat-img');
                    featImg.src = item.featuredImageUrl;
                    featImg.alt = item.featuredTitle || '';
                    featDiv.appendChild(featImg);
                } else {
                    var featPh = el('div', 'bkbg-mm-feat-placeholder');
                    featPh.textContent = '✨';
                    featDiv.appendChild(featPh);
                }
                var featBody = el('div', 'bkbg-mm-feat-body');
                if (item.featuredTitle) {
                    var ft = el('p', 'bkbg-mm-feat-title');
                    ft.textContent = item.featuredTitle;
                    featBody.appendChild(ft);
                }
                if (item.featuredDesc) {
                    var fd = el('p', 'bkbg-mm-feat-desc');
                    fd.textContent = item.featuredDesc;
                    featBody.appendChild(fd);
                }
                if (item.featuredCta && item.featuredCtaUrl) {
                    var fc = el('a', 'bkbg-mm-feat-cta');
                    fc.href = item.featuredCtaUrl;
                    fc.textContent = item.featuredCta;
                    featBody.appendChild(fc);
                }
                featDiv.appendChild(featBody);
                panelInner.appendChild(featDiv);
            }

            // Open triggers
            if (openOnHover) {
                li.addEventListener('mouseenter', function () { openPanelFor(idx); });
                li.addEventListener('mouseleave', function () { closeAll(); });
            }
            link.addEventListener('click', function (e) {
                e.stopPropagation();
                if (openPanel === idx) { closeAll(); } else { openPanelFor(idx); }
            });

            // Mobile drawer: show columns as flat links
            var dSection = el('div');
            var dLink2 = el('a', 'bkbg-mm-drawer-link');
            dLink2.href = item.url || '#';
            dLink2.textContent = item.label;
            dSection.appendChild(dLink2);
            (item.columns || []).forEach(function (col) {
                (col.links || []).forEach(function (lnk) {
                    var dSub = el('a', 'bkbg-mm-drawer-sub-link');
                    dSub.href = lnk.url || '#';
                    if (showIcons && (lnk.icon || lnk.iconType === 'dashicon' || lnk.iconType === 'image')) {
                        var _IP2 = window.bkbgIconPicker;
                        var _it2 = lnk.iconType || 'custom-char';
                        if (_IP2 && _it2 !== 'custom-char') {
                            var _in2 = _IP2.buildFrontendIcon(_it2, lnk.icon, lnk.iconDashicon, lnk.iconImageUrl, lnk.iconDashiconColor);
                            if (_in2) { var iconWrap = el('span'); iconWrap.appendChild(_in2); dSub.appendChild(iconWrap); dSub.appendChild(document.createTextNode('  ' + lnk.label)); }
                            else dSub.textContent = (lnk.icon || '') + '  ' + lnk.label;
                        } else dSub.textContent = (lnk.icon || '') + '  ' + lnk.label;
                    }
                    else dSub.textContent = lnk.label;
                    dSection.appendChild(dSub);
                });
            });
            drawer.appendChild(dSection);
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!bar.contains(e.target)) closeAll();
        });

        // Sticky scroll shadow
        if (sticky) {
            window.addEventListener('scroll', function () {
                bar.classList.toggle('bkbg-mm-scrolled', window.scrollY > 10);
            });
        }
    });
})();
