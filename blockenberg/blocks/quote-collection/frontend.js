(function () {
    var _typoKeys = {
        quoteTypo:  '--bkqcl-qt-',
        authorTypo: '--bkqcl-au-'
    };
    var _tvf; function _getTV() { return _tvf || (_tvf = window.bkbgTypoCssVars); }
    function typoCssVarsForEl(opts, el) {
        var fn = _getTV(); if (!fn) return;
        Object.keys(_typoKeys).forEach(function (k) {
            var vars = fn(opts[k] || {}, _typoKeys[k]);
            Object.keys(vars).forEach(function (p) { el.style.setProperty(p, vars[p]); });
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-qcl-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                sectionTitle: '', sectionSubtitle: '', showHeader: false,
                quotes: [{ text: '', author: '', role: '', source: '' }],
                layout: 'grid', columns: 2, quoteStyle: 'classic', showQuoteMark: true,
                bgColor: '#f8f9fa', cardBg: '#ffffff', cardBorder: '#e9ecef',
                accentColor: '#6366f1', quoteMarkColor: '#e0e7ff',
                quoteColor: '#111827', authorColor: '#374151', roleColor: '#9ca3af',
                titleColor: '#111827', subtitleColor: '#6b7280',
                gap: 20, cardRadius: 12, paddingTop: 0, paddingBottom: 0
            }, opts);

            function mk(tag, cls, style, text) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                if (text != null) n.textContent = text;
                return n;
            }

            /* outer */
            var section = mk('div', 'bkbg-qcl-section', {
                background: o.bgColor,
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px'
            });
            typoCssVarsForEl(o, section);

            /* header */
            if (o.showHeader && (o.sectionTitle || o.sectionSubtitle)) {
                var hdr = mk('div', 'bkbg-qcl-header');
                if (o.sectionTitle) {
                    var title = mk('h2', 'bkbg-qcl-title', { color: o.titleColor }, o.sectionTitle);
                    hdr.appendChild(title);
                }
                if (o.sectionSubtitle) {
                    var sub = mk('p', 'bkbg-qcl-subtitle', { color: o.subtitleColor }, o.sectionSubtitle);
                    hdr.appendChild(sub);
                }
                section.appendChild(hdr);
            }

            /* grid wrapper */
            var layoutClass = 'bkbg-qcl-' + (o.layout === 'masonry' ? 'masonry' : o.layout === 'list' ? 'list' : 'grid');
            var grid = mk('div', layoutClass + ' bkbg-qcl-style-' + o.quoteStyle);
            if (o.layout === 'grid') {
                grid.style.gridTemplateColumns = 'repeat(' + o.columns + ', 1fr)';
                grid.style.gap = o.gap + 'px';
            } else if (o.layout === 'list') {
                grid.style.gap = o.gap + 'px';
            } else if (o.layout === 'masonry') {
                grid.style.columnCount = o.columns;
                grid.style.columnGap = o.gap + 'px';
            }

            (o.quotes || []).forEach(function (q) {
                if (!q.text && !q.author) return;

                var card = mk('div', 'bkbg-qcl-card', {
                    background: o.cardBg,
                    borderRadius: o.cardRadius + 'px',
                    borderColor: o.cardBorder
                });
                if (o.layout === 'masonry') {
                    card.style.marginBottom = o.gap + 'px';
                }

                /* extra border styles */
                if (o.quoteStyle === 'highlight') {
                    card.style.borderLeftColor = o.accentColor;
                } else if (o.quoteStyle === 'card') {
                    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }

                /* quote mark */
                if (o.showQuoteMark) {
                    var qmark = mk('span', 'bkbg-qcl-qmark', { color: o.quoteMarkColor }, '"');
                    card.appendChild(qmark);
                }

                /* quote text */
                if (q.text) {
                    var textEl = mk('p', 'bkbg-qcl-text', { color: o.quoteColor }, '');
                    textEl.innerHTML = q.text;
                    card.appendChild(textEl);
                }

                /* attribution */
                if (q.author || q.role || q.source) {
                    var attrib = mk('div', 'bkbg-qcl-attribution');

                    var authorLine = mk('div', 'bkbg-qcl-author-line');
                    var dot = mk('span', 'bkbg-qcl-author-dot', { background: o.accentColor });
                    authorLine.appendChild(dot);

                    var authorWrap = mk('div', '');
                    if (q.author) {
                        authorWrap.appendChild(mk('p', 'bkbg-qcl-author', { color: o.authorColor }, q.author));
                    }
                    if (q.role) {
                        authorWrap.appendChild(mk('p', 'bkbg-qcl-role', { color: o.roleColor }, q.role));
                    }
                    if (q.source) {
                        var srcEl = mk('p', 'bkbg-qcl-source', { color: o.roleColor }, '');
                        srcEl.textContent = '— ' + q.source;
                        authorWrap.appendChild(srcEl);
                    }
                    authorLine.appendChild(authorWrap);
                    attrib.appendChild(authorLine);
                    card.appendChild(attrib);
                }

                grid.appendChild(card);
            });

            section.appendChild(grid);
            el.parentNode.insertBefore(section, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
