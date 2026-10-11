<?php
/**
 * Blockenberg — AI Agent (OpenRouter)
 *
 * Adds a chat panel to the block editor that can build and edit pages with
 * Blockenberg blocks. The browser never sees the API key: every model call is
 * proxied through REST routes in this file.
 *
 * Routes (namespace blockenberg/v1):
 *   POST /ai/chat    — proxy one chat completion (with tool calling) to OpenRouter
 *   GET  /ai/models        — list tool-capable chat models (cached 1 hour)
 *   GET  /ai/image-models  — list image-generation models (cached 1 hour)
 *   POST /ai/media   — find or generate an image, sideload it into the Media Library
 *
 * @package Blockenberg
 */

defined( 'ABSPATH' ) || exit;

define( 'BKBG_AI_OPTION', 'blockenberg_ai_settings' );
define( 'BKBG_AI_CSS_META', '_bkbg_ai_custom_css' );
define( 'BKBG_AI_MODEL_META', '_bkbg_ai_model' );
define( 'BKBG_AI_MODELS_CACHE', 'bkbg_ai_models_v2' );
define( 'BKBG_AI_IMAGE_MODELS_CACHE', 'bkbg_ai_image_models_v1' );

/* ──────────────────────────────────────────────
 * 1. Settings
 * ────────────────────────────────────────────── */

/**
 * Default settings.
 *
 * @return array
 */
function bkbg_ai_default_settings() {
    return array(
        'api_key'      => '',
        'model'        => 'anthropic/claude-sonnet-4.5',
        'image_model'  => 'google/gemini-2.5-flash-image',
        'image_source' => 'openverse', // openverse | openrouter
        'stream'       => true,
        'max_steps'    => 0, // Zero disables the step limit.
        'temperature'  => 0.4,
        'site_context' => '',
        'open_sidebar' => true,
    );
}

/**
 * Get the AI settings merged with defaults.
 *
 * @return array
 */
function bkbg_ai_get_settings() {
    $saved = get_option( BKBG_AI_OPTION, array() );
    if ( ! is_array( $saved ) ) {
        $saved = array();
    }
    return array_merge( bkbg_ai_default_settings(), $saved );
}

/**
 * The OpenRouter API key, if configured.
 *
 * Also honours the BLOCKENBERG_AI_API_KEY constant (wp-config.php) so the key
 * can be kept out of the database entirely.
 *
 * @return string
 */
function bkbg_ai_get_api_key() {
    if ( defined( 'BLOCKENBERG_AI_API_KEY' ) && BLOCKENBERG_AI_API_KEY ) {
        return (string) BLOCKENBERG_AI_API_KEY;
    }
    $settings = bkbg_ai_get_settings();
    return (string) $settings['api_key'];
}

/**
 * Who may talk to the agent.
 *
 * @return bool
 */
function bkbg_ai_user_can_use() {
    /**
     * Capability required to use the AI agent. Every request spends credits
     * on the site's OpenRouter account, so a site can tighten this.
     *
     * @param string $capability Capability name.
     */
    $capability = apply_filters( 'blockenberg_ai_capability', 'edit_posts' );
    return current_user_can( $capability );
}

/** Post being edited in the block editor, including when the main query is empty. */
function bkbg_ai_editor_post_id() {
    $post_id = (int) get_the_ID();
    if ( $post_id ) {
        return $post_id;
    }
    foreach ( array( 'post', 'post_id', 'postId' ) as $key ) {
        if ( ! isset( $_GET[ $key ] ) ) {
            continue;
        }
        $value = wp_unslash( $_GET[ $key ] );
        if ( is_numeric( $value ) ) {
            return absint( $value );
        }
    }
    return 0;
}

/** Model identifiers may contain provider prefixes and routing suffixes. */
function bkbg_ai_valid_model_id( $model ) {
    return is_string( $model ) && 1 === preg_match( '#^[a-z0-9][a-z0-9._:/+@-]{0,199}$#i', $model );
}

/** Read the current user's last selection without exposing account settings. */
function bkbg_ai_get_preferred_model() {
    $model = get_user_meta( get_current_user_id(), BKBG_AI_MODEL_META, true );
    return bkbg_ai_valid_model_id( $model ) ? $model : '';
}

/** Validate form settings while keeping saved secrets and disabled fields. */
function bkbg_ai_sanitize_settings( $posted, $current ) {
    $settings = $current;
    $key = isset( $posted['api_key'] ) ? trim( sanitize_text_field( $posted['api_key'] ) ) : '';
    if ( ! defined( 'BLOCKENBERG_AI_API_KEY' ) || ! BLOCKENBERG_AI_API_KEY ) {
        if ( ! empty( $posted['remove_api_key'] ) ) {
            $settings['api_key'] = '';
        } elseif ( '' !== $key && ! preg_match( '/^[\x{2022}\s]+$/u', $key ) ) {
            $settings['api_key'] = $key;
        }
    }
    foreach ( array( 'model', 'image_model' ) as $field ) {
        $model = isset( $posted[ $field ] ) ? sanitize_text_field( $posted[ $field ] ) : '';
        if ( bkbg_ai_valid_model_id( $model ) ) {
            $settings[ $field ] = $model;
        }
    }
    if ( isset( $posted['image_source'] ) && in_array( $posted['image_source'], array( 'openverse', 'openrouter' ), true ) ) {
        $settings['image_source'] = $posted['image_source'];
    }
    $settings['stream'] = ! empty( $posted['stream'] );
    if ( isset( $posted['max_steps'] ) && is_numeric( $posted['max_steps'] ) ) {
        $settings['max_steps'] = max( 0, min( 40, (int) $posted['max_steps'] ) );
    }
    if ( isset( $posted['temperature'] ) && is_numeric( $posted['temperature'] ) ) {
        $settings['temperature'] = max( 0, min( 2, (float) $posted['temperature'] ) );
    }
    if ( isset( $posted['site_context'] ) ) {
        $settings['site_context'] = sanitize_textarea_field( $posted['site_context'] );
    }
    $settings['open_sidebar'] = ! empty( $posted['open_sidebar'] );
    return $settings;
}

/* ──────────────────────────────────────────────
 * 2. Settings screen (Blockenberg → AI Agent Settings)
 * ────────────────────────────────────────────── */

add_action( 'admin_menu', function () {
    add_submenu_page(
        'blockenberg',
        __( 'AI Agent Settings', 'blockenberg' ),
        __( 'AI Agent Settings', 'blockenberg' ),
        'manage_options',
        'blockenberg-ai',
        'bkbg_ai_render_settings_page'
    );
}, 20 );

/**
 * Save handler for the settings form.
 */
add_action( 'admin_post_bkbg_ai_save_settings', function () {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You are not allowed to do this.', 'blockenberg' ), '', array( 'response' => 403 ) );
    }
    check_admin_referer( 'bkbg_ai_settings' );

    $settings = bkbg_ai_sanitize_settings( wp_unslash( $_POST ), bkbg_ai_get_settings() );

    update_option( BKBG_AI_OPTION, $settings, false );

    wp_safe_redirect( add_query_arg( 'bkbg-updated', '1', admin_url( 'admin.php?page=blockenberg-ai' ) ) );
    exit;
} );

/**
 * AJAX — verify the key by asking OpenRouter who we are.
 */
add_action( 'wp_ajax_bkbg_ai_test_key', function () {
    check_ajax_referer( 'bkbg_ai_test', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( array( 'message' => __( 'Unauthorized', 'blockenberg' ) ), 403 );
    }

    // Test what is in the field right now, so a key can be verified before it is
    // saved. An untouched masked field falls back to the stored key.
    $posted  = isset( $_POST['api_key'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['api_key'] ) ) ) : '';
    $stored  = bkbg_ai_get_api_key();
    $is_mask = (bool) preg_match( '/^[\x{2022}\s]+$/u', $posted );
    $unsaved = ( '' !== $posted && ! $is_mask && $posted !== $stored );
    $key     = $unsaved ? $posted : $stored;

    if ( '' === $key ) {
        wp_send_json_error( array( 'message' => __( 'Enter an API key first.', 'blockenberg' ) ) );
    }

    $response = wp_remote_get( 'https://openrouter.ai/api/v1/key', array(
        'timeout' => 20,
        'headers' => array( 'Authorization' => 'Bearer ' . $key ),
    ) );

    if ( is_wp_error( $response ) ) {
        wp_send_json_error( array( 'message' => $response->get_error_message() ) );
    }

    $code = wp_remote_retrieve_response_code( $response );
    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( 200 !== (int) $code ) {
        $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : sprintf( 'HTTP %d', $code );
        wp_send_json_error( array( 'message' => $msg ) );
    }

    $label = __( 'Key is valid.', 'blockenberg' );
    if ( isset( $body['data']['limit_remaining'] ) && null !== $body['data']['limit_remaining'] ) {
        $label .= ' ' . sprintf(
            /* translators: %s: remaining credit */
            __( 'Remaining credit: %s', 'blockenberg' ),
            '$' . number_format_i18n( (float) $body['data']['limit_remaining'], 2 )
        );
    }
    if ( $unsaved ) {
        $label .= ' ' . __( 'Save the settings to start using it.', 'blockenberg' );
    }

    wp_send_json_success( array( 'message' => $label, 'unsaved' => $unsaved ) );
} );

/**
 * Render the settings screen.
 */
