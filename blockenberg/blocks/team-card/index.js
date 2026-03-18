( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function wrapStyle(a) {
        return {
            '--bkbg-tc-accent': a.accentColor,
            '--bkbg-tc-bg': a.bgColor,
            '--bkbg-tc-name-c': a.nameColor,
            '--bkbg-tc-role-c': a.roleColor,
            '--bkbg-tc-bio-c': a.bioColor,
            '--bkbg-tc-border': a.borderColor,
            '--bkbg-tc-icon-c': a.iconColor,
            '--bkbg-tc-skill-bg': a.skillBg,
            '--bkbg-tc-skill-c': a.skillColor,
            '--bkbg-tc-photo-sz': a.photoSize + 'px',
            '--bkbg-tc-photo-r': a.photoRadius + '%',
            '--bkbg-tc-skill-sz': a.skillSize + 'px',
            '--bkbg-tc-icon-sz': a.iconSize + 'px',
            '--bkbg-tc-radius': a.cardRadius + 'px',
            '--bkbg-tc-pad': a.cardPadding + 'px',
            '--bkbg-tc-max-w': a.maxWidth + 'px',
        };
    }

    function socialIcon(type) {
        var icons = {
            twitter: 'T', linkedin: 'in', github: '⌘', email: '✉', website: '↗'
        };
        return icons[type] || '·';
    }

    registerBlockType('blockenberg/team-card', {
        title: __('Team Card', 'blockenberg'),
        icon: 'admin-users',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var styleOptions = [
                { label: __('Card (shadow)', 'blockenberg'), value: 'card' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' },
                { label: __('Centered', 'blockenberg'), value: 'centered' },
                { label: __('Overlay', 'blockenberg'), value: 'overlay' },
            ];
            var layoutOptions = [
                { label: __('Portrait (stacked)', 'blockenberg'), value: 'portrait' },
                { label: __('Landscape (side-by-side)', 'blockenberg'), value: 'landscape' },
            ];
            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' },
            ];
            var weightOptions = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 }
            ];

            function updateSkill(i, val) {
                var ns = a.skills.slice();
                ns[i] = { label: val };
                set({ skills: ns });
            }
            function addSkill() {
                set({ skills: a.skills.concat([{ label: 'New Skill' }]) });
            }
            function removeSkill(i) {
                set({ skills: a.skills.filter(function (_, idx) { return idx !== i; }) });
            }

            var SOCIALS = ['twitter', 'linkedin', 'github', 'email', 'website'];
            var SOCIAL_LABELS = {
                twitter: 'Twitter / X', linkedin: 'LinkedIn', github: 'GitHub',
                email: 'Email', website: 'Website'
            };
            var SOCIAL_KEYS = {
                twitter: 'twitterUrl', linkedin: 'linkedinUrl', github: 'githubUrl',
                email: 'emailAddress', website: 'websiteUrl'
            };

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, wrapStyle(a));
                if (_tvf) {
                    Object.assign(s, _tvf(a.nameTypo, '--bktc-nm-'));
                    Object.assign(s, _tvf(a.roleTypo, '--bktc-rl-'));
                    Object.assign(s, _tvf(a.bioTypo, '--bktc-bi-'));
                }
                return { className: 'bkbg-tc-wrap bkbg-tc-style--' + a.style + ' bkbg-tc-layout--' + a.cardLayout + ' bkbg-tc-align--' + a.align, style: s };
            })());

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Photo', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Photo', 'blockenberg'),
                        checked: a.showPhoto,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showPhoto: v }); }
                    }),
                    a.showPhoto && el(MediaUpload, {
                        onSelect: function (m) { set({ photoUrl: m.url, photoId: m.id }); },
                        allowedTypes: ['image'],
                        value: a.photoId,
                        render: function (p) {
                            return el('div', {},
                                a.photoUrl && el('img', {
                                    src: a.photoUrl,
                                    style: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px', display: 'block' }
                                }),
                                el(Button, {
                                    onClick: p.open,
                                    variant: 'secondary',
                                    style: { marginBottom: '4px' }
                                }, a.photoUrl ? __('Change Photo', 'blockenberg') : __('Upload Photo', 'blockenberg')),
                                a.photoUrl && el(Button, {
                                    onClick: function () { set({ photoUrl: '', photoId: 0 }); },
                                    variant: 'tertiary',
                                    isDestructive: true
                                }, __('Remove', 'blockenberg'))
                            );
                        }
                    }),
                    a.showPhoto && el(RangeControl, {
                        label: __('Photo Size (px)', 'blockenberg'),
                        value: a.photoSize,
                        onChange: function (v) { set({ photoSize: v }); },
                        min: 60,
                        max: 280
                    }),
                    a.showPhoto && el(RangeControl, {
                        label: __('Photo Border Radius (%)', 'blockenberg'),
                        value: a.photoRadius,
                        onChange: function (v) { set({ photoRadius: v }); },
                        min: 0,
                        max: 50
                    })
                ),
                el(PanelBody, { title: __('Bio & Skills', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Name', 'blockenberg'),
                        value: a.name,
                        onChange: function (v) { set({ name: v }); }
                    }),
                    el(TextControl, {
                        label: __('Role / Title', 'blockenberg'),
                        value: a.role,
                        onChange: function (v) { set({ role: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Skills Tags', 'blockenberg'),
                        checked: a.showSkills,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSkills: v }); }
                    }),
                    a.showSkills && a.skills.map(function (skill, i) {
                        return el('div', { key: i, style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' } },
                            el(TextControl, {
                                value: skill.label,
                                onChange: function (v) { updateSkill(i, v); },
                                hideLabelFromVision: true,
                                label: 'Skill ' + (i + 1)
                            }),
                            el(Button, {
                                onClick: function () { removeSkill(i); },
                                variant: 'tertiary',
                                isDestructive: true,
                                isSmall: true
                            }, '✕')
                        );
                    }),
                    a.showSkills && el(Button, {
                        onClick: addSkill,
                        variant: 'secondary',
                        isSmall: true
                    }, __('+ Add Skill', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Social Links', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Social Links', 'blockenberg'),
                        checked: a.showSocials,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSocials: v }); }
                    }),
                    a.showSocials && SOCIALS.map(function (type) {
                        var key = SOCIAL_KEYS[type];
                        return el(TextControl, {
                            key: type,
                            label: SOCIAL_LABELS[type],
                            value: a[key] || '',
                            onChange: function (v) {
                                var upd = {};
                                upd[key] = v;
                                set(upd);
                            },
                            placeholder: type === 'email' ? 'hello@example.com' : 'https://'
                        });
                    })
                ),
                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.cardLayout,
                        options: layoutOptions,
                        onChange: function (v) { set({ cardLayout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Card Alignment', 'blockenberg'),
                        value: a.align,
                        options: alignOptions,
                        onChange: function (v) { set({ align: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        onChange: function (v) { set({ maxWidth: v }); },
                        min: 240,
                        max: 720
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.cardRadius,
                        onChange: function (v) { set({ cardRadius: v }); },
                        min: 0,
                        max: 40
                    }),
                    el(RangeControl, {
                        label: __('Card Padding (px)', 'blockenberg'),
                        value: a.cardPadding,
                        onChange: function (v) { set({ cardPadding: v }); },
                        min: 12,
                        max: 64
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { set({ nameTypo: v }); } }),
                    getTypoControl()({ label: __('Role', 'blockenberg'), value: a.roleTypo, onChange: function (v) { set({ roleTypo: v }); } }),
                    getTypoControl()({ label: __('Bio', 'blockenberg'), value: a.bioTypo, onChange: function (v) { set({ bioTypo: v }); } }),
                    el(RangeControl, {
                        label: __('Skill Tag Size (px)', 'blockenberg'),
                        value: a.skillSize,
                        onChange: function (v) { set({ skillSize: v }); },
                        min: 10,
                        max: 16
                    }),
                    el(RangeControl, {
                        label: __('Social Icon Size (px)', 'blockenberg'),
                        value: a.iconSize,
                        onChange: function (v) { set({ iconSize: v }); },
                        min: 12,
                        max: 28
                    })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Accent / Role Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); } },
                        { label: __('Name Color', 'blockenberg'), value: a.nameColor, onChange: function (v) { set({ nameColor: v || '#0f172a' }); } },
                        { label: __('Role Color', 'blockenberg'), value: a.roleColor, onChange: function (v) { set({ roleColor: v || '#6c3fb5' }); } },
                        { label: __('Bio Color', 'blockenberg'), value: a.bioColor, onChange: function (v) { set({ bioColor: v || '#475569' }); } },
                        { label: __('Border Color', 'blockenberg'), value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Social Icon Color', 'blockenberg'), value: a.iconColor, onChange: function (v) { set({ iconColor: v || '#64748b' }); } },
                        { label: __('Skill Tag Background', 'blockenberg'), value: a.skillBg, onChange: function (v) { set({ skillBg: v || '#f1f5f9' }); } },
                        { label: __('Skill Tag Text', 'blockenberg'), value: a.skillColor, onChange: function (v) { set({ skillColor: v || '#334155' }); } },
                    ]
                })
            );

            function renderCard() {
                var SOCIALS_DEF = [
                    { type: 'twitter', key: 'twitterUrl', label: 'X' },
                    { type: 'linkedin', key: 'linkedinUrl', label: 'in' },
                    { type: 'github', key: 'githubUrl', label: '⌘' },
                    { type: 'email', key: 'emailAddress', label: '✉' },
                    { type: 'website', key: 'websiteUrl', label: '↗' },
                ];
                var activeSocials = SOCIALS_DEF.filter(function (s) { return a[s.key]; });

                return el('div', { className: 'bkbg-tc-card' },
                    a.showPhoto && el('div', { className: 'bkbg-tc-photo-wrap' },
                        a.photoUrl
                            ? el('img', { className: 'bkbg-tc-photo', src: a.photoUrl, alt: a.name })
                            : el('div', { className: 'bkbg-tc-photo bkbg-tc-photo--placeholder' },
                                el('span', { className: 'dashicons dashicons-admin-users' })
                            )
                    ),
                    el('div', { className: 'bkbg-tc-body' },
                        el('div', { className: 'bkbg-tc-name-row' },
                            el('span', { className: 'bkbg-tc-name' }, a.name),
                        ),
                        el('span', { className: 'bkbg-tc-role' }, a.role),
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-tc-bio',
                            value: a.bio,
                            onChange: function (v) { set({ bio: v }); },
                            placeholder: __('Enter bio…', 'blockenberg'),
                            allowedFormats: ['core/bold', 'core/italic', 'core/link']
                        }),
                        a.showSkills && a.skills.length > 0 && el('div', { className: 'bkbg-tc-skills' },
                            a.skills.map(function (s, i) {
                                return el('span', { key: i, className: 'bkbg-tc-skill' }, s.label);
                            })
                        ),
                        a.showSocials && activeSocials.length > 0 && el('div', { className: 'bkbg-tc-socials' },
                            activeSocials.map(function (s) {
                                return el('span', { key: s.type, className: 'bkbg-tc-social bkbg-tc-social--' + s.type, title: s.label },
                                    el('span', { className: 'bkbg-tc-social-icon' }, s.label)
                                );
                            })
                        )
                    )
                );
            }

            return el('div', {},
                inspector,
                el('div', blockProps, renderCard())
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = (function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, wrapStyle(a));
                if (_tvf) {
                    Object.assign(s, _tvf(a.nameTypo, '--bktc-nm-'));
                    Object.assign(s, _tvf(a.roleTypo, '--bktc-rl-'));
                    Object.assign(s, _tvf(a.bioTypo, '--bktc-bi-'));
                }
                return useBlockProps.save({ className: 'bkbg-tc-wrap bkbg-tc-style--' + a.style + ' bkbg-tc-layout--' + a.cardLayout + ' bkbg-tc-align--' + a.align, style: s });
            })();

            var SOCIALS_DEF = [
                { type: 'twitter', key: 'twitterUrl', href: true, label: 'X', title: 'Twitter' },
                { type: 'linkedin', key: 'linkedinUrl', href: true, label: 'in', title: 'LinkedIn' },
                { type: 'github', key: 'githubUrl', href: true, label: '⌘', title: 'GitHub' },
                { type: 'email', key: 'emailAddress', email: true, label: '✉', title: 'Email' },
                { type: 'website', key: 'websiteUrl', href: true, label: '↗', title: 'Website' },
            ];
            var activeSocials = SOCIALS_DEF.filter(function (s) { return a[s.key]; });

            return el('div', blockProps,
                el('div', { className: 'bkbg-tc-card' },
                    a.showPhoto && el('div', { className: 'bkbg-tc-photo-wrap' },
                        a.photoUrl
                            ? el('img', { className: 'bkbg-tc-photo', src: a.photoUrl, alt: a.name })
                            : el('div', { className: 'bkbg-tc-photo bkbg-tc-photo--placeholder' },
                                el('span', { className: 'dashicons dashicons-admin-users' })
                            )
                    ),
                    el('div', { className: 'bkbg-tc-body' },
                        el('div', { className: 'bkbg-tc-name-row' },
                            el('span', { className: 'bkbg-tc-name' }, a.name)
                        ),
                        el('span', { className: 'bkbg-tc-role' }, a.role),
                        el(RichText.Content, { tagName: 'p', className: 'bkbg-tc-bio', value: a.bio }),
                        a.showSkills && a.skills.length > 0 && el('div', { className: 'bkbg-tc-skills' },
                            a.skills.map(function (s, i) {
                                return el('span', { key: i, className: 'bkbg-tc-skill' }, s.label);
                            })
                        ),
                        a.showSocials && activeSocials.length > 0 && el('div', { className: 'bkbg-tc-socials' },
                            activeSocials.map(function (s) {
                                var href = s.email ? 'mailto:' + a[s.key] : a[s.key];
                                return el('a', {
                                    key: s.type,
                                    className: 'bkbg-tc-social bkbg-tc-social--' + s.type,
                                    href: href,
                                    title: s.title,
                                    target: s.href ? '_blank' : undefined,
                                    rel: s.href ? 'noopener noreferrer' : undefined
                                }, el('span', { className: 'bkbg-tc-social-icon' }, s.label));
                            })
                        )
                    )
                )
            );
        }
    });
}() );
