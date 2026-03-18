(function () {
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

    function init() {
        document.querySelectorAll('.bkbg-itr-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch(e) { opts = {}; }
            var o = Object.assign({
                rows: [], imagePosition: 'alternate', imageRatio: '4:3',
                imageRadius: 12, imageShadow: true, imageWidth: 45,
                gap: 80, verticalAlign: 'center',
                showFeatures: true, showBtns: true, showBadges: true,
                paddingTop: 0, paddingBottom: 0,
                bgColor: '', badgeBg: '#ede9fe', badgeColor: '#7c3aed',
                titleColor: '#111827', descColor: '#374151',
                featureColor: '#374151', featureDot: '#7c3aed',
                btnBg: '#7c3aed', btnColor: '#ffffff', accentColor: '#7c3aed'
            }, opts);

            var RATIO_PAD = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%', '3:4': '133.333%' };

            function mk(tag, cls, style, text) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                if (text != null) n.textContent = text;
                return n;
            }

            var section = mk('div', 'bkbg-itr-section', {
                background: o.bgColor || undefined,
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });
            typoCssVarsForEl(o.headingTypo, '--bkbg-itr-h-', section);
            typoCssVarsForEl(o.bodyTypo, '--bkbg-itr-bd-', section);

            var rowsWrap = mk('div', 'bkbg-itr-rows', { gap: o.gap + 'px' });

            (o.rows || []).forEach(function (row, idx) {
                var imgLeft = o.imagePosition === 'left' || (o.imagePosition === 'alternate' && idx % 2 === 0);
                var rowEl = mk('div', 'bkbg-itr-row' + (imgLeft ? '' : ' bkbg-itr-row-reverse'), {
                    alignItems: o.verticalAlign || 'center'
                });

                /* image */
                var imgCol = mk('div', 'bkbg-itr-img-col', {
                    flex: '0 0 ' + o.imageWidth + '%',
                    maxWidth: o.imageWidth + '%'
                });
                var imgWrap = mk('div', 'bkbg-itr-img-wrap', {
                    paddingBottom: RATIO_PAD[o.imageRatio] || '75%',
                    borderRadius: o.imageRadius + 'px',
                    boxShadow: o.imageShadow ? '0 8px 30px rgba(0,0,0,0.12)' : 'none'
                });
                if (row.imageUrl) {
                    var img = document.createElement('img');
                    img.src = row.imageUrl;
                    img.alt = row.imageAlt || '';
                    imgWrap.appendChild(img);
                }
                imgCol.appendChild(imgWrap);

                /* text */
                var textCol = mk('div', 'bkbg-itr-text-col');

                if (o.showBadges && row.badge) {
                    textCol.appendChild(mk('span', 'bkbg-itr-badge', { background: o.badgeBg, color: o.badgeColor }, row.badge));
                }

                var title = mk('h2', 'bkbg-itr-title', { color: o.titleColor }, '');
                title.innerHTML = row.title || '';
                textCol.appendChild(title);

                if (row.description) {
                    var desc = mk('p', 'bkbg-itr-desc', { color: o.descColor }, '');
                    desc.innerHTML = row.description;
                    textCol.appendChild(desc);
                }

                if (o.showFeatures && row.features && row.features.some(function (f) { return f && f.trim(); })) {
                    var ul = mk('ul', 'bkbg-itr-features');
                    row.features.forEach(function (f) {
                        if (!f || !f.trim()) return;
                        var li = mk('li', 'bkbg-itr-feature', { color: o.featureColor });
                        li.appendChild(mk('span', 'bkbg-itr-dot', { background: o.featureDot }));
                        li.appendChild(mk('span', '', {}, f));
                        ul.appendChild(li);
                    });
                    textCol.appendChild(ul);
                }

                if (o.showBtns && row.btnLabel) {
                    var btn = mk('a', 'bkbg-itr-btn', { background: o.btnBg, color: o.btnColor }, row.btnLabel);
                    if (row.btnUrl) { btn.href = row.btnUrl; }
                    textCol.appendChild(btn);
                }

                if (imgLeft) {
                    rowEl.appendChild(imgCol);
                    rowEl.appendChild(textCol);
                } else {
                    rowEl.appendChild(textCol);
                    rowEl.appendChild(imgCol);
                }
                rowsWrap.appendChild(rowEl);
            });

            section.appendChild(rowsWrap);
            el.parentNode.insertBefore(section, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