function bkbg_ai_render_settings_page() {
    $s       = bkbg_ai_get_settings();
    $const   = defined( 'BLOCKENBERG_AI_API_KEY' ) && BLOCKENBERG_AI_API_KEY;
    $has_key = '' !== bkbg_ai_get_api_key();
    ?>
    <div class="wrap bkbg-ai-settings">
        <header class="bkbg-ai-settings-header">
            <div>
                <p class="bkbg-ai-settings-eyebrow"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5"/><rect x="14" y="2" width="8" height="8" rx="1.5"/><rect x="2" y="14" width="8" height="8" rx="1.5"/><rect x="14" y="14" width="8" height="8" rx="1.5"/></svg><span>Blockenberg</span></p>
                <h1><?php esc_html_e( 'AI Agent Settings', 'blockenberg' ); ?></h1>
                <p><?php esc_html_e( 'Build and edit pages by chatting in the WordPress editor.', 'blockenberg' ); ?></p>
            </div>
            <span id="bkbg-ai-connection-status" class="bkbg-ai-status<?php echo $has_key ? ' is-configured' : ''; ?>">
                <span class="bkbg-ai-status-dot" aria-hidden="true"></span>
                <span><?php echo $has_key ? esc_html__( 'Key configured', 'blockenberg' ) : esc_html__( 'Not configured', 'blockenberg' ); ?></span>
            </span>
        </header>

        <?php if ( isset( $_GET['bkbg-updated'] ) ) : ?>
            <div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Settings saved.', 'blockenberg' ); ?></p></div>
        <?php endif; ?>

        <form id="bkbg-ai-settings-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
            <input type="hidden" name="action" value="bkbg_ai_save_settings" />
            <?php wp_nonce_field( 'bkbg_ai_settings' ); ?>

            <div class="bkbg-ai-settings-grid">
                <section class="bkbg-ai-settings-card" aria-labelledby="bkbg-ai-connection-heading">
                    <div class="bkbg-ai-card-heading">
                        <span class="dashicons dashicons-admin-links" aria-hidden="true"></span>
                        <div><h2 id="bkbg-ai-connection-heading"><?php esc_html_e( 'Connection', 'blockenberg' ); ?></h2>
                            <p><?php esc_html_e( 'OpenRouter powers the built-in chat. It is optional.', 'blockenberg' ); ?></p></div>
                    </div>
                    <div class="bkbg-ai-field-note"><?php esc_html_e( 'You can also connect Codex, Claude, or Cursor from the editor chat. That path does not need an OpenRouter API key.', 'blockenberg' ); ?></div>
                    <?php if ( $const ) : ?>
                        <div class="bkbg-ai-field-note"><?php esc_html_e( 'The API key is managed in wp-config.php.', 'blockenberg' ); ?></div>
                    <?php else : ?>
                        <label class="bkbg-ai-field-label" for="bkbg-ai-key"><?php esc_html_e( 'OpenRouter API key', 'blockenberg' ); ?></label>
                        <input type="password" id="bkbg-ai-key" name="api_key" autocomplete="new-password" value=""
                            placeholder="<?php echo $has_key ? esc_attr__( 'Saved key — leave blank to keep it', 'blockenberg' ) : 'sk-or-v1-…'; ?>"
                            aria-describedby="bkbg-ai-key-help" />
                        <p id="bkbg-ai-key-help" class="bkbg-ai-help"><?php esc_html_e( 'Your saved key stays on the server. Enter a new key to replace it.', 'blockenberg' ); ?></p>
                        <?php if ( ! empty( $s['api_key'] ) ) : ?>
                            <label class="bkbg-ai-check bkbg-ai-remove-key"><input type="checkbox" id="bkbg-ai-remove-key" name="remove_api_key" value="1" /><?php esc_html_e( 'Hide the saved key: Once the key is successfully saved, clear the input field so the key is no longer visible.', 'blockenberg' ); ?></label>
                        <?php endif; ?>
                    <?php endif; ?>
                    <div class="bkbg-ai-field-actions">
                        <button type="button" class="button" id="bkbg-ai-test"><span class="dashicons dashicons-yes-alt" aria-hidden="true"></span><?php esc_html_e( 'Test connection', 'blockenberg' ); ?></button>
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Get an API key', 'blockenberg' ); ?><span class="dashicons dashicons-external" aria-hidden="true"></span></a>
                    </div>
                    <p id="bkbg-ai-test-result" class="bkbg-ai-inline-status" role="status" aria-live="polite"></p>
                </section>

                <section class="bkbg-ai-settings-card" aria-labelledby="bkbg-ai-model-heading">
                    <div class="bkbg-ai-card-heading">
                        <span class="dashicons dashicons-format-chat" aria-hidden="true"></span>
                        <div><h2 id="bkbg-ai-model-heading"><?php esc_html_e( 'Default model', 'blockenberg' ); ?></h2>
                            <p><?php esc_html_e( 'The starting model for people using the agent.', 'blockenberg' ); ?></p></div>
                    </div>
                    <div id="bkbg-ai-model-picker-wrap" hidden>
                        <label class="bkbg-ai-field-label" id="bkbg-ai-model-label" for="bkbg-ai-model-trigger"><?php esc_html_e( 'Chat model', 'blockenberg' ); ?></label>
                        <div class="bkbg-ai-model-combobox" id="bkbg-ai-model-combobox">
                            <button type="button" id="bkbg-ai-model-trigger" class="bkbg-ai-model-combobox__trigger" aria-labelledby="bkbg-ai-model-label" aria-describedby="bkbg-ai-model-help bkbg-ai-model-price" aria-haspopup="listbox" aria-expanded="false" aria-controls="bkbg-ai-model-results">
                                <span id="bkbg-ai-model-trigger-label" class="bkbg-ai-model-combobox__value"></span>
                                <span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span>
                            </button>
                            <div class="bkbg-ai-model-combobox__panel" id="bkbg-ai-model-panel" hidden>
                                <input type="search" id="bkbg-ai-model-search" placeholder="<?php esc_attr_e( 'Search models…', 'blockenberg' ); ?>" aria-label="<?php esc_attr_e( 'Search models', 'blockenberg' ); ?>" aria-controls="bkbg-ai-model-results" aria-autocomplete="list" autocomplete="off" />
                                <div class="bkbg-ai-model-combobox__results" id="bkbg-ai-model-results" role="listbox" aria-labelledby="bkbg-ai-model-label"></div>
                            </div>
                        </div>
                    </div>
                    <div id="bkbg-ai-custom-model-wrap">
                        <label class="bkbg-ai-field-label" for="bkbg-ai-model"><?php esc_html_e( 'Custom model ID', 'blockenberg' ); ?></label>
                        <input type="text" id="bkbg-ai-model" name="model" value="<?php echo esc_attr( $s['model'] ); ?>"
                            spellcheck="false" autocomplete="off" placeholder="minimax/minimax-m3:free" />
                    </div>
                    <p id="bkbg-ai-model-loading" class="bkbg-ai-help" role="status"></p>
                    <p id="bkbg-ai-model-price" class="bkbg-ai-model-price" aria-live="polite"></p>
                    <p id="bkbg-ai-model-help" class="bkbg-ai-help"><?php esc_html_e( 'Type to search by name or model ID. Free models appear first (not guaranteed — they often error, but are fine for small fixes), then paid models, each in alphabetical order. Only models that support tools are listed.', 'blockenberg' ); ?></p>
                    <div class="bkbg-ai-field-note"><?php esc_html_e( 'The editor remembers each person’s last selected model. Changing this default keeps their choice.', 'blockenberg' ); ?></div>
                </section>

                <section class="bkbg-ai-settings-card" aria-labelledby="bkbg-ai-images-heading">
                    <div class="bkbg-ai-card-heading">
                        <span class="dashicons dashicons-format-image" aria-hidden="true"></span>
                        <div><h2 id="bkbg-ai-images-heading"><?php esc_html_e( 'Images', 'blockenberg' ); ?></h2>
                            <p><?php esc_html_e( 'Choose how the agent illustrates your pages.', 'blockenberg' ); ?></p></div>
                    </div>
                    <fieldset class="bkbg-ai-image-choices">
                        <legend class="screen-reader-text"><?php esc_html_e( 'Default image source', 'blockenberg' ); ?></legend>
                        <label class="bkbg-ai-radio-card"><input type="radio" name="image_source" value="openverse" <?php checked( 'openverse', $s['image_source'] ); ?> />
                            <span><strong><?php esc_html_e( 'Search free photos', 'blockenberg' ); ?></strong><small><?php esc_html_e( 'Find openly licensed images with Openverse and Wikimedia Commons.', 'blockenberg' ); ?></small></span>
                        </label>
                        <label class="bkbg-ai-radio-card"><input type="radio" name="image_source" value="openrouter" <?php checked( 'openrouter', $s['image_source'] ); ?> />
                            <span><strong><?php esc_html_e( 'Generate with AI', 'blockenberg' ); ?></strong><small><?php esc_html_e( 'Create images with OpenRouter. Image generation has its own model pricing, even when chat is free.', 'blockenberg' ); ?></small></span>
                        </label>
                    </fieldset>
                    <div id="bkbg-ai-image-model-wrap" class="bkbg-ai-image-model-field">
                        <div id="bkbg-ai-image-model-picker-wrap" hidden>
                            <label class="bkbg-ai-field-label" id="bkbg-ai-image-model-label" for="bkbg-ai-image-model-trigger"><?php esc_html_e( 'Image model', 'blockenberg' ); ?></label>
                            <div class="bkbg-ai-model-combobox" id="bkbg-ai-image-model-combobox">
                                <button type="button" id="bkbg-ai-image-model-trigger" class="bkbg-ai-model-combobox__trigger" aria-labelledby="bkbg-ai-image-model-label" aria-describedby="bkbg-ai-image-help bkbg-ai-image-model-price" aria-haspopup="listbox" aria-expanded="false" aria-controls="bkbg-ai-image-model-results">
                                    <span id="bkbg-ai-image-model-trigger-label" class="bkbg-ai-model-combobox__value"></span>
                                    <span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span>
                                </button>
                                <div class="bkbg-ai-model-combobox__panel" id="bkbg-ai-image-model-panel" hidden>
                                    <input type="search" id="bkbg-ai-image-model-search" placeholder="<?php esc_attr_e( 'Search image models…', 'blockenberg' ); ?>" aria-label="<?php esc_attr_e( 'Search image models', 'blockenberg' ); ?>" aria-controls="bkbg-ai-image-model-results" aria-autocomplete="list" autocomplete="off" />
                                    <div class="bkbg-ai-model-combobox__results" id="bkbg-ai-image-model-results" role="listbox" aria-labelledby="bkbg-ai-image-model-label"></div>
                                </div>
                            </div>
                        </div>
                        <div id="bkbg-ai-image-custom-model-wrap">
                            <label class="bkbg-ai-field-label" for="bkbg-ai-image-model"><?php esc_html_e( 'Custom model ID', 'blockenberg' ); ?></label>
                            <input type="text" id="bkbg-ai-image-model" name="image_model" value="<?php echo esc_attr( $s['image_model'] ); ?>" spellcheck="false" autocomplete="off" placeholder="google/gemini-2.5-flash-image" />
                        </div>
                        <p id="bkbg-ai-image-model-loading" class="bkbg-ai-help" role="status"></p>
                        <p id="bkbg-ai-image-model-price" class="bkbg-ai-model-price" aria-live="polite"></p>
                        <p id="bkbg-ai-image-help" class="bkbg-ai-help"><?php esc_html_e( 'Type to search image models from OpenRouter. Used only when Generate with AI is selected. Every image is saved to the Media Library.', 'blockenberg' ); ?></p>
                    </div>
                </section>

                <section class="bkbg-ai-settings-card" aria-labelledby="bkbg-ai-context-heading">
                    <div class="bkbg-ai-card-heading">
                        <span class="dashicons dashicons-admin-site-alt3" aria-hidden="true"></span>
                        <div><h2 id="bkbg-ai-context-heading"><?php esc_html_e( 'Site & brand context', 'blockenberg' ); ?></h2>
                            <p><?php esc_html_e( 'Give every conversation a useful starting point.', 'blockenberg' ); ?></p></div>
                    </div>
                    <label class="bkbg-ai-field-label" for="bkbg-ai-context"><?php esc_html_e( 'What should the agent know?', 'blockenberg' ); ?></label>
                    <textarea id="bkbg-ai-context" name="site_context" rows="8" aria-describedby="bkbg-ai-context-help" placeholder="<?php esc_attr_e( 'Who the site is for, your tone of voice, brand colors, fonts, and details to include in the content.', 'blockenberg' ); ?>"><?php echo esc_textarea( $s['site_context'] ); ?></textarea>
                    <p id="bkbg-ai-context-help" class="bkbg-ai-help"><?php esc_html_e( 'Included in every model request. Keep it relevant and avoid passwords or private credentials.', 'blockenberg' ); ?></p>
                </section>

                <section class="bkbg-ai-settings-card" aria-labelledby="bkbg-ai-editor-heading">
                    <div class="bkbg-ai-card-heading">
                        <span class="dashicons dashicons-align-pull-right" aria-hidden="true"></span>
                        <div><h2 id="bkbg-ai-editor-heading"><?php esc_html_e( 'Editor', 'blockenberg' ); ?></h2>
                            <p><?php esc_html_e( 'How the agent appears in the block editor.', 'blockenberg' ); ?></p></div>
                    </div>
                    <label class="bkbg-ai-check"><input type="checkbox" name="open_sidebar" value="1" <?php checked( ! empty( $s['open_sidebar'] ) ); ?> /><?php esc_html_e( 'Open the AI Agent when the editor loads', 'blockenberg' ); ?></label>
                    <p class="bkbg-ai-help"><?php esc_html_e( 'The chat opens instead of page settings. You can still close it; this applies the next time you edit a page.', 'blockenberg' ); ?></p>
                </section>
            </div>

            <details class="bkbg-ai-settings-advanced">
                <summary><span class="dashicons dashicons-admin-generic" aria-hidden="true"></span><span><?php esc_html_e( 'Advanced settings', 'blockenberg' ); ?></span><small><?php esc_html_e( 'Streaming, step limit, and creativity', 'blockenberg' ); ?></small></summary>
                <div class="bkbg-ai-advanced-fields">
                    <div><label class="bkbg-ai-check"><input type="checkbox" name="stream" value="1" <?php checked( ! empty( $s['stream'] ) ); ?> /><?php esc_html_e( 'Stream responses', 'blockenberg' ); ?></label>
                        <p class="bkbg-ai-help"><?php esc_html_e( 'Show replies as they are written. Falls back to a complete reply when streaming is unavailable.', 'blockenberg' ); ?></p></div>
                    <div><label class="bkbg-ai-field-label" for="bkbg-ai-steps"><?php esc_html_e( 'Step limit per message', 'blockenberg' ); ?></label>
                        <input type="number" id="bkbg-ai-steps" name="max_steps" min="0" max="40" step="1" aria-describedby="bkbg-ai-steps-help" value="<?php echo esc_attr( $s['max_steps'] ); ?>" />
                        <p id="bkbg-ai-steps-help" class="bkbg-ai-help"><?php esc_html_e( '0 = no limit (default). The agent works until it finishes or you press Stop. Set 1–40 to pause after a fixed number of steps.', 'blockenberg' ); ?></p></div>
                    <div><label class="bkbg-ai-field-label" for="bkbg-ai-temp"><?php esc_html_e( 'Creativity', 'blockenberg' ); ?></label>
                        <input type="number" id="bkbg-ai-temp" name="temperature" min="0" max="2" step="0.1" value="<?php echo esc_attr( $s['temperature'] ); ?>" />
                        <p class="bkbg-ai-help"><?php esc_html_e( 'Lower values favor consistency; higher values add variety. The default is 0.4.', 'blockenberg' ); ?></p></div>
                </div>
            </details>

            <footer class="bkbg-ai-settings-footer">
                <button type="submit" class="button button-primary"><?php esc_html_e( 'Save settings', 'blockenberg' ); ?></button>
                <span id="bkbg-ai-save-status" role="status" aria-live="polite"><?php esc_html_e( 'Changes apply after saving.', 'blockenberg' ); ?></span>
            </footer>
        </form>
    </div>
    <?php
}

