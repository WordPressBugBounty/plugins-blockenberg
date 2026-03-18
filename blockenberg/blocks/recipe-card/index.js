( function () {
  var el = window.wp.element.createElement;
  var { registerBlockType } = window.wp.blocks;
  var { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, useBlockProps } = window.wp.blockEditor;
  var { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, Button } = window.wp.components;
  var { __ } = window.wp.i18n;

  var DIFFICULTIES = ['Easy','Medium','Hard'].map(v=>({label:v,value:v}));

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var v1Attributes = {
    recipeName:{type:'string',default:'Classic Pancakes'},
    description:{type:'string',default:'Fluffy, golden pancakes the whole family will love. Ready in 30 minutes.'},
    imageUrl:{type:'string',default:''},
    imageId:{type:'number',default:0},
    prepTime:{type:'string',default:'10 min'},
    cookTime:{type:'string',default:'20 min'},
    totalTime:{type:'string',default:'30 min'},
    servings:{type:'string',default:'4 servings'},
    difficulty:{type:'string',default:'Easy'},
    cuisine:{type:'string',default:'American'},
    category:{type:'string',default:'Breakfast'},
    ingredients:{type:'string',default:'1 cup all-purpose flour\n1 tbsp sugar\n1 tsp baking powder\n\u00bd tsp baking soda\n\u00bc tsp salt\n1 cup buttermilk\n1 egg\n2 tbsp melted butter'},
    instructions:{type:'string',default:'Mix dry ingredients in a large bowl.\nWhisk wet ingredients separately.\nCombine wet and dry ingredients until just mixed.\nHeat a skillet over medium heat and grease lightly.\nPour \u00bc cup batter per pancake and cook until bubbles form.\nFlip and cook 1-2 more minutes until golden.'},
    calories:{type:'string',default:'285'},
    protein:{type:'string',default:'8g'},
    carbs:{type:'string',default:'42g'},
    fat:{type:'string',default:'9g'},
    showNutrition:{type:'boolean',default:true},
    showRating:{type:'boolean',default:true},
    rating:{type:'number',default:5},
    ratingCount:{type:'string',default:'24'},
    notes:{type:'string',default:''},
    accentColor:{type:'string',default:'#f59e0b'},
    cardBg:{type:'string',default:'#ffffff'},
    cardRadius:{type:'number',default:16},
    cardShadow:{type:'boolean',default:true},
    schemaEnabled:{type:'boolean',default:true},
    titleFontSize:{type:'number',default:28},
    titleFontWeight:{type:'number',default:800},
    titleLineHeight:{type:'number',default:1.2},
    bodyFontSize:{type:'number',default:15},
    bodyFontWeight:{type:'number',default:400},
    bodyLineHeight:{type:'number',default:1.6}
  };

  function Stars(rating, color) {
    var stars = [];
    for (var i=1; i<=5; i++) {
      stars.push(el('span',{key:i,style:{color: i<=rating ? color : '#d1d5db',fontSize:'20px'}}, i<=rating ? '★' : '☆'));
    }
    return el('div',{style:{display:'flex',gap:'2px'}},stars);
  }

  function MetaBadge(icon, label, value, color) {
    return el('div',{className:'bkrc2-meta',style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'12px 16px',background:'#f9fafb',borderRadius:'10px',flex:1,minWidth:'80px'}},
      el('span',{className:'dashicons dashicons-'+icon,style:{color:color,fontSize:'22px',width:'22px',height:'22px',lineHeight:1}}),
      el('span',{style:{fontSize:'11px',color:'#9ca3af',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.5px'}},label),
      el('span',{style:{fontWeight:700,fontSize:'14px',color:'#1f2937'}},value),
    );
  }

  function RecipePreview(a) {
    var acc = a.accentColor;
    var ingredients = (a.ingredients||'').split('\n').filter(Boolean);
    var steps = (a.instructions||'').split('\n').filter(Boolean);

    return el('div',{className:'bkrc2-card',style:{
      background:a.cardBg, borderRadius:a.cardRadius+'px',
      boxShadow:a.cardShadow?'0 8px 40px rgba(0,0,0,0.10)':'none',
      overflow:'hidden', maxWidth:'780px', width:'100%', margin:'0 auto',
    }},

      a.imageUrl && el('div',{className:'bkrc2-hero',style:{height:'280px',background:'url('+a.imageUrl+') center/cover no-repeat'}}),

      el('div',{className:'bkrc2-body',style:{padding:'32px'}},

        el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px',marginBottom:'12px'}},
          el('h2',{className:'bkrc2-name',style:{margin:0,color:'#1f2937',flex:1}},a.recipeName),
          a.difficulty && el('span',{style:{background:acc,color:'#fff',borderRadius:'20px',padding:'4px 14px',fontSize:'12px',fontWeight:700,flexShrink:0,alignSelf:'center'}},a.difficulty),
        ),

        a.showRating && el('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}},
          Stars(a.rating||5, acc),
          el('span',{style:{fontSize:'13px',color:'#6b7280'}},'('+a.ratingCount+' reviews)'),
        ),

        a.description && el('p',{className:'bkrc2-desc',style:{color:'#4b5563',margin:'0 0 24px'}},a.description),

        el('div',{className:'bkrc2-meta-row',style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'28px'}},
          MetaBadge('clock','Prep',a.prepTime,acc),
          MetaBadge('clock','Cook',a.cookTime,acc),
          MetaBadge('backup','Total',a.totalTime,acc),
          MetaBadge('groups','Serves',a.servings,acc),
        ),

        el('div',{className:'bkrc2-cols',style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'24px'}},

          el('div',{className:'bkrc2-ingredients'},
            el('h3',{style:{fontSize:'17px',fontWeight:700,color:'#1f2937',margin:'0 0 14px',paddingBottom:'8px',borderBottom:'2px solid '+acc}},
              el('span',{className:'dashicons dashicons-carrot',style:{color:acc,marginRight:'6px'}}),__('Ingredients')),
            el('ul',{style:{margin:0,padding:'0 0 0 18px',listStyle:'disc',listStyleColor:acc}},
              ingredients.map((ing,i)=>el('li',{key:i,style:{marginBottom:'6px',color:'#374151',lineHeight:1.5,fontSize:'14px'}},ing))
            )
          ),

          el('div',{className:'bkrc2-instructions'},
            el('h3',{style:{fontSize:'17px',fontWeight:700,color:'#1f2937',margin:'0 0 14px',paddingBottom:'8px',borderBottom:'2px solid '+acc}},
              el('span',{className:'dashicons dashicons-list-view',style:{color:acc,marginRight:'6px'}}),__('Instructions')),
            el('ol',{style:{margin:0,padding:'0 0 0 18px'}},
              steps.map((step,i)=>el('li',{key:i,style:{marginBottom:'10px',color:'#374151',lineHeight:1.6,fontSize:'14px'}},step))
            )
          ),
        ),

        a.showNutrition && el('div',{className:'bkrc2-nutrition',style:{background:'#f9fafb',borderRadius:'10px',padding:'16px 20px',marginBottom:'16px'}},
          el('h4',{style:{margin:'0 0 12px',fontSize:'14px',fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'1px'}},__('Nutrition (per serving)')),
          el('div',{style:{display:'flex',gap:'24px',flexWrap:'wrap'}},
            [{l:'Calories',v:a.calories},{l:'Protein',v:a.protein},{l:'Carbs',v:a.carbs},{l:'Fat',v:a.fat}].map((n,i)=>
              el('div',{key:i,style:{textAlign:'center'}},
                el('div',{style:{fontSize:'20px',fontWeight:800,color:acc}},n.v),
                el('div',{style:{fontSize:'11px',color:'#9ca3af',fontWeight:600,textTransform:'uppercase'}},n.l)
              )
            )
          )
        ),

        a.notes && el('div',{style:{background:'#fef9ec',border:'1px solid #fde68a',borderRadius:'10px',padding:'14px 18px'}},
          el('strong',{style:{fontSize:'13px',color:'#92400e'}},'📝 '+__('Notes')+': '),
          el('span',{style:{fontSize:'14px',color:'#78350f'}},a.notes),
        ),
      )
    );
  }

  registerBlockType('blockenberg/recipe-card', {
    edit: function(props) {
      var a = props.attributes;
      var set = props.setAttributes;
      var TC = getTypoControl();
      var blockProps = useBlockProps((function() {
          var _tvFn = getTypoCssVars();
          var s = {};
          if (_tvFn) {
              Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrc2-tt-'));
              Object.assign(s, _tvFn(a.bodyTypo || {}, '--bkrc2-bt-'));
          }
          return { style: s };
      })());
      return el('div',blockProps,
        el(InspectorControls,null,
          el(PanelBody,{title:__('Basic Info'),initialOpen:true},
            el(TextControl,{label:__('Recipe Name'),value:a.recipeName,onChange:v=>set({recipeName:v})}),
            el(TextareaControl,{label:__('Description'),value:a.description,rows:3,onChange:v=>set({description:v})}),
            el(SelectControl,{label:__('Difficulty'),value:a.difficulty,options:DIFFICULTIES,onChange:v=>set({difficulty:v})}),
            el(TextControl,{label:__('Cuisine'),value:a.cuisine,onChange:v=>set({cuisine:v})}),
            el(TextControl,{label:__('Category'),value:a.category,onChange:v=>set({category:v})}),
          ),
          el(PanelBody,{title:__('Typography','blockenberg'),initialOpen:false},
            TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
            TC && el(TC, { label: __('Body / Description', 'blockenberg'), value: a.bodyTypo || {}, onChange: function(v) { set({ bodyTypo: v }); } })
          ),
          el(PanelBody,{title:__('Photo'),initialOpen:false},
            el(MediaUploadCheck,null,
              el(MediaUpload,{
                onSelect:m=>set({imageUrl:m.url,imageId:m.id}),
                allowedTypes:['image'],value:a.imageId,
                render:({open})=>el(Button,{onClick:open,variant:'secondary',style:{width:'100%',justifyContent:'center',marginBottom:'8px'}},
                  a.imageUrl?__('Change Image'):__('Select Hero Image'))
              })
            ),
            a.imageUrl&&el(Button,{isDestructive:true,isSmall:true,onClick:()=>set({imageUrl:'',imageId:0})},__('Remove Image')),
          ),
          el(PanelBody,{title:__('Times & Servings'),initialOpen:false},
            el(TextControl,{label:__('Prep Time'),value:a.prepTime,onChange:v=>set({prepTime:v})}),
            el(TextControl,{label:__('Cook Time'),value:a.cookTime,onChange:v=>set({cookTime:v})}),
            el(TextControl,{label:__('Total Time'),value:a.totalTime,onChange:v=>set({totalTime:v})}),
            el(TextControl,{label:__('Servings'),value:a.servings,onChange:v=>set({servings:v})}),
          ),
          el(PanelBody,{title:__('Ingredients'),initialOpen:false},
            el(TextareaControl,{label:__('One ingredient per line'),value:a.ingredients,rows:8,onChange:v=>set({ingredients:v})}),
          ),
          el(PanelBody,{title:__('Instructions'),initialOpen:false},
            el(TextareaControl,{label:__('One step per line'),value:a.instructions,rows:8,onChange:v=>set({instructions:v})}),
          ),
          el(PanelBody,{title:__('Nutrition'),initialOpen:false},
            el(ToggleControl,{label:__('Show Nutrition'),checked:a.showNutrition,onChange:v=>set({showNutrition:v}),__nextHasNoMarginBottom:true}),
            el(TextControl,{label:__('Calories'),value:a.calories,onChange:v=>set({calories:v})}),
            el(TextControl,{label:__('Protein'),value:a.protein,onChange:v=>set({protein:v})}),
            el(TextControl,{label:__('Carbs'),value:a.carbs,onChange:v=>set({carbs:v})}),
            el(TextControl,{label:__('Fat'),value:a.fat,onChange:v=>set({fat:v})}),
          ),
          el(PanelBody,{title:__('Rating'),initialOpen:false},
            el(ToggleControl,{label:__('Show Rating'),checked:a.showRating,onChange:v=>set({showRating:v}),__nextHasNoMarginBottom:true}),
            el(RangeControl,{label:__('Star Rating (1-5)'),value:a.rating,min:1,max:5,onChange:v=>set({rating:v})}),
            el(TextControl,{label:__('Review Count'),value:a.ratingCount,onChange:v=>set({ratingCount:v})}),
          ),
          el(PanelBody,{title:__('Notes'),initialOpen:false},
            el(TextareaControl,{label:__('Chef Notes (optional)'),value:a.notes,rows:3,onChange:v=>set({notes:v})}),
          ),
          el(PanelBody,{title:__('Style'),initialOpen:false},
            el(RangeControl,{label:__('Card Radius (px)'),value:a.cardRadius,min:0,max:32,onChange:v=>set({cardRadius:v})}),
            el(ToggleControl,{label:__('Card Shadow'),checked:a.cardShadow,onChange:v=>set({cardShadow:v}),__nextHasNoMarginBottom:true}),
            el(ToggleControl,{label:__('Schema.org Markup'),checked:a.schemaEnabled,onChange:v=>set({schemaEnabled:v}),__nextHasNoMarginBottom:true}),
          ),
          el(PanelColorSettings,{title:__('Colors'),initialOpen:false,colorSettings:[
            {label:__('Accent Color'),value:a.accentColor,onChange:v=>set({accentColor:v||'#f59e0b'})},
            {label:__('Card Background'),value:a.cardBg,onChange:v=>set({cardBg:v||'#ffffff'})},
          ]}),
        ),
        RecipePreview(a),
      );
    },

    save: function({attributes:a}) {
      var acc = a.accentColor;
      var ingredients = (a.ingredients||'').split('\n').filter(Boolean);
      var steps = (a.instructions||'').split('\n').filter(Boolean);
      var _tvFn = window.bkbgTypoCssVars;
      var wrapStyle = {};
      if (_tvFn) {
          Object.assign(wrapStyle, _tvFn(a.titleTypo || {}, '--bkrc2-tt-'));
          Object.assign(wrapStyle, _tvFn(a.bodyTypo || {}, '--bkrc2-bt-'));
      }

      return el('div',{
        className:'bkrc2-wrap',
        style: wrapStyle,
        'data-schema': a.schemaEnabled ? '1' : '0',
        'data-recipe': JSON.stringify({
          name:a.recipeName,description:a.description,
          prepTime:a.prepTime,cookTime:a.cookTime,totalTime:a.totalTime,
          servings:a.servings,cuisine:a.cuisine,category:a.category,
          calories:a.calories,ingredients:ingredients,steps:steps,
          rating:a.rating,ratingCount:a.ratingCount,image:a.imageUrl,
        }),
      },
        el('div',{className:'bkrc2-card',style:{
          background:a.cardBg, borderRadius:a.cardRadius+'px',
          boxShadow:a.cardShadow?'0 8px 40px rgba(0,0,0,0.10)':'none',
          overflow:'hidden', maxWidth:'780px', width:'100%', margin:'0 auto',
        }},
          a.imageUrl&&el('div',{className:'bkrc2-hero',style:{height:'280px',background:'url('+a.imageUrl+') center/cover no-repeat'}}),

          el('div',{className:'bkrc2-body',style:{padding:'32px'}},
            el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px',marginBottom:'12px'}},
              el('h2',{className:'bkrc2-name',style:{margin:0,color:'#1f2937',flex:1}},a.recipeName),
              a.difficulty&&el('span',{style:{background:acc,color:'#fff',borderRadius:'20px',padding:'4px 14px',fontSize:'12px',fontWeight:700}},a.difficulty),
            ),

            a.showRating&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}},
              el('span',{className:'bkrc2-stars','data-rating':a.rating,style:{color:acc,fontSize:'20px',letterSpacing:'2px'}},
                '★'.repeat(a.rating)+'☆'.repeat(5-a.rating)),
              el('span',{style:{fontSize:'13px',color:'#6b7280'}},'('+a.ratingCount+' reviews)'),
            ),

            a.description&&el('p',{className:'bkrc2-desc',style:{color:'#4b5563',margin:'0 0 24px'}},a.description),

            el('div',{className:'bkrc2-meta-row',style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'28px'}},
              [{icon:'clock',label:'Prep',val:a.prepTime},{icon:'clock',label:'Cook',val:a.cookTime},{icon:'backup',label:'Total',val:a.totalTime},{icon:'groups',label:'Serves',val:a.servings}]
                .map((m,i)=>el('div',{key:i,className:'bkrc2-meta',style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'12px 16px',background:'#f9fafb',borderRadius:'10px',flex:1,minWidth:'80px'}},
                  el('span',{className:'dashicons dashicons-'+m.icon,style:{color:acc,fontSize:'22px',width:'22px',height:'22px',lineHeight:1}}),
                  el('span',{style:{fontSize:'11px',color:'#9ca3af',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.5px'}},m.label),
                  el('span',{style:{fontWeight:700,fontSize:'14px',color:'#1f2937'}},m.val),
                ))
            ),

            el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'24px'}},
              el('div',null,
                el('h3',{style:{fontSize:'17px',fontWeight:700,color:'#1f2937',margin:'0 0 14px',paddingBottom:'8px',borderBottom:'2px solid '+acc}},'Ingredients'),
                el('ul',{style:{margin:0,padding:'0 0 0 18px'}},
                  ingredients.map((ing,i)=>el('li',{key:i,style:{marginBottom:'6px',color:'#374151',lineHeight:1.5,fontSize:'14px'}},ing))
                )
              ),
              el('div',null,
                el('h3',{style:{fontSize:'17px',fontWeight:700,color:'#1f2937',margin:'0 0 14px',paddingBottom:'8px',borderBottom:'2px solid '+acc}},'Instructions'),
                el('ol',{style:{margin:0,padding:'0 0 0 18px'}},
                  steps.map((step,i)=>el('li',{key:i,style:{marginBottom:'10px',color:'#374151',lineHeight:1.6,fontSize:'14px'}},step))
                )
              ),
            ),

            a.showNutrition&&el('div',{style:{background:'#f9fafb',borderRadius:'10px',padding:'16px 20px',marginBottom:'16px'}},
              el('h4',{style:{margin:'0 0 12px',fontSize:'14px',fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'1px'}},'Nutrition (per serving)'),
              el('div',{style:{display:'flex',gap:'24px',flexWrap:'wrap'}},
                [{l:'Calories',v:a.calories},{l:'Protein',v:a.protein},{l:'Carbs',v:a.carbs},{l:'Fat',v:a.fat}].map((n,i)=>
                  el('div',{key:i,style:{textAlign:'center'}},
                    el('div',{style:{fontSize:'20px',fontWeight:800,color:acc}},n.v),
                    el('div',{style:{fontSize:'11px',color:'#9ca3af',fontWeight:600,textTransform:'uppercase'}},n.l)
                  )
                )
              )
            ),

            a.notes&&el('div',{style:{background:'#fef9ec',border:'1px solid #fde68a',borderRadius:'10px',padding:'14px 18px'}},
              el('strong',{style:{fontSize:'13px',color:'#92400e'}},'📝 Notes: '),
              el('span',{style:{fontSize:'14px',color:'#78350f'}},a.notes),
            ),
          )
        )
      );
    },

    deprecated: [
      {
        attributes: v1Attributes,
        save: function({attributes:a}) {
          var acc = a.accentColor;
          var ingredients = (a.ingredients||'').split('\n').filter(Boolean);
          var steps = (a.instructions||'').split('\n').filter(Boolean);

          return el('div',{
            className:'bkrc2-wrap',
            'data-schema': a.schemaEnabled ? '1' : '0',
            'data-recipe': JSON.stringify({
              name:a.recipeName,description:a.description,
              prepTime:a.prepTime,cookTime:a.cookTime,totalTime:a.totalTime,
              servings:a.servings,cuisine:a.cuisine,category:a.category,
              calories:a.calories,ingredients:ingredients,steps:steps,
              rating:a.rating,ratingCount:a.ratingCount,image:a.imageUrl,
            }),
          },
            el('div',{className:'bkrc2-card',style:{
              background:a.cardBg, borderRadius:a.cardRadius+'px',
              boxShadow:a.cardShadow?'0 8px 40px rgba(0,0,0,0.10)':'none',
              overflow:'hidden', maxWidth:'780px', width:'100%', margin:'0 auto',
            }},
              a.imageUrl&&el('div',{className:'bkrc2-hero',style:{height:'280px',background:'url('+a.imageUrl+') center/cover no-repeat'}}),

              el('div',{className:'bkrc2-body',style:{padding:'32px'}},
                el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px',marginBottom:'12px'}},
                  el('h2',{className:'bkrc2-name',style:{margin:0,fontSize:'28px',fontWeight:800,color:'#1f2937',flex:1}},a.recipeName),
                  a.difficulty&&el('span',{style:{background:acc,color:'#fff',borderRadius:'20px',padding:'4px 14px',fontSize:'12px',fontWeight:700}},a.difficulty),
                ),

                a.showRating&&el('div',{style:{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}},
                  el('span',{className:'bkrc2-stars','data-rating':a.rating,style:{color:acc,fontSize:'20px',letterSpacing:'2px'}},
                    '★'.repeat(a.rating)+'☆'.repeat(5-a.rating)),
                  el('span',{style:{fontSize:'13px',color:'#6b7280'}},'('+a.ratingCount+' reviews)'),
                ),

                a.description&&el('p',{style:{color:'#4b5563',lineHeight:1.6,margin:'0 0 24px',fontSize:'15px'}},a.description),

                el('div',{className:'bkrc2-meta-row',style:{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'28px'}},
                  [{icon:'clock',label:'Prep',val:a.prepTime},{icon:'clock',label:'Cook',val:a.cookTime},{icon:'backup',label:'Total',val:a.totalTime},{icon:'groups',label:'Serves',val:a.servings}]
                    .map((m,i)=>el('div',{key:i,className:'bkrc2-meta',style:{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'12px 16px',background:'#f9fafb',borderRadius:'10px',flex:1,minWidth:'80px'}},
                      el('span',{className:'dashicons dashicons-'+m.icon,style:{color:acc,fontSize:'22px',width:'22px',height:'22px',lineHeight:1}}),
                      el('span',{style:{fontSize:'11px',color:'#9ca3af',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.5px'}},m.label),
                      el('span',{style:{fontWeight:700,fontSize:'14px',color:'#1f2937'}},m.val),
                    ))
                ),

                el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'32px',marginBottom:'24px'}},
                  el('div',null,
                    el('h3',{style:{fontSize:'17px',fontWeight:700,color:'#1f2937',margin:'0 0 14px',paddingBottom:'8px',borderBottom:'2px solid '+acc}},'Ingredients'),
                    el('ul',{style:{margin:0,padding:'0 0 0 18px'}},
                      ingredients.map((ing,i)=>el('li',{key:i,style:{marginBottom:'6px',color:'#374151',lineHeight:1.5,fontSize:'14px'}},ing))
                    )
                  ),
                  el('div',null,
                    el('h3',{style:{fontSize:'17px',fontWeight:700,color:'#1f2937',margin:'0 0 14px',paddingBottom:'8px',borderBottom:'2px solid '+acc}},'Instructions'),
                    el('ol',{style:{margin:0,padding:'0 0 0 18px'}},
                      steps.map((step,i)=>el('li',{key:i,style:{marginBottom:'10px',color:'#374151',lineHeight:1.6,fontSize:'14px'}},step))
                    )
                  ),
                ),

                a.showNutrition&&el('div',{style:{background:'#f9fafb',borderRadius:'10px',padding:'16px 20px',marginBottom:'16px'}},
                  el('h4',{style:{margin:'0 0 12px',fontSize:'14px',fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'1px'}},'Nutrition (per serving)'),
                  el('div',{style:{display:'flex',gap:'24px',flexWrap:'wrap'}},
                    [{l:'Calories',v:a.calories},{l:'Protein',v:a.protein},{l:'Carbs',v:a.carbs},{l:'Fat',v:a.fat}].map((n,i)=>
                      el('div',{key:i,style:{textAlign:'center'}},
                        el('div',{style:{fontSize:'20px',fontWeight:800,color:acc}},n.v),
                        el('div',{style:{fontSize:'11px',color:'#9ca3af',fontWeight:600,textTransform:'uppercase'}},n.l)
                      )
                    )
                  )
                ),

                a.notes&&el('div',{style:{background:'#fef9ec',border:'1px solid #fde68a',borderRadius:'10px',padding:'14px 18px'}},
                  el('strong',{style:{fontSize:'13px',color:'#92400e'}},'📝 Notes: '),
                  el('span',{style:{fontSize:'14px',color:'#78350f'}},a.notes),
                ),
              )
            )
          );
        }
      }
    ]
  });
}() );
