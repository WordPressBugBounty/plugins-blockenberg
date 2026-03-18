(function () {

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

    function initNoiseSection(appEl) {
        var opts;
        try { opts = JSON.parse(appEl.getAttribute('data-opts') || '{}'); } catch(e){ opts={}; }

        var a = {
            heading:       opts.heading       || '',
            subtext:       opts.subtext       || '',
            tag:           opts.tag           || 'h1',
            ctaLabel:      opts.ctaLabel      || 'Get Started',
            ctaUrl:        opts.ctaUrl        || '#',
            ctaLabel2:     opts.ctaLabel2     || '',
            ctaUrl2:       opts.ctaUrl2       || '#',
            showCta:       opts.showCta       !== false,
            showCta2:      opts.showCta2      || false,
            textAlign:     opts.textAlign     || 'center',
            sectionHeight: opts.sectionHeight || 600,
            bgType:        opts.bgType        || 'gradient',
            bgColor:       opts.bgColor       || '#0a0a0f',
            bgColor2:      opts.bgColor2      || '#1e1b4b',
            bgAngle:       opts.bgAngle       || 135,
            bgImage:       opts.bgImage       || '',
            bgImageOpacity:opts.bgImageOpacity !== undefined ? opts.bgImageOpacity : 0.5,
            noiseOpacity:  opts.noiseOpacity   !== undefined ? opts.noiseOpacity  : 0.3,
            noiseTint:     opts.noiseTint     || 'dark',
            noiseFps:      opts.noiseFps      || 12,
            noiseScale:    opts.noiseScale    || 1,
            textColor:     opts.textColor     || '#ffffff',
            subtextColor:  opts.subtextColor  || '#94a3b8',
            ctaBg:         opts.ctaBg         || '#ffffff',
            ctaColor:      opts.ctaColor      || '#0a0a0f',
            ctaBg2:        opts.ctaBg2        || 'transparent',
            ctaColor2:     opts.ctaColor2     || '#ffffff',
            ctaBorder2:    opts.ctaBorder2    || 'rgba(255,255,255,0.4)',
            fontSize:      opts.fontSize      || 72,
            fontWeight:    opts.fontWeight    || 800,
            lineHeight:    opts.lineHeight    || 1.05,
            letterSpacing: opts.letterSpacing === undefined ? -2 : opts.letterSpacing,
            subtextSize:   opts.subtextSize   || 20,
            maxWidth:      opts.maxWidth      || 800,
            paddingTop:    opts.paddingTop    || 100,
            paddingBottom: opts.paddingBottom || 100
        };

        /* Compute background */
        var bg;
        if (a.bgType === 'gradient') bg = 'linear-gradient(' + a.bgAngle + 'deg, ' + a.bgColor + ', ' + a.bgColor2 + ')';
        else bg = a.bgColor;

        var justify = a.textAlign === 'center' ? 'center' : a.textAlign === 'right' ? 'flex-end' : 'flex-start';

        /* Section */
        var section = document.createElement('section');
        section.className = 'bkbg-ns-section';
        var cs = section.style;
        cs.setProperty('--bkbg-ns-height',    a.sectionHeight + 'px');
        cs.setProperty('--bkbg-ns-bg',        bg);
        cs.setProperty('--bkbg-ns-pt',        a.paddingTop + 'px');
        cs.setProperty('--bkbg-ns-pb',        a.paddingBottom + 'px');
        cs.setProperty('--bkbg-ns-align',     a.textAlign);
        cs.setProperty('--bkbg-ns-justify',   justify);
        cs.setProperty('--bkbg-ns-max-width', a.maxWidth + 'px');
        cs.setProperty('--bkbg-ns-text-color',a.textColor);
        cs.setProperty('--bkbg-ns-sub-color', a.subtextColor);
        cs.setProperty('--bkbg-ns-font-size', a.fontSize + 'px');
        cs.setProperty('--bkbg-ns-fw',        String(a.fontWeight));
        cs.setProperty('--bkbg-ns-lh',        String(a.lineHeight));
        cs.setProperty('--bkbg-ns-ls',        a.letterSpacing + 'px');
        cs.setProperty('--bkbg-ns-sub-size',  a.subtextSize + 'px');
        cs.setProperty('--bkbg-ns-cta-bg',    a.ctaBg);
        cs.setProperty('--bkbg-ns-cta-color', a.ctaColor);
        cs.setProperty('--bkbg-ns-cta2-bg',   a.ctaBg2);
        cs.setProperty('--bkbg-ns-cta2-color',a.ctaColor2);
        cs.setProperty('--bkbg-ns-cta2-border',a.ctaBorder2);

        /* Bg image */
        if (a.bgType === 'image' && a.bgImage) {
            var imgDiv = document.createElement('div');
            imgDiv.className = 'bkbg-ns-bg-img';
            imgDiv.style.backgroundImage = 'url(' + a.bgImage + ')';
            imgDiv.style.opacity = String(a.bgImageOpacity);
            section.appendChild(imgDiv);
        }

        /* Canvas grain */
        var canvas = document.createElement('canvas');
        canvas.className = 'bkbg-ns-grain';
        section.appendChild(canvas);

        /* Content */
        var content = document.createElement('div');
        content.className = 'bkbg-ns-content';

        var headingEl = document.createElement(a.tag);
        headingEl.className = 'bkbg-ns-heading';
        headingEl.textContent = a.heading;
        content.appendChild(headingEl);

        if (a.subtext) {
            var subEl = document.createElement('p');
            subEl.className = 'bkbg-ns-subtext';
            subEl.textContent = a.subtext;
            content.appendChild(subEl);
        }

        var ctasDiv = document.createElement('div');
        ctasDiv.className = 'bkbg-ns-ctas';

        if (a.showCta && a.ctaLabel) {
            var cta1 = document.createElement('a');
            cta1.className = 'bkbg-ns-cta';
            cta1.href = a.ctaUrl;
            cta1.textContent = a.ctaLabel;
            ctasDiv.appendChild(cta1);
        }
        if (a.showCta2 && a.ctaLabel2) {
            var cta2 = document.createElement('a');
            cta2.className = 'bkbg-ns-cta bkbg-ns-cta-secondary';
            cta2.href = a.ctaUrl2;
            cta2.textContent = a.ctaLabel2;
            ctasDiv.appendChild(cta2);
        }
        if (ctasDiv.children.length) content.appendChild(ctasDiv);

        section.appendChild(content);
        appEl.replaceWith(section);

        /* Typography CSS vars */
        typoCssVarsForEl(section, opts.headingTypo, '--bkbg-ns-hd-');
        typoCssVarsForEl(section, opts.subtextTypo, '--bkbg-ns-st-');

        /* --- Canvas grain animation --- */
        var ctx = canvas.getContext('2d');
        var pixelRatio = window.devicePixelRatio || 1;
        var frameInterval = 1000 / Math.max(1, a.noiseFps);
        var lastFrame = 0;
        var rafId = null;

        /* Tint color for noise pixels */
        var tintR = 0, tintG = 0, tintB = 0;
        if (a.noiseTint === 'light') { tintR=255; tintG=255; tintB=220; }
        else if (a.noiseTint === 'colored') { tintR=120; tintG=80; tintB=200; }

        function resizeCanvas() {
            var w = section.offsetWidth || 800;
            var h = section.offsetHeight || a.sectionHeight;
            canvas.width  = Math.ceil(w * pixelRatio / a.noiseScale);
            canvas.height = Math.ceil(h * pixelRatio / a.noiseScale);
            canvas.style.width  = w + 'px';
            canvas.style.height = h + 'px';
        }

        function drawNoise(now) {
            if (now - lastFrame < frameInterval) return;
            lastFrame = now;

            var w = canvas.width, h = canvas.height;
            var imageData = ctx.createImageData(w, h);
            var data = imageData.data;
            var alpha = Math.round(a.noiseOpacity * 255);

            for (var i = 0; i < data.length; i += 4) {
                var v = Math.random() * 255 | 0;
                data[i]   = tintR || v;
                data[i+1] = tintG || v;
                data[i+2] = tintB || v;
                data[i+3] = alpha;
            }
            ctx.putImageData(imageData, 0, 0);
        }

        function loop(now) {
            drawNoise(now);
            rafId = requestAnimationFrame(loop);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        if ('IntersectionObserver' in window) {
            var obs = new IntersectionObserver(function(entries) {
                if (entries[0].isIntersecting) { if (!rafId) rafId = requestAnimationFrame(loop); }
                else { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
            }, { threshold: 0 });
            obs.observe(section);
        } else {
            rafId = requestAnimationFrame(loop);
        }
    }

    document.querySelectorAll('.bkbg-ns-app').forEach(initNoiseSection);
})();
