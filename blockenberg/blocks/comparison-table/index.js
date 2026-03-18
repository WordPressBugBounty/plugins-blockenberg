( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, TextControl, ToggleControl, Button, RangeControl } = window.wp.components;
  const { __ } = window.wp.i18n;

  function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
  function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
  function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

  function CellValue({ val, checkColor, crossColor }) {
    if ( val === 'true'  ) return el('span',{className:'bkct-check',style:{color:checkColor}},'✓');
    if ( val === 'false' ) return el('span',{className:'bkct-cross',style:{color:crossColor}},'✕');
    return el('span',{className:'bkct-text'}, val);
  }

  registerBlockType('blockenberg/comparison-table', {
    edit: function(props) {
      const {attributes:attr,setAttributes}=props;

      function updatePlan(i,key,val){ const p=attr.plans.slice();p[i]=Object.assign({},p[i],{[key]:val});setAttributes({plans:p}); }
      function addPlan(){ setAttributes({plans:[...attr.plans,{name:'New Plan',subtitle:'',highlighted:false}],features:attr.features.map(f=>({...f,values:[...f.values,'']}))}); }
      function removePlan(i){ setAttributes({plans:attr.plans.filter((_,x)=>x!==i),features:attr.features.map(f=>({...f,values:f.values.filter((_,x)=>x!==i)}))}); }

      function updateFeature(i,key,val){ const f=attr.features.slice();f[i]=Object.assign({},f[i],{[key]:val});setAttributes({features:f}); }
      function updateCell(fi,pi,val){ const f=attr.features.slice();const v=f[fi].values.slice();v[pi]=val;f[fi]={...f[fi],values:v};setAttributes({features:f}); }
      function addFeature(){ setAttributes({features:[...attr.features,{label:'New Feature',values:attr.plans.map(()=>'')}]}); }
      function removeFeature(i){ setAttributes({features:attr.features.filter((_,x)=>x!==i)}); }

      const tableStyle=Object.assign({
        '--bkct-header-bg':attr.headerBg,'--bkct-header-text':attr.headerText,
        '--bkct-hl-bg':attr.highlightBg,'--bkct-hl-border':attr.highlightBorder,
        '--bkct-check':attr.checkColor,'--bkct-cross':attr.crossColor,
        '--bkct-radius':attr.borderRadius+'px',
        borderRadius:attr.borderRadius+'px',overflow:'hidden',
      }, _tv(attr.typoHeader, '--bkct-th-'), _tv(attr.typoCell, '--bkct-td-'));

      return el('div',{className:'bkct-wrap',style:tableStyle},

        el(InspectorControls,null,
          el(PanelBody,{title:__('Plans (Columns)'),initialOpen:true},
            attr.plans.map((plan,i)=>el('div',{key:i,style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
              el(TextControl,{label:__('Plan Name'),value:plan.name,onChange:v=>updatePlan(i,'name',v)}),
              el(TextControl,{label:__('Subtitle / Price'),value:plan.subtitle,onChange:v=>updatePlan(i,'subtitle',v)}),
              el(ToggleControl,{label:__('Highlighted (Popular)'),checked:plan.highlighted,onChange:v=>updatePlan(i,'highlighted',v),__nextHasNoMarginBottom:true}),
              el(Button,{isDestructive:true,isSmall:true,onClick:()=>removePlan(i)},__('Remove Plan'))
            )),
            el(Button,{variant:'secondary',onClick:addPlan,style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Plan'))
          ),
          el(PanelBody,{title:__('Features (Rows)'),initialOpen:false},
            el('p',{style:{fontSize:'12px',color:'#888',marginTop:0}},__('Use "true" / "false" for ✓ / ✕, or type any text value.')),
            attr.features.map((feat,fi)=>el('div',{key:fi,style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
              el(TextControl,{label:__('Feature Label'),value:feat.label,onChange:v=>updateFeature(fi,'label',v)}),
              attr.plans.map((plan,pi)=>el(TextControl,{key:pi,label:plan.name+' value',value:feat.values[pi]||'',onChange:v=>updateCell(fi,pi,v)})),
              el(Button,{isDestructive:true,isSmall:true,onClick:()=>removeFeature(fi)},__('Remove Feature'))
            )),
            el(Button,{variant:'secondary',onClick:addFeature,style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Feature'))
          ),
          el(PanelBody,{title:__('Style'),initialOpen:false},
            el(RangeControl,{label:__('Border Radius'),value:attr.borderRadius,min:0,max:32,onChange:v=>setAttributes({borderRadius:v})}),
            el(ToggleControl,{label:__('Zebra Stripes'),checked:attr.zebraStripe,onChange:v=>setAttributes({zebraStripe:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Sticky Header'),checked:attr.stickyHeader,onChange:v=>setAttributes({stickyHeader:v}),__nextHasNoMarginBottom:true})
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            el(getTypographyControl(), { label: __('Header Typography'), value: attr.typoHeader, onChange: v => setAttributes({ typoHeader: v }) }),
            el(getTypographyControl(), { label: __('Cell Typography'), value: attr.typoCell, onChange: v => setAttributes({ typoCell: v }) })
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Header Background'),value:attr.headerBg,onChange:v=>setAttributes({headerBg:v||'#6c3fb5'})},
            {label:__('Header Text'),value:attr.headerText,onChange:v=>setAttributes({headerText:v||'#ffffff'})},
            {label:__('Highlight Background'),value:attr.highlightBg,onChange:v=>setAttributes({highlightBg:v||'#f3eeff'})},
            {label:__('Highlight Border'),value:attr.highlightBorder,onChange:v=>setAttributes({highlightBorder:v||'#6c3fb5'})},
            {label:__('Check Color'),value:attr.checkColor,onChange:v=>setAttributes({checkColor:v||'#22c55e'})},
            {label:__('Cross Color'),value:attr.crossColor,onChange:v=>setAttributes({crossColor:v||'#ef4444'})},
          ]})
        ),

        el('div',{className:'bkct-scroll'},
          el('table',{className:'bkct-table'+(attr.zebraStripe?' bkct-zebra':'')},
            el('thead',null,
              el('tr',null,
                el('th',{className:'bkct-feature-col'},__('Features')),
                attr.plans.map((plan,i)=>
                  el('th',{key:i,className:'bkct-plan-col'+(plan.highlighted?' bkct-highlight':'')},
                    el('div',{className:'bkct-plan-name'},plan.name),
                    plan.subtitle&&el('div',{className:'bkct-plan-sub'},plan.subtitle)
                  )
                )
              )
            ),
            el('tbody',null,
              attr.features.map((feat,fi)=>
                el('tr',{key:fi,className:'bkct-row'},
                  el('td',{className:'bkct-label'},feat.label),
                  attr.plans.map((plan,pi)=>
                    el('td',{key:pi,className:'bkct-cell'+(plan.highlighted?' bkct-highlight':'')},
                      el(CellValue,{val:feat.values[pi]||'',checkColor:attr.checkColor,crossColor:attr.crossColor})
                    )
                  )
                )
              )
            )
          )
        )
      );
    },

    save: function({attributes:attr}) {
      const wrapStyle=Object.assign({
        '--bkct-header-bg':attr.headerBg,'--bkct-header-text':attr.headerText,
        '--bkct-hl-bg':attr.highlightBg,'--bkct-hl-border':attr.highlightBorder,
        '--bkct-check':attr.checkColor,'--bkct-cross':attr.crossColor,
        '--bkct-radius':attr.borderRadius+'px',
      }, _tv(attr.typoHeader, '--bkct-th-'), _tv(attr.typoCell, '--bkct-td-'));
      function CVal({val}) {
        if (val==='true')  return el('span',{className:'bkct-check'},'✓');
        if (val==='false') return el('span',{className:'bkct-cross'},'✕');
        return el('span',{className:'bkct-text'},val);
      }
      return el('div',{className:'bkct-wrap',style:wrapStyle},
        el('div',{className:'bkct-scroll'},
          el('table',{className:'bkct-table'+(attr.zebraStripe?' bkct-zebra':'')},
            el('thead',{className:attr.stickyHeader?'bkct-sticky':''},
              el('tr',null,
                el('th',{className:'bkct-feature-col'}),
                attr.plans.map((plan,i)=>
                  el('th',{key:i,className:'bkct-plan-col'+(plan.highlighted?' bkct-highlight':'')},
                    el('div',{className:'bkct-plan-name'},plan.name),
                    plan.subtitle&&el('div',{className:'bkct-plan-sub'},plan.subtitle)
                  )
                )
              )
            ),
            el('tbody',null,
              attr.features.map((feat,fi)=>
                el('tr',{key:fi,className:'bkct-row'},
                  el('td',{className:'bkct-label'},feat.label),
                  attr.plans.map((plan,pi)=>
                    el('td',{key:pi,className:'bkct-cell'+(plan.highlighted?' bkct-highlight':'')},
                      el(CVal,{val:feat.values[pi]||''})
                    )
                  )
                )
              )
            )
          )
        )
      );
    }
  });
}() );
