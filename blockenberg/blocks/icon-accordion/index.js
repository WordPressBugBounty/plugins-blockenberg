( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var Fragment = wp.element.Fragment;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    /* Expand icons */
    var expandIcons = {
        chevron: { open: '▾', closed: '▸' },
        plus: { open: '−', closed: '+' },
        arrow: { open: '↑', closed: '↓' },
        caret: { open: '◀', closed: '▶' }
    };

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

    registerBlockType('blockenberg/icon-accordion', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var items = attr.items || [];

            var openState = useState(items.map(function (it) { return it.defaultOpen || false; }));
            var openArr = openState[0];
            var setOpenArr = openState[1];

            function toggleOpen(idx) {
                var next;
                if (attr.allowMultiple) {
                    next = openArr.map(function (v, i) { return i === idx ? !v : v; });
                } else {
                    next = openArr.map(function (v, i) { return i === idx ? !v : false; });
                }
                setOpenArr(next);
            }

            function updateItem(idx, field, val) {
                var updated = items.map(function (it, i) {
                    if (i !== idx) return it;
                    var p = {}; p[field] = val;
                    return Object.assign({}, it, p);
                });
                set({ items: updated });
            }

            function addItem() {
                var icons = ['💡', '🔥', '✨', '🎯', '🚀', '💎', '🌟', '⚙️'];
                var bgs = ['#ede9fe', '#fce7f3', '#dcfce7', '#fef9c3', '#dbeafe', '#ffedd5'];
                var cols = ['#6366f1', '#ec4899', '#16a34a', '#ca8a04', '#2563eb', '#ea580c'];
                var n = items.length % icons.length;
                set({ items: items.concat([{ icon: icons[n], iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', iconBg: bgs[n], iconColor: cols[n], title: 'New Item', content: 'Describe this feature or answer here.', badge: '', defaultOpen: false }]) });
                setOpenArr(openArr.concat([false]));
            }

            function removeItem(idx) {
                set({ items: items.filter(function (_, i) { return i !== idx; }) });
                setOpenArr(openArr.filter(function (_, i) { return i !== idx; }));
            }

            function moveItem(idx, dir) {
                var arr = items.slice();
                var oArr = openArr.slice();
                var t = idx + dir;
                if (t < 0 || t >= arr.length) return;
                var tmp = arr[idx]; arr[idx] = arr[t]; arr[t] = tmp;
                var oTmp = oArr[idx]; oArr[idx] = oArr[t]; oArr[t] = oTmp;
                set({ items: arr }); setOpenArr(oArr);
            }

            var expIcons = expandIcons[attr.expandIcon] || expandIcons.chevron;
            var iStyle = attr.iconStyle;
            var iRadius = iStyle === 'circle' ? '50%' : iStyle === 'rounded' ? '10px' : '4px';

            /* Accordion style helpers */
            function panelStyle(isOpen) {
                var base = {
                    background: attr.panelBg,
                    borderRadius: attr.borderRadius + 'px',
                    marginBottom: attr.gap + 'px',
                    overflow: 'hidden'
                };
                if (attr.accordionStyle === 'card') {
                    base.border = '1px solid ' + attr.panelBorder;
                    base.boxShadow = isOpen ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
                }
                if (attr.accordionStyle === 'filled') {
                    base.background = isOpen ? attr.accentColor : attr.panelBg;
                }
                if (attr.accordionStyle === 'minimal') {
                    base.borderBottom = '1px solid ' + attr.panelBorder;
                    base.borderRadius = '0';
                    base.background = 'transparent';
                }
                return base;
            }

            /* Inspector */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Accordion Settings', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'),
                        value: attr.accordionStyle,
                        options: [
                            { label: 'Card (bordered)', value: 'card' },
                            { label: 'Filled (accent on open)', value: 'filled' },
                            { label: 'Minimal (underline)', value: 'minimal' },
                            { label: 'Default (flat)', value: 'default' }
                        ],
                        onChange: function (v) { set({ accordionStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Icon Shape', 'blockenberg'),
                        value: attr.iconStyle,
                        options: [
                            { label: 'Rounded Square', value: 'rounded' },
                            { label: 'Circle', value: 'circle' },
                            { label: 'Square', value: 'square' }
                        ],
                        onChange: function (v) { set({ iconStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: attr.iconSize, min: 28, max: 72,
                        onChange: function (v) { set({ iconSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Expand Icon', 'blockenberg'),
                        value: attr.expandIcon,
                        options: [
                            { label: 'Chevron ▾', value: 'chevron' },
                            { label: 'Plus / Minus + −', value: 'plus' },
                            { label: 'Arrow ↓', value: 'arrow' },
                            { label: 'Caret ▶', value: 'caret' }
                        ],
                        onChange: function (v) { set({ expandIcon: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Allow Multiple Open', 'blockenberg'),
                        checked: attr.allowMultiple,
                        onChange: function (v) { set({ allowMultiple: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Items (px)', 'blockenberg'),
                        value: attr.gap, min: 0, max: 40,
                        onChange: function (v) { set({ gap: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: attr.borderRadius, min: 0, max: 24,
                        onChange: function (v) { set({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { set({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), typo: attr.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                    getTypographyControl() && el(getTypographyControl(), { label: __('Content', 'blockenberg'), typo: attr.contentTypo || {}, onChange: function (v) { set({ contentTypo: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '' }); }, label: __('Section Background', 'blockenberg') },
                        { value: attr.panelBg, onChange: function (v) { set({ panelBg: v || '#ffffff' }); }, label: __('Panel Background', 'blockenberg') },
                        { value: attr.panelBorder, onChange: function (v) { set({ panelBorder: v || '#e5e7eb' }); }, label: __('Panel Border', 'blockenberg') },
                        { value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); }, label: __('Title', 'blockenberg') },
                        { value: attr.contentColor, onChange: function (v) { set({ contentColor: v || '#6b7280' }); }, label: __('Content', 'blockenberg') },
                        { value: attr.badgeBg, onChange: function (v) { set({ badgeBg: v || '#f3f4f6' }); }, label: __('Badge Background', 'blockenberg') },
                        { value: attr.badgeColor, onChange: function (v) { set({ badgeColor: v || '#374151' }); }, label: __('Badge Text', 'blockenberg') },
                        { value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); }, label: __('Accent / Filled BG', 'blockenberg') },
                        { value: attr.expandColor, onChange: function (v) { set({ expandColor: v || '#9ca3af' }); }, label: __('Expand Icon', 'blockenberg') }
                    ]
                })
            );

            /* Editor render */
            var wrapEditorStyle = { background: attr.bgColor || '', paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' };
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(wrapEditorStyle, _tv(attr.titleTypo, '--bkbg-iac-tt-'));
                Object.assign(wrapEditorStyle, _tv(attr.contentTypo, '--bkbg-iac-ct-'));
            }
            wrapEditorStyle['--bkbg-iac-tt-sz'] = (attr.titleFontSize || 15) + 'px';
            wrapEditorStyle['--bkbg-iac-tt-w'] = attr.titleFontWeight || '700';
            wrapEditorStyle['--bkbg-iac-tt-lh'] = attr.titleLineHeight || 1.3;
            wrapEditorStyle['--bkbg-iac-ct-sz'] = (attr.contentFontSize || 14) + 'px';
            wrapEditorStyle['--bkbg-iac-ct-w'] = attr.contentFontWeight || '400';
            wrapEditorStyle['--bkbg-iac-ct-lh'] = attr.contentLineHeight || 1.7;

            var wrap = el('div', { style: wrapEditorStyle },
                items.map(function (it, idx) {
                    var isOpen = openArr[idx];
                    var isFilled = attr.accordionStyle === 'filled' && isOpen;
                    var tColor = isFilled ? '#ffffff' : attr.titleColor;
                    var cColor = isFilled ? 'rgba(255,255,255,0.8)' : attr.contentColor;

                    return el('div', { key: idx, style: panelStyle(isOpen) },
                        /* Header */
                        el('div', {
                            onClick: function () { toggleOpen(idx); },
                            style: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', cursor: 'pointer', userSelect: 'none', background: attr.headerBg || 'transparent' }
                        },
                            /* Icon */
                            el('div', {
                                style: {
                                    width: attr.iconSize + 'px', height: attr.iconSize + 'px',
                                    background: isFilled ? 'rgba(255,255,255,0.2)' : it.iconBg,
                                    borderRadius: iRadius, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: (attr.iconSize * 0.5) + 'px',
                                    flexShrink: 0
                                }
                            }, (it.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(it.iconType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor) : (it.icon || '●')),
                            /* Title + badge */
                            el('div', { style: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 } },
                                el('span', { className: 'bkbg-iac-title', style: { color: tColor, fontFamily: 'var(--bkbg-iac-tt-font-family, inherit)', fontSize: 'var(--bkbg-iac-tt-font-size-d, var(--bkbg-iac-tt-sz, 15px))', fontWeight: 'var(--bkbg-iac-tt-font-weight, var(--bkbg-iac-tt-w, 700))', lineHeight: 'var(--bkbg-iac-tt-line-height-d, var(--bkbg-iac-tt-lh, 1.3))' } }, it.title || ''),
                                it.badge && el('span', { style: { background: isFilled ? 'rgba(255,255,255,0.25)' : attr.badgeBg, color: isFilled ? '#fff' : attr.badgeColor, fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px' } }, it.badge)
                            ),
                            /* Expand icon */
                            el('span', { style: { color: isFilled ? 'rgba(255,255,255,0.7)' : attr.expandColor, fontSize: '18px', transition: 'transform 0.3s', transform: isOpen ? '' : (attr.expandIcon === 'chevron' ? 'rotate(-90deg)' : '') } }, isOpen ? expIcons.open : expIcons.closed)
                        ),
                        /* Content */
                        isOpen && el('div', { style: { padding: '0 18px 16px', paddingLeft: (18 + attr.iconSize + 14) + 'px' } },
                            el(RichText, {
                                tagName: 'p',
                                value: it.content,
                                onChange: function (v) { updateItem(idx, 'content', v); },
                                placeholder: __('Item content...', 'blockenberg'),
                                style: { color: cColor, margin: 0, fontFamily: 'var(--bkbg-iac-ct-font-family, inherit)', fontSize: 'var(--bkbg-iac-ct-font-size-d, var(--bkbg-iac-ct-sz, 14px))', fontWeight: 'var(--bkbg-iac-ct-font-weight, var(--bkbg-iac-ct-w, 400))', lineHeight: 'var(--bkbg-iac-ct-line-height-d, var(--bkbg-iac-ct-lh, 1.7))' }
                            })
                        ),
                        /* Item controls */
                        el('div', { style: { display: 'flex', gap: '6px', padding: '4px 18px 10px', flexWrap: 'wrap' } },
                            el(IP().IconPickerControl, { iconType: it.iconType || 'custom-char', customChar: it.icon, dashicon: it.iconDashicon || '', imageUrl: it.iconImageUrl || '',
                                onChangeType: function (v) { updateItem(idx, 'iconType', v); }, onChangeChar: function (v) { updateItem(idx, 'icon', v); },
                                onChangeDashicon: function (v) { updateItem(idx, 'iconDashicon', v); }, onChangeImageUrl: function (v) { updateItem(idx, 'iconImageUrl', v); } }),
                            el(TextControl, { label: 'Badge', value: it.badge, onChange: function (v) { updateItem(idx, 'badge', v); }, style: { width: '80px' }, placeholder: 'Optional', __nextHasNoMarginBottom: true }),
                            el(BkbgColorSwatch, { label: 'Icon BG', value: it.iconBg, onChange: function (v) { updateItem(idx, 'iconBg', v); } }),
                            idx > 0 && el(Button, { onClick: function () { moveItem(idx, -1); }, variant: 'tertiary', isSmall: true }, '↑'),
                            idx < items.length - 1 && el(Button, { onClick: function () { moveItem(idx, 1); }, variant: 'tertiary', isSmall: true }, '↓'),
                            el(Button, { onClick: function () { removeItem(idx); }, variant: 'link', isDestructive: true, isSmall: true }, __('Remove', 'blockenberg'))
                        )
                    );
                }),
                el(Button, { onClick: addItem, variant: 'primary', isSmall: true, style: { marginTop: '8px' } }, __('+ Add Item', 'blockenberg'))
            );

            return el(Fragment, {}, inspector, el('div', useBlockProps(), wrap));
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-iac-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
