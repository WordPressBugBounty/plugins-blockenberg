( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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
    var Fragment = wp.element.Fragment;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var ratioMap = { '50-50': [50, 50], '45-55': [45, 55], '55-45': [55, 45], '40-60': [40, 60], '60-40': [60, 40] };

    function BkbgColorSwatch(props) {
        var st = useState(false); var isOpen = st[0]; var setIsOpen = st[1];
        return el(Fragment, null,
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' } }, props.label),
                el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: props.value || '#fff', cursor: 'pointer', padding: 0 }, onClick: function () { setIsOpen(!isOpen); } })
            ),
            isOpen && el(Popover, { onClose: function () { setIsOpen(false); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: props.value, enableAlpha: true, onChange: props.onChange })))
        );
    }

    registerBlockType('blockenberg/sticky-two-col', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var items = attr.items || [];

            var previewState = useState(0);
            var previewIdx = previewState[0];
            var setPreviewIdx = previewState[1];
            var previewItem = items[previewIdx] || {};

            function updateItem(idx, field, val) {
                var updated = items.map(function (it, i) {
                    if (i !== idx) return it;
                    var p = {}; p[field] = val;
                    return Object.assign({}, it, p);
                });
                set({ items: updated });
            }

            function addItem() {
                var accents = ['#6366f1', '#ec4899', '#16a34a', '#f59e0b', '#0ea5e9', '#ef4444'];
                var icons = ['💡', '⚡', '🚀', '🎯', '🔥', '✨'];
                var n = items.length % accents.length;
                set({ items: items.concat([{ eyebrow: 'Step ' + (items.length + 1), title: 'New Feature', text: 'Describe this feature here.', icon: icons[n], iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', imageUrl: '', imageId: 0, imageAlt: '', accentColor: accents[n] }]) });
            }

            function removeItem(idx) {
                set({ items: items.filter(function (_, i) { return i !== idx; }) });
                if (previewIdx >= items.length - 1) setPreviewIdx(Math.max(0, previewIdx - 1));
            }

            var cols = ratioMap[attr.splitRatio] || [50, 50];
            var isStickRight = attr.stickyPosition === 'right';

            /* Inspector */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Sticky Column', 'blockenberg'),
                        value: attr.stickyPosition,
                        options: [
                            { label: 'Right column sticky', value: 'right' },
                            { label: 'Left column sticky', value: 'left' }
                        ],
                        onChange: function (v) { set({ stickyPosition: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Column Ratio', 'blockenberg'),
                        value: attr.splitRatio,
                        options: [
                            { label: '50 / 50', value: '50-50' },
                            { label: '45 / 55', value: '45-55' },
                            { label: '55 / 45', value: '55-45' },
                            { label: '40 / 60', value: '40-60' },
                            { label: '60 / 40', value: '60-40' }
                        ],
                        onChange: function (v) { set({ splitRatio: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Sticky Offset from Top (px)', 'blockenberg'),
                        value: attr.stickyOffset, min: 0, max: 200,
                        onChange: function (v) { set({ stickyOffset: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Image Border Radius (px)', 'blockenberg'),
                        value: attr.imageRadius, min: 0, max: 40,
                        onChange: function (v) { set({ imageRadius: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: attr.iconSize, min: 20, max: 64,
                        onChange: function (v) { set({ iconSize: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Items (px)', 'blockenberg'),
                        value: attr.gap, min: 24, max: 200,
                        onChange: function (v) { set({ gap: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Divider Line', 'blockenberg'),
                        checked: attr.showDivider,
                        onChange: function (v) { set({ showDivider: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Progress Bar', 'blockenberg'),
                        checked: attr.showProgressBar,
                        onChange: function (v) { set({ showProgressBar: v }); },
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
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '' }); }, label: __('Section Background', 'blockenberg') },
                        { value: attr.panelBg, onChange: function (v) { set({ panelBg: v || '#f8f8fc' }); }, label: __('Sticky Panel Background', 'blockenberg') },
                        { value: attr.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#6366f1' }); }, label: __('Eyebrow Color', 'blockenberg') },
                        { value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); }, label: __('Title Color', 'blockenberg') },
                        { value: attr.textColor, onChange: function (v) { set({ textColor: v || '#6b7280' }); }, label: __('Body Text', 'blockenberg') },
                        { value: attr.iconBg, onChange: function (v) { set({ iconBg: v || '#ede9fe' }); }, label: __('Icon Background', 'blockenberg') },
                        { value: attr.dividerColor, onChange: function (v) { set({ dividerColor: v || '#e5e7eb' }); }, label: __('Divider', 'blockenberg') },
                        { value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); }, label: __('Accent', 'blockenberg') }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && getTypoControl()({ label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { set({ eyebrowTypo: v }); } }),
                    getTypoControl() && getTypoControl()({ label: __('Title', 'blockenberg'), value: attr.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                    getTypoControl() && getTypoControl()({ label: __('Body', 'blockenberg'), value: attr.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                )
            );

            /* Sticky panel preview */
            var stickyPanel = el('div', { style: { flex: cols[isStickRight ? 1 : 0] + '%', background: attr.panelBg, borderRadius: attr.imageRadius + 'px', padding: '24px', minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', position: 'relative' } },
                previewItem.imageUrl
                    ? el('img', { src: previewItem.imageUrl, style: { width: '100%', height: '280px', objectFit: 'cover', borderRadius: attr.imageRadius + 'px' } })
                    : el('div', { style: { width: '100%', height: '200px', background: (previewItem.accentColor || attr.accentColor) + '20', borderRadius: attr.imageRadius + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' } }, (previewItem.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(previewItem.iconType, previewItem.icon, previewItem.iconDashicon, previewItem.iconImageUrl, previewItem.iconDashiconColor) : (previewItem.icon || '🖼️')),
                el('div', { style: { color: attr.textColor, fontSize: '13px', textAlign: 'center' } }, __('Sticky panel preview — click items below to switch', 'blockenberg')),
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: function (m) { updateItem(previewIdx, 'imageUrl', m.url); updateItem(previewIdx, 'imageId', m.id); updateItem(previewIdx, 'imageAlt', m.alt || ''); },
                        allowedTypes: ['image'], value: previewItem.imageId || 0,
                        render: function (ref) { return el(Button, { onClick: ref.open, variant: 'primary', isSmall: true }, previewItem.imageUrl ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg')); }
                    })
                )
            );

            /* Scrolling items */
            var scrollCol = el('div', { style: { flex: cols[isStickRight ? 0 : 1] + '%', paddingRight: isStickRight ? '0' : '0', borderRight: isStickRight && attr.showDivider ? ('1px solid ' + attr.dividerColor) : 'none', borderLeft: !isStickRight && attr.showDivider ? ('1px solid ' + attr.dividerColor) : 'none' } },
                items.map(function (it, idx) {
                    var isActive = idx === previewIdx;
                    var accent = it.accentColor || attr.accentColor;
                    return el('div', {
                        key: idx,
                        onClick: function () { setPreviewIdx(idx); },
                        style: {
                            padding: '24px 0',
                            paddingBottom: idx < items.length - 1 ? attr.gap + 'px' : '24px',
                            borderLeft: isStickRight ? ('3px solid ' + (isActive ? accent : 'transparent')) : 'none',
                            borderRight: !isStickRight ? ('3px solid ' + (isActive ? accent : 'transparent')) : 'none',
                            paddingLeft: isStickRight ? '24px' : '0',
                            paddingRight: !isStickRight ? '24px' : '0',
                            cursor: 'pointer',
                            opacity: isActive ? 1 : 0.65,
                            transition: 'opacity 0.2s, border-color 0.2s'
                        }
                    },
                        el('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '14px' } },
                            el('div', { style: { width: attr.iconSize + 'px', height: attr.iconSize + 'px', background: isActive ? (accent + '20') : attr.iconBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(attr.iconSize * 0.55) + 'px', flexShrink: 0, transition: 'background 0.2s' } }, (it.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(it.iconType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor) : (it.icon || '●')),
                            el('div', { style: { flex: 1 } },
                                it.eyebrow && el('div', { className: 'bkbg-s2c-eyebrow', style: { color: accent, marginBottom: '6px' } }, it.eyebrow),
                                el(RichText, {
                                    tagName: 'h3',
                                    className: 'bkbg-s2c-title',
                                    value: it.title,
                                    onChange: function (v) { updateItem(idx, 'title', v); },
                                    placeholder: __('Feature title', 'blockenberg'),
                                    style: { color: attr.titleColor, margin: '0 0 10px' }
                                }),
                                el(RichText, {
                                    tagName: 'p',
                                    className: 'bkbg-s2c-text',
                                    value: it.text,
                                    onChange: function (v) { updateItem(idx, 'text', v); },
                                    placeholder: __('Describe this feature...', 'blockenberg'),
                                    style: { color: attr.textColor, margin: 0 }
                                })
                            )
                        ),
                        el('div', { style: { display: 'flex', gap: '6px', marginTop: '8px', paddingLeft: (attr.iconSize + 14) + 'px' } },
                            el(IP().IconPickerControl, IP().iconPickerProps(it, function (patch) { var updated = items.map(function (x, j) { if (j !== idx) return x; return Object.assign({}, x, patch); }); set({ items: updated }); }, { label: 'Icon', charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' })),
                            el(TextControl, { label: 'Eyebrow', value: it.eyebrow, onChange: function (v) { updateItem(idx, 'eyebrow', v); }, style: { width: '90px' }, __nextHasNoMarginBottom: true }),
                            el(BkbgColorSwatch, { label: 'Accent', value: it.accentColor, onChange: function (v) { updateItem(idx, 'accentColor', v); } }),
                            el(Button, { onClick: function () { removeItem(idx); }, variant: 'link', isDestructive: true, isSmall: true }, __('Remove', 'blockenberg'))
                        )
                    );
                }),
                el('div', { style: { marginTop: '16px' } },
                    el(Button, { onClick: addItem, variant: 'primary', isSmall: true }, __('+ Add Feature', 'blockenberg'))
                )
            );

            var leftCol = isStickRight ? scrollCol : stickyPanel;
            var rightCol = isStickRight ? stickyPanel : scrollCol;

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps((function() {
                    var _tvf = getTypoCssVars();
                    var s = { background: attr.bgColor || '', paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' };
                    if (_tvf) {
                        Object.assign(s, _tvf(attr.eyebrowTypo, '--bks2c-eb-'));
                        Object.assign(s, _tvf(attr.titleTypo, '--bks2c-tt-'));
                        Object.assign(s, _tvf(attr.bodyTypo, '--bks2c-bd-'));
                    }
                    s['--bks2c-title-fw'] = attr.titleFontWeight || '800';
                    s['--bks2c-title-lh'] = attr.titleLineHeight || 1.2;
                    s['--bks2c-body-lh'] = attr.bodyLineHeight || 1.7;
                    return { style: s };
                })()),
                    el('div', { style: { display: 'flex', gap: '48px', alignItems: 'flex-start' } },
                        leftCol, rightCol
                    )
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-s2c-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
