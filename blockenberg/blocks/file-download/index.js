( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _fdTC, _fdTV;
  function _tc() { return (_fdTC = _fdTC || window.bkbgTypographyControl); }
  function _tv() { return (_fdTV = _fdTV || window.bkbgTypoCssVars); }

  var ICON_MAP = { PDF:'media-document', DOC:'editor-alignleft', XLS:'media-spreadsheet', ZIP:'media-archive', IMG:'format-image', MP3:'format-audio', MP4:'format-video', TXT:'editor-code', DEFAULT:'download' };

  function fileIcon(type, color, size) {
    var icon = ICON_MAP[type.toUpperCase()] || ICON_MAP.DEFAULT;
    return el('span',{className:'dashicons dashicons-'+icon, style:{fontSize:size+'px',width:size+'px',height:size+'px',color:color,lineHeight:1}});
  }

  function buildWrapStyle(a) {
    return Object.assign({
      display:'flex', alignItems:'center', gap:'20px',
      background:a.cardBg, border:'1px solid '+a.cardBorder,
      borderRadius:a.cardRadius+'px',
      padding:'20px 24px',
      boxShadow: a.cardShadow ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
    },
      _tv()(a.typoName, '--bkfd-tn-'),
      _tv()(a.typoDesc, '--bkfd-td-'),
      _tv()(a.typoMeta, '--bkfd-tm-'),
      _tv()(a.typoBadge, '--bkfd-tb-'),
      _tv()(a.typoBtn, '--bkfd-tbt-')
    );
  }

  function Preview(a) {
    var wrapStyle = buildWrapStyle(a);
    return el('div',{className:'bkfd-wrap',style:wrapStyle},
      a.showIcon && el('div',{className:'bkfd-icon-wrap',style:{
        background:a.iconBg, borderRadius:'12px',
        width:a.iconSize+'px', height:a.iconSize+'px',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}, fileIcon(a.fileType, a.iconColor, Math.round(a.iconSize*0.5))),

      el('div',{className:'bkfd-info',style:{flex:1, minWidth:0}},
        el('div',{className:'bkfd-name-row',style:{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}},
          el('span',{className:'bkfd-name',style:{color:a.nameColor,wordBreak:'break-word'}},a.fileName),
          a.badgeEnabled && a.fileType && el('span',{className:'bkfd-badge',style:{
            background:a.badgeBg,color:a.badgeColor,
            borderRadius:'4px',padding:'2px 7px',flexShrink:0,
          }},a.fileType.toUpperCase()),
        ),
        el('div',{className:'bkfd-meta',style:{color:a.metaColor,marginBottom:a.description?'6px':'0'}},a.fileSize),
        a.description && el('p',{className:'bkfd-desc',style:{margin:0,color:a.descColor}},a.description),
      ),

      a.fileUrl && el('a',{href:a.fileUrl,className:'bkfd-btn',
        download:true,target:a.openInNew?'_blank':undefined,
        style:{display:'inline-flex',alignItems:'center',gap:'6px',flexShrink:0,
          background:a.btnBg,color:a.btnColor,padding:'10px 20px',borderRadius:a.btnRadius+'px',
          textDecoration:'none'}},
        el('span',{className:'dashicons dashicons-download',style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
        a.btnLabel
      ),
      !a.fileUrl && el('span',{className:'bkfd-btn',
        style:{display:'inline-flex',alignItems:'center',gap:'6px',flexShrink:0,
          background:a.btnBg,color:a.btnColor,padding:'10px 20px',borderRadius:a.btnRadius+'px',
          cursor:'not-allowed',opacity:0.6}},
        el('span',{className:'dashicons dashicons-download',style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
        a.btnLabel
      ),
    );
  }

  registerBlockType('blockenberg/file-download', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el('div',null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('File'),initialOpen:true},
            el(MediaUploadCheck,null,
              el(MediaUpload,{
                onSelect: m => set({fileUrl:m.url,fileId:m.id,fileName:m.filename||m.title,fileSize:m.filesizeHumanReadable||'',fileType:(m.subtype||'').toUpperCase()}),
                allowedTypes:['application/*','audio/*','video/*','image/*'], value:a.fileId,
                render:({open})=>el(Button,{onClick:open,variant:'secondary',style:{width:'100%',justifyContent:'center',marginBottom:'8px'}},
                  a.fileUrl ? __('Change File') : __('Select File From Media Library'))
              })
            ),
            el(TextControl,{label:__('File Name'),value:a.fileName,onChange:v=>set({fileName:v})}),
            el(TextControl,{label:__('File Size (display)'),value:a.fileSize,onChange:v=>set({fileSize:v})}),
            el(TextControl,{label:__('File Type / Badge'),value:a.fileType,onChange:v=>set({fileType:v})}),
            el(TextControl,{label:__('File URL (manual)'),value:a.fileUrl,onChange:v=>set({fileUrl:v}),help:__('Auto-filled from media or enter a direct URL.')}),
            el(TextControl,{label:__('Description'),value:a.description,onChange:v=>set({description:v})}),
            el(TextControl,{label:__('Button Label'),value:a.btnLabel,onChange:v=>set({btnLabel:v})}),
            el(ToggleControl,{label:__('Open In New Tab'),checked:a.openInNew,onChange:v=>set({openInNew:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Icon'),initialOpen:false},
            el(ToggleControl,{label:__('Show Icon'),checked:a.showIcon,onChange:v=>set({showIcon:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Icon Box Size (px)'),value:a.iconSize,min:32,max:96,onChange:v=>set({iconSize:v})}),
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            _tc() && el(_tc(), { label: __('File Name', 'blockenberg'), value: a.typoName, onChange: function (v) { set({ typoName: v }); } }),
            _tc() && el(_tc(), { label: __('Description', 'blockenberg'), value: a.typoDesc, onChange: function (v) { set({ typoDesc: v }); } }),
            _tc() && el(_tc(), { label: __('Meta', 'blockenberg'), value: a.typoMeta, onChange: function (v) { set({ typoMeta: v }); } }),
            _tc() && el(_tc(), { label: __('Badge', 'blockenberg'), value: a.typoBadge, onChange: function (v) { set({ typoBadge: v }); } }),
            _tc() && el(_tc(), { label: __('Button', 'blockenberg'), value: a.typoBtn, onChange: function (v) { set({ typoBtn: v }); } }),
          ),
          el(PanelBody,{title:__('Card Style'),initialOpen:false},
            el(RangeControl,{label:__('Border Radius (px)'),value:a.cardRadius,min:0,max:32,onChange:v=>set({cardRadius:v})}),
            el(ToggleControl,{label:__('Card Shadow'),checked:a.cardShadow,onChange:v=>set({cardShadow:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Button Radius (px)'),value:a.btnRadius,min:0,max:50,onChange:v=>set({btnRadius:v})}),
            el(ToggleControl,{label:__('Type Badge'),checked:a.badgeEnabled,onChange:v=>set({badgeEnabled:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),  value:a.cardBg,     onChange:v=>set({cardBg:v||'#ffffff'})},
            {label:__('Card Border'),      value:a.cardBorder, onChange:v=>set({cardBorder:v||'#e5e7eb'})},
            {label:__('Icon BG'),          value:a.iconBg,     onChange:v=>set({iconBg:v||'#ede9fc'})},
            {label:__('Icon Color'),       value:a.iconColor,  onChange:v=>set({iconColor:v||'#6c3fb5'})},
            {label:__('File Name Color'),  value:a.nameColor,  onChange:v=>set({nameColor:v||'#1f2937'})},
            {label:__('Meta Color'),       value:a.metaColor,  onChange:v=>set({metaColor:v||'#6b7280'})},
            {label:__('Description Color'),value:a.descColor,  onChange:v=>set({descColor:v||'#4b5563'})},
            {label:__('Button BG'),        value:a.btnBg,      onChange:v=>set({btnBg:v||'#6c3fb5'})},
            {label:__('Button Text'),      value:a.btnColor,   onChange:v=>set({btnColor:v||'#ffffff'})},
            {label:__('Badge BG'),         value:a.badgeBg,    onChange:v=>set({badgeBg:v||'#6c3fb5'})},
            {label:__('Badge Text'),       value:a.badgeColor, onChange:v=>set({badgeColor:v||'#ffffff'})},
          ]}),
        ),
        Preview(a),
      );
    },

    save: function({attributes:a}) {
      var wrapStyle = buildWrapStyle(a);
      return el('div',{className:'bkfd-wrap',style:wrapStyle},
        a.showIcon && el('div',{className:'bkfd-icon-wrap',style:{
          background:a.iconBg,borderRadius:'12px',
          width:a.iconSize+'px',height:a.iconSize+'px',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        }}, el('span',{className:'dashicons dashicons-'+(({PDF:'media-document',DOC:'editor-alignleft',XLS:'media-spreadsheet',ZIP:'media-archive',IMG:'format-image',MP3:'format-audio',MP4:'format-video'}[a.fileType.toUpperCase()]||'download'),({PDF:'media-document',DOC:'editor-alignleft',XLS:'media-spreadsheet',ZIP:'media-archive',IMG:'format-image',MP3:'format-audio',MP4:'format-video'}[a.fileType.toUpperCase()]||'download')),
          style:{fontSize:Math.round(a.iconSize*0.5)+'px',width:Math.round(a.iconSize*0.5)+'px',height:Math.round(a.iconSize*0.5)+'px',color:a.iconColor,lineHeight:1}})),

        el('div',{className:'bkfd-info',style:{flex:1,minWidth:0}},
          el('div',{style:{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}},
            el('span',{className:'bkfd-name',style:{color:a.nameColor,wordBreak:'break-word'}},a.fileName),
            a.badgeEnabled && a.fileType && el('span',{className:'bkfd-badge',style:{background:a.badgeBg,color:a.badgeColor,borderRadius:'4px',padding:'2px 7px',flexShrink:0}},a.fileType.toUpperCase()),
          ),
          el('div',{className:'bkfd-meta',style:{color:a.metaColor,marginBottom:a.description?'6px':'0'}},a.fileSize),
          a.description && el('p',{className:'bkfd-desc',style:{margin:0,color:a.descColor}},a.description),
        ),

        el('a',{className:'bkfd-btn',href:a.fileUrl||'#',download:'',
          target:a.openInNew?'_blank':undefined,rel:a.openInNew?'noopener noreferrer':undefined,
          style:{display:'inline-flex',alignItems:'center',gap:'6px',flexShrink:0,
            background:a.btnBg,color:a.btnColor,padding:'10px 20px',borderRadius:a.btnRadius+'px',
            textDecoration:'none'}},
          el('span',{className:'dashicons dashicons-download',style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
          a.btnLabel
        ),
      );
    }
  });
}() );
