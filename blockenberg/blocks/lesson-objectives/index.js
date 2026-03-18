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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    var LEVELS = [
        { value: 'beginner',     label: '🟢 Beginner' },
        { value: 'intermediate', label: '🟡 Intermediate' },
        { value: 'advanced',     label: '🔴 Advanced' },
        { value: 'all',          label: '🔵 All Levels' }
    ];

    var BULLET_OPTIONS = [
        { value: 'check',  label: '✅ Checkmark' },
        { value: 'arrow',  label: '→ Arrow' },
        { value: 'circle', label: '● Circle' },
        { value: 'star',   label: '★ Star' },
        { value: 'custom', label: 'Custom' }
    ];

    var BULLETS = { check: '✓', arrow: '→', circle: '●', star: '★' };

    function getBullet(attr) {
        return attr.bulletStyle === 'custom' ? (attr.customBullet || '✓') : (BULLETS[attr.bulletStyle] || '✓');
    }

    function getLevelLabel(val) {
        var found = LEVELS.find(function (l) { return l.value === val; });
        return found ? found.label : val;
    }

    registerBlockType('blockenberg/lesson-objectives', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = { padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px' };
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.headingTypo, '--bkbg-lob-h-'));
                    Object.assign(s, _tvFn(attr.objectiveTypo, '--bkbg-lob-o-'));
                }
                return { style: s };
            })());
            var bullet = getBullet(attr);

            function updateObjective(idx, val) {
                var arr = (attr.objectives || []).map(function (o, i) {
                    return i === idx ? { text: val } : o;
                });
                set({ objectives: arr });
            }

            var wrapStyle = {
                background: attr.bgColor,
                border: '1px solid ' + attr.borderColor,
                borderRadius: attr.borderRadius + 'px',
                padding: '20px 24px',
                boxSizing: 'border-box'
            };
            if (attr.style === 'left-border') {
                wrapStyle.borderLeft = '4px solid ' + attr.accentColor;
            } else if (attr.style === 'top-border') {
                wrapStyle.borderTop = '4px solid ' + attr.accentColor;
                wrapStyle.borderRadius = '0 0 ' + attr.borderRadius + 'px ' + attr.borderRadius + 'px';
            } else if (attr.style === 'minimal') {
                wrapStyle.background = 'transparent';
                wrapStyle.border = 'none';
                wrapStyle.padding = '0';
            }

            /* Header row */
            var header = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' } },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    attr.showIcon && el('span', { className: 'bkbg-lob-icon', style: { fontSize: '24px', lineHeight: 1 } }, IP().buildEditorIcon(attr.headingIconType, attr.headingIcon, attr.headingIconDashicon, attr.headingIconImageUrl, attr.headingIconDashiconColor)),
                    el(RichText, { tagName: 'h3', className: 'bkbg-lob-heading', value: attr.heading, allowedFormats: [], placeholder: __('What You\'ll Learn', 'blockenberg'), style: { margin: 0, color: attr.headingColor }, onChange: function (v) { set({ heading: v }); } })
                ),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                    attr.showLevel && el('span', { style: { background: attr.levelBg, color: attr.levelColor, fontSize: '11px', padding: '3px 9px', borderRadius: '20px', fontWeight: 600 } }, getLevelLabel(attr.level)),
                    attr.showReadTime && attr.readTime && el('span', { style: { fontSize: '12px', color: attr.metaColor } }, '⏱ ' + attr.readTime)
                )
            );

            /* Objectives grid */
            var cols = attr.columns > 1 ? 'repeat(' + attr.columns + ', 1fr)' : '1fr';
            var listEl = el('div', { style: { display: 'grid', gridTemplateColumns: cols, gap: '10px' } },
                (attr.objectives || []).map(function (obj, i) {
                    return el('div', { key: i, style: { display: 'flex', alignItems: 'flex-start', gap: '10px' } },
                        el('span', { style: { background: attr.bulletBg, color: attr.bulletColor, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, marginTop: '1px' } }, bullet),
                        el(RichText, { tagName: 'p', className: 'bkbg-lob-text', value: obj.text, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Objective…', 'blockenberg'), style: { margin: 0, color: attr.textColor }, onChange: function (v) { updateObjective(i, v); } })
                    );
                })
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Objectives', 'blockenberg'), initialOpen: true },
                    (attr.objectives || []).map(function (obj, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '4px', marginBottom: '6px', alignItems: 'center' } },
                            el('div', { style: { flex: 1 } },
                                el(TextControl, { label: '', value: obj.text, placeholder: 'Objective…', __nextHasNoMarginBottom: true, onChange: function (v) { updateObjective(idx, v); } })
                            ),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { set({ objectives: (attr.objectives || []).filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', style: { marginTop: '4px' }, onClick: function () { set({ objectives: (attr.objectives || []).concat([{ text: '' }]) }); } }, __('+ Add Objective', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Header & Meta', 'blockenberg'), initialOpen: false },
                    el(IP().IconPickerControl, IP().iconPickerProps(attr, set, { charAttr: 'headingIcon', typeAttr: 'headingIconType', dashiconAttr: 'headingIconDashicon', imageUrlAttr: 'headingIconImageUrl', colorAttr: 'headingIconDashiconColor' })),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Level Badge', 'blockenberg'), checked: attr.showLevel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLevel: v }); } })
                    ),
                    attr.showLevel && el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Level', 'blockenberg'), value: attr.level, __nextHasNoMarginBottom: true,
                            options: LEVELS.map(function (l) { return { label: l.label, value: l.value }; }),
                            onChange: function (v) { set({ level: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Read Time', 'blockenberg'), checked: attr.showReadTime, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showReadTime: v }); } })
                    ),
                    attr.showReadTime && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Read Time', 'blockenberg'), value: attr.readTime, placeholder: '12 min read', __nextHasNoMarginBottom: true, onChange: function (v) { set({ readTime: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Card (bordered)', value: 'card' }, { label: 'Left Border', value: 'left-border' }, { label: 'Top Border', value: 'top-border' }, { label: 'Minimal', value: 'minimal' }],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(SelectControl, {
                            label: __('Bullet Style', 'blockenberg'), value: attr.bulletStyle, __nextHasNoMarginBottom: true,
                            options: BULLET_OPTIONS,
                            onChange: function (v) { set({ bulletStyle: v }); }
                        })
                    ),
                    attr.bulletStyle === 'custom' && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Custom Bullet', 'blockenberg'), value: attr.customBullet, __nextHasNoMarginBottom: true, onChange: function (v) { set({ customBullet: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: attr.columns, min: 1, max: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ columns: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f0fdf4' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#86efac' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#16a34a' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#14532d' }); } },
                        { label: __('Bullet BG', 'blockenberg'), value: attr.bulletBg, onChange: function (v) { set({ bulletBg: v || '#dcfce7' }); } },
                        { label: __('Bullet Icon', 'blockenberg'), value: attr.bulletColor, onChange: function (v) { set({ bulletColor: v || '#16a34a' }); } },
                        { label: __('Item Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#166534' }); } },
                        { label: __('Meta Text', 'blockenberg'), value: attr.metaColor, onChange: function (v) { set({ metaColor: v || '#4b7a5a' }); } },
                        { label: __('Level Badge BG', 'blockenberg'), value: attr.levelBg, onChange: function (v) { set({ levelBg: v || '#16a34a' }); } },
                        { label: __('Level Badge Text', 'blockenberg'), value: attr.levelColor, onChange: function (v) { set({ levelColor: v || '#ffffff' }); } }
                    ]
                }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Heading'), value: attr.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Objective'), value: attr.objectiveTypo || {}, onChange: function (v) { set({ objectiveTypo: v }); } })
                    ),

            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    header,
                    listEl,
                    el('div', { style: { marginTop: '16px', paddingTop: '14px', borderTop: '1px solid ' + attr.borderColor, display: 'flex', justifyContent: 'flex-end' } },
                        el(Button, { variant: 'secondary', onClick: function () { set({ objectives: (attr.objectives || []).concat([{ text: '' }]) }); } }, __('+ Add Objective', 'blockenberg'))
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-lob-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
