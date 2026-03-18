( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  const { __ } = window.wp.i18n;

  var _fgTC, _fgTV;
  function _tc() { return (_fgTC = _fgTC || window.bkbgTypographyControl); }
  function _tv() { return (_fgTV = _fgTV || window.bkbgTypoCssVars); }

  function ItemEditor({ item, index, onChange, onRemove }) {
    function upd(k,v){ onChange(index, Object.assign({},item,{[k]:v})); }
    return el('div',{style:{border:'1px solid #ddd',borderRadius:'8px',padding:'10px',marginBottom:'8px',background:'#fafafa'}},
      item.imageUrl
        ? el('div',{style:{marginBottom:'6px'}},
            el('img',{src:item.imageUrl,style:{width:'100%',height:'80px',objectFit:'cover',borderRadius:'6px'}}),
            el(Button,{isDestructive:true,isSmall:true,onClick:()=>{upd('imageUrl','');upd('imageId',0);}},__('Remove'))
          )
        : el(MediaUploadCheck,null,
            el(MediaUpload,{
              onSelect:m=>{upd('imageUrl',m.url);upd('imageId',m.id);upd('alt',m.alt||'');},
              allowedTypes:['image'],value:item.imageId,
              render:({open})=>el(Button,{onClick:open,isSmall:true,variant:'secondary'},__('Upload Image'))
            })
          ),
      el(TextControl,{label:__('Title'),value:item.title,onChange:v=>upd('title',v)}),
      el(TextControl,{label:__('Tags (comma separated)'),value:item.tags,onChange:v=>upd('tags',v)}),
      el(Button,{isDestructive:true,isSmall:true,onClick:()=>onRemove(index)},__('Remove'))
    );
  }

  // Collect unique tags from all items
  function collectTags(items) {
    const tags = new Set();
    items.forEach(item => {
      (item.tags||'').split(',').map(t=>t.trim()).filter(Boolean).forEach(t=>tags.add(t));
    });
    return Array.from(tags);
  }

  registerBlockType('blockenberg/filter-gallery', {
    edit: function(props) {
      const { attributes: attr, setAttributes } = props;

      function updateItem(idx,next){ const it=attr.items.slice(); it[idx]=next; setAttributes({items:it}); }
      function removeItem(idx){ setAttributes({items:attr.items.filter((_,i)=>i!==idx)}); }

      const tags = collectTags(attr.items);

      const wrapStyle = Object.assign({
        '--bkfg-cols': attr.columns,
        '--bkfg-gap': attr.gap + 'px',
        '--bkfg-ratio': attr.imageRatio,
        '--bkfg-radius': attr.borderRadius + 'px',
        '--bkfg-accent': attr.accentColor,
        '--bkfg-bg': attr.bgColor,
        '--bkfg-text': attr.textColor,
        background: attr.bgColor,
      },
        _tv()(attr.typoTitle, '--bkfg-tt-'),
        _tv()(attr.typoFilter, '--bkfg-tf-')
      );

      return el('div', {className:'bkfg-wrap', style:wrapStyle},

        el(InspectorControls, null,
          el(PanelBody,{title:__('Items'),initialOpen:true},
            attr.items.map((item,i)=>el(ItemEditor,{key:i,item,index:i,onChange:updateItem,onRemove:removeItem})),
            el(Button,{variant:'secondary',onClick:()=>setAttributes({items:[...attr.items,{imageUrl:'',imageId:0,alt:'',title:'New Item',tags:''}]}),
              style:{width:'100%',justifyContent:'center',marginTop:'8px'}},__('+ Add Item'))
          ),
          el(PanelBody,{title:__('Layout'),initialOpen:false},
            el(RangeControl,{label:__('Columns'),value:attr.columns,min:1,max:6,onChange:v=>setAttributes({columns:v})}),
            el(RangeControl,{label:__('Gap (px)'),value:attr.gap,min:0,max:48,onChange:v=>setAttributes({gap:v})}),
            el(RangeControl,{label:__('Border Radius'),value:attr.borderRadius,min:0,max:40,onChange:v=>setAttributes({borderRadius:v})}),
            el(SelectControl,{label:__('Image Ratio'),value:attr.imageRatio,
              options:[{label:'Square 1:1',value:'1/1'},{label:'4:3',value:'4/3'},{label:'16:9',value:'16/9'},{label:'3:4 Portrait',value:'3/4'}],
              onChange:v=>setAttributes({imageRatio:v})}),
            el(ToggleControl,{label:__('Show Titles'),checked:attr.showTitle,onChange:v=>setAttributes({showTitle:v}),__nextHasNoMarginBottom:true})
          ),
          el(PanelBody,{title:__('Filter Bar'),initialOpen:false},
            el(TextControl,{label:__('Show All Label'),value:attr.showAllLabel,onChange:v=>setAttributes({showAllLabel:v})}),
            el(SelectControl,{label:__('Filter Style'),value:attr.filterStyle,
              options:[{label:'Pills',value:'pills'},{label:'Tabs',value:'tabs'},{label:'Underline',value:'underline'}],
              onChange:v=>setAttributes({filterStyle:v})}),
            el(SelectControl,{label:__('Animation'),value:attr.animation,
              options:[{label:'Fade',value:'fade'},{label:'Scale',value:'scale'}],
              onChange:v=>setAttributes({animation:v})})
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            _tc() && el(_tc(), { label: __('Item Title', 'blockenberg'), value: attr.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
            _tc() && el(_tc(), { label: __('Filter Button', 'blockenberg'), value: attr.typoFilter, onChange: function (v) { setAttributes({ typoFilter: v }); } }),
          ),
          el(PanelColorSettings,{
            initialOpen: false, colorSettings:[
              {label:__('Accent Color'),value:attr.accentColor,onChange:v=>setAttributes({accentColor:v||'#6c3fb5'})},
              {label:__('Background'),value:attr.bgColor,onChange:v=>setAttributes({bgColor:v||'#ffffff'})},
              {label:__('Text Color'),value:attr.textColor,onChange:v=>setAttributes({textColor:v||'#333333'})},
            ]
          })
        ),

        /* Filter bar preview */
        el('div',{className:'bkfg-filters bkfg-style-'+attr.filterStyle},
          el('button',{className:'bkfg-btn bkfg-active'},attr.showAllLabel),
          tags.map((t,i)=>el('button',{key:i,className:'bkfg-btn'},t))
        ),

        /* Grid preview */
        el('div',{className:'bkfg-grid'},
          attr.items.map((item,i)=>
            el('div',{key:i,className:'bkfg-item'},
              el('div',{className:'bkfg-thumb'},
                item.imageUrl
                  ? el('img',{src:item.imageUrl,alt:item.alt})
                  : el('div',{className:'bkfg-thumb-placeholder'},el('span',{className:'dashicons dashicons-format-image'}))
              ),
              attr.showTitle && item.title && el('p',{className:'bkfg-item-title'},item.title)
            )
          )
        )
      );
    },

    save: function({attributes:attr}) {
      const tags = collectTags(attr.items);
      const wrapStyle = Object.assign({
        '--bkfg-cols': attr.columns,
        '--bkfg-gap': attr.gap + 'px',
        '--bkfg-ratio': attr.imageRatio,
        '--bkfg-radius': attr.borderRadius + 'px',
        '--bkfg-accent': attr.accentColor,
        '--bkfg-bg': attr.bgColor,
        '--bkfg-text': attr.textColor,
        background: attr.bgColor,
      },
        _tv()(attr.typoTitle, '--bkfg-tt-'),
        _tv()(attr.typoFilter, '--bkfg-tf-')
      );
      return el('div',{
        className:'bkfg-wrap bkfg-anim-'+attr.animation,
        style:wrapStyle,
        'data-filter':'1'
      },
        el('div',{className:'bkfg-filters bkfg-style-'+attr.filterStyle},
          el('button',{className:'bkfg-btn bkfg-active','data-filter':'*'},attr.showAllLabel),
          tags.map((t,i)=>el('button',{key:i,className:'bkfg-btn','data-filter':t},t))
        ),
        el('div',{className:'bkfg-grid'},
          attr.items.map((item,i)=>
            el('div',{key:i,className:'bkfg-item','data-tags':item.tags},
              el('div',{className:'bkfg-thumb'},
                item.imageUrl
                  ? el('img',{src:item.imageUrl,alt:item.alt,loading:'lazy'})
                  : null
              ),
              attr.showTitle && item.title && el('p',{className:'bkfg-item-title'},item.title)
            )
          )
        )
      );
    }
  });

  function collectTags(items) {
    const tags = new Set();
    items.forEach(item=>{(item.tags||'').split(',').map(t=>t.trim()).filter(Boolean).forEach(t=>tags.add(t));});
    return Array.from(tags);
  }
}() );
