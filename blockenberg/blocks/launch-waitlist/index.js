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
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/launch-waitlist', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateBenefit(idx, val) {
                var benefits = (attr.benefits || []).map(function (b, i) { return i === idx ? { text: val } : b; });
                setAttr({ benefits: benefits });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Centered', value: 'centered' },
                            { label: 'Split (text | form)', value: 'split' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 400, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 240, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 240, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                ),
                el(PanelBody, { title: __('Countdown', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Countdown Timer', 'blockenberg'), checked: attr.showCountdown, onChange: function (v) { setAttr({ showCountdown: v }); } }),
                    attr.showCountdown && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Launch Date (ISO format, e.g. 2025-12-31)', 'blockenberg'), value: attr.launchDate, onChange: function (v) { setAttr({ launchDate: v }); } })
                ),
                el(PanelBody, { title: __('Form', 'blockenberg'), initialOpen: false },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: __('Placeholder', 'blockenberg'), value: attr.formPlaceholder, onChange: function (v) { setAttr({ formPlaceholder: v }); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: __('Submit Button Label', 'blockenberg'), value: attr.formSubmitLabel, onChange: function (v) { setAttr({ formSubmitLabel: v }); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: __('Form Action URL (optional)', 'blockenberg'), value: attr.formAction, onChange: function (v) { setAttr({ formAction: v }); } }),
                    el(TextareaControl, { __nextHasNoMarginBottom: true, label: __('Success Message', 'blockenberg'), value: attr.successMessage, onChange: function (v) { setAttr({ successMessage: v }); } })
                ),
                el(PanelBody, { title: __('Benefits & Social Proof', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Benefits', 'blockenberg'), checked: attr.showBenefits, onChange: function (v) { setAttr({ showBenefits: v }); } }),
                    (attr.benefits || []).map(function (b, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '8px', marginBottom: '6px' } },
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Benefit ' + (idx + 1), 'blockenberg'), value: b.text, onChange: function (v) { updateBenefit(idx, v); } }),
                            el(Button, { isDestructive: true, isSmall: true, onClick: function () { setAttr({ benefits: (attr.benefits || []).filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: function () { setAttr({ benefits: (attr.benefits || []).concat([{ text: 'New benefit' }]) }); } }, __('+ Add Benefit', 'blockenberg')),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Social Proof', 'blockenberg'), checked: attr.showSocialProof, onChange: function (v) { setAttr({ showSocialProof: v }); } }),
                    attr.showSocialProof && el(TextControl, { __nextHasNoMarginBottom: true, label: __('Social Proof Text', 'blockenberg'), value: attr.socialProof, onChange: function (v) { setAttr({ socialProof: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6366f1' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#f8fafc' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#94a3b8' }); } },
                        { label: __('Badge BG', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { setAttr({ badgeBg: v || 'rgba(99,102,241,0.2)' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { setAttr({ badgeColor: v || '#a5b4fc' }); } },
                        { label: __('Countdown Card BG', 'blockenberg'), value: attr.countdownBg, onChange: function (v) { setAttr({ countdownBg: v || '#1e293b' }); } },
                        { label: __('Countdown Numbers', 'blockenberg'), value: attr.countdownNumColor, onChange: function (v) { setAttr({ countdownNumColor: v || '#f8fafc' }); } },
                        { label: __('Input BG', 'blockenberg'), value: attr.inputBg, onChange: function (v) { setAttr({ inputBg: v || '#1e293b' }); } },
                        { label: __('Input Text', 'blockenberg'), value: attr.inputColor, onChange: function (v) { setAttr({ inputColor: v || '#f1f5f9' }); } },
                        { label: __('Submit BG', 'blockenberg'), value: attr.submitBg, onChange: function (v) { setAttr({ submitBg: v || '#6366f1' }); } },
                        { label: __('Submit Text', 'blockenberg'), value: attr.submitColor, onChange: function (v) { setAttr({ submitColor: v || '#ffffff' }); } }
                    ]
                }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Heading'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Subtext'), value: attr.subtextTypo || {}, onChange: function (v) { setAttr({ subtextTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Button'), value: attr.buttonTypo || {}, onChange: function (v) { setAttr({ buttonTypo: v }); } })
                    ),

            );

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.headingTypo, '--bkbg-lwl-h-'));
                    Object.assign(s, _tvFn(attr.subtextTypo, '--bkbg-lwl-st-'));
                    Object.assign(s, _tvFn(attr.buttonTypo, '--bkbg-lwl-bt-'));
                }
                return { className: 'bkbg-lwl-editor', style: s };
            })());

            /* Dummy countdown for preview */
            var dummyUnits = [{ n: '14', l: 'DAYS' }, { n: '08', l: 'HOURS' }, { n: '33', l: 'MINS' }, { n: '21', l: 'SECS' }];

            return el('div', blockProps,
                inspector,
                el('div', { style: { background: attr.bgColor, padding: '60px 40px', borderRadius: '8px', fontFamily: 'sans-serif', textAlign: 'center' } },
                    /* Badge */
                    el('div', { style: { display: 'inline-block', background: attr.badgeBg, color: attr.badgeColor, borderRadius: '20px', padding: '6px 16px', fontSize: '14px', fontWeight: 600, marginBottom: '20px' } },
                        el(RichText, { tagName: 'span', value: attr.badge, onChange: function (v) { setAttr({ badge: v }); }, placeholder: __('Badge…', 'blockenberg') })
                    ),
                    /* Heading */
                    el(RichText, { tagName: 'h2', className: 'bkbg-lwl-heading', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, placeholder: __('Heading…', 'blockenberg'), style: { color: attr.headingColor, margin: '0 0 16px' } }),
                    el(RichText, { tagName: 'p', className: 'bkbg-lwl-sub', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, placeholder: __('Subtext…', 'blockenberg'), style: { color: attr.subColor, maxWidth: '560px', margin: '0 auto 32px' } }),
                    /* Countdown */
                    attr.showCountdown && el('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '36px' } },
                        dummyUnits.map(function (u, i) {
                            return el('div', { key: i, style: { background: attr.countdownBg, borderRadius: '10px', padding: '16px 20px', minWidth: '72px', textAlign: 'center' } },
                                el('div', { style: { color: attr.countdownNumColor, fontSize: '32px', fontWeight: 800, lineHeight: 1 } }, u.n),
                                el('div', { style: { color: attr.countdownLabelColor, fontSize: '11px', letterSpacing: '0.08em', marginTop: '4px' } }, u.l)
                            );
                        })
                    ),
                    /* Form */
                    el('div', { style: { display: 'flex', gap: '0', maxWidth: '480px', margin: '0 auto 24px', borderRadius: '10px', overflow: 'hidden', border: '1px solid ' + attr.inputBorder } },
                        el('input', { type: 'text', placeholder: attr.formPlaceholder, style: { flex: 1, background: attr.inputBg, color: attr.inputColor, border: 'none', padding: '14px 18px', fontSize: '15px', outline: 'none' }, readOnly: true }),
                        el('button', { className: 'bkbg-lwl-submit', style: { background: attr.submitBg, color: attr.submitColor, border: 'none', padding: '14px 22px', cursor: 'pointer', whiteSpace: 'nowrap' } }, attr.formSubmitLabel)
                    ),
                    /* Benefits */
                    attr.showBenefits && el('div', { style: { display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' } },
                        (attr.benefits || []).map(function (b, i) {
                            return el('span', { key: i, style: { color: attr.benefitColor, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' } },
                                el('span', { style: { color: attr.accentColor } }, '✓'),
                                b.text
                            );
                        })
                    ),
                    /* Social proof */
                    attr.showSocialProof && el('p', { style: { color: attr.socialProofColor, fontSize: '14px', margin: 0 } }, attr.socialProof)
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-lwl-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
