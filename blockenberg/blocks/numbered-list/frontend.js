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

    function badgeShapeRadius(shape) {
        if (shape === 'circle')  return '50%';
        if (shape === 'square')  return '4px';
        return '10px';
    }

    function init() {
        document.querySelectorAll('.bkbg-nl-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                heading: 'Why Choose Us', showHeading: true, subtext: '', showSubtext: false,
                items: [], layout: 'list', badgeType: 'number', badgeShape: 'circle',
                badgeSize: 44, badgeFontSize: 18, showConnector: true, connectorStyle: 'dashed',
                showImage: false, imageSize: 180, imageRadius: 12, imagePosition: 'right',
                columns: 1, gap: 40, headingSize: 20, fontSize: 15, borderRadius: 0,
                paddingTop: 0, paddingBottom: 0, align: 'left',
                bgColor: '', badgeBg: '#6366f1', badgeColor: '#ffffff',
                headingColor: '#111827', textColor: '#4b5563', connectorColor: '#d1d5db',
                sectionHeadingColor: '#111827', subtextColor: '#6b7280',
                sectionHeadingTypo: {}, itemHeadingTypo: {}, bodyTypo: {}, subtextTypo: {}
            }, opts);

            var section = document.createElement('div');
            section.className = 'bkbg-nl-wrap';
            section.style.cssText = [
                o.bgColor ? 'background:' + o.bgColor : '',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px',
                'text-align:' + o.align
            ].filter(Boolean).join(';');

            /* Typography CSS vars */
            typoCssVarsForEl(section, o.sectionHeadingTypo, '--bkbg-nl-sh-');
            typoCssVarsForEl(section, o.itemHeadingTypo, '--bkbg-nl-ih-');
            typoCssVarsForEl(section, o.bodyTypo, '--bkbg-nl-bd-');
            typoCssVarsForEl(section, o.subtextTypo, '--bkbg-nl-st-');

            if (o.showHeading && o.heading) {
                var h = document.createElement('h2');
                h.className = 'bkbg-nl-heading';
                h.innerHTML = o.heading;
                h.style.color = o.sectionHeadingColor;
                section.appendChild(h);
            }
            if (o.showSubtext && o.subtext) {
                var sub = document.createElement('p');
                sub.className = 'bkbg-nl-subtext';
                sub.innerHTML = o.subtext;
                sub.style.color = o.subtextColor;
                section.appendChild(sub);
            }

            var isGrid = o.layout === 'grid';
            var container = document.createElement('div');
            container.className = isGrid ? 'bkbg-nl-grid' : 'bkbg-nl-list';
            container.style.gap = o.gap + 'px';
            if (isGrid) {
                container.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';
            }

            var bRadius = badgeShapeRadius(o.badgeShape);

            (o.items || []).forEach(function (it, idx) {
                var itemWrap = o.layout !== 'list' || !it.link ? document.createElement('div') : document.createElement('div');
                itemWrap.className = 'bkbg-nl-item' + (o.showImage ? ' img-' + o.imagePosition : '');

                var inner = document.createElement('div');
                inner.className = 'bkbg-nl-inner' + (o.align === 'center' ? ' align-center' : '');

                /* Image – above */
                if (o.showImage && it.imageUrl && o.imagePosition === 'above') {
                    var img = makeImg(it, o);
                    inner.appendChild(img);
                }

                /* Badge */
                var badgeBg = it.accentColor || o.badgeBg;
                var badgeLabel = o.badgeType === 'number' ? String(idx + 1)
                    : o.badgeType === 'icon' ? (it.icon || '★')
                    : o.badgeType === 'custom' ? (it.customBadge || String(idx + 1))
                    : null;

                if (badgeLabel !== null) {
                    var badge = document.createElement('div');
                    badge.className = 'bkbg-nl-badge';
                    if (o.badgeType === 'icon') {
                        var _IP = window.bkbgIconPicker;
                        var _iType = it.iconType || 'custom-char';
                        if (_IP && _iType !== 'custom-char') {
                            var _in = _IP.buildFrontendIcon(_iType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor);
                            if (_in) badge.appendChild(_in); else badge.textContent = it.icon || '★';
                        } else { badge.textContent = it.icon || '★'; }
                    } else { badge.textContent = badgeLabel; }
                    badge.style.cssText = 'background:' + badgeBg + ';color:' + o.badgeColor + ';width:' + o.badgeSize + 'px;height:' + o.badgeSize + 'px;border-radius:' + bRadius + ';font-size:' + o.badgeFontSize + 'px';
                    inner.appendChild(badge);
                }

                /* Content body */
                var body = document.createElement('div');
                body.className = 'bkbg-nl-body';

                var ht = document.createElement('h4');
                ht.className = 'bkbg-nl-item-heading';
                ht.innerHTML = it.heading;
                ht.style.color = o.headingColor;
                body.appendChild(ht);

                if (it.content) {
                    var p = document.createElement('p');
                    p.className = 'bkbg-nl-item-text';
                    p.innerHTML = it.content;
                    p.style.color = o.textColor;
                    body.appendChild(p);
                }

                /* Image left/right */
                if (o.showImage && it.imageUrl && o.imagePosition === 'left') {
                    inner.appendChild(makeImg(it, o));
                }

                inner.appendChild(body);

                if (o.showImage && it.imageUrl && o.imagePosition === 'right') {
                    inner.appendChild(makeImg(it, o));
                }

                /* Connector */
                if (o.showConnector && o.layout === 'list' && badgeLabel && idx < (o.items || []).length - 1) {
                    var conn = document.createElement('div');
                    conn.className = 'bkbg-nl-connector';
                    conn.style.cssText = 'left:' + (o.badgeSize / 2 - 1) + 'px;top:' + (o.badgeSize + 6) + 'px;bottom:-' + (o.gap - 4) + 'px;border-left:2px ' + o.connectorStyle + ' ' + o.connectorColor;
                    itemWrap.appendChild(conn);
                }

                var content = itemWrap;
                if (it.link) {
                    var a = document.createElement('a');
                    a.href = it.link;
                    a.className = 'bkbg-nl-link';
                    a.appendChild(inner);
                    itemWrap.appendChild(a);
                } else {
                    itemWrap.appendChild(inner);
                }

                container.appendChild(itemWrap);
            });

            section.appendChild(container);
            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    function makeImg(it, o) {
        var img = document.createElement('img');
        img.className = 'bkbg-nl-img';
        img.src = it.imageUrl;
        img.alt = it.imageAlt || '';
        img.style.cssText = 'width:' + o.imageSize + 'px;border-radius:' + o.imageRadius + 'px;object-fit:cover';
        return img;
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
