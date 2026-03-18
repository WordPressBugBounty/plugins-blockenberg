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

    /* ── Typography lazy getters ───────────────────────────────────────── */
    var _Typo, _tv;
    Object.defineProperty(window, '__bkbgArhTypoReady', { get: function () {
        if (!_Typo) _Typo = window.bkbgTypographyControl;
        if (!_tv)   _tv   = window.bkbgTypoCssVars;
        return !!(_Typo && _tv);
    }});
    function getTypoCssVars()   { window.__bkbgArhTypoReady; return _tv;   }
    function getTypoComponent()  { window.__bkbgArhTypoReady; return _Typo; }

    registerBlockType('blockenberg/article-header', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {
                    '--bkbg-arh-headline-sz': attr.headlineSize + 'px',
                    '--bkbg-arh-sub-sz':      attr.subSize + 'px'
                };
                if (_tv) {
                    Object.assign(s, _tv(attr.headlineTypo || {}, '--bkbg-arh-headline-'));
                    Object.assign(s, _tv(attr.subTypo      || {}, '--bkbg-arh-sub-'));
                }
                return { className: 'bkbg-arh-editor', style: s };
            })());

            var isCentered = attr.layout === 'centered';

            /* meta bar */
            var metaBar = (attr.showAuthor || attr.showDate || attr.showReadingTime)
                ? el('div', { className: 'bkbg-arh-meta', style: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid ' + attr.dividerColor } },
                    attr.showAuthor && el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (m) { setAttr({ authorAvatarUrl: m.url, authorAvatarId: m.id }); },
                                allowedTypes: ['image'], value: attr.authorAvatarId,
                                render: function (ref) {
                                    return el('div', { onClick: ref.open, style: { cursor: 'pointer' } },
                                        attr.authorAvatarUrl
                                            ? el('img', { src: attr.authorAvatarUrl, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } })
                                            : el('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' } }, '👤')
                                    );
                                }
                            })
                        ),
                        el('div', {},
                            el(RichText, {
                                tagName: 'p', value: attr.authorName,
                                style: { margin: 0, fontSize: '14px', fontWeight: '600', color: attr.headlineColor },
                                onChange: function (v) { setAttr({ authorName: v }); }
                            }),
                            el(RichText, {
                                tagName: 'p', value: attr.authorRole,
                                style: { margin: 0, fontSize: '12px', color: attr.metaColor },
                                onChange: function (v) { setAttr({ authorRole: v }); }
                            })
                        )
                    ),
                    (attr.showDate || attr.showReadingTime) && el('div', { style: { display: 'flex', gap: '12px', alignItems: 'center', color: attr.metaColor, fontSize: '13px' } },
                        attr.showDate && el(RichText, {
                            tagName: 'span', value: attr.publishDate, onChange: function (v) { setAttr({ publishDate: v }); },
                            style: { color: attr.metaColor, fontSize: '13px' }
                        }),
                        attr.showDate && attr.showReadingTime && el('span', {}, '·'),
                        attr.showReadingTime && el(RichText, {
                            tagName: 'span', value: attr.readingTime, onChange: function (v) { setAttr({ readingTime: v }); },
                            style: { color: attr.metaColor, fontSize: '13px' }
                        })
                    )
                ) : null;

            /* hero image */
            var heroImage = attr.showHeroImage
                ? el('div', { style: { marginTop: '32px' } },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ heroImageUrl: m.url, heroImageId: m.id, heroImageAlt: m.alt || '' }); },
                            allowedTypes: ['image'], value: attr.heroImageId,
                            render: function (ref) {
                                return attr.heroImageUrl
                                    ? el('div', { style: { position: 'relative' } },
                                        el('img', { src: attr.heroImageUrl, alt: attr.heroImageAlt, style: { width: '100%', borderRadius: attr.heroRadius + 'px', display: 'block', maxHeight: '480px', objectFit: 'cover' } }),
                                        el(Button, {
                                            isSmall: true, isDestructive: true,
                                            style: { position: 'absolute', top: '8px', right: '8px' },
                                            onClick: function () { setAttr({ heroImageUrl: '', heroImageId: 0 }); }
                                        }, '✕ Remove')
                                    )
                                    : el('div', {
                                        onClick: ref.open, style: {
                                            border: '2px dashed #e5e7eb', borderRadius: attr.heroRadius + 'px', height: '220px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#9ca3af', fontSize: '16px'
                                        }
                                    }, '🖼 Click to add hero image');
                            }
                        })
                    )
                ) : null;

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Category & Headline', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Category Badge', 'blockenberg'), checked: attr.showCategory, onChange: function (v) { setAttr({ showCategory: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Subheadline', 'blockenberg'), checked: attr.showSubheadline, onChange: function (v) { setAttr({ showSubheadline: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Headline Tag', 'blockenberg'), value: attr.headlineTag,
                        options: ['h1', 'h2', 'h3'].map(function (t) { return { label: t.toUpperCase(), value: t }; }),
                        onChange: function (v) { setAttr({ headlineTag: v }); }, __nextHasNoMarginBottom: true
                    }),
                    ),
                el(PanelBody, { title: __('Author & Meta', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Author', 'blockenberg'), checked: attr.showAuthor, onChange: function (v) { setAttr({ showAuthor: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Date', 'blockenberg'), checked: attr.showDate, onChange: function (v) { setAttr({ showDate: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Reading Time', 'blockenberg'), checked: attr.showReadingTime, onChange: function (v) { setAttr({ showReadingTime: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Hero Image & Layout', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Hero Image', 'blockenberg'), checked: attr.showHeroImage, onChange: function (v) { setAttr({ showHeroImage: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showHeroImage && el(RangeControl, { label: __('Image Radius (px)', 'blockenberg'), value: attr.heroRadius, min: 0, max: 32, onChange: function (v) { setAttr({ heroRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout,
                        options: [{ label: 'Simple (left-aligned)', value: 'simple' }, { label: 'Centered', value: 'centered' }],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 480, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Headline Typography', 'blockenberg'),
                        value: attr.headlineTypo || {},
                        onChange: function (v) { setAttr({ headlineTypo: v }); }
                    }),
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Subheadline Typography', 'blockenberg'),
                        value: attr.subTypo || {},
                        onChange: function (v) { setAttr({ subTypo: v }); }
                    })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Category BG', 'blockenberg'), value: attr.categoryBg, onChange: function (v) { setAttr({ categoryBg: v || '#7c3aed' }); } },
                        { label: __('Category Text', 'blockenberg'), value: attr.categoryColor, onChange: function (v) { setAttr({ categoryColor: v || '#ffffff' }); } },
                        { label: __('Headline', 'blockenberg'), value: attr.headlineColor, onChange: function (v) { setAttr({ headlineColor: v || '#111827' }); } },
                        { label: __('Subheadline', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                        { label: __('Meta / Date', 'blockenberg'), value: attr.metaColor, onChange: function (v) { setAttr({ metaColor: v || '#9ca3af' }); } },
                        { label: __('Divider', 'blockenberg'), value: attr.dividerColor, onChange: function (v) { setAttr({ dividerColor: v || '#e5e7eb' }); } }
                    ]
                })
            );

            return el('div', blockProps, controls,
                el('div', {
                    style: {
                        background: attr.bgColor,
                        paddingTop: attr.paddingTop + 'px',
                        paddingBottom: attr.paddingBottom + 'px'
                    }
                },
                    el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', textAlign: isCentered ? 'center' : 'left' } },
                        attr.showCategory && el('div', { style: { marginBottom: '16px' } },
                            el('span', {
                                style: { background: attr.categoryBg, color: attr.categoryColor, fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em' }
                            }, el(RichText, {
                                tagName: 'span', value: attr.category, onChange: function (v) { setAttr({ category: v }); }
                            }))
                        ),
                        el(RichText, {
                            tagName: attr.headlineTag, value: attr.headline,
                            className: 'bkbg-arh-headline',
                            style: { color: attr.headlineColor, margin: '0 0 20px' },
                            onChange: function (v) { setAttr({ headline: v }); }
                        }),
                        attr.showSubheadline && el(RichText, {
                            tagName: 'p', value: attr.subheadline,
                            className: 'bkbg-arh-sub',
                            style: { color: attr.subColor, margin: '0 0 28px' },
                            onChange: function (v) { setAttr({ subheadline: v }); }
                        }),
                        metaBar,
                        heroImage
                    )
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-arh-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
