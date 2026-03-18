( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Spinner = wp.components.Spinner;
    var Notice = wp.components.Notice;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var cardStyleOptions = [
        { label: 'Shadow',   value: 'shadow' },
        { label: 'Outlined', value: 'outlined' },
        { label: 'Flat',     value: 'flat' },
        { label: 'Elevated', value: 'elevated' }
    ];

    var hoverEffectOptions = [
        { label: 'Zoom',  value: 'zoom' },
        { label: 'Fade',  value: 'fade' },
        { label: 'Lift',  value: 'lift' },
        { label: 'None',  value: 'none' }
    ];

    var orderbyOptions = [
        { label: 'Date',          value: 'date' },
        { label: 'Title',         value: 'title' },
        { label: 'Menu Order',    value: 'menu_order' },
        { label: 'Modified Date', value: 'modified' },
        { label: 'Random',        value: 'rand' }
    ];

    var readMoreStyleOptions = [
        { label: 'Text Link', value: 'link' },
        { label: 'Button',    value: 'button' },
        { label: 'Arrow →',   value: 'arrow' }
    ];

    var imageRatioOptions = [
        { label: '16:9 (56.25%)', value: '56.25' },
        { label: '4:3  (75%)',    value: '75' },
        { label: '1:1  (100%)',   value: '100' },
        { label: '3:2  (66.67%)',value: '66.67' },
        { label: '21:9 (42.86%)',value: '42.86' }
    ];

    /* ─── Card template (used in editor preview & could be reused) ─── */
    function renderCard(post, attrs) {
        var a = attrs;
        var bodyParts = [];
        if (a.showMeta && post.meta) {
            bodyParts.push(el('div', { className: 'bkbg-pg-meta', key: 'meta' }, post.meta));
        }
        bodyParts.push(
            el('h3', { className: 'bkbg-pg-title', key: 'title' },
                el('a', { href: post.link }, post.title)
            )
        );
        if (a.showExcerpt && post.excerpt) {
            bodyParts.push(el('p', { className: 'bkbg-pg-excerpt', key: 'exc' }, post.excerpt));
        }
        if (a.showReadMore) {
            bodyParts.push(
                el('a', {
                    href: post.link,
                    className: 'bkbg-pg-readmore bkbg-pg-readmore--' + a.readMoreStyle,
                    key: 'rm'
                }, a.readMoreLabel + (a.readMoreStyle === 'arrow' ? ' →' : ''))
            );
        }

        return el('article', { className: 'bkbg-pg-card', key: post.id },
            a.showImage && post.image
                ? el('div', { className: 'bkbg-pg-thumb bkbg-pg-hover--' + a.imageHoverEffect },
                    el('div', { className: 'bkbg-pg-thumb-inner' },
                        el('img', { src: post.image, alt: post.title, loading: 'lazy' })
                    )
                  )
                : null,
            el('div', { className: 'bkbg-pg-body' }, ...bodyParts)
        );
    }

    registerBlockType('blockenberg/post-grid', {
        title: __('Post Grid', 'blockenberg'),
        description: __('Display posts or CPT in a responsive card grid.', 'blockenberg'),
        category: 'bkbg-blog',
        icon: el('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
            el('path', { d: 'M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z' })
        ),
        attributes: {
            postType:         { type: 'string',  default: 'post' },
            orderby:          { type: 'string',  default: 'date' },
            order:            { type: 'string',  default: 'desc' },
            perPage:          { type: 'number',  default: 6 },
            offset:           { type: 'number',  default: 0 },
            excerptLen:       { type: 'number',  default: 20 },
            columns:          { type: 'number',  default: 3 },
            columnsTablet:    { type: 'number',  default: 2 },
            columnsMobile:    { type: 'number',  default: 1 },
            gapX:             { type: 'number',  default: 24 },
            gapY:             { type: 'number',  default: 24 },
            showImage:        { type: 'boolean', default: true },
            imageRatio:       { type: 'string',  default: '56.25' },
            imageHoverEffect: { type: 'string',  default: 'zoom' },
            showMeta:         { type: 'boolean', default: true },
            showExcerpt:      { type: 'boolean', default: true },
            showReadMore:     { type: 'boolean', default: true },
            readMoreLabel:    { type: 'string',  default: 'Read More' },
            readMoreStyle:    { type: 'string',  default: 'link' },
            cardStyle:        { type: 'string',  default: 'shadow' },
            titleTypo:        { type: 'object',  default: {} },
            excerptTypo:      { type: 'object',  default: {} },
            metaTypo:         { type: 'object',  default: {} },
            cardBg:           { type: 'string',  default: '#ffffff' },
            cardRadius:       { type: 'number',  default: 10 },
            titleColor:       { type: 'string',  default: '#111827' },
            titleHoverColor:  { type: 'string',  default: '#2563eb' },
            excerptColor:     { type: 'string',  default: '#6b7280' },
            metaColor:        { type: 'string',  default: '#9ca3af' },
            linkColor:        { type: 'string',  default: '#2563eb' },
            borderColor:      { type: 'string',  default: '#e5e7eb' },
            noPostsMessage:   { type: 'string',  default: 'No posts found.' }
        },

        deprecated: [{
            attributes: {
                postType:         { type: 'string',  default: 'post' },
                orderby:          { type: 'string',  default: 'date' },
                order:            { type: 'string',  default: 'desc' },
                perPage:          { type: 'number',  default: 6 },
                offset:           { type: 'number',  default: 0 },
                excerptLen:       { type: 'number',  default: 20 },
                columns:          { type: 'number',  default: 3 },
                columnsTablet:    { type: 'number',  default: 2 },
                columnsMobile:    { type: 'number',  default: 1 },
                gapX:             { type: 'number',  default: 24 },
                gapY:             { type: 'number',  default: 24 },
                showImage:        { type: 'boolean', default: true },
                imageRatio:       { type: 'string',  default: '56.25' },
                imageHoverEffect: { type: 'string',  default: 'zoom' },
                showMeta:         { type: 'boolean', default: true },
                showExcerpt:      { type: 'boolean', default: true },
                showReadMore:     { type: 'boolean', default: true },
                readMoreLabel:    { type: 'string',  default: 'Read More' },
                readMoreStyle:    { type: 'string',  default: 'link' },
                cardStyle:        { type: 'string',  default: 'shadow' },
                titleSize:        { type: 'number',  default: 18 },
                titleWeight:      { type: 'number',  default: 700 },
                excerptSize:      { type: 'number',  default: 14 },
                metaSize:         { type: 'number',  default: 12 },
                cardBg:           { type: 'string',  default: '#ffffff' },
                cardRadius:       { type: 'number',  default: 10 },
                titleColor:       { type: 'string',  default: '#111827' },
                titleHoverColor:  { type: 'string',  default: '#2563eb' },
                excerptColor:     { type: 'string',  default: '#6b7280' },
                metaColor:        { type: 'string',  default: '#9ca3af' },
                linkColor:        { type: 'string',  default: '#2563eb' },
                borderColor:      { type: 'string',  default: '#e5e7eb' },
                noPostsMessage:   { type: 'string',  default: 'No posts found.' },
                titleLineHeight:  { type: 'number',  default: 1.3 },
                excerptFontWeight:{ type: 'string',  default: '400' }
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className: 'bkbg-pg-wrap bkbg-pg-card--' + a.cardStyle,
                    'data-post-type':   a.postType,
                    'data-orderby':     a.orderby,
                    'data-order':       a.order,
                    'data-per-page':    a.perPage,
                    'data-offset':      a.offset,
                    'data-excerpt-len': a.excerptLen,
                    'data-show-image':  a.showImage ? '1' : '0',
                    'data-show-meta':   a.showMeta  ? '1' : '0',
                    'data-show-excerpt':a.showExcerpt ? '1' : '0',
                    'data-show-rm':     a.showReadMore ? '1' : '0',
                    'data-rm-label':    a.readMoreLabel,
                    'data-rm-style':    a.readMoreStyle,
                    'data-no-posts':    a.noPostsMessage,
                    'data-hover':       a.imageHoverEffect,
                    style: {
                        '--bkbg-pg-cols':        a.columns,
                        '--bkbg-pg-cols-tab':    a.columnsTablet,
                        '--bkbg-pg-cols-mob':    a.columnsMobile,
                        '--bkbg-pg-gap-x':       a.gapX + 'px',
                        '--bkbg-pg-gap-y':       a.gapY + 'px',
                        '--bkbg-pg-ratio':       a.imageRatio + '%',
                        '--bkbg-pg-card-bg':     a.cardBg,
                        '--bkbg-pg-card-radius': a.cardRadius + 'px',
                        '--bkbg-pg-title-size':  a.titleSize + 'px',
                        '--bkbg-pg-title-weight':a.titleWeight,
                        '--bkbg-pg-exc-size':    a.excerptSize + 'px',
                        '--bkbg-pg-meta-size':   a.metaSize + 'px',
                        '--bkbg-pg-title-color': a.titleColor,
                        '--bkbg-pg-title-hover': a.titleHoverColor,
                        '--bkbg-pg-exc-color':   a.excerptColor,
                        '--bkbg-pg-meta-color':  a.metaColor,
                        '--bkbg-pg-link-color':  a.linkColor,
                        '--bkbg-pg-border':      a.borderColor
                    }
                });
                return el('div', blockProps,
                    el('div', { className: 'bkbg-pg-grid' })
                );
            }
        }],

        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;

            var _state = useState({ posts: [], loading: true, error: '' });
            var state = _state[0];
            var setState = _state[1];

            useEffect(function () {
                setState({ posts: [], loading: true, error: '' });
                var path = '/blockenberg/v1/post-grid?type=' + a.postType
                    + '&orderby=' + a.orderby
                    + '&order=' + a.order
                    + '&per_page=' + a.perPage
                    + '&offset=' + a.offset
                    + '&excerpt_len=' + a.excerptLen;

                wp.apiFetch({ path: path })
                    .then(function (res) {
                        setState({ posts: res.posts || [], loading: false, error: '' });
                    })
                    .catch(function (err) {
                        setState({ posts: [], loading: false, error: err.message || 'Error loading posts.' });
                    });
            }, [a.postType, a.orderby, a.order, a.perPage, a.offset, a.excerptLen]);

            var blockProps = useBlockProps({
                className: 'bkbg-pg-wrap bkbg-pg-card--' + a.cardStyle,
                style: (function () {
                    var _tvFn = getTypoCssVars();
                    var s = {
                        '--bkbg-pg-cols':        a.columns,
                        '--bkbg-pg-cols-tab':    a.columnsTablet,
                        '--bkbg-pg-cols-mob':    a.columnsMobile,
                        '--bkbg-pg-gap-x':       a.gapX + 'px',
                        '--bkbg-pg-gap-y':       a.gapY + 'px',
                        '--bkbg-pg-ratio':       a.imageRatio + '%',
                        '--bkbg-pg-card-bg':     a.cardBg,
                        '--bkbg-pg-card-radius': a.cardRadius + 'px',
                        '--bkbg-pg-title-color': a.titleColor,
                        '--bkbg-pg-title-hover': a.titleHoverColor,
                        '--bkbg-pg-exc-color':   a.excerptColor,
                        '--bkbg-pg-meta-color':  a.metaColor,
                        '--bkbg-pg-link-color':  a.linkColor,
                        '--bkbg-pg-border':      a.borderColor
                    };
                    Object.assign(s, _tvFn(a.titleTypo, '--bkbg-pgr-tt-'));
                    Object.assign(s, _tvFn(a.excerptTypo, '--bkbg-pgr-ex-'));
                    Object.assign(s, _tvFn(a.metaTypo, '--bkbg-pgr-mt-'));
                    return s;
                })()
            });

            var inspector = el(InspectorControls, null,

                /* ── Query ── */
                el(PanelBody, { title: __('Query', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Post Type', 'blockenberg'),
                        value: a.postType,
                        options: [
                            { label: 'Posts', value: 'post' },
                            { label: 'Pages', value: 'page' },
                            { label: 'Products (WooCommerce)', value: 'product' }
                        ],
                        onChange: function (v) { setAttr({ postType: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Order By', 'blockenberg'),
                        value: a.orderby,
                        options: orderbyOptions,
                        onChange: function (v) { setAttr({ orderby: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Order', 'blockenberg'),
                        value: a.order,
                        options: [
                            { label: 'Newest first (DESC)', value: 'desc' },
                            { label: 'Oldest first (ASC)',  value: 'asc' }
                        ],
                        onChange: function (v) { setAttr({ order: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Posts per page', 'blockenberg'),
                        value: a.perPage, min: 1, max: 48,
                        onChange: function (v) { setAttr({ perPage: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Offset', 'blockenberg'),
                        value: a.offset, min: 0, max: 48,
                        onChange: function (v) { setAttr({ offset: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Excerpt word count', 'blockenberg'),
                        value: a.excerptLen, min: 5, max: 60,
                        onChange: function (v) { setAttr({ excerptLen: v }); }
                    })
                ),

                /* ── Layout ── */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Columns (Desktop)', 'blockenberg'),
                        value: a.columns, min: 1, max: 6,
                        onChange: function (v) { setAttr({ columns: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Tablet)', 'blockenberg'),
                        value: a.columnsTablet, min: 1, max: 4,
                        onChange: function (v) { setAttr({ columnsTablet: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Columns (Mobile)', 'blockenberg'),
                        value: a.columnsMobile, min: 1, max: 2,
                        onChange: function (v) { setAttr({ columnsMobile: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Column gap (px)', 'blockenberg'),
                        value: a.gapX, min: 0, max: 80,
                        onChange: function (v) { setAttr({ gapX: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Row gap (px)', 'blockenberg'),
                        value: a.gapY, min: 0, max: 80,
                        onChange: function (v) { setAttr({ gapY: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'),
                        value: a.cardStyle,
                        options: cardStyleOptions,
                        onChange: function (v) { setAttr({ cardStyle: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Card border radius (px)', 'blockenberg'),
                        value: a.cardRadius, min: 0, max: 40,
                        onChange: function (v) { setAttr({ cardRadius: v }); }
                    })
                ),

                /* ── Image ── */
                el(PanelBody, { title: __('Image', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show featured image', 'blockenberg'),
                        checked: a.showImage,
                        onChange: function (v) { setAttr({ showImage: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.showImage && el(Fragment, null,
                        el(SelectControl, {
                            label: __('Image ratio', 'blockenberg'),
                            value: a.imageRatio,
                            options: imageRatioOptions,
                            onChange: function (v) { setAttr({ imageRatio: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Hover effect', 'blockenberg'),
                            value: a.imageHoverEffect,
                            options: hoverEffectOptions,
                            onChange: function (v) { setAttr({ imageHoverEffect: v }); }
                        })
                    )
                ),

                /* ── Content visibility ── */
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show meta (date / author)', 'blockenberg'),
                        checked: a.showMeta,
                        onChange: function (v) { setAttr({ showMeta: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show excerpt', 'blockenberg'),
                        checked: a.showExcerpt,
                        onChange: function (v) { setAttr({ showExcerpt: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Read More', 'blockenberg'),
                        checked: a.showReadMore,
                        onChange: function (v) { setAttr({ showReadMore: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    a.showReadMore && el(Fragment, null,
                        el(TextControl, {
                            label: __('Read More label', 'blockenberg'),
                            value: a.readMoreLabel,
                            onChange: function (v) { setAttr({ readMoreLabel: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Read More style', 'blockenberg'),
                            value: a.readMoreStyle,
                            options: readMoreStyleOptions,
                            onChange: function (v) { setAttr({ readMoreStyle: v }); }
                        })
                    ),
                    el(TextControl, {
                        label: __('No posts message', 'blockenberg'),
                        value: a.noPostsMessage,
                        onChange: function (v) { setAttr({ noPostsMessage: v }); }
                    })
                ),

                /* ── Typography ── */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    (function () {
                        var TC = getTypoControl();
                        if (!TC) return el('p', null, 'Loading…');
                        return el(Fragment, null,
                            el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                            el(TC, { label: 'Excerpt Typography', value: a.excerptTypo, onChange: function (v) { setAttr({ excerptTypo: v }); } }),
                            el(TC, { label: 'Meta Typography', value: a.metaTypo, onChange: function (v) { setAttr({ metaTypo: v }); } })
                        );
                    })()
                ),

                /* ── Colors ── */
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Card Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Card background', 'blockenberg'), value: a.cardBg,          onChange: function(v){ setAttr({ cardBg: v||'#ffffff' }); } },
                            { label: __('Title color', 'blockenberg'),     value: a.titleColor,       onChange: function(v){ setAttr({ titleColor: v||'#111827' }); } },
                            { label: __('Title hover color', 'blockenberg'),value: a.titleHoverColor, onChange: function(v){ setAttr({ titleHoverColor: v||'#2563eb' }); } },
                            { label: __('Excerpt color', 'blockenberg'),   value: a.excerptColor,     onChange: function(v){ setAttr({ excerptColor: v||'#6b7280' }); } },
                            { label: __('Meta color', 'blockenberg'),      value: a.metaColor,        onChange: function(v){ setAttr({ metaColor: v||'#9ca3af' }); } },
                            { label: __('Link/button color', 'blockenberg'),value: a.linkColor,       onChange: function(v){ setAttr({ linkColor: v||'#2563eb' }); } },
                            { label: __('Border color', 'blockenberg'),    value: a.borderColor,      onChange: function(v){ setAttr({ borderColor: v||'#e5e7eb' }); } }
                        ]
                    })
                )
            );

            /* ─── Editor preview ─── */
            var content;
            if (state.loading) {
                content = el('div', { className: 'bkbg-pg-loading' },
                    el(Spinner),
                    el('span', null, ' ' + __('Loading posts…', 'blockenberg'))
                );
            } else if (state.error) {
                content = el(Notice, { status: 'error', isDismissible: false }, state.error);
            } else if (!state.posts.length) {
                content = el('p', { className: 'bkbg-pg-empty' }, a.noPostsMessage);
            } else {
                content = el('div', { className: 'bkbg-pg-grid' },
                    state.posts.map(function (post) { return renderCard(post, a); })
                );
            }

            return el(Fragment, null,
                inspector,
                el('div', blockProps, content)
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvFn = getTypoCssVars();
            var saveStyle = {
                '--bkbg-pg-cols':        a.columns,
                '--bkbg-pg-cols-tab':    a.columnsTablet,
                '--bkbg-pg-cols-mob':    a.columnsMobile,
                '--bkbg-pg-gap-x':       a.gapX + 'px',
                '--bkbg-pg-gap-y':       a.gapY + 'px',
                '--bkbg-pg-ratio':       a.imageRatio + '%',
                '--bkbg-pg-card-bg':     a.cardBg,
                '--bkbg-pg-card-radius': a.cardRadius + 'px',
                '--bkbg-pg-title-color': a.titleColor,
                '--bkbg-pg-title-hover': a.titleHoverColor,
                '--bkbg-pg-exc-color':   a.excerptColor,
                '--bkbg-pg-meta-color':  a.metaColor,
                '--bkbg-pg-link-color':  a.linkColor,
                '--bkbg-pg-border':      a.borderColor
            };
            Object.assign(saveStyle, _tvFn(a.titleTypo, '--bkbg-pgr-tt-'));
            Object.assign(saveStyle, _tvFn(a.excerptTypo, '--bkbg-pgr-ex-'));
            Object.assign(saveStyle, _tvFn(a.metaTypo, '--bkbg-pgr-mt-'));

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-pg-wrap bkbg-pg-card--' + a.cardStyle,
                'data-post-type':   a.postType,
                'data-orderby':     a.orderby,
                'data-order':       a.order,
                'data-per-page':    a.perPage,
                'data-offset':      a.offset,
                'data-excerpt-len': a.excerptLen,
                'data-show-image':  a.showImage ? '1' : '0',
                'data-show-meta':   a.showMeta  ? '1' : '0',
                'data-show-excerpt':a.showExcerpt ? '1' : '0',
                'data-show-rm':     a.showReadMore ? '1' : '0',
                'data-rm-label':    a.readMoreLabel,
                'data-rm-style':    a.readMoreStyle,
                'data-no-posts':    a.noPostsMessage,
                'data-hover':       a.imageHoverEffect,
                style: saveStyle
            });
            return el('div', blockProps,
                el('div', { className: 'bkbg-pg-grid' })
            );
        }
    });
}() );
