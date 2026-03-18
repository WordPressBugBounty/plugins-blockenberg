(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        function getTypographyControl() {
            return (window.bkbgTypographyControl || function () { return null; });
        }

        function _tv(typo, prefix) {
            if (!typo) return {};
            var s = {};
            if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
            if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
            if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
            if (typo.style)      s[prefix + 'font-style'] = typo.style;
            if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
            var su = typo.sizeUnit || 'px';
            if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
            if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
            if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
            var lhu = typo.lineHeightUnit || '';
            if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
            if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
            if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
            var lsu = typo.letterSpacingUnit || 'px';
            if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
            if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
            if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
            var wsu = typo.wordSpacingUnit || 'px';
            if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
            if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
            if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
            return s;
        }

        // ── helpers ────────────────────────────────────────────────────
        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        var LAYOUT_OPTIONS = [
            { value: 'shelf', label: 'Shelf (spines)' },
            { value: 'cards', label: 'Cards (covers)' },
            { value: 'list',  label: 'List' },
        ];
        var STATUS_OPTIONS = [
            { value: 'read',    label: '✓ Read' },
            { value: 'reading', label: '▶ Reading' },
            { value: 'want',    label: '○ Want to read' },
        ];
        var SPINE_COLORS = [
            '#1d4ed8','#7c3aed','#b45309','#0f766e','#b91c1c',
            '#d97706','#065f46','#831843','#0e7490','#4338ca'
        ];

        // Stars renderer
        function renderStars(rating, color) {
            var out = [];
            for (var i = 1; i <= 5; i++) {
                out.push(el('span', { key: i, style: { color: i <= rating ? color : '#334155', fontSize: '12px' } }, '★'));
            }
            return el('span', {}, out);
        }

        // Status badge
        function statusBadge(status, a) {
            var bg = status === 'read' ? a.statusReadBg : status === 'reading' ? a.statusReadingBg : a.statusWantBg;
            var label = status === 'read' ? '✓ Read' : status === 'reading' ? '▶ Reading' : '○ Want';
            return el('span', {
                style: {
                    background: bg, color: '#fff',
                    borderRadius: '4px', padding: '1px 7px',
                    fontSize: '10px', fontWeight: '700', letterSpacing: '.04em'
                }
            }, label);
        }

        // ── SHELF LAYOUT ───────────────────────────────────────────────
        function renderShelf(a) {
            var books = a.books;
            var sw    = a.spineWidth || 46;
            var sh    = a.spineHeight || 190;

            var spineEls = books.map(function (b, idx) {
                // Main spine rect
                var spine = el('div', {
                    key: idx,
                    title: b.title + ' — ' + b.author,
                    style: {
                        width: sw + 'px',
                        height: sh + 'px',
                        background: b.coverColor || '#334155',
                        borderRadius: '3px 3px 3px 3px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: '0',
                        position: 'relative',
                        boxShadow: '-2px 2px 4px rgba(0,0,0,0.4), inset 2px 0 4px rgba(255,255,255,.15)',
                        cursor: 'default'
                    }
                },
                    // Title text — vertical
                    el('div', {
                        style: {
                            writingMode: 'vertical-rl',
                            textOrientation: 'mixed',
                            color: a.spineTextColor || '#ffffff',
                            fontSize: (a.spineFontSize || 11) + 'px',
                            fontWeight: '700', letterSpacing: '0.04em',
                            padding: '8px 4px',
                            maxHeight: (sh - 16) + 'px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.2',
                            textShadow: '0 1px 2px rgba(0,0,0,.5)'
                        }
                    }, b.title),
                    // Status dot at top
                    el('div', {
                        style: {
                            position: 'absolute', top: '5px', right: '4px',
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: b.status === 'read' ? '#4ade80' : b.status === 'reading' ? '#60a5fa' : '#fbbf24'
                        }
                    })
                );
                return spine;
            });

            // Shelf row (books + plank)
            var bookRow = el('div', {
                style: {
                    display: 'flex', alignItems: 'flex-end', gap: '3px',
                    padding: '12px 20px 0',
                    flexWrap: 'nowrap', overflowX: 'auto'
                }
            }, spineEls);

            var plank = el('div', {
                style: {
                    height: '16px', background: a.shelfColor || '#8B5E3C',
                    boxShadow: '0 4px 8px ' + (a.shelfShadow || '#5c3d1e'),
                    margin: '0 8px', borderRadius: '2px'
                }
            });

            return el(Fragment, {}, bookRow, plank);
        }

        // ── CARDS LAYOUT ───────────────────────────────────────────────
        function renderCards(a) {
            return el('div', {
                style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', padding: '20px' }
            },
                a.books.map(function (b, idx) {
                    // Book cover
                    var cover = el('div', {
                        style: {
                            width: '100%', paddingTop: '140%', position: 'relative',
                            background: b.coverColor || '#334155',
                            borderRadius: '4px 8px 8px 4px',
                            boxShadow: '-3px 3px 6px rgba(0,0,0,.4), inset 3px 0 6px rgba(255,255,255,.1)',
                            marginBottom: '10px'
                        }
                    },
                        el('div', {
                            style: {
                                position: 'absolute', inset: '0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'column', gap: '8px', padding: '12px'
                            }
                        },
                            el('div', { style: { color: '#ffffff', fontSize: '10px', fontWeight: '700', textAlign: 'center', lineHeight: '1.3', textShadow: '0 1px 3px rgba(0,0,0,.5)' } }, b.title),
                            el('div', { style: { color: 'rgba(255,255,255,.7)', fontSize: '9px', textAlign: 'center' } }, b.author)
                        )
                    );
                    var stars = a.showRating ? renderStars(b.rating, a.ratingColor || '#f59e0b') : null;
                    var status = a.showStatus ? statusBadge(b.status, a) : null;
                    var genre = (a.showGenre && b.genre) ? el('span', {
                        style: { background: a.genreBg || '#1e293b', color: a.genreColor || '#94a3b8', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: '600' }
                    }, b.genre) : null;

                    return el('div', {
                        key: idx,
                        style: {
                            background: a.cardBg || '#1e293b',
                            border: '1px solid ' + (a.cardBorderColor || '#334155'),
                            borderRadius: '10px', padding: '10px'
                        }
                    },
                        cover,
                        el('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
                            stars, genre, status
                        )
                    );
                })
            );
        }

        // ── LIST LAYOUT ────────────────────────────────────────────────
        function renderList(a) {
            return el('div', { style: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                a.books.map(function (b, idx) {
                    var colorDot = el('div', {
                        style: { width: '36px', height: '52px', background: b.coverColor || '#334155', borderRadius: '2px 4px 4px 2px', flexShrink: '0', boxShadow: 'inset 2px 0 4px rgba(255,255,255,.1)' }
                    });
                    var meta = el('div', { style: { flex: '1', minWidth: '0' } },
                        el('div', { className: 'bkbg-bsh-body', style: { color: a.titleColor || '#f5deb3', marginBottom: '2px' } }, b.title),
                        a.showAuthor ? el('div', { className: 'bkbg-bsh-body-author', style: { color: a.authorColor || '#94a3b8', marginBottom: '4px' } }, b.author) : null,
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                            a.showRating ? renderStars(b.rating, a.ratingColor || '#f59e0b') : null,
                            a.showGenre && b.genre ? el('span', { style: { background: a.genreBg || '#1e293b', color: a.genreColor || '#94a3b8', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' } }, b.genre) : null,
                            a.showStatus ? statusBadge(b.status, a) : null,
                            (a.showYear && b.year) ? el('span', { style: { color: a.authorColor || '#94a3b8', fontSize: '11px' } }, String(b.year)) : null
                        )
                    );
                    return el('div', { key: idx, style: { display: 'flex', gap: '12px', alignItems: 'center' } }, colorDot, meta);
                })
            );
        }

        // ── EDIT ──────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var colorSettings = [
                { label: __('Background'),     value: a.bgColor,          onChange: function (v) { set({ bgColor: v || '#1c1410' }); } },
                { label: __('Header BG'),       value: a.headerBg,         onChange: function (v) { set({ headerBg: v || '#2d1f14' }); } },
                { label: __('Title'),           value: a.titleColor,       onChange: function (v) { set({ titleColor: v || '#f5deb3' }); } },
                { label: __('Shelf wood'),      value: a.shelfColor,       onChange: function (v) { set({ shelfColor: v || '#8B5E3C' }); } },
                { label: __('Shelf shadow'),    value: a.shelfShadow,      onChange: function (v) { set({ shelfShadow: v || '#5c3d1e' }); } },
                { label: __('Spine text'),      value: a.spineTextColor,   onChange: function (v) { set({ spineTextColor: v || '#ffffff' }); } },
                { label: __('Card BG'),         value: a.cardBg,           onChange: function (v) { set({ cardBg: v || '#1e293b' }); } },
                { label: __('Card border'),     value: a.cardBorderColor,  onChange: function (v) { set({ cardBorderColor: v || '#334155' }); } },
                { label: __('Author text'),     value: a.authorColor,      onChange: function (v) { set({ authorColor: v || '#94a3b8' }); } },
                { label: __('Rating stars'),    value: a.ratingColor,      onChange: function (v) { set({ ratingColor: v || '#f59e0b' }); } },
                { label: __('Genre BG'),        value: a.genreBg,          onChange: function (v) { set({ genreBg: v || '#1e293b' }); } },
                { label: __('Genre text'),      value: a.genreColor,       onChange: function (v) { set({ genreColor: v || '#94a3b8' }); } },
                { label: __('Status: Read'),    value: a.statusReadBg,     onChange: function (v) { set({ statusReadBg: v || '#166534' }); } },
                { label: __('Status: Reading'), value: a.statusReadingBg,  onChange: function (v) { set({ statusReadingBg: v || '#1e40af' }); } },
                { label: __('Status: Want'),    value: a.statusWantBg,     onChange: function (v) { set({ statusWantBg: v || '#78350f' }); } },
            ];

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Shelf Settings'), initialOpen: true },
                    el(TextControl, {
                        label: __('Title'), value: a.shelfTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ shelfTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show title'), checked: a.showTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTitle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Layout'), value: a.layout, options: LAYOUT_OPTIONS, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show rating'), checked: a.showRating, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showRating: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show status'), checked: a.showStatus, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showStatus: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show genre'), checked: a.showGenre, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showGenre: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show author'), checked: a.showAuthor, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showAuthor: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show year'), checked: a.showYear, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showYear: v }); }
                    })
                ),
                // Spine options (shelf only)
                a.layout === 'shelf' ? el(PanelBody, { title: __('Spine Size'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Spine width (px)'), value: a.spineWidth, min: 28, max: 80, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ spineWidth: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Spine height (px)'), value: a.spineHeight, min: 80, max: 320, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ spineHeight: v }); }
                    }),
                    ) : null,
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Body Text', 'blockenberg'), value: a.typoBody, onChange: function (v) { set({ typoBody: v }); } }),
                    el(RangeControl, {
                        label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                                            label: __('Spine font size'), value: a.spineFontSize, min: 8, max: 18, __nextHasNoMarginBottom: true,
                                            onChange: function (v) { set({ spineFontSize: v }); }
                                        })
                ),
                // Books editor
                el(PanelBody, { title: __('Books (' + a.books.length + ')'), initialOpen: false },
                    a.books.map(function (b, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: (idx + 1) + '. ' + b.title.substring(0, 30),
                            initialOpen: false
                        },
                            el(TextControl, {
                                label: __('Title'), value: b.title, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ books: upd(a.books, idx, 'title', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Author'), value: b.author, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ books: upd(a.books, idx, 'author', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Genre'), value: b.genre || '', __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ books: upd(a.books, idx, 'genre', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Year'), value: String(b.year || ''), __nextHasNoMarginBottom: true,
                                onChange: function (v) { var n = parseInt(v, 10); set({ books: upd(a.books, idx, 'year', isNaN(n) ? 0 : n) }); }
                            }),
                            el(SelectControl, {
                                label: __('Status'), value: b.status, options: STATUS_OPTIONS, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ books: upd(a.books, idx, 'status', v) }); }
                            }),
                            el(RangeControl, {
                                label: __('Rating (0–5)'), value: b.rating, min: 0, max: 5, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ books: upd(a.books, idx, 'rating', v) }); }
                            }),
                            // Color swatches
                            el('div', { style: { marginBottom: '10px' } },
                                el('p', { style: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px' } }, __('Cover color')),
                                el('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                                    SPINE_COLORS.map(function (c) {
                                        return el('button', {
                                            key: c,
                                            onClick: function () { set({ books: upd(a.books, idx, 'coverColor', c) }); },
                                            style: {
                                                width: '26px', height: '26px', borderRadius: '4px', border: b.coverColor === c ? '3px solid #f8fafc' : '1px solid #475569',
                                                background: c, cursor: 'pointer', padding: '0'
                                            }
                                        });
                                    })
                                )
                            ),
                            el(Button, {
                                variant: 'secondary', isDestructive: true, __nextHasNoMarginBottom: true,
                                onClick: function () { var n = a.books.slice(); n.splice(idx, 1); set({ books: n }); }
                            }, __('Remove book'))
                        );
                    }),
                    el(Button, {
                        variant: 'primary', __nextHasNoMarginBottom: true,
                        onClick: function () {
                            var cols = SPINE_COLORS;
                            set({ books: a.books.concat([{
                                title: 'New Book', author: 'Author', genre: '', year: new Date().getFullYear(),
                                coverColor: cols[a.books.length % cols.length], status: 'want', rating: 0
                            }]) });
                        }
                    }, __('+ Add book'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: colorSettings
                })
            );

            // Header
            var header = a.showTitle ? el('div', {
                style: { padding: '20px 20px 10px', background: a.headerBg || '#2d1f14' }
            },
                el('h2', { className: 'bkbg-bsh-title', style: { color: a.titleColor || '#f5deb3', margin: '0' } }, a.shelfTitle)
            ) : null;

            // Shelf body
            var body = a.layout === 'shelf' ? renderShelf(a)
                     : a.layout === 'cards' ? renderCards(a)
                     : renderList(a);

            return el(Fragment, {},
                inspector,
                el('div', Object.assign({}, useBlockProps(), {
                    style: Object.assign({
                        background: a.bgColor || '#1c1410',
                        borderRadius: a.borderRadius + 'px',
                        overflow: 'hidden',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        minHeight: '100px'
                    }, _tv(a.typoTitle, '--bkbg-bsh-title-'), _tv(a.typoBody, '--bkbg-bsh-body-'))
                }), header, body)
            );
        }

        registerBlockType('blockenberg/book-shelf', {
            edit: Edit,
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-book-shelf-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();
