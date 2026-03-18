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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    function AppleBadge(style) {
        return el('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 12, background: style === 'black' ? '#000' : '#fff', border: style === 'white' ? '1.5px solid #ccc' : 'none', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', minWidth: 160 } },
            el('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: style === 'black' ? '#fff' : '#000' },
                el('path', { d: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' })
            ),
            el('div', null,
                el('div', { style: { fontSize: 9, color: style === 'black' ? '#fff' : '#555', letterSpacing: '.05em' } }, 'Download on the'),
                el('div', { style: { fontSize: 17, fontWeight: 700, color: style === 'black' ? '#fff' : '#000', lineHeight: 1.1 } }, 'App Store')
            )
        );
    }

    function GoogleBadge(style) {
        return el('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 12, background: style === 'black' ? '#000' : '#fff', border: style === 'white' ? '1.5px solid #ccc' : 'none', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', minWidth: 160 } },
            el('svg', { width: 28, height: 28, viewBox: '0 0 24 24' },
                el('path', { d: 'M3.18 23.76A2 2 0 0 1 2 22V2A2 2 0 0 1 3.18.24L13.26 10.3l-10.08 13.46z', fill: '#4285F4' }),
                el('path', { d: 'M16.93 13.97l-3.67-3.67 3.67-3.67 4.1 2.36a2.05 2.05 0 0 1 0 2.62l-4.1 2.36z', fill: '#FBBC04' }),
                el('path', { d: 'M3.18.24L13.26 10.3l3.67-3.67L4.96.3A2.1 2.1 0 0 0 3.18.24z', fill: '#34A853' }),
                el('path', { d: 'M3.18 23.76L13.26 13.7l3.67 3.67-11.97 6.33c-.6.31-1.32.27-1.78-.24z', fill: '#EA4335' })
            ),
            el('div', null,
                el('div', { style: { fontSize: 9, color: style === 'black' ? '#fff' : '#555', letterSpacing: '.05em' } }, 'GET IT ON'),
                el('div', { style: { fontSize: 17, fontWeight: 700, color: style === 'black' ? '#fff' : '#000', lineHeight: 1.1 } }, 'Google Play')
            )
        );
    }

    registerBlockType('blockenberg/app-download', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-app-download-editor' });

            var bg = attr.bgGradient || attr.bgColor;
            var _tv = getTypoCssVars();
            var previewStyle = { background: bg, padding: attr.paddingTop + 'px 40px ' + attr.paddingBottom + 'px' };
            Object.assign(previewStyle, _tv(attr.headingTypo || {}, '--bkbg-ad-heading-'));
            Object.assign(previewStyle, _tv(attr.bodyTypo || {}, '--bkbg-ad-body-'));
            if (attr.headingSize && attr.headingSize !== 44) previewStyle['--bkbg-ad-heading-sz'] = attr.headingSize + 'px';
            if (attr.textSize && attr.textSize !== 18) previewStyle['--bkbg-ad-body-sz'] = attr.textSize + 'px';
            var innerStyle = { maxWidth: attr.maxWidth + 'px', margin: '0 auto', display: 'grid', gridTemplateColumns: attr.layout === 'split' ? '1fr 1fr' : '1fr', gap: 64, alignItems: 'center' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Tag', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showTag, onChange: function (v) { setAttr({ showTag: v }); } }),
                        attr.showTag && el(TextControl, { label: __('Tag Text', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.tag, onChange: function (v) { setAttr({ tag: v }); } }),
                        el(ToggleControl, { label: __('Show Rating', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showRating, onChange: function (v) { setAttr({ showRating: v }); } }),
                        attr.showRating && el(TextControl, { label: __('Rating (e.g. 4.9)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.rating, onChange: function (v) { setAttr({ rating: v }); } }),
                        attr.showRating && el(TextControl, { label: __('Rating Count', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.ratingCount, onChange: function (v) { setAttr({ ratingCount: v }); } }),
                        el(ToggleControl, { label: __('Show App Store Badge', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showApple, onChange: function (v) { setAttr({ showApple: v }); } }),
                        attr.showApple && el(TextControl, { label: __('App Store URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.appleUrl, onChange: function (v) { setAttr({ appleUrl: v }); } }),
                        el(ToggleControl, { label: __('Show Google Play Badge', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showGoogle, onChange: function (v) { setAttr({ showGoogle: v }); } }),
                        attr.showGoogle && el(TextControl, { label: __('Google Play URL', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.googleUrl, onChange: function (v) { setAttr({ googleUrl: v }); } }),
                        el(SelectControl, { label: __('Badge Style', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.badgeStyle,
                            options: [{ label: 'Black', value: 'black' }, { label: 'White', value: 'white' }],
                            onChange: function (v) { setAttr({ badgeStyle: v }); } })
                    ),
                    el(PanelBody, { title: __('Device Image', 'blockenberg'), initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ deviceImageUrl: m.url, deviceImageId: m.id, deviceAlt: m.alt || '' }); },
                                allowedTypes: ['image'],
                                value: attr.deviceImageId,
                                render: function (r) {
                                    return el(Fragment, null,
                                        attr.deviceImageUrl && el('img', { src: attr.deviceImageUrl, style: { width: '100%', borderRadius: 8, marginBottom: 8 } }),
                                        el(Button, { onClick: r.open, variant: 'secondary', __nextHasNoMarginBottom: true }, attr.deviceImageUrl ? __('Change Image', 'blockenberg') : __('Select Device Image', 'blockenberg')),
                                        attr.deviceImageUrl && el(Button, { onClick: function () { setAttr({ deviceImageUrl: '', deviceImageId: 0 }); }, variant: 'link', isDestructive: true, __nextHasNoMarginBottom: true, style: { marginLeft: 8 } }, __('Remove', 'blockenberg'))
                                    );
                                }
                            })
                        ),
                        el(SelectControl, { label: __('Layout', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: 'Split (text + image)', value: 'split' }, { label: 'Centered (text only)', value: 'centered' }],
                            onChange: function (v) { setAttr({ layout: v }); } }),
                        el(SelectControl, { label: __('Image Side', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.imageLayout,
                            options: [{ label: 'Right', value: 'right' }, { label: 'Left', value: 'left' }],
                            onChange: function (v) { setAttr({ imageLayout: v }); } })
                    ),
                    el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 600, max: 1600, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                        el(getTypographyControl(), { label: __('Body Typography', 'blockenberg'), value: attr.bodyTypo || {}, onChange: function (v) { setAttr({ bodyTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,      onChange: function (v) { setAttr({ bgColor: v || '#0f172a' }); },      label: __('Background', 'blockenberg') },
                            { value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#ffffff' }); }, label: __('Heading', 'blockenberg') },
                            { value: attr.textColor,    onChange: function (v) { setAttr({ textColor: v || '#94a3b8' }); },    label: __('Body Text', 'blockenberg') },
                            { value: attr.tagBg,        onChange: function (v) { setAttr({ tagBg: v || 'rgba(255,255,255,.1)' }); }, label: __('Tag Background', 'blockenberg') },
                            { value: attr.tagColor,     onChange: function (v) { setAttr({ tagColor: v || '#ffffff' }); },     label: __('Tag Text', 'blockenberg') },
                            { value: attr.starColor,    onChange: function (v) { setAttr({ starColor: v || '#f59e0b' }); },    label: __('Stars', 'blockenberg') },
                            { value: attr.accentColor,  onChange: function (v) { setAttr({ accentColor: v || '#818cf8' }); },  label: __('Accent', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: previewStyle },
                        el('div', { style: innerStyle },
                            el('div', { style: { order: attr.imageLayout === 'right' ? 0 : 1, display: 'flex', flexDirection: 'column', gap: 24 } },
                                attr.showTag && el('span', { style: { display: 'inline-block', background: attr.tagBg, color: attr.tagColor, borderRadius: 100, padding: '4px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', alignSelf: 'flex-start' } }, attr.tag),
                                el(RichText, { tagName: 'h2', value: attr.heading, onChange: function (v) { setAttr({ heading: v }); }, className: 'bkbg-app-dl-heading', style: { color: attr.headingColor, margin: 0 }, placeholder: __('App heading…', 'blockenberg') }),
                                el(RichText, { tagName: 'p', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); }, className: 'bkbg-app-dl-body', style: { color: attr.textColor, margin: 0 }, placeholder: __('Subtitle…', 'blockenberg') }),
                                attr.showRating && el('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                                    el('div', { style: { color: attr.starColor, fontSize: 20 } }, '★★★★★'),
                                    el('div', { style: { color: attr.textColor, fontSize: 14 } }, attr.rating + ' · ' + attr.ratingCount)
                                ),
                                (attr.showApple || attr.showGoogle) && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 16 } },
                                    attr.showApple && AppleBadge(attr.badgeStyle),
                                    attr.showGoogle && GoogleBadge(attr.badgeStyle)
                                )
                            ),
                            attr.layout === 'split' && el('div', { style: { order: attr.imageLayout === 'right' ? 1 : 0, display: 'flex', justifyContent: 'center' } },
                                attr.deviceImageUrl
                                    ? el('img', { src: attr.deviceImageUrl, alt: attr.deviceAlt, style: { maxHeight: 480, width: 'auto', display: 'block', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,.5))' } })
                                    : el('div', { style: { width: 240, height: 480, background: 'rgba(255,255,255,.08)', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)', fontSize: 13 } }, __('Device screenshot', 'blockenberg'))
                            )
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-app-download-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
