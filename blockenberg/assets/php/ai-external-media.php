<?php
/** Progress and raster uploads from a paired external agent. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/** Start at actual agent work, not while waiting for pairing. Finish only once. */
function bkbg_external_run_clock( &$s, $finish = false ) {
    if ( $finish ) {
        if ( ! empty( $s['run'] ) && empty( $s['run']['finished_at'] ) ) { $s['run']['finished_at'] = microtime( true ); }
    } elseif ( empty( $s['run'] ) || ! empty( $s['run']['finished_at'] ) ) {
        $s['run'] = array( 'id' => wp_generate_uuid4(), 'started_at' => microtime( true ), 'finished_at' => null );
    }
}
function bkbg_external_progress( $request ) {
    $phase = $request['phase']; $message = $request['message']; $plan = $request['plan'];
    if ( strlen( $request->get_body() ) > 16000 || ! in_array( $phase, array( 'planning', 'building', 'generating_image', 'reviewing', 'waiting', 'done', 'error' ), true ) || ! is_string( $message ) || mb_strlen( $message ) > 500 ) {
        return bkbg_external_error( 'Supply a supported phase and a message of up to 500 characters.' );
    }
    $clean = array();
    if ( null !== $plan ) {
        if ( ! is_array( $plan ) || count( $plan ) > 12 ) { return bkbg_external_error( 'A plan can have up to 12 steps.' ); }
        foreach ( $plan as $step ) {
            if ( ! is_array( $step ) || ! is_string( $step['id'] ?? null ) || ! preg_match( '/^[a-zA-Z0-9_-]{1,60}$/D', $step['id'] ) || isset( $clean[ $step['id'] ] ) || ! is_string( $step['label'] ?? null ) || mb_strlen( $step['label'] ) > 160 || ! in_array( $step['status'] ?? '', array( 'pending', 'active', 'done' ), true ) ) {
                return bkbg_external_error( 'Plan steps need unique ids, short labels and pending, active or done status.' );
            }
            $clean[ $step['id'] ] = array( 'id' => $step['id'], 'label' => sanitize_text_field( $step['label'] ), 'status' => $step['status'] );
        }
    }
    return bkbg_external_change( $request['session'], function ( &$s ) use ( $phase, $message, $plan, $clean ) {
        if ( 'done' === $phase ) {
            foreach ( $s['messages'] ?? array() as $message ) {
                if ( 'panel' === $message['source'] && 'queued' === $message['status'] ) { return bkbg_external_error( 'New user messages are waiting. Read /inbox and acknowledge them before finishing.', 409 ); }
            }
            $current_capture = empty( $s['captures'] );
            foreach ( $s['captures'] ?? array() as $capture ) {
                if ( $capture['revision'] === ( $s['visual_revision'] ?? 0 ) ) { $current_capture = true; }
                if ( 'passed' !== $capture['reviewed'] ) { return bkbg_external_error( 'Capture the finished section again and review its current screenshots before marking done.', 409 ); }
            }
        }
        if ( 'done' === $phase && !$current_capture ) { return bkbg_external_error( 'The page changed after its screenshots. Capture and review the updated section.', 409 ); }
        bkbg_external_run_clock( $s, in_array( $phase, array( 'done', 'error' ), true ) );
        $s['agent_seen'] = time();
        $s['progress'] = array( 'phase' => $phase, 'message' => sanitize_text_field( $message ), 'updated' => time(), 'plan' => null === $plan ? ( $s['progress']['plan'] ?? array() ) : array_values( $clean ) );
        return array( 'ok' => true );
    } );
}

function bkbg_external_image_result( $request ) {
    if ( ! is_string( $request['upload'] ) || ! preg_match( '/^[a-zA-Z0-9_-]{8,80}$/D', $request['upload'] ) ) { return bkbg_external_error( 'Invalid upload id.' ); }
    $s = bkbg_external_read( $request['session'] );
    if ( ! $s ) { return bkbg_external_error( 'Session expired.', 410 ); }
    $item = $s['images'][ $request['upload'] ] ?? null;
    if ( ! $item ) { return bkbg_external_error( 'Unknown upload.', 404 ); }
    return array_intersect_key( $item, array_flip( array( 'status', 'image', 'error' ) ) );
}

