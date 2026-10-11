<?php
/** Editable native template catalogue. Elementor is not required. */
defined('ABSPATH') || exit;
require_once __DIR__.'/template-library-client.php';
function bkbg_template_manifest(){return bkbg_library_catalog()['templates'];}
function bkbg_template_keys(){return array_keys(array_filter(bkbg_template_manifest(),function($e){return ($e['status']??'')==='ready';}));}
function bkbg_template_dir(){return dirname(__DIR__,2).'/templates/';}
function bkbg_template_url(){return plugins_url('templates/',dirname(__DIR__,2).'/blockenberg.php');}
function bkbg_template_data($key,$authoring_preview=false){return bkbg_library_template_bundle($key,$authoring_preview);}
function bkbg_template_resolve($value){
    if(is_string($value))return str_replace('{{assets}}/',bkbg_library_assets_url(),$value);
    if(is_array($value))foreach($value as &$v)$v=bkbg_template_resolve($v);
    return $value;
}
function bkbg_template_serialize($node){
    $name=$node['blockName'];$attrs=bkbg_template_resolve($node['attrs']);
    $json=wp_json_encode($attrs,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    $json=str_replace(array('--','<','>','&'),array('\\u002d\\u002d','\\u003c','\\u003e','\\u0026'),$json);
    $short=str_replace('core/','',$name);
    if(empty($node['innerBlocks']))return '<!-- wp:'.$short.' '.$json.' /-->';
    $content='';foreach($node['innerBlocks'] as $child)$content.=bkbg_template_serialize($child);
    return '<!-- wp:'.$short.' '.$json.' -->'.$content.'<!-- /wp:'.$short.' -->';
}
function bkbg_template_import($key,$progress=null){
    $notify=function($percent,$message)use($progress){if(is_callable($progress))$progress($percent,$message);};
    $notify(5,__('Downloading and verifying template…','blockenberg'));
    $data=bkbg_template_data($key);if(is_wp_error($data))return $data;if(!$data||empty($data['blocks'])||!is_array($data['blocks']))return new WP_Error('missing_template','Template is not available.');
    $valid=bkbg_template_validate_nodes($data['blocks']);if(is_wp_error($valid))return $valid;
    $notify(20,__('Creating your draft…','blockenberg'));
    $content='';foreach($data['blocks'] as $node)$content.=bkbg_template_serialize($node);
    $id=wp_insert_post(wp_slash(array('post_type'=>'page','post_status'=>'draft','post_title'=>$data['title'].' — Blockenberg','post_name'=>wp_unique_post_slug('bkbg-'.$key,0,'publish','page',0),'post_content'=>$content)),true);
    if(is_wp_error($id))return $id;
    $total=bkbg_template_media_count($data);$done=0;
    $notify(25,__('Preparing images…','blockenberg'));
    $data=bkbg_template_prepare_media($data,$id,function()use(&$done,$total,$notify){$done++;$notify(25+(int)floor(65*$done/max(1,$total)),sprintf(__('Preparing images: %1$d of %2$d','blockenberg'),$done,$total));});
    $notify(95,__('Saving editable blocks…','blockenberg'));$content='';foreach($data['blocks'] as $node)$content.=bkbg_template_serialize($node);
    $updated=wp_update_post(wp_slash(array('ID'=>$id,'post_content'=>$content)),true);if(is_wp_error($updated))return $updated;
    update_post_meta($id,'_bkbg_template_key',$key);update_post_meta($id,'_bkbg_template_canvas','1');
    $notify(100,__('Your draft is ready.','blockenberg'));
    return $id;
}
function bkbg_template_classes($a){
    $class=$a['classes']??'';return implode(' ',array_map('sanitize_html_class',preg_split('/\s+/',trim($class))));
}
function bkbg_template_image($image){
    $out='<img';foreach(array('src','alt','width','height','class','loading','decoding','fetchpriority','srcset','sizes') as $k){
        if($k==='alt'){$out.=' alt="'.esc_attr($image['alt']??'').'"';continue;}
        if(!isset($image[$k])||$image[$k]==='')continue;
        $v=$k==='src'?esc_url($image[$k]):esc_attr($image[$k]);$out.=' '.$k.'="'.$v.'"';
    }return $out.' />';
}
function bkbg_template_override_css($a){
    $id='bkbg-tpl-element-'.sanitize_html_class($a['uid']??'');$selector='.'. $id.' > .bkbg-tpl-widget-container';$out='';
    foreach(array(''=>'','Tablet'=>'@media(max-width:1024px)','Mobile'=>'@media(max-width:767px)') as $suffix=>$media){
        $props=array();foreach(array('fontSize'=>'font-size','lineHeight'=>'line-height','letterSpacing'=>'letter-spacing','textColor'=>'color','textAlign'=>'text-align','fontWeight'=>'font-weight') as $key=>$css){
            $value=$a[$key.$suffix]??'';if($value==='')continue;
            if(in_array($key,array('fontSize','letterSpacing'),true))$value=(float)$value.'px';
            elseif($key==='lineHeight')$value=(float)$value;
            elseif($key==='fontWeight')$value=(int)$value;
            elseif($key==='textAlign'&&!in_array($value,array('left','center','right','justify'),true))continue;
            elseif($key==='textColor'&&!preg_match('/^(#[a-f0-9]{3,8}|rgba?\([0-9.,%\s]+\)|[a-z]+)$/i',$value))continue;
            $props[]=$css.':'.$value.'!important';
        }
        if($props){$rule=$selector.','.$selector.' .bkbg-tpl-heading-title,'.$selector.' .bkbg-catalog-styled-text-builder-items,'.$selector.' *{'.implode(';',$props).'}';$out.=$media?$media.'{'.$rule.'}':$rule;}
    }
    if(!empty($a['imageWidth']))$out.=$selector.' img{width:'.max(1,min(3000,(float)$a['imageWidth'])).'px!important}';
    return $out?'<style>'.$out.'</style>':'';
}
function bkbg_template_render($a,$content,$block){
    $name=$block->name;$classes=bkbg_template_classes($a);$uid=sanitize_html_class($a['uid']??'');
    if($name==='blockenberg/template-page'){
        $key=$a['templateKey']??'';if(!preg_match('/^[a-z0-9][a-z0-9-]{0,159}$/D',$key))return '';
        return '<main '.get_block_wrapper_attributes(array('class'=>'bkbg-template-page','data-bkbg-template'=>$key)).'><div class="'.esc_attr($a['sourceClasses']??'').'">'.$content.'</div></main>';
    }
    if($name==='blockenberg/template-layout'){
        $tag=($a['tag']??'')==='section'?'section':'div';$attrs=get_block_wrapper_attributes(array('class'=>$classes,'data-bkbg-id'=>$uid,'data-bkbg-type'=>$a['kind']??'','style'=>safecss_filter_attr($a['inlineStyle']??''))); 
        $overlay=!empty($a['overlay'])?'<div class="bkbg-tpl-background-overlay"></div>':'';
        return '<'.$tag.' '.$attrs.'>'.(($a['kind']??'')==='column'?'':bkbg_template_background($a).$overlay).'<div class="'.esc_attr($a['boxClasses']??'').'">'.(($a['kind']??'')==='column'?bkbg_template_background($a).$overlay:'').$content.'</div>'.bkbg_template_shapes($a).'</'.$tag.'>';
    }
    $body='';
    if($name==='blockenberg/template-text')$body=wp_kses_post($a['content']??'');
    elseif($name==='blockenberg/template-heading'){
        $tag=in_array($a['headingTag']??'',array('h1','h2','h3','h4','h5','h6','p','div'),true)?$a['headingTag']:'h2';
        $body='<'.$tag.' class="'.esc_attr($a['contentClasses']??'').'">'.wp_kses_post($a['content']??'').'</'.$tag.'>';
    }elseif($name==='blockenberg/template-image'){
        $body=bkbg_template_image($a['image']??array());if(!empty($a['link']))$body='<a href="'.esc_url($a['link']).'">'.$body.'</a>';
    }elseif($name==='blockenberg/template-button'){
        $target=($a['target']??'')==='_blank'?' target="_blank" rel="noopener noreferrer"':'';
        $icon=($a['buttonIcon']??'')==='play'?'<span class="bkbg-tpl-button-icon" aria-hidden="true"><svg viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor"><path d="M0 0L448 256L0 512Z"/></svg></span>':'';
        $body='<div class="bkbg-tpl-button-wrapper"><a class="'.esc_attr($a['buttonClasses']??'').'" href="'.esc_url($a['url']??'#').'"'.$target.'><span class="bkbg-tpl-button-content-wrapper">'.$icon.'<span class="bkbg-tpl-button-text">'.wp_kses_post($a['content']??'').'</span></span></a></div>';
    }elseif(in_array($name,array('blockenberg/template-styled-text','blockenberg/template-marquee'),true)){
        $marquee=$name==='blockenberg/template-marquee';$items='';
        foreach($a['segments']??array() as $segment){
            $inner=isset($segment['image'])?bkbg_template_image($segment['image']):'<span>'.wp_kses_post($segment['text']??'').'</span>';
            $items.='<span class="'.esc_attr($segment['classes']??'').'"><span class="bkbg-catalog-'.($marquee?'auto-scrolling-text':'styled-text').'-inner">'.$inner.'</span></span>';
        }
        if(!$marquee)$body='<div class="bkbg-catalog-styled-text-builder-items">'.$items.'</div>';
        else $body='<div class="bkbg-catalog-auto-scrolling-text-items-wrapper"><div class="bkbg-catalog-auto-scrolling-text-items bkbg-catalog-auto-scrolling-text-items-'.$uid.'"><div class="bkbg-catalog-auto-scrolling-text-wrapper bkbg-catalog-auto-scrolling-text-wrapper-'.$uid.' bkbg-template-marquee-track" data-bkbg-marquee="'.max(1,min(200,(float)($a['speed']??60))).'" data-pause="'.(!empty($a['pauseOnHover'])?'1':'0').'">'.$items.'</div></div></div>';
    }
    return '<div '.get_block_wrapper_attributes(array('class'=>$classes,'data-bkbg-id'=>$uid)).'><div class="bkbg-tpl-widget-container">'.$body.'</div></div>'.bkbg_template_override_css($a);
}
add_action('init',function(){
    $base=dirname(__DIR__,2);$url=plugins_url('', $base.'/blockenberg.php');
    wp_register_script('bkbg-template-editor-styles',$url.'/assets/js/template-editor-styles.js',array(),filemtime($base.'/assets/js/template-editor-styles.js'),false);
    wp_register_script('bkbg-template-pilot-schemas',$url.'/assets/js/template-pilot-schemas.js',array(),filemtime($base.'/assets/js/template-pilot-schemas.js'),false);
    wp_register_script('bkbg-template-pilot-editor',$url.'/assets/js/template-pilot.js',array('wp-blocks','wp-block-editor','wp-element','wp-components','wp-i18n','bkbg-motion-editor','bkbg-template-pilot-schemas','bkbg-inspector-tabs','bkbg-template-editor-styles'),filemtime($base.'/assets/js/template-pilot.js'),false);
    wp_register_style('bkbg-template-pilot',$url.'/assets/css/template-pilot.css',array(),filemtime($base.'/assets/css/template-pilot.css'));
    wp_register_script('bkbg-template-pilot-front',$url.'/assets/js/template-pilot-front.js',array(),filemtime($base.'/assets/js/template-pilot-front.js'),true);
},5);
function bkbg_template_content_keys($blocks){
    $keys=array();foreach($blocks as $block){
        if(($block['blockName']??'')==='blockenberg/template-page')$keys[]=$block['attrs']['templateKey']??'';
        if(!empty($block['innerBlocks']))$keys=array_merge($keys,bkbg_template_content_keys($block['innerBlocks']));
    }return array_values(array_unique(array_filter($keys)));
}
add_action('enqueue_block_assets',function(){
    $post=get_post();if(!$post&&is_admin()&&!empty($_GET['post']))$post=get_post(absint($_GET['post']));
    if(!$post)return;
    $visit=function($blocks)use(&$visit){foreach($blocks as $block){
        if(($block['blockName']??'')==='blockenberg/template-page')bkbg_library_enqueue_template_style($block['attrs']['templateKey']??'', $block['attrs']['templateStyleUrl']??'');
        if(!empty($block['innerBlocks']))$visit($block['innerBlocks']);
    }};$visit(parse_blocks($post->post_content));
});
add_filter('template_include',function($template){
    if(is_singular('page')&&get_post_meta(get_the_ID(),'_bkbg_template_canvas',true)==='1'&&has_block('blockenberg/template-page'))return __DIR__.'/template-canvas.php';
    return $template;
});
add_action('admin_menu',function(){add_submenu_page('blockenberg',__('Template Library','blockenberg'),__('Template Library','blockenberg'),'manage_options','blockenberg-templates','bkbg_template_catalog_screen');},25);
require_once __DIR__.'/template-catalog-screen.php';
add_action('admin_post_bkbg_import_template',function(){
    if(!current_user_can('manage_options'))wp_die('Insufficient permissions.');check_admin_referer('bkbg_import_template');
    $id=bkbg_template_import(sanitize_key(wp_unslash($_POST['key']??'')));if(is_wp_error($id))wp_die(esc_html($id->get_error_message()));
    wp_safe_redirect(admin_url('post.php?post='.(int)$id.'&action=edit'));exit;
});


/** Validate bundled block data before creating a draft. */
function bkbg_template_validate_nodes($nodes,$depth=0){
    if($depth>40)return new WP_Error('template_depth','Template structure is too deeply nested.');
    foreach($nodes as $node){
        $name=$node['blockName']??'';
        if(strpos($name,'blockenberg/template-')!==0||!WP_Block_Type_Registry::get_instance()->is_registered($name))return new WP_Error('template_block','Unknown template block.');
        if(!is_array($node['attrs']??null)||!is_array($node['innerBlocks']??null))return new WP_Error('template_schema','Invalid template structure.');
        $nested=bkbg_template_validate_nodes($node['innerBlocks'],$depth+1);if(is_wp_error($nested))return $nested;
    }return true;
}
/** Images are imported only when a user imports a template, with source deduplication. */
function bkbg_template_media_count($value){
    if(!is_array($value))return 0;
    if(isset($value['src'])&&is_string($value['src'])&&$value['src']!==''){
        $source=$value['src'];$token=strpos($source,'{{assets}}/')===0;$host=strtolower(wp_parse_url($source,PHP_URL_HOST)??'');
        if(!$token&&!bkbg_library_asset_url_allowed($source)&&$host!=='kingaddons.com'&&!preg_match('/(^|\.)kingaddons\.com$/',$host))return 0;
        $name=$token?basename(substr($source,11)):basename(wp_parse_url($source,PHP_URL_PATH)??'');$mime=wp_check_filetype($name)['type'];
        return $mime&&strpos($mime,'image/')===0&&$mime!=='image/svg+xml'?1:0;
    }
    $count=0;foreach($value as $child)$count+=bkbg_template_media_count($child);return $count;
}
function bkbg_template_prepare_media($value,$post_id,$progress=null){
    if(!is_array($value))return $value;
    if(isset($value['src'])&&is_string($value['src'])&&$value['src']!==''){
        $source=$value['src'];$token=strpos($source,'{{assets}}/')===0;
        $host=strtolower(wp_parse_url($source,PHP_URL_HOST)??'');
        if(!$token&&!bkbg_library_asset_url_allowed($source)&&$host!=='kingaddons.com'&&!preg_match('/(^|\.)kingaddons\.com$/',$host))return $value;
        $name=$token?basename(substr($source,11)):basename(wp_parse_url($source,PHP_URL_PATH)??'');
        $mime=wp_check_filetype($name)['type'];if(!$mime||strpos($mime,'image/')!==0||$mime==='image/svg+xml')return $value;
        try {
        $meta=$token?'_bkbg_template_asset':'_bkbg_template_source';$identity=$token?$name:hash('sha256',$source);
        $ids=get_posts(array('post_type'=>'attachment','post_status'=>'inherit','fields'=>'ids','numberposts'=>1,'meta_key'=>$meta,'meta_value'=>$identity));
        $id=$ids?(int)$ids[0]:0;
        if(!$id){
            if($token)$source=bkbg_library_assets_url().$name;
            {
                $response=wp_safe_remote_get($source,array('timeout'=>20,'limit_response_size'=>20*MB_IN_BYTES));
                if(is_wp_error($response)||wp_remote_retrieve_response_code($response)!==200)return $value;
                $bytes=wp_remote_retrieve_body($response);
                if(!$bytes||strpos(strtolower(substr($bytes,0,100)),'<html')!==false)return $value;
            }
            $upload=wp_upload_bits('blockenberg-'.substr(hash('sha256',$source),0,16).'-'.$name,null,$bytes);
            if(!empty($upload['error']))return $value;
            $actual=wp_check_filetype_and_ext($upload['file'],$name);if(empty($actual['type'])||strpos($actual['type'],'image/')!==0){wp_delete_file($upload['file']);return $value;}
            $id=wp_insert_attachment(array('post_mime_type'=>$actual['type'],'post_title'=>'Blockenberg — '.$name,'post_status'=>'inherit'),$upload['file'],$post_id,true);
            if(is_wp_error($id))return $value;
            require_once ABSPATH.'wp-admin/includes/image.php';
            wp_update_attachment_metadata($id,wp_generate_attachment_metadata($id,$upload['file']));
            update_post_meta($id,$meta,$identity);update_post_meta($id,'_wp_attachment_image_alt',$value['alt']??'');
        }
        $value['id']=$id;$value['src']=wp_get_attachment_url($id);
        // Responsive candidates must follow the new local attachment.
        if(isset($value['srcset'])){$set=wp_get_attachment_image_srcset($id,'full');if($set)$value['srcset']=$set;else unset($value['srcset']);}
        return $value;
        } finally {if(is_callable($progress))$progress();}
    }
    foreach($value as &$child)$child=bkbg_template_prepare_media($child,$post_id,$progress);
    return $value;
}

/** Stream actual completed import stages; the normal form remains a no-JS fallback. */
add_action('wp_ajax_bkbg_import_template',function(){
    if(!current_user_can('manage_options'))wp_send_json_error(array('message'=>__('Insufficient permissions.','blockenberg')),403);
    check_ajax_referer('bkbg_import_template','_wpnonce');
    $key=sanitize_key(wp_unslash($_POST['key']??''));
    while(ob_get_level()>0){if(!@ob_end_clean())break;}
    nocache_headers();header('Content-Type: application/x-ndjson; charset=utf-8');header('X-Accel-Buffering: no');
    $emit=function($data){echo wp_json_encode($data)."\n";flush();};
    $id=bkbg_template_import($key,function($percent,$message)use($emit){$emit(array('type'=>'progress','percent'=>$percent,'message'=>$message));});
    if(is_wp_error($id))$emit(array('type'=>'error','message'=>$id->get_error_message()));
    else $emit(array('type'=>'complete','postId'=>(int)$id,'editUrl'=>admin_url('post.php?post='.(int)$id.'&action=edit')));
    exit;
});
