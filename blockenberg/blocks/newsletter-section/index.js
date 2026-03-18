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
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/newsletter-section', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = { background: attr.bgColor };
                if (_tvf) {
                    Object.assign(s, _tvf(attr.headingTypo, '--bkbg-nls-ht-'));
                    Object.assign(s, _tvf(attr.subtextTypo, '--bkbg-nls-st-'));
                }
                return { className: 'bkbg-nls-wrap', style: s };
            })());

            /* Issue editor */
            function IssuesEditor() {
                return el('div', {},
                    el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' } }, __('Sample Issues', 'blockenberg')),
                    (attr.sampleIssues || []).map(function (issue, idx) {
                        return el('div', { key: idx, style: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', marginBottom: '8px', background: '#f8fafc' } },
                            el(TextControl, { label: __('Title', 'blockenberg'), value: issue.title, __nextHasNoMarginBottom: true, onChange: function (v) { var arr = attr.sampleIssues.map(function (s, i) { return i === idx ? Object.assign({}, s, { title: v }) : s; }); set({ sampleIssues: arr }); } }),
                            el('div', { style: { marginTop: '6px' } },
                                el(TextControl, { label: __('Date', 'blockenberg'), value: issue.date, __nextHasNoMarginBottom: true, onChange: function (v) { var arr = attr.sampleIssues.map(function (s, i) { return i === idx ? Object.assign({}, s, { date: v }) : s; }); set({ sampleIssues: arr }); } })
                            ),
                            el('div', { style: { marginTop: '6px' } },
                                el(TextareaControl, { label: __('Excerpt', 'blockenberg'), value: issue.excerpt, __nextHasNoMarginBottom: true, rows: 2, onChange: function (v) { var arr = attr.sampleIssues.map(function (s, i) { return i === idx ? Object.assign({}, s, { excerpt: v }) : s; }); set({ sampleIssues: arr }); } })
                            ),
                            el(Button, { variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true, style: { marginTop: '4px' }, onClick: function () { set({ sampleIssues: attr.sampleIssues.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove Issue', 'blockenberg'))
                        );
                    }),
                    el(Button, { variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '4px' }, onClick: function () { set({ sampleIssues: (attr.sampleIssues || []).concat([{ title: 'Issue Title', date: 'Apr 1, 2024', excerpt: 'A brief excerpt from this issue...' }]) }); } }, __('+ Add Issue', 'blockenberg'))
                );
            }

            /* Benefits editor */
            function BenefitsEditor() {
                return el('div', {},
                    el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' } }, __('Benefits', 'blockenberg')),
                    (attr.benefits || []).map(function (b, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '6px', marginBottom: '6px' } },
                            el(TextControl, { value: b, __nextHasNoMarginBottom: true, onChange: function (v) { var arr = attr.benefits.slice(); arr[idx] = v; set({ benefits: arr }); } }),
                            el(Button, { variant: 'tertiary', isDestructive: true, onClick: function () { set({ benefits: attr.benefits.filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '4px' }, onClick: function () { set({ benefits: (attr.benefits || []).concat(['New benefit']) }); } }, __('+ Add Benefit', 'blockenberg'))
                );
            }

            /* Preview */
            var previewStyle = {
                padding: attr.paddingTop + 'px 32px ' + attr.paddingBottom + 'px',
                maxWidth: attr.maxWidth + 'px', margin: '0 auto'
            };

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Copy', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrow, __nextHasNoMarginBottom: true, onChange: function (v) { set({ eyebrow: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, { label: __('Subscriber Count Badge', 'blockenberg'), value: attr.subscriberCount, __nextHasNoMarginBottom: true, onChange: function (v) { set({ subscriberCount: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Subscriber Badge', 'blockenberg'), checked: attr.showSubscriberBadge, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSubscriberBadge: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, { label: __('Form Placeholder', 'blockenberg'), value: attr.formPlaceholder, __nextHasNoMarginBottom: true, onChange: function (v) { set({ formPlaceholder: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Submit Label', 'blockenberg'), value: attr.formSubmitLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ formSubmitLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Form Action URL', 'blockenberg'), value: attr.formAction, __nextHasNoMarginBottom: true, onChange: function (v) { set({ formAction: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Privacy Note', 'blockenberg'), value: attr.privacyNote, __nextHasNoMarginBottom: true, onChange: function (v) { set({ privacyNote: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextareaControl, { label: __('Success Message', 'blockenberg'), value: attr.successMessage, __nextHasNoMarginBottom: true, onChange: function (v) { set({ successMessage: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Benefits', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Benefits', 'blockenberg'), checked: attr.showBenefits, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBenefits: v }); } }),
                    attr.showBenefits && BenefitsEditor()
                ),
                el(PanelBody, { title: __('Past Issues', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Sample Issues', 'blockenberg'), checked: attr.showSamples, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSamples: v }); } }),
                    attr.showSamples && IssuesEditor()
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1600, step: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ maxWidth: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#0f172a' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#818cf8' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#f8fafc' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { set({ subColor: v || '#94a3b8' }); } },
                        { label: __('Benefit Text', 'blockenberg'), value: attr.benefitColor, onChange: function (v) { set({ benefitColor: v || '#cbd5e1' }); } },
                        { label: __('Check Icon', 'blockenberg'), value: attr.checkColor, onChange: function (v) { set({ checkColor: v || '#22d3ee' }); } },
                        { label: __('Input Background', 'blockenberg'), value: attr.inputBg, onChange: function (v) { set({ inputBg: v || '#1e293b' }); } },
                        { label: __('Input Border', 'blockenberg'), value: attr.inputBorder, onChange: function (v) { set({ inputBorder: v || '#334155' }); } },
                        { label: __('Input Text', 'blockenberg'), value: attr.inputColor, onChange: function (v) { set({ inputColor: v || '#f1f5f9' }); } },
                        { label: __('Submit Button', 'blockenberg'), value: attr.submitBg, onChange: function (v) { set({ submitBg: v || '#6366f1' }); } },
                        { label: __('Submit Text', 'blockenberg'), value: attr.submitColor, onChange: function (v) { set({ submitColor: v || '#ffffff' }); } },
                        { label: __('Privacy Note', 'blockenberg'), value: attr.privacyColor, onChange: function (v) { set({ privacyColor: v || '#64748b' }); } },
                        { label: __('Issue Card Background', 'blockenberg'), value: attr.issueBg, onChange: function (v) { set({ issueBg: v || '#1e293b' }); } },
                        { label: __('Issue Card Border', 'blockenberg'), value: attr.issueBorder, onChange: function (v) { set({ issueBorder: v || '#334155' }); } },
                        { label: __('Issue Title', 'blockenberg'), value: attr.issueTitleColor, onChange: function (v) { set({ issueTitleColor: v || '#f1f5f9' }); } },
                        { label: __('Issue Date', 'blockenberg'), value: attr.issueDateColor, onChange: function (v) { set({ issueDateColor: v || '#818cf8' }); } },
                        { label: __('Issue Excerpt', 'blockenberg'), value: attr.issueExcerptColor, onChange: function (v) { set({ issueExcerptColor: v || '#94a3b8' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo, onChange: function (v) { set({ headingTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Subtext Typography', 'blockenberg'), value: attr.subtextTypo, onChange: function (v) { set({ subtextTypo: v }); } })
                )
            );

            return el('div', blockProps,
                controls,
                el('div', { className: 'bkbg-nls-inner', style: previewStyle },
                    /* Header */
                    el('div', { className: 'bkbg-nls-header', style: { textAlign: 'center', marginBottom: '48px' } },
                        el('p', { style: { color: attr.eyebrowColor, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' } }, attr.eyebrow),
                        attr.showSubscriberBadge && el('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: attr.subscriberBadgeBg, color: attr.subscriberBadgeColor, borderRadius: '20px', padding: '4px 14px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' } }, '👥 ', attr.subscriberCount),
                        el(RichText, { tagName: 'h2', value: attr.heading, className: 'bkbg-nls-heading', style: { color: attr.headingColor, margin: '0 0 16px' }, placeholder: __('Heading…', 'blockenberg'), onChange: function (v) { set({ heading: v }); } }),
                        el(RichText, { tagName: 'p', value: attr.subtext, className: 'bkbg-nls-sub', style: { color: attr.subColor, margin: '0', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }, placeholder: __('Subtext…', 'blockenberg'), onChange: function (v) { set({ subtext: v }); } })
                    ),
                    /* Main grid */
                    el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' } },
                        /* Left: form + benefits */
                        el('div', {},
                            attr.showBenefits && el('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 28px' } },
                                (attr.benefits || []).map(function (b, i) {
                                    return el('li', { key: i, style: { display: 'flex', gap: '10px', marginBottom: '12px', color: attr.benefitColor, fontSize: '16px', alignItems: 'flex-start' } },
                                        el('span', { style: { color: attr.checkColor, fontWeight: 700, flexShrink: 0 } }, '✓'), b
                                    );
                                })
                            ),
                            el('div', { style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
                                el('input', { type: 'email', readOnly: true, placeholder: attr.formPlaceholder, style: { flex: 1, padding: '14px 16px', background: attr.inputBg, border: '1px solid ' + attr.inputBorder, color: attr.inputColor, borderRadius: '8px', fontSize: '15px' } }),
                                el('button', { style: { padding: '14px 22px', background: attr.submitBg, color: attr.submitColor, border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap' } }, attr.formSubmitLabel)
                            ),
                            el('p', { style: { color: attr.privacyColor, fontSize: '13px', margin: 0 } }, attr.privacyNote)
                        ),
                        /* Right: sample issues */
                        attr.showSamples && el('div', {},
                            el('p', { style: { color: attr.eyebrowColor, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' } }, __('Recent Issues', 'blockenberg')),
                            (attr.sampleIssues || []).map(function (issue, i) {
                                return el('div', { key: i, style: { background: attr.issueBg, border: '1px solid ' + attr.issueBorder, borderRadius: '8px', padding: '16px', marginBottom: '10px' } },
                                    el('p', { style: { color: attr.issueDateColor, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' } }, issue.date),
                                    el('p', { style: { color: attr.issueTitleColor, fontWeight: 700, fontSize: '14px', margin: '0 0 6px', lineHeight: '1.4' } }, issue.title),
                                    el('p', { style: { color: attr.issueExcerptColor, fontSize: '13px', margin: 0, lineHeight: '1.5' } }, issue.excerpt)
                                );
                            })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-nls-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
