(function () {
    'use strict';

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

    var TYPE_DEFAULTS = {
        warning: { accent:'#f59e0b', labelBg:'#fffbeb', labelColor:'#92400e', border:'#f59e0b', btn:'#f59e0b', btnTxt:'#ffffff' },
        info:    { accent:'#3b82f6', labelBg:'#eff6ff', labelColor:'#1e40af', border:'#3b82f6', btn:'#3b82f6', btnTxt:'#ffffff' },
        danger:  { accent:'#ef4444', labelBg:'#fef2f2', labelColor:'#991b1b', border:'#ef4444', btn:'#ef4444', btnTxt:'#ffffff' },
        success: { accent:'#10b981', labelBg:'#f0fdf4', labelColor:'#065f46', border:'#10b981', btn:'#10b981', btnTxt:'#ffffff' },
        neutral: { accent:'#6b7280', labelBg:'#f9fafb', labelColor:'#374151', border:'#d1d5db', btn:'#6b7280', btnTxt:'#ffffff' },
        custom:  { accent:'#6c3fb5', labelBg:'#f5f3ff', labelColor:'#4c1d95', border:'#6c3fb5', btn:'#6c3fb5', btnTxt:'#ffffff' },
    };

    function getColors(opts) {
        if (opts.spoilerType !== 'custom') {
            var d = TYPE_DEFAULTS[opts.spoilerType] || TYPE_DEFAULTS.warning;
            return { labelBg: d.labelBg, labelColor: d.labelColor, border: d.border, btn: d.btn, btnColor: d.btnTxt };
        }
        return { labelBg: opts.labelBg, labelColor: opts.labelColor, border: opts.borderColor, btn: opts.btnBg, btnColor: opts.btnColor };
    }

    function setIconNode(el, type, charVal, dashicon, imageUrl, dashiconColor) {
        while (el.firstChild) el.removeChild(el.firstChild);
        var _IP = window.bkbgIconPicker;
        if (_IP && type && type !== 'custom-char') {
            var node = _IP.buildFrontendIcon(type, charVal, dashicon, imageUrl, dashiconColor);
            if (node) { el.appendChild(node); return; }
        }
        el.textContent = charVal || '';
    }

    function setBtnIconContent(btn, showIcon, type, charVal, dashicon, imageUrl, dashiconColor, text) {
        while (btn.firstChild) btn.removeChild(btn.firstChild);
        if (showIcon) {
            var _IP = window.bkbgIconPicker;
            if (_IP && type && type !== 'custom-char') {
                var node = _IP.buildFrontendIcon(type, charVal, dashicon, imageUrl, dashiconColor);
                if (node) btn.appendChild(node);
                else btn.appendChild(document.createTextNode(charVal || ''));
            } else {
                btn.appendChild(document.createTextNode(charVal || ''));
            }
            btn.appendChild(document.createTextNode(' '));
        }
        btn.appendChild(document.createTextNode(text));
    }

    function buildApp(app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var c       = getColors(opts);
        var cRadius = (opts.cardRadius || 12) + 'px';
        var bRadius = (opts.btnRadius  || 8)  + 'px';
        var pV      = (opts.paddingV   || 20) + 'px';
        var pH      = (opts.paddingH   || 24) + 'px';
        var maxW    = (opts.maxWidth   || 720) + 'px';
        var dur     = (opts.animDuration || 300);
        var isOpen  = false;

        /* Wrapper */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-sp-wrap';
        wrap.style.cssText = [
            'max-width:' + maxW,
            'margin:0 auto',
            'border:2px solid ' + c.border,
            'border-radius:' + cRadius,
            'overflow:hidden',
        ].join(';');

        /* Header */
        var header = document.createElement('div');
        header.className = 'bkbg-sp-header';
        header.style.cssText = [
            'display:flex', 'align-items:center', 'justify-content:space-between',
            'gap:12px', 'padding:' + pV + ' ' + pH, 'background:' + c.labelBg,
            'cursor:pointer', 'user-select:none',
        ].join(';');

        var leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap';

        var labelEl = document.createElement('span');
        labelEl.className = 'bkbg-sp-label';
        labelEl.style.cssText = 'color:' + c.labelColor;
        labelEl.textContent = opts.label || '⚠ Spoiler Warning';
        leftGroup.appendChild(labelEl);

        if (opts.showSubLabel !== false && opts.subLabel) {
            var subEl = document.createElement('span');
            subEl.className = 'bkbg-sp-sublabel';
            subEl.style.cssText = 'font-size:13px;font-style:italic;opacity:0.72;color:' + c.labelColor;
            subEl.textContent = opts.subLabel;
            leftGroup.appendChild(subEl);
        }

        var iconEl = document.createElement('span');
        iconEl.className = 'bkbg-sp-icon';
        iconEl.style.cssText = 'font-size:13px;opacity:0.72;color:' + c.labelColor + ';flex-shrink:0';
        if (opts.showIcon !== false) {
            setIconNode(iconEl, opts.iconClosedType, opts.iconClosed || '▼', opts.iconClosedDashicon, opts.iconClosedImageUrl, opts.iconClosedDashiconColor);
        }

        header.appendChild(leftGroup);
        header.appendChild(iconEl);
        wrap.appendChild(header);

        /* Content area (shown when open) */
        var contentWrap = document.createElement('div');
        contentWrap.className = 'bkbg-sp-slide';
        contentWrap.style.cssText = 'overflow:hidden;transition:max-height ' + dur + 'ms ease,opacity ' + dur + 'ms ease;max-height:0;opacity:0';

        var contentInner = document.createElement('div');
        contentInner.className = 'bkbg-sp-content';
        contentInner.style.cssText = 'padding:' + pV + ' ' + pH + ';background:' + (opts.contentBg || '#ffffff');

        var textEl = document.createElement('div');
        textEl.className = 'bkbg-sp-text';
        textEl.style.cssText = 'color:' + (opts.contentColor || '#374151');
        textEl.innerHTML = opts.content || '';

        contentInner.appendChild(textEl);

        /* Hide button inside content */
        var hideBtn = document.createElement('button');
        hideBtn.className = 'bkbg-sp-btn';
        hideBtn.style.cssText = [
            'display:inline-flex', 'align-items:center', 'gap:6px',
            'margin-top:16px', 'padding:8px 20px',
            'border:none', 'border-radius:' + bRadius,
            'font-size:14px', 'font-weight:600', 'cursor:pointer',
            'background:' + c.btn, 'color:' + c.btnColor,
        ].join(';');
        hideBtn.textContent = '';
        setBtnIconContent(hideBtn, opts.showIcon !== false, opts.iconOpenType, opts.iconOpen || '▲', opts.iconOpenDashicon, opts.iconOpenImageUrl, opts.iconOpenDashiconColor, opts.hideBtnText || 'Hide Spoiler');

        contentInner.appendChild(hideBtn);
        contentWrap.appendChild(contentInner);
        wrap.appendChild(contentWrap);

        /* Reveal button area (shown when closed) */
        var revealWrap = document.createElement('div');
        revealWrap.className = 'bkbg-sp-body-hidden';
        revealWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px;background:' + (opts.contentBg || '#ffffff');

        var revealBtn = document.createElement('button');
        revealBtn.className = 'bkbg-sp-btn';
        revealBtn.style.cssText = [
            'display:inline-flex', 'align-items:center', 'gap:6px',
            'padding:10px 28px', 'border:none', 'border-radius:' + bRadius,
            'font-size:15px', 'font-weight:600', 'cursor:pointer',
            'background:' + c.btn, 'color:' + c.btnColor,
        ].join(';');
        revealBtn.textContent = '';
        setBtnIconContent(revealBtn, opts.showIcon !== false, opts.iconClosedType, opts.iconClosed || '▼', opts.iconClosedDashicon, opts.iconClosedImageUrl, opts.iconClosedDashiconColor, opts.revealBtnText || 'Reveal Spoiler');

        revealWrap.appendChild(revealBtn);
        wrap.appendChild(revealWrap);

        /* Legacy + typo CSS vars on wrap */
        wrap.style.setProperty('--bksp-lb-sz', (opts.labelSize || 16) + 'px');
        wrap.style.setProperty('--bksp-lb-w', String(opts.labelFontWeight || '700'));
        wrap.style.setProperty('--bksp-lb-lh', String(opts.labelLineHeight || 1.4));
        wrap.style.setProperty('--bksp-ct-sz', (opts.contentSize || 16) + 'px');
        wrap.style.setProperty('--bksp-ct-w', String(opts.contentFontWeight || '400'));
        wrap.style.setProperty('--bksp-ct-lh', String(opts.contentLineHeight || 1.7));
        typoCssVarsForEl(wrap, opts.labelTypo, '--bksp-lb');
        typoCssVarsForEl(wrap, opts.contentTypo, '--bksp-ct');

        app.innerHTML = '';
        app.appendChild(wrap);

        /* Toggle logic */
        function reveal() {
            isOpen = true;
            revealWrap.style.display = 'none';
            contentWrap.style.maxHeight = contentInner.scrollHeight + 200 + 'px';
            contentWrap.style.opacity = '1';
            if (opts.showIcon !== false) setIconNode(iconEl, opts.iconOpenType, opts.iconOpen || '▲', opts.iconOpenDashicon, opts.iconOpenImageUrl, opts.iconOpenDashiconColor);
            header.style.borderBottom = '1px solid ' + c.border;
        }

        function hide() {
            isOpen = false;
            contentWrap.style.maxHeight = '0';
            contentWrap.style.opacity = '0';
            if (opts.showIcon !== false) setIconNode(iconEl, opts.iconClosedType, opts.iconClosed || '▼', opts.iconClosedDashicon, opts.iconClosedImageUrl, opts.iconClosedDashiconColor);
            header.style.borderBottom = 'none';
            setTimeout(function () {
                if (!isOpen) revealWrap.style.display = '';
            }, dur);
        }

        header.addEventListener('click', function () { isOpen ? hide() : reveal(); });
        revealBtn.addEventListener('click', function (e) { e.stopPropagation(); reveal(); });
        hideBtn.addEventListener('click', function (e) { e.stopPropagation(); hide(); });
    }

    document.querySelectorAll('.bkbg-sp-app').forEach(buildApp);
})();
