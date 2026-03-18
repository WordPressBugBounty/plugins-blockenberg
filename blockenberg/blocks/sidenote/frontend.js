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

    function init() {
        document.querySelectorAll('.bkbg-sdn-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                text: '',
                label: 'Note',
                showLabel: true,
                icon: '📝',
                iconType: 'custom-char',
                iconDashicon: 'edit',
                iconImageUrl: '',
                showIcon: true,
                position: 'right',
                style: 'bordered',
                width: 260,
                bgColor: '#fffbeb',
                borderColor: '#fbbf24',
                accentColor: '#d97706',
                labelColor: '#92400e',
                textColor: '#78350f',
                iconColor: '#d97706',
                fontSize: 13,
                borderRadius: 6,
                paddingTop: 0,
                paddingBottom: 0
            }, opts);

            var isInline = o.position === 'inline';

            /* outer wrapper for padding */
            var outer = document.createElement('div');
            outer.style.cssText = 'padding-top:' + o.paddingTop + 'px;padding-bottom:' + o.paddingBottom + 'px;';
            typoCssVarsForEl(outer, o.labelTypo, '--bksdn-lt-');
            typoCssVarsForEl(outer, o.textTypo, '--bksdn-tt-');

            /* sidenote element */
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-sdn-wrap bkbg-sdn-' + o.position + ' bkbg-sdn-' + o.style;

            if (!isInline) {
                wrap.style.width = o.width + 'px';
            }
            wrap.style.background = o.bgColor;
            wrap.style.borderRadius = o.borderRadius + 'px';
            wrap.style.color = o.textColor;
            wrap.style.boxSizing = 'border-box';
            wrap.style.overflow = 'hidden';

            /* apply style-specific overrides */
            if (o.style === 'bordered') {
                wrap.style.border = '1px solid ' + o.borderColor;
                wrap.style.borderLeft = '4px solid ' + o.accentColor;
                wrap.style.padding = '10px 13px';
            } else if (o.style === 'filled') {
                wrap.style.border = '1px solid ' + o.borderColor;
                wrap.style.padding = '10px 13px';
            } else if (o.style === 'minimal') {
                wrap.style.borderLeft = '3px solid ' + o.accentColor;
                wrap.style.paddingLeft = '10px';
                wrap.style.background = 'transparent';
            } else if (o.style === 'sticky') {
                wrap.style.border = '1px solid ' + o.borderColor;
                wrap.style.padding = '10px 13px 16px';
                wrap.style.boxShadow = '2px 3px 8px rgba(0,0,0,0.10)';
            }

            /* label row */
            if (o.showLabel || o.showIcon) {
                var labelRow = document.createElement('div');
                labelRow.className = 'bkbg-sdn-label-row';

                if (o.showIcon) {
                    var IP = window.bkbgIconPicker;
                    var iconNode = IP ? IP.buildFrontendIcon(o.iconType, o.icon, o.iconDashicon, o.iconImageUrl, o.iconDashiconColor) : null;
                    if (iconNode) {
                        iconNode.classList.add('bkbg-sdn-icon');
                        iconNode.style.color = o.iconColor;
                        labelRow.appendChild(iconNode);
                    } else if (o.icon) {
                        var iconEl = document.createElement('span');
                        iconEl.className = 'bkbg-sdn-icon';
                        iconEl.style.color = o.iconColor;
                        iconEl.textContent = o.icon;
                        labelRow.appendChild(iconEl);
                    }
                }

                if (o.showLabel && o.label) {
                    var labelEl = document.createElement('span');
                    labelEl.className = 'bkbg-sdn-label';
                    labelEl.style.color = o.labelColor;
                    labelEl.textContent = o.label;
                    labelRow.appendChild(labelEl);
                }

                wrap.appendChild(labelRow);
            }

            /* text */
            if (o.text) {
                var textEl = document.createElement('p');
                textEl.className = 'bkbg-sdn-text';
                textEl.style.color = o.textColor;
                textEl.innerHTML = o.text;
                wrap.appendChild(textEl);
            }

            outer.appendChild(wrap);

            /* clearfix after floating notes */
            if (!isInline) {
                var clear = document.createElement('div');
                clear.className = 'bkbg-sdn-clear';
                outer.appendChild(clear);
            }

            el.parentNode.insertBefore(outer, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
