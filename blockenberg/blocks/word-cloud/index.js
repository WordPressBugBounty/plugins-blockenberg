( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
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
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'cloudTypo', attrs, '--bkwcl-cl-');
        return v;
    }

    /* ── helpers ──────────────────────────────────────────────────────────────── */
    function weightToSize(w, min, max) {
        var clamped = Math.max(1, Math.min(10, w));
        return Math.round(min + (max - min) * ((clamped - 1) / 9));
    }

    function getPalette(paletteStr) {
        return (paletteStr || '#6c3fb5').split(',').map(function (c) { return c.trim(); }).filter(Boolean);
    }

    function getWordColor(word, idx, colorMode, palette, single) {
        if (word.colorOverride) { return word.colorOverride; }
        if (colorMode === 'single') { return single || '#6c3fb5'; }
        var cols = getPalette(palette);
        return cols[idx % cols.length] || '#6c3fb5';
    }

    /* seeded shuffle — deterministic so save() renders same order each time */
    function seededShuffle(arr, seed) {
        var out = arr.slice();
        var s = seed || 42;
        for (var i = out.length - 1; i > 0; i--) {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            var j = Math.abs(s) % (i + 1);
            var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
        }
        return out;
    }

    function sortWords(words, order, seed) {
        if (order === 'asc')    { return words.slice().sort(function (a, b) { return a.weight - b.weight; }); }
        if (order === 'desc')   { return words.slice().sort(function (a, b) { return b.weight - a.weight; }); }
        if (order === 'alpha')  { return words.slice().sort(function (a, b) { return a.text.localeCompare(b.text); }); }
        if (order === 'random') { return seededShuffle(words, seed); }
        return words;
    }

    /* ── hex → rgba ───────────────────────────────────────────────────────────── */
    function hexToRgba(hex, alpha) {
        var r = 0, g = 0, b = 0;
        var h = hex.replace('#', '');
        if (h.length === 3) { h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; }
        r = parseInt(h.substring(0, 2), 16);
        g = parseInt(h.substring(2, 4), 16);
        b = parseInt(h.substring(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha/100) + ')';
    }

    /* ── word render ──────────────────────────────────────────────────────────── */
    function renderWord(word, idx, displayIdx, a, isEdit) {
        var color = getWordColor(word, displayIdx, a.colorMode, a.palette, a.singleColor);
        var size  = weightToSize(word.weight, a.minFontSize, a.maxFontSize);

        var style = {
            fontSize: size + 'px',
            fontWeight: a.fontWeight,
            color: color,
            lineHeight: a.lineHeight,
            letterSpacing: a.letterSpacing + 'em',
            cursor: word.url ? 'pointer' : 'default',
            display: 'inline-block',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, opacity 0.2s ease',
        };
        if (a.showWordBg) {
            style.background = hexToRgba(color, a.wordBgOpacity);
            style.borderRadius = a.wordBorderRadius + 'px';
            style.padding = a.wordPaddingV + 'px ' + a.wordPaddingH + 'px';
        }

        if (!isEdit && word.url) {
            return el('a', {
                key: idx, href: word.url, className: 'bkwc-word',
                'data-hover': a.hoverEffect,
                style: style
            }, word.text);
        }
        return el('span', {
            key: idx, className: 'bkwc-word',
            'data-hover': a.hoverEffect,
            style: style
        }, word.text);
    }

    /* ── WordRow editor component ──────────────────────────────────────────── */
    function WordRow(props) {
        var word = props.word, idx = props.idx;
        var onUpdate = props.onUpdate, onRemove = props.onRemove;
        var expandState = useState(false);
        var expanded = expandState[0], setExpanded = expandState[1];

        return el('div', { style: { border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '6px', overflow: 'hidden' } },
            el('div', {
                style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', background: '#f9fafb', cursor: 'pointer' },
                onClick: function () { setExpanded(!expanded); }
            },
                el('span', { style: { flex: 1, fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, word.text || '(empty)'),
                el('span', { style: { fontSize: '11px', color: '#9ca3af', minWidth: '40px' } }, 'w:' + word.weight),
                el('span', { style: { fontSize: '12px', color: '#9ca3af' } }, expanded ? '▲' : '▼'),
                el(Button, { isSmall: true, variant: 'tertiary', isDestructive: true, onClick: function (e) { e.stopPropagation(); onRemove(idx); } }, '×')
            ),
            expanded && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                el(TextControl, { label: __('Word / Phrase', 'blockenberg'), value: word.text, onChange: function (v) { onUpdate(idx, 'text', v); } }),
                el(RangeControl, { label: __('Weight (1=tiny → 10=huge)', 'blockenberg'), value: word.weight, min: 1, max: 10, onChange: function (v) { onUpdate(idx, 'weight', v); } }),
                el(TextControl, { label: __('Link URL (optional)', 'blockenberg'), value: word.url, onChange: function (v) { onUpdate(idx, 'url', v); } }),
                el(BkbgColorSwatch, { label: __('Color Override (optional hex)', 'blockenberg'), value: word.colorOverride, onChange: function (v) { onUpdate(idx, 'colorOverride', v); } })
            )
        );
    }

    /* ── BkbgColorSwatch ─────────────────────────────────────────── */
    function BkbgColorSwatch(props) {
        var st = useState(false); var isOpen = st[0]; var setIsOpen = st[1];
        return el(Fragment, null,
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' } }, props.label),
                el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: props.value || '#fff', cursor: 'pointer', padding: 0 }, onClick: function () { setIsOpen(!isOpen); } })
            ),
            isOpen && el(Popover, { onClose: function () { setIsOpen(false); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: props.value, enableAlpha: true, onChange: props.onChange })))
        );
    }

    /* ── BkbgMultiColorControl ──────────────────────────────────────── */
    function BkbgMultiColorControl(props) {
        var label = props.label;
        var value = props.value || '';
        var onChange = props.onChange;
        var colors = value.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
        var st2 = useState(-1); var openIdx = st2[0]; var setOpenIdx = st2[1];
        return el(Fragment, null,
            el('div', { style: { marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: '4px' } }, label),
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
                    colors.map(function (c, i) {
                        return el('div', { key: i, style: { position: 'relative', display: 'inline-flex' } },
                            el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: c, cursor: 'pointer', padding: 0 }, onClick: function () { setOpenIdx(openIdx === i ? -1 : i); } }),
                            el('button', { type: 'button', 'aria-label': 'Remove', style: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#d00', color: '#fff', fontSize: '10px', lineHeight: '14px', cursor: 'pointer', padding: 0, textAlign: 'center' }, onClick: function () { var n = colors.slice(); n.splice(i, 1); onChange(n.join(',')); } }, '×'),
                            openIdx === i && el(Popover, { onClose: function () { setOpenIdx(-1); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: c, enableAlpha: true, onChange: function (v) { var n = colors.slice(); n[i] = v; onChange(n.join(',')); } })))
                        );
                    }),
                    el(Button, { isSmall: true, variant: 'secondary', onClick: function () { onChange(value ? value + ',#6c3fb5' : '#6c3fb5'); }, style: { height: 28, minWidth: 28 } }, '+')
                )
            )
        );
    }

    registerBlockType('blockenberg/word-cloud', {
        title: __('Word Cloud', 'blockenberg'),
        icon: 'tag',
        category: 'bkbg-charts',
        description: __('Visual word cloud with weighted font sizes.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            function updateWord(idx, key, val) {
                var arr = a.words.slice();
                arr[idx] = Object.assign({}, arr[idx]);
                arr[idx][key] = val;
                setAttributes({ words: arr });
            }
            function addWord() {
                setAttributes({ words: a.words.concat([{ text: 'New Word', weight: 5, url: '', colorOverride: '' }]) });
            }
            function removeWord(idx) {
                setAttributes({ words: a.words.filter(function (_, i) { return i !== idx; }) });
            }

            var colorModeOptions = [
                { label: __('Cycle Palette', 'blockenberg'), value: 'palette' },
                { label: __('Single Color',  'blockenberg'), value: 'single' },
            ];
            var sortOptions = [
                { label: __('Random (shuffled)', 'blockenberg'), value: 'random' },
                { label: __('Largest first',     'blockenberg'), value: 'desc' },
                { label: __('Smallest first',    'blockenberg'), value: 'asc' },
                { label: __('Alphabetical',      'blockenberg'), value: 'alpha' },
            ];
            var hoverOptions = [
                { label: __('Scale up', 'blockenberg'), value: 'scale' },
                { label: __('Bold',     'blockenberg'), value: 'bold' },
                { label: __('None',     'blockenberg'), value: 'none' },
            ];
            var textAlignOptions = [
                { label: __('Center',  'blockenberg'), value: 'center' },
                { label: __('Left',    'blockenberg'), value: 'left' },
                { label: __('Justify', 'blockenberg'), value: 'justify' },
            ];
            var weightOptions = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 }, { label: '800', value: 800 },
            ];

            var displayed = sortWords(a.words, a.sortOrder, a.shuffleSeed);
            var blockProps = useBlockProps({ className: 'bkwc-wrap' });

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* — Words — */
                    el(PanelBody, { title: __('Words', 'blockenberg') + ' (' + a.words.length + ')', initialOpen: true },
                        a.words.map(function (w, idx) {
                            return el(WordRow, { key: idx, word: w, idx: idx, onUpdate: updateWord, onRemove: removeWord });
                        }),
                        el(Button, { variant: 'primary', onClick: addWord, style: { width: '100%', marginTop: '8px' } },
                            __('+ Add Word', 'blockenberg'))
                    ),

                    /* — Layout — */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Word Order', 'blockenberg'), value: a.sortOrder, options: sortOptions, onChange: function (v) { setAttributes({ sortOrder: v }); } }),
                        a.sortOrder === 'random' && el(RangeControl, { label: __('Shuffle Seed (change for different layout)', 'blockenberg'), value: a.shuffleSeed, min: 1, max: 999, onChange: function (v) { setAttributes({ shuffleSeed: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 4, max: 48, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(RangeControl, { label: __('Padding Vertical (px)', 'blockenberg'), value: a.paddingV, min: 0, max: 120, onChange: function (v) { setAttributes({ paddingV: v }); } }),
                        el(RangeControl, { label: __('Padding Horizontal (px)', 'blockenberg'), value: a.paddingH, min: 0, max: 120, onChange: function (v) { setAttributes({ paddingH: v }); } }),
                        el(SelectControl, { label: __('Text Align', 'blockenberg'), value: a.textAlign, options: textAlignOptions, onChange: function (v) { setAttributes({ textAlign: v }); } })
                    ),

                    /* — Word Tags — */
                    el(PanelBody, { title: __('Word Tags Style', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Background per Word', 'blockenberg'), checked: a.showWordBg, onChange: function (v) { setAttributes({ showWordBg: v }); }, __nextHasNoMarginBottom: true }),
                        a.showWordBg && el(RangeControl, { label: __('Background Opacity (%)', 'blockenberg'), value: a.wordBgOpacity, min: 4, max: 40, onChange: function (v) { setAttributes({ wordBgOpacity: v }); } }),
                        a.showWordBg && el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.wordBorderRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ wordBorderRadius: v }); } }),
                        a.showWordBg && el(RangeControl, { label: __('Tag Padding V (px)', 'blockenberg'), value: a.wordPaddingV, min: 0, max: 20, onChange: function (v) { setAttributes({ wordPaddingV: v }); } }),
                        a.showWordBg && el(RangeControl, { label: __('Tag Padding H (px)', 'blockenberg'), value: a.wordPaddingH, min: 0, max: 40, onChange: function (v) { setAttributes({ wordPaddingH: v }); } }),
                        el(SelectControl, { label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect, options: hoverOptions, onChange: function (v) { setAttributes({ hoverEffect: v }); } })
                    ),

                    /* — Colors — */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Container Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || 'transparent' }); } },
                            { label: __('Single Color', 'blockenberg'), value: a.singleColor, onChange: function (v) { setAttributes({ singleColor: v || '#6c3fb5' }); } },
                        ]
                    }),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Cloud', 'blockenberg'), 'cloudTypo', a, setAttributes),
                        el(RangeControl, { label: __('Min Font Size (px)', 'blockenberg'), value: a.minFontSize, min: 10, max: 32, onChange: function (v) { setAttributes({ minFontSize: v }); } }),
                        el(RangeControl, { label: __('Max Font Size (px)', 'blockenberg'), value: a.maxFontSize, min: 24, max: 100, onChange: function (v) { setAttributes({ maxFontSize: v }); } }),
                        el(SelectControl, { label: __('Font Weight', 'blockenberg'), value: a.fontWeight, options: weightOptions, onChange: function (v) { setAttributes({ fontWeight: parseInt(v, 10) }); } }),
                        el(RangeControl, { label: __('Letter Spacing (em ×10)', 'blockenberg'), value: Math.round(a.letterSpacing * 10), min: -2, max: 10, onChange: function (v) { setAttributes({ letterSpacing: v / 10 }); } }),
                        el(RangeControl, { label: __('Line Height (×10)', 'blockenberg'), value: Math.round(a.lineHeight * 10), min: 10, max: 24, onChange: function (v) { setAttributes({ lineHeight: v / 10 }); } })
                    ),