/** Load settings assets only on the agent settings screen. */
add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( 'blockenberg_page_blockenberg-ai' !== $hook ) {
        return;
    }
    $plugin_dir = dirname( __DIR__, 2 );
    $plugin_url = plugins_url( '', $plugin_dir . '/blockenberg.php' );
    $css = $plugin_dir . '/assets/css/ai-settings.css';
    $js  = $plugin_dir . '/assets/js/ai-settings.js';
    wp_enqueue_style( 'bkbg-ai-settings', $plugin_url . '/assets/css/ai-settings.css', array(), filemtime( $css ) );
    wp_enqueue_script( 'bkbg-ai-settings', $plugin_url . '/assets/js/ai-settings.js', array( 'wp-i18n' ), filemtime( $js ), true );
    wp_add_inline_script( 'bkbg-ai-settings', 'window.bkbgAISettings = ' . wp_json_encode( array(
        'restBase' => esc_url_raw( rest_url( 'blockenberg/v1' ) ),
        'nonce' => wp_create_nonce( 'wp_rest' ),
        'testNonce' => wp_create_nonce( 'bkbg_ai_test' ),
        'configured' => '' !== bkbg_ai_get_api_key(),
    ) ) . ';', 'before' );
    wp_set_script_translations( 'bkbg-ai-settings', 'blockenberg' );
} );

/* ──────────────────────────────────────────────
 * 3. Custom CSS written by the agent
 * ────────────────────────────────────────────── */

add_action( 'init', function () {
    register_post_meta( '', BKBG_AI_CSS_META, array(
        'type'              => 'string',
        'single'            => true,
        'default'           => '',
        'show_in_rest'      => true,
        'sanitize_callback' => 'bkbg_ai_sanitize_css',
        'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
            return current_user_can( 'edit_post', $post_id );
        },
    ) );
} );

/**
 * Keep CSS as CSS: no tags, no closing style element.
 *
 * @param string $css Raw CSS.
 * @return string
 */
function bkbg_ai_sanitize_css( $css ) {
    $css = (string) $css;
    $css = preg_replace( '#</?\s*(style|script)[^>]*>#i', '', $css );
    // A literal '<' cannot occur in an HTML raw-text style element safely.
    // Keep '>', however: it is the CSS child combinator and is also valid in
    // media queries. Removing it silently changes the rules the user sees.
    $css = str_replace( '<', '', $css );
    return trim( wp_check_invalid_utf8( $css ) );
}

/**
 * Print per-post custom CSS on the front end.
 */
add_action( 'wp_head', function () {
    if ( ! is_singular() ) {
        return;
    }
    $css = get_post_meta( get_queried_object_id(), BKBG_AI_CSS_META, true );
    if ( ! $css ) {
        return;
    }
    echo "\n<style id=\"bkbg-ai-custom-css\">\n" . bkbg_ai_sanitize_css( $css ) . "\n</style>\n";
}, 99 );

/* ──────────────────────────────────────────────
 * 4. REST API
 * ────────────────────────────────────────────── */

add_action( 'rest_api_init', function () {
    $permission = function () {
        return bkbg_ai_user_can_use()
            ? true
            : new WP_Error( 'bkbg_ai_forbidden', __( 'You cannot use the AI agent.', 'blockenberg' ), array( 'status' => 403 ) );
    };

    register_rest_route( 'blockenberg/v1', '/ai/chat', array(
        'methods'             => 'POST',
        'permission_callback' => $permission,
        'callback'            => 'bkbg_ai_rest_chat',
    ) );

    register_rest_route( 'blockenberg/v1', '/ai/models', array(
        'methods'             => 'GET',
        'permission_callback' => $permission,
        'callback'            => 'bkbg_ai_rest_models',
    ) );

    register_rest_route( 'blockenberg/v1', '/ai/image-models', array(
        'methods'             => 'GET',
        'permission_callback' => $permission,
        'callback'            => 'bkbg_ai_rest_image_models',
    ) );

    register_rest_route( 'blockenberg/v1', '/ai/preferences', array(
        array(
            'methods'             => 'GET',
            'permission_callback' => $permission,
            'callback'            => function () {
                return rest_ensure_response( array( 'model' => bkbg_ai_get_preferred_model() ) );
            },
        ),
        array(
            'methods'             => 'POST',
            'permission_callback' => $permission,
            'callback'            => 'bkbg_ai_rest_save_preferences',
        ),
    ) );

    register_rest_route( 'blockenberg/v1', '/ai/media', array(
        'methods'             => 'POST',
        'permission_callback' => function () {
            return bkbg_ai_user_can_use() && current_user_can( 'upload_files' )
                ? true
                : new WP_Error( 'bkbg_ai_forbidden', __( 'You cannot create images with the AI agent.', 'blockenberg' ), array( 'status' => 403 ) );
        },
        'callback'            => 'bkbg_ai_rest_media',
    ) );
} );

/** Save only this user's model choice; this endpoint cannot alter site settings. */
function bkbg_ai_rest_save_preferences( WP_REST_Request $request ) {
    $params = $request->get_json_params();
    if ( ! is_array( $params ) || ! isset( $params['model'] ) ||
        ( '' !== $params['model'] && ! bkbg_ai_valid_model_id( $params['model'] ) ) ) {
        return new WP_Error( 'bkbg_ai_bad_request', __( 'Choose a valid model.', 'blockenberg' ), array( 'status' => 400 ) );
    }
    $model   = $params['model'];
    $user_id = get_current_user_id();
    if ( '' === $model ) {
        delete_user_meta( $user_id, BKBG_AI_MODEL_META );
    } else {
        update_user_meta( $user_id, BKBG_AI_MODEL_META, $model );
    }
    if ( bkbg_ai_get_preferred_model() !== $model ) {
        return new WP_Error( 'bkbg_ai_preference_save', __( 'The model preference could not be saved. Please try again.', 'blockenberg' ), array( 'status' => 500 ) );
    }
    return rest_ensure_response( array( 'model' => $model ) );
}

/**
 * Proxy a single chat completion to OpenRouter.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function bkbg_ai_rest_chat( WP_REST_Request $request ) {
    $key = bkbg_ai_get_api_key();
    if ( '' === $key ) {
        return new WP_Error( 'bkbg_ai_no_key', __( 'No OpenRouter API key is configured. Add one under Blockenberg → AI Agent Settings.', 'blockenberg' ), array( 'status' => 400 ) );
    }

    $settings = bkbg_ai_get_settings();
    $params   = $request->get_json_params();
    if ( ! is_array( $params ) ) {
        $params = array();
    }

    $messages = isset( $params['messages'] ) ? $params['messages'] : null;
    if ( ! is_array( $messages ) || empty( $messages ) ) {
        return new WP_Error( 'bkbg_ai_bad_request', __( 'No messages supplied.', 'blockenberg' ), array( 'status' => 400 ) );
    }

    // Conversations grow with every tool result; keep a sane ceiling.
    if ( strlen( (string) wp_json_encode( $messages ) ) > 2000000 ) {
        return new WP_Error(
            'bkbg_ai_too_large',
            __( 'This conversation has grown too large. Clear the chat and start a fresh one.', 'blockenberg' ),
            array( 'status' => 413 )
        );
    }

    $payload = array(
        'model'    => isset( $params['model'] ) && $params['model'] ? sanitize_text_field( $params['model'] ) : $settings['model'],
        'messages' => $messages,
    );

    if ( isset( $params['tools'] ) && is_array( $params['tools'] ) ) {
        $payload['tools']       = $params['tools'];
        $payload['tool_choice'] = isset( $params['tool_choice'] ) ? $params['tool_choice'] : 'auto';
    }

    $payload['temperature'] = isset( $params['temperature'] )
        ? max( 0, min( 2, (float) $params['temperature'] ) )
        : (float) $settings['temperature'];

    if ( isset( $params['max_tokens'] ) ) {
        $payload['max_tokens'] = max( 256, min( 32000, (int) $params['max_tokens'] ) );
    }

    // Ask OpenRouter to report what the call cost.
    if ( ! empty( $params['usage']['include'] ) ) {
        $payload['usage'] = array( 'include' => true );
    }

    if ( ! empty( $params['stream'] ) && ! empty( $settings['stream'] ) && function_exists( 'curl_init' ) ) {
        bkbg_ai_stream_completion( $payload ); // Writes SSE and exits.
    }

    $response = bkbg_ai_openrouter_post( 'chat/completions', $payload, 180 );
    if ( is_wp_error( $response ) ) {
        return $response;
    }

    return rest_ensure_response( $response );
}

/**
 * Pipe a streaming completion straight through to the browser as SSE.
 *
 * Never returns: the response is written by hand so chunks reach the panel as
 * the model writes them.
 *
 * @param array $payload Chat completion payload.
 * @return void
 */
function bkbg_ai_stream_completion( $payload ) {
    $payload['stream'] = true;

    // Turn off everything that would hold the bytes back.
    @ini_set( 'zlib.output_compression', '0' );
    @ini_set( 'implicit_flush', '1' );
    @ini_set( 'max_execution_time', '300' );
    while ( ob_get_level() > 0 ) {
        if ( ! @ob_end_flush() ) {
            break; // Some hosting providers install non-removable buffers.
        }
    }
    @ob_implicit_flush( true );
    // Let the cURL callback close the upstream connection when the user stops
    // the reply, including on hosts configured to ignore aborted requests.
    ignore_user_abort( true );

    nocache_headers();
    header( 'Content-Type: text/event-stream; charset=utf-8' );
    header( 'Cache-Control: no-cache, no-store, must-revalidate' );
    header( 'X-Accel-Buffering: no' ); // nginx
    header( 'Connection: keep-alive' );

    $status     = 0;
    $is_sse     = false;
    $stream_tail = '';
    $saw_done   = false;
    $error_body = '';

    $handle = curl_init( 'https://openrouter.ai/api/v1/chat/completions' );
    curl_setopt_array( $handle, array(
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => wp_json_encode( $payload ),
        CURLOPT_RETURNTRANSFER => false,
        CURLOPT_CONNECTTIMEOUT => 20,
        CURLOPT_TIMEOUT        => 300,
        CURLOPT_CAINFO         => ABSPATH . WPINC . '/certificates/ca-bundle.crt',
        CURLOPT_HTTPHEADER     => array(
            'Authorization: Bearer ' . bkbg_ai_get_api_key(),
            'Content-Type: application/json',
            'Accept: text/event-stream',
            'HTTP-Referer: ' . home_url( '/' ),
            'X-Title: Blockenberg AI Agent',
        ),
        CURLOPT_HEADERFUNCTION => function ( $handle, $header ) use ( &$status, &$is_sse ) {
            if ( preg_match( '#^HTTP/\S+\s+(\d{3})#', $header, $match ) ) {
                $status = (int) $match[1];
                $is_sse = false;
            } elseif ( 0 === stripos( $header, 'Content-Type:' ) ) {
                $is_sse = false !== stripos( $header, 'text/event-stream' );
            }
            return strlen( $header );
        },
        CURLOPT_WRITEFUNCTION  => function ( $handle, $chunk ) use ( &$status, &$is_sse, &$error_body, &$stream_tail, &$saw_done ) {
            if ( connection_aborted() ) {
                return 0;
            }
            // An error response is JSON, not SSE — collect it and report it as
            // one event once the request finishes, even if it has HTTP 200.
            if ( $status < 200 || $status >= 300 || ! $is_sse ) {
                $error_body .= substr( $chunk, 0, max( 0, 16384 - strlen( $error_body ) ) );
                return strlen( $chunk );
            }
            $stream_tail .= $chunk;
            if ( preg_match( '/(?:^|\n)data:\s*\[DONE\](?:\r?\n|$)/', $stream_tail ) ) {
                $saw_done = true;
            }
            $stream_tail = substr( $stream_tail, -128 );
            echo $chunk;
            flush();
            return connection_aborted() ? 0 : strlen( $chunk );
        },
    ) );

    $ok = curl_exec( $handle );

    if ( false === $ok && '' === $error_body ) {
        $error_body = wp_json_encode( array( 'error' => array( 'message' => curl_error( $handle ) ) ) );
    }
    curl_close( $handle );

    if ( connection_aborted() ) {
        exit;
    }

    if ( '' === $error_body && ! $saw_done ) {
        $error_body = wp_json_encode( array( 'error' => array( 'message' => __( 'The model response was interrupted. Please try again.', 'blockenberg' ) ) ) );
    }

    if ( '' !== $error_body ) {
        $decoded = json_decode( $error_body, true );
        $message = is_array( $decoded ) ? bkbg_ai_error_message( $decoded ) : '';
        if ( '' === $message ) {
            $message = wp_strip_all_tags( substr( $error_body, 0, 400 ) );
        }
        // Separate an error from any incomplete upstream event.
        echo "\n\n" . 'data: ' . wp_json_encode( array( 'error' => array( 'message' => $message ) ) ) . "\n\n";
        flush();
    }

    if ( ! $saw_done ) {
        echo "data: [DONE]\n\n";
    }
    flush();
    exit;
}

/**
 * POST to the OpenRouter API and normalise errors.
 *
 * @param string $path    API path after /api/v1/.
 * @param array  $payload JSON payload.
 * @param int    $timeout Seconds.
 * @return array|WP_Error
 */
function bkbg_ai_openrouter_post( $path, $payload, $timeout = 120 ) {
    if ( '' === bkbg_ai_get_api_key() ) {
        return new WP_Error( 'bkbg_ai_no_key', __( 'No OpenRouter API key is configured. Add one under Blockenberg → AI Agent Settings.', 'blockenberg' ), array( 'status' => 400 ) );
    }

    $response = wp_remote_post( 'https://openrouter.ai/api/v1/' . ltrim( $path, '/' ), array(
        'timeout' => $timeout,
        'headers' => array(
            'Authorization' => 'Bearer ' . bkbg_ai_get_api_key(),
            'Content-Type'  => 'application/json',
            'HTTP-Referer'  => home_url( '/' ),
            'X-Title'       => 'Blockenberg AI Agent',
        ),
        'body'    => wp_json_encode( $payload ),
    ) );

    if ( is_wp_error( $response ) ) {
        return new WP_Error( 'bkbg_ai_http', $response->get_error_message(), array( 'status' => 502 ) );
    }

    $code = (int) wp_remote_retrieve_response_code( $response );
    $body = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( $code < 200 || $code >= 300 || ! is_array( $body ) ) {
        $message = is_array( $body )
            ? bkbg_ai_error_message( $body )
            : wp_strip_all_tags( substr( (string) wp_remote_retrieve_body( $response ), 0, 500 ) );

        if ( '' === trim( (string) $message ) ) {
            $message = sprintf(
                /* translators: %d: HTTP status code */
                __( 'The model provider returned HTTP %d.', 'blockenberg' ),
                $code
            );
        }
        return new WP_Error( 'bkbg_ai_provider', $message, array( 'status' => 502 ) );
    }

    // A 200 can still carry an error object (provider-level failure).
    if ( isset( $body['error'] ) ) {
        return new WP_Error( 'bkbg_ai_provider', bkbg_ai_error_message( $body ), array( 'status' => 502 ) );
    }

    return $body;
}

