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

    function init() {
        document.querySelectorAll('.bkbg-afd-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                icon: '🔗', showIcon: true, label: 'Affiliate Disclosure', showLabel: true,
                text: 'This article contains affiliate links. If you click through and make a purchase, we may earn a commission — at no extra cost to you.',
                linkText: 'Read our full affiliate policy', linkUrl: '', showLink: false,
                style: 'banner', collapsible: false, borderRadius: 8,
                bgColor: '#fffbeb', borderColor: '#fcd34d', accentColor: '#d97706',
                textColor: '#78350f', labelColor: '#92400e', linkColor: '#d97706'
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-afd-wrap bkbg-afd-' + o.style;

            /* Typography CSS vars */
            wrap.style.setProperty('--bkbg-afd-text-sz', (o.textFontSize || 13) + 'px');
            typoCssVarsForEl(o.textTypo, '--bkbg-afd-text-', wrap);

            /* Apply style-specific appearance */
            if (o.style === 'banner') {
                wrap.style.cssText = 'padding:14px 18px;border:1px solid ' + o.borderColor + ';border-top:3px solid ' + o.accentColor + ';border-radius:' + o.borderRadius + 'px;background:' + o.bgColor;
            } else if (o.style === 'left-bar') {
                wrap.style.cssText = 'padding:12px 16px;border-left:4px solid ' + o.accentColor + ';border-radius:0 ' + o.borderRadius + 'px ' + o.borderRadius + 'px 0;background:' + o.bgColor;
            } else if (o.style === 'box') {
                wrap.style.cssText = 'padding:16px 20px;border:2px solid ' + o.borderColor + ';border-radius:' + o.borderRadius + 'px;background:' + o.bgColor;
            } else {
                wrap.style.cssText = 'padding:8px 0;background:transparent;border:none;border-radius:0;';
            }

            /* Body content */
            function buildBody() {
                var body = document.createElement('div');
                body.className = 'bkbg-afd-body';
                body.style.flex = '1';

                var line = document.createElement('p');
                line.style.cssText = 'margin:0;font-size:13px;line-height:1.55;color:' + o.textColor;

                if (o.showLabel) {
                    var lbl = document.createElement('strong');
                    lbl.className = 'bkbg-afd-label'; lbl.style.color = o.labelColor;
                    lbl.textContent = o.label + ': ';
                    line.appendChild(lbl);
                }
                line.appendChild(document.createTextNode(o.text.replace(/<[^>]+>/g, '')));
                body.appendChild(line);

                if (o.showLink && o.linkUrl) {
                    var a = document.createElement('a');
                    a.className = 'bkbg-afd-link'; a.href = o.linkUrl; a.style.color = o.linkColor;
                    a.textContent = o.linkText;
                    body.appendChild(a);
                }
                return body;
            }

            if (o.collapsible) {
                var details = document.createElement('details');
                details.style.width = '100%';
                var summary = document.createElement('summary');
                summary.className = 'bkbg-afd-summary';

                if (o.showIcon) {
                    var ico = document.createElement('span'); ico.textContent = o.icon; ico.style.fontSize = '18px';
                    summary.appendChild(ico);
                }
                var ltext = document.createElement('span');
                ltext.style.cssText = 'font-weight:700;font-size:13px;color:' + o.labelColor + ';flex:1';
                ltext.textContent = o.label;
                var arrow = document.createElement('span'); arrow.className = 'bkbg-afd-arrow'; arrow.textContent = '▶'; arrow.style.color = o.accentColor;
                summary.appendChild(ltext); summary.appendChild(arrow);
                details.appendChild(summary);

                var detBody = document.createElement('div');
                detBody.className = 'bkbg-afd-detail-body';
                detBody.appendChild(buildBody());
                details.appendChild(detBody);
                wrap.appendChild(details);
            } else {
                if (o.showIcon) {
                    var iconEl = document.createElement('span');
                    iconEl.className = 'bkbg-afd-icon'; iconEl.textContent = o.icon;
                    wrap.appendChild(iconEl);
                }
                wrap.appendChild(buildBody());
            }

            el.appendChild(wrap);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
