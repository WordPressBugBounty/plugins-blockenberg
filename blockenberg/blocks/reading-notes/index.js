( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var NOTE_TYPES = [
        { label: '💬 Quote',   value: 'quote'   },
        { label: '💡 Insight', value: 'insight' },
        { label: '❓ Question',value: 'question' },
        { label: '📝 Summary', value: 'summary'  }
    ];

    function noteIcon(type) {
        if (type === 'quote')    return '"';
        if (type === 'insight')  return '💡';
        if (type === 'question') return '?';
        return '📝';
    }

    function getNoteStyle(type, a) {
        if (type === 'quote')    return { bg: a.quoteBg,    color: a.quoteColor,    accent: a.quoteAccent    };
        if (type === 'insight')  return { bg: a.insightBg,  color: a.insightColor,  accent: a.insightAccent  };
        if (type === 'question') return { bg: a.questionBg, color: a.questionColor, accent: a.questionAccent };
        return                          { bg: a.summaryBg,  color: a.summaryColor,  accent: a.summaryAccent  };
    }

    function renderStars(rating, starColor) {
        var stars = '';
        for (var i = 1; i <= 5; i++) { stars += i <= rating ? '★' : '☆'; }
        return el('span', { style: { color: starColor, fontSize: '18px', letterSpacing: 2 } }, stars);
    }

    /* ── ES5 update helpers ──────────────────────────────── */
    function updateNote(notes, idx, field, val) {
        return notes.map(function (n, i) {
            if (i !== idx) return n;
            var u = {}; u[field] = val;
            return Object.assign({}, n, u);
        });
    }
    function addNote(notes) {
        return notes.concat([{ type: 'insight', text: 'New note', source: '' }]);
    }
    function removeNote(notes, idx) {
        return notes.filter(function (_, i) { return i !== idx; });
    }

    registerBlockType('blockenberg/reading-notes', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrn-tt-'));
                    Object.assign(s, _tvFn(a.noteTypo || {}, '--bkrn-nt-'));
                }
                return { className: 'bkbg-rn-editor', style: s };
            })());

            function renderPreview() {
                return el('div', {
                    className: 'bkbg-rn-block',
                    style: { background: a.bgColor || undefined, boxSizing: 'border-box' }
                },
                    /* Header */
                    a.showHeader && el('div', {
                        className: 'bkbg-rn-header',
                        style: {
                            background: a.headerBg, color: a.headerColor,
                            padding: '24px 28px', borderRadius: a.borderRadius + 'px',
                            marginBottom: a.gap + 'px', display: 'flex', alignItems: 'center', gap: '20px'
                        }
                    },
                        el('div', { className: 'bkbg-rn-cover-emoji', style: { fontSize: '48px', lineHeight: 1 } }, (a.coverEmojiType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(a.coverEmojiType, a.coverEmoji, a.coverEmojiDashicon, a.coverEmojiImageUrl, a.coverEmojiDashiconColor) : a.coverEmoji),
                        el('div', { style: { flex: 1 } },
                            el('h3', { className: 'bkbg-rn-book-title', style: { margin: '0 0 4px', color: a.headerColor } }, a.bookTitle),
                            a.showAuthor && a.author && el('div', { style: { fontSize: '14px', opacity: '.8', marginBottom: '6px' } }, 'by ' + a.author),
                            el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' } },
                                a.showGenre && a.genre && el('span', {
                                    style: {
                                        fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
                                        background: 'rgba(255,255,255,.15)', color: a.headerColor
                                    }
                                }, a.genre),
                                a.showRating && renderStars(a.rating, a.starColor),
                                a.showDateRead && a.dateRead && el('span', { style: { fontSize: '12px', opacity: '.7' } }, a.dateRead)
                            )
                        )
                    ),
                    /* Notes list */
                    el('div', {
                        className: 'bkbg-rn-notes',
                        style: { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' }
                    },
                        a.notes.map(function (note, idx) {
                            var ns = getNoteStyle(note.type, a);
                            return el('div', {
                                key: idx,
                                className: 'bkbg-rn-note bkbg-rn-note--' + note.type,
                                style: {
                                    background: ns.bg, borderLeft: '4px solid ' + ns.accent,
                                    borderRadius: a.borderRadius + 'px',
                                    padding: '14px 18px',
                                    display: 'flex', gap: '14px', alignItems: 'flex-start'
                                }
                            },
                                el('span', {
                                    style: {
                                        fontSize: note.type === 'quote' ? '28px' : '18px',
                                        color: ns.accent, lineHeight: 1, flexShrink: 0, fontFamily: 'Georgia, serif',
                                        marginTop: note.type === 'quote' ? '-4px' : 0
                                    }
                                }, noteIcon(note.type)),
                                el('div', { style: { flex: 1 } },
                                    el('span', {
                                        style: {
                                            display: 'inline-block', marginBottom: '6px', fontSize: '10px',
                                            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em',
                                            color: ns.accent
                                        }
                                    }, note.type),
                                    el('p', { className: 'bkbg-rn-note-text', style: { margin: 0, color: ns.color } }, note.text),
                                    note.source && el('span', { style: { fontSize: '12px', color: ns.accent, marginTop: '6px', display: 'block', opacity: '.8' } }, '— ' + note.source)
                                )
                            );
                        })
                    )
                );
            }

            var inspector = el(InspectorControls, {},
                /* Book Details */
                el(PanelBody, { title: 'Book / Article Details', initialOpen: true },
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Title', value: a.bookTitle, onChange: function (v) { set({ bookTitle: v }); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Author', value: a.author, onChange: function (v) { set({ author: v }); } }),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Genre / Category', value: a.genre, onChange: function (v) { set({ genre: v }); } }),
                    el(IP().IconPickerControl, IP().iconPickerProps(a, set, { charAttr: 'coverEmoji', typeAttr: 'coverEmojiType', dashiconAttr: 'coverEmojiDashicon', imageUrlAttr: 'coverEmojiImageUrl', colorAttr: 'coverEmojiDashiconColor' })),
                    el(TextControl, { __nextHasNoMarginBottom: true, label: 'Date Read', value: a.dateRead, onChange: function (v) { set({ dateRead: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Rating (stars)', value: a.rating, min: 0, max: 5, step: 1, onChange: function (v) { set({ rating: v }); } })
                ),
                /* Display Toggles */
                el(PanelBody, { title: 'Display', initialOpen: false },
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Header', checked: a.showHeader, onChange: function (v) { set({ showHeader: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Author', checked: a.showAuthor, onChange: function (v) { set({ showAuthor: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Genre', checked: a.showGenre, onChange: function (v) { set({ showGenre: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Rating', checked: a.showRating, onChange: function (v) { set({ showRating: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Date Read', checked: a.showDateRead, onChange: function (v) { set({ showDateRead: v }); } }),
                    el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Layout', value: a.layout, options: [{ label: 'List', value: 'list' }, { label: 'Masonry Grid', value: 'grid' }], onChange: function (v) { set({ layout: v }); } })
                ),
                /* Notes Manager */
                el(PanelBody, { title: 'Notes (' + a.notes.length + ')', initialOpen: true },
                    a.notes.map(function (note, idx) {
                        return el('div', {
                            key: idx,
                            style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 10, background: '#f8fafc' }
                        },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
                                el('strong', { style: { fontSize: 12 } }, '#' + (idx + 1) + ' ' + note.type),
                                el(Button, { isSmall: true, isDestructive: true, onClick: function () { set({ notes: removeNote(a.notes, idx) }); } }, '✕')
                            ),
                            el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Type', value: note.type, options: NOTE_TYPES, onChange: function (v) { set({ notes: updateNote(a.notes, idx, 'type', v) }); } }),
                            el('div', { style: { marginBottom: 6 } },
                                el('label', { style: { fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 } }, 'Text'),
                                el('textarea', {
                                    value: note.text, rows: 3,
                                    style: { width: '100%', fontSize: 12, padding: '5px 7px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box', fontFamily: 'inherit' },
                                    onChange: function (e) { set({ notes: updateNote(a.notes, idx, 'text', e.target.value) }); }
                                })
                            ),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: 'Source / Page (optional)', value: note.source || '', onChange: function (v) { set({ notes: updateNote(a.notes, idx, 'source', v) }); } })
                        );
                    }),
                    el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ notes: addNote(a.notes) }); } }, '+ Add Note')
                ),
                /* Spacing */
                el(PanelBody, { title: 'Spacing & Shape', initialOpen: false },
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Gap', value: a.gap, min: 4, max: 32, onChange: function (v) { set({ gap: v }); } }),
                    el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Border Radius', value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); } }),
                    ),
                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
                    TC && el(TC, { label: __('Note Text', 'blockenberg'), value: a.noteTypo || {}, onChange: function(v) { set({ noteTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: 'Header Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Header Background', value: a.headerBg, onChange: function (v) { set({ headerBg: v || '#1e293b' }); } },
                        { label: 'Header Text', value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                        { label: 'Star Color', value: a.starColor, onChange: function (v) { set({ starColor: v || '#f59e0b' }); } },
                        { label: 'Block Background', value: a.bgColor, onChange: function (v) { set({ bgColor: v || '' }); } }
                    ]
                }),
                el(PanelColorSettings, {
                    title: 'Note Type Colors', initialOpen: false,
                    colorSettings: [
                        { label: 'Quote Background', value: a.quoteBg, onChange: function (v) { set({ quoteBg: v || '#fdf2f8' }); } },
                        { label: 'Quote Text Color', value: a.quoteColor, onChange: function (v) { set({ quoteColor: v || '#86198f' }); } },
                        { label: 'Quote Accent', value: a.quoteAccent, onChange: function (v) { set({ quoteAccent: v || '#d946ef' }); } },
                        { label: 'Insight Background', value: a.insightBg, onChange: function (v) { set({ insightBg: v || '#eff6ff' }); } },
                        { label: 'Insight Text Color', value: a.insightColor, onChange: function (v) { set({ insightColor: v || '#1d4ed8' }); } },
                        { label: 'Insight Accent', value: a.insightAccent, onChange: function (v) { set({ insightAccent: v || '#3b82f6' }); } },
                        { label: 'Question Background', value: a.questionBg, onChange: function (v) { set({ questionBg: v || '#fffbeb' }); } },
                        { label: 'Question Text Color', value: a.questionColor, onChange: function (v) { set({ questionColor: v || '#92400e' }); } },
                        { label: 'Question Accent', value: a.questionAccent, onChange: function (v) { set({ questionAccent: v || '#f59e0b' }); } },
                        { label: 'Summary Background', value: a.summaryBg, onChange: function (v) { set({ summaryBg: v || '#f0fdf4' }); } },
                        { label: 'Summary Text Color', value: a.summaryColor, onChange: function (v) { set({ summaryColor: v || '#14532d' }); } },
                        { label: 'Summary Accent', value: a.summaryAccent, onChange: function (v) { set({ summaryAccent: v || '#22c55e' }); } }
                    ]
                })
            );

            return el(Fragment, {}, inspector, el('div', blockProps, renderPreview()));
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-reading-notes-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );
