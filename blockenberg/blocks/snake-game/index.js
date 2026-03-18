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
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var TC = getTypoControl();
        var blockProps = useBlockProps((function () {
            var _tvFn = getTypoCssVars();
            var s = { background: a.sectionBg, borderRadius: 16, padding: '28px 20px', textAlign: 'center' };
            if (_tvFn) {
                Object.assign(s, _tvFn(a.titleTypo || {}, '--bksnk-tt-'));
                Object.assign(s, _tvFn(a.subtitleTypo || {}, '--bksnk-st-'));
            }
            return { style: s };
        })());

        var sz = Math.min(a.canvasSize || 400, 400);
        var gs = a.gridSize || 20;
        var cell = sz / gs;

        // Demo snake: a small snake in the center
        var demoSnake = [[10,10],[9,10],[8,10],[7,10]];
        var demoFood  = [14, 7];

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Game Settings', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Grid Size (cells)', 'blockenberg'),
                        value: a.gridSize, min: 10, max: 30,
                        onChange: function (v) { setAttributes({ gridSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Canvas Size (px)', 'blockenberg'),
                        value: a.canvasSize, min: 280, max: 600,
                        onChange: function (v) { setAttributes({ canvasSize: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Default Speed', 'blockenberg'),
                        value: a.defaultSpeed,
                        options: [
                            { label: 'Slow', value: 'slow' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'Fast', value: 'fast' },
                            { label: 'Insane', value: 'insane' }
                        ],
                        onChange: function (v) { setAttributes({ defaultSpeed: v }); }
                    }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Wall Kills Snake', 'blockenberg'), checked: a.wallsKill, onChange: function (v) { setAttributes({ wallsKill: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show High Score', 'blockenberg'), checked: a.showHighScore, onChange: function (v) { setAttributes({ showHighScore: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Touch Controls', 'blockenberg'), checked: a.showControls, onChange: function (v) { setAttributes({ showControls: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    TC && el(TC, {
                        label: __('Title', 'blockenberg'),
                        value: a.titleTypo || {},
                        onChange: function (v) { setAttributes({ titleTypo: v }); }
                    }),
                    TC && el(TC, {
                        label: __('Subtitle', 'blockenberg'),
                        value: a.subtitleTypo || {},
                        onChange: function (v) { setAttributes({ subtitleTypo: v }); }
                    })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Snake Body', 'blockenberg'), value: a.snakeColor, onChange: function (v) { setAttributes({ snakeColor: v || '#22c55e' }); } },
                        { label: __('Snake Head', 'blockenberg'), value: a.snakeHeadColor, onChange: function (v) { setAttributes({ snakeHeadColor: v || '#16a34a' }); } },
                        { label: __('Food', 'blockenberg'), value: a.foodColor, onChange: function (v) { setAttributes({ foodColor: v || '#ef4444' }); } },
                        { label: __('Grid Lines', 'blockenberg'), value: a.gridColor, onChange: function (v) { setAttributes({ gridColor: v || '#f3f4f6' }); } },
                        { label: __('Board Background', 'blockenberg'), value: a.boardBg, onChange: function (v) { setAttributes({ boardBg: v || '#ffffff' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f0fdf4' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#22c55e' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#14532d' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, {
                    tagName: 'h3', className: 'bkbg-snk-title',
                    value: a.title, onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Snake', 'blockenberg'),
                    style: { color: a.titleColor, margin: '0 0 4px' }
                }),
                el(RichText, {
                    tagName: 'p', className: 'bkbg-snk-subtitle',
                    value: a.subtitle, onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Subtitle', 'blockenberg'),
                    style: { color: a.titleColor + 'bb', margin: '0 0 14px' }
                }),
                // Score/high-score bar
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 } },
                    el('div', { style: { fontWeight: 700, color: a.titleColor } }, 'Score: 0'),
                    a.showHighScore && el('div', { style: { fontWeight: 700, color: a.accentColor } }, 'Best: 0')
                ),
                // Canvas preview (SVG)
                el('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
                    el('svg', {
                        width: sz, height: sz,
                        style: { border: '2px solid ' + a.accentColor, borderRadius: 10, background: a.boardBg, display: 'block' }
                    },
                        // Grid lines
                        Array.from({ length: gs + 1 }, function (_, i) {
                            return el('g', { key: 'g' + i },
                                el('line', { x1: i * cell, y1: 0, x2: i * cell, y2: sz, stroke: a.gridColor, strokeWidth: 0.5 }),
                                el('line', { x1: 0, y1: i * cell, x2: sz, y2: i * cell, stroke: a.gridColor, strokeWidth: 0.5 })
                            );
                        }),
                        // Snake body
                        demoSnake.slice(1).map(function (s, i) {
                            return el('rect', { key: 'b' + i, x: s[0]*cell+1, y: s[1]*cell+1, width: cell-2, height: cell-2, rx: 3, fill: a.snakeColor });
                        }),
                        // Snake head
                        el('rect', { x: demoSnake[0][0]*cell+1, y: demoSnake[0][1]*cell+1, width: cell-2, height: cell-2, rx: 4, fill: a.snakeHeadColor }),
                        // Food
                        el('circle', { cx: demoFood[0]*cell+cell/2, cy: demoFood[1]*cell+cell/2, r: cell/2 - 2, fill: a.foodColor }),
                        // Start text overlay
                        el('rect', { x: sz/2-60, y: sz/2-18, width: 120, height: 36, rx: 8, fill: 'rgba(0,0,0,0.5)' }),
                        el('text', { x: sz/2, y: sz/2+6, textAnchor: 'middle', fill: '#fff', fontSize: 14, fontFamily: 'system-ui', fontWeight: 700 }, 'Press SPACE to Start')
                    )
                ),
                // Touch controls preview
                a.showControls && el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
                    el('button', { style: { width: 48, height: 48, fontSize: 20, borderRadius: 8, border: '2px solid ' + a.accentColor, background: 'transparent', color: a.accentColor, cursor: 'default' } }, '▲'),
                    el('div', { style: { display: 'flex', gap: 6 } },
                        el('button', { style: { width: 48, height: 48, fontSize: 20, borderRadius: 8, border: '2px solid ' + a.accentColor, background: 'transparent', color: a.accentColor, cursor: 'default' } }, '◀'),
                        el('button', { style: { width: 48, height: 48, fontSize: 20, borderRadius: 8, border: '2px solid ' + a.accentColor, background: 'transparent', color: a.accentColor, cursor: 'default' } }, '▼'),
                        el('button', { style: { width: 48, height: 48, fontSize: 20, borderRadius: 8, border: '2px solid ' + a.accentColor, background: 'transparent', color: a.accentColor, cursor: 'default' } }, '▶')
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/snake-game', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-snk-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-snk-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-snk-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );
