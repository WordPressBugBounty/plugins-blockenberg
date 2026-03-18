(function () {
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

    var DEFAULT_LABELS = {
        'sponsored':        'Sponsored',
        'paid-partnership': 'Paid Partnership',
        'advertisement':    'Advertisement',
        'native-ad':        'Native Ad',
        'affiliate':        'Affiliate'
    };

    function init() {
        document.querySelectorAll('.bkbg-spd-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                disclosureType: 'sponsored',
                customLabel: '',
                text: '',
                showText: false,
                showIcon: true,
                icon: '📢',
                iconType: 'custom-char',
                iconDashicon: 'megaphone',
                iconImageUrl: '',
                style: 'pill',
                align: 'left',
                bgColor: '#fff7ed',
                borderColor: '#fed7aa',
                textColor: '#9a3412',
                labelBg: '#f97316',
                labelColor: '#ffffff',
                fontSize: 12,
                borderRadius: 999,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var label = o.disclosureType === 'custom'
                ? (o.customLabel || 'Custom')
                : (DEFAULT_LABELS[o.disclosureType] || 'Sponsored');

            var isPill = o.style === 'pill';
            var isBanner = o.style === 'banner';

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-spd-wrap';
            wrap.style.cssText = [
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px',
                'text-align:' + (o.align || 'left')
            ].join(';');

            /* Legacy + typo CSS vars */
            wrap.style.setProperty('--bksd-lb-sz', (o.fontSize || 12) + 'px');
            wrap.style.setProperty('--bksd-lb-w', String(o.fontWeight || '600'));
            wrap.style.setProperty('--bksd-lb-lh', String(o.lineHeight || 1.5));
            wrap.style.setProperty('--bksd-tx-sz', (o.fontSize || 12) + 'px');
            wrap.style.setProperty('--bksd-tx-w', String(o.fontWeight || '600'));
            wrap.style.setProperty('--bksd-tx-lh', String(o.lineHeight || 1.5));
            typoCssVarsForEl(wrap, o.labelTypo, '--bksd-lb');
            typoCssVarsForEl(wrap, o.textTypo, '--bksd-tx');

            var container = document.createElement('div');
            var baseRadius = isPill ? o.borderRadius : isBanner ? 4 : 8;
            container.className = 'bkbg-spd-' + o.style;
            container.style.cssText = [
                'background:' + o.bgColor,
                'border:1px solid ' + o.borderColor,
                'border-radius:' + baseRadius + 'px',
                'color:' + o.textColor,
                isPill ? 'display:inline-flex' : 'display:flex'
            ].join(';');

            var chip = document.createElement('span');
            chip.className = 'bkbg-spd-label-chip';
            chip.style.cssText = 'background:' + o.labelBg + ';color:' + o.labelColor + ';display:inline-flex;align-items:center;gap:4px;';
            if (o.showIcon) {
                var IP = window.bkbgIconPicker;
                var iconNode = IP ? IP.buildFrontendIcon(o.iconType, o.icon, o.iconDashicon, o.iconImageUrl, o.iconDashiconColor) : null;
                if (iconNode) {
                    chip.appendChild(iconNode);
                } else if (o.icon) {
                    var iconSpan = document.createElement('span');
                    iconSpan.textContent = o.icon;
                    chip.appendChild(iconSpan);
                }
            }
            chip.appendChild(document.createTextNode(label));
            container.appendChild(chip);

            if (o.showText && o.text) {
                var textEl = document.createElement('span');
                textEl.className = 'bkbg-spd-text';
                textEl.style.cssText = 'color:' + o.textColor;
                textEl.innerHTML = o.text;
                container.appendChild(textEl);
            }

            wrap.appendChild(container);
            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
