( function () {
	'use strict';

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var PanelColorSettings = wp.blockEditor.PanelColorSettings;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var SelectControl = wp.components.SelectControl;
	var RangeControl = wp.components.RangeControl;

	var _tcCache;
	var _tvCache;
	function getTypographyControl() {
		return _tcCache || ( _tcCache = window.bkbgTypographyControl );
	}
	function typoCssVars( obj, prefix ) {
		var fn = _tvCache || ( _tvCache = window.bkbgTypoCssVars );
		return fn ? fn( obj, prefix ) : {};
	}
	function IP() {
		return window.bkbgIconPicker;
	}

	function floatingPosStyle( position, offsetX, offsetY ) {
		var style = {};
		var y = ( offsetY || 24 ) + 'px';
		var x = ( offsetX || 24 ) + 'px';
		if ( position === 'bottom-left' ) {
			style.bottom = y;
			style.left = x;
		} else if ( position === 'bottom-center' ) {
			style.bottom = y;
			style.left = '50%';
			style.transform = 'translateX(-50%)';
		} else if ( position === 'top-right' ) {
			style.top = y;
			style.right = x;
		} else if ( position === 'top-left' ) {
			style.top = y;
			style.left = x;
		} else {
			style.bottom = y;
			style.right = x;
		}
		return style;
	}

	function buildBtnStyle( a ) {
		return {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '8px',
			padding: ( a.paddingV || 12 ) + 'px ' + ( a.paddingH || 20 ) + 'px',
			background: a.bgColor || '#1e293b',
			color: a.textColor || '#ffffff',
			borderRadius: ( a.borderRadius || 0 ) + 'px',
			borderStyle: 'solid',
			borderWidth: ( a.borderWidth || 0 ) + 'px',
			borderColor: a.borderColor || a.bgColor || '#1e293b',
			boxShadow: a.shadow ? '0 4px 16px rgba(15, 23, 42, 0.18)' : 'none',
			cursor: 'pointer',
			// Typography (family / line-height / decoration / etc.) comes from
			// CSS vars on the wrap — do not set font* here or they override typo.
			'--bkbg-prb-hover-bg': a.hoverBg || '#0f172a',
			'--bkbg-prb-hover-color': a.hoverColor || '#ffffff'
		};
	}

	function renderIcon( a, forSave ) {
		if ( ! a.showIcon ) {
			return null;
		}

		var style = {
			fontSize: ( a.iconSize || 18 ) + 'px',
			lineHeight: 1,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0
		};
		var type = a.iconType || 'dashicon';
		var picker = IP();

		if ( ! picker || type === 'custom-char' || type === 'none' ) {
			if ( type === 'none' ) {
				return null;
			}
			return el( 'span', {
				className: 'bkbg-prb-icon',
				style: style,
				'aria-hidden': 'true'
			}, a.icon || '🖨' );
		}

		var builder = forSave ? picker.buildSaveIcon : picker.buildEditorIcon;
		return el( 'span', {
			className: 'bkbg-prb-icon',
			style: style,
			'aria-hidden': 'true'
		}, builder( type, a.icon, a.iconDashicon, a.iconImageUrl, a.iconDashiconColor || '' ) );
	}

	function renderButtonChildren( a, forSave ) {
		var iconEl = renderIcon( a, forSave );
		var labelEl = a.showLabel && a.label
			? el( 'span', { className: 'bkbg-prb-label' }, a.label )
			: null;
		return a.iconPosition === 'right'
			? [ labelEl, iconEl ]
			: [ iconEl, labelEl ];
	}

	registerBlockType( 'blockenberg/print-button', {
		edit: function ( props ) {
			var a = props.attributes;
			var setAttributes = props.setAttributes;
			var isFloating = a.layout === 'floating';
			var TypographyControl = getTypographyControl();
			var picker = IP();

			var wrapStyle = Object.assign(
				{},
				typoCssVars( a.typoBtn || {}, '--bkbg-prb-btn-' ),
				isFloating
					? {
						minHeight: '96px',
						background: '#f1f5f9',
						borderRadius: '12px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '24px'
					}
					: {
						textAlign: a.alignBtn || 'left',
						padding: '8px 0'
					}
			);

			var blockProps = useBlockProps( {
				className: 'bkbg-prb-editor' + ( isFloating ? ' bkbg-prb-editor--floating' : '' ),
				style: wrapStyle
			} );

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __( 'Content', 'blockenberg' ), initialOpen: true },
						el( ToggleControl, {
							label: __( 'Show label', 'blockenberg' ),
							checked: !! a.showLabel,
							onChange: function ( v ) { setAttributes( { showLabel: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						a.showLabel && el( TextControl, {
							label: __( 'Button label', 'blockenberg' ),
							value: a.label,
							onChange: function ( v ) { setAttributes( { label: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						el( TextControl, {
							label: __( 'ARIA label (optional)', 'blockenberg' ),
							value: a.ariaLabel || '',
							help: __( 'Overrides the accessible name when the visible label is empty.', 'blockenberg' ),
							onChange: function ( v ) { setAttributes( { ariaLabel: v } ); },
							__nextHasNoMarginBottom: true
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Icon', 'blockenberg' ), initialOpen: true },
						el( ToggleControl, {
							label: __( 'Show icon', 'blockenberg' ),
							checked: !! a.showIcon,
							onChange: function ( v ) { setAttributes( { showIcon: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						a.showIcon && picker && el(
							picker.IconPickerControl,
							picker.iconPickerProps( a, setAttributes )
						),
						a.showIcon && ! picker && el(
							'p',
							{ style: { color: '#999', fontSize: '12px' } },
							__( 'Icon picker loading…', 'blockenberg' )
						),
						a.showIcon && el( SelectControl, {
							label: __( 'Icon position', 'blockenberg' ),
							value: a.iconPosition,
							options: [
								{ label: __( 'Left', 'blockenberg' ), value: 'left' },
								{ label: __( 'Right', 'blockenberg' ), value: 'right' }
							],
							onChange: function ( v ) { setAttributes( { iconPosition: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						a.showIcon && el( RangeControl, {
							label: __( 'Icon size (px)', 'blockenberg' ),
							value: a.iconSize,
							min: 12,
							max: 40,
							onChange: function ( v ) { setAttributes( { iconSize: v } ); }
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Layout', 'blockenberg' ), initialOpen: false },
						el( SelectControl, {
							label: __( 'Placement', 'blockenberg' ),
							value: a.layout,
							options: [
								{ label: __( 'Inline (in content)', 'blockenberg' ), value: 'inline' },
								{ label: __( 'Floating (fixed)', 'blockenberg' ), value: 'floating' }
							],
							onChange: function ( v ) { setAttributes( { layout: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						! isFloating && el( SelectControl, {
							label: __( 'Alignment', 'blockenberg' ),
							value: a.alignBtn,
							options: [
								{ label: __( 'Left', 'blockenberg' ), value: 'left' },
								{ label: __( 'Center', 'blockenberg' ), value: 'center' },
								{ label: __( 'Right', 'blockenberg' ), value: 'right' }
							],
							onChange: function ( v ) { setAttributes( { alignBtn: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						isFloating && el( SelectControl, {
							label: __( 'Screen position', 'blockenberg' ),
							value: a.position,
							options: [
								{ label: __( 'Bottom right', 'blockenberg' ), value: 'bottom-right' },
								{ label: __( 'Bottom left', 'blockenberg' ), value: 'bottom-left' },
								{ label: __( 'Bottom center', 'blockenberg' ), value: 'bottom-center' },
								{ label: __( 'Top right', 'blockenberg' ), value: 'top-right' },
								{ label: __( 'Top left', 'blockenberg' ), value: 'top-left' }
							],
							onChange: function ( v ) { setAttributes( { position: v } ); },
							__nextHasNoMarginBottom: true
						} ),
						isFloating && a.position !== 'bottom-center' && el( RangeControl, {
							label: __( 'Horizontal offset (px)', 'blockenberg' ),
							value: a.offsetX,
							min: 8,
							max: 120,
							onChange: function ( v ) { setAttributes( { offsetX: v } ); }
						} ),
						isFloating && el( RangeControl, {
							label: __( 'Vertical offset (px)', 'blockenberg' ),
							value: a.offsetY,
							min: 8,
							max: 120,
							onChange: function ( v ) { setAttributes( { offsetY: v } ); }
						} ),
						isFloating && el( RangeControl, {
							label: __( 'Z-index', 'blockenberg' ),
							value: a.zIndex,
							min: 100,
							max: 99999,
							onChange: function ( v ) { setAttributes( { zIndex: v } ); }
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Size & shape', 'blockenberg' ), initialOpen: false },
						el( RangeControl, {
							label: __( 'Horizontal padding (px)', 'blockenberg' ),
							value: a.paddingH,
							min: 8,
							max: 64,
							onChange: function ( v ) { setAttributes( { paddingH: v } ); }
						} ),
						el( RangeControl, {
							label: __( 'Vertical padding (px)', 'blockenberg' ),
							value: a.paddingV,
							min: 4,
							max: 40,
							onChange: function ( v ) { setAttributes( { paddingV: v } ); }
						} ),
						el( RangeControl, {
							label: __( 'Border radius (px)', 'blockenberg' ),
							value: a.borderRadius,
							min: 0,
							max: 999,
							onChange: function ( v ) { setAttributes( { borderRadius: v } ); }
						} ),
						el( RangeControl, {
							label: __( 'Border width (px)', 'blockenberg' ),
							value: a.borderWidth,
							min: 0,
							max: 6,
							onChange: function ( v ) { setAttributes( { borderWidth: v } ); }
						} ),
						el( ToggleControl, {
							label: __( 'Drop shadow', 'blockenberg' ),
							checked: !! a.shadow,
							onChange: function ( v ) { setAttributes( { shadow: v } ); },
							__nextHasNoMarginBottom: true
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Typography', 'blockenberg' ), initialOpen: false },
						TypographyControl
							? el( TypographyControl, {
								label: __( 'Button text', 'blockenberg' ),
								value: a.typoBtn || {},
								onChange: function ( v ) { setAttributes( { typoBtn: v } ); }
							} )
							: el( 'p', { style: { color: '#999', fontSize: '12px' } }, __( 'Typography control loading…', 'blockenberg' ) )
					),
					el( PanelColorSettings, {
						title: __( 'Colors', 'blockenberg' ),
						initialOpen: false,
						colorSettings: [
							{
								label: __( 'Background', 'blockenberg' ),
								value: a.bgColor,
								onChange: function ( v ) { setAttributes( { bgColor: v || '#1e293b' } ); }
							},
							{
								label: __( 'Text / icon', 'blockenberg' ),
								value: a.textColor,
								onChange: function ( v ) { setAttributes( { textColor: v || '#ffffff' } ); }
							},
							{
								label: __( 'Hover background', 'blockenberg' ),
								value: a.hoverBg,
								onChange: function ( v ) { setAttributes( { hoverBg: v || '#0f172a' } ); }
							},
							{
								label: __( 'Hover text / icon', 'blockenberg' ),
								value: a.hoverColor,
								onChange: function ( v ) { setAttributes( { hoverColor: v || '#ffffff' } ); }
							},
							{
								label: __( 'Border', 'blockenberg' ),
								value: a.borderColor,
								onChange: function ( v ) { setAttributes( { borderColor: v || '#1e293b' } ); }
							}
						]
					} )
				),
				el(
					'div',
					blockProps,
					isFloating && el(
						'p',
						{ className: 'bkbg-prb-editor-hint' },
						__( 'Floating button — fixed on the front end', 'blockenberg' ) +
							' (' + ( a.position || 'bottom-right' ) + ')'
					),
					el(
						'button',
						{
							type: 'button',
							className: 'bkbg-prb-btn',
							style: buildBtnStyle( a ),
							onClick: function ( e ) { e.preventDefault(); }
						},
						renderButtonChildren( a, false )
					)
				)
			);
		},

		save: function ( props ) {
			var a = props.attributes;
			var isFloating = a.layout === 'floating';
			var wrapStyle = Object.assign( {}, typoCssVars( a.typoBtn || {}, '--bkbg-prb-btn-' ) );

			if ( isFloating ) {
				Object.assign( wrapStyle, floatingPosStyle( a.position, a.offsetX, a.offsetY ) );
				wrapStyle.position = 'fixed';
				wrapStyle.zIndex = a.zIndex || 9990;
			} else {
				wrapStyle.textAlign = a.alignBtn || 'left';
			}

			var blockProps = useBlockProps.save( {
				className: 'bkbg-prb-wrap' + ( isFloating ? ' bkbg-prb-wrap--floating' : ' bkbg-prb-wrap--inline' ),
				style: wrapStyle
			} );

			var aria = a.ariaLabel || a.label || __( 'Print page', 'blockenberg' );

			return el(
				'div',
				blockProps,
				el(
					'button',
					{
						type: 'button',
						className: 'bkbg-prb-btn',
						style: buildBtnStyle( a ),
						'aria-label': aria,
						'data-bkbg-print': '1'
					},
					renderButtonChildren( a, true )
				)
			);
		}
	} );
}() );
