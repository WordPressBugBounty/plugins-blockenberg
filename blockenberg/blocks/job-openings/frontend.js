(function () {
    'use strict';

    /* ── typography CSS-var helper ──────────────────────── */
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    document.querySelectorAll('.bkbg-job-app').forEach(function (root) {
        var a;
        try { a = JSON.parse(root.dataset.opts || '{}'); } catch (e) { return; }

        var bg = a.bgColor || '#ffffff';
        var ptop = a.paddingTop !== undefined ? a.paddingTop : 80;
        var pbot = a.paddingBottom !== undefined ? a.paddingBottom : 80;
        var maxW = a.maxWidth || 1000;
        var jobs = a.jobs || [];
        var filterBy = a.filterBy || 'department';
        var isGrid = a.layout === 'grid';

        root.style.backgroundColor = bg;
        root.style.paddingTop = ptop + 'px';
        root.style.paddingBottom = pbot + 'px';

        typoCssVarsForEl(root, a.headingTypo,  '--bkbg-jo-h-');
        typoCssVarsForEl(root, a.eyebrowTypo,  '--bkbg-jo-ew-');
        typoCssVarsForEl(root, a.subtextTypo,  '--bkbg-jo-st-');
        typoCssVarsForEl(root, a.jobTitleTypo, '--bkbg-jo-jt-');
        typoCssVarsForEl(root, a.jobDescTypo,  '--bkbg-jo-jd-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-job-inner';
        inner.style.maxWidth = maxW + 'px';

        // === Header ===
        var header = document.createElement('div');
        header.style.cssText = 'text-align:center;margin-bottom:48px;';

        if (a.showEyebrow !== false && a.eyebrow) {
            var eyebrow = document.createElement('span');
            eyebrow.className = 'bkbg-job-eyebrow';
            eyebrow.style.cssText = 'display:inline-block;background:' + (a.eyebrowBg || '#f3f0ff') + ';color:' + (a.eyebrowColor || '#7c3aed') + ';padding:5px 14px;border-radius:999px;margin-bottom:16px;';
            eyebrow.textContent = a.eyebrow;
            header.appendChild(eyebrow);
        }

        var heading = document.createElement('h2');
        heading.className = 'bkbg-job-heading';
        heading.style.cssText = 'color:' + (a.headingColor || '#111827') + ';margin:0 0 16px;';
        heading.innerHTML = a.heading || '';
        header.appendChild(heading);

        if (a.showSubtext !== false && a.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-job-subtext';
            sub.style.cssText = 'color:' + (a.subtextColor || '#6b7280') + ';margin:0 auto;max-width:600px;';
            sub.innerHTML = a.subtext;
            header.appendChild(sub);
        }

        inner.appendChild(header);

        // === Filter tabs ===
        var activeFilter = 'all';
        var filterValues = [];

        if (a.showFilter !== false) {
            var filtersEl = document.createElement('div');
            filtersEl.className = 'bkbg-job-filters';

            // Gather unique values
            filterValues = Array.from(new Set(jobs.map(function (j) { return j[filterBy]; }))).filter(Boolean);

            function setFilter(val) {
                activeFilter = val;
                // Update button states
                filtersEl.querySelectorAll('.bkbg-job-filter-btn').forEach(function (btn) {
                    var isActive = btn.dataset.filter === val;
                    btn.style.background = isActive ? (a.filterActiveBg || '#7c3aed') : (a.filterBg || '#f3f4f6');
                    btn.style.color = isActive ? (a.filterActiveColor || '#ffffff') : (a.filterColor || '#374151');
                });
                // Show/hide cards
                document.querySelectorAll('[data-job-idx]').forEach(function (card) {
                    var idx = parseInt(card.dataset.jobIdx, 10);
                    var job = jobs[idx];
                    var visible = val === 'all' || job[filterBy] === val;
                    card.classList.toggle('bkbg-job-card--hidden', !visible);
                });
                // Empty state
                var anyVisible = jobs.some(function (j) {
                    return val === 'all' || j[filterBy] === val;
                });
                if (noneEl) {
                    noneEl.classList.toggle('bkbg-job-none--visible', !anyVisible);
                }
            }

            // All button
            var allBtn = document.createElement('button');
            allBtn.className = 'bkbg-job-filter-btn';
            allBtn.dataset.filter = 'all';
            allBtn.textContent = 'All';
            allBtn.style.cssText = 'background:' + (a.filterActiveBg || '#7c3aed') + ';color:' + (a.filterActiveColor || '#ffffff') + ';';
            allBtn.addEventListener('click', function () { setFilter('all'); });
            filtersEl.appendChild(allBtn);

            filterValues.forEach(function (val) {
                var btn = document.createElement('button');
                btn.className = 'bkbg-job-filter-btn';
                btn.dataset.filter = val;
                btn.textContent = val;
                btn.style.cssText = 'background:' + (a.filterBg || '#f3f4f6') + ';color:' + (a.filterColor || '#374151') + ';';
                btn.addEventListener('click', function () { setFilter(val); });
                filtersEl.appendChild(btn);
            });

            inner.appendChild(filtersEl);
        }

        // === Job listings ===
        var listings = document.createElement('div');
        listings.className = isGrid ? 'bkbg-job-grid' : 'bkbg-job-list';

        jobs.forEach(function (j, idx) {
            var card = document.createElement('div');
            card.className = 'bkbg-job-card';
            card.dataset.jobIdx = idx;
            card.style.cssText = 'background:' + (a.jobCardBg || '#f9fafb') + ';border-color:' + (a.jobCardBorder || '#e5e7eb') + ';';

            // Tags
            var tags = document.createElement('div');
            tags.className = 'bkbg-job-tags';

            var deptTag = document.createElement('span');
            deptTag.className = 'bkbg-job-tag';
            deptTag.style.cssText = 'background:' + (a.deptBg || '#f3f0ff') + ';color:' + (a.deptColor || '#7c3aed') + ';';
            deptTag.textContent = j.department;
            tags.appendChild(deptTag);

            var typeTag = document.createElement('span');
            typeTag.className = 'bkbg-job-tag';
            typeTag.style.cssText = 'background:' + (a.typeBg || '#f0fdf4') + ';color:' + (a.typeColor || '#15803d') + ';';
            typeTag.textContent = j.type;
            tags.appendChild(typeTag);

            if (j.location) {
                var loc = document.createElement('span');
                loc.className = 'bkbg-job-location';
                loc.style.color = a.locationColor || '#6b7280';
                loc.textContent = '📍 ' + j.location;
                tags.appendChild(loc);
            }

            card.appendChild(tags);

            // Title
            var titleEl = document.createElement('h3');
            titleEl.className = 'bkbg-job-title';
            titleEl.style.color = a.jobTitleColor || '#111827';
            titleEl.innerHTML = j.title;
            card.appendChild(titleEl);

            // Description
            if (a.showDescription !== false && j.description) {
                var desc = document.createElement('p');
                desc.className = 'bkbg-job-desc';
                desc.style.color = a.jobDescColor || '#6b7280';
                desc.innerHTML = j.description;
                card.appendChild(desc);
            }

            // Apply button
            var applyBtn = document.createElement('a');
            applyBtn.className = 'bkbg-job-apply';
            applyBtn.href = j.url || '#';
            applyBtn.textContent = a.applyLabel || 'Apply Now →';
            applyBtn.style.cssText = 'background:' + (a.applyBg || '#7c3aed') + ';color:' + (a.applyColor || '#ffffff') + ';';
            if (a.openInNewTab) {
                applyBtn.target = '_blank';
                applyBtn.rel = 'noopener noreferrer';
            }
            card.appendChild(applyBtn);

            listings.appendChild(card);
        });

        inner.appendChild(listings);

        // === Empty state ===
        var noneEl = null;
        if (a.showNone !== false) {
            noneEl = document.createElement('div');
            noneEl.className = 'bkbg-job-none';
            noneEl.style.color = a.subtextColor || '#6b7280';
            noneEl.textContent = a.noneText || 'No openings right now. Check back soon!';
            inner.appendChild(noneEl);
        }

        root.appendChild(inner);
    });
})();
