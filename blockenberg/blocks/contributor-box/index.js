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
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var LABELS = ['Written by', 'Contributors', 'Research Team', 'Authors', 'Editorial Team', 'Reviewed by'];

    var _ctbTC, _ctbTV;
    function _tc() { return _ctbTC || (_ctbTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _ctbTV || (_ctbTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    function initials(name) {
        return (name || '?').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
    }

    function updateContrib(contribs, idx, key, val) {
        return contribs.map(function (c, i) {
            if (i !== idx) return c;
            var r = Object.assign({}, c); r[key] = val; return r;
        });
    }

    registerBlockType('blockenberg/contributor-box', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var contribs = attr.contributors || [];

            var blockProps = useBlockProps({ style: Object.assign({ padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px', background: attr.bgColor, borderRadius: attr.borderRadius + 'px' }, _tv(attr.typoName, '--bkbg-ctb-name-'), _tv(attr.typoRole, '--bkbg-ctb-role-'), _tv(attr.typoBio, '--bkbg-ctb-bio-')) });

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: attr.layout, __nextHasNoMarginBottom: true,
                        options: [
                            { label: 'Grid (cards)', value: 'grid' },
                            { label: 'List (horizontal row)', value: 'list' },
                            { label: 'Compact (avatars only)', value: 'compact' }
                        ],
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), checked: attr.showLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLabel: v }); } })
                    ),
                    attr.showLabel && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Label Text', 'blockenberg'), value: attr.label, __nextHasNoMarginBottom: true, onChange: function (v) { set({ label: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Bios', 'blockenberg'), checked: attr.showBio, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBio: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Social Links', 'blockenberg'), checked: attr.showSocial, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSocial: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Avatar Size (px)', 'blockenberg'), value: attr.avatarSize, min: 32, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ avatarSize: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Outer Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Card Radius', 'blockenberg'), value: attr.cardRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f8fafc' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Label', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#94a3b8' }); } },
                        { label: __('Avatar BG (initials)', 'blockenberg'), value: attr.avatarBg, onChange: function (v) { set({ avatarBg: v || '#e2e8f0' }); } },
                        { label: __('Avatar Text (initials)', 'blockenberg'), value: attr.avatarColor, onChange: function (v) { set({ avatarColor: v || '#64748b' }); } },
                        { label: __('Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { set({ nameColor: v || '#0f172a' }); } },
                        { label: __('Title / Role', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#64748b' }); } },
                        { label: __('Bio Text', 'blockenberg'), value: attr.bioColor, onChange: function (v) { set({ bioColor: v || '#475569' }); } },
                        { label: __('Social Icons', 'blockenberg'), value: attr.socialColor, onChange: function (v) { set({ socialColor: v || '#94a3b8' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#2563eb' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Name', 'blockenberg'), value: attr.typoName, onChange: function (v) { set({ typoName: v }); } }),
                    _tc() && el(_tc(), { label: __('Role', 'blockenberg'), value: attr.typoRole, onChange: function (v) { set({ typoRole: v }); } }),
                    _tc() && el(_tc(), { label: __('Bio', 'blockenberg'), value: attr.typoBio, onChange: function (v) { set({ typoBio: v }); } })
                )
            );

            var isCompact = attr.layout === 'compact';
            var isList = attr.layout === 'list';
            var isGrid = attr.layout === 'grid';

            var wrapStyle = { padding: '20px' };
            var gridStyle = isGrid
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginTop: '14px' }
                : isCompact
                    ? { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginTop: '10px' }
                    : { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' };

            var cards = el('div', { style: gridStyle },
                contribs.map(function (c, idx) {
                    var sz = attr.avatarSize;
                    var avatarEl = el('div', { style: { flexShrink: 0 } },
                        el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: function (media) { set({ contributors: contribs.map(function (c, i) { return i !== idx ? c : Object.assign({}, c, { avatarUrl: media.url, avatarId: media.id }); }) }); },
                                allowedTypes: ['image'],
                                value: c.avatarId,
                                render: function (ref) {
                                    return el(Button, { onClick: ref.open, style: { padding: 0, borderRadius: '50%', overflow: 'hidden', display: 'block', width: sz + 'px', height: sz + 'px', cursor: 'pointer' } },
                                        c.avatarUrl
                                            ? el('img', { src: c.avatarUrl, style: { width: sz + 'px', height: sz + 'px', objectFit: 'cover', display: 'block', borderRadius: '50%' } })
                                            : el('div', { style: { width: sz + 'px', height: sz + 'px', borderRadius: '50%', background: attr.avatarBg, color: attr.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: Math.round(sz * 0.35) + 'px' } }, initials(c.name))
                                    );
                                }
                            })
                        )
                    );

                    if (isCompact) {
                        return el('div', { key: idx, title: c.name + (c.title ? ' — ' + c.title : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
                            avatarEl,
                            el('div', { style: { fontSize: '11px', fontWeight: 600, color: attr.nameColor, textAlign: 'center', maxWidth: sz + 'px' } }, c.name)
                        );
                    }

                    var cardStyle = {
                        background: attr.cardBg,
                        border: '1px solid ' + attr.cardBorder,
                        borderRadius: attr.cardRadius + 'px',
                        padding: '14px 16px',
                        display: isList ? 'flex' : 'block',
                        gap: isList ? '14px' : undefined,
                        alignItems: isList ? 'flex-start' : undefined
                    };

                    return el('div', { key: idx, style: cardStyle },
                        avatarEl,
                        el('div', { style: { flex: 1, minWidth: 0, marginTop: isGrid ? '10px' : 0 } },
                            el(TextControl, { value: c.name, label: __('Name', 'blockenberg'), placeholder: __('Author Name', 'blockenberg'), __nextHasNoMarginBottom: true, style: { color: attr.nameColor }, onChange: function (v) { set({ contributors: updateContrib(contribs, idx, 'name', v) }); } }),
                            el('div', { style: { marginTop: '4px' } },
                                el(TextControl, { value: c.title, label: __('Role / Title', 'blockenberg'), placeholder: __('Staff Writer', 'blockenberg'), __nextHasNoMarginBottom: true, style: { color: attr.titleColor }, onChange: function (v) { set({ contributors: updateContrib(contribs, idx, 'title', v) }); } })
                            ),
                            attr.showBio && el('div', { style: { marginTop: '4px' } },
                                el(TextareaControl, { value: c.bio, label: __('Bio', 'blockenberg'), placeholder: __('Short bio…', 'blockenberg'), rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ contributors: updateContrib(contribs, idx, 'bio', v) }); } })
                            ),
                            attr.showSocial && el('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' } },
                                el(TextControl, { value: c.twitter, label: 'Twitter/X URL', __nextHasNoMarginBottom: true, style: { width: '140px', fontSize: '11px' }, onChange: function (v) { set({ contributors: updateContrib(contribs, idx, 'twitter', v) }); } }),
                                el(TextControl, { value: c.linkedin, label: 'LinkedIn URL', __nextHasNoMarginBottom: true, style: { width: '140px', fontSize: '11px' }, onChange: function (v) { set({ contributors: updateContrib(contribs, idx, 'linkedin', v) }); } }),
                                el(TextControl, { value: c.website, label: 'Website URL', __nextHasNoMarginBottom: true, style: { width: '140px', fontSize: '11px' }, onChange: function (v) { set({ contributors: updateContrib(contribs, idx, 'website', v) }); } })
                            ),
                            el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '11px', marginTop: '4px' }, onClick: function () { set({ contributors: contribs.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                        )
                    );
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    attr.showLabel && el('div', { style: { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: attr.labelColor, marginBottom: '4px' } }, attr.label),
                    cards,
                    el('div', { style: { textAlign: 'center', marginTop: '12px' } },
                        el(Button, { variant: 'secondary', onClick: function () { set({ contributors: contribs.concat([{ name: 'Author Name', title: '', avatarUrl: '', avatarId: 0, bio: '', twitter: '', linkedin: '', website: '' }]) }); } }, __('+ Add Contributor', 'blockenberg'))
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ctb-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
