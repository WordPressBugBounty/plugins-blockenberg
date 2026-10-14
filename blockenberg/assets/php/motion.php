<?php
/** Shared opt-in motion settings. Existing blocks remain unchanged. */
defined('ABSPATH') || exit;
function bkbg_motion_attributes() {
    return array(
        'bkbgEntrance' => array('type'=>'string','default'=>''),
        'bkbgEntranceTablet' => array('type'=>'string','default'=>''),
        'bkbgEntranceMobile' => array('type'=>'string','default'=>''),
        'bkbgEntranceDuration'=>array('type'=>'number','default'=>0.8),
        'bkbgEntranceDelay'=>array('type'=>'number','default'=>0),
        'bkbgEntranceOnce'=>array('type'=>'boolean','default'=>true),
        'bkbgRotate'=>array('type'=>'boolean','default'=>false),
        'bkbgRotateDuration'=>array('type'=>'number','default'=>8),
        'bkbgRotateDelay'=>array('type'=>'number','default'=>0),
        'bkbgFloat'=>array('type'=>'boolean','default'=>false),
        'bkbgFloatX'=>array('type'=>'number','default'=>0),
        'bkbgFloatY'=>array('type'=>'number','default'=>-20),
        'bkbgFloatDuration'=>array('type'=>'number','default'=>6),
        'bkbgFloatDelay'=>array('type'=>'number','default'=>0),
    );
}
add_filter('register_block_type_args', function($args,$name) {
    if (strpos($name,'blockenberg/')===0) $args['attributes']=array_merge($args['attributes']??array(),bkbg_motion_attributes());
    return $args;
},5,2);
add_action('enqueue_block_editor_assets',function(){
    wp_enqueue_script('bkbg-motion-editor',plugins_url('../js/motion-editor.js',__FILE__),array('wp-blocks','wp-hooks','wp-element','wp-components','wp-i18n'),filemtime(__DIR__.'/../js/motion-editor.js'),false);
});
add_action('init',function(){
    wp_register_script('bkbg-motion-editor',plugins_url('../js/motion-editor.js',__FILE__),array('wp-blocks','wp-hooks','wp-element','wp-components','wp-i18n'),filemtime(__DIR__.'/../js/motion-editor.js'),false);
    wp_register_style('bkbg-motion',plugins_url('../css/motion.css',__FILE__),array(),filemtime(__DIR__.'/../css/motion.css'));
    wp_register_script('bkbg-motion',plugins_url('../js/motion.js',__FILE__),array(),filemtime(__DIR__.'/../js/motion.js'),true);
});
function bkbg_motion_clamp($v,$min,$max,$default) { return is_numeric($v)?max($min,min($max,(float)$v)):$default; }
add_filter('render_block',function($html,$block){
    if (strpos($block['blockName']??'','blockenberg/')!==0) return $html;
    $a=$block['attrs']??array(); $entrance=$a['bkbgEntrance']??''; $float=!empty($a['bkbgFloat']);$rotate=!empty($a['bkbgRotate']);
    $allowed=array('fadeIn','fadeInUp','fadeInDown','fadeInLeft','fadeInRight','zoomIn','slideInUp','slideInDown','slideInLeft','slideInRight','bounceIn','bounceInRight','bounceInUp','tada');
    if (!in_array($entrance,$allowed,true)) $entrance='';
    $responsive=false;foreach(array('Tablet','Mobile') as $device){$value=$a['bkbgEntrance'.$device]??'';if(in_array($value,$allowed,true))$responsive=true;}
    if (!$entrance&&!$responsive&&!$float&&!$rotate) return $html;
    $p=new WP_HTML_Tag_Processor($html);
    while($p->next_tag()) { if(!in_array($p->get_tag(),array('STYLE','SCRIPT','LINK'),true)) break; }
    if (!$p->get_tag()) return $html;
    $vars='';
    if($entrance||$responsive){
        $p->set_attribute('data-bkbg-entrance',$entrance);
        foreach(array('Tablet','Mobile') as $device){$value=$a['bkbgEntrance'.$device]??'';if(in_array($value,array_merge($allowed,array('none')),true))$p->set_attribute('data-bkbg-entrance-'.strtolower($device),$value);}
        $p->set_attribute('data-bkbg-once',($a['bkbgEntranceOnce']??true)?'1':'0');
        $vars.='--bkbg-enter-duration:'.bkbg_motion_clamp($a['bkbgEntranceDuration']??0.8,0.05,10,0.8).'s;--bkbg-enter-delay:'.bkbg_motion_clamp($a['bkbgEntranceDelay']??0,0,10,0).'s;';
    }
    if($float){
        $p->set_attribute('data-bkbg-float','1');
        $vars.='--bkbg-float-x:'.bkbg_motion_clamp($a['bkbgFloatX']??0,-200,200,0).'px;--bkbg-float-y:'.bkbg_motion_clamp($a['bkbgFloatY']??-20,-200,200,-20).'px;--bkbg-float-duration:'.bkbg_motion_clamp($a['bkbgFloatDuration']??6,0.5,60,6).'s;--bkbg-float-delay:'.bkbg_motion_clamp($a['bkbgFloatDelay']??0,0,60,0).'s;';
    }
    if($rotate){$p->set_attribute('data-bkbg-rotate','1');$vars.='--bkbg-rotate-duration:'.bkbg_motion_clamp($a['bkbgRotateDuration']??8,.5,120,8).'s;--bkbg-rotate-delay:'.bkbg_motion_clamp($a['bkbgRotateDelay']??0,0,60,0).'s;';}
    $p->set_attribute('style',($p->get_attribute('style')??'').';'.$vars);
    wp_enqueue_style('bkbg-motion'); wp_enqueue_script('bkbg-motion');
    return $p->get_updated_html();
},30,2);

function bkbg_post_has_motion($blocks){foreach($blocks as $b){if(strpos($b['blockName']??'','blockenberg/')===0&&(!empty($b['attrs']['bkbgEntrance'])||!empty($b['attrs']['bkbgEntranceTablet'])||!empty($b['attrs']['bkbgEntranceMobile'])||!empty($b['attrs']['bkbgFloat'])||!empty($b['attrs']['bkbgRotate'])))return true;if(!empty($b['innerBlocks'])&&bkbg_post_has_motion($b['innerBlocks']))return true;}return false;}
add_action('wp_enqueue_scripts',function(){if(is_singular()&&bkbg_post_has_motion(parse_blocks(get_post_field('post_content',get_queried_object_id())))){wp_enqueue_style('bkbg-motion');wp_enqueue_script('bkbg-motion');}});
