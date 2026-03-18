( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var useState = wp.element.useState;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    function _tvString(typo, prefix) {
        var o = _tv(typo, prefix);
        var parts = [];
        for (var k in o) { if (o.hasOwnProperty(k)) parts.push(k + ':' + o[k]); }
        return parts.join(';');
    }

    var alignOptions = [
        { label: __('Left', 'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right', 'blockenberg'), value: 'right' }
    ];

    var directionOptions = [
        { label: __('Row (horizontal)', 'blockenberg'), value: 'row' },
        { label: __('Column (vertical)', 'blockenberg'), value: 'column' }
    ];

    var styleOptions = [
        { label: __('Primary (filled)', 'blockenberg'), value: 'primary' },
        { label: __('Outline', 'blockenberg'), value: 'outline' },
        { label: __('Ghost / Text', 'blockenberg'), value: 'ghost' },
        { label: __('Link', 'blockenberg'), value: 'link' }
    ];

    var sizeOptions = [
        { label: __('Small', 'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' },
        { label: __('Large', 'blockenberg'), value: 'lg' }
    ];

    var shadowOptions = [
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: __('Small', 'blockenberg'), value: 'sm' },
        { label: __('Medium', 'blockenberg'), value: 'md' }
    ];

    var hoverOptions = [
        { label: __('Lift (translate up)', 'blockenberg'), value: 'lift' },
        { label: __('Scale', 'blockenberg'), value: 'scale' },
        { label: __('Darken', 'blockenberg'), value: 'darken' },
        { label: __('None', 'blockenberg'), value: 'none' }
    ];

    var iconOptions = [
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: '→ Arrow Right', value: 'arrow-right' },
        { label: '↗ External', value: 'external' },
        { label: '▶ Play', value: 'play' },
        { label: '★ Star', value: 'star' },
        { label: '↓ Download', value: 'download' }
    ];

    var iconSvgs = {
        'none': '',
        'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        'external': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        'play': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>',
        'star': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>',
        'download': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
    };

    function getIconEl(iconKey) {
        var svg = iconSvgs[iconKey];
        if (!svg) return null;
        return el('span', {
            className: 'bkbg-bg-icon',
            'aria-hidden': 'true',
            dangerouslySetInnerHTML: { __html: svg }
        });
    }

    function getBtnClass(btn, a) {
        return 'bkbg-bg-btn bkbg-bg-btn-' + btn.style + ' bkbg-bg-btn-' + btn.size;
    }

    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el(Fragment, {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType('blockenberg/button-group', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            function updateBtn(index, field, value) {
                var newBtns = a.buttons.map(function (btn, i) {
                    if (i !== index) return btn;
                    var updated = {};
                    for (var k in btn) { updated[k] = btn[k]; }
                    updated[field] = value;
                    return updated;
                });
                setAttributes({ buttons: newBtns });
            }

            function addBtn() {
                setAttributes({
                    buttons: a.buttons.concat([{
                        label: 'New Button', url: '#', target: false, rel: '',
                        style: 'primary', size: 'md', icon: 'none', iconPosition: 'left',
                        customBg: '', customColor: '', customBorder: ''
                    }])
                });
            }

            function removeBtn(index) {
                if (a.buttons.length <= 1) return;
                setAttributes({ buttons: a.buttons.filter(function (_, i) { return i !== index; }) });
            }

            function moveBtn(index, dir) {
                var ni = index + dir;
                if (ni < 0 || ni >= a.buttons.length) return;
                var newBtns = a.buttons.slice();
                var tmp = newBtns[index]; newBtns[index] = newBtns[ni]; newBtns[ni] = tmp;
                setAttributes({ buttons: newBtns });
            }

            var wrapStyle = Object.assign({
                '--bkbg-bg-btn-bg': a.btnBg,
                '--bkbg-bg-btn-color': a.btnColor,
                '--bkbg-bg-outline-border': a.outlineBorderColor,
                '--bkbg-bg-outline-color': a.outlineColor,
                '--bkbg-bg-ghost-color': a.ghostColor,
                '--bkbg-bg-radius': a.btnRadius + 'px',
                '--bkbg-bg-padding': a.btnPaddingV + 'px ' + a.btnPaddingH + 'px',
                '--bkbg-bg-gap': a.gap + 'px'
            }, _tv(a.typoBtn, '--bkbg-bg-typo-'));

            var blockProps = useBlockProps({
                className: 'bkbg-bg-wrap bkbg-bg-editor',
                style: wrapStyle,
                'data-align': a.alignment,
                'data-direction': a.direction,
                'data-shadow': a.btnShadow,
                'data-hover': a.hoverEffect,
                'data-mobile-stack': a.mobileStack ? '1' : '0'
            });

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Buttons', 'blockenberg'), initialOpen: true },
                    a.buttons.map(function (btn, index) {
                        return el('div', {
                            key: 'btn-' + index,
                            className: 'bkbg-bg-inspector-btn',
                            style: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }
                        },
                            el('div', {
                                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }
                            },
                                el('strong', { style: { fontSize: '12px', color: '#374151' } }, __('Button', 'blockenberg') + ' ' + (index + 1)),
                                el('div', { style: { display: 'flex', gap: '4px' } },
                                    el(Button, { icon: 'arrow-up-alt2', isSmall: true, disabled: index === 0, onClick: function () { moveBtn(index, -1); } }),
                                    el(Button, { icon: 'arrow-down-alt2', isSmall: true, disabled: index === a.buttons.length - 1, onClick: function () { moveBtn(index, 1); } }),
                                    el(Button, { icon: 'trash', isSmall: true, isDestructive: true, disabled: a.buttons.length <= 1, onClick: function () { removeBtn(index); } })
                                )
                            ),
                            el(TextControl, { label: __('Label', 'blockenberg'), value: btn.label, onChange: function (v) { updateBtn(index, 'label', v); } }),
                            el(TextControl, { label: __('URL', 'blockenberg'), value: btn.url, type: 'url', onChange: function (v) { updateBtn(index, 'url', v); } }),
                            el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: btn.target, __nextHasNoMarginBottom: true, onChange: function (v) { updateBtn(index, 'target', v); } }),
                            el(SelectControl, { label: __('Style', 'blockenberg'), value: btn.style, options: styleOptions, onChange: function (v) { updateBtn(index, 'style', v); } }),
                            el(SelectControl, { label: __('Size', 'blockenberg'), value: btn.size, options: sizeOptions, onChange: function (v) { updateBtn(index, 'size', v); } }),
                            el(SelectControl, { label: __('Icon', 'blockenberg'), value: btn.icon, options: iconOptions, onChange: function (v) { updateBtn(index, 'icon', v); } }),
                            btn.icon !== 'none' && el(SelectControl, {
                                label: __('Icon Position', 'blockenberg'),
                                value: btn.iconPosition,
                                options: [{ label: __('Left', 'blockenberg'), value: 'left' }, { label: __('Right', 'blockenberg'), value: 'right' }],
                                onChange: function (v) { updateBtn(index, 'iconPosition', v); }
                            }),
                            el('details', { style: { fontSize: '12px', marginTop: '4px' } },
                                el('summary', { style: { cursor: 'pointer', color: '#6b7280' } }, __('Custom Colors (overrides)', 'blockenberg')),
                                el('div', { style: { marginTop: '8px' } },
                                    el(BkbgColorSwatch, { label: __('Background', 'blockenberg'), value: btn.customBg, onChange: function (v) { updateBtn(index, 'customBg', v); } }),
                                    el(BkbgColorSwatch, { label: __('Text Color', 'blockenberg'), value: btn.customColor, onChange: function (v) { updateBtn(index, 'customColor', v); } }),
                                    el(BkbgColorSwatch, { label: __('Border Color', 'blockenberg'), value: btn.customBorder, onChange: function (v) { updateBtn(index, 'customBorder', v); } })
                                )
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        onClick: addBtn,
                        style: { width: '100%' }
                    }, '+ ' + __('Add Button', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Alignment', 'blockenberg'), value: a.alignment, options: alignOptions, onChange: function (v) { setAttributes({ alignment: v }); } }),
                    el(SelectControl, { label: __('Direction', 'blockenberg'), value: a.direction, options: directionOptions, onChange: function (v) { setAttributes({ direction: v }); } }),
                    el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 4, max: 48, onChange: function (v) { setAttributes({ gap: v }); } }),
                    el(ToggleControl, { label: __('Stack on mobile', 'blockenberg'), checked: a.mobileStack, __nextHasNoMarginBottom: true, onChange: function (v) { setAttributes({ mobileStack: v }); } }),
                    el(ToggleControl, { label: __('Full width on mobile', 'blockenberg'), checked: a.fullWidthMobile, __nextHasNoMarginBottom: true, onChange: function (v) { setAttributes({ fullWidthMobile: v }); } })
                ),

                el(PanelBody, { title: __('Global Button Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.btnRadius, min: 0, max: 50, onChange: function (v) { setAttributes({ btnRadius: v }); } }),
                    el(RangeControl, { label: __('Padding Vertical (px)', 'blockenberg'), value: a.btnPaddingV, min: 4, max: 32, onChange: function (v) { setAttributes({ btnPaddingV: v }); } }),
                    el(RangeControl, { label: __('Padding Horizontal (px)', 'blockenberg'), value: a.btnPaddingH, min: 8, max: 64, onChange: function (v) { setAttributes({ btnPaddingH: v }); } }),
                    el(SelectControl, { label: __('Shadow', 'blockenberg'), value: a.btnShadow, options: shadowOptions, onChange: function (v) { setAttributes({ btnShadow: v }); } }),
                    el(SelectControl, { label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect, options: hoverOptions, onChange: function (v) { setAttributes({ hoverEffect: v }); } })
                ),

                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Button Text', 'blockenberg'), value: a.typoBtn, onChange: function (v) { setAttributes({ typoBtn: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Primary Button', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.btnBg, onChange: function (c) { setAttributes({ btnBg: c || '#2563eb' }); }, label: __('Background', 'blockenberg') },
                            { value: a.btnColor, onChange: function (c) { setAttributes({ btnColor: c || '#ffffff' }); }, label: __('Text', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Outline & Ghost Button', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.outlineBorderColor, onChange: function (c) { setAttributes({ outlineBorderColor: c || '#2563eb' }); }, label: __('Outline Border', 'blockenberg') },
                            { value: a.outlineColor, onChange: function (c) { setAttributes({ outlineColor: c || '#2563eb' }); }, label: __('Outline Text', 'blockenberg') },
                            { value: a.ghostColor, onChange: function (c) { setAttributes({ ghostColor: c || '#2563eb' }); }, label: __('Ghost / Link Text', 'blockenberg') }
                        ]
                    })
                )
            );

            var groupStyle = {
                justifyContent: a.alignment === 'center' ? 'center' : a.alignment === 'right' ? 'flex-end' : 'flex-start',
                flexDirection: a.direction
            };

            var buttonsEl = a.buttons.map(function (btn, index) {
                var btnStyle = { style: {} };
                if (btn.customBg) btnStyle.style.background = btn.customBg;
                if (btn.customColor) btnStyle.style.color = btn.customColor;
                if (btn.customBorder) btnStyle.style.borderColor = btn.customBorder;

                return el('div', { key: 'btn-' + index, className: 'bkbg-bg-btn-wrap' },
                    el('a', {
                        href: btn.url || '#',
                        className: getBtnClass(btn, a),
                        rel: btn.target ? 'noopener noreferrer' : undefined,
                        style: btnStyle.style
                    },
                        btn.iconPosition === 'left' && btn.icon !== 'none' && getIconEl(btn.icon),
                        el('span', {}, btn.label),
                        btn.iconPosition === 'right' && btn.icon !== 'none' && getIconEl(btn.icon)
                    )
                );
            });

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-bg-group', style: groupStyle },
                        buttonsEl
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            var tvStr = _tvString(a.typoBtn, '--bkbg-bg-typo-');
            var wrapStyle = [
                '--bkbg-bg-btn-bg:' + a.btnBg,
                '--bkbg-bg-btn-color:' + a.btnColor,
                '--bkbg-bg-outline-border:' + a.outlineBorderColor,
                '--bkbg-bg-outline-color:' + a.outlineColor,
                '--bkbg-bg-ghost-color:' + a.ghostColor,
                '--bkbg-bg-radius:' + a.btnRadius + 'px',
                '--bkbg-bg-padding:' + a.btnPaddingV + 'px ' + a.btnPaddingH + 'px',
                '--bkbg-bg-gap:' + a.gap + 'px'
            ].join(';') + (tvStr ? ';' + tvStr : '');

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-bg-wrap',
                style: wrapStyle,
                'data-align': a.alignment,
                'data-direction': a.direction,
                'data-shadow': a.btnShadow,
                'data-hover': a.hoverEffect,
                'data-mobile-stack': a.mobileStack ? '1' : '0',
                'data-full-mobile': a.fullWidthMobile ? '1' : '0'
            });

            var savedIconSvgs = {
                'none': '',
                'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
                'external': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
                'play': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>',
                'star': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>',
                'download': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
            };

            var justifyContent = a.alignment === 'center' ? 'center' : a.alignment === 'right' ? 'flex-end' : 'flex-start';

            var buttonsEl = a.buttons.map(function (btn, index) {
                var btnInlineStyle = {};
                if (btn.customBg) btnInlineStyle.background = btn.customBg;
                if (btn.customColor) btnInlineStyle.color = btn.customColor;
                if (btn.customBorder) btnInlineStyle.borderColor = btn.customBorder;

                var hasStyle = Object.keys(btnInlineStyle).length > 0;

                var iconEl = btn.icon && btn.icon !== 'none' ? wp.element.createElement('span', {
                    className: 'bkbg-bg-icon',
                    'aria-hidden': 'true',
                    dangerouslySetInnerHTML: { __html: savedIconSvgs[btn.icon] || '' }
                }) : null;

                return wp.element.createElement('div', { key: 'btn-' + index, className: 'bkbg-bg-btn-wrap' },
                    wp.element.createElement('a', {
                        href: btn.url || '#',
                        className: 'bkbg-bg-btn bkbg-bg-btn-' + btn.style + ' bkbg-bg-btn-' + btn.size,
                        target: btn.target ? '_blank' : undefined,
                        rel: btn.target ? 'noopener noreferrer' : undefined,
                        style: hasStyle ? btnInlineStyle : undefined
                    },
                        btn.iconPosition === 'left' && iconEl,
                        wp.element.createElement('span', {}, btn.label),
                        btn.iconPosition === 'right' && iconEl
                    )
                );
            });

            return wp.element.createElement('div', blockProps,
                wp.element.createElement('div', {
                    className: 'bkbg-bg-group',
                    style: { justifyContent: justifyContent, flexDirection: a.direction }
                }, buttonsEl)
            );
        }
    });
}() );
