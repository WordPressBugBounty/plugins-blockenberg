/* ====================================================
   Logo Grid Block — editor (index.js)
   Block: blockenberg/logo-grid
   ==================================================== */
( function () {
    var el                 = wp.element.createElement;
    var Fragment           = wp.element.Fragment;
    var useState           = wp.element.useState;
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
    var __                 = wp.i18n.__;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function uid() { return 'lg' + Math.random().toString(36).slice(2,6); }
    function move(arr, from, to) { var a=arr.slice(); a.splice(to,0,a.splice(from,1)[0]); return a; }

    function wrapStyle(a) {
        var _tvFn = getTypoCssVars();
        var s = {
            '--bkbg-logg-cols':    a.columns,
            '--bkbg-logg-gap':     a.gap + 'px',
            '--bkbg-logg-h':       a.logoHeight + 'px',
            '--bkbg-logg-pad':     a.logoPadding + 'px',
            '--bkbg-logg-r':       a.logoRadius + 'px',
            '--bkbg-logg-pt':      a.paddingTop + 'px',
            '--bkbg-logg-pb':      a.paddingBottom + 'px',
            '--bkbg-logg-label-c': a.labelColor,
            '--bkbg-logg-bg':      a.logoBg,
            '--bkbg-logg-brd':     a.logoBorder,
            '--bkbg-logg-tint':    a.logoTint,
            background:            a.sectionBg || undefined,
        };
        if (_tvFn) Object.assign(s, _tvFn(a.labelTypo, '--bkbg-logg-l-'));
        return s;
    }

    registerBlockType('blockenberg/logo-grid', {
        edit: function (props) {
            var a       = props.attributes;
            var setAttr = props.setAttributes;
            var logos   = a.logos;

            var _act = useState(null);
            var activeId = _act[0]; var setActiveId = _act[1];

            function updateLogo(id, patch) {
                setAttr({ logos: logos.map(function(l){ return l.id===id ? Object.assign({},l,patch) : l; }) });
            }

            var blockProps = useBlockProps({ className:'bkbg-logg-wrap bkbg-logg-layout--'+a.layout, style:wrapStyle(a) });

            var labelEl = a.showLabel ? el('p', { className:'bkbg-logg-label bkbg-logg-label--'+a.labelPosition }, a.label) : null;

            var grid = el('div', { className:'bkbg-logg-grid' + (a.hoverColor && a.grayscale ? ' bkbg-logg-hover-color' : '') },
                logos.map(function(logo) {
                    return el('div', { key:logo.id, className:'bkbg-logg-item' + (a.showBox ? ' bkbg-logg-box' : '') + (a.grayscale ? ' bkbg-logg-grayscale' : ''), title:logo.name },
                        logo.imageUrl
                            ? el('img', { src:logo.imageUrl, alt:logo.name, className:'bkbg-logg-img' })
                            : el('span', { className:'bkbg-logg-text' }, logo.name),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect:function(m){ updateLogo(logo.id,{imageUrl:m.url,imageId:m.id}); },
                                allowedTypes:['image'], value:logo.imageId,
                                render:function(o){ return el(Button, { onClick:o.open, className:'bkbg-logg-upload-btn', isSmall:true }, logo.imageUrl ? __('Replace','blockenberg') : __('Upload','blockenberg')); }
                            })
                        )
                    );
                })
            );

            function logoRow(logo, idx) {
                var isActive = activeId === logo.id;
                return el('div', { key:logo.id },
                    el('div', { style:{display:'flex',alignItems:'center',gap:'6px',background:isActive?'#f3f0ff':'#f8f9fa',border:isActive?'1px solid #6c3fb5':'1px solid #e2e8f0',borderRadius:'6px',padding:'6px 8px',marginBottom:'4px',cursor:'pointer'}, onClick:function(){ setActiveId(isActive?null:logo.id); } },
                        logo.imageUrl ? el('img', { src:logo.imageUrl, style:{height:'18px',objectFit:'contain',marginRight:'4px'} }) : el('span', { style:{fontSize:'13px',color:'#94a3b8'} }, '🖼️'),
                        el('span', { style:{flex:1,fontSize:'13px'} }, logo.name||'(logo)'),
                        el(Button, { icon:'arrow-up',   isSmall:true, disabled:idx===0,              onClick:function(e){ e.stopPropagation(); setAttr({logos:move(logos,idx,idx-1)}); } }),
                        el(Button, { icon:'arrow-down', isSmall:true, disabled:idx===logos.length-1, onClick:function(e){ e.stopPropagation(); setAttr({logos:move(logos,idx,idx+1)}); } }),
                        el(Button, { icon:'no-alt', isSmall:true, isDestructive:true, onClick:function(e){ e.stopPropagation(); setAttr({logos:logos.filter(function(_,i){ return i!==idx; })}); if(activeId===logo.id) setActiveId(null); } })
                    ),
                    isActive ? el('div', { style:{padding:'8px',background:'#faf8ff',border:'1px solid #6c3fb5',borderTop:'none',borderRadius:'0 0 6px 6px',marginBottom:'4px'} },
                        el(TextControl, { label:__('Company name','blockenberg'), value:logo.name, onChange:function(v){ updateLogo(logo.id,{name:v}); } }),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect:function(m){ updateLogo(logo.id,{imageUrl:m.url,imageId:m.id}); },
                                allowedTypes:['image'], value:logo.imageId,
                                render:function(o){ return el(Button, { onClick:o.open, variant:'secondary', isSmall:true }, logo.imageUrl ? __('Change logo','blockenberg') : __('Upload logo','blockenberg')); }
                            })
                        ),
                        logo.imageUrl ? el(Button, { isDestructive:true, variant:'tertiary', isSmall:true, style:{marginTop:'4px'}, onClick:function(){ updateLogo(logo.id,{imageUrl:'',imageId:0}); } }, __('Remove','blockenberg')) : null
                    ) : null
                );
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title:__('Logos','blockenberg'), initialOpen:true },
                    logos.map(function(l,i){ return logoRow(l,i); }),
                    el(Button, { variant:'primary', style:{marginTop:'8px',width:'100%'},
                        onClick:function(){ var n={id:uid(),name:'New Partner',imageUrl:'',imageId:0}; setAttr({logos:logos.concat([n])}); setActiveId(n.id); }
                    }, __('+ Add Logo','blockenberg'))
                ),
                el(PanelBody, { title:__('Label & Layout','blockenberg'), initialOpen:false },
                    el(ToggleControl, { label:__('Show label','blockenberg'), checked:a.showLabel, onChange:function(v){ setAttr({showLabel:v}); } }),
                    a.showLabel ? el(Fragment, null,
                        el(TextControl, { label:__('Label text','blockenberg'), value:a.label, onChange:function(v){ setAttr({label:v}); } }),
                        el(SelectControl, { label:__('Label position','blockenberg'), value:a.labelPosition, options:[
                            {label:'Top',value:'top'},{label:'Left (inline)',value:'left'}
                        ], onChange:function(v){ setAttr({labelPosition:v}); } })
                    ) : null,
                    el(SelectControl, { label:__('Layout','blockenberg'), value:a.layout, options:[
                        {label:'Flex row (wrap)',value:'flex-row'},
                        {label:'Fixed grid',value:'grid'},
                    ], onChange:function(v){ setAttr({layout:v}); } }),
                    el(RangeControl, { label:__('Columns','blockenberg'), value:a.columns, min:2, max:10, onChange:function(v){ setAttr({columns:v}); } }),
                    el(RangeControl, { label:__('Gap (px)','blockenberg'), value:a.gap, min:8, max:80, onChange:function(v){ setAttr({gap:v}); } }),
                    el(RangeControl, { label:__('Logo height (px)','blockenberg'), value:a.logoHeight, min:20, max:80, onChange:function(v){ setAttr({logoHeight:v}); } }),
                    el(RangeControl, { label:__('Box padding (px)','blockenberg'), value:a.logoPadding, min:0, max:40, onChange:function(v){ setAttr({logoPadding:v}); } }),
                    el(RangeControl, { label:__('Box radius (px)','blockenberg'), value:a.logoRadius, min:0, max:20, onChange:function(v){ setAttr({logoRadius:v}); } }),
                    el(ToggleControl, { label:__('Show box background','blockenberg'), checked:a.showBox, onChange:function(v){ setAttr({showBox:v}); } }),
                    el(ToggleControl, { label:__('Grayscale logos','blockenberg'), checked:a.grayscale, onChange:function(v){ setAttr({grayscale:v}); } }),
                    el(ToggleControl, { label:__('Color on hover','blockenberg'), checked:a.hoverColor, onChange:function(v){ setAttr({hoverColor:v}); } })
                ),
                el(PanelBody, { title:__('Spacing','blockenberg'), initialOpen:false },
                    el(RangeControl, { label:__('Padding top (px)','blockenberg'),    value:a.paddingTop,    min:0, max:160, onChange:function(v){ setAttr({paddingTop:v}); } }),
                    el(RangeControl, { label:__('Padding bottom (px)','blockenberg'), value:a.paddingBottom, min:0, max:160, onChange:function(v){ setAttr({paddingBottom:v}); } })
                ),
                el(PanelColorSettings, { title:__('Colors','blockenberg'), initialOpen:false, colorSettings:[
                    {label:__('Section bg','blockenberg'), value:a.sectionBg,  onChange:function(v){ setAttr({sectionBg:v||''}); }},
                    {label:__('Label color','blockenberg'),value:a.labelColor, onChange:function(v){ setAttr({labelColor:v||''}); }},
                    {label:__('Logo box bg','blockenberg'),value:a.logoBg,     onChange:function(v){ setAttr({logoBg:v||''}); }},
                    {label:__('Logo box border','blockenberg'),value:a.logoBorder, onChange:function(v){ setAttr({logoBorder:v||''}); }},
                    {label:__('Logo tint (grayscale text)','blockenberg'),value:a.logoTint, onChange:function(v){ setAttr({logoTint:v||''}); }},
                ] }),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTypoControl(), { label: __('Label', 'blockenberg'), value: a.labelTypo, onChange: function (v) { setAttr({ labelTypo: v }); } })
                    ),

            );

            return el(Fragment, null,
                inspector,
                el('div', blockProps,
                    a.showLabel && a.labelPosition === 'top' ? labelEl : null,
                    a.showLabel && a.labelPosition === 'left' ? el('div', { className:'bkbg-logg-inline' }, labelEl, grid) : grid,
                    a.showLabel && a.labelPosition !== 'left' ? null : null
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvFn = window.bkbgTypoCssVars;
            var s = {
                '--bkbg-logg-cols':a.columns,'--bkbg-logg-gap':a.gap+'px','--bkbg-logg-h':a.logoHeight+'px','--bkbg-logg-pad':a.logoPadding+'px','--bkbg-logg-r':a.logoRadius+'px','--bkbg-logg-pt':a.paddingTop+'px','--bkbg-logg-pb':a.paddingBottom+'px','--bkbg-logg-label-c':a.labelColor,'--bkbg-logg-bg':a.logoBg,'--bkbg-logg-brd':a.logoBorder,'--bkbg-logg-tint':a.logoTint,background:a.sectionBg||undefined,
            };
            if (_tvFn) Object.assign(s, _tvFn(a.labelTypo, '--bkbg-logg-l-'));
            var blockProps = wp.blockEditor.useBlockProps.save({
                className:'bkbg-logg-wrap bkbg-logg-layout--'+a.layout, style: s
            });
            var labelEl = a.showLabel ? el('p', { className:'bkbg-logg-label bkbg-logg-label--'+a.labelPosition }, a.label) : null;
            var grid = el('div', { className:'bkbg-logg-grid'+(a.hoverColor&&a.grayscale?' bkbg-logg-hover-color':'') },
                a.logos.map(function(logo) {
                    return el('div', { key:logo.id, className:'bkbg-logg-item'+(a.showBox?' bkbg-logg-box':'')+(a.grayscale?' bkbg-logg-grayscale':''), title:logo.name },
                        logo.imageUrl ? el('img', { src:logo.imageUrl, alt:logo.name, className:'bkbg-logg-img', loading:'lazy' }) : el('span', { className:'bkbg-logg-text' }, logo.name)
                    );
                })
            );
            return el('div', blockProps,
                a.labelPosition==='left' ? el('div', { className:'bkbg-logg-inline' }, labelEl, grid) : el(Fragment, null, labelEl, grid)
            );
        }
    });
}() );
