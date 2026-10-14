<?php
/** Searchable sections and authenticated insertion into an existing editor document. */
defined('ABSPATH') || exit;

function bkbg_sections_catalog_valid($value) {
    if (!is_array($value) || ($value['schemaVersion']??null)!==1 || !is_array($value['sections'] ?? null) || count($value['sections'])>10000 || !is_array($value['categories'] ?? null)) return false;
    foreach ($value['sections'] as $key=>$entry) {
        if (!is_string($key) || !preg_match('/^s-[a-z0-9][a-z0-9-]{0,155}$/D',$key) || !is_array($entry)
            || ($entry['key']??'')!==$key || !in_array($entry['plan']??'',array('free','premium'),true)
            || !preg_match('/^[a-f0-9]{64}$/D',$entry['sha256']??'') || !preg_match('/^[a-f0-9]{64}$/D',$entry['cssSha256']??'')) return false;
    }
    if (isset($value['aliases'])) {
        if (!is_array($value['aliases']) || count($value['aliases'])>10000) return false;
        foreach ($value['aliases'] as $old=>$canonical) {
            if (!is_string($old)||!preg_match('/^s-[a-z0-9][a-z0-9-]{0,155}$/D',$old)||!is_string($canonical)||!isset($value['sections'][$canonical])||isset($value['sections'][$old])) return false;
        }
    }
    return true;
}
function bkbg_sections_catalog($refresh=false) {
    static $memory=null;
    if (!$refresh && $memory!==null) return $memory;
    // Only metadata may use the private developer mirror; downloads still authorize the parent.
    $local=defined('BKBG_TEMPLATE_AUTHORING_DIR')?trailingslashit(BKBG_TEMPLATE_AUTHORING_DIR).'sections/catalog.json':'';
    if ($local && is_file($local)) {
        $value=json_decode(file_get_contents($local),true);
        if (bkbg_sections_catalog_valid($value)) return $memory=$value;
    }
    $cached=get_transient('bkbg_remote_sections_catalog_v5');
    if (!$refresh && bkbg_sections_catalog_valid($cached)) return $memory=$cached;
    if ((is_admin() || (defined('WP_CLI') && WP_CLI)) && ($refresh || !get_transient('bkbg_remote_sections_unavailable_v5'))) {
        $remote=bkbg_library_request('sections');
        if (!is_wp_error($remote) && bkbg_sections_catalog_valid($remote)) {
            delete_transient('bkbg_remote_sections_unavailable_v5');set_transient('bkbg_remote_sections_catalog_v5',$remote,DAY_IN_SECONDS);
            update_option('bkbg_remote_sections_last_catalog_v5',$remote,false);return $memory=$remote;
        }
        set_transient('bkbg_remote_sections_unavailable_v5',true,5*MINUTE_IN_SECONDS);
    }
    $last=get_option('bkbg_remote_sections_last_catalog_v5',array());
    if (bkbg_sections_catalog_valid($last)) return $memory=$last;
    $path=dirname(__DIR__,2).'/templates/sections.json';
    $value=is_file($path)?json_decode(file_get_contents($path),true):array();
    return $memory=bkbg_sections_catalog_valid($value)?$value:array('schemaVersion'=>1,'sections'=>array(),'categories'=>array());
}
function bkbg_section_filter_entries($entries,$search,$category='',$collection='',$plan='',$chosen=array()) {
    $normalize=static function($value){$value=html_entity_decode(wp_strip_all_tags((string)$value),ENT_QUOTES,'UTF-8');return strtolower(trim(preg_replace('/[^\p{L}\p{N}]+/u',' ',$value)));};
    $query=$normalize($search);$terms=array_values(array_diff(explode(' ',$query),array('','a','an','the','with','and','section','sections','layout')));$results=array();
    foreach ($entries as $entry) {
        if ($category!=='' && $category!==($entry['category']??'')) continue;
        if ($collection!=='' && $collection!==(string)($entry['collection']??'')) continue;
        if ($plan!=='' && $plan!==($entry['plan']??'')) continue;
        if ($chosen && array_diff($chosen,$entry['tags']??array())) continue;
        $title=$normalize($entry['title']??'');$haystack=$normalize(implode(' ',array($entry['key'],$entry['title']??'',$entry['description']??'',$entry['searchText']??'',$entry['parentTitle']??'',implode(' ',$entry['tags']??array()))));
        $score=0;$match=true;
        foreach ($terms as $term) {if (strpos($haystack,$term)===false){$match=false;break;}$score+=strpos($title,$term)!==false?5:1;}
        if (!$match) continue;
        if ($query!=='' && $query===$normalize($entry['key'])) $score+=100;
        $entry['_score']=$score;$results[]=$entry;
    }
    usort($results,static function($a,$b){return ($b['_score']<=>$a['_score'])?:strnatcasecmp($a['title'],$b['title']);});
    foreach ($results as &$entry) unset($entry['_score']);
    return $query==='' && $plan==='' ? bkbg_library_mix_access_entries($results) : $results;
}
function bkbg_sections_editor_permission($post_id) {
    return $post_id>0?current_user_can('edit_post',$post_id):current_user_can('edit_posts');
}
function bkbg_sections_source($key,$entry,$retried=false) {
    $body=array('key'=>$key);
    if ($entry['plan']!=='free') {
        if (!bkbg_library_pro_enabled() || !$credentials=bkbg_library_credentials()) return new WP_Error('bkbg_library_license',__('Activate a valid Blockenberg Pro license to insert this section.','blockenberg'));
        $body['credentials']=$credentials;
    }
    $directory=defined('BKBG_TEMPLATE_AUTHORING_DIR')?trailingslashit(BKBG_TEMPLATE_AUTHORING_DIR).'sections/':'';
    if ($directory && is_file($directory.$key.'.json.gz')) {
        $parent=bkbg_library_request('download',array('key'=>$entry['parentKey'])+(!empty($body['credentials'])?array('credentials'=>$body['credentials']):array()));
        if (is_wp_error($parent)) return $parent->get_error_code()==='bkbg_library_license'?new WP_Error('bkbg_library_license',__('Activate a valid Blockenberg Pro license to insert this section.','blockenberg')):$parent;
        $json=gzdecode(file_get_contents($directory.$key.'.json.gz'),16*MB_IN_BYTES);
        $css=gzdecode(file_get_contents($directory.$key.'.css.gz'),8*MB_IN_BYTES);
    } else {
        $response=bkbg_library_request('download_section',$body);if(is_wp_error($response))return $response->get_error_code()==='bkbg_library_license'?new WP_Error('bkbg_library_license',__('Activate a valid Blockenberg Pro license to insert this section.','blockenberg')):$response;
        if (($response['key']??'')!==$key) return new WP_Error('bkbg_section_response','Invalid section response.');
        $json=$response['templateJson']??null;$css=$response['css']??null;
    }
    if (!is_string($json)||!is_string($css)||!hash_equals($entry['sha256'],hash('sha256',$json))||!hash_equals($entry['cssSha256'],hash('sha256',$css))) {
        if (!$retried) {$catalog=bkbg_sections_catalog(true);if(isset($catalog['sections'][$key]))return bkbg_sections_source($key,$catalog['sections'][$key],true);}
        return new WP_Error('bkbg_section_integrity',__('Section verification failed. Refresh the library and try again.','blockenberg'));
    }
    $data=json_decode($json,true);
    if (!is_array($data)||($data['key']??'')!==$key||($data['parentTemplateKey']??'')!==$entry['parentKey']||empty($data['blocks'])) return new WP_Error('bkbg_section_data','Invalid section data.');
    $valid=bkbg_template_validate_nodes($data['blocks']);if(is_wp_error($valid))return $valid;
    return array('data'=>$data,'css'=>$css);
}
function bkbg_section_uid_map($nodes,$suffix,&$map) {
    foreach ($nodes as $node) {
        $a=$node['attrs'];if(!empty($a['uid']))$map[$a['uid']]=preg_replace('/(?:-[a-f0-9]{16})+$/','',$a['uid']).'-'.$suffix;
        preg_match_all('/bkbg-tpl-repeater-item-([a-zA-Z0-9-]+)/',wp_json_encode($a),$matches);
        foreach($matches[1] as $uid)$map[$uid]=preg_replace('/(?:-[a-f0-9]{16})+$/','',$uid).'-'.$suffix;
        bkbg_section_uid_map($node['innerBlocks']??array(),$suffix,$map);
    }
}
function bkbg_section_replace_ids($value,$map,$field='') {
    if (is_array($value)) {foreach($value as $key=>&$child)$child=bkbg_section_replace_ids($child,$map,(string)$key);return $value;}
    if (!is_string($value)) return $value;
    $fields=array('uid','_id','id','class','classes','boxClasses','sourceClasses','contentClasses','buttonClasses','aria-controls','aria-labelledby','data-target','data-id','data-bkbg-id','inlineStyle');
    if (!in_array($field,$fields,true) && !(in_array($field,array('href','link','url'),true)&&strpos($value,'#')===0)) return $value;
    if (!$map) return $value;
    $pattern='~(?<![a-zA-Z0-9])('.implode('|',array_map(static function($id){return preg_quote($id,'~');},array_keys($map))).')(?![a-zA-Z0-9])~';
    return preg_replace_callback($pattern,static function($match)use($map){return $map[$match[1]];},$value);
}
function bkbg_section_replace_animations($value,$map,$field='') {
    if(is_array($value)){foreach($value as $key=>&$child)$child=bkbg_section_replace_animations($child,$map,(string)$key);return $value;}
    if(!is_string($value)||!$map||!in_array($field,array('style','inlineStyle','animation','animationName','animation-name'),true))return $value;
    $pattern='/((?<![a-zA-Z0-9_-])(?:'.implode('|',array_map(static function($name){return preg_quote($name,'/');},array_keys($map))).')(?![a-zA-Z0-9_-]))/';
    $replace=static function($text)use($pattern,$map){return preg_replace_callback($pattern,static function($m)use($map){return $map[$m[1]];},$text);};
    if(in_array($field,array('style','inlineStyle'),true))return preg_replace_callback('/((?:-[a-z]+-)?animation(?:-name)?\s*:)([^;{}]+)/',static function($m)use($replace){return $m[1].$replace($m[2]);},$value);
    return $replace($value);
}
function bkbg_section_prepare($key,$post_id) {
    $catalog=bkbg_sections_catalog();$key=$catalog['aliases'][$key]??$key;$entry=$catalog['sections'][$key]??null;
    if (!$entry) return new WP_Error('bkbg_section_missing',__('Section is not available.','blockenberg'));
    $source=bkbg_sections_source($key,$entry);if(is_wp_error($source))return $source;
    $source['data']['title']=$entry['title'];$source['data']['blocks'][0]['attrs']['title']=$entry['title'];
    return bkbg_section_reinstance($source['data'],$source['css'],$post_id,true);
}
/** Used for insertion and native duplication; the latter preserves existing user edits. */
function bkbg_section_reinstance($data,$original_css,$post_id,$media=false) {
    $old=($data['blocks'][0]['attrs']['instanceKey']??'')?:($data['blocks'][0]['attrs']['parentTemplateKey']??'');
    $suffix=substr(str_replace('-','',wp_generate_uuid4()),0,16);$instance='section-'.$suffix;$map=array();
    bkbg_section_uid_map($data['blocks'],$suffix,$map);$data['blocks']=bkbg_section_replace_ids($data['blocks'],$map);
    $css=bkbg_library_resolve_css_assets($original_css);
    $css=str_replace(array('[data-bkbg-template="'.$old.'"]',"[data-bkbg-template='".$old."']"),'[data-bkbg-template="'.$instance.'"]',$css);
    if($map){$pattern='~url\([^)]*\)|(?<![a-zA-Z0-9])('.implode('|',array_map(static function($id){return preg_quote($id,'~');},array_keys($map))).')(?![a-zA-Z0-9])~';$css=preg_replace_callback($pattern,static function($match)use($map){return isset($match[1])&&$match[1]!==''?$map[$match[1]]:$match[0];},$css);}
    // Custom source keyframes must not collide when sections from different designs share a page.
    preg_match_all('/@(?:-[a-z]+-)?keyframes\s+([a-zA-Z_][a-zA-Z0-9_-]*)/',$css,$animations);$animation_map=array();
    foreach($animations[1] as $name)$animation_map[$name]=$name.'-'.$suffix;
    if($animation_map){
        $css=preg_replace_callback('/(@(?:-[a-z]+-)?keyframes\s+)([a-zA-Z_][a-zA-Z0-9_-]*)/',static function($m)use($animation_map){return $m[1].($animation_map[$m[2]]??$m[2]);},$css);
        $css=preg_replace_callback('/((?:-[a-z]+-)?animation(?:-name)?\s*:)([^;{}]+)/',static function($m)use($animation_map){return $m[1].preg_replace_callback('/(?<![a-zA-Z0-9_-])('.implode('|',array_map(static function($name){return preg_quote($name,'/');},array_keys($animation_map))).')(?![a-zA-Z0-9_-])/',static function($n)use($animation_map){return $animation_map[$n[1]];},$m[2]);},$css);
    }
    $data['blocks']=bkbg_section_replace_animations($data['blocks'],$animation_map);
    $style=bkbg_library_store_css($instance,$css,hash('sha256',$css));if(is_wp_error($style))return $style;
    $data['blocks'][0]['attrs']['instanceKey']=$instance;$data['blocks'][0]['attrs']['templateStyleUrl']=$style;
    if($media&&current_user_can('upload_files'))$data=bkbg_template_prepare_media($data,$post_id);
    return bkbg_template_resolve($data);
}
function bkbg_section_validate_copy($nodes,$depth=0){if($depth>40)return new WP_Error('invalid','Invalid section structure.');foreach($nodes as $node){if(!is_array($node)||!is_string($node['blockName']??null)||!WP_Block_Type_Registry::get_instance()->is_registered($node['blockName'])||!is_array($node['attrs']??null)||!is_array($node['innerBlocks']??null))return new WP_Error('invalid','Invalid section structure.');$result=bkbg_section_validate_copy($node['innerBlocks'],$depth+1);if(is_wp_error($result))return $result;}return true;}
add_action('wp_ajax_bkbg_duplicate_section',function(){
    check_ajax_referer('bkbg_section_library','_wpnonce');$post_id=absint($_POST['post_id']??0);
    if(!$post_id||!bkbg_sections_editor_permission($post_id))wp_send_json_error(array('message'=>'Insufficient permissions.'),403);
    $raw=$_POST['block']??'';if(!is_string($raw)||strlen($raw)>16*MB_IN_BYTES)wp_send_json_error(array('message'=>'Invalid section.'),400);
    $node=json_decode(wp_unslash($raw),true);$valid=is_array($node)?bkbg_section_validate_copy(array($node)):new WP_Error('invalid','Invalid section.');
    $url=$node['attrs']['templateStyleUrl']??'';
    if(is_wp_error($valid)||($node['blockName']??'')!=='blockenberg/template-section'||!bkbg_library_style_allowed($url))wp_send_json_error(array('message'=>'Invalid section.'),400);
    $uploads=wp_upload_dir();$path=$uploads['basedir'].substr($url,strlen($uploads['baseurl']));$real=realpath($path);$root=realpath($uploads['basedir'].'/blockenberg-library');
    if(!$real||!$root||strpos($real,$root.DIRECTORY_SEPARATOR)!==0||!is_file($real)||filesize($real)>8*MB_IN_BYTES)wp_send_json_error(array('message'=>'Section style is unavailable.'),400);
    $result=bkbg_section_reinstance(array('blocks'=>array($node)),file_get_contents($real),$post_id);
    if(is_wp_error($result))wp_send_json_error(array('message'=>$result->get_error_message()),400);
    wp_send_json_success(array('blocks'=>$result['blocks']));
});
add_action('wp_ajax_bkbg_section_search',function(){
    check_ajax_referer('bkbg_section_library','_wpnonce');$post_id=absint($_POST['post_id']??0);
    if(!bkbg_sections_editor_permission($post_id))wp_send_json_error(array('message'=>'Insufficient permissions.'),403);
    $read=static function($key){return isset($_POST[$key])&&is_string($_POST[$key])?sanitize_text_field(wp_unslash($_POST[$key])):'';};
    $catalog=bkbg_sections_catalog();$results=bkbg_section_filter_entries(array_values($catalog['sections']),$read('s'),$read('category'),$read('collection'),$read('plan'));
    $key=$read('key');$key=$catalog['aliases'][$key]??$key;if($key!=='')$results=array_values(array_filter($results,static function($e)use($key){return $e['key']===$key;}));
    $per_page=20;$page=max(1,absint($_POST['paged']??1));$total=count($results);$pages=max(1,(int)ceil($total/$per_page));$page=min($pages,$page);$entries=array_slice($results,($page-1)*$per_page,$per_page);
    foreach($entries as &$entry){$entry['locked']=$entry['plan']!=='free'&&!bkbg_library_pro_enabled();unset($entry['sha256'],$entry['cssSha256'],$entry['searchText']);}
    wp_send_json_success(array('entries'=>$entries,'categories'=>$catalog['categories'],'collections'=>bkbg_library_catalog()['collections'],'total'=>$total,'page'=>$page,'pages'=>$pages));
});
add_action('wp_ajax_bkbg_insert_section',function(){
    check_ajax_referer('bkbg_section_library','_wpnonce');$post_id=absint($_POST['post_id']??0);
    if(!$post_id||!bkbg_sections_editor_permission($post_id))wp_send_json_error(array('message'=>'Insufficient permissions.'),403);
    $raw=$_POST['key']??'';$key=is_string($raw)?sanitize_key(wp_unslash($raw)):'';$data=bkbg_section_prepare($key,$post_id);
    if(is_wp_error($data))wp_send_json_error(array('message'=>$data->get_error_message(),'code'=>$data->get_error_code()),$data->get_error_code()==='bkbg_library_license'?403:400);
    wp_send_json_success(array('blocks'=>$data['blocks'],'title'=>$data['title']));
});
function bkbg_section_render($a,$content) {
    $key=$a['instanceKey']??'';if(!preg_match('/^section-[a-f0-9]{16}$/D',$key))return '';
    $attrs=array('class'=>'bkbg-template-page bkbg-library-section','data-bkbg-template'=>$key,'data-bkbg-section'=>$a['sectionKey']??'');
    if(!empty($a['anchor']))$attrs['id']=sanitize_title($a['anchor']);
    return '<section '.get_block_wrapper_attributes($attrs).'><div class="'.esc_attr($a['sourceClasses']??'').'">'.$content.'</div></section>';
}
add_action('init',function(){
    $base=dirname(__DIR__,2);$url=plugins_url('',$base.'/blockenberg.php');
    wp_register_script('bkbg-section-library-editor',$url.'/assets/js/section-library-editor.js',array('wp-blocks','wp-block-editor','wp-element','wp-components','wp-data','wp-plugins','wp-edit-post','bkbg-template-pilot-editor','bkbg-template-components-editor'),filemtime($base.'/assets/js/section-library-editor.js'),true);
    wp_register_style('bkbg-section-library',$url.'/assets/css/section-library.css',array('bkbg-template-pilot'),filemtime($base.'/assets/css/section-library.css'));
    $attributes=array();foreach(array('sectionKey','parentTemplateKey','instanceKey','title','sourceClasses','templateStyleUrl') as $key)$attributes[$key]=array('type'=>'string','default'=>'');
    register_block_type('blockenberg/template-section',array('api_version'=>3,'title'=>'Library Section','category'=>'blockenberg','icon'=>'layout','attributes'=>$attributes,'supports'=>array('html'=>false,'inserter'=>false,'align'=>array('wide','full'),'anchor'=>true),'editor_script'=>'bkbg-section-library-editor','style'=>array('bkbg-template-pilot','bkbg-template-components','bkbg-section-library'),'render_callback'=>'bkbg_section_render'));
    register_block_type('blockenberg/section-library',array('api_version'=>3,'title'=>'Blockenberg Sections','description'=>'Browse ready-made sections and insert one here.','category'=>'blockenberg','icon'=>'screenoptions','keywords'=>array('section','library','template'),'supports'=>array('html'=>false,'multiple'=>true),'editor_script'=>'bkbg-section-library-editor','render_callback'=>static function(){return '';}));
},12);
add_action('enqueue_block_editor_assets',function(){
    $base=dirname(__DIR__,2);$url=plugins_url('',$base.'/blockenberg.php');
    wp_enqueue_script('bkbg-section-library-editor');wp_enqueue_style('bkbg-section-library');
    $raw=$_GET['bkbg_section']??'';$initial=is_string($raw)?sanitize_key(wp_unslash($raw)):'';
    wp_localize_script('bkbg-section-library-editor','bkbgSectionLibrary',array('ajaxUrl'=>admin_url('admin-ajax.php'),'nonce'=>wp_create_nonce('bkbg_section_library'),'upgradeUrl'=>apply_filters('bkbg_templates_upgrade_url','https://blockenberg.com/'),'initialKey'=>$initial,'editorStyleUrl'=>$url.'/assets/css/section-library.css?ver='.filemtime($base.'/assets/css/section-library.css')));
});
add_action('enqueue_block_assets',function(){
    $post=get_post();if(!$post&&is_admin()&&!empty($_GET['post']))$post=get_post(absint($_GET['post']));if(!$post)return;
    $visit=function($nodes)use(&$visit){foreach($nodes as $node){if(($node['blockName']??'')==='blockenberg/template-section')bkbg_library_enqueue_template_style($node['attrs']['instanceKey']??'',$node['attrs']['templateStyleUrl']??'');if(!empty($node['innerBlocks']))$visit($node['innerBlocks']);}};$visit(parse_blocks($post->post_content));
});