/**
 * Flatten an OpenRouter error body into one readable line.
 *
 * OpenRouter often answers with a vague "Provider returned error" and puts the
 * real cause in error.metadata, so surface that too.
 *
 * @param array $body Decoded response body.
 * @return string
 */
function bkbg_ai_error_message( $body ) {
    if ( ! isset( $body['error'] ) ) {
        return '';
    }

    $error = $body['error'];
    if ( ! is_array( $error ) ) {
        return is_scalar( $error ) ? (string) $error : __( 'The model provider returned an invalid error response.', 'blockenberg' );
    }
    $message = isset( $error['message'] ) && is_string( $error['message'] )
        ? $error['message']
        : __( 'The model provider could not complete the request.', 'blockenberg' );
    $parts   = array();

    if ( ! empty( $error['metadata']['provider_name'] ) ) {
        $parts[] = (string) $error['metadata']['provider_name'];
    }

    if ( ! empty( $error['metadata']['raw'] ) ) {
        $raw     = $error['metadata']['raw'];
        $parts[] = wp_strip_all_tags( substr( is_string( $raw ) ? $raw : (string) wp_json_encode( $raw ), 0, 400 ) );
    }

    if ( ! empty( $error['code'] ) && ! $parts ) {
        $parts[] = 'code ' . $error['code'];
    }

    return $parts ? $message . ' — ' . implode( ': ', $parts ) : $message;
}

/**
 * Fetch a public OpenRouter model catalog.
 *
 * @param string $url Catalog URL.
 * @return array|WP_Error Raw model objects.
 */
function bkbg_ai_fetch_openrouter_catalog( $url ) {
    $response = wp_remote_get( $url, array( 'timeout' => 20 ) );
    if ( is_wp_error( $response ) ) {
        return new WP_Error( 'bkbg_ai_http', $response->get_error_message(), array( 'status' => 502 ) );
    }

    $body = json_decode( wp_remote_retrieve_body( $response ), true );
    $code = (int) wp_remote_retrieve_response_code( $response );
    if ( 200 !== $code || ! is_array( $body ) || ! isset( $body['data'] ) || ! is_array( $body['data'] ) || isset( $body['error'] ) ) {
        $message = is_array( $body ) ? bkbg_ai_error_message( $body ) : '';
        return new WP_Error(
            'bkbg_ai_provider',
            $message ? $message : __( 'The model list is temporarily unavailable. Try again shortly.', 'blockenberg' ),
            array( 'status' => 502 )
        );
    }

    return $body['data'];
}

/**
 * Normalize one OpenRouter catalog row for the settings pickers.
 *
 * @param array $model Provider model object.
 * @return array|null
 */
function bkbg_ai_normalize_catalog_model( $model ) {
    if ( ! is_array( $model ) || empty( $model['id'] ) || ! bkbg_ai_valid_model_id( $model['id'] ) ) {
        return null;
    }
    $pricing      = array();
    $prices_known = true;
    foreach ( isset( $model['pricing'] ) && is_array( $model['pricing'] ) ? $model['pricing'] : array() as $metric => $price ) {
        if ( is_numeric( $price ) && is_finite( (float) $price ) ) {
            $pricing[ $metric ] = (float) $price;
        } else {
            $prices_known = false;
        }
    }
    // Missing prices and routed prices (-1) are not a promise of free
    // usage. Every advertised charge must be zero, including requests.
    $free = $prices_known && isset( $pricing['prompt'], $pricing['completion'] ) &&
        0.0 === $pricing['prompt'] && 0.0 === $pricing['completion'];
    foreach ( $pricing as $price ) {
        if ( 0.0 !== $price ) {
            $free = false;
            break;
        }
    }
    return array(
        'id'      => $model['id'],
        'name'    => isset( $model['name'] ) && is_string( $model['name'] ) ? $model['name'] : $model['id'],
        'context' => isset( $model['context_length'] ) ? (int) $model['context_length'] : 0,
        'free'    => $free,
        'pricing' => $pricing,
    );
}

/**
 * Sort catalog models: free first, then alphabetical.
 *
 * @param array $models Normalized models.
 * @return array
 */
function bkbg_ai_sort_catalog_models( $models ) {
    usort( $models, function ( $left, $right ) {
        if ( $left['free'] !== $right['free'] ) {
            return $left['free'] ? -1 : 1;
        }
        $name_order = strcasecmp( $left['name'], $right['name'] );
        return $name_order ? $name_order : strcmp( $left['id'], $right['id'] );
    } );
    return $models;
}

/**
 * Whether a catalog row advertises image output.
 *
 * @param array $model Provider model object.
 * @return bool
 */
function bkbg_ai_model_outputs_image( $model ) {
    if ( ! is_array( $model ) || empty( $model['architecture'] ) || ! is_array( $model['architecture'] ) ) {
        return false;
    }
    $outputs = isset( $model['architecture']['output_modalities'] ) ? $model['architecture']['output_modalities'] : array();
    return is_array( $outputs ) && in_array( 'image', $outputs, true );
}

/**
 * List OpenRouter chat models that can call tools (cached for an hour).
 *
 * @return WP_REST_Response|WP_Error
 */
function bkbg_ai_rest_models() {
    $cached = get_transient( BKBG_AI_MODELS_CACHE );
    if ( is_array( $cached ) ) {
        return rest_ensure_response( $cached );
    }

    $data = bkbg_ai_fetch_openrouter_catalog( 'https://openrouter.ai/api/v1/models' );
    if ( is_wp_error( $data ) ) {
        return $data;
    }

    $models = array();
    foreach ( $data as $model ) {
        $params = isset( $model['supported_parameters'] ) ? (array) $model['supported_parameters'] : array();
        if ( ! in_array( 'tools', $params, true ) ) {
            continue;
        }
        $normalized = bkbg_ai_normalize_catalog_model( $model );
        if ( $normalized ) {
            $models[] = $normalized;
        }
    }

    $models = bkbg_ai_sort_catalog_models( $models );
    set_transient( BKBG_AI_MODELS_CACHE, $models, HOUR_IN_SECONDS );
    return rest_ensure_response( $models );
}

/**
 * List OpenRouter image-generation models (cached for an hour).
 *
 * @return WP_REST_Response|WP_Error
 */
function bkbg_ai_rest_image_models() {
    $cached = get_transient( BKBG_AI_IMAGE_MODELS_CACHE );
    if ( is_array( $cached ) ) {
        return rest_ensure_response( $cached );
    }

    $data = bkbg_ai_fetch_openrouter_catalog( 'https://openrouter.ai/api/v1/models?output_modalities=image' );
    if ( is_wp_error( $data ) ) {
        return $data;
    }

    $models = array();
    foreach ( $data as $model ) {
        if ( ! bkbg_ai_model_outputs_image( $model ) ) {
            continue;
        }
        $normalized = bkbg_ai_normalize_catalog_model( $model );
        if ( $normalized ) {
            $models[] = $normalized;
        }
    }

    $models = bkbg_ai_sort_catalog_models( $models );
    set_transient( BKBG_AI_IMAGE_MODELS_CACHE, $models, HOUR_IN_SECONDS );
    return rest_ensure_response( $models );
}

/**
 * Find or generate an image and put it in the Media Library.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|WP_Error
 */
