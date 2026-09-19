( function () {
    'use strict';
    window.bkbgAISettings = window.bkbgAISettings || {};
    var cfg = window.bkbgAISettings;
    var __ = wp.i18n.__;
    var sprintf = wp.i18n.sprintf;

    function groupedCatalogModels( models, query ) {
        var tokens = String( query || '' ).toLocaleLowerCase().trim().split( /\s+/ ).filter( Boolean );
        var groups = { free: [], paid: [] };
        ( models || [] ).filter( function ( item ) {
            if ( ! item || typeof item.id !== 'string' ) { return false; }
            var haystack = ( String( item.name || '' ) + ' ' + item.id ).toLocaleLowerCase();
            return tokens.every( function ( token ) { return haystack.indexOf( token ) !== -1; } );
        } ).forEach( function ( item ) {
            groups[ item.free === true ? 'free' : 'paid' ].push( item );
        } );
        return groups;
    }
    cfg.groupedChatModels = groupedCatalogModels;
    cfg.groupedCatalogModels = groupedCatalogModels;

    var form = document.getElementById( 'bkbg-ai-settings-form' );
    if ( ! form ) { return; }

    var key = document.getElementById( 'bkbg-ai-key' );
    var removeKey = document.getElementById( 'bkbg-ai-remove-key' );
    var test = document.getElementById( 'bkbg-ai-test' );
    var testResult = document.getElementById( 'bkbg-ai-test-result' );
    var testing = false;
    function syncKey() {
        var removing = !! ( removeKey && removeKey.checked );
        if ( key ) { key.disabled = removing; }
        test.disabled = testing || removing || ( ! cfg.configured && ( ! key || ! key.value.trim() ) );
    }
    if ( key ) { key.addEventListener( 'input', syncKey ); }
    if ( removeKey ) { removeKey.addEventListener( 'change', syncKey ); }
    syncKey();

    test.addEventListener( 'click', function () {
        testing = true;
        syncKey();
        testResult.className = 'bkbg-ai-inline-status';
        testResult.textContent = __( 'Checking your OpenRouter connection…', 'blockenberg' );
        var body = new FormData();
        body.append( 'action', 'bkbg_ai_test_key' );
        body.append( 'nonce', cfg.testNonce );
        if ( key && key.value.trim() ) { body.append( 'api_key', key.value.trim() ); }
        window.fetch( window.ajaxurl, { method: 'POST', credentials: 'same-origin', body: body } )
            .then( function ( response ) { return response.json(); } )
            .then( function ( json ) {
                var ok = !! ( json && json.success );
                testResult.textContent = json && json.data && json.data.message || __( 'The connection could not be verified. Please try again.', 'blockenberg' );
                testResult.classList.add( ok ? 'is-success' : 'is-error' );
                if ( ok && ! ( json.data && json.data.unsaved ) ) {
                    var status = document.getElementById( 'bkbg-ai-connection-status' );
                    status.classList.add( 'is-configured' );
                    status.lastElementChild.textContent = __( 'Connected', 'blockenberg' );
                }
            } )
            .catch( function () {
                testResult.classList.add( 'is-error' );
                testResult.textContent = __( 'The connection could not be verified. Check your network and try again.', 'blockenberg' );
            } )
            .then( function () { testing = false; syncKey(); } );
    } );

    var customOption = '__custom__';

    function bindModelPicker( options ) {
        var input = options.input;
        var customWrap = options.customWrap;
        var loading = options.loading;
        var pricing = options.pricing;
        var combobox = options.combobox;
        var trigger = options.trigger;
        var triggerLabel = options.triggerLabel;
        var panel = options.panel;
        var search = options.search;
        var results = options.results;
        var pickerWrap = options.pickerWrap;
        var models = [];
        var customValue = input.value;
        var selectedId = customOption;
        var menuOpen = false;
        var activeIndex = 0;
        var disabled = false;

        function selectedModel() {
            return models.find( function ( item ) { return item.id === selectedId; } );
        }

        function markDirty() {
            input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
        }

        function showModel() {
            input.setCustomValidity( '' );
            var custom = selectedId === customOption;
            customWrap.hidden = ! custom;
            if ( ! custom ) { input.value = selectedId; }
            var model = selectedModel();
            pricing.textContent = options.formatPrice( model, custom );
            triggerLabel.textContent = custom ? __( 'Custom model ID…', 'blockenberg' ) : ( model && model.name ? model.name : selectedId );
            trigger.title = custom ? '' : selectedId;
        }

        function optionNodes() {
            return Array.prototype.slice.call( results.querySelectorAll( '[data-model-id]' ) );
        }

        function setActive( index ) {
            var opts = optionNodes();
            if ( ! opts.length ) {
                activeIndex = 0;
                search.removeAttribute( 'aria-activedescendant' );
                return;
            }
            activeIndex = ( index + opts.length ) % opts.length;
            opts.forEach( function ( option, i ) {
                option.id = options.optionIdPrefix + i;
                option.classList.toggle( 'is-active', i === activeIndex );
            } );
            search.setAttribute( 'aria-activedescendant', opts[ activeIndex ].id );
            if ( opts[ activeIndex ].scrollIntoView ) {
                opts[ activeIndex ].scrollIntoView( { block: 'nearest' } );
            }
        }

        function renderResults() {
            var groups = groupedCatalogModels( models, search.value );
            var fragment = document.createDocumentFragment();
            [ 'free', 'paid' ].forEach( function ( group ) {
                if ( ! groups[ group ].length ) { return; }
                var heading = document.createElement( 'div' );
                heading.className = 'bkbg-ai-model-combobox__group';
                var title = document.createElement( 'span' );
                title.textContent = group === 'free' ? __( 'Free models', 'blockenberg' ) : __( 'Paid models', 'blockenberg' );
                var count = document.createElement( 'span' );
                count.textContent = String( groups[ group ].length );
                heading.appendChild( title );
                heading.appendChild( count );
                fragment.appendChild( heading );
                groups[ group ].forEach( function ( item ) {
                    var option = document.createElement( 'button' );
                    option.type = 'button';
                    option.className = 'bkbg-ai-model-combobox__option' + ( item.id === selectedId ? ' is-selected' : '' );
                    option.setAttribute( 'role', 'option' );
                    option.setAttribute( 'data-model-id', item.id );
                    option.setAttribute( 'aria-selected', item.id === selectedId ? 'true' : 'false' );
                    var name = document.createElement( 'span' );
                    name.textContent = item.name || item.id;
                    var id = document.createElement( 'small' );
                    id.textContent = item.id;
                    option.appendChild( name );
                    option.appendChild( id );
                    fragment.appendChild( option );
                } );
            } );
            if ( ! groups.free.length && ! groups.paid.length ) {
                var empty = document.createElement( 'p' );
                empty.className = 'bkbg-ai-model-combobox__empty';
                empty.textContent = __( 'No matching models.', 'blockenberg' );
                fragment.appendChild( empty );
            }
            var custom = document.createElement( 'button' );
            custom.type = 'button';
            custom.className = 'bkbg-ai-model-combobox__option' + ( selectedId === customOption ? ' is-selected' : '' );
            custom.setAttribute( 'role', 'option' );
            custom.setAttribute( 'data-model-id', customOption );
            custom.setAttribute( 'aria-selected', selectedId === customOption ? 'true' : 'false' );
            custom.textContent = __( 'Custom model ID…', 'blockenberg' );
            fragment.appendChild( custom );
            results.replaceChildren( fragment );
            var opts = optionNodes();
            var selected = opts.findIndex( function ( option ) { return option.getAttribute( 'data-model-id' ) === selectedId; } );
            setActive( selected === -1 ? 0 : selected );
        }

        function closeMenu( restoreFocus ) {
            if ( ! menuOpen ) { return; }
            menuOpen = false;
            panel.hidden = true;
            combobox.classList.remove( 'is-open' );
            trigger.setAttribute( 'aria-expanded', 'false' );
            search.value = '';
            search.removeAttribute( 'aria-activedescendant' );
            if ( restoreFocus !== false ) { trigger.focus(); }
        }

        function openMenu() {
            if ( menuOpen || disabled ) { return; }
            menuOpen = true;
            panel.hidden = false;
            combobox.classList.add( 'is-open' );
            trigger.setAttribute( 'aria-expanded', 'true' );
            search.value = '';
            renderResults();
            search.focus();
        }

        function choose( id ) {
            if ( id === customOption ) {
                selectedId = customOption;
                input.value = customValue;
            } else {
                selectedId = id;
                customValue = input.value;
                input.value = id;
            }
            showModel();
            markDirty();
            closeMenu();
        }

        function setDisabled( next ) {
            disabled = !! next;
            trigger.disabled = disabled;
            input.disabled = disabled;
            if ( disabled ) { closeMenu( false ); }
        }

        input.addEventListener( 'input', function () { customValue = input.value; } );
        trigger.addEventListener( 'click', function () {
            if ( menuOpen ) { closeMenu(); } else { openMenu(); }
        } );
        search.addEventListener( 'input', function () { renderResults(); } );
        search.addEventListener( 'keydown', function ( event ) {
            var opts = optionNodes();
            if ( event.key === 'ArrowDown' ) {
                event.preventDefault();
                setActive( activeIndex + 1 );
            } else if ( event.key === 'ArrowUp' ) {
                event.preventDefault();
                setActive( activeIndex - 1 );
            } else if ( event.key === 'Enter' ) {
                event.preventDefault();
                if ( opts[ activeIndex ] ) { choose( opts[ activeIndex ].getAttribute( 'data-model-id' ) ); }
            } else if ( event.key === 'Escape' ) {
                event.preventDefault();
                closeMenu();
            } else if ( event.key === 'Tab' ) {
                closeMenu( false );
            }
        } );
        results.addEventListener( 'click', function ( event ) {
            var option = event.target.closest( '[data-model-id]' );
            if ( option ) { choose( option.getAttribute( 'data-model-id' ) ); }
        } );
        document.addEventListener( 'pointerdown', function ( event ) {
            if ( menuOpen && ! combobox.contains( event.target ) ) { closeMenu( false ); }
        } );

        loading.textContent = options.loadingText;
        window.fetch( cfg.restBase + options.endpoint, {
            credentials: 'same-origin', headers: { 'X-WP-Nonce': cfg.nonce }
        } ).then( function ( response ) {
            if ( ! response.ok ) { throw new Error( 'models unavailable' ); }
            return response.json();
        } ).then( function ( list ) {
            if ( ! Array.isArray( list ) || ! list.length ) { throw new Error( 'models unavailable' ); }
            models = list.filter( function ( item ) { return item && typeof item.id === 'string' && typeof item.name === 'string'; } );
            models.sort( function ( left, right ) {
                if ( !! left.free !== !! right.free ) { return left.free ? -1 : 1; }
                return left.name.localeCompare( right.name, undefined, { sensitivity: 'base' } ) || left.id.localeCompare( right.id );
            } );
            selectedId = models.some( function ( item ) { return item.id === input.value; } ) ? input.value : customOption;
            pickerWrap.hidden = false;
            loading.hidden = true;
            showModel();
            renderResults();
        } ).catch( function () {
            loading.textContent = options.unavailableText;
            customWrap.hidden = false;
        } );

        return { setDisabled: setDisabled };
    }

    function formatChatPrice( model, custom ) {
        if ( model && model.free ) {
            return __( 'Free model · Not guaranteed — they often error. Fine for small fixes.', 'blockenberg' );
        }
        if ( model && model.pricing && typeof model.pricing.prompt === 'number' && typeof model.pricing.completion === 'number' && model.pricing.prompt >= 0 && model.pricing.completion >= 0 ) {
            var inputPrice = ( model.pricing.prompt * 1000000 ).toLocaleString( undefined, { maximumFractionDigits: 4 } );
            var outputPrice = ( model.pricing.completion * 1000000 ).toLocaleString( undefined, { maximumFractionDigits: 4 } );
            return sprintf( __( '$%1$s input / $%2$s output per 1M tokens · Other charges may apply', 'blockenberg' ), inputPrice, outputPrice );
        }
        return custom
            ? __( 'Enter an OpenRouter model ID that supports tool calling.', 'blockenberg' )
            : __( 'Check current pricing on OpenRouter before use.', 'blockenberg' );
    }

    function formatImagePrice( model, custom ) {
        if ( model && model.free ) {
            return __( 'Free model · Not guaranteed — they often error. Fine for small fixes.', 'blockenberg' );
        }
        if ( model && model.pricing && typeof model.pricing.image_output === 'number' && model.pricing.image_output >= 0 ) {
            var imagePrice = ( model.pricing.image_output * 1000000 ).toLocaleString( undefined, { maximumFractionDigits: 4 } );
            return sprintf( __( '$%s image output per 1M tokens · Other charges may apply', 'blockenberg' ), imagePrice );
        }
        return custom
            ? __( 'Enter an OpenRouter model ID that can generate images.', 'blockenberg' )
            : __( 'Check current pricing on OpenRouter before use.', 'blockenberg' );
    }

    var modelInput = document.getElementById( 'bkbg-ai-model' );
    var imageModel = document.getElementById( 'bkbg-ai-image-model' );
    var imageWrap = document.getElementById( 'bkbg-ai-image-model-wrap' );

    bindModelPicker( {
        input: modelInput,
        customWrap: document.getElementById( 'bkbg-ai-custom-model-wrap' ),
        loading: document.getElementById( 'bkbg-ai-model-loading' ),
        pricing: document.getElementById( 'bkbg-ai-model-price' ),
        combobox: document.getElementById( 'bkbg-ai-model-combobox' ),
        trigger: document.getElementById( 'bkbg-ai-model-trigger' ),
        triggerLabel: document.getElementById( 'bkbg-ai-model-trigger-label' ),
        panel: document.getElementById( 'bkbg-ai-model-panel' ),
        search: document.getElementById( 'bkbg-ai-model-search' ),
        results: document.getElementById( 'bkbg-ai-model-results' ),
        pickerWrap: document.getElementById( 'bkbg-ai-model-picker-wrap' ),
        optionIdPrefix: 'bkbg-ai-model-opt-',
        endpoint: '/ai/models',
        formatPrice: formatChatPrice,
        loadingText: __( 'Loading available models…', 'blockenberg' ),
        unavailableText: __( 'The model list is unavailable. You can still enter a model ID and save your settings.', 'blockenberg' )
    } );

    var imagePicker = bindModelPicker( {
        input: imageModel,
        customWrap: document.getElementById( 'bkbg-ai-image-custom-model-wrap' ),
        loading: document.getElementById( 'bkbg-ai-image-model-loading' ),
        pricing: document.getElementById( 'bkbg-ai-image-model-price' ),
        combobox: document.getElementById( 'bkbg-ai-image-model-combobox' ),
        trigger: document.getElementById( 'bkbg-ai-image-model-trigger' ),
        triggerLabel: document.getElementById( 'bkbg-ai-image-model-trigger-label' ),
        panel: document.getElementById( 'bkbg-ai-image-model-panel' ),
        search: document.getElementById( 'bkbg-ai-image-model-search' ),
        results: document.getElementById( 'bkbg-ai-image-model-results' ),
        pickerWrap: document.getElementById( 'bkbg-ai-image-model-picker-wrap' ),
        optionIdPrefix: 'bkbg-ai-image-opt-',
        endpoint: '/ai/image-models',
        formatPrice: formatImagePrice,
        loadingText: __( 'Loading image models…', 'blockenberg' ),
        unavailableText: __( 'The image model list is unavailable. You can still enter a model ID and save your settings.', 'blockenberg' )
    } );

    function syncImages() {
        var source = form.querySelector( 'input[name="image_source"]:checked' );
        var generate = source && source.value === 'openrouter';
        imagePicker.setDisabled( ! generate );
        imageWrap.classList.toggle( 'is-inactive', ! generate );
    }
    form.querySelectorAll( 'input[name="image_source"]' ).forEach( function ( input ) {
        input.addEventListener( 'change', syncImages );
    } );
    syncImages();

    form.addEventListener( 'input', function () {
        document.getElementById( 'bkbg-ai-save-status' ).textContent = __( 'You have unsaved changes.', 'blockenberg' );
    } );
    form.addEventListener( 'submit', function ( event ) {
        var invalid = [ modelInput, imageModel ].find( function ( field ) {
            return ! field.disabled && ! /^[a-z0-9][a-z0-9._:/+@-]{0,199}$/i.test( field.value.trim() );
        } );
        if ( invalid ) {
            event.preventDefault();
            if ( invalid === modelInput ) { document.getElementById( 'bkbg-ai-custom-model-wrap' ).hidden = false; }
            if ( invalid === imageModel ) { document.getElementById( 'bkbg-ai-image-custom-model-wrap' ).hidden = false; }
            invalid.setCustomValidity( __( 'Enter a valid OpenRouter model ID.', 'blockenberg' ) );
            invalid.reportValidity();
            invalid.addEventListener( 'input', function clearValidity() {
                invalid.setCustomValidity( '' );
                invalid.removeEventListener( 'input', clearValidity );
            } );
        }
    } );
} )();
