(function () {
    var _typoKeys = {
        family: '-ff', sizeDesktop: '-fs', sizeTablet: '-fs-tab', sizeMobile: '-fs-mob',
        weight: '-fw', style: '-fst', decoration: '-td', transform: '-tt',
        letterSpacing: '-ls', lineHeight: '-lh'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj) return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var u = (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile')
                ? (String(v).match(/[a-z%]/i) ? v : v + 'px')
                : (k === 'lineHeight' ? String(v) : v);
            el.style.setProperty(prefix + _typoKeys[k], u);
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-per-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Who Is This For?', heading: 'Built for Teams Who Move Fast',
                subtext: 'Whether you\'re a solo founder or a growing team, Blockenberg fits your workflow.',
                personas: [], layout: 'grid', columns: 3,
                showPainPoints: true, showBenefits: true,
                maxWidth: 1200, paddingTop: 100, paddingBottom: 100,
                painLabel: 'Pain points:', benefitLabel: 'With Blockenberg:',
                bgColor: '#ffffff', eyebrowColor: '#6366f1', headingColor: '#111827', subColor: '#6b7280',
                cardBg: '#f8fafc', cardBorder: '#e2e8f0', iconBg: '#ede9fe',
                roleColor: '#111827', descColor: '#6b7280', accentColor: '#6366f1',
                painColor: '#374151', painIconColor: '#ef4444',
                benefitColor: '#374151', benefitIconColor: '#22c55e'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-per-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-per-header';

            var ey = document.createElement('span'); ey.className = 'bkbg-per-eyebrow'; ey.style.color = o.eyebrowColor; ey.textContent = o.eyebrow;
            typoCssVarsForEl(ey, o.eyebrowTypo, '--bkbg-per-eyebrow');
            var h2 = document.createElement('h2'); h2.className = 'bkbg-per-heading'; h2.style.color = o.headingColor; h2.innerHTML = o.heading;
            typoCssVarsForEl(h2, o.headingTypo, '--bkbg-per-heading');
            var sub = document.createElement('p'); sub.className = 'bkbg-per-sub'; sub.style.color = o.subColor; sub.innerHTML = o.subtext;
            typoCssVarsForEl(sub, o.subtextTypo, '--bkbg-per-subtext');
            header.appendChild(ey); header.appendChild(h2); header.appendChild(sub);
            inner.appendChild(header);

            /* Grid */
            var grid = document.createElement('div');
            grid.className = 'bkbg-per-grid';
            grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';

            (o.personas || []).forEach(function (p) {
                var card = document.createElement('div');
                card.className = 'bkbg-per-card';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder + ';border-radius:' + (o.borderRadius || 12) + 'px;';

                /* Icon */
                var icon = document.createElement('div'); icon.className = 'bkbg-per-icon';
                icon.style.background = o.iconBg;
                var _IP = window.bkbgIconPicker;
                var _iType = p.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, p.icon, p.iconDashicon, p.iconImageUrl, p.iconDashiconColor);
                    if (_in) icon.appendChild(_in); else icon.textContent = p.icon || '⭐';
                } else { icon.textContent = p.icon || '⭐'; }
                card.appendChild(icon);

                /* Role */
                var role = document.createElement('h3'); role.className = 'bkbg-per-role'; role.style.color = o.roleColor; role.textContent = p.role;
                typoCssVarsForEl(role, o.roleTypo, '--bkbg-per-role');
                card.appendChild(role);

                /* Desc */
                var desc = document.createElement('p'); desc.className = 'bkbg-per-desc'; desc.style.color = o.descColor; desc.textContent = p.description;
                typoCssVarsForEl(desc, o.descTypo, '--bkbg-per-desc');
                card.appendChild(desc);

                /* Pain points */
                if (o.showPainPoints && p.painPoints && p.painPoints.length) {
                    var painLabel = document.createElement('span'); painLabel.className = 'bkbg-per-list-label'; painLabel.style.color = o.accentColor; painLabel.textContent = o.painLabel;
                    card.appendChild(painLabel);
                    var painUl = document.createElement('ul'); painUl.className = 'bkbg-per-list';
                    p.painPoints.forEach(function (pt) {
                        var li = document.createElement('li'); li.style.color = o.painColor;
                        typoCssVarsForEl(li, o.itemTypo, '--bkbg-per-item');
                        var icon2 = document.createElement('i'); icon2.className = 'bkbg-per-list-icon'; icon2.style.color = o.painIconColor; icon2.textContent = '✕';
                        li.appendChild(icon2); li.appendChild(document.createTextNode(pt));
                        painUl.appendChild(li);
                    });
                    card.appendChild(painUl);
                }

                /* Benefits */
                if (o.showBenefits && p.benefits && p.benefits.length) {
                    var benLabel = document.createElement('span'); benLabel.className = 'bkbg-per-list-label'; benLabel.style.color = o.accentColor; benLabel.textContent = o.benefitLabel;
                    card.appendChild(benLabel);
                    var benUl = document.createElement('ul'); benUl.className = 'bkbg-per-list';
                    p.benefits.forEach(function (b) {
                        var li = document.createElement('li'); li.style.color = o.benefitColor;
                        typoCssVarsForEl(li, o.itemTypo, '--bkbg-per-item');
                        var icon3 = document.createElement('i'); icon3.className = 'bkbg-per-list-icon'; icon3.style.color = o.benefitIconColor; icon3.textContent = '✓';
                        li.appendChild(icon3); li.appendChild(document.createTextNode(b));
                        benUl.appendChild(li);
                    });
                    card.appendChild(benUl);
                }

                grid.appendChild(card);
            });

            inner.appendChild(grid);
            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
