<?php
/** Native typed template families. */
defined('ABSPATH') || exit;
function bkbg_template_components_families(){return explode(' ','card list accordion carousel video icon counter rating decoration map grid hotspots comparison stack blog flip timeline creative-button form');}
function bkbg_template_component_tags(){return explode(' ','div span p a img h1 h2 h3 h4 h5 h6 section article aside header footer nav main ul ol li dl dt dd figure figcaption blockquote strong b em i u s small br hr button details summary video audio source iframe table thead tbody tfoot tr th td time label input form textarea select option progress meter svg g path circle ellipse rect line polyline polygon title desc defs clipPath mask use textPath text tspan linearGradient radialGradient stop pattern');}
function bkbg_template_component_url($v,$iframe=false){
 if(!is_scalar($v))return ''; $v=trim((string)$v);
 if(function_exists('bkbg_template_resolve'))$v=bkbg_template_resolve($v);
 if($iframe&&!preg_match('~^https://[^/\s]+(?:/|$)~i',$v))return '';
 return esc_url($v,$iframe?array('https'):array('http','https','mailto','tel'));
}
function bkbg_template_component_ids($tree,$fields,$depth=0){
 $ids=array();if($depth>64)return $ids;
 foreach(is_array($tree)?$tree:array() as $node){if(!is_array($node))continue;$id=$node['attrs']['id']??null;if(is_array($id))$id=$fields[$id['field']??'']['value']??null;if(is_scalar($id)&&$id!=='')$ids[(string)$id]=true;$ids+=bkbg_template_component_ids($node['children']??array(),$fields,$depth+1);}return $ids;
}
function bkbg_template_component_attrs($attrs,$fields,$tag,$prefix,$ids=array()){
 $out='';$allowed=explode(' ','class style id title role tabindex href src srcset sizes poster alt width height loading decoding fetchpriority placeholder required rows cols maxlength minlength autocomplete target type name value disabled checked controls autoplay muted loop playsinline preload allow allowfullscreen frameborder referrerpolicy open datetime colspan rowspan scope for max min step viewBox d fill stroke stroke-width stroke-linecap stroke-linejoin fill-rule clip-rule opacity transform cx cy r rx ry x y x1 y1 x2 y2 points preserveAspectRatio xmlns pathLength pathlength startOffset text-anchor gradientUnits gradientTransform offset stop-color stop-opacity font-family fontfamily font-size font-weight letter-spacing dominant-baseline textLength lengthAdjust patternUnits patternContentUnits patternTransform clip-path mask xlink:href');
 foreach(is_array($attrs)?$attrs:array() as $k=>$v){
  if(!is_string($k)||(!in_array($k,$allowed,true)&&!preg_match('/^(aria|data)-[a-z0-9_-]+$/',$k)))continue;
  if(is_array($v)&&isset($v['field'])){$f=$fields[$v['field']]??array();$v=($f['type']??'')==='image'&&$k==='src'?($f['image']['src']??$f['value']??''):($f['value']??'');}
  if(strpos($k,'aria-')===0&&is_bool($v))$v=$v?'true':'false';
  if(!is_scalar($v))continue;$presence=$v!==false;$v=(string)$v;
  if($k==='style'){$v=safecss_filter_attr($v);if($v==='')continue;}
  if($k==='class'||strpos($k,'data-')===0){$k=str_replace(array('elementor','king-addons'),array('bkbg-tpl','bkbg-catalog'),$k);$v=str_replace(array('elementor','king-addons'),array('bkbg-tpl','bkbg-catalog'),$v);}
  if(in_array($k,array('href','xlink:href','src','poster','data-json-url'),true))$v=bkbg_template_component_url($v,$tag==='iframe'&&$k==='src');
  if($k==='id'){$out.=' data-bkbg-style-id="'.esc_attr(str_replace(array('elementor','king-addons'),array('bkbg-tpl','bkbg-catalog'),$v)).'"';$v=$prefix.sanitize_html_class($v);}
  if(in_array($k,array('href','xlink:href'),true)&&strpos($v,'#')===0&&isset($ids[substr($v,1)]))$v='#'.$prefix.sanitize_html_class(substr($v,1));
  if(in_array($k,array('for','aria-controls','aria-labelledby','aria-describedby'),true))$v=implode(' ',array_map(function($id)use($prefix,$ids){return isset($ids[$id])?$prefix.sanitize_html_class($id):$id;},preg_split('/\s+/',trim($v))));
  if($k==='target'&&!in_array($v,array('_blank','_self'),true))continue;
  if(in_array($k,array('fill','stroke','clip-path','mask'),true)){
   if(preg_match('/^url\(#([a-zA-Z0-9_-]+)\)$/',$v,$m))$v='url(#'.(isset($ids[$m[1]])?$prefix:'').$m[1].')';
   elseif(!preg_match('/^(none|currentColor|transparent|[a-zA-Z]+|#[a-fA-F0-9]{3,8}|rgba?\([0-9.,%\s]+\))$/',$v))continue;
  }
  if(in_array($k,array('required','disabled','checked','controls','autoplay','muted','loop','playsinline','allowfullscreen','open'),true)){if($presence)$out.=' '.$k;continue;}
  $out.=' '.$k.'="'.esc_attr($v).'"';
 }
 if($tag==='a')$out.=' rel="noopener noreferrer"';
 if($tag==='iframe')$out.=' sandbox="allow-scripts allow-same-origin allow-presentation"';
 return $out;
}
function bkbg_template_component_node($node,$fields,$prefix,$depth=0,$ids=null){
 if($ids===null)$ids=bkbg_template_component_ids(array($node),$fields);
 if(!is_array($node)||$depth>64)return '';
 if(isset($node['text'])&&is_scalar($node['text']))return esc_html((string)$node['text']);
 $standalone=$fields[$node['field']??'']??null;
 if(array_key_exists('tag',$node)&&$node['tag']===null&&$standalone)return ($standalone['type']??'')==='richtext'?wp_kses_post($standalone['value']??''):esc_html($standalone['value']??'');
 $tag=$node['tag']??'';if(!in_array($tag,bkbg_template_component_tags(),true))return '';
 $attrs=is_array($node['attrs']??null)?$node['attrs']:array();
 if(in_array($tag,array('input','textarea','select'),true)&&isset($attrs['required']))$attrs['aria-required']=$attrs['required'];$field=$fields[$node['field']??'']??null;
 if($tag==='img'&&$field&&($field['type']??'')==='image'){
  unset($attrs['srcset'],$attrs['sizes']);
  foreach(array('src','srcset','sizes','alt','width','height') as $key)if(isset($field['image'][$key]))$attrs[$key]=$field['image'][$key];
  if(empty($attrs['src']))$attrs['src']=$field['value']??'';
  if(empty($attrs['src']))$attrs['src']=plugins_url('assets/img/template-image-placeholder.svg',dirname(__DIR__,2).'/blockenberg.php');
 }
 $out='<'.$tag.bkbg_template_component_attrs($attrs,$fields,$tag,$prefix,$ids).'>';
 if(in_array($tag,array('img','br','hr','input','source'),true))return $out;
 if($field){
  $value=$field['value']??'';
  if(($field['type']??'')==='richtext'&&preg_match('/(?:^|\s)bkbg-catalog-title-wrap(?:\s|$)/',is_string($attrs['class']??null)?$attrs['class']:'')&&!preg_match('/^<span\b[^>]*class=[\"\']bkbg-catalog-title[\"\']/',(string)$value))$value='<span class="bkbg-catalog-title">'.$value.'</span>';
  $out.=($field['type']??'')==='richtext'?wp_kses_post($value):esc_html($value);
 }
 else foreach(is_array($node['children']??null)?$node['children']:array() as $child)$out.=bkbg_template_component_node($child,$fields,$prefix,$depth+1,$ids);
 return $out.'</'.$tag.'>';
}
function bkbg_template_component_render($a,$content,$block){
 $fields=array();foreach($a['fields']??array() as $f)if(is_array($f)&&isset($f['id'])&&is_string($f['id']))$fields[$f['id']]=$f;
 if(isset($a['behavior']['targetField'],$fields[$a['behavior']['targetField']],$a['behavior']['target']))$fields[$a['behavior']['targetField']]['value']=(string)$a['behavior']['target'];
 $family=str_replace('blockenberg/template-','',$block->name);$uid=sanitize_html_class($a['uid']??'');$prefix=wp_unique_id('bkbg-component-').'-';$body='';
 $ids=bkbg_template_component_ids($a['tree']??array(),$fields);
 foreach($a['tree']??array() as $node)$body.=bkbg_template_component_node($node,$fields,$prefix,0,$ids);
 if(strpos($body,' data-json-url=')!==false){
  // A later Lottie block must also precede a front handle queued by an earlier block.
  $scripts=wp_scripts();
  if(isset($scripts->registered['bkbg-template-components-front'])&&!in_array('bkbg-template-lottie',$scripts->registered['bkbg-template-components-front']->deps,true))$scripts->registered['bkbg-template-components-front']->deps[]='bkbg-template-lottie';
  wp_enqueue_script('bkbg-template-lottie');
 }
 if($family==='form')$body=bkbg_template_form_markup($body,$a,$fields);
 $classes=function_exists('bkbg_template_classes')?bkbg_template_classes($a):'';
 $source=$a['sourceSettings']??($a['behavior']['sourceSettings']??array());
 if(($a['kind']??'')==='text-path'&&is_array($source)&&($source['path']??'')==='circle')$classes.=' bkbg-template-circular-text';
 $wrapper=get_block_wrapper_attributes(array('class'=>$classes,'data-bkbg-id'=>$uid,'data-bkbg-component'=>$family,'data-bkbg-kind'=>sanitize_key($a['kind']??''),'data-bkbg-behavior'=>wp_json_encode(is_array($a['behavior']??null)?$a['behavior']:array())));
 return '<div '.$wrapper.'><div class="bkbg-tpl-widget-container">'.$body.'</div></div>'.(function_exists('bkbg_template_override_css')?bkbg_template_override_css($a):'');
}
function bkbg_template_components_register_assets(){
 $base=dirname(__DIR__,2);$url=plugins_url('',$base.'/blockenberg.php');
 wp_register_script('bkbg-template-carousel-runtime',$url.'/assets/js/template-carousel-runtime.js',array(),filemtime($base.'/assets/js/template-carousel-runtime.js'),true);
 wp_register_script('bkbg-template-carousel-editor',$url.'/assets/js/template-carousel-editor.js',array('wp-element','bkbg-template-carousel-runtime'),filemtime($base.'/assets/js/template-carousel-editor.js'),false);
 wp_register_script('bkbg-template-collections',$url.'/assets/js/template-collections.js',array(),filemtime($base.'/assets/js/template-collections.js'),false);
 wp_register_script('bkbg-template-components-editor',$url.'/assets/js/template-components.js',array('wp-blocks','wp-block-editor','wp-element','wp-components','wp-i18n','bkbg-inspector-tabs','bkbg-motion-editor','bkbg-template-editor-styles','bkbg-template-carousel-editor','bkbg-template-collections'),filemtime($base.'/assets/js/template-components.js'),false);
 wp_register_style('bkbg-template-components',$url.'/assets/css/template-components.css',array(),filemtime($base.'/assets/css/template-components.css'));
 wp_register_script('bkbg-template-lottie',$url.'/assets/js/vendor/template-lottie.js',array(),filemtime($base.'/assets/js/vendor/template-lottie.js'),true);
 wp_register_script('bkbg-template-components-front',$url.'/assets/js/template-components-front.js',array('bkbg-template-carousel-runtime'),is_file($base.'/assets/js/template-components-front.js')?filemtime($base.'/assets/js/template-components-front.js'):false,true);
 $schemas=array();foreach(bkbg_template_components_families() as $family){$meta=json_decode(file_get_contents($base.'/blocks/template-'.$family.'/block.json'),true);$schemas[$meta['name']]=$meta;}
 wp_add_inline_script('bkbg-template-components-editor','window.bkbgTemplateComponents='.wp_json_encode($schemas).';window.bkbgTemplateImagePlaceholder='.wp_json_encode($url.'/assets/img/template-image-placeholder.svg').';','before');
}
function bkbg_template_components_register(){foreach(bkbg_template_components_families() as $family)if(!WP_Block_Type_Registry::get_instance()->is_registered('blockenberg/template-'.$family))register_block_type(dirname(__DIR__,2).'/blocks/template-'.$family);}
add_action('init','bkbg_template_components_register_assets',4);
add_action('init','bkbg_template_components_register',6);
