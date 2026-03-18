( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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

    var _epTC, _epTV;
    function _tc() { return _epTC || (_epTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_epTV || (_epTV = window.bkbgTypoCssVars)) ? _epTV(t, p) : {}; }

    var PROVIDER_OPTIONS = [
        { label: 'Custom / Other', value: 'custom' },
        { label: 'Figma',          value: 'figma' },
        { label: 'Loom',           value: 'loom' },
        { label: 'YouTube',        value: 'youtube' },
        { label: 'Typeform',       value: 'typeform' },
        { label: 'Calendly',       value: 'calendly' },
        { label: 'Miro',           value: 'miro' },
        { label: 'Notion',         value: 'notion' },
        { label: 'Airtable',       value: 'airtable' },
    ];

    var ASPECT_OPTIONS = [
        { label: '16:9 (widescreen)',  value: '16-9' },
        { label: '4:3 (classic)',      value: '4-3' },
        { label: '1:1 (square)',       value: '1-1' },
        { label: '3:2',                value: '3-2' },
        { label: '21:9 (ultra-wide)',  value: '21-9' },
        { label: 'Custom height',      value: 'custom' },
    ];

    var CTA_STYLE_OPTIONS = [
        { label: 'Filled',   value: 'filled' },
        { label: 'Outline',  value: 'outline' },
        { label: 'Ghost',    value: 'ghost' },
    ];

    var PROVIDER_ICONS = {
        figma:    '🎨',
        loom:     '🎥',
        youtube:  '▶',
        typeform: '📋',
        calendly: '📅',
        miro:     '🗂',
        notion:   '📄',
        airtable: '🗃',
        custom:   '🔗',
    };

    var ASPECT_RATIOS = {
        '16-9': 56.25,
        '4-3':  75,
        '1-1':  100,
        '3-2':  66.67,
        '21-9': 42.86,
    };

    function hexToRgba(hex, opacity) {
        var r = parseInt((hex || '#000000').substr(1, 2), 16);
        var g = parseInt((hex || '#000000').substr(3, 2), 16);
        var b = parseInt((hex || '#000000').substr(5, 2), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity / 100) + ')';
    }

    registerBlockType('blockenberg/embed-preview', {
        title: __('Embed Preview', 'blockenberg'),
        icon: 'embed-generic',
        category: 'bkbg-media',
        description: __('Click-to-load embed with custom thumbnail and CTA overlay.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({}, _tv(a.typoTitle || {}, '--bkbg-ep-ttl-'), _tv(a.typoDesc || {}, '--bkbg-ep-dsc-'), _tv(a.typoCta || {}, '--bkbg-ep-cta-')) });

            var paddingPct = a.aspectRatio !== 'custom' ? ASPECT_RATIOS[a.aspectRatio] || 56.25 : null;

            var containerStyle = {
                maxWidth: a.maxWidth + 'px',
                margin: '0 auto',
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                border: '1px solid ' + a.borderColor,
                position: 'relative',
            };

            if (!a.thumbnailUrl) {
                containerStyle.background = '#1e293b';
            }

            var heightStyle = paddingPct
                ? { paddingBottom: paddingPct + '%', height: 0, position: 'relative' }
                : { height: a.customHeight + 'px', position: 'relative' };

            var overlayBgColor = hexToRgba(a.overlayBg, a.overlayOpacity);

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Content
                    el(PanelBody, { title: 'Embed Content', initialOpen: true },
                        el(SelectControl, { label: 'Provider', value: a.embedProvider, options: PROVIDER_OPTIONS, onChange: function (v) { set({ embedProvider: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(TextControl, { label: 'Embed URL', value: a.embedUrl, placeholder: 'https://...', onChange: function (v) { set({ embedUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(Fragment, null,
                            el('div', { style: { height: 6 } }),
                            el(TextControl, { label: 'Title', value: a.embedTitle, onChange: function (v) { set({ embedTitle: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show description', checked: a.showDescription, onChange: function (v) { set({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        a.showDescription && el(Fragment, null,
                            el('div', { style: { height: 6 } }),
                            el(TextControl, { label: 'Description', value: a.description, onChange: function (v) { set({ description: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'CTA Button Label', value: a.ctaLabel, onChange: function (v) { set({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'CTA Style', value: a.ctaStyle, options: CTA_STYLE_OPTIONS, onChange: function (v) { set({ ctaStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show provider badge', checked: a.showBrand, onChange: function (v) { set({ showBrand: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show loading bar', checked: a.showLoadingBar, onChange: function (v) { set({ showLoadingBar: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show privacy note', checked: a.showPrivacyNote, onChange: function (v) { set({ showPrivacyNote: v }); }, __nextHasNoMarginBottom: true }),
                        a.showPrivacyNote && el(Fragment, null,
                            el('div', { style: { height: 6 } }),
                            el(TextControl, { label: 'Privacy note text', value: a.privacyNote, onChange: function (v) { set({ privacyNote: v }); }, __nextHasNoMarginBottom: true })
                        )
                    ),

                    // Thumbnail
                    el(PanelBody, { title: 'Thumbnail', initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { set({ thumbnailUrl: media.url, thumbnailId: media.id }); },
                                allowedTypes: ['image'],
                                value: a.thumbnailId,
                                render: function (ref) {
                                    return el(Button, {
                                        onClick: ref.open,
                                        variant: a.thumbnailUrl ? 'secondary' : 'primary',
                                        __nextHasNoMarginBottom: true,
                                    }, a.thumbnailUrl ? 'Change Thumbnail' : 'Set Thumbnail');
                                }
                            })
                        ),
                        a.thumbnailUrl && el(Fragment, null,
                            el('img', { src: a.thumbnailUrl, alt: '', style: { width: '100%', borderRadius: 6, marginTop: 8 } }),
                            el(Button, { onClick: function () { set({ thumbnailUrl: '', thumbnailId: 0 }); }, isDestructive: true, variant: 'link', __nextHasNoMarginBottom: true, style: { marginTop: 4 } }, 'Remove Thumbnail')
                        )
                    ),

                    // Layout
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(SelectControl, { label: 'Aspect ratio', value: a.aspectRatio, options: ASPECT_OPTIONS, onChange: function (v) { set({ aspectRatio: v }); }, __nextHasNoMarginBottom: true }),
                        a.aspectRatio === 'custom' && el(Fragment, null,
                            el('div', { style: { height: 10 } }),
                            el(RangeControl, { label: 'Custom height (px)', value: a.customHeight, min: 200, max: 1200, onChange: function (v) { set({ customHeight: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 400, max: 1400, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Border radius (px)', value: a.borderRadius, min: 0, max: 32, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Overlay opacity (%)', value: a.overlayOpacity, min: 0, max: 95, onChange: function (v) { set({ overlayOpacity: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(TextControl, { label: 'iframe sandbox (advanced)', value: a.iframeSandbox, onChange: function (v) { set({ iframeSandbox: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); }, defaultSize: a.titleSize || 18 }),
                        _tc() && el(_tc(), { label: __('Description'), typo: a.typoDesc || {}, onChange: function (v) { set({ typoDesc: v }); }, defaultSize: a.descSize || 14 }),
                        _tc() && el(_tc(), { label: __('CTA Button'), typo: a.typoCta || {}, onChange: function (v) { set({ typoCta: v }); }, defaultSize: a.ctaLabelSize || 14 })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Overlay Color',    value: a.overlayBg,    onChange: function (v) { set({ overlayBg: v || '#0f172a' }); } },
                            { label: 'CTA Background',   value: a.ctaBg,        onChange: function (v) { set({ ctaBg: v || '#6366f1' }); } },
                            { label: 'CTA Text',         value: a.ctaColor,     onChange: function (v) { set({ ctaColor: v || '#ffffff' }); } },
                            { label: 'Title Color',      value: a.titleColor,   onChange: function (v) { set({ titleColor: v || '#f8fafc' }); } },
                            { label: 'Description Color',value: a.descColor,    onChange: function (v) { set({ descColor: v || '#cbd5e1' }); } },
                            { label: 'Privacy Note Color',value: a.privacyColor,onChange: function (v) { set({ privacyColor: v || '#94a3b8' }); } },
                            { label: 'Border Color',     value: a.borderColor,  onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('div', { style: containerStyle },
                        el('div', { style: Object.assign({ position: 'relative' }, heightStyle) },
                            // Thumbnail
                            a.thumbnailUrl && el('img', {
                                src: a.thumbnailUrl,
                                alt: '',
                                style: {
                                    position: 'absolute', inset: 0,
                                    width: '100%', height: '100%',
                                    objectFit: 'cover',
                                }
                            }),
                            // Dark overlay
                            el('div', {
                                style: {
                                    position: 'absolute', inset: 0,
                                    background: overlayBgColor,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 14,
                                    padding: 24,
                                    textAlign: 'center',
                                }
                            },
                                // Provider badge
                                a.showBrand && el('div', {
                                    style: {
                                        position: 'absolute', top: 14, left: 14,
                                        background: 'rgba(255,255,255,0.12)',
                                        borderRadius: 8,
                                        padding: '4px 10px',
                                        fontSize: 13,
                                        color: '#fff',
                                    }
                                }, (PROVIDER_ICONS[a.embedProvider] || '🔗') + ' ' + (a.embedProvider.charAt(0).toUpperCase() + a.embedProvider.slice(1))),
                                // Title
                                a.showTitle && el('p', {
                                    className: 'bkbg-ep-title',
                                    style: {
                                        margin: 0,
                                        color: a.titleColor,
                                    }
                                }, a.embedTitle),
                                // Description
                                a.showDescription && a.description && el('p', {
                                    className: 'bkbg-ep-description',
                                    style: { margin: 0, color: a.descColor }
                                }, a.description),
                                // CTA
                                el('button', {
                                    className: 'bkbg-ep-cta',
                                    style: {
                                        background: a.ctaStyle === 'filled' ? a.ctaBg : 'transparent',
                                        color: a.ctaStyle === 'filled' ? a.ctaColor : a.ctaBg,
                                        border: a.ctaStyle === 'ghost' ? 'none' : '2px solid ' + a.ctaBg,
                                        cursor: 'pointer',
                                        pointerEvents: 'none',
                                    }
                                }, a.ctaLabel),
                                // Privacy note
                                a.showPrivacyNote && a.privacyNote && el('p', {
                                    style: {
                                        margin: 0, fontSize: 11, color: a.privacyColor,
                                        position: 'absolute', bottom: 10,
                                    }
                                }, '🔒 ' + a.privacyNote)
                            )
                        )
                    ),
                    !a.embedUrl && el('p', {
                        style: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8 }
                    }, '⚙ Add an embed URL in the inspector panel.')
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ep-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
