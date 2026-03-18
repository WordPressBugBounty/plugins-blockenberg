(function () {
    'use strict';
    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    var ringOrder = ['adopt', 'trial', 'assess', 'hold'];
    var quadrantOptions = ['Languages & Frameworks', 'Platforms', 'Tools', 'Techniques'];

    function ringInfo(r, a) {
        var map = {
            adopt:  { label: 'Adopt',  bg: a.adoptBg,  color: a.adoptColor,  border: a.adoptBorder },
            trial:  { label: 'Trial',  bg: a.trialBg,  color: a.trialColor,  border: a.trialBorder },
            assess: { label: 'Assess', bg: a.assessBg, color: a.assessColor, border: a.assessBorder },
            hold:   { label: 'Hold',   bg: a.holdBg,   color: a.holdColor,   border: a.holdBorder }
        };
        return map[r] || map.adopt;
    }

    function buildRingSection(ring, blips, a) {
        var ri = ringInfo(ring, a);
        var section = mk('div', 'bkbg-tr-ring-section');
        section.style.cssText = 'border-left:4px solid ' + ri.border + ';background:' + a.bgColor + ';border-radius:8px;overflow:hidden';

        var head = mk('div', 'bkbg-tr-ring-head');
        head.style.background = ri.bg;
        var label = tx('span', 'bkbg-tr-ring-label', ri.label.toUpperCase());
        label.style.cssText = 'color:' + ri.color + ';font-size:' + a.ringLabelSize + 'px';
        var count = tx('span', 'bkbg-tr-ring-count', blips.length + ' ' + (blips.length === 1 ? 'entry' : 'entries'));
        count.style.color = ri.color;
        ap(head, label, count);
        ap(section, head);

        var list = mk('div', 'bkbg-tr-blip-list');
        blips.forEach(function (blip, i) {
            var row = mk('div', 'bkbg-tr-blip');
            if (i > 0) { row.style.borderTopColor = a.borderColor; row.style.borderTopWidth = '1px'; row.style.borderTopStyle = 'solid'; }
            var top = mk('div', 'bkbg-tr-blip-top');
            var name = tx('span', 'bkbg-tr-blip-name', blip.name);
            name.style.cssText = 'color:' + a.blipNameColor + ';font-size:' + a.blipNameSize + 'px';
            ap(top, name);
            if (a.showIsNew && blip.isNew) {
                var badge = tx('span', 'bkbg-tr-new-badge', 'NEW');
                badge.style.cssText = 'background:' + a.newBadgeBg + ';color:' + a.newBadgeColor;
                ap(top, badge);
            }
            ap(row, top);
            if (blip.description) {
                var desc = tx('div', 'bkbg-tr-blip-desc', blip.description);
                desc.style.color = a.blipDescColor;
                ap(row, desc);
            }
            ap(list, row);
        });
        ap(section, list);
        return section;
    }

    function groupByRing(blips) {
        var g = {};
        ringOrder.forEach(function (r) { g[r] = []; });
        blips.forEach(function (b) { if (g[b.ring]) g[b.ring].push(b); });
        return g;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            radarTitle: 'Technology Radar', description: '', showDescription: true,
            groupByQuadrant: false, showIsNew: true, blips: [],
            fontSize: 14, titleFontSize: 24, ringLabelSize: 11, blipNameSize: 14,
            lineHeight: 160, borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb',
            titleColor: '#111827', descColor: '#6b7280',
            blipNameColor: '#1f2937', blipDescColor: '#6b7280',
            quadrantHeadColor: '#374151', newBadgeBg: '#fef9c3', newBadgeColor: '#713f12',
            adoptBg: '#dcfce7', adoptColor: '#14532d', adoptBorder: '#16a34a',
            trialBg: '#dbeafe', trialColor: '#1e40af', trialBorder: '#2563eb',
            assessBg: '#fef9c3', assessColor: '#713f12', assessBorder: '#d97706',
            holdBg: '#f3f4f6', holdColor: '#374151', holdBorder: '#9ca3af'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);

        var wrap = mk('div', 'bkbg-tr-wrap');
        wrap.style.cssText = 'background:' + a.bgColor + ';border-radius:' + a.borderRadius + 'px;border:1px solid ' + a.borderColor + ';padding:32px;font-size:' + a.fontSize + 'px;line-height:' + lh;

        var header = mk('div', 'bkbg-tr-header');
        var title = tx('h2', 'bkbg-tr-title', a.radarTitle);
        title.style.color = a.titleColor;
        ap(header, title);
        if (a.showDescription && a.description) {
            var desc = tx('p', 'bkbg-tr-desc', a.description);
            desc.style.color = a.descColor;
            ap(header, desc);
        }
        ap(wrap, header);

        if (a.groupByQuadrant) {
            var quadGrid = mk('div', 'bkbg-tr-quadrants');
            quadrantOptions.forEach(function (q) {
                var qBlips = a.blips.filter(function (b) { return b.quadrant === q; });
                if (!qBlips.length) return;
                var qCard = mk('div', 'bkbg-tr-quadrant');
                qCard.style.cssText = 'border:1px solid ' + a.borderColor + ';border-radius:8px;overflow:hidden';
                var qHead = tx('div', 'bkbg-tr-quadrant-head', q);
                qHead.style.cssText = 'color:' + a.quadrantHeadColor + ';border-bottom:1px solid ' + a.borderColor;
                ap(qCard, qHead);
                var qGrouped = groupByRing(qBlips);
                var qRings = mk('div', 'bkbg-tr-rings');
                qRings.style.display = 'flex'; qRings.style.flexDirection = 'column'; qRings.style.gap = '8px'; qRings.style.padding = '8px';
                ringOrder.forEach(function (ring) {
                    if (qGrouped[ring] && qGrouped[ring].length) { ap(qRings, buildRingSection(ring, qGrouped[ring], a)); }
                });
                ap(qCard, qRings);
                ap(quadGrid, qCard);
            });
            ap(wrap, quadGrid);
        } else {
            var rings = mk('div', 'bkbg-tr-rings');
            var grouped = groupByRing(a.blips);
            ringOrder.forEach(function (ring) {
                if (grouped[ring] && grouped[ring].length) { ap(rings, buildRingSection(ring, grouped[ring], a)); }
            });
            ap(wrap, rings);
        }

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() { document.querySelectorAll('.bkbg-tech-radar-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
