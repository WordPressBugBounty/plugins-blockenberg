<?php
/** Cooperative messaging: the connected agent polls; WordPress cannot wake a stopped client. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function bkbg_external_conversation( $s ) {
    $library = bkbg_chat_read( $s['user'], $s['post'] );
    $messages = $library['chats'][ $s['chat_id'] ?? '' ]['messages'] ?? array();
    return array_values( array_map( function ( $m ) { return array_intersect_key( $m, array_flip( array( 'role', 'text', 'status', 'id' ) ) ); }, array_slice( $messages, -100 ) ) );
}
function bkbg_external_message( $request, $editor = false ) {
    $id = $request['id']; $text = $request['text']; $role = $editor ? 'user' : $request['role'];
    if ( ! bkbg_chat_valid_id( $id ) || ! is_string( $text ) || ! trim( $text ) || strlen( $text ) > 24000 || ! in_array( $role, array( 'user', 'assistant' ), true ) ) { return bkbg_external_error( 'Supply a unique id, role and message text (up to 24 KB).' ); }
    $result = bkbg_external_change( $request['session'], function ( &$s ) use ( $id, $text, $role, $editor, $request ) {
        $messages = $s['messages'] ?? array();
        if ( isset( $messages[ $id ] ) ) {
            $m = $messages[ $id ];
            return $m['text'] === $text && $m['role'] === $role && $m['source'] === ( $editor ? 'panel' : 'agent' ) ? $m : bkbg_external_error( 'Message id belongs to different content.', 409 );
        }
        if ( count( $messages ) >= 300 ) { return bkbg_external_error( 'Message capacity reached. Reconnect to continue this saved chat.', 409 ); }
        $m = array( 'id' => $id, 'role' => $role, 'text' => $text, 'external' => true, 'source' => $editor ? 'panel' : 'agent', 'status' => $editor ? 'queued' : 'received', 'created' => microtime( true ) * 1000 );
        $s['messages'][ $id ] = $m;
        if ( ! $editor ) { $s['agent_seen'] = time(); }
        return $m;
    } );
    if ( is_wp_error( $result ) ) { return $result; }
    $saved = bkbg_chat_append( bkbg_external_read( $request['session'] ), $result );
    return is_wp_error( $saved ) ? $saved : $result;
}
function bkbg_external_inbox( $request ) {
    return bkbg_external_change( $request['session'], function ( &$s ) {
        $s['agent_seen'] = time();
        return array( 'messages' => array_values( array_filter( $s['messages'] ?? array(), function ( $m ) { return 'panel' === $m['source'] && 'queued' === $m['status']; } ) ) );
    } );
}
function bkbg_external_ack_message( $request ) {
    $result = bkbg_external_change( $request['session'], function ( &$s ) use ( $request ) {
        $id = $request['message'];
        if ( empty( $s['messages'][ $id ] ) || 'panel' !== $s['messages'][ $id ]['source'] ) { return bkbg_external_error( 'Unknown inbox message.', 404 ); }
        $s['messages'][ $id ]['status'] = 'read'; $s['agent_seen'] = time();
        return $s['messages'][ $id ];
    } );
    if ( is_wp_error( $result ) ) { return $result; }
    $saved = bkbg_chat_append( bkbg_external_read( $request['session'] ), $result );
    return is_wp_error( $saved ) ? $saved : $result;
}
add_action( 'rest_api_init', function () {
    $base = '/ai/external/(?P<session>[a-f0-9]{32})';
    register_rest_route( 'blockenberg/v1', $base . '/messages', array( 'methods' => 'POST', 'callback' => 'bkbg_external_message', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ) );
    register_rest_route( 'blockenberg/v1', $base . '/outbox', array( 'methods' => 'POST', 'callback' => function ( $r ) { return bkbg_external_message( $r, true ); }, 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r, true ); } ) );
    register_rest_route( 'blockenberg/v1', $base . '/inbox', array( 'methods' => 'GET', 'callback' => 'bkbg_external_inbox', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ) );
    register_rest_route( 'blockenberg/v1', $base . '/inbox/(?P<message>[a-zA-Z0-9_-]{8,80})/ack', array( 'methods' => 'POST', 'callback' => 'bkbg_external_ack_message', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ) );
} );
