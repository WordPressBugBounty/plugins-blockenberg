(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    document.querySelectorAll('.bkbg-coming-soon-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var bg = opts.bgGradient || opts.bgColor || '#0f172a';
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-coming-soon-wrap';
        wrap.style.cssText = 'background:' + bg + ';padding:' + (opts.paddingTop || 120) + 'px 40px ' + (opts.paddingBottom || 120) + 'px;';
        wrap.style.setProperty('--bkbg-csn-max', (opts.maxWidth || 700) + 'px');

        typoCssVarsForEl(wrap, opts.typoHeading, '--bkbg-csn-hd-');
        typoCssVarsForEl(wrap, opts.typoBody, '--bkbg-csn-bd-');
        typoCssVarsForEl(wrap, opts.typoEyebrow, '--bkbg-csn-ey-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-csn-inner';

        if (opts.showLogo && opts.logoUrl) {
            var logoDiv = document.createElement('div');
            logoDiv.className = 'bkbg-csn-logo';
            var logoImg = document.createElement('img');
            logoImg.src = opts.logoUrl;
            logoImg.alt = opts.logoAlt || '';
            logoImg.style.width = (opts.logoWidth || 160) + 'px';
            logoDiv.appendChild(logoImg);
            inner.appendChild(logoDiv);
        }

        if (opts.showEyebrow !== false && opts.eyebrow) {
            var ey = document.createElement('span');
            ey.className = 'bkbg-csn-eyebrow';
            ey.style.background = opts.eyebrowBg || 'rgba(255,255,255,.08)';
            ey.style.color = opts.eyebrowColor || '#c4b5fd';
            ey.textContent = opts.eyebrow;
            inner.appendChild(ey);
        }

        var h1 = document.createElement('h1');
        h1.className = 'bkbg-csn-heading';
        h1.style.color = opts.headingColor || '#fff';
        h1.innerHTML = opts.heading || '';
        inner.appendChild(h1);

        var p = document.createElement('p');
        p.className = 'bkbg-csn-body';
        p.style.color = opts.textColor || '#94a3b8';
        p.innerHTML = opts.subtext || '';
        inner.appendChild(p);

        // Countdown
        if (opts.showCountdown) {
            var ctdWrap = document.createElement('div');
            ctdWrap.className = 'bkbg-csn-countdown';

            var units = [{ key: 'days', label: 'Days' }, { key: 'hours', label: 'Hours' }, { key: 'mins', label: 'Mins' }, { key: 'secs', label: 'Secs' }];
            var numEls = {};
            units.forEach(function (u) {
                var box = document.createElement('div');
                box.className = 'bkbg-csn-unit';
                box.style.background = opts.timerBg || 'rgba(255,255,255,.07)';
                var num = document.createElement('div');
                num.className = 'bkbg-csn-unit-num';
                num.style.color = opts.timerColor || '#fff';
                num.textContent = '00';
                var lbl = document.createElement('div');
                lbl.className = 'bkbg-csn-unit-label';
                lbl.style.color = opts.textColor || '#94a3b8';
                lbl.textContent = u.label;
                box.appendChild(num);
                box.appendChild(lbl);
                ctdWrap.appendChild(box);
                numEls[u.key] = num;
            });
            inner.appendChild(ctdWrap);

            var target = opts.launchDate ? new Date(opts.launchDate).getTime() : 0;
            if (target && !isNaN(target)) {
                function tick() {
                    var diff = target - Date.now();
                    if (diff < 0) diff = 0;
                    var d = Math.floor(diff / 864e5);
                    var h = Math.floor((diff % 864e5) / 36e5);
                    var m = Math.floor((diff % 36e5) / 6e4);
                    var s = Math.floor((diff % 6e4) / 1e3);
                    numEls.days.textContent  = pad(d);
                    numEls.hours.textContent = pad(h);
                    numEls.mins.textContent  = pad(m);
                    numEls.secs.textContent  = pad(s);
                }
                tick();
                setInterval(tick, 1000);
            }
        }

        // Email form
        if (opts.showEmail) {
            var form = document.createElement('form');
            form.className = 'bkbg-csn-form';
            form.action = opts.emailAction || '#';
            form.method = 'post';

            var input = document.createElement('input');
            input.className = 'bkbg-csn-input';
            input.type = 'email';
            input.name = 'email';
            input.placeholder = opts.emailPlaceholder || 'Enter your email';
            input.required = true;
            input.style.cssText = 'border:1px solid rgba(255,255,255,.15);background:' + (opts.inputBg || 'rgba(255,255,255,.08)') + ';color:' + (opts.inputColor || '#fff') + ';';

            var btn = document.createElement('button');
            btn.className = 'bkbg-csn-btn';
            btn.type = 'submit';
            btn.style.cssText = 'background:' + (opts.btnBg || '#7c3aed') + ';color:' + (opts.btnColor || '#fff') + ';';
            btn.textContent = opts.emailBtnLabel || 'Notify Me';

            form.appendChild(input);
            form.appendChild(btn);
            inner.appendChild(form);
        }

        // Socials
        if (opts.showSocials && opts.socialLinks && opts.socialLinks.length) {
            var socialsRow = document.createElement('div');
            socialsRow.className = 'bkbg-csn-socials';
            var _IP = window.bkbgIconPicker;
            opts.socialLinks.forEach(function (s) {
                var a = document.createElement('a');
                a.className = 'bkbg-csn-social-link';
                a.href = s.url || '#';
                a.title = s.platform || '';
                a.style.cssText = 'background:rgba(255,255,255,.1);color:' + (opts.textColor || '#94a3b8') + ';';
                var _iType = s.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, s.icon, s.iconDashicon, s.iconImageUrl, s.iconDashiconColor);
                    if (_in) a.appendChild(_in);
                    else a.textContent = s.icon || '•';
                } else {
                    a.textContent = s.icon || '•';
                }
                a.target = '_blank';
                a.rel = 'noopener';
                socialsRow.appendChild(a);
            });
            inner.appendChild(socialsRow);
        }

        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();
