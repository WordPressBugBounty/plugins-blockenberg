( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function () { return {}; };
    }
    function _tv(typoObj, prefix) { return getTypoCssVars()(typoObj || {}, prefix); }

    var STYLE_OPTIONS = [
        { label: 'Card (bordered + shadow)', value: 'card' },
        { label: 'Flat (no shadow)',         value: 'flat' },
        { label: 'Minimal (no border)',      value: 'minimal' },
        { label: 'Badge (accent header)',    value: 'badge' },
    ];
    var ORIENTATION_OPTIONS = [
        { label: 'Vertical (stacked)', value: 'vertical' },
        { label: 'Horizontal (side by side)', value: 'horizontal' },
    ];
    var ALIGN_OPTIONS = [
        { label: 'Left',   value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right',  value: 'right' },
    ];
    var PLATFORM_OPTIONS = [
        { label: 'LinkedIn',   value: 'linkedin' },
        { label: 'GitHub',     value: 'github' },
        { label: 'Twitter/X',  value: 'twitter' },
        { label: 'Instagram',  value: 'instagram' },
        { label: 'YouTube',    value: 'youtube' },
        { label: 'Dribbble',   value: 'dribbble' },
        { label: 'Behance',    value: 'behance' },
        { label: 'Custom',     value: 'custom' },
    ];
    var PLATFORM_ICONS = {
        linkedin:  'in',
        github:    '</>',
        twitter:   'X',
        instagram: 'IG',
        youtube:   '▶',
        dribbble:  '●',
        behance:   'Bē',
        custom:    '🔗',
    };
    var CONTACT_ICONS = { email: '✉', phone: '☎', address: '📍', website: '🌐' };

    function updateLink(arr, idx, field, val) {
        return arr.map(function (lnk, i) {
            if (i !== idx) return lnk;
            var p = {}; p[field] = val;
            return Object.assign({}, lnk, p);
        });
    }

    function initials(name) {
        return (name || 'SJ').split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    }

    // ── Editor preview builder ──
    function buildPreview(a) {
        var isHoriz = a.cardOrientation === 'horizontal';
        var isBadge = a.style === 'badge';

        var wrapStyle = {
            maxWidth: a.maxWidth + 'px',
            borderRadius: a.borderRadius + 'px',
            background: a.cardBg,
            overflow: 'hidden',
            fontFamily: 'inherit',
        };
        if (a.style === 'card' || a.style === 'flat') {
            wrapStyle.border = '1px solid ' + a.cardBorder;
        }
        if (a.style === 'card' && a.showShadow) {
            wrapStyle.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';
        }

        var innerAlign = a.align === 'center' ? 'center' : a.align === 'right' ? 'flex-end' : 'flex-start';

        // Avatar
        var avatarEl;
        if (a.showPhoto && a.photoUrl) {
            avatarEl = el('img', {
                src: a.photoUrl,
                style: {
                    width: a.avatarSize + 'px', height: a.avatarSize + 'px',
                    borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid ' + (isBadge ? '#fff' : a.cardBg),
                    flexShrink: 0,
                }
            });
        } else if (a.showPhoto) {
            avatarEl = el('div', {
                style: {
                    width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%',
                    background: a.accentBg, color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: Math.round(a.avatarSize * 0.38) + 'px',
                    fontWeight: 700, flexShrink: 0,
                    border: '3px solid ' + (isBadge ? '#fff' : a.cardBg),
                }
            }, initials(a.name));
        }

        // Badge header
        var headerEl = isBadge
            ? el('div', {
                style: {
                    background: a.accentBg, height: 72,
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'center', paddingBottom: (a.avatarSize / 2) + 'px',
                }
            })
            : null;

        // Text block
        var textBlock = el('div', null,
            el('div', {
                className: 'bkbg-cc-name',
                style: {
                    color: a.nameColor,
                    marginBottom: 2,
                }
            }, a.name || 'Name'),
            (a.jobTitle || a.company) && el('div', {
                className: 'bkbg-cc-meta',
                style: { color: a.titleColor, marginBottom: 2 }
            }, [a.jobTitle, a.company].filter(Boolean).join(' · ')),
        );

        // Contact fields
        var contactEl = el('div', {
            style: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }
        },
            ['email', 'phone', 'address', 'website'].filter(function (f) { return !!a[f]; }).map(function (f) {
                return el('div', {
                    key: f,
                    className: 'bkbg-cc-contact-row',
                    style: { display: 'flex', alignItems: 'center', gap: 6, color: a.companyColor }
                },
                    el('span', { style: { fontSize: 13 } }, CONTACT_ICONS[f]),
                    el('span', null, a[f])
                );
            })
        );

        // Social links
        var linksEl = a.showLinks && a.links.length > 0 && el('div', {
            style: { display: 'flex', gap: 8, marginTop: 12, justifyContent: innerAlign, flexWrap: 'wrap' }
        },
            a.links.map(function (lnk, i) {
                return el('div', {
                    key: i,
                    style: {
                        width: 32, height: 32, borderRadius: 8,
                        background: a.iconBg, color: a.iconColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, cursor: 'default',
                    }
                }, PLATFORM_ICONS[lnk.platform] || '🔗');
            })
        );

        // Divider
        var dividerEl = a.showDivider && el('div', {
            style: { height: 1, background: a.dividerColor, margin: '12px 0' }
        });

        // Assemble body
        var bodyStyle = {
            padding: a.cardPadding + 'px',
            display: 'flex',
            gap: 16,
            flexDirection: isHoriz ? 'row' : 'column',
            alignItems: isHoriz ? 'center' : innerAlign,
            textAlign: isHoriz ? 'left' : a.align,
        };
        if (isBadge) { bodyStyle.marginTop = -(a.avatarSize / 2) + 'px'; }

        return el('div', { style: wrapStyle },
            headerEl,
            el('div', { style: bodyStyle },
                isBadge
                    ? el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } },
                        avatarEl,
                        textBlock,
                        dividerEl,
                        contactEl,
                        linksEl
                    )
                    : el(Fragment, null,
                        avatarEl,
                        el('div', { style: { flex: 1 } },
                            textBlock,
                            dividerEl,
                            contactEl,
                            linksEl
                        )
                    )
            )
        );
    }

    registerBlockType('blockenberg/contact-card', {
        title: __('Contact Card', 'blockenberg'),
        icon: 'id-alt',
        category: 'bkbg-business',
        description: __('Business card with photo, contact details, social links. Multiple style variants.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign(
                { display: 'flex', justifyContent: a.align === 'center' ? 'center' : a.align === 'right' ? 'flex-end' : 'flex-start' },
                _tv(a.typoName, '--bkcc-name-'),
                _tv(a.typoMeta, '--bkcc-meta-')
            ) });

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Identity
                    el(PanelBody, { title: 'Identity', initialOpen: true },
                        el(TextControl, { label: 'Name', value: a.name, onChange: function (v) { set({ name: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Job title', value: a.jobTitle, onChange: function (v) { set({ jobTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(TextControl, { label: 'Company', value: a.company, onChange: function (v) { set({ company: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show photo', checked: a.showPhoto, onChange: function (v) { set({ showPhoto: v }); }, __nextHasNoMarginBottom: true }),
                        a.showPhoto && el(Fragment, null,
                            el('div', { style: { height: 6 } }),
                            el(MediaUploadCheck, null,
                                el(MediaUpload, {
                                    onSelect: function (m) { set({ photoUrl: m.url, photoId: m.id }); },
                                    allowedTypes: ['image'],
                                    value: a.photoId,
                                    render: function (mProps) {
                                        return el(Fragment, null,
                                            a.photoUrl && el('img', { src: a.photoUrl, style: { width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 6 } }),
                                            el(Button, { variant: 'secondary', size: 'small', onClick: mProps.open, __nextHasNoMarginBottom: true }, a.photoUrl ? 'Replace Photo' : 'Select Photo'),
                                            a.photoUrl && el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ photoUrl: '', photoId: 0 }); }, style: { marginLeft: 8 }, __nextHasNoMarginBottom: true }, 'Remove')
                                        );
                                    }
                                })
                            )
                        )
                    ),

                    // Contact Details
                    el(PanelBody, { title: 'Contact Details', initialOpen: false },
                        ['email', 'phone', 'address', 'website'].map(function (f, i) {
                            return el(Fragment, { key: f },
                                i > 0 && el('div', { style: { height: 8 } }),
                                el(TextControl, { label: f.charAt(0).toUpperCase() + f.slice(1), value: a[f], onChange: function (v) { var p = {}; p[f] = v; set(p); }, __nextHasNoMarginBottom: true })
                            );
                        })
                    ),

                    // Social Links
                    el(PanelBody, { title: 'Social Links (' + a.links.length + ')', initialOpen: false },
                        el(ToggleControl, { label: 'Show links', checked: a.showLinks, onChange: function (v) { set({ showLinks: v }); }, __nextHasNoMarginBottom: true }),
                        a.showLinks && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            a.links.map(function (lnk, i) {
                                return el('div', {
                                    key: i,
                                    style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', marginBottom: 8, background: '#fafafa' }
                                },
                                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
                                        el('span', { style: { fontSize: 16 } }, PLATFORM_ICONS[lnk.platform] || '🔗'),
                                        el('span', { style: { fontSize: 13, fontWeight: 600 } }, lnk.label || lnk.platform)
                                    ),
                                    el(SelectControl, { label: 'Platform', value: lnk.platform, options: PLATFORM_OPTIONS, onChange: function (v) { set({ links: updateLink(a.links, i, 'platform', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'URL', value: lnk.url, onChange: function (v) { set({ links: updateLink(a.links, i, 'url', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 6 } }),
                                    el(TextControl, { label: 'Link label (for aria)', value: lnk.label, onChange: function (v) { set({ links: updateLink(a.links, i, 'label', v) }); }, __nextHasNoMarginBottom: true }),
                                    el('div', { style: { height: 4 } }),
                                    el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ links: a.links.filter(function (_, idx) { return idx !== i; }) }); }, __nextHasNoMarginBottom: true }, 'Remove')
                                );
                            }),
                            el(Button, { variant: 'secondary', onClick: function () { set({ links: a.links.concat([{ platform: 'custom', url: '', label: 'Link' }]) }); }, style: { width: '100%', justifyContent: 'center' }, __nextHasNoMarginBottom: true }, '+ Add Link')
                        )
                    ),

                    // Appearance
                    el(PanelBody, { title: 'Appearance', initialOpen: false },
                        el(SelectControl, { label: 'Card style', value: a.style, options: STYLE_OPTIONS, onChange: function (v) { set({ style: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(SelectControl, { label: 'Orientation', value: a.cardOrientation, options: ORIENTATION_OPTIONS, onChange: function (v) { set({ cardOrientation: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(SelectControl, { label: 'Alignment', value: a.align, options: ALIGN_OPTIONS, onChange: function (v) { set({ align: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(RangeControl, { label: 'Max width (px)', value: a.maxWidth, min: 200, max: 700, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(RangeControl, { label: 'Avatar size (px)', value: a.avatarSize, min: 48, max: 140, onChange: function (v) { set({ avatarSize: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(RangeControl, { label: 'Border radius (px)', value: a.borderRadius, min: 0, max: 32, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el(RangeControl, { label: 'Card padding (px)', value: a.cardPadding, min: 12, max: 60, onChange: function (v) { set({ cardPadding: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 8 } }),
                        el('div', { style: { height: 8 } }),
                        el('div', { style: { height: 8 } }),
                        el(ToggleControl, { label: 'Show shadow', checked: a.showShadow, onChange: function (v) { set({ showShadow: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 4 } }),
                        el(ToggleControl, { label: 'Show divider', checked: a.showDivider, onChange: function (v) { set({ showDivider: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Colors
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(Fragment, {},
                                el(TC, {
                                    label: __('Name', 'blockenberg'),
                                    value: a.typoName || {},
                                    onChange: function (v) { set({ typoName: v }); }
                                }),
                                el(TC, {
                                    label: __('Meta / Details', 'blockenberg'),
                                    value: a.typoMeta || {},
                                    onChange: function (v) { set({ typoMeta: v }); }
                                })
                            );
                        })()
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Card Background',  value: a.cardBg,       onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Card Border',      value: a.cardBorder,   onChange: function (v) { set({ cardBorder: v || '#e5e7eb' }); } },
                            { label: 'Accent (header / avatar bg)', value: a.accentBg, onChange: function (v) { set({ accentBg: v || '#6366f1' }); } },
                            { label: 'Name Color',       value: a.nameColor,    onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                            { label: 'Title Color',      value: a.titleColor,   onChange: function (v) { set({ titleColor: v || '#6b7280' }); } },
                            { label: 'Detail Text',      value: a.companyColor, onChange: function (v) { set({ companyColor: v || '#374151' }); } },
                            { label: 'Icon Background',  value: a.iconBg,       onChange: function (v) { set({ iconBg: v || '#f1f5f9' }); } },
                            { label: 'Icon Color',       value: a.iconColor,    onChange: function (v) { set({ iconColor: v || '#374151' }); } },
                            { label: 'Link Hover Color', value: a.linkColor,    onChange: function (v) { set({ linkColor: v || '#6366f1' }); } },
                            { label: 'Divider Color',    value: a.dividerColor, onChange: function (v) { set({ dividerColor: v || '#f1f5f9' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    buildPreview(a)
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save({ style: Object.assign({}, _tv(props.attributes.typoName, '--bkcc-name-'), _tv(props.attributes.typoMeta, '--bkcc-meta-')) }),
                el('div', { className: 'bkbg-cc-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
