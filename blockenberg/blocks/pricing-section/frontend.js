(function () {
    function init() {
        document.querySelectorAll('.bkbg-ps-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                plans: [],
                showToggle: true,
                toggleLabelMonthly: 'Monthly',
                toggleLabelYearly: 'Yearly',
                savingsBadge: 'Save 25%',
                showSavingsBadge: true,
                defaultYearly: false,
                sectionHeading: '',
                showSectionHeading: true,
                sectionSubtext: '',
                showSectionSubtext: true,
                headingTag: 'h2',
                columns: 3,
                gap: 24,
                maxWidth: 1100,
                containerPadding: 48,
                cardRadius: 16,
                cardPadding: 32,
                cardStyle: 'elevated',
                showEyebrow: true,
                showDescription: true,
                showFeatures: true,
                includedIcon: '✓',
                notIncludedIcon: '✗',
                currencySymbol: '$',
                nameSize: 20,
                priceSize: 48,
                descSize: 14,
                featureSize: 14,
                containerBg: '',
                cardBg: '#ffffff',
                popularBg: '#6366f1',
                nameColor: '#111827',
                priceColor: '#111827',
                periodColor: '#6b7280',
                descColor: '#6b7280',
                featureColor: '#374151',
                featureMissingColor: '#d1d5db',
                includedIconColor: '#10b981',
                popularNameColor: '#ffffff',
                popularPriceColor: '#ffffff',
                popularBadgeBg: 'rgba(255,255,255,0.2)',
                popularBadgeColor: '#ffffff',
                toggleBg: '#f3f4f6',
                toggleActiveBg: '#6366f1',
                toggleActiveColor: '#ffffff',
                toggleInactiveColor: '#6b7280',
                headingColor: '#111827',
                subtextColor: '#6b7280',
                savingsBadgeBg: '#dcfce7',
                savingsBadgeColor: '#166534',
            }, opts);

            var _typoKeys = {
                headingTypo: '--bkbg-ps-hd-',
                subtextTypo: '--bkbg-ps-st-',
                nameTypo:    '--bkbg-ps-nm-',
                priceTypo:   '--bkbg-ps-pr-',
                descTypo:    '--bkbg-ps-ds-',
                featureTypo: '--bkbg-ps-ft-'
            };
            function typoCssVarsForEl(el) {
                Object.keys(_typoKeys).forEach(function (attr) {
                    var t = o[attr]; if (!t || typeof t !== 'object') return;
                    var p = _typoKeys[attr];
                    if (t.family)                el.style.setProperty(p + 'font-family', t.family);
                    if (t.weight)                el.style.setProperty(p + 'font-weight', t.weight);
                    if (t.transform)             el.style.setProperty(p + 'text-transform', t.transform);
                    if (t.style)                 el.style.setProperty(p + 'font-style', t.style);
                    if (t.decoration)            el.style.setProperty(p + 'text-decoration', t.decoration);
                    if (t.sizeDesktop)           el.style.setProperty(p + 'font-size-d', t.sizeDesktop + (t.sizeUnit || 'px'));
                    if (t.sizeTablet)            el.style.setProperty(p + 'font-size-t', t.sizeTablet + (t.sizeUnit || 'px'));
                    if (t.sizeMobile)            el.style.setProperty(p + 'font-size-m', t.sizeMobile + (t.sizeUnit || 'px'));
                    if (t.lineHeightDesktop)     el.style.setProperty(p + 'line-height-d', t.lineHeightDesktop + (t.lineHeightUnit || ''));
                    if (t.lineHeightTablet)      el.style.setProperty(p + 'line-height-t', t.lineHeightTablet + (t.lineHeightUnit || ''));
                    if (t.lineHeightMobile)      el.style.setProperty(p + 'line-height-m', t.lineHeightMobile + (t.lineHeightUnit || ''));
                    if (t.letterSpacingDesktop)  el.style.setProperty(p + 'letter-spacing-d', t.letterSpacingDesktop + (t.letterSpacingUnit || 'px'));
                    if (t.letterSpacingTablet)   el.style.setProperty(p + 'letter-spacing-t', t.letterSpacingTablet + (t.letterSpacingUnit || 'px'));
                    if (t.letterSpacingMobile)   el.style.setProperty(p + 'letter-spacing-m', t.letterSpacingMobile + (t.letterSpacingUnit || 'px'));
                    if (t.wordSpacingDesktop)    el.style.setProperty(p + 'word-spacing-d', t.wordSpacingDesktop + (t.wordSpacingUnit || 'px'));
                    if (t.wordSpacingTablet)     el.style.setProperty(p + 'word-spacing-t', t.wordSpacingTablet + (t.wordSpacingUnit || 'px'));
                    if (t.wordSpacingMobile)     el.style.setProperty(p + 'word-spacing-m', t.wordSpacingMobile + (t.wordSpacingUnit || 'px'));
                });
            }

            if (!o.plans || !o.plans.length) return;

            var isYearly = o.defaultYearly;

            // Root wrapper
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-ps-wrap';
            if (o.containerBg) wrap.style.background = o.containerBg;
            wrap.style.paddingTop = o.containerPadding + 'px';
            wrap.style.paddingBottom = o.containerPadding + 'px';

            var inner = document.createElement('div');
            inner.className = 'bkbg-ps-inner';
            inner.style.maxWidth = o.maxWidth + 'px';
            wrap.appendChild(inner);

            // Header
            var showHeader = o.showSectionHeading || o.showSectionSubtext || o.showToggle;
            var header = null;
            if (showHeader) {
                header = document.createElement('div');
                header.className = 'bkbg-ps-header';

                if (o.showSectionHeading && o.sectionHeading) {
                    var heading = document.createElement(o.headingTag || 'h2');
                    heading.className = 'bkbg-ps-heading';
                    heading.style.color = o.headingColor;
                    heading.textContent = o.sectionHeading;
                    header.appendChild(heading);
                }

                if (o.showSectionSubtext && o.sectionSubtext) {
                    var sub = document.createElement('p');
                    sub.className = 'bkbg-ps-subtext';
                    sub.style.color = o.subtextColor;
                    sub.textContent = o.sectionSubtext;
                    header.appendChild(sub);
                }

                if (o.showToggle) {
                    var toggleWrap = document.createElement('div');
                    toggleWrap.className = 'bkbg-ps-toggle-wrap';
                    toggleWrap.style.background = o.toggleBg;

                    var btnMonthly = document.createElement('button');
                    var btnYearly = document.createElement('button');
                    btnMonthly.className = 'bkbg-ps-toggle-btn';
                    btnYearly.className = 'bkbg-ps-toggle-btn';
                    btnMonthly.textContent = o.toggleLabelMonthly;

                    // Yearly button with optional savings badge
                    btnYearly.textContent = o.toggleLabelYearly;
                    if (o.showSavingsBadge && o.savingsBadge) {
                        var badge = document.createElement('span');
                        badge.className = 'bkbg-ps-savings-badge';
                        badge.style.background = o.savingsBadgeBg;
                        badge.style.color = o.savingsBadgeColor;
                        badge.textContent = o.savingsBadge;
                        btnYearly.appendChild(badge);
                    }

                    function applyToggleStyles() {
                        btnMonthly.style.background = !isYearly ? o.toggleActiveBg : 'transparent';
                        btnMonthly.style.color = !isYearly ? o.toggleActiveColor : o.toggleInactiveColor;
                        btnYearly.style.background = isYearly ? o.toggleActiveBg : 'transparent';
                        btnYearly.style.color = isYearly ? o.toggleActiveColor : o.toggleInactiveColor;
                    }

                    applyToggleStyles();

                    btnMonthly.addEventListener('click', function () {
                        if (isYearly) { isYearly = false; applyToggleStyles(); updatePrices(); }
                    });
                    btnYearly.addEventListener('click', function () {
                        if (!isYearly) { isYearly = true; applyToggleStyles(); updatePrices(); }
                    });

                    toggleWrap.appendChild(btnMonthly);
                    toggleWrap.appendChild(btnYearly);
                    header.appendChild(toggleWrap);
                }

                inner.appendChild(header);
            }

            // Plans grid
            var grid = document.createElement('div');
            grid.className = 'bkbg-ps-grid';
            grid.style.gridTemplateColumns = 'repeat(' + Math.min(o.columns, o.plans.length) + ', 1fr)';
            grid.style.gap = o.gap + 'px';
            inner.appendChild(grid);

            // Price els for toggle update
            var priceEls = [];
            var periodEls = [];

            o.plans.forEach(function (plan, i) {
                var isPopular = plan.isPopular;
                var cardBg = isPopular ? o.popularBg : o.cardBg;
                var nameColor = isPopular ? o.popularNameColor : o.nameColor;
                var priceColor = isPopular ? o.popularPriceColor : o.priceColor;
                var descColor = isPopular ? 'rgba(255,255,255,0.75)' : o.descColor;
                var featureColor = isPopular ? 'rgba(255,255,255,0.9)' : o.featureColor;
                var missingColor = isPopular ? 'rgba(255,255,255,0.3)' : o.featureMissingColor;
                var periodColor = isPopular ? 'rgba(255,255,255,0.6)' : o.periodColor;
                var dividerColor = isPopular ? 'rgba(255,255,255,0.15)' : '#f3f4f6';

                var card = document.createElement('div');
                card.className = 'bkbg-ps-card style-' + o.cardStyle + (isPopular ? ' is-popular' : '');
                card.style.background = cardBg;
                card.style.borderRadius = o.cardRadius + 'px';
                card.style.padding = o.cardPadding + 'px';

                // Popular badge
                if (isPopular && o.showEyebrow) {
                    var popBadge = document.createElement('div');
                    popBadge.className = 'bkbg-ps-popular-badge';
                    popBadge.style.background = o.popularBadgeBg;
                    popBadge.style.color = o.popularBadgeColor;
                    popBadge.textContent = plan.popularLabel || 'Most Popular';
                    card.appendChild(popBadge);
                } else if (!isPopular && o.showEyebrow && plan.eyebrow) {
                    var eyebrow = document.createElement('div');
                    eyebrow.className = 'bkbg-ps-eyebrow';
                    eyebrow.style.color = o.periodColor;
                    eyebrow.textContent = plan.eyebrow;
                    card.appendChild(eyebrow);
                }

                // Name
                var nameEl = document.createElement('div');
                nameEl.className = 'bkbg-ps-name';
                nameEl.style.color = nameColor;
                nameEl.textContent = plan.name;
                card.appendChild(nameEl);

                // Price row
                var priceRow = document.createElement('div');
                priceRow.className = 'bkbg-ps-price-row';

                var currencyEl = document.createElement('span');
                currencyEl.className = 'bkbg-ps-currency';
                currencyEl.style.color = priceColor;
                currencyEl.textContent = o.currencySymbol;

                var priceEl = document.createElement('span');
                priceEl.className = 'bkbg-ps-price';
                priceEl.style.color = priceColor;
                priceEl.textContent = isYearly ? plan.priceYearly : plan.price;
                priceEls.push({ el: priceEl, plan: plan });

                var periodEl = document.createElement('span');
                periodEl.className = 'bkbg-ps-period';
                periodEl.style.color = periodColor;
                periodEl.textContent = isYearly ? plan.yearlyPeriod : plan.period;
                periodEls.push({ el: periodEl, plan: plan });

                priceRow.appendChild(currencyEl);
                priceRow.appendChild(priceEl);
                priceRow.appendChild(periodEl);
                card.appendChild(priceRow);

                // Description
                if (o.showDescription && plan.description) {
                    var desc = document.createElement('p');
                    desc.className = 'bkbg-ps-desc';
                    desc.style.color = descColor;
                    desc.textContent = plan.description;
                    card.appendChild(desc);
                }

                // CTA
                var ctaEl = document.createElement('a');
                ctaEl.className = 'bkbg-ps-cta style-' + (plan.ctaStyle || 'filled');
                ctaEl.href = plan.ctaUrl || '#';
                ctaEl.textContent = plan.ctaLabel || 'Get started';

                var ctaBg = 'transparent';
                var ctaColor = o.popularBg;
                var ctaBorder = 'none';

                if (plan.ctaStyle === 'filled') {
                    ctaBg = isPopular ? '#ffffff' : o.popularBg;
                    ctaColor = isPopular ? o.popularBg : '#ffffff';
                } else if (plan.ctaStyle === 'outline') {
                    ctaBorder = '2px solid ' + (isPopular ? 'rgba(255,255,255,0.5)' : o.popularBg);
                    ctaColor = isPopular ? '#ffffff' : o.popularBg;
                } else if (plan.ctaStyle === 'subtle') {
                    ctaBg = isPopular ? 'rgba(255,255,255,0.15)' : o.popularBg + '18';
                    ctaColor = isPopular ? '#ffffff' : o.popularBg;
                } else if (plan.ctaStyle === 'link') {
                    ctaColor = isPopular ? '#ffffff' : o.popularBg;
                }

                ctaEl.style.background = ctaBg;
                ctaEl.style.color = ctaColor;
                ctaEl.style.border = ctaBorder;

                card.appendChild(ctaEl);

                // Features
                if (o.showFeatures && plan.features && plan.features.length) {
                    var divider = document.createElement('div');
                    divider.className = 'bkbg-ps-divider';
                    divider.style.background = dividerColor;
                    card.appendChild(divider);

                    var featList = document.createElement('div');
                    featList.className = 'bkbg-ps-features';

                    plan.features.forEach(function (feat) {
                        var featRow = document.createElement('div');
                        featRow.className = 'bkbg-ps-feature';

                        var iconEl = document.createElement('span');
                        iconEl.className = 'bkbg-ps-feat-icon';
                        iconEl.style.color = feat.included ? o.includedIconColor : missingColor;
                        var _IP = window.bkbgIconPicker;
                        var _it = feat.included ? (o.includedIconType || 'custom-char') : (o.notIncludedIconType || 'custom-char');
                        var _ic = feat.included ? o.includedIcon : o.notIncludedIcon;
                        var _id = feat.included ? o.includedIconDashicon : o.notIncludedIconDashicon;
                        var _iu = feat.included ? o.includedIconImageUrl : o.notIncludedIconImageUrl;
                        var _idc = feat.included ? o.includedIconDashiconColor : o.notIncludedIconDashiconColor;
                        if (_IP && _it !== 'custom-char') {
                            var _in = _IP.buildFrontendIcon(_it, _ic, _id, _iu, _idc);
                            if (_in) iconEl.appendChild(_in);
                            else iconEl.textContent = _ic;
                        } else {
                            iconEl.textContent = _ic;
                        }

                        var textEl = document.createElement('span');
                        textEl.className = 'bkbg-ps-feat-text';
                        textEl.style.color = feat.included ? featureColor : missingColor;
                        textEl.textContent = feat.text;

                        featRow.appendChild(iconEl);
                        featRow.appendChild(textEl);
                        featList.appendChild(featRow);
                    });

                    card.appendChild(featList);
                }

                grid.appendChild(card);
            });

            // Price update on toggle
            function updatePrices() {
                priceEls.forEach(function (item) {
                    item.el.textContent = isYearly ? item.plan.priceYearly : item.plan.price;
                });
                periodEls.forEach(function (item) {
                    item.el.textContent = isYearly ? item.plan.yearlyPeriod : item.plan.period;
                });
            }

            appEl.parentNode.insertBefore(wrap, appEl);
            typoCssVarsForEl(wrap);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
