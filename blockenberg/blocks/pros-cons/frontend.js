(function () {
    'use strict';

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

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var heading    = opts.heading      || '';
        var showHd     = opts.showHeading  !== false;
        var layout     = opts.layout       || 'two-col';
        var headClr    = opts.headingColor || '#1e1b4b';
        var headSz     = (opts.headingSize || 22) + 'px';
        var colHeadSz  = (opts.colHeadSize || 16) + 'px';
        var itemSz     = (opts.itemSize    || 15) + 'px';
        var itemGap    = (opts.itemGap     || 12) + 'px';
        var colRadius  = (opts.colRadius   || 12) + 'px';
        var colGap     = (opts.columnGap   || 16) + 'px';
        var pV         = (opts.paddingV    || 0)  + 'px';
        var pH         = (opts.paddingH    || 0)  + 'px';
        var maxW       = (opts.maxWidth    || 860) + 'px';
        var showIcons  = opts.showIcons    !== false;
        var cardBg     = opts.cardBg       || '';
        var pros       = opts.pros         || [];
        var cons       = opts.cons         || [];

        /* Columns data */
        var cols = [
            {
                heading:   opts.prosHeading     || 'Pros',
                headBg:    opts.prosHeadBg      || '#dcfce7',
                headColor: opts.prosHeadColor   || '#15803d',
                colBg:     opts.prosBg          || '#f0fdf4',
                border:    opts.prosBorder      || '#bbf7d0',
                bulletClr: opts.prosBulletColor || '#16a34a',
                itemColor: opts.prosItemColor   || '#166534',
                icon:      opts.prosIcon        || '✓',
                iconType:  opts.prosIconType    || 'custom-char',
                iconDash:  opts.prosIconDashicon,
                iconImg:   opts.prosIconImageUrl,
                iconDashColor: opts.prosIconDashiconColor,
                items:     pros,
            },
            {
                heading:   opts.consHeading     || 'Cons',
                headBg:    opts.consHeadBg      || '#fee2e2',
                headColor: opts.consHeadColor   || '#b91c1c',
                colBg:     opts.consBg          || '#fef2f2',
                border:    opts.consBorder      || '#fecaca',
                bulletClr: opts.consBulletColor || '#dc2626',
                itemColor: opts.consItemColor   || '#991b1b',
                icon:      opts.consIcon        || '✗',
                iconType:  opts.consIconType    || 'custom-char',
                iconDash:  opts.consIconDashicon,
                iconImg:   opts.consIconImageUrl,
                iconDashColor: opts.consIconDashiconColor,
                items:     cons,
            },
        ];

        /* Wrap */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-pc-wrap';
        wrap.style.cssText = [
            'max-width:' + maxW,
            'margin:0 auto',
            'padding:' + pV + ' ' + pH,
            cardBg ? 'background:' + cardBg : '',
            'box-sizing:border-box',
        ].filter(Boolean).join(';');
        app.innerHTML = '';
        app.appendChild(wrap);

        typoCssVarsForEl(wrap, opts.headingTypo, '--bkpc-h-');
        typoCssVarsForEl(wrap, opts.colHeadTypo, '--bkpc-ch-');
        typoCssVarsForEl(wrap, opts.itemTypo, '--bkpc-it-');

        /* Heading */
        if (showHd && heading) {
            var h3 = document.createElement('h3');
            h3.className = 'bkbg-pc-heading';
            h3.textContent = heading;
            h3.style.color = headClr;
            wrap.appendChild(h3);
        }

        /* Columns container */
        var colsDiv = document.createElement('div');
        colsDiv.className = 'bkbg-pc-columns' + (layout === 'stacked' ? ' stacked' : '');
        colsDiv.style.gap = colGap;
        wrap.appendChild(colsDiv);

        cols.forEach(function (col) {
            var colEl = document.createElement('div');
            colEl.className = 'bkbg-pc-col';
            colEl.style.cssText = [
                'background:' + col.colBg,
                'border:1.5px solid ' + col.border,
                'border-radius:' + colRadius,
            ].join(';');
            colsDiv.appendChild(colEl);

            /* Header */
            var head = document.createElement('div');
            head.className = 'bkbg-pc-col-head';
            head.style.cssText = [
                'background:' + col.headBg,
                'color:' + col.headColor,
            ].join(';');

            if (showIcons) {
                var iconEl = document.createElement('span');
                iconEl.className = 'bkbg-pc-col-icon';
                var _IP = window.bkbgIconPicker;
                if (_IP && col.iconType && col.iconType !== 'custom-char') {
                    var _icn = _IP.buildFrontendIcon(col.iconType, col.icon, col.iconDash, col.iconImg, col.iconDashColor);
                    if (_icn) iconEl.appendChild(_icn);
                    else iconEl.textContent = col.icon;
                } else {
                    iconEl.textContent = col.icon;
                }
                head.appendChild(iconEl);
            }

            var headText = document.createElement('span');
            headText.textContent = col.heading;
            head.appendChild(headText);
            colEl.appendChild(head);

            /* Items */
            var ul = document.createElement('ul');
            ul.className = 'bkbg-pc-col-body';
            ul.style.gap = itemGap;
            colEl.appendChild(ul);

            col.items.forEach(function (item) {
                if (!item && item !== 0) return;
                var li = document.createElement('li');
                li.className = 'bkbg-pc-item';

                if (showIcons) {
                    var blt = document.createElement('span');
                    blt.className = 'bkbg-pc-item-icon';
                    var _IP2 = window.bkbgIconPicker;
                    if (_IP2 && col.iconType && col.iconType !== 'custom-char') {
                        var _bIn = _IP2.buildFrontendIcon(col.iconType, col.icon, col.iconDash, col.iconImg, col.iconDashColor);
                        if (_bIn) blt.appendChild(_bIn);
                        else blt.textContent = col.icon;
                    } else {
                        blt.textContent = col.icon;
                    }
                    blt.style.color = col.bulletClr;
                    li.appendChild(blt);
                }

                var txt = document.createElement('span');
                txt.className = 'bkbg-pc-item-text';
                txt.textContent = item;
                txt.style.color = col.itemColor;
                li.appendChild(txt);
                ul.appendChild(li);
            });
        });
    }

    document.querySelectorAll('.bkbg-pc-app').forEach(buildApp);
})();
