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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var MEDIA_ICONS = { video: '▶', audio: '🎙️', image: '🖼️' };

    registerBlockType('blockenberg/media-quote', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var v = getTypoCssVars() || function () { return {}; };
            var blockProps = (function(p){
                p.style = Object.assign(p.style||{},
                    v(attr.quoteTypo,'--bkbg-mqu-qt-'),
                    v(attr.speakerNameTypo,'--bkbg-mqu-sn-'),
                    v(attr.speakerTitleTypo,'--bkbg-mqu-st-')
                ); return p;
            })(useBlockProps({ className: 'bkbg-mqu-editor' }));

            var isTop = attr.layout === 'media-top';
            var isRight = attr.layout === 'media-right';
            var isOnly = attr.layout === 'quote-only';

            /* media panel */
            var mediaPanel = !isOnly && attr.showVideo && el('div', { className: 'bkbg-mqu-media-col', style: { flex: '0 0 45%', position: 'relative' } },
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: function (m) { setAttr({ thumbnailUrl: m.url, thumbnailId: m.id }); },
                        allowedTypes: ['image'], value: attr.thumbnailId,
                        render: function (ref) {
                            return el('div', { style: { position: 'relative', cursor: 'pointer' }, onClick: attr.thumbnailUrl ? undefined : ref.open },
                                attr.thumbnailUrl
                                    ? el('div', { style: { position: 'relative' } },
                                        el('img', {
                                            src: attr.thumbnailUrl,
                                            style: { width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: attr.mediaRadius + 'px', display: 'block' }
                                        }),
                                        /* play button overlay */
                                        el('div', {
                                            style: {
                                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }
                                        }, el('div', {
                                            style: {
                                                width: '56px', height: '56px', borderRadius: '50%', background: attr.playBtnBg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '22px', color: attr.playBtnColor, boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                                            }
                                        }, MEDIA_ICONS[attr.mediaType] || '▶')),
                                        el('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                                            el(Button, { isSmall: true, isSecondary: true, onClick: ref.open }, __('Replace', 'blockenberg')),
                                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ thumbnailUrl: '', thumbnailId: 0 }); } }, '✕')
                                        )
                                    )
                                    : el('div', {
                                        style: { background: '#f3f4f6', borderRadius: attr.mediaRadius + 'px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9ca3af', fontSize: '36px', cursor: 'pointer' }
                                    }, MEDIA_ICONS[attr.mediaType] || '▶', el('span', { style: { fontSize: '13px' } }, __('Click to add thumbnail', 'blockenberg')))
                            );
                        }
                    })
                ),
                attr.showMediaLabel && attr.mediaLabel && el(TextControl, {
                    value: attr.mediaLabel, onChange: function (v) { setAttr({ mediaLabel: v }); },
                    style: { marginTop: '6px', fontSize: '13px' }, __nextHasNoMarginBottom: true
                })
            );

            /* quote panel */
            var quotePanel = el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' } },
                attr.showQuoteIcon && el('span', { style: { fontSize: '48px', color: attr.accentColor, lineHeight: 1, fontFamily: 'Georgia, serif', marginBottom: '-8px', display: 'block' } }, '\u201c'),
                el(RichText, {
                    tagName: 'blockquote', className: 'bkbg-mqu-blockquote', value: attr.quote,
                    style: { color: attr.quoteColor, margin: 0, padding: 0, border: 'none' },
                    onChange: function (v) { setAttr({ quote: v }); }
                }),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' } },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ speakerAvatarUrl: m.url, speakerAvatarId: m.id }); },
                            allowedTypes: ['image'], value: attr.speakerAvatarId,
                            render: function (ref) {
                                return el('div', { onClick: ref.open, style: { cursor: 'pointer' } },
                                    attr.speakerAvatarUrl
                                        ? el('img', { src: attr.speakerAvatarUrl, style: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + attr.borderColor } })
                                        : el('div', { style: { width: '44px', height: '44px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } }, '👤')
                                );
                            }
                        })
                    ),
                    el('div', {},
                        el(RichText, {
                            tagName: 'p', className: 'bkbg-mqu-speaker-name', value: attr.speakerName,
                            style: { margin: 0, color: attr.quoteColor },
                            onChange: function (v) { setAttr({ speakerName: v }); }
                        }),
                        el(RichText, {
                            tagName: 'p', className: 'bkbg-mqu-speaker-title', value: attr.speakerTitle,
                            style: { margin: 0, color: attr.speakerColor },
                            onChange: function (v) { setAttr({ speakerTitle: v }); }
                        })
                    )
                )
            );

            var innerFlex = {
                display: 'flex',
                flexDirection: isTop ? 'column' : (isRight ? 'row-reverse' : 'row'),
                gap: '32px', alignItems: 'center'
            };
            if (isOnly) innerFlex = { display: 'block' };

            var cardStyle = {};
            if (attr.style === 'card') { cardStyle = { background: attr.cardBg, borderRadius: attr.borderRadius + 'px', padding: '32px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }; }
            if (attr.style === 'bordered') { cardStyle = { border: '2px solid ' + attr.borderColor, borderRadius: attr.borderRadius + 'px', padding: '32px' }; }
            if (attr.style === 'minimal') { cardStyle = { borderLeft: '4px solid ' + attr.accentColor, paddingLeft: '24px' }; }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Media', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Media Panel', 'blockenberg'), checked: attr.showVideo, onChange: function (v) { setAttr({ showVideo: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showVideo && el(SelectControl, {
                        label: __('Media Type', 'blockenberg'), value: attr.mediaType,
                        options: [{ label: '▶ Video', value: 'video' }, { label: '🎙️ Podcast/Audio', value: 'audio' }, { label: '🖼️ Image', value: 'image' }],
                        onChange: function (v) { setAttr({ mediaType: v }); }, __nextHasNoMarginBottom: true
                    }),
                    attr.showVideo && el(TextControl, { label: __('Video URL (for link)', 'blockenberg'), value: attr.videoUrl, onChange: function (v) { setAttr({ videoUrl: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showVideo && el(ToggleControl, { label: __('Show Media Label', 'blockenberg'), checked: attr.showMediaLabel, onChange: function (v) { setAttr({ showMediaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showVideo && attr.showMediaLabel && el(TextControl, { label: __('Media Label', 'blockenberg'), value: attr.mediaLabel, onChange: function (v) { setAttr({ mediaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showVideo && el(RangeControl, { label: __('Thumbnail Radius (px)', 'blockenberg'), value: attr.mediaRadius, min: 0, max: 32, onChange: function (v) { setAttr({ mediaRadius: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout,
                        options: [
                            { label: 'Media left, quote right', value: 'media-left' },
                            { label: 'Media right, quote left', value: 'media-right' },
                            { label: 'Media top, quote below', value: 'media-top' },
                            { label: 'Quote only (no media)', value: 'quote-only' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: attr.style,
                        options: [{ label: 'Card (shadow bg)', value: 'card' }, { label: 'Bordered', value: 'bordered' }, { label: 'Minimal (accent bar)', value: 'minimal' }, { label: 'Flat', value: 'flat' }],
                        onChange: function (v) { setAttr({ style: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, { label: __('Show Opening Quote Mark', 'blockenberg'), checked: attr.showQuoteIcon, onChange: function (v) { setAttr({ showQuoteIcon: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Card Border Radius (px)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 400, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Quote','blockenberg'), value: attr.quoteTypo || {}, onChange: function(v){ setAttr({ quoteTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Speaker Name','blockenberg'), value: attr.speakerNameTypo || {}, onChange: function(v){ setAttr({ speakerNameTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Speaker Title','blockenberg'), value: attr.speakerTitleTypo || {}, onChange: function(v){ setAttr({ speakerTitleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section BG', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Card BG', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f9fafb' }); } },
                        { label: __('Accent / Border', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Quote Text', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { setAttr({ quoteColor: v || '#111827' }); } },
                        { label: __('Speaker Meta', 'blockenberg'), value: attr.speakerColor, onChange: function (v) { setAttr({ speakerColor: v || '#374151' }); } },
                        { label: __('Play Button BG', 'blockenberg'), value: attr.playBtnBg, onChange: function (v) { setAttr({ playBtnBg: v || '#ffffff' }); } },
                        { label: __('Play Button Icon', 'blockenberg'), value: attr.playBtnColor, onChange: function (v) { setAttr({ playBtnColor: v || '#7c3aed' }); } }
                    ]
                })
            );

            return el('div', blockProps, controls,
                el('div', { style: { background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } },
                    el('div', { style: Object.assign({ maxWidth: attr.maxWidth + 'px', margin: '0 auto' }, cardStyle) },
                        el('div', { style: innerFlex }, mediaPanel, quotePanel)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({},
                v(a.quoteTypo,'--bkbg-mqu-qt-'),
                v(a.speakerNameTypo,'--bkbg-mqu-sn-'),
                v(a.speakerTitleTypo,'--bkbg-mqu-st-')
            );
            return el('div', (function(p){p.style=Object.assign(p.style||{},s);return p;})(wp.blockEditor.useBlockProps.save()),
                el('div', { className: 'bkbg-mqu-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
