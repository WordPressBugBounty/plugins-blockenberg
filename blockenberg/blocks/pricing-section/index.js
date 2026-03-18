( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var IP = function () { return window.bkbgIconPicker; };

    var CARD_STYLE_OPTIONS = [
        { label: 'Elevated (shadow)', value: 'elevated' },
        { label: 'Flat',              value: 'flat' },
        { label: 'Bordered',          value: 'bordered' },
        { label: 'Ghost',             value: 'ghost' },
    ];
    var CTA_STYLE_OPTIONS = [
        { label: 'Filled',   value: 'filled' },
        { label: 'Outline',  value: 'outline' },
        { label: 'Subtle',   value: 'subtle' },
        { label: 'Link',     value: 'link' },
    ];
    var TAG_OPTIONS = [
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
        { label: 'p',  value: 'p' },
    ];

    function updatePlan(plans, idx, field, val) {
        return plans.map(function (p, i) {
            if (i !== idx) return p;
            var up = {}; up[field] = val;
            return Object.assign({}, p, up);
        });
    }

    function updateFeature(plans, planIdx, featIdx, field, val) {
        return plans.map(function (p, pi) {
            if (pi !== planIdx) return p;
            var feats = p.features.map(function (f, fi) {
                if (fi !== featIdx) return f;
                var uf = {}; uf[field] = val;
                return Object.assign({}, f, uf);
            });
            return Object.assign({}, p, { features: feats });
        });
    }

    registerBlockType('blockenberg/pricing-section', {
        title: __('Pricing Section', 'blockenberg'),
        icon: 'money-alt',
        category: 'bkbg-marketing',
        description: __('Multi-tier pricing section with monthly/yearly toggle, feature rows, popular badge, and per-plan CTAs.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var yearlyState = useState(a.defaultYearly);
            var isYearly = yearlyState[0];
            var setIsYearly = yearlyState[1];
            var activePlanState = useState(0);
            var activePlan = activePlanState[0];
            var setActivePlan = activePlanState[1];

            var blockProps = useBlockProps({
                style: { background: a.containerBg || '', padding: a.containerPadding + 'px 0' }
            });

            function addPlan() {
                var newPlan = {
                    name: 'New Plan', eyebrow: 'For everyone',
                    price: '19', priceYearly: '14',
                    period: '/month', yearlyPeriod: '/month, billed yearly',
                    description: 'A great plan for everyone.',
                    isPopular: false, popularLabel: 'Most Popular',
                    ctaLabel: 'Get started', ctaUrl: '#', ctaStyle: 'outline',
                    accentColor: '#6366f1',
                    features: [
                        { text: 'Feature one', included: true },
                        { text: 'Feature two', included: false },
                    ]
                };
                set({ plans: a.plans.concat([newPlan]) });
            }

            function removePlan(i) {
                if (a.plans.length <= 1) return;
                set({ plans: a.plans.filter(function (_, idx) { return idx !== i; }) });
                setActivePlan(Math.max(0, activePlan - 1));
            }

            function addFeature(planIdx) {
                var plans = a.plans.map(function (p, i) {
                    if (i !== planIdx) return p;
                    return Object.assign({}, p, { features: p.features.concat([{ text: 'New feature', included: true }]) });
                });
                set({ plans: plans });
            }

            function removeFeature(planIdx, featIdx) {
                var plans = a.plans.map(function (p, i) {
                    if (i !== planIdx) return p;
                    return Object.assign({}, p, { features: p.features.filter(function (_, fi) { return fi !== featIdx; }) });
                });
                set({ plans: plans });
            }

            // Render a plan card preview
            function renderPlan(plan, i) {
                var isPopular = plan.isPopular;
                var cardBg = isPopular ? a.popularBg : a.cardBg;
                var nameColor = isPopular ? a.popularNameColor : a.nameColor;
                var priceColor = isPopular ? a.popularPriceColor : a.priceColor;
                var descColor = isPopular ? 'rgba(255,255,255,0.75)' : a.descColor;
                var featureColor = isPopular ? 'rgba(255,255,255,0.9)' : a.featureColor;
                var missingColor = isPopular ? 'rgba(255,255,255,0.3)' : a.featureMissingColor;
                var borderStyle = {};
                if (a.cardStyle === 'bordered') {
                    borderStyle.border = '2px solid ' + (isPopular ? a.popularBg : '#e5e7eb');
                } else if (a.cardStyle === 'elevated') {
                    borderStyle.boxShadow = isPopular
                        ? '0 20px 60px rgba(99,102,241,0.3)'
                        : '0 4px 24px rgba(0,0,0,0.08)';
                }
                var ctaBg = plan.ctaStyle === 'filled'
                    ? (isPopular ? '#ffffff' : a.popularBg)
                    : 'transparent';
                var ctaColor = plan.ctaStyle === 'filled'
                    ? (isPopular ? a.popularBg : '#ffffff')
                    : (isPopular ? '#ffffff' : a.popularBg);
                var ctaBorder = plan.ctaStyle === 'outline' || plan.ctaStyle === 'link'
                    ? (isPopular ? '2px solid rgba(255,255,255,0.5)' : '2px solid ' + a.popularBg)
                    : 'none';

                return el('div', {
                    key: i,
                    onClick: function () { setActivePlan(i); },
                    style: Object.assign({
                        background: cardBg,
                        borderRadius: a.cardRadius + 'px',
                        padding: a.cardPadding + 'px',
                        cursor: 'pointer',
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        outline: i === activePlan ? '2px solid #fbbf24' : 'none',
                        outlineOffset: 2,
                        position: 'relative',
                    }, borderStyle),
                },

                    // Popular badge
                    isPopular && a.showEyebrow && el('div', {
                        style: {
                            display: 'inline-block',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            padding: '4px 12px',
                            borderRadius: 999,
                            background: a.popularBadgeBg,
                            color: a.popularBadgeColor,
                            alignSelf: 'flex-start',
                        }
                    }, plan.popularLabel),

                    // Eyebrow (non-popular)
                    !isPopular && a.showEyebrow && el('div', {
                        style: { fontSize: 12, fontWeight: 600, color: a.periodColor, textTransform: 'uppercase', letterSpacing: '0.05em' }
                    }, plan.eyebrow),

                    // Name
                    el('div', { style: { color: nameColor } }, plan.name),

                    // Price
                    el('div', { style: { display: 'flex', alignItems: 'baseline', gap: 2 } },
                        el('span', { style: { fontSize: 22, fontWeight: 500, color: priceColor, opacity: 0.7 } }, a.currencySymbol),
                        el('span', { style: { color: priceColor, lineHeight: 1 } },
                            isYearly ? plan.priceYearly : plan.price
                        ),
                        el('span', { style: { fontSize: 13, color: isPopular ? 'rgba(255,255,255,0.6)' : a.periodColor, marginLeft: 4 } },
                            isYearly ? plan.yearlyPeriod : plan.period
                        )
                    ),

                    // Description
                    a.showDescription && el('p', {
                        style: { margin: 0, color: descColor, lineHeight: 1.6 }
                    }, plan.description),

                    // CTA
                    el('div', {
                        style: {
                            padding: '11px 20px',
                            borderRadius: 8,
                            background: ctaBg,
                            color: ctaColor,
                            border: ctaBorder,
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                        }
                    }, plan.ctaLabel),

                    // Features
                    a.showFeatures && el('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 } },
                        el('div', { style: { width: '100%', height: 1, background: isPopular ? 'rgba(255,255,255,0.15)' : '#f3f4f6' } }),
                        plan.features.map(function (feat, fi) {
                            return el('div', {
                                key: fi,
                                style: { display: 'flex', alignItems: 'center', gap: 10 }
                            },
                                el('span', {
                                    style: {
                                        fontWeight: 700,
                                        color: feat.included ? a.includedIconColor : missingColor,
                                        flexShrink: 0,
                                        fontSize: 16,
                                    }
                                }, (function() {
                                    var _t = feat.included ? (a.includedIconType || 'custom-char') : (a.notIncludedIconType || 'custom-char');
                                    var _c = feat.included ? a.includedIcon : a.notIncludedIcon;
                                    var _d = feat.included ? a.includedIconDashicon : a.notIncludedIconDashicon;
                                    var _u = feat.included ? a.includedIconImageUrl : a.notIncludedIconImageUrl;
                                    var _dc = feat.included ? a.includedIconDashiconColor : a.notIncludedIconDashiconColor;
                                    return _t !== 'custom-char' ? IP().buildEditorIcon(_t, _c, _d, _u, _dc) : _c;
                                })()),
                                el('span', {
                                    style: { color: feat.included ? featureColor : missingColor }
                                }, feat.text)
                            );
                        })
                    )
                );
            }

            var plan = a.plans[activePlan] || a.plans[0];

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Section heading panel
                    el(PanelBody, { title: 'Section Header', initialOpen: true },
                        el(ToggleControl, {
                            label: 'Show heading',
                            checked: a.showSectionHeading,
                            onChange: function (v) { set({ showSectionHeading: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showSectionHeading && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Heading text',
                                value: a.sectionHeading,
                                onChange: function (v) { set({ sectionHeading: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            el('div', { style: { height: 8 } }),
                            el(SelectControl, {
                                label: 'Heading tag',
                                value: a.headingTag,
                                options: TAG_OPTIONS,
                                onChange: function (v) { set({ headingTag: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Show sub-text',
                            checked: a.showSectionSubtext,
                            onChange: function (v) { set({ showSectionSubtext: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showSectionSubtext && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            el(TextControl, {
                                label: 'Sub-text',
                                value: a.sectionSubtext,
                                onChange: function (v) { set({ sectionSubtext: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Toggle panel
                    el(PanelBody, { title: 'Billing Toggle', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show monthly/yearly toggle',
                            checked: a.showToggle,
                            onChange: function (v) { set({ showToggle: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Monthly label', value: a.toggleLabelMonthly, onChange: function (v) { set({ toggleLabelMonthly: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Yearly label', value: a.toggleLabelYearly, onChange: function (v) { set({ toggleLabelYearly: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Show savings badge',
                            checked: a.showSavingsBadge,
                            onChange: function (v) { set({ showSavingsBadge: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showSavingsBadge && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            el(TextControl, { label: 'Savings badge text', value: a.savingsBadge, onChange: function (v) { set({ savingsBadge: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, {
                            label: 'Default to yearly view',
                            checked: a.defaultYearly,
                            onChange: function (v) { set({ defaultYearly: v }); setIsYearly(v); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Plans panel
                    el(PanelBody, { title: 'Plans (' + a.plans.length + ')', initialOpen: false },
                        a.plans.map(function (plan, i) {
                            return el('div', {
                                key: i,
                                style: {
                                    border: i === activePlan ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                    borderRadius: 8, padding: 10, marginBottom: 8,
                                    background: i === activePlan ? '#f5f3ff' : '#fff',
                                }
                            },
                                el('div', {
                                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
                                    onClick: function () { setActivePlan(i); }
                                },
                                    el('strong', { style: { fontSize: 13 } }, plan.name + (plan.isPopular ? ' ⭐' : '')),
                                    el('div', { style: { display: 'flex', gap: 4 } },
                                        el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function (e) { e.stopPropagation(); removePlan(i); }, __nextHasNoMarginBottom: true }, '✕')
                                    )
                                ),
                                i === activePlan && el(Fragment, null,
                                    el('div', { style: { height: 8 } }),
                                    el(TextControl, { label: 'Plan name', value: plan.name, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Eyebrow', value: plan.eyebrow, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'eyebrow', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Description', value: plan.description, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Monthly price (number only)', value: plan.price, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'price', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Yearly price (number only)', value: plan.priceYearly, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'priceYearly', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Period label (monthly)', value: plan.period, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'period', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Period label (yearly)', value: plan.yearlyPeriod, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'yearlyPeriod', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'CTA label', value: plan.ctaLabel, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'ctaLabel', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'CTA URL', value: plan.ctaUrl, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'ctaUrl', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(SelectControl, { label: 'CTA style', value: plan.ctaStyle, options: CTA_STYLE_OPTIONS, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'ctaStyle', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(ToggleControl, { label: 'Mark as popular', checked: plan.isPopular, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'isPopular', v) }); }, __nextHasNoMarginBottom: true }),
                                    plan.isPopular && el(Fragment, null,
                                        el('div', { style: { height: 6 } }),
                                        el(TextControl, { label: 'Popular badge text', value: plan.popularLabel, onChange: function (v) { set({ plans: updatePlan(a.plans, i, 'popularLabel', v) }); }, __nextHasNoMarginBottom: true })
                                    ),
                                    el('div', { style: { marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 12, color: '#374151' } }, 'Features'),
                                    plan.features.map(function (feat, fi) {
                                        return el('div', { key: fi, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                            el(TextControl, { value: feat.text, onChange: function (v) { set({ plans: updateFeature(a.plans, i, fi, 'text', v) }); }, __nextHasNoMarginBottom: true, style: { flex: 1 } }),
                                            el(Button, {
                                                variant: feat.included ? 'primary' : 'secondary',
                                                size: 'small',
                                                onClick: function () { set({ plans: updateFeature(a.plans, i, fi, 'included', !feat.included) }); },
                                                __nextHasNoMarginBottom: true,
                                            }, feat.included ? '✓' : '✗'),
                                            el(Button, { isDestructive: true, variant: 'tertiary', size: 'small', onClick: function () { removeFeature(i, fi); }, __nextHasNoMarginBottom: true }, '✕')
                                        );
                                    }),
                                    el(Button, { variant: 'secondary', size: 'small', onClick: function () { addFeature(i); }, style: { width: '100%', justifyContent: 'center', marginTop: 4 }, __nextHasNoMarginBottom: true }, '+ Add Feature')
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', onClick: addPlan, style: { width: '100%', justifyContent: 'center', marginTop: 8 }, __nextHasNoMarginBottom: true }, '+ Add Plan')
                    ),

                    // Layout panel
                    el(PanelBody, { title: 'Layout & Cards', initialOpen: false },
                        el(RangeControl, { label: 'Columns', value: a.columns, min: 1, max: 4, onChange: function (v) { set({ columns: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Gap (px)', value: a.gap, min: 0, max: 60, onChange: function (v) { set({ gap: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 600, max: 1600, step: 50, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Container padding (px)', value: a.containerPadding, min: 0, max: 120, onChange: function (v) { set({ containerPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Card style', value: a.cardStyle, options: CARD_STYLE_OPTIONS, onChange: function (v) { set({ cardStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card border radius (px)', value: a.cardRadius, min: 0, max: 32, onChange: function (v) { set({ cardRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Card padding (px)', value: a.cardPadding, min: 16, max: 64, onChange: function (v) { set({ cardPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(TextControl, { label: 'Currency symbol', value: a.currencySymbol, onChange: function (v) { set({ currencySymbol: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show eyebrow', checked: a.showEyebrow, onChange: function (v) { set({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 6 } }),
                        el(ToggleControl, { label: 'Show description', checked: a.showDescription, onChange: function (v) { set({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 6 } }),
                        el(ToggleControl, { label: 'Show feature list', checked: a.showFeatures, onChange: function (v) { set({ showFeatures: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, set, { charAttr: 'includedIcon', typeAttr: 'includedIconType', dashiconAttr: 'includedIconDashicon', imageUrlAttr: 'includedIconImageUrl', colorAttr: 'includedIconDashiconColor' })),
                        el('div', { style: { height: 6 } }),
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, set, { charAttr: 'notIncludedIcon', typeAttr: 'notIncludedIconType', dashiconAttr: 'notIncludedIconDashicon', imageUrlAttr: 'notIncludedIconImageUrl', colorAttr: 'notIncludedIconDashiconColor' }))
                    ),

                    // Typography panel
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading…');
                            return el(Fragment, null,
                                el(TC, { label: __('Section Heading', 'blockenberg'), value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                                el(TC, { label: __('Subtext', 'blockenberg'), value: a.subtextTypo, onChange: function (v) { set({ subtextTypo: v }); } }),
                                el(TC, { label: __('Plan Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { set({ nameTypo: v }); } }),
                                el(TC, { label: __('Price', 'blockenberg'), value: a.priceTypo, onChange: function (v) { set({ priceTypo: v }); } }),
                                el(TC, { label: __('Description', 'blockenberg'), value: a.descTypo, onChange: function (v) { set({ descTypo: v }); } }),
                                el(TC, { label: __('Feature', 'blockenberg'), value: a.featureTypo, onChange: function (v) { set({ featureTypo: v }); } })
                            );
                        })()
                    ),

                    // Colors panel
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Container Background', value: a.containerBg, onChange: function (v) { set({ containerBg: v || '' }); } },
                            { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Popular Plan Background', value: a.popularBg, onChange: function (v) { set({ popularBg: v || '#6366f1' }); } },
                            { label: 'Plan Name Color', value: a.nameColor, onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                            { label: 'Price Color', value: a.priceColor, onChange: function (v) { set({ priceColor: v || '#111827' }); } },
                            { label: 'Period Color', value: a.periodColor, onChange: function (v) { set({ periodColor: v || '#6b7280' }); } },
                            { label: 'Description Color', value: a.descColor, onChange: function (v) { set({ descColor: v || '#6b7280' }); } },
                            { label: 'Feature Color', value: a.featureColor, onChange: function (v) { set({ featureColor: v || '#374151' }); } },
                            { label: 'Missing Feature Color', value: a.featureMissingColor, onChange: function (v) { set({ featureMissingColor: v || '#d1d5db' }); } },
                            { label: 'Included Icon Color', value: a.includedIconColor, onChange: function (v) { set({ includedIconColor: v || '#10b981' }); } },
                            { label: 'Popular Name Color', value: a.popularNameColor, onChange: function (v) { set({ popularNameColor: v || '#ffffff' }); } },
                            { label: 'Popular Price Color', value: a.popularPriceColor, onChange: function (v) { set({ popularPriceColor: v || '#ffffff' }); } },
                            { label: 'Toggle Active Background', value: a.toggleActiveBg, onChange: function (v) { set({ toggleActiveBg: v || '#6366f1' }); } },
                            { label: 'Heading Color', value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                            { label: 'Subtext Color', value: a.subtextColor, onChange: function (v) { set({ subtextColor: v || '#6b7280' }); } },
                        ]
                    })
                ),

                // Editor preview
                el('div', blockProps,
                    el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' } },
                        // Section heading
                        (a.showSectionHeading || a.showSectionSubtext || a.showToggle) && el('div', {
                            style: { textAlign: 'center', marginBottom: 40 }
                        },
                            a.showSectionHeading && el(a.headingTag || 'h2', {
                                style: { color: a.headingColor, margin: '0 0 12px' }
                            }, a.sectionHeading),
                            a.showSectionSubtext && el('p', {
                                style: { color: a.subtextColor, margin: '0 0 24px' }
                            }, a.sectionSubtext),
                            // Toggle
                            a.showToggle && el('div', {
                                style: { display: 'inline-flex', alignItems: 'center', gap: 12, background: a.toggleBg, borderRadius: 999, padding: '4px 6px' }
                            },
                                el('button', {
                                    onClick: function () { setIsYearly(false); },
                                    style: {
                                        padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                        background: !isYearly ? a.toggleActiveBg : 'transparent',
                                        color: !isYearly ? a.toggleActiveColor : a.toggleInactiveColor,
                                        transition: 'all 0.2s',
                                    }
                                }, a.toggleLabelMonthly),
                                el('button', {
                                    onClick: function () { setIsYearly(true); },
                                    style: {
                                        padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                        background: isYearly ? a.toggleActiveBg : 'transparent',
                                        color: isYearly ? a.toggleActiveColor : a.toggleInactiveColor,
                                        display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                                    }
                                }, a.toggleLabelYearly,
                                    a.showSavingsBadge && el('span', {
                                        style: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: a.savingsBadgeBg, color: a.savingsBadgeColor }
                                    }, a.savingsBadge)
                                )
                            )
                        ),

                        // Plans grid
                        el('div', {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(' + Math.min(a.columns, a.plans.length) + ', 1fr)',
                                gap: a.gap + 'px',
                            }
                        },
                            a.plans.map(function (plan, i) { return renderPlan(plan, i); })
                        ),

                        // Info note
                        el('p', { style: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 16 } },
                            '💡 Click a plan to edit it in the sidebar. Toggle above switches price preview.'
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ps-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
