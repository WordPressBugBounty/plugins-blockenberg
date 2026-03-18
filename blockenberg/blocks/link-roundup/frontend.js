(function () {
    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        var unitProps = { 'font-size-d':1,'font-size-t':1,'font-size-m':1,'letter-spacing':1,'word-spacing':1 };
        Object.keys(_typoKeys).forEach(function (k) {
            if (obj[k] == null || obj[k] === '') return;
            var css = _typoKeys[k];
            var v = obj[k];
            if (unitProps[css] && typeof v === 'number') v = v + 'px';
            el.style.setProperty(prefix + css, '' + v);
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function buildCard(lnk, o, styleKey) {
        var card = document.createElement('div');
        card.className = 'bkbg-lru-card bkbg-lru-' + styleKey + '-card';
        card.style.cssText = 'background:' + o.cardBg + ';border:1px solid ' + o.cardBorder + ';border-radius:' + o.cardRadius + 'px;';
        if (styleKey === 'magazine') {
            card.style.borderLeft = '4px solid ' + o.accentColor;
        }

        if (o.showEmoji && (lnk.emoji || lnk.emojiType === 'dashicon' || lnk.emojiType === 'image')) {
            var emojiEl = document.createElement('div');
            emojiEl.className = 'bkbg-lru-card-emoji';
            var _IP = window.bkbgIconPicker;
            var _et = lnk.emojiType || 'custom-char';
            if (_IP && _et !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_et, lnk.emoji, lnk.emojiDashicon, lnk.emojiImageUrl, lnk.emojiDashiconColor);
                if (_in) emojiEl.appendChild(_in); else emojiEl.textContent = lnk.emoji || '🔗';
            } else { emojiEl.textContent = lnk.emoji || '🔗'; }
            card.appendChild(emojiEl);
        }

        var body = document.createElement('div');
        body.className = 'bkbg-lru-card-body';

        var titleRow = document.createElement('div');
        titleRow.className = 'bkbg-lru-link-title-row';

        var link = document.createElement('a');
        link.className = 'bkbg-lru-link';
        link.href = lnk.url || '#';
        link.style.color = o.linkColor;
        link.innerHTML = lnk.title || '';
        if (o.openInNewTab) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        titleRow.appendChild(link);

        if (o.showCategory && lnk.category) {
            var catTag = document.createElement('span');
            catTag.className = 'bkbg-lru-cat-tag';
            catTag.style.cssText = 'background:' + o.catBg + ';color:' + o.catColor;
            catTag.textContent = lnk.category;
            titleRow.appendChild(catTag);
        }
        body.appendChild(titleRow);

        if (o.showSource && lnk.source) {
            var src = document.createElement('div');
            src.className = 'bkbg-lru-source';
            src.style.color = o.sourceColor;
            src.textContent = '↗ ' + lnk.source;
            body.appendChild(src);
        }

        if (o.showExcerpt && lnk.excerpt) {
            var exc = document.createElement('p');
            exc.className = 'bkbg-lru-excerpt';
            exc.style.color = o.excerptColor;
            exc.textContent = lnk.excerpt;
            body.appendChild(exc);
        }

        card.appendChild(body);
        return card;
    }

    function init() {
        document.querySelectorAll('.bkbg-lru-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                title: "This Week's Reads",
                subtitle: '',
                showSubtitle: true,
                publishDate: '',
                dateLabel: 'Week of',
                showDate: true,
                links: [],
                style: 'cards',
                groupByCategory: false,
                showEmoji: true,
                showSource: true,
                showExcerpt: true,
                showCategory: true,
                openInNewTab: true,
                bgColor: '#f8fafc',
                borderColor: '#e2e8f0',
                headingColor: '#0f172a',
                subtitleColor: '#64748b',
                dateColor: '#94a3b8',
                cardBg: '#ffffff',
                cardBorder: '#e2e8f0',
                linkColor: '#2563eb',
                sourceColor: '#94a3b8',
                excerptColor: '#475569',
                catBg: '#e0f2fe',
                catColor: '#0369a1',
                accentColor: '#2563eb',
                borderRadius: 12,
                cardRadius: 8,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-lru-wrap';
            wrap.style.cssText = [
                'background:' + o.bgColor,
                'border-radius:' + o.borderRadius + 'px',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px'
            ].join(';');

            typoCssVarsForEl(wrap, o.titleTypo, '--bkbg-lru-tt-');
            typoCssVarsForEl(wrap, o.subtitleTypo, '--bkbg-lru-st-');
            typoCssVarsForEl(wrap, o.itemTypo, '--bkbg-lru-it-');

            /* header */
            if (o.showDate && o.publishDate) {
                var dateEl = document.createElement('div');
                dateEl.className = 'bkbg-lru-date-label';
                dateEl.style.color = o.dateColor;
                dateEl.textContent = o.dateLabel + ' ' + o.publishDate;
                wrap.appendChild(dateEl);
            }

            if (o.title) {
                var h2 = document.createElement('h2');
                h2.className = 'bkbg-lru-title';
                h2.style.color = o.headingColor;
                h2.innerHTML = o.title;
                wrap.appendChild(h2);
            }

            if (o.showSubtitle && o.subtitle) {
                var sub = document.createElement('p');
                sub.className = 'bkbg-lru-subtitle';
                sub.style.color = o.subtitleColor;
                sub.innerHTML = o.subtitle;
                wrap.appendChild(sub);
            }

            var styleKey = o.style === 'magazine' ? 'magazine' : o.style === 'list' ? 'list' : 'card';
            var gridClass = 'bkbg-lru-grid bkbg-lru-' + o.style + '-style';

            if (o.groupByCategory && (o.links || []).length) {
                /* group links by category */
                var cats = {};
                var catOrder = [];
                (o.links || []).forEach(function (lnk) {
                    var cat = lnk.category || 'General';
                    if (!cats[cat]) { cats[cat] = []; catOrder.push(cat); }
                    cats[cat].push(lnk);
                });

                catOrder.forEach(function (cat) {
                    var catTitle = document.createElement('div');
                    catTitle.className = 'bkbg-lru-cat-group-title';
                    catTitle.style.color = o.linkColor;
                    catTitle.textContent = cat;
                    wrap.appendChild(catTitle);

                    var grid = document.createElement('div');
                    grid.className = gridClass;
                    cats[cat].forEach(function (lnk) {
                        grid.appendChild(buildCard(lnk, o, styleKey));
                    });
                    wrap.appendChild(grid);
                });
            } else {
                var grid = document.createElement('div');
                grid.className = gridClass;
                (o.links || []).forEach(function (lnk) {
                    grid.appendChild(buildCard(lnk, o, styleKey));
                });
                wrap.appendChild(grid);
            }

            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
