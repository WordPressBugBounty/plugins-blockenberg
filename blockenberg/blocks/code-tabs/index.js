( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    function updateItem(arr, idx, field, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var p = {}; p[field] = val;
            return Object.assign({}, item, p);
        });
    }

    function moveItem(arr, from, to) {
        var a = arr.slice();
        var item = a.splice(from, 1)[0];
        a.splice(to, 0, item);
        return a;
    }

    var LANG_OPTIONS = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'php', label: 'PHP' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'java', label: 'Java' },
        { value: 'csharp', label: 'C#' },
        { value: 'cpp', label: 'C++' },
        { value: 'bash', label: 'Bash / Shell' },
        { value: 'sql', label: 'SQL' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'json', label: 'JSON' },
        { value: 'yaml', label: 'YAML' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'plaintext', label: 'Plain Text' }
    ];

    var THEME_OPTIONS = [
        { value: 'dark', label: 'Dark (default)' },
        { value: 'monokai', label: 'Monokai' },
        { value: 'dracula', label: 'Dracula' },
        { value: 'github-dark', label: 'GitHub Dark' },
        { value: 'nord', label: 'Nord' },
        { value: 'light', label: 'Light' },
        { value: 'github-light', label: 'GitHub Light' },
        { value: 'solarized-light', label: 'Solarized Light' }
    ];

    /* ── CodePreview ── */
    function CodePreview(props) {
        var a = props.attributes;
        var editorActive = props.editorActive;
        var setEditorActive = props.setEditorActive;
        var tabs = a.tabs || [];

        if (tabs.length === 0) {
            return el('div', { style: { padding: '24px', textAlign: 'center', color: '#9ca3af', background: '#13131f', borderRadius: a.borderRadius + 'px' } }, 'Add a tab to preview code');
        }

        var activeIdx = Math.min(editorActive, tabs.length - 1);
        var activeTab = tabs[activeIdx];

        /* header */
        var tabPills = el('div', {
            style: {
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: a.tabAlign === 'center' ? 'center' : a.tabAlign === 'right' ? 'flex-end' : 'flex-start'
            }
        },
            tabs.map(function (tab, idx) {
                var isActive = idx === activeIdx;
                return el('button', {
                    key: idx,
                    onClick: function () { setEditorActive(idx); },
                    style: {
                        padding: a.tabStyle === 'pills' ? '5px 14px' : '8px 16px',
                        borderRadius: a.tabStyle === 'pills' ? '20px' : a.tabStyle === 'underline' ? '0' : '6px',
                        background: isActive ? (a.tabActiveBg || '#6366f1') : (a.tabIdleBg || '#2d2d3f'),
                        color: isActive ? (a.tabActiveColor || '#fff') : (a.tabIdleColor || '#a0a0c0'),
                        border: a.tabStyle === 'underline' ? ('0 0 2px 0 solid ' + (isActive ? (a.tabActiveBg || '#6366f1') : 'transparent')) : 'none',
                        borderBottom: a.tabStyle === 'underline' ? ('2px solid ' + (isActive ? (a.tabActiveBg || '#6366f1') : 'transparent')) : undefined,
                        fontSize: '12px',
                        fontWeight: isActive ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                    }
                }, tab.label || 'Tab ' + (idx + 1));
            })
        );

        var header = el('div', {
            style: {
                background: a.headerBg || '#1e1e2e',
                padding: '10px 16px',
                borderRadius: a.borderRadius + 'px ' + a.borderRadius + 'px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }
        },
            /* Window dots */
            el('div', { style: { display: 'flex', gap: '6px', flexShrink: 0 } },
                el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' } }),
                el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' } }),
                el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' } })
            ),
            /* Tabs */
            tabPills,
            /* Filename */
            a.showFileName && activeTab.fileName && el('span', {
                style: {
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: '#6b7280',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                }
            }, activeTab.fileName),
            /* Lang badge */
            a.showLangBadge && el('span', {
                style: {
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#a0a0c0',
                    background: '#2d2d3f',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                }
            }, activeTab.lang || 'text')
        );

        /* code body */
        var lines = (activeTab.code || '').split('\n');
        var codeRows = lines.map(function (line, li) {
            return el('div', { key: li, style: { display: 'flex' } },
                a.showLineNumbers && el('span', {
                    style: {
                        userSelect: 'none',
                        minWidth: '40px',
                        paddingRight: '16px',
                        color: a.lineNumColor || '#4a4a6a',
                        textAlign: 'right',
                        flexShrink: 0
                    }
                }, li + 1),
                el('span', {
                    style: {
                        flex: 1,
                        whiteSpace: 'pre',
                        color: '#e0e0f0'
                    }
                }, line)
            );
        });

        var codeBody = el('div', {
            style: {
                background: a.codeBg || '#13131f',
                padding: '16px',
                overflowX: 'auto',
                overflowY: a.maxHeight > 0 ? 'auto' : 'visible',
                maxHeight: a.maxHeight > 0 ? a.maxHeight + 'px' : 'none',
                borderRadius: '0 0 ' + a.borderRadius + 'px ' + a.borderRadius + 'px',
                fontFamily: 'ui-monospace, SFMono-Regular, "Fira Code", monospace',
                fontSize: 'var(--bkbg-ctabs-cd-font-size-d, 13px)',
                lineHeight: 'var(--bkbg-ctabs-cd-line-height-d, 1.65)',
                position: 'relative'
            }
        },
            a.showCopyButton && el('button', {
                style: {
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: a.copyBg || '#2d2d3f',
                    color: a.copyColor || '#a0a0c0',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }
            }, 'Copy'),
            el('div', null, codeRows)
        );

        return el('div', { style: { borderRadius: a.borderRadius + 'px', overflow: 'hidden' } },
            header,
            codeBody
        );
    }

    /* ── TabEditor ── */
    function TabEditor(props) {
        var tabs = props.tabs;
        var onChange = props.onChange;
        var activeIdx = props.activeIdx;
        var setActiveIdx = props.setActiveIdx;

        function addTab() {
            onChange(tabs.concat([{ label: 'New Tab', lang: 'javascript', fileName: '', code: '// your code here' }]));
            setActiveIdx(tabs.length);
        }

        return el(Fragment, null,
            tabs.map(function (tab, idx) {
                var isOpen = idx === activeIdx;
                return el('div', {
                    key: idx,
                    style: {
                        border: '1px solid ' + (isOpen ? '#6366f1' : '#e5e7eb'),
                        borderRadius: '6px',
                        marginBottom: '6px',
                        overflow: 'hidden'
                    }
                },
                    /* row header */
                    el('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 10px',
                            background: isOpen ? '#f0f0ff' : '#f9fafb',
                            cursor: 'pointer'
                        },
                        onClick: function () { setActiveIdx(isOpen ? -1 : idx); }
                    },
                        el('span', { style: { flex: 1, fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, tab.label || 'Tab ' + (idx + 1)),
                        el('span', { style: { fontSize: '10px', color: '#9ca3af', flexShrink: 0 } }, tab.lang || ''),
                        el(Button, { icon: 'arrow-up-alt2', isSmall: true, disabled: idx === 0, onClick: function (e) { e.stopPropagation(); onChange(moveItem(tabs, idx, idx - 1)); setActiveIdx(idx - 1); } }),
                        el(Button, { icon: 'arrow-down-alt2', isSmall: true, disabled: idx === tabs.length - 1, onClick: function (e) { e.stopPropagation(); onChange(moveItem(tabs, idx, idx + 1)); setActiveIdx(idx + 1); } }),
                        el(Button, { icon: 'no-alt', isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); var a = tabs.slice(); a.splice(idx, 1); onChange(a); setActiveIdx(-1); } })
                    ),

                    isOpen && el('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                        el(TextControl, { label: __('Tab Label', 'blockenberg'), value: tab.label || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'label', v)); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, {
                            label: __('Language', 'blockenberg'),
                            value: tab.lang || 'javascript',
                            options: LANG_OPTIONS,
                            onChange: function (v) { onChange(updateItem(tabs, idx, 'lang', v)); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(TextControl, { label: __('File Name (optional)', 'blockenberg'), value: tab.fileName || '', onChange: function (v) { onChange(updateItem(tabs, idx, 'fileName', v)); }, __nextHasNoMarginBottom: true }),
                        el('div', null,
                            el('label', { style: { fontSize: '11px', fontWeight: '600', color: '#1e1e1e', display: 'block', marginBottom: '6px' } }, __('Code', 'blockenberg')),
                            el('textarea', {
                                value: tab.code || '',
                                onChange: function (e) { onChange(updateItem(tabs, idx, 'code', e.target.value)); },
                                spellCheck: false,
                                style: {
                                    width: '100%',
                                    minHeight: '160px',
                                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                                    fontSize: '12px',
                                    padding: '8px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '4px',
                                    background: '#13131f',
                                    color: '#e0e0f0',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    lineHeight: '1.6',
                                    tabSize: 2
                                }
                            })
                        )
                    )
                );
            }),
            el(Button, {
                variant: 'secondary',
                onClick: addTab,
                style: { marginTop: '6px', width: '100%', justifyContent: 'center' }
            }, __('+ Add Tab', 'blockenberg'))
        );
    }

    /* ── register ── */
    registerBlockType('blockenberg/code-tabs', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var tabIdxState = useState(-1);
            var tabIdx = tabIdxState[0];
            var setTabIdx = tabIdxState[1];
            var previewActiveState = useState(0);
            var previewActive = previewActiveState[0];
            var setPreviewActive = previewActiveState[1];

            var bpStyle = {
                paddingTop: (a.paddingTop || 0) + 'px',
                paddingBottom: (a.paddingBottom || 0) + 'px',
                background: a.bgColor
            };
            Object.assign(bpStyle, _tv(a.typoCode, '--bkbg-ctabs-cd'));
            var blockProps = useBlockProps({ style: bpStyle });

            var inspector = el(InspectorControls, null,
                /* Tabs */
                el(PanelBody, { title: __('Code Tabs', 'blockenberg'), initialOpen: true },
                    el(TabEditor, {
                        tabs: a.tabs,
                        onChange: function (v) { set({ tabs: v }); },
                        activeIdx: tabIdx,
                        setActiveIdx: setTabIdx
                    })
                ),

                /* Display */
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Theme', 'blockenberg'),
                        value: a.theme,
                        options: THEME_OPTIONS,
                        onChange: function (v) { set({ theme: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Tab Style', 'blockenberg'),
                            value: a.tabStyle,
                            options: [
                                { value: 'pills', label: 'Pills' },
                                { value: 'buttons', label: 'Buttons' },
                                { value: 'underline', label: 'Underline' }
                            ],
                            onChange: function (v) { set({ tabStyle: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, {
                            label: __('Tab Alignment', 'blockenberg'),
                            value: a.tabAlign,
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ],
                            onChange: function (v) { set({ tabAlign: v }); },
                            __nextHasNoMarginBottom: true
                        })
                    ),
                    el(ToggleControl, { label: __('Show Line Numbers', 'blockenberg'), checked: a.showLineNumbers, onChange: function (v) { set({ showLineNumbers: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Copy Button', 'blockenberg'), checked: a.showCopyButton, onChange: function (v) { set({ showCopyButton: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show File Name', 'blockenberg'), checked: a.showFileName, onChange: function (v) { set({ showFileName: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Language Badge', 'blockenberg'), checked: a.showLangBadge, onChange: function (v) { set({ showLangBadge: v }); }, __nextHasNoMarginBottom: true }),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Max Height (0 = auto)', 'blockenberg'), value: a.maxHeight, min: 0, max: 800, step: 20, onChange: function (v) { set({ maxHeight: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 120, step: 4, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    )
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Code', 'blockenberg'), value: a.typoCode, onChange: function (v) { set({ typoCode: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v }); }, label: __('Page Background', 'blockenberg') },
                        { value: a.headerBg, onChange: function (v) { set({ headerBg: v }); }, label: __('Header Background', 'blockenberg') },
                        { value: a.codeBg, onChange: function (v) { set({ codeBg: v }); }, label: __('Code Background', 'blockenberg') },
                        { value: a.tabActiveBg, onChange: function (v) { set({ tabActiveBg: v }); }, label: __('Active Tab Background', 'blockenberg') },
                        { value: a.tabActiveColor, onChange: function (v) { set({ tabActiveColor: v }); }, label: __('Active Tab Text', 'blockenberg') },
                        { value: a.tabIdleBg, onChange: function (v) { set({ tabIdleBg: v }); }, label: __('Idle Tab Background', 'blockenberg') },
                        { value: a.tabIdleColor, onChange: function (v) { set({ tabIdleColor: v }); }, label: __('Idle Tab Text', 'blockenberg') },
                        { value: a.lineNumColor, onChange: function (v) { set({ lineNumColor: v }); }, label: __('Line Number Color', 'blockenberg') },
                        { value: a.copyBg, onChange: function (v) { set({ copyBg: v }); }, label: __('Copy Button Background', 'blockenberg') },
                        { value: a.copyColor, onChange: function (v) { set({ copyColor: v }); }, label: __('Copy Button Text', 'blockenberg') }
                    ]
                })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el(CodePreview, { attributes: a, editorActive: previewActive, setEditorActive: setPreviewActive })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ctabs-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );
