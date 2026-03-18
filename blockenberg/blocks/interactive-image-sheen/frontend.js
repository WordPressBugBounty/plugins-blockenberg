(function () {
    'use strict';

    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    document.querySelectorAll('.bkbg-iis-app').forEach(function (app) {
        var o;
        try { o = JSON.parse(app.dataset.opts || '{}'); } catch (e) { return; }

        var imageUrl     = o.imageUrl    || '';
        var imageAlt     = o.imageAlt    || '';
        var imageWidth   = o.imageWidth  || 480;
        var imageHeight  = o.imageHeight || 320;
        var imageRadius  = o.imageRadius || 20;
        var sheenColor   = o.sheenColor  || 'rgba(255,255,255,0.35)';
        var sheenSize    = o.sheenSize   || 60;
        var sheenBlur    = o.sheenBlur   || 40;
        var tiltStrength = o.tiltStrength || 12;
        var tiltShadow   = !!o.tiltShadow;
        var shadowColor  = o.shadowColor || 'rgba(99,102,241,0.4)';
        var showCaption  = !!o.showCaption;
        var caption      = o.caption     || '';
        var captionSize  = o.captionSize || 14;
        var captionColor = o.captionColor || '#64748b';
        var align2       = o.align2      || 'center';
        var bgColor      = o.bgColor     || '';

        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

        if (bgColor) app.style.background = bgColor;
        typoCssVarsForEl(o.captionTypo, '--bkbg-iis-cp-', app);

        /* ── Scene wrapper ── */
        var scene = document.createElement('div');
        scene.className = 'bkbg-iis-scene';
        scene.style.justifyContent = justifyMap[align2] || 'center';
        if (bgColor) scene.style.padding = '32px';

        var wrap = document.createElement('div');
        wrap.style.maxWidth = imageWidth + 'px';
        wrap.style.width    = '100%';

        /* ── Card ── */
        var card = document.createElement('div');
        card.className         = 'bkbg-iis-card';
        card.style.width       = '100%';
        card.style.height      = imageHeight + 'px';
        card.style.borderRadius = imageRadius + 'px';
        card.style.perspective = '900px';

        /* Image or placeholder */
        if (imageUrl) {
            var img = document.createElement('img');
            img.className   = 'bkbg-iis-img';
            img.src         = imageUrl;
            img.alt         = imageAlt;
            img.style.borderRadius = imageRadius + 'px';
            card.appendChild(img);
        } else {
            var ph = document.createElement('div');
            ph.className = 'bkbg-iis-placeholder';
            ph.style.width  = '100%';
            ph.style.height = imageHeight + 'px';
            ph.style.borderRadius = imageRadius + 'px';
            ph.textContent = 'No image selected';
            card.appendChild(ph);
        }

        /* Sheen overlay */
        var sheen = document.createElement('div');
        sheen.className = 'bkbg-iis-sheen';
        var sheenPx = Math.round(Math.min(imageWidth, imageHeight) * sheenSize / 100);
        sheen.style.width  = sheenPx + 'px';
        sheen.style.height = sheenPx + 'px';
        sheen.style.background = 'radial-gradient(circle, ' + sheenColor + ' 0%, transparent 70%)';
        sheen.style.filter = 'blur(' + sheenBlur + 'px)';
        card.appendChild(sheen);

        wrap.appendChild(card);

        /* Caption */
        if (showCaption && caption) {
            var cap = document.createElement('p');
            cap.className = 'bkbg-iis-caption';
            cap.style.color    = captionColor;
            cap.textContent    = caption;
            wrap.appendChild(cap);
        }

        scene.appendChild(wrap);
        app.appendChild(scene);

        if (reducedMotion) return;

        /* ── Interaction ── */
        var targetRX = 0, targetRY = 0;
        var currentRX = 0, currentRY = 0;
        var sheenX = 50, sheenY = 50;
        var rafId = null;

        function tick() {
            currentRX = lerp(currentRX, targetRX, 0.1);
            currentRY = lerp(currentRY, targetRY, 0.1);

            card.style.transform = 'perspective(900px) rotateX(' + currentRX + 'deg) rotateY(' + currentRY + 'deg)';

            if (tiltShadow) {
                var sdx = -currentRY * 0.5;
                var sdy =  currentRX * 0.5;
                card.style.boxShadow = sdx + 'px ' + (sdy + 16) + 'px 40px ' + shadowColor;
            }

            sheen.style.left = sheenX + '%';
            sheen.style.top  = sheenY + '%';

            if (Math.abs(currentRX - targetRX) > 0.01 || Math.abs(currentRY - targetRY) > 0.01) {
                rafId = requestAnimationFrame(tick);
            } else {
                rafId = null;
            }
        }

        function startTick() {
            if (!rafId) rafId = requestAnimationFrame(tick);
        }

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var nx   = (e.clientX - rect.left) / rect.width  - 0.5; /* -0.5 to 0.5 */
            var ny   = (e.clientY - rect.top)  / rect.height - 0.5;

            targetRY =  nx * tiltStrength;
            targetRX = -ny * tiltStrength;
            sheenX   = (e.clientX - rect.left) / rect.width  * 100;
            sheenY   = (e.clientY - rect.top)  / rect.height * 100;

            card.classList.add('bkbg-iis-active');
            startTick();
        });

        card.addEventListener('mouseleave', function () {
            targetRX = 0;
            targetRY = 0;
            sheenX   = 50;
            sheenY   = 50;
            card.classList.remove('bkbg-iis-active');
            startTick();
        });
    });
}());
