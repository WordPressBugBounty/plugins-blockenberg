<?php
/** Repair legacy template keyframe steps without changing scoped DOM rules. */
defined( 'ABSPATH' ) || exit;

function bkbg_template_repair_keyframes( $css ) {
    if ( strpos( $css, '@' ) === false || strpos( $css, '[data-bkbg-template=' ) === false ) {
        return $css;
    }
    // Skip quoted text and comments, both around and inside keyframe blocks.
    $quoted = '"(?:\\\\.|[^"\\\\]++)*+"|\'(?:\\\\.|[^\'\\\\]++)*+\'|/\*[\s\S]*?\*/';
    $headers = '~@(?:-(?:webkit|moz|ms|o)-)?keyframes\s+(?:[a-zA-Z_][\w-]*|"[^"\r\n]+"|\'[^\'\r\n]+\')\s*\{|/\*[\s\S]*?\*/~i';
    $steps = '~(\[data-bkbg-template=(["\'])[a-z0-9][a-z0-9-]*\2\]\s*)(?=(?:from|to|(?:\d+(?:\.\d+)?|\.\d+)%)\s*[,\{])|'.$quoted.'~i';
    $offset = 0;
    $length = strlen( $css );
    $out = '';
    while ( preg_match( $headers, $css, $match, PREG_OFFSET_CAPTURE, $offset ) ) {
        $header = $match[0][0];
        $start = $match[0][1];
        $body_start = $start + strlen( $header );
        if ( $header[0] !== '@' ) {
            $out .= substr( $css, $offset, $body_start - $offset );
            $offset = $body_start;
            continue;
        }
        $depth = 1;
        $quote = '';
        $comment = false;
        for ( $end = $body_start; $end < $length && $depth; $end++ ) {
            $char = $css[$end];
            $next = $end + 1 < $length ? $css[$end + 1] : '';
            if ( $comment ) {
                if ( $char === '*' && $next === '/' ) { $comment = false; $end++; }
            } elseif ( $quote !== '' ) {
                if ( $char === '\\' ) { $end++; }
                elseif ( $char === $quote ) { $quote = ''; }
            } elseif ( $char === '/' && $next === '*' ) { $comment = true; $end++; }
            elseif ( $char === '"' || $char === "'" ) { $quote = $char; }
            elseif ( $char === '{' ) { $depth++; }
            elseif ( $char === '}' ) { $depth--; }
        }
        // Leave incomplete styles untouched rather than guessing their boundaries.
        if ( $depth ) { break; }
        $body = substr( $css, $body_start, $end - $body_start - 1 );
        $fixed = preg_replace_callback( $steps, static function ( $m ) {
            return ! empty( $m[1] ) ? '' : $m[0];
        }, $body );
        $out .= substr( $css, $offset, $body_start - $offset ) . $fixed . '}';
        $offset = $end;
    }
    return $out . substr( $css, $offset );
}

/** Existing imports get a new content-addressed local CSS file; posts stay intact. */
function bkbg_library_repaired_style_url( $key, $url ) {
    $uploads = wp_upload_dir();
    if ( ! empty( $uploads['error'] ) ) { return $url; }
    $base = trailingslashit( $uploads['baseurl'] ) . 'blockenberg-library/';
    if ( strpos( $url, $base ) !== 0 ) { return $url; }
    $name = substr( $url, strlen( $base ) );
    if ( ! preg_match( '/^' . preg_quote( $key, '/' ) . '\.[a-f0-9]{64}\.css$/D', $name ) ) { return $url; }
    $folder = realpath( trailingslashit( $uploads['basedir'] ) . 'blockenberg-library' );
    $path = $folder ? realpath( $folder . '/' . $name ) : false;
    if ( ! $path || dirname( $path ) !== $folder || ! is_readable( $path ) ) { return $url; }
    $css = file_get_contents( $path );
    if ( $css === false ) { return $url; }
    $fixed = bkbg_template_repair_keyframes( $css );
    if ( $fixed === $css ) { return $url; }
    $repaired = bkbg_library_store_css( $key, $fixed, hash( 'sha256', $fixed ) );
    return is_wp_error( $repaired ) ? $url : $repaired;
}
