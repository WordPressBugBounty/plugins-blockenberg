( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var _tvf = function (typo, prefix) { var fn = getTypoCssVars(); return fn ? fn(typo, prefix) : {}; };

    var POPULAR_ZONES = [
        'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
        'America/Toronto','America/Mexico_City','America/Sao_Paulo','Europe/London',
        'Europe/Paris','Europe/Berlin','Europe/Moscow','Africa/Lagos','Asia/Dubai',
        'Asia/Kolkata','Asia/Shanghai','Asia/Tokyo','Asia/Singapore','Australia/Sydney',
        'Pacific/Auckland','Pacific/Honolulu','UTC'
    ];

    function fmtZoneName(tz) {
        return tz.replace(/_/g,' ').replace(/\//,' / ');
    }

    function getConvertedTime(isoString, fromZone, toZone, use12, showDate) {
        try {
            var opts = { timeZone: toZone, hour: '2-digit', minute: '2-digit', hour12: !!use12 };
            if (showDate) {
                opts.weekday = 'short';
                opts.month   = 'short';
                opts.day     = 'numeric';
            }
            var date = new Date(isoString);
            return date.toLocaleString('en-US', opts);
        } catch(e) { return '—'; }
    }

    function getOffset(isoString, toZone) {
        try {
            var date = new Date(isoString);
            var utcMs = date.getTime();
            var inZone = new Date(date.toLocaleString('en-US', {timeZone: toZone}));
            var inUtc  = new Date(date.toLocaleString('en-US', {timeZone: 'UTC'}));
            var diff   = Math.round((inZone - inUtc) / 60000);
            var sign   = diff >= 0 ? '+' : '-';
            var abs    = Math.abs(diff);
            return 'UTC' + sign + Math.floor(abs/60) + (abs%60 ? ':' + String(abs%60).padStart(2,'0') : '');
        } catch(e) { return ''; }
    }

    function TZPreview(props) {
        var a = props.attributes;
        var accent = a.accentColor || '#6c3fb5';

        // Default to now (rounded to nearest minute)
        var nowDef = (function(){
            var d = new Date(); d.setSeconds(0,0);
            // Build local datetime string for input[type=datetime-local]
            var pad = function(n){ return String(n).padStart(2,'0'); };
            return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
        })();

        var _dt   = useState(nowDef);     var dt = _dt[0];   var setDt = _dt[1];
        var _from = useState(a.sourceZone||'America/New_York'); var fromZ = _from[0]; var setFromZ = _from[1];

        var targets = String(a.targetZones||'Europe/London,Europe/Paris,Asia/Tokyo,America/Los_Angeles,Australia/Sydney')
            .split(',').map(function(s){ return s.trim(); }).filter(Boolean);

        // Convert dt (local datetime-local string) to an absolute ISO for Intl
        var dateObj = new Date(dt);
        var isoBase = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();

        // Display the source time in its own zone
        var srcDisplay = getConvertedTime(isoBase, null, fromZ, a.use12Hour, a.showDate);
        var srcOffset  = getOffset(isoBase, fromZ);

        return el('div', {style:{paddingTop:(a.paddingTop||60)+'px',paddingBottom:(a.paddingBottom||60)+'px',background:a.sectionBg||undefined}},
            el('div', {style:{background:a.cardBg,borderRadius:(a.cardRadius||16)+'px',padding:'36px 32px',maxWidth:(a.maxWidth||540)+'px',margin:'0 auto',boxShadow:'0 4px 24px rgba(0,0,0,.09)'}},

                (a.showTitle||a.showSubtitle) && el('div', {style:{marginBottom:'22px'}},
                    a.showTitle    && el('div', {className:'bkbg-tzc-title',style:{color:a.titleColor,marginBottom:'6px'}}, a.title),
                    a.showSubtitle && el('div', {style:{fontSize:'15px',color:a.subtitleColor,opacity:.75}}, a.subtitle)
                ),

                // Source card
                el('div', {style:{background:a.sourceBg||accent,borderRadius:(a.rowRadius||10)+'px',padding:'20px 22px',marginBottom:'16px'}},
                    el('div', {style:{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'12px'}},
                        el('div', {style:{flex:1,minWidth:'180px'}},
                            el('label', {style:{display:'block',fontSize:'11px',fontWeight:700,color:a.sourceColor||'#fff',opacity:.8,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.05em'}}, 'Date & Time'),
                            el('input', {type:'datetime-local',value:dt,
                                style:{width:'100%',boxSizing:'border-box',padding:'9px 12px',borderRadius:'6px',border:'none',fontSize:'14px',fontFamily:'inherit',outline:'none',background:'rgba(255,255,255,.15)',color:a.sourceColor||'#fff',colorScheme:'dark'},
                                onChange:function(e){setDt(e.target.value);}})
                        ),
                        el('div', {style:{flex:1,minWidth:'180px'}},
                            el('label', {style:{display:'block',fontSize:'11px',fontWeight:700,color:a.sourceColor||'#fff',opacity:.8,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'.05em'}}, 'Source Time Zone'),
                            el('select', {value:fromZ,
                                style:{width:'100%',boxSizing:'border-box',padding:'9px 36px 9px 12px',borderRadius:'6px',border:'none',fontSize:'14px',fontFamily:'inherit',outline:'none',background:'rgba(255,255,255,.15)',color:a.sourceColor||'#fff',cursor:'pointer',appearance:'none',WebkitAppearance:'none',backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23ffffff' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",backgroundRepeat:'no-repeat',backgroundPosition:'right 12px center',backgroundSize:'10px 6px'},
                                onChange:function(e){setFromZ(e.target.value);}},
                                POPULAR_ZONES.map(function(z){return el('option',{key:z,value:z},fmtZoneName(z));}))
                        )
                    ),
                    el('div', {className:'bkbg-tzc-source-time',style:{color:a.sourceColor||'#fff'}}, srcDisplay),
                    a.showOffset && el('div', {style:{fontSize:'13px',color:a.sourceColor||'#fff',opacity:.7,marginTop:'4px'}}, fmtZoneName(fromZ) + ' · ' + srcOffset)
                ),

                // Target rows
                el('div', {style:{display:'flex',flexDirection:'column',gap:'8px'}},
                    targets.map(function(tz) {
                        var converted = getConvertedTime(isoBase, null, tz, a.use12Hour, a.showDate);
                        var offset    = getOffset(isoBase, tz);
                        return el('div', {key:tz, style:{display:'flex',alignItems:'center',justifyContent:'space-between',background:a.rowBg||'#f9fafb',border:'1.5px solid '+(a.rowBorder||'#e5e7eb'),borderRadius:(a.rowRadius||10)+'px',padding:'14px 18px',gap:'12px'}},
                            el('div', null,
                                el('div', {style:{fontSize:'13px',fontWeight:600,color:a.rowZoneColor||'#6b7280',marginBottom:'2px'}}, fmtZoneName(tz)),
                                a.showOffset && el('div', {style:{fontSize:'12px',color:a.rowZoneColor||'#9ca3af',opacity:.8}}, offset)
                            ),
                            el('div', {className:'bkbg-tzc-row-time',style:{color:a.rowTimeColor||'#1f2937'}}, converted)
                        );
                    })
                )
            )
        );
    }

    registerBlockType('blockenberg/time-zone-converter', {
        edit: function(props) {
            var a = props.attributes; var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktzc-tt-'), _tvf(a.timeTypo, '--bktzc-tm-'));
                return { style: tv };
            })());
            var colorSettings = [
                { value: a.accentColor,   onChange: function(v){set({accentColor:v});},   label: 'Accent Color' },
                { value: a.cardBg,        onChange: function(v){set({cardBg:v});},         label: 'Card Background' },
                { value: a.sourceBg,      onChange: function(v){set({sourceBg:v});},       label: 'Source Card Background' },
                { value: a.sourceColor,   onChange: function(v){set({sourceColor:v});},    label: 'Source Card Text' },
                { value: a.rowBg,         onChange: function(v){set({rowBg:v});},          label: 'Row Background' },
                { value: a.rowBorder,     onChange: function(v){set({rowBorder:v});},      label: 'Row Border' },
                { value: a.rowTimeColor,  onChange: function(v){set({rowTimeColor:v});},   label: 'Row Time Color' },
                { value: a.rowZoneColor,  onChange: function(v){set({rowZoneColor:v});},   label: 'Row Zone Label Color' },
                { value: a.labelColor,    onChange: function(v){set({labelColor:v});},     label: 'Label Color' },
                { value: a.inputBorder,   onChange: function(v){set({inputBorder:v});},    label: 'Input Border' },
                { value: a.titleColor,    onChange: function(v){set({titleColor:v});},     label: 'Title Color' },
                { value: a.subtitleColor, onChange: function(v){set({subtitleColor:v});},  label: 'Subtitle Color' },
                { value: a.sectionBg,     onChange: function(v){set({sectionBg:v});},      label: 'Section Background' }
            ];
            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, {title:'Header', initialOpen:false},
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Title',   checked:a.showTitle,   onChange:function(v){set({showTitle:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Subtitle',checked:a.showSubtitle,onChange:function(v){set({showSubtitle:v});}}),
                        el(TextControl,{label:'Title',   value:a.title,   onChange:function(v){set({title:v});}}),
                        el(TextControl,{label:'Subtitle',value:a.subtitle,onChange:function(v){set({subtitle:v});}})
                    ),
                    el(PanelBody, {title:'Time Zone Settings', initialOpen:true},
                        el(TextControl, {label:'Source Time Zone (IANA)', value:a.sourceZone,   onChange:function(v){set({sourceZone:v});}}),
                        el(TextControl, {label:'Target Zones (comma-separated IANA)', value:a.targetZones, onChange:function(v){set({targetZones:v});},
                            help:'e.g. Europe/London,Asia/Tokyo,America/Los_Angeles'}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'12-Hour Format',  checked:a.use12Hour, onChange:function(v){set({use12Hour:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show Date',        checked:a.showDate,  onChange:function(v){set({showDate:v});}}),
                        el(ToggleControl,{__nextHasNoMarginBottom:true,label:'Show UTC Offset',  checked:a.showOffset,onChange:function(v){set({showOffset:v});}})
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Title Typography', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Time Typography', 'blockenberg'),
                            value: a.timeTypo || {},
                            onChange: function (v) { set({ timeTypo: v }); }
                        })
                    ),
el(PanelColorSettings,{title:'Colors',initialOpen:false,colorSettings:colorSettings}),
                    el(PanelBody,{title:'Sizing & Layout',initialOpen:false},
                        el(RangeControl,{label:'Card Border Radius', value:a.cardRadius,   min:0, max:40, step:1,  onChange:function(v){set({cardRadius:v});}}),
                        el(RangeControl,{label:'Row Border Radius',  value:a.rowRadius,    min:0, max:24, step:1,  onChange:function(v){set({rowRadius:v});}}),
                        el(RangeControl,{label:'Max Width (px)',     value:a.maxWidth,     min:340,max:960,step:10,onChange:function(v){set({maxWidth:v});}}),
                        el(RangeControl,{label:'Padding Top (px)',   value:a.paddingTop,   min:0, max:160,step:4,  onChange:function(v){set({paddingTop:v});}}),
                        el(RangeControl,{label:'Padding Bottom (px)',value:a.paddingBottom,min:0, max:160,step:4,  onChange:function(v){set({paddingBottom:v});}})
                    )
                ),
                el('div', blockProps, el(TZPreview, {attributes:a, setAttributes:set}))
            );
        },
        save: function(props) {
            var a = props.attributes;
            var bp = wp.blockEditor.useBlockProps.save((function () {
                var tv = Object.assign({}, _tvf(a.titleTypo, '--bktzc-tt-'), _tvf(a.timeTypo, '--bktzc-tm-'));
                return { style: tv };
            })());
            return el('div', bp, el('div', {className:'bkbg-tzc-app','data-opts':JSON.stringify(a)}));
        }
    });
}() );
