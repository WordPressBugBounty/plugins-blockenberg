<?php
/**
 * Blockenberg — Block Manager Dashboard
 *
 * WordPress.com-inspired admin page that lets users enable / disable
 * individual blocks. Disabled blocks are stored in the
 * 'blockenberg_disabled_blocks' option as a flat array of block names
 * (e.g. "blockenberg/accordion").
 *
 * @package Blockenberg
 */

defined( 'ABSPATH' ) || exit;

/* ──────────────────────────────────────────────
 * 1. Register admin menu
 * ────────────────────────────────────────────── */
add_action( 'admin_menu', function () {
    add_menu_page(
        __( 'Blockenberg', 'blockenberg' ),
        __( 'Blockenberg', 'blockenberg' ),
        'manage_options',
        'blockenberg',
        'bkbg_render_dashboard',
        'dashicons-screenoptions',
        59
    );
} );

/* ──────────────────────────────────────────────
 * 2. Enqueue dashboard assets (only on our page)
 * ────────────────────────────────────────────── */
add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( 'toplevel_page_blockenberg' !== $hook ) {
        return;
    }

    $plugin_dir = dirname( __DIR__, 2 );
    $plugin_url = plugins_url( '', $plugin_dir . '/blockenberg.php' );

    wp_enqueue_style(
        'bkbg-admin-dashboard',
        $plugin_url . '/assets/css/admin-dashboard.css',
        array(),
        filemtime( $plugin_dir . '/assets/css/admin-dashboard.css' )
    );

    wp_enqueue_script(
        'bkbg-admin-dashboard',
        $plugin_url . '/assets/js/admin-dashboard.js',
        array( 'jquery' ),
        filemtime( $plugin_dir . '/assets/js/admin-dashboard.js' ),
        true
    );

    wp_localize_script( 'bkbg-admin-dashboard', 'bkbgDashboard', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'bkbg_save_blocks' ),
        'i18n'    => array(
            'saved'      => __( 'Settings saved.', 'blockenberg' ),
            'saving'     => __( 'Saving…', 'blockenberg' ),
            'error'      => __( 'Save failed. Please try again.', 'blockenberg' ),
            'enableAll'  => __( 'Enable All', 'blockenberg' ),
            'disableAll' => __( 'Disable All', 'blockenberg' ),
        ),
    ) );
} );

/* ──────────────────────────────────────────────
 * 3. AJAX handler — save disabled blocks
 * ────────────────────────────────────────────── */
add_action( 'wp_ajax_bkbg_save_disabled_blocks', function () {
    check_ajax_referer( 'bkbg_save_blocks', 'nonce' );

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized', 403 );
    }

    $raw = isset( $_POST['disabled'] ) ? $_POST['disabled'] : array();

    if ( is_string( $raw ) ) {
        $raw = json_decode( stripslashes( $raw ), true );
    }

    if ( ! is_array( $raw ) ) {
        $raw = array();
    }

    $sanitized = array();
    foreach ( $raw as $block_name ) {
        $clean = sanitize_text_field( $block_name );
        if ( '' !== $clean && strpos( $clean, 'blockenberg/' ) === 0 ) {
            $sanitized[] = $clean;
        }
    }

    update_option( 'blockenberg_disabled_blocks', $sanitized, false );

    wp_send_json_success( array(
        'disabled' => $sanitized,
        'count'    => count( $sanitized ),
    ) );
} );

/* ──────────────────────────────────────────────
 * 4. Helper — collect blocks metadata
 * ────────────────────────────────────────────── */
function bkbg_get_all_blocks_meta() {
    $blocks_dir = dirname( __DIR__, 2 ) . '/blocks';
    $blocks     = array();

    foreach ( glob( $blocks_dir . '/*/block.json' ) as $json_path ) {
        $raw = file_get_contents( $json_path );
        if ( ! $raw ) {
            continue;
        }

        // WordPress block.json can have trailing commas — strip them.
        $raw  = preg_replace( '/,\s*([\]}])/', '$1', $raw );
        $data = json_decode( $raw, true );
        if ( ! is_array( $data ) || empty( $data['name'] ) ) {
            continue;
        }

        $blocks[] = array(
            'name'     => $data['name'],
            'title'    => isset( $data['title'] ) ? $data['title'] : basename( dirname( $json_path ) ),
            'category' => isset( $data['category'] ) ? $data['category'] : 'blockenberg',
            'icon'     => isset( $data['icon'] ) ? $data['icon'] : 'block-default',
            'keywords' => isset( $data['keywords'] ) ? $data['keywords'] : array(),
        );
    }

    // Sort by title.
    usort( $blocks, function ( $a, $b ) {
        return strcasecmp( $a['title'], $b['title'] );
    } );

    return $blocks;
}

/* ──────────────────────────────────────────────
 * 5. Category labels (mirrors block_categories_all).
 * ────────────────────────────────────────────── */
