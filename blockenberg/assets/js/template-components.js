/* Typed template component editor; no markup serialization or HTML controls. */
(function () {
 'use strict';
 var el=wp.element.createElement,be=wp.blockEditor,co=wp.components;
 var tags='div span p a img h1 h2 h3 h4 h5 h6 section article aside header footer nav main ul ol li dl dt dd figure figcaption blockquote strong b em i u s small br hr button details summary video audio source iframe table thead tbody tfoot tr th td time label input form textarea select option progress meter svg g path circle ellipse rect line polyline polygon title desc defs clipPath mask use textPath text tspan linearGradient radialGradient stop pattern'.split(' ');
 var allowed='class style id title role tabindex href src srcset sizes poster alt width height loading decoding fetchpriority placeholder required rows cols maxlength minlength autocomplete target type name value disabled checked controls autoplay muted loop playsinline preload allow allowfullscreen frameborder referrerpolicy open datetime colspan rowspan scope for max min step viewBox d fill stroke stroke-width stroke-linecap stroke-linejoin fill-rule clip-rule opacity transform cx cy r rx ry x y x1 y1 x2 y2 points preserveAspectRatio xmlns pathLength pathlength startOffset text-anchor gradientUnits gradientTransform offset stop-color stop-opacity font-family fontfamily font-size font-weight letter-spacing dominant-baseline textLength lengthAdjust patternUnits patternContentUnits patternTransform clip-path mask xlink:href'.split(' ');
 var booleans='required disabled checked controls autoplay muted loop playsinline allowfullscreen open'.split(' ');
 var propNames={srcset:'srcSet',class:'className',tabindex:'tabIndex',viewBox:'viewBox','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','fill-rule':'fillRule','clip-rule':'clipRule',allowfullscreen:'allowFullScreen',playsinline:'playsInline',autoplay:'autoPlay',frameborder:'frameBorder',referrerpolicy:'referrerPolicy',colspan:'colSpan',rowspan:'rowSpan',datetime:'dateTime',for:'htmlFor',fetchpriority:'fetchPriority','text-anchor':'textAnchor','stop-color':'stopColor','stop-opacity':'stopOpacity','font-family':'fontFamily',fontfamily:'fontFamily','font-size':'fontSize','font-weight':'fontWeight','letter-spacing':'letterSpacing','dominant-baseline':'dominantBaseline','clip-path':'clipPath','xlink:href':'xlinkHref',pathlength:'pathLength'};
 function url(v,iframe){v=String(v||'').trim();if(iframe)return /^https:\/\/[^/\s]+(?:\/|$)/i.test(v)?v:'';return /^(?:https?:|mailto:|tel:|#|\/|\.\.?\/)/i.test(v)||(!/^[^/]*:/.test(v)&&!/^\s*(?:javascript|data|vbscript)/i.test(v))?v:'';}
 function safeAttrs(source,fields,tag,prefix,ids){var out={};Object.keys(source||{}).forEach(function(k){if(allowed.indexOf(k)<0&&!/^(aria|data)-[a-z0-9_-]+$/.test(k))return;var v=source[k];if(v&&typeof v==='object'){var f=fields[v.field]||{};v=f.type==='image'&&k==='src'?(f.image||{}).src||f.value:f.value;}if(v===undefined||v===null||typeof v==='object')return;if(k.indexOf('aria-')===0&&typeof v==='boolean')v=v?'true':'false';var presence=v!==false;v=String(v);
 if(k==='style'){var css={};v.split(';').forEach(function(rule){var i=rule.indexOf(':');if(i<1)return;var name=rule.slice(0,i).trim(),value=rule.slice(i+1).trim();if(!/^(?:--[a-zA-Z0-9_-]+|[a-zA-Z-]+)$/.test(name)||/[<>\\]|(?:url|expression|@import|javascript|behavior)\s*[:(]/i.test(value))return;css[name.indexOf('--')===0?name:name.replace(/-([a-z])/g,function(_,c){return c.toUpperCase();})]=value;});out.style=css;return;}
 if(k==='class'||k.indexOf('data-')===0){k=k.replace(/elementor/g,'bkbg-tpl').replace(/king-addons/g,'bkbg-catalog').replace(/wpcf7/g,'bkbg-tpl-cf7');v=v.replace(/elementor/g,'bkbg-tpl').replace(/king-addons/g,'bkbg-catalog').replace(/wpcf7/g,'bkbg-tpl-cf7');}
 if(['href','xlink:href','src','poster','data-json-url'].indexOf(k)>=0)v=url(v,tag==='iframe'&&k==='src');
 if(k==='id'){out['data-bkbg-style-id']=v.replace(/elementor/g,'bkbg-tpl').replace(/king-addons/g,'bkbg-catalog').replace(/wpcf7/g,'bkbg-tpl-cf7');v=prefix+v.replace(/[^a-zA-Z0-9_-]/g,'');}
 if(['href','xlink:href'].indexOf(k)>=0&&v[0]==='#'&&ids[v.slice(1)])v='#'+prefix+v.slice(1).replace(/[^a-zA-Z0-9_-]/g,'');
 if(['for','aria-controls','aria-labelledby','aria-describedby'].indexOf(k)>=0)v=v.split(/\s+/).map(function(x){return ids[x]?prefix+x.replace(/[^a-zA-Z0-9_-]/g,''):x;}).join(' ');
 if(k==='target'&&['_blank','_self'].indexOf(v)<0)return;
 if(['fill','stroke','clip-path','mask'].indexOf(k)>=0){var m=v.match(/^url\(#([a-zA-Z0-9_-]+)\)$/);if(m)v='url(#'+(ids[m[1]]?prefix:'')+m[1]+')';else if(!/^(none|currentColor|transparent|[a-zA-Z]+|#[a-fA-F0-9]{3,8}|rgba?\([0-9.,%\s]+\))$/.test(v))return;}
 if(booleans.indexOf(k)>=0)v=presence;out[propNames[k]||k]=v;});
 if(tag==='form')out.onSubmit=function(e){e.preventDefault();};
 if(tag==='a'){out.rel='noopener noreferrer';out.onClick=function(e){e.preventDefault();};}
 if(tag==='iframe'){out.sandbox='allow-scripts allow-same-origin allow-presentation';out.tabIndex=-1;}
 return out;}
 function edit(props){var a=props.attributes,fields={},family=props.name.replace('blockenberg/template-',''),prefix='bkbg-editor-'+props.clientId+'-';
 (a.fields||[]).forEach(function(f){fields[f.id]=Object.assign({},f);});
 if(a.behavior&&a.behavior.targetField&&fields[a.behavior.targetField])fields[a.behavior.targetField].value=String(a.behavior.target);
 var ids=Object.create(null),svgFields=Object.create(null),styledTitleFields=Object.create(null),videoDialog=wp.element.useState(false);
 var collections=window.bkbgTemplateCollections?window.bkbgTemplateCollections.groups(a):[],hasCarousel=collections.length>0;
 var carouselRef=wp.element.useRef(null),carouselPositions=wp.element.useRef({}),carouselInstance=wp.element.useRef(null),pendingReveal=wp.element.useRef(null);
 collections.forEach(function(group){group.items.forEach(function(item){item.fields.forEach(function(f){if(fields[f.id])fields[f.id].label=f.label;});});});
 var openItem=wp.element.useState(null),playing=wp.element.useState(false),pauseRef=wp.element.useRef(true);
 pauseRef.current=!!props.isSelected&&!playing[0];
 wp.element.useLayoutEffect(function(){
  if(!hasCarousel||!carouselRef.current||!window.bkbgTemplateCarouselEditor)return;
  var instance=window.bkbgTemplateCarouselEditor(carouselRef.current,a.behavior,carouselPositions.current,function(){return pauseRef.current;});
  carouselInstance.current=instance;
  if(pendingReveal.current){var target=pendingReveal.current;instance.controllers[target.track]?.reveal(target.item);pendingReveal.current=null;}
  return function(){instance.destroy();if(carouselInstance.current===instance)carouselInstance.current=null;};
 },[hasCarousel,a.behavior,a.tree,a.fields,props.isSelected,playing[0]]);
 function reveal(track,item){playing[1](false);carouselInstance.current?.controllers[track]?.reveal(item);}
 function collectionChange(group,track,operation,index){
  playing[1](false);
  var patch=window.bkbgTemplateCollections.change(a,group.path,operation,index);
  if(!patch)return;
  var next=window.bkbgTemplateCollections.groups(Object.assign({},a,patch))[track];
  var target=operation==='add'?next.items.length-1:operation==='duplicate'?index+1:operation==='up'?index-1:operation==='down'?index+1:Math.min(index,next.items.length-1);
  openItem[1](next.items[target]?track+':'+next.items[target].key:null);
  pendingReveal.current={track:track,item:Math.max(0,target)};
  props.setAttributes(patch);
 }
 function scan(tree,inSvg,depth){if(depth>64)return;(tree||[]).forEach(function(n){if(!n)return;var svg=inSvg||n.tag==='svg',id=(n.attrs||{}).id;if(n.field&&/(?:^|\s)bkbg-catalog-title-wrap(?:\s|$)/.test((n.attrs||{}).class||''))styledTitleFields[n.field]=true;if(id&&typeof id==='object')id=(fields[id.field]||{}).value;if(id!==undefined&&id!==null)ids[String(id)]=true;if(svg&&n.field)svgFields[n.field]=true;scan(n.children,svg,depth+1);});}scan(a.tree,false,0);
 function plain(v){return String(v||'').replace(/<[^>]*>/g,'');}
 function plainHTML(v){return String(v||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
 function plainContent(v){var holder=document.createElement('div');holder.innerHTML=String(v||'').replace(/<br\s*\/?>/gi,'\n');return holder.textContent||'';}
 function titleContent(v){return String(v||'').replace(/^<span\b[^>]*class=["']bkbg-catalog-title["'][^>]*>([\s\S]*)<\/span>$/i,'$1');}
 function update(id,patch){playing[1](false);if(styledTitleFields[id]&&patch.value!==undefined)patch=Object.assign({},patch,{value:'<span class="bkbg-catalog-title">'+titleContent(patch.value)+'</span>'});if(a.behavior&&a.behavior.targetField===id&&patch.value!==undefined)props.setAttributes({behavior:Object.assign({},a.behavior,{target:Number(patch.value)||0})});props.setAttributes({fields:(a.fields||[]).map(function(f){return f.id===id?Object.assign({},f,patch):f;})});}
 function imageControl(f,key){var im=f.image||{};return el(be.MediaUploadCheck,{key:key||f.id},el(be.MediaUpload,{allowedTypes:['image'],value:im.id||0,onSelect:function(m){update(f.id,{value:m.url,image:{src:m.url,alt:m.alt||'',width:m.width,height:m.height,id:m.id}});},render:function(o){return el(co.Button,{variant:'secondary',onClick:o.open},'Replace '+(f.label||'image'));}}));}
 function node(n,key,depth,inSvg){if(!n||depth>64)return null;if(Object.prototype.hasOwnProperty.call(n,'text'))return String(n.text);if(n.tag===null&&fields[n.field]){var standalone=fields[n.field];if(inSvg)return plain(standalone.value);return el(be.RichText,{key:key,tagName:'span','data-bkbg-editor-field':standalone.id,allowedFormats:standalone.type==='richtext'?['core/bold','core/italic','core/link']:[],value:standalone.type==='richtext'?String(standalone.value||''):plainHTML(standalone.value),onChange:function(v){update(standalone.id,{value:standalone.type==='richtext'?v:plainContent(v)});},'aria-label':standalone.label||standalone.id});}if(tags.indexOf(n.tag)<0)return null;
 var tag=n.tag,f=fields[n.field],svg=inSvg||tag==='svg',attrs=Object.assign({},n.attrs);if(['input','textarea','select'].includes(tag)&&attrs.required!==undefined)attrs['aria-required']=attrs.required;var p=safeAttrs(attrs,fields,tag,prefix,ids);p.key=attrs['data-bkbg-item-id']||key;if(f)p['data-bkbg-editor-field']=f.id;
 if(tag==='img'&&f&&f.type==='image'){delete p.srcSet;delete p.sizes;['src','srcset','sizes','alt','width','height'].forEach(function(k){if((f.image||{})[k]!==undefined)p[k==='srcset'?'srcSet':k]=k==='src'?url(f.image[k]):f.image[k];});if(!p.src)p.src=url(f.value)||window.bkbgTemplateImagePlaceholder;return el('img',p);}
 if(f&&svg)return el(tag,p,plain(f.value));
 if(f&&f.type==='richtext'&&styledTitleFields[f.id])return el(tag,p,el(be.RichText,{tagName:'span',className:'bkbg-catalog-title','data-bkbg-editor-field':f.id,value:titleContent(f.value),onChange:function(v){update(f.id,{value:v});},allowedFormats:['core/bold','core/italic','core/link'],placeholder:f.label||'Title…'}));
 if(f&&f.type==='richtext'){return el(be.RichText,Object.assign({},p,{tagName:tag,value:f.value||'',onChange:function(v){update(f.id,{value:v});},allowedFormats:['core/bold','core/italic','core/link','core/strikethrough'],placeholder:f.label||'Text…'}));}
 if(f&&['text','number'].indexOf(f.type)>=0)return el(be.RichText,Object.assign({},p,{tagName:tag,allowedFormats:[],value:plainHTML(f.value),onChange:function(v){update(f.id,{value:plainContent(v)});},'aria-label':f.label||f.id}));
 if(tag==='input'&&p.value!==undefined&&!['submit','button','reset','hidden'].includes(p.type)){p.readOnly=true;}
 if(['img','br','hr','input','source'].indexOf(tag)>=0)return el(tag,p);
 return el(tag,p,f?String(f.value||''):(n.children||[]).map(function(c,i){return node(c,key+'-'+i,depth+1,svg);}));}
 function fieldControl(f){var label=f.label||f.id;if(f.type==='boolean')return el(co.ToggleControl,{key:f.id,label:label,checked:!!f.value,onChange:function(v){update(f.id,{value:v});}});if(f.type==='image')return el('div',{key:f.id,className:'bkbg-template-item-image'},el('img',{src:(f.image||{}).src||window.bkbgTemplateImagePlaceholder,alt:''}),imageControl(f),el(co.TextControl,{label:label+' alternative text',value:(f.image||{}).alt||'',onChange:function(v){update(f.id,{image:Object.assign({},f.image,{alt:v})});}}));
 if(svgFields[f.id])return el(co.TextControl,{key:f.id,label:label,value:plain(f.value),onChange:function(v){update(f.id,{value:v});}});
 if(f.type==='richtext')return el('div',{key:f.id,className:'bkbg-template-inspector-richtext'},el('label',{},label),el(be.RichText,{tagName:'div',value:styledTitleFields[f.id]?titleContent(f.value):f.value||'',onChange:function(v){update(f.id,{value:v});},'aria-label':label,allowedFormats:['core/bold','core/italic','core/link']}));
 return el(co.TextControl,{key:f.id,label:label,type:f.type==='number'?'number':f.type==='url'?'url':'text',value:f.value||'',onChange:function(v){update(f.id,{value:v});}})}
 var groupedFields={};collections.forEach(function(g){g.items.forEach(function(item){item.fields.forEach(function(f){groupedFields[f.id]=true;});});});
 var controls=(a.fields||[]).filter(function(f){return !groupedFields[f.id];}).map(fieldControl);
 var itemWord=/image-carousel/.test(a.kind)?'Image':/testimonial/.test(a.kind)?'Testimonial':family==='blog'?'Post':family==='timeline'?'Event':'Card';
 var collectionControls=collections.map(function(group,track){
  return el(co.PanelBody,{key:'collection-'+track,title:itemWord+'s ('+group.items.length+')',initialOpen:true},
   group.items.map(function(item,index){var identity=track+':'+item.key;return el(co.PanelBody,{key:item.key,title:itemWord+' '+(index+1)+(item.title?' · '+item.title:''),opened:openItem[0]===identity,onToggle:function(open){openItem[1](open?identity:null);if(open)reveal(track,index);}},
    el('div',{className:'bkbg-template-item-actions'},
     el(co.Button,{variant:'secondary',label:'Move '+itemWord.toLowerCase()+' '+(index+1)+' up',disabled:index===0,onClick:function(){collectionChange(group,track,'up',index);}},'↑'),
     el(co.Button,{variant:'secondary',label:'Move '+itemWord.toLowerCase()+' '+(index+1)+' down',disabled:index===group.items.length-1,onClick:function(){collectionChange(group,track,'down',index);}},'↓'),
     el(co.Button,{variant:'secondary',onClick:function(){collectionChange(group,track,'duplicate',index);}},'Duplicate'),
     el(co.Button,{variant:'tertiary',isDestructive:true,label:'Remove '+itemWord.toLowerCase()+' '+(index+1),onClick:function(){collectionChange(group,track,'remove',index);}},'Remove')),
    item.fields.map(fieldControl));}),
   el(co.Button,{variant:'primary',onClick:function(){collectionChange(group,track,'add',Math.max(0,group.items.length-1));}},'Add '+itemWord.toLowerCase()));
 });
 var specs={counter:[['start','Start value','number'],['target','Target value','number'],['duration','Duration (ms)','number']],accordion:[['accordionMultiple','Allow multiple open items','boolean'],['initialOpen','Initially open item (-1 = none)','number']],carousel:[['autoplay','Autoplay','boolean'],['delay','Delay (ms)','number'],['loop','Loop','boolean'],['carouselSlides','Visible slides (desktop)','number'],['carouselSlidesTablet','Visible slides (tablet)','number'],['carouselSlidesMobile','Visible slides (mobile)','number'],['speed','Transition speed (ms)','number'],['carouselGap','Slide gap (desktop)','number'],['carouselGapTablet','Slide gap (tablet)','number'],['carouselGapMobile','Slide gap (mobile)','number']]};
 var behavior=(hasCarousel?specs.carousel:specs[family]||[]).map(function(s){var b=a.behavior||{},p={key:s[0],label:s[1],onChange:function(v){var next=Object.assign({},b);if(s[2]==='number'){if(v===''){delete next[s[0]];}else if(isFinite(Number(v)))next[s[0]]=Number(v);}else next[s[0]]=v;props.setAttributes({behavior:next});}};return s[2]==='boolean'?el(co.ToggleControl,Object.assign(p,{checked:!!b[s[0]],help:hasCarousel&&s[0]==='autoplay'?'Autoplay pauses while editing. Use Preview autoplay in the block toolbar to play it.':undefined})):el(co.TextControl,Object.assign(p,{type:'number',value:b[s[0]]===undefined?'':b[s[0]]}));});
 if(family==='form')['subject','successMessage','errorMessage'].forEach(function(k){behavior.push(el(co.TextControl,{key:k,label:k,value:(a.behavior||{})[k]||'',onChange:function(v){var b=Object.assign({},a.behavior);b[k]=v;props.setAttributes({behavior:b});}}));});
 if(family==='video')behavior.push(el(co.Button,{key:'videoUrl',variant:'secondary',onClick:function(){videoDialog[1](true);}},'Edit video source URL'),videoDialog[0]?el(co.Modal,{key:'video-dialog',title:'Video source URL',onRequestClose:function(){videoDialog[1](false);}},el(co.TextControl,{label:'Source URL',type:'url',value:(a.behavior||{}).videoUrl||'',onChange:function(v){props.setAttributes({behavior:Object.assign({},a.behavior,{videoUrl:v})});}}),el(co.Button,{variant:'primary',onClick:function(){videoDialog[1](false);}},'Done')):null);
 var typography=['','Tablet','Mobile'].map(function(s){return el('div',{key:s},el('strong',{},s||'Desktop'),['fontSize','lineHeight','letterSpacing','textColor','textAlign','fontWeight'].map(function(k){return el(co.TextControl,{key:k,label:k.replace(/([A-Z])/g,' $1'),value:a[k+s]||'',onChange:function(v){var patch={};patch[k+s]=v;props.setAttributes(patch);},help:'Leave empty to preserve the source design.'});}));});
 var style={};['fontSize','letterSpacing','lineHeight','fontWeight','textAlign'].forEach(function(k){if(a[k])style[k]=['fontSize','letterSpacing'].indexOf(k)>=0?Number(a[k]):a[k];});if(a.textColor)style.color=a.textColor;
 var circular=(a.kind==='text-path'&&((a.sourceSettings||((a.behavior||{}).sourceSettings)||{}).path==='circle'));
 var outer=be.useBlockProps({className:(a.classes||'')+(circular?' bkbg-template-circular-text':''),'data-bkbg-id':a.uid,'data-bkbg-component':family,'data-bkbg-kind':a.kind,ref:carouselRef});
 return el(wp.element.Fragment,{},
  el(be.InspectorControls,{},collectionControls,controls.length?el(co.PanelBody,{title:'Component fields',initialOpen:!hasCarousel},controls):null,behavior.length?el(co.PanelBody,{title:'Behavior',initialOpen:false},behavior):null,el(co.PanelBody,{title:'Typography overrides',initialOpen:false},typography)),
  hasCarousel?el(be.BlockControls,{},el(co.ToolbarGroup,{},el(co.ToolbarButton,{icon:'arrow-left-alt2',label:'Previous slide',onClick:function(){carouselInstance.current?.controllers[0]?.previous();}}),el(co.ToolbarButton,{icon:'arrow-right-alt2',label:'Next slide',onClick:function(){carouselInstance.current?.controllers[0]?.next();}}),(a.behavior||{}).autoplay?el(co.ToolbarButton,{icon:playing[0]?'controls-pause':'controls-play',label:playing[0]?'Pause autoplay preview':'Preview autoplay',isPressed:playing[0],onClick:function(){playing[1](!playing[0]);}}):null)):null,
  el('div',outer,el('div',{className:'bkbg-tpl-widget-container',style:style},(a.tree||[]).map(function(n,i){return node(n,String(i),0);})),el('style',{},window.bkbgTemplateEditorCSS(a,props.clientId))));
 }
 Object.keys(window.bkbgTemplateComponents||{}).forEach(function(name){var m=window.bkbgTemplateComponents[name];if(wp.blocks.getBlockType(name))return;wp.blocks.registerBlockType(name,{apiVersion:3,title:m.title,description:m.description,category:m.category,icon:m.icon,attributes:m.attributes,supports:m.supports,edit:edit,save:function(){return null;}});});
})();
