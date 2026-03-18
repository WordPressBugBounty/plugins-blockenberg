( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment            = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/pricing-slider', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps();

            var _state  = useState(a.initialTier || 1);
            var tierIdx = _state[0];
            var setTier = _state[1];

            var _bill    = useState(false); // false = monthly, true = annual
            var isAnnual = _bill[0];
            var setBill  = _bill[1];

            var tiers   = a.tiers || [];
            var tier    = tiers[Math.min(tierIdx, tiers.length - 1)] || {};
            var disc    = a.annualDiscount || 20;
            var rawPrice = tier.monthlyPrice || 0;
            var price    = isAnnual ? Math.round(rawPrice * (1 - disc / 100)) : rawPrice;

            function updateTier(idx, field, val) {
                var nt = a.tiers.map(function (t, i) {
                    return i === idx ? Object.assign({}, t, { [field]: val }) : t;
                });
                set({ tiers: nt });
            }
            function updateFeatures(idx, featStr) {
                var feats = featStr.split('\n').map(function (f) { return f.trim(); }).filter(Boolean);
                updateTier(idx, 'features', feats);
            }
            function addTier() {
                set({ tiers: a.tiers.concat([{ label: 'New Tier', users: 'Custom', monthlyPrice: 149,
                    features: ['Feature one', 'Feature two'] }]) });
            }
            function removeTier(idx) {
                if (a.tiers.length <= 1) return;
                set({ tiers: a.tiers.filter(function (_, i) { return i !== idx; }) });
            }

            var sectionStyle = {
                background: a.sectionBg || '#f8fafc',
                padding: '60px 32px', textAlign: 'center',
                borderRadius: 12
            };
            var cardStyle = {
                background: a.cardBg || '#ffffff',
                borderRadius: (a.cardRadius || 24) + 'px',
                padding: '40px',
                maxWidth: 480, margin: '0 auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                border: '2px solid ' + (a.accentColor || '#6366f1')
            };

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Pricing Tiers', initialOpen: true },
                        (a.tiers || []).map(function (tier, i) {
                            return el('div', { key: i, style: { marginBottom: 14, padding: 10,
                                background: i === tierIdx ? '#ede9fe' : '#f8fafc',
                                borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el('strong', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 } },
                                    'Tier ' + (i + 1) + ': ' + (tier.label || ''),
                                    el(Button, { isDestructive: true, isSmall: true,
                                        onClick: function () { removeTier(i); } }, '✕')
                                ),
                                el(TextControl, { label: 'Label', value: tier.label || '',
                                    onChange: function (v) { updateTier(i, 'label', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'User count label', value: tier.users || '',
                                    onChange: function (v) { updateTier(i, 'users', v); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Monthly price (number)', value: String(tier.monthlyPrice || 0),
                                    type: 'number',
                                    onChange: function (v) { updateTier(i, 'monthlyPrice', Number(v)); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: 'Features (one per line)',
                                    value: (tier.features || []).join('\n'),
                                    onChange: function (v) { updateFeatures(i, v); },
                                    help: 'One feature per line',
                                    __nextHasNoMarginBottom: true })
                            );
                        }),
                        el(Button, { isPrimary: true, isSmall: true, onClick: addTier, style: { marginTop: 4 } }, '+ Add Tier')
                    ),
                    el(PanelBody, { title: 'Section Settings', initialOpen: false },
                        el(RichText, { tagName: 'p',
                            value: a.heading, onChange: function (v) { set({ heading: v }); },
                            placeholder: 'Section heading', __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show billing toggle', checked: a.showBilling !== false,
                            onChange: function (v) { set({ showBilling: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Annual discount (%)', value: a.annualDiscount || 20,
                            onChange: function (v) { set({ annualDiscount: v }); }, min: 0, max: 60, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Currency symbol', value: a.currency || '$',
                            onChange: function (v) { set({ currency: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Period label', value: a.period || '/month',
                            onChange: function (v) { set({ period: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'CTA button text', value: a.ctaText || '',
                            onChange: function (v) { set({ ctaText: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading\u2026');
                            return el(Fragment, null,
                                el(TC, { label: 'Heading', value: a.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                                el(TC, { label: 'Subheading', value: a.subheadingTypo, onChange: function (v) { set({ subheadingTypo: v }); } }),
                                el(TC, { label: 'Price', value: a.priceTypo, onChange: function (v) { set({ priceTypo: v }); } }),
                                el(TC, { label: 'CTA Button', value: a.ctaTypo, onChange: function (v) { set({ ctaTypo: v }); } }),
                                el(TC, { label: 'Feature', value: a.featureTypo, onChange: function (v) { set({ featureTypo: v }); } })
                            );
                        })(),
                        el(RangeControl, { label: 'Card radius', value: a.cardRadius || 24,
                            onChange: function (v) { set({ cardRadius: v }); }, min: 0, max: 60, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, SelectControl, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Section background', value: a.sectionBg,    onChange: function (v) { set({ sectionBg:    v || '#f8fafc' }); } },
                            { label: 'Card background',    value: a.cardBg,       onChange: function (v) { set({ cardBg:       v || '#ffffff' }); } },
                            { label: 'Heading color',      value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#1e1b4b' }); } },
                            { label: 'Price color',        value: a.priceColor,   onChange: function (v) { set({ priceColor:   v || '#6366f1' }); } },
                            { label: 'Feature text',       value: a.featureColor, onChange: function (v) { set({ featureColor: v || '#374151' }); } },
                            { label: 'Accent / border',    value: a.accentColor,  onChange: function (v) { set({ accentColor:  v || '#6366f1' }); } },
                            { label: 'CTA button bg',      value: a.ctaBg,        onChange: function (v) { set({ ctaBg:        v || '#6366f1' }); } },
                            { label: 'CTA text',           value: a.ctaColor,     onChange: function (v) { set({ ctaColor:     v || '#ffffff' }); } },
                            { label: 'Slider color',       value: a.sliderColor,  onChange: function (v) { set({ sliderColor:  v || '#6366f1' }); } },
                            { label: 'Track background',   value: a.trackBg,      onChange: function (v) { set({ trackBg:      v || '#e5e7eb' }); } },
                            { label: 'Check icon color',   value: a.checkColor,   onChange: function (v) { set({ checkColor:   v || '#6366f1' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),

                // ── Editor preview ──────────────────────────────────
                el('div', { style: sectionStyle },
                    el(RichText, { tagName: 'h2', value: a.heading,
                        onChange: function (v) { set({ heading: v }); },
                        placeholder: 'Section heading…',
                        className: 'bkbg-psl-heading',
                        style: { color: a.headingColor || '#1e1b4b',
                            margin: '0 0 12px' }
                    }),
                    el(RichText, { tagName: 'p', value: a.subheading,
                        onChange: function (v) { set({ subheading: v }); },
                        placeholder: 'Subheading…',
                        className: 'bkbg-psl-subheading',
                        style: { color: '#64748b', margin: '0 0 32px' }
                    }),

                    // Billing toggle
                    a.showBilling !== false && el('div', {
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }
                    },
                        el('span', { style: { fontWeight: isAnnual ? 400 : 700, color: a.headingColor || '#1e1b4b' } }, 'Monthly'),
                        el('div', {
                            onClick: function () { setBill(!isAnnual); },
                            style: {
                                width: 48, height: 26, borderRadius: 13,
                                background: isAnnual ? (a.accentColor || '#6366f1') : '#d1d5db',
                                position: 'relative', cursor: 'pointer', transition: 'background .2s'
                            }
                        },
                            el('div', { style: {
                                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: 3, left: isAnnual ? 25 : 3,
                                transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                            } })
                        ),
                        el('span', { style: { fontWeight: isAnnual ? 700 : 400, color: a.headingColor || '#1e1b4b' } },
                            'Annual ',
                            el('span', { style: { background: '#dcfce7', color: '#16a34a', padding: '2px 8px',
                                borderRadius: 10, fontSize: 12, fontWeight: 600 } },
                                '-' + disc + '%')
                        )
                    ),

                    // Slider
                    el('div', { style: { maxWidth: 480, margin: '0 auto 32px' } },
                        el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
                            (tiers).map(function (t, i) {
                                return el('span', { key: i, style: {
                                    fontSize: 12, fontWeight: i === tierIdx ? 700 : 400,
                                    color: i === tierIdx ? (a.accentColor || '#6366f1') : '#64748b'
                                } }, t.label || '');
                            })
                        ),
                        el('input', {
                            type: 'range', min: 0, max: tiers.length - 1, step: 1, value: tierIdx,
                            onChange: function (e) { setTier(Number(e.target.value)); },
                            style: { width: '100%', accentColor: a.sliderColor || '#6366f1', cursor: 'pointer' }
                        })
                    ),

                    // Pricing card
                    el('div', { style: cardStyle },
                        el('div', { style: { marginBottom: 4, fontSize: 13, fontWeight: 600, color: a.accentColor || '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' } }, tier.label || ''),
                        el('div', { style: { marginBottom: 4, fontSize: 13, color: '#64748b' } }, tier.users || ''),
                        el('div', { style: { margin: '16px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 } },
                            el('span', { style: { fontSize: 24, fontWeight: 700, color: a.priceColor || '#6366f1', alignSelf: 'flex-start', marginTop: 8 } }, a.currency || '$'),
                            el('span', { className: 'bkbg-psl-amount', style: { color: a.priceColor || '#6366f1', lineHeight: 1 } }, price),
                            el('span', { style: { fontSize: 15, color: '#64748b', marginBottom: 6 } }, a.period || '/month')
                        ),
                        isAnnual && el('div', { style: { marginBottom: 16, fontSize: 13, color: '#16a34a', fontWeight: 600 } },
                            'Billed annually — save ' + disc + '%'),
                        el('div', { style: { marginBottom: 24 } },
                            (tier.features || []).map(function (f, i) {
                                return el('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10,
                                    marginBottom: 10, color: a.featureColor || '#374151' } },
                                    el('span', { style: { color: a.checkColor || '#6366f1', fontWeight: 700, flexShrink: 0 } }, '✓'),
                                    f
                                );
                            })
                        ),
                        el('button', { className: 'bkbg-psl-cta', style: {
                            width: '100%', padding: '14px',
                            border: 'none', borderRadius: 12, cursor: 'pointer',
                            background: a.ctaBg || '#6366f1', color: a.ctaColor || '#ffffff'
                        } }, a.ctaText || 'Get Started')
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                tiers:          a.tiers          || [],
                showBilling:    a.showBilling     !== false,
                annualDiscount: a.annualDiscount  || 20,
                currency:       a.currency        || '$',
                period:         a.period          || '/month',
                ctaText:        a.ctaText         || 'Get Started',
                priceSize:      a.priceSize       || 56,
                cardRadius:     a.cardRadius      || 24,
                sectionBg:      a.sectionBg       || '#f8fafc',
                cardBg:         a.cardBg          || '#ffffff',
                headingColor:   a.headingColor    || '#1e1b4b',
                priceColor:     a.priceColor      || '#6366f1',
                featureColor:   a.featureColor    || '#374151',
                accentColor:    a.accentColor     || '#6366f1',
                ctaBg:          a.ctaBg           || '#6366f1',
                ctaColor:       a.ctaColor        || '#ffffff',
                sliderColor:    a.sliderColor     || '#6366f1',
                trackBg:        a.trackBg         || '#e5e7eb',
                checkColor:     a.checkColor      || '#6366f1',
                headingTypo:    a.headingTypo     || {},
                subheadingTypo: a.subheadingTypo  || {},
                priceTypo:      a.priceTypo       || {},
                ctaTypo:        a.ctaTypo         || {},
                featureTypo:    a.featureTypo     || {}
            };
            return el('div', blockProps,
                el('div', { className: 'bkbg-psl-app', 'data-opts': JSON.stringify(opts),
                    style: { background: a.sectionBg || '#f8fafc' } },
                    el('div', { className: 'bkbg-psl-header' },
                        el(RichText.Content, { tagName: 'h2', value: a.heading, className: 'bkbg-psl-heading',
                            style: { color: a.headingColor || '#1e1b4b' } }),
                        el(RichText.Content, { tagName: 'p', value: a.subheading, className: 'bkbg-psl-subheading' })
                    )
                )
            );
        },

        deprecated: [{
            attributes: {
                heading:              { type: 'string',  default: 'Simple, transparent pricing' },
                subheading:           { type: 'string',  default: 'Scale up or down as your needs change.' },
                showBilling:          { type: 'boolean', default: true },
                annualDiscount:       { type: 'number',  default: 20 },
                initialTier:          { type: 'number',  default: 1 },
                currency:             { type: 'string',  default: '$' },
                period:               { type: 'string',  default: '/month' },
                ctaText:              { type: 'string',  default: 'Get Started' },
                tiers:                { type: 'array',   default: [] },
                headingSize:          { type: 'number',  default: 36 },
                subheadingSize:       { type: 'number',  default: 18 },
                priceSize:            { type: 'number',  default: 56 },
                cardRadius:           { type: 'number',  default: 24 },
                sectionBg:            { type: 'string',  default: '#f8fafc' },
                cardBg:               { type: 'string',  default: '#ffffff' },
                headingColor:         { type: 'string',  default: '#1e1b4b' },
                priceColor:           { type: 'string',  default: '#6366f1' },
                featureColor:         { type: 'string',  default: '#374151' },
                accentColor:          { type: 'string',  default: '#6366f1' },
                ctaBg:                { type: 'string',  default: '#6366f1' },
                ctaColor:             { type: 'string',  default: '#ffffff' },
                sliderColor:          { type: 'string',  default: '#6366f1' },
                trackBg:              { type: 'string',  default: '#e5e7eb' },
                checkColor:           { type: 'string',  default: '#6366f1' },
                ctaSize:              { type: 'number',  default: 16 },
                headingFontWeight:    { type: 'string',  default: '800' },
                subheadingFontWeight: { type: 'string',  default: '400' },
                priceFontWeight:      { type: 'string',  default: '700' }
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = useBlockProps.save();
                var opts = {
                    tiers:          a.tiers          || [],
                    showBilling:    a.showBilling     !== false,
                    annualDiscount: a.annualDiscount  || 20,
                    currency:       a.currency        || '$',
                    period:         a.period          || '/month',
                    ctaText:        a.ctaText         || 'Get Started',
                    priceSize:      a.priceSize       || 56,
                    cardRadius:     a.cardRadius      || 24,
                    sectionBg:      a.sectionBg       || '#f8fafc',
                    cardBg:         a.cardBg          || '#ffffff',
                    headingColor:   a.headingColor    || '#1e1b4b',
                    priceColor:     a.priceColor      || '#6366f1',
                    featureColor:   a.featureColor    || '#374151',
                    accentColor:    a.accentColor     || '#6366f1',
                    ctaBg:          a.ctaBg           || '#6366f1',
                    ctaColor:       a.ctaColor        || '#ffffff',
                    sliderColor:    a.sliderColor     || '#6366f1',
                    trackBg:        a.trackBg         || '#e5e7eb',
                    checkColor:     a.checkColor      || '#6366f1'
                };
                return el('div', blockProps,
                    el('div', { className: 'bkbg-psl-app', 'data-opts': JSON.stringify(opts),
                        style: { background: a.sectionBg || '#f8fafc' } },
                        el('div', { className: 'bkbg-psl-header' },
                            el(RichText.Content, { tagName: 'h2', value: a.heading, className: 'bkbg-psl-heading',
                                style: { color: a.headingColor || '#1e1b4b', fontSize: (a.headingSize || 36) + 'px' } }),
                            el(RichText.Content, { tagName: 'p', value: a.subheading, className: 'bkbg-psl-subheading',
                                style: { fontSize: (a.subheadingSize || 18) + 'px' } })
                        )
                    )
                );
            }
        }]
    });
}() );
