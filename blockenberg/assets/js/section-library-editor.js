(function(){
 'use strict';
 var el=wp.element.createElement,F=wp.element.Fragment,useState=wp.element.useState,useEffect=wp.element.useEffect,useRef=wp.element.useRef;
 var be=wp.blockEditor,C=wp.components,cfg=window.bkbgSectionLibrary||{};
 function openLibrary(context){window.dispatchEvent(new CustomEvent('bkbg:section-library',{detail:context||{}}));}
 function currentPost(){var editor=wp.data.select('core/editor');var id=editor&&editor.getCurrentPostId?editor.getCurrentPostId():0;return typeof id==='number'?id:0;}
 function placement(context){
  var store=wp.data.select('core/block-editor');
  if(context.append)return {root:undefined,index:store.getBlockCount()};
  if(context.placeholder)return {placeholder:context.placeholder};
  var id=context.after||store.getSelectedBlockClientId();
  if(!context.after&&id&&store.getBlockName(id)==='blockenberg/section-library')return {placeholder:id};
  if(id&&!context.after){var parents=store.getBlockParents(id)||[];var section=parents.find(function(parent){return store.getBlockName(parent)==='blockenberg/template-section';});if(section)id=section;else{var page=parents.find(function(parent){return store.getBlockName(parent)==='blockenberg/template-page';});if(page){var path=parents.concat([id]);id=path.find(function(candidate){return store.getBlockRootClientId(candidate)===page;})||id;}}}
  var root=id?store.getBlockRootClientId(id):'';return {root:root||undefined,index:id?store.getBlockIndex(id,root)+1:store.getBlockCount(root)};
 }
 function request(action,values,signal){
  var form=new FormData();
  var body=Object.assign({action:action,_wpnonce:cfg.nonce,post_id:currentPost()},values||{});Object.keys(body).forEach(function(k){form.append(k,body[k]);});
  return fetch(cfg.ajaxUrl,{method:'POST',credentials:'same-origin',body:form,signal:signal}).then(function(r){return r.json().catch(function(){throw new Error('The library returned an unexpected response. Please try again.');});}).then(function(result){if(!result.success)throw new Error(result.data&&result.data.message||'Unable to connect to the section library. Please try again.');return result.data;});
 }
 function nativeNode(block){return {blockName:block.name,attrs:block.attributes,innerBlocks:(block.innerBlocks||[]).map(nativeNode)};}
 function createNode(node){return wp.blocks.createBlock(node.blockName,node.attrs,(node.innerBlocks||[]).map(createNode));}
 // Mount outside the scrolling content so insertion feedback stays centered in the dialog.
 function InsertionProgress(){
  var anchor=useRef(null),status=useRef(null),hostState=useState(null),host=hostState[0],setHost=hostState[1];
  wp.element.useLayoutEffect(function(){
   var frame=anchor.current&&anchor.current.closest('.components-modal__frame');if(!frame)return;
   var layer=frame.ownerDocument.createElement('div');layer.className='bkbg-section-insert-overlay';frame.appendChild(layer);setHost(layer);
   return function(){layer.remove();};
  },[]);
  wp.element.useLayoutEffect(function(){
   if(!host||!status.current)return;
   var frame=host.parentNode,doc=host.ownerDocument,previousFocus=doc.activeElement,content=frame.querySelector('.components-modal__content');
   var previousBusy=content&&content.getAttribute('aria-busy'),previousHidden=content&&content.getAttribute('aria-hidden'),previousInert=content&&content.inert;
   status.current.focus({preventScroll:true});
   if(content){content.inert=true;content.setAttribute('aria-hidden','true');content.setAttribute('aria-busy','true');}
   return function(){
    if(content){content.inert=previousInert;if(previousHidden===null)content.removeAttribute('aria-hidden');else content.setAttribute('aria-hidden',previousHidden);if(previousBusy===null)content.removeAttribute('aria-busy');else content.setAttribute('aria-busy',previousBusy);}
    if(previousFocus&&previousFocus.isConnected&&frame.isConnected)previousFocus.focus({preventScroll:true});
   };
  },[host]);
  return el(F,{},el('span',{ref:anchor,hidden:true}),host?wp.element.createPortal(el('div',{ref:status,className:'bkbg-section-insert-status',role:'status','aria-live':'polite','aria-atomic':true,tabIndex:0},
   el('span',{className:'bkbg-section-insert-spinner','aria-hidden':true}),
   el('h2',{},'Adding your section'),
   el('p',{className:'bkbg-section-insert-message'},'Preparing the layout and downloading images…'),
   el('div',{className:'bkbg-section-insert-track','aria-hidden':true},el('span',{})),
   el('p',{className:'bkbg-section-insert-help'},'Keep this window open. Your section will appear on the page when it’s ready.')
  ),host):null);
 }
 function Placeholder(props){
  var outer=be.useBlockProps({className:'bkbg-section-placeholder'});
  return el('div',outer,el('strong',{},'Blockenberg Sections'),el('p',{},'Choose a ready-made section to add here.'),el(C.Button,{variant:'primary',onClick:function(){openLibrary({placeholder:props.clientId});}},'Browse sections'));
 }
 function SectionEdit(props){
  var a=props.attributes,ref=useRef(null),outer=be.useBlockProps({ref:ref,className:'bkbg-template-page bkbg-library-section','data-bkbg-template':a.instanceKey,'data-bkbg-section':a.sectionKey});
  var inner=be.useInnerBlocksProps({className:a.sourceClasses},{renderAppender:be.InnerBlocks.ButtonBlockAppender,templateLock:false});
  useEffect(function(){
   if(!ref.current||!a.templateStyleUrl)return;
   var doc=ref.current.ownerDocument,url;
   try{url=new URL(a.templateStyleUrl,location.href);if(url.origin!==location.origin||url.pathname.indexOf('/blockenberg-library/')<0)return;}catch(e){return;}
   if(!Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).some(function(link){return link.href===url.href;})){
    var link=doc.createElement('link');link.rel='stylesheet';link.href=url.href;link.dataset.bkbgSectionStyle=a.instanceKey;doc.head.appendChild(link);
   }
  },[a.templateStyleUrl,a.instanceKey]);
  return el(F,{},el(be.BlockControls,{},el(C.ToolbarGroup,{},el(C.ToolbarButton,{icon:'plus-alt2',label:'Add another Blockenberg section',onClick:function(){openLibrary({after:props.clientId});}},'Add section'))),el(be.InspectorControls,{},el(C.PanelBody,{title:'Library section',initialOpen:true},el('p',{},a.title),el('p',{className:'components-base-control__help'},'Edit the blocks inside this section. You can move, duplicate or remove the whole section.'))),el('section',outer,el('div',inner)));
 }
 wp.blocks.registerBlockType('blockenberg/template-section',{apiVersion:3,title:'Library Section',category:'blockenberg',icon:'layout',attributes:{sectionKey:{type:'string',default:''},parentTemplateKey:{type:'string',default:''},instanceKey:{type:'string',default:''},title:{type:'string',default:''},sourceClasses:{type:'string',default:''},templateStyleUrl:{type:'string',default:''}},supports:{html:false,inserter:false,align:['wide','full'],anchor:true},edit:SectionEdit,save:function(){return el(be.InnerBlocks.Content);}});
 wp.blocks.registerBlockType('blockenberg/section-library',{apiVersion:3,title:'Blockenberg Sections',description:'Browse ready-made sections and insert one here.',category:'blockenberg',icon:'screenoptions',keywords:['section','library','template'],supports:{html:false},edit:Placeholder,save:function(){return null;}});
 // Keep editor-only controls outside BlockList; the portal never becomes a saved block.
 function BottomSectionEntry(){
  var hostState=useState(null),host=hostState[0],setHost=hostState[1];
  var mode=wp.data.useSelect(function(select){var store=select('core/editor');return store&&store.getEditorMode?store.getEditorMode():'visual';},[]);
  useEffect(function(){
   if(mode!=='visual'){setHost(null);return;}
   var active=true,target=null,canvas=null,canvasDocument=null,canvasObserver=null,frameRequest=null,ownedStyles=[];
   function schedule(){if(!active||frameRequest!==null)return;frameRequest=requestAnimationFrame(function(){frameRequest=null;scan();});}
   function releaseCanvas(){if(canvasObserver)canvasObserver.disconnect();canvasObserver=null;canvasDocument=null;if(canvas)canvas.removeEventListener('load',schedule);canvas=null;}
   function stylesheet(doc){
    if(doc===document||!cfg.editorStyleUrl||!doc.head)return;
    if(Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).some(function(link){return link.href===cfg.editorStyleUrl;}))return;
    var link=doc.createElement('link');link.rel='stylesheet';link.href=cfg.editorStyleUrl;link.dataset.bkbgSectionEntryStyle='1';doc.head.appendChild(link);ownedStyles.push(link);
   }
   function scan(){
    if(!active)return;var frame=document.querySelector('iframe[name="editor-canvas"]'),doc=document;
    if(frame!==canvas){releaseCanvas();canvas=frame;if(canvas)canvas.addEventListener('load',schedule);}
    if(canvas){try{doc=canvas.contentDocument;}catch(e){doc=null;}}
    if(doc!==canvasDocument){if(canvasObserver)canvasObserver.disconnect();canvasDocument=doc;canvasObserver=null;if(doc&&doc!==document){canvasObserver=new MutationObserver(schedule);canvasObserver.observe(doc,{childList:true,subtree:true});}}
    var root=doc&&doc.querySelector('.block-editor-block-list__layout.is-root-container');
    if(!root||!root.parentNode){if(target){target.remove();target=null;setHost(null);}return;}
    if(!target||target.ownerDocument!==doc||!target.isConnected){if(target)target.remove();target=doc.createElement('div');target.className='bkbg-section-bottom-host';target.contentEditable='false';target.dataset.bkbgSectionEntry='1';root.after(target);setHost(target);}
    else if(root.nextElementSibling!==target)root.after(target);
    stylesheet(doc);
   }
   var observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});scan();
   return function(){active=false;observer.disconnect();releaseCanvas();if(frameRequest!==null)cancelAnimationFrame(frameRequest);if(target)target.remove();ownedStyles.forEach(function(link){link.remove();});};
  },[mode]);
  if(!host||mode!=='visual')return null;
  return wp.element.createPortal(el('div',{className:'bkbg-section-bottom-area',role:'region','aria-label':'Add a Blockenberg section'},el('div',{className:'bkbg-section-bottom-copy'},el('strong',{},'Add your next section'),el('p',{},'Choose a ready-made layout from the Section Library.')),el('button',{type:'button',className:'bkbg-section-bottom-button',onClick:function(event){openLibrary({append:true,trigger:event.currentTarget});}},el('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none','aria-hidden':true},el('path',{d:'M12 5v14M5 12h14',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round'})),'Add section')),host);
 }
 function LibraryApp(){
  var editorScope=wp.editor&&wp.editor.PluginSidebar?'core':'core/edit-post';
  var legacySidebarOpen=wp.data.useSelect(function(select){var store=select('core/interface');return !!(store&&store.getActiveComplementaryArea&&store.getActiveComplementaryArea(editorScope)==='blockenberg-section-library/blockenberg-sections');},[editorScope]);
  useEffect(function(){if(!legacySidebarOpen)return;var dispatch=wp.data.dispatch('core/interface');if(dispatch&&dispatch.disableComplementaryArea)dispatch.disableComplementaryArea(editorScope);},[legacySidebarOpen,editorScope]);
  var editorMode=wp.data.useSelect(function(select){var store=select('core/editor');return store&&store.getEditorMode?store.getEditorMode():'visual';},[]);
  var copies=useRef(new Set()),copyRetry=useState(0);
  var duplicateIds=wp.data.useSelect(function(select){var seen=new Set(),duplicates=[];function visit(rows){rows.forEach(function(b){if(b.name==='blockenberg/template-section'&&b.attributes.instanceKey){if(seen.has(b.attributes.instanceKey))duplicates.push(b.clientId);else seen.add(b.attributes.instanceKey);}visit(b.innerBlocks||[]);});}visit(select('core/block-editor').getBlocks());return JSON.stringify(duplicates);},[]);
  useEffect(function(){JSON.parse(duplicateIds).forEach(function(id){if(copies.current.has(id))return;var b=wp.data.select('core/block-editor').getBlock(id);if(!b)return;copies.current.add(id);var editor=wp.data.dispatch('core/editor'),lock='bkbg-section-copy-'+id;if(editor.lockPostSaving)editor.lockPostSaving(lock);request('bkbg_duplicate_section',{block:JSON.stringify(nativeNode(b))}).then(function(result){if(wp.data.select('core/block-editor').getBlock(id)){var dispatch=wp.data.dispatch('core/block-editor');if(dispatch.__unstableMarkNextChangeAsNotPersistent)dispatch.__unstableMarkNextChangeAsNotPersistent();dispatch.replaceBlocks(id,result.blocks.map(createNode));}copies.current.delete(id);}).catch(function(e){wp.data.dispatch('core/notices').createErrorNotice('Could not prepare an independent copy: '+e.message,{type:'snackbar',actions:[{label:'Retry',onClick:function(){copies.current.delete(id);copyRetry[1](function(n){return n+1;});}}]});}).finally(function(){if(editor.unlockPostSaving)editor.unlockPostSaving(lock);});});},[duplicateIds,copyRetry[0]]);
  var opened=useState(false),isOpen=opened[0],setOpen=opened[1],searchState=useState(''),search=searchState[0],setSearch=searchState[1];
  var catState=useState(''),category=catState[0],setCategory=catState[1],collState=useState(''),collection=collState[0],setCollection=collState[1],planState=useState(''),plan=planState[0],setPlan=planState[1];
  var pageState=useState(1),page=pageState[0],setPage=pageState[1],dataState=useState(null),data=dataState[0],setData=dataState[1];
  var loadingState=useState(false),loading=loadingState[0],setLoading=loadingState[1],busyState=useState(''),busy=busyState[0],setBusy=busyState[1];
  var errorState=useState(''),error=errorState[0],setError=errorState[1],previewState=useState(null),preview=previewState[0],setPreview=previewState[1],deviceState=useState('desktop'),device=deviceState[0],setDevice=deviceState[1];
  var retryState=useState(0),retry=retryState[0],setRetry=retryState[1],keyState=useState(''),initialKey=keyState[0],setInitialKey=keyState[1];
  var context=useRef(null),focus=useRef(null),busyRef=useRef(false),previewFrame=useRef(null),errorNotice=useRef(null),resultsHeading=useRef(null),pagingTarget=useRef(null);
  useEffect(function(){if(data&&pagingTarget.current===data.page&&resultsHeading.current){pagingTarget.current=null;resultsHeading.current.scrollIntoView({block:'start'});resultsHeading.current.focus({preventScroll:true});}},[data]);
  useEffect(function(){if(isOpen&&error&&!busy&&errorNotice.current){errorNotice.current.scrollIntoView({block:'center'});errorNotice.current.focus({preventScroll:true});}},[isOpen,error,busy,preview]);
  useEffect(function(){function message(event){if(event.origin==='https://templates.blockenberg.com'&&previewFrame.current&&event.source===previewFrame.current.contentWindow&&event.data&&event.data.type==='bkbg-template-preview:escape'&&!busyRef.current)setPreview(null);}window.addEventListener('message',message);return function(){window.removeEventListener('message',message);};},[]);
  useEffect(function(){function show(event){if(busyRef.current)return;context.current=placement(event.detail||{});focus.current=event.detail&&event.detail.trigger||document.activeElement;setOpen(true);setPreview(null);setError('');setPage(1);setInitialKey(event.detail&&event.detail.key||'');if(event.detail&&event.detail.key){setSearch('');setCategory('');setCollection('');setPlan('');}}
   window.addEventListener('bkbg:section-library',show);var timer;
   if(cfg.initialKey){timer=setTimeout(function(){openLibrary({key:cfg.initialKey});},250);}
   return function(){window.removeEventListener('bkbg:section-library',show);clearTimeout(timer);};
  },[]);
  var seenPlaceholders=useRef(new Set());
  var placeholderIds=wp.data.useSelect(function(select){var ids=[];function visit(rows){rows.forEach(function(b){if(b.name==='blockenberg/section-library')ids.push(b.clientId);visit(b.innerBlocks||[]);});}visit(select('core/block-editor').getBlocks());return JSON.stringify(ids);},[]);
  useEffect(function(){var fresh=JSON.parse(placeholderIds).filter(function(id){if(seenPlaceholders.current.has(id))return false;seenPlaceholders.current.add(id);return true;});if(!fresh.length)return;var timer=setTimeout(function(){openLibrary({placeholder:fresh[fresh.length-1]});},30);return function(){clearTimeout(timer);};},[placeholderIds]);
  useEffect(function(){
   if(!isOpen)return;var controller=new AbortController(),timer=setTimeout(function(){setLoading(true);setError('');request('bkbg_section_search',{s:search,category:category,collection:collection,plan:plan,paged:page,key:initialKey},controller.signal).then(function(result){setData(result);setLoading(false);}).catch(function(e){if(e.name!=='AbortError'){setError(e.message);setLoading(false);}});},180);
   return function(){clearTimeout(timer);controller.abort();};
  },[isOpen,search,category,collection,plan,page,retry,initialKey]);
  function filter(setter,value){pagingTarget.current=null;setter(value);setPage(1);setInitialKey('');}
  function changePage(next){if(loading||busy||!data||next===data.page)return;pagingTarget.current=next;setLoading(true);setPage(next);}
  function pageNumbers(total,current){var numbers=[];for(var n=1;n<=total;n++){if(n===1||n===total||Math.abs(n-current)<=1){if(numbers.length&&n-numbers[numbers.length-1]>1)numbers.push('gap-'+n);numbers.push(n);}}return numbers;}
  function close(){if(busyRef.current)return;setOpen(false);setPreview(null);setError('');if(focus.current&&focus.current.isConnected)focus.current.focus();}
  function insert(entry){
   if(busyRef.current)return;if(!currentPost()){setPreview(null);setError('Save a draft before inserting a section.');return;}
   busyRef.current=true;setBusy(entry.key);setError('');
   request('bkbg_insert_section',{key:entry.key}).then(function(result){
    var blocks=result.blocks.map(createNode),dispatch=wp.data.dispatch('core/block-editor'),target=context.current||placement({});
    if(target.placeholder&&wp.data.select('core/block-editor').getBlock(target.placeholder))dispatch.replaceBlocks(target.placeholder,blocks);
    else dispatch.insertBlocks(blocks,target.index,target.root);
    if(wp.data.dispatch('core/notices'))wp.data.dispatch('core/notices').createSuccessNotice('Section added. Edit its blocks, then save your changes.',{type:'snackbar'});
    busyRef.current=false;setBusy('');close();
   }).catch(function(e){busyRef.current=false;setBusy('');setPreview(null);setError(e.message);});
  }
  function selectOptions(values,all){return [{label:all,value:''}].concat(Object.keys(values||{}).map(function(key){return {label:values[key],value:key};}));}
  var libraryContent=el('div',{className:'bkbg-section-library-body'},
   el('div',{className:'bkbg-section-library-filters'},el('div',{className:'bkbg-section-library-search'},el('span',{className:'bkbg-section-library-filter-label','aria-hidden':true},'Search'),el(C.SearchControl,{label:'Search sections',placeholder:'Search by content, purpose or style…',value:search,__nextHasNoMarginBottom:true,onChange:function(v){filter(setSearch,v);}})),el(C.SelectControl,{label:'Section type',value:category,options:selectOptions(data&&data.categories,'All section types'),onChange:function(v){filter(setCategory,v);}}),el(C.SelectControl,{label:'Collection',value:collection,options:selectOptions(data&&data.collections,'All collections'),onChange:function(v){filter(setCollection,v);}}),el(C.SelectControl,{label:'Access',value:plan,options:[{label:'All sections',value:''},{label:'Free',value:'free'},{label:'Pro',value:'premium'}],onChange:function(v){filter(setPlan,v);}})),
   error?el('div',{ref:errorNotice,tabIndex:-1},el(C.Notice,{status:'error',isDismissible:false},error,el(C.Button,{variant:'link',onClick:function(){setRetry(retry+1);}},'Retry'))):null,
   el('div',{className:'bkbg-section-library-results','aria-busy':loading||!!busy},loading?el('div',{className:'bkbg-section-library-loading',role:'status'},el(C.Spinner,{}),'Loading sections…'):null,
    data?el('p',{ref:resultsHeading,tabIndex:-1,className:'bkbg-section-library-count'},data.total.toLocaleString()+(data.total===1?' section':' sections')+' · Page '+data.page+' of '+data.pages):null,
    data&&data.entries.length?el('div',{className:'bkbg-section-library-grid'},data.entries.map(function(entry){return el('article',{key:entry.key,className:'bkbg-section-library-card'},el('button',{type:'button',className:'bkbg-section-library-thumb',onClick:function(){setPreview(entry);setDevice('desktop');},disabled:loading||!!busy,'aria-label':'Preview '+entry.title},el('img',{src:entry.thumbnail,alt:'',loading:'lazy'}),el('span',{className:'bkbg-section-library-plan '+(entry.plan==='free'?'is-free':'')},entry.plan==='free'?'FREE':'PRO')),el('div',{className:'bkbg-section-library-card-body'},el('small',{},data.categories[entry.category]+' · '+entry.parentTitle),el('h3',{},entry.title),el('p',{},entry.description),el('div',{className:'bkbg-section-library-tags'},entry.tags.slice(0,4).map(function(tag){return el('button',{key:tag,type:'button',onClick:function(){filter(setSearch,tag);}},tag);})),el('div',{className:'bkbg-section-library-card-actions'},el(C.Button,{variant:'secondary',disabled:loading||!!busy,onClick:function(){setPreview(entry);setDevice('desktop');}},'Preview'),entry.locked?el(C.Button,{variant:'primary',href:cfg.upgradeUrl,target:'_blank',rel:'noopener noreferrer'},'Unlock Pro ↗'):el(C.Button,{variant:'primary',disabled:loading||!!busy,onClick:function(){insert(entry);}},'Insert section'))));})):data&&!loading?el('div',{className:'bkbg-section-library-empty'},el('h3',{},'No matching sections'),el('p',{},'Try another search or clear your filters.'),el(C.Button,{variant:'secondary',onClick:function(){setSearch('');setCategory('');setCollection('');setPlan('');setInitialKey('');setPage(1);}},'Reset filters')):null,
    data&&data.pages>1?el('nav',{className:'bkbg-section-library-pagination','aria-label':'Section library pages'},
     el(C.Button,{variant:'secondary',disabled:data.page<=1||loading||!!busy,onClick:function(){changePage(data.page-1);},'aria-label':'Previous page'},'←'),
     pageNumbers(data.pages,data.page).map(function(number){return typeof number==='string'?el('span',{key:number,className:'bkbg-section-library-page-gap','aria-hidden':true},'…'):el(C.Button,{key:number,variant:'secondary',className:number===data.page?'is-current':'',disabled:loading||!!busy,'aria-label':'Page '+number,'aria-current':number===data.page?'page':undefined,onClick:function(){changePage(number);}},String(number));}),
     el(C.Button,{variant:'secondary',disabled:data.page>=data.pages||loading||!!busy,onClick:function(){changePage(data.page+1);},'aria-label':'Next page'},'→')
    ):null));
  var previewContent=preview?el(F,{},el('div',{className:'bkbg-section-preview-toolbar'},['desktop','tablet','mobile'].map(function(name){return el(C.Button,{key:name,variant:device===name?'primary':'secondary',onClick:function(){setDevice(name);},'aria-pressed':device===name},name.charAt(0).toUpperCase()+name.slice(1));}),preview.locked?el(C.Button,{variant:'primary',href:cfg.upgradeUrl,target:'_blank',rel:'noopener noreferrer'},'Unlock Pro ↗'):el(C.Button,{variant:'primary',disabled:loading||!!busy,onClick:function(){insert(preview);}},busy?'Preparing…':'Insert section')),el('div',{className:'bkbg-section-preview-stage'},el('iframe',{ref:previewFrame,src:preview.previewUrl,title:preview.title+' preview',sandbox:'allow-scripts allow-same-origin allow-forms',referrerPolicy:'strict-origin-when-cross-origin',style:{width:device==='desktop'?'100%':device==='tablet'?'768px':'375px'}}))) :null;
  var editorUI=wp.editor||{},postUI=wp.editPost||{},Menu=editorUI.PluginMoreMenuItem||postUI.PluginMoreMenuItem;
  var scope=editorUI.PluginSidebar?'core':'core/edit-post';
  return el(F,{},el(C.Fill,{name:'PinnedItems/'+scope},el(C.Button,{icon:'screenoptions',className:'bkbg-section-header-button',disabled:editorMode!=='visual',label:'Browse Blockenberg sections',onClick:function(event){openLibrary({trigger:event.currentTarget});}},el('span',{className:'bkbg-section-header-label'},'Sections'))),el(BottomSectionEntry,{}),Menu?el(Menu,{icon:'screenoptions',disabled:editorMode!=='visual',onClick:function(){openLibrary({});}},'Blockenberg Sections'):null,isOpen?el(C.Modal,{key:preview?'section-preview':'section-library',title:preview?preview.title:'Blockenberg Sections',headerActions:preview?null:el('p',{id:'bkbg-section-library-description',className:'bkbg-section-library-description'},'Find a section, preview it and add it to your page.'),aria:preview?{}:{describedby:'bkbg-section-library-description'},className:preview?'bkbg-section-preview-modal':'bkbg-section-library-modal',onRequestClose:function(){if(busyRef.current)return;if(preview)setPreview(null);else close();},shouldCloseOnClickOutside:!busy,shouldCloseOnEsc:!busy},preview?previewContent:libraryContent,busy?el(InsertionProgress,{}):null):null);
 }
 wp.plugins.registerPlugin('blockenberg-section-library',{render:LibraryApp,icon:'screenoptions'});
})();
