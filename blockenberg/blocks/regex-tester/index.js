( function () {
    var el                 = wp.element.createElement;
    var useState           = wp.element.useState;
    var Fragment           = wp.element.Fragment;
    var registerBlockType  = wp.blocks.registerBlockType;
    var __                 = wp.i18n.__;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var TextControl        = wp.components.TextControl;
    var ToggleControl      = wp.components.ToggleControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var v1Attributes = {
        title: { type: 'string', default: 'Regex Tester' },
        subtitle: { type: 'string', default: 'Test regular expressions with live match highlighting' },
        defaultPattern: { type: 'string', default: '\\b\\w+@\\w+\\.\\w+\\b' },
        defaultFlags: { type: 'string', default: 'gi' },
        defaultTestStr: { type: 'string', default: 'Contact us at hello@example.com or support@company.org\nVisit our site at https://example.com for more info.' },
        showGroups: { type: 'boolean', default: true },
        showCheatsheet: { type: 'boolean', default: false },
        editorHeight: { type: 'integer', default: 160 },
        editorFontSize: { type: 'integer', default: 14 },
        accentColor: { type: 'string', default: '#f59e0b' },
        matchBg: { type: 'string', default: '#fef3c7' },
        matchBorder: { type: 'string', default: '#f59e0b' },
        groupColors: { type: 'string', default: '#bfdbfe,#bbf7d0,#fecaca,#e9d5ff' },
        cardBg: { type: 'string', default: '#ffffff' },
        editorBg: { type: 'string', default: '#1e1e2e' },
        editorText: { type: 'string', default: '#cdd6f4' },
        sectionBg: { type: 'string', default: '#f9fafb' },
        titleColor: { type: 'string', default: '#111827' },
        subtitleColor: { type: 'string', default: '#6b7280' },
        labelColor: { type: 'string', default: '#374151' },
        errorColor: { type: 'string', default: '#dc2626' },
        titleFontSize: { type: 'integer', default: 26 },
        contentMaxWidth: { type: 'integer', default: 780 },
        titleFontWeight: { type: 'integer', default: 700 },
        titleLineHeight: { type: 'number', default: 1.2 },
        editorFontWeight: { type: 'integer', default: 400 },
        editorLineHeight: { type: 'number', default: 1.6 }
    };

    var CHEATSHEET = [
        { sym: '.', desc: 'Any character except newline' },
        { sym: '\\d', desc: 'Digit [0-9]' },
        { sym: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
        { sym: '\\s', desc: 'Whitespace' },
        { sym: '^', desc: 'Start of string/line' },
        { sym: '$', desc: 'End of string/line' },
        { sym: '*', desc: 'Zero or more' },
        { sym: '+', desc: 'One or more' },
        { sym: '?', desc: 'Zero or one' },
        { sym: '()', desc: 'Capture group' },
        { sym: '(?:)', desc: 'Non-capture group' },
        { sym: '|', desc: 'Alternation (or)' },
        { sym: '[]', desc: 'Character class' },
        { sym: '{n,m}', desc: 'Between n and m times' }
    ];

    function tryRegex(pattern, flags) {
        try {
            return { re: new RegExp(pattern, flags), error: null };
        } catch(e) {
            return { re: null, error: e.message };
        }
    }

    function countMatches(re, str) {
        if (!re) return [];
        var matches = [], m;
        var r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
        while ((m = r.exec(str)) !== null) {
            matches.push(m);
            if (!r.global) break;
        }
        return matches;
    }

    function MatchBadge(props) {
        return el('div', { className: 'bkbg-rt-match-badge', style: { borderColor: props.accentColor + '55', background: props.accentColor + '14' } },
            el('span', { className: 'bkbg-rt-match-idx', style: { color: props.accentColor } }, '#' + (props.idx + 1)),
            el('span', { className: 'bkbg-rt-match-val', style: { color: props.labelColor } }, props.val),
            props.groups && props.groups.length > 0 && el('span', { className: 'bkbg-rt-match-groups', style: { color: '#9ca3af' } },
                '  Groups: ' + props.groups.filter(function(g){ return g !== undefined; }).join(', ')
            )
        );
    }

    function Editor(props) {
        var a = props.attributes, sa = props.setAttributes;
        var TC = getTypoControl();
        var lc = a.labelColor || '#374151';
        var patState = useState(a.defaultPattern || ''); var pat = patState[0]; var setPat = patState[1];
        var flagState = useState(a.defaultFlags || 'gi'); var flags = flagState[0]; var setFlags = flagState[1];
        var testState = useState(a.defaultTestStr || ''); var testStr = testState[0]; var setTest = testState[1];

        var result = tryRegex(pat, flags);
        var matches = result.re ? countMatches(result.re, testStr) : [];

        function toggleFlag(f) {
            var newF = flags.includes(f) ? flags.replace(f,'') : flags + f;
            setFlags(newF);
            sa({ defaultFlags: newF });
        }

        var blockProps = useBlockProps((function() {
            var _tvFn = getTypoCssVars();
            var s = {};
            if (_tvFn) {
                Object.assign(s, _tvFn(a.titleTypo || {}, '--bkbgrt-tt-'));
                Object.assign(s, _tvFn(a.editorTypo || {}, '--bkbgrt-et-'));
            }
            return { className: 'bkbg-rt-app', style: s };
        })());

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content'), initialOpen: true },
                    el(TextControl, { label: __('Title'),    value: a.title    || '', onChange: function(v){ sa({ title: v }); } }),
                    el(TextControl, { label: __('Subtitle'), value: a.subtitle || '', onChange: function(v){ sa({ subtitle: v }); } }),
                    el(TextControl, { label: __('Default Pattern'), value: a.defaultPattern || '', onChange: function(v){ sa({ defaultPattern: v }); setPat(v); } }),
                    el(TextControl, { label: __('Default Flags'), value: a.defaultFlags || 'gi', onChange: function(v){ sa({ defaultFlags: v }); setFlags(v); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Capture Groups'), checked: a.showGroups !== false, onChange: function(v){ sa({ showGroups: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Cheatsheet'), checked: a.showCheatsheet === true, onChange: function(v){ sa({ showCheatsheet: v }); } })
                ),
                
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    TC && el(TC, { label: __('Title'), value: a.titleTypo || {}, onChange: function(v) { sa({ titleTypo: v }); } }),
                    TC && el(TC, { label: __('Code / Editor'), value: a.editorTypo || {}, onChange: function(v) { sa({ editorTypo: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor   ||'#f59e0b', onChange: function(v){ sa({ accentColor: v }); },   label: 'Accent / Matches' },
                        { value: a.matchBg       ||'#fef3c7', onChange: function(v){ sa({ matchBg: v }); },       label: 'Match Highlight Bg' },
                        { value: a.editorBg      ||'#1e1e2e', onChange: function(v){ sa({ editorBg: v }); },      label: 'Code Editor Bg' },
                        { value: a.editorText    ||'#cdd6f4', onChange: function(v){ sa({ editorText: v }); },    label: 'Code Editor Text' },
                        { value: a.errorColor    ||'#dc2626', onChange: function(v){ sa({ errorColor: v }); },    label: 'Error Color' },
                        { value: a.cardBg        ||'#ffffff', onChange: function(v){ sa({ cardBg: v }); },        label: 'Card Background' },
                        { value: a.sectionBg     ||'#f9fafb', onChange: function(v){ sa({ sectionBg: v }); },     label: 'Section Background' },
                        { value: a.titleColor    ||'#111827', onChange: function(v){ sa({ titleColor: v }); },    label: 'Title' },
                        { value: a.subtitleColor ||'#6b7280', onChange: function(v){ sa({ subtitleColor: v }); }, label: 'Subtitle' },
                        { value: a.labelColor    ||'#374151', onChange: function(v){ sa({ labelColor: v }); },    label: 'Labels' }
                    ]
                }),
                el(PanelBody, { title: __('Sizing'), initialOpen: false },
                    el(RangeControl, { label: __('Editor Height (px)'), value: a.editorHeight || 160, min: 80, max: 600, onChange: function(v){ sa({ editorHeight: v }); } }),
                    el(RangeControl, { label: __('Max Width (px)'), value: a.contentMaxWidth || 780, min: 360, max: 1400, step: 10, onChange: function(v){ sa({ contentMaxWidth: v }); } })
                )
            ),

            el('div', blockProps,
                el('div', { className: 'bkbg-rt-card', style: { background: a.cardBg||'#fff', maxWidth:(a.contentMaxWidth||780)+'px' } },
                    el('h2', { className: 'bkbg-rt-title', style: { color: a.titleColor||'#111827' } },
                        a.title || 'Regex Tester'
                    ),
                    el('p', { className: 'bkbg-rt-subtitle', style: { color: a.subtitleColor||'#6b7280' } },
                        a.subtitle || 'Test regular expressions with live match highlighting'
                    ),

                    // Pattern row
                    el('div', { className: 'bkbg-rt-pattern-row' },
                        el('div', { className: 'bkbg-rt-pattern-wrap', style: { background: a.editorBg||'#1e1e2e' } },
                            el('span', { className: 'bkbg-rt-slash', style: { color: a.accentColor||'#f59e0b' } }, '/'),
                            el('input', {
                                className: 'bkbg-rt-pattern-input',
                                style: { color: a.editorText||'#cdd6f4', background: 'transparent' },
                                value: pat, placeholder: 'Enter pattern…',
                                onChange: function(e){ setPat(e.target.value); sa({ defaultPattern: e.target.value }); }
                            }),
                            el('span', { className: 'bkbg-rt-slash', style: { color: a.accentColor||'#f59e0b' } }, '/'),
                            el('input', {
                                className: 'bkbg-rt-flags-input',
                                style: { color: a.accentColor||'#f59e0b', background: 'transparent' },
                                value: flags, placeholder: 'gi',
                                onChange: function(e){ var f = e.target.value.replace(/[^gimsuy]/g,''); setFlags(f); sa({ defaultFlags: f }); }
                            })
                        ),
                        result.error && el('div', { className: 'bkbg-rt-error', style: { color: a.errorColor||'#dc2626' } }, '⚠ ' + result.error),

                        // Flag toggles
                        el('div', { className: 'bkbg-rt-flags-row' },
                            ['g','i','m','s'].map(function(f) {
                                var active = flags.includes(f);
                                return el('button', {
                                    key: f,
                                    className: 'bkbg-rt-flag-btn',
                                    style: {
                                        background: active ? (a.accentColor||'#f59e0b') : '#f3f4f6',
                                        color: active ? '#fff' : lc
                                    },
                                    onClick: function(){ toggleFlag(f); }
                                },
                                    el('strong', null, f),
                                    el('span', null, { g:'global', i:'ignore case', m:'multiline', s:'dotAll' }[f])
                                );
                            })
                        )
                    ),

                    // Test string
                    el('div', { className: 'bkbg-rt-section' },
                        el('label', { className: 'bkbg-rt-label', style: { color: lc } }, 'Test String'),
                        el('textarea', {
                            className: 'bkbg-rt-textarea',
                            style: { background: a.sectionBg||'#f9fafb', color: lc, minHeight:(a.editorHeight||160)+'px' },
                            value: testStr,
                            onChange: function(e){ setTest(e.target.value); sa({ defaultTestStr: e.target.value }); }
                        })
                    ),

                    // Stats bar
                    el('div', { className: 'bkbg-rt-stats', style: { background: a.sectionBg||'#f9fafb', color: lc } },
                        result.error
                            ? el('span', { style: { color: a.errorColor||'#dc2626' } }, '⚠ Invalid pattern')
                            : el(Fragment, null,
                                el('span', null,
                                    'Matches: ',
                                    el('strong', { style: { color: a.accentColor||'#f59e0b' } }, matches.length)
                                ),
                                matches.length > 0 && el('span', null,
                                    '  Groups per match: ',
                                    el('strong', null, matches[0].length - 1)
                                )
                            )
                    ),

                    // Matches list
                    matches.length > 0 && a.showGroups !== false && el('div', { className: 'bkbg-rt-matches' },
                        el('div', { className: 'bkbg-rt-matches-title', style: { color: lc } }, 'Matches'),
                        matches.slice(0, 20).map(function(m, i) {
                            return el(MatchBadge, { key: i, idx: i, val: m[0], groups: Array.from(m).slice(1), accentColor: a.accentColor||'#f59e0b', labelColor: lc });
                        }),
                        matches.length > 20 && el('div', { className: 'bkbg-rt-more', style: { color: '#9ca3af' } }, '+ ' + (matches.length - 20) + ' more matches')
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/regex-tester', {
        edit: Editor,
        save: function(props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-rt-app', 'data-opts': JSON.stringify(a) })
            );
        },
        deprecated: [{
            attributes: v1Attributes,
            save: function(props) {
                var a = props.attributes;
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-rt-app', 'data-opts': JSON.stringify(a) })
                );
            }
        }]
    });
}() );
