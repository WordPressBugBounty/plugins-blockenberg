( function () {
    var el = wp.element.createElement;
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
    var Fragment = wp.element.Fragment;

    // Lazy lookup so the typography control is resolved at render time
    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    registerBlockType('blockenberg/affiliate-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            /* ── Inspector ── */
            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Split (Commission + Steps)', value: 'split' },
                            { label: 'Centered', value: 'centered' },
                            { label: 'Steps Focus', value: 'steps-focus' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth,
                        min: 600, max: 1400,
                        onChange: function (v) { setAttr({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop,
                        min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom,
                        min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); }
                    })
                ),
                el(PanelBody, { title: __('Commission Badge', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Commission Value', 'blockenberg'),
                        value: attr.commission,
                        onChange: function (v) { setAttr({ commission: v }); }
                    }),
                    el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Commission Label', 'blockenberg'),
                        value: attr.commissionLabel,
                        onChange: function (v) { setAttr({ commissionLabel: v }); }
                    }),
                    el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Commission Note', 'blockenberg'),
                        value: attr.commissionNote,
                        onChange: function (v) { setAttr({ commissionNote: v }); }
                    })
                ),
                el(PanelBody, { title: __('Benefits & Stats', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Benefits List', 'blockenberg'),
                        checked: attr.showBenefits,
                        onChange: function (v) { setAttr({ showBenefits: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Stats', 'blockenberg'),
                        checked: attr.showStats,
                        onChange: function (v) { setAttr({ showStats: v }); }
                    })
                ),
                el(PanelBody, { title: __('CTA Buttons', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Primary CTA Label', 'blockenberg'),
                        value: attr.ctaLabel,
                        onChange: function (v) { setAttr({ ctaLabel: v }); }
                    }),
                    el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Primary CTA URL', 'blockenberg'),
                        value: attr.ctaUrl,
                        onChange: function (v) { setAttr({ ctaUrl: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Secondary CTA', 'blockenberg'),
                        checked: attr.showSecondary,
                        onChange: function (v) { setAttr({ showSecondary: v }); }
                    }),
                    attr.showSecondary && el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Secondary CTA Label', 'blockenberg'),
                        value: attr.ctaSecondaryLabel,
                        onChange: function (v) { setAttr({ ctaSecondaryLabel: v }); }
                    }),
                    attr.showSecondary && el(TextControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Secondary CTA URL', 'blockenberg'),
                        value: attr.ctaSecondaryUrl,
                        onChange: function (v) { setAttr({ ctaSecondaryUrl: v }); }
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypographyControl();
                        if (!TC) return el('p', null, 'Typography control not loaded.');
                        return el(Fragment, null,
                            el(TC, { label: __('Eyebrow Typography', 'blockenberg'), value: attr.eyebrowTypo || {}, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                            el(TC, { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                            el(TC, { label: __('Subtext Typography', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function (v) { setAttr({ subtextTypo: v }); } })
                        );
                    })()
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6366f1' }); } },
                        { label: __('Commission Badge BG', 'blockenberg'), value: attr.commissionBg, onChange: function (v) { setAttr({ commissionBg: v || '#6366f1' }); } },
                        { label: __('Commission Badge Text', 'blockenberg'), value: attr.commissionColor, onChange: function (v) { setAttr({ commissionColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#ffffff' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#94a3b8' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#a5b4fc' }); } },
                        { label: __('Step Card BG', 'blockenberg'), value: attr.stepCardBg, onChange: function (v) { setAttr({ stepCardBg: v || '#1e293b' }); } },
                        { label: __('Stat Number', 'blockenberg'), value: attr.statNumColor, onChange: function (v) { setAttr({ statNumColor: v || '#6366f1' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6366f1' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } }
                    ]
                })
            );

            /* ── Preview ── */
            var blockProps = useBlockProps({ className: 'bkbg-aff-editor bkbg-aff-layout-' + attr.layout });

            /* Build editor wrapper style with typography CSS vars */
            var _tv = getTypoCssVars();
            var previewStyle = Object.assign(
                { background: attr.bgColor, padding: '40px', borderRadius: '8px', fontFamily: 'sans-serif' },
                _tv(attr.eyebrowTypo || {}, '--bkbg-aff-eyebrow-'),
                _tv(attr.headingTypo || {}, '--bkbg-aff-heading-'),
                _tv(attr.subtextTypo || {}, '--bkbg-aff-subtext-')
            );
            previewStyle['--bkbg-aff-eyebrow-sz'] = (attr.eyebrowFontSize || 13) + 'px';
            previewStyle['--bkbg-aff-heading-sz'] = (attr.headingFontSize || 38) + 'px';
            previewStyle['--bkbg-aff-subtext-sz'] = (attr.subtextFontSize || 18) + 'px';

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-aff-preview', style: previewStyle },
                    el('div', { style: { textAlign: 'center', marginBottom: '32px' } },
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-aff-eyebrow',
                            value: attr.eyebrow,
                            onChange: function (v) { setAttr({ eyebrow: v }); },
                            placeholder: __('Eyebrow text…', 'blockenberg'),
                            style: { color: attr.eyebrowColor, marginBottom: '8px' }
                        }),
                        el(RichText, {
                            tagName: 'h2',
                            className: 'bkbg-aff-heading',
                            value: attr.heading,
                            onChange: function (v) { setAttr({ heading: v }); },
                            placeholder: __('Section heading…', 'blockenberg'),
                            style: { color: attr.headingColor, margin: '0 0 16px' }
                        }),
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-aff-sub',
                            value: attr.subtext,
                            onChange: function (v) { setAttr({ subtext: v }); },
                            placeholder: __('Subtext…', 'blockenberg'),
                            style: { color: attr.subColor, maxWidth: '600px', margin: '0 auto' }
                        })
                    ),
                    /* Commission badge */
                    el('div', { style: { textAlign: 'center', marginBottom: '40px' } },
                        el('div', { style: { display: 'inline-block', background: attr.commissionBg, color: attr.commissionColor, borderRadius: '16px', padding: '24px 48px' } },
                            el('div', { style: { fontSize: '64px', fontWeight: 800, lineHeight: 1 } }, attr.commission),
                            el('div', { style: { fontSize: '16px', fontWeight: 600, marginTop: '4px' } }, attr.commissionLabel),
                            el('div', { style: { fontSize: '13px', opacity: 0.8, marginTop: '4px' } }, attr.commissionNote)
                        )
                    ),
                    /* Steps */
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '40px' } },
                        (attr.steps || []).map(function (step, i) {
                            return el('div', { key: i, style: { background: attr.stepCardBg, borderRadius: '12px', padding: '24px', textAlign: 'center' } },
                                el('div', { style: { fontSize: '40px', marginBottom: '12px' } }, step.icon),
                                el('div', { style: { color: attr.stepTitleColor, fontWeight: 700, fontSize: '18px', marginBottom: '8px' } }, step.title),
                                el('div', { style: { color: attr.stepDescColor, fontSize: '14px' } }, step.description)
                            );
                        })
                    ),
                    /* Benefits */
                    attr.showBenefits && el('div', { style: { textAlign: 'center', marginBottom: '32px' } },
                        el('div', { style: { display: 'inline-flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' } },
                            (attr.benefits || []).map(function (b, i) {
                                return el('span', { key: i, style: { color: attr.benefitColor, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' } },
                                    el('span', { style: { color: attr.accentColor } }, '✓'),
                                    b.text
                                );
                            })
                        )
                    ),
                    /* Stats */
                    attr.showStats && el('div', { style: { display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px' } },
                        (attr.stats || []).map(function (s, i) {
                            return el('div', { key: i, style: { textAlign: 'center' } },
                                el('div', { style: { color: attr.statNumColor, fontSize: '32px', fontWeight: 800 } }, s.number),
                                el('div', { style: { color: attr.statLabelColor, fontSize: '14px' } }, s.label)
                            );
                        })
                    ),
                    /* CTAs */
                    el('div', { style: { textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '16px' } },
                        el('a', { href: attr.ctaUrl, style: { background: attr.ctaBg, color: attr.ctaColor, padding: '14px 32px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '16px' } }, attr.ctaLabel),
                        attr.showSecondary && el('a', { href: attr.ctaSecondaryUrl, style: { color: attr.accentColor, padding: '14px 32px', border: '2px solid ' + attr.accentColor, borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '16px' } }, attr.ctaSecondaryLabel)
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-aff-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
