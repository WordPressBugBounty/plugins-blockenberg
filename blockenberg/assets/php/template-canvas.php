<?php defined('ABSPATH') || exit; ?><!doctype html>
<html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('bkbg-template-canvas'); ?>><?php wp_body_open(); while(have_posts()){the_post();echo do_blocks(get_the_content());} wp_footer(); ?></body></html>
