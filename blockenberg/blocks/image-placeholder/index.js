( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var PRESETS = [
        { label: '1:1 Square',  w: 400, h: 400 },
        { label: '4:3',         w: 800, h: 600 },
        { label: '16:9',        w: 1280, h: 720 },
        { label: '3:2',         w: 900, h: 600 },
        { label: '2:3 Portrait',w: 400, h: 600 },
        { label: '9:16 Story',  w: 360, h: 640 }
    ];

    registerBlockType('blockenberg/image-placeholder', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-iph-root', style: (function() {
                var s = {}; var _tv = getTypoCssVars();
                Object.assign(s, _tv(a.titleTypo, '--bkbg-iph-tt-'));
                return s;
            })() });

            function editorPreview() {
                var previewW = 320, previewH = Math.round(320 * (a.defaultHeight / a.defaultWidth));
                if (previewH > 280) { previewH = 280; previewW = Math.round(280 * (a.defaultWidth / a.defaultHeight)); }
                var displayText = a.defaultText || (a.defaultWidth + ' × ' + a.defaultHeight);

                return el('div', { style: { background: a.sectionBg, padding: '24px', borderRadius: '12px', maxWidth: a.contentMaxWidth + 'px', fontFamily: 'system-ui,sans-serif' } },
                    a.showTitle && el('h2', { className: 'bkbg-iph-title', style: { margin: '0 0 18px', color: a.titleColor } }, a.title),

                    /* Canvas preview */
                    el('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: '20px' } },
                        el('div', { style: { width: previewW + 'px', height: previewH + 'px', background: a.defaultBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' } },
                            a.defaultTheme === 'gradient' && el('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg,' + a.defaultBgColor + ',' + a.accentColor + ')', opacity: 0.85 } }),
                            a.defaultTheme === 'pattern' && el('div', { style: { position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,' + a.defaultBgColor + ' 0,' + a.defaultBgColor + ' 5px,' + a.accentColor + '22 5px,' + a.accentColor + '22 10px)' } }),
                            el('div', { style: { position: 'relative', zIndex: 1, color: a.defaultTextColor, fontWeight: 700, fontSize: '15px', textAlign: 'center', padding: '8px', wordBreak: 'break-word' } }, displayText),
                            el('div', { style: { position: 'relative', zIndex: 1, color: a.defaultTextColor, fontSize: '12px', opacity: 0.7 } }, a.defaultTheme !== 'flat' ? a.defaultTheme : '')
                        )
                    ),

                    /* Preset buttons */
                    a.showAspectPresets && el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', justifyContent: 'center' } },
                        PRESETS.map(function (p) {
                            return el('button', {
                                key: p.label,
                                style: { padding: '5px 12px', borderRadius: '6px', border: '1px solid ' + a.accentColor, background: (a.defaultWidth === p.w && a.defaultHeight === p.h) ? a.accentColor : 'transparent', color: (a.defaultWidth === p.w && a.defaultHeight === p.h) ? '#fff' : a.accentColor, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
                            }, p.label);
                        })
                    ),

                    /* Action buttons */
                    el('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' } },
                        a.showDownloadBtn && el('button', { style: { background: a.accentColor, color: '#fff', border: 'none', borderRadius: '7px', padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' } }, '⬇ Download PNG'),
                        a.showCopyUriBtn && el('button', { style: { background: 'transparent', border: '2px solid ' + a.accentColor, color: a.accentColor, borderRadius: '7px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' } }, 'Copy Data URI'),
                        a.showCopyUrlBtn && el('button', { style: { background: 'transparent', border: '2px solid #6b7280', color: '#6b7280', borderRadius: '7px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' } }, 'Copy URL')
                    )
                );
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(ToggleControl, { label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextControl, { label: 'Title', value: a.title, onChange: function (v) { set({ title: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Default Settings', initialOpen: false },
                        el(RangeControl, { label: 'Default Width (px)', value: a.defaultWidth, min: 50, max: 2000, step: 10, onChange: function (v) { set({ defaultWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(RangeControl, { label: 'Default Height (px)', value: a.defaultHeight, min: 50, max: 2000, step: 10, onChange: function (v) { set({ defaultHeight: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextControl, { label: 'Default Text (blank = dimensions)', value: a.defaultText, onChange: function (v) { set({ defaultText: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(SelectControl, { label: 'Default Theme', value: a.defaultTheme, options: [{ label: 'Flat', value: 'flat' }, { label: 'Gradient', value: 'gradient' }, { label: 'Pattern', value: 'pattern' }], onChange: function (v) { set({ defaultTheme: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Features', initialOpen: false },
                        el(ToggleControl, { label: 'Show Aspect Ratio Presets', checked: a.showAspectPresets, onChange: function (v) { set({ showAspectPresets: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Theme Selector', checked: a.showThemeSelector, onChange: function (v) { set({ showThemeSelector: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Download Button', checked: a.showDownloadBtn, onChange: function (v) { set({ showDownloadBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Copy Data URI', checked: a.showCopyUriBtn, onChange: function (v) { set({ showCopyUriBtn: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Copy URL Button', checked: a.showCopyUrlBtn, onChange: function (v) { set({ showCopyUrlBtn: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.contentMaxWidth, min: 400, max: 1200, step: 10, onChange: function (v) { set({ contentMaxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color', value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                            { label: 'Default BG Color', value: a.defaultBgColor, onChange: function (v) { set({ defaultBgColor: v || '#cccccc' }); } },
                            { label: 'Default Text Color', value: a.defaultTextColor, onChange: function (v) { set({ defaultTextColor: v || '#555555' }); } },
                            { label: 'Section Background', value: a.sectionBg, onChange: function (v) { set({ sectionBg: v || '#f5f3ff' }); } },
                            { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Title Color', value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#3730a3' }); } },
                            { label: 'Label Color', value: a.labelColor, onChange: function (v) { set({ labelColor: v || '#374151' }); } }
                        ]
                    })
                ),
                el('div', blockProps, editorPreview())
            );
        },
        save: function (props) {
            var a = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-iph-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );
