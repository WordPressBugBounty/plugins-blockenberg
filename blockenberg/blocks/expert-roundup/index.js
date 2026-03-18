( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
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

    var _erpTC, _erpTV;
    function _tc() { return _erpTC || (_erpTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_erpTV || (_erpTV = window.bkbgTypoCssVars)) ? _erpTV(t, p) : {}; }

    registerBlockType('blockenberg/expert-roundup', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps({ className: 'bkbg-erp-wrap', style: Object.assign({ background: attr.bgColor },
                _tv(attr.typoEyebrow || {}, '--bkbg-erp-ey-'),
                _tv(attr.typoHeading || {}, '--bkbg-erp-hd-'),
                _tv(attr.typoSubtext || {}, '--bkbg-erp-st-'),
                _tv(attr.typoQuote || {}, '--bkbg-erp-qt-')
            ) });

            function updateExpert(idx, key, value) {
                var arr = attr.experts.map(function (e, i) {
                    if (i !== idx) return e;
                    var copy = Object.assign({}, e);
                    copy[key] = value;
                    return copy;
                });
                set({ experts: arr });
            }

            function ExpertCard(expert, idx) {
                var initials = (expert.name || 'E').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
                return el('div', {
                    key: idx, style: {
                        background: attr.cardBg, border: '1px solid ' + attr.cardBorder,
                        borderRadius: attr.borderRadius + 'px', padding: '24px', position: 'relative'
                    }
                },
                    attr.showNumber && el('div', { style: { position: 'absolute', top: '-12px', left: '20px', background: attr.numberBg, color: attr.numberColor, borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 } }, String(idx + 1)),
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' } },
                        expert.avatarUrl
                            ? el('img', { src: expert.avatarUrl, alt: expert.name, style: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } })
                            : el('div', { style: { width: '48px', height: '48px', borderRadius: '50%', background: attr.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: attr.avatarColor, flexShrink: 0 } }, initials),
                        el('div', {},
                            el('div', { style: { fontWeight: 700, fontSize: '15px', color: attr.nameColor } }, expert.name),
                            el('div', { style: { fontSize: '12px', color: attr.titleColor } }, expert.title),
                            attr.showCompany && el('div', { style: { fontSize: '12px', color: attr.companyColor, fontWeight: 600 } }, expert.company)
                        )
                    ),
                    attr.quoteStyle === 'block' && el('div', { className: 'bkbg-erp-quote-block', style: { borderLeftColor: attr.accentColor, color: attr.quoteColor } }, expert.contribution),
                    attr.quoteStyle === 'plain' && el('p', { className: 'bkbg-erp-quote-plain', style: { margin: 0, color: attr.quoteColor } }, expert.contribution),
                    attr.quoteStyle === 'bubble' && el('div', { className: 'bkbg-erp-quote-bubble', style: { background: attr.cardBorder, color: attr.quoteColor } }, '\u201C', expert.contribution, '\u201D')
                );
            }

            function ExpertEditorPanel(expert, idx) {
                return el('div', { key: idx, style: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '10px', background: '#f8fafc' } },
                    el('strong', { style: { fontSize: '12px', color: '#374151' } }, String(idx + 1) + '. ' + (expert.name || 'Expert')),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Name', 'blockenberg'), value: expert.name, __nextHasNoMarginBottom: true, onChange: function (v) { updateExpert(idx, 'name', v); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Title', 'blockenberg'), value: expert.title, __nextHasNoMarginBottom: true, onChange: function (v) { updateExpert(idx, 'title', v); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Company', 'blockenberg'), value: expert.company, __nextHasNoMarginBottom: true, onChange: function (v) { updateExpert(idx, 'company', v); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextareaControl, { label: __('Contribution / Insight', 'blockenberg'), value: expert.contribution, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { updateExpert(idx, 'contribution', v); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (m) { updateExpert(idx, 'avatarUrl', m.url); },
                                allowedTypes: ['image'], value: expert.avatarId || 0,
                                render: function (rp) {
                                    return el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                        expert.avatarUrl && el('img', { src: expert.avatarUrl, style: { width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' } }),
                                        el(Button, { onClick: rp.open, variant: 'secondary', __nextHasNoMarginBottom: true }, expert.avatarUrl ? __('Change Photo', 'blockenberg') : __('Add Photo', 'blockenberg')),
                                        expert.avatarUrl && el(Button, { onClick: function () { updateExpert(idx, 'avatarUrl', ''); }, variant: 'link', isDestructive: true }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        )
                    ),
                    el(Button, { variant: 'link', isDestructive: true, style: { marginTop: '8px' }, onClick: function () { set({ experts: attr.experts.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove Expert', 'blockenberg'))
                );
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Experts', 'blockenberg'), initialOpen: true },
                    (attr.experts || []).map(function (e, i) { return ExpertEditorPanel(e, i); }),
                    el(Button, {
                        variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '8px' },
                        onClick: function () { set({ experts: (attr.experts || []).concat([{ name: 'Expert Name', title: 'Job Title', company: 'Company', avatarUrl: '', contribution: 'Their expert insight here...' }]) }); }
                    }, __('+ Add Expert', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Layout & Display', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Cards Grid', value: 'cards' }, { label: 'Vertical List', value: 'list' }],
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Columns (grid layout)', 'blockenberg'), value: attr.columns, min: 1, max: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ columns: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(SelectControl, {
                            label: __('Quote Style', 'blockenberg'), value: attr.quoteStyle, __nextHasNoMarginBottom: true,
                            options: [{ label: 'Block (left border)', value: 'block' }, { label: 'Plain text', value: 'plain' }, { label: 'Speech bubble', value: 'bubble' }],
                            onChange: function (v) { set({ quoteStyle: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Number Badge', 'blockenberg'), checked: attr.showNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNumber: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Show Company', 'blockenberg'), checked: attr.showCompany, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCompany: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    )
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
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: 'Eyebrow', typo: attr.typoEyebrow || {}, onChange: function (v) { set({ typoEyebrow: v }); } }),
                    _tc() && el(_tc(), { label: 'Heading', typo: attr.typoHeading || {}, onChange: function (v) { set({ typoHeading: v }); } }),
                    _tc() && el(_tc(), { label: 'Subtext', typo: attr.typoSubtext || {}, onChange: function (v) { set({ typoSubtext: v }); } }),
                    _tc() && el(_tc(), { label: 'Quote', typo: attr.typoQuote || {}, onChange: function (v) { set({ typoQuote: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f8fafc' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { set({ subColor: v || '#6b7280' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Expert Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                        { label: __('Expert Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#6b7280' }); } },
                        { label: __('Company', 'blockenberg'), value: attr.companyColor, onChange: function (v) { set({ companyColor: v || '#6366f1' }); } },
                        { label: __('Quote / Contribution', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { set({ quoteColor: v || '#374151' }); } },
                        { label: __('Number Badge BG', 'blockenberg'), value: attr.numberBg, onChange: function (v) { set({ numberBg: v || '#6366f1' }); } },
                        { label: __('Number Badge Text', 'blockenberg'), value: attr.numberColor, onChange: function (v) { set({ numberColor: v || '#ffffff' }); } },
                        { label: __('Avatar Background', 'blockenberg'), value: attr.avatarBg, onChange: function (v) { set({ avatarBg: v || '#ede9fe' }); } },
                        { label: __('Avatar Initials', 'blockenberg'), value: attr.avatarColor, onChange: function (v) { set({ avatarColor: v || '#6366f1' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', padding: attr.paddingTop + 'px 24px ' + attr.paddingBottom + 'px' } },
                    el('div', { style: { textAlign: 'center', marginBottom: '48px' } },
                        el('p', { className: 'bkbg-erp-eyebrow', style: { color: attr.eyebrowColor, margin: '0 0 12px' } }, attr.eyebrow),
                        el(RichText, { tagName: 'h2', className: 'bkbg-erp-heading', value: attr.heading, style: { color: attr.headingColor, margin: '0 0 12px' }, placeholder: __('Heading\u2026', 'blockenberg'), onChange: function (v) { set({ heading: v }); } }),
                        el(RichText, { tagName: 'p', className: 'bkbg-erp-sub', value: attr.subtext, style: { color: attr.subColor, margin: '0 auto', maxWidth: '680px' }, placeholder: __('Subtext\u2026', 'blockenberg'), onChange: function (v) { set({ subtext: v }); } })
                    ),
                    el('div', {
                        style: attr.layout === 'cards'
                            ? { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)', gap: '24px' }
                            : { display: 'flex', flexDirection: 'column', gap: '24px' }
                    }, (attr.experts || []).map(function (e, i) { return ExpertCard(e, i); }))
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-erp-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
