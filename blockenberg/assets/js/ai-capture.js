/** Private static section previews. Never changes the editor's viewport or saved blocks. */
(function () {
    'use strict';
    window.bkbgCaptureSection = async function (source, viewport, signal, rendered) {
        if (!source || !source.isConnected) { throw new Error('The editor canvas is unavailable. Wait for the section to render or open the editor in a supported browser.'); }
        if (!window.htmlToImage) { throw new Error('Screenshot renderer is unavailable. Reload the editor.'); }
        var width = viewport === 'mobile' ? 390 : 1280;
        var frame = document.createElement('iframe');
        frame.setAttribute('sandbox', 'allow-same-origin');
        frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
        frame.style.cssText = 'position:fixed;left:-100000px;top:0;width:' + width + 'px;height:2000px;border:0;pointer-events:none;';
        var timer, rejectStop;
        var stopped = new Promise(function (_, reject) { rejectStop = reject; });
        function abort() { rejectStop(new Error('Section capture cancelled.')); }
        function check() { if ((signal && signal.aborted) || !source.isConnected || !frame.isConnected) { throw new Error('Section changed or capture cancelled.'); } }
        if (signal) { signal.addEventListener('abort', abort, { once: true }); }
        timer = setTimeout(function () { rejectStop(new Error('Section capture timed out. Check image and font loading, then retry.')); }, 30000);
        async function capture() {
            document.body.appendChild(frame);
            var doc = frame.contentDocument, original = source.ownerDocument;
            if (!doc || !doc.head || !doc.body) { throw new Error('Capture canvas is not ready. Retry.'); }
            doc.documentElement.className = original.documentElement.className;
            doc.documentElement.style.cssText = original.documentElement.style.cssText;
            doc.body.style.cssText = original.body.style.cssText;
            doc.documentElement.lang = original.documentElement.lang;
            doc.documentElement.dir = original.documentElement.dir;
            var loads = [];
            original.querySelectorAll('style,link[rel="stylesheet"]').forEach(function (item) {
                var clone = item.cloneNode(true);
                Array.from(clone.attributes).forEach(function (attr) { if (/^on/i.test(attr.name)) { clone.removeAttribute(attr.name); } });
                if (clone.tagName === 'LINK') {
                    clone.href = item.href;
                    loads.push(new Promise(function (resolve, reject) { clone.onload = resolve; clone.onerror = function () { reject(new Error('A stylesheet could not load in the preview.')); }; }));
                }
                doc.head.appendChild(clone);
            });
            doc.body.className = original.body.className;
            var host = doc.createElement('div');
            host.className = 'editor-styles-wrapper';
            host.style.cssText = 'width:100%;max-width:none;margin:0;padding:0;';
            doc.body.appendChild(host);
            if (!rendered || !rendered.html) { throw new Error('WordPress did not render this section.'); }
            host.innerHTML = rendered.html;
            var theme = doc.createElement('style'); theme.textContent = rendered.themeCss || ''; doc.head.appendChild(theme);
            host.querySelectorAll('style').forEach(function (style) { doc.head.appendChild(style); });
            var target = host.firstElementChild;
            if (!target) { throw new Error('The rendered section is empty.'); }
            var warnings = [];
            if (target.querySelector('video,canvas,iframe')) { warnings.push('Video, canvas, embedded frames and interactive states may not be represented. Inspect them with browser tools separately.'); }
            target.querySelectorAll('script,iframe,video,canvas').forEach(function (node) { node.remove(); });
            [target].concat(Array.from(doc.body.querySelectorAll('*'))).forEach(function (node) {
                Array.from(node.attributes).forEach(function (attr) { if (/^on/i.test(attr.name) || attr.name === 'autofocus') { node.removeAttribute(attr.name); } });
                node.removeAttribute('contenteditable');
            });
            var css = doc.createElement('style');
            css.textContent = 'html,body{margin:0!important;padding:0!important;min-width:0!important;}body{width:100%!important;}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;} .block-editor-block-list__block::before,.block-editor-block-list__block::after{display:none!important;} .block-editor-block-list__block{outline:none!important;} .block-editor-block-list__layout{max-width:none!important;margin:0!important;}';
            css.textContent += '.editor-styles-wrapper{padding:0!important;margin:0!important;max-width:none!important;width:100%!important;min-height:0!important;height:auto!important;display:flow-root!important;}';
            doc.head.appendChild(css);
            await Promise.all(loads); check();
            // Two layout frames let styles/media queries settle in the isolated viewport.
            await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });
            if (doc.fonts) { await doc.fonts.ready; } check();
            await Promise.all(Array.from(target.querySelectorAll('img')).map(async function (img) {
                img.loading = 'eager';
                if (img.decode) { try { await img.decode(); } catch (e) { warnings.push('An image could not be loaded: ' + (img.alt || 'unnamed image')); } }
            }));
            check();
            var rect = target.getBoundingClientRect(), height = Math.ceil(rect.height);
            if (height < 1 || height > 6000 || rect.width < 1) { throw new Error('Section is empty or too tall to capture. Capture a smaller nested block (maximum height 6000px).'); }
            var png = await window.htmlToImage.toPng(target, { pixelRatio: 1, width: Math.ceil(rect.width), height: height, backgroundColor: '#ffffff', preferredFontFormat: 'woff2' });
            check();
            if (png.length > 4200000) { throw new Error('Section screenshot is too large. Capture a smaller nested block.'); }
            return { data: png, viewport: viewport, width: Math.ceil(rect.width), height: height, warnings: warnings, kind: 'wordpress-static-render' };
        }
        try { return await Promise.race([capture(), stopped]); }
        finally { clearTimeout(timer); if (signal) { signal.removeEventListener('abort', abort); } frame.remove(); }
    };
})();
