<?php
/** Remote library transport. The free plugin contains no licensing SDK. */
defined('ABSPATH') || exit;

function bkbg_library_endpoint() {
    return defined('BKBG_TEMPLATE_LIBRARY_ENDPOINT') ? BKBG_TEMPLATE_LIBRARY_ENDPOINT : 'https://templates.blockenberg.com/template-library/v1/index.php';
}
function bkbg_library_pro_enabled() {
    return (bool) apply_filters('bkbg_templates_pro_enabled', false);
}
function bkbg_library_credentials() {
    $value = apply_filters('bkbg_template_download_credentials', array());
    if (!is_array($value) || empty($value['install_id']) || empty($value['license_key']) || empty($value['site_url'])) return array();
    return array('install_id' => absint($value['install_id']), 'license_key' => (string) $value['license_key'], 'site_url' => (string) $value['site_url']);
}
function bkbg_library_request($action, $body = null) {
    $url = add_query_arg('action', $action, bkbg_library_endpoint());
    if (wp_parse_url($url, PHP_URL_SCHEME) !== 'https') return new WP_Error('bkbg_library_https', __('The template library requires HTTPS.', 'blockenberg'));
    $args = array('timeout' => $action === 'catalog' ? 10 : 60, 'redirection' => 0, 'limit_response_size' => 20 * MB_IN_BYTES, 'headers' => array('Accept' => 'application/json'));
    if ($body !== null) {
        $args['headers']['Content-Type'] = 'application/json';
        $args['body'] = wp_json_encode($body);
        $response = wp_safe_remote_post($url, $args);
    } else $response = wp_safe_remote_get($url, $args);
    if (is_wp_error($response)) return new WP_Error('bkbg_library_connection', __('Cannot connect to the template library. Please try again.', 'blockenberg'));
    $status = wp_remote_retrieve_response_code($response);
    if ($status !== 200) {
        if ($status === 401 || $status === 403) return new WP_Error('bkbg_library_license', __('Activate a valid Blockenberg Pro license to import this template.', 'blockenberg'));
        return new WP_Error('bkbg_library_response', sprintf(__('The template library returned HTTP %d. Please try again.', 'blockenberg'), $status));
    }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data) || (int) ($data['schemaVersion'] ?? 0) !== 1) return new WP_Error('bkbg_library_schema', __('The template library returned an invalid response.', 'blockenberg'));
    return $data;
}
function bkbg_library_catalog_valid($value) {
    if (!is_array($value) || empty($value['templates']) || !is_array($value['templates']) || !is_array($value['collections'] ?? null)) return false;
    foreach ($value['templates'] as $key => $entry) {
        if (!is_string($key) || !preg_match('/^[a-z0-9][a-z0-9-]{0,159}$/D', $key) || !is_array($entry) || ($entry['key'] ?? '') !== $key || !in_array($entry['plan'] ?? '', array('free', 'premium'), true) || !preg_match('/^[a-f0-9]{64}$/D', $entry['sha256'] ?? '') || !preg_match('/^[a-f0-9]{64}$/D', $entry['cssSha256'] ?? '')) return false;
    }
    return true;
}
function bkbg_library_catalog($refresh = false) {
    static $memory = null;
    if (!$refresh && $memory !== null) return $memory;
    $cached = get_transient('bkbg_remote_library_catalog_v2');
    if (!$refresh && bkbg_library_catalog_valid($cached)) return $memory = $cached;
    // Only catalog visits/downloads refresh metadata; no scheduled jobs or frontend HTTP.
    if ((is_admin() || (defined('WP_CLI') && WP_CLI)) && ($refresh || !get_transient('bkbg_remote_library_unavailable_v2'))) {
        $remote = bkbg_library_request('catalog');
        if (!is_wp_error($remote) && bkbg_library_catalog_valid($remote)) {
            delete_transient('bkbg_remote_library_unavailable_v2');
            set_transient('bkbg_remote_library_catalog_v2', $remote, DAY_IN_SECONDS);
            update_option('bkbg_remote_library_last_catalog_v2', $remote, false);
            return $memory = $remote;
        }
        set_transient('bkbg_remote_library_unavailable_v2', true, 5 * MINUTE_IN_SECONDS);
    }
    $last = get_option('bkbg_remote_library_last_catalog_v2', array());
    if (bkbg_library_catalog_valid($last)) return $memory = $last;
    $fallback = dirname(__DIR__, 2) . '/templates/catalog.json';
    $value = is_file($fallback) ? json_decode(file_get_contents($fallback), true) : array();
    if (bkbg_library_catalog_valid($value)) return $memory = $value;
    return $memory = array('schemaVersion' => 1, 'templates' => array(), 'collections' => array(), 'assetsBaseUrl' => 'https://templates.blockenberg.com/template-library/assets/');
}
function bkbg_library_authoring_file($key, $extension) {
    // Explicit developer-only override; never configured in distributed builds.
    if (!defined('BKBG_TEMPLATE_AUTHORING_DIR') || !preg_match('/^[a-z0-9][a-z0-9-]{0,159}$/D', $key)) return '';
    $path = trailingslashit(BKBG_TEMPLATE_AUTHORING_DIR) . $key . '.' . $extension;
    return is_file($path) ? $path : '';
}
function bkbg_library_assets_url() {
    $catalog = bkbg_library_catalog();
    $url = $catalog['assetsBaseUrl'] ?? '';
    return bkbg_library_asset_url_allowed($url) ? trailingslashit($url) : 'https://templates.blockenberg.com/template-library/assets/';
}
function bkbg_library_asset_url_allowed($url) {
    return is_string($url) && wp_parse_url($url, PHP_URL_SCHEME) === 'https' && wp_parse_url($url, PHP_URL_HOST) === 'templates.blockenberg.com' && strpos(wp_parse_url($url, PHP_URL_PATH) ?? '', '/template-library/assets/') === 0;
}
function bkbg_library_style_allowed($url) {
    $uploads = wp_upload_dir();
    $base = trailingslashit($uploads['baseurl']) . 'blockenberg-library/';
    return is_string($url) && strpos($url, $base) === 0 && !preg_match('~(?:\.\.|%2e|%2f|%5c|[?#\\\\])~i', substr($url, strlen($base))) && substr($url, -4) === '.css';
}
function bkbg_library_resolve_css_assets($css) {
    $assets = bkbg_library_assets_url();
    $css = str_replace('{{assets}}/', $assets, $css);
    return preg_replace_callback('~url\\(\\s*([\"\']?)(assets/[a-zA-Z0-9._-]+)\\1\\s*\\)~', function($match) use ($assets) {
        return 'url("' . $assets . substr($match[2], 7) . '")';
    }, $css);
}
function bkbg_library_store_css($key, $css, $hash) {
    // Frontend previews do not load the admin file helpers automatically.
    if (!function_exists('wp_tempnam')) require_once ABSPATH . 'wp-admin/includes/file.php';
    $uploads = wp_upload_dir();
    if (!empty($uploads['error'])) return new WP_Error('bkbg_library_storage', __('Cannot access the uploads directory.', 'blockenberg'));
    $folder = trailingslashit($uploads['basedir']) . 'blockenberg-library/';
    if (!wp_mkdir_p($folder)) return new WP_Error('bkbg_library_storage', __('Cannot create the template style directory.', 'blockenberg'));
    $name = $key . '.' . $hash . '.css';
    $path = $folder . $name;
    if (!is_file($path) || !hash_equals($hash, hash_file('sha256', $path))) {
        $tmp = wp_tempnam($name, $folder);
        if (!$tmp || file_put_contents($tmp, $css, LOCK_EX) !== strlen($css) || !@rename($tmp, $path)) {
            if ($tmp) wp_delete_file($tmp);
            return new WP_Error('bkbg_library_storage', __('Cannot save the template stylesheet.', 'blockenberg'));
        }
        @chmod($path, 0644);
    }
    $url = trailingslashit($uploads['baseurl']) . 'blockenberg-library/' . $name;
    $styles = get_option('bkbg_imported_template_styles_v1', array());
    $styles[$key] = $url;
    update_option('bkbg_imported_template_styles_v1', $styles, false);
    return $url;
}
function bkbg_library_template_bundle($key, $authoring_preview = false, $retried = false) {
    $manifest = bkbg_template_manifest();
    if (!isset($manifest[$key]) || ($manifest[$key]['status'] ?? '') !== 'ready') return new WP_Error('missing_template', __('Template is not available.', 'blockenberg'));
    $entry = $manifest[$key];
    $source = $authoring_preview ? bkbg_library_authoring_file($key, 'json') : '';
    if ($source) {
        $json = file_get_contents($source);
        $css_file = bkbg_library_authoring_file($key, 'css');
        if (!$css_file) return new WP_Error('bkbg_library_css', __('Template stylesheet is missing.', 'blockenberg'));
        $css = file_get_contents($css_file);
    } else {
        $request = array('key' => $key);
        if ($entry['plan'] !== 'free') {
            if (!bkbg_library_pro_enabled() || !$credentials = bkbg_library_credentials()) return new WP_Error('bkbg_library_license', __('Activate a valid Blockenberg Pro license to import this template.', 'blockenberg'));
            $request['credentials'] = $credentials;
        }
        // No reusable premium bundle cache: the server authorizes every new import.
        $response = bkbg_library_request('download', $request);
        if (is_wp_error($response)) return $response;
        if (($response['key'] ?? '') !== $key || !is_string($response['templateJson'] ?? null) || !is_string($response['css'] ?? null)) return new WP_Error('bkbg_library_bundle', __('Invalid template download.', 'blockenberg'));
        $json = $response['templateJson']; $css = $response['css'];
        if (!hash_equals($entry['sha256'], hash('sha256', $json)) || !hash_equals($entry['cssSha256'], hash('sha256', $css))) {
            // A release can change while this site's catalog is cached. Refresh once;
            // the second download still requires authorization and matching hashes.
            if (!$retried) {
                bkbg_library_catalog(true);
                return bkbg_library_template_bundle($key, false, true);
            }
            return new WP_Error('bkbg_library_integrity', __('Template download verification failed. Refresh the library and try again.', 'blockenberg'));
        }
    }
    $data = json_decode($json, true);
    if (!is_array($data) || ($data['key'] ?? '') !== $key || empty($data['blocks']) || !is_array($data['blocks'])) return new WP_Error('bkbg_library_bundle', __('Invalid template data.', 'blockenberg'));
    $valid = bkbg_template_validate_nodes($data['blocks']); if (is_wp_error($valid)) return $valid;
    $assets = bkbg_library_assets_url();
    $css = bkbg_library_resolve_css_assets($css);
    $style_url = bkbg_library_store_css($key, $css, hash('sha256', $css));
    if (is_wp_error($style_url)) return $style_url;
    foreach ($data['blocks'] as &$node) if (($node['blockName'] ?? '') === 'blockenberg/template-page') $node['attrs']['templateStyleUrl'] = $style_url;
    return $data;
}
function bkbg_library_enqueue_template_style($key, $explicit = '') {
    $styles = get_option('bkbg_imported_template_styles_v1', array());
    $url = $explicit ?: ($styles[$key] ?? '');
    if (!bkbg_library_style_allowed($url)) {
        // Compatibility for developer previews and older imports, using only local files.
        $css_file = bkbg_library_authoring_file($key, 'css');
        if (!$css_file) return;
        $css = bkbg_library_resolve_css_assets(file_get_contents($css_file));
        $url = bkbg_library_store_css($key, $css, hash('sha256', $css));
        if (is_wp_error($url)) return;
    }
    wp_enqueue_style('bkbg-template-' . $key . '-' . substr(hash('sha256', $url), 0, 10), $url, array('bkbg-template-pilot'), null);
}

add_action('admin_post_bkbg_refresh_template_library', function(){
    if(!current_user_can('manage_options'))wp_die('Insufficient permissions.');
    check_admin_referer('bkbg_refresh_template_library');
    delete_transient('bkbg_remote_library_catalog_v2');
    delete_transient('bkbg_remote_library_unavailable_v2');
    $remote=bkbg_library_request('catalog');
    if(is_wp_error($remote)||!bkbg_library_catalog_valid($remote))wp_die(esc_html(is_wp_error($remote)?$remote->get_error_message():'Invalid library catalog.'));
    set_transient('bkbg_remote_library_catalog_v2',$remote,DAY_IN_SECONDS);
    update_option('bkbg_remote_library_last_catalog_v2',$remote,false);
    wp_safe_redirect(admin_url('admin.php?page=blockenberg-templates'));exit;
});
