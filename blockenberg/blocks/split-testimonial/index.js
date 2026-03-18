( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildWrapStyle(attr) {
        var s = {
            '--bkst-qt-sz': attr.quoteSize + 'px',
            '--bkst-qt-w':  attr.quoteFontWeight,
            '--bkst-nm-sz': (attr.authorSize + 2) + 'px',
            '--bkst-mt-sz': attr.authorSize + 'px',
        };
        var fn = getTypoCssVars();
        if (fn) {
            Object.assign(s, fn(attr.quoteTypo, '--bkst-qt'));
            Object.assign(s, fn(attr.nameTypo, '--bkst-nm'));
            Object.assign(s, fn(attr.metaTypo, '--bkst-mt'));
        }
        return s;
    }

    registerBlockType('blockenberg/split-testimonial', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-st-editor', style: buildWrapStyle(attr) });

            var previewStyle = { background: attr.bgColor, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px', position: 'relative', overflow: 'hidden' };
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto', display: 'grid', gridTemplateColumns: attr.layout === 'left-photo' ? '1fr 2fr' : '2fr 1fr', gap: 64, alignItems: 'center' };
            var photoOrder = attr.layout === 'left-photo' ? 0 : 1;
            var textOrder  = attr.layout === 'left-photo' ? 1 : 0;

            var avatarRadius = attr.avatarShape === 'circle' ? '50%' : attr.avatarShape === 'rounded' ? '20%' : '0';

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Author', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Name', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.authorName, onChange: function (v) { setAttr({ authorName: v }); } }),
                        el(TextControl, { label: __('Title', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.authorTitle, onChange: function (v) { setAttr({ authorTitle: v }); } }),
                        el(ToggleControl, { label: __('Show Company', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showCompany, onChange: function (v) { setAttr({ showCompany: v }); } }),
                        attr.showCompany && el(TextControl, { label: __('Company', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.authorCompany, onChange: function (v) { setAttr({ authorCompany: v }); } }),
                        el(ToggleControl, { label: __('Show Stars', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showStars, onChange: function (v) { setAttr({ showStars: v }); } }),
                        attr.showStars && el(RangeControl, { label: __('Star Rating', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.stars, min: 1, max: 5, onChange: function (v) { setAttr({ stars: v }); } })
                    ),
                    el(PanelBody, { title: __('Photo', 'blockenberg'), initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ authorImageUrl: m.url, authorImageId: m.id, authorAlt: m.alt || '' }); },
                                allowedTypes: ['image'], value: attr.authorImageId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attr.authorImageUrl && el('img', { src: attr.authorImageUrl, style: { width: 100, height: 100, borderRadius: avatarRadius, objectFit: 'cover', display: 'block', marginBottom: 8 } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.authorImageUrl ? __('Change Photo', 'blockenberg') : __('Select Photo', 'blockenberg')),
                                        attr.authorImageUrl && el(Button, { onClick: function () { setAttr({ authorImageUrl: '', authorImageId: 0 }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true, style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        ),
                        el(SelectControl, { label: __('Photo Shape', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.avatarShape,
                            options: [{ label: 'Circle', value: 'circle' }, { label: 'Rounded', value: 'rounded' }, { label: 'Square', value: 'square' }],
                            onChange: function (v) { setAttr({ avatarShape: v }); } }),
                        el(RangeControl, { label: __('Photo Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.avatarSize, min: 60, max: 300, onChange: function (v) { setAttr({ avatarSize: v }); } }),
                        el(SelectControl, { label: __('Layout', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: 'Photo Left', value: 'left-photo' }, { label: 'Photo Right', value: 'right-photo' }],
                            onChange: function (v) { setAttr({ layout: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Quote Mark', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showQuoteMark, onChange: function (v) { setAttr({ showQuoteMark: v }); } }),
                        el(RangeControl, { label: __('Author Size (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.authorSize, min: 12, max: 24, onChange: function (v) { setAttr({ authorSize: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 500, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label:__('Quote','blockenberg'), value:attr.quoteTypo, onChange:function(v){ setAttr({quoteTypo:v}); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label:__('Author name','blockenberg'), value:attr.nameTypo, onChange:function(v){ setAttr({nameTypo:v}); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label:__('Author meta','blockenberg'), value:attr.metaTypo, onChange:function(v){ setAttr({metaTypo:v}); } }) : null
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,        onChange: function (v) { setAttr({ bgColor: v || '#1e1b4b' }); },              label: __('Background', 'blockenberg') },
                            { value: attr.accentBg,       onChange: function (v) { setAttr({ accentBg: v || '#7c3aed' }); },             label: __('Photo Accent BG', 'blockenberg') },
                            { value: attr.quoteColor,     onChange: function (v) { setAttr({ quoteColor: v || '#ffffff' }); },           label: __('Quote Text', 'blockenberg') },
                            { value: attr.authorColor,    onChange: function (v) { setAttr({ authorColor: v || '#c4b5fd' }); },          label: __('Author Text', 'blockenberg') },
                            { value: attr.starColor,      onChange: function (v) { setAttr({ starColor: v || '#fbbf24' }); },            label: __('Stars', 'blockenberg') },
                            { value: attr.quoteMarkColor, onChange: function (v) { setAttr({ quoteMarkColor: v || 'rgba(124,58,237,.45)' }); }, label: __('Quote Mark', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        attr.showQuoteMark && el('div', { style: { position: 'absolute', top: 20, left: 40, fontSize: 200, lineHeight: 1, color: attr.quoteMarkColor, fontFamily: 'Georgia,serif', pointerEvents: 'none', userSelect: 'none' } }, '"'),
                        el('div', { style: innerStyle },
                            // Photo column
                            el('div', { style: { order: photoOrder, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 } },
                                el('div', { style: { width: attr.avatarSize + 'px', height: attr.avatarSize + 'px', borderRadius: avatarRadius, background: attr.accentBg, overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 6px ' + attr.accentBg + '44' } },
                                    attr.authorImageUrl
                                        ? el('img', { src: attr.authorImageUrl, alt: attr.authorAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                                        : el('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.6)', fontSize: 13 } }, __('Photo', 'blockenberg'))
                                ),
                                el('div', { style: { textAlign: 'center' } },
                                    el('div', { className: 'bkbg-st-author-name', style: { color: '#ffffff' } }, attr.authorName),
                                    el('div', { className: 'bkbg-st-author-meta', style: { color: attr.authorColor } }, attr.authorTitle + (attr.showCompany && attr.authorCompany ? ', ' + attr.authorCompany : ''))
                                )
                            ),
                            // Quote column
                            el('div', { style: { order: textOrder, display: 'flex', flexDirection: 'column', gap: 24 } },
                                attr.showStars && el('div', { style: { fontSize: 24, color: attr.starColor, letterSpacing: 2 } }, '★'.repeat(attr.stars) + '☆'.repeat(5 - attr.stars)),
                                el(RichText, { tagName: 'blockquote', className: 'bkbg-st-quote', value: attr.quote, onChange: function (v) { setAttr({ quote: v }); }, style: { color: attr.quoteColor, margin: 0 }, placeholder: __('Enter the testimonial quote…', 'blockenberg') })
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-split-testimonial-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
