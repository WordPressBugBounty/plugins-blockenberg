( function () {
    var el                 = wp.element.createElement;
    var registerBlockType  = wp.blocks.registerBlockType;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload        = wp.blockEditor.MediaUpload;
    var RichText           = wp.blockEditor.RichText;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/holographic-card', {
        edit: function (props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var _tv = getTypoCssVars();
            var bpStyle = { textAlign: 'center' };
            Object.assign(bpStyle, _tv(a.titleTypo || {}, '--bkbg-hgc-tt-'));
            Object.assign(bpStyle, _tv(a.subtitleTypo || {}, '--bkbg-hgc-st-'));
            if (a.titleSize && a.titleSize !== 22) bpStyle['--bkbg-hgc-tt-sz'] = a.titleSize + 'px';
            if (a.titleFontWeight && a.titleFontWeight !== '700') bpStyle['--bkbg-hgc-tt-fw'] = a.titleFontWeight;
            if (a.titleLineHeight && a.titleLineHeight !== 1.3) bpStyle['--bkbg-hgc-tt-lh'] = String(a.titleLineHeight);
            if (a.subtitleSize && a.subtitleSize !== 14) bpStyle['--bkbg-hgc-st-sz'] = a.subtitleSize + 'px';
            if (a.subtitleFontWeight && a.subtitleFontWeight !== '400') bpStyle['--bkbg-hgc-st-fw'] = a.subtitleFontWeight;
            if (a.subtitleLineHeight && a.subtitleLineHeight !== 1.5) bpStyle['--bkbg-hgc-st-lh'] = String(a.subtitleLineHeight);
            var blockProps = useBlockProps({ style: bpStyle });

            var cardStyle = {
                width: (a.cardWidth || 320) + 'px',
                maxWidth: '100%',
                height: (a.cardHeight || 440) + 'px',
                borderRadius: (a.cardRadius || 20) + 'px',
                background: a.cardBg || '#1a1035',
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '28px',
                boxSizing: 'border-box',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            };

            // Iridescent shimmer layer for editor preview
            var shineStyle = {
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, hsla(' + (a.foilHue || 0) + ',80%,60%,0.35) 0%, hsla(' + ((a.foilHue || 0) + 60) + ',90%,70%,0.3) 25%, hsla(' + ((a.foilHue || 0) + 180) + ',80%,65%,0.35) 50%, hsla(' + ((a.foilHue || 0) + 270) + ',90%,60%,0.3) 75%, hsla(' + ((a.foilHue || 0) + 330) + ',80%,65%,0.35) 100%)',
                mixBlendMode: 'screen',
                opacity: (a.shineOpacity || 60) / 100,
                pointerEvents: 'none',
                borderRadius: 'inherit'
            };

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Card Content', initialOpen: true },
                        el(TextControl, { label: 'Badge text', value: a.badge || '',
                            onChange: function (v) { set({ badge: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show badge', checked: a.showBadge !== false,
                            onChange: function (v) { set({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Link URL', value: a.linkUrl || '',
                            onChange: function (v) { set({ linkUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: 'Link text', value: a.linkText || '',
                            onChange: function (v) { set({ linkText: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show link button', checked: a.showLink !== false,
                            onChange: function (v) { set({ showLink: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: 8 } },
                            el('p', { style: { margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', color: '#757575', fontWeight: 600 } }, 'Cover image'),
                            el(MediaUpload, {
                                onSelect: function (m) { set({ imageUrl: m.url, imageAlt: m.alt || '' }); },
                                allowedTypes: ['image'],
                                value: a.imageUrl,
                                render: function (mProps) {
                                    return el(Button, { onClick: mProps.open, isSecondary: true, isSmall: true },
                                        a.imageUrl ? 'Replace image' : 'Upload image');
                                }
                            }),
                            a.imageUrl && el(Button, { isDestructive: true, isSmall: true,
                                onClick: function () { set({ imageUrl: '', imageAlt: '' }); },
                                style: { marginLeft: 6 } }, 'Remove')
                        )
                    ),
                    el(PanelBody, { title: 'Card Size', initialOpen: false },
                        el(RangeControl, { label: 'Card width (px)', value: a.cardWidth || 320,
                            onChange: function (v) { set({ cardWidth: v }); }, min: 200, max: 600, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Card height (px)', value: a.cardHeight || 440,
                            onChange: function (v) { set({ cardHeight: v }); }, min: 200, max: 700, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Border radius', value: a.cardRadius || 20,
                            onChange: function (v) { set({ cardRadius: v }); }, min: 0, max: 60, __nextHasNoMarginBottom: true }),
                        ),
                    el(PanelBody, { title: 'Holographic Effect', initialOpen: false },
                        el(RangeControl, { label: 'Tilt strength (°)', value: a.tiltStrength || 15,
                            onChange: function (v) { set({ tiltStrength: v }); }, min: 0, max: 40, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Shine opacity (%)', value: a.shineOpacity || 60,
                            onChange: function (v) { set({ shineOpacity: v }); }, min: 0, max: 100, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Glare opacity (%)', value: a.glareOpacity || 40,
                            onChange: function (v) { set({ glareOpacity: v }); }, min: 0, max: 100, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Foil hue offset (°)', value: a.foilHue || 0,
                            onChange: function (v) { set({ foilHue: v }); }, min: 0, max: 360, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Foil saturation (%)', value: a.foilSaturation || 80,
                            onChange: function (v) { set({ foilSaturation: v }); }, min: 20, max: 100, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: 'Title Typography', value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                        el(getTypographyControl(), { label: 'Subtitle Typography', value: a.subtitleTypo || {}, onChange: function (v) { set({ subtitleTypo: v }); } }),
                        el(RangeControl, { label: 'Badge font size', value: a.badgeFontSize || 12,
                                                                    onChange: function (v) { set({ badgeFontSize: v }); }, min: 9, max: 20, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Link text size', value: a.linkTextSize || 14,
                                                                    onChange: function (v) { set({ linkTextSize: v }); }, min: 11, max: 22, __nextHasNoMarginBottom: true })
                    ),
el(PanelColorSettings, {
                        title: 'Colors', initialOpen: false,
                        colorSettings: [
                            { label: 'Card background', value: a.cardBg,       onChange: function (v) { set({ cardBg:       v || '#1a1035' }); } },
                            { label: 'Title color',     value: a.titleColor,   onChange: function (v) { set({ titleColor:   v || '#ffffff' }); } },
                            { label: 'Subtitle color',  value: a.subtitleColor,onChange: function (v) { set({ subtitleColor:v || 'rgba(255,255,255,0.7)' }); } },
                            { label: 'Badge background',value: a.badgeBg,      onChange: function (v) { set({ badgeBg:      v || 'rgba(255,255,255,0.15)' }); } },
                            { label: 'Badge text',      value: a.badgeColor,   onChange: function (v) { set({ badgeColor:  v || '#ffffff' }); } },
                            { label: 'Link background', value: a.linkBg,       onChange: function (v) { set({ linkBg:       v || 'rgba(255,255,255,0.15)' }); } },
                            { label: 'Link text',       value: a.linkColor,    onChange: function (v) { set({ linkColor:   v || '#ffffff' }); } }
                        ],
                        disableCustomGradients: true
                    })
                ),

                // ── Editor preview ──────────────────────────────────
                el('div', { style: cardStyle },
                    // Background image
                    a.imageUrl && el('img', {
                        src: a.imageUrl, alt: a.imageAlt || '',
                        style: { position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover', borderRadius: 'inherit', display: 'block' }
                    }),
                    // Dark overlay to make text readable
                    el('div', { style: {
                        position: 'absolute', inset: 0, borderRadius: 'inherit',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                        pointerEvents: 'none'
                    } }),
                    // Iridescent shine layer
                    el('div', { style: shineStyle }),
                    // Grid texture
                    el('div', { style: {
                        position: 'absolute', inset: 0, borderRadius: 'inherit',
                        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,0.03) 30px,rgba(255,255,255,0.03) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,0.03) 30px,rgba(255,255,255,0.03) 31px)',
                        pointerEvents: 'none'
                    } }),
                    // Content
                    el('div', { style: { position: 'relative', zIndex: 2 } },
                        a.showBadge !== false && a.badge && el('div', {
                            style: {
                                display: 'inline-block', padding: '4px 12px',
                                borderRadius: 20, marginBottom: 12,
                                background: a.badgeBg || 'rgba(255,255,255,0.15)',
                                color: a.badgeColor || '#ffffff',
                                fontSize: (a.badgeFontSize || 12) + 'px',
                                fontWeight: 600, backdropFilter: 'blur(6px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }
                        }, a.badge),
                        el(RichText, {
                            tagName: 'h3', value: a.title,
                            onChange: function (v) { set({ title: v }); },
                            placeholder: 'Card title…',
                            className: 'bkbg-hgc-title',
                            style: { color: a.titleColor || '#ffffff', margin: '0 0 8px' }
                        }),
                        el(RichText, {
                            tagName: 'p', value: a.subtitle,
                            onChange: function (v) { set({ subtitle: v }); },
                            placeholder: 'Subtitle…',
                            className: 'bkbg-hgc-subtitle',
                            style: { color: a.subtitleColor || 'rgba(255,255,255,0.7)', margin: '0 0 16px' }
                        }),
                        a.showLink !== false && el('div', {
                            style: {
                                display: 'inline-block', padding: '10px 22px',
                                borderRadius: 10, background: a.linkBg || 'rgba(255,255,255,0.15)',
                                color: a.linkColor || '#ffffff',
                                fontSize: a.linkTextSize || 14, fontWeight: 600,
                                backdropFilter: 'blur(6px)',
                                border: '1px solid rgba(255,255,255,0.25)'
                            }
                        }, a.linkText || 'Explore Now')
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tv = getTypoCssVars();
            var blockProps = useBlockProps.save();
            var opts = {
                tiltStrength:  a.tiltStrength  || 15,
                shineOpacity:  a.shineOpacity  || 60,
                glareOpacity:  a.glareOpacity  || 40,
                foilHue:       a.foilHue       || 0,
                foilSaturation: a.foilSaturation || 80,
                cardRadius:    a.cardRadius    || 20,
                linkUrl:       a.linkUrl       || '',
                cardBg:        a.cardBg        || '#1a1035',
                titleColor:    a.titleColor    || '#ffffff',
                subtitleColor: a.subtitleColor || 'rgba(255,255,255,0.7)',
                badgeBg:       a.badgeBg       || 'rgba(255,255,255,0.15)',
                badgeColor:    a.badgeColor    || '#ffffff',
                linkBg:        a.linkBg        || 'rgba(255,255,255,0.15)',
                linkColor:     a.linkColor     || '#ffffff',
                titleTypo:     a.titleTypo     || {},
                subtitleTypo:  a.subtitleTypo  || {}
            };
            var cardStyle = {
                width: (a.cardWidth || 320) + 'px',
                height: (a.cardHeight || 440) + 'px'
            };
            Object.assign(cardStyle, _tv(a.titleTypo || {}, '--bkbg-hgc-tt-'));
            Object.assign(cardStyle, _tv(a.subtitleTypo || {}, '--bkbg-hgc-st-'));
            if (a.titleSize && a.titleSize !== 22) cardStyle['--bkbg-hgc-tt-sz'] = a.titleSize + 'px';
            if (a.titleFontWeight && a.titleFontWeight !== '700') cardStyle['--bkbg-hgc-tt-fw'] = a.titleFontWeight;
            if (a.titleLineHeight && a.titleLineHeight !== 1.3) cardStyle['--bkbg-hgc-tt-lh'] = String(a.titleLineHeight);
            if (a.subtitleSize && a.subtitleSize !== 14) cardStyle['--bkbg-hgc-st-sz'] = a.subtitleSize + 'px';
            if (a.subtitleFontWeight && a.subtitleFontWeight !== '400') cardStyle['--bkbg-hgc-st-fw'] = a.subtitleFontWeight;
            if (a.subtitleLineHeight && a.subtitleLineHeight !== 1.5) cardStyle['--bkbg-hgc-st-lh'] = String(a.subtitleLineHeight);
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-hgc-app',
                    'data-opts': JSON.stringify(opts),
                    style: cardStyle
                },
                    a.imageUrl && el('img', {
                        className: 'bkbg-hgc-img',
                        src: a.imageUrl, alt: a.imageAlt || '',
                        loading: 'lazy'
                    }),
                    el('div', { className: 'bkbg-hgc-shine' }),
                    el('div', { className: 'bkbg-hgc-glare' }),
                    el('div', { className: 'bkbg-hgc-overlay' }),
                    el('div', { className: 'bkbg-hgc-grid' }),
                    el('div', { className: 'bkbg-hgc-content' },
                        a.showBadge !== false && a.badge && el('div', { className: 'bkbg-hgc-badge' }, a.badge),
                        el(RichText.Content, { tagName: 'h3', value: a.title, className: 'bkbg-hgc-title' }),
                        el(RichText.Content, { tagName: 'p', value: a.subtitle, className: 'bkbg-hgc-subtitle' }),
                        a.showLink !== false && el('a', {
                            className: 'bkbg-hgc-link',
                            href: a.linkUrl || '#',
                            rel: 'noopener'
                        }, a.linkText || 'Explore Now')
                    )
                )
            );
        }
    });
}() );
