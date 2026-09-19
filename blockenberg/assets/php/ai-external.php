<?php
/** Temporary, page-scoped external agent sessions. No provider credentials leave WordPress. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

require_once __DIR__ . '/ai-conversations.php';

function bkbg_external_error( $message, $status = 400 ) {
    return new WP_Error( 'bkbg_external', $message, array( 'status' => $status ) );
}
function bkbg_external_key( $id ) { return 'bkbg_ext_' . $id; }
function bkbg_external_tools() {
    return array( 'search_blocks', 'get_block_schema', 'get_page_structure', 'get_block_details', 'build_section', 'insert_blocks', 'insert_html_section', 'update_block', 'replace_block', 'remove_blocks', 'move_block', 'set_post_title', 'set_custom_css', 'unwrap_block', 'create_image', 'capture_section' );
}
function bkbg_external_read( $id ) {
    if ( ! is_string( $id ) || ! preg_match( '/^[a-f0-9]{32}$/D', $id ) ) { return false; }
    $session = get_option( bkbg_external_key( $id ) );
    if ( ! is_array( $session ) ) { return false; }
    if ( $session['expires'] <= time() || ! user_can( $session['user'], 'edit_post', $session['post'] ) ) {
        delete_option( bkbg_external_key( $id ) );
        return false;
    }
    return $session;
}
/** Compare-and-swap prevents concurrent claims, duplicate delivery and lost acknowledgements. */
function bkbg_external_change( $id, $change ) {
    global $wpdb;
    for ( $attempt = 0; $attempt < 5; $attempt++ ) {
        $old = bkbg_external_read( $id );
        if ( ! $old ) { return bkbg_external_error( 'Session expired or disconnected.', 410 ); }
        $next = $old;
        $result = $change( $next );
        if ( is_wp_error( $result ) ) { return $result; }
        if ( $next === $old ) { return $result; }
        $updated = $wpdb->query( $wpdb->prepare(
            "UPDATE {$wpdb->options} SET option_value = %s WHERE option_name = %s AND BINARY option_value = BINARY %s",
            maybe_serialize( $next ), bkbg_external_key( $id ), maybe_serialize( $old )
        ) );
        wp_cache_delete( bkbg_external_key( $id ), 'options' );
        if ( 1 === $updated ) { return $result; }
    }
    return bkbg_external_error( 'Session is busy. Retry the same request ID.', 409 );
}
function bkbg_external_secret_matches( $secret, $hash ) {
    return is_string( $secret ) && strlen( $secret ) === 64 && is_string( $hash ) && strlen( $hash ) === 64 && hash_equals( $hash, hash( 'sha256', $secret ) );
}
function bkbg_external_authorize( $request, $editor = false ) {
    $s = bkbg_external_read( $request['session'] );
    if ( ! $s ) { return bkbg_external_error( 'Session expired or disconnected.', 410 ); }
    if ( $editor ) {
        $allowed = get_current_user_id() === $s['user'] && current_user_can( 'edit_post', $s['post'] ) && bkbg_external_secret_matches( $request->get_header( 'x-blockenberg-editor' ), $s['editor_hash'] );
    } else {
        $header = $request->get_header( 'authorization' );
        $token = preg_match( '/^Bearer ([a-f0-9]{64})$/D', $header, $match ) ? $match[1] : '';
        $allowed = bkbg_external_secret_matches( $token, $s['agent_hash'] );
    }
    return $allowed ? true : bkbg_external_error( 'Invalid session credential.', 403 );
}
function bkbg_external_pairing_clients() {
    return array(
        'codex'  => array(
            'agent' => 'Codex',
            'notes' => '',
        ),
        'claude' => array(
            'agent' => 'Claude Code',
            'notes' => 'You are Claude Code on the same computer as this WordPress site. Open downloaded screenshot PNGs with your Read/image tool before reviewing.',
        ),
        'cursor' => array(
            'agent' => 'Cursor',
            'notes' => 'You are a local Cursor agent on the same computer as this WordPress site. Claim with agent "Cursor". Use Shell curl for every session HTTP call, including binary image uploads; do not use a page-fetch tool that drops Authorization headers or request bodies. Do not use a Cursor Cloud or background agent: it cannot reach this editor. After downloading a screenshot, open the PNG file itself with your image-reading tool. If image generation is available, write a temporary raster file, upload the raw bytes, then delete the temp file; never add it to a repository. Do not edit plugin, theme, WordPress or project files. Ignore any open git workspace. Change this page only through the session tools.',
        ),
    );
}

