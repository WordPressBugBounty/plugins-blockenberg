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
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    registerBlockType('blockenberg/persona-section', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps((function(){
                var s = { background: attr.bgColor };
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(attr.eyebrowTypo || {}, '--bkbg-per-eyebrow'));
                    Object.assign(s, tv(attr.headingTypo || {}, '--bkbg-per-heading'));
                    Object.assign(s, tv(attr.subtextTypo || {}, '--bkbg-per-subtext'));
                    Object.assign(s, tv(attr.roleTypo || {}, '--bkbg-per-role'));
                    Object.assign(s, tv(attr.descTypo || {}, '--bkbg-per-desc'));
                    Object.assign(s, tv(attr.itemTypo || {}, '--bkbg-per-item'));
                }
                return { style: s };
            })());

            /* Persona editor helpers */
            function updatePersona(idx, key, value) {
                var arr = attr.personas.map(function (p, i) { return i === idx ? Object.assign({}, p, JSON.parse('{' + JSON.stringify(key) + ':' + JSON.stringify(value) + '}')) : p; });
                set({ personas: arr });
            }
            function updatePersonaArray(idx, key, arrValue) {
                var arr = attr.personas.map(function (p, i) { if (i !== idx) return p; var copy = Object.assign({}, p); copy[key] = arrValue; return copy; });
                set({ personas: arr });
            }

            function PersonaEditor(persona, idx) {
                return el('div', { key: idx, style: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '10px', background: '#f8fafc' } },
                    el('strong', { style: { fontSize: '12px', color: '#374151' } }, ((persona.iconType || 'custom-char') === 'custom-char' ? (persona.icon || '?') : '⬡') + ' ' + (persona.role || __('Persona', 'blockenberg'))),
                    el('div', { style: { marginTop: '8px' } },
                        el(IP().IconPickerControl, {
                            iconType: persona.iconType || 'custom-char',
                            customChar: persona.icon,
                            dashicon: persona.iconDashicon || '',
                            imageUrl: persona.iconImageUrl || '',
                            onChangeType: function (v) { updatePersona(idx, 'iconType', v); },
                            onChangeChar: function (v) { updatePersona(idx, 'icon', v); },
                            onChangeDashicon: function (v) { updatePersona(idx, 'iconDashicon', v); },
                            onChangeImageUrl: function (v) { updatePersona(idx, 'iconImageUrl', v); }
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Role Title', 'blockenberg'), value: persona.role, __nextHasNoMarginBottom: true, onChange: function (v) { updatePersona(idx, 'role', v); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextareaControl, { label: __('Description', 'blockenberg'), value: persona.description, __nextHasNoMarginBottom: true, rows: 2, onChange: function (v) { updatePersona(idx, 'description', v); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '6px', color: '#374151' } }, __('Pain Points', 'blockenberg')),
                        (persona.painPoints || []).map(function (pt, pi) {
                            return el('div', { key: pi, style: { display: 'flex', gap: '6px', marginBottom: '4px' } },
                                el(TextControl, { value: pt, __nextHasNoMarginBottom: true, onChange: function (v) { var arr = (persona.painPoints || []).slice(); arr[pi] = v; updatePersonaArray(idx, 'painPoints', arr); } }),
                                el(Button, { variant: 'tertiary', isDestructive: true, onClick: function () { updatePersonaArray(idx, 'painPoints', (persona.painPoints || []).filter(function (_, i) { return i !== pi; })); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '4px' }, onClick: function () { updatePersonaArray(idx, 'painPoints', (persona.painPoints || []).concat(['New pain point'])); } }, __('+ Pain Point', 'blockenberg'))
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el('label', { style: { display: 'block', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', marginBottom: '6px', color: '#374151' } }, __('Benefits', 'blockenberg')),
                        (persona.benefits || []).map(function (b, bi) {
                            return el('div', { key: bi, style: { display: 'flex', gap: '6px', marginBottom: '4px' } },
                                el(TextControl, { value: b, __nextHasNoMarginBottom: true, onChange: function (v) { var arr = (persona.benefits || []).slice(); arr[bi] = v; updatePersonaArray(idx, 'benefits', arr); } }),
                                el(Button, { variant: 'tertiary', isDestructive: true, onClick: function () { updatePersonaArray(idx, 'benefits', (persona.benefits || []).filter(function (_, i) { return i !== bi; })); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '4px' }, onClick: function () { updatePersonaArray(idx, 'benefits', (persona.benefits || []).concat(['New benefit'])); } }, __('+ Benefit', 'blockenberg'))
                    ),
                    el(Button, { variant: 'link', isDestructive: true, style: { marginTop: '8px' }, onClick: function () { set({ personas: attr.personas.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove Persona', 'blockenberg'))
                );
            }

            /* Card preview */
            function PersonaCard(p) {
                return el('div', {
                    key: p.role, style: {
                        background: attr.cardBg, border: '1px solid ' + attr.cardBorder,
                        borderRadius: attr.borderRadius + 'px', padding: '28px'
                    }
                },
                    el('div', { className: 'bkbg-per-icon', style: { width: '56px', height: '56px', borderRadius: '12px', background: attr.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' } }, (p.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(p.iconType, p.icon, p.iconDashicon, p.iconImageUrl, p.iconDashiconColor) : p.icon),
                    el('h3', { className: 'bkbg-per-role', style: { margin: '0 0 8px', color: attr.roleColor } }, p.role),
                    el('p', { className: 'bkbg-per-desc', style: { margin: '0 0 16px', color: attr.descColor } }, p.description),
                    attr.showPainPoints && p.painPoints && p.painPoints.length && el('div', { style: { marginBottom: '16px' } },
                        el('p', { style: { margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: attr.accentColor } }, attr.painLabel),
                        el('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
                            p.painPoints.slice(0, 3).map(function (pt, i) {
                                return el('li', { key: i, style: { display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '6px', color: attr.painColor } },
                                    el('span', { style: { color: attr.painIconColor, flexShrink: 0 } }, '✕'), pt
                                );
                            })
                        )
                    ),
                    attr.showBenefits && p.benefits && p.benefits.length && el('div', {},
                        el('p', { style: { margin: '0 0 8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: attr.accentColor } }, attr.benefitLabel),
                        el('ul', { style: { listStyle: 'none', padding: 0, margin: 0 } },
                            p.benefits.slice(0, 3).map(function (b, i) {
                                return el('li', { key: i, style: { display: 'flex', gap: '8px', fontSize: '13px', marginBottom: '6px', color: attr.benefitColor } },
                                    el('span', { style: { color: attr.benefitIconColor, flexShrink: 0 } }, '✓'), b
                                );
                            })
                        )
                    )
                );
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Personas', 'blockenberg'), initialOpen: true },
                    (attr.personas || []).map(function (p, idx) { return PersonaEditor(p, idx); }),
                    el(Button, { variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '8px' }, onClick: function () { set({ personas: (attr.personas || []).concat([{ icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', role: 'New Audience', description: 'Describe this audience.', painPoints: ['Pain point 1', 'Pain point 2'], benefits: ['Benefit 1', 'Benefit 2'] }]) }); } }, __('+ Add Persona', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Labels', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Pain Points Label', 'blockenberg'), value: attr.painLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ painLabel: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, { label: __('Benefits Label', 'blockenberg'), value: attr.benefitLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ benefitLabel: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Grid', value: 'grid' }, { label: 'Cards (auto columns)', value: 'cards' }],
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: attr.columns, min: 1, max: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ columns: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Pain Points', 'blockenberg'), checked: attr.showPainPoints, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPainPoints: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Show Benefits', 'blockenberg'), checked: attr.showBenefits, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBenefits: v }); } })
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
                    (function(){ var C = getTypoControl(); return C ? [
                        el(C, { key: 'eyebrow', label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo || {}, onChange: function(v){ set({eyebrowTypo: v}); } }),
                        el(C, { key: 'heading', label: __('Heading', 'blockenberg'), value: attr.headingTypo || {}, onChange: function(v){ set({headingTypo: v}); } }),
                        el(C, { key: 'subtext', label: __('Subtext', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function(v){ set({subtextTypo: v}); } }),
                        el(C, { key: 'role', label: __('Role Title', 'blockenberg'), value: attr.roleTypo || {}, onChange: function(v){ set({roleTypo: v}); } }),
                        el(C, { key: 'desc', label: __('Description', 'blockenberg'), value: attr.descTypo || {}, onChange: function(v){ set({descTypo: v}); } }),
                        el(C, { key: 'item', label: __('List Items', 'blockenberg'), value: attr.itemTypo || {}, onChange: function(v){ set({itemTypo: v}); } })
                    ] : null; })()
                ),
                                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { set({ subColor: v || '#6b7280' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#f8fafc' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Icon Background', 'blockenberg'), value: attr.iconBg, onChange: function (v) { set({ iconBg: v || '#ede9fe' }); } },
                        { label: __('Role Title', 'blockenberg'), value: attr.roleColor, onChange: function (v) { set({ roleColor: v || '#111827' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { set({ descColor: v || '#6b7280' }); } },
                        { label: __('Pain Point Text', 'blockenberg'), value: attr.painColor, onChange: function (v) { set({ painColor: v || '#374151' }); } },
                        { label: __('Pain Point Icon', 'blockenberg'), value: attr.painIconColor, onChange: function (v) { set({ painIconColor: v || '#ef4444' }); } },
                        { label: __('Benefit Text', 'blockenberg'), value: attr.benefitColor, onChange: function (v) { set({ benefitColor: v || '#374151' }); } },
                        { label: __('Benefit Icon', 'blockenberg'), value: attr.benefitIconColor, onChange: function (v) { set({ benefitIconColor: v || '#22c55e' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { padding: attr.paddingTop + 'px 32px ' + attr.paddingBottom + 'px', maxWidth: attr.maxWidth + 'px', margin: '0 auto' } },
                    el('div', { style: { textAlign: 'center', marginBottom: '48px' } },
                        el('p', { className: 'bkbg-per-eyebrow', style: { color: attr.eyebrowColor, margin: '0 0 12px' } }, attr.eyebrow),
                        el(RichText, { tagName: 'h2', className: 'bkbg-per-heading', value: attr.heading, style: { color: attr.headingColor, margin: '0 0 16px' }, placeholder: __('Heading…', 'blockenberg'), onChange: function (v) { set({ heading: v }); } }),
                        el(RichText, { tagName: 'p', className: 'bkbg-per-sub', value: attr.subtext, style: { color: attr.subColor, margin: '0 auto', maxWidth: '640px' }, placeholder: __('Subtext…', 'blockenberg'), onChange: function (v) { set({ subtext: v }); } })
                    ),
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)', gap: '24px' } },
                        (attr.personas || []).map(function (p) { return PersonaCard(p); })
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-per-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
