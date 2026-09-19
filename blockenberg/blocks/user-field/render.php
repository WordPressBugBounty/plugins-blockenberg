<?php
/**
 * User Field block — server render for the logged-in user's profile data.
 *
 * @package Blockenberg
 */

defined( 'ABSPATH' ) || exit;

/**
 * Allowed profile fields and how to resolve them.
 *
 * @return array<string, string> field => label (for docs / editor parity).
 */
function bkbg_user_field_allowed_fields() {
	return array(
		'first_name'   => __( 'First name', 'blockenberg' ),
		'last_name'    => __( 'Last name', 'blockenberg' ),
		'display_name' => __( 'Display name', 'blockenberg' ),
		'nickname'     => __( 'Nickname', 'blockenberg' ),
		'user_login'   => __( 'Username', 'blockenberg' ),
		'user_email'   => __( 'Email', 'blockenberg' ),
		'user_url'     => __( 'Website', 'blockenberg' ),
		'description'  => __( 'Biographical info', 'blockenberg' ),
	);
}

/**
 * Resolve a single field value for a WP_User.
 *
 * @param WP_User $user  User object.
 * @param string  $field Field key.
 * @return string
 */
function bkbg_user_field_get_value( $user, $field ) {
	if ( ! ( $user instanceof WP_User ) ) {
		return '';
	}

	$allowed = bkbg_user_field_allowed_fields();
	if ( ! isset( $allowed[ $field ] ) ) {
		$field = 'first_name';
	}

	switch ( $field ) {
		case 'user_login':
			return (string) $user->user_login;
		case 'user_email':
			return (string) $user->user_email;
		case 'user_url':
			return (string) $user->user_url;
		case 'display_name':
			return (string) $user->display_name;
		case 'nickname':
		case 'first_name':
		case 'last_name':
		case 'description':
			return (string) get_user_meta( $user->ID, $field, true );
		default:
			return '';
	}
}

/**
 * Convert a TypographyControl object to CSS custom properties (mirrors bkbgTypoCssVars).
 *
 * @param array  $typo   Typography attribute object.
 * @param string $prefix CSS variable prefix, e.g. '--bkbg-uf-'.
 * @return array<string, string> property => value (without trailing semicolon).
 */
function bkbg_user_field_typo_css_vars( $typo, $prefix ) {
	if ( ! is_array( $typo ) || '' === $prefix ) {
		return array();
	}

	$vars       = array();
	$unit_ok    = array( 'px', 'em', 'rem', '%', 'vh', 'vw' );
	$transforms = array( 'none', 'capitalize', 'uppercase', 'lowercase' );
	$styles     = array( 'normal', 'italic', 'oblique' );
	$decors     = array( 'none', 'underline', 'overline', 'line-through' );

	if ( ! empty( $typo['family'] ) ) {
		$family = sanitize_text_field( (string) $typo['family'] );
		// Strip quotes so the CSS value stays well-formed inside style="".
		$family = str_replace( array( "'", '"' ), '', $family );
		if ( $family ) {
			$vars[ $prefix . 'font-family' ] = "'" . $family . "', sans-serif";
		}
	}

	if ( isset( $typo['weight'] ) && '' !== $typo['weight'] && null !== $typo['weight'] ) {
		$weight = preg_replace( '/[^0-9a-zA-Z]/', '', (string) $typo['weight'] );
		if ( $weight ) {
			$vars[ $prefix . 'font-weight' ] = $weight;
		}
	}

	if ( ! empty( $typo['transform'] ) && in_array( $typo['transform'], $transforms, true ) ) {
		$vars[ $prefix . 'text-transform' ] = $typo['transform'];
	}

	if ( ! empty( $typo['style'] ) && in_array( $typo['style'], $styles, true ) ) {
		$vars[ $prefix . 'font-style' ] = $typo['style'];
	}

	if ( ! empty( $typo['decoration'] ) && in_array( $typo['decoration'], $decors, true ) ) {
		$vars[ $prefix . 'text-decoration' ] = $typo['decoration'];
	}

	$size_unit = isset( $typo['sizeUnit'] ) && in_array( $typo['sizeUnit'], $unit_ok, true ) ? $typo['sizeUnit'] : 'px';
	foreach ( array( 'sizeDesktop' => 'font-size-d', 'sizeTablet' => 'font-size-t', 'sizeMobile' => 'font-size-m' ) as $key => $suffix ) {
		if ( isset( $typo[ $key ] ) && '' !== $typo[ $key ] && null !== $typo[ $key ] && is_numeric( $typo[ $key ] ) ) {
			$vars[ $prefix . $suffix ] = floatval( $typo[ $key ] ) . $size_unit;
		}
	}

	$lh_unit = isset( $typo['lineHeightUnit'] ) && in_array( $typo['lineHeightUnit'], $unit_ok, true ) ? $typo['lineHeightUnit'] : 'px';
	foreach ( array( 'lineHeightDesktop' => 'line-height-d', 'lineHeightTablet' => 'line-height-t', 'lineHeightMobile' => 'line-height-m' ) as $key => $suffix ) {
		if ( isset( $typo[ $key ] ) && '' !== $typo[ $key ] && null !== $typo[ $key ] && is_numeric( $typo[ $key ] ) ) {
			$vars[ $prefix . $suffix ] = floatval( $typo[ $key ] ) . $lh_unit;
		}
	}

	$ls_unit = isset( $typo['letterSpacingUnit'] ) && in_array( $typo['letterSpacingUnit'], $unit_ok, true ) ? $typo['letterSpacingUnit'] : 'px';
	foreach ( array( 'letterSpacingDesktop' => 'letter-spacing-d', 'letterSpacingTablet' => 'letter-spacing-t', 'letterSpacingMobile' => 'letter-spacing-m' ) as $key => $suffix ) {
		if ( isset( $typo[ $key ] ) && '' !== $typo[ $key ] && null !== $typo[ $key ] && is_numeric( $typo[ $key ] ) ) {
			$val = floatval( $typo[ $key ] ) . $ls_unit;
			$vars[ $prefix . $suffix ] = $val;
			if ( 'letterSpacingDesktop' === $key ) {
				$vars[ $prefix . 'letter-spacing' ] = $val;
			}
		}
	}

	$ws_unit = isset( $typo['wordSpacingUnit'] ) && in_array( $typo['wordSpacingUnit'], $unit_ok, true ) ? $typo['wordSpacingUnit'] : 'px';
	foreach ( array( 'wordSpacingDesktop' => 'word-spacing-d', 'wordSpacingTablet' => 'word-spacing-t', 'wordSpacingMobile' => 'word-spacing-m' ) as $key => $suffix ) {
		if ( isset( $typo[ $key ] ) && '' !== $typo[ $key ] && null !== $typo[ $key ] && is_numeric( $typo[ $key ] ) ) {
			$val = floatval( $typo[ $key ] ) . $ws_unit;
			$vars[ $prefix . $suffix ] = $val;
			if ( 'wordSpacingDesktop' === $key ) {
				$vars[ $prefix . 'word-spacing' ] = $val;
			}
		}
	}

	return $vars;
}

