( function () {
    var el                = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText          = wp.blockEditor.RichText;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var ToggleControl     = wp.components.ToggleControl;
    var SelectControl     = wp.components.SelectControl;

    var _drwTC, _drwTV;
    function _tc() { return _drwTC || (_drwTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_drwTV || (_drwTV = window.bkbgTypoCssVars)) ? _drwTV(t, p) : {}; }

    var TOOL_OPTIONS = [
        { label: '✏️ Pen (freehand)',   value: 'pen'      },
        { label: '🖊️ Marker (soft)',    value: 'marker'   },
        { label: '📏 Line',             value: 'line'     },
        { label: '□ Rectangle',         value: 'rect'     },
        { label: '○ Ellipse',           value: 'ellipse'  },
        { label: '🧹 Eraser',           value: 'eraser'   }
    ];

    var PRESET_PALETTE = [
        '#1e1b4b','#ef4444','#f97316','#eab308',
        '#22c55e','#06b6d4','#6366f1','#a855f7',
        '#ec4899','#78716c','#ffffff','#000000'
    ];

    // ---- Editor preview component ----
    function EditorPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6366f1';
        var titleColor = a.titleColor || '#1e1b4b';

        return el('div', { className: 'bkbg-drw-editor-preview', style: { background: a.sectionBg || '#f8fafc', borderRadius: 14, padding: 28, fontFamily: 'inherit' } },
            el('div', { className: 'bkbg-drw-editor-header', style: { marginBottom: 16, textAlign: 'center' } },
                el(RichText, {
                    tagName: 'h3',
                    className: 'bkbg-drw-title',
                    style: { margin: 0, color: titleColor },
                    value: a.title,
                    onChange: function (v) { props.setAttributes({ title: v }); },
                    placeholder: 'Drawing Canvas'
                }),
                el(RichText, {
                    tagName: 'p',
                    className: 'bkbg-drw-subtitle',
                    style: { margin: '4px 0 0', color: titleColor, opacity: 0.65 },
                    value: a.subtitle,
                    onChange: function (v) { props.setAttributes({ subtitle: v }); },
                    placeholder: 'Draw anything...'
                })
            ),
            // Toolbar preview
            a.showToolbar !== false && el('div', { className: 'bkbg-drw-toolbar-preview', style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' } },
                ['✏️', '🖊️', '📏', '□', '○', '🧹'].map(function (icon, i) {
                    return el('div', { key: i, style: { background: i === 0 ? accent : '#e5e7eb', color: i === 0 ? '#fff' : '#374151', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 16, cursor: 'pointer', fontWeight: i === 0 ? 700 : 400 } }, icon);
                }),
                el('div', { style: { flexGrow: 1 } }),
                PRESET_PALETTE.slice(0, 8).map(function (col, i) {
                    return el('div', { key: i, style: { width: 20, height: 20, borderRadius: '50%', background: col, border: i === 0 ? '2.5px solid ' + accent : '1.5px solid rgba(0,0,0,0.15)', cursor: 'pointer' } });
                })
            ),
            // Canvas preview (with a simple illustration)
            el('div', { style: { position: 'relative', background: a.backgroundColor || '#ffffff', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', height: 200 } },
                el('svg', { width: '100%', height: '100%', viewBox: '0 0 400 200', style: { position: 'absolute', inset: 0 } },
                    // Background check (grid dots)
                    el('defs', {},
                        el('pattern', { id: 'p', x: 0, y: 0, width: 20, height: 20, patternUnits: 'userSpaceOnUse' },
                            el('circle', { cx: 1, cy: 1, r: 1, fill: '#e5e7eb' })
                        )
                    ),
                    a.showGrid !== false && el('rect', { width: '100%', height: '100%', fill: 'url(#p)' }),
                    // A simple wave/doodle illustration
                    el('path', { d: 'M40,120 Q80,60 120,100 T200,80 T280,110 T360,70', stroke: accent, strokeWidth: 3, fill: 'none', strokeLinecap: 'round' }),
                    el('circle', { cx: 100, cy: 140, r: 30, stroke: '#ef4444', strokeWidth: 3, fill: 'none' }),
                    el('rect', { x: 220, y: 110, width: 60, height: 50, rx: 6, stroke: '#22c55e', strokeWidth: 3, fill: '#22c55e22' }),
                    el('path', { d: 'M60,160 L90,100 L120,160', stroke: '#f97316', strokeWidth: 3, fill: 'none', strokeLinejoin: 'round' })
                ),
                el('div', { style: { position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: '#9ca3af', fontStyle: 'italic' } }, 'Interactive canvas on frontend')
            ),
            a.showDownload !== false && el('div', { style: { marginTop: 12, display: 'flex', gap: 8 } },
                a.showUndo !== false && el('div', { style: { background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '6px 14px', fontSize: 13, color: '#374151', cursor: 'pointer' } }, '↩ Undo'),
                el('div', { style: { background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 7, padding: '6px 14px', fontSize: 13, color: '#374151', cursor: 'pointer' } }, '🗑 Clear'),
                el('div', { style: { background: accent, borderRadius: 7, padding: '6px 14px', fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 700 } }, '⬇ Download PNG')
            )
        );
    }

    registerBlockType('blockenberg/drawing-canvas', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-drw-editor-wrap', style: Object.assign(
                { '--bkbg-drw-ttl-fs': (a.fontSize || 26) + 'px', '--bkbg-drw-sub-fs': (a.subtitleSize || 14) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-drw-ttl-'),
                _tv(a.typoSubtitle || {}, '--bkbg-drw-sub-')
            ) });
            var accent = a.accentColor || '#6366f1';

            return el('div', blockProps,
                el(InspectorControls, {},
                    // Content
                    el(PanelBody, { title: 'Block Content', initialOpen: true },
                        ),
                    // Canvas Settings
                    el(PanelBody, { title: 'Canvas Settings', initialOpen: false },
                        el(RangeControl, { label: 'Canvas width (px)', value: a.canvasWidth || 800, onChange: function (v) { setAttributes({ canvasWidth: v }); }, min: 300, max: 1600, step: 10, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Canvas height (px)', value: a.canvasHeight || 480, onChange: function (v) { setAttributes({ canvasHeight: v }); }, min: 200, max: 1200, step: 10, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: 'Default stroke width', value: a.defaultLineWidth || 4, onChange: function (v) { setAttributes({ defaultLineWidth: v }); }, min: 1, max: 40, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: 'Default tool', value: a.defaultTool || 'pen', options: TOOL_OPTIONS, onChange: function (v) { setAttributes({ defaultTool: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show background grid', checked: !!a.showGrid, onChange: function (v) { setAttributes({ showGrid: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    // UI Options
                    el(PanelBody, { title: 'Toolbar & UI', initialOpen: false },
                        el(ToggleControl, { label: 'Show toolbar', checked: a.showToolbar !== false, onChange: function (v) { setAttributes({ showToolbar: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show undo button', checked: a.showUndo !== false, onChange: function (v) { setAttributes({ showUndo: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show download button', checked: a.showDownload !== false, onChange: function (v) { setAttributes({ showDownload: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    // Colors
                    
                    el( PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label: 'Title', typo: a.typoTitle || {}, onChange: function (v) { setAttributes({ typoTitle: v }); }, defaultSize: a.fontSize || 26 }),
                        _tc() && el(_tc(), { label: 'Subtitle', typo: a.typoSubtitle || {}, onChange: function (v) { setAttributes({ typoSubtitle: v }); }, defaultSize: a.subtitleSize || 14 })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Accent color',     value: a.accentColor,     onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                            { label: 'Canvas background', value: a.backgroundColor, onChange: function (v) { setAttributes({ backgroundColor: v || '#ffffff' }); } },
                            { label: 'Grid lines',        value: a.gridColor,       onChange: function (v) { setAttributes({ gridColor: v || '#e5e7eb' }); } },
                            { label: 'Section background', value: a.sectionBg,      onChange: function (v) { setAttributes({ sectionBg: v || '#f8fafc' }); } },
                            { label: 'Title color',       value: a.titleColor,      onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } }
                        ],
                        enableAlpha: true,
                        disableCustomGradients: true
                    })
                ),
                el(EditorPreview, { attributes: a, setAttributes: setAttributes })
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save();
            var opts = {
                canvasWidth:    a.canvasWidth    || 800,
                canvasHeight:   a.canvasHeight   || 480,
                defaultTool:    a.defaultTool    || 'pen',
                defaultColor:   a.defaultColor   || '#1e1b4b',
                defaultLineWidth: a.defaultLineWidth || 4,
                showGrid:       a.showGrid       || false,
                showToolbar:    a.showToolbar !== false,
                showDownload:   a.showDownload !== false,
                showUndo:       a.showUndo !== false,
                backgroundColor: a.backgroundColor || '#ffffff',
                gridColor:      a.gridColor      || '#e5e7eb',
                sectionBg:      a.sectionBg      || '#f8fafc',
                titleColor:     a.titleColor     || '#1e1b4b',
                accentColor:    a.accentColor    || '#6366f1',
                fontSize:       a.fontSize       || 26,
                fontWeight:     a.fontWeight     || '800',
                lineHeight:     a.lineHeight     || 1.2,
                subtitleSize:   a.subtitleSize   || 14,
                subtitleFontWeight: a.subtitleFontWeight || '400',
                subtitleLineHeight: a.subtitleLineHeight || 1.5,
                typoTitle:      a.typoTitle      || {},
                typoSubtitle:   a.typoSubtitle   || {}
            };

            return el('div', blockProps,
                el('div', { className: 'bkbg-drw-app', 'data-opts': JSON.stringify(opts) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-drw-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-drw-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
