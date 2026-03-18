( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var PLATFORM_OPTIONS = [
        { label: 'Instagram', value: 'instagram' },
        { label: 'X / Twitter', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'TikTok', value: 'tiktok' },
    ];
    var CARD_STYLE_OPTIONS = [
        { label: __('Card (shadow)',  'blockenberg'), value: 'card' },
        { label: __('Bordered',      'blockenberg'), value: 'bordered' },
        { label: __('Flat',          'blockenberg'), value: 'flat' },
    ];
    var HOVER_OPTIONS = [
        { label: __('Lift', 'blockenberg'), value: 'lift' },
        { label: __('None', 'blockenberg'), value: 'none' },
    ];
    var RATIO_OPTIONS = [
        { label: '1 / 1', value: '1/1' },
        { label: '4 / 3', value: '4/3' },
        { label: '16 / 9', value: '16/9' },
        { label: '3 / 2', value: '3/2' },
    ];
    var COLS_OPTIONS = [
        { label: '1', value: 1 }, { label: '2', value: 2 },
        { label: '3', value: 3 }, { label: '4', value: 4 },
    ];

    var PLATFORM_ICONS = {
        instagram: '📸',
        twitter:   '🐦',
        linkedin:  '💼',
        facebook:  '📘',
        tiktok:    '🎵',
    };
    var PLATFORM_COLORS = {
        instagram: '#e1306c',
        twitter:   '#1da1f2',
        linkedin:  '#0077b5',
        facebook:  '#1877f2',
        tiktok:    '#010101',
    };

    function makeId() { return 'sf' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        var s = {
            '--bkbg-sf-accent':       a.accentColor,
            '--bkbg-sf-card-bg':      a.cardBg,
            '--bkbg-sf-card-border':  a.cardBorderColor,
            '--bkbg-sf-text-color':   a.textColor,
            '--bkbg-sf-username':     a.usernameColor,
            '--bkbg-sf-metrics':      a.metricsColor,
            '--bkbg-sf-content-sz':   a.contentSize + 'px',
            '--bkbg-sf-username-sz':  a.usernameSize + 'px',
            '--bkbg-sf-metrics-sz':   a.metricsSize + 'px',
            '--bkbg-sf-card-r':       a.cardRadius + 'px',
            '--bkbg-sf-card-pad':     a.cardPadding + 'px',
            '--bkbg-sf-img-r':        a.imageRadius + 'px',
            '--bkbg-sf-cols':         a.columns,
            '--bkbg-sf-gap':          a.gap + 'px',
            '--bkbg-sf-content-lines':a.contentLines,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        var _tvFn = getTypoCssVars();
        if (_tvFn) {
            Object.assign(s, _tvFn(a.usernameTypo || {}, '--bksf-un-'));
            Object.assign(s, _tvFn(a.contentTypo || {}, '--bksf-ct-'));
            Object.assign(s, _tvFn(a.metricsTypo || {}, '--bksf-mt-'));
        }
        return s;
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    function ratioPercent(r) {
        var p = r.split('/');
        return (parseInt(p[1], 10) / parseInt(p[0], 10) * 100).toFixed(2) + '%';
    }

    /* ── Single post card ───────────────────────────────────────────── */
    function PostCard(props) {
        var post    = props.post;
        var a       = props.a;
        var isEditor = props.isEditor;
        var pColor  = PLATFORM_COLORS[post.platform] || a.accentColor;
        var pIcon   = PLATFORM_ICONS[post.platform] || '🌐';
        var hasTypo = a.usernameTypo !== undefined;

        var cardStyle = {
            background:    a.cardBg,
            borderRadius:  a.cardRadius + 'px',
            padding:       a.cardPadding + 'px',
            border:        a.cardStyle === 'bordered' ? ('1.5px solid ' + a.cardBorderColor) : 'none',
            boxShadow:     a.cardStyle === 'card'     ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
            display:       'flex',
            flexDirection: 'column',
            gap:           '12px',
            overflow:      'hidden',
        };

        return el('div', { className: 'bkbg-sf-card bkbg-sf-card--' + a.cardStyle + ' bkbg-sf-hover--' + a.hoverEffect, style: cardStyle },
            /* Header: avatar + username + platform badge */
            el('div', { className: 'bkbg-sf-card-header', style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                a.showAvatar && el('div', { className: 'bkbg-sf-avatar', style: { width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: pColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' } },
                    post.avatarUrl
                        ? el('img', { src: post.avatarUrl, alt: post.username, style: { width: '100%', height: '100%', objectFit: 'cover' } })
                        : el('span', null, pIcon)
                ),
                el('div', { style: { flex: 1, minWidth: 0 } },
                    a.showUsername && el('div', { className: 'bkbg-sf-username', style: hasTypo ? { color: a.usernameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : { fontSize: a.usernameSize + 'px', fontWeight: a.usernameFontWeight||700, color: a.usernameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, post.username),
                    a.showTimeAgo && el('div', { className: 'bkbg-sf-time', style: hasTypo ? { color: a.metricsColor } : { fontSize: (a.metricsSize) + 'px', color: a.metricsColor } }, post.timeAgo)
                ),
                a.showPlatformBadge && el('div', { className: 'bkbg-sf-badge', style: { width: '32px', height: '32px', borderRadius: '8px', background: pColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 } }, pIcon)
            ),

            /* Image */
            a.showImage && post.imageUrl && el('div', { className: 'bkbg-sf-image', style: { borderRadius: a.imageRadius + 'px', overflow: 'hidden', position: 'relative' } },
                el('div', { style: { paddingBottom: ratioPercent(a.imageRatio) } }),
                el('img', { src: post.imageUrl, alt: '', loading: 'lazy', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
            ),

            /* Content text */
            el('p', { className: 'bkbg-sf-content', style: hasTypo ? { color: a.textColor, margin: 0, lineHeight: 1.6, flex: 1 } : { fontSize: a.contentSize + 'px', color: a.textColor, margin: 0, lineHeight: 1.6, flex: 1 } }, post.content),

            /* Metrics: likes + comments */
            a.showMetrics && el('div', { className: 'bkbg-sf-metrics', style: hasTypo ? { display: 'flex', gap: '16px', paddingTop: '4px', borderTop: '1px solid ' + (a.cardBorderColor || '#f3f4f6'), color: a.metricsColor } : { display: 'flex', gap: '16px', paddingTop: '4px', borderTop: '1px solid ' + (a.cardBorderColor || '#f3f4f6'), fontSize: a.metricsSize + 'px', color: a.metricsColor } },
                el('span', { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, '❤️ ', post.likes),
                el('span', { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, '💬 ', post.comments)
            )
        );
    }

    registerBlockType('blockenberg/social-feed', {
        title: __('Social Feed', 'blockenberg'),
        icon: 'share',
        category: 'bkbg-marketing',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updatePost(id, key, val) {
                setAttributes({ posts: a.posts.map(function (p) {
                    if (p.id !== id) return p;
                    var u = Object.assign({}, p); u[key] = val; return u;
                }) });
            }

            var gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Columns (desktop)', 'blockenberg'), value: a.columns,        options: COLS_OPTIONS, onChange: function (v) { setAttributes({ columns:        parseInt(v,10) }); } }),
                        el(SelectControl, { label: __('Columns (tablet)',  'blockenberg'), value: a.columnsTablet,  options: COLS_OPTIONS, onChange: function (v) { setAttributes({ columnsTablet:  parseInt(v,10) }); } }),
                        el(SelectControl, { label: __('Columns (mobile)',  'blockenberg'), value: a.columnsMobile,  options: COLS_OPTIONS.slice(0,2), onChange: function (v) { setAttributes({ columnsMobile:  parseInt(v,10) }); } }),
                        el(RangeControl,  { label: __('Gap (px)',          'blockenberg'), value: a.gap,            min: 8, max: 48, onChange: function (v) { setAttributes({ gap: v }); } })
                    ),
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Card style',    'blockenberg'), value: a.cardStyle,    options: CARD_STYLE_OPTIONS, onChange: function (v) { setAttributes({ cardStyle:    v }); } }),
                        el(SelectControl, { label: __('Hover effect',  'blockenberg'), value: a.hoverEffect,  options: HOVER_OPTIONS,     onChange: function (v) { setAttributes({ hoverEffect:  v }); } }),
                        el(RangeControl,  { label: __('Padding (px)',  'blockenberg'), value: a.cardPadding,  min: 10, max: 40, onChange: function (v) { setAttributes({ cardPadding:  v }); } }),
                        el(RangeControl,  { label: __('Radius (px)',   'blockenberg'), value: a.cardRadius,   min: 0,  max: 32, onChange: function (v) { setAttributes({ cardRadius:   v }); } })
                    ),
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show platform badge', 'blockenberg'), checked: a.showPlatformBadge, onChange: function (v) { setAttributes({ showPlatformBadge: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show avatar',         'blockenberg'), checked: a.showAvatar,        onChange: function (v) { setAttributes({ showAvatar:        v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show username',       'blockenberg'), checked: a.showUsername,      onChange: function (v) { setAttributes({ showUsername:      v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show time ago',       'blockenberg'), checked: a.showTimeAgo,       onChange: function (v) { setAttributes({ showTimeAgo:       v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show post image',     'blockenberg'), checked: a.showImage,         onChange: function (v) { setAttributes({ showImage:         v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show metrics',        'blockenberg'), checked: a.showMetrics,       onChange: function (v) { setAttributes({ showMetrics:       v }); }, __nextHasNoMarginBottom: true }),
                        a.showImage && el(SelectControl, { label: __('Image ratio', 'blockenberg'), value: a.imageRatio, options: RATIO_OPTIONS, onChange: function (v) { setAttributes({ imageRatio: v }); } }),
                        a.showImage && el(RangeControl,  { label: __('Image radius (px)', 'blockenberg'), value: a.imageRadius, min: 0, max: 24, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                        el(RangeControl, { label: __('Content max lines', 'blockenberg'), value: a.contentLines, min: 2, max: 10, onChange: function (v) { setAttributes({ contentLines: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Username', 'blockenberg'),
                            value: a.usernameTypo || {},
                            onChange: function (v) { setAttributes({ usernameTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Content', 'blockenberg'),
                            value: a.contentTypo || {},
                            onChange: function (v) { setAttributes({ contentTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Metrics', 'blockenberg'),
                            value: a.metricsTypo || {},
                            onChange: function (v) { setAttributes({ metricsTypo: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',     __('Accent',           'blockenberg'), 'accentColor'),
                        cc('cardBg',          __('Card background',  'blockenberg'), 'cardBg'),
                        cc('cardBorderColor', __('Card border',      'blockenberg'), 'cardBorderColor'),
                        cc('usernameColor',   __('Username text',    'blockenberg'), 'usernameColor'),
                        cc('textColor',       __('Content text',     'blockenberg'), 'textColor'),
                        cc('metricsColor',    __('Metrics / meta',   'blockenberg'), 'metricsColor'),
                        cc('bgColor',         __('Section bg',       'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Posts', 'blockenberg'), initialOpen: false },
                        a.posts.map(function (post, pi) {
                            return el(PanelBody, { key: post.id, title: (PLATFORM_ICONS[post.platform] || '🌐') + ' ' + (post.username || 'Post ' + (pi + 1)), initialOpen: false },
                                el(SelectControl,   { label: __('Platform',  'blockenberg'), value: post.platform, options: PLATFORM_OPTIONS, onChange: function (v) { updatePost(post.id, 'platform', v); } }),
                                el(TextControl,     { label: __('Username',  'blockenberg'), value: post.username, onChange: function (v) { updatePost(post.id, 'username', v); } }),
                                el(TextareaControl, { label: __('Content',   'blockenberg'), value: post.content,  onChange: function (v) { updatePost(post.id, 'content',  v); }, rows: 3 }),
                                el(TextControl,     { label: __('Likes',     'blockenberg'), value: post.likes,    onChange: function (v) { updatePost(post.id, 'likes',    v); } }),
                                el(TextControl,     { label: __('Comments',  'blockenberg'), value: post.comments, onChange: function (v) { updatePost(post.id, 'comments', v); } }),
                                el(TextControl,     { label: __('Time ago',  'blockenberg'), value: post.timeAgo,  onChange: function (v) { updatePost(post.id, 'timeAgo',  v); } }),
                                el('p', { style: { fontSize: '12px', margin: '4px 0 4px', fontWeight: 600 } }, __('Post image', 'blockenberg')),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (m) { updatePost(post.id, 'imageUrl', m.url); updatePost(post.id, 'imageId', m.id); },
                                        allowedTypes: ['image'], value: post.imageId,
                                        render: function (p) { return el('div', null,
                                            post.imageUrl && el('img', { src: post.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '4px' } }),
                                            el(Button, { onClick: p.open, variant: post.imageUrl ? 'secondary' : 'primary', size: 'compact' }, post.imageUrl ? __('Replace image', 'blockenberg') : __('Add image', 'blockenberg'))
                                        ); }
                                    })
                                ),
                                el('p', { style: { fontSize: '12px', margin: '8px 0 4px', fontWeight: 600 } }, __('Avatar', 'blockenberg')),
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (m) { updatePost(post.id, 'avatarUrl', m.url); updatePost(post.id, 'avatarId', m.id); },
                                        allowedTypes: ['image'], value: post.avatarId,
                                        render: function (p) { return el(Button, { onClick: p.open, variant: post.avatarUrl ? 'secondary' : 'tertiary', size: 'compact' }, post.avatarUrl ? __('Replace avatar', 'blockenberg') : __('Set avatar', 'blockenberg')); }
                                    })
                                ),
                                el(Button, { onClick: function () { setAttributes({ posts: a.posts.filter(function (p) { return p.id !== post.id; }) }); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '8px' } }, __('Remove post', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () {
                            setAttributes({ posts: a.posts.concat([{ id: makeId(), platform: 'instagram', username: '@newpost', avatarUrl: '', avatarId: 0, content: __('Add your post content here…', 'blockenberg'), imageUrl: '', imageId: 0, likes: '0', comments: '0', timeAgo: 'Just now' }]) });
                        }, style: { marginTop: '8px' } }, __('+ Add Post', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-sf-grid', style: gridStyle, 'data-cols-tablet': a.columnsTablet, 'data-cols-mobile': a.columnsMobile },
                        a.posts.map(function (post) {
                            return el(PostCard, { key: post.id, post: post, a: a, isEditor: true });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-sf-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-sf-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }, 'data-cols-tablet': a.columnsTablet, 'data-cols-mobile': a.columnsMobile },
                    a.posts.map(function (post) {
                        return el(PostCard, { key: post.id, post: post, a: a, isEditor: false });
                    })
                )
            );
        },

        deprecated: [{
            attributes: {"posts":{"type":"array","default":[{"id":"sf001","platform":"instagram","username":"@studio.design","avatarUrl":"","avatarId":0,"content":"Just launched our new design system 🎨","imageUrl":"","imageId":0,"likes":"4.2k","comments":"138","timeAgo":"2h ago"},{"id":"sf002","platform":"twitter","username":"@devteam","avatarUrl":"","avatarId":0,"content":"Hot take: the best code is the code you never have to write again.","imageUrl":"","imageId":0,"likes":"891","comments":"74","timeAgo":"5h ago"},{"id":"sf003","platform":"linkedin","username":"Creative Agency","avatarUrl":"","avatarId":0,"content":"Excited to announce we've crossed 10,000 clients worldwide!","imageUrl":"","imageId":0,"likes":"2.1k","comments":"312","timeAgo":"1d ago"}]},"columns":{"type":"integer","default":3},"columnsTablet":{"type":"integer","default":2},"columnsMobile":{"type":"integer","default":1},"gap":{"type":"integer","default":20},"cardStyle":{"type":"string","default":"card"},"cardPadding":{"type":"integer","default":20},"cardRadius":{"type":"integer","default":16},"imageRatio":{"type":"string","default":"1/1"},"imageRadius":{"type":"integer","default":12},"contentLines":{"type":"integer","default":4},"showImage":{"type":"boolean","default":true},"showPlatformBadge":{"type":"boolean","default":true},"showAvatar":{"type":"boolean","default":true},"showUsername":{"type":"boolean","default":true},"showTimeAgo":{"type":"boolean","default":true},"showMetrics":{"type":"boolean","default":true},"hoverEffect":{"type":"string","default":"lift"},"accentColor":{"type":"string","default":"#6c3fb5"},"cardBg":{"type":"string","default":"#ffffff"},"cardBorderColor":{"type":"string","default":"#e5e7eb"},"textColor":{"type":"string","default":"#374151"},"usernameColor":{"type":"string","default":"#111827"},"metricsColor":{"type":"string","default":"#9ca3af"},"contentSize":{"type":"integer","default":14},"usernameSize":{"type":"integer","default":14},"metricsSize":{"type":"integer","default":13},"bgColor":{"type":"string","default":""},"paddingTop":{"type":"integer","default":60},"paddingBottom":{"type":"integer","default":60},"usernameFontWeight":{"type":"number","default":600}},
            save: function (props) {
                var a = props.attributes;
                /* old save — PostCard with inline font styles, no typo CSS vars */
                return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-sf-wrapper', style: buildWrapStyle(a) }),
                    el('div', { className: 'bkbg-sf-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }, 'data-cols-tablet': a.columnsTablet, 'data-cols-mobile': a.columnsMobile },
                        a.posts.map(function (post) {
                            return el(PostCard, { key: post.id, post: post, a: a, isEditor: false });
                        })
                    )
                );
            }
        }]
    });
}() );