function bkbg_ai_rest_media( WP_REST_Request $request ) {
    $settings = bkbg_ai_get_settings();
    $params   = $request->get_json_params();
    if ( ! is_array( $params ) ) {
        $params = array();
    }

    $prompt = isset( $params['prompt'] ) ? sanitize_text_field( $params['prompt'] ) : '';
    $alt    = isset( $params['alt'] ) ? sanitize_text_field( $params['alt'] ) : $prompt;
    $source = isset( $params['source'] ) ? sanitize_text_field( $params['source'] ) : $settings['image_source'];
    $post_id = isset( $params['post_id'] ) ? (int) $params['post_id'] : 0;

    // Check the parent before making a billed request or adding any media.
    if ( $post_id && ( $post_id < 0 || ! get_post( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) ) {
        return new WP_Error( 'bkbg_ai_forbidden', __( 'You cannot attach images to this post.', 'blockenberg' ), array( 'status' => 403 ) );
    }

    if ( ! in_array( $source, array( 'openverse', 'openrouter' ), true ) ) {
        return new WP_Error( 'bkbg_ai_bad_request', __( 'Unknown image source.', 'blockenberg' ), array( 'status' => 400 ) );
    }

    if ( '' === $prompt ) {
        return new WP_Error( 'bkbg_ai_bad_request', __( 'An image prompt is required.', 'blockenberg' ), array( 'status' => 400 ) );
    }

    if ( 'openrouter' === $source ) {
        $image = bkbg_ai_generate_image( $prompt, $settings['image_model'] );
    } else {
        $image = bkbg_ai_search_openverse( $prompt );
    }

    if ( is_wp_error( $image ) ) {
        return $image;
    }

    $attachment_id = bkbg_ai_sideload_candidates( $image, $prompt, $alt, $post_id );
    if ( is_wp_error( $attachment_id ) ) {
        return $attachment_id;
    }

    return rest_ensure_response( array(
        'id'     => $attachment_id,
        'url'    => wp_get_attachment_url( $attachment_id ),
        'alt'    => $alt,
        'source' => $source,
        'credit' => isset( $image['credit'] ) ? $image['credit'] : '',
        'caption' => bkbg_ai_image_caption( $image ),
        'attribution' => bkbg_ai_image_attribution( $image ),
    ) );
}

/** Try a bounded set of search results, retaining the credit of the saved image. */
function bkbg_ai_sideload_candidates( &$image, $title, $alt, $post_id = 0 ) {
    $candidates = array_merge( array( $image ), isset( $image['alternatives'] ) && is_array( $image['alternatives'] ) ? $image['alternatives'] : array() );
    $seen = array();
    $first_error = null;
    foreach ( array_slice( $candidates, 0, 3 ) as $candidate ) {
        $url = isset( $candidate['url'] ) ? $candidate['url'] : '';
        if ( ! is_string( $url ) || isset( $seen[ $url ] ) ) { continue; }
        $seen[ $url ] = true;
        $result = bkbg_ai_sideload( $candidate, $title, $alt, $post_id );
        if ( ! is_wp_error( $result ) ) {
            $image = $candidate;
            return $result;
        }
        if ( ! $first_error ) { $first_error = $result; }
        // Retrying another remote file cannot fix a local write/permission error.
        if ( in_array( $result->get_error_code(), array( 'bkbg_ai_image_write', 'upload_error' ), true ) ) { break; }
    }
    return $first_error ?: new WP_Error( 'bkbg_ai_bad_image', __( 'No downloadable image was found.', 'blockenberg' ), array( 'status' => 502 ) );
}

/**
 * Ask an OpenRouter image model for a picture.
 *
 * @param string $prompt Prompt.
 * @param string $model  Image-capable model id.
 * @return array|WP_Error {data|url, mime}
 */
function bkbg_ai_generate_image( $prompt, $model ) {
    $body = bkbg_ai_openrouter_post( 'images', array(
        'model'  => $model,
        'prompt' => $prompt,
        'n'      => 1,
    ), 180 );

    if ( is_wp_error( $body ) ) {
        return $body;
    }

    $url = '';
    if ( isset( $body['data'] ) && is_array( $body['data'] ) ) {
        foreach ( $body['data'] as $img ) {
            if ( ! empty( $img['b64_json'] ) && is_string( $img['b64_json'] ) ) {
                // media_type may be omitted; sideload inspects the bytes to
                // choose the real extension instead of trusting this label.
                $mime = isset( $img['media_type'] ) && is_string( $img['media_type'] ) ? $img['media_type'] : 'image/png';
                $url  = 'data:' . $mime . ';base64,' . $img['b64_json'];
                break;
            }
        }
    }

    if ( '' === $url ) {
        return new WP_Error(
            'bkbg_ai_no_image',
            sprintf(
                /* translators: %s: model id */
                __( 'The model %s did not return an image. Pick an image-capable model under Blockenberg → AI Agent Settings.', 'blockenberg' ),
                $model
            ),
            array( 'status' => 502 )
        );
    }

    return array( 'url' => $url, 'credit' => sprintf( 'Generated with %s', $model ) );
}

/**
 * Find an openly licensed photo.
 *
 * Tries Openverse first, then Wikimedia Commons, and shortens the query as it
 * goes — long descriptive prompts rarely match anything, and either service can
 * be down without the agent losing the ability to illustrate a page.
 *
 * @param string $query Search terms.
 * @return array|WP_Error
 */
function bkbg_ai_search_openverse( $query ) {
    $tried    = array();
    $variants = bkbg_ai_query_variants( $query );
    $sources  = array( 'bkbg_ai_openverse_request', 'bkbg_ai_commons_request' );

    foreach ( $sources as $source ) {
        // A source that just timed out is skipped for a few minutes — paying
        // that timeout again on every image would stall a whole page build.
        $down_key = 'bkbg_ai_down_' . md5( $source );
        if ( get_transient( $down_key ) ) {
            continue;
        }

        foreach ( $variants as $variant ) {
            $tried[] = $variant;
            $result  = call_user_func( $source, $variant );

            if ( ! is_wp_error( $result ) ) {
                return $result;
            }

            // The service itself is unreachable — remember that and move on to
            // the next source rather than burning the timeout again.
            if ( 'bkbg_ai_http' === $result->get_error_code() ) {
                set_transient( $down_key, 1, 5 * MINUTE_IN_SECONDS );
                break;
            }
        }
    }

    return new WP_Error(
        'bkbg_ai_no_image',
        sprintf(
            /* translators: %s: semicolon separated search queries */
            __( 'No openly licensed image found. Tried: %s. Use two or three plain English nouns, or switch to image generation.', 'blockenberg' ),
            implode( '; ', array_unique( $tried ) )
        ),
        array( 'status' => 404 )
    );
}

/**
 * Search Wikimedia Commons — the fallback photo source.
 *
 * Everything hosted on Commons is under a licence that allows commercial use
 * and modification, so no licence screening is needed here.
 *
 * @param string $query Search terms.
 * @return array|WP_Error {url, credit}
 */
function bkbg_ai_commons_request( $query ) {
    $endpoint = add_query_arg( array(
        'action'      => 'query',
        'format'      => 'json',
        'generator'   => 'search',
        'gsrsearch'   => 'filetype:bitmap ' . $query,
        'gsrnamespace' => 6,
        'gsrlimit'    => 20,
        'prop'        => 'imageinfo',
        'iiprop'      => 'url|mime|extmetadata',
        'iiurlwidth'  => 1600,
    ), 'https://commons.wikimedia.org/w/api.php' );

    $response = wp_remote_get( $endpoint, array(
        'timeout' => 10,
        'headers' => array( 'User-Agent' => 'Blockenberg/' . home_url( '/' ) ),
    ) );

    if ( is_wp_error( $response ) ) {
        return new WP_Error( 'bkbg_ai_http', $response->get_error_message(), array( 'status' => 502 ) );
    }

    if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
        return new WP_Error( 'bkbg_ai_http', __( 'The image search service is temporarily unavailable.', 'blockenberg' ), array( 'status' => 502 ) );
    }

    $body  = json_decode( wp_remote_retrieve_body( $response ), true );
    $pages = isset( $body['query']['pages'] ) ? $body['query']['pages'] : array();

    if ( ! is_array( $pages ) || ! $pages ) {
        return new WP_Error( 'bkbg_ai_no_image', 'no results', array( 'status' => 404 ) );
    }

    $usable = array();
    foreach ( $pages as $page ) {
        $info = isset( $page['imageinfo'][0] ) ? $page['imageinfo'][0] : null;
        if ( ! $info ) {
            continue;
        }
        $mime = isset( $info['mime'] ) ? $info['mime'] : '';
        if ( 0 !== strpos( $mime, 'image/' ) ) {
            continue;
        }
        $url = ! empty( $info['thumburl'] ) ? $info['thumburl'] : ( ! empty( $info['url'] ) ? $info['url'] : '' );
        if ( '' === $url ) {
            continue;
        }

        $meta    = isset( $info['extmetadata'] ) ? $info['extmetadata'] : array();
        $artist  = isset( $meta['Artist']['value'] ) ? wp_strip_all_tags( $meta['Artist']['value'] ) : '';
        $license = isset( $meta['LicenseShortName']['value'] ) ? wp_strip_all_tags( $meta['LicenseShortName']['value'] ) : 'Wikimedia Commons';

        $usable[] = array(
            'url'    => $url,
            'credit' => trim( $artist ? $artist . ' (' . $license . ')' : $license ),
            'title'  => isset( $page['title'] ) ? $page['title'] : '',
            'creator' => $artist,
            'source_url' => isset( $info['descriptionurl'] ) ? $info['descriptionurl'] : '',
            'license' => $license,
            'license_url' => isset( $meta['LicenseUrl']['value'] ) ? $meta['LicenseUrl']['value'] : '',
        );
    }

    if ( ! $usable ) {
        return new WP_Error( 'bkbg_ai_no_image', 'no usable file in results', array( 'status' => 404 ) );
    }

    return bkbg_ai_rank_images( $usable, $query );
}

/** Rank by title relevance instead of selecting an arbitrary search hit. */
function bkbg_ai_rank_images( $candidates, $query ) {
    $lower = function ( $text ) { return function_exists( 'mb_strtolower' ) ? mb_strtolower( $text, 'UTF-8' ) : strtolower( $text ); };
    $words = array_unique( preg_split( '/[^\p{L}\p{N}]+/u', $lower( $query ), -1, PREG_SPLIT_NO_EMPTY ) );
    $words = array_values( array_diff( $words, array( 'a', 'an', 'the', 'of', 'in', 'on', 'for', 'and', 'with', 'photo', 'image', 'picture', 'file' ) ) );
    $ranked = array();
    foreach ( $candidates as $index => $candidate ) {
        $title = $lower( isset( $candidate['title'] ) ? $candidate['title'] : '' );
        $score = 0;
        foreach ( $words as $word ) {
            if ( false !== strpos( $title, $word ) ) { $score++; }
        }
        if ( $score ) { $ranked[] = array( 'score' => $score, 'index' => $index, 'image' => $candidate ); }
    }
    if ( ! $ranked ) {
        return new WP_Error( 'bkbg_ai_no_image', 'No image title matched the subject. Try two or three concrete subject keywords.', array( 'status' => 404 ) );
    }
    usort( $ranked, function ( $a, $b ) { return ( $b['score'] <=> $a['score'] ) ?: ( $a['index'] <=> $b['index'] ); } );
    $best = $ranked[0]['score'];
    $shortlist = array_values( array_filter( $ranked, function ( $row ) use ( $best ) { return $row['score'] === $best; } ) );
    // Vary only among equally relevant results; never sacrifice the subject.
    $offset = wp_rand( 0, count( $shortlist ) - 1 );
    $shortlist = array_merge( array_slice( $shortlist, $offset ), array_slice( $shortlist, 0, $offset ) );
    $images = array_column( array_slice( $shortlist, 0, 3 ), 'image' );
    $image = array_shift( $images );
    if ( $images ) { $image['alternatives'] = $images; }
    return $image;
}

