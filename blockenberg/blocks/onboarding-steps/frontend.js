(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }
    function init() {
        document.querySelectorAll('.bkbg-obs-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Get Started',
                heading: 'Up and Running in Minutes',
                subtext: 'Follow these simple steps to get set up and start seeing results.',
                steps: [
                    { number: '01', icon: '🔑', title: 'Create Your Account', description: 'Sign up in under 60 seconds — no credit card required.', ctaLabel: 'Sign Up Free', ctaUrl: '#' },
                    { number: '02', icon: '⚙️', title: 'Configure Your Settings', description: 'Customize the platform to match your workflow.', ctaLabel: '', ctaUrl: '' },
                    { number: '03', icon: '🚀', title: 'Launch and Grow', description: 'Go live with confidence. Our team is here to support you.', ctaLabel: 'View Docs', ctaUrl: '#' }
                ],
                layout: 'horizontal',
                showNumbers: true,
                showIcons: true,
                showStepCtas: false,
                connectorStyle: 'line',
                mainCtaLabel: 'Start for Free',
                mainCtaUrl: '#',
                showMainCta: true,
                bgColor: '#ffffff',
                headingColor: '#111827',
                subColor: '#6b7280',
                eyebrowColor: '#6366f1',
                stepNumBg: '#6366f1',
                stepNumColor: '#ffffff',
                stepTitleColor: '#111827',
                stepDescColor: '#6b7280',
                connectorColor: '#e5e7eb',
                cardBg: '#f9fafb',
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                accentColor: '#6366f1',
                maxWidth: 1000,
                paddingTop: 80,
                paddingBottom: 80
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-obs-wrap bkbg-obs-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            typoCssVarsForEl(inner, o.headingTypo, '--bkbg-obs-hd-');
            typoCssVarsForEl(inner, o.subtextTypo, '--bkbg-obs-st-');
            typoCssVarsForEl(inner, o.eyebrowTypo, '--bkbg-obs-ey-');
            typoCssVarsForEl(inner, o.stepTitleTypo, '--bkbg-obs-stt-');
            typoCssVarsForEl(inner, o.stepDescTypo, '--bkbg-obs-sd-');

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-obs-header';

            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-obs-eyebrow';
            eyebrow.style.color = o.eyebrowColor;
            eyebrow.innerHTML = o.eyebrow;

            var heading = document.createElement('h2');
            heading.className = 'bkbg-obs-heading';
            heading.style.color = o.headingColor;
            heading.innerHTML = o.heading;

            var sub = document.createElement('p');
            sub.className = 'bkbg-obs-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;

            header.appendChild(eyebrow);
            header.appendChild(heading);
            header.appendChild(sub);
            inner.appendChild(header);

            /* Grid */
            var cols = (o.steps || []).length || 3;
            var grid = document.createElement('div');
            grid.className = 'bkbg-obs-grid layout-' + o.layout + ' connector-' + o.connectorStyle;

            if (o.layout === 'horizontal' || o.layout === 'cards') {
                grid.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
            }

            if (o.connectorStyle === 'line' && o.layout === 'horizontal') {
                grid.style.setProperty('--steps', String(cols));
                /* visual connector injected via CSS, but we can also inline it */
                var pseudoHint = grid; /* CSS handles ::before */
            }

            (o.steps || []).forEach(function (step) {
                var card = document.createElement('div');
                card.className = 'bkbg-obs-step-card';
                card.style.background = o.cardBg;

                /* Top: number + icon */
                var top = document.createElement('div');
                top.className = 'bkbg-obs-step-top';

                if (o.showNumbers) {
                    var num = document.createElement('span');
                    num.className = 'bkbg-obs-step-num';
                    num.style.cssText = 'background:' + o.stepNumBg + ';color:' + o.stepNumColor;
                    num.textContent = step.number;
                    top.appendChild(num);
                }

                if (o.showIcons) {
                    var icon = document.createElement('span');
                    icon.className = 'bkbg-obs-step-icon';
                    var _IP = window.bkbgIconPicker;
                    var _iType = step.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor);
                        if (_in) icon.appendChild(_in); else icon.textContent = step.icon || '';
                    } else { icon.textContent = step.icon || ''; }
                    if (icon.textContent || icon.childNodes.length) top.appendChild(icon);
                }

                card.appendChild(top);

                var body = document.createElement('div');

                var title = document.createElement('div');
                title.className = 'bkbg-obs-step-title';
                title.style.color = o.stepTitleColor;
                title.textContent = step.title;

                var desc = document.createElement('div');
                desc.className = 'bkbg-obs-step-desc';
                desc.style.color = o.stepDescColor;
                desc.textContent = step.description;

                body.appendChild(title);
                body.appendChild(desc);

                if (o.showStepCtas && step.ctaLabel && step.ctaUrl) {
                    var stepCta = document.createElement('a');
                    stepCta.className = 'bkbg-obs-step-cta';
                    stepCta.href = step.ctaUrl;
                    stepCta.style.color = o.accentColor;
                    stepCta.textContent = step.ctaLabel;
                    body.appendChild(stepCta);
                }

                card.appendChild(body);
                grid.appendChild(card);

                /* Connector line styling via ::before relies on CSS variable */
                if (o.connectorStyle === 'line') {
                    grid.style.setProperty('--connector-color', o.connectorColor);
                }
            });

            inner.appendChild(grid);

            /* Main CTA */
            if (o.showMainCta && o.mainCtaLabel) {
                var ctaWrap = document.createElement('div');
                ctaWrap.className = 'bkbg-obs-main-cta-wrap';

                var cta = document.createElement('a');
                cta.className = 'bkbg-obs-main-cta';
                cta.href = o.mainCtaUrl;
                cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                cta.textContent = o.mainCtaLabel;
                ctaWrap.appendChild(cta);
                inner.appendChild(ctaWrap);
            }

            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
