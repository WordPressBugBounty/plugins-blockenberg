(function () {
    function init() {
        document.querySelectorAll('.bkbg-tldr-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                headingIcon: '⚡', iconType: 'custom-char', iconDashicon: 'lightbulb', iconImageUrl: '',
                heading: 'TL;DR', showIcon: true,
                summary: '', points: [{ text: '' }],
                showPoints: true, readTime: '', showReadTime: false,
                expandable: false, expandLabel: 'Read full article', collapseLabel: 'Show less',
                style: 'highlight',
                bgColor: '#fef9c3', borderColor: '#fde047', accentColor: '#ca8a04',
                headingColor: '#713f12', summaryColor: '#1c1917', pointColor: '#292524',
                metaColor: '#a8a29e', iconColor: '#ca8a04',
                borderRadius: 10, paddingTop: 0, paddingBottom: 0
            }, opts);

            function mk(tag, cls, style, text) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                if (text != null) n.textContent = text;
                return n;
            }

            var wrap = mk('div', 'bkbg-tldr-wrap bkbg-tldr-style-' + o.style, {
                background: o.bgColor,
                borderRadius: o.borderRadius + 'px'
            });

            /* border per style */
            if (o.style === 'highlight' || o.style === 'minimal' || o.style === 'card') {
                wrap.style.borderColor = o.borderColor;
            } else if (o.style === 'sidebar') {
                wrap.style.borderColor = o.borderColor;
                wrap.style.borderLeftColor = o.accentColor;
            }
            if (o.style === 'minimal') { wrap.style.background = 'transparent'; }

            /* header */
            var header = mk('div', 'bkbg-tldr-header');
            if (o.showIcon) {
                var IP = window.bkbgIconPicker;
                var iconNode = IP ? IP.buildFrontendIcon(o.iconType, o.headingIcon, o.iconDashicon, o.iconImageUrl, o.iconDashiconColor) : null;
                if (iconNode) {
                    iconNode.classList.add('bkbg-tldr-icon');
                    iconNode.style.color = o.iconColor;
                    header.appendChild(iconNode);
                } else if (o.headingIcon) {
                    header.appendChild(mk('span', 'bkbg-tldr-icon', { color: o.iconColor }, o.headingIcon));
                }
            }
            header.appendChild(mk('span', 'bkbg-tldr-heading', { color: o.headingColor }, o.heading));
            if (o.showReadTime && o.readTime) {
                header.appendChild(mk('span', 'bkbg-tldr-readtime', { color: o.metaColor }, o.readTime));
            }
            wrap.appendChild(header);

            /* collapsible container */
            var collapsible;
            if (o.expandable) {
                collapsible = mk('div', 'bkbg-tldr-collapsible');
            }
            var target = o.expandable ? collapsible : wrap;

            /* summary */
            if (o.summary) {
                var sum = mk('p', 'bkbg-tldr-summary', { color: o.summaryColor }, '');
                sum.innerHTML = o.summary;
                target.appendChild(sum);
            }

            /* divider + points */
            if (o.showPoints && o.points && o.points.some(function (p) { return p.text && p.text.trim(); })) {
                var div = mk('div', 'bkbg-tldr-divider', { background: o.borderColor });
                target.appendChild(div);
                var ul = mk('ul', 'bkbg-tldr-points');
                o.points.forEach(function (p) {
                    if (!p.text || !p.text.trim()) return;
                    var li = mk('li', 'bkbg-tldr-point', { color: o.pointColor });
                    var check = mk('span', 'bkbg-tldr-check', { color: o.accentColor }, '✓');
                    var txt = mk('span', '', {}, p.text);
                    li.appendChild(check);
                    li.appendChild(txt);
                    ul.appendChild(li);
                });
                target.appendChild(ul);
            }

            if (o.expandable) {
                wrap.appendChild(collapsible);

                /* determine initial state: show content by default (expanded), button collapses */
                var expanded = true;
                collapsible.style.maxHeight = collapsible.scrollHeight + 'px';

                var btn = mk('button', 'bkbg-tldr-toggle', { color: o.accentColor });
                btn.textContent = '▲ ' + o.collapseLabel;
                btn.addEventListener('click', function () {
                    expanded = !expanded;
                    if (expanded) {
                        collapsible.style.maxHeight = collapsible.scrollHeight + 'px';
                        btn.textContent = '▲ ' + o.collapseLabel;
                    } else {
                        collapsible.style.maxHeight = '0';
                        btn.textContent = '▼ ' + o.expandLabel;
                    }
                });
                wrap.appendChild(btn);
            }

            var outerWrap = mk('div', '', { paddingTop: o.paddingTop + 'px', paddingBottom: o.paddingBottom + 'px' });
            outerWrap.appendChild(wrap);
            el.parentNode.insertBefore(outerWrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
