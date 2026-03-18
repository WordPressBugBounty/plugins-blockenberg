wp.domReady(function () {
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

    document.querySelectorAll('.bkbg-icon-list-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var bgColor      = opts.bgColor      || '#ffffff';
        var itemBg       = opts.itemBg       || '#f9fafb';
        var borderColor  = opts.borderColor  || '#e5e7eb';
        var headingColor = opts.headingColor || '#111827';
        var subtextColor = opts.subtextColor || '#6b7280';
        var titleColor   = opts.titleColor   || '#111827';
        var descColor    = opts.descColor    || '#6b7280';
        var iconColor    = opts.iconColor    || '#7c3aed';
        var badgeBg      = opts.badgeBg      || '#ede9fe';
        var badgeColor   = opts.badgeColor   || '#7c3aed';
        var dividerColor = opts.dividerColor || '#e5e7eb';
        var layout       = opts.layout       || 'list';
        var columns      = opts.columns      || 2;
        var itemStyle    = opts.itemStyle    || 'boxed';
        var showBadge    = opts.showBadge !== false;
        var showDesc     = opts.showDesc  !== false;
        var showDivider  = opts.showDivider === true;
        var gap          = opts.gap          !== undefined ? opts.gap : 16;
        var radius       = (opts.borderRadius !== undefined ? opts.borderRadius : 10) + 'px';
        var items        = Array.isArray(opts.items) ? opts.items : [];

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-il-wrap';
        wrap.style.background    = bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 64) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 64) + 'px';
        wrap.style.setProperty('--bkbg-il-heading-sz', (opts.headingSize || 32) + 'px');
        wrap.style.setProperty('--bkbg-il-title-sz', (opts.titleSize || 17) + 'px');
        wrap.style.setProperty('--bkbg-il-desc-sz', (opts.descSize || 14) + 'px');
        typoCssVarsForEl(opts.headingTypo, '--bkbg-il-hd-', wrap);
        typoCssVarsForEl(opts.titleTypo, '--bkbg-il-tt-', wrap);
        typoCssVarsForEl(opts.descTypo, '--bkbg-il-ds-', wrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-il-inner';
        inner.style.maxWidth = (opts.maxWidth || 900) + 'px';

        if (opts.showHeading && opts.heading) {
            var h = document.createElement('h2');
            h.className = 'bkbg-il-heading';
            h.style.color = headingColor;
            h.innerHTML = opts.heading;
            inner.appendChild(h);
        }

        if (opts.showSubtext && opts.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-il-subtext';
            sub.style.fontSize = '16px';
            sub.style.color = subtextColor;
            sub.innerHTML = opts.subtext;
            inner.appendChild(sub);
        }

        var list = document.createElement('div');
        list.className = layout === 'grid' ? 'bkbg-il-grid' : 'bkbg-il-list';
        list.style.gap = gap + 'px';
        if (layout === 'grid') {
            list.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
        }

        items.forEach(function (item, i) {
            var div = document.createElement('div');
            div.className = 'bkbg-il-item bkbg-il-item--' + itemStyle;
            div.style.gap = '14px';

            if (itemStyle === 'boxed') {
                div.style.padding     = '16px 20px';
                div.style.background  = itemBg;
                div.style.border      = '1px solid ' + borderColor;
                div.style.borderRadius = radius;
            } else if (itemStyle === 'bordered') {
                div.style.padding     = '16px 20px';
                div.style.border      = '1px solid ' + borderColor;
                div.style.borderRadius = radius;
            } else {
                div.style.padding = '8px 0';
                if (showDivider && layout !== 'grid' && i < items.length - 1) {
                    div.style.borderBottom = '1px solid ' + dividerColor;
                    div.style.paddingBottom = '16px';
                }
            }

            var iconEl = document.createElement('span');
            iconEl.className = 'bkbg-il-icon';
            iconEl.style.fontSize = (opts.iconSize || 28) + 'px';
            iconEl.style.color    = item.iconColor || iconColor;
            var _IP = window.bkbgIconPicker;
            var _iType = item.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
                if (_in) iconEl.appendChild(_in); else iconEl.textContent = item.icon || '•';
            } else { iconEl.textContent = item.icon || '•'; }
            div.appendChild(iconEl);

            var body = document.createElement('div');
            body.className = 'bkbg-il-body';

            var top = document.createElement('div');
            top.className = 'bkbg-il-top';

            var title = document.createElement('span');
            title.className = 'bkbg-il-title';
            title.style.color    = titleColor;
            title.innerHTML = item.title || '';
            top.appendChild(title);

            if (showBadge && item.badge) {
                var badge = document.createElement('span');
                badge.className = 'bkbg-il-badge';
                badge.style.background = badgeBg;
                badge.style.color      = badgeColor;
                badge.textContent = item.badge;
                top.appendChild(badge);
            }

            body.appendChild(top);

            if (showDesc && item.description) {
                var desc = document.createElement('p');
                desc.className = 'bkbg-il-desc';
                desc.style.color    = descColor;
                desc.innerHTML = item.description;
                body.appendChild(desc);
            }

            div.appendChild(body);
            list.appendChild(div);
        });

        inner.appendChild(list);
        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});
