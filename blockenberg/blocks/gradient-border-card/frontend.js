(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function initGradientBorderCard(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e) { opts = {}; }

        var a = {
            title:       opts.title       || 'Feature Card',
            description: opts.description || '',
            badge:       opts.badge       || '',
            icon:        opts.icon        || '✦',
            showIcon:    opts.showIcon    !== false,
            showBadge:   opts.showBadge   || false,
            titleTag:    opts.titleTag    || 'h3',
            borderColors: opts.borderColors || ['#7c3aed','#ec4899','#06b6d4','#f59e0b'],
            borderWidth:  opts.borderWidth  || 2,
            borderRadius: opts.borderRadius || 20,
            animSpeed:    opts.animSpeed    || 4,
            animType:     opts.animType     || 'rotate',
            glowBlur:     opts.glowBlur     === undefined ? 14 : opts.glowBlur,
            glowOpacity:  opts.glowOpacity  === undefined ? 0.7 : opts.glowOpacity,
            cardBg:       opts.cardBg       || '#0f172a',
            textColor:    opts.textColor    || '#e2e8f0',
            titleColor:   opts.titleColor   || '#ffffff',
            iconColor:    opts.iconColor    || '#a78bfa',
            badgeBg:      opts.badgeBg      || '#7c3aed',
            badgeColor:   opts.badgeColor   || '#ffffff',
            paddingV:     opts.paddingV     || 32,
            paddingH:     opts.paddingH     || 28,
            fontSize:     opts.fontSize     || 16,
            titleSize:    opts.titleSize    || 22,
            iconSize:     opts.iconSize     || 36,
            maxWidth:     opts.maxWidth     || 420,
            hoverScale:   opts.hoverScale   !== false,
            pauseOnHover: opts.pauseOnHover || false,
            textAlign:    opts.textAlign    || 'left'
        };

        var colors = a.borderColors;
        var innerRadius = Math.max(0, a.borderRadius - a.borderWidth);

        /* --- wrapper --- */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-gbc-wrap' + (a.hoverScale ? ' bkbg-gbc-hover-scale' : '') + (a.pauseOnHover ? ' bkbg-gbc-pause-hover' : '');

        /* CSS variables on wrapper */
        var cs = wrap.style;
        var c0 = colors[0], c1 = colors[1]||c0, c2 = colors[2]||c0, c3 = colors[3]||c0;
        cs.setProperty('--bkbg-gbc-c1', c0);
        cs.setProperty('--bkbg-gbc-c2', c1);
        cs.setProperty('--bkbg-gbc-c3', c2);
        cs.setProperty('--bkbg-gbc-c4', c3);
        cs.setProperty('--bkbg-gbc-speed', a.animSpeed + 's');
        cs.setProperty('--bkbg-gbc-border-width', a.borderWidth + 'px');
        cs.setProperty('--bkbg-gbc-radius', a.borderRadius + 'px');
        cs.setProperty('--bkbg-gbc-inner-radius', innerRadius + 'px');
        cs.setProperty('--bkbg-gbc-glow-blur', a.glowBlur + 'px');
        cs.setProperty('--bkbg-gbc-glow-opacity', String(a.glowOpacity));
        cs.setProperty('--bkbg-gbc-card-bg', a.cardBg);
        cs.setProperty('--bkbg-gbc-text-color', a.textColor);
        cs.setProperty('--bkbg-gbc-title-color', a.titleColor);
        cs.setProperty('--bkbg-gbc-icon-color', a.iconColor);
        cs.setProperty('--bkbg-gbc-badge-bg', a.badgeBg);
        cs.setProperty('--bkbg-gbc-badge-color', a.badgeColor);
        cs.setProperty('--bkbg-gbc-pad-v', a.paddingV + 'px');
        cs.setProperty('--bkbg-gbc-pad-h', a.paddingH + 'px');
        cs.setProperty('--bkbg-gbc-font-size', a.fontSize + 'px');
        cs.setProperty('--bkbg-gbc-title-size', a.titleSize + 'px');
        cs.setProperty('--bkbg-gbc-icon-size', a.iconSize + 'px');
        cs.setProperty('--bkbg-gbc-text-align', a.textAlign);
        cs.setProperty('--bkbg-gbc-max-width', a.maxWidth + 'px');

        typoCssVarsForEl(opts.typoTitle, '--bkbg-gbc-tt-', wrap);
        typoCssVarsForEl(opts.typoBody,  '--bkbg-gbc-bd-', wrap);
        typoCssVarsForEl(opts.typoBadge, '--bkbg-gbc-bg-', wrap);

        /* For >4 colors: inject a custom keyframe / conic-gradient with all colors */
        if (colors.length > 4 || (a.animType === 'rotate' && colors.length >= 2)) {
            var conicStop = colors.concat([colors[0]]).join(', ');
            var styleId = 'bkbg-gbc-style-' + Math.random().toString(36).slice(2);
            var styleTag = document.createElement('style');
            styleTag.id = styleId;
            styleTag.textContent = [
                '.bkbg-gbc-outer.bkbg-gbc-rotate::before {',
                '  background: conic-gradient(' + conicStop + ') !important;',
                '}',
                '.bkbg-gbc-outer.bkbg-gbc-rotate::after {',
                '  background: conic-gradient(' + conicStop + ') !important;',
                '}'
            ].join('\n');
            document.head.appendChild(styleTag);
        }

        /* Outer */
        var outer = document.createElement('div');
        var animClass = {rotate:'bkbg-gbc-rotate', shift:'bkbg-gbc-shift', pulse:'bkbg-gbc-pulse', static:'bkbg-gbc-static'}[a.animType] || 'bkbg-gbc-rotate';
        outer.className = 'bkbg-gbc-outer ' + animClass;

        /* Inner */
        var inner = document.createElement('div');
        inner.className = 'bkbg-gbc-inner';

        /* Badge */
        if (a.showBadge && a.badge) {
            var badgeEl = document.createElement('div');
            badgeEl.className = 'bkbg-gbc-badge';
            badgeEl.textContent = a.badge;
            inner.appendChild(badgeEl);
        }

        /* Icon */
        if (a.showIcon && a.icon) {
            var iconEl = document.createElement('div');
            iconEl.className = 'bkbg-gbc-icon';
            var gbcIconType = opts.iconType || 'custom-char';
            if (gbcIconType !== 'custom-char' && window.bkbgIconPicker) {
                iconEl.appendChild(window.bkbgIconPicker.buildFrontendIcon(gbcIconType, a.icon, opts.iconDashicon, opts.iconImageUrl, opts.iconDashiconColor));
            } else {
                iconEl.textContent = a.icon;
            }
            inner.appendChild(iconEl);
        }

        /* Title */
        var titleEl = document.createElement(a.titleTag);
        titleEl.className = 'bkbg-gbc-title';
        titleEl.textContent = a.title;
        inner.appendChild(titleEl);

        /* Description */
        if (a.description) {
            var descEl = document.createElement('p');
            descEl.className = 'bkbg-gbc-desc';
            descEl.textContent = a.description;
            inner.appendChild(descEl);
        }

        outer.appendChild(inner);
        wrap.appendChild(outer);
        appEl.replaceWith(wrap);
    }

    document.querySelectorAll('.bkbg-gbc-app').forEach(initGradientBorderCard);
})();
