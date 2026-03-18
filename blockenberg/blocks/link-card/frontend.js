(function () {
    var _typoKeys = { family: 'font-family', weight: 'font-weight', style: 'font-style', decoration: 'text-decoration', transform: 'text-transform', sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m', lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m', letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing' };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = typo[k];
            if (v === undefined || v === '' || v === null) return;
            var needsUnit = /size|height|spacing/i.test(k);
            var val = needsUnit && typeof v === 'number' ? v + 'px' : '' + v;
            el.style.setProperty(prefix + _typoKeys[k], val);
        });
    }

    document.querySelectorAll('.bkbg-lkc-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var cards = opts.cards || [];
        var columns = opts.columns || 2;
        var gap = opts.gap !== undefined ? opts.gap : 20;
        var cardStyle = opts.cardStyle || 'bordered';
        var showArrow = opts.showArrow !== false;
        var showIcon = opts.showIcon !== false;
        var hoverEffect = opts.hoverEffect || 'lift';
        var iconSize = opts.iconSize || 32;
        var cardRadius = opts.cardRadius !== undefined ? opts.cardRadius : 12;
        var cardPadding = opts.cardPadding !== undefined ? opts.cardPadding : 24;
        var bgColor = opts.bgColor || '#ffffff';
        var cardBg = opts.cardBg || '#ffffff';
        var accentColor = opts.accentColor || '#7c3aed';
        var titleColor = opts.titleColor || '#111827';
        var titleSize = opts.titleSize || 17;
        var descColor = opts.descColor || '#6b7280';
        var descSize = opts.descSize || 14;
        var borderColor = opts.borderColor || '#e5e7eb';
        var arrowColor = opts.arrowColor || '#7c3aed';
        var maxWidth = opts.maxWidth || 1000;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 48;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 48;

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-lkc-wrap';
        wrap.style.cssText = 'background:' + bgColor + ';padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';
        typoCssVarsForEl(wrap, opts.titleTypo, '--bkbg-lkc-tt-');
        typoCssVarsForEl(wrap, opts.descTypo, '--bkbg-lkc-d-');

        var grid = document.createElement('div');
        grid.className = 'bkbg-lkc-grid';
        grid.dataset.cols = columns;
        grid.style.cssText = [
            'max-width:' + maxWidth + 'px',
            'grid-template-columns:repeat(' + columns + ',1fr)',
            'gap:' + gap + 'px'
        ].join(';');

        cards.forEach(function (card) {
            var a = document.createElement('a');
            a.className = [
                'bkbg-lkc-card',
                'bkbg-lkc-card--' + cardStyle,
                'bkbg-lkc-card--hover-' + hoverEffect,
                hoverEffect === 'slide' ? 'bkbg-lkc-card--slide' : ''
            ].join(' ').trim();
            a.href = card.url || '#';
            if (card.isExternal) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            a.style.cssText = [
                'border-radius:' + cardRadius + 'px',
                'padding:' + cardPadding + 'px',
                'color:' + titleColor,
                '--lkc-accent:' + accentColor,
                cardStyle === 'bordered' ? 'background:' + cardBg + ';border-color:' + borderColor : '',
                cardStyle === 'filled' ? 'background:' + cardBg : ''
            ].filter(Boolean).join(';');

            /* head row */
            var head = document.createElement('div');
            head.className = 'bkbg-lkc-card-head';

            if (showIcon && card.icon) {
                var ico = document.createElement('span');
                ico.className = 'bkbg-lkc-icon';
                ico.style.fontSize = iconSize + 'px';
                var _IP = window.bkbgIconPicker;
                var _iType = card.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, card.icon, card.iconDashicon, card.iconImageUrl, card.iconDashiconColor);
                    if (_in) ico.appendChild(_in); else ico.textContent = card.icon;
                } else { ico.textContent = card.icon; }
                head.appendChild(ico);
            }

            var title = document.createElement('p');
            title.className = 'bkbg-lkc-title';
            title.style.cssText = 'color:' + titleColor;
            title.textContent = card.title || '';
            head.appendChild(title);

            a.appendChild(head);

            /* description */
            var desc = document.createElement('p');
            desc.className = 'bkbg-lkc-desc';
            desc.style.cssText = 'color:' + descColor;
            desc.textContent = card.description || '';
            a.appendChild(desc);

            /* arrow */
            if (showArrow) {
                var arr = document.createElement('span');
                arr.className = 'bkbg-lkc-arrow';
                arr.style.color = arrowColor;
                arr.textContent = '→';
                a.appendChild(arr);
            }

            grid.appendChild(a);
        });

        wrap.appendChild(grid);
        app.replaceWith(wrap);
    });
})();
