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

    registerBlockType('blockenberg/media-coverage', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.eyebrowTypo, '--bkbg-mdc-ey-'));
                Object.assign(s, tv(a.headingTypo, '--bkbg-mdc-hd-'));
                Object.assign(s, tv(a.quoteTypo, '--bkbg-mdc-qt-'));
                return { style: s };
            })());

            function updateLogo(idx, key, val) {
                var next = a.logos.map(function (l, i) { return i === idx ? Object.assign({}, l, { [key]: val }) : l; });
                set({ logos: next });
            }

            /* --- Logo items in editor --- */
            var logosEl = el('div', {
                style: {
                    display: 'flex', flexWrap: 'wrap', gap: a.logoGap + 'px',
                    justifyContent: 'center', alignItems: 'center',
                    margin: '0 0 32px'
                }
            },
                a.logos.map(function (logo, idx) {
                    return el('div', { key: idx, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (media) { set({ logos: a.logos.map(function (l, i) { return i === idx ? Object.assign({}, l, { imageUrl: media.url, imageId: media.id }) : l; }) }); },
                                allowedTypes: ['image'],
                                value: logo.imageId,
                                render: function (ref) {
                                    return logo.imageUrl
                                        ? el('img', { src: logo.imageUrl, alt: logo.name, onClick: ref.open, style: { height: a.logoHeight + 'px', objectFit: 'contain', cursor: 'pointer', filter: a.grayscale ? 'grayscale(' + a.grayscaleAmount + '%)' : 'none', opacity: 0.7 } })
                                        : el('div', {
                                            onClick: ref.open,
                                            style: { height: a.logoHeight + 'px', padding: '0 16px', background: '#f3f4f6', border: '1px dashed #d1d5db', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }
                                        }, logo.name || 'Logo ' + (idx + 1))
                                }
                            })
                        ),
                        el(TextControl, { value: logo.name, placeholder: 'Publication name', onChange: function (v) { updateLogo(idx, 'name', v); }, style: { width: '100px', textAlign: 'center', fontSize: '11px' }, __nextHasNoMarginBottom: true }),
                        el(Button, { isDestructive: true, isSmall: true, onClick: function () { set({ logos: a.logos.filter(function (_, i) { return i !== idx; }) }); } }, '✕')
                    ) }),
                el(Button, { isSecondary: true, isSmall: true, onClick: function () { set({ logos: a.logos.concat([{ name: 'Publication', imageUrl: '', imageId: 0, url: '#' }]) }); } }, '+ Add logo')
            );

            /* --- Featured quote --- */
            var featuredQuoteEl = a.showFeaturedQuote && el('div', {
                style: { background: a.quoteBg, borderRadius: '12px', padding: '28px 32px', maxWidth: '720px', margin: '0 auto', borderLeft: '4px solid ' + a.quoteAccent }
            },
                el(RichText, { tagName: 'p', className: 'bkbg-mdc-quote-text', value: a.featuredQuote, style: { color: a.quoteColor, margin: '0 0 12px' }, onChange: function (v) { set({ featuredQuote: v }); } }),
                el('span', { className: 'bkbg-mdc-quote-attribution', style: { color: a.quoteAccent } },
                    el(RichText, { tagName: 'span', value: '— ' + a.featuredPublication, onChange: function (v) { set({ featuredPublication: v.replace('— ', '') }); } })
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Logos only', value: 'logos-only' }, { label: 'Logos + Quote', value: 'logos-quote' }, { label: 'Quote above logos', value: 'quote-logos' }], onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, onChange: function (v) { set({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: a.showHeading, onChange: function (v) { set({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Enable Grayscale', 'blockenberg'), checked: a.grayscale, onChange: function (v) { set({ grayscale: v }); }, __nextHasNoMarginBottom: true }),
                    a.grayscale && el(RangeControl, { label: __('Grayscale Amount (%)', 'blockenberg'), value: a.grayscaleAmount, min: 0, max: 100, onChange: function (v) { set({ grayscaleAmount: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Logo Height (px)', 'blockenberg'), value: a.logoHeight, min: 20, max: 80, onChange: function (v) { set({ logoHeight: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Logo Gap (px)', 'blockenberg'), value: a.logoGap, min: 16, max: 96, onChange: function (v) { set({ logoGap: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Featured Quote', 'blockenberg'), checked: a.showFeaturedQuote, onChange: function (v) { set({ showFeaturedQuote: v }); }, __nextHasNoMarginBottom: true }),
                    a.showFeaturedQuote && el(TextControl, { label: __('Featured Publication Name', 'blockenberg'), value: a.featuredPublication, onChange: function (v) { set({ featuredPublication: v }); }, __nextHasNoMarginBottom: true }),
                    a.showFeaturedQuote && el(TextControl, { label: __('Quote Link URL', 'blockenberg'), value: a.featuredLink, onChange: function (v) { set({ featuredLink: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Logo Links', 'blockenberg'), initialOpen: false },
                    a.logos.map(function (logo, idx) {
                        return el('div', { key: idx, style: { marginBottom: '8px' } },
                            el(TextControl, { label: (logo.name || 'Logo ' + (idx + 1)) + ' URL', value: logo.url || '', onChange: function (v) { updateLogo(idx, 'url', v); }, __nextHasNoMarginBottom: true })
                        ) })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#9ca3af' }); } },
                        { label: __('Quote BG', 'blockenberg'), value: a.quoteBg, onChange: function (v) { set({ quoteBg: v || '#f9fafb' }); } },
                        { label: __('Quote Text', 'blockenberg'), value: a.quoteColor, onChange: function (v) { set({ quoteColor: v || '#374151' }); } },
                        { label: __('Quote Accent', 'blockenberg'), value: a.quoteAccent, onChange: function (v) { set({ quoteAccent: v || '#7c3aed' }); } },
                        { label: __('Divider', 'blockenberg'), value: a.dividerColor, onChange: function (v) { set({ dividerColor: v || '#e5e7eb' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: 'Eyebrow', value: a.eyebrowTypo || {}, onChange: function (v) { set({ eyebrowTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Heading', value: a.headingTypo || {}, onChange: function (v) { set({ headingTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Quote', value: a.quoteTypo || {}, onChange: function (v) { set({ quoteTypo: v }); } })
                )
            );

            var showQuote = a.showFeaturedQuote && a.layout !== 'logos-only';
            var quoteAbove = a.layout === 'quote-logos';

            return el('div', blockProps,
                controls,
                el('div', { style: { background: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' } },
                    el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' } },
                        a.showEyebrow && el('p', { className: 'bkbg-mdc-eyebrow', style: { textAlign: 'center', color: a.eyebrowColor, marginBottom: a.showHeading ? '8px' : '28px' } },
                            el(RichText, { tagName: 'span', value: a.eyebrow, onChange: function (v) { set({ eyebrow: v }); } })
                        ),
                        a.showHeading && el(RichText, { tagName: 'p', className: 'bkbg-mdc-heading', value: a.heading, style: { textAlign: 'center', color: a.headingColor || '#374151', marginBottom: '28px' }, onChange: function (v) { set({ heading: v }); } }),
                        quoteAbove && showQuote && featuredQuoteEl,
                        quoteAbove && showQuote && el('div', { style: { height: '32px' } }),
                        logosEl,
                        !quoteAbove && showQuote && featuredQuoteEl
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.eyebrowTypo, '--bkbg-mdc-ey-'));
                Object.assign(s, tv(a.headingTypo, '--bkbg-mdc-hd-'));
                Object.assign(s, tv(a.quoteTypo, '--bkbg-mdc-qt-'));
                return { style: s };
            })()),
                el('div', { className: 'bkbg-mdc-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
