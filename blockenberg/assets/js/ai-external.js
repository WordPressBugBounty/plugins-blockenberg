/** Temporary external sessions: the open editor is the only command executor. */
(function (wp) {
    'use strict';
    if (!wp || !wp.element) { return; }
    var el = wp.element.createElement, useState = wp.element.useState, useRef = wp.element.useRef, useEffect = wp.element.useEffect;
    var __ = wp.i18n.__;
    var cfg = window.bkbgAI || {};
    var CLIENTS = [
        { id: 'codex', label: __( 'Codex', 'blockenberg' ) },
        { id: 'claude', label: __( 'Claude Code', 'blockenberg' ) },
        { id: 'cursor', label: __( 'Cursor', 'blockenberg' ) }
    ];
    function clientLabel(id) {
        for (var i = 0; i < CLIENTS.length; i++) {
            if (CLIENTS[i].id === id) { return CLIENTS[i].label; }
        }
        return CLIENTS[0].label;
    }
    function promptFor(session, client) {
        if (!session) { return ''; }
        if (session.prompts && session.prompts[client]) { return session.prompts[client]; }
        return session.prompt || '';
    }
    function request(path, body, session, keepalive) {
        return window.fetch(cfg.restBase + '/ai/external' + path, {
            method: 'POST', credentials: 'same-origin', keepalive: !!keepalive,
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': cfg.nonce, 'X-Blockenberg-Editor': session ? session.editor_token : '' },
            body: JSON.stringify(body || {})
        }).then(function (r) { return r.json().then(function (json) {
            if (!r.ok) { var error = new Error(json.message || 'Connection failed'); error.status = r.status; throw error; }
            return json;
        }); });
    }
    function Duration(props) {
        var tick = useState(0), setTick = tick[1];
        useEffect(function () {
            if (!props.startedAt || props.finishedAt) { return; }
            var timer, disposed = false;
            function update() {
                if (disposed) { return; }
                setTick(function (value) { return value + 1; });
                timer = setTimeout(update, 1000);
            }
            timer = setTimeout(update, 1000);
            return function () { disposed = true; clearTimeout(timer); };
        }, [props.startedAt, props.finishedAt]);
        if (!props.startedAt) { return null; }
        var seconds = Math.max(0, Math.floor(((props.finishedAt || Date.now()) - props.startedAt) / 1000));
        var hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds % 3600 / 60);
        var value = (hours ? hours + 'h ' : '') + (hours || minutes ? minutes + 'm ' : '') + seconds % 60 + 's';
        return el('div', { className: 'bkbg-ai-duration', 'aria-live': 'off' },
            (props.finishedAt ? __('Worked for %s', 'blockenberg') : __('Working for %s', 'blockenberg')).replace('%s', value));
    }
    window.bkbgDuration = Duration;
    function phaseLabels() {
        return {
            planning: __( 'Planning', 'blockenberg' ),
            building: __( 'Building the page', 'blockenberg' ),
            generating_image: __( 'Generating an image', 'blockenberg' ),
            reviewing: __( 'Checking the result', 'blockenberg' ),
            waiting: __( 'Waiting for an update', 'blockenberg' ),
            done: __( 'Finished', 'blockenberg' ),
            error: __( 'Needs attention', 'blockenberg' )
        };
    }
    function completedPlan( plan ) {
        return ( plan || [] ).map( function ( step ) {
            return Object.assign( {}, step, { status: 'done' } );
        } );
    }
    function renderExternalWork( live, options ) {
        if ( ! live ) { return null; }
        options = options || {};
        var finished = !!( options.complete || live.phase === 'done' );
        var plan = finished ? completedPlan( live.plan ) : ( live.plan || [] );
        return el( 'div', { className: 'bkbg-ai-external-work' },
            live.error ? el( 'p', { role: 'alert', className: 'bkbg-ai-activity__error' }, live.error ) : null,
            live.stale && live.phase !== 'done' && ! live.current ? el( 'p', { className: 'bkbg-ai-muted' }, __( 'No recent update. The agent may still be working; check its chat.', 'blockenberg' ) ) : null,
            plan.length ? el( 'ol', { className: 'bkbg-ai-external-plan' }, plan.map( function ( step ) {
                return el( 'li', { key: step.id, className: 'is-' + step.status, 'aria-current': step.status === 'active' ? 'step' : undefined },
                    el( 'span', { 'aria-hidden': true }, step.status === 'done' ? '✓' : step.status === 'active' ? '◉' : '○' ), step.label,
                    el( 'span', { className: 'screen-reader-text' }, ' — ' + ( { pending: __( 'Pending', 'blockenberg' ), active: __( 'In progress', 'blockenberg' ), done: __( 'Completed', 'blockenberg' ) } )[ step.status ] ) );
            } ) ) : null,
            options.renderActivity ? options.renderActivity( live.log, !! live.moving ) : null,
            live.captures && live.captures.length ? el( 'div', { className: 'bkbg-ai-section-previews', 'aria-label': __( 'Section screenshots for visual review', 'blockenberg' ) }, live.captures.map( function ( shot ) {
                return el( 'figure', { key: shot.id }, el( 'img', { src: shot.data, alt: __( 'Section preview', 'blockenberg' ) + ' · ' + shot.viewport } ), el( 'figcaption', null, shot.viewport === 'mobile' ? __( 'Mobile', 'blockenberg' ) : __( 'Desktop', 'blockenberg' ) ) );
            } ) ) : null,
            live.visualReview ? el( 'p', { className: 'bkbg-ai-muted' }, ( live.visualReview.decision === 'passed' ? __( 'Visual review passed', 'blockenberg' ) : __( 'Visual corrections needed', 'blockenberg' ) ) + ': ' + live.visualReview.notes ) : null,
            live.images && live.images.length ? el( 'div', { className: 'bkbg-ai-external-images', 'aria-label': __( 'Generated images in the Media Library', 'blockenberg' ) }, live.images.map( function ( img ) {
                return el( 'a', { key: img.id, href: img.url, target: '_blank', rel: 'noopener noreferrer', title: img.alt || __( 'Generated image', 'blockenberg' ) }, el( 'img', { src: img.url, alt: img.alt || __( 'Generated image', 'blockenberg' ), loading: 'lazy' } ) );
            } ) ) : null,
            live.counts && ( live.counts.actions || live.counts.images || live.counts.sections ) ? el( 'div', { className: 'bkbg-ai-external-progress__counts' },
                live.counts.actions + ' ' + ( live.counts.actions === 1 ? __( 'action', 'blockenberg' ) : __( 'actions', 'blockenberg' ) ),
                live.counts.sections ? ' · ' + live.counts.sections + ' ' + ( live.counts.sections === 1 ? __( 'section', 'blockenberg' ) : __( 'sections', 'blockenberg' ) ) : '',
                ' · ',
                live.counts.images + ' ' + ( live.counts.images === 1 ? __( 'image', 'blockenberg' ) : __( 'images', 'blockenberg' ) )
            ) : null
        );
    }
    window.bkbgRenderExternalWork = renderExternalWork;
    function Panel(props) {
        var state = useState(null), session = state[0], setSession = state[1];
        var statusState = useState(''), status = statusState[0], setStatus = statusState[1];
        var errorState = useState(''), error = errorState[0], setError = errorState[1];
        var busyState = useState(false), busy = busyState[0], setBusy = busyState[1];
        var logState = useState([]), log = logState[0], setLog = logState[1];
        var logRef = useRef(log); logRef.current = log;
        var progressState = useState(null), progress = progressState[0], setProgress = progressState[1];
        var currentState = useState(''), current = currentState[0], setCurrent = currentState[1];
        var copyState = useState(''), copyStatus = copyState[0], setCopyStatus = copyState[1];
        var promptField = useRef(null), pendingMessage = useRef(null);
        var captureState = useState([]), captures = captureState[0], setCaptures = captureState[1];
        var runState = useState(null), run = runState[0], setRun = runState[1];
        var clientState = useState('codex'), promptClient = clientState[0], setPromptClient = clientState[1];
        var active = useRef(null), mounted = useRef(true), callbacks = useRef(props);
        var progressRef = useRef(null), capturesRef = useRef([]);
        var disconnectRef = useRef(function () {});
        var liveKeyRef = useRef( '' );
        callbacks.current = props;
        progressRef.current = progress;
        capturesRef.current = captures;
        function finishRun(owner, clock, message, options) {
            if (!clock || owner.reportedRun === clock.id) { return; }
            owner.reportedRun = clock.id;
            if (!callbacks.current.onCompleted) { return; }
            var report = ( options && options.report ) || progressRef.current || {};
            var update = report.progress || {};
            callbacks.current.onCompleted({
                text: message,
                activity: logRef.current,
                meta: { startedAt: clock.startedAt, finishedAt: clock.finishedAt || Date.now() },
                runId: clock.id,
                agent: report.agent || '',
                plan: options && options.complete ? completedPlan( update.plan ) : ( update.plan || [] ),
                images: report.images || [],
                visualReview: report.visual_review || null,
                counts: report.counts || { actions: 0, images: 0 }
            });
        }
        function sendMessage(text) {
            var owner = active.current;
            if (!owner || !owner.session) { return Promise.reject(new Error(__('Connect an agent first.', 'blockenberg'))); }
            if (!pendingMessage.current || pendingMessage.current.text !== text) { pendingMessage.current = {id:'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,12),text:text}; }
            var message = pendingMessage.current;
            return request('/' + owner.session.id + '/outbox', message, owner.session).then(function (saved) {
                if (active.current !== owner) { throw new Error('Connection changed. Check the saved conversation before resending.'); }
                if (callbacks.current.onMessages) { callbacks.current.onMessages([saved]); }
                pendingMessage.current = null;
            });
        }
        function disconnect(message) {
            var old = active.current;
            active.current = null;
            if (old) {
                finishRun(old, old.run, __('External agent stopped.', 'blockenberg'));
                if (mounted.current && old.run) { setRun(Object.assign({}, old.run, { finishedAt: old.run.finishedAt || Date.now() })); }
                old.controller.abort();
                clearTimeout(old.timer);
                if (old.session) { request('/' + old.session.id + '/revoke', {}, old.session, true).catch(function () {}); }
            }
            if (mounted.current) {
                setSession(null); setBusy(false); setCurrent(''); setCopyStatus(''); setStatus(message || __('Disconnected', 'blockenberg'));
                callbacks.current.onActive(false);
                if (callbacks.current.onProgress) { callbacks.current.onProgress(null); }
                liveKeyRef.current = '';
            }
        }
        disconnectRef.current = disconnect;
        useEffect(function () {
            mounted.current = true;
            if (callbacks.current.onSender) { callbacks.current.onSender(sendMessage); }
            if (callbacks.current.onControls) { callbacks.current.onControls({ disconnect: function () { disconnectRef.current(); } }); }
            var leave = function () { disconnectRef.current(); };
            window.addEventListener('pagehide', leave);
            return function () {
                mounted.current = false;
                disconnectRef.current();
                if (callbacks.current.onSender) { callbacks.current.onSender(null); }
                if (callbacks.current.onControls) { callbacks.current.onControls(null); }
                window.removeEventListener('pagehide', leave);
            };
        }, []);
        function start() {
            if (active.current || busy || props.disabled) { return; }
            setError(''); setBusy(true); setLog([]); setProgress(null); setCurrent(''); setCopyStatus(''); setRun(null); setCaptures([]); setPromptClient('codex'); callbacks.current.onActive(true);
            var scope = { mode: props.scope.mode, rootIds: props.scope.rootIds.slice() };
            var owner = { controller: new window.AbortController(), session: null, timer: null, scope: scope, post: wp.data.select('core/editor').getCurrentPostId(), ack: null, seen: Object.create(null) };
            active.current = owner;
            var manifest;
            try { manifest = callbacks.current.manifest(scope); }
            catch (e) { active.current = null; setBusy(false); callbacks.current.onActive(false); setError(e.message); return; }
            request('', manifest).then(function (value) {
                owner.session = value;
                if (active.current !== owner || !mounted.current) { request('/' + value.id + '/revoke', {}, value, true).catch(function () {}); return; }
                setSession(value); setBusy(false); setStatus(__('Waiting for an agent…', 'blockenberg'));
                poll(owner);
            }).catch(function (e) {
                if (active.current !== owner || !mounted.current) { return; }
                active.current = null; setBusy(false); callbacks.current.onActive(false); setError(e.message);
            });
        }
        async function captureSection(owner, commandId, clientId, viewport) {
            setCurrent(__('Capturing section preview', 'blockenberg') + ' · ' + viewport);
            var shot = await callbacks.current.capture({ clientId: clientId, viewport: viewport }, { scope: owner.scope, signal: owner.controller.signal, render: function (content) { return request('/' + owner.session.id + '/render-section', {content:content}, owner.session); } });
            if (active.current !== owner) { throw new Error('Disconnected during capture.'); }
            var id = commandId + '-' + viewport;
            var result = await request('/' + owner.session.id + '/captures/' + id, Object.assign({}, shot, { clientId: clientId }), owner.session);
            if (active.current !== owner) { throw new Error('Disconnected during capture.'); }
            setCaptures(function (previous) { return previous.filter(function (item) { return item.viewport !== viewport; }).concat([{ id: id, viewport: viewport, data: shot.data }]); });
            return result;
        }
        function poll(owner) {
            if (active.current !== owner || owner.controller.signal.aborted) { return; }
            if (Date.now() >= owner.session.expires * 1000) { disconnect(__('Session expired. Create a new connection.', 'blockenberg')); return; }
            var ack = owner.ack;
            request('/' + owner.session.id + '/poll', { ack: ack }, owner.session).then(function (response) {
                if (active.current !== owner || owner.controller.signal.aborted) { return; }
                if (ack === owner.ack) {
                    if (ack) { owner.seen[ack.id] = { id: ack.id, result: { error: 'Already executed and acknowledged. Read the current page before planning a new change.' } }; }
                    owner.ack = null;
                }
                setError('');
                setProgress(response);
                if (response.messages && callbacks.current.onMessages) { callbacks.current.onMessages(response.messages); }
                if (response.run) {
                    var reported = response.run;
                    // Translate the server clock once per task; local ticks then remain smooth.
                    if (!owner.run || owner.run.id !== reported.id) {
                        owner.clockOffset = Date.now() - response.server_time * 1000;
                        owner.run = { id: reported.id, startedAt: reported.started_at * 1000 + owner.clockOffset };
                    }
                    if (reported.finished_at) { owner.run.finishedAt = reported.finished_at * 1000 + owner.clockOffset; }
                    setRun(Object.assign({}, owner.run));
                    if (owner.run.finishedAt) { finishRun(owner, owner.run, response.progress && response.progress.message || __('External agent finished.', 'blockenberg'), { complete: true, report: response }); }
                }
                setStatus(response.agent ? response.agent + ' · ' + __('Connected', 'blockenberg') : __('Waiting for an agent…', 'blockenberg'));
                if (response.agent) { setSession(function (previous) { return previous && previous.prompt ? Object.assign({}, previous, { prompt: '' }) : previous; }); }
                var command = response.command;
                if (!command) { return; }
                if (owner.seen[command.id]) { owner.ack = owner.seen[command.id]; return; }
                var label = callbacks.current.describe(command.tool, command.args);
                setCurrent(label);
                setLog(function (previous) { return previous.concat([{ key: command.id, text: label, state: 'run' }]).slice(-100); });
                return Promise.resolve().then(function () {
                    if (active.current !== owner || owner.controller.signal.aborted) { return { error: 'Disconnected before execution.' }; }
                    if (wp.data.select('core/editor').getCurrentPostId() !== owner.post) { return { error: 'The editor is no longer on the connected page.' }; }
                    var args = Object.assign({}, command.args);
                    if (command.tool === 'create_image') { args.source = 'search'; }
                    if (command.tool === 'capture_section') { return captureSection(owner, command.id, args.clientId, args.viewport); }
                    return callbacks.current.execute(command.tool, args, { signal: owner.controller.signal, scope: owner.scope });
                }).then(async function (result) {
                    if (command.tool === 'build_section' && result && !result.error && result.focus && callbacks.current.capture) {
                        result.captures = [];
                        for (var viewport of ['desktop', 'mobile']) {
                            if (active.current !== owner) { break; }
                            try { result.captures.push(await captureSection(owner, command.id, result.focus, viewport)); }
                            catch (error) { result.warnings = (result.warnings || []).concat(['Visual capture (' + viewport + ') failed: ' + error.message + '. Retry capture_section; do not claim the layout was visually checked.']); }
                        }
                        result.visual_review_required = true;
                    }
                    return result;
                }).catch(function (e) { return { error: e.message || String(e) }; }).then(function (result) {
                    if (active.current !== owner) { return; }
                    if (JSON.stringify(result).length > 500000) { result = { error: 'Result is too large. Request a shallower structure or individual block details.' }; }
                    setCurrent('');
                    owner.ack = { id: command.id, result: result };
                    owner.seen[command.id] = owner.ack;
                    setLog(function (previous) { return previous.map(function (item) {
                        return item.key === command.id ? Object.assign({}, item, { state: result.error ? 'error' : 'done', error: result.error, warn: result.warnings && result.warnings[0] }) : item;
                    }); });
                });
            }).catch(function (e) {
                if (active.current !== owner) { return; }
                if (e.status === 403 || e.status === 410) { disconnect(e.message); return; }
                setError(__('Connection interrupted; retrying. Commands are not replayed.', 'blockenberg'));
            }).then(function () {
                if (active.current === owner) { owner.timer = setTimeout(function () { poll(owner); }, owner.ack ? 50 : 1500); }
            });
        }
        function copy() {
            if (!session || !promptFor(session, promptClient)) { return; }
            var owner = active.current, field = promptField.current;
            var text = field ? field.value : promptFor(session, promptClient);
            setCopyStatus('');
            function report(value) {
                if (mounted.current && active.current === owner) { setCopyStatus(value); }
            }
            function fallback() {
                if (!mounted.current || active.current !== owner) { return; }
                var copied = false;
                try {
                    if (field && field.isConnected) {
                        var doc = field.ownerDocument, previousFocus = doc.activeElement;
                        field.focus(); field.select(); field.setSelectionRange(0, text.length);
                        // Clipboard API is unavailable on local HTTP sites. Keep this
                        // synchronous with the click so the browser permits copying.
                        copied = !!doc.execCommand('copy');
                        if (copied && previousFocus && previousFocus.focus) { previousFocus.focus(); }
                    }
                } catch (e) { /* Leave the prompt selected for manual copying. */ }
                report(copied ? 'copied' : 'error');
            }
            try {
                if (window.navigator.clipboard && typeof window.navigator.clipboard.writeText === 'function') {
                    Promise.resolve(window.navigator.clipboard.writeText(text)).then(function () { report('copied'); }, fallback);
                    return;
                }
            } catch (e) { /* A denied Clipboard API can still allow the selection fallback. */ }
            fallback();
        }
        var update = progress && progress.progress;
        var phase = update ? update.phase : 'waiting';
        var stale = !!(progress && progress.agent_seen && progress.server_time - progress.agent_seen > 90);
        var moving = !!current || (!!update && !stale && !error && ['planning', 'building', 'generating_image', 'reviewing'].indexOf(phase) !== -1);
        var labels = phaseLabels();
        var paired = !!(progress && progress.agent);
        var needsPrompt = !!(session && !paired && promptFor(session, promptClient));
        var live = {
            session: !!session,
            paired: paired,
            agent: (progress && progress.agent) || '',
            phase: phase,
            phaseLabel: current ? labels.building : (labels[phase] || labels.waiting),
            moving: moving,
            stale: stale,
            error: error,
            current: current,
            message: current || (update && update.message) || '',
            plan: (update && update.plan) || [],
            log: log,
            run: run,
            counts: (progress && progress.counts) || { actions: 0, images: 0 },
            captures: captures,
            images: (progress && progress.images) || [],
            visualReview: (progress && progress.visual_review) || null
        };
        var last = live.log && live.log.length ? live.log[ live.log.length - 1 ] : null;
        var key = session || busy ? [
            session && session.id, paired, live.agent, live.phase, live.moving, live.stale, live.error,
            live.current, live.message, ( live.log || [] ).length, last && last.key, last && last.state,
            live.run && live.run.id, live.run && live.run.finishedAt,
            live.counts && live.counts.actions, live.counts && live.counts.images, live.counts && live.counts.sections,
            ( live.plan || [] ).map( function ( step ) { return step.id + ':' + step.status; } ).join( ',' ),
            live.captures && live.captures.length, live.images && live.images.length
        ].join( '\x1e' ) : '';
        if ( key !== liveKeyRef.current ) {
            liveKeyRef.current = key;
            if ( callbacks.current.onProgress ) { callbacks.current.onProgress( session || busy ? live : null ); }
        }
        return el('div', { className: 'bkbg-ai-external-wrap' + (paired ? ' is-paired' : '') },
          paired ? null : el('details', { className: 'bkbg-ai-external' + (session ? ' is-ready' : ''), open: needsPrompt ? true : undefined },
            el('summary', null, session ? (needsPrompt ? __('Copy pairing prompt', 'blockenberg') : __('Connection', 'blockenberg')) : [el('span', { className: 'bkbg-ai-external-lead' }, __('Connect', 'blockenberg')), ' ', __('Codex, Claude or Cursor', 'blockenberg')], session ? el('span', { className: 'bkbg-ai-external-dot', 'aria-label': __('Session active', 'blockenberg') }) : null),
            el('div', { className: 'bkbg-ai-external-body' },
                el('p', null, session
                    ? __('Paste into your local Codex, Claude Code, or Cursor chat. The session lasts one hour.', 'blockenberg')
                    : __('Use a local Codex, Claude Code, or Cursor session. No OpenRouter key is needed.', 'blockenberg')),
                status && ! session ? el('p', { role: 'status' }, status) : null,
                error && ! session ? el('p', { role: 'alert', className: 'bkbg-ai-activity__error' }, error) : null,
                needsPrompt ? el.apply(null, ['div', { className: 'bkbg-ai-external-clients', role: 'group', 'aria-label': __('Agent prompt', 'blockenberg') }].concat(CLIENTS.map(function (client) {
                    return el(wp.components.Button, {
                        key: client.id,
                        className: 'bkbg-ai-external-client',
                        variant: promptClient === client.id ? 'primary' : 'secondary',
                        'aria-pressed': promptClient === client.id,
                        onClick: function () { setPromptClient(client.id); setCopyStatus(''); }
                    }, client.label);
                }))) : null,
                needsPrompt ? el('textarea', { ref: promptField, className: 'bkbg-ai-external-prompt', readOnly: true, rows: 3, value: promptFor(session, promptClient), 'aria-label': __('Connection prompt', 'blockenberg'), onFocus: function (e) { e.target.select(); } }) : null,
                needsPrompt && copyStatus ? el('p', { role: copyStatus === 'error' ? 'alert' : 'status', className: copyStatus === 'error' ? 'bkbg-ai-activity__error' : 'bkbg-ai-muted' }, copyStatus === 'error' ? __('Automatic copying is blocked. Select the prompt and press ⌘C on Mac or Ctrl+C on Windows/Linux.', 'blockenberg') : __('Copied. Paste into %s.', 'blockenberg').replace('%s', clientLabel(promptClient))) : null,
                el('div', { className: 'bkbg-ai-external-buttons' },
                    !session ? el(wp.components.Button, { variant: 'secondary', disabled: busy || props.disabled, onClick: start }, busy ? __('Connecting…', 'blockenberg') : __('Create connection', 'blockenberg')) : null,
                    needsPrompt ? el(wp.components.Button, { variant: 'primary', onClick: copy }, copyStatus === 'copied' ? __('Copied!', 'blockenberg') : __('Copy prompt', 'blockenberg')) : null,
                    session ? el(wp.components.Button, { variant: 'tertiary', onClick: function () { disconnect(); } }, __('Cancel', 'blockenberg')) : null
                )
            )
          ),
          paired ? el('div', { className: 'bkbg-ai-external-buttons bkbg-ai-external-buttons--session' },
            el(wp.components.Button, { className: 'bkbg-ai-external-disconnect', variant: 'tertiary', isDestructive: true, onClick: function () { disconnect(); } }, __('Disconnect', 'blockenberg'))
          ) : null
        );
    }
    window.bkbgExternalPanel = Panel;
})(window.wp);
