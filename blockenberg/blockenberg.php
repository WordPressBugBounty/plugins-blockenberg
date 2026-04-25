<?php
/**
 * Plugin Name: Blockenberg
 * Description: Advanced Gutenberg Blocks for WordPress Block Editor
 * Version:     2.0.8
 * Author:      Blockenberg
 * Text Domain: blockenberg
 * Domain Path: /languages
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ensure enough PHP memory to register 600+ blocks with layout attributes.
 * The register_block_type_args filter adds ~400 extra attributes per block,
 * which requires significantly more memory than the WordPress default 128M.
 */
@ini_set( 'memory_limit', '512M' );

/**
 * Google Fonts list for the Typography Control.
 */
require_once __DIR__ . '/assets/php/google-fonts.php';

/**
 * Admin dashboard — Block Manager (enable / disable blocks).
 */
if ( is_admin() ) {
    require_once __DIR__ . '/assets/php/admin-dashboard.php';
}

/**
 * Enqueue common editor styles and scripts for all Blockenberg blocks
 */
add_action( 'enqueue_block_editor_assets', function() {
    wp_enqueue_style( 'dashicons' );
    // Ensure Media Library modal assets are available for blocks using MediaUpload.
    wp_enqueue_media();
    
    // Common editor scripts (branded icons)
    $editor_js = __DIR__ . '/assets/js/editor.js';
    if ( file_exists( $editor_js ) ) {
        wp_enqueue_script(
            'bkbg-editor-common',
            plugins_url( 'assets/js/editor.js', __FILE__ ),
            array( 'wp-blocks', 'wp-dom-ready', 'wp-element' ),
            filemtime( $editor_js ),
            true
        );
    }

    // Inspector tabs (General / Advanced) for all Blockenberg blocks
    $inspector_tabs_js = __DIR__ . '/assets/js/inspector-tabs.js';
    if ( file_exists( $inspector_tabs_js ) ) {
        wp_enqueue_script(
            'bkbg-inspector-tabs',
            plugins_url( 'assets/js/inspector-tabs.js', __FILE__ ),
            array( 'wp-blocks', 'wp-element', 'wp-compose', 'wp-hooks', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-data' ),
            filemtime( $inspector_tabs_js ),
            true
        );
    }

    // Typography Control — shared Elementor-like popover for all blocks
    // Registered on init (so block scripts can safely depend on it).
    wp_enqueue_script( 'bkbg-typography-control' );
});

/**
 * Register shared editor scripts early (so other scripts can list them as deps).
 */
add_action( 'init', function () {
    $typo_js = __DIR__ . '/assets/js/typography-control.js';
    if ( ! file_exists( $typo_js ) ) {
        return;
    }

    wp_register_script(
        'bkbg-typography-control',
        plugins_url( 'assets/js/typography-control.js', __FILE__ ),
        array( 'wp-element', 'wp-components', 'wp-i18n' ),
        filemtime( $typo_js ),
        true
    );

    // Pass Google Fonts list to JS as window.bkbgGoogleFonts
    wp_localize_script(
        'bkbg-typography-control',
        'bkbgGoogleFonts',
        function_exists( 'bkbg_google_fonts_list' ) ? bkbg_google_fonts_list() : array()
    );

    // Icon Picker — shared icon type selector + dashicon picker for all blocks
    $icon_picker_js = __DIR__ . '/assets/js/icon-picker.js';
    if ( file_exists( $icon_picker_js ) ) {
        // Editor handle (needs WP component deps for UI)
        wp_register_script(
            'bkbg-icon-picker',
            plugins_url( 'assets/js/icon-picker.js', __FILE__ ),
            array( 'wp-element', 'wp-components', 'wp-i18n' ),
            filemtime( $icon_picker_js ),
            true
        );
        // Frontend handle (same file, no WP deps — only data + DOM builder)
        wp_register_script(
            'bkbg-icon-picker-frontend',
            plugins_url( 'assets/js/icon-picker.js', __FILE__ ),
            array(),
            filemtime( $icon_picker_js ),
            true
        );
    }
} );

/**
 * Enqueue editor styles in a way compatible with the iframe-based editor canvas.
 */
add_action( 'enqueue_block_assets', function () {
    // Avoid loading editor-only CSS on the frontend.
    if ( ! is_admin() ) {
        return;
    }

    // Layout system CSS (shared variables and utilities)
    $layout_css = __DIR__ . '/assets/css/layout.css';
    if ( file_exists( $layout_css ) ) {
        wp_enqueue_style(
            'bkbg-layout-system',
            plugins_url( 'assets/css/layout.css', __FILE__ ),
            array(),
            filemtime( $layout_css )
        );
    }

    // Common editor styles for all blocks
    $editor_css = __DIR__ . '/assets/css/editor.css';
    if ( file_exists( $editor_css ) ) {
        wp_enqueue_style(
            'bkbg-editor-common',
            plugins_url( 'assets/css/editor.css', __FILE__ ),
            array( 'bkbg-layout-system' ),
            filemtime( $editor_css )
        );
    }
} );

/**
 * Register block scripts with dependencies (but don't enqueue them yet)
 */
add_action( 'init', function () {
    $blocks_dir = __DIR__ . '/blocks/';
    
    // Standard WordPress script dependencies for blocks
    $script_dependencies = array(
        'wp-blocks',
        'wp-element',
        'wp-i18n',
        'wp-block-editor',
        'wp-components',
        'wp-dom-ready',
        'wp-data',
        'bkbg-inspector-tabs',
        'bkbg-typography-control',
        'bkbg-icon-picker'
    );
    
    // Standard WordPress style dependencies for blocks
    $style_dependencies = array(
        'dashicons'
    );
    
    // Register layout system CSS for frontend
    $layout_css = __DIR__ . '/assets/css/layout.css';
    if ( file_exists( $layout_css ) ) {
        wp_register_style(
            'bkbg-layout-system',
            plugins_url( 'assets/css/layout.css', __FILE__ ),
            array(),
            filemtime( $layout_css )
        );
    }
    
    // Get disabled blocks list to skip asset registration.
    $disabled_blocks = get_option( 'blockenberg_disabled_blocks', array() );
    if ( ! is_array( $disabled_blocks ) ) {
        $disabled_blocks = array();
    }

    // Automatically register scripts for all blocks
    foreach ( glob( $blocks_dir . '*', GLOB_ONLYDIR ) as $block_dir ) {
        $block_name = basename( $block_dir );

        // Skip disabled blocks.
        if ( in_array( 'blockenberg/' . $block_name, $disabled_blocks, true ) ) {
            continue;
        }

        $script_file = $block_dir . '/index.js';
        
        $style_file = $block_dir . '/style.css';
        $frontend_file = $block_dir . '/frontend.js';
        
        // Check if block has a JavaScript file
        if ( file_exists( $script_file ) ) {
            wp_register_script(
                'bkbg-' . $block_name . '-editor',
                plugins_url( 'blocks/' . $block_name . '/index.js', __FILE__ ),
                $script_dependencies,
                filemtime( $script_file ),
                true
            );
        }
        
        // Check if block has a CSS file
        if ( file_exists( $style_file ) ) {
            // Layout blocks need the layout system CSS
            $block_style_deps = $style_dependencies;
            if ( in_array( $block_name, array( 'section', 'row', 'column' ), true ) ) {
                $block_style_deps[] = 'bkbg-layout-system';
            }
            
            wp_register_style(
                'bkbg-' . $block_name . '-style',
                plugins_url( 'blocks/' . $block_name . '/style.css', __FILE__ ),
                $block_style_deps,
                filemtime( $style_file )
            );
        }
        
        // Check if block has a frontend JavaScript file
        if ( file_exists( $frontend_file ) ) {
            wp_register_script(
                'bkbg-' . $block_name . '-frontend',
                plugins_url( 'blocks/' . $block_name . '/frontend.js', __FILE__ ),
                array( 'wp-dom-ready', 'bkbg-icon-picker-frontend' ),
                filemtime( $frontend_file ),
                true
            );
        }
    }
    
    // Automatically register all blocks in the /blocks directory
    // Skip blocks the admin has disabled via the Blockenberg dashboard.
    $disabled_blocks = get_option( 'blockenberg_disabled_blocks', array() );
    if ( ! is_array( $disabled_blocks ) ) {
        $disabled_blocks = array();
    }

    foreach ( glob( __DIR__ . '/blocks/*/block.json' ) as $metadata ) {
        // Read block name from block.json to check against disabled list.
        $raw_json   = file_get_contents( $metadata );
        $block_meta = $raw_json ? json_decode( $raw_json, true ) : null;
        $block_name = is_array( $block_meta ) && isset( $block_meta['name'] ) ? $block_meta['name'] : '';

        if ( '' !== $block_name && in_array( $block_name, $disabled_blocks, true ) ) {
            continue; // Block is disabled — skip registration.
        }

        register_block_type( dirname( $metadata ) );
    }
} );

// Register custom block category and ensure Blockenberg blocks appear in it.
add_filter( 'block_categories_all', function( $categories, $block_editor_context ) {
    // Prepend Blockenberg sub-categories in reverse order so they appear in the right order.
    $bkbg_categories = array(
        array( 'slug' => 'blockenberg',      'title' => __( 'General (Blockenberg)',    'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-layout',      'title' => __( 'Layout & Structure (Blockenberg)',    'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-content',     'title' => __( 'Content & Typography (Blockenberg)',  'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-media',       'title' => __( 'Media & Images (Blockenberg)',        'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-marketing',   'title' => __( 'Marketing & Conversion (Blockenberg)','blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-business',    'title' => __( 'Business & Services (Blockenberg)',   'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-blog',        'title' => __( 'Blog & Editorial (Blockenberg)',      'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-interactive', 'title' => __( 'Interactive & Games (Blockenberg)',   'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-charts',      'title' => __( 'Charts & Data (Blockenberg)',         'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-calculators', 'title' => __( 'Calculators & Tools (Blockenberg)',   'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-effects',     'title' => __( 'Effects & Animation (Blockenberg)',   'blockenberg' ), 'icon' => null ),
        array( 'slug' => 'bkbg-dev',         'title' => __( 'Developer Tools (Blockenberg)',       'blockenberg' ), 'icon' => null ),
    );
    foreach ( array_reverse( $bkbg_categories ) as $cat ) {
        array_unshift( $categories, $cat );
    }
    return $categories;
}, 10, 2 );

/**
 * Load Google Fonts on the frontend for Blockenberg blocks.
 * Scans block attributes for 'headerTypo', 'contentTypo', and any other
 * attribute ending in 'Typo' that contains a non-empty 'family' key.
 */
add_action( 'wp_enqueue_scripts', function () {
    if ( ! is_singular() ) {
        return;
    }
    $post = get_post();
    if ( ! $post || ! has_blocks( $post->post_content ) ) {
        return;
    }

    $system_fonts = array( 'Arial', 'Georgia', 'Helvetica', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana' );
    $queued       = array();

    $blocks = parse_blocks( $post->post_content );

    // Recursive walker for nested blocks
    $collect = null;
    $collect = function ( $blocks ) use ( &$collect, $system_fonts, &$queued ) {
        foreach ( $blocks as $block ) {
            if ( strpos( (string) $block['blockName'], 'blockenberg/' ) !== 0 ) {
                if ( ! empty( $block['innerBlocks'] ) ) {
                    $collect( $block['innerBlocks'] );
                }
                continue;
            }
            $attrs = $block['attrs'] ?? array();
            foreach ( $attrs as $key => $val ) {
                // Any typography attribute (legacy *Typo suffix OR new typo* prefix)
                // that is an array with a non-empty 'family' key.
                $is_typo_key = ( substr( $key, -4 ) === 'Typo' ) || ( strpos( $key, 'typo' ) === 0 );
                if ( $is_typo_key && is_array( $val ) && ! empty( $val['family'] ) ) {
                    $family = sanitize_text_field( $val['family'] );
                    if ( ! in_array( $family, $system_fonts, true ) && ! isset( $queued[ $family ] ) ) {
                        $queued[ $family ] = true;
                        $handle = 'bkbg-gf-' . sanitize_title( $family );
                        $url    = 'https://fonts.googleapis.com/css2?family=' .
                                  urlencode( $family ) .
                                  ':wght@300;400;500;600;700;800;900&display=swap';
                        wp_enqueue_style( $handle, $url, array(), null );
                    }
                }
            }
            if ( ! empty( $block['innerBlocks'] ) ) {
                $collect( $block['innerBlocks'] );
            }
        }
    };
    $collect( $blocks );
} );

/**
 * Register advanced layout attributes on the SERVER side for every Blockenberg block.
 * Without this, WordPress strips unknown attributes during server-side parsing
 * (array_intersect_key in WP_Block_Type::prepare_attributes_for_render).
 */
add_filter( 'register_block_type_args', function ( $args, $block_type ) {
    if ( strpos( $block_type, 'blockenberg/' ) !== 0 ) {
        return $args;
    }

    // Blockenberg has its own Advanced spacing controls.
    // Disable core Gutenberg "Dimensions" (spacing) UI to avoid duplicates.
    if ( isset( $args['supports'] ) && is_array( $args['supports'] ) ) {
        unset( $args['supports']['spacing'] );
        unset( $args['supports']['__experimentalSpacing'] );
        unset( $args['supports']['dimensions'] );
        unset( $args['supports']['__experimentalDimensions'] );
    }

    $sides   = array( 'Top', 'Right', 'Bottom', 'Left' );
    $devices = array( '', 'Tablet', 'Mobile' );
    $extra   = array();

    foreach ( array( 'bkbgMargin', 'bkbgPadding' ) as $prefix ) {
        foreach ( $sides as $side ) {
            foreach ( $devices as $device ) {
                $key = $prefix . $side . $device;
                $extra[ $key ]           = array( 'type' => 'string', 'default' => '' );
                $extra[ $key . 'Unit' ]  = array( 'type' => 'string', 'default' => 'px' );
            }
        }
        foreach ( $devices as $device ) {
            $extra[ $prefix . 'Linked' . $device ] = array( 'type' => 'boolean', 'default' => true );
        }
    }

    foreach ( $devices as $device ) {
        $extra[ 'bkbgZIndex' . $device ] = array( 'type' => 'string', 'default' => '' );
    }

    $extra['bkbgCssId']      = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgCssClasses'] = array( 'type' => 'string', 'default' => '' );

    // ── Background attributes ──
    $extra['bkbgBgType']      = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgHoverType'] = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgColor']     = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgHoverColor']= array( 'type' => 'string', 'default' => '' );

    // Classic image (responsive) — normal & hover
    foreach ( array( 'bkbgBgImage', 'bkbgBgHoverImage' ) as $img_prefix ) {
        foreach ( $devices as $device ) {
            $extra[ $img_prefix . $device ]         = array( 'type' => 'string', 'default' => '' );
            $extra[ $img_prefix . 'Id' . $device ]  = array( 'type' => 'number', 'default' => 0 );
        }
    }

    // Classic image settings — normal & hover (position/repeat/size responsive, attachment global)
    foreach ( array( 'bkbgBg', 'bkbgBgHover' ) as $s_prefix ) {
        foreach ( $devices as $device ) {
            $extra[ $s_prefix . 'Position'       . $device ] = array( 'type' => 'string', 'default' => '' );
            $extra[ $s_prefix . 'PositionCustomX' . $device ] = array( 'type' => 'string', 'default' => '' );
            $extra[ $s_prefix . 'PositionCustomY' . $device ] = array( 'type' => 'string', 'default' => '' );
            $extra[ $s_prefix . 'Repeat'         . $device ] = array( 'type' => 'string', 'default' => '' );
            $extra[ $s_prefix . 'Size'           . $device ] = array( 'type' => 'string', 'default' => '' );
            $extra[ $s_prefix . 'SizeCustomW'    . $device ] = array( 'type' => 'string', 'default' => '' );
            $extra[ $s_prefix . 'SizeCustomH'    . $device ] = array( 'type' => 'string', 'default' => '' );
        }
        $extra[ $s_prefix . 'Attachment' ] = array( 'type' => 'string', 'default' => '' );
    }

    // Gradient — normal
    $extra['bkbgBgGradColor1'] = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgGradColor2'] = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgGradType']   = array( 'type' => 'string', 'default' => 'linear' );
    foreach ( $devices as $device ) {
        $extra[ 'bkbgBgGradLoc1'     . $device ] = array( 'type' => 'string', 'default' => '' );
        $extra[ 'bkbgBgGradLoc2'     . $device ] = array( 'type' => 'string', 'default' => '' );
        $extra[ 'bkbgBgGradAngle'    . $device ] = array( 'type' => 'string', 'default' => '' );
        $extra[ 'bkbgBgGradPosition' . $device ] = array( 'type' => 'string', 'default' => '' );
    }

    // Gradient — hover
    $extra['bkbgBgHoverGradColor1'] = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgHoverGradColor2'] = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBgHoverGradType']   = array( 'type' => 'string', 'default' => 'linear' );
    foreach ( $devices as $device ) {
        $extra[ 'bkbgBgHoverGradLoc1'     . $device ] = array( 'type' => 'string', 'default' => '' );
        $extra[ 'bkbgBgHoverGradLoc2'     . $device ] = array( 'type' => 'string', 'default' => '' );
        $extra[ 'bkbgBgHoverGradAngle'    . $device ] = array( 'type' => 'string', 'default' => '' );
        $extra[ 'bkbgBgHoverGradPosition' . $device ] = array( 'type' => 'string', 'default' => '' );
    }



    // ── Border attributes ──

    // Border Type (normal & hover)
    $extra['bkbgBorderType']      = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBorderHoverType'] = array( 'type' => 'string', 'default' => '' );

    // Border Width — per side, per device, with unit (normal & hover)
    foreach ( array( 'bkbgBorderWidth', 'bkbgBorderHoverWidth' ) as $prefix ) {
        foreach ( $sides as $side ) {
            foreach ( $devices as $device ) {
                $key = $prefix . $side . $device;
                $extra[ $key ]           = array( 'type' => 'string', 'default' => '' );
                $extra[ $key . 'Unit' ]  = array( 'type' => 'string', 'default' => 'px' );
            }
        }
        foreach ( $devices as $device ) {
            $extra[ $prefix . 'Linked' . $device ] = array( 'type' => 'boolean', 'default' => true );
        }
    }

    // Border Color (normal & hover)
    $extra['bkbgBorderColor']      = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgBorderHoverColor'] = array( 'type' => 'string', 'default' => '' );

    // Border Radius — per corner, per device, with unit (normal & hover)
    foreach ( array( 'bkbgBorderRadius', 'bkbgBorderHoverRadius' ) as $prefix ) {
        foreach ( $sides as $side ) {
            foreach ( $devices as $device ) {
                $key = $prefix . $side . $device;
                $extra[ $key ]           = array( 'type' => 'string', 'default' => '' );
                $extra[ $key . 'Unit' ]  = array( 'type' => 'string', 'default' => 'px' );
            }
        }
        foreach ( $devices as $device ) {
            $extra[ $prefix . 'Linked' . $device ] = array( 'type' => 'boolean', 'default' => true );
        }
    }

    // Box Shadow (normal)
    $extra['bkbgShadowColor']    = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowH']        = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowV']        = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowBlur']     = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowSpread']   = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowPosition'] = array( 'type' => 'string', 'default' => '' );

    // Box Shadow (hover)
    $extra['bkbgShadowHoverColor']    = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowHoverH']        = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowHoverV']        = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowHoverBlur']     = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowHoverSpread']   = array( 'type' => 'string', 'default' => '' );
    $extra['bkbgShadowHoverPosition'] = array( 'type' => 'string', 'default' => '' );


    // Responsive visibility
    $extra['bkbgHideDesktop'] = array( 'type' => 'boolean', 'default' => false );
    $extra['bkbgHideTablet']  = array( 'type' => 'boolean', 'default' => false );
    $extra['bkbgHideMobile']  = array( 'type' => 'boolean', 'default' => false );

    if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
        $args['attributes'] = array();
    }
    $args['attributes'] = array_merge( $args['attributes'], $extra );

    return $args;
}, 10, 2 );

/**
 * Render ALL advanced layout CSS (desktop + tablet + mobile) for Blockenberg blocks.
 * Desktop styles are output as inline styles on the wrapper.
 * Responsive styles use <style> tags with media queries.
 * CSS ID / CSS Classes are also injected here for reliability.
 */
add_filter( 'render_block', function ( $block_content, $block ) {
    if ( empty( $block['blockName'] ) || strpos( $block['blockName'], 'blockenberg/' ) !== 0 ) {
        return $block_content;
    }

    $attrs = $block['attrs'] ?? array();
    if ( empty( $attrs ) ) {
        return $block_content;
    }

    $sides   = array( 'Top', 'Right', 'Bottom', 'Left' );
    $devices = array( 'desktop', 'tablet', 'mobile' );

    // Collect CSS rules per device
    $css = array( 'desktop' => array(), 'tablet' => array(), 'mobile' => array() );

    foreach ( array( 'bkbgMargin' => 'margin', 'bkbgPadding' => 'padding' ) as $prefix => $prop ) {
        foreach ( $sides as $side ) {
            foreach ( $devices as $dev ) {
                $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
                $val  = isset( $attrs[ $prefix . $side . $suffix ] ) ? $attrs[ $prefix . $side . $suffix ] : '';
                $unit = isset( $attrs[ $prefix . $side . $suffix . 'Unit' ] ) ? $attrs[ $prefix . $side . $suffix . 'Unit' ] : 'px';
                if ( '' !== $val && '' !== trim( (string) $val ) ) {
                    $css[ $dev ][] = $prop . '-' . strtolower( $side ) . ':' . $val . $unit . ' !important';
                }
            }
        }
    }

    // Z-Index per device
    foreach ( $devices as $dev ) {
        $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
        $zi = isset( $attrs[ 'bkbgZIndex' . $suffix ] ) ? $attrs[ 'bkbgZIndex' . $suffix ] : '';
        if ( '' !== $zi && '' !== trim( (string) $zi ) ) {
            $css[ $dev ][] = 'z-index:' . intval( $zi );
            $css[ $dev ][] = 'position:relative';
        }
    }

    // ── Background CSS ──
    $hover_css = array( 'desktop' => array(), 'tablet' => array(), 'mobile' => array() );

    $bg_type    = ! empty( $attrs['bkbgBgType'] ) ? $attrs['bkbgBgType'] : '';
    $hover_type = ! empty( $attrs['bkbgBgHoverType'] ) ? $attrs['bkbgBgHoverType'] : '';

    // Helper: build gradient value
    $build_gradient = function ( $attrs, $prefix, $suffix ) {
        $c1 = ! empty( $attrs[ $prefix . 'GradColor1' ] ) ? $attrs[ $prefix . 'GradColor1' ] : '';
        $c2 = ! empty( $attrs[ $prefix . 'GradColor2' ] ) ? $attrs[ $prefix . 'GradColor2' ] : '';
        if ( '' === $c1 && '' === $c2 ) return '';
        if ( '' === $c1 ) $c1 = 'transparent';
        if ( '' === $c2 ) $c2 = 'transparent';

        // Location 1 — with fallback to desktop
        $loc1 = '';
        if ( '' !== $suffix && ! empty( $attrs[ $prefix . 'GradLoc1' . $suffix ] ) ) {
            $loc1 = $attrs[ $prefix . 'GradLoc1' . $suffix ];
        } elseif ( ! empty( $attrs[ $prefix . 'GradLoc1' ] ) ) {
            $loc1 = $attrs[ $prefix . 'GradLoc1' ];
        }

        // Location 2
        $loc2 = '';
        if ( '' !== $suffix && ! empty( $attrs[ $prefix . 'GradLoc2' . $suffix ] ) ) {
            $loc2 = $attrs[ $prefix . 'GradLoc2' . $suffix ];
        } elseif ( ! empty( $attrs[ $prefix . 'GradLoc2' ] ) ) {
            $loc2 = $attrs[ $prefix . 'GradLoc2' ];
        }

        // Angle
        $angle = '';
        if ( '' !== $suffix && isset( $attrs[ $prefix . 'GradAngle' . $suffix ] ) && '' !== $attrs[ $prefix . 'GradAngle' . $suffix ] ) {
            $angle = $attrs[ $prefix . 'GradAngle' . $suffix ];
        } elseif ( isset( $attrs[ $prefix . 'GradAngle' ] ) && '' !== $attrs[ $prefix . 'GradAngle' ] ) {
            $angle = $attrs[ $prefix . 'GradAngle' ];
        }

        $type = ! empty( $attrs[ $prefix . 'GradType' ] ) ? $attrs[ $prefix . 'GradType' ] : 'linear';

        $stop1 = esc_attr( $c1 ) . ( '' !== $loc1 ? ' ' . intval( $loc1 ) . '%' : '' );
        $stop2 = esc_attr( $c2 ) . ( '' !== $loc2 ? ' ' . intval( $loc2 ) . '%' : '' );

        if ( 'radial' === $type ) {
            // Radial position
            $pos = '';
            if ( '' !== $suffix && ! empty( $attrs[ $prefix . 'GradPosition' . $suffix ] ) ) {
                $pos = $attrs[ $prefix . 'GradPosition' . $suffix ];
            } elseif ( ! empty( $attrs[ $prefix . 'GradPosition' ] ) ) {
                $pos = $attrs[ $prefix . 'GradPosition' ];
            }
            $at_part = '' !== $pos ? ' at ' . esc_attr( $pos ) : '';
            return 'radial-gradient(circle' . $at_part . ',' . $stop1 . ',' . $stop2 . ')';
        }

        $angle_part = '' !== $angle ? intval( $angle ) . 'deg,' : '';
        return 'linear-gradient(' . $angle_part . $stop1 . ',' . $stop2 . ')';
    };

    // Helper: resolve responsive classic image settings (with desktop fallback)
    $get_img_setting = function ( $attrs, $prefix, $prop, $suffix ) {
        $val = ! empty( $attrs[ $prefix . $prop . $suffix ] ) ? $attrs[ $prefix . $prop . $suffix ] : '';
        if ( '' === $val && '' !== $suffix ) {
            $val = ! empty( $attrs[ $prefix . $prop ] ) ? $attrs[ $prefix . $prop ] : '';
        }
        return $val;
    };

    $render_classic_image_css = function ( $attrs, $prefix, &$target_css, $devices ) use ( $get_img_setting ) {
        // Background color
        if ( ! empty( $attrs[ $prefix . 'Color' ] ) ) {
            $target_css['desktop'][] = 'background-color:' . esc_attr( $attrs[ $prefix . 'Color' ] ) . ' !important';
        }
        // Attachment (global, not responsive)
        $attach = ! empty( $attrs[ $prefix . 'Attachment' ] ) ? esc_attr( $attrs[ $prefix . 'Attachment' ] ) : '';
        if ( '' !== $attach ) {
            $target_css['desktop'][] = 'background-attachment:' . $attach . ' !important';
        }

        foreach ( $devices as $dev ) {
            $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
            $img = ! empty( $attrs[ $prefix . 'Image' . $suffix ] ) ? $attrs[ $prefix . 'Image' . $suffix ] : '';
            if ( '' === $img && '' !== $suffix ) {
                $img = ! empty( $attrs[ $prefix . 'Image' ] ) ? $attrs[ $prefix . 'Image' ] : '';
            }
            if ( '' !== $img ) {
                $target_css[ $dev ][] = 'background-image:url(' . esc_url( $img ) . ') !important';

                // Position
                $pos = $get_img_setting( $attrs, $prefix, 'Position', $suffix );
                if ( 'custom' === $pos ) {
                    $cx = $get_img_setting( $attrs, $prefix, 'PositionCustomX', $suffix );
                    $cy = $get_img_setting( $attrs, $prefix, 'PositionCustomY', $suffix );
                    $cx = '' !== $cx ? intval( $cx ) . '%' : '50%';
                    $cy = '' !== $cy ? intval( $cy ) . '%' : '50%';
                    $target_css[ $dev ][] = 'background-position:' . $cx . ' ' . $cy . ' !important';
                } elseif ( '' !== $pos ) {
                    $target_css[ $dev ][] = 'background-position:' . esc_attr( $pos ) . ' !important';
                } else {
                    $target_css[ $dev ][] = 'background-position:center !important';
                }

                // Repeat
                $repeat = $get_img_setting( $attrs, $prefix, 'Repeat', $suffix );
                if ( '' !== $repeat ) {
                    $target_css[ $dev ][] = 'background-repeat:' . esc_attr( $repeat ) . ' !important';
                }

                // Size
                $size = $get_img_setting( $attrs, $prefix, 'Size', $suffix );
                if ( 'custom' === $size ) {
                    $sw = $get_img_setting( $attrs, $prefix, 'SizeCustomW', $suffix );
                    $sh = $get_img_setting( $attrs, $prefix, 'SizeCustomH', $suffix );
                    $sw = '' !== $sw ? intval( $sw ) . 'px' : 'auto';
                    $sh = '' !== $sh ? intval( $sh ) . 'px' : 'auto';
                    $target_css[ $dev ][] = 'background-size:' . $sw . ' ' . $sh . ' !important';
                } elseif ( '' !== $size ) {
                    $target_css[ $dev ][] = 'background-size:' . esc_attr( $size ) . ' !important';
                } else {
                    $target_css[ $dev ][] = 'background-size:cover !important';
                }
            }
        }
    };

    // Normal — Classic
    if ( 'classic' === $bg_type ) {
        $render_classic_image_css( $attrs, 'bkbgBg', $css, $devices );
    }

    // Normal — Gradient
    if ( 'gradient' === $bg_type ) {
        foreach ( $devices as $dev ) {
            $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
            $grad = $build_gradient( $attrs, 'bkbgBg', $suffix );
            if ( '' !== $grad ) {
                $css[ $dev ][] = 'background-image:' . $grad . ' !important';
            }
        }
    }

    // Hover — Classic
    if ( 'classic' === $hover_type ) {
        $render_classic_image_css( $attrs, 'bkbgBgHover', $hover_css, $devices );
    }

    // Hover — Gradient
    if ( 'gradient' === $hover_type ) {
        foreach ( $devices as $dev ) {
            $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
            $grad = $build_gradient( $attrs, 'bkbgBgHover', $suffix );
            if ( '' !== $grad ) {
                $hover_css[ $dev ][] = 'background-image:' . $grad . ' !important';
            }
        }
    }

    // ── Border CSS ──

    // Helper: build box-shadow value
    $build_shadow = function ( $attrs, $prefix ) {
        $h      = isset( $attrs[ $prefix . 'H' ] ) && '' !== $attrs[ $prefix . 'H' ] ? intval( $attrs[ $prefix . 'H' ] ) : '';
        $v      = isset( $attrs[ $prefix . 'V' ] ) && '' !== $attrs[ $prefix . 'V' ] ? intval( $attrs[ $prefix . 'V' ] ) : '';
        $blur   = isset( $attrs[ $prefix . 'Blur' ] ) && '' !== $attrs[ $prefix . 'Blur' ] ? intval( $attrs[ $prefix . 'Blur' ] ) : '';
        $spread = isset( $attrs[ $prefix . 'Spread' ] ) && '' !== $attrs[ $prefix . 'Spread' ] ? intval( $attrs[ $prefix . 'Spread' ] ) : '';
        $color  = ! empty( $attrs[ $prefix . 'Color' ] ) ? $attrs[ $prefix . 'Color' ] : '';
        $pos    = ! empty( $attrs[ $prefix . 'Position' ] ) ? $attrs[ $prefix . 'Position' ] : '';

        if ( '' === $h && '' === $v && '' === $blur && '' === $spread && '' === $color ) return '';

        $h      = '' !== $h ? $h . 'px' : '0px';
        $v      = '' !== $v ? $v . 'px' : '0px';
        $blur   = '' !== $blur ? $blur . 'px' : '0px';
        $spread = '' !== $spread ? $spread . 'px' : '0px';
        $color  = '' !== $color ? esc_attr( $color ) : 'rgba(0,0,0,0.5)';

        $val = $h . ' ' . $v . ' ' . $blur . ' ' . $spread . ' ' . $color;
        if ( 'inset' === $pos ) {
            $val = 'inset ' . $val;
        }
        return $val;
    };

    // Helper: render border CSS for a prefix (normal or hover)
    $render_border_css = function ( $attrs, $prefix_type, $prefix_width, $prefix_radius, $shadow_prefix, &$target_css, $devices ) use ( $build_shadow ) {
        $border_type = ! empty( $attrs[ $prefix_type ] ) ? $attrs[ $prefix_type ] : '';

        // Border type + width + color
        if ( '' !== $border_type && 'none' !== $border_type ) {
            $target_css['desktop'][] = 'border-style:' . esc_attr( $border_type ) . ' !important';

            // Border color
            $color_key = str_replace( 'Type', 'Color', $prefix_type );
            if ( ! empty( $attrs[ $color_key ] ) ) {
                $target_css['desktop'][] = 'border-color:' . esc_attr( $attrs[ $color_key ] ) . ' !important';
            }

            // Border width (responsive, per side)
            foreach ( $devices as $dev ) {
                $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
                foreach ( array( 'Top', 'Right', 'Bottom', 'Left' ) as $side ) {
                    $val  = isset( $attrs[ $prefix_width . $side . $suffix ] ) ? $attrs[ $prefix_width . $side . $suffix ] : '';
                    $unit = isset( $attrs[ $prefix_width . $side . $suffix . 'Unit' ] ) ? $attrs[ $prefix_width . $side . $suffix . 'Unit' ] : 'px';
                    if ( '' !== $val && '' !== trim( (string) $val ) ) {
                        $target_css[ $dev ][] = 'border-' . strtolower( $side ) . '-width:' . $val . $unit . ' !important';
                    }
                }
            }
        } elseif ( 'none' === $border_type ) {
            $target_css['desktop'][] = 'border:none !important';
        }

        // Border radius (responsive, per corner)
        foreach ( $devices as $dev ) {
            $suffix = 'desktop' === $dev ? '' : ( 'tablet' === $dev ? 'Tablet' : 'Mobile' );
            $radius_parts = array();
            foreach ( array( 'Top', 'Right', 'Bottom', 'Left' ) as $side ) {
                $val  = isset( $attrs[ $prefix_radius . $side . $suffix ] ) ? $attrs[ $prefix_radius . $side . $suffix ] : '';
                $unit = isset( $attrs[ $prefix_radius . $side . $suffix . 'Unit' ] ) ? $attrs[ $prefix_radius . $side . $suffix . 'Unit' ] : 'px';
                if ( '' !== $val && '' !== trim( (string) $val ) ) {
                    $radius_parts[ $side ] = $val . $unit;
                }
            }
            if ( ! empty( $radius_parts ) ) {
                // Map Top/Right/Bottom/Left to border-radius corners: TL TR BR BL
                $tl = isset( $radius_parts['Top'] ) ? $radius_parts['Top'] : '0px';
                $tr = isset( $radius_parts['Right'] ) ? $radius_parts['Right'] : '0px';
                $br = isset( $radius_parts['Bottom'] ) ? $radius_parts['Bottom'] : '0px';
                $bl = isset( $radius_parts['Left'] ) ? $radius_parts['Left'] : '0px';
                $target_css[ $dev ][] = 'border-radius:' . $tl . ' ' . $tr . ' ' . $br . ' ' . $bl . ' !important';
            }
        }

        // Box shadow
        $shadow_val = $build_shadow( $attrs, $shadow_prefix );
        if ( '' !== $shadow_val ) {
            $target_css['desktop'][] = 'box-shadow:' . $shadow_val . ' !important';
        }
    };

    // Normal border
    $render_border_css( $attrs, 'bkbgBorderType', 'bkbgBorderWidth', 'bkbgBorderRadius', 'bkbgShadow', $css, $devices );

    // Hover border
    $render_border_css( $attrs, 'bkbgBorderHoverType', 'bkbgBorderHoverWidth', 'bkbgBorderHoverRadius', 'bkbgShadowHover', $hover_css, $devices );

    // ── Responsive visibility ──
    $hide_desktop = ! empty( $attrs['bkbgHideDesktop'] );
    $hide_tablet  = ! empty( $attrs['bkbgHideTablet'] );
    $hide_mobile  = ! empty( $attrs['bkbgHideMobile'] );

    // Check if hover styles exist
    $has_hover = ! empty( $hover_css['desktop'] ) || ! empty( $hover_css['tablet'] ) || ! empty( $hover_css['mobile'] );

    // Any styles to output?
    $has_responsive = $hide_desktop || $hide_tablet || $hide_mobile;
    $has_styles = ! empty( $css['desktop'] ) || ! empty( $css['tablet'] ) || ! empty( $css['mobile'] ) || $has_hover || $has_responsive;
    $has_id     = ! empty( $attrs['bkbgCssId'] );
    $has_cls    = ! empty( $attrs['bkbgCssClasses'] );

    if ( ! $has_styles && ! $has_id && ! $has_cls ) {
        return $block_content;
    }

    // Generate a unique class for targeting this specific block instance
    $unique = 'bkbg-adv-' . substr( md5( serialize( $attrs ) . wp_rand() ), 0, 8 );

    // Inject unique class into the first HTML tag
    $block_content = preg_replace(
        '/(^\s*<[a-zA-Z][^>]*\bclass\s*=\s*")/',
        '$1' . esc_attr( $unique ) . ' ',
        $block_content,
        1,
        $count
    );
    if ( ! $count ) {
        // No class attribute found — add one
        $block_content = preg_replace(
            '/(^\s*<[a-zA-Z][^\s>]*)/',
            '$1 class="' . esc_attr( $unique ) . '"',
            $block_content,
            1
        );
    }

    // Inject CSS ID
    if ( $has_id ) {
        $safe_id = esc_attr( $attrs['bkbgCssId'] );
        $block_content = preg_replace(
            '/(^\s*<[a-zA-Z][^>]*)/',
            '$1 id="' . $safe_id . '"',
            $block_content,
            1
        );
    }

    // Inject CSS Classes
    if ( $has_cls ) {
        $safe_cls = esc_attr( $attrs['bkbgCssClasses'] );
        $block_content = preg_replace(
            '/(^\s*<[a-zA-Z][^>]*\bclass\s*=\s*")/',
            '$1' . $safe_cls . ' ',
            $block_content,
            1
        );
    }

    // Build <style> tag
    if ( $has_styles ) {
        $sel   = '.' . $unique;
        $style = '';

        if ( ! empty( $css['desktop'] ) ) {
            $style .= $sel . '{' . implode( ';', $css['desktop'] ) . '}';
        }
        if ( ! empty( $css['tablet'] ) ) {
            $style .= '@media(max-width:1024px){' . $sel . '{' . implode( ';', $css['tablet'] ) . '}}';
        }
        if ( ! empty( $css['mobile'] ) ) {
            $style .= '@media(max-width:767px){' . $sel . '{' . implode( ';', $css['mobile'] ) . '}}';
        }

        // Hover rules
        if ( ! empty( $hover_css['desktop'] ) ) {
            $style .= $sel . ':hover{' . implode( ';', $hover_css['desktop'] ) . '}';
        }
        if ( ! empty( $hover_css['tablet'] ) ) {
            $style .= '@media(max-width:1024px){' . $sel . ':hover{' . implode( ';', $hover_css['tablet'] ) . '}}';
        }
        if ( ! empty( $hover_css['mobile'] ) ) {
            $style .= '@media(max-width:767px){' . $sel . ':hover{' . implode( ';', $hover_css['mobile'] ) . '}}';
        }

        // Responsive visibility: hide on specific devices
        if ( $hide_desktop ) {
            // Hide on desktop (>1024px)
            $style .= '@media(min-width:1025px){' . $sel . '{display:none !important}}';
        }
        if ( $hide_tablet ) {
            // Hide on tablet (768–1024px)
            $style .= '@media(min-width:768px) and (max-width:1024px){' . $sel . '{display:none !important}}';
        }
        if ( $hide_mobile ) {
            // Hide on mobile (≤767px)
            $style .= '@media(max-width:767px){' . $sel . '{display:none !important}}';
        }

        $block_content .= '<style>' . $style . '</style>';
    }

    return $block_content;
}, 10, 2 );

/**
 * Register REST API endpoint for Post Grid block.
 *
 * Route: /wp-json/blockenberg/v1/post-grid
 * Method: GET
 * Params:
 * - type: string (posts|pages|any CPT)
 * - orderby: string (date|title|comment_count|...)
 * - order: string (asc|desc)
 * - per_page: int
 * - offset: int
 * - page: int (1-based)
 * - excerpt_len: int (optional)
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'blockenberg/v1', '/post-grid', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'args'                => array(
            'type'        => array( 'sanitize_callback' => 'sanitize_key' ),
            'orderby'     => array( 'sanitize_callback' => 'sanitize_key' ),
            'order'       => array( 'sanitize_callback' => 'sanitize_text_field' ),
            'per_page'    => array( 'sanitize_callback' => 'absint' ),
            'offset'      => array( 'sanitize_callback' => 'absint' ),
            'page'        => array( 'sanitize_callback' => 'absint' ),
            'excerpt_len' => array( 'sanitize_callback' => 'absint' ),
        ),
        'callback'            => function ( WP_REST_Request $request ) {
            $requested_type = sanitize_key( $request->get_param( 'type' ) ?: 'post' );
            if ( 'posts' === $requested_type ) {
                $requested_type = 'post';
            } elseif ( 'pages' === $requested_type ) {
                $requested_type = 'page';
            }

            $public_post_types = get_post_types( array( 'public' => true ), 'names' );
            $post_type         = in_array( $requested_type, $public_post_types, true ) ? $requested_type : 'post';

            $requested_orderby = sanitize_key( $request->get_param( 'orderby' ) ?: 'date' );
            $allowed_orderby   = array( 'date', 'title', 'modified', 'comment_count', 'rand', 'menu_order' );
            $orderby           = in_array( $requested_orderby, $allowed_orderby, true ) ? $requested_orderby : 'date';
            $order       = strtolower( (string) $request->get_param( 'order' ) ) === 'asc' ? 'ASC' : 'DESC';
            $per_page    = max( 1, absint( $request->get_param( 'per_page' ) ?: 6 ) );
            $per_page    = min( 50, $per_page );
            $offset      = max( 0, absint( $request->get_param( 'offset' ) ?: 0 ) );
            $offset      = min( 5000, $offset );
            $page        = max( 1, absint( $request->get_param( 'page' ) ?: 1 ) );
            $page        = min( 200, $page );
            $excerpt_len = max( 5, absint( $request->get_param( 'excerpt_len' ) ?: 18 ) );
            $excerpt_len = min( 80, $excerpt_len );

            // Short cache for public non-product queries.
            $is_product_query = ( 'product' === $post_type );
            $cache_key = '';
            if ( ! $is_product_query ) {
                $cache_key = 'bkbg_post_grid_' . md5( wp_json_encode( array(
                    'type'        => $post_type,
                    'orderby'     => $orderby,
                    'order'       => $order,
                    'per_page'    => $per_page,
                    'offset'      => $offset,
                    'page'        => $page,
                    'excerpt_len' => $excerpt_len,
                ) ) );
                $cached = get_transient( $cache_key );
                if ( is_array( $cached ) ) {
                    return rest_ensure_response( $cached );
                }
            }

            $q = new WP_Query( array(
                'post_type'           => $post_type,
                'post_status'         => 'publish',
                'orderby'             => $orderby,
                'order'               => $order,
                'posts_per_page'      => $per_page,
                'offset'              => $offset + ( ( $page - 1 ) * $per_page ),
                'ignore_sticky_posts' => true,
                'no_found_rows'       => true,
            ) );

            $posts = array();
            foreach ( $q->posts as $p ) {
                $post_id = $p->ID;
                $title  = wp_strip_all_tags( get_the_title( $post_id ) );
                $link   = esc_url_raw( get_permalink( $post_id ) );
                $image  = esc_url_raw( (string) get_the_post_thumbnail_url( $post_id, 'medium_large' ) );
                $date   = wp_strip_all_tags( (string) get_the_date( '', $post_id ) );
                $author = sanitize_text_field( (string) get_the_author_meta( 'display_name', $p->post_author ) );
                $meta   = trim( $date . ' · ' . $author );
                $raw     = get_post_field( 'post_excerpt', $post_id );
                if ( '' === $raw ) {
                    $raw = get_post_field( 'post_content', $post_id );
                }
                $excerpt = wp_strip_all_tags( wp_trim_words( wp_strip_all_tags( $raw ), $excerpt_len, '…' ) );

                $item = array(
                    'id'      => $post_id,
                    'title'   => $title,
                    'link'    => $link,
                    'image'   => $image,
                    'meta'    => $meta,
                    'excerpt' => $excerpt,
                );

                if ( 'product' === $post_type && function_exists( 'wc_get_product' ) ) {
                    $product = wc_get_product( $post_id );
                    if ( $product ) {
                        $item['price_html']  = wp_kses_post( $product->get_price_html() );
                        $item['add_to_cart'] = esc_url_raw( $product->add_to_cart_url() );
                    }
                }

                $posts[] = $item;
            }

            $payload = array( 'posts' => $posts );

            if ( ! $is_product_query && '' !== $cache_key ) {
                set_transient( $cache_key, $payload, 60 );
            }

            return rest_ensure_response( $payload );
        },
    ) );
} );

/**
 * Simple local newsletter subscribe endpoint.
 * Stores emails in an option array; extend as needed (e.g., to a custom table).
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'blockenberg/v1', '/subscribe', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'args'                => array(
            'email'   => array( 'sanitize_callback' => 'sanitize_email' ),
            'website' => array( 'sanitize_callback' => 'sanitize_text_field' ),
        ),
        'callback'            => function ( WP_REST_Request $request ) {
            $payload = $request->get_json_params();
            if ( ! is_array( $payload ) ) {
                $payload = array();
            }

            // Basic rate limiting by IP to reduce spam / abuse.
            $ip = '';
            if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
                $ip = sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) );
            }
            if ( '' !== $ip ) {
                $key = 'bkbg_subscribe_' . md5( $ip );
                $rl  = get_transient( $key );
                if ( is_array( $rl ) && isset( $rl['count'], $rl['start'] ) ) {
                    if ( $rl['count'] >= 5 ) {
                        return new WP_Error( 'rate_limited', __( 'Too many requests. Please try again later.', 'blockenberg' ), array( 'status' => 429 ) );
                    }
                    $rl['count']++;
                    set_transient( $key, $rl, 60 );
                } else {
                    set_transient( $key, array( 'count' => 1, 'start' => time() ), 60 );
                }
            }

            // Optional honeypot field (bots tend to fill it).
            $honeypot = isset( $payload['website'] ) ? sanitize_text_field( (string) $payload['website'] ) : '';
            if ( '' !== $honeypot ) {
                return rest_ensure_response( array( 'ok' => true ) );
            }

            $email = isset( $payload['email'] ) ? sanitize_email( (string) $payload['email'] ) : '';
            if ( empty( $email ) || ! is_email( $email ) ) {
                return new WP_Error( 'invalid_email', __( 'Invalid email address', 'blockenberg' ), array( 'status' => 400 ) );
            }

            $list = get_option( 'blockenberg_newsletter_subscribers', array() );
            if ( ! is_array( $list ) ) {
                $list = array();
            }

            // Prevent unbounded option growth.
            if ( count( $list ) >= 5000 ) {
                return new WP_Error( 'storage_full', __( 'Subscriber list is full.', 'blockenberg' ), array( 'status' => 503 ) );
            }

            if ( ! in_array( $email, $list, true ) ) {
                $list[] = $email;
                update_option( 'blockenberg_newsletter_subscribers', $list, false );
            }
            return rest_ensure_response( array( 'ok' => true ) );
        },
    ) );
} );

/**
 * Contact Form endpoint — POST /wp-json/blockenberg/v1/contact
 * Sends an email via wp_mail() to the admin or a custom recipient stored in the block.
 */
add_action( 'rest_api_init', function () {
    register_rest_route( 'blockenberg/v1', '/contact', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ( WP_REST_Request $request ) {
            $payload = $request->get_json_params();
            if ( ! is_array( $payload ) ) {
                $payload = array();
            }

            // Rate-limit by IP: max 5 requests per 60 s.
            $ip = '';
            if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
                $ip = sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) );
            }
            if ( '' !== $ip ) {
                $rl_key = 'bkbg_contact_' . md5( $ip );
                $rl     = get_transient( $rl_key );
                if ( is_array( $rl ) && isset( $rl['count'] ) && $rl['count'] >= 5 ) {
                    return new WP_Error( 'rate_limited', __( 'Too many requests. Please try again later.', 'blockenberg' ), array( 'status' => 429 ) );
                }
                if ( is_array( $rl ) ) {
                    $rl['count']++;
                    set_transient( $rl_key, $rl, 60 );
                } else {
                    set_transient( $rl_key, array( 'count' => 1 ), 60 );
                }
            }

            // Honeypot check (bots fill the hidden website field).
            $honeypot = isset( $payload['website'] ) ? sanitize_text_field( (string) $payload['website'] ) : '';
            if ( '' !== $honeypot ) {
                return rest_ensure_response( array( 'ok' => true ) ); // silently accept.
            }

            // Validate required fields.
            $name    = isset( $payload['name'] )    ? sanitize_text_field( (string) $payload['name'] )    : '';
            $email   = isset( $payload['email'] )   ? sanitize_email( (string) $payload['email'] )        : '';
            $phone   = isset( $payload['phone'] )   ? sanitize_text_field( (string) $payload['phone'] )   : '';
            $message = isset( $payload['message'] ) ? sanitize_textarea_field( (string) $payload['message'] ) : '';

            if ( ! is_email( $email ) ) {
                return new WP_Error( 'invalid_email', __( 'Invalid email address.', 'blockenberg' ), array( 'status' => 400 ) );
            }
            if ( empty( $message ) ) {
                return new WP_Error( 'empty_message', __( 'Message is required.', 'blockenberg' ), array( 'status' => 400 ) );
            }

            // Determine recipient and subject.
            $recipient = isset( $payload['recipient'] ) ? sanitize_email( (string) $payload['recipient'] ) : '';
            if ( ! is_email( $recipient ) ) {
                $recipient = get_option( 'admin_email' );
            }
            $subject = isset( $payload['subject'] ) ? sanitize_text_field( (string) $payload['subject'] ) : __( 'New Contact Form Submission', 'blockenberg' );

            // Build email body.
            $body  = "Name: {$name}\n";
            $body .= "Email: {$email}\n";
            if ( ! empty( $phone ) ) {
                $body .= "Phone: {$phone}\n";
            }
            $body .= "\nMessage:\n{$message}\n";

            $headers = array(
                'Content-Type: text/plain; charset=UTF-8',
                "Reply-To: {$name} <{$email}>",
            );

            $sent = wp_mail( $recipient, $subject, $body, $headers );

            if ( ! $sent ) {
                return new WP_Error( 'mail_failed', __( 'Failed to send email. Please try again.', 'blockenberg' ), array( 'status' => 500 ) );
            }

            return rest_ensure_response( array( 'ok' => true ) );
        },
    ) );
} );