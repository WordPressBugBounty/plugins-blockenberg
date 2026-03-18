( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button } = window.wp.components;
  var { __ } = window.wp.i18n;

  var _tc; function getTypoControl(){ return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars(){ return _tv || (_tv = window.bkbgTypoCssVars); }

  var LAYOUTS = [{label:'Vertical',value:'vertical'},{label:'Horizontal',value:'horizontal'}];

  function Stars(rating, color) {
    var out = ''; for (var i=1; i<=5; i++) out += (i<=rating?'★':'☆');
    return el('span',{style:{color:color,fontSize:'16px',letterSpacing:'1px'}},out);
  }

  function ProductPreview(a) {
    var features = (a.features||'').split('\n').filter(Boolean);
    var isH = a.layoutStyle === 'horizontal';

    var cardStyle = {
      background:a.cardBg, border:'1px solid '+a.cardBorder,
      borderRadius:a.cardRadius+'px',
      boxShadow:a.cardShadow?'0 8px 32px rgba(0,0,0,0.10)':'none',
      overflow:'hidden', display:'flex', flexDirection:isH?'row':'column',
      position:'relative',
    };
    var imgStyle = {
      background: a.imgBg,
      backgroundImage: a.imageUrl?'url('+a.imageUrl+')':'none',
      backgroundSize:'contain', backgroundPosition:'center', backgroundRepeat:'no-repeat',
      height: isH ? 'auto' : a.imgHeight+'px',
      minHeight: isH ? a.imgHeight+'px' : undefined,
      width: isH ? '40%' : '100%',
      flexShrink: 0,
      display:'flex', alignItems:'center', justifyContent:'center',
    };

    return el('div',{className:'bkprc-card',style:cardStyle},
      a.showBadge&&a.badge&&el('div',{className:'bkprc-badge',style:{
        position:'absolute',top:'12px',left:'12px',zIndex:1,
        background:a.badgeBg,color:a.badgeColor,
        borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700,
      }},a.badge),

      el('div',{className:'bkprc-img',style:imgStyle},
        !a.imageUrl&&el('span',{className:'dashicons dashicons-format-image',style:{fontSize:'60px',width:'60px',height:'60px',color:'#d1d5db',lineHeight:1}}),
      ),

      el('div',{className:'bkprc-body',style:{padding:'24px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
        el('h3',{className:'bkprc-name',style:{margin:0,color:a.nameColor}},a.productName),

        a.showRating&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
          Stars(a.rating, a.priceColor),
          el('span',{style:{fontSize:'12px',color:'#9ca3af'}},a.ratingCount+' reviews'),
        ),

        el('div',{style:{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'4px'}},
          el('span',{className:'bkprc-price',style:{color:a.priceColor}},a.price),
          a.showOriginal&&a.originalPrice&&el('span',{style:{fontSize:'16px',color:a.originalPriceColor,textDecoration:'line-through'}},a.originalPrice),
        ),

        a.description&&el('p',{className:'bkprc-desc',style:{margin:0,color:a.descColor}},a.description),

        a.showFeatures&&features.length>0&&el('ul',{style:{margin:'4px 0 0',padding:'0 0 0 16px',listStyle:'none',display:'flex',flexDirection:'column',gap:'4px'}},
          features.map(function(f,i){
            return el('li',{key:i,className:'bkprc-feature',style:{color:a.featureColor,paddingLeft:'6px'}},
              el('span',{style:{color:a.priceColor,marginRight:'6px',fontWeight:700}},'✓'),f);
          })
        ),

        el('div',{style:{display:'flex',gap:'10px',marginTop:'auto',paddingTop:'8px',flexWrap:'wrap'}},
          el('a',{className:'bkprc-btn bkprc-btn-primary',href:a.btnUrl,style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',background:a.btnBg,color:a.btnColor,padding:'12px 20px',borderRadius:a.btnRadius+'px',textAlign:'center'}},
            el('span',{className:'dashicons dashicons-cart',style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
            a.btnLabel),
          a.showSecondBtn&&el('a',{className:'bkprc-btn bkprc-btn-secondary',href:a.secondBtnUrl,style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:a.secondBtnBg,color:a.secondBtnColor,padding:'12px 20px',borderRadius:a.btnRadius+'px',textAlign:'center'}},
            a.secondBtnLabel),
        ),
      ),
    );
  }

  /* ── deprecated: v1 save (inline font styles, old scalar attrs) ── */
  var v1Attributes = {
    imageUrl:{type:'string',default:''},imageId:{type:'number',default:0},
    productName:{type:'string',default:'Premium Wireless Headphones'},
    description:{type:'string',default:'Crystal-clear audio with active noise cancellation, 30-hour battery life, and premium comfort cushions.'},
    price:{type:'string',default:'$149.99'},originalPrice:{type:'string',default:'$199.99'},
    showOriginal:{type:'boolean',default:true},currency:{type:'string',default:''},
    badge:{type:'string',default:'Best Seller'},showBadge:{type:'boolean',default:true},
    badgeBg:{type:'string',default:'#f59e0b'},badgeColor:{type:'string',default:'#ffffff'},
    features:{type:'string',default:'Active Noise Cancellation\n30-hour battery\nBluetooth 5.3\nFoldable design\nCarrying case included'},
    showFeatures:{type:'boolean',default:true},
    rating:{type:'number',default:4},ratingCount:{type:'string',default:'128'},showRating:{type:'boolean',default:true},
    btnLabel:{type:'string',default:'Buy Now'},btnUrl:{type:'string',default:'#'},
    btnBg:{type:'string',default:'#6c3fb5'},btnColor:{type:'string',default:'#ffffff'},btnRadius:{type:'number',default:10},
    secondBtnLabel:{type:'string',default:'View Details'},secondBtnUrl:{type:'string',default:'#'},
    showSecondBtn:{type:'boolean',default:false},secondBtnBg:{type:'string',default:'#f3f4f6'},secondBtnColor:{type:'string',default:'#374151'},
    layoutStyle:{type:'string',default:'vertical'},
    cardBg:{type:'string',default:'#ffffff'},cardBorder:{type:'string',default:'#e5e7eb'},
    cardRadius:{type:'number',default:16},cardShadow:{type:'boolean',default:true},
    imgHeight:{type:'number',default:260},imgBg:{type:'string',default:'#f9fafb'},
    nameColor:{type:'string',default:'#1f2937'},priceColor:{type:'string',default:'#6c3fb5'},
    originalPriceColor:{type:'string',default:'#9ca3af'},descColor:{type:'string',default:'#6b7280'},
    featureColor:{type:'string',default:'#374151'},
    nameFontSize:{type:'number',default:20},nameFontWeight:{type:'string',default:'800'},
    priceFontSize:{type:'number',default:26},descFontSize:{type:'number',default:14},
    descLineHeight:{type:'number',default:1.6},featureFontSize:{type:'number',default:14},
    btnFontSize:{type:'number',default:15},
  };

  var deprecated = [{
    attributes: v1Attributes,
    save: function({attributes:a}) {
      var features = (a.features||'').split('\n').filter(Boolean);
      var isH = a.layoutStyle === 'horizontal';
      var cardStyle = {
        background:a.cardBg,border:'1px solid '+a.cardBorder,borderRadius:a.cardRadius+'px',
        boxShadow:a.cardShadow?'0 8px 32px rgba(0,0,0,0.10)':'none',
        overflow:'hidden',display:'flex',flexDirection:isH?'row':'column',position:'relative',
      };
      var imgStyle = {
        background:a.imgBg,backgroundImage:a.imageUrl?'url('+a.imageUrl+')':'none',
        backgroundSize:'contain',backgroundPosition:'center',backgroundRepeat:'no-repeat',
        height:isH?'auto':a.imgHeight+'px',minHeight:isH?a.imgHeight+'px':undefined,
        width:isH?'40%':'100%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
      };
      return el('div',{className:'bkprc-card',style:cardStyle},
        a.showBadge&&a.badge&&el('div',{style:{position:'absolute',top:'12px',left:'12px',zIndex:1,background:a.badgeBg,color:a.badgeColor,borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700}},a.badge),

        el('div',{className:'bkprc-img',style:imgStyle},
          !a.imageUrl&&el('span',{className:'dashicons dashicons-format-image',style:{fontSize:'60px',width:'60px',height:'60px',color:'#d1d5db',lineHeight:1}}),
        ),

        el('div',{style:{padding:'24px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
          el('h3',{style:{margin:0,fontSize:(a.nameFontSize||20)+'px',fontWeight:a.nameFontWeight||800,color:a.nameColor,lineHeight:1.2}},a.productName),

          a.showRating&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
            el('span',{style:{color:a.priceColor,fontSize:'16px',letterSpacing:'1px'}},'★'.repeat(a.rating)+'☆'.repeat(5-a.rating)),
            el('span',{style:{fontSize:'12px',color:'#9ca3af'}},a.ratingCount+' reviews'),
          ),

          el('div',{style:{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'4px'}},
            el('span',{style:{fontSize:(a.priceFontSize||26)+'px',fontWeight:900,color:a.priceColor}},a.price),
            a.showOriginal&&a.originalPrice&&el('span',{style:{fontSize:'16px',color:a.originalPriceColor,textDecoration:'line-through'}},a.originalPrice),
          ),

          a.description&&el('p',{style:{margin:0,fontSize:(a.descFontSize||14)+'px',color:a.descColor,lineHeight:a.descLineHeight||1.6}},a.description),

          a.showFeatures&&features.length>0&&el('ul',{style:{margin:'4px 0 0',padding:'0 0 0 16px',listStyle:'none',display:'flex',flexDirection:'column',gap:'4px'}},
            features.map(function(f,i){
              return el('li',{key:i,style:{fontSize:(a.featureFontSize||14)+'px',color:a.featureColor,lineHeight:1.5,paddingLeft:'6px'}},
                el('span',{style:{color:a.priceColor,marginRight:'6px',fontWeight:700}},'✓'),f);
            })
          ),

          el('div',{style:{display:'flex',gap:'10px',marginTop:'auto',paddingTop:'8px',flexWrap:'wrap'}},
            el('a',{className:'bkprc-btn',href:a.btnUrl,style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',background:a.btnBg,color:a.btnColor,padding:'12px 20px',borderRadius:a.btnRadius+'px',fontWeight:700,textDecoration:'none',fontSize:(a.btnFontSize||15)+'px',textAlign:'center'}},
              el('span',{className:'dashicons dashicons-cart',style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
              a.btnLabel),
            a.showSecondBtn&&el('a',{href:a.secondBtnUrl,style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:a.secondBtnBg,color:a.secondBtnColor,padding:'12px 20px',borderRadius:a.btnRadius+'px',fontWeight:600,textDecoration:'none',fontSize:((a.btnFontSize||15)-1)+'px',textAlign:'center'}},
              a.secondBtnLabel),
          ),
        ),
      );
    }
  }];

  registerBlockType('blockenberg/product-card', {
    deprecated: deprecated,

    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var TC = getTypoControl();
      var blockProps = useBlockProps((function(){
          var fn = getTypoCssVars();
          var s = {};
          if(fn){
              Object.assign(s, fn(a.nameTypo||{}, '--bkprc-nm-'));
              Object.assign(s, fn(a.priceTypo||{}, '--bkprc-pr-'));
              Object.assign(s, fn(a.descTypo||{}, '--bkprc-ds-'));
              Object.assign(s, fn(a.featureTypo||{}, '--bkprc-ft-'));
              Object.assign(s, fn(a.btnTypo||{}, '--bkprc-bt-'));
          }
          return { style: s };
      })());
      return el('div',blockProps,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Product Info'),initialOpen:true},
            el(TextControl,{label:__('Product Name'),value:a.productName,onChange:v=>set({productName:v})}),
            el(TextareaControl,{label:__('Description'),value:a.description,rows:3,onChange:v=>set({description:v})}),
            el(TextControl,{label:__('Price'),value:a.price,onChange:v=>set({price:v})}),
            el(TextControl,{label:__('Original Price (crossed out)'),value:a.originalPrice,onChange:v=>set({originalPrice:v})}),
            el(ToggleControl,{label:__('Show Original Price'),checked:a.showOriginal,onChange:v=>set({showOriginal:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Badge & Rating'),initialOpen:false},
            el(ToggleControl,{label:__('Show Badge'),checked:a.showBadge,onChange:v=>set({showBadge:v}),__nextHasNoMarginBottom:true}),
            a.showBadge&&el(TextControl,{label:__('Badge Text'),value:a.badge,onChange:v=>set({badge:v})}),
            el(ToggleControl,{label:__('Show Rating'),checked:a.showRating,onChange:v=>set({showRating:v}),__nextHasNoMarginBottom:true}),
            a.showRating&&el(RangeControl,{label:__('Stars (1-5)'),value:a.rating,min:1,max:5,onChange:v=>set({rating:v})}),
            a.showRating&&el(TextControl,{label:__('Review Count'),value:a.ratingCount,onChange:v=>set({ratingCount:v})}),
          ),
          el(PanelBody,{title:__('Features List'),initialOpen:false},
            el(ToggleControl,{label:__('Show Features'),checked:a.showFeatures,onChange:v=>set({showFeatures:v}),__nextHasNoMarginBottom:true}),
            el(TextareaControl,{label:__('Features (one per line)'),value:a.features,rows:6,onChange:v=>set({features:v})}),
          ),
          el(PanelBody,{title:__('Buttons'),initialOpen:false},
            el(TextControl,{label:__('Primary Button Label'),value:a.btnLabel,onChange:v=>set({btnLabel:v})}),
            el(TextControl,{label:__('Primary Button URL'),value:a.btnUrl,onChange:v=>set({btnUrl:v})}),
            el(ToggleControl,{label:__('Second Button'),checked:a.showSecondBtn,onChange:v=>set({showSecondBtn:v}),__nextHasNoMarginBottom:true}),
            a.showSecondBtn&&el(TextControl,{label:__('Second Button Label'),value:a.secondBtnLabel,onChange:v=>set({secondBtnLabel:v})}),
            a.showSecondBtn&&el(TextControl,{label:__('Second Button URL'),value:a.secondBtnUrl,onChange:v=>set({secondBtnUrl:v})}),
            el(RangeControl,{label:__('Button Radius (px)'),value:a.btnRadius,min:0,max:50,onChange:v=>set({btnRadius:v})}),
          ),
          el(PanelBody,{title:__('Image'),initialOpen:false},
            el(MediaUploadCheck,null,
              el(MediaUpload,{onSelect:m=>set({imageUrl:m.url,imageId:m.id}),allowedTypes:['image'],value:a.imageId,
                render:({open})=>el(Button,{onClick:open,variant:'secondary',style:{width:'100%',justifyContent:'center',marginBottom:'8px'}},
                  a.imageUrl?__('Change Image'):__('Select Image'))
              })
            ),
            a.imageUrl&&el(Button,{isDestructive:true,isSmall:true,onClick:()=>set({imageUrl:'',imageId:0})},__('Remove Image')),
            el(RangeControl,{label:__('Image Height (px)'),value:a.imgHeight,min:100,max:600,onChange:v=>set({imgHeight:v})}),
          ),
          el(PanelBody,{title:__('Card Style'),initialOpen:false},
            el(SelectControl,{label:__('Layout'),value:a.layoutStyle,options:LAYOUTS,onChange:v=>set({layoutStyle:v})}),
            el(RangeControl,{label:__('Card Radius (px)'),value:a.cardRadius,min:0,max:32,onChange:v=>set({cardRadius:v})}),
            el(ToggleControl,{label:__('Card Shadow'),checked:a.cardShadow,onChange:v=>set({cardShadow:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelBody,{title:__('Typography'),initialOpen:false},
            TC && el(TC, {label:__('Product Name'),typo:a.nameTypo||{},onChange:function(v){set({nameTypo:v});}}),
            TC && el(TC, {label:__('Price'),typo:a.priceTypo||{},onChange:function(v){set({priceTypo:v});}}),
            TC && el(TC, {label:__('Description'),typo:a.descTypo||{},onChange:function(v){set({descTypo:v});}}),
            TC && el(TC, {label:__('Features'),typo:a.featureTypo||{},onChange:function(v){set({featureTypo:v});}}),
            TC && el(TC, {label:__('Buttons'),typo:a.btnTypo||{},onChange:function(v){set({btnTypo:v});}}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Card Background'),value:a.cardBg,onChange:v=>set({cardBg:v||'#ffffff'})},
            {label:__('Card Border'),value:a.cardBorder,onChange:v=>set({cardBorder:v||'#e5e7eb'})},
            {label:__('Image Area BG'),value:a.imgBg,onChange:v=>set({imgBg:v||'#f9fafb'})},
            {label:__('Product Name'),value:a.nameColor,onChange:v=>set({nameColor:v||'#1f2937'})},
            {label:__('Price'),value:a.priceColor,onChange:v=>set({priceColor:v||'#6c3fb5'})},
            {label:__('Original Price'),value:a.originalPriceColor,onChange:v=>set({originalPriceColor:v||'#9ca3af'})},
            {label:__('Description'),value:a.descColor,onChange:v=>set({descColor:v||'#6b7280'})},
            {label:__('Feature Text'),value:a.featureColor,onChange:v=>set({featureColor:v||'#374151'})},
            {label:__('Button BG'),value:a.btnBg,onChange:v=>set({btnBg:v||'#6c3fb5'})},
            {label:__('Button Text'),value:a.btnColor,onChange:v=>set({btnColor:v||'#ffffff'})},
            {label:__('Badge BG'),value:a.badgeBg,onChange:v=>set({badgeBg:v||'#f59e0b'})},
            {label:__('Badge Text'),value:a.badgeColor,onChange:v=>set({badgeColor:v||'#ffffff'})},
          ]}),
        ),
        ProductPreview(a),
      );
    },

    save: function({attributes:a}) {
      var fn = getTypoCssVars();
      var typoStyle = {};
      if(fn){
          Object.assign(typoStyle, fn(a.nameTypo||{}, '--bkprc-nm-'));
          Object.assign(typoStyle, fn(a.priceTypo||{}, '--bkprc-pr-'));
          Object.assign(typoStyle, fn(a.descTypo||{}, '--bkprc-ds-'));
          Object.assign(typoStyle, fn(a.featureTypo||{}, '--bkprc-ft-'));
          Object.assign(typoStyle, fn(a.btnTypo||{}, '--bkprc-bt-'));
      }
      var features = (a.features||'').split('\n').filter(Boolean);
      var isH = a.layoutStyle === 'horizontal';
      var cardStyle = Object.assign({},typoStyle,{
        background:a.cardBg,border:'1px solid '+a.cardBorder,borderRadius:a.cardRadius+'px',
        boxShadow:a.cardShadow?'0 8px 32px rgba(0,0,0,0.10)':'none',
        overflow:'hidden',display:'flex',flexDirection:isH?'row':'column',position:'relative',
      });
      var imgStyle = {
        background:a.imgBg,backgroundImage:a.imageUrl?'url('+a.imageUrl+')':'none',
        backgroundSize:'contain',backgroundPosition:'center',backgroundRepeat:'no-repeat',
        height:isH?'auto':a.imgHeight+'px',minHeight:isH?a.imgHeight+'px':undefined,
        width:isH?'40%':'100%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
      };
      return el('div',{className:'bkprc-card',style:cardStyle},
        a.showBadge&&a.badge&&el('div',{style:{position:'absolute',top:'12px',left:'12px',zIndex:1,background:a.badgeBg,color:a.badgeColor,borderRadius:'6px',padding:'4px 10px',fontSize:'12px',fontWeight:700}},a.badge),

        el('div',{className:'bkprc-img',style:imgStyle},
          !a.imageUrl&&el('span',{className:'dashicons dashicons-format-image',style:{fontSize:'60px',width:'60px',height:'60px',color:'#d1d5db',lineHeight:1}}),
        ),

        el('div',{className:'bkprc-body',style:{padding:'24px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}},
          el('h3',{className:'bkprc-name',style:{margin:0,color:a.nameColor}},a.productName),

          a.showRating&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px'}},
            el('span',{style:{color:a.priceColor,fontSize:'16px',letterSpacing:'1px'}},'★'.repeat(a.rating)+'☆'.repeat(5-a.rating)),
            el('span',{style:{fontSize:'12px',color:'#9ca3af'}},a.ratingCount+' reviews'),
          ),

          el('div',{style:{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'4px'}},
            el('span',{className:'bkprc-price',style:{color:a.priceColor}},a.price),
            a.showOriginal&&a.originalPrice&&el('span',{style:{fontSize:'16px',color:a.originalPriceColor,textDecoration:'line-through'}},a.originalPrice),
          ),

          a.description&&el('p',{className:'bkprc-desc',style:{margin:0,color:a.descColor}},a.description),

          a.showFeatures&&features.length>0&&el('ul',{style:{margin:'4px 0 0',padding:'0 0 0 16px',listStyle:'none',display:'flex',flexDirection:'column',gap:'4px'}},
            features.map(function(f,i){
              return el('li',{key:i,className:'bkprc-feature',style:{color:a.featureColor,paddingLeft:'6px'}},
                el('span',{style:{color:a.priceColor,marginRight:'6px',fontWeight:700}},'✓'),f);
            })
          ),

          el('div',{style:{display:'flex',gap:'10px',marginTop:'auto',paddingTop:'8px',flexWrap:'wrap'}},
            el('a',{className:'bkprc-btn bkprc-btn-primary',href:a.btnUrl,style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',background:a.btnBg,color:a.btnColor,padding:'12px 20px',borderRadius:a.btnRadius+'px',textAlign:'center'}},
              el('span',{className:'dashicons dashicons-cart',style:{fontSize:'18px',width:'18px',height:'18px',lineHeight:1}}),
              a.btnLabel),
            a.showSecondBtn&&el('a',{className:'bkprc-btn bkprc-btn-secondary',href:a.secondBtnUrl,style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:a.secondBtnBg,color:a.secondBtnColor,padding:'12px 20px',borderRadius:a.btnRadius+'px',textAlign:'center'}},
              a.secondBtnLabel),
          ),
        ),
      );
    }
  });
}() );
