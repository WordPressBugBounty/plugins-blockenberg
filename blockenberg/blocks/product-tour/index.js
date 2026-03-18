/* ====================================================
   Product Tour Block — editor (index.js)
   Block: blockenberg/product-tour
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
    var RichText           = wp.blockEditor.RichText;
    var MediaUpload        = wp.blockEditor.MediaUpload;
    var MediaUploadCheck   = wp.blockEditor.MediaUploadCheck;
    var registerBlockType  = wp.blocks.registerBlockType;
    var InspectorControls  = wp.blockEditor.InspectorControls;
    var useBlockProps      = wp.blockEditor.useBlockProps;
    var PanelBody          = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RangeControl       = wp.components.RangeControl;
    var SelectControl      = wp.components.SelectControl;
    var ToggleControl      = wp.components.ToggleControl;
    var TextControl        = wp.components.TextControl;
    var Button             = wp.components.Button;
    var ColorPicker         = wp.components.ColorPicker;
    var Popover            = wp.components.Popover;
    var __                 = wp.i18n.__;

    var _tc; function getTypoControl(){ return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars(){ return _tv || (_tv = window.bkbgTypoCssVars); }

    function uid() { return 't' + Math.random().toString(36).slice(2,7); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }
    var IP = function () { return window.bkbgIconPicker; };

    function wrapStyle(a) {
        return {
            '--bkbg-ptour-pt':         a.paddingTop + 'px',
            '--bkbg-ptour-pb':         a.paddingBottom + 'px',
            '--bkbg-ptour-h-gap':      a.headerGap + 'px',
            '--bkbg-ptour-img-r':      a.imageRadius + 'px',
            '--bkbg-ptour-tab-act-bg': a.tabActiveBg,
            '--bkbg-ptour-tab-brd':    a.tabActiveBorder,
            '--bkbg-ptour-num-bg':     a.numberBg,
            '--bkbg-ptour-num-c':      a.numberColor,
            '--bkbg-ptour-title-c':    a.titleColor,
            '--bkbg-ptour-desc-c':     a.descColor,
            '--bkbg-ptour-ey-bg':      a.eyebrowBg,
            '--bkbg-ptour-ey-c':       a.eyebrowColor,
            '--bkbg-ptour-sec-title-c':a.sectionTitleColor,
            '--bkbg-ptour-sec-sub-c':  a.sectionSubColor,
            background:                a.sectionBg || undefined,
        };
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

    registerBlockType('blockenberg/product-tour', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var steps   = a.steps;

            var _active = useState(0);
            var activeIdx = _active[0]; var setActiveIdx = _active[1];
            var _edit   = useState(null);
            var editId  = _edit[0]; var setEditId = _edit[1];

            function updateStep(id, patch) {
                setAttr({ steps: steps.map(function(s){ return s.id===id ? Object.assign({},s,patch) : s; }) });
            }

            var TC = getTypoControl();
            var blockProps = useBlockProps((function(){
                var fn = getTypoCssVars();
                var s = Object.assign({}, wrapStyle(a));
                if(fn){
                    Object.assign(s, fn(a.sectionTitleTypo||{}, '--bkbg-ptour-stt-'));
                    Object.assign(s, fn(a.sectionSubTypo||{}, '--bkbg-ptour-ssb-'));
                    Object.assign(s, fn(a.stepTitleTypo||{}, '--bkbg-ptour-stp-'));
                }
                return { className: 'bkbg-ptour-wrap bkbg-ptour-layout--' + a.layout, style: s };
            })());

            /* Header */
            var headerEl = a.showHeader ? el('div', { className:'bkbg-ptour-header', style:{textAlign:a.headerAlign,marginBottom:a.headerGap+'px'} },
                a.showEyebrow ? el('span', { className:'bkbg-ptour-eyebrow' }, a.eyebrow) : null,
                el(RichText, { tagName:'h2', className:'bkbg-ptour-section-title', value:a.sectionTitle, onChange:function(v){ setAttr({sectionTitle:v}); }, placeholder:__('Section title…','blockenberg') }),
                el(RichText, { tagName:'p', className:'bkbg-ptour-section-sub', value:a.sectionSubtitle, onChange:function(v){ setAttr({sectionSubtitle:v}); }, placeholder:__('Subtitle…','blockenberg') })
            ) : null;

            /* Tabs sidebar */
            var activeStep = steps[activeIdx] || steps[0];
            var tabsEl = el('div', { className:'bkbg-ptour-tabs' },
                steps.map(function(step, idx) {
                    return el('button', {
                        key: step.id,
                        className: 'bkbg-ptour-tab' + (idx===activeIdx ? ' bkbg-ptour-tab--active' : ''),
                        onClick: function(){ setActiveIdx(idx); },
                        type: 'button'
                    },
                        a.tabStyle === 'numbered'
                            ? el('span', { className:'bkbg-ptour-num', style:{background:idx===activeIdx?step.accentColor:undefined,color:idx===activeIdx?'#fff':undefined} }, idx+1)
                            : el('span', { className:'bkbg-ptour-tab-icon' }, (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon),
                        el('div', { className:'bkbg-ptour-tab-text' },
                            el('strong', { className:'bkbg-ptour-tab-title' }, step.title),
                            idx===activeIdx ? el('p', { className:'bkbg-ptour-tab-desc' }, step.description) : null
                        )
                    );
                })
            );

            /* Active step image */
            var imgEl = activeStep
                ? el('div', { className:'bkbg-ptour-preview' },
                    activeStep.imageUrl
                        ? el('img', { src:activeStep.imageUrl, alt:activeStep.title, className:'bkbg-ptour-img' + (a.imageShadow ? ' bkbg-ptour-img--shadow' : '') })
                        : el('div', { className:'bkbg-ptour-img-placeholder' },
                            el('span', { style:{fontSize:'48px'} }, (activeStep.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(activeStep.iconType, activeStep.icon, activeStep.iconDashicon, activeStep.iconImageUrl, activeStep.iconDashiconColor) : activeStep.icon),
                            el('p', { style:{color:'#94a3b8',fontSize:'13px',marginTop:'8px'} }, __('Upload a screenshot for this step','blockenberg'))
                          )
                  )
                : null;

            /* Inspector steps editor */
            function stepRow(step, idx) {
                var isEdit = editId === step.id;
                return el('div', { key:step.id },
                    el('div', { style:{display:'flex',alignItems:'center',gap:'6px',background:isEdit?'#f3f0ff':'#f8f9fa',border:isEdit?'1px solid #6c3fb5':'1px solid #e2e8f0',borderRadius:'6px',padding:'6px 8px',marginBottom:'4px',cursor:'pointer'}, onClick:function(){ setEditId(isEdit?null:step.id); setActiveIdx(idx); } },
                        el('span', { style:{fontSize:'16px',marginRight:'4px'} }, (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon),
                            el('span', { style:{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'} }, step.title),
                        el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,              onClick:function(e){ e.stopPropagation(); setAttr({steps:move(steps,idx,idx-1)}); setActiveIdx(Math.max(0,idx-1)); } }),
                        el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===steps.length-1, onClick:function(e){ e.stopPropagation(); setAttr({steps:move(steps,idx,idx+1)}); setActiveIdx(Math.min(steps.length-1,idx+1)); } }),
                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({steps:steps.filter(function(_,i){ return i!==idx; })}); if(editId===step.id) setEditId(null); setActiveIdx(0); } })
                    ),
                    isEdit ? el('div', { style:{padding:'10px',background:'#faf8ff',border:'1px solid #6c3fb5',borderTop:'none',borderRadius:'0 0 6px 6px',marginBottom:'4px'} },
                        el(IP().IconPickerControl, {
                            iconType: step.iconType || 'custom-char',
                            customChar: step.icon,
                            dashicon: step.iconDashicon || '',
                            imageUrl: step.iconImageUrl || '',
                            onChangeType: function (v) { updateStep(step.id, { iconType: v }); },
                            onChangeChar: function (v) { updateStep(step.id, { icon: v }); },
                            onChangeDashicon: function (v) { updateStep(step.id, { iconDashicon: v }); },
                            onChangeImageUrl: function (v) { updateStep(step.id, { iconImageUrl: v }); }
                        }),
                        el(TextControl, { label:__('Title','blockenberg'),           value:step.title,       onChange:function(v){ updateStep(step.id,{title:v}); } }),
                        el(TextControl, { label:__('Description','blockenberg'),     value:step.description, onChange:function(v){ updateStep(step.id,{description:v}); } }),
                        el(BkbgColorSwatch, { label:__('Active accent color','blockenberg'), value:step.accentColor, onChange:function(v){ updateStep(step.id,{accentColor:v}); } }),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect:function(m){ updateStep(step.id,{imageUrl:m.url,imageId:m.id}); },
                                allowedTypes:['image'], value:step.imageId,
                                render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, step.imageUrl ? __('Change screenshot','blockenberg') : __('Upload screenshot','blockenberg')); }
                            })
                        ),
                        step.imageUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ updateStep(step.id,{imageUrl:'',imageId:0}); } }, __('Remove image','blockenberg')) : null
                    ) : null
                );
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Steps','blockenberg'), initialOpen:true },
                    steps.map(function(s,i){ return stepRow(s,i); }),
                    el(Button, { variant:'primary', style:{marginTop:'8px',width:'100%'},
                        onClick:function(){
                            var n={id:uid(),icon:'✨',iconType:'custom-char',iconDashicon:'',iconImageUrl:'',title:'New Step',description:'Describe this step clearly.',imageUrl:'',imageId:0,accentColor:'#6c3fb5'};
                            setAttr({steps:steps.concat([n])});
                            setActiveIdx(steps.length);
                            setEditId(n.id);
                        }
                    }, __('+ Add Step','blockenberg'))
                ),
                el(PanelBody, { title:__('Layout & Style','blockenberg'), initialOpen:false },
                    el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[
                        {label:'Tabs left — image right',value:'tabs-left'},
                        {label:'Tabs right — image left',value:'tabs-right'},
                        {label:'Tabs top — image below',value:'tabs-top'},
                    ], onChange:function(v){ setAttr({layout:v}); } }),
                    el(SelectControl, { label:__('Tab style','blockenberg'), value:a.tabStyle, options:[
                        {label:'Numbered',value:'numbered'},
                        {label:'Icon',value:'icon'},
                    ], onChange:function(v){ setAttr({tabStyle:v}); } }),
                    el(ToggleControl, { label:__('Image shadow','blockenberg'), checked:a.imageShadow, onChange:function(v){ setAttr({imageShadow:v}); } }),
                    el(RangeControl, { label:__('Image radius (px)','blockenberg'), value:a.imageRadius, min:0, max:32, onChange:function(v){ setAttr({imageRadius:v}); } })
                ),
                el(PanelBody, { title:__('Typography','blockenberg'), initialOpen:false },
                    TC && el(TC, {label:__('Section Title','blockenberg'),value:a.sectionTitleTypo||{},onChange:function(v){setAttr({sectionTitleTypo:v});}}),
                    TC && el(TC, {label:__('Section Subtitle','blockenberg'),value:a.sectionSubTypo||{},onChange:function(v){setAttr({sectionSubTypo:v});}}),
                    TC && el(TC, {label:__('Step Title','blockenberg'),value:a.stepTitleTypo||{},onChange:function(v){setAttr({stepTitleTypo:v});}})
                ),
                el(PanelBody, { title:__('Section Header','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show header','blockenberg'), checked:a.showHeader, onChange:function(v){ setAttr({showHeader:v}); } }),
                    el(ToggleControl, { label:__('Show eyebrow','blockenberg'), checked:a.showEyebrow, onChange:function(v){ setAttr({showEyebrow:v}); } }),
                    el(TextControl, { label:__('Eyebrow text','blockenberg'), value:a.eyebrow, onChange:function(v){ setAttr({eyebrow:v}); } }),
                    el(SelectControl, { label:__('Header align','blockenberg'), value:a.headerAlign, options:[
                        {label:'Left',value:'left'},{label:'Center',value:'center'}
                    ], onChange:function(v){ setAttr({headerAlign:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } }),
                    el(RangeControl, { label:__('Header gap (px)','blockenberg'),     value:a.headerGap,     min:0, max:80, onChange:function(v){ setAttr({headerGap:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'),        value:a.sectionBg,       onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Active tab bg','blockenberg'),     value:a.tabActiveBg,     onChange:function(v){ setAttr({tabActiveBg:v||''}); }},
                    {label:__('Active tab border','blockenberg'), value:a.tabActiveBorder, onChange:function(v){ setAttr({tabActiveBorder:v||''}); }},
                    {label:__('Number bg','blockenberg'),         value:a.numberBg,        onChange:function(v){ setAttr({numberBg:v||''}); }},
                    {label:__('Number text','blockenberg'),       value:a.numberColor,     onChange:function(v){ setAttr({numberColor:v||''}); }},
                    {label:__('Title color','blockenberg'),       value:a.titleColor,      onChange:function(v){ setAttr({titleColor:v||''}); }},
                    {label:__('Description color','blockenberg'), value:a.descColor,       onChange:function(v){ setAttr({descColor:v||''}); }},
                    {label:__('Eyebrow bg','blockenberg'),        value:a.eyebrowBg,       onChange:function(v){ setAttr({eyebrowBg:v||''}); }},
                    {label:__('Eyebrow text','blockenberg'),      value:a.eyebrowColor,    onChange:function(v){ setAttr({eyebrowColor:v||''}); }},
                    {label:__('Section title','blockenberg'),     value:a.sectionTitleColor, onChange:function(v){ setAttr({sectionTitleColor:v||''}); }},
                    {label:__('Section subtitle','blockenberg'),  value:a.sectionSubColor,   onChange:function(v){ setAttr({sectionSubColor:v||''}); }},
                ] })
            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    headerEl,
                    el('div', { className:'bkbg-ptour-body' },
                        tabsEl,
                        imgEl
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var fn = getTypoCssVars();
            var s = Object.assign({}, wrapStyle(a));
            if(fn){
                Object.assign(s, fn(a.sectionTitleTypo||{}, '--bkbg-ptour-stt-'));
                Object.assign(s, fn(a.sectionSubTypo||{}, '--bkbg-ptour-ssb-'));
                Object.assign(s, fn(a.stepTitleTypo||{}, '--bkbg-ptour-stp-'));
            }
            var blockProps = wp.blockEditor.useBlockProps.save({
                className:'bkbg-ptour-wrap bkbg-ptour-layout--'+a.layout,
                style: s
            });

            var headerEl = a.showHeader ? el('div', { className:'bkbg-ptour-header', style:{textAlign:a.headerAlign,marginBottom:a.headerGap+'px'} },
                a.showEyebrow ? el('span', { className:'bkbg-ptour-eyebrow' }, a.eyebrow) : null,
                el(RichText.Content, { tagName:'h2', className:'bkbg-ptour-section-title', value:a.sectionTitle }),
                el(RichText.Content, { tagName:'p', className:'bkbg-ptour-section-sub', value:a.sectionSubtitle })
            ) : null;

            return el('div', blockProps,
                headerEl,
                el('div', { className:'bkbg-ptour-body' },
                    el('div', { className:'bkbg-ptour-tabs' },
                        a.steps.map(function(step, idx) {
                            return el('button', { key:step.id, className:'bkbg-ptour-tab'+(idx===0?' bkbg-ptour-tab--active':''), 'data-step':step.id, type:'button' },
                                a.tabStyle==='numbered'
                                    ? el('span', { className:'bkbg-ptour-num' }, idx+1)
                                    : el('span', { className:'bkbg-ptour-tab-icon' }, (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon),
                                el('div', { className:'bkbg-ptour-tab-text' },
                                    el('strong', { className:'bkbg-ptour-tab-title' }, step.title),
                                    el('p', { className:'bkbg-ptour-tab-desc' }, step.description)
                                )
                            );
                        })
                    ),
                    el('div', { className:'bkbg-ptour-panels' },
                        a.steps.map(function(step, idx) {
                            return el('div', { key:step.id, className:'bkbg-ptour-panel'+(idx===0?' bkbg-ptour-panel--active':''), 'data-panel':step.id },
                                step.imageUrl
                                    ? el('img', { src:step.imageUrl, alt:step.title, className:'bkbg-ptour-img'+(a.imageShadow?' bkbg-ptour-img--shadow':''), loading:'lazy' })
                                    : el('div', { className:'bkbg-ptour-img-placeholder' }, el('span', { style:{fontSize:'56px'} }, (step.iconType || 'custom-char') !== 'custom-char' ? IP().buildSaveIcon(step.iconType, step.icon, step.iconDashicon, step.iconImageUrl, step.iconDashiconColor) : step.icon))
                            );
                        })
                    )
                )
            );
        },

        deprecated: [{
            attributes: {
                steps:{type:'array',default:[]},
                layout:{type:'string',default:'tabs-left'},sectionTitle:{type:'string',default:'How it works'},sectionSubtitle:{type:'string',default:'Everything you need, step by step.'},showHeader:{type:'boolean',default:true},headerAlign:{type:'string',default:'center'},eyebrow:{type:'string',default:'Product Tour'},showEyebrow:{type:'boolean',default:true},imageRadius:{type:'number',default:16},imageShadow:{type:'boolean',default:true},tabStyle:{type:'string',default:'numbered'},paddingTop:{type:'number',default:72},paddingBottom:{type:'number',default:72},headerGap:{type:'number',default:56},sectionBg:{type:'string',default:''},tabActiveBg:{type:'string',default:'#f5f3ff'},tabActiveBorder:{type:'string',default:'#6c3fb5'},numberBg:{type:'string',default:'#6c3fb5'},numberColor:{type:'string',default:'#ffffff'},titleColor:{type:'string',default:'#1e293b'},descColor:{type:'string',default:'#64748b'},eyebrowBg:{type:'string',default:'#ede9fe'},eyebrowColor:{type:'string',default:'#6c3fb5'},sectionTitleColor:{type:'string',default:'#1e293b'},sectionSubColor:{type:'string',default:'#64748b'},
                titleFontSize:{type:'number',default:15},titleFontWeight:{type:'number',default:500},titleLineHeight:{type:'number',default:1.4},sectionTitleFontSize:{type:'number',default:28},sectionTitleFontWeight:{type:'number',default:700},sectionTitleLineHeight:{type:'number',default:1.2}
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({
                    className:'bkbg-ptour-wrap bkbg-ptour-layout--'+a.layout,
                    style: {
                        '--bkbg-ptour-pt':a.paddingTop+'px','--bkbg-ptour-pb':a.paddingBottom+'px','--bkbg-ptour-h-gap':a.headerGap+'px','--bkbg-ptour-img-r':a.imageRadius+'px','--bkbg-ptour-tab-act-bg':a.tabActiveBg,'--bkbg-ptour-tab-brd':a.tabActiveBorder,'--bkbg-ptour-num-bg':a.numberBg,'--bkbg-ptour-num-c':a.numberColor,'--bkbg-ptour-title-c':a.titleColor,'--bkbg-ptour-desc-c':a.descColor,'--bkbg-ptour-ey-bg':a.eyebrowBg,'--bkbg-ptour-ey-c':a.eyebrowColor,'--bkbg-ptour-sec-title-c':a.sectionTitleColor,'--bkbg-ptour-sec-sub-c':a.sectionSubColor,'--bkbg-ptour-sec-title-fs':(a.sectionTitleFontSize || 28)+'px','--bkbg-ptour-sec-title-fw':(a.sectionTitleFontWeight || 700),'--bkbg-ptour-sec-title-lh':(a.sectionTitleLineHeight || 1.2),'--bkbg-ptour-title-fs':(a.titleFontSize || 15)+'px','--bkbg-ptour-title-fw':(a.titleFontWeight || 500),'--bkbg-ptour-title-lh':(a.titleLineHeight || 1.4),background:a.sectionBg||undefined,
                    }
                });

                var headerEl = a.showHeader ? el('div', { className:'bkbg-ptour-header', style:{textAlign:a.headerAlign,marginBottom:a.headerGap+'px'} },
                    a.showEyebrow ? el('span', { className:'bkbg-ptour-eyebrow' }, a.eyebrow) : null,
                    el(RichText.Content, { tagName:'h2', className:'bkbg-ptour-section-title', value:a.sectionTitle }),
                    el(RichText.Content, { tagName:'p', className:'bkbg-ptour-section-sub', value:a.sectionSubtitle })
                ) : null;

                return el('div', blockProps,
                    headerEl,
                    el('div', { className:'bkbg-ptour-body' },
                        el('div', { className:'bkbg-ptour-tabs' },
                            a.steps.map(function(step, idx) {
                                return el('button', { key:step.id, className:'bkbg-ptour-tab'+(idx===0?' bkbg-ptour-tab--active':''), 'data-step':step.id, type:'button' },
                                    a.tabStyle==='numbered'
                                        ? el('span', { className:'bkbg-ptour-num' }, idx+1)
                                        : el('span', { className:'bkbg-ptour-tab-icon' }, step.icon),
                                    el('div', { className:'bkbg-ptour-tab-text' },
                                        el('strong', { className:'bkbg-ptour-tab-title' }, step.title),
                                        el('p', { className:'bkbg-ptour-tab-desc' }, step.description)
                                    )
                                );
                            })
                        ),
                        el('div', { className:'bkbg-ptour-panels' },
                            a.steps.map(function(step, idx) {
                                return el('div', { key:step.id, className:'bkbg-ptour-panel'+(idx===0?' bkbg-ptour-panel--active':''), 'data-panel':step.id },
                                    step.imageUrl
                                        ? el('img', { src:step.imageUrl, alt:step.title, className:'bkbg-ptour-img'+(a.imageShadow?' bkbg-ptour-img--shadow':''), loading:'lazy' })
                                        : el('div', { className:'bkbg-ptour-img-placeholder' }, el('span', { style:{fontSize:'56px'} }, step.icon))
                                );
                            })
                        )
                    )
                );
            }
        }]
    });
}() );
