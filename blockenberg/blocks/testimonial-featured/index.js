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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/testimonial-featured', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.quoteTypo, '--bktft-qt-'));
                    Object.assign(s, _tvf(a.nameTypo, '--bktft-nm-'));
                    Object.assign(s, _tvf(a.titleTypo, '--bktft-tt-'));
                }
                return { style: s };
            })());

            var isSide = a.layout === 'side-by-side';
            var isCard = a.cardStyle === 'card';
            var isDark = a.cardStyle === 'dark';

            var stars = Array.from({ length: 5 }, function (_, i) {
                return el('span', { key: i, style: { color: i < a.rating ? a.starColor : '#d1d5db', fontSize: '18px' } }, '★');
            });

            var cardBg = isDark ? '#1f2937' : isCard ? a.cardBg : 'transparent';
            var quoteTxtColor = isDark ? '#f9fafb' : a.textColor;
            var nameTxtColor = isDark ? '#ffffff' : a.nameColor;
            var titleTxtColor = isDark ? '#9ca3af' : a.titleColor;

            var avatarEl = el(MediaUploadCheck, {},
                el(MediaUpload, {
                    onSelect: function (m) { set({ personAvatarUrl: m.url, personAvatarId: m.id, personAvatarAlt: m.alt || '' }); },
                    allowedTypes: ['image'], value: a.personAvatarId,
                    render: function (ref) {
                        return a.personAvatarUrl
                            ? el('img', { src: a.personAvatarUrl, alt: a.personAvatarAlt, onClick: ref.open, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', flexShrink: 0 } })
                            : el('div', { onClick: ref.open, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer', flexShrink: 0 } }, '👤');
                    }
                })
            );

            var logoEl = a.showCompanyLogo && el(MediaUploadCheck, {},
                el(MediaUpload, {
                    onSelect: function (m) { set({ companyLogoUrl: m.url, companyLogoId: m.id, companyLogoAlt: m.alt || '' }); },
                    allowedTypes: ['image'], value: a.companyLogoId,
                    render: function (ref) {
                        return el('div', { onClick: ref.open, style: { marginBottom: '24px', cursor: 'pointer' } },
                            a.companyLogoUrl
                                ? el('img', { src: a.companyLogoUrl, alt: a.companyLogoAlt, style: { height: '32px', objectFit: 'contain' } })
                                : el('span', { style: { fontSize: '12px', color: '#9ca3af', border: '1px dashed #d1d5db', padding: '4px 10px', borderRadius: '4px' } }, 'Click to add company logo')
                        );
                    }
                })
            );

            var quoteBody = el('div', { style: { position: 'relative', flex: 1 } },
                a.showQuotemark && el('span', { style: { position: 'absolute', top: '-16px', left: '-8px', fontSize: a.quotemarkSize + 'px', lineHeight: 1, color: a.quotemarkColor, fontFamily: 'Georgia, serif', userSelect: 'none', pointerEvents: 'none' } }, '\u201C'),
                logoEl,
                a.showRating && el('div', { style: { display: 'flex', gap: '2px', marginBottom: '20px' } }, stars),
                el(RichText, { tagName: 'blockquote', className: 'bkbg-tft-quote', value: a.quote, style: { color: quoteTxtColor, margin: '0 0 28px', padding: isSide ? '0' : '0 ' + (a.showQuotemark ? '8px' : '0') }, onChange: function (v) { set({ quote: v }); } }),
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' } },
                    avatarEl,
                    el('div', {},
                        el(RichText, { tagName: 'div', className: 'bkbg-tft-name', value: a.personName, style: { color: nameTxtColor }, onChange: function (v) { set({ personName: v }); } }),
                        el(RichText, { tagName: 'div', className: 'bkbg-tft-title', value: a.personTitle, style: { color: titleTxtColor }, onChange: function (v) { set({ personTitle: v }); } })
                    ),
                    a.showResultMetric && el('span', { style: { marginLeft: 'auto', background: a.resultBg, color: a.resultColor, fontSize: '13px', fontWeight: '700', padding: '6px 14px', borderRadius: '999px', whiteSpace: 'nowrap' } },
                        el(RichText, { tagName: 'span', value: a.resultMetric, onChange: function (v) { set({ resultMetric: v }); } })
                    )
                )
            );

            var cardStyles = {
                background: cardBg,
                borderRadius: isCard ? '16px' : '0',
                padding: isCard ? '40px' : '0',
                border: isCard && !isDark ? '1px solid ' + a.borderColor : 'none',
                boxShadow: isCard && !isDark ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
                position: 'relative',
                overflow: 'hidden'
            };

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Centered', value: 'centered' }, { label: 'Side-by-side', value: 'side-by-side' }], onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Card Style', 'blockenberg'), value: a.cardStyle, options: [{ label: 'Clean (no background)', value: 'clean' }, { label: 'Card (light box)', value: 'card' }, { label: 'Dark', value: 'dark' }], onChange: function (v) { set({ cardStyle: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Decorative Quote Mark', 'blockenberg'), checked: a.showQuotemark, onChange: function (v) { set({ showQuotemark: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Stars', 'blockenberg'), checked: a.showRating, onChange: function (v) { set({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                    a.showRating && el(RangeControl, { label: __('Star Rating', 'blockenberg'), value: a.rating, min: 1, max: 5, onChange: function (v) { set({ rating: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Company Logo', 'blockenberg'), checked: a.showCompanyLogo, onChange: function (v) { set({ showCompanyLogo: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Result Metric', 'blockenberg'), checked: a.showResultMetric, onChange: function (v) { set({ showResultMetric: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Quote Mark Size', 'blockenberg'), value: a.quotemarkSize, min: 60, max: 200, onChange: function (v) { set({ quotemarkSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Avatar Size', 'blockenberg'), value: a.avatarSize, min: 40, max: 100, onChange: function (v) { set({ avatarSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 500, max: 1200, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl()({ label: __('Quote', 'blockenberg'), value: a.quoteTypo, onChange: function (v) { set({ quoteTypo: v }); } }),
                    getTypoControl()({ label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { set({ nameTypo: v }); } }),
                    getTypoControl()({ label: __('Title / Role', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Quote Text', 'blockenberg'), value: a.textColor, onChange: function (v) { set({ textColor: v || '#111827' }); } },
                        { label: __('Name', 'blockenberg'), value: a.nameColor, onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                        { label: __('Title', 'blockenberg'), value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#6b7280' }); } },
                        { label: __('Quote Mark', 'blockenberg'), value: a.quotemarkColor, onChange: function (v) { set({ quotemarkColor: v || '#ede9fe' }); } },
                        { label: __('Stars', 'blockenberg'), value: a.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); } },
                        { label: __('Accent', 'blockenberg'), value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Result BG', 'blockenberg'), value: a.resultBg, onChange: function (v) { set({ resultBg: v || '#f0fdf4' }); } },
                        { label: __('Result Text', 'blockenberg'), value: a.resultColor, onChange: function (v) { set({ resultColor: v || '#15803d' }); } },
                        { label: __('Card BG', 'blockenberg'), value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#f9fafb' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { background: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' } },
                    el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' } },
                        el('div', { style: cardStyles }, quoteBody)
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.quoteTypo, '--bktft-qt-'));
                    Object.assign(s, _tvf(a.nameTypo, '--bktft-nm-'));
                    Object.assign(s, _tvf(a.titleTypo, '--bktft-tt-'));
                }
                return { style: s };
            })()),
                el('div', { className: 'bkbg-tft-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
