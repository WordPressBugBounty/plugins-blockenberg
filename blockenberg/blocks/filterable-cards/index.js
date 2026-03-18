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
    var Fragment = wp.element.Fragment;

    var _fcaTC, _fcaTV;
    function _tc() { return _fcaTC || (_fcaTC = window.bkbgTypographyControl); }
    function _tv() { return _fcaTV || (_fcaTV = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/filterable-cards', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var cards = attr.cards || [];

            function updateCard(idx, field, val) {
                var updated = cards.map(function (c, i) {
                    if (i !== idx) return c;
                    var patch = {}; patch[field] = val;
                    return Object.assign({}, c, patch);
                });
                set({ cards: updated });
            }

            function addCard() {
                set({
                    cards: cards.concat([{
                        title: 'New Card', description: 'Card description.',
                        category: 'General', imageUrl: '', imageId: 0, imageAlt: '',
                        link: '', linkLabel: 'Learn More', label: '', icon: '', featured: false
                    }])
                });
            }

            function duplicateCard(idx) {
                var arr = cards.slice();
                arr.splice(idx + 1, 0, Object.assign({}, cards[idx]));
                set({ cards: arr });
            }

            function removeCard(idx) {
                set({ cards: cards.filter(function (_, i) { return i !== idx; }) });
            }

            /* unique categories */
            var cats = [attr.allLabel || 'All'];
            cards.forEach(function (c) { if (c.category && cats.indexOf(c.category) < 0) cats.push(c.category); });

            var ratioMap = { '16:9': '56.25%', '4:3': '75%', '3:2': '66.66%', '1:1': '100%' };
            var paddingTop = ratioMap[attr.imageRatio] || '66.66%';

            /* Inspector */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(RangeControl, {
                        label: __('Columns', 'blockenberg'),
                        value: attr.columns, min: 1, max: 5,
                        onChange: function (v) { set({ columns: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Grid', value: 'grid' },
                            { label: 'List', value: 'list' },
                            { label: 'Masonry', value: 'masonry' }
                        ],
                        onChange: function (v) { set({ layout: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Filter Style', 'blockenberg'),
                        value: attr.filterStyle,
                        options: [
                            { label: 'Buttons', value: 'buttons' },
                            { label: 'Tabs', value: 'tabs' },
                            { label: 'Dropdown', value: 'dropdown' }
                        ],
                        onChange: function (v) { set({ filterStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('\"All\" Label', 'blockenberg'),
                        value: attr.allLabel,
                        onChange: function (v) { set({ allLabel: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Image Ratio', 'blockenberg'),
                        value: attr.imageRatio,
                        options: [
                            { label: '16:9', value: '16:9' },
                            { label: '4:3', value: '4:3' },
                            { label: '3:2', value: '3:2' },
                            { label: '1:1 Square', value: '1:1' }
                        ],
                        onChange: function (v) { set({ imageRatio: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Card Radius (px)', 'blockenberg'),
                        value: attr.cardRadius, min: 0, max: 40,
                        onChange: function (v) { set({ cardRadius: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)', 'blockenberg'),
                        value: attr.gap, min: 8, max: 80,
                        onChange: function (v) { set({ gap: v }); },
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
                el(PanelBody, { title: __('Visibility', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Images', 'blockenberg'), checked: attr.showImages, onChange: function (v) { set({ showImages: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Descriptions', 'blockenberg'), checked: attr.showDescriptions, onChange: function (v) { set({ showDescriptions: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Labels', 'blockenberg'), checked: attr.showLabels, onChange: function (v) { set({ showLabels: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Links', 'blockenberg'), checked: attr.showLinks, onChange: function (v) { set({ showLinks: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Animate on Filter', 'blockenberg'), checked: attr.animateFilter, onChange: function (v) { set({ animateFilter: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && _tc()({ label: __('Title', 'blockenberg'), typo: attr.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc() && _tc()({ label: __('Description', 'blockenberg'), typo: attr.typoDesc, onChange: function (v) { set({ typoDesc: v }); } }),
                    _tc() && _tc()({ label: __('Filter', 'blockenberg'), typo: attr.typoFilter, onChange: function (v) { set({ typoFilter: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '' }); }, label: __('Section Background', 'blockenberg') },
                        { value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                        { value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); }, label: __('Card Border', 'blockenberg') },
                        { value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); }, label: __('Title', 'blockenberg') },
                        { value: attr.descColor, onChange: function (v) { set({ descColor: v || '#6b7280' }); }, label: __('Description', 'blockenberg') },
                        { value: attr.labelBg, onChange: function (v) { set({ labelBg: v || '#ede9fe' }); }, label: __('Label Background', 'blockenberg') },
                        { value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#6366f1' }); }, label: __('Label Text', 'blockenberg') },
                        { value: attr.linkColor, onChange: function (v) { set({ linkColor: v || '#6366f1' }); }, label: __('Link', 'blockenberg') },
                        { value: attr.filterBtnBg, onChange: function (v) { set({ filterBtnBg: v || '#f3f4f6' }); }, label: __('Filter Button BG', 'blockenberg') },
                        { value: attr.filterBtnColor, onChange: function (v) { set({ filterBtnColor: v || '#374151' }); }, label: __('Filter Button Text', 'blockenberg') },
                        { value: attr.filterBtnActiveBg, onChange: function (v) { set({ filterBtnActiveBg: v || '#6366f1' }); }, label: __('Active Filter BG', 'blockenberg') },
                        { value: attr.filterBtnActiveColor, onChange: function (v) { set({ filterBtnActiveColor: v || '#ffffff' }); }, label: __('Active Filter Text', 'blockenberg') },
                        { value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); }, label: __('Accent', 'blockenberg') }
                    ]
                })
            );

            /* Filter bar preview */
            var filterBar = el('div', { className: 'bkbg-fc-filter bkbg-fc-filter--' + attr.filterStyle, style: { marginBottom: '24px' } },
                attr.filterStyle === 'dropdown'
                    ? el('select', { className: 'bkbg-fc-dropdown', style: { background: attr.filterBtnBg, color: attr.filterBtnColor, border: '1px solid ' + attr.cardBorder, borderRadius: '6px', padding: '8px 14px' } },
                        cats.map(function (cat, i) { return el('option', { key: i }, cat); })
                    )
                    : el('div', { className: 'bkbg-fc-btns', style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                        cats.map(function (cat, i) {
                            var isAll = i === 0;
                            return el('span', {
                                key: i, className: 'bkbg-fc-btn' + (isAll ? ' active' : ''),
                                style: {
                                    background: isAll ? attr.filterBtnActiveBg : attr.filterBtnBg,
                                    color: isAll ? attr.filterBtnActiveColor : attr.filterBtnColor,
                                    padding: '7px 16px', borderRadius: attr.filterStyle === 'tabs' ? '6px 6px 0 0' : '999px',
                                    cursor: 'pointer',
                                    border: attr.filterStyle === 'tabs' ? ('1px solid ' + attr.cardBorder) : 'none'
                                }
                            }, cat);
                        })
                    )
            );

            /* Cards grid */
            var gridStyle = {
                display: 'grid',
                gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)',
                gap: attr.gap + 'px'
            };
            if (attr.layout === 'list') {
                gridStyle.gridTemplateColumns = '1fr';
            }

            var cardsGrid = el('div', { className: 'bkbg-fc-grid', style: gridStyle },
                cards.map(function (card, idx) {
                    return el('div', {
                        key: idx,
                        className: 'bkbg-fc-card-wrap',
                        style: {
                            background: attr.cardBg,
                            border: '1px solid ' + (card.featured ? attr.accentColor : attr.cardBorder),
                            borderRadius: attr.cardRadius + 'px',
                            overflow: 'hidden',
                            position: 'relative',
                            display: attr.layout === 'list' ? 'flex' : 'block'
                        }
                    },
                        card.featured && el('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: attr.accentColor } }),
                        /* Image */
                        attr.showImages && el('div', {
                            style: { position: 'relative', paddingTop: paddingTop, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, width: attr.layout === 'list' ? '200px' : 'auto' }
                        },
                            card.imageUrl
                                ? el('img', { src: card.imageUrl, alt: card.imageAlt || '', style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                                : el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '12px' } }, __('No image', 'blockenberg')),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateCard(idx, 'imageUrl', m.url); updateCard(idx, 'imageId', m.id); updateCard(idx, 'imageAlt', m.alt || ''); },
                                    allowedTypes: ['image'], value: card.imageId,
                                    render: function (ref) {
                                        return el(Button, { onClick: ref.open, variant: 'primary', isSmall: true, style: { position: 'absolute', bottom: '6px', right: '6px', zIndex: 1, fontSize: '11px' } }, card.imageUrl ? '↕' : '+');
                                    }
                                })
                            )
                        ),
                        /* Body */
                        el('div', { style: { padding: '16px', flex: 1 } },
                            el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
                                el(TextControl, {
                                    label: __('Category', 'blockenberg'),
                                    value: card.category,
                                    onChange: function (v) { updateCard(idx, 'category', v); },
                                    placeholder: 'Category',
                                    style: { flex: 1, marginRight: '8px' },
                                    __nextHasNoMarginBottom: true
                                }),
                                attr.showLabels && el(TextControl, {
                                    label: __('Label', 'blockenberg'),
                                    value: card.label,
                                    onChange: function (v) { updateCard(idx, 'label', v); },
                                    placeholder: 'Label',
                                    style: { width: '80px' },
                                    __nextHasNoMarginBottom: true
                                })
                            ),
                            el(RichText, {
                                tagName: 'h3',
                                className: 'bkbg-fc-card-title',
                                value: card.title,
                                onChange: function (v) { updateCard(idx, 'title', v); },
                                placeholder: __('Card title', 'blockenberg'),
                                style: { color: attr.titleColor, margin: '0 0 6px' }
                            }),
                            attr.showDescriptions && el(RichText, {
                                tagName: 'p',
                                className: 'bkbg-fc-card-desc',
                                value: card.description,
                                onChange: function (v) { updateCard(idx, 'description', v); },
                                placeholder: __('Description...', 'blockenberg'),
                                style: { color: attr.descColor, margin: '0 0 10px' }
                            }),
                            attr.showLinks && el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                                el(TextControl, {
                                    label: __('Link URL', 'blockenberg'),
                                    value: card.link,
                                    onChange: function (v) { updateCard(idx, 'link', v); },
                                    placeholder: 'https://',
                                    style: { flex: 1 },
                                    __nextHasNoMarginBottom: true
                                }),
                                el(TextControl, {
                                    label: __('Link Label', 'blockenberg'),
                                    value: card.linkLabel,
                                    onChange: function (v) { updateCard(idx, 'linkLabel', v); },
                                    style: { width: '100px' },
                                    __nextHasNoMarginBottom: true
                                })
                            ),
                            el(ToggleControl, {
                                label: __('Featured', 'blockenberg'),
                                checked: card.featured,
                                onChange: function (v) { updateCard(idx, 'featured', v); },
                                __nextHasNoMarginBottom: true
                            }),
                            el('div', { style: { display: 'flex', gap: '6px', marginTop: '8px' } },
                                el(Button, { onClick: function () { duplicateCard(idx); }, variant: 'secondary', isSmall: true }, __('Duplicate', 'blockenberg')),
                                el(Button, { onClick: function () { removeCard(idx); }, variant: 'link', isDestructive: true, isSmall: true }, __('Remove', 'blockenberg'))
                            )
                        )
                    );
                }),
                el('div', { style: { gridColumn: '1 / -1', textAlign: 'center', paddingTop: '8px' } },
                    el(Button, { onClick: addCard, variant: 'primary', isSmall: true }, __('+ Add Card', 'blockenberg'))
                )
            );

            var wrapStyle = Object.assign(
                { background: attr.bgColor || '', paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' },
                _tv()(attr.typoTitle, '--bkbg-fcards-tt-'),
                _tv()(attr.typoDesc, '--bkbg-fcards-td-'),
                _tv()(attr.typoFilter, '--bkbg-fcards-tf-')
            );

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps({ className: 'bkbg-fcards-wrap', style: wrapStyle }),
                    filterBar,
                    cardsGrid
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-fc-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