function bkbg_external_pairing_prompt( $base, $ticket, $client ) {
    $clients = bkbg_external_pairing_clients();
    if ( ! isset( $clients[ $client ] ) ) {
        $client = 'codex';
    }
    $claim  = wp_json_encode( array( 'code' => 'PAIRING_CODE', 'agent' => $clients[ $client ]['agent'] ) );
    $prompt = "Connect to my open Gutenberg page using this temporary Blockenberg session.\nBase URL: {$base}\nOne-use pairing code: {$ticket}\nUse HTTP requests from your local execution environment. POST JSON to BASE/claim with {$claim}. Keep the returned bearer token private, outside the repository and chat output. Do not print credentials or put them in URLs. GET BASE/context with Authorization: Bearer TOKEN to read the tool schemas and workflow. Report your plan and progress through POST BASE/progress as described in the context. Build and insert one complete section at a time so I can see the page take shape. For images, prefer your own image-generation tool and upload the resulting file through the session image endpoint; do not silently substitute web search or a paid API. After each section, download and open the returned screenshots and follow visual_review in the context before reporting completion. Then ask me what to build if I have not supplied a task. Do not edit files or the WordPress database: use only the session tools to change this page. Keep the editor tab open; the AI sidebar can be hidden. Mirror my task and your replies via /messages and check /inbox between operations as described in /context. This session expires after one hour. Do not start an indefinite waiting loop when the task is finished.";
    if ( $clients[ $client ]['notes'] ) {
        $prompt .= "\n" . $clients[ $client ]['notes'];
    }
    return $prompt;
}

