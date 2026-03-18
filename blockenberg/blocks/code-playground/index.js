( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function _tv() { var fn = window.bkbgTypoCssVars; return fn ? fn.apply(null, arguments) : {}; }

    var TAB_LABELS = { html: 'HTML', css: 'CSS', js: 'JS' };
    var TAB_COLORS = { html: '#e34c26', css: '#264de4', js: '#f0db4f' };

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = useBlockProps({ style: Object.assign({ background: a.sectionBg || '#f8fafc', padding: '28px 20px' }, _tv(a.typoTitle, '--bkbg-cpg-tt'), _tv(a.typoSubtitle, '--bkbg-cpg-st')) });

        // Mini code preview pane
        function CodePanel(lang, code, color) {
            return el('div', { style: { flex: 1, minWidth: 0, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column' } },
                el('div', { style: { background: color, color: lang === 'js' ? '#1e1b4b' : '#fff', padding: '4px 12px', fontSize: 12, fontWeight: 700, letterSpacing: 1 } }, TAB_LABELS[lang]),
                el('div', { style: {
                    background: a.editorBg, color: a.editorText, padding: 10, fontSize: 11,
                    fontFamily: "'Courier New', monospace", lineHeight: 1.6, overflow: 'hidden',
                    height: a.editorHeight, boxSizing: 'border-box', whiteSpace: 'pre', overflowX: 'auto'
                } }, code)
            );
        }

        var panels = el('div', { style: { display: 'flex', gap: 8, marginBottom: 8 } },
            CodePanel('html', a.defaultHtml, TAB_COLORS.html),
            CodePanel('css', a.defaultCss, TAB_COLORS.css),
            CodePanel('js', a.defaultJs, TAB_COLORS.js)
        );

        var previewSection = el('div', { style: { border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' } },
            el('div', { style: { background: a.headerBg, color: '#e2e8f0', padding: '6px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 } },
                el('span', { style: { width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' } }),
                'Preview'
            ),
            el('div', { style: { background: a.previewBg, height: a.previewHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14, fontStyle: 'italic' } },
                '↑ Live preview appears here on the frontend'
            )
        );

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Playground Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: a.layout,
                        options: [
                            { label: 'Horizontal (editors side by side)', value: 'horizontal' },
                            { label: 'Vertical (stacked)', value: 'vertical' },
                            { label: 'Tabbed (one editor at a time)', value: 'tabbed' }
                        ],
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Editor Height (px)', 'blockenberg'), value: a.editorHeight, min: 80, max: 500,
                        onChange: function (v) { setAttributes({ editorHeight: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Preview Height (px)', 'blockenberg'), value: a.previewHeight, min: 100, max: 800,
                        onChange: function (v) { setAttributes({ previewHeight: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true, label: __('Auto-run on code change', 'blockenberg'),
                        checked: a.autoRun, onChange: function (v) { setAttributes({ autoRun: v }); }
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                    el(getTypographyControl(), { label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: function (v) { setAttributes({ typoSubtitle: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Accent', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                        { label: __('Editor Background', 'blockenberg'), value: a.editorBg, onChange: function (v) { setAttributes({ editorBg: v || '#1e1b4b' }); } },
                        { label: __('Editor Text', 'blockenberg'), value: a.editorText, onChange: function (v) { setAttributes({ editorText: v || '#e2e8f0' }); } },
                        { label: __('Header Bar', 'blockenberg'), value: a.headerBg, onChange: function (v) { setAttributes({ headerBg: v || '#312e81' }); } },
                        { label: __('Preview Background', 'blockenberg'), value: a.previewBg, onChange: function (v) { setAttributes({ previewBg: v || '#ffffff' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f8fafc' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-cpg-title', value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Code Playground', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px' }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-cpg-subtitle', value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Optional subtitle…', 'blockenberg'),
                    style: { color: a.titleColor + 'aa', margin: '0 0 16px' }
                }),
                el('div', { style: { opacity: 0.85 } }, panels, previewSection)
            )
        );
    }

    registerBlockType('blockenberg/code-playground', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cpg-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-cpg-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-cpg-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
