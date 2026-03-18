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
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/social-proof-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var logos = attr.logos || [];
            var stats = attr.stats || [];

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {
                    background: attr.bgColor || '#f9fafb',
                    paddingTop: attr.paddingTop + 'px',
                    paddingBottom: attr.paddingBottom + 'px'
                };
                if (_tv) {
                    Object.assign(s, _tv(attr.eyebrowTypo, '--bksps-ey-'));
                    Object.assign(s, _tv(attr.headingTypo, '--bksps-hd-'));
                    Object.assign(s, _tv(attr.statValueTypo, '--bksps-sv-'));
                    Object.assign(s, _tv(attr.statLabelTypo, '--bksps-sl-'));
                    Object.assign(s, _tv(attr.quoteTypo, '--bksps-qt-'));
                }
                return { className: 'bkbg-sps-editor', style: s };
            })());

            var validLogos = logos.filter(function (l) { return l.imageUrl; });

            return el('div', blockProps, controls,
                el('div', { className: 'bkbg-sps-wrap' },
                    el('div', { className: 'bkbg-sps-inner', style: { maxWidth: attr.maxWidth + 'px' } },
                        attr.showEyebrow && el('p', {
                            className: 'bkbg-sps-eyebrow',
                            style: { color: attr.eyebrowColor, margin: '0 0 12px' }
                        }, attr.eyebrow),
                        attr.showHeading && el(RichText, {
                            tagName: 'h2', value: attr.heading,
                            className: 'bkbg-sps-heading',
                            style: { color: attr.headingColor, margin: '0 0 12px' },
                            onChange: function (v) { setAttr({ heading: v }); }
                        }),
                        attr.showSubtext && el(RichText, {
                            tagName: 'p', value: attr.subtext,
                            className: 'bkbg-sps-subtext',
                            style: { color: attr.subtextColor, margin: '0 0 32px' },
                            onChange: function (v) { setAttr({ subtext: v }); }
                        }),
                el(PanelBody, { title: __('Section Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: attr.showEyebrow, onChange: function (v) { setAttr({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Eyebrow Text', 'blockenberg'), value: attr.eyebrow, onChange: function (v) { setAttr({ eyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: attr.showHeading, onChange: function (v) { setAttr({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: attr.showSubtext, onChange: function (v) { setAttr({ showSubtext: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Client Logos', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Logos', 'blockenberg'), checked: attr.showLogos, onChange: function (v) { setAttr({ showLogos: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, {
                        label: __('Logo Filter', 'blockenberg'), value: attr.logoFilter,
                        options: [
                            { label: 'None (full color)', value: 'none' },
                            { label: 'Grayscale always', value: 'grayscale' },
                            { label: 'Grayscale → color on hover', value: 'grayscale-hover' }
                        ],
                        onChange: function (v) { setAttr({ logoFilter: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Logo Height (px)', 'blockenberg'), value: attr.logoHeight, min: 20, max: 80, onChange: function (v) { setAttr({ logoHeight: v }); }, __nextHasNoMarginBottom: true }),
                    logos.map(function (logo, i) {
                        return el('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                            logo.imageUrl ? el('img', { src: logo.imageUrl, style: { height: '28px', objectFit: 'contain' } }) : null,
                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ logos: logos.filter(function (_, idx) { return idx !== i; }) }); } }, '✕')
                        );
                    }),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ logos: logos.concat({ imageUrl: m.url, imageId: m.id, imageAlt: m.alt || '' }) }); },
                            allowedTypes: ['image'], multiple: false,
                            render: function (ref) { return el(Button, { isSecondary: true, isSmall: true, onClick: ref.open }, '+ Add Logo'); }
                        })
                    )
                ),
                el(PanelBody, { title: __('Stats', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Stats', 'blockenberg'), checked: attr.showStats, onChange: function (v) { setAttr({ showStats: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Stat Dividers', 'blockenberg'), checked: attr.statDivider, onChange: function (v) { setAttr({ statDivider: v }); }, __nextHasNoMarginBottom: true }),
                    stats.map(function (stat, i) {
                        return el('div', { key: i, style: { borderLeft: '3px solid #7c3aed', paddingLeft: '10px', marginBottom: '12px' } },
                            el(TextControl, { label: __('Value', 'blockenberg'), value: stat.value, onChange: function (v) { updateStat(i, 'value', v); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Label', 'blockenberg'), value: stat.label, onChange: function (v) { updateStat(i, 'label', v); }, __nextHasNoMarginBottom: true }),
                            el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ stats: stats.filter(function (_, idx) { return idx !== i; }) }); } }, '✕ Remove')
                        );
                    }),
                    el(Button, { isSecondary: true, isSmall: true, onClick: function () { setAttr({ stats: stats.concat({ value: '100+', label: 'New stat' }) }); }, style: { marginTop: '8px' } }, '+ Add Stat')
                ),
                el(PanelBody, { title: __('Featured Quote', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Quote', 'blockenberg'), checked: attr.showQuote, onChange: function (v) { setAttr({ showQuote: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Author Name', 'blockenberg'), value: attr.quoteAuthor, onChange: function (v) { setAttr({ quoteAuthor: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Author Role & Company', 'blockenberg'), value: attr.quoteRole, onChange: function (v) { setAttr({ quoteRole: v }); }, __nextHasNoMarginBottom: true }),
                    el('p', { style: { margin: '8px 0 4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: '#9ca3af' } }, __('Author Photo', 'blockenberg')),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ quoteAvatarUrl: m.url, quoteAvatarId: m.id }); },
                            allowedTypes: ['image'], value: attr.quoteAvatarId,
                            render: function (ref) {
                                return attr.quoteAvatarUrl
                                    ? el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                        el('img', { src: attr.quoteAvatarUrl, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } }),
                                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ quoteAvatarUrl: '', quoteAvatarId: 0 }); } }, '✕')
                                      )
                                    : el(Button, { isSecondary: true, isSmall: true, onClick: ref.open }, __('Upload Photo', 'blockenberg'));
                            }
                        })
                    ),
                    ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el( getTypoControl(), { label: __('Eyebrow Typography'), value: attr.eyebrowTypo || {}, onChange: function(v){ setAttr({ eyebrowTypo: v }); } }),
                    getTypoControl() && el( getTypoControl(), { label: __('Heading Typography'), value: attr.headingTypo || {}, onChange: function(v){ setAttr({ headingTypo: v }); } }),
                    getTypoControl() && el( getTypoControl(), { label: __('Stat Value Typography'), value: attr.statValueTypo || {}, onChange: function(v){ setAttr({ statValueTypo: v }); } }),
                    getTypoControl() && el( getTypoControl(), { label: __('Stat Label Typography'), value: attr.statLabelTypo || {}, onChange: function(v){ setAttr({ statLabelTypo: v }); } }),
                    getTypoControl() && el( getTypoControl(), { label: __('Quote Typography'), value: attr.quoteTypo || {}, onChange: function(v){ setAttr({ quoteTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#f9fafb' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#7c3aed' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Stat Value', 'blockenberg'), value: attr.statValueColor, onChange: function (v) { setAttr({ statValueColor: v || '#111827' }); } },
                        { label: __('Stat Label', 'blockenberg'), value: attr.statLabelColor, onChange: function (v) { setAttr({ statLabelColor: v || '#6b7280' }); } },
                        { label: __('Quote Text', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { setAttr({ quoteColor: v || '#1f2937' }); } },
                        { label: __('Quote Card BG', 'blockenberg'), value: attr.quoteBg, onChange: function (v) { setAttr({ quoteBg: v || '#ffffff' }); } },
                        { label: __('Divider', 'blockenberg'), value: attr.dividerColor, onChange: function (v) { setAttr({ dividerColor: v || '#e5e7eb' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout,
                        options: [
                            { label: 'Standard (logos + stats + quote)', value: 'standard' },
                            { label: 'Logos only', value: 'logos' },
                            { label: 'Stats only', value: 'stats' },
                            { label: 'Quote + stats', value: 'quote-stats' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 600, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                )
            );

            var wrapStyle = {
                background: attr.bgColor || '#f9fafb',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };

            var validLogos = logos.filter(function (l) { return l.imageUrl; });

            return el('div', blockProps, controls,
                el('div', { style: wrapStyle },
                    el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto', textAlign: 'center' } },
                        attr.showEyebrow && el('p', {
                            style: { fontSize: attr.eyebrowSize + 'px', fontWeight: '600', color: attr.eyebrowColor, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }
                        }, attr.eyebrow),
                        attr.showHeading && el(RichText, {
                            tagName: 'h2', value: attr.heading,
                            style: { fontSize: attr.headingSize + 'px', color: attr.headingColor, margin: '0 0 12px', fontWeight: attr.headingFontWeight||700 },
                            onChange: function (v) { setAttr({ heading: v }); }
                        }),
                        attr.showSubtext && el(RichText, {
                            tagName: 'p', value: attr.subtext,
                            style: { fontSize: '18px', color: attr.subtextColor, margin: '0 0 32px', lineHeight: '1.6' },
                            onChange: function (v) { setAttr({ subtext: v }); }
                        }),
                        // Logos strip
                        attr.showLogos && validLogos.length > 0 && el('div', {
                            style: { display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }
                        }, validLogos.map(function (l, i) {
                            return el('img', { key: i, src: l.imageUrl, alt: l.imageAlt || '', style: { height: attr.logoHeight + 'px', objectFit: 'contain', opacity: 0.65, filter: attr.logoFilter === 'grayscale' || attr.logoFilter === 'grayscale-hover' ? 'grayscale(1)' : 'none' } });
                        })),
                        attr.showLogos && validLogos.length === 0 && el('div', {
                            style: { color: '#9ca3af', padding: '16px', border: '1px dashed #d1d5db', borderRadius: '8px', marginBottom: '32px', fontSize: '14px' }
                        }, 'Add logos in the sidebar →'),
                        // Stats
                        attr.showStats && stats.length > 0 && el('div', {
                            style: { display: 'flex', gap: '0', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px', borderTop: '1px solid ' + attr.dividerColor, borderBottom: '1px solid ' + attr.dividerColor, padding: '32px 0' }
                        }, stats.map(function (stat, i) {
                            return el('div', { key: i, style: { flex: '1', minWidth: '120px', padding: '0 24px', borderRight: (attr.statDivider && i < stats.length - 1) ? '1px solid ' + attr.dividerColor : 'none' } },
                                el('div', { style: { fontSize: attr.statValueSize + 'px', fontWeight: attr.statValueFontWeight||800, color: attr.statValueColor, lineHeight: 1.1 } }, stat.value),
                                el('div', { style: { fontSize: attr.statLabelSize + 'px', color: attr.statLabelColor, marginTop: '4px' } }, stat.label)
                            );
                        })),
                        // Featured quote
                        attr.showQuote && el('div', {
                            style: { background: attr.quoteBg, borderRadius: '16px', padding: '32px 40px', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: '700px', margin: '0 auto' }
                        },
                            el('div', { style: { fontSize: '36px', color: attr.accentColor, lineHeight: 1, marginBottom: '12px', opacity: 0.4, fontFamily: 'Georgia, serif' } }, '\u201C'),
                            el(RichText, {
                                tagName: 'p', value: attr.quote,
                                style: { fontSize: attr.quoteSize + 'px', color: attr.quoteColor, fontStyle: 'italic', lineHeight: '1.65', margin: '0 0 20px' },
                                onChange: function (v) { setAttr({ quote: v }); }
                            }),
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                                attr.quoteAvatarUrl
                                    ? el('img', { src: attr.quoteAvatarUrl, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } })
                                    : el('div', { style: { width: '40px', height: '40px', borderRadius: '50%', background: attr.accentColor, opacity: 0.15 } }),
                                el('div', {},
                                    el('div', { style: { fontWeight: '700', color: attr.authorColor, fontSize: '15px' } }, attr.quoteAuthor),
                                    el('div', { style: { color: attr.roleColor, fontSize: '13px' } }, attr.quoteRole)
                                )
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-sps-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
