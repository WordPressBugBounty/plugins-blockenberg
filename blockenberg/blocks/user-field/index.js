( function () {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useEffect = wp.element.useEffect;
	var useState = wp.element.useState;
	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var PanelColorSettings = wp.blockEditor.PanelColorSettings;
	var PanelBody = wp.components.PanelBody;
	var SelectControl = wp.components.SelectControl;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;

	// Lazy lookup so the typography control is resolved at render time
	function getTypographyControl() {
		return ( typeof window.bkbgTypographyControl !== 'undefined' ) ? window.bkbgTypographyControl : null;
	}
	function getTypoCssVars() {
		return ( typeof window.bkbgTypoCssVars !== 'undefined' ) ? window.bkbgTypoCssVars : function () { return {}; };
	}

	var FIELD_OPTIONS = [
		{ label: __( 'First name', 'blockenberg' ), value: 'first_name' },
		{ label: __( 'Last name', 'blockenberg' ), value: 'last_name' },
		{ label: __( 'Display name', 'blockenberg' ), value: 'display_name' },
		{ label: __( 'Nickname', 'blockenberg' ), value: 'nickname' },
		{ label: __( 'Username', 'blockenberg' ), value: 'user_login' },
		{ label: __( 'Email', 'blockenberg' ), value: 'user_email' },
		{ label: __( 'Website', 'blockenberg' ), value: 'user_url' },
		{ label: __( 'Biographical info', 'blockenberg' ), value: 'description' }
	];

	var TAG_OPTIONS = [
		{ label: 'span', value: 'span' },
		{ label: 'p', value: 'p' },
		{ label: 'div', value: 'div' },
		{ label: 'h2', value: 'h2' },
		{ label: 'h3', value: 'h3' },
		{ label: 'h4', value: 'h4' },
		{ label: 'strong', value: 'strong' },
		{ label: 'em', value: 'em' }
	];

	var SAMPLE = {
		first_name: 'Alex',
		last_name: 'Rivera',
		display_name: 'Alex Rivera',
		nickname: 'alexr',
		user_login: 'alex',
		user_email: 'alex@example.com',
		user_url: 'https://example.com',
		description: 'Writer and educator.'
	};

	function fieldLabel( field ) {
		for ( var i = 0; i < FIELD_OPTIONS.length; i++ ) {
			if ( FIELD_OPTIONS[ i ].value === field ) {
				return FIELD_OPTIONS[ i ].label;
			}
		}
		return field;
	}

	function pickValue( user, field ) {
		if ( ! user ) {
			return '';
		}
		if ( field === 'user_login' ) {
			return user.username || user.slug || user.name || '';
		}
		if ( field === 'user_email' ) {
			return user.email || '';
		}
		if ( field === 'user_url' ) {
			return user.url || '';
		}
		if ( field === 'display_name' ) {
			return user.name || '';
		}
		if ( user.meta && user.meta[ field ] ) {
			return user.meta[ field ];
		}
		if ( user[ field ] ) {
			return user[ field ];
		}
		return SAMPLE[ field ] || '';
	}

	/**
	 * Build wrapper style: layout/color + typography CSS vars.
	 * Typo vars (from TypographyControl) override --bkbg-uf-size / --bkbg-uf-w fallbacks in CSS.
	 */
	function buildWrapStyle( a ) {
		var s = {
			'--bkbg-uf-align': a.textAlign || 'left',
			'--bkbg-uf-size': ( a.fontSize || 16 ) + 'px',
			'--bkbg-uf-w': a.fontWeight || '400'
		};
		if ( a.textColor ) {
			s[ '--bkbg-uf-color' ] = a.textColor;
		}
		var _tv = getTypoCssVars();
		Object.assign( s, _tv( a.typoText || {}, '--bkbg-uf-' ) );
		return s;
	}

	registerBlockType( 'blockenberg/user-field', {
		edit: function ( props ) {
			var a = props.attributes;
			var setAttributes = props.setAttributes;
			var userState = useState( null );
			var user = userState[ 0 ];
			var setUser = userState[ 1 ];

			useEffect( function () {
				if ( ! wp.apiFetch ) {
					return;
				}
				var cancelled = false;
				wp.apiFetch( { path: '/wp/v2/users/me?context=edit' } )
					.then( function ( data ) {
						if ( ! cancelled ) {
							setUser( data );
						}
					} )
					.catch( function () {
						if ( ! cancelled ) {
							setUser( null );
						}
					} );
				return function () {
					cancelled = true;
				};
			}, [] );

			var live = pickValue( user, a.field );
			var previewValue = live || SAMPLE[ a.field ] || fieldLabel( a.field );
			var previewText = ( a.prefix || '' ) + previewValue + ( a.suffix || '' );
			var isBlockTag = [ 'p', 'div', 'h2', 'h3', 'h4' ].indexOf( a.htmlTag ) !== -1;

			var blockProps = useBlockProps( {
				className: 'bkbg-user-field-editor' + ( isBlockTag ? ' bkbg-user-field--block' : '' ),
				style: buildWrapStyle( a )
			} );

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __( 'Field', 'blockenberg' ), initialOpen: true },
						el( SelectControl, {
							label: __( 'Profile field', 'blockenberg' ),
							value: a.field,
							options: FIELD_OPTIONS,
							onChange: function ( v ) { setAttributes( { field: v } ); },
							help: __( 'Shows the logged-in user’s value on the front end.', 'blockenberg' ),
							__nextHasNoMarginBottom: true
						} ),
						el( TextControl, {
							label: __( 'Prefix', 'blockenberg' ),
							value: a.prefix,
							onChange: function ( v ) { setAttributes( { prefix: v } ); },
							placeholder: __( 'e.g. Hello, ', 'blockenberg' ),
							__nextHasNoMarginBottom: true
						} ),
						el( TextControl, {
							label: __( 'Suffix', 'blockenberg' ),
							value: a.suffix,
							onChange: function ( v ) { setAttributes( { suffix: v } ); },
							placeholder: __( 'e.g. !', 'blockenberg' ),
							__nextHasNoMarginBottom: true
						} ),
						el( SelectControl, {
							label: __( 'HTML tag', 'blockenberg' ),
							value: a.htmlTag,
							options: TAG_OPTIONS,
							onChange: function ( v ) { setAttributes( { htmlTag: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						el( SelectControl, {
							label: __( 'Alignment', 'blockenberg' ),
							value: a.textAlign,
							options: [
								{ label: __( 'Left', 'blockenberg' ), value: 'left' },
								{ label: __( 'Center', 'blockenberg' ), value: 'center' },
								{ label: __( 'Right', 'blockenberg' ), value: 'right' }
							],
							onChange: function ( v ) { setAttributes( { textAlign: v } ); },
							__nextHasNoMarginBottom: true
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Guests & empty values', 'blockenberg' ), initialOpen: false },
						el( ToggleControl, {
							label: __( 'Hide when value is empty', 'blockenberg' ),
							checked: a.hideWhenEmpty,
							onChange: function ( v ) { setAttributes( { hideWhenEmpty: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						el( ToggleControl, {
							label: __( 'Hide entirely for logged-out visitors', 'blockenberg' ),
							checked: a.hideForGuests,
							onChange: function ( v ) { setAttributes( { hideForGuests: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						! a.hideForGuests && el( TextControl, {
							label: __( 'Fallback text for guests', 'blockenberg' ),
							value: a.guestFallback,
							onChange: function ( v ) { setAttributes( { guestFallback: v } ); },
							help: __( 'Shown when the visitor is not logged in (leave blank to show nothing if “Hide when empty” is on).', 'blockenberg' ),
							__nextHasNoMarginBottom: true
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Typography', 'blockenberg' ), initialOpen: false },
						( function () {
							var TC = getTypographyControl();
							if ( ! TC ) {
								return el( 'p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __( 'Typography control loading…', 'blockenberg' ) );
							}
							return el( TC, {
								label: __( 'Text Typography', 'blockenberg' ),
								value: a.typoText || {},
								onChange: function ( v ) { setAttributes( { typoText: v } ); }
							} );
						} )()
					),
					el( PanelColorSettings, {
						title: __( 'Color', 'blockenberg' ),
						initialOpen: false,
						colorSettings: [
							{
								value: a.textColor,
								onChange: function ( v ) { setAttributes( { textColor: v || '' } ); },
								label: __( 'Text color', 'blockenberg' )
							}
						]
					} )
				),
				el(
					'div',
					blockProps,
					el(
						a.htmlTag || 'span',
						{ className: 'bkbg-user-field' + ( isBlockTag ? ' bkbg-user-field--block' : '' ) },
						previewText
					),
					el(
						'span',
						{ className: 'bkbg-user-field-editor__hint' },
						live
							? __( 'Preview uses your account. Front end shows each visitor’s own profile field.', 'blockenberg' )
							: __( 'Sample preview — front end shows the logged-in user’s real value.', 'blockenberg' )
					)
				)
			);
		},

		// Dynamic block — HTML is generated in PHP on every request.
		save: function () {
			return null;
		}
	} );
}() );
