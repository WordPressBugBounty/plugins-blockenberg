( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/markdown-preview', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.titleTypo, '--bkbg-mdp-tt-'));
                return { className: 'bkbg-mdp-root', style: s };
            })());

            var state = useState(0);
            var tick = state[0], setTick = state[1];

            function editorPreview() {
                return el('div', {
                    style: {
                        background: a.sectionBg,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid ' + a.borderColor,
                        maxWidth: a.contentMaxWidth + 'px',
                        fontFamily: 'system-ui,sans-serif'
                    }
                },
                    /* Toolbar */
                    a.showToolbar && el('div', {
                        style: { background: a.toolbarBg, padding: '8px 14px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }
                    },
                        ['B', 'I', 'H', '⌥', '{ }', '🔗', '≡', '—'].map(function (t, i) {
                            return el('button', {
                                key: i,
                                style: { background: 'rgba(255,255,255,0.1)', color: a.toolbarColor, border: 'none', borderRadius: '5px', padding: '4px 9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }
                            }, t);
                        }),
                        el('div', { style: { flex: 1 } }),
                        a.showCopyBtn && el('button', {
                            style: { background: a.accentColor, color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px' }
                        }, 'Copy Markdown')
                    ),

                    /* Split panes */
                    el('div', { style: { display: 'flex', height: a.editorHeight + 'px' } },
                        /* Editor pane */
                        el('div', { style: { flex: 1, background: a.editorBg, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)' } },
                            el('div', { style: { padding: '6px 12px', fontSize: '11px', color: a.toolbarColor, borderBottom: '1px solid rgba(255,255,255,0.08)', background: a.toolbarBg } }, 'Markdown'),
                            el('textarea', {
                                value: a.defaultContent,
                                onChange: function (e) { set({ defaultContent: e.target.value }); },
                                style: { flex: 1, width: '100%', background: a.editorBg, color: a.editorColor, border: 'none', padding: '14px', fontFamily: '"Fira Mono","Consolas",monospace', fontSize: '13px', lineHeight: '1.6', resize: 'none', outline: 'none', boxSizing: 'border-box' }
                            })
                        ),
                        /* Preview pane */
                        el('div', { style: { flex: 1, background: a.previewBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
                            el('div', { style: { padding: '6px 12px', fontSize: '11px', color: '#6b7280', borderBottom: '1px solid ' + a.borderColor } }, 'Preview'),
                            el('div', {
                                className: 'bkbg-mdp-preview-pane',
                                style: { flex: 1, overflow: 'auto', padding: '14px', color: a.previewColor, fontSize: '14px', lineHeight: '1.7' },
                                dangerouslySetInnerHTML: { __html: '<em style="color:#9ca3af">Live preview will render here on the frontend…</em>' }
                            })
                        )
                    )
                );
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(TextControl, { label: 'Title', value: a.title, onChange: function (v) { set({ title: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(ToggleControl, { label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextareaControl, { label: 'Default Markdown Content', value: a.defaultContent, onChange: function (v) { set({ defaultContent: v }); }, rows: 6, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Features', initialOpen: false },
                        el(ToggleControl, { label: 'Show Toolbar', checked: a.showToolbar, onChange: function (v) { set({ showToolbar: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Word Count', checked: a.showWordCount, onChange: function (v) { set({ showWordCount: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Copy Buttons', checked: a.showCopyBtn, onChange: function (v) { set({ showCopyBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Sync Scroll', checked: a.syncScroll, onChange: function (v) { set({ syncScroll: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Layout', initialOpen: false },
                        el(RangeControl, { label: 'Editor Height (px)', value: a.editorHeight, min: 200, max: 800, step: 20, onChange: function (v) { set({ editorHeight: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.contentMaxWidth, min: 500, max: 1400, step: 20, onChange: function (v) { set({ contentMaxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: 'Title', value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color', value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#0ea5e9' }); } },
                            { label: 'Editor Background', value: a.editorBg, onChange: function (v) { set({ editorBg: v || '#1e293b' }); } },
                            { label: 'Editor Text', value: a.editorColor, onChange: function (v) { set({ editorColor: v || '#e2e8f0' }); } },
                            { label: 'Preview Background', value: a.previewBg, onChange: function (v) { set({ previewBg: v || '#ffffff' }); } },
                            { label: 'Preview Text', value: a.previewColor, onChange: function (v) { set({ previewColor: v || '#1f2937' }); } },
                            { label: 'Toolbar Background', value: a.toolbarBg, onChange: function (v) { set({ toolbarBg: v || '#0f172a' }); } },
                            { label: 'Section Background', value: a.sectionBg, onChange: function (v) { set({ sectionBg: v || '#f8fafc' }); } },
                            { label: 'Title Color', value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#0f172a' }); } }
                        ]
                    })
                ),
                el('div', blockProps,
                    a.showTitle && el('div', { className: 'bkbg-mdp-title', style: { color: a.titleColor } }, a.title),
                    editorPreview()
                )
            );
        },
        save: function (props) {
            var a = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.titleTypo, '--bkbg-mdp-tt-'));
                return { style: s };
            })()),
                el('div', { className: 'bkbg-mdp-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
