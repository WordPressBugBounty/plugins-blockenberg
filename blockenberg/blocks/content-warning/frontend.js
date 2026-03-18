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
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function init() {
        document.querySelectorAll('.bkbg-cw-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                warningType: 'sensitive', icon: '⚠️', iconType: 'custom-char', iconDashicon: 'warning', iconImageUrl: '',
                showIcon: true,
                label: 'Content Warning', topics: '', message: '', showMessage: true,
                collapsible: false, buttonLabel: 'I understand — show content',
                style: 'box',
                bgColor: '#fef2f2', borderColor: '#fca5a5', accentColor: '#dc2626',
                labelColor: '#7f1d1d', textColor: '#450a0a',
                topicBg: '#fee2e2', topicColor: '#991b1b',
                btnBg: '#dc2626', btnColor: '#ffffff',
                borderRadius: 8, paddingTop: 0, paddingBottom: 0
            }, opts);

            function mk(tag, cls, style, text) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                if (text != null) n.textContent = text;
                return n;
            }

            var outerWrap = mk('div', '', { paddingTop: o.paddingTop + 'px', paddingBottom: o.paddingBottom + 'px' });

            var wrap = mk('div', 'bkbg-cw-wrap bkbg-cw-style-' + o.style, {
                background: o.bgColor,
                borderRadius: o.style === 'pill' ? '999px' : o.borderRadius + 'px'
            });

            if (o.style === 'box' || o.style === 'outline') {
                wrap.style.borderColor = o.borderColor;
                if (o.style === 'outline') wrap.style.background = 'transparent';
            } else if (o.style === 'banner') {
                wrap.style.borderColor = o.borderColor;
                wrap.style.borderLeftColor = o.accentColor;
            } else if (o.style === 'pill') {
                wrap.style.borderColor = o.accentColor;
            }

            /* header */
            var header = mk('div', 'bkbg-cw-header');
            if (o.showIcon) {
                var IP = window.bkbgIconPicker;
                var iconEl = IP ? IP.buildFrontendIcon(o.iconType, o.icon, o.iconDashicon, o.iconImageUrl, o.iconDashiconColor) : null;
                if (iconEl) {
                    iconEl.classList.add('bkbg-cw-icon');
                    header.appendChild(iconEl);
                } else if (o.icon) {
                    header.appendChild(mk('span', 'bkbg-cw-icon', {}, o.icon));
                }
            }
            header.appendChild(mk('span', 'bkbg-cw-label', { color: o.labelColor }, o.label));
            wrap.appendChild(header);

            /* topics */
            if (o.topics && o.topics.trim()) {
                var topicsRow = mk('div', 'bkbg-cw-topics');
                o.topics.split(',').forEach(function (t) {
                    var text = t.trim();
                    if (!text) return;
                    topicsRow.appendChild(mk('span', 'bkbg-cw-topic', { background: o.topicBg, color: o.topicColor }, text));
                });
                wrap.appendChild(topicsRow);
            }

            /* message */
            if (o.showMessage && o.message && o.message.trim()) {
                var msg = mk('p', 'bkbg-cw-message', { color: o.textColor }, '');
                msg.innerHTML = o.message;
                wrap.appendChild(msg);
            }

            /* collapsible: find the next sibling block and hide it */
            if (o.collapsible) {
                /* find the parent block wrapper and the next block sibling */
                var parentBlock = appEl.closest('.wp-block-blockenberg-content-warning') || appEl.parentNode;
                var nextBlock = parentBlock ? parentBlock.nextElementSibling : null;

                var btn = mk('button', 'bkbg-cw-btn', { background: o.btnBg, color: o.btnColor });
                btn.textContent = o.buttonLabel;

                if (nextBlock) {
                    nextBlock.style.display = 'none';
                    var notice = mk('p', 'bkbg-cw-hidden-notice', { color: o.textColor }, 'Content is hidden. Click the button below to reveal it.');
                    wrap.appendChild(notice);

                    btn.addEventListener('click', function () {
                        nextBlock.style.display = '';
                        wrap.style.display = 'none';
                    });
                }
                wrap.appendChild(btn);
            }

            typoCssVarsForEl(o.typoLabel, '--bkbg-cw-label-', outerWrap);
            typoCssVarsForEl(o.typoMessage, '--bkbg-cw-msg-', outerWrap);

            outerWrap.appendChild(wrap);
            appEl.parentNode.insertBefore(outerWrap, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
