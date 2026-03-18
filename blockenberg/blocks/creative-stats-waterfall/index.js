/* ====================================================
   Creative Stats Waterfall — editor (index.js)
   Block: blockenberg/creative-stats-waterfall
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody          = wp.components.PanelBody;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var ColorPicker         = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var __                 = wp.i18n.__;

    var _cswTC, _cswTV;
    function _tc() { return _cswTC || (_cswTC = window.bkbgTypographyControl); }
    function _tv(obj, prefix) { var fn = _cswTV || (_cswTV = window.bkbgTypoCssVars); return fn ? fn(obj, prefix) : {}; }

    function uid() { return 'st' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-csw-pt':       a.paddingTop+'px',
            '--bkbg-csw-pb':       a.paddingBottom+'px',
            '--bkbg-csw-num-c':    a.numberColor || undefined,
            '--bkbg-csw-ps-c':     a.prefixSuffixColor || undefined,
            '--bkbg-csw-label-c':  a.labelColor,
            '--bkbg-csw-desc-c':   a.descColor,
            '--bkbg-csw-div-c':    a.dividerColor,
            '--bkbg-csw-num-sz':   a.numberSize+'px',
            '--bkbg-csw-label-sz': a.labelSize+'px',
            '--bkbg-csw-desc-sz':  a.descSize+'px',
            '--bkbg-csw-gap':      a.gap+'px',
            '--bkbg-csw-offset':   a.waterfallOffset+'px',
            background:            a.sectionBg || undefined,
        }, _tv(a.typoNumber, '--bkbg-csw-num-'), _tv(a.typoLabel, '--bkbg-csw-lbl-'), _tv(a.typoDesc, '--bkbg-csw-dsc-'));
    }

    function StatCard(props) {
        var stat    = props.stat;
        var idx     = props.idx;
        var layout  = props.layout;
        var showDesc = props.showDesc;
        var showDiv  = props.showDiv;
        var divStyle = props.divStyle;
        var topOffset = layout === 'waterfall' ? (idx % 2 === 1 ? 'var(--bkbg-csw-offset)' : '0') : '0';
        return el('div', {
            className: 'bkbg-csw-stat',
            style: { marginTop: topOffset, borderColor: stat.accentColor || undefined }
        },
            el('div', { className:'bkbg-csw-number-row' },
                el('span', { className:'bkbg-csw-prefix' }, stat.prefix),
                el('span', { className:'bkbg-csw-value', style:{color:stat.accentColor} }, stat.value),
                el('span', { className:'bkbg-csw-suffix', style:{color:stat.accentColor} }, stat.suffix)
            ),
            el('div', { className:'bkbg-csw-label' }, stat.label),
            showDesc ? el('div', { className:'bkbg-csw-desc' }, stat.description) : null,
            showDiv && divStyle === 'line' ? el('div', { className:'bkbg-csw-divider' }) : null
        );
    }

    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el(Fragment, {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType('blockenberg/creative-stats-waterfall', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var stats   = a.stats;

            var _edit = useState(null);
            var editId = _edit[0]; var setEditId = _edit[1];

            function updateStat(id, patch) {
                setAttr({ stats: stats.map(function(s){ return s.id===id ? Object.assign({},s,patch) : s; }) });
            }

            var blockProps = useBlockProps({
                className: 'bkbg-csw-wrap bkbg-csw-layout--' + a.layout,
                style: wrapStyle(a)
            });

            function statRow(stat, idx) {
                var isEdit = editId === stat.id;
                return el('div', { key:stat.id },
                    el('div', { style:{display:'flex',alignItems:'center',gap:'6px',background:isEdit?'#f3f0ff':'#f8f9fa',border:isEdit?'1px solid #6c3fb5':'1px solid #e2e8f0',borderRadius:'6px',padding:'6px 8px',marginBottom:'4px',cursor:'pointer'}, onClick:function(){ setEditId(isEdit?null:stat.id); } },
                        el('span', { style:{width:12,height:12,borderRadius:'50%',background:stat.accentColor,display:'inline-block',flexShrink:0} }),
                        el('span', { style:{flex:1,fontSize:'13px',fontWeight:500} }, stat.prefix + stat.value + stat.suffix + ' — ' + stat.label),
                        el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,              onClick:function(e){ e.stopPropagation(); setAttr({stats:move(stats,idx,idx-1)}); } }),
                        el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===stats.length-1, onClick:function(e){ e.stopPropagation(); setAttr({stats:move(stats,idx,idx+1)}); } }),
                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({stats:stats.filter(function(_,i){ return i!==idx; })}); if(editId===stat.id) setEditId(null); } })
                    ),
                    isEdit ? el('div', { style:{padding:'10px',background:'#faf8ff',border:'1px solid #6c3fb5',borderTop:'none',borderRadius:'0 0 6px 6px',marginBottom:'4px'} },
                        el('div', { style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'} },
                            el(TextControl, { label:__('Prefix','blockenberg'),  value:stat.prefix,  onChange:function(v){ updateStat(stat.id,{prefix:v}); } }),
                            el(TextControl, { label:__('Value','blockenberg'),   value:stat.value,   onChange:function(v){ updateStat(stat.id,{value:v}); } }),
                            el(TextControl, { label:__('Suffix','blockenberg'),  value:stat.suffix,  onChange:function(v){ updateStat(stat.id,{suffix:v}); } })
                        ),
                        el(TextControl, { label:__('Label','blockenberg'),       value:stat.label,       onChange:function(v){ updateStat(stat.id,{label:v}); } }),
                        el(TextControl, { label:__('Description','blockenberg'), value:stat.description, onChange:function(v){ updateStat(stat.id,{description:v}); } }),
                        el(BkbgColorSwatch, { label:__('Accent color','blockenberg'),value:stat.accentColor, onChange:function(v){ updateStat(stat.id,{accentColor:v}); } })
                    ) : null
                );
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Stats','blockenberg'), initialOpen:true },
                    stats.map(function(s,i){ return statRow(s,i); }),
                    el(Button, { variant:'primary', style:{marginTop:'8px',width:'100%'},
                        onClick:function(){
                            var n={id:uid(),prefix:'',value:'0',suffix:'',label:'New Stat',description:'',accentColor:'#6c3fb5'};
                            setAttr({stats:stats.concat([n])});
                            setEditId(n.id);
                        }
                    }, __('+ Add Stat','blockenberg'))
                ),
                el(PanelBody, { title:__('Layout','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Layout style','blockenberg'), value:a.layout, options:[
                        {label:'Waterfall (offset)',value:'waterfall'},
                        {label:'Grid (uniform)',    value:'grid'},
                        {label:'Horizontal row',   value:'row'},
                    ], onChange:function(v){ setAttr({layout:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'),        value:a.columns,         min:2, max:6, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Waterfall offset (px)','blockenberg'), value:a.waterfallOffset, min:0, max:100, onChange:function(v){ setAttr({waterfallOffset:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'),        value:a.gap,             min:0, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(ToggleControl, { label:__('Show descriptions','blockenberg'),   checked:a.showDescription, onChange:function(v){ setAttr({showDescription:v}); } }),
                    el(ToggleControl, { label:__('Show dividers','blockenberg'),        checked:a.showDivider,     onChange:function(v){ setAttr({showDivider:v}); } }),
                    el(SelectControl, { label:__('Divider style','blockenberg'), value:a.dividerStyle, options:[
                        {label:'Line',value:'line'},
                        {label:'Dot',value:'dot'},
                    ], onChange:function(v){ setAttr({dividerStyle:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    _tc() && el(_tc(), { label: __('Number', 'blockenberg'), value: a.typoNumber, onChange: function (v) { setAttr({ typoNumber: v }); } }),
                    _tc() && el(_tc(), { label: __('Label', 'blockenberg'), value: a.typoLabel, onChange: function (v) { setAttr({ typoLabel: v }); } }),
                    _tc() && el(_tc(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { setAttr({ typoDesc: v }); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),      value:a.sectionBg,         onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Number color','blockenberg'),     value:a.numberColor,       onChange:function(v){ setAttr({numberColor:v||''}); }},
                    {label:__('Prefix / suffix','blockenberg'),  value:a.prefixSuffixColor, onChange:function(v){ setAttr({prefixSuffixColor:v||''}); }},
                    {label:__('Label color','blockenberg'),      value:a.labelColor,        onChange:function(v){ setAttr({labelColor:v||''}); }},
                    {label:__('Description color','blockenberg'),value:a.descColor,         onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('Divider color','blockenberg'),    value:a.dividerColor,      onChange:function(v){ setAttr({dividerColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    el('div', { className:'bkbg-csw-grid', style:{gridTemplateColumns:'repeat('+a.columns+',1fr)'} },
                        stats.map(function(stat, idx) {
                            return el(StatCard, { key:stat.id, stat:stat, idx:idx, layout:a.layout, showDesc:a.showDescription, showDiv:a.showDivider, divStyle:a.dividerStyle });
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({
                className:'bkbg-csw-wrap bkbg-csw-layout--'+a.layout,
                style: Object.assign({
                    '--bkbg-csw-pt':a.paddingTop+'px','--bkbg-csw-pb':a.paddingBottom+'px','--bkbg-csw-num-c':a.numberColor||undefined,'--bkbg-csw-ps-c':a.prefixSuffixColor||undefined,'--bkbg-csw-label-c':a.labelColor,'--bkbg-csw-desc-c':a.descColor,'--bkbg-csw-div-c':a.dividerColor,'--bkbg-csw-num-sz':a.numberSize+'px','--bkbg-csw-label-sz':a.labelSize+'px','--bkbg-csw-desc-sz':a.descSize+'px','--bkbg-csw-gap':a.gap+'px','--bkbg-csw-offset':a.waterfallOffset+'px',background:a.sectionBg||undefined,
                }, _tv(a.typoNumber, '--bkbg-csw-num-'), _tv(a.typoLabel, '--bkbg-csw-lbl-'), _tv(a.typoDesc, '--bkbg-csw-dsc-'))
            });
            return el('div', blockProps,
                el('div', { className:'bkbg-csw-grid', style:{gridTemplateColumns:'repeat('+a.columns+',1fr)'} },
                    a.stats.map(function(stat, idx) {
                        var topOffset = a.layout==='waterfall' ? (idx%2===1?'var(--bkbg-csw-offset)':'0') : '0';
                        return el('div', { key:stat.id, className:'bkbg-csw-stat', style:{marginTop:topOffset,borderColor:stat.accentColor||undefined} },
                            el('div', { className:'bkbg-csw-number-row' },
                                el('span', { className:'bkbg-csw-prefix' }, stat.prefix),
                                el('span', { className:'bkbg-csw-value', style:{color:stat.accentColor} }, stat.value),
                                el('span', { className:'bkbg-csw-suffix', style:{color:stat.accentColor} }, stat.suffix)
                            ),
                            el('div', { className:'bkbg-csw-label' }, stat.label),
                            a.showDescription ? el('div', { className:'bkbg-csw-desc' }, stat.description) : null,
                            a.showDivider && a.dividerStyle==='line' ? el('div', { className:'bkbg-csw-divider' }) : null
                        );
                    })
                )
            );
        }
    });
}() );
