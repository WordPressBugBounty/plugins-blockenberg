<?php
/** Private, per-user and per-page conversations, independent of pairing credentials. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function bkbg_chat_key( $user, $post ) { return 'bkbg_ai_chats_' . get_current_blog_id() . '_' . (int) $user . '_' . (int) $post; }
function bkbg_chat_read( $user, $post ) {
    $value = get_option( bkbg_chat_key( $user, $post ) );
    return is_array( $value ) ? $value : array( 'active' => '', 'chats' => array() );
}
function bkbg_chat_change( $user, $post, $callback ) {
    global $wpdb;
    $key = bkbg_chat_key( $user, $post );
    add_option( $key, array( 'active' => '', 'chats' => array() ), '', false );
    for ( $i = 0; $i < 5; $i++ ) {
        wp_cache_delete( $key, 'options' ); $old = get_option( $key ); $next = $old;
        $result = $callback( $next );
        if ( is_wp_error( $result ) ) { return $result; }
        if ( $next === $old ) { return $next; }
        if ( strlen( maybe_serialize( $next ) ) > 15000000 ) { return bkbg_external_error( 'Conversation storage is full.', 413 ); }
        $changed = $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->options} SET option_value=%s WHERE option_name=%s AND BINARY option_value=BINARY %s", maybe_serialize( $next ), $key, maybe_serialize( $old ) ) );
        wp_cache_delete( $key, 'options' );
        if ( 1 === $changed ) { return $next; }
    }
    return bkbg_external_error( 'Chat changed concurrently. Retry saving.', 409 );
}
function bkbg_chat_valid_id( $id ) { return is_string( $id ) && preg_match( '/^[a-zA-Z0-9_-]{8,80}$/D', $id ); }
function bkbg_chat_save( $request ) {
    $chat = $request['chat'];
    if ( strlen( $request->get_body() ) > 2000000 || ! is_array( $chat ) || ! bkbg_chat_valid_id( $chat['id'] ?? null ) || ! is_array( $chat['messages'] ?? null ) || ! is_array( $chat['history'] ?? null ) ) { return bkbg_external_error( 'Invalid or oversized conversation.', 413 ); }
    foreach ( $chat['messages'] as $message ) {
        if ( ! is_array( $message ) || ! in_array( $message['role'] ?? '', array( 'user', 'assistant', 'error' ), true ) || ! is_string( $message['text'] ?? null ) ) { return bkbg_external_error( 'Invalid chat message.' ); }
    }
    $chat['title'] = sanitize_text_field( substr( $chat['title'] ?? 'Conversation', 0, 240 ) );
    return bkbg_chat_change( get_current_user_id(), absint( $request['post_id'] ), function ( &$library ) use ( $chat ) {
        $id = $chat['id']; $old = $library['chats'][ $id ] ?? array();
        // External messages may arrive while the editor saves. Preserve those IDs.
        $ids = array();
        foreach ( $chat['messages'] as $index => $incoming ) { if ( isset( $incoming['id'] ) ) { $ids[ $incoming['id'] ] = $index; } }
        foreach ( $old['messages'] ?? array() as $message ) {
            if ( ! empty( $message['external'] ) ) {
                $index = $ids[ $message['id'] ] ?? null;
                if ( null === $index ) { $chat['messages'][] = $message; }
                elseif ( 'queued' !== ( $message['status'] ?? '' ) ) { $chat['messages'][ $index ] = $message; }
            }
        }
        $chat['updated'] = microtime( true ) * 1000;
        $library['chats'][ $id ] = $chat; $library['active'] = $id;
    } );
}
function bkbg_chat_append( $s, $message ) {
    if ( empty( $s['chat_id'] ) ) { return true; } // Legacy sessions have no saved conversation.
    return bkbg_chat_change( $s['user'], $s['post'], function ( &$library ) use ( $s, $message ) {
        $id = $s['chat_id'];
        if ( empty( $library['chats'][ $id ] ) ) { $library['chats'][ $id ] = array( 'id' => $id, 'title' => 'External conversation', 'messages' => array(), 'history' => array() ); }
        $chat = &$library['chats'][ $id ];
        foreach ( $chat['messages'] as &$old ) { if ( ( $old['id'] ?? '' ) === $message['id'] ) { $old = $message; $chat['updated'] = microtime( true ) * 1000; return; } } unset( $old );
        $chat['messages'][] = $message; $chat['updated'] = microtime( true ) * 1000;
    } );
}
function bkbg_chat_can_access( $request ) {
    if ( ! bkbg_ai_user_can_use() ) {
        return false;
    }
    $post_id = absint( $request['post_id'] );
    return $post_id && get_post( $post_id ) && current_user_can( 'edit_post', $post_id );
}
add_action( 'rest_api_init', function () {
    register_rest_route( 'blockenberg/v1', '/ai/conversations/(?P<post_id>\d+)', array(
        array( 'methods' => 'GET', 'callback' => function ( $r ) { return bkbg_chat_read( get_current_user_id(), absint( $r['post_id'] ) ); }, 'permission_callback' => 'bkbg_chat_can_access' ),
        array( 'methods' => 'POST', 'callback' => 'bkbg_chat_save', 'permission_callback' => 'bkbg_chat_can_access' ),
    ) );
} );

add_filter( 'rest_post_dispatch', function ( $response, $server, $request ) {
    if ( strpos( $request->get_route(), '/blockenberg/v1/ai/conversations/' ) === 0 && $response instanceof WP_REST_Response ) { $response->header( 'Cache-Control', 'no-store, private' ); }
    return $response;
}, 10, 3 );
