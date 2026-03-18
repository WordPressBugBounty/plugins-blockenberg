( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var useEffect         = wp.element.useEffect;
    var useRef            = wp.element.useRef;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;
    var ColorPicker        = wp.components.ColorPicker;
    var Popover           = wp.components.Popover;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function parseItems(text) {
        return String(text||'').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    }

    function drawWheel(canvas, items, colors, textColor, centerColor, rotation) {
        var ctx = canvas.getContext('2d');
        var size = canvas.width;
        var cx = size / 2, cy = size / 2, rad = size / 2 - 4;
        ctx.clearRect(0, 0, size, size);
        if (!items.length) return;
        var slice = (2 * Math.PI) / items.length;
        var clrs = colors.split(',').map(function(c){ return c.trim(); });
        items.forEach(function(item, i) {
            var start = rotation + i * slice;
            var end   = start + slice;
            var color = clrs[i % clrs.length];
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, rad, start, end);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            // text
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(start + slice / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = textColor || '#ffffff';
            ctx.font = 'bold ' + Math.min(15, Math.max(9, Math.floor(rad * 0.13))) + 'px -apple-system,sans-serif';
            var maxLen = Math.floor(rad * 0.55);
            var label = item.length > 14 ? item.slice(0,13)+'…' : item;
            ctx.fillText(label, rad - 12, 5);
            ctx.restore();
        });
        // center circle
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.12, 0, 2*Math.PI);
        ctx.fillStyle = centerColor || '#ffffff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function WheelPreview(props) {
        var a  = props.attributes;
        var sa = props.setAttributes;
        var canvasRef = useRef(null);
        var items = parseItems(a.defaultItems);
        var size  = Math.min(a.wheelSize || 340, 340);

        useEffect(function() {
            if (canvasRef.current) {
                drawWheel(canvasRef.current, items, a.colors||'#6c3fb5,#10b981,#f59e0b,#3b82f6,#ef4444,#8b5cf6', a.textColor, a.centerColor, 0);
            }
        }, [a.defaultItems, a.colors, a.textColor, a.centerColor, a.wheelSize]);

        return el('div', { style: { paddingTop: a.paddingTop+'px', paddingBottom: a.paddingBottom+'px', background: a.sectionBg||undefined } },
            el('div', { style: { background: a.cardBg, borderRadius: a.cardRadius+'px', padding: '36px 28px', maxWidth: a.maxWidth+'px', margin: '0 auto', boxShadow: '0 4px 24px rgba(0,0,0,0.09)', textAlign: 'center' } },

                (a.showTitle||a.showSubtitle) && el('div', { style:{ marginBottom:'20px' }},
                    a.showTitle    && el('div', { className: 'bkbg-sw-title', style:{ color:a.titleColor,marginBottom:'6px' }}, a.title),
                    a.showSubtitle && el('div', { className: 'bkbg-sw-subtitle', style:{ color:a.subtitleColor }}, a.subtitle)
                ),

                // Textarea
                el('div', { style:{ marginBottom:'18px', textAlign:'left' }},
                    el('label', { style:{ fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em',color:a.labelColor,display:'block',marginBottom:'5px' }}, 'Items (' + items.length + ')'),
                    el('textarea', { rows: 5, value: a.defaultItems, style:{ width:'100%',padding:'9px 12px',border:'1.5px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',fontFamily:'monospace',resize:'vertical',outline:'none',boxSizing:'border-box' },
                        onChange: function(e){ sa({ defaultItems: e.target.value }); }
                    })
                ),

                // Wheel + pointer
                el('div', { style:{ position:'relative', display:'inline-block', marginBottom:'20px' }},
                    // pointer triangle
                    el('div', { style:{ position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'12px solid transparent', borderRight:'12px solid transparent', borderTop:'22px solid '+(a.pointerColor||'#1f2937'), zIndex:10, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}),
                    el('canvas', { ref: canvasRef, width: size, height: size, style:{ display:'block', maxWidth:'100%' }})
                ),

                // Spin button
                el('button', { style:{ display:'block', margin:'0 auto 16px', padding:'13px 48px', borderRadius:(a.btnRadius||100)+'px', border:'none', background:a.btnBg||'#6c3fb5', color:a.btnColor||'#fff', fontWeight:700, fontSize:'16px', cursor:'default', fontFamily:'inherit' }}, a.buttonLabel||'Spin!'),

                // Winner placeholder
                a.showWinnerBox && el('div', { className: 'bkbg-sw-winner-text', style:{ background:a.winnerBg||'#6c3fb5', borderRadius:'10px', padding:'16px 24px', color:a.winnerColor||'#fff', display:'inline-block', opacity:.25 }}, '🎉 Winner will appear here')
            )
        );
    }

    /* ── BkbgMultiColorControl ──────────────────────────────────────── */
    function BkbgMultiColorControl(props) {
        var label = props.label;
        var value = props.value || '';
        var onChange = props.onChange;
        var colors = value.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
        var st = useState(-1); var openIdx = st[0]; var setOpenIdx = st[1];
        return el(Fragment, null,
            el('div', { style: { marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: '4px' } }, label),
                el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' } },
                    colors.map(function (c, i) {
                        return el('div', { key: i, style: { position: 'relative', display: 'inline-flex' } },
                            el('button', { type: 'button', style: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: c, cursor: 'pointer', padding: 0 }, onClick: function () { setOpenIdx(openIdx === i ? -1 : i); } }),
                            el('button', { type: 'button', 'aria-label': 'Remove', style: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', border: 'none', background: '#d00', color: '#fff', fontSize: '10px', lineHeight: '14px', cursor: 'pointer', padding: 0, textAlign: 'center' }, onClick: function () { var n = colors.slice(); n.splice(i, 1); onChange(n.join(',')); } }, '×'),
                            openIdx === i && el(Popover, { onClose: function () { setOpenIdx(-1); } }, el('div', { style: { padding: '8px' } }, el(ColorPicker, { color: c, enableAlpha: true, onChange: function (v) { var n = colors.slice(); n[i] = v; onChange(n.join(',')); } })))
                        );
                    }),
                    el(Button, { isSmall: true, variant: 'secondary', onClick: function () { onChange(value ? value + ',#6c3fb5' : '#6c3fb5'); }, style: { height: 28, minWidth: 28 } }, '+')
                )
            )
        );
    }

    registerBlockType('blockenberg/spin-wheel', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = {};
                var tv = getTypoCssVars();
                if (tv) {
                    Object.assign(s, tv(a.titleTypo, '--bksw-tt-'));
                    Object.assign(s, tv(a.subtitleTypo, '--bksw-st-'));
                    Object.assign(s, tv(a.winnerTypo, '--bksw-wn-'));
                }
                return { style: s };
            })());
            var colorSettings = [
                { value: a.btnBg,        onChange: function(v){ set({btnBg:v}); },        label: 'Spin Button Background' },
                { value: a.btnColor,     onChange: function(v){ set({btnColor:v}); },      label: 'Spin Button Text' },
                { value: a.pointerColor, onChange: function(v){ set({pointerColor:v}); },  label: 'Pointer Color' },
                { value: a.textColor,    onChange: function(v){ set({textColor:v}); },     label: 'Wheel Item Text' },
                { value: a.centerColor,  onChange: function(v){ set({centerColor:v}); },   label: 'Center Circle Color' },
                { value: a.cardBg,       onChange: function(v){ set({cardBg:v}); },        label: 'Card Background' },
                { value: a.winnerBg,     onChange: function(v){ set({winnerBg:v}); },      label: 'Winner Box Background' },
                { value: a.winnerColor,  onChange: function(v){ set({winnerColor:v}); },   label: 'Winner Box Text' },
                { value: a.historyBg,    onChange: function(v){ set({historyBg:v}); },     label: 'History Background' },
                { value: a.historyColor, onChange: function(v){ set({historyColor:v}); },  label: 'History Text' },
                { value: a.labelColor,   onChange: function(v){ set({labelColor:v}); },    label: 'Label Color' },
                { value: a.titleColor,   onChange: function(v){ set({titleColor:v}); },    label: 'Title Color' },
                { value: a.subtitleColor,onChange: function(v){ set({subtitleColor:v}); }, label: 'Subtitle Color' },
                { value: a.sectionBg,    onChange: function(v){ set({sectionBg:v}); },     label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Header', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Title',    checked: a.showTitle,    onChange: function(v){ set({showTitle:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Subtitle', checked: a.showSubtitle, onChange: function(v){ set({showSubtitle:v}); } }),
                        el(TextControl, { label: 'Title',    value: a.title,    onChange: function(v){ set({title:v}); } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function(v){ set({subtitle:v}); } })
                    ),
                    el(PanelBody, { title: 'Wheel Settings', initialOpen: true },
                        el(TextControl, { label: 'Button Label', value: a.buttonLabel, onChange: function(v){ set({buttonLabel:v}); } }),
                        el(BkbgMultiColorControl, { label: 'Segment Colors (comma-separated hex)', value: a.colors, onChange: function(v){ set({colors:v}); } }),
                        el(RangeControl, { label: 'Spin Duration (sec)', value: a.spinDuration, min: 1, max: 10, step: 0.5, onChange: function(v){ set({spinDuration:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Winner Box',  checked: a.showWinnerBox, onChange: function(v){ set({showWinnerBox:v}); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Spin History',checked: a.showHistory,   onChange: function(v){ set({showHistory:v}); } })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() ? el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Subtitle Typography', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { set({ subtitleTypo: v }); } }) : null,
                        getTypoControl() ? el(getTypoControl(), { label: __('Winner Typography', 'blockenberg'), value: a.winnerTypo || {}, onChange: function (v) { set({ winnerTypo: v }); } }) : null
                    ),
el(PanelColorSettings, { title: 'Colors', initialOpen: false, colorSettings: colorSettings }),
                    el(PanelBody, { title: 'Sizing & Layout', initialOpen: false },
                        el(RangeControl, { label: 'Wheel Size (px)',    value: a.wheelSize,     min: 180,max: 500, step: 10, onChange: function(v){ set({wheelSize:v}); } }),
                        el(RangeControl, { label: 'Card Border Radius', value: a.cardRadius,    min: 0,  max: 48,  step: 1,  onChange: function(v){ set({cardRadius:v}); } }),
                        el(RangeControl, { label: 'Button Radius',      value: a.btnRadius,     min: 0,  max: 100, step: 2,  onChange: function(v){ set({btnRadius:v}); } }),
                        el(RangeControl, { label: 'Max Width (px)',     value: a.maxWidth,      min: 300,max: 900, step: 10, onChange: function(v){ set({maxWidth:v}); } }),
                        el(RangeControl, { label: 'Padding Top (px)',   value: a.paddingTop,    min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingTop:v}); } }),
                        el(RangeControl, { label: 'Padding Bottom (px)',value: a.paddingBottom, min: 0,  max: 160, step: 4,  onChange: function(v){ set({paddingBottom:v}); } })
                    )
                ),
                el('div', blockProps, el(WheelPreview, { attributes: a, setAttributes: set }))
            );
        },
        save: function(props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save(), el('div', { className: 'bkbg-sw-app', 'data-opts': JSON.stringify({ titleTypo: a.titleTypo, subtitleTypo: a.subtitleTypo, winnerTypo: a.winnerTypo, title: a.title, subtitle: a.subtitle, showTitle: a.showTitle, showSubtitle: a.showSubtitle, defaultItems: a.defaultItems, buttonLabel: a.buttonLabel, showWinnerBox: a.showWinnerBox, showHistory: a.showHistory, spinDuration: a.spinDuration, wheelSize: a.wheelSize, colors: a.colors, textColor: a.textColor, pointerColor: a.pointerColor, centerColor: a.centerColor, cardBg: a.cardBg, winnerBg: a.winnerBg, winnerColor: a.winnerColor, historyBg: a.historyBg, historyColor: a.historyColor, btnBg: a.btnBg, btnColor: a.btnColor, labelColor: a.labelColor, titleColor: a.titleColor, subtitleColor: a.subtitleColor, sectionBg: a.sectionBg, cardRadius: a.cardRadius, btnRadius: a.btnRadius, maxWidth: a.maxWidth, paddingTop: a.paddingTop, paddingBottom: a.paddingBottom }) }));
        }
    });
}() );
