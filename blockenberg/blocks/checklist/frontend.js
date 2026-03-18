(function () {
    'use strict';

    var EMOJI_POOL = ['✅','📌','🔖','⭐','💡','🎯','📝','🔑','🏆','💎','🌟','🔥'];

    function buildBlock(root) {
        var o;
        try { o = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }

        // CSS vars
        root.style.setProperty('--cl-accent',      o.accentColor    || '#10b981');
        root.style.setProperty('--cl-check-color', o.checkColor     || '#ffffff');
        root.style.setProperty('--cl-done-color',  o.doneTextColor  || '#9ca3af');
        root.style.setProperty('--cl-prog-bg',     o.progressBg     || '#d1fae5');
        root.style.setProperty('--cl-section-bg',  o.sectionBg      || '#f0fdf4');
        root.style.setProperty('--cl-item-bg',     o.itemBg         || '#f9fafb');
        root.style.setProperty('--cl-title-color', o.titleColor     || '#111827');
        root.style.setProperty('--cl-subtitle-color',o.subtitleColor|| '#6b7280');
        root.style.setProperty('--cl-label-color', o.labelColor     || '#374151');
        root.style.setProperty('--cl-max-width',   (o.contentMaxWidth||600) + 'px');
        var STORAGE_KEY = 'bkbg-cl-' + (root.closest('[id]') || root).id;

        // Load persisted state
        var doneSet = {};
        var extraItems = [];
        if (o.rememberState) {
            try {
                var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                doneSet    = saved.doneSet    || {};
                extraItems = saved.extraItems || [];
            } catch (e) {}
        }

        // Merge items
        var items = (o.items || []).map(function (i) {
            return Object.assign({}, i, { done: !!doneSet[i.id] });
        }).concat(extraItems.map(function (i) {
            return Object.assign({}, i, { done: !!doneSet[i.id] });
        }));

        function persist() {
            if (!o.rememberState) return;
            var ds = {};
            items.forEach(function (i) { if (i.done) ds[i.id] = true; });
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ doneSet: ds, extraItems: extraItems })); } catch (e) {}
        }

        // Build wrap
        function typoCssVarsForEl(typo, prefix, el) {
            if (!typo) return;
            if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
            if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
            if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
            if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
            if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
            var su = typo.sizeUnit || 'px';
            if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
            if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
            if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
            var lhu = typo.lineHeightUnit || '';
            if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
            if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
            if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
            var lsu = typo.letterSpacingUnit || 'px';
            if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
            if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
            var wsu = typo.wordSpacingUnit || 'px';
            if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
            if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
        }

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-cl-wrap';
        wrap.style.background = o.sectionBg || '#f0fdf4';
        typoCssVarsForEl(o.typoTitle, '--bkbg-cl-tt-', wrap);
        typoCssVarsForEl(o.typoItem, '--bkbg-cl-it-', wrap);
        root.appendChild(wrap);

        if (o.showTitle && o.title) {
            var h = document.createElement('h3');
            h.className = 'bkbg-cl-title';
            h.textContent = o.title;
            wrap.appendChild(h);
        }
        if (o.showSubtitle && o.subtitle) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-cl-subtitle';
            sub.textContent = o.subtitle;
            wrap.appendChild(sub);
        }

        // Progress
        var progRow = null, progBar = null, progPct = null;
        if (o.showProgress) {
            var progWrap = document.createElement('div');
            progRow = document.createElement('div');
            progRow.className = 'bkbg-cl-prog-row';
            var progLabel = document.createElement('span');
            progLabel.textContent = 'Progress';
            progPct = document.createElement('span');
            progPct.className = 'bkbg-cl-prog-pct';
            progRow.appendChild(progLabel);
            progRow.appendChild(progPct);
            var progTrack = document.createElement('div');
            progTrack.className = 'bkbg-cl-prog-track';
            progBar = document.createElement('div');
            progBar.className = 'bkbg-cl-prog-bar';
            progTrack.appendChild(progBar);
            progWrap.appendChild(progRow);
            progWrap.appendChild(progTrack);
            wrap.appendChild(progWrap);
        }

        // List
        var listEl = document.createElement('div');
        listEl.className = 'bkbg-cl-list';
        wrap.appendChild(listEl);

        // Congrats
        var congratsEl = document.createElement('div');
        congratsEl.className = 'bkbg-cl-congrats';
        congratsEl.style.display = 'none';
        congratsEl.textContent = '🎉 All done! Great work!';
        wrap.appendChild(congratsEl);

        // Add item row
        var addInput = null;
        if (o.showAddItem) {
            var addRow = document.createElement('div');
            addRow.className = 'bkbg-cl-add-row';
            addInput = document.createElement('input');
            addInput.type = 'text';
            addInput.className = 'bkbg-cl-add-input';
            addInput.placeholder = 'Add a new item…';
            var addBtn = document.createElement('button');
            addBtn.className = 'bkbg-cl-add-btn';
            addBtn.textContent = '+ Add';
            addBtn.addEventListener('click', function () {
                var txt = addInput.value.trim();
                if (!txt) return;
                var newItem = { id: Date.now().toString(36), text: txt, done: false, icon: EMOJI_POOL[items.length % EMOJI_POOL.length] };
                items.push(newItem);
                extraItems.push(newItem);
                addInput.value = '';
                renderList();
                persist();
            });
            addInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addBtn.click(); });
            addRow.appendChild(addInput);
            addRow.appendChild(addBtn);
            wrap.appendChild(addRow);
        }

        // ── Render ──
        function renderProgress() {
            if (!progBar) return;
            var total = items.length;
            var done  = items.filter(function (i) { return i.done; }).length;
            var pct   = total ? Math.round((done / total) * 100) : 0;
            progBar.style.width = pct + '%';
            progPct.textContent = pct + '% (' + done + '/' + total + ')';
            if (total > 0 && done === total) {
                congratsEl.style.display = 'block';
                congratsEl.style.animation = 'none';
                void congratsEl.offsetWidth;
                congratsEl.style.animation = 'cl-pop .4s ease';
            } else {
                congratsEl.style.display = 'none';
            }
        }

        function renderList() {
            listEl.innerHTML = '';
            items.forEach(function (item, idx) {
                var row = document.createElement('div');
                row.className = 'bkbg-cl-item' + (item.done ? ' is-done' : '');

                // Checkbox
                var chk = document.createElement('button');
                chk.className = 'bkbg-cl-check is-' + (o.checkStyle || 'circle') + (item.done ? ' is-checked' : '');
                chk.setAttribute('aria-label', item.done ? 'Uncheck' : 'Check');
                chk.textContent = item.done ? '✓' : '';
                chk.addEventListener('click', function () {
                    items[idx].done = !items[idx].done;
                    persist();
                    renderList();
                    renderProgress();
                });

                var icon = document.createElement('span');
                icon.className = 'bkbg-cl-icon';
                icon.textContent = item.icon || '📌';

                var txt = document.createElement('span');
                txt.className = 'bkbg-cl-text';
                txt.textContent = item.text;

                row.appendChild(chk);
                row.appendChild(icon);
                row.appendChild(txt);

                if (o.allowDelete) {
                    var del = document.createElement('button');
                    del.className = 'bkbg-cl-del';
                    del.setAttribute('aria-label', 'Delete');
                    del.textContent = '×';
                    del.addEventListener('click', function () {
                        items.splice(idx, 1);
                        // Also remove from extraItems if it was added by user
                        var ei = extraItems.findIndex(function (e) { return e.id === item.id; });
                        if (ei !== -1) extraItems.splice(ei, 1);
                        persist();
                        renderList();
                        renderProgress();
                    });
                    row.appendChild(del);
                }

                listEl.appendChild(row);
            });
        }

        renderList();
        renderProgress();
    }

    document.querySelectorAll('.bkbg-cl-app').forEach(buildBlock);
})();
