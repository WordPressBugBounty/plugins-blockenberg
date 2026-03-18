(function () {
    var TYPES = {
        updated:    { icon: '🔄', label: 'Updated' },
        corrected:  { icon: '✏️',  label: 'Correction' },
        added:      { icon: '➕',  label: 'Addition' },
        deprecated: { icon: '⚠️',  label: 'Deprecated' },
        reviewed:   { icon: '✅',  label: 'Reviewed' }
    };

    function esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function init() {
        document.querySelectorAll('.bkbg-upn-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                type: 'updated',
                primaryDate: '',
                primarySummary: '',
                showOriginalDate: false,
                originalPublishDate: '',
                showHistory: false,
                history: [],
                style: 'banner',
                bgColor: '#eff6ff',
                borderColor: '#bfdbfe',
                accentColor: '#2563eb',
                labelColor: '#1d4ed8',
                dateColor: '#3b82f6',
                textColor: '#1e3a8a',
                historyTextColor: '#1e40af',
                borderRadius: 6,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var typeInfo = TYPES[o.type] || TYPES.updated;
            var styleClass = 'bkbg-upn-' + o.style;

            /* wrapper */
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-upn-wrap ' + styleClass;
            wrap.style.background = o.bgColor;
            wrap.style.borderRadius = o.borderRadius + 'px';
            wrap.style.overflow = 'hidden';
            wrap.style.paddingTop = o.paddingTop + 'px';
            wrap.style.paddingBottom = o.paddingBottom + 'px';
            if (o.style === 'banner') {
                wrap.style.borderLeft = '4px solid ' + o.accentColor;
                wrap.style.padding = (o.paddingTop || 12) + 'px 16px ' + (o.paddingBottom || 12) + 'px';
            } else if (o.style === 'box') {
                wrap.style.border = '1px solid ' + o.borderColor;
                wrap.style.borderLeft = '4px solid ' + o.accentColor;
                wrap.style.padding = (o.paddingTop || 14) + 'px 18px ' + (o.paddingBottom || 14) + 'px';
            } else { /* pill */
                wrap.style.display = 'inline-flex';
                wrap.style.alignItems = 'center';
                wrap.style.gap = '8px';
                wrap.style.padding = '6px 14px';
                wrap.style.border = '1px solid ' + o.borderColor;
            }

            /* top row */
            var topRow = document.createElement('div');
            topRow.className = 'bkbg-upn-top-row';

            var typeLabel = document.createElement('div');
            typeLabel.className = 'bkbg-upn-type-label';
            var iconSpan = document.createElement('span');
            iconSpan.className = 'bkbg-upn-icon';
            iconSpan.textContent = typeInfo.icon;
            var labelSpan = document.createElement('span');
            labelSpan.className = 'bkbg-upn-label';
            labelSpan.style.color = o.labelColor;
            labelSpan.textContent = typeInfo.label + ':';
            typeLabel.appendChild(iconSpan);
            typeLabel.appendChild(labelSpan);
            topRow.appendChild(typeLabel);

            if (o.primaryDate) {
                var dateSpan = document.createElement('span');
                dateSpan.className = 'bkbg-upn-date';
                dateSpan.style.color = o.dateColor;
                dateSpan.textContent = o.primaryDate;
                topRow.appendChild(dateSpan);
            }

            if (o.showOriginalDate && o.originalPublishDate) {
                var origSpan = document.createElement('span');
                origSpan.className = 'bkbg-upn-orig-date';
                origSpan.style.color = o.textColor;
                origSpan.textContent = '(originally published ' + esc(o.originalPublishDate) + ')';
                topRow.appendChild(origSpan);
            }

            wrap.appendChild(topRow);

            /* summary — pill style skips summary/history */
            if (o.style !== 'pill' && o.primarySummary) {
                var summaryDiv = document.createElement('div');
                summaryDiv.className = 'bkbg-upn-summary';
                summaryDiv.style.color = o.textColor;
                summaryDiv.innerHTML = o.primarySummary;
                wrap.appendChild(summaryDiv);
            }

            /* history */
            if (o.style !== 'pill' && o.showHistory && o.history && o.history.length) {
                var histDiv = document.createElement('div');
                histDiv.className = 'bkbg-upn-history';
                histDiv.style.borderTop = '1px solid ' + o.borderColor;

                var histTitle = document.createElement('div');
                histTitle.className = 'bkbg-upn-history-title';
                histTitle.style.color = o.labelColor;
                histTitle.textContent = 'Change History';
                histDiv.appendChild(histTitle);

                var ul = document.createElement('ul');
                ul.className = 'bkbg-upn-history-list';
                o.history.forEach(function (h) {
                    if (!h.date && !h.summary) return;
                    var li = document.createElement('li');
                    li.className = 'bkbg-upn-history-item';
                    li.style.color = o.historyTextColor;
                    if (h.date) {
                        var strong = document.createElement('strong');
                        strong.textContent = esc(h.date) + ': ';
                        li.appendChild(strong);
                    }
                    li.appendChild(document.createTextNode(h.summary || ''));
                    ul.appendChild(li);
                });
                histDiv.appendChild(ul);
                wrap.appendChild(histDiv);
            }

            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