/**
 * Progressively shorter versions of a search query.
 *
 * @param string $query Raw query.
 * @return array Query variants, longest first.
 */
function bkbg_ai_query_variants( $query ) {
    $clean = preg_replace( '/[^\p{L}\p{N}\s]+/u', ' ', (string) $query );
    $words = preg_split( '/\s+/u', trim( (string) $clean ), -1, PREG_SPLIT_NO_EMPTY );

    if ( ! $words ) {
        return array( trim( (string) $query ) );
    }

    $variants = array( implode( ' ', $words ) );

    if ( count( $words ) > 4 ) {
        $variants[] = implode( ' ', array_slice( $words, 0, 4 ) );
    }
    if ( count( $words ) > 2 ) {
        $variants[] = implode( ' ', array_slice( $words, 0, 2 ) );
    }

    return array_values( array_unique( array_filter( $variants ) ) );
}

/**
 * Licences that allow commercial use and modification — the only ones safe to
 * drop onto a client's page.
 *
 * @return array
 */
function bkbg_ai_allowed_licenses() {
    return array( 'cc0', 'pdm', 'by', 'by-sa' );
}

/**
 * One Openverse query.
 *
 * The API's own license_type filter returns nothing for multi-word queries, so
 * ask unfiltered and screen the licences here instead.
 *
 * @param string $query Search terms.
 * @return array|WP_Error {url, credit}
 */
function bkbg_ai_openverse_request( $query ) {
    $endpoint = add_query_arg( array(
        'q'         => $query,
        'page_size' => 20,
        'mature'    => 'false',
    ), 'https://api.openverse.org/v1/images/' );

    // Fail fast: a slow photo service must not hold up the whole agent run.
    $response = wp_remote_get( $endpoint, array(
        'timeout' => 10,
        'headers' => array( 'User-Agent' => 'Blockenberg/' . home_url( '/' ) ),
    ) );

    if ( is_wp_error( $response ) ) {
        return new WP_Error( 'bkbg_ai_http', $response->get_error_message(), array( 'status' => 502 ) );
    }

    if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
        return new WP_Error( 'bkbg_ai_http', __( 'The image search service is temporarily unavailable.', 'blockenberg' ), array( 'status' => 502 ) );
    }

    $body = json_decode( wp_remote_retrieve_body( $response ), true );
    if ( empty( $body['results'] ) || ! is_array( $body['results'] ) ) {
        return new WP_Error( 'bkbg_ai_no_image', 'no results', array( 'status' => 404 ) );
    }

    $allowed = bkbg_ai_allowed_licenses();
    $usable  = array();

    foreach ( $body['results'] as $result ) {
        $license = isset( $result['license'] ) ? strtolower( $result['license'] ) : '';
        if ( ! in_array( $license, $allowed, true ) ) {
            continue;
        }
        if ( empty( $result['url'] ) && empty( $result['thumbnail'] ) ) {
            continue;
        }
        $usable[] = $result;
    }

    if ( ! $usable ) {
        return new WP_Error( 'bkbg_ai_no_image', 'no commercially usable licence in results', array( 'status' => 404 ) );
    }

    $candidates = array();
    foreach ( $usable as $choice ) {
        $candidates[] = array(
            'url' => ! empty( $choice['url'] ) ? $choice['url'] : $choice['thumbnail'],
            'title' => isset( $choice['title'] ) ? $choice['title'] : '',
            'credit' => ! empty( $choice['creator'] ) ? sprintf( '%s (%s)', $choice['creator'], strtoupper( $choice['license'] ) ) : strtoupper( $choice['license'] ) . ' via Openverse',
            'creator' => isset( $choice['creator'] ) ? $choice['creator'] : '',
            'creator_url' => isset( $choice['creator_url'] ) ? $choice['creator_url'] : '',
            'source_url' => isset( $choice['foreign_landing_url'] ) ? $choice['foreign_landing_url'] : '',
            'license' => strtoupper( $choice['license'] ) . ( ! empty( $choice['license_version'] ) ? ' ' . $choice['license_version'] : '' ),
            'license_url' => isset( $choice['license_url'] ) ? $choice['license_url'] : '',
        );
    }
    return bkbg_ai_rank_images( $candidates, $query );
}

/** Keep source data reusable without trusting markup returned by image providers. */
function bkbg_ai_image_attribution( $image ) {
    $result = array();
    foreach ( array( 'title', 'creator', 'license' ) as $key ) {
        $result[ $key ] = isset( $image[ $key ] ) ? sanitize_text_field( $image[ $key ] ) : '';
    }
    foreach ( array( 'creator_url', 'source_url', 'license_url' ) as $key ) {
        $result[ $key ] = isset( $image[ $key ] ) ? esc_url_raw( $image[ $key ], array( 'http', 'https' ) ) : '';
    }
    return $result;
}

/** A ready-to-use caption for native image captions or an adjacent credit line. */
function bkbg_ai_image_caption( $image ) {
    $data = bkbg_ai_image_attribution( $image );
    if ( ! $data['license'] && ! $data['source_url'] ) { return ''; }
    $parts = array();
    foreach ( array( 'title' => 'source_url', 'creator' => 'creator_url', 'license' => 'license_url' ) as $label => $url ) {
        $text = $data[ $label ];
        if ( ! $text && 'title' === $label && $data[ $url ] ) { $text = __( 'Image source', 'blockenberg' ); }
        if ( ! $text ) { continue; }
        $parts[] = $data[ $url ]
            ? '<a href="' . esc_url( $data[ $url ] ) . '">' . esc_html( $text ) . '</a>'
            : esc_html( $text );
    }
    return implode( ' · ', $parts );
}

/**
 * Save a remote or data-URL image into the Media Library.
 *
 * @param array  $image   {url, credit}.
 * @param string $title   Attachment title.
 * @param string $alt     Alt text.
 * @param int    $post_id Parent post.
 * @return int|WP_Error Attachment id.
 */
function bkbg_ai_sideload( $image, $title, $alt, $post_id = 0 ) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $url = isset( $image['url'] ) && is_string( $image['url'] ) ? $image['url'] : '';
    if ( '' === $url ) {
        return new WP_Error( 'bkbg_ai_bad_image', __( 'Invalid image URL.', 'blockenberg' ), array( 'status' => 400 ) );
    }
    $max_bytes = min( 20 * MB_IN_BYTES, wp_max_upload_size() );
    $tmp       = '';

    if ( 0 === strpos( $url, 'data:' ) ) {
        // Bound the base64 input before decoding a second copy into memory.
        if ( strlen( $url ) > (int) ceil( $max_bytes / 3 ) * 4 + 100 ) {
            return new WP_Error( 'bkbg_ai_image_too_large', __( 'The image exceeds the upload size limit.', 'blockenberg' ), array( 'status' => 413 ) );
        }
        // data:image/png;base64,….
        if ( ! preg_match( '#^data:image/([a-z0-9.+-]+);base64,(.+)$#is', $url, $m ) ) {
            return new WP_Error( 'bkbg_ai_bad_image', __( 'The generated image could not be decoded.', 'blockenberg' ), array( 'status' => 502 ) );
        }
        $data = base64_decode( $m[2], true );
        if ( false === $data || '' === $data ) {
            return new WP_Error( 'bkbg_ai_bad_image', __( 'The generated image could not be decoded.', 'blockenberg' ), array( 'status' => 502 ) );
        }
        $tmp = wp_tempnam( 'bkbg-ai-image' );
        if ( ! $tmp || strlen( $data ) !== file_put_contents( $tmp, $data ) ) {
            if ( $tmp ) {
                @unlink( $tmp );
            }
            return new WP_Error( 'bkbg_ai_image_write', __( 'The image could not be saved to a temporary file.', 'blockenberg' ), array( 'status' => 500 ) );
        }
        unset( $data );
    } else {
        $url = esc_url_raw( $url, array( 'http', 'https' ) );
        if ( ! $url ) {
            return new WP_Error( 'bkbg_ai_bad_image', __( 'Invalid image URL.', 'blockenberg' ), array( 'status' => 400 ) );
        }
        if ( ! wp_http_validate_url( $url ) ) {
            return new WP_Error(
                'bkbg_ai_image_url_blocked',
                sprintf(
                    /* translators: %s: remote image hostname */
                    __( 'WordPress blocked the image download from %s because the address could not be validated as public. Check the server DNS/VPN configuration (including fake-IP mode), or use image generation instead.', 'blockenberg' ),
                    (string) wp_parse_url( $url, PHP_URL_HOST )
                ),
                array( 'status' => 502 )
            );
        }
        $tmp = wp_tempnam( 'bkbg-ai-image' );
        if ( ! $tmp ) {
            return new WP_Error( 'bkbg_ai_image_write', __( 'The image could not be saved to a temporary file.', 'blockenberg' ), array( 'status' => 500 ) );
        }
        // Safe HTTP validates redirects and rejects private-network URLs. A
        // bounded streamed download also prevents filling the server's disk.
        $response = wp_safe_remote_get( $url, array(
            'timeout'             => 30,
            'stream'              => true,
            'filename'            => $tmp,
            'limit_response_size' => $max_bytes + 1,
        ) );
        if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
            @unlink( $tmp );
            return is_wp_error( $response )
                ? $response
                : new WP_Error( 'bkbg_ai_bad_image', __( 'The image could not be downloaded.', 'blockenberg' ), array( 'status' => 502 ) );
        }
    }

    if ( filesize( $tmp ) > $max_bytes ) {
        @unlink( $tmp );
        return new WP_Error( 'bkbg_ai_image_too_large', __( 'The image exceeds the upload size limit.', 'blockenberg' ), array( 'status' => 413 ) );
    }

    // URLs may be extensionless or lie about the format. Only accept real
    // raster image bytes and name them accordingly, including generated data.
    $extensions = array( 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp', 'image/avif' => 'avif' );
    $mime       = wp_get_image_mime( $tmp );
    if ( ! $mime || ! isset( $extensions[ $mime ] ) ) {
        @unlink( $tmp );
        return new WP_Error( 'bkbg_ai_bad_image', __( 'The response did not contain a supported image.', 'blockenberg' ), array( 'status' => 502 ) );
    }
    $filename = substr( sanitize_title( $title ? $title : 'ai-image' ), 0, 160 ) . '.' . $extensions[ $mime ];

    $file_array = array(
        'name'     => $filename,
        'tmp_name' => $tmp,
    );

    $attachment_id = media_handle_sideload( $file_array, $post_id, $title, array( 'post_excerpt' => bkbg_ai_image_caption( $image ) ) );

    if ( is_wp_error( $attachment_id ) ) {
        @unlink( $tmp );
        return $attachment_id;
    }

    if ( $alt ) {
        update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt );
    }
    if ( ! empty( $image['credit'] ) ) {
        update_post_meta( $attachment_id, '_bkbg_ai_image_credit', sanitize_text_field( $image['credit'] ) );
    }
    update_post_meta( $attachment_id, '_bkbg_ai_image_attribution', bkbg_ai_image_attribution( $image ) );

    return (int) $attachment_id;
}

