( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var ICON_PRESETS = [
        { group: 'Stars & Awards',   icons: ['⭐','🌟','✨','🏆','🥇','🎖️','🏅','👑'] },
        { group: 'Arrows & Nav',     icons: ['→','←','↑','↓','↗','↘','➡️','⬅️','▶','▲','▼','◀'] },
        { group: 'Checks & Status',  icons: ['✅','✔️','❌','⚠️','ℹ️','❓','❗','🔴','🟡','🟢'] },
        { group: 'Tech & Work',      icons: ['💡','🔧','⚙️','🖥️','📱','💻','🔒','🔑','📊','📈','📉','🗂️'] },
        { group: 'People & Social',  icons: ['👋','🤝','👥','🧑‍💼','💬','📣','💌','📩','🔔','🎯'] },
        { group: 'Nature',           icons: ['🌱','🌿','🌲','🌸','🌊','☀️','🌙','⚡','🔥','❄️'] },
        { group: 'Commerce',         icons: ['🛒','💳','💰','💎','🎁','🚀','📦','🏷️','🤑','💸'] },
        { group: 'Learning',         icons: ['📚','✏️','🎓','🔬','🧪','🔭','🎨','🎵','📝','🗺️'] },
    ];

    var SHAPE_OPTIONS = [
        { label: 'Circle',   value: 'circle' },
        { label: 'Square',   value: 'square' },
        { label: 'Rounded',  value: 'rounded' },
        { label: 'Pill',     value: 'pill' },
        { label: 'No shape', value: 'none' },
    ];

    var ANIM_OPTIONS = [
        { label: 'None',    value: 'none' },
        { label: 'Bounce',  value: 'bounce' },
        { label: 'Pulse',   value: 'pulse' },
        { label: 'Float',   value: 'float' },
        { label: 'Spin',    value: 'spin' },
        { label: 'Shake',   value: 'shake' },
    ];

    var ALIGN_OPTIONS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];

    function getShapeStyle(a) {
        var r = a.shape === 'circle' ? '50%'
              : a.shape === 'square' ? '4px'
              : a.shape === 'rounded' ? '16px'
              : a.shape === 'pill' ? '999px'
              : '0';
        return {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: a.shape !== 'none' && a.showBg ? a.bgSize + 'px' : 'auto',
            height: a.shape !== 'none' && a.showBg ? a.bgSize + 'px' : 'auto',
            borderRadius: a.shape !== 'none' ? r : '0',
            background: a.showBg && a.shape !== 'none' ? a.bgColor : 'transparent',
            border: a.borderWidth > 0 ? a.borderWidth + 'px solid ' + a.borderColor : 'none',
            boxShadow: a.shadow ? '0 8px 24px rgba(0,0,0,0.18)' : 'none',
            fontSize: a.iconSize + 'px',
            lineHeight: '1',
            padding: a.shape === 'none' ? '0' : '8px',
            cursor: a.linkUrl ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'transform 0.2s',
        };
    }

    registerBlockType('blockenberg/icon', {
        title: __('Icon', 'blockenberg'),
        icon: 'star-filled',
        category: 'bkbg-content',
        description: __('Standalone styled icon with label, animation, link, and rich customization.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var bpStyle = { padding: '12px', background: a.containerBg || 'transparent' };
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(bpStyle, _tv(a.labelTypo, '--bkbg-ico-lb-'));
                Object.assign(bpStyle, _tv(a.subLabelTypo, '--bkbg-ico-sl-'));
            }
            bpStyle['--bkbg-ico-lb-sz'] = (a.labelSize || 16) + 'px';
            bpStyle['--bkbg-ico-lb-fw'] = a.labelFontWeight || '600';
            bpStyle['--bkbg-ico-lb-lh'] = a.labelLineHeight || 1.3;
            bpStyle['--bkbg-ico-sl-sz'] = (a.subLabelSize || 13) + 'px';
            bpStyle['--bkbg-ico-sl-fw'] = a.subLabelFontWeight || '400';
            bpStyle['--bkbg-ico-sl-lh'] = a.subLabelLineHeight || 1.4;
            var blockProps = useBlockProps({ style: bpStyle });

            var wrapStyle = {
                display: 'flex',
                flexDirection: 'column',
                alignItems: a.align === 'left' ? 'flex-start' : a.align === 'right' ? 'flex-end' : 'center',
                gap: a.gap + 'px',
                padding: a.containerPadding + 'px',
            };

            var iconStyle = getShapeStyle(a);
            if (a.bgColor && a.showBg && a.shape !== 'none') {
                // use filter to colorize if it's pure text - handled via color style
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    // Icon Panel
                    el(PanelBody, { title: 'Icon', initialOpen: true },
                        el(TextControl, {
                            label: 'Icon (emoji or symbol)',
                            value: a.icon,
                            onChange: function (v) { set({ icon: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { marginTop: 8 } },
                            el('p', { style: { fontSize: 11, color: '#757575', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' } },
                                'Quick Presets'
                            ),
                            ICON_PRESETS.map(function (group) {
                                return el('div', { key: group.group, style: { marginBottom: 6 } },
                                    el('p', { style: { fontSize: 11, color: '#9ca3af', marginBottom: 3 } }, group.group),
                                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
                                        group.icons.map(function (ic) {
                                            return el('button', {
                                                key: ic,
                                                onClick: function () { set({ icon: ic }); },
                                                style: {
                                                    background: a.icon === ic ? '#6366f1' : '#f3f4f6',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: 16,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                },
                                                title: ic,
                                            }, ic);
                                        })
                                    )
                                );
                            })
                        )
                    ),

                    // Shape Panel
                    el(PanelBody, { title: 'Shape & Size', initialOpen: false },
                        el(SelectControl, {
                            label: 'Shape',
                            value: a.shape,
                            options: SHAPE_OPTIONS,
                            onChange: function (v) { set({ shape: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Icon Size (px)',
                            value: a.iconSize,
                            min: 16, max: 140,
                            onChange: function (v) { set({ iconSize: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.shape !== 'none' && el(Fragment, null,
                            el('div', { style: { height: 12 } }),
                            el(ToggleControl, {
                                label: 'Show Background',
                                checked: a.showBg,
                                onChange: function (v) { set({ showBg: v }); },
                                __nextHasNoMarginBottom: true,
                            }),
                            a.showBg && el(RangeControl, {
                                label: 'Background Size (px)',
                                value: a.bgSize,
                                min: 32, max: 200,
                                onChange: function (v) { set({ bgSize: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Border Width (px)',
                            value: a.borderWidth,
                            min: 0, max: 8,
                            onChange: function (v) { set({ borderWidth: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Drop Shadow',
                            checked: a.shadow,
                            onChange: function (v) { set({ shadow: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Label Panel
                    el(PanelBody, { title: 'Label & Sub-Label', initialOpen: false },
                        el(ToggleControl, {
                            label: 'Show Label',
                            checked: a.showLabel,
                            onChange: function (v) { set({ showLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showLabel && el(Fragment, null,
                            el(TextControl, {
                                label: 'Label Text',
                                value: a.label,
                                onChange: function (v) { set({ label: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        ),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Show Sub-Label',
                            checked: a.showSubLabel,
                            onChange: function (v) { set({ showSubLabel: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        a.showSubLabel && el(Fragment, null,
                            el(TextControl, {
                                label: 'Sub-Label Text',
                                value: a.subLabel,
                                onChange: function (v) { set({ subLabel: v }); },
                                __nextHasNoMarginBottom: true,
                            })
                        )
                    ),

                    // Link Panel
                    el(PanelBody, { title: 'Link', initialOpen: false },
                        el(TextControl, {
                            label: 'URL',
                            value: a.linkUrl,
                            placeholder: 'https://',
                            onChange: function (v) { set({ linkUrl: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(ToggleControl, {
                            label: 'Open in new tab',
                            checked: a.linkNewTab,
                            onChange: function (v) { set({ linkNewTab: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Animation & Layout Panel
                    el(PanelBody, { title: 'Animation & Layout', initialOpen: false },
                        el(SelectControl, {
                            label: 'Animation',
                            value: a.animation,
                            options: ANIM_OPTIONS,
                            onChange: function (v) { set({ animation: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(SelectControl, {
                            label: 'Alignment',
                            value: a.align,
                            options: ALIGN_OPTIONS,
                            onChange: function (v) { set({ align: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Container Padding (px)',
                            value: a.containerPadding,
                            min: 0, max: 80,
                            onChange: function (v) { set({ containerPadding: v }); },
                            __nextHasNoMarginBottom: true,
                        }),
                        el('div', { style: { height: 12 } }),
                        el(RangeControl, {
                            label: 'Gap between elements (px)',
                            value: a.gap,
                            min: 0, max: 40,
                            onChange: function (v) { set({ gap: v }); },
                            __nextHasNoMarginBottom: true,
                        })
                    ),

                    // Colors Panel
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Container Background', value: a.containerBg, onChange: function (v) { set({ containerBg: v || '' }); } },
                            { label: 'Icon Background', value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#6366f1' }); } },
                            { label: 'Border Color', value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#6366f1' }); } },
                            { label: 'Label Color', value: a.labelColor, onChange: function (v) { set({ labelColor: v || '#111827' }); } },
                            { label: 'Sub-Label Color', value: a.subLabelColor, onChange: function (v) { set({ subLabelColor: v || '#6b7280' }); } },
                        ]
                    }),

                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Label', 'blockenberg'), typo: a.labelTypo || {}, onChange: function(v){ set({ labelTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Sub-Label', 'blockenberg'), typo: a.subLabelTypo || {}, onChange: function(v){ set({ subLabelTypo: v }); } })
                    )
                ),

                // Editor Preview
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el('div', { className: 'bkbg-icon-shape bkbg-icon-anim-' + a.animation, style: iconStyle },
                            el('span', { style: { fontSize: a.iconSize + 'px', lineHeight: '1', display: 'block' } }, a.icon)
                        ),
                        a.showLabel && a.label && el('div', {
                            className: 'bkbg-icon-label',
                            style: {
                                color: a.labelColor,
                                textAlign: a.align,
                            }
                        }, a.label),
                        a.showSubLabel && a.subLabel && el('div', {
                            className: 'bkbg-icon-sublabel',
                            style: {
                                color: a.subLabelColor,
                                textAlign: a.align,
                            }
                        }, a.subLabel)
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-icon-app',
                    'data-opts': JSON.stringify(props.attributes),
                })
            );
        }
    });
}() );