function bkbg_external_create( $request ) {
    $host = wp_parse_url( home_url(), PHP_URL_HOST );
    if ( ! is_ssl() && ! preg_match( '/(^localhost$|^127\.0\.0\.1$|\.(local|test)$)/i', (string) $host ) ) {
        return bkbg_external_error( 'External sessions require HTTPS, except on local development sites.', 400 );
    }
    $post = absint( $request['post_id'] );
    if ( ! $post || ! current_user_can( 'edit_post', $post ) || ! get_post( $post ) ) { return bkbg_external_error( 'You cannot edit this page.', 403 ); }
    $scope = $request['scope'];
    if ( ! is_array( $scope ) || ! in_array( $scope['mode'] ?? '', array( 'page', 'selection' ), true ) || ! isset( $scope['rootIds'] ) || ! is_array( $scope['rootIds'] ) || ( 'selection' === $scope['mode'] && ! count( $scope['rootIds'] ) ) ) {
        return bkbg_external_error( 'Choose a page or a block selection.' );
    }
    if ( count( $scope['rootIds'] ) > 100 || array_filter( $scope['rootIds'], function ( $id ) { return ! is_string( $id ) || strlen( $id ) > 100; } ) || ! is_string( $request['instructions'] ) || ! is_array( $request['tools'] ) ) {
        return bkbg_external_error( 'Invalid editor context.' );
    }
    if ( strlen( $request->get_body() ) > 500000 ) { return bkbg_external_error( 'Session context is too large.', 413 ); }
    $id = bin2hex( random_bytes( 16 ) );
    $ticket = bin2hex( random_bytes( 32 ) );
    $editor = bin2hex( random_bytes( 32 ) );
    $s = array(
        'user' => get_current_user_id(), 'post' => $post, 'scope' => $scope,
        'chat_id' => bkbg_chat_valid_id( $request['chat_id'] ) ? $request['chat_id'] : '', 'messages' => array(),
        'expires' => time() + HOUR_IN_SECONDS, 'heartbeat' => time(),
        'editor_hash' => hash( 'sha256', $editor ), 'ticket_hash' => hash( 'sha256', $ticket ), 'agent_hash' => '',
        'agent' => '', 'commands' => array(), 'images' => array(), 'progress' => null, 'agent_seen' => 0, 'instructions' => (string) $request['instructions'],
        'tools' => array_values( array_filter( (array) $request['tools'], function ( $tool ) {
            return is_array( $tool ) && in_array( $tool['function']['name'] ?? '', bkbg_external_tools(), true );
        } ) ),
    );
    add_option( bkbg_external_key( $id ), $s, '', false );
    $slot = 'bkbg_ext_owner_' . $s['user'] . '_' . $post;
    $previous = get_option( $slot );
    update_option( $slot, $id, false );
    if ( $previous ) { delete_option( bkbg_external_key( $previous ) ); }
    wp_schedule_single_event( $s['expires'], 'bkbg_external_cleanup', array( $id ) );
    $base    = rest_url( 'blockenberg/v1/ai/external/' . $id );
    $prompts = array();
    foreach ( array_keys( bkbg_external_pairing_clients() ) as $client ) {
        $prompts[ $client ] = bkbg_external_pairing_prompt( $base, $ticket, $client );
    }
    return array(
        'id'           => $id,
        'editor_token' => $editor,
        'expires'      => $s['expires'],
        'url'          => $base,
        'prompt'       => $prompts['codex'],
        'prompts'      => $prompts,
    );
}
function bkbg_external_claim( $request ) {
    return bkbg_external_change( $request['session'], function ( &$s ) use ( $request ) {
        if ( ! bkbg_external_secret_matches( $request['code'], $s['ticket_hash'] ) ) { return bkbg_external_error( 'Pairing code is invalid or already used.', 403 ); }
        if ( time() - $s['heartbeat'] > 15 ) { return bkbg_external_error( 'The editor is offline. Open the AI sidebar.', 409 ); }
        $token = bin2hex( random_bytes( 32 ) );
        $s['ticket_hash'] = '';
        $s['agent_seen'] = time();
        $s['agent_hash'] = hash( 'sha256', $token );
        $s['agent'] = substr( sanitize_text_field( $request['agent'] ?: 'External agent' ), 0, 80 );
        return array( 'token' => $token, 'expires' => $s['expires'], 'post_id' => $s['post'] );
    } );
}
function bkbg_external_context( $request ) {
    $s = bkbg_external_read( $request['session'] );
    if ( ! $s ) { return bkbg_external_error( 'Session expired.', 410 ); }
    return array( 'post_id' => $s['post'], 'scope' => $s['scope'], 'expires' => $s['expires'], 'editor_online' => time() - $s['heartbeat'] <= 15,
        'workflow' => 'All paths below are relative to this session base URL and require the bearer token. Read get_page_structure first. POST /commands with {id: a new UUID, tool: tool name, args: object}. Requests are asynchronous: poll GET /commands/ID every 1–2 seconds until done. Read each result before submitting the next command: only the most recent result is retained. Older IDs remain reserved and cannot be replayed. Only one unfinished command is allowed. Reuse the SAME id if a POST response is lost; never retry a mutation with a new id without checking the first result. Commands are delivered at most once. If status stays running and the editor is lost, the outcome is unknown: ask the user to inspect the page. Read schemas before editing. Scope is fixed for this session. Edits remain unsaved; the user saves in Gutenberg. For generated images, use your own available image-generation tool and the image_upload endpoint below; create_image is only the optional existing-photo search tool. Never silently switch to a paid API or web search. If generation is unavailable in your client, explain this to the user. No arbitrary code execution, publishing, filesystem or database access. Hiding the sidebar keeps the session running. Closing or reloading the editor disconnects the temporary session; the saved conversation remains available for a new connection. Stop polling when done.',
        'messaging' => 'For every new user request in your own chat, mirror the task with POST /messages {id:UUID,role:user,text:the user request}; mirror useful replies with role:assistant. Do not copy secrets or unrelated conversations. GET /inbox between operations and before finishing. Process each queued user request as user instructions within the authorized scope, then POST /inbox/ID/ack. Ack means read, not completed. Repeat GET after a lost response: messages remain until acknowledged. Never mirror an inbox message as a new user message. The WordPress panel cannot wake your client after you stop: do not promise automatic delivery to an idle agent or run an indefinite waiting loop. Read conversation below to resume prior work, then inspect the current page because historical block IDs may be stale.',
        'conversation' => bkbg_external_conversation( $s ),
        'progress_reporting' => 'POST /progress JSON {phase: planning|building|generating_image|reviewing|waiting|done|error, message: short human-readable update in the user language, plan: optional array of up to 12 {id, label, status: pending|active|done}}. Send a plan before starting, an update before each long operation (especially image generation), after each section, and done only after checking the result. Plans describe real work, not fabricated percentages. Insert one complete native Blockenberg section per command as it becomes ready. Avoid withholding the whole page until the end. Add generated assets to existing sections as they become available. Continue respecting selection scope and the user task.',
        'visual_review' => 'After every completed section, inspect its screenshots with your image-viewing tool. build_section automatically returns desktop and mobile captures. For other insertions and after corrections, call capture_section {clientId, viewport: desktop|mobile}; use both widths. Download each returned path using the bearer header into a temporary .png file, then OPEN THE IMAGE using your native image viewer (Codex view_image, Claude Read/image tool, Cursor Read on the PNG file, or equivalent). Reading JSON or image metadata does not count as looking. Evaluate spacing, widths, typography, contrast, image crops, alignment, mobile wrapping and overflow. POST /review {capture_ids:[IDs],decision:passed|needs_changes,notes:your concrete visual observations}. If changes are needed, fix with the editor tools and take fresh screenshots before reviewing again. Do not mark done while a visual review is unresolved. Images are private, expire with the session, and only the last four are retained. These are static DOM captures of WordPress-rendered unsaved section markup using theme and block styles, not a live interactive frontend browser screenshot: video, canvas, embedded frames and runtime animation states require separate browser inspection. Never claim to have inspected an image if your client cannot open it; explain that limitation and ask the user to review.',
        'image_upload' => array(
            'method' => 'POST /images/UNIQUE_ID?filename=hero.png&alt=URL_ENCODED_ALT&title=URL_ENCODED_TITLE',
            'body' => 'Raw bytes of an image you generated with your own tool, with Content-Type image/png, image/jpeg or image/webp and Authorization: Bearer TOKEN. No base64, multipart, URLs, SVG or executable files. Maximum 20 MB and 40 megapixels; server limits may be lower. Keep the token out of command output and URLs.',
            'result' => 'Returns status done and image {id,url,alt,width,height,mime}. Use these in native block attributes after reading the schema: image ID and URL for photos, background URL for section backgrounds. Uploading does not insert a block or save the page.',
            'retry' => 'Retry exactly the SAME ID, bytes and metadata after a lost response, or GET /images/ID. Never use a new ID to retry an uncertain upload. One image upload at a time. No OpenRouter requests are made. Generate actual raster assets with your image tool; do not substitute procedural drawings for requested generated images.',
        ),
        'instructions' => $s['instructions'] . '
External-session image workflow overrides the generic create_image advice above: prefer original images from your own image-generation tool and upload them via image_upload. create_image only searches existing photos when requested. Use the uploaded URL and ID in the matching native image or background attributes. Report progress and insert complete sections incrementally as described above.', 'tools' => $s['tools'] );
}
function bkbg_external_submit( $request ) {
    $id = $request['id']; $tool = $request['tool']; $args = $request['args'];
    if ( ! is_string( $id ) || ! preg_match( '/^[a-zA-Z0-9_-]{8,80}$/D', $id ) || ! in_array( $tool, bkbg_external_tools(), true ) || ( ! is_array( $args ) && ! is_object( $args ) ) ) { return bkbg_external_error( 'Supply an id, a supported tool and object args.' ); }
    if ( strlen( $request->get_body() ) > 128000 ) { return bkbg_external_error( 'Command is too large.', 413 ); }
    $args = (array) $args;
    if ( 'create_image' === $tool ) {
        if ( ! empty( $args['source'] ) && 'search' !== $args['source'] ) { return bkbg_external_error( 'create_image only searches existing photos. Generate with your own image tool, then use the session image upload endpoint.' ); }
        $args['source'] = 'search';
    }
    $fingerprint = hash( 'sha256', wp_json_encode( array( $tool, $args ) ) );
    return bkbg_external_change( $request['session'], function ( &$s ) use ( $id, $tool, $args, $fingerprint ) {
        foreach ( $s['commands'] as $command ) {
            if ( $command['id'] === $id ) {
                return $command['fingerprint'] === $fingerprint ? array( 'id' => $id, 'status' => $command['status'] ) : bkbg_external_error( 'This id belongs to another command.', 409 );
            }
        }
        if ( time() - $s['heartbeat'] > 15 ) { return bkbg_external_error( 'The editor is offline. Open the AI sidebar.', 409 ); }
        foreach ( $s['commands'] as $command ) {
            if ( 'done' !== $command['status'] ) { return bkbg_external_error( 'Wait for the previous command.', 409 ); }
        }
        // Keep IDs for the full session so retries can never replay an older mutation.
        if ( count( $s['commands'] ) >= 500 ) { return bkbg_external_error( 'Session command capacity reached. Start a new session.', 409 ); }
        foreach ( $s['commands'] as &$old ) { unset( $old['result'], $old['args'] ); } unset( $old );
        $s['agent_seen'] = time();
        if ( in_array( $tool, array( 'build_section', 'insert_blocks', 'insert_html_section', 'update_block', 'replace_block', 'remove_blocks', 'move_block', 'set_custom_css', 'unwrap_block' ), true ) ) { $s['visual_revision'] = ( $s['visual_revision'] ?? 0 ) + 1; }
        bkbg_external_run_clock( $s );
        $s['commands'][] = array( 'id' => $id, 'tool' => $tool, 'args' => $args, 'fingerprint' => $fingerprint, 'status' => 'queued' );
        return array( 'id' => $id, 'status' => 'queued' );
    } );
}
function bkbg_external_result( $request ) {
    $s = bkbg_external_read( $request['session'] );
    if ( ! $s ) { return bkbg_external_error( 'Session expired.', 410 ); }
    foreach ( $s['commands'] as $command ) {
        if ( $command['id'] === $request['command'] ) { return array( 'id' => $command['id'], 'status' => $command['status'], 'result' => $command['result'] ?? null, 'result_retained' => isset( $command['result'] ) ); }
    }
    return bkbg_external_error( 'Unknown command.', 404 );
}
function bkbg_external_poll( $request ) {
    if ( strlen( $request->get_body() ) > 600000 ) { return bkbg_external_error( 'Tool result is too large.', 413 ); }
    return bkbg_external_change( $request['session'], function ( &$s ) use ( $request ) {
        $s['heartbeat'] = time();
        $ack = $request['ack'];
        if ( is_array( $ack ) && isset( $ack['id'] ) ) {
            foreach ( $s['commands'] as &$command ) {
                if ( $command['id'] === $ack['id'] && 'running' === $command['status'] ) {
                    $command['status'] = 'done'; $command['result'] = $ack['result'] ?? array( 'error' => 'No result supplied.' );
                    $command['failed'] = ! empty( $command['result']['error'] );
                }
            } unset( $command );
        }
        $delivery = null;
        foreach ( $s['commands'] as &$command ) {
            if ( 'queued' === $command['status'] ) { $command['status'] = 'running'; $delivery = $command; break; }
        } unset( $command );
        $done = 0; $sections = 0;
        foreach ( $s['commands'] as $item ) {
            if ( 'done' === $item['status'] ) { $done++; }
            if ( 'done' === $item['status'] && 'build_section' === $item['tool'] && empty( $item['failed'] ) ) { $sections++; }
        }
        $images = array_values( array_map( function ( $item ) { return $item['image']; }, array_filter( $s['images'] ?? array(), function ( $item ) { return 'done' === $item['status']; } ) ) );
        return array( 'agent' => $s['agent'], 'expires' => $s['expires'], 'command' => $delivery,
            'progress' => $s['progress'] ?? null, 'agent_seen' => $s['agent_seen'] ?? 0, 'server_time' => microtime( true ), 'run' => $s['run'] ?? null,
            'visual_review' => $s['visual_review'] ?? null,
            'messages' => array_values( $s['messages'] ?? array() ),
            'counts' => array( 'actions' => count( $s['commands'] ), 'completed' => $done, 'sections' => $sections, 'images' => count( $images ) ),
            'images' => array_slice( $images, -4 ) );
    } );
}
require_once __DIR__ . '/ai-external-messages.php';
require_once __DIR__ . '/ai-external-media.php';
require_once __DIR__ . '/ai-external-capture.php';

function bkbg_external_revoke( $request ) {
    $s = bkbg_external_read( $request['session'] );
    if ( $s ) {
        foreach ( $s['messages'] ?? array() as $message ) {
            if ( 'queued' === $message['status'] ) { $message['status'] = 'interrupted'; bkbg_chat_append( $s, $message ); }
        }
    }
    delete_option( bkbg_external_key( $request['session'] ) );
    return array( 'disconnected' => true );
}
add_action( 'bkbg_external_cleanup', function ( $id ) { delete_option( bkbg_external_key( $id ) ); } );
add_action( 'rest_api_init', function () {
    $prefix = '/ai/external';
    register_rest_route( 'blockenberg/v1', $prefix, array( 'methods' => 'POST', 'callback' => 'bkbg_external_create', 'permission_callback' => function () { return bkbg_ai_user_can_use(); } ) );
    $base = $prefix . '/(?P<session>[a-f0-9]{32})';
    register_rest_route( 'blockenberg/v1', $base . '/claim', array( 'methods' => 'POST', 'callback' => 'bkbg_external_claim', 'permission_callback' => '__return_true' ) );
    foreach ( array( 'context' => array( 'GET', 'bkbg_external_context' ), 'progress' => array( 'POST', 'bkbg_external_progress' ), 'review' => array( 'POST', 'bkbg_external_review_capture' ), 'commands' => array( 'POST', 'bkbg_external_submit' ), 'commands/(?P<command>[a-zA-Z0-9_-]{8,80})' => array( 'GET', 'bkbg_external_result' ) ) as $route => $spec ) {
        register_rest_route( 'blockenberg/v1', $base . '/' . $route, array( 'methods' => $spec[0], 'callback' => $spec[1], 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ) );
    }
    register_rest_route( 'blockenberg/v1', $base . '/images/(?P<upload>[a-zA-Z0-9_-]{8,80})', array(
        array( 'methods' => 'POST', 'callback' => 'bkbg_external_upload_image', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ),
        array( 'methods' => 'GET', 'callback' => 'bkbg_external_image_result', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ),
    ) );
    register_rest_route( 'blockenberg/v1', $base . '/captures/(?P<capture>[a-zA-Z0-9_-]{8,100})', array(
        array( 'methods' => 'POST', 'callback' => 'bkbg_external_save_capture', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r, true ); } ),
        array( 'methods' => 'GET', 'callback' => 'bkbg_external_get_capture', 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r ); } ),
    ) );
    foreach ( array( 'render-section' => 'bkbg_external_render_section', 'poll' => 'bkbg_external_poll', 'revoke' => 'bkbg_external_revoke' ) as $route => $callback ) {
        register_rest_route( 'blockenberg/v1', $base . '/' . $route, array( 'methods' => 'POST', 'callback' => $callback, 'permission_callback' => function ( $r ) { return bkbg_external_authorize( $r, true ); } ) );
    }
} );
// Never let a browser or proxy cache a session credential, context or tool result.
add_filter( 'rest_post_dispatch', function ( $response, $server, $request ) {
    if ( strpos( $request->get_route(), '/blockenberg/v1/ai/external' ) === 0 && $response instanceof WP_REST_Response ) { $response->header( 'Cache-Control', 'no-store, private' ); }
    return $response;
}, 10, 3 );
