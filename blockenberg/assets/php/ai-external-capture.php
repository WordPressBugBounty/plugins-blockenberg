<?php
/** Session-private screenshots: no public uploads or model credentials. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function bkbg_external_render_section( $request ) {
    $s = bkbg_external_read( $request['session'] );
    if ( ! $s ) { return bkbg_external_error( 'Session expired.', 410 ); }
    $content = $request['content'];
    if ( ! is_string( $content ) || strlen( $content ) > 1000000 ) { return bkbg_external_error( 'Section content is too large.', 413 ); }
    $blocks = parse_blocks( $content );
    if ( count( $blocks ) !== 1 || empty( $blocks[0]['blockName'] ) ) { return bkbg_external_error( 'Supply one serialized section.' ); }
    $previous = $GLOBALS['post'] ?? null;
    try {
        $GLOBALS['post'] = get_post( $s['post'] );
        $html = render_block( $blocks[0] );
        return array( 'html' => $html, 'themeCss' => function_exists( 'wp_get_global_stylesheet' ) ? wp_get_global_stylesheet() : '' );
    } finally { $GLOBALS['post'] = $previous; }
}
function bkbg_external_save_capture( $request ) {
    $id = $request->get_url_params()['capture'];
    $data = $request['data'];
    if ( strlen( $request->get_body() ) > 4300000 || ! is_string( $data ) || strpos( $data, 'data:image/png;base64,' ) !== 0 ) { return bkbg_external_error( 'Supply a PNG screenshot up to 3 MB.', 413 ); }
    $bytes = base64_decode( substr( $data, 22 ), true );
    $info = $bytes ? @getimagesizefromstring( $bytes ) : false;
    if ( ! $info || 'image/png' !== $info['mime'] || $info[0] > 1600 || $info[1] > 6000 || ! in_array( $request['viewport'], array( 'desktop', 'mobile' ), true ) || ! is_string( $request['clientId'] ) || strlen( $request['clientId'] ) > 100 ) { return bkbg_external_error( 'Invalid section screenshot.' ); }
    $warnings = array_slice( array_filter( (array) $request['warnings'], 'is_string' ), 0, 10 );
    $record = array( 'data' => base64_encode( $bytes ), 'clientId' => $request['clientId'], 'viewport' => $request['viewport'], 'width' => $info[0], 'height' => $info[1], 'warnings' => array_map( 'sanitize_text_field', $warnings ), 'captured_at' => time(), 'reviewed' => false, 'delivered' => false );
    return bkbg_external_change( $request['session'], function ( &$s ) use ( $id, $record ) {
        $captures = $s['captures'] ?? array();
        if ( isset( $captures[ $id ] ) ) {
            if ( $captures[ $id ]['data'] !== $record['data'] ) { return bkbg_external_error( 'Capture id already used.', 409 ); }
        } else {
            foreach ( $captures as $old_id => $old ) { if ( $old['clientId'] === $record['clientId'] && $old['viewport'] === $record['viewport'] ) { unset( $captures[ $old_id ] ); } }
            $record['revision'] = $s['visual_revision'] ?? 0;
            $captures[ $id ] = $record;
            $s['captures'] = array_slice( $captures, -4, null, true );
        }
        return array( 'id' => $id, 'path' => '/captures/' . $id, 'width' => $record['width'], 'height' => $record['height'], 'viewport' => $record['viewport'], 'warnings' => $record['warnings'], 'kind' => 'wordpress-static-render', 'review_required' => true );
    } );
}
function bkbg_external_get_capture( $request ) {
    $s = bkbg_external_read( $request['session'] );
    $id = $request->get_url_params()['capture'];
    if ( ! $s ) { return bkbg_external_error( 'Session expired.', 410 ); }
    if ( empty( $s['captures'][ $id ] ) ) { return bkbg_external_error( 'Screenshot expired. Capture the section again.', 404 ); }
    $delivery = bkbg_external_change( $request['session'], function ( &$current ) use ( $id ) {
        if ( empty( $current['captures'][ $id ] ) ) { return bkbg_external_error( 'Screenshot expired.', 404 ); }
        $current['captures'][ $id ]['delivered'] = true;
        return true;
    } );
    if ( is_wp_error( $delivery ) ) { return $delivery; }
    return new WP_REST_Response( base64_decode( $s['captures'][ $id ]['data'] ), 200, array( 'Content-Type' => 'image/png', 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'no-store, private' ) );
}
function bkbg_external_review_capture( $request ) {
    $ids = $request['capture_ids']; $decision = $request['decision']; $notes = $request['notes'];
    if ( ! is_array( $ids ) || ! count( $ids ) || count( $ids ) > 4 || array_filter( $ids, function ( $id ) { return ! is_string( $id ); } ) || ! in_array( $decision, array( 'passed', 'needs_changes' ), true ) || ! is_string( $notes ) || ! trim( $notes ) || strlen( $notes ) > 6000 ) { return bkbg_external_error( 'Supply capture_ids, decision (passed or needs_changes), and visual review notes.' ); }
    return bkbg_external_change( $request['session'], function ( &$s ) use ( $ids, $decision, $notes ) {
        foreach ( $ids as $id ) {
            if ( empty( $s['captures'][ $id ] ) || $s['captures'][ $id ]['revision'] !== ( $s['visual_revision'] ?? 0 ) ) { return bkbg_external_error( 'Screenshot is missing or predates the last edit. Capture again before reviewing.', 409 ); }
        }
        foreach ( $ids as $id ) { if ( empty( $s['captures'][ $id ]['delivered'] ) ) { return bkbg_external_error( 'Download and open each screenshot before submitting its visual review.', 409 ); } }
        foreach ( $ids as $id ) { $s['captures'][ $id ]['reviewed'] = $decision; }
        $s['visual_review'] = array( 'decision' => $decision, 'notes' => sanitize_textarea_field( $notes ), 'updated' => time() );
        return array( 'ok' => true, 'decision' => $decision );
    } );
}
add_filter( 'rest_pre_serve_request', function ( $served, $response, $request ) {
    if ( preg_match( '#^/blockenberg/v1/ai/external/[a-f0-9]{32}/captures/[a-zA-Z0-9_-]+$#D', $request->get_route() ) && 'GET' === $request->get_method() && 200 === $response->get_status() && ( $response->get_headers()['Content-Type'] ?? '' ) === 'image/png' ) {
        echo $response->get_data(); // Validated PNG, available only after bearer authorization.
        return true;
    }
    return $served;
}, 10, 3 );
