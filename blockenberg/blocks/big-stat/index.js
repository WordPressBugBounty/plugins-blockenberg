( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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

    function getTypographyControl() { return window.bkbgTypographyControl; }
    function getTypoCssVars() { return window.bkbgTypoCssVars; }

    var styleOptions = [
        { label: __('Centered', 'blockenberg'), value: 'centered' },
        { label: __('Left Aligned', 'blockenberg'), value: 'left' },
        { label: __('Card', 'blockenberg'), value: 'card' },
        { label: __('Gradient Card', 'blockenberg'), value: 'gradient' },
        { label: __('Border Left', 'blockenberg'), value: 'border-left' },
        { label: __('Pill Badge', 'blockenberg'), value: 'pill' }
    ];

    var iconOptions = [
        'star-filled', 'chart-line', 'chart-bar', 'heart', 'thumbs-up', 'smiley',
        'performance', 'award', 'trophy', 'shield', 'checkmark', 'yes', 'yes-alt',
        'groups', 'networking', 'cloud', 'update', 'info', 'warning', 'flag'
    ];

    registerBlockType('blockenberg/big-stat', {
        title: __('Big Stat', 'blockenberg'),
        icon: 'chart-bar',
        category: 'bkbg-content',
        description: __('Display a single large impactful statistic.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            function wrapStyle(a) {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-bs-accent': a.accentColor,
                    '--bkbg-bs-value-c': a.valueColor,
                    '--bkbg-bs-label-c': a.labelColor,
                    '--bkbg-bs-sub-c': a.sublabelColor,
                    '--bkbg-bs-bg': a.bgColor,
                    '--bkbg-bs-icon-c': a.iconColor,
                    '--bkbg-bs-icon-sz': a.iconSize + 'px',
                    '--bkbg-bs-r': a.borderRadius + 'px',
                    '--bkbg-bs-p': a.padding + 'px',
                    '--bkbg-bs-div-w': a.dividerWidth + 'px',
                    '--bkbg-bs-ps-sz': a.prefixSuffixSize + 'px'
                };
                if (_tv) {
                    Object.assign(s, _tv(a.valueTypo || {}, '--bkbg-bs-value-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkbg-bs-label-'));
                    Object.assign(s, _tv(a.sublabelTypo || {}, '--bkbg-bs-sub-'));
                }
                return s;
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Value & Labels', 'blockenberg'), initialOpen: true },
                    el(TextControl, {
                        label: __('Prefix (e.g. $, +)', 'blockenberg'),
                        value: a.prefix,
                        onChange: function (v) { setAttributes({ prefix: v }); }
                    }),
                    el(TextControl, {
                        label: __('Value', 'blockenberg'),
                        value: a.value,
                        onChange: function (v) { setAttributes({ value: v }); }
                    }),
                    el(TextControl, {
                        label: __('Suffix (e.g. %, x, k)', 'blockenberg'),
                        value: a.suffix,
                        onChange: function (v) { setAttributes({ suffix: v }); }
                    }),
                    el(TextControl, {
                        label: __('Label', 'blockenberg'),
                        value: a.label,
                        onChange: function (v) { setAttributes({ label: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Sub-label / Source', 'blockenberg'),
                        checked: a.showSublabel,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSublabel: v }); }
                    }),
                    a.showSublabel && el(TextControl, {
                        label: __('Sub-label', 'blockenberg'),
                        value: a.sublabel,
                        onChange: function (v) { setAttributes({ sublabel: v }); }
                    })
                ),

                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Visual Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { setAttributes({ style: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Divider', 'blockenberg'),
                        checked: a.showDivider,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showDivider: v }); }
                    }),
                    a.showDivider && el(RangeControl, {
                        label: __('Divider Width (px)', 'blockenberg'),
                        value: a.dividerWidth,
                        onChange: function (v) { setAttributes({ dividerWidth: v }); },
                        min: 16, max: 200
                    }),
                    el(RangeControl, {
                        label: __('Padding (px)', 'blockenberg'),
                        value: a.padding,
                        onChange: function (v) { setAttributes({ padding: v }); },
                        min: 0, max: 80
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius,
                        onChange: function (v) { setAttributes({ borderRadius: v }); },
                        min: 0, max: 40
                    })
                ),

                el(PanelBody, { title: __('Icon', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    a.showIcon && el(SelectControl, {
                        label: __('Icon', 'blockenberg'),
                        value: a.icon,
                        options: iconOptions.map(function (ic) { return { label: ic, value: ic }; }),
                        onChange: function (v) { setAttributes({ icon: v }); }
                    }),
                    a.showIcon && el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: a.iconSize,
                        onChange: function (v) { setAttributes({ iconSize: v }); },
                        min: 20, max: 80
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Value', 'blockenberg'), value: a.valueTypo || {}, onChange: function (v) { setAttributes({ valueTypo: v }); } }) : null; })(),
                    (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function (v) { setAttributes({ labelTypo: v }); } }) : null; })(),
                    (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Sub-label', 'blockenberg'), value: a.sublabelTypo || {}, onChange: function (v) { setAttributes({ sublabelTypo: v }); } }) : null; })(),
                    el(RangeControl, {
                        label: __('Prefix/Suffix Size (px)', 'blockenberg'),
                        value: a.prefixSuffixSize,
                        onChange: function (v) { setAttributes({ prefixSuffixSize: v }); },
                        min: 16, max: 100
                    })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.valueColor, onChange: function (v) { setAttributes({ valueColor: v || '#0f172a' }); }, label: __('Value Color', 'blockenberg') },
                        { value: a.labelColor, onChange: function (v) { setAttributes({ labelColor: v || '#1e293b' }); }, label: __('Label Color', 'blockenberg') },
                        { value: a.sublabelColor, onChange: function (v) { setAttributes({ sublabelColor: v || '#94a3b8' }); }, label: __('Sub-label Color', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') },
                        { value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#f8fafc' }); }, label: __('Background Color', 'blockenberg') },
                        { value: a.iconColor, onChange: function (v) { setAttributes({ iconColor: v || '#6c3fb5' }); }, label: __('Icon Color', 'blockenberg') }
                    ]
                })
            );

            var wrapClass = 'bkbg-bs-wrap bkbg-bs-style--' + a.style;
            var blockProps = useBlockProps({ className: wrapClass, style: wrapStyle(a) });

            var iconEl = a.showIcon
                ? el('span', { className: 'bkbg-bs-icon dashicons dashicons-' + a.icon })
                : null;

            var valueEl = el('div', { className: 'bkbg-bs-value-row' },
                a.prefix && el('span', { className: 'bkbg-bs-prefix' }, a.prefix),
                el('span', { className: 'bkbg-bs-value' }, a.value || '0'),
                a.suffix && el('span', { className: 'bkbg-bs-suffix' }, a.suffix)
            );

            var dividerEl = a.showDivider
                ? el('div', { className: 'bkbg-bs-divider' })
                : null;

            var labelEl = el('div', { className: 'bkbg-bs-label' }, a.label);
            var sublabelEl = a.showSublabel
                ? el('div', { className: 'bkbg-bs-sublabel' }, a.sublabel)
                : null;

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-bs-inner' },
                        iconEl,
                        valueEl,
                        dividerEl,
                        labelEl,
                        sublabelEl
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function wrapStyle(a) {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-bs-accent': a.accentColor,
                    '--bkbg-bs-value-c': a.valueColor,
                    '--bkbg-bs-label-c': a.labelColor,
                    '--bkbg-bs-sub-c': a.sublabelColor,
                    '--bkbg-bs-bg': a.bgColor,
                    '--bkbg-bs-icon-c': a.iconColor,
                    '--bkbg-bs-icon-sz': a.iconSize + 'px',
                    '--bkbg-bs-r': a.borderRadius + 'px',
                    '--bkbg-bs-p': a.padding + 'px',
                    '--bkbg-bs-div-w': a.dividerWidth + 'px',
                    '--bkbg-bs-ps-sz': a.prefixSuffixSize + 'px'
                };
                if (_tv) {
                    Object.assign(s, _tv(a.valueTypo || {}, '--bkbg-bs-value-'));
                    Object.assign(s, _tv(a.labelTypo || {}, '--bkbg-bs-label-'));
                    Object.assign(s, _tv(a.sublabelTypo || {}, '--bkbg-bs-sub-'));
                }
                return s;
            }

            var wrapClass = 'bkbg-bs-wrap bkbg-bs-style--' + a.style;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapClass, style: wrapStyle(a) });

            return el('div', blockProps,
                el('div', { className: 'bkbg-bs-inner' },
                    a.showIcon && el('span', { className: 'bkbg-bs-icon dashicons dashicons-' + a.icon }),
                    el('div', { className: 'bkbg-bs-value-row' },
                        a.prefix && el('span', { className: 'bkbg-bs-prefix' }, a.prefix),
                        el('span', {
                            className: 'bkbg-bs-value',
                            'data-target': a.value,
                            'data-animate': a.animate ? 'true' : 'false',
                            'data-duration': a.animateDuration
                        }, a.value || '0'),
                        a.suffix && el('span', { className: 'bkbg-bs-suffix' }, a.suffix)
                    ),
                    a.showDivider && el('div', { className: 'bkbg-bs-divider' }),
                    el('div', { className: 'bkbg-bs-label' }, a.label),
                    a.showSublabel && el('div', { className: 'bkbg-bs-sublabel' }, a.sublabel)
                )
            );
        }
    });
}() );