function bkbg_get_category_labels() {
    return array(
        'bkbg-layout'      => __( 'Layout & Structure', 'blockenberg' ),
        'bkbg-content'     => __( 'Content & Typography', 'blockenberg' ),
        'bkbg-media'       => __( 'Media & Images', 'blockenberg' ),
        'bkbg-marketing'   => __( 'Marketing & Conversion', 'blockenberg' ),
        'bkbg-business'    => __( 'Business & Services', 'blockenberg' ),
        'bkbg-blog'        => __( 'Blog & Editorial', 'blockenberg' ),
        'bkbg-interactive' => __( 'Interactive & Games', 'blockenberg' ),
        'bkbg-charts'      => __( 'Charts & Data', 'blockenberg' ),
        'bkbg-calculators' => __( 'Calculators & Tools', 'blockenberg' ),
        'bkbg-effects'     => __( 'Effects & Animation', 'blockenberg' ),
        'bkbg-dev'         => __( 'Developer Tools', 'blockenberg' ),
        'blockenberg'      => __( 'General', 'blockenberg' ),
    );
}

/* Category dashicons */
function bkbg_get_category_icons() {
    return array(
        'bkbg-layout'      => 'dashicons-layout',
        'bkbg-content'     => 'dashicons-editor-paragraph',
        'bkbg-media'       => 'dashicons-format-image',
        'bkbg-marketing'   => 'dashicons-megaphone',
        'bkbg-business'    => 'dashicons-building',
        'bkbg-blog'        => 'dashicons-welcome-write-blog',
        'bkbg-interactive' => 'dashicons-games',
        'bkbg-charts'      => 'dashicons-chart-bar',
        'bkbg-calculators' => 'dashicons-calculator',
        'bkbg-effects'     => 'dashicons-art',
        'bkbg-dev'         => 'dashicons-code-standards',
        'blockenberg'      => 'dashicons-screenoptions',
    );
}

/* ──────────────────────────────────────────────
 * 6. Render the dashboard page
 * ────────────────────────────────────────────── */
