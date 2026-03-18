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
    var Button = wp.components.Button;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function badgeShapeRadius(shape) {
        if (shape === 'circle')  return '50%';
        if (shape === 'square')  return '4px';
        return '10px'; /* rounded */
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

    registerBlockType('blockenberg/numbered-list', {
        icon: el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 24, height: 24 },
          el('path', { d: 'M4 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5-.5h10v1H9V5zm-5 7a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5-.5h10v1H9v-1zm-5 7a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5-.5h10v1H9v-1z', fill: 'currentColor' }),
          el('text', { x: 4.5, y: 7, fontSize: 5, fontWeight: 700, fill: '#fff', textAnchor: 'middle', dominantBaseline: 'central' }, '1'),
          el('text', { x: 4.5, y: 13.5, fontSize: 5, fontWeight: 700, fill: '#fff', textAnchor: 'middle', dominantBaseline: 'central' }, '2'),
          el('text', { x: 4.5, y: 20, fontSize: 5, fontWeight: 700, fill: '#fff', textAnchor: 'middle', dominantBaseline: 'central' }, '3')
        ),
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var items = attr.items || [];

            function updateItem(idx, field, val) {
                var updated = items.map(function (it, i) {
                    if (i !== idx) return it;
                    var p = {}; p[field] = val;
                    return Object.assign({}, it, p);
                });
                set({ items: updated });
            }

            function addItem() {
                set({ items: items.concat([{ customBadge: '', icon: '', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', heading: 'New Item', content: 'Description here…', imageUrl: '', imageId: 0, imageAlt: '', link: '', accentColor: attr.badgeBg }]) });
            }

            function removeItem(idx) { set({ items: items.filter(function (_, i) { return i !== idx; }) }); }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout,
                        options: [
                            { label: 'Vertical list', value: 'list' },
                            { label: 'Grid (multi-column)', value: 'grid' },
                            { label: 'Alternating (zigzag)', value: 'zigzag' }
                        ],
                        onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.layout === 'grid' && el(RangeControl, { label: __('Columns', 'blockenberg'), value: attr.columns, min: 2, max: 4, onChange: function (v) { set({ columns: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'), value: attr.align,
                        options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }],
                        onChange: function (v) { set({ align: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: attr.gap, min: 16, max: 120, onChange: function (v) { set({ gap: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Badge', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Badge Type', 'blockenberg'), value: attr.badgeType,
                        options: [
                            { label: 'Auto number', value: 'number' },
                            { label: 'Custom (per item)', value: 'custom' },
                            { label: 'Icon emoji (per item)', value: 'icon' },
                            { label: 'None', value: 'none' }
                        ],
                        onChange: function (v) { set({ badgeType: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.badgeType !== 'none' && el(SelectControl, {
                        label: __('Badge Shape', 'blockenberg'), value: attr.badgeShape,
                        options: [{ label: 'Circle', value: 'circle' }, { label: 'Square', value: 'square' }, { label: 'Rounded', value: 'rounded' }],
                        onChange: function (v) { set({ badgeShape: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.layout === 'list' && el(ToggleControl, { label: __('Show Connector Line', 'blockenberg'), checked: attr.showConnector, onChange: function (v) { set({ showConnector: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showConnector && attr.layout === 'list' && el(SelectControl, {
                        label: __('Connector Style', 'blockenberg'), value: attr.connectorStyle,
                        options: [{ label: 'Dashed', value: 'dashed' }, { label: 'Solid', value: 'solid' }, { label: 'Dotted', value: 'dotted' }],
                        onChange: function (v) { set({ connectorStyle: v }); }, __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypoControl(), { label: __('Section Heading Typography', 'blockenberg'), value: attr.sectionHeadingTypo, onChange: function (v) { set({ sectionHeadingTypo: v }); } }),
                    el(getTypoControl(), { label: __('Item Heading Typography', 'blockenberg'), value: attr.itemHeadingTypo, onChange: function (v) { set({ itemHeadingTypo: v }); } }),
                    el(getTypoControl(), { label: __('Body Typography', 'blockenberg'), value: attr.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } }),
                    el(getTypoControl(), { label: __('Section Subtext Typography', 'blockenberg'), value: attr.subtextTypo, onChange: function (v) { set({ subtextTypo: v }); } }),
                    attr.badgeType !== 'none' && el(RangeControl, { label: __('Badge Size (px)', 'blockenberg'), value: attr.badgeSize, min: 28, max: 80, onChange: function (v) { set({ badgeSize: v }); }, __nextHasNoMarginBottom: true }),
                    attr.badgeType !== 'none' && el(RangeControl, { label: __('Badge Font Size (px)', 'blockenberg'), value: attr.badgeFontSize, min: 12, max: 36, onChange: function (v) { set({ badgeFontSize: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Images', 'blockenberg'), checked: attr.showImage, onChange: function (v) { set({ showImage: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showImage && el(SelectControl, {
                        label: __('Image Position', 'blockenberg'), value: attr.imagePosition,
                        options: [{ label: 'Right', value: 'right' }, { label: 'Left', value: 'left' }, { label: 'Above', value: 'above' }],
                        onChange: function (v) { set({ imagePosition: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.showImage && el(RangeControl, { label: __('Image Width (px)', 'blockenberg'), value: attr.imageSize, min: 80, max: 500, onChange: function (v) { set({ imageSize: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showImage && el(RangeControl, { label: __('Image Radius (px)', 'blockenberg'), value: attr.imageRadius, min: 0, max: 40, onChange: function (v) { set({ imageRadius: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Section Heading', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: attr.showHeading, onChange: function (v) { set({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: attr.showSubtext, onChange: function (v) { set({ showSubtext: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Items', 'blockenberg'), initialOpen: true },
                    items.map(function (it, idx) {
                        return el('div', { key: idx, style: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', marginBottom: '10px' } },
                            el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
                                el('strong', { style: { fontSize: '12px' } }, 'Item ' + (idx + 1)),
                                el(Button, { onClick: function () { removeItem(idx); }, variant: 'link', isDestructive: true, isSmall: true }, '✕')
                            ),
                            (attr.badgeType === 'custom') && el(TextControl, { label: __('Badge Text', 'blockenberg'), value: it.customBadge || '', onChange: function (v) { updateItem(idx, 'customBadge', v); }, __nextHasNoMarginBottom: true }),
                            (attr.badgeType === 'icon') && el(IP().IconPickerControl, { iconType: it.iconType || 'custom-char', customChar: it.icon || '', dashicon: it.iconDashicon || '', imageUrl: it.iconImageUrl || '', onChangeType: function (v) { updateItem(idx, 'iconType', v); }, onChangeChar: function (v) { updateItem(idx, 'icon', v); }, onChangeDashicon: function (v) { updateItem(idx, 'iconDashicon', v); }, onChangeImageUrl: function (v) { updateItem(idx, 'iconImageUrl', v); } }),
                            el(TextControl, { label: __('Heading', 'blockenberg'), value: it.heading, onChange: function (v) { updateItem(idx, 'heading', v); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Link (optional)', 'blockenberg'), value: it.link, onChange: function (v) { updateItem(idx, 'link', v); }, placeholder: 'https://', __nextHasNoMarginBottom: true }),
                            el(BkbgColorSwatch, { label: __('Accent Color', 'blockenberg'), value: it.accentColor, onChange: function (v) { updateItem(idx, 'accentColor', v); } }),
                            attr.showImage && el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateItem(idx, 'imageUrl', m.url); updateItem(idx, 'imageId', m.id); updateItem(idx, 'imageAlt', m.alt || ''); },
                                    allowedTypes: ['image'], value: it.imageId,
                                    render: function (ref) { return el(Button, { onClick: ref.open, variant: 'secondary', isSmall: true }, it.imageUrl ? __('Replace Image', 'blockenberg') : __('Upload Image', 'blockenberg')); }
                                })
                            )
                        );
                    }),
                    el(Button, { onClick: addItem, variant: 'primary', isSmall: true }, __('+ Add Item', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 240, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 240, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor,       onChange: function (v) { set({ bgColor: v || '' }); },         label: __('Background', 'blockenberg') },
                        { value: attr.badgeBg,       onChange: function (v) { set({ badgeBg: v || '#6366f1' }); },  label: __('Badge BG', 'blockenberg') },
                        { value: attr.badgeColor,    onChange: function (v) { set({ badgeColor: v || '#ffffff' }); }, label: __('Badge Text', 'blockenberg') },
                        { value: attr.headingColor,  onChange: function (v) { set({ headingColor: v || '#111827' }); }, label: __('Item Heading', 'blockenberg') },
                        { value: attr.textColor,     onChange: function (v) { set({ textColor: v || '#4b5563' }); }, label: __('Item Text', 'blockenberg') },
                        { value: attr.connectorColor,onChange: function (v) { set({ connectorColor: v || '#d1d5db' }); }, label: __('Connector Line', 'blockenberg') },
                        { value: attr.sectionHeadingColor, onChange: function (v) { set({ sectionHeadingColor: v || '#111827' }); }, label: __('Section Heading', 'blockenberg') },
                        { value: attr.subtextColor,  onChange: function (v) { set({ subtextColor: v || '#6b7280' }); }, label: __('Section Subtext', 'blockenberg') }
                    ]
                })
            );

            /* Preview */
            var isGrid = attr.layout === 'grid';
            var containerStyle = {
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px',
                textAlign: attr.align
            };

            var gridStyle = isGrid
                ? { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)', gap: attr.gap + 'px' }
                : { display: 'flex', flexDirection: 'column', gap: attr.gap + 'px' };

            var bRadius = badgeShapeRadius(attr.badgeShape);

            var itemEls = items.map(function (it, idx) {
                var badgeBg = it.accentColor || attr.badgeBg;
                var badgeLabel = attr.badgeType === 'number' ? String(idx + 1)
                    : attr.badgeType === 'icon' ? ((it.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(it.iconType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor) : (it.icon || '★'))
                    : attr.badgeType === 'custom' ? (it.customBadge || String(idx + 1))
                    : null;

                var hasImage = attr.showImage && it.imageUrl;
                var isHoriz = hasImage && (attr.imagePosition === 'left' || attr.imagePosition === 'right');
                var itemFlexDir = isHoriz ? (attr.imagePosition === 'right' ? 'row' : 'row-reverse') : 'column';

                var imgEl = hasImage ? el('img', { src: it.imageUrl, alt: it.imageAlt || '', style: { width: attr.imageSize + 'px', height: 'auto', borderRadius: attr.imageRadius + 'px', objectFit: 'cover', flexShrink: 0 } }) : null;

                return el('div', { key: idx, style: { position: 'relative', display: isHoriz ? 'flex' : 'block', flexDirection: itemFlexDir, gap: '24px', alignItems: isHoriz ? 'center' : 'initial' } },
                    /* Connector */
                    attr.showConnector && attr.layout === 'list' && idx < items.length - 1 && attr.badgeType !== 'none' && el('div', { style: { position: 'absolute', left: (attr.badgeSize / 2 - 1) + 'px', top: (attr.badgeSize + 6) + 'px', width: '2px', bottom: ('-' + (attr.gap - 4) + 'px'), borderLeft: '2px ' + attr.connectorStyle + ' ' + attr.connectorColor } }),
                    el('div', { style: { display: 'flex', gap: '16px', flexDirection: attr.align === 'center' ? 'column' : 'row', alignItems: attr.align === 'center' ? 'center' : 'flex-start', flex: 1 } },
                        attr.hasImage && attr.imagePosition === 'above' && imgEl,
                        badgeLabel !== null && el('div', { style: { background: badgeBg, color: attr.badgeColor, width: attr.badgeSize + 'px', height: attr.badgeSize + 'px', borderRadius: bRadius, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: attr.badgeFontSize + 'px', fontWeight: '800', flexShrink: 0 } }, badgeLabel),
                        el('div', { style: { flex: 1 } },
                            el(RichText, {
                                tagName: 'h4', value: it.heading,
                                onChange: function (v) { updateItem(idx, 'heading', v); },
                                className: 'bkbg-nl-item-heading',
                                style: { color: attr.headingColor, margin: '0 0 6px' }
                            }),
                            el(RichText, {
                                tagName: 'p', value: it.content,
                                onChange: function (v) { updateItem(idx, 'content', v); },
                                placeholder: __('Description…', 'blockenberg'),
                                className: 'bkbg-nl-item-text',
                                style: { color: attr.textColor, margin: 0 }
                            })
                        ),
                        isHoriz && imgEl
                    )
                );
            });

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = {
                        background: attr.bgColor || 'transparent',
                        paddingTop: attr.paddingTop + 'px',
                        paddingBottom: attr.paddingBottom + 'px',
                        textAlign: attr.align
                    };
                    if (_tvf) { Object.assign(s, _tvf(attr.sectionHeadingTypo, '--bkbg-nl-sh-')); Object.assign(s, _tvf(attr.itemHeadingTypo, '--bkbg-nl-ih-')); Object.assign(s, _tvf(attr.bodyTypo, '--bkbg-nl-bd-')); Object.assign(s, _tvf(attr.subtextTypo, '--bkbg-nl-st-')); }
                    return { className: 'bkbg-nl-wrap', style: s };
                })()),
                    attr.showHeading && el(RichText, {
                        tagName: 'h2', value: attr.heading, onChange: function (v) { set({ heading: v }); },
                        placeholder: __('Section heading…', 'blockenberg'),
                        className: 'bkbg-nl-heading',
                        style: { color: attr.sectionHeadingColor, marginBottom: '8px' }
                    }),
                    attr.showSubtext && el(RichText, {
                        tagName: 'p', value: attr.subtext, onChange: function (v) { set({ subtext: v }); },
                        placeholder: __('Subtext…', 'blockenberg'),
                        className: 'bkbg-nl-subtext',
                        style: { color: attr.subtextColor, marginBottom: '32px' }
                    }),
                    el('div', { style: gridStyle }, itemEls)
                )
            );
        },

        save: function (props) {
            var el2 = wp.element.createElement;
            var ubp = wp.blockEditor.useBlockProps;
            return el2('div', ubp.save(),
                el2('div', { className: 'bkbg-nl-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
