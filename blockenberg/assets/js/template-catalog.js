(function () {
    'use strict';
    var root = document.getElementById('bkbg-template-catalog');
    if (!root) return;
    var timer, controller, sequence = 0;
    var dialog, frame, status, fallback, returnFocus, previewKey, previewOrigin, loadingTimer;
    var deviceWidths = { desktop: null, tablet: 768, mobile: 375 };
    var focusSelector = 'button:not([disabled]),a[href],iframe,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]';
    var liveAvailable = typeof window.fetch === 'function' && typeof window.AbortController === 'function' &&
        typeof window.FormData === 'function' && typeof window.DOMParser === 'function';
    if (liveAvailable) root.classList.add('has-live-search');

    function focusables(container) {
        return Array.from(container.querySelectorAll(focusSelector)).filter(function (node) {
            return node.tabIndex >= 0 && !node.closest('[hidden],[inert]');
        });
    }

    function previewURL(link) {
        try {
            var key = link.dataset.previewKey;
            if (!/^[a-z0-9][a-z0-9-]{0,159}$/.test(key || '')) return null;
            var url = new URL(link.href, location.href);
            if (url.username || url.password || !/^https?:$/.test(url.protocol)) return null;
            // Validate the raw href before URL normalization can hide traversal/escaping.
            var source = link.getAttribute('href');
            var publicMatch = /^https:\/\/templates\.blockenberg\.com\/template-library\/previews\/([A-Za-z0-9][A-Za-z0-9_-]{0,79})\/([a-z0-9][a-z0-9-]{0,159})\/$/.exec(source);
            if (publicMatch && publicMatch[0] === source && publicMatch[2] === key) return url;
        } catch (error) { /* A malformed URL cannot be embedded. */ }
        return null;
    }

    function setDevice(device) {
        if (!Object.prototype.hasOwnProperty.call(deviceWidths, device)) return;
        var width = deviceWidths[device];
        frame.style.width = width === null ? '100%' : width + 'px';
        frame.setAttribute('width', width === null ? '100%' : width);
        root.querySelector('[data-preview-stage]').dataset.device = device;
        var size = dialog.querySelector('[data-preview-size]');
        if (size) size.textContent = width === null ? 'Full width' : width + ' px';
        root.querySelector('[data-preview-stage]').scrollLeft = 0;
        dialog.querySelectorAll('[data-preview-device]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.previewDevice === device));
        });
    }

    function closePreview() {
        if (!dialog || !dialog.open) return;
        dialog.close();
        resetPreview();
    }

    function resetPreview() {
        clearTimeout(loadingTimer);
        frame.src = 'about:blank';
        frame.removeAttribute('aria-busy');
        document.documentElement.classList.remove('bkbg-preview-open');
        var target = returnFocus;
        if (!target || !target.isConnected) {
            target = Array.from(root.querySelectorAll('[data-bkbg-preview]')).find(function (link) {
                return link.dataset.previewKey === previewKey;
            }) || root.querySelector('#bkbg-catalog-search') || root.querySelector('.bkbg-catalog-tabs a');
        }
        returnFocus = null;
        previewOrigin = null;
        if (target) target.focus({ preventScroll: true });
    }

    function openPreview(link, url) {
        returnFocus = link;
        previewKey = link.dataset.previewKey;
        previewOrigin = url.origin;
        var title = link.dataset.previewTitle || 'Template';
        dialog.querySelector('#bkbg-preview-title').textContent = title;
        frame.title = title + ' — native Blockenberg preview';
        fallback.href = url.href;
        setDevice('desktop');
        status.textContent = 'Loading preview…';
        dialog.classList.remove('is-ready', 'is-slow');
        dialog.classList.add('is-loading');
        frame.setAttribute('aria-busy', 'true');
        dialog.showModal();
        document.documentElement.classList.add('bkbg-preview-open');
        dialog.querySelector('[data-preview-close]').focus();
        frame.src = url.href;
        clearTimeout(loadingTimer);
        loadingTimer = setTimeout(function () {
            if (dialog.open) {
                dialog.classList.add('is-slow');
                status.textContent = 'Preview is taking longer than expected. Use the open-page button above to view it directly.';
            }
        }, 15000);
    }

    function bindPreview() {
        dialog = root.querySelector('#bkbg-template-preview');
        if (!dialog) return;
        frame = dialog.querySelector('iframe');
        status = dialog.querySelector('.bkbg-preview-status');
        fallback = dialog.querySelector('[data-preview-fallback]');
        dialog.addEventListener('cancel', function (event) {
            event.preventDefault();
            closePreview();
        });
        dialog.addEventListener('close', function () {
            // A queued close event must not clear a newly reopened preview.
            if (!dialog.open && returnFocus) resetPreview();
        });
        frame.addEventListener('load', function () {
            if (!dialog.open || frame.getAttribute('src') === 'about:blank') return;
            clearTimeout(loadingTimer);
            frame.removeAttribute('aria-busy');
            dialog.classList.remove('is-loading', 'is-slow');
            dialog.classList.add('is-ready');
            status.textContent = 'Preview loaded.';
            try {
                var inner = frame.contentDocument;
                if (!inner) return;
                // Same-origin authoring previews can forward keyboard input directly.
                inner.addEventListener('keydown', function (event) {
                    if (event.defaultPrevented || !dialog.open) return;
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        closePreview();
                    } else if (event.key === 'Tab') {
                        var nodes = focusables(inner).filter(function (node) {
                            return node.getClientRects().length > 0;
                        });
                        var active = inner.activeElement;
                        if (!nodes.length || (event.shiftKey && active === nodes[0]) ||
                            (!event.shiftKey && active === nodes[nodes.length - 1])) {
                            var outer = focusables(dialog), index = outer.indexOf(frame);
                            var target = outer[(index + (event.shiftKey ? -1 : 1) + outer.length) % outer.length];
                            if (target) { event.preventDefault(); target.focus(); }
                        }
                    }
                });
            } catch (error) { /* Public previews use the validated postMessage bridge. */ }
        });
    }
    bindPreview();

    document.addEventListener('keydown', function (event) {
        if (!dialog || !dialog.open || event.defaultPrevented) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closePreview();
        } else if (event.key === 'Tab') {
            var nodes = focusables(dialog), first = nodes[0], last = nodes[nodes.length - 1];
            var active = document.activeElement;
            if (event.shiftKey && (active === first || active === dialog)) {
                event.preventDefault(); last.focus();
            } else if (!event.shiftKey && (active === last || active === dialog)) {
                event.preventDefault(); first.focus();
            }
        }
    });
    document.addEventListener('focusin', function (event) {
        if (dialog && dialog.open && !dialog.contains(event.target)) dialog.querySelector('[data-preview-close]').focus();
    });
    window.addEventListener('message', function (event) {
        if (!dialog || !dialog.open || event.source !== frame.contentWindow || event.origin !== previewOrigin) return;
        if (event.data && event.data.type === 'bkbg-template-preview:escape') closePreview();
    });

    // Match King Addons: a new search/category/collection/tag replaces the previous filter.
    function resetOtherFilters(active) {
        // Section searches combine purpose, tags, collection and access.
        if (root.classList.contains('bkbg-section-view')) return;
        var form = root.querySelector('#bkbg-catalog-filters');
        form.querySelectorAll('input[name="s"],select[name="category"],select[name="collection"],input[name="tags[]"],input[name="plan"]').forEach(function (node) {
            if (node === active) return;
            if (node.type === 'checkbox') node.checked = false;
            else if (node.type === 'radio') node.checked = active.name !== 'plan' && node.value === '';
            else node.value = '';
        });
    }

    function filtersURL() {
        var form = root.querySelector('#bkbg-catalog-filters'), url = new URL(form.action);
        new FormData(form).forEach(function (value, key) { if (value !== '') url.searchParams.append(key, value); });
        return url;
    }
    function sameFilters(first, second) {
        function values(url) {
            var tags = [];
            url.searchParams.forEach(function (value, key) {
                if (/^tags\[\d*\]$/.test(key) && value !== '') tags.push(value);
            });
            return ['view', 's', 'category', 'collection', 'plan'].map(function (key) {
                return url.searchParams.get(key) || (key === 'view' ? 'templates' : '');
            }).concat(tags.sort());
        }
        return JSON.stringify(values(first)) === JSON.stringify(values(second));
    }
    async function load(url, partial, historyMode) {
        clearTimeout(timer);
        if (controller) controller.abort();
        controller = new AbortController();
        var run = ++sequence, content = root.querySelector('.bkbg-catalog-content');
        var requestController = controller, timedOut = false;
        var requestTimer = setTimeout(function () { timedOut = true; requestController.abort(); }, 20000);
        content.setAttribute('aria-busy', 'true');
        try {
            var response = await fetch(url, { credentials: 'same-origin', signal: requestController.signal });
            if (!response.ok) throw new Error('Unable to load library');
            var doc = new DOMParser().parseFromString(await response.text(), 'text/html');
            var next = doc.querySelector('#bkbg-template-catalog');
            if (run !== sequence) return;
            var nextResults = next && next.querySelector('#bkbg-catalog-results');
            var nextForms = next && next.querySelector('#bkbg-catalog-import-forms');
            if (!nextResults || !nextForms || !next.querySelector('#bkbg-catalog-filters') ||
                !next.querySelector('.bkbg-catalog-content')) throw new Error('Library is unavailable');
            if (partial) {
                var currentResults = root.querySelector('#bkbg-catalog-results');
                var currentForms = root.querySelector('#bkbg-catalog-import-forms');
                if (!currentResults || !currentForms) throw new Error('Library is unavailable');
                var resultsHadFocus = currentResults.contains(document.activeElement);
                // Validate both fragments first: card indices and import form keys must stay paired.
                currentResults.replaceWith(nextResults);
                currentForms.replaceWith(nextForms);
                content.removeAttribute('aria-busy');
                if (resultsHadFocus && (!dialog || !dialog.open)) {
                    nextResults.setAttribute('tabindex', '-1');
                    nextResults.focus({ preventScroll: true });
                }
            } else {
                var previewWasOpen = dialog && dialog.open;
                var catalogHadFocus = root.contains(document.activeElement);
                closePreview();
                root.replaceWith(next);
                root = next;
                root.classList.add('has-live-search');
                bindPreview();
                if (previewWasOpen || catalogHadFocus) {
                    var target = Array.from(root.querySelectorAll('[data-bkbg-preview]')).find(function (link) {
                        return previewWasOpen && link.dataset.previewKey === previewKey;
                    }) || root.querySelector('#bkbg-catalog-search');
                    if (target) target.focus({ preventScroll: true });
                }
            }
            root.querySelector('.bkbg-catalog-load-error')?.remove();
            root.classList.add('has-live-search');
            if (historyMode === 'replace') history.replaceState({}, '', url);
            else if (historyMode !== false) history.pushState({}, '', url);
        } catch (error) {
            if ((error.name === 'AbortError' && !timedOut) || run !== sequence) return;
            content.removeAttribute('aria-busy');
            var msg = document.createElement('p');
            msg.className = 'bkbg-catalog-load-error';
            msg.setAttribute('role', 'alert');
            msg.textContent = timedOut ? 'Loading templates timed out. Use Search to try again.' : 'Unable to load templates. Use Search to try again.';
            root.querySelector('.bkbg-catalog-load-error')?.remove();
            content.prepend(msg);
            root.classList.remove('has-live-search');
        } finally {
            clearTimeout(requestTimer);
        }
    }
    document.addEventListener('input', function (event) {
        if (liveAvailable && root.contains(event.target) && event.target.id === 'bkbg-catalog-search') {
            clearTimeout(timer);
            if (controller) controller.abort();
            ++sequence;
            resetOtherFilters(event.target);
            timer = setTimeout(function () { load(filtersURL(), true, 'replace'); }, 250);
        }
    });
    document.addEventListener('change', function (event) {
        if (liveAvailable && root.contains(event.target) && event.target.closest('#bkbg-catalog-filters') && event.target.id !== 'bkbg-catalog-search') {
            resetOtherFilters(event.target);
            load(filtersURL(), true);
        }
    });
    var importDialog, importBusy = false, importReturnFocus;
    function showImport() {
        if (!importDialog) {
            importDialog = document.createElement('dialog');
            importDialog.className = 'bkbg-import-dialog';
            importDialog.setAttribute('aria-labelledby', 'bkbg-import-title');
            importDialog.innerHTML = '<h2 id="bkbg-import-title"><span class="bkbg-import-indicator" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle class="bkbg-import-track" cx="12" cy="12" r="9"/><circle class="bkbg-import-spin" cx="12" cy="12" r="9"/><path class="bkbg-import-check" d="m6 12 4 4 8-8"/><path class="bkbg-import-error" d="M12 7v6m0 4h.01"/></svg></span>Import template</h2><p class="bkbg-import-message" role="status" aria-live="polite"></p><progress max="100" value="0" aria-label="Template import progress"></progress><p class="bkbg-import-percent">0%</p><p class="bkbg-import-note">Keep this window open while your draft is prepared.</p><div class="bkbg-import-actions"><a class="button button-primary" hidden>Open in editor</a><button type="button" class="button" disabled>Close</button></div>';
            document.body.appendChild(importDialog);
            importDialog.addEventListener('cancel', function(event) { if (importBusy) event.preventDefault(); });
            importDialog.querySelector('button').addEventListener('click', function() { importDialog.close(); });
            importDialog.addEventListener('close', function() { if (importReturnFocus?.isConnected) importReturnFocus.focus(); });
        }
        importDialog.dataset.state = 'loading';
        importDialog.querySelector('a').hidden = true;
        importDialog.querySelector('button').disabled = true;
        importDialog.querySelector('progress').value = 0;
        importDialog.querySelector('.bkbg-import-percent').textContent = '0%';
        importDialog.querySelector('.bkbg-import-message').setAttribute('role', 'status');
        importDialog.querySelector('.bkbg-import-message').textContent = 'Starting import…';
        importDialog.querySelector('.bkbg-import-note').textContent = 'Keep this window open while your draft is prepared.';
        if (!importDialog.open) importDialog.showModal();
    }
    async function importTemplate(form, submitter) {
        if (importBusy) return;
        importBusy = true; importReturnFocus = submitter;
        if (submitter) submitter.disabled = true;
        var completed = false, failed = false;
        function message(row) {
            if (row.type === 'progress') {
                var percent = Math.max(0, Math.min(100, Number(row.percent) || 0));
                importDialog.querySelector('progress').value = percent;
                importDialog.querySelector('.bkbg-import-percent').textContent = percent + '%';
                importDialog.querySelector('.bkbg-import-message').textContent = String(row.message || 'Importing…');
            } else if (row.type === 'error') { failed = true; throw new Error(row.message || 'Import failed.'); }
            else if (row.type === 'complete') {
                var url = new URL(row.editUrl, location.href);
                if (url.origin !== location.origin || !/\/wp-admin\/post\.php$/.test(url.pathname) || url.searchParams.get('action') !== 'edit' || url.searchParams.get('post') !== String(row.postId)) throw new Error('Invalid editor link.');
                completed = true;
                importDialog.dataset.state = 'complete';
                importDialog.querySelector('progress').value = 100;
                importDialog.querySelector('.bkbg-import-percent').textContent = '100%';
                importDialog.querySelector('.bkbg-import-message').textContent = 'Your draft is ready.';
                importDialog.querySelector('.bkbg-import-note').textContent = 'Open it in the editor when you are ready. The page has not been published.';
                var link = importDialog.querySelector('a'); link.href = url.href; link.hidden = false; link.focus();
            }
        }
        try {
            showImport();
            var response = await fetch(root.dataset.importUrl, { method: 'POST', credentials: 'same-origin', body: new FormData(form), headers: { Accept: 'application/x-ndjson' } });
            if (!response.ok) throw new Error(response.status === 403 ? 'Import denied. Refresh the library and check your access.' : 'Import request failed (HTTP ' + response.status + ').');
            var pending = '';
            function consume(text, final) {
                pending += text; var lines = pending.split('\n'); pending = lines.pop();
                lines.forEach(function(line) { if (line.trim()) message(JSON.parse(line)); });
                if (final && pending.trim()) { message(JSON.parse(pending)); pending = ''; }
            }
            if (response.body?.getReader && typeof TextDecoder === 'function') {
                var reader = response.body.getReader(), decoder = new TextDecoder();
                while (true) { var chunk = await reader.read(); if (chunk.done) break; consume(decoder.decode(chunk.value, {stream:true}), false); }
                consume(decoder.decode(), true);
            } else consume(await response.text(), true);
            if (!completed) throw new Error('Import did not finish. Check Pages for a draft before retrying.');
        } catch (error) {
            importDialog.dataset.state = 'error';
            importDialog.querySelector('a').hidden = true;
            importDialog.querySelector('.bkbg-import-message').textContent = error.name === 'SyntaxError' ? 'Unexpected server response. Check Pages for a draft before retrying.' : (error.message || 'Import failed.');
            importDialog.querySelector('.bkbg-import-message').setAttribute('role', 'alert');
            importDialog.querySelector('.bkbg-import-note').textContent = failed ? 'Nothing was opened. Close this window to return to the library.' : 'Check Pages for a draft before retrying if the connection was interrupted.';
        } finally {
            importBusy = false; if (submitter?.isConnected) submitter.disabled = false;
            importDialog.querySelector('button').disabled = false;
        }
    }
    document.addEventListener('submit', function (event) {
        if (root.contains(event.target) && event.target.id.indexOf('bkbg-catalog-import-') === 0 && typeof fetch === 'function' && typeof FormData === 'function' && typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal === 'function') { event.preventDefault(); importTemplate(event.target, event.submitter); return; }
        if (liveAvailable && root.contains(event.target) && event.target.id === 'bkbg-catalog-filters') { event.preventDefault(); load(filtersURL(), true); }
    });
    document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) return;
        var close = event.target.closest('[data-preview-close]');
        if (close) { closePreview(); return; }
        var device = event.target.closest('[data-preview-device]');
        if (device) { setDevice(device.dataset.previewDevice); return; }
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
        var preview = event.target.closest('[data-bkbg-preview]');
        if (preview) {
            var url = previewURL(preview);
            if (!url) { event.preventDefault(); return; }
            // Unsupported browsers retain the safe, same-tab ordinary link.
            if (!dialog || typeof dialog.showModal !== 'function') return;
            event.preventDefault();
            openPreview(preview, url);
            return;
        }
        if (event.target === dialog && dialog.open) {
            var rect = dialog.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePreview();
            return;
        }
        var anchor = event.target.closest('.bkbg-catalog-pagination a,.bkbg-catalog-tabs a,.bkbg-catalog-reset,.bkbg-catalog-empty a,.bkbg-catalog-collection a');
        if (!anchor || !liveAvailable) return;
        event.preventDefault();
        var pagination = !!anchor.closest('.bkbg-catalog-pagination'), url = new URL(anchor.href);
        // A pending search/filter change makes old pagination links stale. Apply the current filters first.
        if (pagination && !sameFilters(filtersURL(), url)) url = filtersURL();
        load(url, pagination);
    });
    window.addEventListener('popstate', function () { if (liveAvailable) load(new URL(location.href), false, false); });
})();
