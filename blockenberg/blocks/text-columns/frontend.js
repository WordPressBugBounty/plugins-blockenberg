(function () {
    function init() {
        document.querySelectorAll('.bkbg-tc-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                columnCount: 2, columns: [], dropCap: false, dropCapSize: 3, dropCapColor: '#111827',
                showRule: true, ruleStyle: 'solid', ruleWidth: 1, columnGap: 40,
                pullQuote: '', showPullQuote: false, pullQuotePos: 'between',
                fontSize: 16, lineHeight: 175, textAlign: 'left',
                paddingTop: 0, paddingBottom: 0,
                bgColor: '', textColor: '#374151', ruleColor: '#d1d5db',
                pullQuoteBorder: '#6366f1', pullQuoteColor: '#111827'
            }, opts);

            /* Normalize columns */
            var cols = o.columns || [];
            while (cols.length < o.columnCount) { cols.push({ content: '' }); }
            cols = cols.slice(0, o.columnCount);

            /* Wrap */
            var section = document.createElement('div');
            section.className = 'bkbg-tc-wrap' + (o.dropCap ? ' has-dropcap' : '');
            section.style.cssText = [
                o.bgColor ? 'background:' + o.bgColor : '',
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px'
            ].filter(Boolean).join(';');

            /* Drop cap inline style */
            if (o.dropCap) {
                var dcStyle = document.createElement('style');
                dcStyle.textContent = '.bkbg-tc-wrap.has-dropcap .bkbg-tc-col:first-child p:first-child::first-letter{float:left;font-size:' + o.dropCapSize + 'em;line-height:.75;padding-right:.1em;color:' + o.dropCapColor + ';font-weight:800;margin-top:.07em}';
                section.appendChild(dcStyle);
            }

            /* Pull quote builder */
            function makePullQuote() {
                var bq = document.createElement('blockquote');
                bq.className = 'bkbg-tc-pullquote';
                bq.style.cssText = 'border-left:' + 4 + 'px solid ' + o.pullQuoteBorder + ';color:' + o.pullQuoteColor;
                bq.innerHTML = '<p>' + o.pullQuote + '</p>';
                return bq;
            }

            /* Above */
            if (o.showPullQuote && o.pullQuote && o.pullQuotePos === 'above') {
                section.appendChild(makePullQuote());
            }

            /* Grid */
            var grid = document.createElement('div');
            grid.className = 'bkbg-tc-grid';
            grid.style.cssText = 'gap:' + o.columnGap + 'px';

            cols.forEach(function (col, idx) {
                var div = document.createElement('div');
                div.className = 'bkbg-tc-col';
                div.style.cssText = [
                    'color:' + o.textColor,
                    'text-align:' + o.textAlign,
                    idx > 0 && o.showRule
                        ? ('border-left:' + o.ruleWidth + 'px ' + o.ruleStyle + ' ' + o.ruleColor + ';padding-left:' + (o.columnGap / 2) + 'px')
                        : ''
                ].filter(Boolean).join(';');
                div.innerHTML = col.content || '';
                grid.appendChild(div);
            });

            section.appendChild(grid);

            /* Between / below */
            if (o.showPullQuote && o.pullQuote && o.pullQuotePos !== 'above') {
                section.appendChild(makePullQuote());
            }

            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
