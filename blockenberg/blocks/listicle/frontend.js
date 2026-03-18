(function () {
    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
    };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(typo).forEach(function (k) {
            var v = typo[k]; if (v === '' || v == null) return;
            var css = _typoKeys[k]; if (!css) return;
            if ((k === 'letterSpacing' || k === 'wordSpacing') && typeof v === 'number') v = v + 'px';
            if ((/^(sizeDesktop|sizeTablet|sizeMobile)$/).test(k) && typeof v === 'number') v = v + 'px';
            el.style.setProperty(prefix + css, '' + v);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-lis-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                heading: '', showHeading: false,
                items: [], layout: 'list', numberStyle: 'badge',
                showNumbers: true, showImages: true, showRatings: false,
                showTags: true, showVerdicts: false, countDown: false,
                imageRatio: '16:9', imageRadius: 8, gap: 24, cardRadius: 12,
                paddingTop: 0, paddingBottom: 0,
                bgColor: '', cardBg: '#ffffff', cardBorder: '#e5e7eb',
                numberBg: '#6366f1', numberColor: '#ffffff',
                titleColor: '#111827', subtitleColor: '#6b7280', descColor: '#374151',
                tagBg: '#ede9fe', tagColor: '#6366f1',
                verdictBg: '#dcfce7', verdictColor: '#15803d',
                starColor: '#f59e0b', accentColor: '#6366f1'
            }, opts);

            var RATIO = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%', '3:4': '133.333%' };

            function mk(tag, cls, style, text) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                if (text != null) n.textContent = text;
                return n;
            }

            function numBadge(num) {
                if (o.numberStyle === 'badge') {
                    return mk('div', 'bkbg-lis-badge', { background: o.numberBg, color: o.numberColor }, num);
                } else if (o.numberStyle === 'circle') {
                    return mk('div', 'bkbg-lis-circle', { borderColor: o.numberBg, color: o.numberBg }, num);
                } else if (o.numberStyle === 'large') {
                    return mk('div', 'bkbg-lis-num-large', { color: o.numberBg }, num);
                } else {
                    return mk('div', 'bkbg-lis-num-minimal', { color: o.numberBg }, '#' + num);
                }
            }

            function stars(rating) {
                var wrap = mk('div', 'bkbg-lis-stars');
                for (var i = 1; i <= 5; i++) {
                    wrap.appendChild(mk('span', '', { color: i <= rating ? o.starColor : '#d1d5db' }, '★'));
                }
                return wrap;
            }

            var section = mk('div', 'bkbg-lis-section', {
                background: o.bgColor || undefined,
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });

            typoCssVarsForEl(section, o.headingTypo, '--bkbg-lis-h-');
            typoCssVarsForEl(section, o.titleTypo,   '--bkbg-lis-tt-');
            typoCssVarsForEl(section, o.descTypo,    '--bkbg-lis-d-');

            if (o.showHeading && o.heading) {
                section.appendChild(mk('h2', 'bkbg-lis-heading', { color: o.titleColor }, o.heading));
            }

            var layoutClass = 'bkbg-lis-' + (o.layout || 'list');
            var listWrap = mk('div', layoutClass, { gap: o.gap + 'px', gridTemplateColumns: o.layout === 'grid' ? 'repeat(2,1fr)' : undefined });

            (o.items || []).forEach(function (item, idx) {
                var cardinal = o.countDown ? (o.items.length - idx) : (idx + 1);
                var isOdd = idx % 2 === 1;

                var card = mk('div', 'bkbg-lis-card' + (o.layout === 'magazine' && isOdd ? ' bkbg-lis-odd' : ''), {
                    background: o.cardBg, borderColor: o.cardBorder, borderRadius: o.cardRadius + 'px'
                });

                /* image */
                if (o.showImages) {
                    var imgWrap = mk('div', 'bkbg-lis-img-wrap');
                    if (o.layout === 'list') { imgWrap.style.width = '220px'; }
                    else if (o.layout === 'magazine') { imgWrap.style.width = '44%'; }

                    var imgPad = mk('div', 'bkbg-lis-img-pad');
                    if (o.layout === 'grid') { imgPad.style.paddingBottom = RATIO[o.imageRatio] || '56.25%'; }
                    imgWrap.appendChild(imgPad);

                    if (item.imageUrl) {
                        var img = document.createElement('img');
                        img.src = item.imageUrl;
                        img.alt = item.imageAlt || '';
                        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
                        if (o.layout !== 'grid') { img.style.borderRadius = o.imageRadius + 'px'; }
                        imgPad.appendChild(img);
                    }

                    if (o.showNumbers && o.numberStyle !== 'large') {
                        var numOvl = mk('div', 'bkbg-lis-num-overlay');
                        numOvl.appendChild(numBadge(cardinal));
                        imgPad.appendChild(numOvl);
                    }
                    card.appendChild(imgWrap);
                }

                /* content */
                var content = mk('div', 'bkbg-lis-content');

                /* number inside content (no image or large style) */
                if (o.showNumbers && (!o.showImages || o.numberStyle === 'large')) {
                    var numEl = mk('div', 'bkbg-lis-num-inline');
                    numEl.appendChild(numBadge(cardinal));
                    content.appendChild(numEl);
                }

                /* meta row */
                if ((o.showTags && item.tag) || (o.showVerdicts && item.verdict)) {
                    var meta = mk('div', 'bkbg-lis-meta');
                    if (o.showTags && item.tag) {
                        meta.appendChild(mk('span', 'bkbg-lis-tag', { background: o.tagBg, color: o.tagColor }, item.tag));
                    }
                    if (o.showVerdicts && item.verdict) {
                        meta.appendChild(mk('span', 'bkbg-lis-verdict', { background: o.verdictBg, color: o.verdictColor }, item.verdict));
                    }
                    content.appendChild(meta);
                }

                /* title */
                var title = mk('h3', 'bkbg-lis-title', { color: o.titleColor }, '');
                title.innerHTML = item.title || '';
                content.appendChild(title);

                if (item.subtitle) {
                    content.appendChild(mk('p', 'bkbg-lis-subtitle', { color: o.subtitleColor }, item.subtitle));
                }

                if (o.showRatings) { content.appendChild(stars(item.rating || 5)); }

                if (item.description) {
                    var desc = mk('p', 'bkbg-lis-desc', { color: o.descColor }, '');
                    desc.innerHTML = item.description;
                    content.appendChild(desc);
                }

                card.appendChild(content);
                listWrap.appendChild(card);
            });

            section.appendChild(listWrap);
            el.parentNode.insertBefore(section, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
