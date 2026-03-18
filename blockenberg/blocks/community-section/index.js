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

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    registerBlockType('blockenberg/community-section', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-coms-editor' });

            function updateAvatar(idx, key, val) {
                var next = attr.avatars.map(function (a, i) {
                    if (i !== idx) return a;
                    var obj = {}; Object.keys(a).forEach(function (k) { obj[k] = a[k]; });
                    obj[key] = val; return obj;
                });
                setAttr({ avatars: next });
            }

            function updateTrust(idx, val) {
                var next = attr.trusts.map(function (t, i) { return i === idx ? { text: val } : t; });
                setAttr({ trusts: next });
            }

            /* avatar strip */
            var avatarStrip = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' } },
                attr.avatars.map(function (av, idx) {
                    return el('div', {
                        key: idx,
                        style: { marginLeft: idx === 0 ? 0 : attr.avatarOverlap + 'px', position: 'relative', zIndex: attr.avatars.length - idx }
                    },
                        av.imageUrl
                            ? el('img', {
                                src: av.imageUrl, alt: av.alt,
                                style: { width: attr.avatarSize + 'px', height: attr.avatarSize + 'px', borderRadius: '50%', objectFit: 'cover', border: '3px solid ' + attr.avatarBorderColor, display: 'block' }
                            })
                            : el('div', {
                                style: { width: attr.avatarSize + 'px', height: attr.avatarSize + 'px', borderRadius: '50%', background: '#e5e7eb', border: '3px solid ' + attr.avatarBorderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }
                            }, '👤')
                    );
                })
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Avatars', 'blockenberg'), initialOpen: true },
                    el('p', { style: { color: '#6b7280', fontSize: '12px' } }, __('Click each avatar below to add images, or use the fields here:', 'blockenberg')),
                    attr.avatars.map(function (av, idx) {
                        return el('div', { key: idx, style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '8px' } },
                            el(TextControl, { label: __('Name', 'blockenberg'), value: av.name, onChange: function (v) { updateAvatar(idx, 'name', v); }, __nextHasNoMarginBottom: true }),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateAvatar(idx, 'imageUrl', m.url); updateAvatar(idx, 'imageId', m.id); },
                                    allowedTypes: ['image'], value: av.imageId,
                                    render: function (ref) {
                                        return el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' } },
                                            av.imageUrl && el('img', { src: av.imageUrl, style: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' } }),
                                            el(Button, { isSmall: true, isSecondary: true, onClick: ref.open }, av.imageUrl ? __('Change', 'blockenberg') : __('Add Photo', 'blockenberg')),
                                            av.imageUrl && el(Button, { isSmall: true, isDestructive: true, onClick: function () { updateAvatar(idx, 'imageUrl', ''); updateAvatar(idx, 'imageId', 0); } }, '✕')
                                        );
                                    }
                                })
                            ),
                            el(Button, { isSmall: true, isDestructive: true, style: { marginTop: '6px' }, onClick: function () { setAttr({ avatars: attr.avatars.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                        );
                    }),
                    attr.avatars.length < 8 && el(Button, { isSecondary: true, isSmall: true, onClick: function () { setAttr({ avatars: attr.avatars.concat([{ imageUrl: '', imageId: 0, alt: 'Member', name: 'Member' }]) }); } }, '+ Add Avatar'),
                    el(RangeControl, { label: __('Avatar Size (px)', 'blockenberg'), value: attr.avatarSize, min: 28, max: 80, onChange: function (v) { setAttr({ avatarSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Overlap (px, negative)', 'blockenberg'), value: attr.avatarOverlap, min: -40, max: 0, onChange: function (v) { setAttr({ avatarOverlap: v }); }, __nextHasNoMarginBottom: true })
                ),
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Member Count', 'blockenberg'), value: attr.memberCount, onChange: function (v) { setAttr({ memberCount: v }); }, __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Count Label', 'blockenberg'), value: attr.memberCountLabel, onChange: function (v) { setAttr({ memberCountLabel: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Heading', 'blockenberg'), checked: attr.showHeading, onChange: function (v) { setAttr({ showHeading: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CTA', 'blockenberg'), checked: attr.ctaEnabled, onChange: function (v) { setAttr({ ctaEnabled: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(TextControl, { label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    attr.ctaEnabled && el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: attr.ctaIsExternal, onChange: function (v) { setAttr({ ctaIsExternal: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: attr.showBadge, onChange: function (v) { setAttr({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showBadge && el(TextControl, { label: __('Badge Text', 'blockenberg'), value: attr.badgeText, onChange: function (v) { setAttr({ badgeText: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Trust Text', 'blockenberg'), checked: attr.showTrusts, onChange: function (v) { setAttr({ showTrusts: v }); }, __nextHasNoMarginBottom: true }),
                    attr.showTrusts && attr.trusts.map(function (t, idx) {
                        return el(TextControl, { key: idx, label: __('Trust item', 'blockenberg') + ' ' + (idx + 1), value: t.text, onChange: function (v) { updateTrust(idx, v); }, __nextHasNoMarginBottom: true });
                    })
                ),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout,
                        options: [{ label: 'Centered', value: 'centered' }, { label: 'Split (left/right)', value: 'split' }],
                        onChange: function (v) { setAttr({ layout: v }); }, __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: attr.maxWidth, min: 400, max: 1400, onChange: function (v) { setAttr({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: attr.paddingTop, min: 0, max: 160, onChange: function (v) { setAttr({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 160, onChange: function (v) { setAttr({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.typoHeading, onChange: function (v) { setAttr({ typoHeading: v }); } }),
                    el(getTypographyControl(), { label: __('Body Typography', 'blockenberg'), value: attr.typoBody, onChange: function (v) { setAttr({ typoBody: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Count', 'blockenberg'), value: attr.countColor, onChange: function (v) { setAttr({ countColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.textColor, onChange: function (v) { setAttr({ textColor: v || '#6b7280' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#7c3aed' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } },
                        { label: __('Badge BG', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { setAttr({ badgeBg: v || '#f0fdf4' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { setAttr({ badgeColor: v || '#15803d' }); } },
                        { label: __('Avatar Border', 'blockenberg'), value: attr.avatarBorderColor, onChange: function (v) { setAttr({ avatarBorderColor: v || '#ffffff' }); } },
                        { label: __('Trust Text', 'blockenberg'), value: attr.trustColor, onChange: function (v) { setAttr({ trustColor: v || '#9ca3af' }); } }
                    ]
                })
            );

            var isSplit = attr.layout === 'split';

            return el('div', blockProps, controls,
                el('div', { style: Object.assign({ background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' }, _tv(attr.typoHeading, '--bkcoms-heading-'), _tv(attr.typoBody, '--bkcoms-body-')) },
                    el('div', {
                        style: {
                            maxWidth: attr.maxWidth + 'px', margin: '0 auto',
                            display: isSplit ? 'flex' : 'block',
                            gap: isSplit ? '48px' : undefined, alignItems: isSplit ? 'center' : undefined,
                            textAlign: isSplit ? 'left' : 'center'
                        }
                    },
                        /* left/top side: avatars + count */
                        el('div', { style: isSplit ? { flex: '0 0 auto' } : {} },
                            avatarStrip,
                            el('div', { style: { textAlign: 'center', marginBottom: '4px' } },
                                el('span', { style: { fontSize: '28px', fontWeight: '800', color: attr.countColor } }, attr.memberCount),
                                el('span', { style: { fontSize: '14px', color: attr.textColor, marginLeft: '8px' } }, attr.memberCountLabel)
                            )
                        ),
                        /* right/bottom side: heading + CTA */
                        el('div', { style: { flex: 1 } },
                            attr.showHeading && el('div', {},
                                el(RichText, {
                                    tagName: 'h2', value: attr.heading,
                                    className: 'bkcoms-heading',
                                    style: { color: attr.headingColor, margin: '0 0 12px' },
                                    onChange: function (v) { setAttr({ heading: v }); }
                                }),
                                el(RichText, {
                                    tagName: 'p', value: attr.subtext,
                                    className: 'bkcoms-body',
                                    style: { color: attr.textColor, margin: '0 0 20px' },
                                    onChange: function (v) { setAttr({ subtext: v }); }
                                })
                            ),
                            attr.ctaEnabled && el('div', { style: { marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: isSplit ? 'flex-start' : 'center', flexWrap: 'wrap' } },
                                el('a', {
                                    href: '#editor',
                                    style: { background: attr.ctaBg, color: attr.ctaColor, padding: '14px 32px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', display: 'inline-block' }
                                }, attr.ctaLabel),
                                attr.showBadge && el('span', { style: { background: attr.badgeBg, color: attr.badgeColor, fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '999px' } }, attr.badgeText)
                            ),
                            attr.showTrusts && el('div', { style: { display: 'flex', gap: '16px', justifyContent: isSplit ? 'flex-start' : 'center', flexWrap: 'wrap' } },
                                attr.trusts.map(function (t, i) {
                                    return el('span', { key: i, style: { fontSize: '12px', color: attr.trustColor } }, '✓ ' + t.text);
                                })
                            )
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var sv = Object.assign({}, _tv(a.typoHeading, '--bkcoms-heading-'), _tv(a.typoBody, '--bkcoms-body-'));
            return el('div', wp.blockEditor.useBlockProps.save({ style: sv }),
                el('div', { className: 'bkbg-coms-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
