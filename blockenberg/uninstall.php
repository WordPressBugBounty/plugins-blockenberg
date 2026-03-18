<?php

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Subscriber storage options (current and legacy names).
delete_option( 'blockenberg_newsletter_subscribers' );
delete_option( 'blockenberg_subscribers' );