/* ──────────────────────────────────────────────
 * 5. Nesting rules — which blocks accept inner blocks
 * ────────────────────────────────────────────── */

/**
 * Scan block sources once and remember which blocks use InnerBlocks and what
 * they allow inside. Cached per plugin version.
 *
 * @return array name => array( 'allowed' => string[]|null )
 */
function bkbg_ai_inner_blocks_map() {
    $plugin_file = dirname( __DIR__, 2 ) . '/blockenberg.php';
    $cache_key   = 'bkbg_ai_inner_map_' . md5( (string) @filemtime( $plugin_file ) );
    $cached    = get_transient( $cache_key );
    if ( is_array( $cached ) ) {
        return $cached;
    }

    $map        = array();
    $blocks_dir = dirname( __DIR__, 2 ) . '/blocks';

    foreach ( glob( $blocks_dir . '/*/index.js' ) as $file ) {
        $source = file_get_contents( $file );
        if ( ! $source || false === strpos( $source, 'InnerBlocks' ) ) {
            continue;
        }
        $slug    = basename( dirname( $file ) );
        $allowed = array();
        // Matches both `var allowedBlocks = [...]` and `allowedBlocks: [...]`.
        if ( preg_match_all( '/allowedBlocks\s*[:=]\s*\[([^\]]*)\]/', $source, $matches ) ) {
            foreach ( $matches[1] as $list ) {
                preg_match_all( "/['\"]([a-z0-9-]+\/[a-z0-9-]+)['\"]/i", $list, $names );
                if ( ! empty( $names[1] ) ) {
                    $allowed = array_merge( $allowed, $names[1] );
                }
            }
        }
        $allowed = $allowed ? array_values( array_unique( $allowed ) ) : null;
        $map[ 'blockenberg/' . $slug ] = array( 'allowed' => $allowed );
    }

    set_transient( $cache_key, $map, WEEK_IN_SECONDS );
    return $map;
}

/* ──────────────────────────────────────────────
 * 6. Editor assets
 * ────────────────────────────────────────────── */

add_action( 'enqueue_block_editor_assets', function () {
    if ( ! bkbg_ai_user_can_use() ) {
        return;
    }

    $plugin_dir = dirname( __DIR__, 2 );
    $plugin_url = plugins_url( '', $plugin_dir . '/blockenberg.php' );

    $js  = $plugin_dir . '/assets/js/ai-assistant.js';
    $css = $plugin_dir . '/assets/css/ai-assistant.css';

    if ( ! file_exists( $js ) ) {
        return;
    }

    wp_enqueue_script(
        'bkbg-ai-assistant',
        $plugin_url . '/assets/js/ai-assistant.js',
        array(
            'wp-plugins',
            'wp-element',
            'wp-components',
            'wp-data',
            'wp-blocks',
            'wp-block-editor',
            'wp-editor',
            'wp-i18n',
            'wp-api-fetch',
            'wp-compose',
            'wp-notices',
            'wp-dom-ready',
            'wp-keyboard-shortcuts',
            'bkbg-ai-external',
        ),
        filemtime( $js ),
        true
    );

    wp_enqueue_script( 'bkbg-html-to-image', $plugin_url . '/assets/js/vendor/html-to-image-1.11.13.js', array(), '1.11.13', true );
    wp_enqueue_script( 'bkbg-ai-capture', $plugin_url . '/assets/js/ai-capture.js', array( 'bkbg-html-to-image' ), filemtime( $plugin_dir . '/assets/js/ai-capture.js' ), true );
    wp_enqueue_script( 'bkbg-ai-external', $plugin_url . '/assets/js/ai-external.js', array( 'wp-element', 'wp-components', 'wp-data', 'wp-i18n', 'bkbg-ai-capture' ), filemtime( $plugin_dir . '/assets/js/ai-external.js' ), true );

    if ( file_exists( $css ) ) {
        wp_enqueue_style(
            'bkbg-ai-assistant',
            $plugin_url . '/assets/css/ai-assistant.css',
            array( 'wp-components' ),
            filemtime( $css )
        );
    }

    $settings = bkbg_ai_get_settings();

    // wp_localize_script() casts everything to strings, which would turn
    // booleans and numbers into truthy strings — encode the config instead.
    $config = array(
        'restBase'    => esc_url_raw( rest_url( 'blockenberg/v1' ) ),
        'nonce'       => wp_create_nonce( 'wp_rest' ),
        'configured'  => '' !== bkbg_ai_get_api_key(),
        'canManage'   => current_user_can( 'manage_options' ),
        'canUpload'   => current_user_can( 'upload_files' ),
        'settingsUrl' => admin_url( 'admin.php?page=blockenberg-ai' ),
        'model'       => $settings['model'],
        'preferredModel' => bkbg_ai_get_preferred_model(),
        'userId'      => get_current_user_id(),
        'conversations' => bkbg_chat_read( get_current_user_id(), bkbg_ai_editor_post_id() ),
        'siteId'      => get_current_blog_id(),
        'imageSource' => $settings['image_source'],
        'maxSteps'    => (int) $settings['max_steps'],
        'stream'      => ! empty( $settings['stream'] ) && function_exists( 'curl_init' ),
        'temperature' => (float) $settings['temperature'],
        'siteContext' => $settings['site_context'],
        'siteName'    => get_bloginfo( 'name' ),
        'cssMetaKey'  => BKBG_AI_CSS_META,
        'innerBlocks' => bkbg_ai_inner_blocks_map(),
        'openSidebar' => ! empty( $settings['open_sidebar'] ),
    );

    wp_add_inline_script(
        'bkbg-ai-assistant',
        'window.bkbgAI = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';',
        'before'
    );
    wp_add_inline_script( 'bkbg-ai-external', 'window.bkbgAI = ' . wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . ';', 'before' );

    wp_set_script_translations( 'bkbg-ai-assistant', 'blockenberg' );
    wp_set_script_translations( 'bkbg-ai-external', 'blockenberg' );
} );

/**
 * Custom HTML has no save wrapper, so constrained layouts box it like a paragraph.
 * Mark the output full-width so AI sections (and other HTML blocks) span the page.
 */
add_filter( 'register_block_type_args', function ( $args, $block_type ) {
    if ( 'core/html' !== $block_type ) {
        return $args;
    }
    if ( ! isset( $args['supports'] ) || ! is_array( $args['supports'] ) ) {
        $args['supports'] = array();
    }
    $args['supports']['align'] = array( 'wide', 'full' );
    return $args;
}, 10, 2 );

add_filter( 'render_block_core/html', function ( $content ) {
    $trimmed = ltrim( (string) $content );
    if ( '' === $trimmed ) {
        return $content;
    }
    if ( preg_match( '/^<[a-zA-Z][^>]*\balignfull\b/', $trimmed ) ) {
        return $content;
    }
    return '<div class="wp-block-html alignfull">' . $content . '</div>';
} );

add_action( 'wp_enqueue_scripts', function () {
    $css = '.is-layout-constrained > .wp-block-html.alignfull,'
        . '.is-layout-constrained > section.alignfull,'
        . '.is-layout-constrained > header.alignfull,'
        . '.is-layout-constrained > footer.alignfull,'
        . '.is-layout-constrained > article.alignfull {'
        . 'max-width: none;'
        . '}'
        . '.wp-block-html.alignfull,'
        . '.is-layout-constrained > section.alignfull,'
        . '.is-layout-constrained > header.alignfull,'
        . '.is-layout-constrained > footer.alignfull,'
        . '.is-layout-constrained > article.alignfull {'
        . 'box-sizing: border-box;'
        . 'overflow-x: clip;'
        . '}'
        . '.wp-block-html.alignfull > :where(section, div, header, footer, article, main, aside),'
        . '.is-layout-constrained > section.alignfull,'
        . '.is-layout-constrained > header.alignfull,'
        . '.is-layout-constrained > footer.alignfull,'
        . '.is-layout-constrained > article.alignfull {'
        . 'box-sizing: border-box !important;'
        . 'width: 100% !important;'
        . 'max-width: 100% !important;'
        . 'margin-left: 0 !important;'
        . 'margin-right: 0 !important;'
        . 'left: auto !important;'
        . 'transform: none !important;'
        . '}'
        . '.wp-block-html.alignfull img,'
        . '.wp-block-html.alignfull video,'
        . '.wp-block-html.alignfull iframe,'
        . '.is-layout-constrained > section.alignfull img,'
        . '.is-layout-constrained > section.alignfull video,'
        . '.is-layout-constrained > section.alignfull iframe {'
        . 'max-width: 100%;'
        . 'height: auto;'
        . '}';
    wp_register_style( 'bkbg-html-sections', false, array(), '1' );
    wp_enqueue_style( 'bkbg-html-sections' );
    wp_add_inline_style( 'bkbg-html-sections', $css );
} );
