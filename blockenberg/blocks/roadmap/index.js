( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;
  var SelectControl = wp.components.SelectControl;
  var Button = wp.components.Button;
  var useBlockProps = wp.blockEditor.useBlockProps;
  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var STATUS_LABELS = { done: 'Done', progress: 'In Progress', planned: 'Planned' };

  function buildItems( items, setAttr ) {
    return items.map( function ( item, i ) {
      return el( 'div', { key: i, style: { border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, marginBottom: 8 } },
        el( TextControl, { label: __('Label','blockenberg'), value: item.label, onChange: function(v){ var n=items.slice(); n[i]=Object.assign({},item,{label:v}); setAttr({items:n}); } } ),
        el( TextControl, { label: __('Title','blockenberg'), value: item.title, onChange: function(v){ var n=items.slice(); n[i]=Object.assign({},item,{title:v}); setAttr({items:n}); } } ),
        el( TextControl, { label: __('Description','blockenberg'), value: item.desc, onChange: function(v){ var n=items.slice(); n[i]=Object.assign({},item,{desc:v}); setAttr({items:n}); } } ),
        el( SelectControl, { label: __('Status','blockenberg'), value: item.status,
          options: [
            {label:'Done',      value:'done'},
            {label:'In Progress',value:'progress'},
            {label:'Planned',   value:'planned'}
          ],
          onChange: function(v){ var n=items.slice(); n[i]=Object.assign({},item,{status:v}); setAttr({items:n}); }
        } ),
        el( Button, { isSmall:true, isDestructive:true, onClick: function(){
          setAttr({ items: items.filter(function(_,j){return j!==i;}) });
        } }, '✕ Remove' )
      );
    } );
  }

  /* v1 renderRoadmap — preserved for deprecated save */
  function v1RenderRoadmap( attrs ) {
    var wrapStyle = {
      '--bkrm-done':    attrs.doneColor,
      '--bkrm-prog':    attrs.progressColor,
      '--bkrm-plan':    attrs.plannedColor,
      '--bkrm-conn':    attrs.connectorColor,
      '--bkrm-cW':      attrs.cardWidth + 'px',
      '--bkrm-gap':     attrs.cardGap + 'px',
      '--bkrm-cBg':     attrs.cardBg,
      '--bkrm-cBrd':    attrs.cardBorder,
      '--bkrm-cR':      attrs.cardRadius + 'px',
      '--bkrm-title-fs': (attrs.titleFontSize || 15) + 'px',
      '--bkrm-title-fw': attrs.titleFontWeight || 600,
      '--bkrm-title-lh': attrs.titleLineHeight || 1.4,
      '--bkrm-desc-fs':  (attrs.descFontSize || 13) + 'px',
      '--bkrm-desc-fw':  attrs.descFontWeight || 400,
      '--bkrm-desc-lh':  attrs.descLineHeight || 1.5
    };
    return el( 'div', { className: 'bkrm-wrap', style: wrapStyle },
      el( 'div', { className: 'bkrm-track' },
        attrs.items.map( function ( item, i ) {
          return [
            el( 'div', { key: 'c-' + i, className: 'bkrm-card bkrm-status-' + item.status },
              el( 'div', { className: 'bkrm-label-tag' }, item.label ),
              el( 'h4', { className: 'bkrm-title', style: { fontSize: (attrs.titleFontSize || 15) + 'px', fontWeight: attrs.titleFontWeight || 600, lineHeight: attrs.titleLineHeight || 1.4 } }, item.title ),
              el( 'p', { className: 'bkrm-desc', style: { fontSize: (attrs.descFontSize || 13) + 'px', fontWeight: attrs.descFontWeight || 400, lineHeight: attrs.descLineHeight || 1.5 } }, item.desc ),
              el( 'span', { className: 'bkrm-badge bkrm-badge-' + item.status },
                STATUS_LABELS[ item.status ] || item.status
              )
            ),
            i < attrs.items.length - 1 ? el( 'div', { key: 'arr-' + i, className: 'bkrm-arrow' },
              el( 'svg', { viewBox:'0 0 24 24', fill:'currentColor', width:20, height:20 },
                el('path', { d:'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z' })
              )
            ) : null
          ];
        } )
      )
    );
  }

  function renderRoadmap( attrs ) {
    var tv = getTypoCssVars();
    var wrapStyle = {
      '--bkrm-done':    attrs.doneColor,
      '--bkrm-prog':    attrs.progressColor,
      '--bkrm-plan':    attrs.plannedColor,
      '--bkrm-conn':    attrs.connectorColor,
      '--bkrm-cW':      attrs.cardWidth + 'px',
      '--bkrm-gap':     attrs.cardGap + 'px',
      '--bkrm-cBg':     attrs.cardBg,
      '--bkrm-cBrd':    attrs.cardBorder,
      '--bkrm-cR':      attrs.cardRadius + 'px'
    };
    if (tv) {
      Object.assign(wrapStyle, tv(attrs.titleTypo, '--bkrm-tt-'));
      Object.assign(wrapStyle, tv(attrs.descTypo, '--bkrm-dt-'));
    }
    return el( 'div', { className: 'bkrm-wrap', style: wrapStyle },
      el( 'div', { className: 'bkrm-track' },
        attrs.items.map( function ( item, i ) {
          return [
            el( 'div', { key: 'c-' + i, className: 'bkrm-card bkrm-status-' + item.status },
              el( 'div', { className: 'bkrm-label-tag' }, item.label ),
              el( 'h4', { className: 'bkrm-title' }, item.title ),
              el( 'p', { className: 'bkrm-desc' }, item.desc ),
              el( 'span', { className: 'bkrm-badge bkrm-badge-' + item.status },
                STATUS_LABELS[ item.status ] || item.status
              )
            ),
            i < attrs.items.length - 1 ? el( 'div', { key: 'arr-' + i, className: 'bkrm-arrow' },
              el( 'svg', { viewBox:'0 0 24 24', fill:'currentColor', width:20, height:20 },
                el('path', { d:'M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z' })
              )
            ) : null
          ];
        } )
      )
    );
  }

  registerBlockType( 'blockenberg/roadmap', {
    deprecated: [{
      attributes: {
        items:          { type: 'array', default: [] },
        cardWidth:      { type: 'number', default: 200 },
        cardGap:        { type: 'number', default: 24 },
        cardBg:         { type: 'string', default: '#ffffff' },
        cardBorder:     { type: 'string', default: '#e5e7eb' },
        cardRadius:     { type: 'number', default: 10 },
        doneColor:      { type: 'string', default: '#22c55e' },
        progressColor:  { type: 'string', default: '#f59e0b' },
        plannedColor:   { type: 'string', default: '#94a3b8' },
        connectorColor: { type: 'string', default: '#d1d5db' },
        titleFontSize:  { type: 'number', default: 15 },
        titleFontWeight:{ type: 'number', default: 600 },
        titleLineHeight:{ type: 'number', default: 1.4 },
        descFontSize:   { type: 'number', default: 13 },
        descFontWeight: { type: 'number', default: 400 },
        descLineHeight: { type: 'number', default: 1.5 },
        titleTypo:      { type: 'object', default: {} },
        descTypo:       { type: 'object', default: {} }
      },
      save: function (props) {
        return v1RenderRoadmap(props.attributes);
      }
    }],
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var blockProps = useBlockProps();
      return el( 'div', blockProps,
        el( InspectorControls, null,
          el( PanelBody, { title: __('Items','blockenberg'), initialOpen: true },
            buildItems( attrs.items, setAttr ),
            el( Button, { variant:'secondary', style:{marginTop:8}, onClick: function(){
              setAttr({ items: attrs.items.concat([{ label:'Q?', title:'New Milestone', desc:'Description.', status:'planned' }]) });
            } }, __('+ Add Milestone','blockenberg') )
          ),
          el( PanelBody, { title: __('Style','blockenberg'), initialOpen: false },
            el( RangeControl, { label:__('Card Width (px)','blockenberg'), value:attrs.cardWidth, min:140, max:320, onChange:function(v){setAttr({cardWidth:v});} } ),
            el( RangeControl, { label:__('Card Gap (px)','blockenberg'), value:attrs.cardGap, min:8, max:60, onChange:function(v){setAttr({cardGap:v});} } ),
            el( RangeControl, { label:__('Border Radius (px)','blockenberg'), value:attrs.cardRadius, min:0, max:24, onChange:function(v){setAttr({cardRadius:v});} } )
          ),
          el( PanelBody, { title: __('Typography','blockenberg'), initialOpen: false },
            (function () { var TC = getTypoControl(); return TC ? [
              el(TC, { key: 'tt', label: __('Title','blockenberg'), value: attrs.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
              el(TC, { key: 'dt', label: __('Description','blockenberg'), value: attrs.descTypo, onChange: function (v) { setAttr({ descTypo: v }); } })
            ] : null; })()
          ),
          el( PanelBody, { title: __('Colors','blockenberg'), initialOpen: false },
            el( PanelColorSettings, { title:__('Colors','blockenberg'), colorSettings:[
              { value:attrs.doneColor,      onChange:function(v){setAttr({doneColor:v||'#22c55e'});},     label:__('Done') },
              { value:attrs.progressColor,  onChange:function(v){setAttr({progressColor:v||'#f59e0b'});}, label:__('In Progress') },
              { value:attrs.plannedColor,   onChange:function(v){setAttr({plannedColor:v||'#94a3b8'});},  label:__('Planned') },
              { value:attrs.cardBg,         onChange:function(v){setAttr({cardBg:v||'#fff'});},           label:__('Card Background') },
              { value:attrs.cardBorder,     onChange:function(v){setAttr({cardBorder:v||'#e5e7eb'});},    label:__('Card Border') },
              { value:attrs.connectorColor, onChange:function(v){setAttr({connectorColor:v||'#d1d5db'});},label:__('Connector') }
            ] } )
          )
        ),
        renderRoadmap( attrs )
      );
    },
    save: function ( props ) {
      return renderRoadmap( props.attributes );
    }
  } );
} )();
