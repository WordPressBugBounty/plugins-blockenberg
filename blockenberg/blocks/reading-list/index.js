( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var v1Attributes = {
        "title":{"type":"string","default":"My Reading List"},
        "showTitle":{"type":"boolean","default":true},
        "subtitle":{"type":"string","default":"Books and articles I recommend."},
        "showSubtitle":{"type":"boolean","default":true},
        "books":{"type":"array","default":[]},
        "layout":{"type":"string","default":"list"},
        "columns":{"type":"number","default":3},
        "showCover":{"type":"boolean","default":true},
        "showRating":{"type":"boolean","default":true},
        "showStatus":{"type":"boolean","default":true},
        "showGenre":{"type":"boolean","default":true},
        "showYear":{"type":"boolean","default":true},
        "showDescription":{"type":"boolean","default":true},
        "showLink":{"type":"boolean","default":true},
        "linkLabel":{"type":"string","default":"View \u2192"},
        "filterByStatus":{"type":"boolean","default":false},
        "accentColor":{"type":"string","default":"#6c3fb5"},
        "titleColor":{"type":"string","default":"#1e1b4b"},
        "subtitleColor":{"type":"string","default":"#6b7280"},
        "bookTitleColor":{"type":"string","default":"#1e1b4b"},
        "authorColor":{"type":"string","default":"#6c3fb5"},
        "genreColor":{"type":"string","default":"#6b7280"},
        "descColor":{"type":"string","default":"#374151"},
        "starColor":{"type":"string","default":"#f59e0b"},
        "cardBg":{"type":"string","default":"#ffffff"},
        "cardBorder":{"type":"string","default":"#e5e7eb"},
        "linkColor":{"type":"string","default":"#6c3fb5"},
        "bgColor":{"type":"string","default":""},
        "titleSize":{"type":"number","default":32},
        "bookTitleSize":{"type":"number","default":18},
        "authorSize":{"type":"number","default":13},
        "descSize":{"type":"number","default":14},
        "cardRadius":{"type":"number","default":14},
        "coverHeight":{"type":"number","default":180},
        "gap":{"type":"number","default":20},
        "paddingTop":{"type":"number","default":60},
        "paddingBottom":{"type":"number","default":60}
    };

    var STATUS_META = {
        'read':          { label: 'Read',               bg: '#d1fae5', color: '#065f46' },
        'reading':       { label: 'Currently Reading',  bg: '#dbeafe', color: '#1e40af' },
        'want-to-read':  { label: 'Want to Read',       bg: '#fef3c7', color: '#92400e' },
        'recommended':   { label: 'Recommended',        bg: '#ede9fe', color: '#5b21b6' },
        'dnf':           { label: 'Did Not Finish',     bg: '#fee2e2', color: '#991b1b' }
    };

    function uid() {
        return 'rl-' + Math.random().toString(36).slice(2, 9);
    }

    function Stars(rating, color) {
        return el('span', { className: 'bkbg-rl-stars', 'aria-label': rating + ' out of 5 stars' },
            [1,2,3,4,5].map(function (i) {
                return el('span', { key: i, style: { color: i <= rating ? (color || '#f59e0b') : '#d1d5db', fontSize: '14px' } }, i <= rating ? '★' : '☆');
            })
        );
    }

    function BookCard(props) {
        var book = props.book;
        var attrs = props.attrs;
        var sm = STATUS_META[book.status] || STATUS_META['want-to-read'];
        var isGrid = attrs.layout === 'grid';

        var cardStyle = {
            background: attrs.cardBg || '#ffffff',
            border: '1px solid ' + (attrs.cardBorder || '#e5e7eb'),
            borderRadius: attrs.cardRadius + 'px',
            overflow: 'hidden',
            display: isGrid ? 'flex' : 'flex',
            flexDirection: isGrid ? 'column' : 'row',
            gap: isGrid ? '0' : '16px',
            alignItems: isGrid ? 'stretch' : 'flex-start'
        };

        return el('div', { className: 'bkbg-rl-card bkbg-rl-card--' + attrs.layout, style: cardStyle },
            attrs.showCover && el('div', {
                className: 'bkbg-rl-cover-wrap',
                style: {
                    width: isGrid ? '100%' : attrs.coverHeight * 0.67 + 'px',
                    height: isGrid ? attrs.coverHeight + 'px' : undefined,
                    minWidth: isGrid ? undefined : attrs.coverHeight * 0.67 + 'px',
                    flexShrink: 0,
                    background: book.coverUrl ? 'none' : 'linear-gradient(135deg,#6c3fb5,#a78bfa)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            },
                book.coverUrl
                    ? el('img', { src: book.coverUrl, alt: book.title, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                    : el('span', { style: { color: '#fff', fontSize: '12px', padding: '8px', textAlign: 'center', opacity: 0.7 } }, __('No cover', 'blockenberg'))
            ),
            el('div', { className: 'bkbg-rl-body', style: { padding: '16px', flex: 1 } },
                attrs.showStatus && el('span', {
                    className: 'bkbg-rl-badge',
                    style: { background: sm.bg, color: sm.color, borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, display: 'inline-block', marginBottom: '8px' }
                }, sm.label),
                el('div', {
                    className: 'bkbg-rl-book-title',
                    style: { color: attrs.bookTitleColor || '#1e1b4b', marginBottom: '4px' }
                }, book.title || __('Book Title', 'blockenberg')),
                el('div', {
                    className: 'bkbg-rl-author',
                    style: { color: attrs.authorColor || '#6c3fb5', marginBottom: '6px' }
                }, book.author || __('Author Name', 'blockenberg')),
                (attrs.showGenre || attrs.showYear) && el('div', {
                    className: 'bkbg-rl-meta',
                    style: { fontSize: '12px', color: attrs.genreColor || '#6b7280', marginBottom: '6px' }
                },
                    [attrs.showGenre && book.genre, attrs.showYear && book.year].filter(Boolean).join(' · ')
                ),
                attrs.showRating && book.rating > 0 && el('div', { style: { marginBottom: '8px' } }, Stars(book.rating, attrs.starColor)),
                attrs.showDescription && book.description && el('p', {
                    className: 'bkbg-rl-desc',
                    style: { color: attrs.descColor || '#374151', margin: '0 0 10px' }
                }, book.description),
                attrs.showLink && book.url && el('a', {
                    href: book.url,
                    className: 'bkbg-rl-link',
                    style: { color: attrs.linkColor || attrs.accentColor || '#6c3fb5', fontWeight: 600, fontSize: '13px' }
                }, attrs.linkLabel || 'View →')
            )
        );
    }

    function BookEditor(props) {
        var book = props.book;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        var attrs = props.attrs;

        return el(PanelBody, {
            title: (book.title || __('(untitled)', 'blockenberg')).slice(0, 32),
            initialOpen: false
        },
            el(TextControl, {
                label: __('Title', 'blockenberg'),
                value: book.title,
                onChange: function (v) { onChange({ title: v }); }
            }),
            el(TextControl, {
                label: __('Author', 'blockenberg'),
                value: book.author,
                onChange: function (v) { onChange({ author: v }); }
            }),
            el(TextControl, {
                label: __('Genre', 'blockenberg'),
                value: book.genre,
                onChange: function (v) { onChange({ genre: v }); }
            }),
            el(TextControl, {
                label: __('Year', 'blockenberg'),
                value: book.year,
                onChange: function (v) { onChange({ year: v }); }
            }),
            el(RangeControl, {
                label: __('Rating (stars)', 'blockenberg'),
                value: book.rating || 0,
                min: 0, max: 5, step: 1,
                onChange: function (v) { onChange({ rating: v }); }
            }),
            el(SelectControl, {
                label: __('Status', 'blockenberg'),
                value: book.status,
                options: [
                    { label: 'Read', value: 'read' },
                    { label: 'Currently Reading', value: 'reading' },
                    { label: 'Want to Read', value: 'want-to-read' },
                    { label: 'Recommended', value: 'recommended' },
                    { label: 'Did Not Finish', value: 'dnf' }
                ],
                onChange: function (v) { onChange({ status: v }); }
            }),
            el(TextareaControl, {
                label: __('Description', 'blockenberg'),
                value: book.description,
                rows: 3,
                onChange: function (v) { onChange({ description: v }); }
            }),
            el(TextControl, {
                label: __('Link URL', 'blockenberg'),
                value: book.url,
                type: 'url',
                onChange: function (v) { onChange({ url: v }); }
            }),
            el('div', { style: { marginBottom: '12px' } },
                el('p', { style: { fontSize: '11px', color: '#757575', margin: '0 0 6px' } }, __('Cover image', 'blockenberg')),
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (media) { onChange({ coverUrl: media.url, coverId: media.id }); },
                        allowedTypes: ['image'],
                        value: book.coverId,
                        render: function (mediaProps) {
                            return el(Fragment, null,
                                book.coverUrl && el('img', {
                                    src: book.coverUrl,
                                    style: { width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px', display: 'block', marginBottom: '6px' }
                                }),
                                el(Button, {
                                    isSmall: true,
                                    variant: 'secondary',
                                    onClick: mediaProps.open
                                }, book.coverUrl ? __('Replace cover', 'blockenberg') : __('Set cover', 'blockenberg')),
                                book.coverUrl && el(Button, {
                                    isSmall: true,
                                    isDestructive: true,
                                    style: { marginLeft: '8px' },
                                    onClick: function () { onChange({ coverUrl: '', coverId: 0 }); }
                                }, __('Remove', 'blockenberg'))
                            );
                        }
                    })
                )
            ),
            el(Button, {
                isDestructive: true, isSmall: true,
                style: { marginTop: '4px' },
                onClick: onRemove
            }, __('Remove book', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/reading-list', {
        edit: function (props) {
            var TC = getTypoControl();
            var attrs = props.attributes;
            var setAttr = function (obj) { props.setAttributes(obj); };
            var books = attrs.books || [];

            function addBook() {
                setAttr({ books: books.concat([{ id: uid(), title: '', author: '', genre: '', year: '', rating: 0, status: 'want-to-read', description: '', coverUrl: '', coverId: 0, url: '' }]) });
            }
            function updateBook(id, patch) {
                setAttr({ books: books.map(function (b) { return b.id === id ? Object.assign({}, b, patch) : b; }) });
            }
            function removeBook(id) {
                setAttr({ books: books.filter(function (b) { return b.id !== id; }) });
            }

            var wrapStyle = { paddingTop: attrs.paddingTop + 'px', paddingBottom: attrs.paddingBottom + 'px' };
            if (attrs.bgColor) wrapStyle.background = attrs.bgColor;

            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = Object.assign({}, wrapStyle);
                if (_tvFn) {
                    Object.assign(s, _tvFn(attrs.titleTypo || {}, '--bkrl-tt-'));
                    Object.assign(s, _tvFn(attrs.bookTitleTypo || {}, '--bkrl-bt-'));
                    Object.assign(s, _tvFn(attrs.metaTypo || {}, '--bkrl-mt-'));
                }
                return { style: s };
            })());

            var listStyle = attrs.layout === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(' + attrs.columns + ', 1fr)', gap: attrs.gap + 'px' }
                : { display: 'flex', flexDirection: 'column', gap: attrs.gap + 'px' };

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Books', 'blockenberg'), initialOpen: true },
                        books.map(function (b) {
                            return el(BookEditor, {
                                key: b.id,
                                book: b,
                                attrs: attrs,
                                onChange: function (patch) { updateBook(b.id, patch); },
                                onRemove: function () { removeBook(b.id); }
                            });
                        }),
                        el(Button, {
                            variant: 'primary', isSmall: true,
                            style: { marginTop: '12px', width: '100%', justifyContent: 'center' },
                            onClick: addBook
                        }, __('+ Add Book', 'blockenberg'))
                    ),

                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Layout', 'blockenberg'),
                            value: attrs.layout,
                            options: [
                                { label: __('List', 'blockenberg'), value: 'list' },
                                { label: __('Grid', 'blockenberg'), value: 'grid' }
                            ],
                            onChange: function (v) { setAttr({ layout: v }); }
                        }),
                        attrs.layout === 'grid' && el(RangeControl, {
                            label: __('Grid columns', 'blockenberg'),
                            value: attrs.columns, min: 2, max: 4,
                            onChange: function (v) { setAttr({ columns: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Gap (px)', 'blockenberg'),
                            value: attrs.gap, min: 8, max: 48,
                            onChange: function (v) { setAttr({ gap: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Cover height (px)', 'blockenberg'),
                            value: attrs.coverHeight, min: 80, max: 320,
                            onChange: function (v) { setAttr({ coverHeight: v }); }
                        }),
                        el(ToggleControl, { label: __('Show cover', 'blockenberg'), checked: attrs.showCover, onChange: function (v) { setAttr({ showCover: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show status badge', 'blockenberg'), checked: attrs.showStatus, onChange: function (v) { setAttr({ showStatus: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show rating stars', 'blockenberg'), checked: attrs.showRating, onChange: function (v) { setAttr({ showRating: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show genre', 'blockenberg'), checked: attrs.showGenre, onChange: function (v) { setAttr({ showGenre: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show year', 'blockenberg'), checked: attrs.showYear, onChange: function (v) { setAttr({ showYear: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: attrs.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show link button', 'blockenberg'), checked: attrs.showLink, onChange: function (v) { setAttr({ showLink: v }); }, __nextHasNoMarginBottom: true }),
                        attrs.showLink && el(TextControl, {
                            label: __('Link label', 'blockenberg'),
                            value: attrs.linkLabel,
                            onChange: function (v) { setAttr({ linkLabel: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        TC && el(TC, { label: __('Title', 'blockenberg'), value: attrs.titleTypo || {}, onChange: function(v) { setAttr({ titleTypo: v }); } }),
                        TC && el(TC, { label: __('Book Title', 'blockenberg'), value: attrs.bookTitleTypo || {}, onChange: function(v) { setAttr({ bookTitleTypo: v }); } }),
                        TC && el(TC, { label: __('Author / Description', 'blockenberg'), value: attrs.metaTypo || {}, onChange: function(v) { setAttr({ metaTypo: v }); } }),
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: attrs.cardRadius, min: 0, max: 32, onChange: function (v) { setAttr({ cardRadius: v }); } })
                    ),

                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attrs.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attrs.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent', 'blockenberg'), value: attrs.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Title', 'blockenberg'), value: attrs.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#1e1b4b' }); } },
                            { label: __('Book title', 'blockenberg'), value: attrs.bookTitleColor, onChange: function (v) { setAttr({ bookTitleColor: v || '#1e1b4b' }); } },
                            { label: __('Author', 'blockenberg'), value: attrs.authorColor, onChange: function (v) { setAttr({ authorColor: v || '#6c3fb5' }); } },
                            { label: __('Genre/meta', 'blockenberg'), value: attrs.genreColor, onChange: function (v) { setAttr({ genreColor: v || '#6b7280' }); } },
                            { label: __('Description', 'blockenberg'), value: attrs.descColor, onChange: function (v) { setAttr({ descColor: v || '#374151' }); } },
                            { label: __('Star rating', 'blockenberg'), value: attrs.starColor, onChange: function (v) { setAttr({ starColor: v || '#f59e0b' }); } },
                            { label: __('Card background', 'blockenberg'), value: attrs.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Card border', 'blockenberg'), value: attrs.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e5e7eb' }); } },
                            { label: __('Link color', 'blockenberg'), value: attrs.linkColor, onChange: function (v) { setAttr({ linkColor: v || '#6c3fb5' }); } },
                            { label: __('Block background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    attrs.showTitle && el(RichText, {
                        tagName: 'h2',
                        className: 'bkbg-rl-title',
                        style: { color: attrs.titleColor, margin: '0 0 8px' },
                        value: attrs.title,
                        onChange: function (v) { setAttr({ title: v }); },
                        placeholder: __('Reading List Title…', 'blockenberg')
                    }),
                    attrs.showSubtitle && el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-rl-subtitle',
                        style: { color: attrs.subtitleColor, margin: '0 0 24px' },
                        value: attrs.subtitle,
                        onChange: function (v) { setAttr({ subtitle: v }); },
                        placeholder: __('Optional subtitle…', 'blockenberg')
                    }),

                    books.length === 0
                        ? el('p', { style: { color: '#9ca3af', textAlign: 'center', padding: '40px 0' } }, __('Add your first book in the sidebar →', 'blockenberg'))
                        : el('div', { className: 'bkbg-rl-list', style: listStyle },
                            books.map(function (b) {
                                return el(BookCard, { key: b.id, book: b, attrs: attrs });
                            })
                        )
                )
            );
        },

        deprecated: [{
            attributes: v1Attributes,
            save: function (props) {
                var a = props.attributes;
                var books = a.books || [];

                var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
                if (a.bgColor) wrapStyle.background = a.bgColor;

                var blockProps = wp.blockEditor.useBlockProps.save({ style: wrapStyle });

                var listStyle = a.layout === 'grid'
                    ? { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                    : { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' };

                return el('div', blockProps,
                    a.showTitle && el('h2', {
                        className: 'bkbg-rl-title',
                        style: { fontSize: a.titleSize + 'px', color: a.titleColor, margin: '0 0 8px' },
                        dangerouslySetInnerHTML: { __html: a.title }
                    }),
                    a.showSubtitle && el('p', {
                        className: 'bkbg-rl-subtitle',
                        style: { color: a.subtitleColor, margin: '0 0 24px' },
                        dangerouslySetInnerHTML: { __html: a.subtitle }
                    }),

                    el('div', {
                        className: 'bkbg-rl-list',
                        'data-opts': JSON.stringify({ layout: a.layout, filterByStatus: a.filterByStatus }),
                        style: listStyle
                    },
                        books.map(function (book) {
                            var sm = STATUS_META[book.status] || STATUS_META['want-to-read'];
                            var isGrid = a.layout === 'grid';
                            return el('div', {
                                key: book.id,
                                className: 'bkbg-rl-card bkbg-rl-card--' + a.layout,
                                'data-status': book.status,
                                style: {
                                    background: a.cardBg || '#ffffff',
                                    border: '1px solid ' + (a.cardBorder || '#e5e7eb'),
                                    borderRadius: a.cardRadius + 'px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: isGrid ? 'column' : 'row',
                                    gap: isGrid ? '0' : '16px',
                                    alignItems: isGrid ? 'stretch' : 'flex-start'
                                }
                            },
                                a.showCover && el('div', {
                                    className: 'bkbg-rl-cover-wrap',
                                    style: {
                                        width: isGrid ? '100%' : (a.coverHeight * 0.67) + 'px',
                                        height: isGrid ? a.coverHeight + 'px' : undefined,
                                        minWidth: isGrid ? undefined : (a.coverHeight * 0.67) + 'px',
                                        flexShrink: 0,
                                        background: book.coverUrl ? 'none' : 'linear-gradient(135deg,#6c3fb5,#a78bfa)',
                                        overflow: 'hidden'
                                    }
                                },
                                    book.coverUrl
                                        ? el('img', { src: book.coverUrl, alt: book.title, loading: 'lazy', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                                        : null
                                ),
                                el('div', { className: 'bkbg-rl-body', style: { padding: '16px', flex: 1 } },
                                    a.showStatus && el('span', {
                                        className: 'bkbg-rl-badge',
                                        style: { background: sm.bg, color: sm.color, borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, display: 'inline-block', marginBottom: '8px' }
                                    }, sm.label),
                                    el('div', { className: 'bkbg-rl-book-title', style: { fontSize: a.bookTitleSize + 'px', fontWeight: 700, color: a.bookTitleColor || '#1e1b4b', lineHeight: 1.3, marginBottom: '4px' } }, book.title),
                                    el('div', { className: 'bkbg-rl-author', style: { fontSize: a.authorSize + 'px', color: a.authorColor || '#6c3fb5', marginBottom: '6px' } }, book.author),
                                    (a.showGenre || a.showYear) && el('div', { className: 'bkbg-rl-meta', style: { fontSize: '12px', color: a.genreColor || '#6b7280', marginBottom: '6px' } },
                                        [a.showGenre && book.genre, a.showYear && book.year].filter(Boolean).join(' · ')
                                    ),
                                    a.showRating && book.rating > 0 && el('div', { className: 'bkbg-rl-stars', style: { marginBottom: '8px' } },
                                        [1,2,3,4,5].map(function (i) {
                                            return el('span', { key: i, style: { color: i <= book.rating ? (a.starColor || '#f59e0b') : '#d1d5db', fontSize: '14px' } }, i <= book.rating ? '★' : '☆');
                                        })
                                    ),
                                    a.showDescription && book.description && el('p', { className: 'bkbg-rl-desc', style: { fontSize: a.descSize + 'px', color: a.descColor || '#374151', lineHeight: 1.6, margin: '0 0 10px' } }, book.description),
                                    a.showLink && book.url && el('a', { href: book.url, className: 'bkbg-rl-link', style: { color: a.linkColor || a.accentColor || '#6c3fb5', fontWeight: 600, fontSize: '13px' } }, a.linkLabel || 'View →')
                                )
                            );
                        })
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var books = a.books || [];

            var _tvFn = window.bkbgTypoCssVars;
            var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
            if (a.bgColor) wrapStyle.background = a.bgColor;
            if (_tvFn) {
                Object.assign(wrapStyle, _tvFn(a.titleTypo || {}, '--bkrl-tt-'));
                Object.assign(wrapStyle, _tvFn(a.bookTitleTypo || {}, '--bkrl-bt-'));
                Object.assign(wrapStyle, _tvFn(a.metaTypo || {}, '--bkrl-mt-'));
            }

            var blockProps = wp.blockEditor.useBlockProps.save({ style: wrapStyle });

            var listStyle = a.layout === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                : { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' };

            return el('div', blockProps,
                a.showTitle && el('h2', {
                    className: 'bkbg-rl-title',
                    style: { color: a.titleColor, margin: '0 0 8px' },
                    dangerouslySetInnerHTML: { __html: a.title }
                }),
                a.showSubtitle && el('p', {
                    className: 'bkbg-rl-subtitle',
                    style: { color: a.subtitleColor, margin: '0 0 24px' },
                    dangerouslySetInnerHTML: { __html: a.subtitle }
                }),

                el('div', {
                    className: 'bkbg-rl-list',
                    'data-opts': JSON.stringify({ layout: a.layout, filterByStatus: a.filterByStatus }),
                    style: listStyle
                },
                    books.map(function (book) {
                        var sm = STATUS_META[book.status] || STATUS_META['want-to-read'];
                        var isGrid = a.layout === 'grid';
                        return el('div', {
                            key: book.id,
                            className: 'bkbg-rl-card bkbg-rl-card--' + a.layout,
                            'data-status': book.status,
                            style: {
                                background: a.cardBg || '#ffffff',
                                border: '1px solid ' + (a.cardBorder || '#e5e7eb'),
                                borderRadius: a.cardRadius + 'px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: isGrid ? 'column' : 'row',
                                gap: isGrid ? '0' : '16px',
                                alignItems: isGrid ? 'stretch' : 'flex-start'
                            }
                        },
                            a.showCover && el('div', {
                                className: 'bkbg-rl-cover-wrap',
                                style: {
                                    width: isGrid ? '100%' : (a.coverHeight * 0.67) + 'px',
                                    height: isGrid ? a.coverHeight + 'px' : undefined,
                                    minWidth: isGrid ? undefined : (a.coverHeight * 0.67) + 'px',
                                    flexShrink: 0,
                                    background: book.coverUrl ? 'none' : 'linear-gradient(135deg,#6c3fb5,#a78bfa)',
                                    overflow: 'hidden'
                                }
                            },
                                book.coverUrl
                                    ? el('img', { src: book.coverUrl, alt: book.title, loading: 'lazy', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
                                    : null
                            ),
                            el('div', { className: 'bkbg-rl-body', style: { padding: '16px', flex: 1 } },
                                a.showStatus && el('span', {
                                    className: 'bkbg-rl-badge',
                                    style: { background: sm.bg, color: sm.color, borderRadius: '999px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, display: 'inline-block', marginBottom: '8px' }
                                }, sm.label),
                                el('div', { className: 'bkbg-rl-book-title', style: { color: a.bookTitleColor || '#1e1b4b', marginBottom: '4px' } }, book.title),
                                el('div', { className: 'bkbg-rl-author', style: { color: a.authorColor || '#6c3fb5', marginBottom: '6px' } }, book.author),
                                (a.showGenre || a.showYear) && el('div', { className: 'bkbg-rl-meta', style: { fontSize: '12px', color: a.genreColor || '#6b7280', marginBottom: '6px' } },
                                    [a.showGenre && book.genre, a.showYear && book.year].filter(Boolean).join(' · ')
                                ),
                                a.showRating && book.rating > 0 && el('div', { className: 'bkbg-rl-stars', style: { marginBottom: '8px' } },
                                    [1,2,3,4,5].map(function (i) {
                                        return el('span', { key: i, style: { color: i <= book.rating ? (a.starColor || '#f59e0b') : '#d1d5db', fontSize: '14px' } }, i <= book.rating ? '★' : '☆');
                                    })
                                ),
                                a.showDescription && book.description && el('p', { className: 'bkbg-rl-desc', style: { color: a.descColor || '#374151', margin: '0 0 10px' } }, book.description),
                                a.showLink && book.url && el('a', { href: book.url, className: 'bkbg-rl-link', style: { color: a.linkColor || a.accentColor || '#6c3fb5', fontWeight: 600, fontSize: '13px' } }, a.linkLabel || 'View →')
                            )
                        );
                    })
                )
            );
        }
    });
}() );
