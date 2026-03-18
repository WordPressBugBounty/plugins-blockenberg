( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _cbTC, _cbTV;
    function _tc() { return _cbTC || (_cbTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cbTV || (_cbTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }
    var IP = function () { return window.bkbgIconPicker; };

    function cornerRadius(corners) {
        return corners === 'pill' ? 999 : corners === 'rounded' ? 8 : 0;
    }

    function getButtonStyle(attr) {
        var r = cornerRadius(attr.corners) + 'px';
        var base = {
            display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            padding: attr.paddingV + 'px ' + attr.paddingH + 'px',
            borderRadius: r,
            cursor: 'pointer',
            textDecoration: 'none',
            position: 'relative',
            overflow: 'hidden',
            border: attr.borderWidth + 'px solid ' + attr.borderColor,
            transition: 'all 0.25s ease'
        };
        if (attr.buttonStyle === 'outline') {
            base.background = 'transparent';
            base.color = attr.bgColor;
        } else if (attr.buttonStyle === 'ghost') {
            base.background = 'transparent';
            base.color = attr.bgColor;
            base.border = 'none';
        } else if (attr.buttonStyle === 'gradient') {
            base.background = 'linear-gradient(to right, ' + attr.gradientFrom + ', ' + attr.gradientTo + ')';
            base.color = attr.textColor;
            base.border = 'none';
        } else {
            base.background = attr.bgColor;
            base.color = attr.textColor;
        }
        return base;
    }

    registerBlockType('blockenberg/creative-button', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-cb2-editor', style: Object.assign({}, _tv(attr.typoBtn, '--bkbg-cb2-btn-')) });

            var btnStyle = getButtonStyle(attr);
            var wrapStyle = { textAlign: attr.centered ? 'center' : 'left', padding: '20px 0' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Button', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.url, onChange: function (v) { setAttr({ url: v }); } }),
                        el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.openNewTab, onChange: function (v) { setAttr({ openNewTab: v }); } }),
                        el(ToggleControl, { label: __('Centered', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.centered, onChange: function (v) { setAttr({ centered: v }); } }),
                        el(ToggleControl, { label: __('Full Width', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.fullWidth, onChange: function (v) { setAttr({ fullWidth: v }); } })
                    ),
                    el(PanelBody, { title: __('Style & Effect', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Button Style', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.buttonStyle,
                            options: [
                                { label: __('Filled (solid)', 'blockenberg'), value: 'filled' },
                                { label: __('Outline', 'blockenberg'), value: 'outline' },
                                { label: __('Ghost (no border)', 'blockenberg'), value: 'ghost' },
                                { label: __('Gradient', 'blockenberg'), value: 'gradient' }
                            ],
                            onChange: function (v) { setAttr({ buttonStyle: v }); } }),
                        el(SelectControl, { label: __('Hover Effect', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.hoverEffect,
                            options: [
                                { label: __('Slide — background wipes in', 'blockenberg'), value: 'slide' },
                                { label: __('Fill — expands from center', 'blockenberg'), value: 'fill' },
                                { label: __('Outline — inverts on hover', 'blockenberg'), value: 'outline' },
                                { label: __('3D Press — button depresses', 'blockenberg'), value: 'press3d' },
                                { label: __('Arrow — arrow slides in', 'blockenberg'), value: 'arrow' },
                                { label: __('Ripple — click wave effect', 'blockenberg'), value: 'ripple' }
                            ],
                            onChange: function (v) { setAttr({ hoverEffect: v }); } }),
                        el(SelectControl, { label: __('Corners', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.corners,
                            options: [{ label: __('Sharp', 'blockenberg'), value: 'sharp' }, { label: __('Rounded', 'blockenberg'), value: 'rounded' }, { label: __('Pill', 'blockenberg'), value: 'pill' }],
                            onChange: function (v) { setAttr({ corners: v }); } })
                    ),
                    el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Icon', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showIcon, onChange: function (v) { setAttr({ showIcon: v }); } }),
                        attr.showIcon && el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '12px' } }, __('Icon', 'blockenberg')),
                        attr.showIcon && el(IP().IconPickerControl, IP().iconPickerProps(attr, setAttr)),
                        attr.showIcon && el(SelectControl, { label: __('Icon Position', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.iconPosition,
                            options: [{ label: __('Left', 'blockenberg'), value: 'left' }, { label: __('Right', 'blockenberg'), value: 'right' }],
                            onChange: function (v) { setAttr({ iconPosition: v }); } }),
                        attr.showIcon && el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.iconSize, min: 10, max: 32, onChange: function (v) { setAttr({ iconSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Horizontal Padding (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingH, min: 8, max: 80, onChange: function (v) { setAttr({ paddingH: v }); } }),
                        el(RangeControl, { label: __('Vertical Padding (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingV, min: 4, max: 40, onChange: function (v) { setAttr({ paddingV: v }); } }),
                        el(RangeControl, { label: __('Border Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.borderWidth, min: 0, max: 6, onChange: function (v) { setAttr({ borderWidth: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Button', 'blockenberg'), value: attr.typoBtn, onChange: function (v) { setAttr({ typoBtn: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,       onChange: function (v) { setAttr({ bgColor: v || '#7c3aed' }); },       label: __('Button BG', 'blockenberg') },
                            { value: attr.textColor,     onChange: function (v) { setAttr({ textColor: v || '#ffffff' }); },     label: __('Button Text', 'blockenberg') },
                            { value: attr.hoverBg,       onChange: function (v) { setAttr({ hoverBg: v || '#4f46e5' }); },       label: __('Hover BG', 'blockenberg') },
                            { value: attr.hoverColor,    onChange: function (v) { setAttr({ hoverColor: v || '#ffffff' }); },    label: __('Hover Text', 'blockenberg') },
                            { value: attr.borderColor,   onChange: function (v) { setAttr({ borderColor: v || '#7c3aed' }); },   label: __('Border', 'blockenberg') },
                            { value: attr.gradientFrom,  onChange: function (v) { setAttr({ gradientFrom: v || '#7c3aed' }); },  label: __('Gradient Start', 'blockenberg') },
                            { value: attr.gradientTo,    onChange: function (v) { setAttr({ gradientTo: v || '#2563eb' }); },    label: __('Gradient End', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el('span', { className: 'bkbg-cb2-btn', style: Object.assign({}, btnStyle, { width: attr.fullWidth ? '100%' : 'auto' }) },
                            attr.showIcon && attr.iconPosition === 'left' && el('span', { className: 'bkbg-cb2-icon', style: { fontSize: attr.iconSize + 'px' } },
                                (!attr.iconType || attr.iconType === 'custom-char') ? attr.icon : IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, attr.iconDashiconColor)
                            ),
                            el(RichText, { tagName: 'span', value: attr.label, onChange: function (v) { setAttr({ label: v }); }, placeholder: 'Button label…' }),
                            attr.showIcon && attr.iconPosition === 'right' && el('span', { className: 'bkbg-cb2-icon', style: { fontSize: attr.iconSize + 'px' } },
                                (!attr.iconType || attr.iconType === 'custom-char') ? attr.icon : IP().buildEditorIcon(attr.iconType, attr.icon, attr.iconDashicon, attr.iconImageUrl, attr.iconDashiconColor)
                            )
                        ),
                        el('div', { style: { marginTop: 8, fontSize: 11, color: '#888', textAlign: 'center' } },
                            __('Effect: ', 'blockenberg') + attr.hoverEffect + ' — visible on frontend')
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save({ style: Object.assign({}, _tv(attr.typoBtn, '--bkbg-cb2-btn-')) }),
                el('div', { className: 'bkbg-creative-button-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
