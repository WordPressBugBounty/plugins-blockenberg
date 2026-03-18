(function () {
    'use strict';

    /* ---- Typography CSS-var helper ---- */
    var _typoKeys = {family:'font-family',weight:'font-weight',style:'font-style',decoration:'text-decoration',transform:'text-transform'};
    var _respKeys = {sizeDesktop:'font-size-d',sizeTablet:'font-size-t',sizeMobile:'font-size-m',lineHeightDesktop:'line-height-d',lineHeightTablet:'line-height-t',lineHeightMobile:'line-height-m',letterSpacingDesktop:'letter-spacing-d',letterSpacingTablet:'letter-spacing-t',letterSpacingMobile:'letter-spacing-m',wordSpacingDesktop:'word-spacing-d',wordSpacingTablet:'word-spacing-t',wordSpacingMobile:'word-spacing-m'};
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        var k;
        for (k in _typoKeys) { if (obj[k]) el.style.setProperty(prefix + _typoKeys[k], obj[k]); }
        for (k in _respKeys) { if (obj[k] !== undefined && obj[k] !== '') el.style.setProperty(prefix + _respKeys[k], obj[k]); }
    }

    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    function statusInfo(s, a) {
        var map = {
            operational: { label: 'Operational', bg: a.operationalBg, color: a.operationalColor, dot: '#16a34a' },
            degraded:    { label: 'Degraded',    bg: a.degradedBg,    color: a.degradedColor,    dot: '#d97706' },
            outage:      { label: 'Outage',      bg: a.outageBg,      color: a.outageColor,      dot: '#dc2626' },
            maintenance: { label: 'Maintenance', bg: a.maintenanceBg, color: a.maintenanceColor, dot: '#6366f1' }
        };
        return map[s] || map.operational;
    }

    function overallBanner(s) {
        if (s === 'operational') return { text: '✅ All Systems Operational', bg: '#14532d', color: '#dcfce7' };
        if (s === 'partial')     return { text: '⚠️ Partial Service Disruption', bg: '#78350f', color: '#fef9c3' };
        if (s === 'major')       return { text: '🔴 Major Outage in Progress', bg: '#991b1b', color: '#fee2e2' };
        return                          { text: '🔧 Scheduled Maintenance', bg: '#3730a3', color: '#e0e7ff' };
    }

    function updateDotColor(status, a) {
        if (status === 'investigating') return a.updateDotInvestigating;
        if (status === 'identified')    return a.updateDotIdentified;
        if (status === 'monitoring')    return a.updateDotMonitoring;
        return a.updateDotResolved;
    }

    function incidentBorderColor(severity, a) {
        if (severity === 'major')  return a.incidentBorderMajor;
        if (severity === 'minor')  return a.incidentBorderMinor;
        return a.incidentBorderNotice;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            pageTitle: 'System Status', overallStatus: 'operational',
            lastUpdated: '', showLastUpdated: true,
            components: [], showUptime: true, showDescription: true,
            incidents: [], showIncidents: true,
            incidentsLabel: 'Recent Incidents', componentsLabel: 'Components',
            fontSize: 14, titleFontSize: 26, lineHeight: 168, borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb', headerBg: '#0f172a',
            headerColor: '#ffffff', metaColor: '#94a3b8', sectionHeadColor: '#111827',
            componentNameColor: '#1f2937', componentDescColor: '#6b7280', uptimeColor: '#6b7280',
            operationalBg: '#dcfce7', operationalColor: '#14532d',
            degradedBg: '#fef9c3', degradedColor: '#713f12',
            outageBg: '#fee2e2', outageColor: '#991b1b',
            maintenanceBg: '#e0e7ff', maintenanceColor: '#3730a3',
            incidentBorderMajor: '#ef4444', incidentBorderMinor: '#f59e0b', incidentBorderNotice: '#3b82f6',
            updateDotInvestigating: '#f59e0b', updateDotIdentified: '#ef4444',
            updateDotMonitoring: '#3b82f6', updateDotResolved: '#22c55e'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);
        var ob = overallBanner(a.overallStatus);

        /* Typography CSS vars on app element */
        appEl.style.setProperty('--bksp-tt-sz', a.titleFontSize + 'px');
        appEl.style.setProperty('--bksp-bd-sz', a.fontSize + 'px');
        appEl.style.setProperty('--bksp-bd-lh', lh);
        if (a.fontWeight) appEl.style.setProperty('--bksp-bd-wt', a.fontWeight);
        typoCssVarsForEl(appEl, a.titleTypo, '--bksp-tt-');
        typoCssVarsForEl(appEl, a.bodyTypo, '--bksp-bd-');
        typoCssVarsForEl(appEl, a.sectionHeadTypo, '--bksp-sh-');
        typoCssVarsForEl(appEl, a.componentNameTypo, '--bksp-cn-');
        typoCssVarsForEl(appEl, a.incidentTitleTypo, '--bksp-it-');

        var wrap = mk('div', 'bkbg-sp-wrap');
        wrap.style.cssText = 'border:1px solid ' + a.borderColor + ';border-radius:' + a.borderRadius + 'px;overflow:hidden;background:' + a.bgColor;

        // Header
        var header = mk('div', 'bkbg-sp-header');
        header.style.background = a.headerBg;
        var title = tx('h2', 'bkbg-sp-title', a.pageTitle);
        title.style.color = a.headerColor;
        ap(header, title);
        if (a.showLastUpdated && a.lastUpdated) {
            var meta = tx('div', 'bkbg-sp-meta', 'Last updated: ' + a.lastUpdated);
            meta.style.color = a.metaColor;
            ap(header, meta);
        }
        ap(wrap, header);

        // Overall banner
        var banner = tx('div', 'bkbg-sp-banner', ob.text);
        banner.style.cssText = 'background:' + ob.bg + ';color:' + ob.color;
        ap(wrap, banner);

        // Components section
        var compSec = mk('div', 'bkbg-sp-section');
        var compHead = tx('h3', 'bkbg-sp-section-head', a.componentsLabel);
        compHead.style.color = a.sectionHeadColor;
        ap(compSec, compHead);

        var compList = mk('div', 'bkbg-sp-comp-list');
        compList.style.cssText = 'border:1px solid ' + a.borderColor;
        a.components.forEach(function (comp, i) {
            var si = statusInfo(comp.status, a);
            var row = mk('div', 'bkbg-sp-comp-row');
            if (i > 0) { row.style.borderTopColor = a.borderColor; }

            var left = mk('div');
            var name = tx('div', 'bkbg-sp-comp-name', comp.name);
            name.style.color = a.componentNameColor;
            ap(left, name);
            if (a.showDescription && comp.description) {
                var desc = tx('div', 'bkbg-sp-comp-desc', comp.description);
                desc.style.color = a.componentDescColor;
                ap(left, desc);
            }

            var right = mk('div', 'bkbg-sp-comp-right');
            if (a.showUptime) {
                var upt = tx('span', 'bkbg-sp-uptime', comp.uptime + '%');
                upt.style.color = a.uptimeColor;
                ap(right, upt);
            }
            var badge = mk('span', 'bkbg-sp-status-badge');
            badge.style.cssText = 'background:' + si.bg + ';color:' + si.color;
            var dot = mk('span', 'bkbg-sp-status-dot');
            dot.style.background = si.dot;
            ap(badge, dot, document.createTextNode(si.label));
            ap(right, badge);
            ap(row, left, right);
            ap(compList, row);
        });
        ap(compSec, compList);
        ap(wrap, compSec);

        // Incidents section
        if (a.showIncidents && a.incidents.length > 0) {
            var incSec = mk('div', 'bkbg-sp-section');
            incSec.style.paddingTop = '0';
            var incHead = tx('h3', 'bkbg-sp-section-head', a.incidentsLabel);
            incHead.style.color = a.sectionHeadColor;
            ap(incSec, incHead);

            var incList = mk('div', 'bkbg-sp-incidents');
            a.incidents.forEach(function (inc) {
                var borderC = incidentBorderColor(inc.severity, a);
                var card = mk('div', 'bkbg-sp-incident');
                card.style.cssText = 'border-color:' + a.borderColor + ';border-left-color:' + borderC + ';background:#fafafa';

                var incH = mk('div', 'bkbg-sp-inc-header');
                var incTitle = tx('strong', 'bkbg-sp-inc-title', inc.title);
                incTitle.style.color = a.componentNameColor;
                var incMeta = mk('div', 'bkbg-sp-inc-meta');
                var incDate = tx('span', 'bkbg-sp-inc-date', inc.date);
                incDate.style.color = a.componentDescColor;
                var sevBadge = tx('span', 'bkbg-sp-severity-badge', inc.severity.toUpperCase());
                sevBadge.style.cssText = 'background:' + borderC + '22;color:' + borderC;
                ap(incMeta, incDate, sevBadge);
                ap(incH, incTitle, incMeta);
                ap(card, incH);

                var updList = mk('div', 'bkbg-sp-updates');
                (inc.updates || []).forEach(function (u) {
                    var dotColor = updateDotColor(u.status, a);
                    var uRow = mk('div', 'bkbg-sp-update-row');
                    var uDot = mk('span', 'bkbg-sp-update-dot');
                    uDot.style.background = dotColor;
                    var uTime = tx('span', 'bkbg-sp-update-time', u.time);
                    uTime.style.color = a.componentDescColor;
                    var uMsg = tx('span', 'bkbg-sp-update-msg', u.message);
                    uMsg.style.color = a.componentNameColor;
                    ap(uRow, uDot, uTime, uMsg);
                    ap(updList, uRow);
                });
                ap(card, updList);
                ap(incList, card);
            });
            ap(incSec, incList);
            ap(wrap, incSec);
        }

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() { document.querySelectorAll('.bkbg-status-page-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
