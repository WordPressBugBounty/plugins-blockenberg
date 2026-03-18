( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _dfnTC, _dfnTV;
    function _tc() { return _dfnTC || (_dfnTC = window.bkbgTypographyControl); }
    function _tv(typo, prefix) { return (_dfnTV || (_dfnTV = window.bkbgTypoCssVars))(typo, prefix); }

    var POS_OPTIONS = [
        { value: 'noun',       label: 'noun' },
        { value: 'verb',       label: 'verb' },
        { value: 'adjective',  label: 'adjective' },
        { value: 'adverb',     label: 'adverb' },
        { value: 'pronoun',    label: 'pronoun' },
        { value: 'preposition',label: 'preposition' },
        { value: 'conjunction',label: 'conjunction' },
        { value: 'interjection',label:'interjection' },
        { value: 'phrase',     label: 'phrase' },
        { value: 'abbreviation',label:'abbreviation' },
        { value: 'idiom',      label: 'idiom' }
    ];

    var STYLE_OPTIONS = [
        { value: 'card',     label: 'Card (bordered)' },
        { value: 'classic',  label: 'Classic (left accent)' },
        { value: 'minimal',  label: 'Minimal (no border)' },
        { value: 'spotlight',label: 'Spotlight (accent header)' }
    ];

    registerBlockType('blockenberg/definition-block', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var examples = attr.examples || [''];

            var blockProps = useBlockProps({ style: Object.assign({ paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px', '--bkbg-dfn-trm-fs': (attr.termFontSize || 24) + 'px', '--bkbg-dfn-sd-fs': (attr.shortDefFontSize || 16) + 'px', '--bkbg-dfn-ld-fs': (attr.longDefFontSize || 14) + 'px' }, _tv(attr.typoTerm || {}, '--bkbg-dfn-trm-'), _tv(attr.typoShortDef || {}, '--bkbg-dfn-sd-'), _tv(attr.typoLongDef || {}, '--bkbg-dfn-ld-')) });

            function updateExample(idx, val) {
                set({ examples: examples.map(function (e, i) { return i === idx ? val : e; }) });
            }

            /* card style */
            var wrapStyle = {
                background: attr.bgColor,
                borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden'
            };
            if (attr.style === 'card') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.padding = '20px 22px';
            } else if (attr.style === 'classic') {
                wrapStyle.borderLeft = '5px solid ' + attr.accentColor;
                wrapStyle.padding = '16px 20px';
            } else if (attr.style === 'minimal') {
                wrapStyle.padding = '8px 0';
            } else if (attr.style === 'spotlight') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
            }

            var headerBg = attr.style === 'spotlight'
                ? { background: attr.accentColor, padding: '14px 22px' }
                : null;

            var bodyPadding = attr.style === 'spotlight' ? { padding: '16px 22px' } : {};

            var termRow = el('div', { style: headerBg || { marginBottom: '8px' } },
                el('div', { style: { display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' } },
                    el(RichText, {
                        tagName: 'span', value: attr.term, allowedFormats: [],
                        className: 'bkbg-dfn-term',
                        placeholder: __('Term', 'blockenberg'),
                        style: { color: attr.style === 'spotlight' ? '#fff' : attr.termColor },
                        onChange: function (v) { set({ term: v }); }
                    }),
                    attr.showPronunciation && el(TextControl, {
                        value: attr.pronunciation, label: '', placeholder: '/prəˌnʌnsiˈeɪʃən/',
                        __nextHasNoMarginBottom: true,
                        style: { fontSize: '14px', color: attr.style === 'spotlight' ? 'rgba(255,255,255,0.8)' : attr.pronunciationColor, fontStyle: 'italic', fontFamily: 'serif', width: '200px' },
                        onChange: function (v) { set({ pronunciation: v }); }
                    }),
                    attr.showPartOfSpeech && el('span', { style: { background: attr.style === 'spotlight' ? 'rgba(255,255,255,0.2)' : attr.posBg, color: attr.style === 'spotlight' ? '#fff' : attr.posColor, padding: '2px 9px', borderRadius: '999px', fontSize: '12px', fontStyle: 'italic', fontWeight: 600 } }, attr.partOfSpeech)
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Definition', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Part of Speech', 'blockenberg'), value: attr.partOfSpeech, __nextHasNoMarginBottom: true,
                        options: POS_OPTIONS,
                        onChange: function (v) { set({ partOfSpeech: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Pronunciation', 'blockenberg'), checked: attr.showPronunciation, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPronunciation: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Part of Speech', 'blockenberg'), checked: attr.showPartOfSpeech, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPartOfSpeech: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Full Explanation', 'blockenberg'), checked: attr.showLongDef, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLongDef: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Examples', 'blockenberg'), checked: attr.showExamples, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showExamples: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Synonyms', 'blockenberg'), checked: attr.showSynonyms, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSynonyms: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Antonyms', 'blockenberg'), checked: attr.showAntonyms, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAntonyms: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Etymology', 'blockenberg'), checked: attr.showEtymology, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showEtymology: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Source', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Source Label', 'blockenberg'), value: attr.sourceLabel, placeholder: 'Merriam-Webster', __nextHasNoMarginBottom: true, onChange: function (v) { set({ sourceLabel: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Source URL', 'blockenberg'), value: attr.sourceUrl, placeholder: 'https://…', __nextHasNoMarginBottom: true, onChange: function (v) { set({ sourceUrl: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Style & Spacing', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: STYLE_OPTIONS,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Term', 'blockenberg'), value: attr.termColor, onChange: function (v) { set({ termColor: v || '#0f172a' }); } },
                        { label: __('Pronunciation', 'blockenberg'), value: attr.pronunciationColor, onChange: function (v) { set({ pronunciationColor: v || '#7c3aed' }); } },
                        { label: __('Part of Speech BG', 'blockenberg'), value: attr.posBg, onChange: function (v) { set({ posBg: v || '#f5f3ff' }); } },
                        { label: __('Part of Speech Text', 'blockenberg'), value: attr.posColor, onChange: function (v) { set({ posColor: v || '#7c3aed' }); } },
                        { label: __('Short Definition', 'blockenberg'), value: attr.shortDefColor, onChange: function (v) { set({ shortDefColor: v || '#1e293b' }); } },
                        { label: __('Long Explanation', 'blockenberg'), value: attr.longDefColor, onChange: function (v) { set({ longDefColor: v || '#475569' }); } },
                        { label: __('Examples', 'blockenberg'), value: attr.exampleColor, onChange: function (v) { set({ exampleColor: v || '#475569' }); } },
                        { label: __('Section Labels', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#94a3b8' }); } },
                        { label: __('Synonym / Antonym Tags', 'blockenberg'), value: attr.synonymColor, onChange: function (v) { set({ synonymColor: v || '#7c3aed' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Term'), typo: attr.typoTerm || {}, onChange: function (v) { set({ typoTerm: v }); }, defaultSize: attr.termFontSize || 24 }),
                    _tc() && el(_tc(), { label: __('Short definition'), typo: attr.typoShortDef || {}, onChange: function (v) { set({ typoShortDef: v }); }, defaultSize: attr.shortDefFontSize || 16 }),
                    _tc() && el(_tc(), { label: __('Long explanation'), typo: attr.typoLongDef || {}, onChange: function (v) { set({ typoLongDef: v }); }, defaultSize: attr.longDefFontSize || 14 }),
                    el(RangeControl, { label: __('Examples font size (px)', 'blockenberg'), value: attr.exampleFontSize, min: 10, max: 20, onChange: function (v) { set({ exampleFontSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Etymology font size (px)', 'blockenberg'), value: attr.etymologyFontSize, min: 10, max: 20, onChange: function (v) { set({ etymologyFontSize: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Tags font size (px)', 'blockenberg'), value: attr.tagFontSize, min: 10, max: 18, onChange: function (v) { set({ tagFontSize: v }); }, __nextHasNoMarginBottom: true })
                )
            );

            function sectionLabel(text) {
                return el('div', { style: { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: attr.labelColor, marginBottom: '5px', marginTop: '14px' } }, text);
            }

            function tagList(commaSeparated, color, fontSize) {
                return commaSeparated.split(',').map(function (s, i) {
                    var t = s.trim();
                    if (!t) return null;
                    return el('span', { key: i, style: { background: color + '18', color: color, padding: '2px 8px', borderRadius: '999px', fontSize: (fontSize || 12) + 'px', fontWeight: 500, marginRight: '5px', marginBottom: '4px', display: 'inline-block' } }, t) });
            }

            var body = el('div', { style: bodyPadding },
                sectionLabel(__('Short Definition', 'blockenberg')),
                el(RichText, { tagName: 'p', value: attr.shortDef, allowedFormats: ['core/bold', 'core/italic'], className: 'bkbg-dfn-short-def', placeholder: __('One-sentence definition…', 'blockenberg'), style: { margin: '0 0 4px', color: attr.shortDefColor }, onChange: function (v) { set({ shortDef: v }); } }),

                attr.showLongDef && el('div', {},
                    sectionLabel(__('Explanation', 'blockenberg')),
                    el(RichText, { tagName: 'p', value: attr.longDef, allowedFormats: ['core/bold', 'core/italic', 'core/link'], className: 'bkbg-dfn-long-def', placeholder: __('Detailed explanation…', 'blockenberg'), style: { margin: 0, color: attr.longDefColor }, onChange: function (v) { set({ longDef: v }); } })
                ),

                attr.showExamples && el('div', {},
                    sectionLabel(__('Examples', 'blockenberg')),
                    examples.map(function (ex, idx) {
                        return el('div', { key: idx, style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' } },
                            el('span', { style: { color: attr.accentColor, fontStyle: 'italic', flexShrink: 0, lineHeight: 1 } }, '"'),
                            el(TextControl, { value: ex, label: '', placeholder: __('Example sentence…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: 1, fontSize: (attr.exampleFontSize || 13) + 'px', fontStyle: 'italic', color: attr.exampleColor }, onChange: function (v) { updateExample(idx, v); } }),
                            el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { set({ examples: examples.filter(function (_, i) { return i !== idx; }) }); } }, '×')
                        ) }),
                    el(Button, { variant: 'link', style: { fontSize: '11px', marginTop: '2px' }, onClick: function () { set({ examples: examples.concat(['']) }); } }, '+ Add Example')
                ),

                attr.showSynonyms && el('div', {},
                    sectionLabel(__('Synonyms', 'blockenberg')),
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
                        el(TextControl, { value: attr.synonyms, label: '', placeholder: __('word1, word2, word3', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: 1, fontSize: '13px' }, onChange: function (v) { set({ synonyms: v }); } })
                    ),
                    attr.synonyms && el('div', { style: { marginTop: '5px', display: 'flex', flexWrap: 'wrap' } }, tagList(attr.synonyms, attr.synonymColor, attr.tagFontSize || 12))
                ),

                attr.showAntonyms && el('div', {},
                    sectionLabel(__('Antonyms', 'blockenberg')),
                    el(TextControl, { value: attr.antonyms, label: '', placeholder: __('word1, word2', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: 1, fontSize: '13px' }, onChange: function (v) { set({ antonyms: v }); } }),
                    attr.antonyms && el('div', { style: { marginTop: '5px', display: 'flex', flexWrap: 'wrap' } }, tagList(attr.antonyms, '#dc2626', attr.tagFontSize || 12))
                ),

                attr.showEtymology && el('div', {},
                    sectionLabel(__('Etymology', 'blockenberg')),
                    el(RichText, { tagName: 'p', value: attr.etymology, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Word origin and history…', 'blockenberg'), style: { margin: 0, fontSize: (attr.etymologyFontSize || 13) + 'px', color: attr.longDefColor, fontStyle: 'italic', lineHeight: 1.6 }, onChange: function (v) { set({ etymology: v }); } })
                ),

                (attr.sourceLabel || attr.sourceUrl) && el('div', { style: { marginTop: '14px', paddingTop: '10px', borderTop: '1px solid ' + attr.borderColor, fontSize: '11px', color: attr.labelColor } },
                    '— Source: ',
                    attr.sourceUrl
                        ? el('a', { href: attr.sourceUrl, target: '_blank', rel: 'noopener', style: { color: attr.accentColor } }, attr.sourceLabel || attr.sourceUrl)
                        : el('span', {}, attr.sourceLabel)
                )
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    termRow,
                    body
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-dfn-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );
