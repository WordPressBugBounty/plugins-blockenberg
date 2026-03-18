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
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var TYPE_ICONS = { book: '📚', article: '📄', podcast: '🎙️', course: '🎓', video: '🎬' };
    var TYPE_LABELS = { book: 'Book', article: 'Article', podcast: 'Podcast', course: 'Course', video: 'Video' };

    registerBlockType('blockenberg/reading-card', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.titleTypo || {}, '--bkrdc-tt-'));
                    Object.assign(s, _tvFn(attr.authorTypo || {}, '--bkrdc-at-'));
                    Object.assign(s, _tvFn(attr.descTypo || {}, '--bkrdc-dt-'));
                }
                return { className: 'bkbg-rdc-editor', style: s };
            })());

            var stars = Array.from({ length: 5 }, function (_, i) {
                return el('span', { key: i, style: { color: i < attr.rating ? attr.ratingColor : '#d1d5db', fontSize: '18px' } }, '★');
            });

            var coverPlaceholder = el('div', {
                style: {
                    width: (attr.layout === 'vertical' ? '100%' : attr.coverWidth) + 'px',
                    minWidth: attr.layout !== 'vertical' ? attr.coverWidth + 'px' : undefined,
                    height: attr.layout === 'vertical' ? '200px' : (attr.coverWidth * 1.4) + 'px',
                    background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', flexShrink: 0
                }
            }, TYPE_ICONS[attr.contentType] || '📚');

            var cover = attr.coverUrl
                ? el('img', {
                    src: attr.coverUrl, alt: attr.coverAlt,
                    style: {
                        width: attr.layout === 'vertical' ? '100%' : attr.coverWidth + 'px',
                        minWidth: attr.layout !== 'vertical' ? attr.coverWidth + 'px' : undefined,
                        height: attr.layout === 'vertical' ? '200px' : 'auto',
                        objectFit: 'cover', borderRadius: '8px', flexShrink: 0, display: 'block'
                    }
                })
                : coverPlaceholder;

            var typeBadge = el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' } },
                el('span', {
                    style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }
                }, (attr.badge || TYPE_LABELS[attr.contentType] || 'BOOK'))
            );

            var cardStyle = {
                display: 'flex', flexDirection: attr.layout === 'vertical' ? 'column' : 'row',
                gap: '24px', background: attr.bgColor,
                border: '1px solid ' + attr.borderColor,
                borderRadius: attr.borderRadius + 'px', padding: '24px',
                maxWidth: attr.maxWidth + 'px', margin: '0 auto', alignItems: attr.layout === 'vertical' ? 'stretch' : 'flex-start'
            };

            if (attr.layout === 'minimal') {
                cardStyle = { display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', background: 'transparent', borderBottom: '1px solid ' + attr.borderColor, padding: '16px 0', maxWidth: attr.maxWidth + 'px', margin: '0 auto' };
            }

            var content = el('div', { style: { flex: 1, minWidth: 0 } },
                typeBadge,
                el(RichText, {
                    tagName: 'h3', value: attr.title,
                    className: 'bkbg-rdc-title',
                    style: { margin: '0 0 6px', color: attr.titleColor },
                    onChange: function (v) { setAttr({ title: v }); }
                }),
                el(RichText, {
                    tagName: 'p', value: attr.author,
                    className: 'bkbg-rdc-author',
                    style: { margin: '0 0 12px', color: attr.authorColor },
                    onChange: function (v) { setAttr({ author: v }); }
                }),
                attr.showRating && el('div', { style: { display: 'flex', gap: '2px', marginBottom: '12px' } }, stars),
                attr.layout !== 'minimal' && el(RichText, {
                    tagName: 'p', value: attr.description,
                    className: 'bkbg-rdc-desc',
                    style: { margin: '0 0 16px', color: attr.descColor },
                    onChange: function (v) { setAttr({ description: v }); }
                }),
                el('a', {
                    href: '#editor', style: { fontSize: '14px', fontWeight: '600', color: attr.ctaColor, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }
                }, attr.ctaLabel)
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    el('p', { style: { margin: '8px 0 4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: '#9ca3af' } }, __('Cover Image', 'blockenberg')),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ coverUrl: m.url, coverId: m.id, coverAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.coverId,
                            render: function (ref) {
                                return el('div', {},
                                    attr.coverUrl ? el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' } },
                                        el('img', { src: attr.coverUrl, style: { width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px' } }),
                                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ coverUrl: '', coverId: 0 }); } }, '✕')
                                    ) : null,
                                    el(Button, { isSecondary: true, isSmall: true, onClick: ref.open }, attr.coverUrl ? __('Replace', 'blockenberg') : __('Choose Cover', 'blockenberg'))
                                );
                            }
                        })
                    ),
                    el(SelectControl, {
                        label: __('Content Type', 'blockenberg'), value: attr.contentType,
                        options: [
                            { label: '📚 Book', value: 'book' }, { label: '📄 Article', value: 'article' },
                            { label: '🎙️ Podcast', value: 'podcast' }, { label: '🎓 Course', value: 'course' },
                            { label: '🎬 Video', value: 'video' }
                        ],
                        onChange: function (v) { setAttr({ contentType: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, { label: __('Badge Label (override)', 'blockenberg'), value: attr.badge, onChange: function (v) { setAttr({ badge: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Open in New Tab', 'blockenberg'), checked: attr.ctaIsExternal, onChange: function (v) { setAttr({ ctaIsExternal: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Rating', 'blockenberg'), checked: attr.showRating, onChange: function (v) { setAttr({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showRating && el(RangeControl, { label: __('Rating (stars)', 'blockenberg'), value: attr.rating, min: 0, max: 5, onChange: function (v) { setAttr({ rating: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Layout', 'blockenberg'), value: attr.layout,
                        options: [
                            { label: 'Horizontal (cover left)', value: 'horizontal' },
                            { label: 'Vertical (cover top)', value: 'vertical' },
                            { label: 'Minimal (inline)', value: 'minimal' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Cover Width (px; horizontal only)', 'blockenberg'), value: attr.coverWidth, min: 60, max: 280, onChange: function (v) { setAttr({ coverWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 300, max: 1200, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    TC && el(TC, { label: __('Title', 'blockenberg'), value: attr.titleTypo || {}, onChange: function(v) { setAttr({ titleTypo: v }); } }),
                    TC && el(TC, { label: __('Author', 'blockenberg'), value: attr.authorTypo || {}, onChange: function(v) { setAttr({ authorTypo: v }); } }),
                    TC && el(TC, { label: __('Description', 'blockenberg'), value: attr.descTypo || {}, onChange: function(v) { setAttr({ descTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Badge BG', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { setAttr({ badgeBg: v || '#7c3aed' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { setAttr({ badgeColor: v || '#ffffff' }); } },
                        { label: __('Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                        { label: __('Author', 'blockenberg'), value: attr.authorColor, onChange: function (v) { setAttr({ authorColor: v || '#6b7280' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { setAttr({ descColor: v || '#374151' }); } },
                        { label: __('Stars', 'blockenberg'), value: attr.ratingColor, onChange: function (v) { setAttr({ ratingColor: v || '#f59e0b' }); } },
                        { label: __('CTA Link', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#7c3aed' }); } }
                    ]
                })
            );

            return el('div', blockProps, controls,
                el('div', { style: { paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } },
                    el('div', { style: cardStyle }, cover, content)
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-rdc-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