el(PanelBody, { title: __('Color Mode', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Color Mode', 'blockenberg'), value: a.colorMode, options: colorModeOptions, onChange: function (v) { setAttributes({ colorMode: v }); } }),
                        a.colorMode === 'palette' && el(BkbgMultiColorControl, {
                            label: __('Palette (comma-separated hex)', 'blockenberg'),
                            value: a.palette,
                            onChange: function (v) { setAttributes({ palette: v }); }
                        })
                    )
                ),

                /* ── Canvas ─────────────────────────────────────────────────── */
                el('div', {
                    ...blockProps,
                    style: Object.assign({}, getTypoCssVars(a), { background: a.bgColor, padding: a.paddingV + 'px ' + a.paddingH + 'px', textAlign: a.textAlign })
                },
                    el('div', { className: 'bkwc-cloud', style: { display: 'flex', flexWrap: 'wrap', justifyContent: a.textAlign === 'left' ? 'flex-start' : 'center', gap: a.gap + 'px', lineHeight: a.lineHeight } },
                        displayed.map(function (w, displayIdx) {
                            var origIdx = a.words.indexOf(w);
                            return renderWord(w, origIdx, displayIdx, a, true);
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkwc-wrap' });
            var displayed = sortWords(a.words, a.sortOrder, a.shuffleSeed);

            return el('div', {
                ...blockProps,
                'data-hover': a.hoverEffect,
                style: Object.assign({}, getTypoCssVars(a), { background: a.bgColor, padding: a.paddingV + 'px ' + a.paddingH + 'px', textAlign: a.textAlign })
            },
                el('div', {
                    className: 'bkwc-cloud',
                    style: { display: 'flex', flexWrap: 'wrap', justifyContent: a.textAlign === 'left' ? 'flex-start' : 'center', gap: a.gap + 'px', lineHeight: a.lineHeight }
                },
                    displayed.map(function (w, displayIdx) {
                        var origIdx = a.words.indexOf(w);
                        return renderWord(w, origIdx, displayIdx, a, false);
                    })
                )
            );
        }
    });
}() );
