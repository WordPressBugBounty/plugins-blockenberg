( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    /* ── Typography lazy getters ───────────────────────────────────────── */
    var _Typo, _tv;
    Object.defineProperty(window, '__bkbgAbTypoReady', { get: function () {
        if (!_Typo) _Typo = window.bkbgTypographyControl;
        if (!_tv)   _tv   = window.bkbgTypoCssVars;
        return !!(_Typo && _tv);
    }});
    function getTypoCssVars()   { window.__bkbgAbTypoReady; return _tv;   }
    function getTypoComponent()  { window.__bkbgAbTypoReady; return _Typo; }

    /* ── Shared wrap style ─────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        var tv = getTypoCssVars();
        var s = {
            '--bkbg-ab-size':      a.avatarSize + 'px',
            '--bkbg-ab-pad':       a.padding + 'px',
            '--bkbg-ab-gap':       a.gap + 'px',
            '--bkbg-ab-bg':        a.bgColor,
            '--bkbg-ab-border':    a.borderColor,
            '--bkbg-ab-radius':    a.borderRadius + 'px',
            '--bkbg-ab-name-size': a.nameSize + 'px',
            '--bkbg-ab-name-w':    a.nameWeight,
            '--bkbg-ab-name-clr':  a.nameColor,
            '--bkbg-ab-role-size': a.roleSize + 'px',
            '--bkbg-ab-role-clr':  a.roleColor,
            '--bkbg-ab-bio-size':  a.bioSize + 'px',
            '--bkbg-ab-bio-clr':   a.bioColor,
            '--bkbg-ab-bio-lh':    a.bioLineHeight,
            '--bkbg-ab-link-clr':  a.linkColor,
            '--bkbg-ab-link-hov':  a.linkHoverColor
        };
        if (tv) {
            Object.assign(s, tv(a.nameTypo || {}, '--bkbg-ab-name-'));
            Object.assign(s, tv(a.roleTypo || {}, '--bkbg-ab-role-'));
            Object.assign(s, tv(a.bioTypo  || {}, '--bkbg-ab-bio-'));
        }
        return s;
    }

    var fontWeightOptions = [
        { label: '400', value: 400 }, { label: '500', value: 500 },
        { label: '600', value: 600 }, { label: '700', value: 700 },
        { label: '800', value: 800 }, { label: '900', value: 900 }
    ];

    var platformOptions = [
        { label: 'Twitter / X',  value: 'twitter' },
        { label: 'LinkedIn',     value: 'linkedin' },
        { label: 'Facebook',     value: 'facebook' },
        { label: 'Instagram',    value: 'instagram' },
        { label: 'YouTube',      value: 'youtube' },
        { label: 'GitHub',       value: 'github' },
        { label: 'Website',      value: 'website' },
        { label: 'Email',        value: 'email' }
    ];

    /* Platform SVG icons */
    var platformIcons = {
        twitter:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        linkedin:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
        facebook:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
        instagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
        youtube:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02l6.5-3.02-6.5-3.02v6.04z"/></svg>',
        github:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
        website:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
        email:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
    };

    function uid() { return Math.random().toString(36).slice(2, 7); }

    function defaultLink() {
        return { id: uid(), platform: 'website', url: '', label: 'Website' };
    }

    function AvatarPlaceholder(_ref) {
        var size = _ref.size;
        return el('div', {
            className: 'bkbg-ab-avatar-placeholder',
            style: { width: size + 'px', height: size + 'px' }
        },
            el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
                el('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', stroke: 'currentColor', strokeWidth: 2, fill: 'none' })
            )
        );
    }

    registerBlockType('blockenberg/author-box', {
        title: __('Author Box', 'blockenberg'),
        description: __('Blog author profile card with avatar, bio and social links.', 'blockenberg'),
        category: 'bkbg-business',
        icon: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z', stroke: 'currentColor', strokeWidth: 2, fill: 'none' })
        ),
        attributes: {
            name:          { type: 'string',  default: 'Jane Smith' },
            role:          { type: 'string',  default: 'Content Writer' },
            bio:           { type: 'string',  default: 'Jane writes about technology, design, and the future of the web. She has 10+ years of experience crafting compelling stories for top-tier publications.' },
            avatarUrl:     { type: 'string',  default: '' },
            avatarId:      { type: 'number',  default: 0 },
            avatarSize:    { type: 'number',  default: 88 },
            avatarShape:   { type: 'string',  default: 'circle' },
            layout:        { type: 'string',  default: 'horizontal' },
            showRole:      { type: 'boolean', default: true },
            links:         { type: 'array',   default: [
                { id: 'l1', platform: 'twitter',  url: '', label: 'Twitter' },
                { id: 'l2', platform: 'linkedin', url: '', label: 'LinkedIn' },
                { id: 'l3', platform: 'website',  url: '', label: 'Website' }
            ]},
            showLinks:     { type: 'boolean', default: true },
            padding:       { type: 'number',  default: 28 },
            gap:           { type: 'number',  default: 24 },
            bgColor:       { type: 'string',  default: '#f9fafb' },
            borderColor:   { type: 'string',  default: '#e5e7eb' },
            borderRadius:  { type: 'number',  default: 14 },
            showBorder:    { type: 'boolean', default: true },
            nameSize:      { type: 'number',  default: 20 },
            nameWeight:    { type: 'number',  default: 700 },
            nameColor:     { type: 'string',  default: '#111827' },
            roleSize:      { type: 'number',  default: 14 },
            roleColor:     { type: 'string',  default: '#6b7280' },
            bioSize:       { type: 'number',  default: 15 },
            bioColor:      { type: 'string',  default: '#374151' },
            bioLineHeight: { type: 'string',  default: '1.7' },
            linkColor:     { type: 'string',  default: '#2563eb' },
            linkHoverColor:{ type: 'string',  default: '#1d4ed8' }
        },

        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var links = a.links;

            function updateLink(i, field, val) {
                setAttr({ links: links.map(function (l, j) {
                    return j === i ? Object.assign({}, l, { [field]: val }) : l;
                })});
            }
            function addLink() {
                setAttr({ links: links.concat(defaultLink()) });
            }
            function removeLink(i) {
                setAttr({ links: links.filter(function (_, j) { return j !== i; }) });
            }
            function moveLink(i, dir) {
                var arr = links.slice();
                var t = i + dir;
                if (t < 0 || t >= arr.length) return;
                var tmp = arr[i]; arr[i] = arr[t]; arr[t] = tmp;
                setAttr({ links: arr });
            }

            var wrapStyle = buildWrapStyle(a);

            var blockProps = useBlockProps({
                className: 'bkbg-ab-wrap bkbg-ab-layout--' + a.layout + (a.showBorder ? ' bkbg-ab-bordered' : ''),
                style: wrapStyle
            });

            var inspector = el(InspectorControls, null,

                el(PanelBody, { title: __('Avatar', 'blockenberg'), initialOpen: true },
                    el(MediaUpload, {
                        onSelect: function (m) { setAttr({ avatarUrl: m.url, avatarId: m.id }); },
                        type: 'image', value: a.avatarId,
                        render: function (p) {
                            return el(Fragment, null,
                                a.avatarUrl && el('img', {
                                    src: a.avatarUrl,
                                    style: { width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', display: 'block', marginBottom: 8 }
                                }),
                                el(Button, {
                                    variant: a.avatarUrl ? 'secondary' : 'primary',
                                    isSmall: true, onClick: p.open
                                }, a.avatarUrl ? __('Change Avatar', 'blockenberg') : __('Upload Avatar', 'blockenberg')),
                                a.avatarUrl && el(Button, {
                                    variant: 'tertiary', isSmall: true, isDestructive: true,
                                    onClick: function () { setAttr({ avatarUrl: '', avatarId: 0 }); },
                                    style: { marginLeft: 8 }
                                }, __('Remove', 'blockenberg'))
                            );
                        }
                    }),
                    el(RangeControl, {
                        label: __('Avatar size (px)', 'blockenberg'),
                        value: a.avatarSize, min: 40, max: 200,
                        onChange: function (v) { setAttr({ avatarSize: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Avatar shape', 'blockenberg'),
                        value: a.avatarShape,
                        options: [
                            { label: 'Circle',  value: 'circle' },
                            { label: 'Rounded', value: 'rounded' },
                            { label: 'Square',  value: 'square' }
                        ],
                        onChange: function (v) { setAttr({ avatarShape: v }); }
                    })
                ),

                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.layout,
                        options: [
                            { label: 'Horizontal (avatar left)',  value: 'horizontal' },
                            { label: 'Vertical (avatar centered)',value: 'vertical' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding (px)', 'blockenberg'),
                        value: a.padding, min: 8, max: 64,
                        onChange: function (v) { setAttr({ padding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)', 'blockenberg'),
                        value: a.gap, min: 8, max: 64,
                        onChange: function (v) { setAttr({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border radius (px)', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 40,
                        onChange: function (v) { setAttr({ borderRadius: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show border', 'blockenberg'),
                        checked: a.showBorder,
                        onChange: function (v) { setAttr({ showBorder: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show role / position', 'blockenberg'),
                        checked: a.showRole,
                        onChange: function (v) { setAttr({ showRole: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Name Typography', 'blockenberg'),
                        value: a.nameTypo || {},
                        onChange: function (v) { setAttr({ nameTypo: v }); }
                    }),
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Role Typography', 'blockenberg'),
                        value: a.roleTypo || {},
                        onChange: function (v) { setAttr({ roleTypo: v }); }
                    }),
                    getTypoComponent() && el(getTypoComponent(), {
                        label: __('Bio Typography', 'blockenberg'),
                        value: a.bioTypo || {},
                        onChange: function (v) { setAttr({ bioTypo: v }); }
                    })
                ),

                el(PanelBody, { title: __('Social Links', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show social links', 'blockenberg'),
                        checked: a.showLinks,
                        onChange: function (v) { setAttr({ showLinks: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.showLinks && el(Fragment, null,
                        links.map(function (link, i) {
                            return el('div', { key: link.id, className: 'bkbg-ab-link-row' },
                                el(SelectControl, {
                                    label: __('Platform', 'blockenberg'),
                                    value: link.platform,
                                    options: platformOptions,
                                    onChange: function (v) { updateLink(i, 'platform', v); }
                                }),
                                el(TextControl, {
                                    label: __('URL', 'blockenberg'),
                                    type: 'url', value: link.url,
                                    onChange: function (v) { updateLink(i, 'url', v); }
                                }),
                                el('div', { style: { display: 'flex', gap: 4, marginBottom: 12 } },
                                    i > 0 && el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveLink(i, -1); } }, '↑'),
                                    i < links.length - 1 && el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveLink(i, 1); } }, '↓'),
                                    el(Button, { isSmall: true, variant: 'tertiary', isDestructive: true, onClick: function () { removeLink(i); } }, '✕')
                                )
                            );
                        }),
                        el(Button, {
                            variant: 'secondary', isSmall: true, onClick: addLink
                        }, __('+ Add Link', 'blockenberg'))
                    )
                ),

                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background',   'blockenberg'), value: a.bgColor,    onChange: function(v){ setAttr({ bgColor: v||'#f9fafb' }); } },
                            { label: __('Border',       'blockenberg'), value: a.borderColor, onChange: function(v){ setAttr({ borderColor: v||'#e5e7eb' }); } },
                            { label: __('Name',         'blockenberg'), value: a.nameColor,  onChange: function(v){ setAttr({ nameColor: v||'#111827' }); } },
                            { label: __('Role',         'blockenberg'), value: a.roleColor,  onChange: function(v){ setAttr({ roleColor: v||'#6b7280' }); } },
                            { label: __('Bio text',     'blockenberg'), value: a.bioColor,   onChange: function(v){ setAttr({ bioColor: v||'#374151' }); } },
                            { label: __('Link color',   'blockenberg'), value: a.linkColor,  onChange: function(v){ setAttr({ linkColor: v||'#2563eb' }); } },
                            { label: __('Link (hover)', 'blockenberg'), value: a.linkHoverColor, onChange: function(v){ setAttr({ linkHoverColor: v||'#1d4ed8' }); } }
                        ]
                    })
                )
            );

            /* ── Avatar image ── */
            var avatarEl;
            if (a.avatarUrl) {
                avatarEl = el(MediaUpload, {
                    onSelect: function (m) { setAttr({ avatarUrl: m.url, avatarId: m.id }); },
                    type: 'image', value: a.avatarId,
                    render: function (p) {
                        return el('img', {
                            src: a.avatarUrl, alt: a.name,
                            className: 'bkbg-ab-avatar bkbg-ab-avatar--' + a.avatarShape,
                            style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', cursor: 'pointer' },
                            onClick: p.open, title: __('Click to change avatar', 'blockenberg')
                        });
                    }
                });
            } else {
                avatarEl = el(AvatarPlaceholder, { size: a.avatarSize });
            }

            /* ── Social links ── */
            var linksEl = a.showLinks && el('div', { className: 'bkbg-ab-links' },
                links.filter(function (l) { return l.url; }).map(function (l) {
                    return el('a', {
                        key: l.id, href: '#',
                        className: 'bkbg-ab-link bkbg-ab-link--' + l.platform,
                        title: l.label || l.platform,
                        dangerouslySetInnerHTML: { __html: platformIcons[l.platform] || '' }
                    });
                }),
                links.filter(function (l) { return !l.url; }).map(function (l) {
                    return el('span', {
                        key: l.id,
                        className: 'bkbg-ab-link bkbg-ab-link--' + l.platform + ' bkbg-ab-link--empty',
                        title: (l.label || l.platform) + ' (no URL set)',
                        style: { opacity: 0.35 },
                        dangerouslySetInnerHTML: { __html: platformIcons[l.platform] || '' }
                    });
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-ab-inner' },
                        el('div', { className: 'bkbg-ab-avatar-col' }, avatarEl),
                        el('div', { className: 'bkbg-ab-content' },
                            el(TextControl, {
                                label: __('Name', 'blockenberg'),
                                value: a.name,
                                className: 'bkbg-ab-name-input',
                                onChange: function (v) { setAttr({ name: v }); }
                            }),
                            a.showRole && el(TextControl, {
                                label: __('Role', 'blockenberg'),
                                value: a.role,
                                className: 'bkbg-ab-role-input',
                                onChange: function (v) { setAttr({ role: v }); }
                            }),
                            el(RichText, {
                                tagName: 'p',
                                className: 'bkbg-ab-bio',
                                value: a.bio,
                                onChange: function (v) { setAttr({ bio: v }); },
                                placeholder: __('Author bio…', 'blockenberg'),
                                allowedFormats: ['core/bold', 'core/italic', 'core/link']
                            }),
                            linksEl
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-ab-wrap bkbg-ab-layout--' + a.layout + (a.showBorder ? ' bkbg-ab-bordered' : ''),
                style: buildWrapStyle(a)
            });

            return el('div', blockProps,
                el('div', { className: 'bkbg-ab-inner' },
                    el('div', { className: 'bkbg-ab-avatar-col' },
                        a.avatarUrl
                            ? el('img', {
                                src: a.avatarUrl, alt: a.name,
                                className: 'bkbg-ab-avatar bkbg-ab-avatar--' + a.avatarShape,
                                loading: 'lazy'
                              })
                            : el('div', { className: 'bkbg-ab-avatar-placeholder bkbg-ab-avatar--' + a.avatarShape })
                    ),
                    el('div', { className: 'bkbg-ab-content' },
                        el('h3', { className: 'bkbg-ab-name' }, a.name),
                        a.showRole && el('p', { className: 'bkbg-ab-role' }, a.role),
                        el(RichText.Content, { tagName: 'p', className: 'bkbg-ab-bio', value: a.bio }),
                        a.showLinks && el('div', { className: 'bkbg-ab-links' },
                            a.links.filter(function (l) { return l.url; }).map(function (l) {
                                return el('a', {
                                    key: l.id,
                                    href: l.platform === 'email' ? 'mailto:' + l.url : l.url,
                                    className: 'bkbg-ab-link bkbg-ab-link--' + l.platform,
                                    target: l.platform !== 'email' ? '_blank' : undefined,
                                    rel: l.platform !== 'email' ? 'noopener noreferrer' : undefined,
                                    'aria-label': l.label || l.platform
                                });
                            })
                        )
                    )
                )
            );
        }
    });
}() );
