(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;

        // Non-responsive
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);

        // Responsive
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop !== undefined && typo.sizeDesktop !== null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  !== undefined && typo.sizeTablet  !== null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  !== undefined && typo.sizeMobile  !== null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);

        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop !== undefined && typo.lineHeightDesktop !== null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  !== undefined && typo.lineHeightTablet  !== null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  !== undefined && typo.lineHeightMobile  !== null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);

        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop !== undefined && typo.letterSpacingDesktop !== null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  !== undefined && typo.letterSpacingTablet  !== null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  !== undefined && typo.letterSpacingMobile  !== null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);

        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop !== undefined && typo.wordSpacingDesktop !== null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  !== undefined && typo.wordSpacingTablet  !== null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  !== undefined && typo.wordSpacingMobile  !== null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    var presets = {
        info:    { bg: '#eff6ff', border: '#3b82f6', title: '#1d4ed8', text: '#1e3a5f', badge: '#dbeafe', badgeColor: '#1d4ed8' },
        warning: { bg: '#fffbeb', border: '#f59e0b', title: '#92400e', text: '#78350f', badge: '#fef3c7', badgeColor: '#92400e' },
        success: { bg: '#f0fdf4', border: '#22c55e', title: '#15803d', text: '#14532d', badge: '#dcfce7', badgeColor: '#15803d' },
        tip:     { bg: '#fdf4ff', border: '#a855f7', title: '#7c3aed', text: '#5b21b6', badge: '#f3e8ff', badgeColor: '#7c3aed' },
        quote:   { bg: '#f8fafc', border: '#64748b', title: '#334155', text: '#475569', badge: '#e2e8f0', badgeColor: '#475569' },
        custom:  { bg: '#f9fafb', border: '#d1d5db', title: '#111827', text: '#374151', badge: '#e5e7eb', badgeColor: '#374151' }
    };

    document.querySelectorAll('.bkbg-content-box-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var p = presets[opts.variant] || presets.info;
        var bg         = opts.bgColor     || p.bg;
        var border     = opts.borderColor || p.border;
        var titleColor = opts.titleColor  || p.title;
        var textColor  = opts.textColor   || p.text;
        var badgeBg    = opts.badgeBg     || p.badge;
        var badgeColor = opts.badgeColor  || p.badgeColor;
        var iconColor  = opts.iconColor   || p.border;

        var borderProp = opts.borderPosition || 'left';
        var bw = (opts.borderWidth || 4) + 'px solid ' + border;
        var boxStyle = 'background:' + bg + ';border-radius:' + (opts.borderRadius || 8) + 'px;padding:' + (opts.paddingV || 20) + 'px ' + (opts.paddingH || 24) + 'px;';
        if (opts.maxWidth > 0) boxStyle += 'max-width:' + opts.maxWidth + 'px;';
        if (borderProp === 'left')  boxStyle += 'border-left:'  + bw + ';';
        if (borderProp === 'top')   boxStyle += 'border-top:'   + bw + ';';
        if (borderProp === 'all')   boxStyle += 'border:'       + bw + ';';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-content-box-wrap' + (opts.iconLayout === 'top' ? ' icon-top' : '');
        wrap.style.cssText = boxStyle;

        if (opts.showIcon !== false) {
            var iconEl = document.createElement('div');
            iconEl.className = 'bkbg-cb-icon';
            iconEl.style.cssText = 'font-size:' + (opts.iconSize || 28) + 'px;color:' + iconColor + ';';
            var IP = window.bkbgIconPicker;
            var iconNode = IP ? IP.buildFrontendIcon(opts.iconType || 'custom-char', opts.icon, opts.iconDashicon, opts.iconImageUrl, opts.iconDashiconColor) : null;
            if (iconNode) {
                iconEl.appendChild(iconNode);
                wrap.appendChild(iconEl);
            } else if (opts.icon) {
                iconEl.textContent = opts.icon;
                wrap.appendChild(iconEl);
            }
        }

        var bodyCol = document.createElement('div');
        bodyCol.className = 'bkbg-cb-body-col';

        var header = document.createElement('div');
        header.className = 'bkbg-cb-header';

        if (opts.showBadge !== false && opts.badge) {
            var badge = document.createElement('span');
            badge.className = 'bkbg-cb-badge';
            badge.style.cssText = 'background:' + badgeBg + ';color:' + badgeColor + ';';
            badge.textContent = opts.badge;
            header.appendChild(badge);
        }

        if (opts.showTitle !== false && opts.title) {
            var title = document.createElement('strong');
            title.className = 'bkbg-cb-title';
            title.style.color = titleColor;
            title.innerHTML = opts.title;
            header.appendChild(title);
        }

        if (header.children.length) bodyCol.appendChild(header);

        var body = document.createElement('div');
        body.className = 'bkbg-cb-text';
        body.style.color = textColor;
        body.innerHTML = opts.body || '';
        bodyCol.appendChild(body);

        wrap.appendChild(bodyCol);
        typoCssVarsForEl(opts.typoTitle, '--bkcb-title-', wrap);
        typoCssVarsForEl(opts.typoBody, '--bkcb-body-', wrap);
        root.parentNode.replaceChild(wrap, root);
    });
})();
