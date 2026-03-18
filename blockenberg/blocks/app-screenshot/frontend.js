(function () {
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

    function init() {
        document.querySelectorAll('.bkbg-aps-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'The Platform',
                heading: 'Everything You Need in One Place',
                subtext: 'A powerful, intuitive dashboard designed to help you move faster.',
                screenshotUrl: '',
                callouts: [],
                showCallouts: true,
                deviceFrame: 'browser',
                layout: 'centered',
                ctaLabel: 'See It in Action',
                ctaUrl: '#',
                showCta: true,
                bgColor: '#ffffff',
                headingColor: '#111827',
                subColor: '#6b7280',
                eyebrowColor: '#6366f1',
                frameColor: '#1e293b',
                calloutBg: '#6366f1',
                calloutColor: '#ffffff',
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                maxWidth: 1200,
                paddingTop: 80,
                paddingBottom: 80
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            // Typography CSS vars
            typoCssVarsForEl(o.eyebrowTypo, '--bkbg-aps-eyebrow-', el);
            typoCssVarsForEl(o.headingTypo, '--bkbg-aps-heading-', el);
            typoCssVarsForEl(o.subtextTypo, '--bkbg-aps-sub-', el);
            if (o.eyebrowFontSize && o.eyebrowFontSize !== 13) el.style.setProperty('--bkbg-aps-eyebrow-sz', o.eyebrowFontSize + 'px');
            if (o.headingFontSize && o.headingFontSize !== 36) el.style.setProperty('--bkbg-aps-heading-sz', o.headingFontSize + 'px');
            if (o.subtextFontSize && o.subtextFontSize !== 18) el.style.setProperty('--bkbg-aps-sub-sz', o.subtextFontSize + 'px');

            var inner = document.createElement('div');
            inner.className = 'bkbg-aps-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            var isSplit = o.layout === 'split';
            var outerWrap = inner;

            if (isSplit) {
                var splitGrid = document.createElement('div');
                splitGrid.className = 'bkbg-aps-split';
                inner.appendChild(splitGrid);
                outerWrap = splitGrid;
            }

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-aps-header';

            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-aps-eyebrow';
            eyebrow.style.color = o.eyebrowColor;
            eyebrow.innerHTML = o.eyebrow;

            var heading = document.createElement('h2');
            heading.className = 'bkbg-aps-heading';
            heading.style.color = o.headingColor;
            heading.innerHTML = o.heading;

            var sub = document.createElement('p');
            sub.className = 'bkbg-aps-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;

            header.appendChild(eyebrow);
            header.appendChild(heading);
            header.appendChild(sub);

            if (o.showCta) {
                var cta = document.createElement('a');
                cta.className = 'bkbg-aps-cta';
                cta.href = o.ctaUrl;
                cta.style.cssText = 'background:' + o.ctaBg + ';color:' + o.ctaColor;
                cta.textContent = o.ctaLabel;
                header.appendChild(cta);
            }

            outerWrap.appendChild(header);

            /* Screenshot */
            var frameWrap = document.createElement('div');
            frameWrap.className = 'bkbg-aps-frame-wrap frame-' + o.deviceFrame;
            if (o.deviceFrame !== 'none') {
                frameWrap.style.cssText = 'border-color:' + o.frameColor;
            }

            if (o.deviceFrame === 'browser') {
                var bar = document.createElement('div');
                bar.className = 'bkbg-aps-browser-bar';
                bar.style.background = o.frameColor;
                ['#ef4444', '#fbbf24', '#22c55e'].forEach(function (c) {
                    var dot = document.createElement('span');
                    dot.className = 'bkbg-aps-browser-dot';
                    dot.style.background = c;
                    bar.appendChild(dot);
                });
                frameWrap.appendChild(bar);
            }

            if (o.screenshotUrl) {
                var img = document.createElement('img');
                img.className = 'bkbg-aps-screenshot';
                img.src = o.screenshotUrl;
                img.alt = '';
                frameWrap.appendChild(img);
            } else {
                var placeholder = document.createElement('div');
                placeholder.style.cssText = 'min-height:360px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:18px;';
                placeholder.textContent = '🖼 App screenshot goes here';
                frameWrap.appendChild(placeholder);
            }

            /* Callout points */
            if (o.showCallouts && o.callouts && o.callouts.length) {
                var calloutsLayer = document.createElement('div');
                calloutsLayer.className = 'bkbg-aps-callouts';
                frameWrap.style.position = 'relative';

                o.callouts.forEach(function (c) {
                    var callout = document.createElement('div');
                    callout.className = 'bkbg-aps-callout';
                    callout.style.cssText = 'left:' + c.x + '%;top:' + c.y + '%;';

                    var label = document.createElement('div');
                    label.className = 'bkbg-aps-callout-label';
                    label.style.cssText = 'background:' + o.calloutBg + ';color:' + o.calloutColor;
                    label.textContent = c.label;

                    if (c.description) {
                        var tooltip = document.createElement('div');
                        tooltip.className = 'bkbg-aps-callout-tooltip';
                        tooltip.textContent = c.description;
                        label.appendChild(tooltip);
                    }

                    var dot = document.createElement('div');
                    dot.className = 'bkbg-aps-callout-dot';
                    dot.style.cssText = 'background:' + o.calloutBg + ';color:' + o.calloutBg;

                    callout.appendChild(label);
                    callout.appendChild(dot);
                    calloutsLayer.appendChild(callout);
                });

                frameWrap.appendChild(calloutsLayer);
            }

            outerWrap.appendChild(frameWrap);
            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
