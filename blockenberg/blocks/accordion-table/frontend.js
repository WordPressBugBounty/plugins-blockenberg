(function () {
    'use strict';

    function ensureCells(row, colCount) {
        var cells = (row.cells || []).slice();
        while (cells.length < colCount) cells.push('');
        return cells.slice(0, colCount);
    }

    function iconChar(type) {
        if (type === 'plus')  return '+';
        if (type === 'arrow') return '▶';
        return '▼';
    }

    function iconOpenClass(type) {
        if (type === 'plus')  return 'is-open-plus';
        if (type === 'arrow') return 'is-open-arrow';
        return 'is-open'; /* chevron */
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function buildTable(appEl, o) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-actbl-wrap';
        wrap.style.paddingTop = (o.paddingTop || 0) + 'px';
        wrap.style.paddingBottom = (o.paddingBottom || 0) + 'px';
        wrap.style.maxWidth = o.maxWidth + 'px';
        wrap.style.margin = '0 auto';
        wrap.style.background = o.bgColor;

        /* Typography CSS vars */
        wrap.style.setProperty('--bkbg-actbl-header-sz', o.headerSize + 'px');
        wrap.style.setProperty('--bkbg-actbl-cell-sz',   o.cellSize + 'px');
        wrap.style.setProperty('--bkbg-actbl-detail-sz', o.detailSize + 'px');
        typoCssVarsForEl(o.headerTypo, '--bkbg-actbl-header-', wrap);
        typoCssVarsForEl(o.cellTypo,   '--bkbg-actbl-cell-',   wrap);
        typoCssVarsForEl(o.detailTypo, '--bkbg-actbl-detail-', wrap);

        var table = document.createElement('table');
        table.className = 'bkbg-actbl-table';
        table.style.borderRadius = o.borderRadius + 'px';
        table.style.overflow = 'hidden';
        table.style.border = '1px solid ' + o.borderColor;
        table.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';

        var colCount = o.columns.length;
        var iconPos = o.expandIconPosition || 'right';
        var showNums = o.showRowNumbers;
        var dur = (o.animDuration || 240) + 'ms';

        /* ── THEAD ── */
        var thead = document.createElement('thead');
        thead.className = 'bkbg-actbl-thead';
        var headRow = document.createElement('tr');
        headRow.style.background = o.headerBg;

        function makeHeaderCell(text, extraStyle) {
            var th = document.createElement('th');
            th.style.padding = o.cellPaddingV + 'px ' + o.cellPaddingH + 'px';
            th.style.fontSize = o.headerSize + 'px';
            th.style.color = o.headerColor;
            th.style.borderBottom = '1px solid ' + o.borderColor;
            th.style.textAlign = 'left';
            if (extraStyle) Object.assign(th.style, extraStyle);
            th.textContent = text || '';
            return th;
        }

        if (showNums) headRow.appendChild(makeHeaderCell('#', { textAlign: 'center', width: '36px', opacity: '0.7' }));
        if (iconPos === 'left') headRow.appendChild(makeHeaderCell('', { width: '36px' }));

        o.columns.forEach(function (col) {
            var th = makeHeaderCell(col.label, {
                textAlign: col.align || 'left',
                width: col.width || ''
            });
            headRow.appendChild(th);
        });

        if (iconPos === 'right') headRow.appendChild(makeHeaderCell('', { width: '36px' }));
        thead.appendChild(headRow);
        table.appendChild(thead);

        /* ── TBODY ── */
        var tbody = document.createElement('tbody');
        var openStates = {};

        /* Pre-open if needed (none by default) */

        o.rows.forEach(function (row, ri) {
            var cells = ensureCells(row, colCount);
            var isHighlight = row.highlight;
            var rowBg = isHighlight
                ? o.highlightRowBg
                : (o.stripedRows && ri % 2 === 1 ? o.rowAltBg : o.rowBg);

            /* main row */
            var tr = document.createElement('tr');
            tr.className = 'bkbg-actbl-row' + (isHighlight ? ' is-highlight' : '');
            tr.style.background = rowBg;
            tr.style.borderLeft = isHighlight ? '3px solid ' + o.highlightRowBorder : '3px solid transparent';
            tr.style.transition = 'background 0.15s';

            tr.addEventListener('mouseenter', function () { tr.style.background = o.rowHoverBg; });
            tr.addEventListener('mouseleave', function () { tr.style.background = isHighlight ? o.highlightRowBg : rowBg; });

            /* row number cell */
            if (showNums) {
                var numTd = document.createElement('td');
                numTd.className = 'bkbg-actbl-rownum';
                numTd.style.padding = o.cellPaddingV + 'px ' + o.cellPaddingH + 'px';
                numTd.style.fontSize = (o.cellSize - 1) + 'px';
                numTd.style.color = o.rowColor;
                numTd.style.borderBottom = '1px solid ' + o.borderColor;
                numTd.textContent = ri + 1;
                tr.appendChild(numTd);
            }

            /* left icon */
            var leftIconTd = null;
            if (iconPos === 'left') {
                leftIconTd = document.createElement('td');
                leftIconTd.className = 'bkbg-actbl-icon';
                leftIconTd.style.padding = o.cellPaddingV + 'px ' + o.cellPaddingH + 'px';
                leftIconTd.style.color = o.iconColor;
                leftIconTd.style.borderBottom = '1px solid ' + o.borderColor;
                var lIcon = document.createElement('span');
                lIcon.className = 'bkbg-actbl-icon-inner';
                lIcon.textContent = iconChar(o.expandIcon);
                leftIconTd.appendChild(lIcon);
                tr.appendChild(leftIconTd);
            }

            /* data cells */
            cells.forEach(function (cell, ci) {
                var td = document.createElement('td');
                td.style.padding = o.cellPaddingV + 'px ' + o.cellPaddingH + 'px';
                td.style.fontSize = o.cellSize + 'px';
                td.style.color = o.rowColor;
                td.style.textAlign = (o.columns[ci] && o.columns[ci].align) || 'left';
                td.style.borderBottom = '1px solid ' + o.borderColor;
                if (ci === 0) td.style.fontWeight = '600';

                if (ci === 0 && row.badge) {
                    var badge = document.createElement('span');
                    badge.className = 'bkbg-actbl-badge';
                    badge.style.background = row.badgeColor || '#6366f1';
                    badge.textContent = row.badge;
                    td.appendChild(badge);
                }

                var textNode = document.createTextNode(cell || '');
                td.appendChild(textNode);
                tr.appendChild(td);
            });

            /* right icon */
            var rightIconTd = null;
            if (iconPos === 'right') {
                rightIconTd = document.createElement('td');
                rightIconTd.className = 'bkbg-actbl-icon';
                rightIconTd.style.padding = o.cellPaddingV + 'px ' + o.cellPaddingH + 'px';
                rightIconTd.style.color = o.iconColor;
                rightIconTd.style.borderBottom = '1px solid ' + o.borderColor;
                var rIcon = document.createElement('span');
                rIcon.className = 'bkbg-actbl-icon-inner';
                rIcon.textContent = iconChar(o.expandIcon);
                rightIconTd.appendChild(rIcon);
                tr.appendChild(rightIconTd);
            }

            tbody.appendChild(tr);

            /* detail row */
            var detailTr = document.createElement('tr');
            detailTr.className = 'bkbg-actbl-detail-row';
            var detailTd = document.createElement('td');
            var totalCols = colCount + (showNums ? 1 : 0) + 1; /* +1 for icon col */
            detailTd.colSpan = totalCols;
            detailTd.style.padding = '0';
            detailTd.style.border = 'none';

            var detailInner = document.createElement('div');
            detailInner.className = 'bkbg-actbl-detail-inner';
            detailInner.style.transition = 'max-height ' + dur + ' ease, opacity ' + dur;

            var detailContent = document.createElement('div');
            detailContent.className = 'bkbg-actbl-detail-content';
            detailContent.style.background = o.detailBg;
            detailContent.style.borderBottom = '1px solid ' + o.detailBorderColor;
            detailContent.style.borderLeft = '3px solid ' + (isHighlight ? o.highlightRowBorder : o.borderColor);
            detailContent.style.color = o.detailColor;
            detailContent.style.fontSize = o.detailSize + 'px';
            detailContent.style.paddingLeft = (o.cellPaddingH + 8) + 'px';

            if (row.detailTitle) {
                var dtTitle = document.createElement('div');
                dtTitle.className = 'bkbg-actbl-detail-title';
                dtTitle.style.color = o.detailColor;
                dtTitle.textContent = row.detailTitle;
                detailContent.appendChild(dtTitle);
            }

            if ((row.detailType || 'list') === 'list') {
                var ul = document.createElement('ul');
                ul.className = 'bkbg-actbl-detail-list';
                (row.detailItems || []).forEach(function (item) {
                    var li = document.createElement('li');
                    li.textContent = item;
                    li.style.color = o.detailColor;
                    ul.appendChild(li);
                });
                detailContent.appendChild(ul);
            } else {
                var p = document.createElement('p');
                p.className = 'bkbg-actbl-detail-text';
                p.textContent = row.detailText || '';
                detailContent.appendChild(p);
            }

            detailInner.appendChild(detailContent);
            detailTd.appendChild(detailInner);
            detailTr.appendChild(detailTd);
            tbody.appendChild(detailTr);

            /* ── toggle logic ── */
            var allIcons = [];
            if (leftIconTd) allIcons.push(leftIconTd.querySelector('.bkbg-actbl-icon-inner'));
            if (rightIconTd) allIcons.push(rightIconTd.querySelector('.bkbg-actbl-icon-inner'));

            function openRow() {
                openStates[ri] = true;
                tr.classList.add('is-open');
                allIcons.forEach(function (ic) { ic.classList.add(iconOpenClass(o.expandIcon)); });
                detailInner.classList.add('is-open');
                detailInner.style.maxHeight = detailContent.scrollHeight + 40 + 'px';
            }

            function closeRow() {
                openStates[ri] = false;
                tr.classList.remove('is-open');
                allIcons.forEach(function (ic) { ic.classList.remove(iconOpenClass(o.expandIcon)); });
                detailInner.classList.remove('is-open');
                detailInner.style.maxHeight = '0';
            }

            tr.addEventListener('click', function () {
                if (openStates[ri]) {
                    closeRow();
                } else {
                    if (!o.allowMultiple) {
                        /* close all others */
                        Object.keys(openStates).forEach(function (k) {
                            if (openStates[k]) {
                                var event = new CustomEvent('bkbg-actbl-close', { detail: { idx: parseInt(k, 10) } });
                                table.dispatchEvent(event);
                            }
                        });
                    }
                    openRow();
                }
            });

            table.addEventListener('bkbg-actbl-close', function (e) {
                if (e.detail.idx === ri) closeRow();
            });
        });

        table.appendChild(tbody);
        wrap.appendChild(table);

        appEl.parentNode.insertBefore(wrap, appEl);
        appEl.style.display = 'none';
    }

    function init() {
        document.querySelectorAll('.bkbg-actbl-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                columns: [],
                rows: [],
                allowMultiple: false,
                showRowNumbers: false,
                stripedRows: true,
                stickyHeader: false,
                expandIconPosition: 'right',
                expandIcon: 'chevron',
                animDuration: 240,
                borderRadius: 10,
                cellPaddingV: 14,
                cellPaddingH: 16,
                headerSize: 13,
                cellSize: 14,
                detailSize: 14,
                maxWidth: 900,
                paddingTop: 0,
                paddingBottom: 0,
                bgColor: '#ffffff',
                headerBg: '#f8fafc',
                headerColor: '#374151',
                rowBg: '#ffffff',
                rowAltBg: '#f9fafb',
                rowHoverBg: '#f0f4ff',
                rowColor: '#1f2937',
                highlightRowBg: '#f0f0ff',
                highlightRowBorder: '#6366f1',
                detailBg: '#f8fafc',
                detailColor: '#374151',
                detailBorderColor: '#e5e7eb',
                borderColor: '#e5e7eb',
                iconColor: '#9ca3af',
                titleColor: '#111827'
            }, opts);

            buildTable(appEl, o);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
