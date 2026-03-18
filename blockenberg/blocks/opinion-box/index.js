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

    var BADGE_PRESETS = ['My Take', 'Hot Take', 'Expert View', 'Analysis', 'Opinion', 'Editor\'s Note', 'Insider View'];

    registerBlockType('blockenberg/opinion-box', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var TypoCtrl = getTypoControl();
            var blockProps = (function () {
                var bp = useBlockProps({ className: 'bkbg-opb-wrap', style: { padding: attr.paddingTop * 8 + 'px 0 ' + attr.paddingBottom * 8 + 'px' } });
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(attr.opinionTypo, '--bkbg-opb-op-'));
                    Object.assign(s, _tvf(attr.authorNameTypo, '--bkbg-opb-an-'));
                    Object.assign(s, _tvf(attr.authorTitleTypo, '--bkbg-opb-at-'));
                }
                if (Object.keys(s).length) bp.style = Object.assign(s, bp.style || {});
                return bp;
            }());

            /* Avatar initials */
            var initials = (attr.authorName || 'A').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();

            var avatarEl = attr.showAvatar && el('div', { style: { flexShrink: 0 } },
                el(MediaUploadCheck, {},
                    el(MediaUpload, {
                        onSelect: function (m) { set({ avatarUrl: m.url, avatarId: m.id, avatarAlt: m.alt || '' }); },
                        allowedTypes: ['image'],
                        value: attr.avatarId,
                        render: function (ref) {
                            return el('div', { onClick: ref.open, style: { cursor: 'pointer', width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', background: attr.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid ' + attr.accentColor } },
                                attr.avatarUrl
                                    ? el('img', { src: attr.avatarUrl, alt: attr.avatarAlt, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                                    : el('span', { style: { color: attr.avatarColor, fontWeight: 700, fontSize: '16px' } }, initials)
                            );
                        }
                    })
                )
            );

            /* Badge */
            var badgeEl = attr.showBadge && el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '10px' } }, attr.badgeText);

            /* Opinion text */
            var opinionEl = el(RichText, { tagName: 'p', className: 'bkbg-opb-text', value: attr.opinion, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Share your opinion or analysis…', 'blockenberg'), style: { color: attr.textColor, margin: '0 0 12px' }, onChange: function (v) { set({ opinion: v }); } });

            /* Author row */
            var authorRow = (attr.authorName || attr.authorTitle) && el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                avatarEl,
                el('div', {},
                    attr.authorName && el('div', { className: 'bkbg-opb-author-name', style: { color: attr.authorColor } }, attr.authorName),
                    attr.authorTitle && el('div', { className: 'bkbg-opb-author-title', style: { color: attr.titleColor } }, attr.authorTitle)
                )
            );

            /* Wrap style by variant */
            var wrapStyle;
            if (attr.style === 'featured') {
                wrapStyle = { background: attr.bgColor, border: '1px solid ' + attr.borderColor, borderRadius: attr.borderRadius + 'px', padding: '20px 24px', position: 'relative', overflow: 'hidden' };
            } else if (attr.style === 'inline') {
                wrapStyle = { background: 'transparent', borderLeft: '4px solid ' + attr.accentColor, paddingLeft: '20px', paddingRight: '16px', paddingTop: '4px', paddingBottom: '4px' };
            } else { /* quote */
                wrapStyle = { background: attr.bgColor, borderRadius: attr.borderRadius + 'px', padding: '24px 28px 20px', position: 'relative' };
            }

            /* Quote mark decoration for quote style */
            var quoteMark = attr.style === 'quote' && el('div', { style: { fontSize: '80px', lineHeight: 0.8, color: attr.quoteMarkColor, fontFamily: 'Georgia, serif', marginBottom: '12px', userSelect: 'none' } }, '"');

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Badge', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: attr.showBadge, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBadge: v }); } }),
                    attr.showBadge && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Badge Text', 'blockenberg'), value: attr.badgeText, __nextHasNoMarginBottom: true, onChange: function (v) { set({ badgeText: v }); } }),
                        el('div', { style: { marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' } },
                            BADGE_PRESETS.map(function (p) {
                                return el(Button, { key: p, variant: attr.badgeText === p ? 'primary' : 'secondary', isSmall: true, onClick: function () { set({ badgeText: p }); } }, p);
                            })
                        )
                    )
                ),
                el(PanelBody, { title: __('Author', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Avatar', 'blockenberg'), checked: attr.showAvatar, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAvatar: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Author Name', 'blockenberg'), value: attr.authorName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ authorName: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Author Title / Role', 'blockenberg'), value: attr.authorTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ authorTitle: v }); } })
                    ),
                    attr.showAvatar && attr.avatarUrl && el('div', { style: { marginTop: '8px' } },
                        el(Button, { variant: 'link', isDestructive: true, onClick: function () { set({ avatarUrl: '', avatarId: 0, avatarAlt: '' }); } }, __('Remove Avatar', 'blockenberg'))
                    )
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Featured (card with background)', value: 'featured' }, { label: 'Inline (left accent bar)', value: 'inline' }, { label: 'Quote (large quote mark)', value: 'quote' }],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top (×8px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 10, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom (×8px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 10, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TypoCtrl && el(TypoCtrl, { label: __('Opinion Text', 'blockenberg'), value: attr.opinionTypo, onChange: function (v) { set({ opinionTypo: v }); } }),
                    TypoCtrl && el(TypoCtrl, { label: __('Author Name', 'blockenberg'), value: attr.authorNameTypo, onChange: function (v) { set({ authorNameTypo: v }); } }),
                    TypoCtrl && el(TypoCtrl, { label: __('Author Title', 'blockenberg'), value: attr.authorTitleTypo, onChange: function (v) { set({ authorTitleTypo: v }); } })
                ),
                                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#fefce8' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#fde047' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#ca8a04' }); } },
                        { label: __('Badge BG', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { set({ badgeBg: v || '#ca8a04' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { set({ badgeColor: v || '#ffffff' }); } },
                        { label: __('Opinion Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#1c1917' }); } },
                        { label: __('Author Name', 'blockenberg'), value: attr.authorColor, onChange: function (v) { set({ authorColor: v || '#57534e' }); } },
                        { label: __('Author Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#78716c' }); } },
                        { label: __('Avatar BG', 'blockenberg'), value: attr.avatarBg, onChange: function (v) { set({ avatarBg: v || '#d97706' }); } },
                        { label: __('Avatar Initials', 'blockenberg'), value: attr.avatarColor, onChange: function (v) { set({ avatarColor: v || '#ffffff' }); } },
                        { label: __('Quote Mark', 'blockenberg'), value: attr.quoteMarkColor, onChange: function (v) { set({ quoteMarkColor: v || '#fde047' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    badgeEl,
                    quoteMark,
                    opinionEl,
                    authorRow
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-opb-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
