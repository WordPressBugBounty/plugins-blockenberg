(function () {
    'use strict';
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }
    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    function formatSalary(n, currency) {
        if (n >= 1000) return currency + Math.round(n / 1000) + 'k';
        return currency + n;
    }

    function getGlobalMinMax(roles) {
        var allVals = [];
        roles.forEach(function (r) { allVals.push(r.min, r.max); });
        if (!allVals.length) return { gMin: 0, gMax: 100 };
        return { gMin: Math.min.apply(null, allVals), gMax: Math.max.apply(null, allVals) };
    }

    function getCategories(roles) {
        var cats = [], seen = {};
        roles.forEach(function (r) { if (!seen[r.category]) { seen[r.category] = 1; cats.push(r.category); } });
        return cats;
    }

    function buildBar(role, a, gMin, gMax) {
        var range = gMax - gMin || 1;
        var leftPct = ((role.min - gMin) / range) * 100;
        var widthPct = ((role.max - role.min) / range) * 100;
        var medPct = ((role.median - gMin) / range) * 100;

        var wrap = mk('div', 'bkbg-sg-bar-wrap');
        var track = mk('div', 'bkbg-sg-bar-track');
        track.style.cssText = 'height:' + a.barHeight + 'px;background:' + a.barTrackColor + ';border-radius:' + a.barHeight + 'px;position:relative;overflow:visible';

        var fill = mk('div', 'bkbg-sg-bar-fill');
        fill.style.cssText = 'position:absolute;left:' + leftPct.toFixed(2) + '%;width:' + widthPct.toFixed(2) + '%;height:100%;background:' + a.barFillColor + ';border-radius:' + a.barHeight + 'px;top:0';
        ap(track, fill);

        if (a.showMedian) {
            var med = mk('div', 'bkbg-sg-bar-median');
            med.style.cssText = 'position:absolute;left:' + medPct.toFixed(2) + '%;top:-3px;width:3px;height:' + (a.barHeight + 6) + 'px;background:' + a.medianColor + ';border-radius:2px;transform:translateX(-50%)';
            ap(track, med);
        }
        ap(wrap, track);
        return wrap;
    }

    function buildRow(role, a, gMin, gMax) {
        var row = mk('div', 'bkbg-sg-row');

        var header = mk('div', 'bkbg-sg-row-header');
        var info = mk('div', 'bkbg-sg-role-info');
        var title = tx('span', 'bkbg-sg-role-title', role.title);
        title.style.color = a.roleTitleColor;
        ap(info, title);
        if (a.showLevel) {
            var lvl = tx('span', 'bkbg-sg-level-badge', role.level);
            lvl.style.cssText = 'background:' + a.levelBg + ';color:' + a.levelColor;
            ap(info, lvl);
        }
        ap(header, info);

        var labels = mk('div', 'bkbg-sg-range-labels');
        labels.style.color = a.rangeLabelColor;
        var minL = tx('span', null, formatSalary(role.min, a.currency));
        ap(labels, minL);
        if (a.showMedian) {
            var medL = tx('span', 'bkbg-sg-median-label', formatSalary(role.median, a.currency) + ' median');
            medL.style.cssText = 'color:' + a.medianColor + ';font-weight:600';
            ap(labels, medL);
        }
        var maxL = tx('span', null, formatSalary(role.max, a.currency));
        ap(labels, maxL);
        ap(header, labels);
        ap(row, header);

        if (a.showBars) {
            ap(row, buildBar(role, a, gMin, gMax));
        }
        return row;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            guideTitle: 'Salary Guide', description: '', showDescription: true,
            currency: '$', period: 'year', location: '', showLocation: true,
            showBars: true, showMedian: true, showLevel: true, groupByCategory: false,
            roles: [],
            fontSize: 14, titleFontSize: 24, lineHeight: 160, borderRadius: 12, barHeight: 10,
            bgColor: '#ffffff', borderColor: '#e5e7eb',
            titleColor: '#111827', descColor: '#6b7280',
            roleTitleColor: '#1f2937', levelBg: '#f3f4f6', levelColor: '#374151',
            rangeLabelColor: '#6b7280', barTrackColor: '#e5e7eb', barFillColor: '#3b82f6',
            medianColor: '#0f172a', categoryHeadColor: '#374151', categoryHeadBg: '#f8fafc'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);
        var mm = getGlobalMinMax(a.roles);

        var wrap = mk('div', 'bkbg-sg-wrap');
        wrap.style.cssText = 'background:' + a.bgColor + ';border-radius:' + a.borderRadius + 'px;border:1px solid ' + a.borderColor + ';overflow:hidden;font-size:' + a.fontSize + 'px;line-height:' + lh;

        var header = mk('div', 'bkbg-sg-header');
        header.style.cssText = 'padding:24px 28px;border-bottom:1px solid ' + a.borderColor;
        var title = tx('h2', 'bkbg-sg-title', a.guideTitle);
        title.style.cssText = 'color:' + a.titleColor;
        ap(header, title);
        var meta = mk('div', 'bkbg-sg-meta');
        if (a.showDescription && a.description) {
            var desc = tx('p', null, a.description);
            desc.style.cssText = 'margin:0;color:' + a.descColor;
            ap(meta, desc);
        }
        if (a.showLocation && a.location) {
            var loc = tx('span', 'bkbg-sg-location', '📍 ' + a.location + ' · ' + a.currency + ' / ' + a.period);
            loc.style.cssText = 'color:' + a.descColor + ';font-size:0.88em;margin-top:4px;display:block';
            ap(meta, loc);
        }
        ap(header, meta);
        ap(wrap, header);

        var body = mk('div', 'bkbg-sg-body');
        if (a.groupByCategory) {
            var cats = getCategories(a.roles);
            cats.forEach(function (cat) {
                var catRoles = a.roles.filter(function (r) { return r.category === cat; });
                var catHead = tx('div', 'bkbg-sg-category-head', cat);
                catHead.style.cssText = 'color:' + a.categoryHeadColor + ';background:' + a.categoryHeadBg + ';border-bottom:1px solid ' + a.borderColor;
                ap(body, catHead);
                catRoles.forEach(function (role, i) {
                    var row = buildRow(role, a, mm.gMin, mm.gMax);
                    if (i > 0) { row.style.borderTopColor = a.borderColor; row.style.borderTopWidth = '1px'; row.style.borderTopStyle = 'solid'; }
                    ap(body, row);
                });
            });
        } else {
            a.roles.forEach(function (role, i) {
                var row = buildRow(role, a, mm.gMin, mm.gMax);
                if (i > 0) { row.style.borderTopColor = a.borderColor; row.style.borderTopWidth = '1px'; row.style.borderTopStyle = 'solid'; }
                ap(body, row);
            });
        }
        ap(wrap, body);

        appEl.innerHTML = '';
        appEl.appendChild(wrap);

        typoCssVarsForEl(wrap, a.titleTypo, '--bksg-tt-');
        typoCssVarsForEl(wrap, a.descTypo, '--bksg-dt-');
    }

    function init() { document.querySelectorAll('.bkbg-salary-guide-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
