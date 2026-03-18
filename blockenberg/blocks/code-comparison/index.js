( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;
    var RangeControl = wp.components.RangeControl;
    var useRef = wp.element.useRef;
    var useEffect = wp.element.useEffect;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function _tv() { var fn = window.bkbgTypoCssVars; return fn ? fn.apply(null, arguments) : {}; }

    var LANGS = [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
        { label: 'PHP', value: 'php' },
        { label: 'Python', value: 'python' },
        { label: 'CSS', value: 'css' },
        { label: 'HTML', value: 'html' },
        { label: 'Bash / Shell', value: 'bash' },
        { label: 'SQL', value: 'sql' },
        { label: 'JSON', value: 'json' },
        { label: 'Ruby', value: 'ruby' },
        { label: 'Go', value: 'go' },
        { label: 'Rust', value: 'rust' },
        { label: 'Plain Text', value: 'text' }
    ];

    var THEMES = [
        { label: 'Dark (Catppuccin)', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Dracula', value: 'dracula' },
        { label: 'GitHub', value: 'github' },
        { label: 'Custom', value: 'custom' }
    ];

    var THEME_PRESETS = {
        dark:    { bgL: '#1e1e2e', bgR: '#1e2e1e', hdL: '#ff6b6b', hdR: '#6bcb77', hdColor: '#fff', code: '#cdd6f4', lineNum: '#6c7086', addBg: 'rgba(107,203,119,0.15)', remBg: 'rgba(255,107,107,0.15)' },
        light:   { bgL: '#fdf6e3', bgR: '#f0fff0', hdL: '#e06c75', hdR: '#27ae60', hdColor: '#fff', code: '#24292e', lineNum: '#999', addBg: 'rgba(39,174,96,0.12)', remBg: 'rgba(224,108,117,0.12)' },
        dracula: { bgL: '#282a36', bgR: '#1a3028', hdL: '#ff5555', hdR: '#50fa7b', hdColor: '#f8f8f2', code: '#f8f8f2', lineNum: '#6272a4', addBg: 'rgba(80,250,123,0.12)', remBg: 'rgba(255,85,85,0.12)' },
        github:  { bgL: '#fff', bgR: '#f1fff1', hdL: '#ffd7d5', hdR: '#ccffd8', hdColor: '#1f2328', code: '#1f2328', lineNum: '#aaa', addBg: 'rgba(24,128,41,0.12)', remBg: 'rgba(164,14,38,0.12)' }
    };

    // Minimal tokeniser — returns array of {type, text}
    function tokenize(code, lang) {
        if (lang === 'text') return [{ type: 'plain', text: code }];

        var keywords = {
            javascript: 'break case catch class const continue debugger default delete do else enum export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield async await',
            typescript: 'break case catch class const continue debugger default delete do else enum export extends false finally for from function if import in instanceof interface let namespace new null of return static super switch this throw true try type typeof undefined var void while with yield async await',
            php:    'echo print class function return if else elseif for foreach while do switch case break continue true false null new public private protected static abstract final try catch finally throw namespace use extends implements interface trait',
            python: 'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield',
            css:    'important',
            bash:   'if then else elif fi for while do done case esac in function return export readonly local true false',
            sql:    'SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER ON UPDATE INSERT INTO VALUES DELETE CREATE DROP TABLE ALTER ADD COLUMN AS GROUP BY ORDER HAVING LIMIT DISTINCT WITH UNION ALL SET AND OR NOT NULL IS IN EXISTS',
            ruby:   'BEGIN END __ENCODING__ __END__ __FILE__ __LINE__ alias and begin break case class def defined do else elsif end ensure false for if in module next nil not or raise redo rescue retry return self super then true undef unless until when while yield',
            go:     'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false',
            rust:   'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while'
        };
        var kw = (keywords[lang] || '').split(' ').filter(Boolean);

        var rules = [
            { type: 'string',    re: /("""[\s\S]*?"""|'''[\s\S]*?'''|`[\s\S]*?`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/ },
            { type: 'comment',   re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|--[^\n]*)/ },
            { type: 'number',    re: /(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/ },
            { type: 'operator',  re: /([+\-*/%=<>!&|^~?:;,.()\[\]{}])/ },
            { type: 'keyword',   re: new RegExp('\\b(' + (kw.length ? kw.join('|') : '__NONE__') + ')\\b') },
            { type: 'function',  re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/ },
            { type: 'tag',       re: lang === 'html' ? /(<\/?\w[^>]*>)/ : null },
            { type: 'variable',  re: lang === 'php' ? /(\$[a-zA-Z_]\w*)/ : null }
        ].filter(function (r) { return r.re !== null; });

        var tokens = [];
        var rest = code;
        while (rest.length) {
            var best = null, bestIdx = Infinity, bestLen = 0, bestType = 'plain';
            for (var i = 0; i < rules.length; i++) {
                var m = rules[i].re.exec(rest);
                if (m && m.index < bestIdx) {
                    best = m; bestIdx = m.index; bestLen = m[0].length; bestType = rules[i].type;
                }
            }
            if (!best) { tokens.push({ type: 'plain', text: rest }); break; }
            if (bestIdx > 0) tokens.push({ type: 'plain', text: rest.slice(0, bestIdx) });
            tokens.push({ type: bestType, text: rest.slice(bestIdx, bestIdx + bestLen) });
            rest = rest.slice(bestIdx + bestLen);
        }
        return tokens;
    }

    var TOKEN_COLORS = {
        plain: null,
        keyword:  '#c792ea',
        string:   '#c3e88d',
        comment:  '#546e7a',
        number:   '#f78c6c',
        operator: '#89ddff',
        function: '#82aaff',
        tag:      '#f07178',
        variable: '#ffcb6b'
    };

    function renderCode(code, lang, showLineNums, wrapLines, codeColor, lineNumColor, maxH, diffLinesArr, side) {
        var lines = code.split('\n');
        var rows = lines.map(function (line, i) {
            var lineNum = i + 1;
            var tokens = tokenize(line, lang);
            var spans = tokens.map(function (t) {
                var style = TOKEN_COLORS[t.type] ? { color: TOKEN_COLORS[t.type] } : { color: codeColor };
                return el('span', { style: style }, t.text);
            });
            var isDiff = diffLinesArr.indexOf(i) !== -1;
            var marker = '';
            if (isDiff && side === 'left')  marker = el('span', { style: { color: '#ff6b6b', userSelect: 'none', marginRight: '6px' } }, '−');
            if (isDiff && side === 'right') marker = el('span', { style: { color: '#6bcb77', userSelect: 'none', marginRight: '6px' } }, '+');
            var diffBg = '';
            if (isDiff && side === 'left')  diffBg = 'rgba(255,107,107,0.13)';
            if (isDiff && side === 'right') diffBg = 'rgba(107,203,119,0.13)';
            return el('div', {
                key: i,
                style: {
                    display: 'flex', alignItems: 'flex-start', backgroundColor: diffBg || undefined,
                    whiteSpace: wrapLines ? 'pre-wrap' : 'pre', wordBreak: wrapLines ? 'break-word' : undefined,
                    minHeight: '1.5em'
                }
            },
                showLineNums && el('span', {
                    style: { minWidth: '2.6em', textAlign: 'right', paddingRight: '1em', userSelect: 'none', color: lineNumColor, flexShrink: 0, fontSize: '0.85em', paddingTop: '1px' }
                }, lineNum),
                marker,
                el('span', { style: { flex: 1, color: codeColor } }, ...spans)
            );
        });
        return el('div', {
            style: {
                overflowY: 'auto', overflowX: maxH ? 'auto' : undefined,
                maxHeight: maxH ? maxH + 'px' : undefined,
                padding: '14px 16px',
                fontSize: 'inherit', lineHeight: '1.6'
            }
        }, ...rows);
    }

    // ── Preview component ──────────────────────────────────────────────────────
    function ComparisonPreview(props) {
        var attr = props.attr;
        var splitL = attr.splitRatio;
        var splitR = 100 - splitL;

        var diffLinesArr = [];
        if (attr.diffLines && attr.diffLines.trim()) {
            attr.diffLines.split(',').forEach(function (s) {
                var n = parseInt(s.trim(), 10);
                if (!isNaN(n)) diffLinesArr.push(n - 1);
            });
        }

        var paneStyle = function (bg) { return {
            flex: 1, backgroundColor: bg, overflow: 'hidden', fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace'
        }; };

        var headerStyle = function (hbg) { return {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 14px', backgroundColor: hbg, color: attr.headerColor, fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em'
        }; };

        var typoVars = _tv(attr.typoCode, '--bkbg-cc-cd');
        return el('div', {
            style: Object.assign({
                display: 'flex', borderRadius: attr.borderRadius + 'px', overflow: 'hidden',
                position: 'relative'
            }, typoVars)
        },
            el('div', { style: { ...paneStyle(attr.bgLeft), width: splitL + '%', flexShrink: 0, flexGrow: 0 } },
                el('div', { style: headerStyle(attr.headerBgLeft) },
                    el('span', {}, attr.leftLabel),
                    attr.showLanguageBadge && el('span', { style: { opacity: 0.8, fontWeight: 400 } }, attr.leftLang),
                    attr.showCopyButtons && el('span', {
                        style: { cursor: 'pointer', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', padding: '2px 8px', fontSize: '10px' }
                    }, 'Copy')
                ),
                renderCode(attr.leftCode, attr.leftLang, attr.showLineNumbers, attr.wrapLines, attr.codeColor, attr.lineNumColor, attr.maxHeight, attr.showDiffMarkers ? diffLinesArr : [], 'left')
            ),
            el('div', { style: { width: '3px', backgroundColor: 'rgba(128,128,128,0.3)', flexShrink: 0, cursor: 'col-resize' } }),
            el('div', { style: { ...paneStyle(attr.bgRight), width: splitR + '%', flexShrink: 0, flexGrow: 0 } },
                el('div', { style: headerStyle(attr.headerBgRight) },
                    el('span', {}, attr.rightLabel),
                    attr.showLanguageBadge && el('span', { style: { opacity: 0.8, fontWeight: 400 } }, attr.rightLang),
                    attr.showCopyButtons && el('span', {
                        style: { cursor: 'pointer', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', padding: '2px 8px', fontSize: '10px' }
                    }, 'Copy')
                ),
                renderCode(attr.rightCode, attr.rightLang, attr.showLineNumbers, attr.wrapLines, attr.codeColor, attr.lineNumColor, attr.maxHeight, attr.showDiffMarkers ? diffLinesArr : [], 'right')
            )
        );
    }

    // ── Block registration ─────────────────────────────────────────────────────
    wp.blocks.registerBlockType('blockenberg/code-comparison', {
        title: 'Code Comparison',
        icon: 'editor-code',
        category: 'bkbg-dev',
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function applyTheme(themeKey) {
                if (themeKey === 'custom') return;
                var p = THEME_PRESETS[themeKey];
                if (!p) return;
                setAttr({ bgLeft: p.bgL, bgRight: p.bgR, headerBgLeft: p.hdL, headerBgRight: p.hdR, headerColor: p.hdColor, codeColor: p.code, lineNumColor: p.lineNum, diffAddBg: p.addBg, diffRemBg: p.remBg });
            }

            var blockProps = useBlockProps({ style: { fontFamily: 'inherit' } });

            return el('div', blockProps,
                el(InspectorControls, {},
                    // Code panels
                    el(PanelBody, { title: __('Left Pane (Before)', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Label', 'blockenberg'),
                            value: attr.leftLabel,
                            onChange: function (v) { setAttr({ leftLabel: v }); }
                        }),
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Language', 'blockenberg'),
                            value: attr.leftLang,
                            options: LANGS,
                            onChange: function (v) { setAttr({ leftLang: v }); }
                        }),
                        el(TextareaControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Code', 'blockenberg'),
                            value: attr.leftCode,
                            rows: 10,
                            onChange: function (v) { setAttr({ leftCode: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Right Pane (After)', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Label', 'blockenberg'),
                            value: attr.rightLabel,
                            onChange: function (v) { setAttr({ rightLabel: v }); }
                        }),
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Language', 'blockenberg'),
                            value: attr.rightLang,
                            options: LANGS,
                            onChange: function (v) { setAttr({ rightLang: v }); }
                        }),
                        el(TextareaControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Code', 'blockenberg'),
                            value: attr.rightCode,
                            rows: 10,
                            onChange: function (v) { setAttr({ rightCode: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Diff & Display', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Highlighted Line Numbers (comma-separated)', 'blockenberg'),
                            help: __('e.g. 2,5,7 — marks those lines as changed in both panes', 'blockenberg'),
                            value: attr.diffLines,
                            onChange: function (v) { setAttr({ diffLines: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Show Diff Markers (+/−)', 'blockenberg'),
                            checked: attr.showDiffMarkers,
                            onChange: function (v) { setAttr({ showDiffMarkers: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Line Numbers', 'blockenberg'),
                            checked: attr.showLineNumbers,
                            onChange: function (v) { setAttr({ showLineNumbers: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Wrap Long Lines', 'blockenberg'),
                            checked: attr.wrapLines,
                            onChange: function (v) { setAttr({ wrapLines: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Copy Buttons', 'blockenberg'),
                            checked: attr.showCopyButtons,
                            onChange: function (v) { setAttr({ showCopyButtons: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Language Badge', 'blockenberg'),
                            checked: attr.showLanguageBadge,
                            onChange: function (v) { setAttr({ showLanguageBadge: v }); }
                        }),
                        el(ToggleControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Draggable Divider', 'blockenberg'),
                            checked: attr.draggableSplit,
                            onChange: function (v) { setAttr({ draggableSplit: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Left Pane Width %', 'blockenberg'),
                            value: attr.splitRatio,
                            min: 20, max: 80,
                            onChange: function (v) { setAttr({ splitRatio: v }); }
                        }),
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Max Height (0 = unlimited)', 'blockenberg'),
                            value: attr.maxHeight,
                            min: 0, max: 1000, step: 20,
                            onChange: function (v) { setAttr({ maxHeight: v }); }
                        }),
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Border Radius (px)', 'blockenberg'),
                            value: attr.borderRadius,
                            min: 0, max: 32,
                            onChange: function (v) { setAttr({ borderRadius: v }); }
                        })
                    ),
                    el(PanelBody, { title: __('Theme', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Preset Theme', 'blockenberg'),
                            value: attr.theme,
                            options: THEMES,
                            onChange: function (v) { setAttr({ theme: v }); applyTheme(v); }
                        })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Code Text', 'blockenberg'), value: attr.typoCode, onChange: function (v) { setAttr({ typoCode: v }); } }),
                        el(RangeControl, {
                            __nextHasNoMarginBottom: true,
                            label: __('Font Size (px)', 'blockenberg'),
                            value: attr.fontSize,
                            min: 10, max: 22,
                            onChange: function (v) { setAttr({ fontSize: v }); }
                        })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Left Pane Background', 'blockenberg'), value: attr.bgLeft, onChange: function (v) { setAttr({ bgLeft: v || '' }); } },
                            { label: __('Right Pane Background', 'blockenberg'), value: attr.bgRight, onChange: function (v) { setAttr({ bgRight: v || '' }); } },
                            { label: __('Left Header', 'blockenberg'), value: attr.headerBgLeft, onChange: function (v) { setAttr({ headerBgLeft: v || '' }); } },
                            { label: __('Right Header', 'blockenberg'), value: attr.headerBgRight, onChange: function (v) { setAttr({ headerBgRight: v || '' }); } },
                            { label: __('Header Text', 'blockenberg'), value: attr.headerColor, onChange: function (v) { setAttr({ headerColor: v || '' }); } },
                            { label: __('Code Text', 'blockenberg'), value: attr.codeColor, onChange: function (v) { setAttr({ codeColor: v || '' }); } },
                            { label: __('Line Number Color', 'blockenberg'), value: attr.lineNumColor, onChange: function (v) { setAttr({ lineNumColor: v || '' }); } }
                        ]
                    })
                ),
                el(ComparisonPreview, { attr: attr })
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-cc-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );
