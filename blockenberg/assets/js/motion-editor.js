(function(){
    'use strict';
    var el=wp.element.createElement, C=wp.components;
    var defs={bkbgRotate:{type:'boolean',default:false},bkbgRotateDuration:{type:'number',default:8},bkbgRotateDelay:{type:'number',default:0},bkbgEntrance:{type:'string',default:''},bkbgEntranceDuration:{type:'number',default:0.8},bkbgEntranceDelay:{type:'number',default:0},bkbgEntranceOnce:{type:'boolean',default:true},bkbgFloat:{type:'boolean',default:false},bkbgFloatX:{type:'number',default:0},bkbgFloatY:{type:'number',default:-20},bkbgFloatDuration:{type:'number',default:6},bkbgFloatDelay:{type:'number',default:0}};
    wp.hooks.addFilter('blocks.registerBlockType','blockenberg/motion-attributes',function(s,n){if(n.indexOf('blockenberg/')===0)s.attributes=Object.assign({},s.attributes,defs);return s;});
    window.bkbgMotionPanel=function(props){
        var a=props.attributes,set=props.setAttributes;
        function update(k,v){var x={};x[k]=v;set(x);}
        function range(k,label,min,max,step){return el(C.RangeControl,{label:label,value:a[k],min:min,max:max,step:step||1,onChange:function(v){update(k,v);}});}
        return el(C.PanelBody,{title:'Motion & Animation',initialOpen:false,className:'bkbg-adv-panel'},
            el(C.SelectControl,{label:'Entrance animation',value:a.bkbgEntrance||'',options:[{label:'None',value:''},{label:'Fade in',value:'fadeIn'},{label:'Fade in up',value:'fadeInUp'},{label:'Fade in down',value:'fadeInDown'},{label:'Fade in left',value:'fadeInLeft'},{label:'Fade in right',value:'fadeInRight'},{label:'Zoom in',value:'zoomIn'}],onChange:function(v){update('bkbgEntrance',v);}}),
            a.bkbgEntrance&&el(wp.element.Fragment,{},range('bkbgEntranceDuration','Entrance duration (seconds)',0.05,5,0.05),range('bkbgEntranceDelay','Entrance delay (seconds)',0,5,0.1),el(C.ToggleControl,{label:'Animate only once',checked:a.bkbgEntranceOnce,onChange:function(v){update('bkbgEntranceOnce',v);}})),
            el(C.ToggleControl,{label:'Floating animation',checked:!!a.bkbgFloat,onChange:function(v){update('bkbgFloat',v);}}),
            a.bkbgFloat&&el(wp.element.Fragment,{},range('bkbgFloatX','Horizontal movement (px)',-100,100),range('bkbgFloatY','Vertical movement (px)',-100,100),range('bkbgFloatDuration','Floating duration (seconds)',0.5,20,0.5),range('bkbgFloatDelay','Floating delay (seconds)',0,10,0.5)),
            el(C.ToggleControl,{label:'Rotation animation',checked:!!a.bkbgRotate,onChange:function(v){update('bkbgRotate',v);}}),
            a.bkbgRotate&&el(wp.element.Fragment,{},range('bkbgRotateDuration','Rotation duration (seconds)',.5,60,.5),range('bkbgRotateDelay','Rotation delay (seconds)',0,10,.5)),
            el('p',{className:'components-base-control__help'},'Motion is disabled for visitors who prefer reduced motion. Content remains visible without JavaScript.')
        );
    };
})();
