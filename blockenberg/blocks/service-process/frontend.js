(function () {
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

    function init() {
        document.querySelectorAll('.bkbg-spr-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Our Process', heading: 'How We Turn Your Vision Into Reality',
                subtext: 'A proven four-step approach that delivers exceptional results.',
                phases: [
                    { icon: '🔍', name: 'Discovery', description: 'Deep-dive into your goals and landscape.', deliverables: ['Stakeholder interviews', 'Competitive analysis'] },
                    { icon: '🎨', name: 'Design', description: 'Craft the UX and visual identity.', deliverables: ['Wireframes', 'Brand system'] },
                    { icon: '⚙️', name: 'Build', description: 'Pixel-perfect development with QA.', deliverables: ['Coded components', 'QA reports'] },
                    { icon: '🚀', name: 'Launch', description: 'Go live and grow with data.', deliverables: ['Go-live support', 'Analytics setup'] }
                ],
                layout: 'horizontal', connectorStyle: 'line', showDeliverables: true,
                showNumbers: true, showCta: true, ctaLabel: 'Start Your Project', ctaUrl: '#',
                maxWidth: 1200, paddingTop: 80, paddingBottom: 80,
                bgColor: '#ffffff', headingColor: '#111827', subColor: '#6b7280', eyebrowColor: '#6366f1',
                phaseNumBg: '#6366f1', phaseNumColor: '#ffffff', phaseNameColor: '#111827',
                phaseDescColor: '#6b7280', deliverableColor: '#374151', connectorColor: '#c7d2fe',
                cardBg: '#f8fafc', cardBorder: '#e2e8f0', ctaBg: '#6366f1', ctaColor: '#ffffff',
                accentColor: '#6366f1'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-spr-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            typoCssVarsForEl(inner, o.headingTypo, '--bkspr-ht-');
            typoCssVarsForEl(inner, o.phaseNameTypo, '--bkspr-pnt-');
            typoCssVarsForEl(inner, o.phaseDescTypo, '--bkspr-pdt-');

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-spr-header';
            header.style.cssText = 'text-align:center;margin-bottom:48px;';

            var ey = document.createElement('p'); ey.className = 'bkbg-spr-eyebrow'; ey.style.color = o.eyebrowColor; ey.innerHTML = o.eyebrow;
            var h2 = document.createElement('h2'); h2.className = 'bkbg-spr-heading'; h2.style.color = o.headingColor; h2.innerHTML = o.heading;
            var sub = document.createElement('p'); sub.className = 'bkbg-spr-sub'; sub.style.color = o.subColor; sub.innerHTML = o.subtext;
            header.appendChild(ey); header.appendChild(h2); header.appendChild(sub);
            inner.appendChild(header);

            /* Phases */
            var phasesRow = document.createElement('div');
            phasesRow.className = 'bkbg-spr-phases layout-' + o.layout;
            inner.appendChild(phasesRow);

            (o.phases || []).forEach(function (phase, idx) {
                /* Connector (between phases in horizontal) */
                if (idx > 0 && o.layout === 'horizontal' && o.connectorStyle !== 'none') {
                    var conn = document.createElement('div');
                    conn.className = 'bkbg-spr-connector connector-' + o.connectorStyle;
                    conn.style.background = o.connectorStyle === 'line' ? o.connectorColor : 'transparent';
                    if (o.connectorStyle === 'dashed') conn.style.borderTopColor = o.connectorColor;
                    if (o.connectorStyle === 'dotted') conn.style.borderTopColor = o.connectorColor;
                    phasesRow.appendChild(conn);
                }

                var phaseEl = document.createElement('div');
                phaseEl.className = 'bkbg-spr-phase';

                var card = document.createElement('div');
                card.className = 'bkbg-spr-phase-inner';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;

                /* Top row: number + icon */
                var top = document.createElement('div');
                top.className = 'bkbg-spr-phase-top';

                if (o.showNumbers) {
                    var numEl = document.createElement('div');
                    numEl.className = 'bkbg-spr-num';
                    numEl.style.cssText = 'background:' + o.phaseNumBg + ';color:' + o.phaseNumColor;
                    numEl.textContent = String(idx + 1).padStart(2, '0');
                    top.appendChild(numEl);
                }

                var iconEl = document.createElement('div');
                iconEl.className = 'bkbg-spr-icon';
                var _IP = window.bkbgIconPicker;
                var _iType = phase.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, phase.icon, phase.iconDashicon, phase.iconImageUrl, phase.iconDashiconColor);
                    if (_in) iconEl.appendChild(_in); else iconEl.textContent = phase.icon || '⭐';
                } else { iconEl.textContent = phase.icon || '⭐'; }
                top.appendChild(iconEl);
                card.appendChild(top);

                var nameEl = document.createElement('div');
                nameEl.className = 'bkbg-spr-phase-name';
                nameEl.style.color = o.phaseNameColor;
                nameEl.textContent = phase.name;
                card.appendChild(nameEl);

                var descEl = document.createElement('div');
                descEl.className = 'bkbg-spr-phase-desc';
                descEl.style.color = o.phaseDescColor;
                descEl.textContent = phase.description;
                card.appendChild(descEl);

                if (o.showDeliverables && phase.deliverables && phase.deliverables.length) {
                    var ul = document.createElement('ul');
                    ul.className = 'bkbg-spr-deliverables';
                    phase.deliverables.forEach(function (d) {
                        var li = document.createElement('li');
                        li.className = 'bkbg-spr-deliverable';
                        li.style.color = o.deliverableColor;
                        li.innerHTML = '<span class="bkbg-spr-check" style="color:' + o.accentColor + '">✓</span>' + d;
                        ul.appendChild(li);
                    });
                    card.appendChild(ul);
                }

                phaseEl.appendChild(card);
                phasesRow.appendChild(phaseEl);
            });

            /* CTA */
            if (o.showCta) {
                var ctaRow = document.createElement('div');
                ctaRow.className = 'bkbg-spr-cta-row';
                var cta = document.createElement('a');
                cta.className = 'bkbg-spr-cta';
                cta.href = o.ctaUrl;
                cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                cta.textContent = o.ctaLabel;
                ctaRow.appendChild(cta);
                inner.appendChild(ctaRow);
            }

            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
