( function () {
    var el  = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useRef = wp.element.useRef;
    var __ = wp.i18n.__;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function _tv() { var fn = window.bkbgTypoCssVars; return fn ? fn.apply(null, arguments) : {}; }

    /* ── Language map ───────────────────────────────────────────────────── */
    var LANGUAGES = [
        { label: 'JavaScript',  value: 'javascript' },
        { label: 'TypeScript',  value: 'typescript' },
        { label: 'JSX / TSX',   value: 'jsx' },
        { label: 'HTML',        value: 'html' },
        { label: 'CSS',         value: 'css' },
        { label: 'SCSS / Sass', value: 'scss' },
        { label: 'PHP',         value: 'php' },
        { label: 'Python',      value: 'python' },
        { label: 'JSON',        value: 'json' },
        { label: 'Bash / Shell',value: 'bash' },
        { label: 'SQL',         value: 'sql' },
        { label: 'Go',          value: 'go' },
        { label: 'Rust',        value: 'rust' },
        { label: 'Ruby',        value: 'ruby' },
        { label: 'Java',        value: 'java' },
        { label: 'C / C++',     value: 'c' },
        { label: 'C#',          value: 'csharp' },
        { label: 'Swift',       value: 'swift' },
        { label: 'Kotlin',      value: 'kotlin' },
        { label: 'YAML',        value: 'yaml' },
        { label: 'XML',         value: 'xml' },
        { label: 'Markdown',    value: 'markdown' },
        { label: 'Plain Text',  value: 'plaintext' }
    ];

    /* ── CSS vars ────────────────────────────────────────────────────────── */
    function buildWrapStyle(a) {
        var style = {
            '--bkbg-cb-font-size'  : a.fontSize + 'px',
            '--bkbg-cb-line-height': (a.lineHeight / 100).toFixed(2),
            '--bkbg-cb-radius'     : a.borderRadius + 'px'
        };
        if (a.maxHeight > 0) style['--bkbg-cb-max-height'] = a.maxHeight + 'px';
        if (a.bgColor)     style['--bkbg-cb-bg']          = a.bgColor;
        if (a.textColor)   style['--bkbg-cb-text']        = a.textColor;
        if (a.accentColor) style['--bkbg-cb-accent']      = a.accentColor;
        if (a.headerBg)    style['--bkbg-cb-header-bg']   = a.headerBg;
        Object.assign(style, _tv(a.typoCode, '--bkbg-cb-cd'));
        return style;
    }

    /* ── Color picker ────────────────────────────────────────────────────── */
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button', title: value || 'default',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                value && el('button', {
                    type: 'button',
                    title: __('Clear', 'blockenberg'),
                    onClick: function () { onChange(''); setOpenKey(null); },
                    style: { marginLeft: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', fontSize: '14px', lineHeight: 1, padding: '2px' }
                }, '×'),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Editor line number preview helper ───────────────────────────────── */
    function renderEditorPreview(a) {
        var lines = (a.code || '// Enter your code here\nconsole.log("Hello, World!");').split('\n');
        var start = a.startLine || 1;

        return el('div', { className: 'bkbg-cb-wrap bkbg-cb-theme-' + a.theme, style: buildWrapStyle(a) },
            // Header bar
            el('div', { className: 'bkbg-cb-header' },
                el('div', { className: 'bkbg-cb-dots' },
                    el('span', { className: 'bkbg-cb-dot bkbg-cb-dot-red' }),
                    el('span', { className: 'bkbg-cb-dot bkbg-cb-dot-yellow' }),
                    el('span', { className: 'bkbg-cb-dot bkbg-cb-dot-green' })
                ),
                a.fileName && el('span', { className: 'bkbg-cb-filename' }, a.fileName),
                a.showLanguageBadge && el('span', { className: 'bkbg-cb-badge' }, a.language),
                a.showCopyButton && el('button', { type: 'button', className: 'bkbg-cb-copy-btn', disabled: true },
                    el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', width: '14', height: '14' },
                        el('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
                        el('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
                    ),
                    el('span', {}, a.copyLabel || 'Copy')
                )
            ),
            // Code area
            el('div', { className: 'bkbg-cb-code-area' + (a.wordWrap ? ' bkbg-cb-wrap-text' : '') },
                a.showLineNumbers && el('div', { className: 'bkbg-cb-line-numbers', 'aria-hidden': 'true' },
                    lines.map(function (_, i) {
                        return el('span', { key: i, className: 'bkbg-cb-ln' }, start + i);
                    })
                ),
                el('pre', { className: 'bkbg-cb-pre' },
                    el('code', { className: 'bkbg-cb-code language-' + a.language }, a.code || '// Enter your code here\nconsole.log("Hello, World!");')
                )
            )
        );
    }

    /* ── Register ────────────────────────────────────────────────────────── */
    registerBlockType('blockenberg/code-block', {
        title: __('Code Block', 'blockenberg'),
        icon: 'editor-code',
        category: 'bkbg-dev',
        description: __('Syntax-highlighted code with copy button, line numbers, and themes.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var showEditorState = useState(false);
            var showEditor = showEditorState[0];
            var setShowEditor = showEditorState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            var blockProps = useBlockProps({
                className: 'bkbg-cb-editor-root'
            });

            /* ── Inspector ──────────────────────────────────────────────── */
            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Code & Language', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Language', 'blockenberg'), value: a.language,
                        options: LANGUAGES,
                        onChange: function (v) { setAttributes({ language: v }); }
                    }),
                    el(TextControl, {
                        label: __('File Name (optional)', 'blockenberg'),
                        value: a.fileName, placeholder: 'app.js',
                        onChange: function (v) { setAttributes({ fileName: v }); }
                    }),
                    el(TextControl, {
                        label: __('Highlight Lines (e.g. 1,3-5)', 'blockenberg'),
                        value: a.highlightLines,
                        help: __('Comma-separated line numbers or ranges.', 'blockenberg'),
                        onChange: function (v) { setAttributes({ highlightLines: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Starting Line Number', 'blockenberg'), value: a.startLine, min: 1, max: 999,
                        onChange: function (v) { setAttributes({ startLine: v }); }
                    })
                ),

                el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Theme', 'blockenberg'), value: a.theme,
                        options: [
                            { label: __('Dark (Night Owl)', 'blockenberg'), value: 'dark' },
                            { label: __('Light (GitHub)', 'blockenberg'), value: 'light' },
                            { label: __('Ocean', 'blockenberg'), value: 'ocean' },
                            { label: __('Monokai', 'blockenberg'), value: 'monokai' },
                            { label: __('Custom', 'blockenberg'), value: 'custom' }
                        ],
                        onChange: function (v) { setAttributes({ theme: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 20,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Height (0 = unlimited)', 'blockenberg'), value: a.maxHeight, min: 0, max: 1200, step: 20,
                        onChange: function (v) { setAttributes({ maxHeight: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Word Wrap', 'blockenberg'), checked: a.wordWrap,
                        onChange: function (v) { setAttributes({ wordWrap: v }); }
                    })
                ),

                el(PanelBody, { title: __('Controls', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Line Numbers', 'blockenberg'), checked: a.showLineNumbers,
                        onChange: function (v) { setAttributes({ showLineNumbers: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Copy Button', 'blockenberg'), checked: a.showCopyButton,
                        onChange: function (v) { setAttributes({ showCopyButton: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Language Badge', 'blockenberg'), checked: a.showLanguageBadge,
                        onChange: function (v) { setAttributes({ showLanguageBadge: v }); }
                    }),
                    el(TextControl, {
                        label: __('Copy Label', 'blockenberg'), value: a.copyLabel,
                        onChange: function (v) { setAttributes({ copyLabel: v }); }
                    }),
                    el(TextControl, {
                        label: __('Copied! Label', 'blockenberg'), value: a.copiedLabel,
                        onChange: function (v) { setAttributes({ copiedLabel: v }); }
                    })
                ),

                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Code Text', 'blockenberg'), value: a.typoCode, onChange: function (v) { setAttributes({ typoCode: v }); } }),
                    el(RangeControl, {
                        label: __('Font Size (px)', 'blockenberg'), value: a.fontSize, min: 10, max: 24,
                        onChange: function (v) { setAttributes({ fontSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Line Height (%)', 'blockenberg'), value: a.lineHeight, min: 120, max: 250,
                        onChange: function (v) { setAttributes({ lineHeight: v }); }
                    })
                ),
el(PanelBody, { title: __('Custom Colors', 'blockenberg'), initialOpen: false },
                    cc('bgColor',     __('Background', 'blockenberg'), 'bgColor'),
                    cc('headerBg',    __('Header Background', 'blockenberg'), 'headerBg'),
                    cc('textColor',   __('Code Text', 'blockenberg'), 'textColor'),
                    cc('accentColor', __('Accent / Highlight', 'blockenberg'), 'accentColor')
                )
            );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { style: { marginBottom: '8px' } },
                        el(Button, {
                            variant: showEditor ? 'primary' : 'secondary',
                            size: 'small',
                            onClick: function () { setShowEditor(!showEditor); }
                        }, showEditor ? __('Hide Code Editor', 'blockenberg') : __('Edit Code', 'blockenberg'))
                    ),
                    showEditor && el(TextareaControl, {
                        label: __('Code', 'blockenberg'),
                        value: a.code,
                        rows: 12,
                        style: { fontFamily: 'monospace', fontSize: '13px' },
                        onChange: function (v) { setAttributes({ code: v }); }
                    }),
                    renderEditorPreview(a)
                )
            );
        },

        /* ── Save ───────────────────────────────────────────────────────── */
        save: function (props) {
            var a = props.attributes;
            var lines = (a.code || '').split('\n');
            var start = a.startLine || 1;

            var highlighted = a.highlightLines ? (function () {
                var map = {};
                a.highlightLines.split(',').forEach(function (part) {
                    var range = part.trim().split('-');
                    if (range.length === 2) {
                        for (var i = parseInt(range[0], 10); i <= parseInt(range[1], 10); i++) map[i] = true;
                    } else if (range[0]) {
                        map[parseInt(range[0], 10)] = true;
                    }
                });
                return map;
            })() : {};

            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-cb-wrap bkbg-cb-theme-' + a.theme,
                style: buildWrapStyle(a)
            }),
                el('div', { className: 'bkbg-cb-header' },
                    el('div', { className: 'bkbg-cb-dots', 'aria-hidden': 'true' },
                        el('span', { className: 'bkbg-cb-dot bkbg-cb-dot-red' }),
                        el('span', { className: 'bkbg-cb-dot bkbg-cb-dot-yellow' }),
                        el('span', { className: 'bkbg-cb-dot bkbg-cb-dot-green' })
                    ),
                    a.fileName && el('span', { className: 'bkbg-cb-filename' }, a.fileName),
                    a.showLanguageBadge && el('span', { className: 'bkbg-cb-badge' }, a.language),
                    a.showCopyButton && el('button', {
                        type: 'button',
                        className: 'bkbg-cb-copy-btn',
                        'data-copy-label': a.copyLabel || 'Copy',
                        'data-copied-label': a.copiedLabel || 'Copied!',
                        'aria-label': a.copyLabel || 'Copy code'
                    },
                        el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', width: '14', height: '14', 'aria-hidden': 'true' },
                            el('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
                            el('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
                        ),
                        el('span', { className: 'bkbg-cb-copy-label' }, a.copyLabel || 'Copy')
                    )
                ),
                el('div', { className: 'bkbg-cb-code-area' + (a.wordWrap ? ' bkbg-cb-wrap-text' : '') },
                    a.showLineNumbers && el('div', { className: 'bkbg-cb-line-numbers', 'aria-hidden': 'true' },
                        lines.map(function (_, i) {
                            var lineNum = start + i;
                            return el('span', {
                                key: i,
                                className: 'bkbg-cb-ln' + (highlighted[lineNum] ? ' bkbg-cb-ln-highlight' : '')
                            }, lineNum);
                        })
                    ),
                    el('pre', { className: 'bkbg-cb-pre', tabIndex: '0' },
                        el('code', { className: 'bkbg-cb-code language-' + a.language }, a.code)
                    )
                )
            );
        }
    });
}() );
