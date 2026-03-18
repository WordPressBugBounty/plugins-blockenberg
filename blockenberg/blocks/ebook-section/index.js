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
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _ebkTC, _ebkTV;
    function _tc() { return _ebkTC || (_ebkTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_ebkTV || (_ebkTV = window.bkbgTypoCssVars)) ? _ebkTV(t, p) : {}; }
    var IP = function () { return window.bkbgIconPicker; };

    var FORMAT_LABELS = { pdf: 'PDF', epub: 'EPUB', course: 'Course', template: 'Template', toolkit: 'Toolkit', guide: 'Guide', checklist: 'Checklist' };

    registerBlockType('blockenberg/ebook-section', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps({ style: Object.assign({ background: attr.bgColor, padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px' }, _tv(attr.typoTitle || {}, '--bkbg-ebk-ttl-'), _tv(attr.typoSubtitle || {}, '--bkbg-ebk-sub-'), _tv(attr.typoPrice || {}, '--bkbg-ebk-prc-'), _tv(attr.typoCta || {}, '--bkbg-ebk-cta-')) });

            function updateItem(idx, key, value) {
                var arr = attr.whatInside.map(function (it, i) {
                    if (i !== idx) return it;
                    var c = Object.assign({}, it); c[key] = value; return c;
                });
                set({ whatInside: arr });
            }

            var fmtLabel = attr.formatLabel || FORMAT_LABELS[attr.format] || attr.format.toUpperCase();

            /* Cover element */
            var coverEl = el('div', { style: { position: 'relative', perspective: '600px' } },
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: function (m) { set({ coverUrl: m.url, coverId: m.id, coverAlt: m.alt || '' }); },
                        allowedTypes: ['image'],
                        value: attr.coverId,
                        render: function (ref) {
                            return attr.coverUrl
                                ? el('div', { style: { position: 'relative', cursor: 'pointer' }, onClick: ref.open },
                                    el('img', { src: attr.coverUrl, alt: attr.coverAlt, style: { width: '220px', maxWidth: '100%', borderRadius: '6px', display: 'block', boxShadow: '8px 8px 24px ' + attr.coverShadow, transform: attr.show3D ? 'rotateY(-8deg)' : 'none', transition: 'transform .3s' } }),
                                    el('div', { style: { position: 'absolute', top: '6px', right: '6px', background: attr.formatBadgeBg, color: attr.formatBadgeColor, fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 } }, fmtLabel)
                                )
                                : el(Button, { onClick: ref.open, variant: 'secondary', style: { width: '220px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', border: '2px dashed #d1d5db', borderRadius: '6px' } },
                                    el('span', { style: { fontSize: '24px' } }, '📚'),
                                    el('span', {}, __('Upload Cover', 'blockenberg'))
                                );
                        }
                    })
                )
            );

            /* Content column */
            var formatBadgeEl = el('span', { style: { background: attr.formatBadgeBg, color: attr.formatBadgeColor, fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, display: 'inline-block', marginBottom: '8px' } }, fmtLabel);
            var titleEl = el(RichText, { tagName: 'h2', className: 'bkbg-ebk-title', value: attr.title, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Ebook title…', 'blockenberg'), style: { color: attr.titleColor, margin: '0 0 8px' }, onChange: function (v) { set({ title: v }); } });
            var subtitleEl = el(RichText, { tagName: 'p', className: 'bkbg-ebk-subtitle', value: attr.subtitle, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Subtitle or tagline…', 'blockenberg'), style: { color: attr.subtitleColor, margin: '0 0 16px' }, onChange: function (v) { set({ subtitle: v }); } });

            var priceEl = el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' } },
                el('span', { className: 'bkbg-ebk-price', style: { color: attr.priceColor } }, attr.price || 'Free'),
                attr.originalPrice && el('span', { style: { fontSize: '16px', color: attr.origPriceColor, textDecoration: 'line-through' } }, attr.originalPrice),
                attr.pageCount && el('span', { style: { fontSize: '12px', color: attr.authorColor } }, '· ' + attr.pageCount)
            );

            var whatInsideEl = el('ul', { style: { listStyle: 'none', padding: 0, margin: '0 0 16px' } },
                (attr.whatInside || []).map(function (it, i) {
                    return el('li', { key: i, style: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', fontSize: '14px', color: attr.itemColor } },
                        el('span', { style: { fontSize: '15px', flexShrink: 0 } }, (it.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(it.iconType, it.icon, it.iconDashicon, it.iconImageUrl, it.iconDashiconColor) : (it.icon || '✅')),
                        el('span', {}, it.item)
                    );
                })
            );

            var testimonialEl = attr.showTestimonial && el('div', { style: { background: attr.testimonialBg, borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' } },
                el('div', { style: { fontSize: '24px', color: attr.quoteColor, lineHeight: 1 } }, '"'),
                el('p', { style: { margin: '4px 0 8px', fontSize: '13px', fontStyle: 'italic', color: attr.testimonialColor } }, attr.testimonialQuote),
                el('div', { style: { fontSize: '12px', fontWeight: 600, color: attr.authorColor } }, attr.testimonialName)
            );

            var ctaEl = el('a', { href: '#', className: 'bkbg-ebk-cta', style: { background: attr.ctaBg, color: attr.ctaColor } }, attr.ctaLabel);

            var isSplit = attr.layout === 'split';
            var isCentered = attr.layout === 'centered';

            var innerStyle = isSplit
                ? { display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }
                : { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '520px', margin: '0 auto' };

            var coverWrap = el('div', { style: isSplit ? { flexShrink: 0 } : { marginBottom: '24px' } }, coverEl);
            var contentWrap = el('div', { style: isSplit ? { flex: 1, minWidth: '280px' } : {} },
                formatBadgeEl, titleEl, subtitleEl, priceEl, whatInsideEl, testimonialEl, ctaEl
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Author Name', 'blockenberg'), value: attr.authorName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ authorName: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Format', 'blockenberg'), value: attr.format, __nextHasNoMarginBottom: true,
                            options: [
                                { label: 'PDF', value: 'pdf' }, { label: 'EPUB', value: 'epub' }, { label: 'Course', value: 'course' },
                                { label: 'Template', value: 'template' }, { label: 'Toolkit', value: 'toolkit' }, { label: 'Guide', value: 'guide' }, { label: 'Checklist', value: 'checklist' }
                            ],
                            onChange: function (v) { set({ format: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Custom Format Label (override)', 'blockenberg'), value: attr.formatLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ formatLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Page Count / Size', 'blockenberg'), value: attr.pageCount, __nextHasNoMarginBottom: true, onChange: function (v) { set({ pageCount: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Price', 'blockenberg'), value: attr.price, __nextHasNoMarginBottom: true, onChange: function (v) { set({ price: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Original Price (crossed out)', 'blockenberg'), value: attr.originalPrice, __nextHasNoMarginBottom: true, onChange: function (v) { set({ originalPrice: v }); } })
                    )
                ),
                el(PanelBody, { title: __('What\'s Inside List', 'blockenberg'), initialOpen: false },
                    (attr.whatInside || []).map(function (it, idx) {
                        return el('div', { key: idx, style: { display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'flex-start' } },
                            el('div', { style: { flexShrink: 0 } },
                                el(IP().IconPickerControl, {
                                    iconType: it.iconType, customChar: it.icon, dashicon: it.iconDashicon, imageUrl: it.iconImageUrl,
                                    onChangeType: function (v) { updateItem(idx, 'iconType', v); },
                                    onChangeChar: function (v) { updateItem(idx, 'icon', v); },
                                    onChangeDashicon: function (v) { updateItem(idx, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateItem(idx, 'iconImageUrl', v); }
                                })
                            ),
                            el('div', { style: { flex: 1 } },
                                el(TextControl, { label: '', value: it.item, placeholder: 'Feature…', __nextHasNoMarginBottom: true, onChange: function (v) { updateItem(idx, 'item', v); } })
                            ),
                            el(Button, { variant: 'link', isDestructive: true, onClick: function () { set({ whatInside: attr.whatInside.filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                        );
                    }),
                    el(Button, { variant: 'secondary', style: { marginTop: '4px' }, onClick: function () { set({ whatInside: (attr.whatInside || []).concat([{ icon: '✅', item: '', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) }); } }, __('+ Add Item', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Testimonial', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Testimonial', 'blockenberg'), checked: attr.showTestimonial, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTestimonial: v }); } }),
                    attr.showTestimonial && el('div', { style: { marginTop: '8px' } },
                        el(TextareaControl, { label: __('Quote', 'blockenberg'), value: attr.testimonialQuote, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ testimonialQuote: v }); } }),
                        el('div', { style: { marginTop: '6px' } },
                            el(TextControl, { label: __('Name', 'blockenberg'), value: attr.testimonialName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ testimonialName: v }); } })
                        )
                    )
                ),
                el(PanelBody, { title: __('CTA Button', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Button Text', 'blockenberg'), value: attr.ctaLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaLabel: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Button URL', 'blockenberg'), value: attr.ctaUrl, placeholder: 'https://...', __nextHasNoMarginBottom: true, onChange: function (v) { set({ ctaUrl: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), checked: attr.openInNewTab, __nextHasNoMarginBottom: true, onChange: function (v) { set({ openInNewTab: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Split (cover left)', value: 'split' }, { label: 'Centered', value: 'centered' }, { label: 'Minimal (no cover)', value: 'minimal' }],
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('3D Cover Tilt Effect', 'blockenberg'), checked: attr.show3D, __nextHasNoMarginBottom: true, onChange: function (v) { set({ show3D: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Title'), typo: attr.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); }, defaultSize: attr.titleFontSize || 28 }),
                    _tc() && el(_tc(), { label: __('Subtitle'), typo: attr.typoSubtitle || {}, onChange: function (v) { set({ typoSubtitle: v }); }, defaultSize: attr.subtitleFontSize || 15 }),
                    _tc() && el(_tc(), { label: __('Price'), typo: attr.typoPrice || {}, onChange: function (v) { set({ typoPrice: v }); }, defaultSize: attr.priceFontSize || 22 }),
                    _tc() && el(_tc(), { label: __('CTA Button'), typo: attr.typoCta || {}, onChange: function (v) { set({ typoCta: v }); }, defaultSize: attr.ctaFontSize || 15 })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section BG', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f0f4ff' }); } },
                        { label: __('Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); } },
                        { label: __('Subtitle', 'blockenberg'), value: attr.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#374151' }); } },
                        { label: __('Author / Meta', 'blockenberg'), value: attr.authorColor, onChange: function (v) { set({ authorColor: v || '#6b7280' }); } },
                        { label: __('Format Badge BG', 'blockenberg'), value: attr.formatBadgeBg, onChange: function (v) { set({ formatBadgeBg: v || '#6366f1' }); } },
                        { label: __('Format Badge Text', 'blockenberg'), value: attr.formatBadgeColor, onChange: function (v) { set({ formatBadgeColor: v || '#ffffff' }); } },
                        { label: __('Feature Item Text', 'blockenberg'), value: attr.itemColor, onChange: function (v) { set({ itemColor: v || '#374151' }); } },
                        { label: __('Testimonial BG', 'blockenberg'), value: attr.testimonialBg, onChange: function (v) { set({ testimonialBg: v || '#ffffff' }); } },
                        { label: __('Testimonial Text', 'blockenberg'), value: attr.testimonialColor, onChange: function (v) { set({ testimonialColor: v || '#374151' }); } },
                        { label: __('Quote Mark', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { set({ quoteColor: v || '#6366f1' }); } },
                        { label: __('CTA Button BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { set({ ctaBg: v || '#6366f1' }); } },
                        { label: __('CTA Button Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Price', 'blockenberg'), value: attr.priceColor, onChange: function (v) { set({ priceColor: v || '#16a34a' }); } },
                        { label: __('Orig Price', 'blockenberg'), value: attr.origPriceColor, onChange: function (v) { set({ origPriceColor: v || '#9ca3af' }); } },
                        { label: __('Cover Shadow', 'blockenberg'), value: attr.coverShadow, onChange: function (v) { set({ coverShadow: v || '#6366f160' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { maxWidth: '960px', margin: '0 auto', padding: '0 20px' } },
                    el('div', { style: innerStyle },
                        attr.layout !== 'minimal' && coverWrap,
                        contentWrap
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ebk-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
