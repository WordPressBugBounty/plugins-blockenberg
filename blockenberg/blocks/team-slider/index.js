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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var CARD_STYLES = [
        { value: 'default',    label: 'Default (card)' },
        { value: 'minimal',    label: 'Minimal (no border)' },
        { value: 'centered',   label: 'Centered (avatar top-center)' },
        { value: 'horizontal', label: 'Horizontal (avatar left)' }
    ];

    function emptyMember() {
        return { name: '', role: '', bio: '', imageUrl: '', imageId: 0, imageAlt: '', tag: '', linkedin: '', twitter: '', email: '', website: '' };
    }

    registerBlockType('blockenberg/team-slider', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var members = attr.members || [emptyMember()];

            var blockProps = useBlockProps({ style: {
                background: attr.bgColor || undefined,
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            }});

            function updateMember(idx, field, val) {
                var updated = members.map(function (m, i) {
                    if (i !== idx) return m;
                    var p = {}; p[field] = val;
                    return Object.assign({}, m, p);
                });
                set({ members: updated });
            }

            var isCentered = attr.cardStyle === 'centered';
            var isHorizontal = attr.cardStyle === 'horizontal';

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Slider Settings', 'blockenberg'), initialOpen: true },
                    el(RangeControl, { label: __('Cards Visible', 'blockenberg'), value: attr.perView, min: 1, max: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ perView: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Navigation Arrows', 'blockenberg'), checked: attr.showArrows, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showArrows: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Dots', 'blockenberg'), checked: attr.showDots, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDots: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Autoplay', 'blockenberg'), checked: attr.autoplay, __nextHasNoMarginBottom: true, onChange: function (v) { set({ autoplay: v }); } })
                    ),
                    attr.autoplay && el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Autoplay Delay (ms)', 'blockenberg'), value: attr.autoplayDelay, min: 1000, max: 10000, step: 500, __nextHasNoMarginBottom: true, onChange: function (v) { set({ autoplayDelay: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Card Content', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Card Style', 'blockenberg'), value: attr.cardStyle, options: CARD_STYLES, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardStyle: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Bio', 'blockenberg'), checked: attr.showBio, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBio: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Social Links', 'blockenberg'), checked: attr.showSocials, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSocials: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Department Tag', 'blockenberg'), checked: attr.showTag, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTag: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Avatar Size (px)', 'blockenberg'), value: attr.avatarSize, min: 40, max: 160, __nextHasNoMarginBottom: true, onChange: function (v) { set({ avatarSize: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Avatar Radius %', 'blockenberg'), value: attr.avatarRadius, min: 0, max: 50, __nextHasNoMarginBottom: true, onChange: function (v) { set({ avatarRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Card Radius', 'blockenberg'), value: attr.cardRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardRadius: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Header & Spacing', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Section Heading', 'blockenberg'), checked: attr.showHeading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHeading: v }); } }),
                    attr.showHeading && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Heading', 'blockenberg'), value: attr.heading, __nextHasNoMarginBottom: true, onChange: function (v) { set({ heading: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); } },
                        { label: __('Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                        { label: __('Role', 'blockenberg'), value: attr.roleColor, onChange: function (v) { set({ roleColor: v || '#6366f1' }); } },
                        { label: __('Bio', 'blockenberg'), value: attr.bioColor, onChange: function (v) { set({ bioColor: v || '#6b7280' }); } },
                        { label: __('Tag Background', 'blockenberg'), value: attr.tagBg, onChange: function (v) { set({ tagBg: v || '#ede9fe' }); } },
                        { label: __('Tag Text', 'blockenberg'), value: attr.tagColor, onChange: function (v) { set({ tagColor: v || '#6366f1' }); } },
                        { label: __('Social Icons', 'blockenberg'), value: attr.socialColor, onChange: function (v) { set({ socialColor: v || '#6b7280' }); } },
                        { label: __('Dot', 'blockenberg'), value: attr.dotColor, onChange: function (v) { set({ dotColor: v || '#d1d5db' }); } },
                        { label: __('Dot Active', 'blockenberg'), value: attr.dotActive, onChange: function (v) { set({ dotActive: v || '#6366f1' }); } },
                        { label: __('Arrow Background', 'blockenberg'), value: attr.arrowBg, onChange: function (v) { set({ arrowBg: v || '#ffffff' }); } },
                        { label: __('Arrow Icon', 'blockenberg'), value: attr.arrowColor, onChange: function (v) { set({ arrowColor: v || '#374151' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Name', 'blockenberg'), value: attr.nameTypo, onChange: function (v) { set({ nameTypo: v }); } }),
                    getTypoControl()({ label: __('Bio', 'blockenberg'), value: attr.bioTypo, onChange: function (v) { set({ bioTypo: v }); } }),
                    el(RangeControl, { label: __('Heading Font Size (px)', 'blockenberg'), value: attr.headingFontSize, min: 18, max: 60, __nextHasNoMarginBottom: true, onChange: function (v) { set({ headingFontSize: v }); } }),
                    el(RangeControl, { label: __('Role Font Size (px)', 'blockenberg'), value: attr.roleFontSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ roleFontSize: v }); } })
                )
            );

            /* editor preview: show all members as a grid */
            function MemberCard(member, idx) {
                var avatar = el('div', { style: { width: attr.avatarSize + 'px', height: attr.avatarSize + 'px', borderRadius: attr.avatarRadius + '%', overflow: 'hidden', background: '#e5e7eb', flexShrink: 0, position: 'relative' } },
                    member.imageUrl
                        ? el('img', { src: member.imageUrl, alt: member.imageAlt, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                        : el('div', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9ca3af' } }, '👤'),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { updateMember(idx, 'imageUrl', m.url); updateMember(idx, 'imageId', m.id); updateMember(idx, 'imageAlt', m.alt || ''); },
                            allowedTypes: ['image'], value: member.imageId,
                            render: function (r) { return el(Button, { onClick: r.open, style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '11px', display: 'none' }, className: 'bkbg-ts-edit-overlay' }, '✎'); }
                        })
                    )
                );

                var content = el('div', { style: { flex: 1, textAlign: isCentered ? 'center' : undefined } },
                    attr.showTag && el(TextControl, { value: member.tag, label: '', placeholder: __('Dept…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '11px', marginBottom: '6px' }, onChange: function (v) { updateMember(idx, 'tag', v); } }),
                    el(TextControl, { value: member.name, label: '', placeholder: __('Name', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontWeight: attr.nameFontWeight || 700, fontSize: (attr.nameFontSize || 17) + 'px', color: attr.nameColor }, onChange: function (v) { updateMember(idx, 'name', v); } }),
                    el(TextControl, { value: member.role, label: '', placeholder: __('Role', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: (attr.roleFontSize || 13) + 'px', color: attr.roleColor }, onChange: function (v) { updateMember(idx, 'role', v); } }),
                    attr.showBio && el(RichText, { tagName: 'p', value: member.bio, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Bio…', 'blockenberg'), style: { fontSize: (attr.bioFontSize || 13) + 'px', lineHeight: attr.bioLineHeight || 1.6, color: attr.bioColor, margin: '8px 0' }, onChange: function (v) { updateMember(idx, 'bio', v); } }),
                    attr.showSocials && el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', justifyContent: isCentered ? 'center' : undefined } },
                        el(TextControl, { value: member.linkedin, label: '', placeholder: 'LinkedIn URL', __nextHasNoMarginBottom: true, style: { fontSize: '11px', width: '120px' }, onChange: function (v) { updateMember(idx, 'linkedin', v); } }),
                        el(TextControl, { value: member.twitter, label: '', placeholder: 'Twitter/X URL', __nextHasNoMarginBottom: true, style: { fontSize: '11px', width: '110px' }, onChange: function (v) { updateMember(idx, 'twitter', v); } }),
                        el(TextControl, { value: member.email, label: '', placeholder: 'Email', __nextHasNoMarginBottom: true, style: { fontSize: '11px', width: '120px' }, onChange: function (v) { updateMember(idx, 'email', v); } })
                    )
                );

                var cardContentChildren = isHorizontal
                    ? [el('div', { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } }, avatar, content)]
                    : [el('div', { style: { display: 'flex', justifyContent: isCentered ? 'center' : undefined, marginBottom: '12px' } }, avatar), content];

                return el('div', {
                    key: idx,
                    style: {
                        background: attr.cardBg,
                        border: attr.cardStyle === 'minimal' ? 'none' : ('1px solid ' + attr.cardBorder),
                        borderRadius: attr.cardRadius + 'px',
                        padding: '20px',
                        position: 'relative'
                    }
                },
                    cardContentChildren,
                    el('div', { style: { marginTop: '10px', display: 'flex', gap: '6px', justifyContent: 'flex-end' } },
                        el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { set({ members: members.filter(function (_, i) { return i !== idx; }) }); } }, '× Remove')
                    )
                );
            }

            return el('div', blockProps,
                controls,
                attr.showHeading && attr.heading && el('h2', { style: { fontWeight: 800, fontSize: (attr.headingFontSize || 28) + 'px', marginBottom: '24px', color: attr.nameColor } }, attr.heading),
                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(attr.perView, members.length) + ', 1fr)', gap: '20px' } },
                    members.map(function (m, i) { return MemberCard(m, i); })
                ),
                el('div', { style: { marginTop: '16px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' } },
                    attr.showArrows && el('span', { style: { display: 'inline-block', width: '36px', height: '36px', background: attr.arrowBg, border: '1px solid ' + attr.cardBorder, borderRadius: '50%', lineHeight: '34px', textAlign: 'center', cursor: 'pointer', color: attr.arrowColor } }, '←'),
                    attr.showDots && members.map(function (_, i) { return el('span', { key: i, style: { display: 'inline-block', width: i === 0 ? '20px' : '8px', height: '8px', borderRadius: '999px', background: i === 0 ? attr.dotActive : attr.dotColor } }); }),
                    attr.showArrows && el('span', { style: { display: 'inline-block', width: '36px', height: '36px', background: attr.arrowBg, border: '1px solid ' + attr.cardBorder, borderRadius: '50%', lineHeight: '34px', textAlign: 'center', cursor: 'pointer', color: attr.arrowColor } }, '→')
                ),
                el('div', { style: { marginTop: '12px', textAlign: 'center' } },
                    el(Button, { variant: 'primary', isSmall: true, onClick: function () { set({ members: members.concat([emptyMember()]) }); } }, '+ Add Member')
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            var _tvf = getTypoCssVars();
            var s = {};
            if (_tvf) {
                Object.assign(s, _tvf(attr.nameTypo, '--bksl-nm-'));
                Object.assign(s, _tvf(attr.bioTypo, '--bksl-bi-'));
            }
            return el('div', useBlockProps.save({ style: Object.keys(s).length ? s : undefined }),
                el('div', { className: 'bkbg-ts-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
