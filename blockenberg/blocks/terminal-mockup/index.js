(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
        var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

        /* ── Theme presets ─────────────────────────────────── */
        var THEMES = {
            dark:    { bg: '#1e1e2e', text: '#cdd6f4', command: '#89b4fa', output: '#a6e3a1', comment: '#6c7086', prompt: '#cba6f7' },
            monokai: { bg: '#272822', text: '#f8f8f2', command: '#a6e22e', output: '#e6db74', comment: '#75715e', prompt: '#ae81ff' },
            ocean:   { bg: '#0d1117', text: '#e6edf3', command: '#58a6ff', output: '#3fb950', comment: '#8b949e', prompt: '#bc8cff' },
            dracula: { bg: '#282a36', text: '#f8f8f2', command: '#50fa7b', output: '#ffb86c', comment: '#6272a4', prompt: '#ff79c6' },
            light:   { bg: '#f8f8f8', text: '#333333', command: '#0066cc', output: '#3a7c0d', comment: '#999999', prompt: '#8b5cf6' },
        };

        var THEME_OPTIONS = [
            { label: 'Dark (Catppuccin)',  value: 'dark' },
            { label: 'Monokai',            value: 'monokai' },
            { label: 'Ocean (GitHub)',     value: 'ocean' },
            { label: 'Dracula',            value: 'dracula' },
            { label: 'Light',              value: 'light' },
        ];

        var LINE_TYPE_OPTIONS = [
            { label: '$ Command',  value: 'command' },
            { label: 'Output',     value: 'output' },
            { label: '# Comment',  value: 'comment' },
            { label: 'Blank line', value: 'blank' },
        ];

        function makeId() { return 'l' + Math.random().toString(36).substr(2, 6); }

        function getTheme(a) {
            var t = THEMES[a.theme] || THEMES.dark;
            return {
                bg:       a.termBg       || t.bg,
                command:  a.commandColor || t.command,
                output:   a.outputColor  || t.output,
                comment:  a.commentColor || t.comment,
                prompt:   a.promptColor  || t.prompt,
                text:     t.text,
            };
        }

        function lineColor(type, colors) {
            if (type === 'command') return colors.command;
            if (type === 'output')  return colors.output;
            if (type === 'comment') return colors.comment;
            return colors.text;
        }

        function renderLines(lines, a, colors, inEditor) {
            return lines.map(function (line, idx) {
                var isBlank = line.type === 'blank';
                var isCmd   = line.type === 'command';
                var color   = lineColor(line.type, colors);
                var lineText = (typeof line.text === 'string') ? line.text : (line.text == null ? '' : String(line.text));
                return el('div', {
                    key: line.id,
                    className: 'bkbg-term-line bkbg-term-line--' + line.type,
                    style: { display: 'flex', alignItems: 'baseline', gap: '6px', minHeight: isBlank ? '1.2em' : undefined }
                },
                    a.showLineNumbers && !isBlank && el('span', { style: { color: '#555', fontSize: '12px', userSelect: 'none', minWidth: '24px', textAlign: 'right', opacity: 0.5 } }, idx + 1),
                    isCmd && el('span', { className: 'bkbg-term-prompt', style: { color: colors.prompt, userSelect: 'none', flexShrink: 0, fontWeight: 700 } },
                        a.promptHost && el('span', { style: { opacity: 0.75 } }, a.promptHost + ' '),
                        a.promptSymbol + ' '
                    ),
                    !isBlank && el('span', { className: 'bkbg-term-text', 'data-type': line.type, 'data-bkbg-fulltext': lineText, style: { color: color, wordBreak: 'break-all' } }, lineText),
                    isCmd && inEditor && el('span', { className: 'bkbg-term-cursor', style: { display: 'inline-block', width: '8px', height: '1em', background: colors.command, opacity: 0.8, animation: 'none', verticalAlign: 'text-bottom' } })
                );
            });
        }

        registerBlockType('blockenberg/terminal-mockup', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var lines = attributes.lines;
                var colors = getTheme(attributes);

                var blockProps = useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined };
                    if (_tvf) { Object.assign(s, _tvf(attributes.codeTypo, '--bktm-cd-')); }
                    return { style: s };
                })());

                function setLine(id, patch) {
                    setAttributes({ lines: lines.map(function (l) { return l.id === id ? Object.assign({}, l, patch) : l; }) });
                }
                function addLine(type) {
                    setAttributes({ lines: lines.concat([{ id: makeId(), type: type || 'command', text: '', prompt: true }]) });
                }
                function removeLine(id) {
                    if (lines.length <= 1) return;
                    setAttributes({ lines: lines.filter(function (l) { return l.id !== id; }) });
                }
                function moveLine(id, dir) {
                    var idx = lines.findIndex(function (l) { return l.id === id; });
                    var newIdx = idx + dir;
                    if (newIdx < 0 || newIdx >= lines.length) return;
                    var arr = lines.slice();
                    var tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp;
                    setAttributes({ lines: arr });
                }

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Terminal Settings', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Color theme', 'blockenberg'), value: attributes.theme, options: THEME_OPTIONS, onChange: function (v) { setAttributes({ theme: v }); } }),
                            el(ToggleControl, { label: __('Show window chrome (dots)', 'blockenberg'), checked: attributes.showChrome, onChange: function (v) { setAttributes({ showChrome: v }); }, __nextHasNoMarginBottom: true }),
                            attributes.showChrome && el(TextControl, { label: __('Window tab title', 'blockenberg'), value: attributes.windowTitle, onChange: function (v) { setAttributes({ windowTitle: v }); } }),
                            el(TextControl, { label: __('Prompt host', 'blockenberg'), value: attributes.promptHost, placeholder: 'user@server', onChange: function (v) { setAttributes({ promptHost: v }); } }),
                            el(TextControl, { label: __('Prompt symbol', 'blockenberg'), value: attributes.promptSymbol, onChange: function (v) { setAttributes({ promptSymbol: v }); } }),
                            el(ToggleControl, { label: __('Show line numbers', 'blockenberg'), checked: attributes.showLineNumbers, onChange: function (v) { setAttributes({ showLineNumbers: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show blinking cursor', 'blockenberg'), checked: attributes.showCursor, onChange: function (v) { setAttributes({ showCursor: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelBody, { title: __('Typewriter Animation', 'blockenberg'), initialOpen: false },
                            el(ToggleControl, { label: __('Typewriter mode (animates on scroll)', 'blockenberg'), checked: attributes.typewriterMode, onChange: function (v) { setAttributes({ typewriterMode: v }); }, __nextHasNoMarginBottom: true }),
                            attributes.typewriterMode && el(RangeControl, { label: __('Typing speed (ms/character)', 'blockenberg'), value: attributes.typewriterSpeed, min: 10, max: 200, step: 5, onChange: function (v) { setAttributes({ typewriterSpeed: v }); } })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            getTypoControl()({ label: __('Code Text', 'blockenberg'), value: attributes.codeTypo, onChange: function (v) { setAttributes({ codeTypo: v }); } })
                        ),
                        el(PanelBody, { title: __('Appearance', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: attributes.maxWidth, min: 300, max: 1200, onChange: function (v) { setAttributes({ maxWidth: v }); } }),
                            el(RangeControl, { label: __('Border radius (px)', 'blockenberg'), value: attributes.borderRadius, min: 0, max: 24, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                            el(RangeControl, { label: __('Window padding (px)', 'blockenberg'), value: attributes.windowPadding, min: 8, max: 48, onChange: function (v) { setAttributes({ windowPadding: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Color Overrides', 'blockenberg'),
                            initialOpen: false,
                            disableCustomColors: false,
                            colorSettings: [
                                { value: attributes.termBg,       onChange: function (v) { setAttributes({ termBg: v || '' }); },       label: __('Terminal background', 'blockenberg') },
                                { value: attributes.commandColor,  onChange: function (v) { setAttributes({ commandColor: v || '' }); },  label: __('Command text', 'blockenberg') },
                                { value: attributes.outputColor,   onChange: function (v) { setAttributes({ outputColor: v || '' }); },   label: __('Output text', 'blockenberg') },
                                { value: attributes.commentColor,  onChange: function (v) { setAttributes({ commentColor: v || '' }); },  label: __('Comment text', 'blockenberg') },
                                { value: attributes.promptColor,   onChange: function (v) { setAttributes({ promptColor: v || '' }); },   label: __('Prompt', 'blockenberg') },
                                { value: attributes.bgColor,       onChange: function (v) { setAttributes({ bgColor: v || '' }); },       label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Lines', 'blockenberg'), initialOpen: false },
                            lines.map(function (line, idx) {
                                return el(PanelBody, { key: line.id, title: (line.type === 'blank' ? __('Blank line', 'blockenberg') : (line.text.substr(0, 28) || '(' + line.type + ')')) + ' #' + (idx + 1), initialOpen: false },
                                    el(SelectControl, { label: __('Line type', 'blockenberg'), value: line.type, options: LINE_TYPE_OPTIONS, onChange: function (v) { setLine(line.id, { type: v }); } }),
                                    line.type !== 'blank' && el(TextControl, { label: __('Text', 'blockenberg'), value: line.text, onChange: function (v) { setLine(line.id, { text: v }); } }),
                                    el('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' } },
                                        el(Button, { onClick: function () { moveLine(line.id, -1); }, variant: 'tertiary', size: 'compact', disabled: idx === 0 }, '↑'),
                                        el(Button, { onClick: function () { moveLine(line.id, 1); }, variant: 'tertiary', size: 'compact', disabled: idx === lines.length - 1 }, '↓'),
                                        el(Button, { onClick: function () { removeLine(line.id); }, variant: 'tertiary', size: 'compact', isDestructive: true }, __('Remove', 'blockenberg'))
                                    )
                                );
                            }),
                            el('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' } },
                                el(Button, { onClick: function () { addLine('command'); }, variant: 'secondary', size: 'compact' }, __('+ Command', 'blockenberg')),
                                el(Button, { onClick: function () { addLine('output'); }, variant: 'secondary', size: 'compact' }, __('+ Output', 'blockenberg')),
                                el(Button, { onClick: function () { addLine('comment'); }, variant: 'secondary', size: 'compact' }, __('+ Comment', 'blockenberg')),
                                el(Button, { onClick: function () { addLine('blank'); }, variant: 'tertiary', size: 'compact' }, __('+ Blank', 'blockenberg'))
                            )
                        )
                    ),
                    el('div', blockProps,
                        el('div', { style: { maxWidth: attributes.maxWidth + 'px', margin: '0 auto' } },
                            el('div', {
                                className: 'bkbg-terminal',
                                'data-theme': attributes.theme,
                                'data-typewriter': attributes.typewriterMode ? '1' : '0',
                                'data-speed': attributes.typewriterSpeed,
                                'data-cursor': attributes.showCursor ? '1' : '0',
                                style: { background: colors.bg, borderRadius: attributes.borderRadius + 'px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }
                            },
                                attributes.showChrome && el('div', { className: 'bkbg-term-chrome', style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px ' + attributes.windowPadding + 'px', borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                                    el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', flexShrink: 0 } }),
                                    el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', flexShrink: 0 } }),
                                    el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', flexShrink: 0 } }),
                                    attributes.windowTitle && el('span', { style: { flex: 1, textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', userSelect: 'none' } }, attributes.windowTitle)
                                ),
                                el('div', { className: 'bkbg-term-body', style: { padding: attributes.windowPadding + 'px', display: 'flex', flexDirection: 'column', gap: '2px' } },
                                    renderLines(lines, attributes, colors, true)
                                )
                            )
                        )
                    )
                );
            },

            save: function (props) {
                var a = props.attributes;
                var colors = getTheme(a);
                var blockProps = wp.blockEditor.useBlockProps.save((function () {
                    var _tvf = getTypoCssVars();
                    var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                    if (_tvf) { Object.assign(s, _tvf(a.codeTypo, '--bktm-cd-')); }
                    return { className: 'bkbg-terminal-mockup-wrap', style: s };
                })());

                return el('div', blockProps,
                    el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                        el('div', {
                            className: 'bkbg-terminal',
                            'data-theme': a.theme,
                            'data-typewriter': a.typewriterMode ? '1' : '0',
                            'data-speed': a.typewriterSpeed,
                            'data-cursor': a.showCursor ? '1' : '0',
                            style: { background: colors.bg, borderRadius: a.borderRadius + 'px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }
                        },
                            a.showChrome && el('div', { className: 'bkbg-term-chrome', style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px ' + a.windowPadding + 'px', borderBottom: '1px solid rgba(255,255,255,0.06)' } },
                                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', flexShrink: 0 } }),
                                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', flexShrink: 0 } }),
                                el('span', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', flexShrink: 0 } }),
                                a.windowTitle && el('span', { style: { flex: 1, textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', userSelect: 'none' } }, a.windowTitle)
                            ),
                            el('div', { className: 'bkbg-term-body', style: { padding: a.windowPadding + 'px', display: 'flex', flexDirection: 'column', gap: '2px' } },
                                a.lines.map(function (line, idx) {
                                    var isBlank = line.type === 'blank';
                                    var isCmd   = line.type === 'command';
                                    var color   = lineColor(line.type, colors);
                                    var lineText = (typeof line.text === 'string') ? line.text : (line.text == null ? '' : String(line.text));
                                    return el('div', { key: line.id, className: 'bkbg-term-line bkbg-term-line--' + line.type, style: { display: 'flex', alignItems: 'baseline', gap: '6px', minHeight: isBlank ? '1.2em' : undefined } },
                                        a.showLineNumbers && !isBlank && el('span', { className: 'bkbg-term-lnum', style: { color: '#555', fontSize: '12px', userSelect: 'none', minWidth: '24px', textAlign: 'right', opacity: 0.5 } }, idx + 1),
                                        isCmd && el('span', { className: 'bkbg-term-prompt', style: { color: colors.prompt, userSelect: 'none', flexShrink: 0, fontWeight: 700 } },
                                            a.promptHost && el('span', { style: { opacity: 0.75 } }, a.promptHost + ' '),
                                            a.promptSymbol + ' '
                                        ),
                                        !isBlank && el('span', { className: 'bkbg-term-text', 'data-type': line.type, 'data-bkbg-fulltext': lineText, style: { color: color, wordBreak: 'break-all' } }, lineText),
                                        isCmd && a.showCursor && idx === a.lines.length - 1 && el('span', { className: 'bkbg-term-cursor', style: { display: 'inline-block', width: '8px', height: '1em', background: colors.command, verticalAlign: 'text-bottom' } })
                                    );
                                })
                            )
                        )
                    )
                );
            }
        });
}());
