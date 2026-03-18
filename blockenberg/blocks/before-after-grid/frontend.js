(function () {
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
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function initSlider(sliderEl, o, pair) {
        var isVert = o.orientation === 'vertical';
        var pos = (o.startPosition || 50) / 100; // 0..1

        // Create structure
        var beforeDiv = document.createElement('div');
        beforeDiv.className = 'bkbg-bag-before';
        var beforeImg = document.createElement('img');
        beforeImg.src = pair.beforeUrl;
        beforeImg.alt = pair.beforeAlt || 'Before';
        beforeImg.loading = 'lazy';
        beforeDiv.appendChild(beforeImg);

        var afterDiv = document.createElement('div');
        afterDiv.className = 'bkbg-bag-after';
        var afterImg = document.createElement('img');
        afterImg.src = pair.afterUrl;
        afterImg.alt = pair.afterAlt || 'After';
        afterImg.loading = 'lazy';
        afterDiv.appendChild(afterImg);

        var lineEl = document.createElement('div');
        lineEl.className = 'bkbg-bag-line';
        lineEl.style.background = o.lineColor || '#ffffff';
        lineEl.style.width  = isVert ? '100%' : (o.lineWidth || 2) + 'px';
        lineEl.style.height = isVert ? (o.lineWidth || 2) + 'px' : '100%';

        // Handle
        var handleEl = document.createElement('div');
        handleEl.className = 'bkbg-bag-handle';
        handleEl.style.width  = (o.handleSize || 44) + 'px';
        handleEl.style.height = (o.handleSize || 44) + 'px';
        handleEl.style.background = o.handleBg || '#ffffff';
        handleEl.style.color      = o.handleColor || '#374151';
        handleEl.style.fontSize   = Math.round((o.handleSize || 44) * 0.36) + 'px';

        var handleStyle = o.handleStyle || 'circle-arrows';
        if (handleStyle === 'circle-arrows') {
            handleEl.innerHTML = isVert ? '&#8597;' : '&#8596;'; // ↕ or ↔
        } else if (handleStyle === 'double-arrow') {
            handleEl.innerHTML = isVert ? '&#10504;' : '&#10503;';
        } else if (handleStyle === 'line') {
            handleEl.style.width = isVert ? '40px' : '3px';
            handleEl.style.height = isVert ? '3px' : '40px';
            handleEl.style.borderRadius = '3px';
        }

        sliderEl.appendChild(beforeDiv);
        sliderEl.appendChild(afterDiv);
        sliderEl.appendChild(lineEl);
        sliderEl.appendChild(handleEl);

        // Labels
        if (o.showLabels) {
            var lbBefore = document.createElement('span');
            lbBefore.className = 'bkbg-bag-label bkbg-bag-label-before';
            lbBefore.textContent = pair.beforeLabel || 'Before';
            lbBefore.style.background  = o.labelBg || 'rgba(0,0,0,0.55)';
            lbBefore.style.color       = o.labelColor || '#ffffff';
            sliderEl.appendChild(lbBefore);

            var lbAfter = document.createElement('span');
            lbAfter.className = 'bkbg-bag-label bkbg-bag-label-after';
            lbAfter.textContent = pair.afterLabel || 'After';
            lbAfter.style.background   = o.labelBg || 'rgba(0,0,0,0.55)';
            lbAfter.style.color        = o.labelColor || '#ffffff';
            sliderEl.appendChild(lbAfter);
        }

        function applyPos(p) {
            var pct = Math.max(0, Math.min(100, p * 100));
            if (isVert) {
                afterDiv.style.clipPath  = 'inset(' + pct + '% 0 0 0)';
                lineEl.style.top         = pct + '%';
                lineEl.style.transform   = 'translateY(-50%)';
                handleEl.style.top       = pct + '%';
                handleEl.style.left      = '50%';
                handleEl.style.transform = 'translate(-50%, -50%)';
            } else {
                afterDiv.style.clipPath  = 'inset(0 0 0 ' + pct + '%)';
                lineEl.style.left        = pct + '%';
                lineEl.style.transform   = 'translateX(-50%)';
                handleEl.style.left      = pct + '%';
                handleEl.style.top       = '50%';
                handleEl.style.transform = 'translate(-50%, -50%)';
            }
        }

        applyPos(pos);

        function getPos(e, rect) {
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (isVert) {
                return (clientY - rect.top) / rect.height;
            }
            return (clientX - rect.left) / rect.width;
        }

        var dragging = false;

        function onStart(e) {
            e.preventDefault();
            dragging = true;
            var rect = sliderEl.getBoundingClientRect();
            pos = getPos(e, rect);
            applyPos(pos);
        }
        function onMove(e) {
            if (!dragging) return;
            e.preventDefault();
            var rect = sliderEl.getBoundingClientRect();
            pos = getPos(e, rect);
            applyPos(pos);
        }
        function onEnd() { dragging = false; }

        handleEl.addEventListener('mousedown', onStart);
        sliderEl.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        handleEl.addEventListener('touchstart', onStart, { passive: false });
        sliderEl.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    }

    function init() {
        document.querySelectorAll('.bkbg-bag-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                pairs: [],
                columns: 2,
                gap: 20,
                borderRadius: 12,
                aspect: '4/3',
                startPosition: 50,
                orientation: 'horizontal',
                showLabels: true,
                showCaptions: true,
                handleStyle: 'circle-arrows',
                handleSize: 44,
                lineWidth: 2,
                labelSize: 12,
                captionSize: 13,
                handleBg: '#ffffff',
                handleColor: '#374151',
                lineColor: '#ffffff',
                labelBg: 'rgba(0,0,0,0.55)',
                labelColor: '#ffffff',
                captionBg: '#f8fafc',
                captionColor: '#374151',
            }, opts);

            if (!o.pairs || !o.pairs.length) return;

            var aspectParts = (o.aspect || '4/3').split('/');
            var aspectRatio = parseInt(aspectParts[1], 10) / parseInt(aspectParts[0], 10) * 100;

            var outer = document.createElement('div');
            outer.className = 'bkbg-bag-outer';

            var grid = document.createElement('div');
            grid.className = 'bkbg-bag-grid';
            grid.style.gridTemplateColumns = 'repeat(' + o.columns + ', 1fr)';
            grid.style.gap = o.gap + 'px';

            o.pairs.forEach(function (pair) {
                if (!pair.beforeUrl || !pair.afterUrl) return;

                var item = document.createElement('div');
                item.className = 'bkbg-bag-item';
                item.style.borderRadius = o.borderRadius + 'px';
                item.style.overflow = 'hidden';
                item.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';

                var slider = document.createElement('div');
                slider.className = 'bkbg-bag-slider' + (o.orientation === 'vertical' ? ' orient-vertical' : '');
                slider.style.position = 'relative';
                slider.style.paddingTop = aspectRatio + '%';

                initSlider(slider, o, pair);
                item.appendChild(slider);

                if (o.showCaptions && pair.caption) {
                    var cap = document.createElement('div');
                    cap.className = 'bkbg-bag-caption';
                    cap.textContent = pair.caption;
                    cap.style.color       = o.captionColor || '#374151';
                    cap.style.background  = o.captionBg || '#f8fafc';
                    item.appendChild(cap);
                }
                grid.appendChild(item);
            });

            outer.appendChild(grid);
            typoCssVarsForEl(opts.labelTypo, '--bkbg-bag-label-', outer);
            typoCssVarsForEl(opts.captionTypo, '--bkbg-bag-caption-', outer);
            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
