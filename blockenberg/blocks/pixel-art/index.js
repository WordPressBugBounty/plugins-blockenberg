( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var SelectControl = wp.components.SelectControl;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // Demo pixel art: a small heart pattern for the 32x32 canvas preview
    var HEART = [
        '  ##  ##  ',
        ' ###### ## ',
        '##########',
        '##########',
        ' ######## ',
        '  ######  ',
        '   ####   ',
        '    ##    '
    ];

    var DEFAULT_PALETTE = ['#000000','#ffffff','#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#78716c','#94a3b8'];

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var cols = a.gridCols || 32;
        var rows = a.gridRows || 32;
        var cs   = Math.min(a.cellSize || 16, 20); // cap preview cell size
        var W = cols * cs;
        var H = rows * cs;

        var blockProps = useBlockProps((function () {
            var tv = getTypoCssVars();
            var s = { background: a.sectionBg || '#f8fafc', padding: '24px 20px' };
            Object.assign(s, tv(a.titleTypo, '--bkbg-pxa-tt-'));
            Object.assign(s, tv(a.subtitleTypo, '--bkbg-pxa-st-'));
            return { style: s };
        })());

        // Preview canvas (static)
        var cells = [];
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                // Put heart near center
                var hr = r - Math.floor(rows / 2 - 4);
                var hc = c - Math.floor(cols / 2 - 5);
                var isHeart = hr >= 0 && hr < HEART.length && hc >= 0 && hc < HEART[hr].length && HEART[hr][hc] === '#';
                cells.push(el('div', { key: r + '_' + c, style: {
                    width: cs, height: cs,
                    background: isHeart ? '#ef4444' : (a.canvasBg || '#ffffff'),
                    borderRight: a.showGrid ? '1px solid ' + (a.gridLineColor || '#e5e7eb') : 'none',
                    borderBottom: a.showGrid ? '1px solid ' + (a.gridLineColor || '#e5e7eb') : 'none',
                    boxSizing: 'border-box'
                } }));
            }
        }

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Canvas Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Grid Columns', 'blockenberg'), value: a.gridCols, min: 8, max: 64,
                        onChange: function (v) { setAttributes({ gridCols: v }); } }),
                    el(RangeControl, { label: __('Grid Rows', 'blockenberg'), value: a.gridRows, min: 8, max: 64,
                        onChange: function (v) { setAttributes({ gridRows: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Grid Lines', 'blockenberg'), checked: a.showGrid,
                        onChange: function (v) { setAttributes({ showGrid: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Download Button', 'blockenberg'), checked: a.showDownload,
                        onChange: function (v) { setAttributes({ showDownload: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function(v) { setAttributes({ titleTypo: v }); } }),
                    el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo, onChange: function(v) { setAttributes({ subtitleTypo: v }); } }),
                    el(RangeControl, { label: __('Cell Size (px)', 'blockenberg'), value: a.cellSize, min: 6, max: 40,
                                            onChange: function (v) { setAttributes({ cellSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Canvas Background', 'blockenberg'), value: a.canvasBg, onChange: function (v) { setAttributes({ canvasBg: v || '#ffffff' }); } },
                        { label: __('Grid Line Color', 'blockenberg'), value: a.gridLineColor, onChange: function (v) { setAttributes({ gridLineColor: v || '#e5e7eb' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f8fafc' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, { tagName: 'h3', className: 'bkbg-pxa-title', value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: 'Pixel Art',
                    style: { color: a.titleColor, textAlign: 'center', margin: '0 0 4px' } }),
                el(RichText, { tagName: 'p', className: 'bkbg-pxa-subtitle', value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: 'Draw something pixel by pixel!',
                    style: { color: a.titleColor, opacity: 0.65, textAlign: 'center', margin: '0 0 14px' } }),
                // Toolbar preview
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' } },
                    ['✏️ Draw', '🪣 Fill', '⬜ Erase'].map(function (t) { return el('div', { key: t, style: { background: a.accentColor + '22', color: a.titleColor, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600 } }, t); }),
                    (a.palette || DEFAULT_PALETTE).map(function (c, i) { return el('div', { key: i, style: { width: 22, height: 22, background: c, borderRadius: 4, border: i === 0 ? '2px solid ' + a.accentColor : '2px solid transparent', cursor: 'pointer' } }); })
                ),
                // Canvas preview
                el('div', { style: { display: 'flex', justifyContent: 'center', overflow: 'auto' } },
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', ' + cs + 'px)', width: W, height: H, border: '1px solid ' + (a.gridLineColor || '#e5e7eb'), borderRadius: 4, overflow: 'hidden', flexShrink: 0 } }, cells)
                )
            )
        );
    }

    registerBlockType('blockenberg/pixel-art', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            var bpSave = useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.titleTypo, '--bkbg-pxa-tt-'));
                Object.assign(s, tv(a.subtitleTypo, '--bkbg-pxa-st-'));
                return { style: s };
            })());
            return el('div', bpSave,
                el('div', { className: 'bkbg-pxa-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-pxa-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-pxa-subtitle', value: a.subtitle })
                )
            );
        },
        deprecated: [{
            attributes: {
                title: { type: 'string', default: 'Pixel Art' },
                subtitle: { type: 'string', default: 'Draw something pixel by pixel!' },
                fontSize: { type: 'number', default: 26 },
                subtitleSize: { type: 'number', default: 14 },
                gridCols: { type: 'number', default: 32 },
                gridRows: { type: 'number', default: 32 },
                cellSize: { type: 'number', default: 16 },
                showGrid: { type: 'boolean', default: true },
                showDownload: { type: 'boolean', default: true },
                palette: { type: 'array', default: ['#000000','#ffffff','#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#78716c','#94a3b8'] },
                canvasBg: { type: 'string', default: '#ffffff' },
                gridLineColor: { type: 'string', default: '#e5e7eb' },
                sectionBg: { type: 'string', default: '#f8fafc' },
                titleColor: { type: 'string', default: '#1e1b4b' },
                accentColor: { type: 'string', default: '#6366f1' },
                fontWeight: { type: 'string', default: '700' },
                subtitleFontWeight: { type: 'string', default: '400' }
            },
            save: function (props) {
                var a = props.attributes;
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-pxa-app', 'data-opts': JSON.stringify(a) },
                        el(RichText.Content, { tagName: 'h3', className: 'bkbg-pxa-title', value: a.title }),
                        el(RichText.Content, { tagName: 'p', className: 'bkbg-pxa-subtitle', value: a.subtitle })
                    )
                );
            }
        }]
    });
}() );