/**
 * Render callback for blockenberg/user-field.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block content (unused).
 * @param WP_Block $block      Block instance.
 * @return string
 */
function bkbg_render_user_field_block( $attributes, $content = '', $block = null ) {
	$defaults = array(
		'field'         => 'first_name',
		'prefix'        => '',
		'suffix'        => '',
		'guestFallback' => '',
		'hideWhenEmpty' => true,
		'hideForGuests' => false,
		'htmlTag'       => 'span',
		'textAlign'     => 'left',
		'textColor'     => '',
		'fontSize'      => 16,
		'fontWeight'    => '400',
		'typoText'      => array(),
	);
	$a = wp_parse_args( is_array( $attributes ) ? $attributes : array(), $defaults );

	$allowed_tags = array( 'span', 'p', 'div', 'h2', 'h3', 'h4', 'strong', 'em' );
	$tag          = in_array( $a['htmlTag'], $allowed_tags, true ) ? $a['htmlTag'] : 'span';

	$is_logged_in = is_user_logged_in();
	$value        = '';

	if ( $is_logged_in ) {
		$value = bkbg_user_field_get_value( wp_get_current_user(), $a['field'] );
	} else {
		if ( ! empty( $a['hideForGuests'] ) ) {
			return '';
		}
		$value = (string) $a['guestFallback'];
	}

	$value = trim( $value );

	if ( '' === $value && ! empty( $a['hideWhenEmpty'] ) ) {
		return '';
	}

	$prefix = (string) $a['prefix'];
	$suffix = (string) $a['suffix'];
	$text   = $prefix . $value . $suffix;

	if ( '' === trim( $text ) ) {
		return '';
	}

	$align = in_array( $a['textAlign'], array( 'left', 'center', 'right' ), true ) ? $a['textAlign'] : 'left';
	$css   = array(
		'--bkbg-uf-align:' . $align,
		'--bkbg-uf-size:' . absint( $a['fontSize'] ) . 'px',
		'--bkbg-uf-w:' . preg_replace( '/[^0-9a-zA-Z]/', '', (string) $a['fontWeight'] ),
	);

	if ( ! empty( $a['textColor'] ) ) {
		$color = sanitize_text_field( $a['textColor'] );
		if ( preg_match( '/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/', $color )
			|| preg_match( '/^rgba?\([\d\s.,%]+\)$/', $color ) ) {
			$css[] = '--bkbg-uf-color:' . $color;
		}
	}

	$typo_vars = bkbg_user_field_typo_css_vars(
		is_array( $a['typoText'] ) ? $a['typoText'] : array(),
		'--bkbg-uf-'
	);
	foreach ( $typo_vars as $prop => $val ) {
		$css[] = $prop . ':' . $val;
	}

	$is_block_tag = in_array( $tag, array( 'p', 'div', 'h2', 'h3', 'h4' ), true );
	$class        = 'bkbg-user-field' . ( $is_block_tag ? ' bkbg-user-field--block' : '' );

	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class' => $class,
			'style' => implode( ';', array_filter( $css ) ),
		)
	);

	return sprintf(
		'<%1$s %2$s>%3$s</%1$s>',
		$tag,
		$wrapper_attributes,
		esc_html( $text )
	);
}

add_filter(
	'register_block_type_args',
	function ( $args, $block_type ) {
		if ( 'blockenberg/user-field' === $block_type ) {
			$args['render_callback'] = 'bkbg_render_user_field_block';
		}
		return $args;
	},
	5,
	2
);
