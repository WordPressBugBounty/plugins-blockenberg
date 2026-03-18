wp.domReady(function () {
    var _typoKeys = [['family','font-family'],['weight','font-weight'],['style','font-style'],['decoration','text-decoration'],['transform','text-transform']];
    var _sizeKeys = [['Desktop','d'],['Tablet','t'],['Mobile','m']];
    var _lhKeys   = [['Desktop','d'],['Tablet','t'],['Mobile','m']];
    var _lsKeys   = [['Desktop','d'],['Tablet','t'],['Mobile','m']];
    var _wsKeys   = [['Desktop','d'],['Tablet','t'],['Mobile','m']];

    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        _typoKeys.forEach(function (p) { if (obj[p[0]]) el.style.setProperty(prefix + '-' + p[1], obj[p[0]]); });
        var u = obj.sizeUnit || 'px';
        _sizeKeys.forEach(function (p) { var v = obj['size' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-font-size-' + p[1], v + u); });
        _lhKeys.forEach(function (p) { var v = obj['lineHeight' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-line-height-' + p[1], String(v)); });
        _lsKeys.forEach(function (p) { var v = obj['letterSpacing' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-letter-spacing-' + p[1], v + 'px'); });
        _wsKeys.forEach(function (p) { var v = obj['wordSpacing' + p[0]]; if (v !== undefined && v !== '') el.style.setProperty(prefix + '-word-spacing-' + p[1], v + 'px'); });
    }

    document.querySelectorAll('.bkbg-spotlight-reveal-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var spotSize    = opts.spotlightSize   || 350;
        var spotSoft    = opts.spotlightSoft   !== undefined ? opts.spotlightSoft : 80;
        var overlayHex  = opts.overlayColor    || '#000000';
        var overlayOp   = (opts.overlayOpacity !== undefined ? opts.overlayOpacity : 85) / 100;
        var revealColor = opts.revealColor     || '#7c3aed';
        var mode        = opts.triggerMode     || 'cursor';
        var bgImage     = opts.bgImageUrl      || '';

        /* Build RGBA from overlayColor */
        function hexToRgba(hex, alpha) {
            hex = hex.replace('#', '');
            if (hex.length === 3) { hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; }
            var r = parseInt(hex.substr(0,2),16);
            var g = parseInt(hex.substr(2,2),16);
            var b = parseInt(hex.substr(4,2),16);
            return 'rgba('+r+','+g+','+b+','+alpha+')';
        }

        var solidOverlay = hexToRgba(overlayHex, overlayOp);

        /* Wrapper */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sr-wrap';
        wrap.style.paddingTop    = (opts.paddingTop    || 120) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 120) + 'px';

        /* Legacy + typo CSS vars */
        wrap.style.setProperty('--bksr-hd-sz', (opts.headingSize || 48) + 'px');
        wrap.style.setProperty('--bksr-hd-w', String(opts.headingFontWeight || '700'));
        wrap.style.setProperty('--bksr-hd-lh', String(opts.headingLineHeight || 1.2));
        wrap.style.setProperty('--bksr-tx-sz', (opts.textSize || 18) + 'px');
        wrap.style.setProperty('--bksr-tx-lh', String(opts.textLineHeight || 1.6));
        wrap.style.setProperty('--bksr-ey-sz', (opts.eyebrowSize || 13) + 'px');
        typoCssVarsForEl(wrap, opts.headingTypo, '--bksr-hd');
        typoCssVarsForEl(wrap, opts.textTypo, '--bksr-tx');
        typoCssVarsForEl(wrap, opts.eyebrowTypo, '--bksr-ey');
        typoCssVarsForEl(wrap, opts.ctaTypo, '--bksr-ct');

        if (bgImage) {
            wrap.style.background = 'url(' + bgImage + ') center/cover no-repeat';
        } else {
            wrap.style.background = revealColor;
        }

        /* Overlay */
        var overlay = document.createElement('div');
        overlay.className = 'bkbg-sr-overlay';
        overlay.style.background = solidOverlay;

        /* Content */
        var inner = document.createElement('div');
        inner.className = 'bkbg-sr-inner';
        inner.style.maxWidth  = (opts.maxWidth || 800) + 'px';
        inner.style.textAlign = 'center';

        if (opts.showEyebrow && opts.eyebrow) {
            var eyeEl = document.createElement('span');
            eyeEl.className = 'bkbg-sr-eyebrow';
            eyeEl.style.color = opts.eyebrowColor || '#a78bfa';
            eyeEl.innerHTML = opts.eyebrow;
            inner.appendChild(eyeEl);
            inner.appendChild(document.createElement('br'));
        }

        var h = document.createElement('h2');
        h.className = 'bkbg-sr-heading';
        h.style.color    = opts.headingColor || '#ffffff';
        h.innerHTML = opts.heading || '';
        inner.appendChild(h);

        var p = document.createElement('p');
        p.className = 'bkbg-sr-text';
        p.style.color    = opts.subtextColor || '#e5e7eb';
        p.innerHTML = opts.subtext || '';
        inner.appendChild(p);

        if (opts.showCta && opts.ctaLabel) {
            var btn = document.createElement('a');
            btn.className = 'bkbg-sr-btn';
            btn.href  = opts.ctaUrl || '#';
            btn.style.background = opts.ctaBg    || '#7c3aed';
            btn.style.color      = opts.ctaColor || '#ffffff';
            btn.textContent = opts.ctaLabel;
            inner.appendChild(btn);
        }

        wrap.appendChild(overlay);
        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);

        /* Build spotlight gradient */
        function spotlightGradient(xPx, yPx) {
            var innerRadius = spotSize * (1 - spotSoft / 100);
            return 'radial-gradient(circle ' + spotSize + 'px at ' + xPx + 'px ' + yPx + 'px, transparent ' + innerRadius + 'px, ' + solidOverlay + ' ' + spotSize + 'px)';
        }

        if (mode === 'cursor') {
            /* Initial state: fully dark */
            overlay.style.background = solidOverlay;

            wrap.addEventListener('mousemove', function (e) {
                var rect = wrap.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                overlay.style.background = spotlightGradient(x, y);
            });

            wrap.addEventListener('mouseleave', function () {
                overlay.style.transition = 'background 0.6s ease';
                overlay.style.background = solidOverlay;
                setTimeout(function () { overlay.style.transition = ''; }, 650);
            });

            wrap.addEventListener('mouseenter', function () {
                overlay.style.transition = '';
            });
        } else {
            /* Scan mode: CSS animation sweeps spotlight across */
            var scanX = 0;
            var scanDir = 1;
            var animFrame;

            function scanStep() {
                scanX += scanDir * 1.5;
                var wrapW = wrap.offsetWidth;
                if (scanX > wrapW + spotSize) { scanDir = -1; }
                if (scanX < -spotSize)         { scanDir = 1; }
                var scanY = wrap.offsetHeight / 2;
                overlay.style.background = spotlightGradient(scanX, scanY);
                animFrame = requestAnimationFrame(scanStep);
            }
            scanStep();

            /* Pause on hover, follow cursor */
            wrap.addEventListener('mouseenter', function () {
                cancelAnimationFrame(animFrame);
            });
            wrap.addEventListener('mousemove', function (e) {
                var rect = wrap.getBoundingClientRect();
                overlay.style.background = spotlightGradient(e.clientX - rect.left, e.clientY - rect.top);
            });
            wrap.addEventListener('mouseleave', function () {
                scanStep();
            });
        }
    });
});
