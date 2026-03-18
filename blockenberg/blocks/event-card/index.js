( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button } = window.wp.components;
  var { __ } = window.wp.i18n;

  var EVENT_TYPES = ['In-Person','Virtual','Hybrid'].map(v=>({label:v,value:v}));
  var LAYOUTS = [{label:'Horizontal',value:'horizontal'},{label:'Card',value:'card'}];
  var TYPE_COLORS = {'In-Person':'#10b981','Virtual':'#3b82f6','Hybrid':'#f59e0b'};

  var _ecTC, _ecTV;
  function _tc() { return _ecTC || (_ecTC = window.bkbgTypographyControl); }
  function _tv(t, p) { return (_ecTV || (_ecTV = window.bkbgTypoCssVars)) ? _ecTV(t, p) : {}; }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    } catch(e) { return dateStr; }
  }

  function EventPreview(a) {
    var acc = a.accentColor;
    var badges = (a.badges||'').split(',').map(s=>s.trim()).filter(Boolean);
    var typeColor = TYPE_COLORS[a.eventType] || '#6b7280';

    var dateParts = a.startDate ? a.startDate.split('-') : ['2026','06','15'];
    var monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    var month = monthNames[(parseInt(dateParts[1],10)||1)-1] || 'JUN';
    var day = dateParts[2] || '15';

    var cardStyle = {
      background:a.cardBg, border:'1px solid '+a.cardBorder,
      borderRadius:a.cardRadius+'px',
      boxShadow:a.cardShadow?'0 8px 32px rgba(0,0,0,0.09)':'none',
      overflow:'hidden', display:'flex',
      flexDirection: a.layoutStyle==='card'?'column':'row',
    };

    var dateBox = el('div',{className:'bkec-date-box',style:{
      background:acc, color:'#fff', padding:'24px 20px',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      minWidth: a.layoutStyle==='card'?'auto':'120px',
      flexShrink:0,
    }},
      el('span',{style:{fontSize:'13px',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',opacity:0.85}},month),
      el('span',{style:{fontSize:'48px',fontWeight:900,lineHeight:1}},day),
      a.startTime&&el('span',{style:{fontSize:'12px',opacity:0.8,marginTop:'4px'}},a.startTime),
    );

    var body = el('div',{className:'bkec-body',style:{padding:'24px 28px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
      el('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}},
        el('span',{style:{background:typeColor,color:'#fff',borderRadius:'20px',padding:'3px 12px',fontSize:'11px',fontWeight:700}},a.eventType),
        badges.map((b,i)=>el('span',{key:i,style:{background:'#f3f4f6',color:'#374151',borderRadius:'20px',padding:'3px 12px',fontSize:'11px',fontWeight:600}},b))
      ),
      el('h3',{className:'bkec-event-name',style:{margin:0,color:'#1f2937'}},a.eventName),
      a.description&&el('p',{className:'bkec-desc',style:{margin:0,color:'#6b7280'}},a.description),
      el('div',{style:{display:'flex',flexDirection:'column',gap:'6px',marginTop:'4px'}},
        el('div',{style:{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',color:'#4b5563'}},
          el('span',{className:'dashicons dashicons-clock',style:{color:acc,fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
          (a.startTime||'')+(a.endTime?' – '+a.endTime:'')+(a.timezone?' ('+a.timezone+')':'')
        ),
        a.venueName&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',color:'#4b5563'}},
          el('span',{className:'dashicons dashicons-location',style:{color:acc,fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
          el('span',null,a.venueName+(a.venueAddress?', '+a.venueAddress:''))
        ),
      ),
      el('div',{style:{marginTop:'8px'}},
        el('a',{href:a.ticketUrl||'#',style:{display:'inline-flex',alignItems:'center',gap:'6px',background:a.btnBg,color:a.btnColor,padding:'10px 22px',borderRadius:a.btnRadius+'px',fontWeight:700,textDecoration:'none',fontSize:'14px'}},
          el('span',{className:'dashicons dashicons-tickets-alt',style:{fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
          a.ticketLabel)
      )
    );

    if (a.layoutStyle==='card') {
      return el('div',{className:'bkec-wrap', style: Object.assign({}, _tv(a.typoName || {}, '--bkec-nm-'), _tv(a.typoDesc || {}, '--bkec-dc-'))},
        a.imageUrl && el('div',{style:{height:'200px',background:'url('+a.imageUrl+') center/cover no-repeat'}}),
        el('div',{className:'bkec-card',style:cardStyle},
          el('div',{style:{padding:'20px 28px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}, dateBox),
          body,
        )
      );
    }

    return el('div',{className:'bkec-wrap'},
      el('div',{className:'bkec-card',style:cardStyle},
        a.imageUrl && el('div',{style:{width:'220px',flexShrink:0,background:'url('+a.imageUrl+') center/cover no-repeat'}}),
        dateBox,
        body,
      )
    );
  }

  registerBlockType('blockenberg/event-card', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
    return el('div',null,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Event Info'),initialOpen:true},
            el(TextControl,{label:__('Event Name'),value:a.eventName,onChange:v=>set({eventName:v})}),
            el(TextareaControl,{label:__('Description'),value:a.description,rows:3,onChange:v=>set({description:v})}),
            el(SelectControl,{label:__('Event Type'),value:a.eventType,options:EVENT_TYPES,onChange:v=>set({eventType:v})}),
            el(TextControl,{label:__('Badges (comma-separated)'),value:a.badges,onChange:v=>set({badges:v}),help:'e.g.: Free,Workshops,Networking'}),
            el(TextControl,{label:__('Organizer'),value:a.organizer,onChange:v=>set({organizer:v})}),
          ),
          el(PanelBody,{title:__('Date & Time'),initialOpen:false},
            el(TextControl,{label:__('Start Date (YYYY-MM-DD)'),value:a.startDate,onChange:v=>set({startDate:v})}),
            el(TextControl,{label:__('Start Time (HH:MM)'),value:a.startTime,onChange:v=>set({startTime:v})}),
            el(TextControl,{label:__('End Date (YYYY-MM-DD)'),value:a.endDate,onChange:v=>set({endDate:v})}),
            el(TextControl,{label:__('End Time (HH:MM)'),value:a.endTime,onChange:v=>set({endTime:v})}),
            el(TextControl,{label:__('Timezone'),value:a.timezone,onChange:v=>set({timezone:v})}),
          ),
          el(PanelBody,{title:__('Venue'),initialOpen:false},
            el(TextControl,{label:__('Venue Name'),value:a.venueName,onChange:v=>set({venueName:v})}),
            el(TextControl,{label:__('Address'),value:a.venueAddress,onChange:v=>set({venueAddress:v})}),
          ),
          el(PanelBody,{title:__('Photo'),initialOpen:false},
            el(MediaUploadCheck,null,
              el(MediaUpload,{onSelect:m=>set({imageUrl:m.url,imageId:m.id}),allowedTypes:['image'],value:a.imageId,
                render:({open})=>el(Button,{onClick:open,variant:'secondary',style:{width:'100%',justifyContent:'center',marginBottom:'8px'}},
                  a.imageUrl?__('Change Image'):__('Select Image'))
              })
            ),
            a.imageUrl&&el(Button,{isDestructive:true,isSmall:true,onClick:()=>set({imageUrl:'',imageId:0})},__('Remove Image')),
          ),
          el(PanelBody,{title:__('CTA Button'),initialOpen:false},
            el(TextControl,{label:__('Ticket / RSVP URL'),value:a.ticketUrl,onChange:v=>set({ticketUrl:v})}),
            el(TextControl,{label:__('Button Label'),value:a.ticketLabel,onChange:v=>set({ticketLabel:v})}),
            el(RangeControl,{label:__('Button Radius (px)'),value:a.btnRadius,min:0,max:50,onChange:v=>set({btnRadius:v})}),
          ),
          el(PanelBody,{title:__('Style'),initialOpen:false},
            el(SelectControl,{label:__('Layout'),value:a.layoutStyle,options:LAYOUTS,onChange:v=>set({layoutStyle:v})}),
            el(RangeControl,{label:__('Card Radius (px)'),value:a.cardRadius,min:0,max:32,onChange:v=>set({cardRadius:v})}),
            el(ToggleControl,{label:__('Card Shadow'),checked:a.cardShadow,onChange:v=>set({cardShadow:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Schema.org Markup'),checked:a.schemaEnabled,onChange:v=>set({schemaEnabled:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            _tc() && el(_tc(), { label: __('Event Name', 'blockenberg'), typo: a.typoName || {}, onChange: v=>set({typoName:v}) }),
            _tc() && el(_tc(), { label: __('Description', 'blockenberg'), typo: a.typoDesc || {}, onChange: v=>set({typoDesc:v}) }),
            _tc() && el(_tc(), { label: __('Badges', 'blockenberg'), typo: a.typoBadge || {}, onChange: v=>set({typoBadge:v}) }),
            _tc() && el(_tc(), { label: __('Meta / Info', 'blockenberg'), typo: a.typoMeta || {}, onChange: v=>set({typoMeta:v}) }),
            _tc() && el(_tc(), { label: __('Button', 'blockenberg'), typo: a.typoBtn || {}, onChange: v=>set({typoBtn:v}) })
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Accent / Date BG'),value:a.accentColor,onChange:v=>set({accentColor:v||'#6c3fb5'})},
            {label:__('Card Background'),value:a.cardBg,onChange:v=>set({cardBg:v||'#ffffff'})},
            {label:__('Card Border'),value:a.cardBorder,onChange:v=>set({cardBorder:v||'#e5e7eb'})},
            {label:__('Button BG'),value:a.btnBg,onChange:v=>set({btnBg:v||'#6c3fb5'})},
            {label:__('Button Text'),value:a.btnColor,onChange:v=>set({btnColor:v||'#ffffff'})},
          ]}),
        ),
        EventPreview(a),
      );
    },

    save: function({attributes:a}) {
      var acc = a.accentColor;
      var badges = (a.badges||'').split(',').map(s=>s.trim()).filter(Boolean);
      var typeColor = TYPE_COLORS[a.eventType] || '#6b7280';
      var dateParts = (a.startDate||'2026-06-15').split('-');
      var monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var month = monthNames[(parseInt(dateParts[1],10)||1)-1]||'JUN';
      var day = dateParts[2]||'15';

      var cardStyle = {
        background:a.cardBg,border:'1px solid '+a.cardBorder,borderRadius:a.cardRadius+'px',
        boxShadow:a.cardShadow?'0 8px 32px rgba(0,0,0,0.09)':'none',
        overflow:'hidden',display:'flex',flexDirection:a.layoutStyle==='card'?'column':'row',
      };

      return el('div',{
        className:'bkec-wrap',
        style: Object.assign({}, _tv(a.typoName || {}, '--bkec-nm-'), _tv(a.typoDesc || {}, '--bkec-dc-'), _tv(a.typoBadge || {}, '--bkec-ba-'), _tv(a.typoMeta || {}, '--bkec-mt-'), _tv(a.typoBtn || {}, '--bkec-bt-')),
        'data-schema':a.schemaEnabled?'1':'0',
        'data-event':JSON.stringify({name:a.eventName,startDate:a.startDate,startTime:a.startTime,endDate:a.endDate,endTime:a.endTime,timezone:a.timezone,venueName:a.venueName,venueAddress:a.venueAddress,eventType:a.eventType,url:a.ticketUrl,organizer:a.organizer,description:a.description,image:a.imageUrl}),
      },
        el('div',{className:'bkec-card',style:cardStyle},
          a.layoutStyle!=='card'&&a.imageUrl&&el('div',{style:{width:'220px',flexShrink:0,background:'url('+a.imageUrl+') center/cover no-repeat'}}),
          el('div',{className:'bkec-date-box',style:{background:acc,color:'#fff',padding:'24px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:a.layoutStyle==='card'?'auto':'120px',flexShrink:0}},
            el('span',{style:{fontSize:'13px',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',opacity:0.85}},month),
            el('span',{style:{fontSize:'48px',fontWeight:900,lineHeight:1}},day),
            a.startTime&&el('span',{style:{fontSize:'12px',opacity:0.8,marginTop:'4px'}},a.startTime),
          ),
          el('div',{className:'bkec-body',style:{padding:'24px 28px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
            el('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}},
              el('span',{className:'bkec-type-badge',style:{background:typeColor,color:'#fff',borderRadius:'20px',padding:'3px 12px'}},a.eventType),
              badges.map((b,i)=>el('span',{key:i,className:'bkec-badge',style:{background:'#f3f4f6',color:'#374151',borderRadius:'20px',padding:'3px 12px'}},b))
            ),
            el('h3',{className:'bkec-event-name',style:{margin:0,color:'#1f2937'}},a.eventName),
            a.description&&el('p',{className:'bkec-desc',style:{margin:0,color:'#6b7280'}},a.description),
            el('div',{style:{display:'flex',flexDirection:'column',gap:'6px',marginTop:'4px'}},
              el('div',{className:'bkec-info-row',style:{display:'flex',alignItems:'center',gap:'8px',color:'#4b5563'}},
                el('span',{className:'dashicons dashicons-clock',style:{color:acc,fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
                (a.startTime||'')+(a.endTime?' – '+a.endTime:'')+(a.timezone?' ('+a.timezone+')':'')
              ),
              a.venueName&&el('div',{className:'bkec-info-row',style:{display:'flex',alignItems:'center',gap:'8px',color:'#4b5563'}},
                el('span',{className:'dashicons dashicons-location',style:{color:acc,fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
                el('span',null,a.venueName+(a.venueAddress?', '+a.venueAddress:''))
              ),
            ),
            el('div',{style:{marginTop:'8px'}},
              el('a',{className:'bkec-btn',href:a.ticketUrl||'#',style:{display:'inline-flex',alignItems:'center',gap:'6px',background:a.btnBg,color:a.btnColor,padding:'10px 22px',borderRadius:a.btnRadius+'px',textDecoration:'none'}},
                el('span',{className:'dashicons dashicons-tickets-alt',style:{fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
                a.ticketLabel)
            ),
          ),
        )
      );
    },

    deprecated: [{
      save: function({attributes:a}) {
        var acc = a.accentColor;
        var badges = (a.badges||'').split(',').map(s=>s.trim()).filter(Boolean);
        var typeColor = TYPE_COLORS[a.eventType] || '#6b7280';
        var dateParts = (a.startDate||'2026-06-15').split('-');
        var monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var month = monthNames[(parseInt(dateParts[1],10)||1)-1]||'JUN';
        var day = dateParts[2]||'15';
        var cardStyle = {
          background:a.cardBg,border:'1px solid '+a.cardBorder,borderRadius:a.cardRadius+'px',
          boxShadow:a.cardShadow?'0 8px 32px rgba(0,0,0,0.09)':'none',
          overflow:'hidden',display:'flex',flexDirection:a.layoutStyle==='card'?'column':'row',
        };
        return el('div',{
          className:'bkec-wrap',
          style: Object.assign({}, _tv(a.typoName || {}, '--bkec-nm-'), _tv(a.typoDesc || {}, '--bkec-dc-')),
          'data-schema':a.schemaEnabled?'1':'0',
          'data-event':JSON.stringify({name:a.eventName,startDate:a.startDate,startTime:a.startTime,endDate:a.endDate,endTime:a.endTime,timezone:a.timezone,venueName:a.venueName,venueAddress:a.venueAddress,eventType:a.eventType,url:a.ticketUrl,organizer:a.organizer,description:a.description,image:a.imageUrl}),
        },
          el('div',{className:'bkec-card',style:cardStyle},
            a.layoutStyle!=='card'&&a.imageUrl&&el('div',{style:{width:'220px',flexShrink:0,background:'url('+a.imageUrl+') center/cover no-repeat'}}),
            el('div',{className:'bkec-date-box',style:{background:acc,color:'#fff',padding:'24px 20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:a.layoutStyle==='card'?'auto':'120px',flexShrink:0}},
              el('span',{style:{fontSize:'13px',fontWeight:700,letterSpacing:'2px',textTransform:'uppercase',opacity:0.85}},month),
              el('span',{style:{fontSize:'48px',fontWeight:900,lineHeight:1}},day),
              a.startTime&&el('span',{style:{fontSize:'12px',opacity:0.8,marginTop:'4px'}},a.startTime),
            ),
            el('div',{className:'bkec-body',style:{padding:'24px 28px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
              el('div',{style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}},
                el('span',{style:{background:typeColor,color:'#fff',borderRadius:'20px',padding:'3px 12px',fontSize:'11px',fontWeight:700}},a.eventType),
                badges.map((b,i)=>el('span',{key:i,style:{background:'#f3f4f6',color:'#374151',borderRadius:'20px',padding:'3px 12px',fontSize:'11px',fontWeight:600}},b))
              ),
              el('h3',{className:'bkec-event-name',style:{margin:0,color:'#1f2937'}},a.eventName),
              a.description&&el('p',{className:'bkec-desc',style:{margin:0,color:'#6b7280'}},a.description),
              el('div',{style:{display:'flex',flexDirection:'column',gap:'6px',marginTop:'4px'}},
                el('div',{style:{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',color:'#4b5563'}},
                  el('span',{className:'dashicons dashicons-clock',style:{color:acc,fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
                  (a.startTime||'')+(a.endTime?' – '+a.endTime:'')+(a.timezone?' ('+a.timezone+')':'')
                ),
                a.venueName&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',color:'#4b5563'}},
                  el('span',{className:'dashicons dashicons-location',style:{color:acc,fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
                  el('span',null,a.venueName+(a.venueAddress?', '+a.venueAddress:''))
                ),
              ),
              el('div',{style:{marginTop:'8px'}},
                el('a',{className:'bkec-btn',href:a.ticketUrl||'#',style:{display:'inline-flex',alignItems:'center',gap:'6px',background:a.btnBg,color:a.btnColor,padding:'10px 22px',borderRadius:a.btnRadius+'px',fontWeight:700,textDecoration:'none',fontSize:'14px'}},
                  el('span',{className:'dashicons dashicons-tickets-alt',style:{fontSize:'16px',width:'16px',height:'16px',lineHeight:1}}),
                  a.ticketLabel)
              ),
            ),
          )
        );
      }
    }],
  });

  var TYPE_COLORS = {'In-Person':'#10b981','Virtual':'#3b82f6','Hybrid':'#f59e0b'};
}() );
