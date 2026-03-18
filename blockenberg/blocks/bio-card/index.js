( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    function getTypographyControl() { return window.bkbgTypographyControl; }
    function getTypoCssVars() { return window.bkbgTypoCssVars; }

    var LAYOUT_OPTIONS = [
        { label: __('Card – Centered',  'blockenberg'), value: 'card-center' },
        { label: __('Card – Left',      'blockenberg'), value: 'card-left' },
        { label: __('Horizontal',       'blockenberg'), value: 'horizontal' },
        { label: __('Minimal',          'blockenberg'), value: 'minimal' },
    ];
    var SHAPE_OPTIONS = [
        { label: __('Circle',  'blockenberg'), value: 'circle' },
        { label: __('Rounded', 'blockenberg'), value: 'rounded' },
        { label: __('Square',  'blockenberg'), value: 'square' },
    ];
    var STATUS_OPTIONS = [
        { label: __('Available',   'blockenberg'), value: 'available' },
        { label: __('Busy',        'blockenberg'), value: 'busy' },
        { label: __('Unavailable', 'blockenberg'), value: 'unavailable' },
    ];
    var STATUS_COLORS = { available: '#16a34a', busy: '#f59e0b', unavailable: '#ef4444' };
    var HEADING_OPTIONS = [
        { label: 'H2', value: 'h2' }, { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' }, { label: 'p',  value: 'p' },
    ];
    var SOCIAL_ICONS = {
        twitter:   'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
        linkedin:  'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M2 6.5a2 2 0 114 0 2 2 0 01-4 0z',
        github:    'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.746 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
        instagram: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01 M7.55 3h8.9C18.44 3 21 5.56 21 7.55v8.9C21 18.44 18.44 21 16.45 21H7.55C5.56 21 3 18.44 3 16.45V7.55C3 5.56 5.56 3 7.55 3z',
        website:   'M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
        email:     'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
        youtube:   'M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z M9.75 15.02l5.75-3.02-5.75-3.02v6.04z',
        dribbble:  'M12 2a10 10 0 100 20A10 10 0 0012 2z M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32',
    };
    var SOCIAL_OPTIONS = [
        { label: 'Twitter / X', value: 'twitter' },
        { label: 'LinkedIn',    value: 'linkedin' },
        { label: 'GitHub',      value: 'github' },
        { label: 'Instagram',   value: 'instagram' },
        { label: 'Website',     value: 'website' },
        { label: 'Email',       value: 'email' },
        { label: 'YouTube',     value: 'youtube' },
        { label: 'Dribbble',    value: 'dribbble' },
    ];

    function makeId() { return 'bc' + Math.random().toString(36).substr(2, 6); }

    /* Photo radius helper */
    function photoRadius(shape, size) {
        if (shape === 'circle')  return '50%';
        if (shape === 'rounded') return Math.round(size * 0.18) + 'px';
        return '4px';
    }

    /* Social icon SVG */
    function SocialIcon(props) {
        var platform = props.platform;
        var size = props.size || 18;
        var color = props.color;
        var d = SOCIAL_ICONS[platform] || SOCIAL_ICONS.website;
        var isStroked = ['linkedin', 'instagram', 'website', 'email', 'youtube', 'dribbble'].indexOf(platform) !== -1;
        return el('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: isStroked ? 'none' : color, stroke: isStroked ? color : 'none', strokeWidth: isStroked ? 2 : 0, strokeLinecap: 'round', strokeLinejoin: 'round' },
            el('path', { d: d })
        );
    }

    /* Render card preview */
    function BioCardPreview(props) {
        var a = props.a;
        var onNameChange = props.onNameChange;
        var onRoleChange = props.onRoleChange;
        var onBioChange = props.onBioChange;
        var isEditor = props.isEditor;

        var isCentered = a.layout === 'card-center' || a.layout === 'minimal';
        var isHoriz = a.layout === 'horizontal';
        var align = isCentered ? 'center' : 'flex-start';

        var cardStyle = {
            maxWidth: a.maxWidth + 'px',
            margin: '0 auto',
            background: a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding: a.layout === 'minimal' ? '0' : a.cardPadding + 'px',
            boxShadow: a.showShadow && a.layout !== 'minimal' ? '0 8px 40px rgba(0,0,0,0.10)' : 'none',
            display: 'flex',
            flexDirection: isHoriz ? 'row' : 'column',
            alignItems: isHoriz ? 'flex-start' : align,
            gap: isHoriz ? '32px' : '16px',
            position: 'relative',
        };

        var photoEl = (a.photoUrl
            ? el('img', { src: a.photoUrl, alt: a.name, style: { width: a.photoSize + 'px', height: a.photoSize + 'px', objectFit: 'cover', borderRadius: photoRadius(a.photoShape, a.photoSize), border: a.photoBorderWidth + 'px solid ' + a.photoBorderColor, display: 'block', flexShrink: 0 } })
            : el('div', { style: { width: a.photoSize + 'px', height: a.photoSize + 'px', borderRadius: photoRadius(a.photoShape, a.photoSize), background: a.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(a.photoSize * 0.4) + 'px', fontWeight: 700, color: '#fff', flexShrink: 0, border: a.photoBorderWidth + 'px solid ' + a.photoBorderColor } },
                (a.name || 'A').charAt(0).toUpperCase()
            )
        );

        return el('div', { className: 'bkbg-bio-card bkbg-bio-card--' + a.layout, style: cardStyle },
            /* Photo */
            el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: align, gap: '12px', flexShrink: 0 } },
                photoEl,
                /* Availability */
                a.showAvailability && el('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: STATUS_COLORS[a.availabilityStatus] + '18', borderRadius: '99px', padding: '3px 10px 3px 6px' } },
                    el('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[a.availabilityStatus], flexShrink: 0 } }),
                    el('span', { style: { fontSize: '12px', fontWeight: 600, color: STATUS_COLORS[a.availabilityStatus] } }, a.availabilityLabel)
                )
            ),

            /* Main content */
            el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: isCentered ? 'center' : 'flex-start', textAlign: isCentered ? 'center' : 'left', gap: '4px' } },
                /* Name */
                isEditor
                    ? el(RichText, { tagName: a.nameTag, className: 'bkbg-bio-name', value: a.name, onChange: onNameChange, placeholder: __('Name', 'blockenberg'), style: { color: a.nameColor, margin: 0, padding: 0 } })
                    : el(a.nameTag, { className: 'bkbg-bio-name', style: { color: a.nameColor, margin: '0 0 2px' } }, a.name),

                /* Role */
                isEditor
                    ? el(RichText, { tagName: 'p', className: 'bkbg-bio-role', value: a.role, onChange: onRoleChange, placeholder: __('Role', 'blockenberg'), style: { color: a.roleColor, margin: 0, padding: 0 } })
                    : el('p', { className: 'bkbg-bio-role', style: { color: a.roleColor, margin: '0 0 2px' } }, a.role),

                /* Company */
                a.company && el('p', { style: { fontSize: (a.roleSize - 1) + 'px', color: a.accentColor, margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.02em' } }, a.company),

                /* Bio */
                el('div', { style: { marginTop: '8px', marginBottom: '8px' } },
                    isEditor
                        ? el(RichText, { tagName: 'p', className: 'bkbg-bio-bio', value: a.bio, onChange: onBioChange, placeholder: __('Bio text…', 'blockenberg'), style: { color: a.bioColor, margin: 0, padding: 0 } })
                        : el('p', { className: 'bkbg-bio-bio', style: { color: a.bioColor, margin: 0 } }, a.bio)
                ),

                /* Skills */
                a.showSkills && a.skills.length > 0 && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: isCentered ? 'center' : 'flex-start', marginBottom: '12px' } },
                    a.skills.map(function (skill) {
                        return el('span', { key: skill.id, style: { background: (skill.color || a.accentColor) + '18', color: skill.color || a.accentColor, borderRadius: a.skillTagRadius + 'px', padding: '3px 10px', fontSize: a.skillTagSize + 'px', fontWeight: 600 } }, skill.label);
                    })
                ),

                /* Social links */
                a.showSocial && a.socialLinks.length > 0 && el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: isCentered ? 'center' : 'flex-start', marginBottom: '16px' } },
                    a.socialLinks.map(function (link) {
                        return el('a', { key: link.id, href: link.url || '#', style: { color: a.accentColor, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', opacity: 0.8 } },
                            el(SocialIcon, { platform: link.platform, size: 18, color: a.accentColor })
                        );
                    })
                ),

                /* CTA Button */
                a.showCta && el('a', {
                    href: a.ctaUrl || '#',
                    style: {
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: a.ctaStyle === 'filled' ? a.accentColor : 'transparent',
                        color: a.ctaStyle === 'filled' ? '#fff' : a.accentColor,
                        border: '2px solid ' + a.accentColor,
                        borderRadius: '8px', padding: '10px 22px',
                        fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                    }
                }, a.ctaText)
            )
        );
    }

    registerBlockType('blockenberg/bio-card', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var skillsState = useState(false);
            var socialState = useState(false);
            var _tv = getTypoCssVars();
            var bpStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
            if (_tv) {
                Object.assign(bpStyle, _tv(a.nameTypo || {}, '--bkbg-bio-name-'));
                Object.assign(bpStyle, _tv(a.roleTypo || {}, '--bkbg-bio-role-'));
                Object.assign(bpStyle, _tv(a.bioTypo || {}, '--bkbg-bio-bio-'));
            }
            var blockProps = useBlockProps({ style: bpStyle });

            function addSkill() { setAttributes({ skills: a.skills.concat([{ id: makeId(), label: 'New Skill', color: a.accentColor }]) }); }
            function removeSkill(id) { setAttributes({ skills: a.skills.filter(function (s) { return s.id !== id; }) }); }
            function setSkill(id, patch) { setAttributes({ skills: a.skills.map(function (s) { return s.id === id ? Object.assign({}, s, patch) : s; }) }); }

            function addLink() { setAttributes({ socialLinks: a.socialLinks.concat([{ id: makeId(), platform: 'website', url: '' }]) }); }
            function removeLink(id) { setAttributes({ socialLinks: a.socialLinks.filter(function (l) { return l.id !== id; }) }); }
            function setLink(id, patch) { setAttributes({ socialLinks: a.socialLinks.map(function (l) { return l.id === id ? Object.assign({}, l, patch) : l; }) }); }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Identity', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                        el(SelectControl, { label: __('Name heading tag', 'blockenberg'), value: a.nameTag, options: HEADING_OPTIONS, onChange: function (v) { setAttributes({ nameTag: v }); } }),
                        el(TextControl, { label: __('Company', 'blockenberg'), value: a.company, onChange: function (v) { setAttributes({ company: v }); } }),
                        el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#757575' } }, __('Photo', 'blockenberg')),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) { setAttributes({ photoUrl: media.url, photoId: media.id }); },
                                allowedTypes: ['image'],
                                value: a.photoId,
                                render: function (ref) { return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact' }, a.photoUrl ? __('Change photo', 'blockenberg') : __('Upload photo', 'blockenberg')); }
                            })
                        ),
                        a.photoUrl && el(Button, { onClick: function () { setAttributes({ photoUrl: '', photoId: 0 }); }, variant: 'tertiary', isDestructive: true, size: 'compact', style: { marginTop: '4px', display: 'block' } }, __('Remove photo', 'blockenberg')),
                        el(SelectControl, { label: __('Photo shape', 'blockenberg'), value: a.photoShape, options: SHAPE_OPTIONS, onChange: function (v) { setAttributes({ photoShape: v }); } }),
                        el(RangeControl, { label: __('Photo size (px)', 'blockenberg'), value: a.photoSize, min: 60, max: 200, onChange: function (v) { setAttributes({ photoSize: v }); } }),
                        el(RangeControl, { label: __('Border width (px)', 'blockenberg'), value: a.photoBorderWidth, min: 0, max: 8, onChange: function (v) { setAttributes({ photoBorderWidth: v }); } })
                    ),
                    el(PanelBody, { title: __('Availability', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show availability badge', 'blockenberg'), checked: a.showAvailability, onChange: function (v) { setAttributes({ showAvailability: v }); }, __nextHasNoMarginBottom: true }),
                        a.showAvailability && el(Fragment, null,
                            el(SelectControl, { label: __('Status', 'blockenberg'), value: a.availabilityStatus, options: STATUS_OPTIONS, onChange: function (v) { setAttributes({ availabilityStatus: v }); } }),
                            el(TextControl, { label: __('Badge label', 'blockenberg'), value: a.availabilityLabel, onChange: function (v) { setAttributes({ availabilityLabel: v }); } })
                        )
                    ),
                    el(PanelBody, { title: __('Skills / Tags', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show skills', 'blockenberg'), checked: a.showSkills, onChange: function (v) { setAttributes({ showSkills: v }); }, __nextHasNoMarginBottom: true }),
                        ),
                    el(PanelBody, { title: __('Social Links', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show social links', 'blockenberg'), checked: a.showSocial, onChange: function (v) { setAttributes({ showSocial: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSocial && el(Fragment, null,
                            a.socialLinks.map(function (link) {
                                return el('div', { key: link.id, style: { marginBottom: '10px', padding: '10px', background: '#f9fafb', borderRadius: '8px' } },
                                    el(SelectControl, { label: __('Platform', 'blockenberg'), value: link.platform, options: SOCIAL_OPTIONS, onChange: function (v) { setLink(link.id, { platform: v }); } }),
                                    el(TextControl, { label: __('URL', 'blockenberg'), value: link.url, onChange: function (v) { setLink(link.id, { url: v }); } }),
                                    el(Button, { onClick: function () { removeLink(link.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addLink, variant: 'secondary', size: 'compact' }, __('+ Add Link', 'blockenberg'))
                        )
                    ),
                    el(PanelBody, { title: __('CTA Button', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show CTA button', 'blockenberg'), checked: a.showCta, onChange: function (v) { setAttributes({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCta && el(Fragment, null,
                            el(TextControl, { label: __('Button text', 'blockenberg'), value: a.ctaText, onChange: function (v) { setAttributes({ ctaText: v }); } }),
                            el(TextControl, { label: __('Button URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setAttributes({ ctaUrl: v }); } }),
                            el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: a.ctaTarget, onChange: function (v) { setAttributes({ ctaTarget: v }); }, __nextHasNoMarginBottom: true }),
                            el(SelectControl, { label: __('Button style', 'blockenberg'), value: a.ctaStyle, options: [{ label: 'Filled', value: 'filled' }, { label: 'Outline', value: 'outline' }], onChange: function (v) { setAttributes({ ctaStyle: v }); } })
                        )
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: a.maxWidth, min: 280, max: 900, onChange: function (v) { setAttributes({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: a.cardPadding, min: 16, max: 80, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        el(ToggleControl, { label: __('Show shadow', 'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttributes({ showShadow: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Name', 'blockenberg'), value: a.nameTypo || {}, onChange: function (v) { setAttributes({ nameTypo: v }); } }) : null; })(),
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Role', 'blockenberg'), value: a.roleTypo || {}, onChange: function (v) { setAttributes({ roleTypo: v }); } }) : null; })(),
                        (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Bio', 'blockenberg'), value: a.bioTypo || {}, onChange: function (v) { setAttributes({ bioTypo: v }); } }) : null; })(),
                        a.showSkills && el(Fragment, null,
                                                    a.skills.map(function (skill) {
                                                        return el('div', { key: skill.id, style: { display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' } },
                                                            el(TextControl, { value: skill.label, onChange: function (v) { setSkill(skill.id, { label: v }); }, style: { flex: 1, margin: 0 } }),
                                                            el(Button, { onClick: function () { removeSkill(skill.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, '✕')
                                                        );
                                                    }),
                                                    el(RangeControl, { label: __('Tag size (px)', 'blockenberg'), value: a.skillTagSize, min: 10, max: 18, onChange: function (v) { setAttributes({ skillTagSize: v }); } }),
                                                    el(RangeControl, { label: __('Tag radius (px)', 'blockenberg'), value: a.skillTagRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ skillTagRadius: v }); } }),
                                                    el(Button, { onClick: addSkill, variant: 'secondary', size: 'compact' }, __('+ Add Tag', 'blockenberg'))
                                                )
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.accentColor,       onChange: function (v) { setAttributes({ accentColor: v || '' }); },       label: __('Accent', 'blockenberg') },
                            { value: a.cardBg,            onChange: function (v) { setAttributes({ cardBg: v || '' }); },            label: __('Card background', 'blockenberg') },
                            { value: a.nameColor,         onChange: function (v) { setAttributes({ nameColor: v || '' }); },         label: __('Name', 'blockenberg') },
                            { value: a.roleColor,         onChange: function (v) { setAttributes({ roleColor: v || '' }); },         label: __('Role', 'blockenberg') },
                            { value: a.bioColor,          onChange: function (v) { setAttributes({ bioColor: v || '' }); },          label: __('Bio', 'blockenberg') },
                            { value: a.photoBorderColor,  onChange: function (v) { setAttributes({ photoBorderColor: v || '' }); },  label: __('Photo border', 'blockenberg') },
                            { value: a.bgColor,           onChange: function (v) { setAttributes({ bgColor: v || '' }); },           label: __('Section background', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'),    value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el(BioCardPreview, {
                        a: a,
                        isEditor: true,
                        onNameChange: function (v) { setAttributes({ name: v }); },
                        onRoleChange: function (v) { setAttributes({ role: v }); },
                        onBioChange:  function (v) { setAttributes({ bio: v }); },
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tv = getTypoCssVars();
            var saveStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
            if (_tv) {
                Object.assign(saveStyle, _tv(a.nameTypo || {}, '--bkbg-bio-name-'));
                Object.assign(saveStyle, _tv(a.roleTypo || {}, '--bkbg-bio-role-'));
                Object.assign(saveStyle, _tv(a.bioTypo || {}, '--bkbg-bio-bio-'));
            }
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-bio-card-wrap', style: saveStyle });
            var isCentered = a.layout === 'card-center' || a.layout === 'minimal';
            var isHoriz = a.layout === 'horizontal';
            var align = isCentered ? 'center' : 'flex-start';

            function socialPath(platform) { return SOCIAL_ICONS[platform] || SOCIAL_ICONS.website; }
            function isSVGStroked(p) { return ['linkedin', 'instagram', 'website', 'email', 'youtube', 'dribbble'].indexOf(p) !== -1; }

            return el('div', blockProps,
                el('div', { className: 'bkbg-bio-card bkbg-bio-card--' + a.layout, style: { maxWidth: a.maxWidth + 'px', margin: '0 auto', background: a.cardBg, borderRadius: a.cardRadius + 'px', padding: a.layout === 'minimal' ? '0' : a.cardPadding + 'px', boxShadow: a.showShadow && a.layout !== 'minimal' ? '0 8px 40px rgba(0,0,0,0.10)' : 'none', display: 'flex', flexDirection: isHoriz ? 'row' : 'column', alignItems: isHoriz ? 'flex-start' : align, gap: isHoriz ? '32px' : '16px' } },
                    el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: align, gap: '12px', flexShrink: 0 } },
                        a.photoUrl
                            ? el('img', { src: a.photoUrl, alt: a.name, width: a.photoSize, height: a.photoSize, style: { width: a.photoSize + 'px', height: a.photoSize + 'px', objectFit: 'cover', borderRadius: photoRadius(a.photoShape, a.photoSize), border: a.photoBorderWidth + 'px solid ' + a.photoBorderColor, display: 'block', flexShrink: 0 } })
                            : el('div', { 'aria-hidden': 'true', style: { width: a.photoSize + 'px', height: a.photoSize + 'px', borderRadius: photoRadius(a.photoShape, a.photoSize), background: a.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(a.photoSize * 0.4) + 'px', fontWeight: 700, color: '#fff', flexShrink: 0, border: a.photoBorderWidth + 'px solid ' + a.photoBorderColor } }, (a.name || 'A').charAt(0).toUpperCase()),
                        a.showAvailability && el('div', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: STATUS_COLORS[a.availabilityStatus] + '18', borderRadius: '99px', padding: '3px 10px 3px 6px' } },
                            el('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[a.availabilityStatus], flexShrink: 0 } }),
                            el('span', { style: { fontSize: '12px', fontWeight: 600, color: STATUS_COLORS[a.availabilityStatus] } }, a.availabilityLabel)
                        )
                    ),
                    el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: isCentered ? 'center' : 'flex-start', textAlign: isCentered ? 'center' : 'left', gap: '4px' } },
                        el(a.nameTag, { className: 'bkbg-bio-name', style: { color: a.nameColor, margin: '0 0 2px' } }, a.name),
                        el('p', { className: 'bkbg-bio-role', style: { color: a.roleColor, margin: '0 0 2px' } }, a.role),
                        a.company && el('p', { style: { fontSize: (a.roleSize - 1) + 'px', color: a.accentColor, margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.02em' } }, a.company),
                        el('div', { style: { marginTop: '8px', marginBottom: '8px' } },
                            el(RichText.Content, { tagName: 'p', className: 'bkbg-bio-bio', value: a.bio, style: { color: a.bioColor, margin: 0 } })
                        ),
                        a.showSkills && a.skills.length > 0 && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: isCentered ? 'center' : 'flex-start', marginBottom: '12px' } },
                            a.skills.map(function (skill) {
                                return el('span', { key: skill.id, style: { background: (skill.color || a.accentColor) + '18', color: skill.color || a.accentColor, borderRadius: a.skillTagRadius + 'px', padding: '3px 10px', fontSize: a.skillTagSize + 'px', fontWeight: 600 } }, skill.label);
                            })
                        ),
                        a.showSocial && a.socialLinks.length > 0 && el('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: isCentered ? 'center' : 'flex-start', marginBottom: '16px' } },
                            a.socialLinks.map(function (link) {
                                var stroked = isSVGStroked(link.platform);
                                return el('a', { key: link.id, href: link.url || '#', target: a.ctaTarget ? '_blank' : undefined, rel: a.ctaTarget ? 'noopener noreferrer' : undefined, 'aria-label': link.platform, style: { color: a.accentColor, display: 'flex', alignItems: 'center', textDecoration: 'none', opacity: 0.8 } },
                                    el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: stroked ? 'none' : a.accentColor, stroke: stroked ? a.accentColor : 'none', strokeWidth: stroked ? 2 : 0, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
                                        el('path', { d: socialPath(link.platform) })
                                    )
                                );
                            })
                        ),
                        a.showCta && el('a', { href: a.ctaUrl || '#', target: a.ctaTarget ? '_blank' : undefined, rel: a.ctaTarget ? 'noopener noreferrer' : undefined, style: { display: 'inline-flex', alignItems: 'center', background: a.ctaStyle === 'filled' ? a.accentColor : 'transparent', color: a.ctaStyle === 'filled' ? '#fff' : a.accentColor, border: '2px solid ' + a.accentColor, borderRadius: '8px', padding: '10px 22px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' } }, a.ctaText)
                    )
                )
            );
        }
    });
}() );
