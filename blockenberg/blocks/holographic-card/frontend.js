(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    function initBlock(root) {
        var card = root.querySelector('.bkbg-hgc-app');
        if (!card) return;

        var raw = card.getAttribute('data-opts') || '{}';
        var o;
        try { o = JSON.parse(raw); } catch (e) { o = {}; }

        var tiltStrength  = Number(o.tiltStrength)  || 15;
        var shineOpacity  = Number(o.shineOpacity)  || 60;
        var glareOpacity  = Number(o.glareOpacity)  || 40;
        var foilHue       = Number(o.foilHue)       || 0;
        var foilSat       = Number(o.foilSaturation) || 80;
        var cardRadius    = Number(o.cardRadius)     || 20;
        var cardBg        = o.cardBg        || '#1a1035';
        var titleColor    = o.titleColor    || '#ffffff';
        var subtitleColor = o.subtitleColor || 'rgba(255,255,255,0.7)';
        var badgeBg       = o.badgeBg       || 'rgba(255,255,255,0.15)';
        var badgeColor    = o.badgeColor    || '#ffffff';
        var linkBg        = o.linkBg        || 'rgba(255,255,255,0.15)';
        var linkColor     = o.linkColor     || '#ffffff';

        // Apply colour tokens
        card.style.background    = cardBg;
        card.style.borderRadius  = cardRadius + 'px';

        /* typo CSS vars on card */
        typoCssVarsForEl(o.titleTypo, '--bkbg-hgc-tt-', card);
        typoCssVarsForEl(o.subtitleTypo, '--bkbg-hgc-st-', card);

        var shineEl    = card.querySelector('.bkbg-hgc-shine');
        var glareEl    = card.querySelector('.bkbg-hgc-glare');
        var badgeEl    = card.querySelector('.bkbg-hgc-badge');
        var titleEl    = card.querySelector('.bkbg-hgc-title');
        var subtitleEl = card.querySelector('.bkbg-hgc-subtitle');
        var linkEl     = card.querySelector('.bkbg-hgc-link');

        if (shineEl)    shineEl.style.opacity = shineOpacity / 100;
        if (glareEl)    glareEl.style.setProperty('--bkbg-hgc-glare-opacity', glareOpacity / 100);
        if (badgeEl)  { badgeEl.style.background = badgeBg; badgeEl.style.color = badgeColor; }
        if (titleEl)    titleEl.style.color = titleColor;
        if (subtitleEl) subtitleEl.style.color = subtitleColor;
        if (linkEl)   { linkEl.style.background = linkBg; linkEl.style.color = linkColor; }

        // Build shine gradient function
        function shineGradient(hueShift) {
            var h = foilHue + hueShift;
            return 'linear-gradient(135deg,' +
                'hsl(' + (h +   0) + ',' + foilSat + '%,60%) 0%,' +
                'hsl(' + (h +  60) + ',' + foilSat + '%,70%) 16%,' +
                'hsl(' + (h + 120) + ',' + foilSat + '%,65%) 33%,' +
                'hsl(' + (h + 180) + ',' + foilSat + '%,65%) 50%,' +
                'hsl(' + (h + 240) + ',' + foilSat + '%,65%) 66%,' +
                'hsl(' + (h + 300) + ',' + foilSat + '%,65%) 83%,' +
                'hsl(' + (h + 360) + ',' + foilSat + '%,60%) 100%)';
        }

        var raf = null;
        var targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;
        var targetBX = 50, targetBY = 50, currentBX = 50, currentBY = 50;
        var hueShift = 0;
        var inside = false;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function animate() {
            currentRX = lerp(currentRX, targetRX, 0.12);
            currentRY = lerp(currentRY, targetRY, 0.12);
            currentBX = lerp(currentBX, targetBX, 0.1);
            currentBY = lerp(currentBY, targetBY, 0.1);

            card.style.transform = 'perspective(800px) rotateX(' + currentRX + 'deg) rotateY(' + currentRY + 'deg) scale3d(1.02,1.02,1.02)';

            if (shineEl) {
                hueShift = currentBX * 0.8;
                shineEl.style.background = shineGradient(hueShift);
                shineEl.style.backgroundPosition = currentBX + '% ' + currentBY + '%';
            }
            if (glareEl) {
                glareEl.style.background = 'radial-gradient(circle at ' + currentBX + '% ' + currentBY + '%, rgba(255,255,255,0.55) 0%, transparent 55%)';
                glareEl.style.opacity = inside ? (glareOpacity / 100) * (Math.abs(currentRX) + Math.abs(currentRY)) / tiltStrength : 0;
            }

            if (inside ||
                Math.abs(currentRX) > 0.05 ||
                Math.abs(currentRY) > 0.05) {
                raf = requestAnimationFrame(animate);
            } else {
                card.style.transform = '';
                raf = null;
            }
        }

        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;

            targetRY = (x - 0.5) * 2 * tiltStrength;
            targetRX = -(y - 0.5) * 2 * tiltStrength;
            targetBX = x * 100;
            targetBY = y * 100;

            if (!raf) {
                inside = true;
                raf = requestAnimationFrame(animate);
            }
        });

        card.addEventListener('mouseenter', function () {
            inside = true;
        });

        card.addEventListener('mouseleave', function () {
            inside = false;
            targetRX = 0;
            targetRY = 0;
            targetBX = 50;
            targetBY = 50;
            if (!raf) raf = requestAnimationFrame(animate);
        });

        // Touch tilt (passive)
        card.addEventListener('touchmove', function (e) {
            var t = e.touches[0];
            var rect = card.getBoundingClientRect();
            var x = (t.clientX - rect.left) / rect.width;
            var y = (t.clientY - rect.top)  / rect.height;
            targetRY = (x - 0.5) * 2 * (tiltStrength * 0.6);
            targetRX = -(y - 0.5) * 2 * (tiltStrength * 0.6);
            if (!raf) { inside = true; raf = requestAnimationFrame(animate); }
        }, { passive: true });

        card.addEventListener('touchend', function () {
            inside = false;
            targetRX = 0; targetRY = 0;
            if (!raf) raf = requestAnimationFrame(animate);
        });

        // Respect reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            card.style.removeProperty('transform');
        }
    }

    function init() {
        document.querySelectorAll('.wp-block-blockenberg-holographic-card').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
