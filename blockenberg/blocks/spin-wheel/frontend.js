(function () {
    'use strict';

    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        _typoKeys.forEach(function (pair) {
            var val = obj[pair[0]];
            if (val !== undefined && val !== '') el.style.setProperty(prefix + pair[1], String(val));
        });
        if (obj.sizeUnit && obj.sizeUnit !== 'px') {
            ['sizeDesktop','sizeTablet','sizeMobile'].forEach(function (k, i) {
                var v = obj[k]; if (v !== undefined && v !== '') el.style.setProperty(prefix + ['font-size-d','font-size-t','font-size-m'][i], v + obj.sizeUnit);
            });
        }
    }

    function parseItems(text) {
        return String(text || '').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    }

    // Easing: ease-out cubic
    function easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function drawWheelFrame(ctx, items, colors, textColor, centerColor, size, rotation) {
        var cx = size / 2, cy = size / 2, rad = size / 2 - 4;
        ctx.clearRect(0, 0, size, size);
        if (!items.length) return;
        var slice = (2 * Math.PI) / items.length;
        items.forEach(function(item, i) {
            var start = rotation + i * slice;
            var end   = start + slice;
            var color = colors[i % colors.length];
            // Segment
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, rad, start, end);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Label
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(start + slice / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = textColor || '#ffffff';
            ctx.font = 'bold ' + Math.min(15, Math.max(9, Math.floor(rad * 0.13))) + 'px -apple-system,sans-serif';
            var label = item.length > 14 ? item.slice(0,13) + '…' : item;
            ctx.fillText(label, rad - 12, 5);
            ctx.restore();
        });
        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.12, 0, 2 * Math.PI);
        ctx.fillStyle = centerColor || '#ffffff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function initSpinWheel(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) {}

        var cardBg      = opts.cardBg      || '#ffffff';
        var winnerBg    = opts.winnerBg    || '#6c3fb5';
        var winnerColor = opts.winnerColor || '#ffffff';
        var historyBg   = opts.historyBg   || '#f9fafb';
        var historyColor= opts.historyColor|| '#6b7280';
        var btnBg       = opts.btnBg       || '#6c3fb5';
        var btnColor    = opts.btnColor    || '#ffffff';
        var labelColor  = opts.labelColor  || '#374151';
        var titleColor  = opts.titleColor  || '#1f2937';
        var subtitleColor = opts.subtitleColor || '#6b7280';
        var sectionBg   = opts.sectionBg   || '';
        var pointerColor= opts.pointerColor|| '#1f2937';
        var textColor   = opts.textColor   || '#ffffff';
        var centerColor = opts.centerColor || '#ffffff';
        var maxWidth    = opts.maxWidth    || 520;
        var cardRadius  = opts.cardRadius  || 20;
        var btnRadius   = opts.btnRadius   || 100;
        var titleSize   = opts.titleSize   || 28;
        var winnerSize  = opts.winnerSize  || 28;
        var wheelSize   = Math.min(opts.wheelSize || 340, 340);
        var padTop      = opts.paddingTop  || 60;
        var padBot      = opts.paddingBottom || 60;
        var showTitle   = opts.showTitle   !== false;
        var showSub     = opts.showSubtitle !== false;
        var showWinner  = opts.showWinnerBox !== false;
        var showHistory = opts.showHistory !== false;
        var spinDuration= (opts.spinDuration || 4) * 1000;
        var buttonLabel = opts.buttonLabel || 'Spin!';
        var colorList   = (opts.colors || '#6c3fb5,#10b981,#f59e0b,#3b82f6,#ef4444,#8b5cf6,#06b6d4,#f97316').split(',').map(function(c){ return c.trim(); });

        var items       = parseItems(opts.defaultItems || 'Alice\nBob\nCarol\nDave\nEve\nFrank\nGrace\nHenry');
        var history     = [];
        var spinning    = false;
        var currentRotation = 0;

        // Layout
        app.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        if (sectionBg) app.style.background = sectionBg;
        app.style.paddingTop    = padTop + 'px';
        app.style.paddingBottom = padBot + 'px';

        typoCssVarsForEl(app, opts.titleTypo, '--bksw-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bksw-st-');
        typoCssVarsForEl(app, opts.winnerTypo, '--bksw-wn-');

        var card = document.createElement('div');
        card.className = 'bkbg-sw-card';
        card.style.cssText = 'background:' + cardBg + ';border-radius:' + cardRadius + 'px;padding:36px 28px;max-width:' + maxWidth + 'px;margin:0 auto;';
        app.appendChild(card);

        // Title
        if (showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-sw-title';
            titleEl.style.color = titleColor;
            titleEl.style.marginBottom = '6px';
            titleEl.textContent = opts.title;
            card.appendChild(titleEl);
        }
        if (showSub && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.className = 'bkbg-sw-subtitle';
            subEl.style.color = subtitleColor;
            subEl.style.marginBottom = '20px';
            subEl.textContent = opts.subtitle;
            card.appendChild(subEl);
        }

        // Textarea
        var taWrap = document.createElement('div');
        taWrap.style.cssText = 'margin-bottom:18px;text-align:left;';
        var taLbl = document.createElement('label');
        taLbl.className = 'bkbg-sw-items-label';
        taLbl.style.color = labelColor;
        taLbl.textContent = 'Items (' + items.length + ')';
        var textarea = document.createElement('textarea');
        textarea.className = 'bkbg-sw-textarea';
        textarea.rows = 5;
        textarea.value = opts.defaultItems || '';
        textarea.style.borderRadius = '8px';
        textarea.addEventListener('input', function() {
            items = parseItems(textarea.value);
            taLbl.textContent = 'Items (' + items.length + ')';
            currentRotation = 0;
            drawWheelFrame(ctx, items, colorList, textColor, centerColor, wheelSize, 0);
        });
        taWrap.appendChild(taLbl);
        taWrap.appendChild(textarea);
        card.appendChild(taWrap);

        // Wheel wrap
        var wheelWrap = document.createElement('div');
        wheelWrap.className = 'bkbg-sw-wheel-wrap';
        card.appendChild(wheelWrap);

        // Pointer
        var pointer = document.createElement('div');
        pointer.className = 'bkbg-sw-pointer';
        pointer.style.cssText = 'position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:22px solid ' + pointerColor + ';z-index:10;';
        wheelWrap.appendChild(pointer);

        // Canvas
        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-sw-canvas';
        canvas.width  = wheelSize;
        canvas.height = wheelSize;
        wheelWrap.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        drawWheelFrame(ctx, items, colorList, textColor, centerColor, wheelSize, 0);

        // Spin button
        var spinBtn = document.createElement('button');
        spinBtn.className = 'bkbg-sw-spin-btn';
        spinBtn.style.cssText = 'background:' + btnBg + ';color:' + btnColor + ';border-radius:' + btnRadius + 'px;';
        spinBtn.textContent = buttonLabel;
        card.appendChild(spinBtn);

        // Winner box
        var winnerBox;
        if (showWinner) {
            winnerBox = document.createElement('div');
            winnerBox.style.display = 'none';
            winnerBox.style.marginBottom = '14px';
            var wInner = document.createElement('div');
            wInner.className = 'bkbg-sw-winner-box';
            wInner.style.cssText = 'background:' + winnerBg + ';color:' + winnerColor + ';border-radius:12px;padding:16px 28px;display:inline-block;';
            var wSub = document.createElement('div');
            wSub.className = 'bkbg-sw-winner-sub';
            wSub.textContent = '🎉 Winner!';
            var wText = document.createElement('div');
            wText.className = 'bkbg-sw-winner-text';
            wInner.appendChild(wSub);
            wInner.appendChild(wText);
            winnerBox.appendChild(wInner);
            card.appendChild(winnerBox);
        }

        // History
        var histSection, histChips;
        if (showHistory) {
            histSection = document.createElement('div');
            histSection.className = 'bkbg-sw-history';
            histSection.style.cssText = 'display:none;background:' + historyBg + ';';
            var histLbl = document.createElement('div');
            histLbl.className = 'bkbg-sw-history-label';
            histLbl.style.color = labelColor;
            histLbl.textContent = 'Spin History';
            histChips = document.createElement('div');
            histChips.className = 'bkbg-sw-history-chips';
            histSection.appendChild(histLbl);
            histSection.appendChild(histChips);
            card.appendChild(histSection);
        }

        function spin() {
            if (spinning || items.length === 0) return;
            spinning = true;
            spinBtn.disabled = true;
            if (winnerBox) winnerBox.style.display = 'none';

            // Choose winner index, calculate target rotation
            var winnerIdx = Math.floor(Math.random() * items.length);
            var slice = (2 * Math.PI) / items.length;
            // We want winnerIdx to land at top (which is -Math.PI/2 after rotation)
            // Pointer at top = rotation offset where winnerIdx center aligns at top
            // Target angle for item i center = i * slice + slice/2
            // We want that angle + rotation = -PI/2  →  rotation = -PI/2 - (i*slice + slice/2)
            var targetNormalized = -Math.PI / 2 - (winnerIdx * slice + slice / 2);
            // Add extra full spins for drama
            var extraSpins = 5 + Math.floor(Math.random() * 3);
            var endRotation = targetNormalized + extraSpins * 2 * Math.PI;
            // Normalize to start
            var startRotation = currentRotation;
            var startTime = null;

            function frame(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / spinDuration, 1);
                var eased = easeOut(progress);
                var rotation = startRotation + (endRotation - startRotation) * eased;
                currentRotation = rotation;
                drawWheelFrame(ctx, items, colorList, textColor, centerColor, wheelSize, rotation);
                if (progress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    spinning = false;
                    spinBtn.disabled = false;
                    // Show winner
                    var winner = items[winnerIdx];
                    if (showWinner && winnerBox) {
                        winnerBox.style.display = 'block';
                        wText.textContent = winner;
                        // Re-trigger animation
                        wInner.style.animation = 'none';
                        void wInner.offsetWidth;
                        wInner.style.animation = 'bkbg-sw-pop .35s ease';
                    }
                    if (showHistory) {
                        history.unshift(winner);
                        if (history.length > 10) history.pop();
                        histChips.innerHTML = '';
                        history.forEach(function(h) {
                            var chip = document.createElement('span');
                            chip.className = 'bkbg-sw-history-chip';
                            chip.style.color = historyColor;
                            chip.textContent = h;
                            histChips.appendChild(chip);
                        });
                        histSection.style.display = 'block';
                    }
                }
            }
            requestAnimationFrame(frame);
        }

        spinBtn.addEventListener('click', spin);
    }

    document.querySelectorAll('.bkbg-sw-app').forEach(initSpinWheel);
})();
