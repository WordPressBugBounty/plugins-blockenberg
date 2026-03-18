( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;

    var registerBlockType = wp.blocks.registerBlockType;

    var InspectorControls = wp.blockEditor.InspectorControls;
    var BlockControls = wp.blockEditor.BlockControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;

    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var ToolbarGroup = wp.components.ToolbarGroup;
    var ToolbarButton = wp.components.ToolbarButton;
    var TextControl = wp.components.TextControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var SOCIAL_TYPES = [
        { value: 'website', label: __('Website', 'blockenberg'), icon: 'admin-site' },
        { value: 'email', label: __('Email', 'blockenberg'), icon: 'email' },
        { value: 'phone', label: __('Phone', 'blockenberg'), icon: 'phone' },
        { value: 'facebook', label: __('Facebook', 'blockenberg'), icon: 'facebook' },
        { value: 'twitter', label: __('X (Twitter)', 'blockenberg'), icon: null },
        { value: 'instagram', label: __('Instagram', 'blockenberg'), icon: 'instagram' },
        { value: 'linkedin', label: __('LinkedIn', 'blockenberg'), icon: 'linkedin' },
        { value: 'github', label: __('GitHub', 'blockenberg'), icon: null }
    ];

    function clone(obj) {
        var out = {};
        for (var k in obj) out[k] = obj[k];
        return out;
    }

    function getPhotoRadius(shape, radiusPx) {
        if (shape === 'circle') return '999px';
        if (shape === 'square') return '0px';
        // rounded
        return (radiusPx || 12) + 'px';
    }

    function getSocialIcon(type) {
        var found = SOCIAL_TYPES.filter(function (t) { return t.value === type; })[0];
        return found ? found.icon : 'admin-site';
    }

    function renderSocialIcon(type) {
        // X (Twitter)
        if (type === 'twitter') {
            return el('svg', {
                viewBox: '0 0 24 24',
                width: '24',
                height: '24',
                'aria-hidden': 'true',
                focusable: 'false'
            },
                // Simplified X mark
                el('path', {
                    d: 'M18.3 2H21l-6.6 7.6L22 22h-6.2l-4.8-6.3L5.5 22H3l7.1-8.2L2 2h6.3l4.3 5.7L18.3 2Zm-1.1 18h1.4L7 3.9H5.5L17.2 20Z'
                })
            );
        }

        // GitHub (octocat)
        if (type === 'github') {
            return el('svg', {
                viewBox: '0 0 24 24',
                width: '24',
                height: '24',
                'aria-hidden': 'true',
                focusable: 'false'
            },
                el('path', {
                    d: 'M12 .5C5.65.5.5 5.82.5 12.39c0 5.24 3.44 9.68 8.2 11.25.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.07-3.34.75-4.04-1.66-4.04-1.66-.55-1.43-1.33-1.81-1.33-1.81-1.08-.76.08-.74.08-.74 1.2.09 1.83 1.26 1.83 1.26 1.06 1.87 2.78 1.33 3.46 1.01.11-.79.42-1.33.76-1.63-2.66-.31-5.46-1.38-5.46-6.14 0-1.36.47-2.47 1.24-3.34-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.28a11.1 11.1 0 0 1 3.01-.42c1.02.01 2.05.14 3.01.42 2.28-1.61 3.29-1.28 3.29-1.28.66 1.69.24 2.94.12 3.25.77.87 1.24 1.98 1.24 3.34 0 4.78-2.8 5.83-5.48 6.14.43.38.82 1.13.82 2.29 0 1.65-.02 2.98-.02 3.39 0 .32.22.7.83.58 4.76-1.57 8.2-6.01 8.2-11.25C23.5 5.82 18.35.5 12 .5Z'
                })
            );
        }

        var dash = getSocialIcon(type) || 'admin-site';
        return el('span', { className: 'dashicons dashicons-' + dash });
    }

    function normalizeUrl(type, url) {
        if (!url) return '';
        var v = String(url).trim();
        if (!v) return '';

        if (type === 'email') {
            if (v.indexOf('mailto:') === 0) return v;
            return 'mailto:' + v;
        }
        if (type === 'phone') {
            if (v.indexOf('tel:') === 0) return v;
            return 'tel:' + v;
        }
        if (v.charAt(0) === '#') return v;
        // If it already has a scheme (http:, https:, etc), keep it.
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) return v;
        return 'https://' + v;
    }

    function openMedia(onSelect) {
        if (!wp || !wp.media) return;
        var frame = wp.media({
            title: __('Select Image', 'blockenberg'),
            button: { text: __('Use image', 'blockenberg') },
            multiple: false
        });

        frame.on('select', function () {
            var attachment = frame.state().get('selection').first().toJSON();
            onSelect(attachment);
        });

        frame.open();
    }

    registerBlockType('blockenberg/team-members', {
        title: __('Team Members', 'blockenberg'),
        icon: 'groups',
        category: 'bkbg-business',
        description: __('Show your team members with photos, roles, bios, and social links.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var isSelected = props.isSelected;
            var a = attributes;

            var activeState = useState(0);
            var activeIndex = activeState[0];
            var setActiveIndex = activeState[1];

            function setMembers(members) {
                setAttributes({ members: members });
            }

            function updateMember(index, field, value) {
                var next = a.members.map(function (m, i) {
                    if (i !== index) return m;
                    var nm = clone(m);
                    nm[field] = value;
                    return nm;
                });
                setMembers(next);
            }

            function updateMemberImage(index, image) {
                var img = {
                    id: image && image.id ? image.id : 0,
                    url: image && image.url ? image.url : '',
                    alt: image && image.alt ? image.alt : ''
                };
                updateMember(index, 'image', img);
            }

            function addMember() {
                var next = a.members.concat([
                    {
                        name: __('New Member', 'blockenberg'),
                        role: __('Role', 'blockenberg'),
                        bio: __('Write a short bio. Click to edit.', 'blockenberg'),
                        image: { id: 0, url: '', alt: '' },
                        socials: [
                            { type: 'linkedin', url: '' },
                            { type: 'website', url: '' }
                        ]
                    }
                ]);
                setMembers(next);
                setActiveIndex(next.length - 1);
            }

            function removeMember(index) {
                if (a.members.length <= 1) return;
                var next = a.members.filter(function (_, i) { return i !== index; });
                setMembers(next);
                setActiveIndex(Math.max(0, Math.min(activeIndex, next.length - 1)));
            }

            function duplicateMember(index) {
                var next = a.members.slice();
                var copy = clone(a.members[index]);
                copy.image = clone(copy.image || { id: 0, url: '', alt: '' });
                copy.socials = (copy.socials || []).map(function (s) { return clone(s); });
                next.splice(index + 1, 0, copy);
                setMembers(next);
                setActiveIndex(index + 1);
            }

            function moveMember(index, dir) {
                var ni = index + dir;
                if (ni < 0 || ni >= a.members.length) return;
                var next = a.members.slice();
                var tmp = next[index];
                next[index] = next[ni];
                next[ni] = tmp;
                setMembers(next);
                setActiveIndex(ni);
            }

            function updateSocial(memberIndex, socialIndex, field, value) {
                var next = a.members.map(function (m, i) {
                    if (i !== memberIndex) return m;
                    var nm = clone(m);
                    var socials = (nm.socials || []).slice();
                    var s = clone(socials[socialIndex] || { type: 'website', url: '' });
                    s[field] = value;
                    socials[socialIndex] = s;
                    nm.socials = socials;
                    return nm;
                });
                setMembers(next);
            }

            function addSocial(memberIndex) {
                var next = a.members.map(function (m, i) {
                    if (i !== memberIndex) return m;
                    var nm = clone(m);
                    var socials = (nm.socials || []).slice();
                    socials.push({ type: 'website', url: '' });
                    nm.socials = socials;
                    return nm;
                });
                setMembers(next);
            }

            function removeSocial(memberIndex, socialIndex) {
                var next = a.members.map(function (m, i) {
                    if (i !== memberIndex) return m;
                    var nm = clone(m);
                    var socials = (nm.socials || []).filter(function (_, si) { return si !== socialIndex; });
                    nm.socials = socials;
                    return nm;
                });
                setMembers(next);
            }

            var fontWeightOptions = [
                { label: '300', value: 300 },
                { label: '400', value: 400 },
                { label: '500', value: 500 },
                { label: '600', value: 600 },
                { label: '700', value: 700 },
                { label: '800', value: 800 }
            ];

            var columnsOptions = [
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
                { label: '4', value: 4 }
            ];

            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right', 'blockenberg'), value: 'right' }
            ];

            var imageShapeOptions = [
                { label: __('Circle', 'blockenberg'), value: 'circle' },
                { label: __('Rounded', 'blockenberg'), value: 'rounded' },
                { label: __('Square', 'blockenberg'), value: 'square' }
            ];

            var activeMember = a.members[activeIndex] || a.members[0];

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Layout Style', 'blockenberg'),
                        value: a.layoutStyle,
                        options: [
                            { label: __('Cards (Grid)', 'blockenberg'), value: 'cards' },
                            { label: __('Carousel', 'blockenberg'), value: 'carousel' }
                        ],
                        onChange: function (v) { setAttributes({ layoutStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: a.layoutStyle === 'carousel' ? __('Visible Cards', 'blockenberg') : __('Columns', 'blockenberg'),
                        value: a.columns,
                        options: columnsOptions,
                        onChange: function (v) { setAttributes({ columns: parseInt(v, 10) }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap', 'blockenberg'),
                        value: a.gap,
                        min: 8,
                        max: 60,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Show Carousel Navigation', 'blockenberg'),
                        checked: a.carouselNav,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ carouselNav: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(SelectControl, {
                        label: __('Arrow Style', 'blockenberg'),
                        value: a.carouselNavStyle,
                        options: [
                            { label: __('Top Right', 'blockenberg'), value: 'top' },
                            { label: __('Overlay Sides', 'blockenberg'), value: 'overlay' },
                            { label: __('Bottom Center', 'blockenberg'), value: 'bottom' }
                        ],
                        onChange: function (v) { setAttributes({ carouselNavStyle: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Peek Next Card', 'blockenberg'),
                        checked: a.carouselPeek,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ carouselPeek: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(SelectControl, {
                        label: __('Indicators', 'blockenberg'),
                        value: a.carouselIndicators,
                        options: [
                            { label: __('None', 'blockenberg'), value: 'none' },
                            { label: __('Dots', 'blockenberg'), value: 'dots' },
                            { label: __('Progress Bar', 'blockenberg'), value: 'progress' },
                            { label: __('Fraction (1/6)', 'blockenberg'), value: 'fraction' }
                        ],
                        onChange: function (v) { setAttributes({ carouselIndicators: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'dots' && el(SelectControl, {
                        label: __('Dots Style', 'blockenberg'),
                        value: a.carouselDotsStyle,
                        options: [
                            { label: __('Dots', 'blockenberg'), value: 'default' },
                            { label: __('Active Pill', 'blockenberg'), value: 'pill' }
                        ],
                        onChange: function (v) { setAttributes({ carouselDotsStyle: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'dots' && el(RangeControl, {
                        label: __('Dot Size', 'blockenberg'),
                        value: a.carouselIndicatorSize,
                        min: 6,
                        max: 16,
                        onChange: function (v) { setAttributes({ carouselIndicatorSize: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'progress' && el(SelectControl, {
                        label: __('Progress Style', 'blockenberg'),
                        value: a.carouselProgressStyle,
                        options: [
                            { label: __('Contained', 'blockenberg'), value: 'default' },
                            { label: __('Edge-to-edge', 'blockenberg'), value: 'edge' }
                        ],
                        onChange: function (v) { setAttributes({ carouselProgressStyle: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'progress' && el(RangeControl, {
                        label: __('Progress Height', 'blockenberg'),
                        value: a.carouselProgressHeight,
                        min: 2,
                        max: 14,
                        onChange: function (v) { setAttributes({ carouselProgressHeight: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators !== 'none' && el(SelectControl, {
                        label: __('Indicators Position', 'blockenberg'),
                        value: a.carouselIndicatorsPosition,
                        options: [
                            { label: __('Below', 'blockenberg'), value: 'below' },
                            { label: __('Above', 'blockenberg'), value: 'top' }
                        ],
                        onChange: function (v) { setAttributes({ carouselIndicatorsPosition: v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Infinite Loop', 'blockenberg'),
                        checked: a.infiniteScroll !== false,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ infiniteScroll: !!v }); }
                    }),
                    a.layoutStyle === 'carousel' && el(ToggleControl, {
                        label: __('Auto-scroll (continuous)', 'blockenberg'),
                        help: __('Runs on the live site (frontend). Please check it there.', 'blockenberg'),
                        checked: !!a.autoScroll,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ autoScroll: !!v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.autoScroll && el(RangeControl, {
                        label: __('Auto-scroll speed (px/sec)', 'blockenberg'),
                        value: a.autoScrollSpeed || 40,
                        min: 5,
                        max: 200,
                        step: 1,
                        onChange: function (v) { setAttributes({ autoScrollSpeed: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.autoScroll && el(ToggleControl, {
                        label: __('Pause on hover', 'blockenberg'),
                        checked: a.autoScrollPauseOnHover !== false,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ autoScrollPauseOnHover: !!v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Align', 'blockenberg'),
                        value: a.textAlign,
                        options: alignOptions,
                        onChange: function (v) { setAttributes({ textAlign: v }); }
                    })
                ),

                el(PanelBody, { title: __('Card', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Padding', 'blockenberg'),
                        value: a.cardPadding,
                        min: 8,
                        max: 60,
                        onChange: function (v) { setAttributes({ cardPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.cardRadius,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ cardRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width', 'blockenberg'),
                        value: a.cardBorderWidth,
                        min: 0,
                        max: 6,
                        onChange: function (v) { setAttributes({ cardBorderWidth: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Shadow', 'blockenberg'),
                        checked: a.cardShadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ cardShadow: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Hover Lift', 'blockenberg'),
                        checked: a.hoverLift,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ hoverLift: v }); }
                    }),
                    a.hoverLift && el(RangeControl, {
                        label: __('Lift Amount', 'blockenberg'),
                        value: a.hoverLiftAmount,
                        min: 0,
                        max: 20,
                        onChange: function (v) { setAttributes({ hoverLiftAmount: v }); }
                    })
                ),

                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Shape', 'blockenberg'),
                        value: a.imageShape,
                        options: imageShapeOptions,
                        onChange: function (v) { setAttributes({ imageShape: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Size', 'blockenberg'),
                        value: a.imageSize,
                        min: 40,
                        max: 200,
                        onChange: function (v) { setAttributes({ imageSize: v }); }
                    })
                ),

                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Role', 'blockenberg'),
                        checked: a.showRole,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showRole: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Bio', 'blockenberg'),
                        checked: a.showBio,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showBio: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Social Links', 'blockenberg'),
                        checked: a.showSocials,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showSocials: v }); }
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { setAttributes({ nameTypo: v }); } }),
                    getTypoControl()({ label: __('Role', 'blockenberg'), value: a.roleTypo, onChange: function (v) { setAttributes({ roleTypo: v }); } }),
                    getTypoControl()({ label: __('Bio', 'blockenberg'), value: a.bioTypo, onChange: function (v) { setAttributes({ bioTypo: v }); } }),
                    el(RangeControl, {
                        label: __('Social Icon Size', 'blockenberg'),
                        value: a.socialSize,
                        min: 12,
                        max: 30,
                        onChange: function (v) { setAttributes({ socialSize: v }); }
                    }),
                    a.layoutStyle === 'carousel' && a.carouselIndicators === 'fraction' && el(RangeControl, {
                                            label: __('Fraction Text Size', 'blockenberg'),
                                            value: a.carouselFractionSize,
                                            min: 10,
                                            max: 18,
                                            onChange: function (v) { setAttributes({ carouselFractionSize: v }); }
                                        })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.cardBg, onChange: function (c) { setAttributes({ cardBg: c }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.cardBorderColor, onChange: function (c) { setAttributes({ cardBorderColor: c }); }, label: __('Card Border', 'blockenberg') },
                        { value: a.nameColor, onChange: function (c) { setAttributes({ nameColor: c }); }, label: __('Name', 'blockenberg') },
                        { value: a.roleColor, onChange: function (c) { setAttributes({ roleColor: c }); }, label: __('Role', 'blockenberg') },
                        { value: a.bioColor, onChange: function (c) { setAttributes({ bioColor: c }); }, label: __('Bio', 'blockenberg') },
                        { value: a.socialColor, onChange: function (c) { setAttributes({ socialColor: c }); }, label: __('Social', 'blockenberg') },
                        { value: a.socialHoverColor, onChange: function (c) { setAttributes({ socialHoverColor: c }); }, label: __('Social Hover', 'blockenberg') },

                        { value: a.carouselIndicatorColor, onChange: function (c) { setAttributes({ carouselIndicatorColor: c }); }, label: __('Carousel Indicator', 'blockenberg') },
                        { value: a.carouselIndicatorActiveColor, onChange: function (c) { setAttributes({ carouselIndicatorActiveColor: c }); }, label: __('Carousel Indicator (Active)', 'blockenberg') },
                        { value: a.carouselProgressBg, onChange: function (c) { setAttributes({ carouselProgressBg: c }); }, label: __('Carousel Progress (Track)', 'blockenberg') },
                        { value: a.carouselProgressFg, onChange: function (c) { setAttributes({ carouselProgressFg: c }); }, label: __('Carousel Progress (Fill)', 'blockenberg') },
                        { value: a.carouselFractionColor, onChange: function (c) { setAttributes({ carouselFractionColor: c }); }, label: __('Carousel Fraction', 'blockenberg') }
                    ]
                }),

                el(PanelBody, { title: __('Selected Member', 'blockenberg'), initialOpen: false },
                    activeMember ? el('div', {},
                        el('div', { style: { marginBottom: '10px', fontWeight: 600 } }, __('Member', 'blockenberg') + ': ' + (activeIndex + 1)),
                        el(Button, {
                            isSecondary: true,
                            onClick: function () {
                                openMedia(function (att) {
                                    updateMemberImage(activeIndex, { id: att.id, url: att.url, alt: att.alt || '' });
                                });
                            }
                        }, activeMember.image && activeMember.image.url ? __('Change Photo', 'blockenberg') : __('Select Photo', 'blockenberg')),
                        activeMember.image && activeMember.image.url && el(Button, {
                            isLink: true,
                            isDestructive: true,
                            onClick: function () { updateMemberImage(activeIndex, { id: 0, url: '', alt: '' }); }
                        }, __('Remove Photo', 'blockenberg')),

                        el('hr', { style: { margin: '14px 0' } }),

                        el('div', { style: { marginBottom: '8px', fontWeight: 600 } }, __('Social Links', 'blockenberg')),
                        (activeMember.socials || []).map(function (s, si) {
                            return el('div', { key: si, style: { marginBottom: '10px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' } },
                                el(SelectControl, {
                                    label: __('Type', 'blockenberg'),
                                    value: s.type,
                                    options: SOCIAL_TYPES.map(function (t) { return { label: t.label, value: t.value }; }),
                                    onChange: function (v) { updateSocial(activeIndex, si, 'type', v); }
                                }),
                                el(TextControl, {
                                    label: __('URL', 'blockenberg'),
                                    value: s.url,
                                    onChange: function (v) { updateSocial(activeIndex, si, 'url', v); }
                                }),
                                el(Button, {
                                    isDestructive: true,
                                    isSecondary: true,
                                    onClick: function () { removeSocial(activeIndex, si); }
                                }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, {
                            isPrimary: true,
                            onClick: function () { addSocial(activeIndex); }
                        }, __('+ Add Social Link', 'blockenberg'))
                    ) : el('div', {}, __('Select a card to edit its member settings.', 'blockenberg'))
                )
            );

            var blockControls = el(BlockControls, {},
                el(ToolbarGroup, {},
                    el(ToolbarButton, {
                        icon: 'plus',
                        label: __('Add Member', 'blockenberg'),
                        onClick: addMember
                    })
                )
            );

            var styleVars = {
                '--bkbg-tm-columns': String(a.columns),
                '--bkbg-tm-gap': a.gap + 'px',
                '--bkbg-tm-carousel-peek': a.carouselPeek ? '20%' : '0px',
                '--bkbg-tm-card-bg': a.cardBg,
                '--bkbg-tm-card-border-color': a.cardBorderColor,
                '--bkbg-tm-card-border-width': a.cardBorderWidth + 'px',
                '--bkbg-tm-card-radius': a.cardRadius + 'px',
                '--bkbg-tm-card-padding': a.cardPadding + 'px',
                '--bkbg-tm-text-align': a.textAlign,
                '--bkbg-tm-photo-size': a.imageSize + 'px',
                '--bkbg-tm-photo-radius': getPhotoRadius(a.imageShape, 12),
                '--bkbg-tm-name-color': a.nameColor,
                '--bkbg-tm-role-color': a.roleColor,
                '--bkbg-tm-bio-color': a.bioColor,
                '--bkbg-tm-name-size': a.nameSize + 'px',
                '--bkbg-tm-role-size': a.roleSize + 'px',
                '--bkbg-tm-bio-size': a.bioSize + 'px',
                '--bkbg-tm-name-weight': String(a.nameWeight),
                '--bkbg-tm-role-weight': String(a.roleWeight),
                '--bkbg-tm-social-color': a.socialColor,
                '--bkbg-tm-social-hover': a.socialHoverColor,
                '--bkbg-tm-social-size': a.socialSize + 'px',
                '--bkbg-tm-hover-lift': a.hoverLiftAmount + 'px',

                '--bkbg-tm-indicator-size': (a.carouselIndicatorSize || 8) + 'px',
                '--bkbg-tm-indicator-color': a.carouselIndicatorColor,
                '--bkbg-tm-indicator-active-color': a.carouselIndicatorActiveColor,
                '--bkbg-tm-progress-height': (a.carouselProgressHeight || 6) + 'px',
                '--bkbg-tm-progress-bg': a.carouselProgressBg,
                '--bkbg-tm-progress-fg': a.carouselProgressFg,
                '--bkbg-tm-fraction-color': a.carouselFractionColor,
                '--bkbg-tm-fraction-size': (a.carouselFractionSize || 13) + 'px'
            };

            var classes = [
                'bkbg-tm-wrap',
                'bkbg-tm-align-' + a.textAlign
            ];
            if (a.hoverLift) classes.push('bkbg-tm-hover-lift');
            if (a.layoutStyle === 'carousel') {
                classes.push('bkbg-tm-nav-' + (a.carouselNavStyle || 'top'));
                classes.push('bkbg-tm-indicators-' + (a.carouselIndicators || 'none'));
                classes.push('bkbg-tm-indicators-pos-' + (a.carouselIndicatorsPosition || 'below'));

                if (a.carouselIndicators === 'dots') {
                    classes.push('bkbg-tm-dots-style-' + (a.carouselDotsStyle || 'default'));
                }
                if (a.carouselIndicators === 'progress') {
                    classes.push('bkbg-tm-progress-style-' + (a.carouselProgressStyle || 'default'));
                }
            }

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, styleVars);
                if (_tvf) {
                    Object.assign(s, _tvf(a.nameTypo, '--bktm-nm-'));
                    Object.assign(s, _tvf(a.roleTypo, '--bktm-rl-'));
                    Object.assign(s, _tvf(a.bioTypo, '--bktm-bi-'));
                }
                return { className: 'bkbg-editor-wrap ' + classes.join(' '), style: s, 'data-block-label': 'Team' };
            })());

            var trackRef = useRef(null);

            var activeSlideState = useState(0);
            var activeSlide = activeSlideState[0];
            var setActiveSlide = activeSlideState[1];

            var progressState = useState(0);
            var progressPct = progressState[0];
            var setProgressPct = progressState[1];

            function getSlides() {
                if (!trackRef.current) return [];
                return trackRef.current.querySelectorAll('.bkbg-tm-slide');
            }

            function scrollToIndex(i) {
                if (!trackRef.current) return;
                var slides = getSlides();
                if (!slides.length) return;
                var idx = Math.max(0, Math.min(slides.length - 1, i));
                slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
            }

            function scrollCarousel(dir) {
                if (!trackRef.current) return;
                var track = trackRef.current;
                var slides = getSlides();
                if (!slides.length) return;

                var trackRect = track.getBoundingClientRect();
                var currentIndex = 0;
                for (var i = 0; i < slides.length; i++) {
                    var r = slides[i].getBoundingClientRect();
                    if (r.left >= trackRect.left - 10) {
                        currentIndex = i;
                        break;
                    }
                }

                scrollToIndex(currentIndex + dir);
            }

            useEffect(function () {
                if (!trackRef.current) return;
                var track = trackRef.current;

                function getScrollPct() {
                    var max = track.scrollWidth - track.clientWidth;
                    if (max <= 0) return 0;
                    var pct = (track.scrollLeft / max) * 100;
                    if (pct < 0) pct = 0;
                    if (pct > 100) pct = 100;
                    return pct;
                }

                function updateActiveFromScroll() {
                    var slides = getSlides();
                    if (!slides.length) return;
                    var trackRect = track.getBoundingClientRect();
                    var idx = 0;
                    for (var i = 0; i < slides.length; i++) {
                        var r = slides[i].getBoundingClientRect();
                        if (r.left >= trackRect.left - 10) {
                            idx = i;
                            break;
                        }
                    }
                    setActiveSlide(idx);

                    // Smooth progress update
                    setProgressPct(getScrollPct());
                }

                updateActiveFromScroll();
                track.addEventListener('scroll', updateActiveFromScroll, { passive: true });
                return function () {
                    track.removeEventListener('scroll', updateActiveFromScroll);
                };
            }, [a.layoutStyle, a.members.length]);

            function renderIndicators() {
                if (a.carouselIndicators === 'none') return null;
                if (a.carouselIndicators === 'progress') {
                    return el('div', { className: 'bkbg-tm-indicators' },
                        el('div', { className: 'bkbg-tm-progress' },
                            el('div', { className: 'bkbg-tm-progress-bar', style: { width: progressPct + '%' } })
                        )
                    );
                }

                if (a.carouselIndicators === 'fraction') {
                    var total = Math.max(1, (a.members || []).length);
                    return el('div', { className: 'bkbg-tm-indicators' },
                        el('div', { className: 'bkbg-tm-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                            el('span', { className: 'bkbg-tm-fraction-current' }, String(activeSlide + 1)),
                            el('span', { 'aria-hidden': 'true' }, '/'),
                            el('span', { className: 'bkbg-tm-fraction-total' }, String(total))
                        )
                    );
                }

                return el('div', { className: 'bkbg-tm-indicators' },
                    el('div', { className: 'bkbg-tm-dots', role: 'tablist', 'aria-label': __('Team Members Carousel', 'blockenberg') },
                        (a.members || []).map(function (_, i) {
                            return el('button', {
                                key: i,
                                type: 'button',
                                className: 'bkbg-tm-dot' + (i === activeSlide ? ' is-active' : ''),
                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1),
                                onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollToIndex(i); }
                            });
                        })
                    )
                );
            }

            function renderPhoto(member, index) {
                var hasImg = member.image && member.image.url;
                if (hasImg) {
                    return el('div', {
                        className: 'bkbg-tm-photo',
                        onClick: function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveIndex(index);
                            openMedia(function (att) {
                                updateMemberImage(index, { id: att.id, url: att.url, alt: att.alt || '' });
                            });
                        },
                        title: __('Click to change photo', 'blockenberg')
                    },
                        el('img', { src: member.image.url, alt: member.image.alt || '' })
                    );
                }

                return el('div', {
                    className: 'bkbg-tm-photo',
                    onClick: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveIndex(index);
                        openMedia(function (att) {
                            updateMemberImage(index, { id: att.id, url: att.url, alt: att.alt || '' });
                        });
                    }
                },
                    el('div', { className: 'bkbg-tm-photo-placeholder' },
                        el('span', { className: 'dashicons dashicons-format-image' }),
                        el('div', {}, __('Add Photo', 'blockenberg'))
                    )
                );
            }

            function renderSocials(member) {
                if (!a.showSocials) return null;
                var socials = (member.socials || []).filter(function (s) { return s && s.url; });
                if (!socials.length) return null;

                return el('div', { className: 'bkbg-tm-socials' },
                    socials.map(function (s, si) {
                        var href = normalizeUrl(s.type, s.url);
                        var isDirect = s.type === 'email' || s.type === 'phone';
                        return el('a', {
                            key: si,
                            className: 'bkbg-tm-social',
                            href: href,
                            rel: isDirect ? undefined : 'noopener noreferrer',
                            target: isDirect ? undefined : '_blank'
                        },
                            renderSocialIcon(s.type)
                        );
                    })
                );
            }

            function renderMemberCard(member, index) {
                var isActive = index === activeIndex;
                var cardClasses = ['bkbg-tm-card'];
                if (a.cardShadow) cardClasses.push('has-shadow');
                if (isActive && isSelected) cardClasses.push('is-active');

                return el('div', {
                    key: index,
                    className: cardClasses.join(' '),
                    onClick: function () { setActiveIndex(index); }
                },
                    el('div', { className: 'bkbg-tm-actions' },
                        el(Button, {
                            icon: 'arrow-left-alt2',
                            label: __('Move Left', 'blockenberg'),
                            disabled: index === 0,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveMember(index, -1); }
                        }),
                        el(Button, {
                            icon: 'arrow-right-alt2',
                            label: __('Move Right', 'blockenberg'),
                            disabled: index === a.members.length - 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); moveMember(index, 1); }
                        }),
                        el(Button, {
                            icon: 'admin-page',
                            label: __('Duplicate', 'blockenberg'),
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); duplicateMember(index); }
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            isDestructive: true,
                            disabled: a.members.length <= 1,
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); removeMember(index); }
                        })
                    ),

                    renderPhoto(member, index),

                    el(RichText, {
                        tagName: 'h3',
                        className: 'bkbg-tm-name',
                        value: member.name,
                        placeholder: __('Member Name', 'blockenberg'),
                        onChange: function (v) { updateMember(index, 'name', v); }
                    }),

                    a.showRole && el(RichText, {
                        tagName: 'div',
                        className: 'bkbg-tm-role',
                        value: member.role,
                        placeholder: __('Role / Position', 'blockenberg'),
                        onChange: function (v) { updateMember(index, 'role', v); }
                    }),

                    a.showBio && el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-tm-bio',
                        value: member.bio,
                        placeholder: __('Short bio…', 'blockenberg'),
                        onChange: function (v) { updateMember(index, 'bio', v); }
                    }),

                    renderSocials(member)
                );
            }

            function renderMembers() {
                if (a.layoutStyle === 'carousel') {
                    var indicators = renderIndicators();
                    var nav = a.carouselNav && el('div', { className: 'bkbg-tm-nav' },
                        el('button', {
                            type: 'button',
                            className: 'bkbg-tm-nav-btn bkbg-tm-prev',
                            'aria-label': __('Previous', 'blockenberg'),
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollCarousel(-1); }
                        }, el('span', { className: 'dashicons dashicons-arrow-left-alt2' })),
                        el('button', {
                            type: 'button',
                            className: 'bkbg-tm-nav-btn bkbg-tm-next',
                            'aria-label': __('Next', 'blockenberg'),
                            onClick: function (e) { e.preventDefault(); e.stopPropagation(); scrollCarousel(1); }
                        }, el('span', { className: 'dashicons dashicons-arrow-right-alt2' }))
                    );

                    return el('div', { className: 'bkbg-tm-carousel' + (a.carouselPeek ? ' bkbg-tm-carousel-peek' : '') },
                        (a.carouselIndicatorsPosition === 'top') && indicators,
                        el('div', { className: 'bkbg-tm-carousel-inner' },
                            nav,
                            el('div', { className: 'bkbg-tm-track', ref: trackRef },
                                a.members.map(function (member, index) {
                                    return el('div', { key: index, className: 'bkbg-tm-slide' }, renderMemberCard(member, index));
                                })
                            )
                        ),
                        (a.carouselIndicatorsPosition !== 'top') && indicators
                    );
                }

                return el('div', { className: 'bkbg-tm-grid' },
                    a.members.map(function (member, index) {
                        return renderMemberCard(member, index);
                    })
                );
            }

            return el(Fragment, {},
                inspector,
                blockControls,
                el('div', blockProps,
                    renderMembers(),

                    el('div', { className: 'bkbg-editor-actions' },
                        el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addMember }, __('Add Member', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function getPhotoRadius(shape, radiusPx) {
                if (shape === 'circle') return '999px';
                if (shape === 'square') return '0px';
                return (radiusPx || 12) + 'px';
            }

            function getSocialIcon(type) {
                var map = {
                    website: 'admin-site',
                    email: 'email',
                    phone: 'phone',
                    facebook: 'facebook',
                    twitter: null,
                    instagram: 'instagram',
                    linkedin: 'linkedin',
                    github: null
                };
                return map[type] || 'admin-site';
            }

            function renderSocialIcon(type) {
                if (type === 'twitter') {
                    return el('svg', {
                        viewBox: '0 0 24 24',
                        width: '24',
                        height: '24',
                        'aria-hidden': 'true',
                        focusable: 'false'
                    },
                        el('path', {
                            d: 'M18.3 2H21l-6.6 7.6L22 22h-6.2l-4.8-6.3L5.5 22H3l7.1-8.2L2 2h6.3l4.3 5.7L18.3 2Zm-1.1 18h1.4L7 3.9H5.5L17.2 20Z'
                        })
                    );
                }
                if (type === 'github') {
                    return el('svg', {
                        viewBox: '0 0 24 24',
                        width: '24',
                        height: '24',
                        'aria-hidden': 'true',
                        focusable: 'false'
                    },
                        el('path', {
                            d: 'M12 .5C5.65.5.5 5.82.5 12.39c0 5.24 3.44 9.68 8.2 11.25.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.07-3.34.75-4.04-1.66-4.04-1.66-.55-1.43-1.33-1.81-1.33-1.81-1.08-.76.08-.74.08-.74 1.2.09 1.83 1.26 1.83 1.26 1.06 1.87 2.78 1.33 3.46 1.01.11-.79.42-1.33.76-1.63-2.66-.31-5.46-1.38-5.46-6.14 0-1.36.47-2.47 1.24-3.34-.12-.31-.54-1.56.12-3.25 0 0 1.01-.33 3.3 1.28a11.1 11.1 0 0 1 3.01-.42c1.02.01 2.05.14 3.01.42 2.28-1.61 3.29-1.28 3.29-1.28.66 1.69.24 2.94.12 3.25.77.87 1.24 1.98 1.24 3.34 0 4.78-2.8 5.83-5.48 6.14.43.38.82 1.13.82 2.29 0 1.65-.02 2.98-.02 3.39 0 .32.22.7.83.58 4.76-1.57 8.2-6.01 8.2-11.25C23.5 5.82 18.35.5 12 .5Z'
                        })
                    );
                }
                var dash = getSocialIcon(type) || 'admin-site';
                return el('span', { className: 'dashicons dashicons-' + dash });
            }

            function normalizeUrl(type, url) {
                if (!url) return '';
                var v = String(url).trim();
                if (!v) return '';
                if (type === 'email') {
                    if (v.indexOf('mailto:') === 0) return v;
                    return 'mailto:' + v;
                }
                if (type === 'phone') {
                    if (v.indexOf('tel:') === 0) return v;
                    return 'tel:' + v;
                }
                if (v.charAt(0) === '#') return v;
                if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) return v;
                return 'https://' + v;
            }

            var styleVars = {
                '--bkbg-tm-columns': String(a.columns),
                '--bkbg-tm-gap': a.gap + 'px',
                '--bkbg-tm-carousel-peek': a.carouselPeek ? '20%' : '0px',
                '--bkbg-tm-card-bg': a.cardBg,
                '--bkbg-tm-card-border-color': a.cardBorderColor,
                '--bkbg-tm-card-border-width': a.cardBorderWidth + 'px',
                '--bkbg-tm-card-radius': a.cardRadius + 'px',
                '--bkbg-tm-card-padding': a.cardPadding + 'px',
                '--bkbg-tm-text-align': a.textAlign,
                '--bkbg-tm-photo-size': a.imageSize + 'px',
                '--bkbg-tm-photo-radius': getPhotoRadius(a.imageShape, 12),
                '--bkbg-tm-name-color': a.nameColor,
                '--bkbg-tm-role-color': a.roleColor,
                '--bkbg-tm-bio-color': a.bioColor,
                '--bkbg-tm-social-color': a.socialColor,
                '--bkbg-tm-social-hover': a.socialHoverColor,
                '--bkbg-tm-social-size': a.socialSize + 'px',
                '--bkbg-tm-hover-lift': a.hoverLiftAmount + 'px',

                '--bkbg-tm-indicator-size': (a.carouselIndicatorSize || 8) + 'px',
                '--bkbg-tm-indicator-color': a.carouselIndicatorColor,
                '--bkbg-tm-indicator-active-color': a.carouselIndicatorActiveColor,
                '--bkbg-tm-progress-height': (a.carouselProgressHeight || 6) + 'px',
                '--bkbg-tm-progress-bg': a.carouselProgressBg,
                '--bkbg-tm-progress-fg': a.carouselProgressFg,
                '--bkbg-tm-fraction-color': a.carouselFractionColor,
                '--bkbg-tm-fraction-size': (a.carouselFractionSize || 13) + 'px'
            };

            var classes = [
                'bkbg-tm-wrap',
                'bkbg-tm-align-' + a.textAlign
            ];
            if (a.hoverLift) classes.push('bkbg-tm-hover-lift');
            if (a.layoutStyle === 'carousel') {
                classes.push('bkbg-tm-nav-' + (a.carouselNavStyle || 'top'));
                classes.push('bkbg-tm-indicators-' + (a.carouselIndicators || 'none'));
                classes.push('bkbg-tm-indicators-pos-' + (a.carouselIndicatorsPosition || 'below'));

                if (a.carouselIndicators === 'dots') {
                    classes.push('bkbg-tm-dots-style-' + (a.carouselDotsStyle || 'default'));
                }
                if (a.carouselIndicators === 'progress') {
                    classes.push('bkbg-tm-progress-style-' + (a.carouselProgressStyle || 'default'));
                }
            }

            var blockProps = (function () {
                var _tvf = getTypoCssVars();
                var s = Object.assign({}, styleVars);
                if (_tvf) {
                    Object.assign(s, _tvf(a.nameTypo, '--bktm-nm-'));
                    Object.assign(s, _tvf(a.roleTypo, '--bktm-rl-'));
                    Object.assign(s, _tvf(a.bioTypo, '--bktm-bi-'));
                }
                return useBlockProps.save({
                    className: classes.join(' '),
                    style: s,
                    'data-bkbg-infinite': a.infiniteScroll === false ? '0' : '1',
                    'data-bkbg-autoscroll': a.autoScroll ? '1' : '0',
                    'data-bkbg-autoscroll-speed': String(a.autoScrollSpeed || 40),
                    'data-bkbg-autoscroll-hover': a.autoScrollPauseOnHover === false ? '0' : '1'
                });
            })();

            function renderSocials(member) {
                if (!a.showSocials) return null;
                var socials = (member.socials || []).filter(function (s) { return s && s.url; });
                if (!socials.length) return null;

                return el('div', { className: 'bkbg-tm-socials' },
                    socials.map(function (s, si) {
                        var href = normalizeUrl(s.type, s.url);
                        var isDirect = s.type === 'email' || s.type === 'phone';
                        return el('a', {
                            key: si,
                            className: 'bkbg-tm-social',
                            href: href,
                            rel: isDirect ? undefined : 'noopener noreferrer',
                            target: isDirect ? undefined : '_blank'
                        },
                            renderSocialIcon(s.type)
                        );
                    })
                );
            }

            return el('div', blockProps,
                a.layoutStyle === 'carousel'
                    ? el('div', { className: 'bkbg-tm-carousel' + (a.carouselPeek ? ' bkbg-tm-carousel-peek' : '') },
                        (a.carouselIndicatorsPosition === 'top') && (a.carouselIndicators !== 'none') && el('div', { className: 'bkbg-tm-indicators' },
                            a.carouselIndicators === 'progress'
                                ? el('div', { className: 'bkbg-tm-progress' }, el('div', { className: 'bkbg-tm-progress-bar', style: { width: '0%' } }))
                                : a.carouselIndicators === 'fraction'
                                    ? el('div', { className: 'bkbg-tm-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                                        el('span', { className: 'bkbg-tm-fraction-current', 'data-bkbg-fraction': 'current' }, '1'),
                                        el('span', { 'aria-hidden': 'true' }, '/'),
                                        el('span', { className: 'bkbg-tm-fraction-total', 'data-bkbg-fraction': 'total' }, String(Math.max(1, (a.members || []).length)))
                                    )
                                    : el('div', { className: 'bkbg-tm-dots', role: 'tablist', 'aria-label': __('Team Members Carousel', 'blockenberg') },
                                        (a.members || []).map(function (_, i) {
                                            return el('button', {
                                                key: i,
                                                type: 'button',
                                                className: 'bkbg-tm-dot' + (i === 0 ? ' is-active' : ''),
                                                'data-bkbg-dot': String(i),
                                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1)
                                            });
                                        })
                                    )
                        ),
                        el('div', { className: 'bkbg-tm-carousel-inner' },
                            a.carouselNav && el('div', { className: 'bkbg-tm-nav' },
                                el('button', {
                                    type: 'button',
                                    className: 'bkbg-tm-nav-btn bkbg-tm-prev',
                                    'data-bkbg-nav': 'prev',
                                    'aria-label': __('Previous', 'blockenberg')
                                }, el('span', { className: 'dashicons dashicons-arrow-left-alt2' })),
                                el('button', {
                                    type: 'button',
                                    className: 'bkbg-tm-nav-btn bkbg-tm-next',
                                    'data-bkbg-nav': 'next',
                                    'aria-label': __('Next', 'blockenberg')
                                }, el('span', { className: 'dashicons dashicons-arrow-right-alt2' }))
                            ),
                            el('div', { className: 'bkbg-tm-track' },
                                (a.members || []).map(function (member, index) {
                                    var cardClasses = ['bkbg-tm-card'];
                                    if (a.cardShadow) cardClasses.push('has-shadow');

                                    return el('div', { key: index, className: 'bkbg-tm-slide' },
                                        el('div', { className: cardClasses.join(' ') },
                                            el('div', { className: 'bkbg-tm-photo' },
                                                member.image && member.image.url
                                                    ? el('img', { src: member.image.url, alt: (member.image.alt || '') })
                                                    : el('div', { className: 'bkbg-tm-photo-placeholder' },
                                                        el('span', { className: 'dashicons dashicons-format-image' })
                                                    )
                                            ),
                                            el(RichText.Content, { tagName: 'h3', className: 'bkbg-tm-name', value: member.name }),
                                            a.showRole && el(RichText.Content, { tagName: 'div', className: 'bkbg-tm-role', value: member.role }),
                                            a.showBio && el(RichText.Content, { tagName: 'p', className: 'bkbg-tm-bio', value: member.bio }),
                                            renderSocials(member)
                                        )
                                    );
                                })
                            )
                        ),
                        (a.carouselIndicatorsPosition !== 'top') && (a.carouselIndicators !== 'none') && el('div', { className: 'bkbg-tm-indicators' },
                            a.carouselIndicators === 'progress'
                                ? el('div', { className: 'bkbg-tm-progress' }, el('div', { className: 'bkbg-tm-progress-bar', style: { width: '0%' } }))
                                : a.carouselIndicators === 'fraction'
                                    ? el('div', { className: 'bkbg-tm-fraction', 'aria-label': __('Carousel position', 'blockenberg') },
                                        el('span', { className: 'bkbg-tm-fraction-current', 'data-bkbg-fraction': 'current' }, '1'),
                                        el('span', { 'aria-hidden': 'true' }, '/'),
                                        el('span', { className: 'bkbg-tm-fraction-total', 'data-bkbg-fraction': 'total' }, String(Math.max(1, (a.members || []).length)))
                                    )
                                    : el('div', { className: 'bkbg-tm-dots', role: 'tablist', 'aria-label': __('Team Members Carousel', 'blockenberg') },
                                        (a.members || []).map(function (_, i) {
                                            return el('button', {
                                                key: i,
                                                type: 'button',
                                                className: 'bkbg-tm-dot' + (i === 0 ? ' is-active' : ''),
                                                'data-bkbg-dot': String(i),
                                                'aria-label': __('Go to slide', 'blockenberg') + ' ' + (i + 1)
                                            });
                                        })
                                    )
                        )
                    )
                    : el('div', { className: 'bkbg-tm-grid' },
                        (a.members || []).map(function (member, index) {
                            var cardClasses = ['bkbg-tm-card'];
                            if (a.cardShadow) cardClasses.push('has-shadow');

                            return el('div', { key: index, className: cardClasses.join(' ') },
                                el('div', { className: 'bkbg-tm-photo' },
                                    member.image && member.image.url
                                        ? el('img', { src: member.image.url, alt: (member.image.alt || '') })
                                        : el('div', { className: 'bkbg-tm-photo-placeholder' },
                                            el('span', { className: 'dashicons dashicons-format-image' })
                                        )
                                ),
                                el(RichText.Content, { tagName: 'h3', className: 'bkbg-tm-name', value: member.name }),
                                a.showRole && el(RichText.Content, { tagName: 'div', className: 'bkbg-tm-role', value: member.role }),
                                a.showBio && el(RichText.Content, { tagName: 'p', className: 'bkbg-tm-bio', value: member.bio }),
                                renderSocials(member)
                            );
                        })
                    )
            );
        }
    });
}() );
