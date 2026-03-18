(function () {
    'use strict';

    var BULLET_SYMBOLS = {
        check:   '✓',
        check2:  '✔',
        arrow:   '→',
        circle:  '●',
        star:    '★',
        diamond: '◆',
        dash:    '—',
    };

    function getBullet(opts) {
        if (opts.bulletStyle === 'custom') return opts.customBullet || '→';
        return BULLET_SYMBOLS[opts.bulletStyle] || '✓';
    }

    var typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        var u = typo.sizeUnit || 'px';
        typoKeys.forEach(function (pair) {
            var v = typo[pair[0]];
            if (v === undefined || v === '' || v === null) return;
            var css = (typeof v === 'number' && pair[0].indexOf('size') !== -1) ? v + u
                    : (typeof v === 'number') ? String(v) : v;
            el.style.setProperty(prefix + pair[1], css);
        });
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var accent    = opts.accentColor  || '#6c3fb5';
        var cardBg    = opts.cardBg       || '#f5f3ff';
        var borderClr = opts.borderColor  || accent;
        var headClr   = opts.headingColor || '#1e1b4b';
        var itemClr   = opts.itemColor    || '#374151';
        var bulletClr = opts.bulletColor  || accent;
        var iconBg    = opts.iconBg       || accent;
        var iconClr   = opts.iconColor    || '#ffffff';
        var bdrPos    = opts.borderPosition || 'left';
        var bdrW      = (opts.borderWidth   !== undefined ? opts.borderWidth : 4) + 'px';
        var cRadius   = (opts.cardRadius    !== undefined ? opts.cardRadius : 12) + 'px';
        var pV        = (opts.paddingV      !== undefined ? opts.paddingV : 28) + 'px';
        var pH        = (opts.paddingH      !== undefined ? opts.paddingH : 28) + 'px';
        var headSz    = (opts.headingSize   !== undefined ? opts.headingSize : 18) + 'px';
        var itemSz    = (opts.itemSize      !== undefined ? opts.itemSize : 16) + 'px';
        var gap       = (opts.itemGap       !== undefined ? opts.itemGap : 14) + 'px';
        var maxW      = (opts.maxWidth      || 760) + 'px';
        var bullet    = getBullet(opts);
        var items     = opts.items || [];

        typoCssVarsForEl(app, opts.headingTypo, '--bkbg-kt-h-');
        typoCssVarsForEl(app, opts.itemTypo, '--bkbg-kt-it-');

        /* Card */
        var card = document.createElement('div');
        card.className = 'bkbg-kt-card';

        var borderStyle = '';
        if (bdrPos === 'left')  borderStyle = 'border-left:' + bdrW + ' solid ' + borderClr;
        if (bdrPos === 'top')   borderStyle = 'border-top:' + bdrW + ' solid ' + borderClr;
        if (bdrPos === 'all')   borderStyle = 'border:' + bdrW + ' solid ' + borderClr;

        card.style.cssText = [
            'background:' + cardBg,
            'border-radius:' + cRadius,
            'padding:' + pV + ' ' + pH,
            'max-width:' + maxW,
            'margin:0 auto',
            'box-sizing:border-box',
            borderStyle,
        ].filter(Boolean).join(';');

        app.innerHTML = '';
        app.appendChild(card);

        /* Heading row */
        if (opts.showHeading !== false && (opts.heading || opts.heading === undefined)) {
            var headRow = document.createElement('div');
            headRow.className = 'bkbg-kt-heading-row';
            headRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:' + (opts.showDivider !== false ? '16px' : '20px');

            if (opts.showHeadingIcon !== false && opts.headingIcon) {
                var icon = document.createElement('span');
                icon.className = 'bkbg-kt-icon';
                icon.style.cssText = 'background:' + iconBg + ';color:' + iconClr;
                var _IP = window.bkbgIconPicker;
                if (_IP && opts.headingIconType && opts.headingIconType !== 'custom-char') {
                    var _iconNode = _IP.buildFrontendIcon(opts.headingIconType, opts.headingIcon, opts.headingIconDashicon, opts.headingIconImageUrl, opts.headingIconDashiconColor);
                    if (_iconNode) icon.appendChild(_iconNode);
                    else icon.textContent = opts.headingIcon || '✦';
                } else {
                    icon.textContent = opts.headingIcon || '✦';
                }
                headRow.appendChild(icon);
            }

            var headText = document.createElement('span');
            headText.className = 'bkbg-kt-heading';
            headText.style.cssText = 'color:' + headClr;
            headText.textContent = opts.heading || 'Key Takeaways';
            headRow.appendChild(headText);
            card.appendChild(headRow);

            /* Divider */
            if (opts.showDivider !== false) {
                var hr = document.createElement('hr');
                hr.className = 'bkbg-kt-divider';
                hr.style.cssText = 'border-top-color:' + borderClr + ';margin-bottom:18px';
                card.appendChild(hr);
            }
        }

        /* Items */
        var ul = document.createElement('ul');
        ul.className = 'bkbg-kt-list';
        ul.style.gap = gap;
        card.appendChild(ul);

        items.forEach(function (item) {
            if (!item && item !== 0) return;
            var li = document.createElement('li');
            li.className = 'bkbg-kt-item';

            var blt = document.createElement('span');
            blt.className = 'bkbg-kt-bullet';
            blt.textContent = bullet;
            blt.style.cssText = 'color:' + bulletClr;

            var txt = document.createElement('span');
            txt.className = 'bkbg-kt-text';
            txt.textContent = item;
            txt.style.cssText = 'color:' + itemClr;

            li.appendChild(blt);
            li.appendChild(txt);
            ul.appendChild(li);
        });
    }

    document.querySelectorAll('.bkbg-kt-app').forEach(buildApp);
})();
