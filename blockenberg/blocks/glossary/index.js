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
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;

    var _glTC, _glTV;
    function _tc() { return _glTC || (_glTC = window.bkbgTypographyControl); }
    function _tv() { return _glTV || (_glTV = window.bkbgTypoCssVars); }

    var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    function uid() {
        return 'gl-' + Math.random().toString(36).slice(2, 9);
    }

    function groupByLetter(terms) {
        var map = {};
        (terms || []).forEach(function (t) {
            var letter = (t.term || '?').charAt(0).toUpperCase();
            if (!map[letter]) map[letter] = [];
            map[letter].push(t);
        });
        return map;
    }

    function TermEditor(props) {
        var term = props.term;
        var onChange = props.onChange;
        var onRemove = props.onRemove;
        return el(PanelBody, {
            title: (term.term || __('(empty term)', 'blockenberg')).slice(0, 32),
            initialOpen: false
        },
            el(TextControl, {
                label: __('Term', 'blockenberg'),
                value: term.term,
                onChange: function (v) { onChange({ term: v }); }
            }),
            el(TextareaControl, {
                label: __('Definition', 'blockenberg'),
                value: term.definition,
                rows: 3,
                onChange: function (v) { onChange({ definition: v }); }
            }),
            el(Button, {
                isDestructive: true, isSmall: true,
                style: { marginTop: '4px' },
                onClick: onRemove
            }, __('Remove term', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/glossary', {
        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = function (obj) { props.setAttributes(obj); };

            var terms = attrs.terms || [];

            function addTerm() {
                setAttr({ terms: terms.concat([{ id: uid(), term: '', definition: '' }]) });
            }
            function updateTerm(id, patch) {
                setAttr({ terms: terms.map(function (t) { return t.id === id ? Object.assign({}, t, patch) : t; }) });
            }
            function removeTerm(id) {
                setAttr({ terms: terms.filter(function (t) { return t.id !== id; }) });
            }

            var grouped = groupByLetter(terms);
            var usedLetters = Object.keys(grouped).sort();

            var wrapStyle = { paddingTop: attrs.paddingTop + 'px', paddingBottom: attrs.paddingBottom + 'px' };
            if (attrs.bgColor) wrapStyle.background = attrs.bgColor;

            var blockProps = useBlockProps({ style: Object.assign(wrapStyle, _tv()(attrs.typoTitle, '--bkbg-gl-tt-'), _tv()(attrs.typoTerm, '--bkbg-gl-tm-'), _tv()(attrs.typoDef, '--bkbg-gl-df-'), _tv()(attrs.typoLetterHead, '--bkbg-gl-lh-')) });

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Terms', 'blockenberg'), initialOpen: true },
                        terms.map(function (t) {
                            return el(TermEditor, {
                                key: t.id,
                                term: t,
                                onChange: function (patch) { updateTerm(t.id, patch); },
                                onRemove: function () { removeTerm(t.id); }
                            });
                        }),
                        el(Button, {
                            variant: 'primary', isSmall: true,
                            style: { marginTop: '12px', width: '100%', justifyContent: 'center' },
                            onClick: addTerm
                        }, __('+ Add Term', 'blockenberg'))
                    ),

                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show title', 'blockenberg'),
                            checked: attrs.showTitle,
                            onChange: function (v) { setAttr({ showTitle: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show subtitle', 'blockenberg'),
                            checked: attrs.showSubtitle,
                            onChange: function (v) { setAttr({ showSubtitle: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('A–Z navigation bar', 'blockenberg'),
                            checked: attrs.showAlphaNav,
                            onChange: function (v) { setAttr({ showAlphaNav: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Search box', 'blockenberg'),
                            checked: attrs.showSearch,
                            onChange: function (v) { setAttr({ showSearch: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Group by letter', 'blockenberg'),
                            checked: attrs.groupByLetter,
                            onChange: function (v) { setAttr({ groupByLetter: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Show letter headings', 'blockenberg'),
                            checked: attrs.showLetterHead,
                            onChange: function (v) { setAttr({ showLetterHead: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Expandable definitions (accordion)', 'blockenberg'),
                            checked: attrs.expandable,
                            onChange: function (v) { setAttr({ expandable: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(SelectControl, {
                            label: __('Columns', 'blockenberg'),
                            value: String(attrs.columns),
                            options: [
                                { label: '1', value: '1' },
                                { label: '2', value: '2' }
                            ],
                            onChange: function (v) { setAttr({ columns: parseInt(v, 10) }); }
                        })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc()({ label: __('Title', 'blockenberg'), value: attrs.typoTitle, onChange: function (v) { setAttr({ typoTitle: v }); } }),
                        _tc()({ label: __('Term', 'blockenberg'), value: attrs.typoTerm, onChange: function (v) { setAttr({ typoTerm: v }); } }),
                        _tc()({ label: __('Definition', 'blockenberg'), value: attrs.typoDef, onChange: function (v) { setAttr({ typoDef: v }); } }),
                        _tc()({ label: __('Letter Heading', 'blockenberg'), value: attrs.typoLetterHead, onChange: function (v) { setAttr({ typoLetterHead: v }); } }),
                        el(RangeControl, {
                            label: __('Card radius (px)', 'blockenberg'),
                            value: attrs.cardRadius, min: 0, max: 24,
                            onChange: function (v) { setAttr({ cardRadius: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: attrs.paddingTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: attrs.paddingBottom, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingBottom: v }); }
                        })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Accent', 'blockenberg'), value: attrs.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Title', 'blockenberg'), value: attrs.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#1e1b4b' }); } },
                            { label: __('Subtitle', 'blockenberg'), value: attrs.subtitleColor, onChange: function (v) { setAttr({ subtitleColor: v || '#6b7280' }); } },
                            { label: __('Term text', 'blockenberg'), value: attrs.termColor, onChange: function (v) { setAttr({ termColor: v || '#1e1b4b' }); } },
                            { label: __('Definition text', 'blockenberg'), value: attrs.defColor, onChange: function (v) { setAttr({ defColor: v || '#374151' }); } },
                            { label: __('Letter heading text', 'blockenberg'), value: attrs.letterHeadColor, onChange: function (v) { setAttr({ letterHeadColor: v || '#6c3fb5' }); } },
                            { label: __('Letter heading background', 'blockenberg'), value: attrs.letterHeadBg, onChange: function (v) { setAttr({ letterHeadBg: v || '#f5f3ff' }); } },
                            { label: __('Nav bar background', 'blockenberg'), value: attrs.navBg, onChange: function (v) { setAttr({ navBg: v || '#f3f4f6' }); } },
                            { label: __('Nav active button', 'blockenberg'), value: attrs.navActiveColor, onChange: function (v) { setAttr({ navActiveColor: v || '#ffffff' }); } },
                            { label: __('Item border', 'blockenberg'), value: attrs.itemBorder, onChange: function (v) { setAttr({ itemBorder: v || '#e5e7eb' }); } },
                            { label: __('Block background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    attrs.showTitle && el(RichText, {
                        tagName: 'h2',
                        className: 'bkbg-gl-title',
                        style: { color: attrs.titleColor, margin: '0 0 8px' },
                        value: attrs.title,
                        onChange: function (v) { setAttr({ title: v }); },
                        placeholder: __('Glossary title…', 'blockenberg')
                    }),
                    attrs.showSubtitle && el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-gl-subtitle',
                        style: { color: attrs.subtitleColor, margin: '0 0 24px' },
                        value: attrs.subtitle,
                        onChange: function (v) { setAttr({ subtitle: v }); },
                        placeholder: __('Optional subtitle…', 'blockenberg')
                    }),

                    attrs.showSearch && el('div', { className: 'bkbg-gl-search-wrap', style: { marginBottom: '16px' } },
                        el('input', {
                            type: 'text',
                            className: 'bkbg-gl-search',
                            placeholder: __('Search terms…', 'blockenberg'),
                            style: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid ' + (attrs.searchBorder || '#d1d5db'), fontSize: '14px', boxSizing: 'border-box' },
                            readOnly: true
                        })
                    ),

                    attrs.showAlphaNav && el('div', {
                        className: 'bkbg-gl-alpha-nav',
                        style: { display: 'flex', flexWrap: 'wrap', gap: '4px', background: attrs.navBg || '#f3f4f6', borderRadius: '8px', padding: '8px', marginBottom: '24px' }
                    },
                        ALPHABET.map(function (letter) {
                            var active = grouped[letter] && grouped[letter].length > 0;
                            return el('button', {
                                key: letter,
                                type: 'button',
                                className: 'bkbg-gl-nav-btn' + (active ? ' active' : ''),
                                style: {
                                    minWidth: '28px', height: '28px', borderRadius: '4px',
                                    border: 'none', cursor: active ? 'pointer' : 'default',
                                    background: active ? attrs.accentColor : 'transparent',
                                    color: active ? (attrs.navActiveColor || '#fff') : '#9ca3af',
                                    fontWeight: 600, fontSize: '13px'
                                }
                            }, letter);
                        })
                    ),

                    el('div', {
                        className: 'bkbg-gl-list',
                        style: { columns: attrs.columns > 1 ? attrs.columns : undefined, columnGap: '32px' }
                    },
                        terms.length === 0
                            ? el('p', { style: { color: '#9ca3af', textAlign: 'center', padding: '40px 0' } }, __('Add your first term in the sidebar →', 'blockenberg'))
                            : (attrs.groupByLetter
                                ? usedLetters.map(function (letter) {
                                    return el('div', { key: letter, className: 'bkbg-gl-letter-section', style: { breakInside: 'avoid', marginBottom: '24px' } },
                                        attrs.showLetterHead && el('div', {
                                            className: 'bkbg-gl-letter-head',
                                            style: { background: attrs.letterHeadBg || '#f5f3ff', color: attrs.letterHeadColor || '#6c3fb5', borderRadius: '6px', padding: '4px 12px', display: 'inline-block', marginBottom: '12px' }
                                        }, letter),
                                        (grouped[letter] || []).map(function (term) {
                                            return el('div', {
                                                key: term.id,
                                                className: 'bkbg-gl-item',
                                                style: { borderBottom: '1px solid ' + (attrs.itemBorder || '#e5e7eb'), padding: '10px 0' }
                                            },
                                                el('div', {
                                                    className: 'bkbg-gl-term',
                                                    style: { color: attrs.termColor || '#1e1b4b', marginBottom: '4px' }
                                                }, term.term || __('(term)', 'blockenberg')),
                                                el('div', {
                                                    className: 'bkbg-gl-def',
                                                    style: { color: attrs.defColor || '#374151' }
                                                }, term.definition || __('(definition)', 'blockenberg'))
                                            );
                                        })
                                    );
                                })
                                : terms.map(function (term) {
                                    return el('div', {
                                        key: term.id,
                                        className: 'bkbg-gl-item',
                                        style: { borderBottom: '1px solid ' + (attrs.itemBorder || '#e5e7eb'), padding: '10px 0' }
                                    },
                                el('div', { className: 'bkbg-gl-term', style: { color: attrs.termColor || '#1e1b4b', marginBottom: '4px' } }, term.term || __('(term)', 'blockenberg')),
                                el('div', { className: 'bkbg-gl-def', style: { color: attrs.defColor || '#374151' } }, term.definition || __('(definition)', 'blockenberg'))
                                    );
                                })
                            )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var terms = a.terms || [];
            var grouped = groupByLetter(terms);
            var usedLetters = Object.keys(grouped).sort();

            var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
            if (a.bgColor) wrapStyle.background = a.bgColor;

            var blockProps = wp.blockEditor.useBlockProps.save({ style: Object.assign(wrapStyle, _tv()(a.typoTitle, '--bkbg-gl-tt-'), _tv()(a.typoTerm, '--bkbg-gl-tm-'), _tv()(a.typoDef, '--bkbg-gl-df-'), _tv()(a.typoLetterHead, '--bkbg-gl-lh-')) });

            return el('div', blockProps,
                a.showTitle && el('h2', {
                    className: 'bkbg-gl-title',
                    style: { color: a.titleColor, margin: '0 0 8px' },
                    dangerouslySetInnerHTML: { __html: a.title }
                }),
                a.showSubtitle && el('p', {
                    className: 'bkbg-gl-subtitle',
                    style: { color: a.subtitleColor, margin: '0 0 24px' },
                    dangerouslySetInnerHTML: { __html: a.subtitle }
                }),

                a.showSearch && el('div', { className: 'bkbg-gl-search-wrap', style: { marginBottom: '16px' } },
                    el('input', {
                        type: 'text',
                        className: 'bkbg-gl-search',
                        placeholder: __('Search terms…', 'blockenberg'),
                        style: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid ' + (a.searchBorder || '#d1d5db'), fontSize: '14px', boxSizing: 'border-box' }
                    })
                ),

                a.showAlphaNav && el('div', {
                    className: 'bkbg-gl-alpha-nav',
                    style: { display: 'flex', flexWrap: 'wrap', gap: '4px', background: a.navBg || '#f3f4f6', borderRadius: '8px', padding: '8px', marginBottom: '24px' }
                },
                    ALPHABET.map(function (letter) {
                        var active = grouped[letter] && grouped[letter].length > 0;
                        return el('a', {
                            key: letter,
                            href: active ? '#gl-' + letter.toLowerCase() : undefined,
                            className: 'bkbg-gl-nav-btn' + (active ? ' active' : ''),
                            style: {
                                minWidth: '28px', height: '28px', lineHeight: '28px',
                                borderRadius: '4px', textAlign: 'center', display: 'inline-block',
                                textDecoration: 'none',
                                background: active ? a.accentColor : 'transparent',
                                color: active ? (a.navActiveColor || '#fff') : '#9ca3af',
                                fontWeight: 600, fontSize: '13px'
                            }
                        }, letter);
                    })
                ),

                el('div', {
                    className: 'bkbg-gl-list',
                    'data-opts': JSON.stringify({ expandable: a.expandable, showSearch: a.showSearch, columns: a.columns }),
                    style: { columns: a.columns > 1 ? a.columns : undefined, columnGap: '32px' }
                },
                    (a.groupByLetter
                        ? usedLetters.map(function (letter) {
                            return el('div', { key: letter, id: 'gl-' + letter.toLowerCase(), className: 'bkbg-gl-letter-section', style: { breakInside: 'avoid', marginBottom: '24px' } },
                                a.showLetterHead && el('div', {
                                    className: 'bkbg-gl-letter-head',
                                    style: { background: a.letterHeadBg || '#f5f3ff', color: a.letterHeadColor || '#6c3fb5', borderRadius: '6px', padding: '4px 12px', display: 'inline-block', marginBottom: '12px' }
                                }, letter),
                                (grouped[letter] || []).map(function (term) {
                                    return el('div', { key: term.id, className: 'bkbg-gl-item', 'data-term': (term.term || '').toLowerCase(), style: { borderBottom: '1px solid ' + (a.itemBorder || '#e5e7eb'), padding: '10px 0' } },
                                        el('div', { className: 'bkbg-gl-term', style: { color: a.termColor || '#1e1b4b', marginBottom: '4px', cursor: a.expandable ? 'pointer' : undefined } }, term.term),
                                        el('div', { className: 'bkbg-gl-def', style: { color: a.defColor || '#374151' } }, term.definition)
                                    );
                                })
                            );
                        })
                        : terms.map(function (term) {
                            return el('div', { key: term.id, className: 'bkbg-gl-item', 'data-term': (term.term || '').toLowerCase(), style: { borderBottom: '1px solid ' + (a.itemBorder || '#e5e7eb'), padding: '10px 0' } },
                                el('div', { className: 'bkbg-gl-term', style: { color: a.termColor || '#1e1b4b', marginBottom: '4px' } }, term.term),
                                el('div', { className: 'bkbg-gl-def', style: { color: a.defColor || '#374151' } }, term.definition)
                            );
                        })
                    )
                )
            );
        }
    });
}() );