function bkbg_render_dashboard() {
    $blocks           = bkbg_get_all_blocks_meta();
    $disabled         = get_option( 'blockenberg_disabled_blocks', array() );
    $category_labels  = bkbg_get_category_labels();
    $category_icons   = bkbg_get_category_icons();

    if ( ! is_array( $disabled ) ) {
        $disabled = array();
    }

    // Group blocks by category.
    $by_category = array();
    foreach ( $blocks as $block ) {
        $cat = $block['category'];
        if ( ! isset( $by_category[ $cat ] ) ) {
            $by_category[ $cat ] = array();
        }
        $by_category[ $cat ][] = $block;
    }

    // Sort categories in the same order as $category_labels.
    $ordered = array();
    foreach ( array_keys( $category_labels ) as $cat_slug ) {
        if ( isset( $by_category[ $cat_slug ] ) ) {
            $ordered[ $cat_slug ] = $by_category[ $cat_slug ];
        }
    }
    // Append any unknown categories.
    foreach ( $by_category as $cat_slug => $cat_blocks ) {
        if ( ! isset( $ordered[ $cat_slug ] ) ) {
            $ordered[ $cat_slug ] = $cat_blocks;
        }
    }

    $total_blocks   = count( $blocks );
    $enabled_blocks = $total_blocks - count( $disabled );
    ?>
    <div id="bkbg-dashboard" class="bkbg-dashboard">

        <!-- ▸ Header -->
        <header class="bkbg-header">
            <div class="bkbg-header__left">
                <div class="bkbg-header__logo">
                    <span class="dashicons dashicons-screenoptions"></span>
                </div>
                <div class="bkbg-header__text">
                    <h1><?php esc_html_e( 'Blockenberg', 'blockenberg' ); ?></h1>
                    <p class="bkbg-header__subtitle">
                        <?php
                        printf(
                            /* translators: 1: enabled count 2: total count */
                            esc_html__( '%1$s of %2$s blocks enabled', 'blockenberg' ),
                            '<span id="bkbg-enabled-count">' . intval( $enabled_blocks ) . '</span>',
                            '<span id="bkbg-total-count">' . intval( $total_blocks ) . '</span>'
                        );
                        ?>
                    </p>
                </div>
            </div>
            <div class="bkbg-header__right">
                <div class="bkbg-search-wrap">
                    <input type="text" id="bkbg-search" class="bkbg-search"
                           placeholder="<?php esc_attr_e( 'Search blocks…', 'blockenberg' ); ?>"
                           autocomplete="off" />
                </div>
                <button type="button" id="bkbg-save" class="bkbg-btn bkbg-btn--primary">
                    <span class="dashicons dashicons-cloud-saved"></span>
                    <?php esc_html_e( 'Save Changes', 'blockenberg' ); ?>
                </button>
            </div>
        </header>

        <!-- ▸ Toolbar -->
        <div class="bkbg-toolbar">
            <div class="bkbg-toolbar__tabs" id="bkbg-category-tabs">
                <button type="button" class="bkbg-tab bkbg-tab--active" data-category="all">
                    <?php esc_html_e( 'All Blocks', 'blockenberg' ); ?>
                    <span class="bkbg-tab__count"><?php echo intval( $total_blocks ); ?></span>
                </button>
                <?php foreach ( $ordered as $cat_slug => $cat_blocks ) :
                    $label = isset( $category_labels[ $cat_slug ] ) ? $category_labels[ $cat_slug ] : $cat_slug;
                    $icon  = isset( $category_icons[ $cat_slug ] ) ? $category_icons[ $cat_slug ] : 'dashicons-block-default';
                    ?>
                    <button type="button" class="bkbg-tab" data-category="<?php echo esc_attr( $cat_slug ); ?>">
                        <span class="dashicons <?php echo esc_attr( $icon ); ?>"></span>
                        <?php echo esc_html( $label ); ?>
                        <span class="bkbg-tab__count"><?php echo count( $cat_blocks ); ?></span>
                    </button>
                <?php endforeach; ?>
            </div>
            <div class="bkbg-toolbar__actions">
                <button type="button" id="bkbg-enable-all" class="bkbg-btn bkbg-btn--ghost">
                    <?php esc_html_e( 'Enable All', 'blockenberg' ); ?>
                </button>
                <button type="button" id="bkbg-disable-all" class="bkbg-btn bkbg-btn--ghost bkbg-btn--danger">
                    <?php esc_html_e( 'Disable All', 'blockenberg' ); ?>
                </button>
            </div>
        </div>

        <!-- ▸ Toast notification -->
        <div id="bkbg-toast" class="bkbg-toast" aria-live="polite"></div>

        <!-- ▸ Block grid -->
        <div class="bkbg-grid" id="bkbg-grid">
            <?php foreach ( $ordered as $cat_slug => $cat_blocks ) :
                $label = isset( $category_labels[ $cat_slug ] ) ? $category_labels[ $cat_slug ] : $cat_slug;
                ?>
                <div class="bkbg-category-section" data-category="<?php echo esc_attr( $cat_slug ); ?>">
                    <div class="bkbg-category-header">
                        <h2 class="bkbg-category-title">
                            <?php
                            $icon = isset( $category_icons[ $cat_slug ] ) ? $category_icons[ $cat_slug ] : 'dashicons-block-default';
                            ?>
                            <span class="dashicons <?php echo esc_attr( $icon ); ?>"></span>
                            <?php echo esc_html( $label ); ?>
                            <span class="bkbg-category-count"><?php echo count( $cat_blocks ); ?></span>
                        </h2>
                        <div class="bkbg-category-actions">
                            <button type="button" class="bkbg-cat-toggle" data-action="enable" data-cat="<?php echo esc_attr( $cat_slug ); ?>">
                                <?php esc_html_e( 'Enable All', 'blockenberg' ); ?>
                            </button>
                            <span class="bkbg-cat-sep">|</span>
                            <button type="button" class="bkbg-cat-toggle" data-action="disable" data-cat="<?php echo esc_attr( $cat_slug ); ?>">
                                <?php esc_html_e( 'Disable All', 'blockenberg' ); ?>
                            </button>
                        </div>
                    </div>
                    <div class="bkbg-cards">
                        <?php foreach ( $cat_blocks as $block ) :
                            $is_disabled = in_array( $block['name'], $disabled, true );
                            $slug        = str_replace( 'blockenberg/', '', $block['name'] );
                            $dashicon    = $block['icon'];

                            // Ensure icon is a simple dashicon string (not an object).
                            if ( is_array( $dashicon ) ) {
                                $dashicon = isset( $dashicon['src'] ) ? $dashicon['src'] : 'block-default';
                            }

                            // Normalise icon class.
                            if ( strpos( $dashicon, 'dashicons-' ) !== 0 ) {
                                $dashicon = 'dashicons-' . $dashicon;
                            }
                            ?>
                            <div class="bkbg-card <?php echo $is_disabled ? 'bkbg-card--disabled' : ''; ?>"
                                 data-block="<?php echo esc_attr( $block['name'] ); ?>"
                                 data-title="<?php echo esc_attr( strtolower( $block['title'] ) ); ?>"
                                 data-slug="<?php echo esc_attr( $slug ); ?>"
                                 data-keywords="<?php echo esc_attr( strtolower( implode( ' ', $block['keywords'] ) ) ); ?>">
                                <div class="bkbg-card__icon">
                                    <span class="dashicons <?php echo esc_attr( $dashicon ); ?>"></span>
                                </div>
                                <div class="bkbg-card__info">
                                    <span class="bkbg-card__title"><?php echo esc_html( $block['title'] ); ?></span>
                                </div>
                                <label class="bkbg-toggle">
                                    <input type="checkbox"
                                           class="bkbg-toggle__input"
                                           data-block="<?php echo esc_attr( $block['name'] ); ?>"
                                           <?php checked( ! $is_disabled ); ?> />
                                    <span class="bkbg-toggle__slider"></span>
                                </label>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- ▸ Empty state for search -->
        <div id="bkbg-empty" class="bkbg-empty" style="display:none;">
            <span class="dashicons dashicons-search"></span>
            <p><?php esc_html_e( 'No blocks match your search.', 'blockenberg' ); ?></p>
        </div>

    </div>
    <?php
}
