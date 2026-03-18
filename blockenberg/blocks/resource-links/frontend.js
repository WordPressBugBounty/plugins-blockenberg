wp.domReady(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + _typoKeys[k], String(v));
            }
        });
    }

    document.querySelectorAll('.bkbg-resource-links-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var bgColor      = opts.bgColor      || '#ffffff';
        var cardBg       = opts.cardBg       || '#f9fafb';
        var cardBorder   = opts.cardBorder   || '#e5e7eb';
        var headingColor = opts.headingColor || '#111827';
        var subtextColor = opts.subtextColor || '#6b7280';
        var titleColor   = opts.titleColor   || '#111827';
        var descColor    = opts.descColor    || '#6b7280';
        var tagBg        = opts.tagBg        || '#ede9fe';
        var tagColor     = opts.tagColor     || '#7c3aed';
        var arrowColor   = opts.arrowColor   || '#9ca3af';
        var hoverBg      = opts.hoverBg      || '#f3f0ff';
        var radius       = (opts.borderRadius !== undefined ? opts.borderRadius : 10) + 'px';
        var layout       = opts.layout       || 'list';
        var columns      = opts.columns      || 2;
        var openNewTab   = opts.openNewTab !== false;
        var showArrow    = opts.showArrow !== false;
        var items        = Array.isArray(opts.items) ? opts.items : [];

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-resource-links-wrap';
        wrap.style.background = bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 64) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 64) + 'px';
        wrap.style.setProperty('--bkbg-rl-cols', columns);
        wrap.style.setProperty('--bkbg-rl-radius', radius);

        typoCssVarsForEl(opts.headingTypo, '--bkrl-ht-', wrap);
        typoCssVarsForEl(opts.titleTypo, '--bkrl-tt-', wrap);
        typoCssVarsForEl(opts.bodyTypo, '--bkrl-bt-', wrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-rl-inner';
        inner.style.maxWidth = (opts.maxWidth || 900) + 'px';

        if (opts.showHeading && opts.heading) {
            var h = document.createElement('h2');
            h.className = 'bkbg-rl-heading';
            h.style.color = headingColor;
            h.innerHTML = opts.heading;
            inner.appendChild(h);
        }

        if (opts.showSubtext && opts.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-rl-subtext';
            sub.style.fontSize = '16px';
            sub.style.color = subtextColor;
            sub.innerHTML = opts.subtext;
            inner.appendChild(sub);
        }

        var list = document.createElement('div');
        list.className = layout === 'grid' ? 'bkbg-rl-grid' : 'bkbg-rl-list';

        items.forEach(function (item) {
            var card = document.createElement('a');
            card.className = 'bkbg-rl-card';
            card.href = item.url || '#';
            if (openNewTab) {
                card.target = '_blank';
                card.rel = 'noopener noreferrer';
            }
            card.style.background = cardBg;
            card.style.borderColor = cardBorder;
            card.style.setProperty('--bkbg-rl-hover', hoverBg);

            card.addEventListener('mouseenter', function () { card.style.background = hoverBg; });
            card.addEventListener('mouseleave', function () { card.style.background = cardBg; });

            if (item.icon || item.iconDashicon || item.iconImageUrl) {
                var icon = document.createElement('span');
                icon.className = 'bkbg-rl-icon';
                icon.style.fontSize = (opts.iconSize || 28) + 'px';
                var _IP = window.bkbgIconPicker;
                var _iType = item.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor);
                    if (_in) icon.appendChild(_in); else icon.textContent = item.icon || '';
                } else { icon.textContent = item.icon || ''; }
                card.appendChild(icon);
            }

            var body = document.createElement('div');
            body.className = 'bkbg-rl-body';

            var top = document.createElement('div');
            top.className = 'bkbg-rl-top';

            var title = document.createElement('span');
            title.className = 'bkbg-rl-title';
            title.style.color = titleColor;
            title.innerHTML = item.title || '';
            top.appendChild(title);

            if (item.tag) {
                var tag = document.createElement('span');
                tag.className = 'bkbg-rl-tag';
                tag.style.background = tagBg;
                tag.style.color = tagColor;
                tag.textContent = item.tag;
                top.appendChild(tag);
            }

            body.appendChild(top);

            if (item.description) {
                var desc = document.createElement('p');
                desc.className = 'bkbg-rl-desc';
                desc.style.color = descColor;
                desc.innerHTML = item.description;
                body.appendChild(desc);
            }

            card.appendChild(body);

            if (showArrow) {
                var arrow = document.createElement('span');
                arrow.className = 'bkbg-rl-arrow';
                arrow.style.color = arrowColor;
                arrow.style.fontSize = '20px';
                arrow.textContent = '→';
                card.appendChild(arrow);
            }

            list.appendChild(card);
        });

        inner.appendChild(list);
        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});
