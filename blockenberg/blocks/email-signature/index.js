( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, MediaUpload, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _esigTC, _esigTV;
    function _tc() { return _esigTC || (_esigTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_esigTV || (_esigTV = window.bkbgTypoCssVars)) ? _esigTV(t, p) : {}; }

    const STYLES = [
        { label: 'Modern (horizontal)', value: 'modern' },
        { label: 'Minimal (text only)', value: 'minimal' },
        { label: 'Branded (accent bar)', value: 'branded' },
        { label: 'Compact (tight)',      value: 'compact' },
    ];
    const DIVIDER_STYLES = [
        { label: 'Line',          value: 'line' },
        { label: 'Accent Bar',    value: 'accent' },
        { label: 'None',          value: 'none' },
    ];
    const SOCIAL_DEFS = [
        { key: 'twitterUrl',   label: 'X / Twitter',  icon: '𝕏', color: '#000000' },
        { key: 'linkedinUrl',  label: 'LinkedIn',      icon: 'in', color: '#0077b5' },
        { key: 'githubUrl',    label: 'GitHub',        icon: '⌂',  color: '#24292e' },
        { key: 'instagramUrl', label: 'Instagram',     icon: '◈',  color: '#e1306c' },
        { key: 'youtubeUrl',   label: 'YouTube',       icon: '▶',  color: '#ff0000' },
    ];

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-esig-accent':        a.accentColor,
            '--bkbg-esig-name-c':        a.nameColor,
            '--bkbg-esig-title-c':       a.titleColor,
            '--bkbg-esig-company-c':     a.companyColor,
            '--bkbg-esig-info-c':        a.infoColor,
            '--bkbg-esig-divider-c':     a.dividerColor,
            '--bkbg-esig-social-c':      a.socialColor,
            '--bkbg-esig-bg':            a.bgColor,
            '--bkbg-esig-name-sz':       a.nameSize + 'px',
            '--bkbg-esig-name-w':        a.nameWeight,
            '--bkbg-esig-name-lh':       a.nameLineHeight,
            '--bkbg-esig-title-sz':      a.titleSize + 'px',
            '--bkbg-esig-title-w':       a.titleWeight,
            '--bkbg-esig-title-lh':      a.titleLineHeight,
            '--bkbg-esig-info-sz':       a.infoSize + 'px',
            '--bkbg-esig-avatar-sz':     a.avatarSize + 'px',
            '--bkbg-esig-avatar-r':      a.avatarRadius + '%',
            '--bkbg-esig-social-icon-sz':a.socialIconSize + 'px',
        }, _tv(a.typoName || {}, '--bkbg-esig-nm-'), _tv(a.typoJobTitle || {}, '--bkbg-esig-jt-'));
    }

    function SigPreview({ a }) {
        const hasSocials = a.showSocials && SOCIAL_DEFS.some(s => a[s.key]);

        return el('div', { className: 'bkbg-esig-sig bkbg-esig-style--' + a.style },
            /* Avatar */
            a.showAvatar && el('div', { className: 'bkbg-esig-avatar-col' },
                a.avatarUrl
                    ? el('img', { src: a.avatarUrl, alt: a.name, className: 'bkbg-esig-avatar' })
                    : el('div', { className: 'bkbg-esig-avatar-placeholder' },
                        el('span', { className: 'dashicons dashicons-admin-users', style: { fontSize: Math.round(a.avatarSize * 0.44) + 'px', color: a.accentColor } })
                      ),
            ),

            /* Content */
            el('div', { className: 'bkbg-esig-body' },
                /* Name + title row */
                el('div', { className: 'bkbg-esig-identity' },
                    el('span', { className: 'bkbg-esig-name' }, a.name),
                    el('span', { className: 'bkbg-esig-title' }, a.title),
                    a.company && el('span', { className: 'bkbg-esig-company' }, a.company),
                ),

                /* Divider */
                a.dividerStyle !== 'none' && el('div', { className: 'bkbg-esig-divider bkbg-esig-divider--' + a.dividerStyle }),

                /* Contact info */
                el('div', { className: 'bkbg-esig-contact' },
                    a.showPhone && a.phone && el('span', { className: 'bkbg-esig-info-row' },
                        el('span', { className: 'bkbg-esig-info-icon' }, '📞'),
                        el('a', { href: 'tel:' + a.phone, className: 'bkbg-esig-info-link' }, a.phone),
                    ),
                    a.showEmail && a.email && el('span', { className: 'bkbg-esig-info-row' },
                        el('span', { className: 'bkbg-esig-info-icon' }, '✉'),
                        el('a', { href: 'mailto:' + a.email, className: 'bkbg-esig-info-link' }, a.email),
                    ),
                    a.showWebsite && a.website && el('span', { className: 'bkbg-esig-info-row' },
                        el('span', { className: 'bkbg-esig-info-icon' }, '🌐'),
                        el('a', { href: 'https://' + a.website.replace(/^https?:\/\//, ''), className: 'bkbg-esig-info-link', target: '_blank', rel: 'noopener' }, a.website.replace(/^https?:\/\//, '')),
                    ),
                ),

                /* Social icons */
                hasSocials && el('div', { className: 'bkbg-esig-socials' },
                    SOCIAL_DEFS.filter(s => a[s.key]).map((s, i) =>
                        el('a', { key: i, className: 'bkbg-esig-social-icon', href: s.key === 'linkedinUrl' || s.key === 'twitterUrl' || s.key === 'githubUrl' ? a[s.key] : a[s.key], target: '_blank', rel: 'noopener noreferrer', title: s.label, style: { color: a.socialColor } },
                            el('span', { style: { fontFamily: 'sans-serif', fontStyle: 'normal', fontWeight: 700 } }, s.icon),
                        )
                    )
                ),

                /* Banner */
                a.showBanner && a.bannerUrl && el('div', { className: 'bkbg-esig-banner' },
                    el('a', { href: a.bannerLink, target: '_blank', rel: 'noopener' },
                        el('img', { src: a.bannerUrl, alt: '', className: 'bkbg-esig-banner-img', style: { maxWidth: a.bannerWidth + 'px' } }),
                    )
                ),
            ),
        );
    }

    registerBlockType('blockenberg/email-signature', {
        edit: function (props) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps({ className: 'bkbg-esig-wrap', style: wrapStyle(a) });

            return el('div', blockProps,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Identity'), initialOpen: true },
                        el(TextControl, { label: __('Full Name'), value: a.name, onChange: v => setAttributes({ name: v }) }),
                        el(TextControl, { label: __('Job Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(TextControl, { label: __('Company'), value: a.company, onChange: v => setAttributes({ company: v }) }),
                    ),

                    el(PanelBody, { title: __('Contact Info'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Phone'), checked: a.showPhone, onChange: v => setAttributes({ showPhone: v }), __nextHasNoMarginBottom: true }),
                        a.showPhone && el(TextControl, { label: __('Phone'), value: a.phone, onChange: v => setAttributes({ phone: v }) }),
                        el(ToggleControl, { label: __('Show Email'), checked: a.showEmail, onChange: v => setAttributes({ showEmail: v }), __nextHasNoMarginBottom: true }),
                        a.showEmail && el(TextControl, { label: __('Email Address'), value: a.email, onChange: v => setAttributes({ email: v }) }),
                        el(ToggleControl, { label: __('Show Website'), checked: a.showWebsite, onChange: v => setAttributes({ showWebsite: v }), __nextHasNoMarginBottom: true }),
                        a.showWebsite && el(TextControl, { label: __('Website'), value: a.website, onChange: v => setAttributes({ website: v }) }),
                    ),

                    el(PanelBody, { title: __('Avatar'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Avatar'), checked: a.showAvatar, onChange: v => setAttributes({ showAvatar: v }), __nextHasNoMarginBottom: true }),
                        a.showAvatar && ( a.avatarUrl
                            ? el('div', null,
                                el('img', { src: a.avatarUrl, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', objectFit: 'cover', borderRadius: a.avatarRadius + '%', display: 'block', marginBottom: 8 } }),
                                el(Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes({ avatarUrl: '', avatarId: 0 }) }, __('Remove')),
                              )
                            : el(MediaUpload, {
                                onSelect: m => setAttributes({ avatarUrl: m.url, avatarId: m.id }),
                                allowedTypes: ['image'],
                                value: a.avatarId,
                                render: ({ open }) => el(Button, { variant: 'secondary', onClick: open, style: { width: '100%', justifyContent: 'center' } }, __('Upload Avatar')),
                              })
                        ),
                        el(RangeControl, { label: __('Avatar Size (px)'), value: a.avatarSize, min: 40, max: 200, onChange: v => setAttributes({ avatarSize: v }) }),
                        el(RangeControl, { label: __('Avatar Radius (%)'), value: a.avatarRadius, min: 0, max: 50, onChange: v => setAttributes({ avatarRadius: v }) }),
                    ),

                    el(PanelBody, { title: __('Social Links'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Social Icons'), checked: a.showSocials, onChange: v => setAttributes({ showSocials: v }), __nextHasNoMarginBottom: true }),
                        SOCIAL_DEFS.map(s => el(TextControl, {
                            key: s.key,
                            label: s.label + ' URL',
                            value: a[s.key],
                            onChange: v => setAttributes({ [s.key]: v }),
                        })),
                    ),

                    el(PanelBody, { title: __('Banner Image'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Banner'), checked: a.showBanner, onChange: v => setAttributes({ showBanner: v }), __nextHasNoMarginBottom: true }),
                        a.showBanner && ( a.bannerUrl
                            ? el('div', null,
                                el('img', { src: a.bannerUrl, style: { maxWidth: '100%', display: 'block', marginBottom: 8 } }),
                                el(Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes({ bannerUrl: '', bannerId: 0 }) }, __('Remove Banner')),
                              )
                            : el(MediaUpload, {
                                onSelect: m => setAttributes({ bannerUrl: m.url, bannerId: m.id }),
                                allowedTypes: ['image'],
                                value: a.bannerId,
                                render: ({ open }) => el(Button, { variant: 'secondary', onClick: open, style: { width: '100%', justifyContent: 'center' } }, __('Upload Banner')),
                              })
                        ),
                        a.showBanner && el(TextControl, { label: __('Banner Link URL'), value: a.bannerLink, onChange: v => setAttributes({ bannerLink: v }) }),
                        a.showBanner && el(RangeControl, { label: __('Banner Max Width (px)'), value: a.bannerWidth, min: 160, max: 600, onChange: v => setAttributes({ bannerWidth: v }) }),
                    ),

                    el(PanelBody, { title: __('Style'), initialOpen: false },
                        el(SelectControl, { label: __('Signature Style'), value: a.style, options: STYLES, onChange: v => setAttributes({ style: v }) }),
                        el(SelectControl, { label: __('Divider Style'), value: a.dividerStyle, options: DIVIDER_STYLES, onChange: v => setAttributes({ dividerStyle: v }) }),
                    ),

                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Name'), typo: a.typoName || {}, onChange: v => setAttributes({ typoName: v }), defaultSize: a.nameSize || 17 }),
                        _tc() && el(_tc(), { label: __('Job Title'), typo: a.typoJobTitle || {}, onChange: v => setAttributes({ typoJobTitle: v }), defaultSize: a.titleSize || 13 }),
                        el(RangeControl, { label: __('Info Size (px)'), value: a.infoSize, min: 10, max: 18, onChange: v => setAttributes({ infoSize: v }) }),
                        el(RangeControl, { label: __('Social Icon Size (px)'), value: a.socialIconSize, min: 12, max: 28, onChange: v => setAttributes({ socialIconSize: v }) }),
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),    value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Name'),          value: a.nameColor,     onChange: v => setAttributes({ nameColor:     v || '#0f172a' }) },
                            { label: __('Job Title'),     value: a.titleColor,    onChange: v => setAttributes({ titleColor:    v || '#6c3fb5' }) },
                            { label: __('Company'),       value: a.companyColor,  onChange: v => setAttributes({ companyColor:  v || '#374151' }) },
                            { label: __('Info Text'),     value: a.infoColor,     onChange: v => setAttributes({ infoColor:     v || '#64748b' }) },
                            { label: __('Accent'),        value: a.accentColor,   onChange: v => setAttributes({ accentColor:   v || '#6c3fb5' }) },
                            { label: __('Divider'),       value: a.dividerColor,  onChange: v => setAttributes({ dividerColor:  v || '#e2e8f0' }) },
                            { label: __('Social Icons'),  value: a.socialColor,   onChange: v => setAttributes({ socialColor:   v || '#64748b' }) },
                        ]
                    }),
                ),

                /* ---- Canvas preview ---- */
                el('div', { className: 'bkbg-esig-editor-label' },
                    el('span', { className: 'dashicons dashicons-email-alt' }),
                    el('span', null, ' ' + __('Email Signature Preview')),
                ),
                el(SigPreview, { a }),
            );
        },

        save: function ({ attributes: a }) {
            const hasSocials = a.showSocials && SOCIAL_DEFS.some(s => a[s.key]);
            return el('div', {
                className: 'bkbg-esig-wrap bkbg-esig-style--' + a.style,
                style: wrapStyle(a),
            },
                el('div', { className: 'bkbg-esig-sig' },
                    a.showAvatar && a.avatarUrl && el('div', { className: 'bkbg-esig-avatar-col' },
                        el('img', { src: a.avatarUrl, alt: a.name, className: 'bkbg-esig-avatar' }),
                    ),
                    el('div', { className: 'bkbg-esig-body' },
                        el('div', { className: 'bkbg-esig-identity' },
                            el('span', { className: 'bkbg-esig-name' }, a.name),
                            el('span', { className: 'bkbg-esig-title' }, a.title),
                            a.company && el('span', { className: 'bkbg-esig-company' }, a.company),
                        ),
                        a.dividerStyle !== 'none' && el('div', { className: 'bkbg-esig-divider bkbg-esig-divider--' + a.dividerStyle }),
                        el('div', { className: 'bkbg-esig-contact' },
                            a.showPhone && a.phone && el('span', { className: 'bkbg-esig-info-row' },
                                el('span', { className: 'bkbg-esig-info-icon' }, '📞'),
                                el('a', { href: 'tel:' + a.phone, className: 'bkbg-esig-info-link' }, a.phone),
                            ),
                            a.showEmail && a.email && el('span', { className: 'bkbg-esig-info-row' },
                                el('span', { className: 'bkbg-esig-info-icon' }, '✉'),
                                el('a', { href: 'mailto:' + a.email, className: 'bkbg-esig-info-link' }, a.email),
                            ),
                            a.showWebsite && a.website && el('span', { className: 'bkbg-esig-info-row' },
                                el('span', { className: 'bkbg-esig-info-icon' }, '🌐'),
                                el('a', { href: 'https://' + a.website.replace(/^https?:\/\//, ''), className: 'bkbg-esig-info-link', target: '_blank', rel: 'noopener noreferrer' }, a.website.replace(/^https?:\/\//, '')),
                            ),
                        ),
                        hasSocials && el('div', { className: 'bkbg-esig-socials' },
                            SOCIAL_DEFS.filter(s => a[s.key]).map((s, i) =>
                                el('a', { key: i, className: 'bkbg-esig-social-icon', href: a[s.key], target: '_blank', rel: 'noopener noreferrer', title: s.label, style: { color: a.socialColor } },
                                    el('span', { style: { fontFamily: 'sans-serif', fontStyle: 'normal', fontWeight: 700, fontSize: a.socialIconSize + 'px' } }, s.icon),
                                )
                            )
                        ),
                        a.showBanner && a.bannerUrl && el('div', { className: 'bkbg-esig-banner' },
                            el('a', { href: a.bannerLink, target: '_blank', rel: 'noopener noreferrer' },
                                el('img', { src: a.bannerUrl, alt: '', className: 'bkbg-esig-banner-img', style: { maxWidth: a.bannerWidth + 'px' } }),
                            )
                        ),
                    ),
                ),
            );
        }
    });
}() );
