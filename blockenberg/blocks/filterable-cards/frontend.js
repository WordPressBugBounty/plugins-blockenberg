(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        if (typo.family) el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight) el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform) el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style) el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        ['size', 'lineHeight', 'letterSpacing', 'wordSpacing'].forEach(function (prop) {
            var unit = typo[prop + 'Unit'] || 'px';
            var d = typo[prop + 'Desktop'], t = typo[prop + 'Tablet'], m = typo[prop + 'Mobile'];
            var css = { size: 'font-size', lineHeight: 'line-height', letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing' }[prop];
            if (d !== undefined && d !== '') el.style.setProperty(prefix + css + '-d', d + unit);
            if (t !== undefined && t !== '') el.style.setProperty(prefix + css + '-t', t + unit);
            if (m !== undefined && m !== '') el.style.setProperty(prefix + css + '-m', m + unit);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-fc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                cards: [], columns: 3, layout: 'grid', filterStyle: 'buttons',
                allLabel: 'All', showImages: true, showDescriptions: true,
                showLabels: true, showLinks: true, animateFilter: true,
                imageRatio: '3:2', cardRadius: 10, gap: 24,
                paddingTop: 0, paddingBottom: 0, bgColor: '',
                cardBg: '#ffffff', cardBorder: '#e5e7eb',
                titleColor: '#111827', descColor: '#6b7280',
                labelBg: '#ede9fe', labelColor: '#6366f1', linkColor: '#6366f1',
                filterBtnBg: '#f3f4f6', filterBtnColor: '#374151',
                filterBtnActiveBg: '#6366f1', filterBtnActiveColor: '#ffffff',
                accentColor: '#6366f1'
            }, opts);

            var cards = o.cards || [];
            if (!cards.length) { appEl.style.display = 'none'; return; }

            function mk(tag, cls, style) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                return n;
            }

            var ratioMap = { '16:9': '56.25%', '4:3': '75%', '3:2': '66.66%', '1:1': '100%' };
            var imgPadding = ratioMap[o.imageRatio] || '66.66%';

            /* unique categories */
            var cats = [];
            cards.forEach(function (c) { if (c.category && cats.indexOf(c.category) < 0) cats.push(c.category); });

            /* Section */
            var section = mk('div', 'bkbg-fc-section bkbg-fcards-wrap', {
                background: o.bgColor || '',
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });
            typoCssVarsForEl(o.typoTitle, '--bkbg-fcards-tt-', section);
            typoCssVarsForEl(o.typoDesc, '--bkbg-fcards-td-', section);
            typoCssVarsForEl(o.typoFilter, '--bkbg-fcards-tf-', section);

            /* filter bar */
            var filterWrap = mk('div', 'bkbg-fc-filter bkbg-fc-filter--' + o.filterStyle);
            var activeFilter = o.allLabel;
            var cardEls = [];

            function applyFilter(cat) {
                activeFilter = cat;
                /* update button states */
                filterWrap.querySelectorAll('.bkbg-fc-btn').forEach(function (btn) {
                    var isActive = btn.dataset.cat === cat;
                    btn.style.background = isActive ? o.filterBtnActiveBg : o.filterBtnBg;
                    btn.style.color = isActive ? o.filterBtnActiveColor : o.filterBtnColor;
                    btn.classList.toggle('active', isActive);
                });

                cardEls.forEach(function (info) {
                    var visible = (cat === o.allLabel) || (info.card.category === cat);
                    if (o.animateFilter) {
                        if (visible) {
                            info.el.style.display = '';
                            requestAnimationFrame(function () { info.el.classList.remove('bkbg-fc-fading'); });
                        } else {
                            info.el.classList.add('bkbg-fc-fading');
                            setTimeout(function () {
                                if (activeFilter !== o.allLabel && info.card.category !== activeFilter) {
                                    info.el.style.display = 'none';
                                }
                            }, 380);
                        }
                    } else {
                        info.el.style.display = visible ? '' : 'none';
                    }
                });
            }

            if (o.filterStyle === 'dropdown') {
                var sel = document.createElement('select');
                sel.className = 'bkbg-fc-dropdown';
                Object.assign(sel.style, {
                    background: o.filterBtnBg, color: o.filterBtnColor,
                    border: '1px solid ' + o.cardBorder, borderRadius: '8px',
                    padding: '9px 36px 9px 14px', cursor: 'pointer'
                });
                var allOpt = document.createElement('option');
                allOpt.value = o.allLabel; allOpt.textContent = o.allLabel;
                sel.appendChild(allOpt);
                cats.forEach(function (cat) {
                    var opt = document.createElement('option');
                    opt.value = cat; opt.textContent = cat;
                    sel.appendChild(opt);
                });
                sel.addEventListener('change', function () { applyFilter(sel.value); });
                filterWrap.appendChild(sel);
            } else {
                var btnsWrap = mk('div', 'bkbg-fc-btns');
                var allCats = [o.allLabel].concat(cats);
                allCats.forEach(function (cat) {
                    var btn = mk('div', 'bkbg-fc-btn' + (cat === o.allLabel ? ' active' : ''), {
                        background: cat === o.allLabel ? o.filterBtnActiveBg : o.filterBtnBg,
                        color: cat === o.allLabel ? o.filterBtnActiveColor : o.filterBtnColor,
                        borderRadius: o.filterStyle === 'tabs' ? '6px 6px 0 0' : '999px'
                    });
                    btn.dataset.cat = cat;
                    btn.textContent = cat;
                    btn.addEventListener('click', function () { applyFilter(cat); });
                    btnsWrap.appendChild(btn);
                });
                filterWrap.appendChild(btnsWrap);
            }

            section.appendChild(filterWrap);

            /* Grid */
            var colCount = parseInt(o.columns, 10) || 3;
            var gridStyle = {
                display: 'grid',
                gap: o.gap + 'px'
            };
            gridStyle.gridTemplateColumns = o.layout === 'list' ? '1fr' : ('repeat(' + colCount + ', 1fr)');

            var grid = mk('div', 'bkbg-fc-grid bkbg-fc-' + o.layout, gridStyle);

            cards.forEach(function (card) {
                var wrap = mk('div', 'bkbg-fc-card-wrap', {
                    background: card.featured ? '' : o.cardBg,
                    border: '1px solid ' + (card.featured ? o.accentColor : o.cardBorder),
                    borderRadius: o.cardRadius + 'px',
                    position: 'relative',
                    overflow: 'hidden',
                    flexDirection: o.layout === 'list' ? 'row' : 'column'
                });

                if (card.featured) {
                    var ftime = mk('div', 'bkbg-fc-featured-bar', { background: o.accentColor });
                    wrap.style.background = o.cardBg;
                    wrap.appendChild(ftime);
                }

                /* image */
                if (o.showImages) {
                    var imgBox = mk('div', 'bkbg-fc-card-img', {
                        paddingTop: o.layout === 'list' ? '' : imgPadding,
                        width: o.layout === 'list' ? '200px' : '100%',
                        height: o.layout === 'list' ? 'auto' : undefined,
                        flexShrink: o.layout === 'list' ? '0' : undefined,
                        minHeight: o.layout === 'list' ? '140px' : undefined
                    });
                    if (card.imageUrl) {
                        var img = document.createElement('img');
                        img.src = card.imageUrl;
                        img.alt = card.imageAlt || card.title || '';
                        imgBox.appendChild(img);
                    } else {
                        var ph = mk('div', 'bkbg-fc-card-placeholder');
                        ph.textContent = 'No image';
                        imgBox.appendChild(ph);
                    }
                    wrap.appendChild(imgBox);
                }

                /* body */
                var body = mk('div', 'bkbg-fc-card-body');

                /* meta row: category + label */
                var meta = mk('div', 'bkbg-fc-meta');
                if (card.category) {
                    var catEl = mk('span', 'bkbg-fc-cat', { color: o.descColor });
                    catEl.textContent = card.category;
                    meta.appendChild(catEl);
                }
                if (o.showLabels && card.label) {
                    var labelEl = mk('span', 'bkbg-fc-label', { background: o.labelBg, color: o.labelColor });
                    labelEl.textContent = card.label;
                    meta.appendChild(labelEl);
                }
                body.appendChild(meta);

                /* title */
                var titleEl = mk('h3', 'bkbg-fc-card-title', { color: o.titleColor });
                titleEl.innerHTML = card.title || '';
                body.appendChild(titleEl);

                /* description */
                if (o.showDescriptions && card.description) {
                    var desc = mk('p', 'bkbg-fc-card-desc', { color: o.descColor });
                    desc.innerHTML = card.description;
                    body.appendChild(desc);
                }

                /* link */
                if (o.showLinks && card.link) {
                    var lnk = document.createElement('a');
                    lnk.className = 'bkbg-fc-card-link';
                    lnk.href = card.link;
                    lnk.style.color = o.linkColor;
                    lnk.textContent = (card.linkLabel || 'Learn More') + ' →';
                    body.appendChild(lnk);
                }

                wrap.appendChild(body);
                grid.appendChild(wrap);
                cardEls.push({ el: wrap, card: card });
            });

            section.appendChild(grid);
            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
