( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;

  var _TypographyControl, _typoCssVars;
  function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

  function HotspotEditor( { hs, index, onChange, onRemove } ) {
    function upd(k,v){ onChange(index, Object.assign({}, hs, {[k]:v})); }
    return el('div', {style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
      el('strong', {style:{display:'block',marginBottom:'6px'}}, __('Hotspot ') + (index+1) + ' — ' + hs.x.toFixed(0) + '%, ' + hs.y.toFixed(0) + '%'),
      el(TextControl,     {label:__('Title'),   value:hs.title,   onChange:v=>upd('title',v)}),
      el(TextareaControl, {label:__('Content'), value:hs.content, onChange:v=>upd('content',v), rows:2}),
      el(RangeControl, {label:__('X Position (%)'), value:hs.x, min:5, max:95, onChange:v=>upd('x',v)}),
      el(RangeControl, {label:__('Y Position (%)'), value:hs.y, min:5, max:95, onChange:v=>upd('y',v)}),
      el(SelectControl, {
        label:__('Tooltip Position'), value:hs.tooltipPos,
        options:[{label:'Right',value:'right'},{label:'Left',value:'left'},{label:'Top',value:'top'},{label:'Bottom',value:'bottom'}],
        onChange:v=>upd('tooltipPos',v)
      }),
      el(Button, {isDestructive:true, isSmall:true, onClick:()=>onRemove(index)}, __('Remove'))
    );
  }

  registerBlockType('blockenberg/hotspot-image', {
    edit: function(props) {
      const { attributes: attr, setAttributes } = props;

      function updateHs(idx, next){ const h=attr.hotspots.slice(); h[idx]=next; setAttributes({hotspots:h}); }
      function removeHs(idx){ setAttributes({hotspots:attr.hotspots.filter((_,i)=>i!==idx)}); }

      const wrapStyle = {
        '--bkhi-marker': attr.markerColor,
        '--bkhi-tip-bg': attr.tooltipBg,
        '--bkhi-tip-text': attr.tooltipText,
        '--bkhi-size': attr.markerSize + 'px',
        '--bkhi-radius': attr.borderRadius + 'px',
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        borderRadius: attr.borderRadius + 'px',
        overflow: 'hidden',
      };
      var _tv = getTypoCssVars();
      if (_tv) {
        Object.assign(wrapStyle, _tv(attr.titleTypo || {}, '--bkhi-tt-'));
        Object.assign(wrapStyle, _tv(attr.contentTypo || {}, '--bkhi-ct-'));
      }

      return el('div', {className:'bkhi-wrap', style: wrapStyle},

        el(InspectorControls, null,
          el(PanelBody, {title:__('Image'), initialOpen:true},
            attr.imageUrl
              ? el('div', {style:{marginBottom:'8px'}},
                  el('img', {src:attr.imageUrl, style:{width:'100%',borderRadius:'6px',display:'block',marginBottom:'6px'}}),
                  el(Button, {isDestructive:true, isSmall:true, onClick:()=>setAttributes({imageUrl:'',imageId:0,imageAlt:''})}, __('Remove'))
                )
              : el(MediaUploadCheck, null,
                  el(MediaUpload, {
                    onSelect:m=>setAttributes({imageUrl:m.url,imageId:m.id,imageAlt:m.alt||''}),
                    allowedTypes:['image'], value:attr.imageId,
                    render:({open})=>el(Button,{onClick:open,variant:'secondary'}, __('Upload Image'))
                  })
                )
          ),
          el(PanelBody, {title:__('Hotspots'), initialOpen:true},
            attr.hotspots.map((hs,i)=>el(HotspotEditor,{key:i,hs,index:i,onChange:updateHs,onRemove:removeHs})),
            el(Button, {variant:'secondary', onClick:()=>setAttributes({hotspots:[...attr.hotspots,{x:50,y:50,title:'New Hotspot',content:'Description.',tooltipPos:'right'}]}),
              style:{width:'100%',justifyContent:'center',marginTop:'8px'}}, __('+ Add Hotspot'))
          ),
          el(PanelBody, {title:__('Style'), initialOpen:false},
            el(SelectControl, {label:__('Trigger'), value:attr.trigger,
              options:[{label:__('Hover'),value:'hover'},{label:__('Click'),value:'click'}],
              onChange:v=>setAttributes({trigger:v})}),
            el(SelectControl, {label:__('Marker Style'), value:attr.markerStyle,
              options:[{label:__('Pulse'),value:'pulse'},{label:__('Dot'),value:'dot'},{label:__('Plus'),value:'plus'}],
              onChange:v=>setAttributes({markerStyle:v})}),
            el(RangeControl, {label:__('Marker Size (px)'), value:attr.markerSize, min:10, max:40, onChange:v=>setAttributes({markerSize:v})}),
            el(RangeControl, {label:__('Border Radius (px)'), value:attr.borderRadius, min:0, max:32, onChange:v=>setAttributes({borderRadius:v})})
          ),
          el(PanelColorSettings, {
            title:__('Colors'), initialOpen:false,
            colorSettings:[
              {label:__('Marker Color'), value:attr.markerColor, onChange:v=>setAttributes({markerColor:v||'#6c3fb5'})},
              {label:__('Tooltip Background'), value:attr.tooltipBg, onChange:v=>setAttributes({tooltipBg:v||'#1e1e2e'})},
              {label:__('Tooltip Text'), value:attr.tooltipText, onChange:v=>setAttributes({tooltipText:v||'#ffffff'})},
            ]
          }),
          el(PanelBody, {title:__('Typography'), initialOpen:false},
            getTypographyControl() && el(getTypographyControl(), {
              label: __('Tooltip Title'),
              typo: attr.titleTypo || {},
              onChange: function(v){ setAttributes({titleTypo: v}); }
            }),
            getTypographyControl() && el(getTypographyControl(), {
              label: __('Tooltip Content'),
              typo: attr.contentTypo || {},
              onChange: function(v){ setAttributes({contentTypo: v}); }
            })
          )
        ),

        attr.imageUrl
          ? el('img', {src:attr.imageUrl, alt:attr.imageAlt, className:'bkhi-image'})
          : el('div', {className:'bkhi-image bkhi-placeholder'}, el('span',{className:'dashicons dashicons-format-image'})),

        attr.hotspots.map((hs,i)=>
          el('div', {
            key: i,
            className: 'bkhi-pin bkhi-marker-' + attr.markerStyle + ' bkhi-tip-' + hs.tooltipPos + ' bkhi-editor-open',
            style: { left: hs.x + '%', top: hs.y + '%' }
          },
            el('button', {className:'bkhi-dot', 'aria-label': hs.title}),
            el('div', {className:'bkhi-tooltip'},
              el('strong', {className:'bkhi-tip-title'}, hs.title),
              hs.content && el('p', {className:'bkhi-tip-content'}, hs.content)
            )
          )
        )
      );
    },

    save: function({ attributes: attr }) {
      const wrapStyle = {
        '--bkhi-marker': attr.markerColor,
        '--bkhi-tip-bg': attr.tooltipBg,
        '--bkhi-tip-text': attr.tooltipText,
        '--bkhi-size': attr.markerSize + 'px',
        '--bkhi-radius': attr.borderRadius + 'px',
      };
      var _tv = getTypoCssVars();
      if (_tv) {
        Object.assign(wrapStyle, _tv(attr.titleTypo || {}, '--bkhi-tt-'));
        Object.assign(wrapStyle, _tv(attr.contentTypo || {}, '--bkhi-ct-'));
      }
      return el('div', {
        className:'bkhi-wrap',
        style: wrapStyle,
        'data-trigger': attr.trigger
      },
        attr.imageUrl
          ? el('img', {src:attr.imageUrl, alt:attr.imageAlt, className:'bkhi-image'})
          : null,
        attr.hotspots.map((hs,i)=>
          el('div', {
            key:i,
            className:'bkhi-pin bkhi-marker-'+attr.markerStyle+' bkhi-tip-'+hs.tooltipPos,
            style:{left:hs.x+'%', top:hs.y+'%'}
          },
            el('button', {className:'bkhi-dot', 'aria-label':hs.title}),
            el('div', {className:'bkhi-tooltip'},
              el('strong', {className:'bkhi-tip-title'}, hs.title),
              hs.content && el('p', {className:'bkhi-tip-content'}, hs.content)
            )
          )
        )
      );
    }
  });
}() );
