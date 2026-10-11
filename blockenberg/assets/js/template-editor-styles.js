/* The editor previews the same validated typography overrides as the frontend. */
(function(){
 'use strict';
 window.bkbgTemplateEditorCSS=function(a,clientId){
  if(!/^[a-zA-Z0-9-]+$/.test(clientId||''))return '';
  var selector='[data-block="'+clientId+'"] > .bkbg-tpl-widget-container',out='';
  [['',''],['Tablet','@media(max-width:1024px)'],['Mobile','@media(max-width:767px)']].forEach(function(device){
   var rules=[];
   Object.entries({fontSize:'font-size',lineHeight:'line-height',letterSpacing:'letter-spacing',fontWeight:'font-weight',textAlign:'text-align',textColor:'color'}).forEach(function(pair){
    var key=pair[0],value=a[key+device[0]];
    if(value===undefined||value===null||value==='')return;
    if(['fontSize','lineHeight','letterSpacing','fontWeight'].includes(key)){
     if(!isFinite(Number(value)))return;
     value=key==='fontWeight'?Math.trunc(Number(value)):Number(value);
     if(key==='fontSize'||key==='letterSpacing')value+='px';
    }else if(key==='textAlign'){if(!['left','center','right','justify'].includes(value))return;}
    else if(!/^(#[a-f0-9]{3,8}|rgba?\([0-9.,%\s]+\)|[a-z]+)$/i.test(String(value)))return;
    rules.push(pair[1]+':'+value+'!important');
   });
   if(rules.length){var rule=selector+','+selector+' *{'+rules.join(';')+'}';out+=device[1]?device[1]+'{'+rule+'}':rule;}
  });
  if(a.imageWidth&&isFinite(Number(a.imageWidth)))out+=selector+' img{width:'+Math.max(1,Math.min(3000,Number(a.imageWidth)))+'px!important}';
  return out;
 };
})();
