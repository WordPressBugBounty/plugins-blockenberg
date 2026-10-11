/**
 * Native converted-template enhancement. Enqueue once on the frontend.
 * Contract: [data-bkbg-component="family"][data-bkbg-behavior='JSON object'].
 * initialOpen is zero based (-1 closes all); comparePosition is 0..100.
 * Normalized milliseconds take precedence over source settings. Source classes
 * retain their suffixes with elementor => bkbg-tpl, king-addons => bkbg-catalog.
 * No source scripts, IDs, runtime globals or external libraries are required.
 */
(function () {
    'use strict';
    const selector = '[data-bkbg-component]';
    const ready = new WeakSet();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let serial = 0;
    const id = () => 'bkbg-component-' + (++serial);
    const parse = value => { try { const v = JSON.parse(value || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (_) { return {}; } };
    const number = (value, fallback) => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : fallback;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const bool = (v, fallback) => v == null ? fallback : v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
    const all = (root, query) => Array.from(root.querySelectorAll(query)).filter(el => el.closest(selector) === root);
    const one = (root, query) => all(root, query)[0];
    function button(el, label, activate) {
        if (!el) return;
        if (!el.matches('button,input,a[href],summary')) { el.setAttribute('role', 'button'); el.tabIndex = 0; }
        if (el.matches('button')) el.type = 'button';
        if (label && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', label);
        el.addEventListener('click', e => {
            if (e.target.closest('a[href]') && e.target.closest('a[href]') !== el) return;
            if (el.matches('a[href]') && !/^#?$/.test(el.getAttribute('href'))) return;
            e.preventDefault(); activate(e);
        });
        if (!el.matches('button,input,summary')) el.addEventListener('keydown', e => {
            if (e.target === el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(e); }
        });
    }
    function accordion(root, opts, family) {
        const container = one(root, '.bkbg-catalog-advanced-accordion');
        const buttons = all(root, '.bkbg-catalog-acc-button,.bkbg-tpl-tab-title');
        const multiple = bool(opts.accordionMultiple, family.includes('toggle') || container?.dataset.accordionType === 'toggle');
        const records = buttons.map(b => {
            const p = b.nextElementSibling;
            if (!p || !p.matches('.bkbg-catalog-acc-panel,.bkbg-tpl-tab-content')) return null;
            const king = b.classList.contains('bkbg-catalog-acc-button');
            b.id = id(); p.id = id(); b.setAttribute('aria-controls', p.id);
            p.setAttribute('role', 'region'); p.setAttribute('aria-labelledby', b.id);
            const record = { b, p, king, open: b.classList.contains(king ? 'bkbg-catalog-acc-active' : 'bkbg-tpl-active') || p.classList.contains(king ? 'bkbg-catalog-acc-panel-active' : 'bkbg-tpl-active') || b.getAttribute('aria-expanded') === 'true' };
            return record;
        }).filter(Boolean);
        function set(r, open) {
            r.open = open; r.b.setAttribute('aria-expanded', String(open)); r.p.hidden = !open;
            r.b.classList.toggle(r.king ? 'bkbg-catalog-acc-active' : 'bkbg-tpl-active', open);
            r.p.classList.toggle(r.king ? 'bkbg-catalog-acc-panel-active' : 'bkbg-tpl-active', open);
            // Legacy Elementor panels use display:none; King panels use grid rows.
            r.p.style.display = open ? (r.king ? 'grid' : 'block') : 'none';
        }
        function activate(r, force) { const next = force || !r.open; if (next && !multiple) records.forEach(other => { if (other !== r) set(other, false); }); set(r, next); }
        const explicit = number(opts.initialOpen, null);
        const sourceIndex = container ? number(container.dataset.activeIndex, 0) - 1 : (family.includes('toggle') ? -1 : 0);
        const hasActive = records.some(r => r.open);
        records.forEach((r, i) => {
            set(r, explicit !== null ? i === explicit : hasActive ? r.open : i === sourceIndex);
            button(r.b, null, () => activate(r));
            if (container?.dataset.accordionTrigger === 'hover') r.b.addEventListener('pointerenter', () => activate(r, true));
            r.b.addEventListener('keydown', e => {
                if (e.target !== r.b) return;
                let next = i;
                if (e.key === 'ArrowDown') next = (i + 1) % records.length;
                else if (e.key === 'ArrowUp') next = (i + records.length - 1) % records.length;
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = records.length - 1;
                else return;
                e.preventDefault(); records[next].b.focus();
            });
        });
        const toggle = one(root, '.bkbg-catalog-content-toggle');
        if (toggle) {
            let secondary = toggle.classList.contains('bkbg-catalog-content-toggle--secondary-active') || toggle.dataset.defaultState === 'secondary';
            const panes = all(root, '.bkbg-catalog-content-toggle__pane');
            const labels = all(root, '.bkbg-catalog-content-toggle__label');
            const sw = one(root, '.bkbg-catalog-content-toggle__switch');
            function update() {
                toggle.classList.toggle('bkbg-catalog-content-toggle--secondary-active', secondary);
                toggle.classList.toggle('bkbg-catalog-content-toggle--primary-active', !secondary);
                panes.forEach(p => { const active = p.classList.contains('bkbg-catalog-content-toggle__pane--secondary') === secondary; p.hidden = !active; p.classList.toggle('is-active', active); p.setAttribute('aria-hidden', String(!active)); });
                labels.forEach(l => { const active = (l.dataset.target === 'secondary') === secondary; l.classList.toggle('is-active', active); l.setAttribute('aria-pressed', String(active)); });
                if (sw) { sw.setAttribute('role', 'switch'); sw.setAttribute('aria-checked', String(secondary)); }
            }
            labels.forEach(l => button(l, null, () => { secondary = l.dataset.target === 'secondary'; update(); }));
            button(sw, 'Toggle content', () => { secondary = !secondary; update(); }); update();
        }
    }
    function carousel(root, input) { window.bkbgTemplateCarousel(root, input); }
    function videoURL(raw) {
        try {
            const url = new URL(raw, location.href); if (!['http:', 'https:'].includes(url.protocol)) return null;
            const host = url.hostname.toLowerCase().replace(/^www\./, '');
            let match;
            if (host === 'youtu.be' || ['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
                const key = host === 'youtu.be' ? url.pathname.split('/')[1] : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
                if (!/^[\w-]{11}$/.test(key || '')) return null;
                return { src: 'https://www.youtube-nocookie.com/embed/' + key + '?autoplay=1', iframe: true };
            }
            if (host === 'vimeo.com' || host === 'player.vimeo.com') {
                match = url.pathname.match(/\/(\d+)(?:\/|$)/); if (!match) return null;
                const hash = url.searchParams.get('h') || url.pathname.match(/\/\d+\/([\w]+)$/)?.[1];
                return { src: 'https://player.vimeo.com/video/' + match[1] + '?autoplay=1' + (hash ? '&h=' + encodeURIComponent(hash) : ''), iframe: true };
            }
            return /\.(mp4|webm|ogg)(?:$)/i.test(url.pathname) ? { src: url.href, iframe: false } : null;
        } catch (_) { return null; }
    }
    function video(root, opts) {
        const retainedMedia = all(root, '.bkbg-catalog-video-popup iframe,.bkbg-catalog-video-popup video');
        const retainedURL = retainedMedia[0]?.getAttribute('src');
        retainedMedia.forEach(el => { if (el.matches('video')) { el.pause(); el.removeAttribute('autoplay'); } el.removeAttribute('src'); });
        const triggers = all(root, '.bkbg-catalog-video-popup-button,.bkbg-tpl-custom-embed-play,.bkbg-tpl-video-play-button,[data-video-url]');
        let dialog;
        triggers.forEach(trigger => {
            const existing = one(root, '.bkbg-catalog-video-popup-video');
            const settings = parse(trigger.getAttribute('data-settings'));
            const kind = root.dataset.bkbgKind || 'video';
            const source = opts.sourceSettings || {};
            let sourceURL = source.kng_video_popup_hosted_url?.url || source.kng_video_popup_external_url?.url;
            if (!sourceURL && source.kng_video_popup_youtube_url) sourceURL = /^[\w-]{11}$/.test(source.kng_video_popup_youtube_url) ? 'https://youtu.be/' + source.kng_video_popup_youtube_url : source.kng_video_popup_youtube_url;
            if (!sourceURL && source.kng_video_popup_vimeo_url) sourceURL = /^\d+$/.test(source.kng_video_popup_vimeo_url) ? 'https://vimeo.com/' + source.kng_video_popup_vimeo_url : source.kng_video_popup_vimeo_url;
            const raw = (videoURL(opts.videoUrl) ? opts.videoUrl : sourceURL) || retainedURL || trigger.dataset.videoUrl || settings.videoUrl || existing?.getAttribute('src') || trigger.getAttribute('href');
            const media = videoURL(raw); if (!media) return;
            button(trigger, 'Play video', () => {
                if (dialog) return;
                const previous = document.activeElement;
                dialog = document.createElement('dialog'); dialog.className = 'bkbg-template-video-dialog'; dialog.setAttribute('aria-label', 'Video player');
                dialog.style.cssText = 'position:fixed;inset:0;margin:auto;padding:56px 16px 16px;border:0;border-radius:12px;background:#111;color:white;box-sizing:border-box;width:min(932px,calc(100vw - 32px));max-width:calc(100vw - 32px);max-height:calc(100dvh - 32px);z-index:2147483000;box-shadow:0 0 0 100vmax rgba(0,0,0,.75)';
                const close = document.createElement('button'); close.type = 'button'; close.className = 'bkbg-template-video-close'; close.setAttribute('aria-label', 'Close video');
                close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
                const player = document.createElement(media.iframe ? 'iframe' : 'video');
                player.style.cssText = 'display:block;width:100%;aspect-ratio:16/9;border:0';
                if (media.iframe) { player.title = 'Video'; player.allow = 'autoplay; fullscreen; picture-in-picture'; player.setAttribute('allowfullscreen', ''); player.referrerPolicy = 'strict-origin-when-cross-origin'; }
                else { player.controls = true; player.autoplay = true; player.playsInline = true; }
                player.src = media.src; dialog.append(close, player); root.append(dialog);
                function dispose() { if (!dialog) return; const own = dialog; dialog = null; own.remove(); if (previous?.isConnected) previous.focus(); }
                close.addEventListener('click', dispose); dialog.addEventListener('cancel', e => { e.preventDefault(); dispose(); });
                dialog.addEventListener('click', e => { if (e.target === dialog) { const box = dialog.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dispose(); } });
                dialog.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); dispose(); } });
                if (dialog.showModal) dialog.showModal(); else { dialog.setAttribute('open', ''); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); }
                close.focus();
            });
        });
    }
    function counters(root, opts) {
        all(root, '.bkbg-tpl-counter-number,.bkbg-catalog-smooth-counter-number,[data-to],[data-end]').forEach(el => {
            const settings = Object.assign({}, opts.sourceSettings, parse(root.getAttribute('data-settings')), parse(el.getAttribute('data-settings')), parse(el.getAttribute('kng-data-settings')));
            const target = number(opts.target, number(el.dataset.to ?? el.dataset.toValue, number(el.dataset.end, number(settings.king_addons_smooth_counter_finish, number(settings.ending_number, null)))));
            if (target === null) return;
            const duration = clamp(number(opts.duration, number(el.dataset.duration, number(settings.king_addons_smooth_counter_anim_duration, 1500))), 0, 60000);
            const start = number(opts.start, number(el.dataset.from ?? el.dataset.fromValue, 0));
            const decimals = Math.min(6, number(el.dataset.decimals, (String(target).split('.')[1] || '').length));
            const delimiter = el.dataset.delimiter || '';
            const format = value => { const parts=value.toFixed(decimals).split('.');if(delimiter) parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,delimiter);return parts.join('.'); };
            const separatePrefix = one(root, '.bkbg-tpl-counter-number-prefix,.bkbg-catalog-smooth-counter-before-text');
            const separateSuffix = one(root, '.bkbg-tpl-counter-number-suffix,.bkbg-catalog-smooth-counter-after-text');
            if (opts.prefix != null && separatePrefix) separatePrefix.textContent = String(opts.prefix);
            if (opts.suffix != null && separateSuffix) separateSuffix.textContent = String(opts.suffix);
            const digitSlots = root.dataset.bkbgKind === 'king-addons-smooth-counter';
            const measure = digitSlots ? document.createElement('canvas').getContext('2d') : null;
            let lastText;
            function sizeDigits() {
                if (!measure) return;
                const style = getComputedStyle(el);
                measure.font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
                const spacing = parseFloat(style.letterSpacing) || 0;
                el.style.setProperty('--bkbg-digit-width', (measure.measureText('8').width + spacing) + 'px');
            }
            const draw = value => {
                const text = (separatePrefix ? '' : String(opts.prefix || '')) + format(value) + (separateSuffix ? '' : String(opts.suffix || ''));
                if (text === lastText) return;
                lastText = text;
                if (!digitSlots) { el.textContent = text; return; }
                // Match Odometer's digit slots without retaining its runtime.
                el.replaceChildren(...Array.from(text, character => {
                    if (!/\d/.test(character)) return document.createTextNode(character);
                    const digit = document.createElement('span');
                    digit.className = 'bkbg-counter-digit'; digit.textContent = character;
                    return digit;
                }));
            };
            sizeDigits();
            if (digitSlots) { document.fonts?.ready.then(sizeDigits); window.addEventListener('resize', sizeDigits); }
            draw(target); // The final value remains readable until observation starts.
            function animate() {
                if (motion.matches || !duration) { draw(target); return; }
                const began = performance.now();
                function frame(now) { if (!el.isConnected) return; const progress = motion.matches ? 1 : Math.min(1, (now - began) / duration); draw(start + (target - start) * (1 - Math.pow(1 - progress, 3))); if (progress < 1) requestAnimationFrame(frame); }
                requestAnimationFrame(frame);
            }
            if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { observer.disconnect(); animate(); } }); observer.observe(el); }
            else animate();
        });
    }
    function hotspots(root) {
        all(root, '.bkbg-catalog-hotspot-item').forEach(item => {
            const tip = item.querySelector('.bkbg-catalog-hotspot-tooltip-content');
            const control = item.querySelector('.bkbg-catalog-hotspot-content') || item.firstElementChild;
            if (!tip || !control) return;
            const permanent = item.classList.contains('bkbg-catalog-hotspot-tooltip-always-show');
            let pinned = false;
            tip.id = id(); tip.setAttribute('role', 'tooltip'); control.setAttribute('aria-describedby', tip.id);
            function show(on) { const visible = permanent || on; item.classList.toggle('bkbg-catalog-hotspot-tooltip-always-show', visible); control.setAttribute('aria-expanded', String(visible)); tip.setAttribute('aria-hidden', String(!visible)); }
            button(control, 'Show hotspot details', () => { pinned = !pinned; show(pinned); });
            item.addEventListener('pointerenter', () => show(true)); item.addEventListener('pointerleave', () => show(pinned || item.contains(document.activeElement)));
            item.addEventListener('focusin', () => show(true)); item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) show(pinned); });
            item.addEventListener('keydown', e => { if (e.key === 'Escape') { pinned = false; show(false); } }); show(permanent);
        });
    }
    function masonry(root) {
        all(root, '.bkbg-catalog-image-grid').forEach(box => {
            const items = Array.from(box.children).filter(e => e.classList.contains('bkbg-catalog-image-grid-item'));
            let pending = 0;
            function layout() {
                pending = 0;
                if (!items.length || !box.clientWidth) return;
                const width = items[0].getBoundingClientRect().width;
                const columns = Math.max(1, Math.round(box.clientWidth / width));
                const heights = Array(columns).fill(0);
                box.style.position = 'relative';
                const measurements = items.map(item => item.getBoundingClientRect().height);
                items.forEach((item, i) => {
                    const col = heights.indexOf(Math.min(...heights));
                    item.style.position = 'absolute'; item.style.left = (col * width) + 'px'; item.style.top = heights[col] + 'px';
                    heights[col] += measurements[i];
                });
                box.style.height = Math.max(...heights) + 'px';
            }
            const queue = () => { if (!pending) pending = requestAnimationFrame(layout); };
            box.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', queue, { once: true }); });
            window.addEventListener('resize', queue); layout();
        });
    }
    function comparison(root, opts) {
        all(root, '.bkbg-catalog-image-comparison').forEach(box => {
            let range = box.querySelector('input[type="range"]');
            if (!range) { range = document.createElement('input'); range.type = 'range'; range.className = 'bkbg-catalog-image-comparison-slider'; box.append(range); }
            range.min = '0'; range.max = '100'; range.step = '0.1'; range.setAttribute('aria-label', 'Image comparison position');
            range.value = String(clamp(number(opts.comparePosition, number(range.getAttribute('value'), 50)), 0, 100));
            function update() { box.style.setProperty('--position', range.value + '%'); range.setAttribute('aria-valuetext', Math.round(Number(range.value)) + '% before image'); }
            range.addEventListener('input', update); update();
        });
    }
    function imageAccordion(root) {
        const items = all(root, '.bkbg-catalog-image-accordion-item');
        const initial = parse(items[0]?.querySelector('.bkbg-catalog-img-accordion-media-hover')?.getAttribute('data-settings')).activeItem || {};
        const wrap = one(root, '.bkbg-catalog-image-accordion-wrap');
        if (wrap) wrap.style.opacity = '1';
        function select(item) {
            items.forEach(other => {
                const active = item === other;
                const media = other.querySelector('.bkbg-catalog-img-accordion-media-hover');
                // The scoped source CSS supplies desktop/mobile expansion ratios.
                // An inline ratio would override the mobile breakpoint.
                other.style.removeProperty('flex-grow');
                other.classList.toggle('bkbg-catalog-image-accordion-item-active', active);
                other.classList.toggle('bkbg-catalog-image-accordion-item-grow', active);
                if (media) { media.classList.add('bkbg-catalog-animation-wrap'); media.classList.toggle('bkbg-catalog-animation-wrap-active', active); }
                if (motion.matches) other.style.transition = 'none';
            });
        }
        items.forEach(item => { if (!item.hasAttribute('tabindex') && !item.matches('a,button')) item.tabIndex = 0; item.addEventListener('focusin', () => select(item)); if (initial.interaction !== 'click') item.addEventListener('pointerenter', () => select(item)); item.addEventListener('click', () => select(item)); item.addEventListener('keydown', e => { if (e.target === item && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(item); } }); });
        const index = Math.trunc(number(initial.defaultActive, number((parse(root.dataset.bkbgBehavior).sourceSettings || {}).default_active, 0))) - 1;
        if (index >= 0 && index < items.length) select(items[index]);
    }
    const lottieInstances = new WeakMap();
    function lottieDecorations(root, opts) {
        // PHP enqueues the trusted local vendor before this file. Never fetch code.
        if (!window.lottie || typeof window.lottie.loadAnimation !== 'function') return;
        all(root, '.bkbg-catalog-lottie-animations[data-json-url]').forEach(node => {
            if (lottieInstances.has(node)) return;
            const settings = Object.assign({}, opts.sourceSettings, parse(node.dataset.settings));
            let sourceJSONPath;
            try {
                sourceJSONPath = new URL(node.dataset.jsonUrl, document.baseURI);
                if (!['http:', 'https:'].includes(sourceJSONPath.protocol)) return;
            } catch (_) { return; }
            const trigger = String(settings.trigger || 'none').toLowerCase();
            // Lottie's path retains the JSON directory for relative image assets (u/p).
            // Do not override assetsPath: doing so would discard source image folders.
            const config = {
                container: node,
                path: sourceJSONPath.href,
                renderer: ['svg', 'canvas', 'html'].includes(settings.lottie_renderer) ? settings.lottie_renderer : 'svg',
                loop: bool(settings.loop, bool(opts.loop, false)),
                autoplay: false
            };
            let animation;
            try { animation = window.lottie.loadAnimation(config); } catch (_) { return; }
            lottieInstances.set(node, animation);
            animation.setSpeed(clamp(number(settings.speed, 1), 0.01, 100));
            animation.setDirection(bool(settings.reverse, false) ? -1 : 1);
            let loaded = false, hovered = false, focused = false, clicked = false, pending = 0, disposed = false;
            const autoplay = bool(settings.autoplay, bool(opts.autoplay, false));
            const events = new AbortController();
            function dispose() {
                if (disposed) return;
                disposed = true; events.abort(); cancelAnimationFrame(pending);
                animation.destroy(); lottieInstances.delete(node);
            }
            function update() {
                pending = 0;
                if (!node.isConnected) { dispose(); return; }
                if (!loaded) return;
                if (motion.matches) { animation.goToAndStop(0, true); return; }
                if (document.hidden) { animation.pause(); return; }
                if (trigger === 'scroll' || trigger === 'viewport') {
                    const box = node.getBoundingClientRect();
                    const height = document.documentElement.clientHeight || window.innerHeight;
                    const start = clamp(number(settings.scroll_start?.size ?? settings.scroll_start, 0), 0, 100);
                    const end = clamp(number(settings.scroll_end?.size ?? settings.scroll_end, 100), 0, 100);
                    const inView = box.bottom / height * 100 > start && box.top / height * 100 < end;
                    if (trigger === 'viewport') { if (inView) animation.play(); else animation.pause(); }
                    else {
                        animation.pause();
                        if (inView) {
                            const distance = Math.max(1, document.documentElement.scrollHeight - height);
                            const progress = clamp(window.scrollY / distance, 0, 1);
                            animation.goToAndStop(progress * Math.max(0, animation.totalFrames - 1), true);
                        }
                    }
                    return;
                }
                const playing = trigger === 'hover' ? hovered || focused : trigger === 'click' ? clicked : autoplay;
                if (playing) animation.play(); else animation.pause();
            }
            function queue() { if (!pending && !disposed) pending = requestAnimationFrame(update); }
            function listen(target, name, handler, extra) { target.addEventListener(name, handler, Object.assign({ signal: events.signal }, extra)); }
            if (trigger === 'hover' || trigger === 'click') {
                if (!node.hasAttribute('tabindex') && !node.matches('a[href],button')) node.tabIndex = 0;
                if (trigger === 'hover') {
                    listen(node, 'pointerenter', () => { hovered = true; update(); });
                    listen(node, 'pointerleave', () => { hovered = false; update(); });
                    listen(node, 'focusin', () => { focused = true; update(); });
                    listen(node, 'focusout', e => { focused = node.contains(e.relatedTarget); update(); });
                } else {
                    node.setAttribute('role', 'button');
                    if (!node.hasAttribute('aria-label')) node.setAttribute('aria-label', 'Play or pause animation');
                    node.setAttribute('aria-pressed', 'false');
                    const toggle = () => { clicked = !clicked; node.setAttribute('aria-pressed', String(clicked)); update(); };
                    listen(node, 'click', e => { if (!e.target.closest('a[href]')) toggle(); });
                    listen(node, 'keydown', e => { if (e.target === node && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(); } });
                }
            }
            if (trigger === 'scroll' || trigger === 'viewport') {
                listen(window, 'scroll', queue, { passive: true }); listen(window, 'resize', queue);
            }
            listen(motion, 'change', update); listen(document, 'visibilitychange', update);
            animation.addEventListener('DOMLoaded', () => { loaded = true; update(); });
            animation.addEventListener('data_failed', dispose);
            if (animation.isLoaded) { loaded = true; update(); }
        });
    }
    function boot(scope) {
        const roots = scope.matches?.(selector) ? [scope, ...scope.querySelectorAll(selector)] : Array.from(scope.querySelectorAll(selector));
        roots.forEach(root => {
            const family = (root.dataset.bkbgComponent || '').toLowerCase().replace(/_/g, '-');
            const opts = parse(root.dataset.bkbgBehavior);
            const kind = root.dataset.bkbgKind || family;
            const source = opts.sourceSettings && typeof opts.sourceSettings === 'object' ? opts.sourceSettings : {};
            const aliases = { autoplay: ['autoplay'], delay: ['autoplay_speed', 'autoplay_delay'], loop: ['infinite', 'loop'], speed: ['speed', 'transition_speed'], carouselSlides: ['slides_to_show', 'slides_per_view'], carouselSlidesTablet: ['slides_to_show_tablet', 'slides_per_view_tablet'], carouselSlidesMobile: ['slides_to_show_mobile', 'slides_per_view_mobile'], videoUrl: ['youtube_url', 'vimeo_url', 'video_url', 'kng_video_popup_youtube_url', 'kng_video_popup_vimeo_url'], target: ['ending_number', 'king_addons_smooth_counter_finish'], start: ['starting_number', 'king_addons_smooth_counter_start'], duration: ['duration', 'king_addons_smooth_counter_anim_duration'] };
            Object.keys(aliases).forEach(key => { if (opts[key] == null) { const found = aliases[key].find(name => source[name] != null && source[name] !== ''); if (found) opts[key] = source[found]; } });
            // Also retry missing vendor initialization on an explicit refresh.
            if (bool(opts.lottie, false) || /lottie/.test(family) || one(root, '.bkbg-catalog-lottie-animations[data-json-url]')) lottieDecorations(root, opts);
            if (ready.has(root)) return;
            ready.add(root);
            if (/accordion|toggle/.test(kind) && !/image|img/.test(kind)) accordion(root, opts, kind);
            if (one(root, '.swiper-wrapper') && !/comparison/.test(kind)) carousel(root, opts);
            if (/video/.test(family)) video(root, opts);
            if(family==='timeline'){const outer=one(root,'.bkbg-catalog-timeline-outer-container');if(outer)outer.style.opacity='1';}
            if (/counter/.test(family)) counters(root, opts);
            if (/hotspot/.test(family)) hotspots(root);
            if (family === 'grid') masonry(root);
            if (/comparison|compare/.test(family)) comparison(root, opts);
            if (/(image|img)-accordion/.test(kind)) imageAccordion(root);
            if (/horizontal.*stack|stack.*horizontal/.test(family)) {
                const stack = one(root, '.bkbg-catalog-horizontal-stack,.bkbg-tpl-horizontal-stack') || root;
                stack.style.display = 'flex'; stack.style.flexWrap = 'nowrap'; stack.style.overflowX = 'auto'; stack.style.scrollSnapType = 'x proximity';
                Array.from(stack.children).forEach(child => { child.style.flexShrink = '0'; child.style.scrollSnapAlign = 'start'; });
            }
            // Flip/hover and static map iframes are intentionally source-CSS driven.
        });
    }
    // Explicit re-entry for locally inserted renderer output, without a global observer.
    document.addEventListener('bkbg:components:refresh', e => boot(e.target instanceof Element ? e.target : document));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => boot(document), { once: true });
    else boot(document);
})();
