<?php
/** Keep third-party admin notices outside Blockenberg page headers. */
defined( 'ABSPATH' ) || exit;

add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( ! in_array( $hook, array( 'toplevel_page_blockenberg', 'blockenberg_page_blockenberg-ai', 'blockenberg_page_blockenberg-templates' ), true ) ) {
        return;
    }
    $base = dirname( __DIR__, 2 );
    $url = plugins_url( '', $base . '/blockenberg.php' );
    wp_enqueue_style( 'bkbg-admin-notices', $url . '/assets/css/admin-notices.css', array(), filemtime( $base . '/assets/css/admin-notices.css' ) );
    wp_enqueue_script( 'bkbg-admin-notices', $url . '/assets/js/admin-notices.js', array( 'jquery', 'common' ), filemtime( $base . '/assets/js/admin-notices.js' ), true );
    wp_localize_script( 'bkbg-admin-notices', 'bkbgAdminNotices', array( 'label' => __( 'Notifications', 'blockenberg' ) ) );
} );
