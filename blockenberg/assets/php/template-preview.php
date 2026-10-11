<?php
/** Authenticated catalogue preview; renders bundled blocks without creating posts/media. */
defined('ABSPATH') || exit;
add_action('template_redirect',function(){
    if(!isset($_GET['bkbg_template_preview']))return;
    if(!current_user_can('manage_options')){auth_redirect();exit;}
    show_admin_bar(false);
    $key=sanitize_key(wp_unslash($_GET['bkbg_template_preview']));$data=bkbg_template_data($key,true);
    if(is_wp_error($data))wp_die(esc_html($data->get_error_message()),'Template preview',array('response'=>403));
    if(!$data)wp_die('Template is not available.', 'Template preview',array('response'=>404));
    $valid=bkbg_template_validate_nodes($data['blocks']??array());if(is_wp_error($valid))wp_die(esc_html($valid->get_error_message()));
    $content='';foreach($data['blocks'] as $node)$content.=bkbg_template_serialize($node);
    // Render first so Gutenberg registers every needed view asset before wp_head.
    $rendered=do_blocks($content);
    wp_enqueue_style('bkbg-template-pilot');wp_enqueue_style('bkbg-template-components');
    wp_enqueue_script('bkbg-template-pilot-front');wp_enqueue_script('bkbg-template-components-front');
    if(bkbg_post_has_motion(parse_blocks($content))){wp_enqueue_style('bkbg-motion');wp_enqueue_script('bkbg-motion');}
    bkbg_library_enqueue_template_style($key,$data['blocks'][0]['attrs']['templateStyleUrl']??'');
    nocache_headers();header('X-Robots-Tag: noindex, nofollow');
    ?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><title><?php echo esc_html($data['title'].' — Blockenberg preview'); ?></title><?php wp_head(); ?></head><body <?php body_class('bkbg-template-canvas'); ?>><?php wp_body_open(); echo $rendered; wp_footer(); ?></body></html><?php
    exit;
},1);
