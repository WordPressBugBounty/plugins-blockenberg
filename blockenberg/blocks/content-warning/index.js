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

    var TYPE_OPTIONS = [
        { value: 'sensitive', label: 'Sensitive Content' },
        { value: 'spoiler',   label: 'Spoiler' },
        { value: 'mature',    label: 'Mature / 18+' },
        { value: 'trauma',    label: 'Trauma / Distressing' },
        { value: 'custom',    label: 'Custom' }
    ];

    var TYPE_ICONS = { sensitive: '⚠️', spoiler: '🚨', mature: '🔞', trauma: '💔', custom: '⚠️' };

    var STYLE_OPTIONS = [
        { value: 'box',    label: 'Box (filled)' },
        { value: 'banner', label: 'Banner (accent stripe)' },
        { value: 'pill',   label: 'Pill badge' },
        { value: 'outline',label: 'Outline (no fill)' }
    ];

    function getDefaultIcon(type) { return TYPE_ICONS[type] || '⚠️'; }

    var _cwTC, _cwTV;
    function _tc() { return _cwTC || (_cwTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cwTV || (_cwTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    var _IP;
    function IP() { return _IP || (_IP = window.bkbgIconPicker); }

    registerBlockType('blockenberg/content-warning', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({ paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' }, _tv(attr.typoLabel, '--bkbg-cw-label-'), _tv(attr.typoMessage, '--bkbg-cw-msg-')) });

            var wrapStyle = {
                background: attr.bgColor,
                borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden'
            };
            if (attr.style === 'box') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '16px 20px';
            } else if (attr.style === 'banner') {
                wrapStyle.borderLeft = '5px solid ' + attr.accentColor;
                wrapStyle.borderTop = '1px solid ' + attr.borderColor;
                wrapStyle.borderRight = '1px solid ' + attr.borderColor;
                wrapStyle.borderBottom = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '14px 18px';
            } else if (attr.style === 'pill') {
                wrapStyle.border = '2px solid ' + attr.accentColor;
                wrapStyle.padding = '12px 18px';
                wrapStyle.borderRadius = '999px';
            } else if (attr.style === 'outline') {
                wrapStyle.background = 'transparent';
                wrapStyle.border = '2px solid ' + attr.borderColor;
                wrapStyle.padding = '16px 20px';
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Warning Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Warning Type', 'blockenberg'), value: attr.warningType, options: TYPE_OPTIONS, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ warningType: v, icon: getDefaultIcon(v), iconType: 'custom-char' }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Label Text', 'blockenberg'), value: attr.label, __nextHasNoMarginBottom: true, onChange: function (v) { set({ label: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), checked: attr.showIcon, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIcon: v }); } })
                    ),
                    attr.showIcon && el('div', { style: { marginTop: '8px' } },
                        el(IP().IconPickerControl, IP().iconPickerProps(attr, set))
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Topics (comma-separated)', 'blockenberg'), value: attr.topics, placeholder: 'violence, strong language', __nextHasNoMarginBottom: true, onChange: function (v) { set({ topics: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Extended Message', 'blockenberg'), checked: attr.showMessage, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMessage: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Collapsible (hide content until confirmed)', 'blockenberg'), checked: attr.collapsible, __nextHasNoMarginBottom: true, onChange: function (v) { set({ collapsible: v }); } })
                    ),
                    attr.collapsible && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Button Label', 'blockenberg'), value: attr.buttonLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ buttonLabel: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Style & Spacing', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Style', 'blockenberg'), value: attr.style, options: STYLE_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ style: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 40, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#fef2f2' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#fca5a5' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#dc2626' }); } },
                        { label: __('Label Text', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#7f1d1d' }); } },
                        { label: __('Message Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#450a0a' }); } },
                        { label: __('Topic Tag Background', 'blockenberg'), value: attr.topicBg, onChange: function (v) { set({ topicBg: v || '#fee2e2' }); } },
                        { label: __('Topic Tag Text', 'blockenberg'), value: attr.topicColor, onChange: function (v) { set({ topicColor: v || '#991b1b' }); } },
                        { label: __('Button Background', 'blockenberg'), value: attr.btnBg, onChange: function (v) { set({ btnBg: v || '#dc2626' }); } },
                        { label: __('Button Text', 'blockenberg'), value: attr.btnColor, onChange: function (v) { set({ btnColor: v || '#ffffff' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Label', 'blockenberg'), value: attr.typoLabel, onChange: function (v) { set({ typoLabel: v }); } }),
                    _tc() && el(_tc(), { label: __('Message', 'blockenberg'), value: attr.typoMessage, onChange: function (v) { set({ typoMessage: v }); } })
                )
            );

            /* editor preview */
            var topicChips = attr.topics && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' } },
                attr.topics.split(',').map(function (t, i) {
                    var text = t.trim();
                    if (!text) return null;
                    return el('span', { key: i, style: { background: attr.topicBg, color: attr.topicColor, padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 } }, text);
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        attr.showIcon && IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, { dashiconColor: attr.iconDashiconColor, style: { fontSize: '18px', lineHeight: 1 } }),
                        el('span', { className: 'bkbg-cw-label', style: { color: attr.labelColor } }, attr.label)
                    ),
                    topicChips,
                    attr.showMessage && el(RichText, {
                        tagName: 'p', className: 'bkbg-cw-message', value: attr.message,
                        allowedFormats: ['core/bold', 'core/italic', 'core/link'],
                        placeholder: __('Optional extended message…', 'blockenberg'),
                        style: { color: attr.textColor },
                        onChange: function (v) { set({ message: v }); }
                    }),
                    attr.collapsible && el('div', { style: { marginTop: '10px', textAlign: 'center' } },
                        el('span', { style: { background: attr.btnBg, color: attr.btnColor, padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'inline-block', cursor: 'pointer' } }, attr.buttonLabel)
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cw-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
