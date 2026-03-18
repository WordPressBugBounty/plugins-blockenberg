(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', transform: 'text-transform',
            style: 'font-style', decoration: 'text-decoration',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m', sizeUnit: 'font-size-unit',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m', lineHeightUnit: 'line-height-unit',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m', letterSpacingUnit: 'letter-spacing-unit',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m', wordSpacingUnit: 'word-spacing-unit'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (typeof v === 'number') {
                    var css = map[k];
                    var unit = '';
                    if (css.indexOf('font-size') === 0 && css !== 'font-size-unit') unit = typo.sizeUnit || 'px';
                    else if (css.indexOf('line-height') === 0 && css !== 'line-height-unit') unit = typo.lineHeightUnit || '';
                    else if (css.indexOf('letter-spacing') === 0 && css !== 'letter-spacing-unit') unit = typo.letterSpacingUnit || 'px';
                    else if (css.indexOf('word-spacing') === 0 && css !== 'word-spacing-unit') unit = typo.wordSpacingUnit || 'px';
                    v = v + unit;
                }
                el.style.setProperty(prefix + map[k], v);
            }
        });
    }

    function esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function init() {
        document.querySelectorAll('.bkbg-evr-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eventName: 'Event Name 2026',
                eventDate: '',
                eventLocation: '',
                showMeta: true,
                summary: '',
                showSummary: true,
                stats: [],
                showStats: true,
                highlights: [],
                showHighlights: true,
                highlightsLabel: 'Key Highlights',
                nextEventInfo: '',
                showNextEvent: true,
                bgColor: '#f8fafc',
                borderColor: '#e2e8f0',
                accentColor: '#7c3aed',
                headerBg: '#7c3aed',
                titleColor: '#ffffff',
                metaColor: '#ddd6fe',
                summaryColor: '#374151',
                statsBg: '#7c3aed',
                statNumColor: '#ffffff',
                statLabelColor: '#ddd6fe',
                highlightColor: '#374151',
                highlightBg: '#ffffff',
                highlightBorder: '#e2e8f0',
                nextBg: '#ede9fe',
                nextTextColor: '#5b21b6',
                borderRadius: 12,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-evr-wrap';
            wrap.style.cssText = [
                'background:' + o.bgColor,
                'border-radius:' + o.borderRadius + 'px',
                'overflow:hidden',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px'
            ].join(';');

            typoCssVarsForEl(o.typoTitle, '--bkbg-evr-ttl-', wrap);
            typoCssVarsForEl(o.typoSummary, '--bkbg-evr-sm-', wrap);

            /* HEADER */
            var header = document.createElement('div');
            header.className = 'bkbg-evr-header';
            header.style.background = o.headerBg;

            if (o.eventName) {
                var h2 = document.createElement('h2');
                h2.className = 'bkbg-evr-title';
                h2.style.color = o.titleColor;
                h2.innerHTML = o.eventName;
                header.appendChild(h2);
            }

            if (o.showMeta && (o.eventDate || o.eventLocation)) {
                var meta = document.createElement('div');
                meta.className = 'bkbg-evr-meta';

                function metaChip(icon, text) {
                    if (!text) return;
                    var c = document.createElement('div');
                    c.className = 'bkbg-evr-meta-item';
                    c.style.color = o.metaColor;
                    c.textContent = icon + ' ' + text;
                    meta.appendChild(c);
                }

                metaChip('📅', o.eventDate);
                metaChip('📍', o.eventLocation);
                header.appendChild(meta);
            }
            wrap.appendChild(header);

            /* STATS */
            if (o.showStats && (o.stats || []).length) {
                var statsBar = document.createElement('div');
                statsBar.className = 'bkbg-evr-stats';
                statsBar.style.background = o.statsBg;

                var grid = document.createElement('div');
                grid.className = 'bkbg-evr-stats-grid';
                grid.style.gridTemplateColumns = 'repeat(' + Math.min(o.stats.length, 4) + ', 1fr)';

                o.stats.forEach(function (s) {
                    var statEl = document.createElement('div');
                    statEl.className = 'bkbg-evr-stat';

                    var numEl = document.createElement('span');
                    numEl.className = 'bkbg-evr-stat-num';
                    numEl.style.color = o.statNumColor;
                    numEl.textContent = s.number || '';
                    statEl.appendChild(numEl);

                    var lbl = document.createElement('span');
                    lbl.className = 'bkbg-evr-stat-label';
                    lbl.style.color = o.statLabelColor;
                    lbl.textContent = s.label || '';
                    statEl.appendChild(lbl);

                    grid.appendChild(statEl);
                });

                statsBar.appendChild(grid);
                wrap.appendChild(statsBar);
            }

            /* BODY */
            var body = document.createElement('div');
            body.className = 'bkbg-evr-body';

            if (o.showSummary && o.summary) {
                var sumEl = document.createElement('p');
                sumEl.className = 'bkbg-evr-summary';
                sumEl.style.color = o.summaryColor;
                sumEl.innerHTML = o.summary;
                body.appendChild(sumEl);
            }

            if (o.showHighlights && (o.highlights || []).length) {
                var hlLabel = document.createElement('div');
                hlLabel.className = 'bkbg-evr-highlights-label';
                hlLabel.style.color = o.accentColor;
                hlLabel.textContent = o.highlightsLabel || 'Key Highlights';
                body.appendChild(hlLabel);

                var hlList = document.createElement('div');
                hlList.className = 'bkbg-evr-highlights';
                var _IP = window.bkbgIconPicker;

                o.highlights.forEach(function (h) {
                    if (!h.text && !h.icon) return;
                    var item = document.createElement('div');
                    item.className = 'bkbg-evr-highlight';
                    item.style.cssText = 'background:' + o.highlightBg + ';border:1px solid ' + o.highlightBorder + ';';

                    var iconEl = document.createElement('span');
                    iconEl.className = 'bkbg-evr-highlight-icon';
                    var _iType = h.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, h.icon, h.iconDashicon, h.iconImageUrl, h.iconDashiconColor);
                        if (_in) iconEl.appendChild(_in);
                        else iconEl.textContent = h.icon || '';
                    } else {
                        iconEl.textContent = h.icon || '';
                    }
                    if (h.icon || _iType !== 'custom-char') item.appendChild(iconEl);

                    var textEl = document.createElement('span');
                    textEl.className = 'bkbg-evr-highlight-text';
                    textEl.style.color = o.highlightColor;
                    textEl.textContent = h.text || '';
                    item.appendChild(textEl);

                    hlList.appendChild(item);
                });
                body.appendChild(hlList);
            }

            if (o.showNextEvent && o.nextEventInfo) {
                var nextEl = document.createElement('div');
                nextEl.className = 'bkbg-evr-next';
                nextEl.style.cssText = 'background:' + o.nextBg + ';color:' + o.nextTextColor + ';';
                nextEl.textContent = '📅 ' + o.nextEventInfo;
                body.appendChild(nextEl);
            }

            wrap.appendChild(body);
            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