function bkbg_external_upload_image( $request ) {
    if ( ! is_string( $request['upload'] ) || ! preg_match( '/^[a-zA-Z0-9_-]{8,80}$/D', $request['upload'] ) ) { return bkbg_external_error( 'Invalid upload id.' ); }
    $s = bkbg_external_read( $request['session'] );
    if ( ! $s ) { return bkbg_external_error( 'Session expired.', 410 ); }
    if ( ! user_can( $s['user'], 'upload_files' ) ) { return bkbg_external_error( 'This user cannot upload images.', 403 ); }
    $bytes = $request->get_body();
    if ( ! strlen( $bytes ) || strlen( $bytes ) > min( 20 * MB_IN_BYTES, wp_max_upload_size() ) ) { return bkbg_external_error( 'Image exceeds the upload limit or is empty.', 413 ); }
    $info = @getimagesizefromstring( $bytes );
    $extensions = array( 'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp' );
    if ( ! $info || ! isset( $extensions[ $info['mime'] ] ) || $request->get_header( 'content-type' ) !== $info['mime'] || $info[0] * $info[1] > 40000000 ) {
        return bkbg_external_error( 'Upload a valid PNG, JPEG or WebP image up to 40 megapixels, with its matching Content-Type.' );
    }
    $meta = array();
    foreach ( array( 'filename' => 200, 'title' => 200, 'alt' => 1000 ) as $key => $limit ) {
        $value = $request[ $key ] ?? '';
        if ( ! is_string( $value ) || mb_strlen( $value ) > $limit ) { return bkbg_external_error( 'Invalid image metadata.' ); }
        $meta[ $key ] = sanitize_text_field( $value );
    }
    $id = $request['upload'];
    $fingerprint = hash( 'sha256', $bytes . wp_json_encode( $meta ) );
    // Reserve before writing any file. A retry cannot create a second attachment.
    $reservation = bkbg_external_change( $request['session'], function ( &$current ) use ( $id, $fingerprint ) {
        $images = $current['images'] ?? array();
        if ( isset( $images[ $id ] ) ) {
            return $images[ $id ]['fingerprint'] === $fingerprint ? array( 'existing' => true ) : bkbg_external_error( 'This upload id belongs to another image.', 409 );
        }
        if ( count( $images ) >= 40 ) { return bkbg_external_error( 'Session image capacity reached.', 409 ); }
        foreach ( $images as $image ) {
            if ( 'uploading' === $image['status'] ) { return bkbg_external_error( 'Wait for the previous image upload.', 409 ); }
        }
        if ( time() - $current['heartbeat'] > 15 ) { return bkbg_external_error( 'The editor is offline. Open the AI sidebar.', 409 ); }
        bkbg_external_run_clock( $current );
        $current['agent_seen'] = time();
        $current['images'][ $id ] = array( 'fingerprint' => $fingerprint, 'status' => 'uploading' );
        return array( 'existing' => false );
    } );
    if ( is_wp_error( $reservation ) ) { return $reservation; }
    if ( $reservation['existing'] ) { return bkbg_external_image_result( $request ); }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    $filename = sanitize_file_name( pathinfo( $meta['filename'] ?: 'generated-image', PATHINFO_FILENAME ) ) . '.' . $extensions[ $info['mime'] ];
    $temp = wp_tempnam( $filename );
    $attachment = 0;
    $previous_user = get_current_user_id();
    try {
        if ( ! $temp || file_put_contents( $temp, $bytes ) !== strlen( $bytes ) ) { throw new RuntimeException( 'Could not write the image upload.' ); }
        wp_set_current_user( $s['user'] );
        $attachment = media_handle_sideload( array( 'name' => $filename, 'tmp_name' => $temp, 'error' => 0, 'size' => strlen( $bytes ) ), $s['post'], $meta['title'] ?: 'Generated image' );
        if ( is_wp_error( $attachment ) ) { throw new RuntimeException( $attachment->get_error_message() ); }
        update_post_meta( $attachment, '_wp_attachment_image_alt', $meta['alt'] );
        update_post_meta( $attachment, '_bkbg_ai_generated', true );
        update_post_meta( $attachment, '_bkbg_ai_external_agent', $s['agent'] );
        $size = wp_get_attachment_metadata( $attachment );
        $image = array( 'id' => $attachment, 'url' => wp_get_attachment_url( $attachment ), 'alt' => $meta['alt'], 'width' => $size['width'] ?? $info[0], 'height' => $size['height'] ?? $info[1], 'mime' => get_post_mime_type( $attachment ) );
        $saved = bkbg_external_change( $request['session'], function ( &$current ) use ( $id, $image ) {
            $current['images'][ $id ]['status'] = 'done';
            $current['images'][ $id ]['image'] = $image;
            $current['agent_seen'] = time();
            return array( 'status' => 'done', 'image' => $image );
        } );
        if ( is_wp_error( $saved ) ) { throw new RuntimeException( $saved->get_error_message() ); }
        return $saved;
    } catch ( Throwable $error ) {
        if ( is_int( $attachment ) && $attachment > 0 ) { wp_delete_attachment( $attachment, true ); }
        bkbg_external_change( $request['session'], function ( &$current ) use ( $id, $error ) {
            $current['images'][ $id ]['status'] = 'error';
            $current['images'][ $id ]['error'] = $error->getMessage();
            return true;
        } );
        return bkbg_external_error( $error->getMessage(), 500 );
    } finally {
        wp_set_current_user( $previous_user );
        if ( $temp && file_exists( $temp ) ) { wp_delete_file( $temp ); }
    }
}
