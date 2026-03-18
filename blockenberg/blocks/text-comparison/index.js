( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var STYLE_OPTIONS = [
        { label: __('Cards (bordered)',  'blockenberg'), value: 'cards' },
        { label: __('Flat (no border)', 'blockenberg'), value: 'flat'  },
        { label: __('Filled',           'blockenberg'), value: 'filled' },
    ];
    var DIVIDER_OPTIONS = [
        { label: __('Line',  'blockenberg'), value: 'line'  },
        { label: __('VS Badge',  'blockenberg'), value: 'vs'    },
        { label: __('Arrow →', 'blockenberg'), value: 'arrow' },
        { label: __('None',  'blockenberg'), value: 'none'  },
    ];
    var ALIGN_OPTIONS = [
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Left',   'blockenberg'), value: 'left'   },
    ];

    function makeId() { return 'tc' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        var _tvf = getTypoCssVars();
        var s = {
            '--bkbg-tc-left-bg':         a.leftBg,
            '--bkbg-tc-right-bg':        a.rightBg,
            '--bkbg-tc-left-border':     a.leftBorderColor,
            '--bkbg-tc-right-border':    a.rightBorderColor,
            '--bkbg-tc-left-label':      a.leftLabelColor,
            '--bkbg-tc-right-label':     a.rightLabelColor,
            '--bkbg-tc-left-icon':       a.leftItemIconColor,
            '--bkbg-tc-right-icon':      a.rightItemIconColor,
            '--bkbg-tc-left-text':       a.leftTextColor,
            '--bkbg-tc-right-text':      a.rightTextColor,
            '--bkbg-tc-left-desc':       a.leftDescColor,
            '--bkbg-tc-right-desc':      a.rightDescColor,
            '--bkbg-tc-divider':         a.dividerColor,
            '--bkbg-tc-icon-sz':         a.iconSize + 'px',
            '--bkbg-tc-item-icon-sz':    a.itemIconSize + 'px',
            '--bkbg-tc-card-r':          a.cardRadius + 'px',
            '--bkbg-tc-card-pad':        a.cardPadding + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        if (_tvf) { Object.assign(s, _tvf(a.labelTypo, '--bktcm-lb-'), _tvf(a.descTypo, '--bktcm-ds-'), _tvf(a.itemTypo, '--bktcm-it-')); }
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Column component (editor) ──────────────────────────────────── */
    function CompareColumn(props) {
        var side      = props.side;   /* 'left' | 'right' */
        var a         = props.a;
        var setAttributes = props.setAttributes;

        var label       = side === 'left' ? a.leftLabel       : a.rightLabel;
        var description = side === 'left' ? a.leftDescription : a.rightDescription;
        var icon        = side === 'left' ? a.leftIcon        : a.rightIcon;
        var iconType    = side === 'left' ? (a.leftIconType || 'custom-char') : (a.rightIconType || 'custom-char');
        var iconDash    = side === 'left' ? a.leftIconDashicon : a.rightIconDashicon;
        var iconImg     = side === 'left' ? a.leftIconImageUrl : a.rightIconImageUrl;
        var items       = side === 'left' ? a.leftItems       : a.rightItems;
        var itemIcon    = side === 'left' ? a.leftItemIcon    : a.rightItemIcon;
        var itemIconType = side === 'left' ? (a.leftItemIconType || 'custom-char') : (a.rightItemIconType || 'custom-char');
        var itemIconDash = side === 'left' ? a.leftItemIconDashicon : a.rightItemIconDashicon;
        var itemIconImg  = side === 'left' ? a.leftItemIconImageUrl : a.rightItemIconImageUrl;

        var labelColor  = side === 'left' ? a.leftLabelColor  : a.rightLabelColor;
        var itemIconColor = side === 'left' ? a.leftItemIconColor : a.rightItemIconColor;
        var textColor   = side === 'left' ? a.leftTextColor   : a.rightTextColor;
        var descColor   = side === 'left' ? a.leftDescColor   : a.rightDescColor;
        var bg          = side === 'left' ? a.leftBg          : a.rightBg;
        var borderColor = side === 'left' ? a.leftBorderColor : a.rightBorderColor;

        function setItems(newItems) {
            var upd = {};
            upd[side === 'left' ? 'leftItems' : 'rightItems'] = newItems;
            setAttributes(upd);
        }

        var cardStyle = {
            background:   bg,
            borderRadius: a.cardRadius + 'px',
            padding:      a.cardPadding + 'px',
            flex: 1,
            boxSizing: 'border-box',
        };
        if (a.style === 'cards') {
            cardStyle.border = '2px solid ' + borderColor;
        } else if (a.style === 'filled') {
            cardStyle.border = 'none';
        }

        return el('div', { className: 'bkbg-tc-col bkbg-tc-col--' + side, style: cardStyle },
            /* Header */
            el('div', { className: 'bkbg-tc-col-header', style: { textAlign: a.headerAlign, marginBottom: '20px' } },
                a.showIcons && el('div', { className: 'bkbg-tc-col-icon', style: { fontSize: a.iconSize + 'px', marginBottom: '10px', lineHeight: 1 } }, iconType !== 'custom-char' ? IP().buildEditorIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon),
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-tc-col-label',
                    value: label,
                    onChange: function (v) { var u = {}; u[side === 'left' ? 'leftLabel' : 'rightLabel'] = v; setAttributes(u); },
                    placeholder: side === 'left' ? __('Old Way', 'blockenberg') : __('New Way', 'blockenberg'),
                    style: { color: labelColor, margin: 0 },
                }),
                a.showDescriptions && el(RichText, {
                    tagName: 'p', className: 'bkbg-tc-col-desc',
                    value: description,
                    onChange: function (v) { var u = {}; u[side === 'left' ? 'leftDescription' : 'rightDescription'] = v; setAttributes(u); },
                    placeholder: __('Short description…', 'blockenberg'),
                    style: { color: descColor, margin: '8px 0 0' },
                })
            ),
            /* Items */
            el('ul', { className: 'bkbg-tc-items', style: { listStyle: 'none', margin: 0, padding: 0 } },
                items.map(function (item, idx) {
                    return el('li', { key: item.id, className: 'bkbg-tc-item', style: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' } },
                        el('span', { className: 'bkbg-tc-item-icon', style: { fontSize: a.itemIconSize + 'px', color: itemIconColor, flexShrink: 0, lineHeight: 1.4, fontWeight: 900 } }, itemIconType !== 'custom-char' ? IP().buildEditorIcon(itemIconType, itemIcon, itemIconDash, itemIconImg, itemIconDashColor) : itemIcon),
                        el(RichText, {
                            tagName: 'span', className: 'bkbg-tc-item-text',
                            value: item.text,
                            onChange: function (v) { setItems(items.map(function (it) { return it.id === item.id ? Object.assign({}, it, { text: v }) : it; })); },
                            placeholder: __('Item…', 'blockenberg'),
                            style: { color: textColor, flex: 1 },
                        }),
                        el(Button, {
                            icon: 'trash', isSmall: true, isDestructive: true,
                            onClick: function () { setItems(items.filter(function (it) { return it.id !== item.id; })); },
                            style: { flexShrink: 0 },
                            label: __('Remove item', 'blockenberg'),
                        })
                    );
                })
            ),
            el(Button, {
                variant: 'secondary', size: 'compact',
                onClick: function () { setItems(items.concat([{ id: makeId(), text: __('New item', 'blockenberg') }])); },
                style: { marginTop: '12px' },
            }, '+ ' + __('Add item', 'blockenberg'))
        );
    }

    /* ── Divider ────────────────────────────────────────────────────── */
    function Divider(props) {
        var a = props.a;
        if (!a.showDivider || a.dividerStyle === 'none') return null;

        var style = { display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

        if (a.dividerStyle === 'vs') {
            return el('div', { className: 'bkbg-tc-divider bkbg-tc-divider--vs', style: Object.assign({}, style, { width: '48px' }) },
                el('div', { className: 'bkbg-tc-vs-badge', style: { background: a.dividerColor, color: '#fff', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px', flexShrink: 0 } }, 'VS')
            );
        }
        if (a.dividerStyle === 'arrow') {
            return el('div', { className: 'bkbg-tc-divider bkbg-tc-divider--arrow', style: Object.assign({}, style, { width: '40px' }) },
                el('span', { style: { fontSize: '28px', color: a.dividerColor, flexShrink: 0 } }, '→')
            );
        }
        /* line */
        return el('div', { className: 'bkbg-tc-divider bkbg-tc-divider--line', style: { width: '2px', background: a.dividerColor, alignSelf: 'stretch', flexShrink: 0, borderRadius: '99px' } });
    }

    registerBlockType('blockenberg/text-comparison', {
        title: __('Text Comparison', 'blockenberg'),
        icon: 'columns',
        category: 'bkbg-dev',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            var gridStyle = {
                display: 'flex',
                gap: a.gap + 'px',
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto',
                alignItems: 'stretch',
            };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Style',          'blockenberg'), value: a.style,        options: STYLE_OPTIONS,   onChange: function (v) { setAttributes({ style:        v }); } }),
                        el(SelectControl, { label: __('Header align',   'blockenberg'), value: a.headerAlign,  options: ALIGN_OPTIONS,   onChange: function (v) { setAttributes({ headerAlign:  v }); } }),
                        el(ToggleControl, { label: __('Show icons',     'blockenberg'), checked: a.showIcons,        onChange: function (v) { setAttributes({ showIcons:        v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show descriptions', 'blockenberg'), checked: a.showDescriptions, onChange: function (v) { setAttributes({ showDescriptions: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show divider',   'blockenberg'), checked: a.showDivider,      onChange: function (v) { setAttributes({ showDivider:      v }); }, __nextHasNoMarginBottom: true }),
                        a.showDivider && el(SelectControl, { label: __('Divider style', 'blockenberg'), value: a.dividerStyle, options: DIVIDER_OPTIONS, onChange: function (v) { setAttributes({ dividerStyle: v }); } }),
                        el(RangeControl, { label: __('Max width (px)',   'blockenberg'), value: a.maxWidth,     min: 480, max: 1400, onChange: function (v) { setAttributes({ maxWidth:     v }); } }),
                        el(RangeControl, { label: __('Column gap (px)', 'blockenberg'), value: a.gap,          min: 0,   max: 80,   onChange: function (v) { setAttributes({ gap:          v }); } }),
                        el(RangeControl, { label: __('Card radius (px)','blockenberg'), value: a.cardRadius,   min: 0,   max: 32,   onChange: function (v) { setAttributes({ cardRadius:   v }); } }),
                        el(RangeControl, { label: __('Card padding (px)','blockenberg'), value: a.cardPadding, min: 12,  max: 64,   onChange: function (v) { setAttributes({ cardPadding:  v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && getTypoControl()({
                            label: __('Label', 'blockenberg'),
                            value: a.labelTypo || {},
                            onChange: function (v) { setAttributes({ labelTypo: v }); }
                        }),
                        getTypoControl() && getTypoControl()({
                            label: __('Description', 'blockenberg'),
                            value: a.descTypo || {},
                            onChange: function (v) { setAttributes({ descTypo: v }); }
                        }),
                        getTypoControl() && getTypoControl()({
                            label: __('Item Text', 'blockenberg'),
                            value: a.itemTypo || {},
                            onChange: function (v) { setAttributes({ itemTypo: v }); }
                        }),
                        el(RangeControl, { label: __('Icon size (px)',      'blockenberg'), value: a.iconSize,     min: 18, max: 60, onChange: function (v) { setAttributes({ iconSize:     v }); } }),
                        el(RangeControl, { label: __('Item icon (px)',      'blockenberg'), value: a.itemIconSize, min: 12, max: 24, onChange: function (v) { setAttributes({ itemIconSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Left column', 'blockenberg'), initialOpen: false },
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'leftIcon', typeAttr: 'leftIconType', dashiconAttr: 'leftIconDashicon', imageUrlAttr: 'leftIconImageUrl', colorAttr: 'leftIconDashiconColor' })),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'leftItemIcon', typeAttr: 'leftItemIconType', dashiconAttr: 'leftItemIconDashicon', imageUrlAttr: 'leftItemIconImageUrl', colorAttr: 'leftItemIconDashiconColor' })),
                        cc('leftBg',            __('Background',   'blockenberg'), 'leftBg'),
                        cc('leftBorderColor',   __('Border color', 'blockenberg'), 'leftBorderColor'),
                        cc('leftLabelColor',    __('Label color',  'blockenberg'), 'leftLabelColor'),
                        cc('leftDescColor',     __('Desc color',   'blockenberg'), 'leftDescColor'),
                        cc('leftTextColor',     __('Item text',    'blockenberg'), 'leftTextColor'),
                        cc('leftItemIconColor', __('Item icon',    'blockenberg'), 'leftItemIconColor')
                    ),
                    el(PanelBody, { title: __('Right column', 'blockenberg'), initialOpen: false },
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'rightIcon', typeAttr: 'rightIconType', dashiconAttr: 'rightIconDashicon', imageUrlAttr: 'rightIconImageUrl', colorAttr: 'rightIconDashiconColor' })),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'rightItemIcon', typeAttr: 'rightItemIconType', dashiconAttr: 'rightItemIconDashicon', imageUrlAttr: 'rightItemIconImageUrl', colorAttr: 'rightItemIconDashiconColor' })),
                        cc('rightBg',            __('Background',   'blockenberg'), 'rightBg'),
                        cc('rightBorderColor',   __('Border color', 'blockenberg'), 'rightBorderColor'),
                        cc('rightLabelColor',    __('Label color',  'blockenberg'), 'rightLabelColor'),
                        cc('rightDescColor',     __('Desc color',   'blockenberg'), 'rightDescColor'),
                        cc('rightTextColor',     __('Item text',    'blockenberg'), 'rightTextColor'),
                        cc('rightItemIconColor', __('Item icon',    'blockenberg'), 'rightItemIconColor')
                    ),
                    el(PanelBody, { title: __('Divider & Background', 'blockenberg'), initialOpen: false },
                        cc('dividerColor', __('Divider color',    'blockenberg'), 'dividerColor'),
                        cc('bgColor',      __('Section bg',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-tc-grid', style: gridStyle },
                        el(CompareColumn, { side: 'left',  a: a, setAttributes: setAttributes }),
                        el(Divider,       { a: a }),
                        el(CompareColumn, { side: 'right', a: a, setAttributes: setAttributes })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function ColItems(side) {
                var items    = side === 'left' ? a.leftItems    : a.rightItems;
                var itemIcon = side === 'left' ? a.leftItemIcon : a.rightItemIcon;
                var itemIconType = side === 'left' ? (a.leftItemIconType || 'custom-char') : (a.rightItemIconType || 'custom-char');
                var itemIconDash = side === 'left' ? a.leftItemIconDashicon : a.rightItemIconDashicon;
                var itemIconImg  = side === 'left' ? a.leftItemIconImageUrl : a.rightItemIconImageUrl;
                var itemIconDashColor = side === 'left' ? a.leftItemIconDashiconColor : a.rightItemIconDashiconColor;
                var iconClr  = side === 'left' ? a.leftItemIconColor : a.rightItemIconColor;
                var txtClr   = side === 'left' ? a.leftTextColor     : a.rightTextColor;
                return el('ul', { className: 'bkbg-tc-items' },
                    items.map(function (item) {
                        return el('li', { key: item.id, className: 'bkbg-tc-item' },
                            el('span', { className: 'bkbg-tc-item-icon', 'aria-hidden': 'true' }, itemIconType !== 'custom-char' ? IP().buildSaveIcon(itemIconType, itemIcon, itemIconDash, itemIconImg, itemIconDashColor) : itemIcon),
                            el(RichText.Content, { tagName: 'span', className: 'bkbg-tc-item-text', value: item.text })
                        );
                    })
                );
            }

            function SaveCol(side) {
                var label       = side === 'left' ? a.leftLabel       : a.rightLabel;
                var description = side === 'left' ? a.leftDescription : a.rightDescription;
                var icon        = side === 'left' ? a.leftIcon        : a.rightIcon;
                var iconType    = side === 'left' ? (a.leftIconType || 'custom-char') : (a.rightIconType || 'custom-char');
                var iconDash    = side === 'left' ? a.leftIconDashicon : a.rightIconDashicon;
                var iconImg     = side === 'left' ? a.leftIconImageUrl : a.rightIconImageUrl;
                var iconDashColor = side === 'left' ? a.leftIconDashiconColor : a.rightIconDashiconColor;
                return el('div', { className: 'bkbg-tc-col bkbg-tc-col--' + side },
                    el('div', { className: 'bkbg-tc-col-header' },
                        a.showIcons && el('div', { className: 'bkbg-tc-col-icon', 'aria-hidden': 'true' }, iconType !== 'custom-char' ? IP().buildSaveIcon(iconType, icon, iconDash, iconImg, iconDashColor) : icon),
                        el(RichText.Content, { tagName: 'h3', className: 'bkbg-tc-col-label', value: label }),
                        a.showDescriptions && el(RichText.Content, { tagName: 'p', className: 'bkbg-tc-col-desc', value: description })
                    ),
                    ColItems(side)
                );
            }

            var dividerEl = null;
            if (a.showDivider && a.dividerStyle !== 'none') {
                if (a.dividerStyle === 'vs') {
                    dividerEl = el('div', { className: 'bkbg-tc-divider bkbg-tc-divider--vs', 'aria-hidden': 'true' }, el('div', { className: 'bkbg-tc-vs-badge' }, 'VS'));
                } else if (a.dividerStyle === 'arrow') {
                    dividerEl = el('div', { className: 'bkbg-tc-divider bkbg-tc-divider--arrow', 'aria-hidden': 'true' }, el('span', null, '→'));
                } else {
                    dividerEl = el('div', { className: 'bkbg-tc-divider bkbg-tc-divider--line', 'aria-hidden': 'true' });
                }
            }

            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-tc-wrapper bkbg-tc--' + a.style,
                style: buildWrapStyle(a),
            }),
                el('div', { className: 'bkbg-tc-grid', style: { maxWidth: a.maxWidth + 'px', margin: '0 auto', gap: a.gap + 'px' } },
                    SaveCol('left'),
                    dividerEl,
                    SaveCol('right')
                )
            );
        }
    });
}() );
