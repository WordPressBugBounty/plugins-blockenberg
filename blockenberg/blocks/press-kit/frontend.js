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

    var typeIcons = { logo: '🎨', document: '📄', photo: '📷', other: '📦' };

    function init() {
        document.querySelectorAll('.bkbg-prk-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Press Room', heading: 'Media Kit & Brand Assets',
                subtext: 'Everything you need to write about us.',
                companyName: 'Acme Inc.',
                companyBlurb: 'A leading provider of innovative software solutions.',
                assets: [
                    { label: 'Logo Pack', description: 'SVG + PNG', fileUrl: '#', previewUrl: '', type: 'logo' },
                    { label: 'Brand Guidelines', description: 'PDF', fileUrl: '#', previewUrl: '', type: 'document' }
                ],
                brandColors: [
                    { name: 'Indigo', hex: '#6366f1' },
                    { name: 'Slate', hex: '#0f172a' }
                ],
                showBrandColors: true,
                showDownloadAll: true,
                downloadAllUrl: '#',
                downloadAllLabel: 'Download Full Press Kit',
                pressEmail: 'press@example.com',
                showPressContact: true,
                bgColor: '#ffffff',
                headingColor: '#111827',
                subColor: '#6b7280',
                eyebrowColor: '#6366f1',
                cardBg: '#f8fafc',
                cardBorder: '#e2e8f0',
                assetLabelColor: '#111827',
                assetDescColor: '#6b7280',
                downloadBg: '#6366f1',
                downloadColor: '#ffffff',
                accentColor: '#6366f1',
                blurbColor: '#374151',
                maxWidth: 1100,
                paddingTop: 80,
                paddingBottom: 80
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var inner = document.createElement('div');
            inner.className = 'bkbg-prk-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-prk-header';
            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-prk-eyebrow';
            eyebrow.style.color = o.eyebrowColor;
            eyebrow.innerHTML = o.eyebrow;
            var heading = document.createElement('h2');
            heading.className = 'bkbg-prk-heading';
            heading.style.color = o.headingColor;
            heading.innerHTML = o.heading;
            var sub = document.createElement('p');
            sub.className = 'bkbg-prk-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;
            header.appendChild(eyebrow);
            header.appendChild(heading);
            header.appendChild(sub);
            inner.appendChild(header);

            /* Company blurb */
            var blurb = document.createElement('div');
            blurb.className = 'bkbg-prk-blurb-box';
            blurb.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;

            var blurbTitle = document.createElement('div');
            blurbTitle.className = 'bkbg-prk-blurb-title';
            blurbTitle.style.color = o.headingColor;
            blurbTitle.textContent = 'About ' + o.companyName;

            var blurbText = document.createElement('p');
            blurbText.className = 'bkbg-prk-blurb-text';
            blurbText.style.color = o.blurbColor;
            blurbText.innerHTML = o.companyBlurb;

            blurb.appendChild(blurbTitle);
            blurb.appendChild(blurbText);
            inner.appendChild(blurb);

            /* Assets grid */
            var grid = document.createElement('div');
            grid.className = 'bkbg-prk-assets-grid';

            (o.assets || []).forEach(function (asset) {
                var card = document.createElement('div');
                card.className = 'bkbg-prk-asset-card';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;

                var icon = document.createElement('div');
                icon.className = 'bkbg-prk-asset-icon';
                icon.textContent = typeIcons[asset.type] || '📦';

                var info = document.createElement('div');
                info.className = 'bkbg-prk-asset-info';

                var label = document.createElement('div');
                label.className = 'bkbg-prk-asset-label';
                label.style.color = o.assetLabelColor;
                label.textContent = asset.label;

                var desc = document.createElement('div');
                desc.className = 'bkbg-prk-asset-desc';
                desc.style.color = o.assetDescColor;
                desc.textContent = asset.description;

                info.appendChild(label);
                info.appendChild(desc);

                var dlBtn = document.createElement('a');
                dlBtn.className = 'bkbg-prk-asset-dl';
                dlBtn.href = asset.fileUrl;
                dlBtn.download = '';
                dlBtn.style.cssText = 'background:' + o.downloadBg + ';color:' + o.downloadColor;
                dlBtn.textContent = '⬇ Download';

                card.appendChild(icon);
                card.appendChild(info);
                card.appendChild(dlBtn);
                grid.appendChild(card);
            });
            inner.appendChild(grid);

            /* Brand colors */
            if (o.showBrandColors && o.brandColors && o.brandColors.length) {
                var colSection = document.createElement('div');
                colSection.className = 'bkbg-prk-colors-section';

                var colTitle = document.createElement('div');
                colTitle.className = 'bkbg-prk-colors-title';
                colTitle.style.color = o.headingColor;
                colTitle.textContent = 'Brand Colors';
                colSection.appendChild(colTitle);

                var colRow = document.createElement('div');
                colRow.className = 'bkbg-prk-colors-row';

                o.brandColors.forEach(function (c) {
                    var swatch = document.createElement('div');
                    swatch.className = 'bkbg-prk-color-swatch';

                    var chip = document.createElement('div');
                    chip.className = 'bkbg-prk-color-chip';
                    chip.style.background = c.hex;

                    var name = document.createElement('div');
                    name.className = 'bkbg-prk-color-name';
                    name.style.color = o.headingColor;
                    name.textContent = c.name;

                    var hex = document.createElement('div');
                    hex.className = 'bkbg-prk-color-hex';
                    hex.style.color = o.subColor;
                    hex.textContent = c.hex;

                    swatch.appendChild(chip);
                    swatch.appendChild(name);
                    swatch.appendChild(hex);
                    colRow.appendChild(swatch);
                });

                colSection.appendChild(colRow);
                inner.appendChild(colSection);
            }

            /* Footer */
            var footer = document.createElement('div');
            footer.className = 'bkbg-prk-footer';

            if (o.showDownloadAll && o.downloadAllLabel) {
                var dlAll = document.createElement('a');
                dlAll.className = 'bkbg-prk-dl-all';
                dlAll.href = o.downloadAllUrl;
                dlAll.style.cssText = 'background:' + o.downloadBg + ';color:' + o.downloadColor;
                dlAll.textContent = '📦 ' + o.downloadAllLabel;
                footer.appendChild(dlAll);
            }

            if (o.showPressContact && o.pressEmail) {
                var contact = document.createElement('a');
                contact.className = 'bkbg-prk-contact-link';
                contact.href = 'mailto:' + o.pressEmail;
                contact.style.cssText = 'color:' + o.accentColor + ';border-color:' + o.accentColor;
                contact.textContent = '✉️ ' + o.pressEmail;
                footer.appendChild(contact);
            }

            inner.appendChild(footer);
            el.appendChild(inner);

            /* Apply typography CSS vars to the block wrapper */
            var wrapper = el.parentElement;
            if (wrapper) {
                typoCssVarsForEl(wrapper, o.headingTypo, '--bkbg-prk-h-');
                typoCssVarsForEl(wrapper, o.subtextTypo, '--bkbg-prk-st-');
                typoCssVarsForEl(wrapper, o.eyebrowTypo, '--bkbg-prk-ey-');
                typoCssVarsForEl(wrapper, o.bodyTypo, '--bkbg-prk-bd-');
                typoCssVarsForEl(wrapper, o.assetLabelTypo, '--bkbg-prk-al-');
                typoCssVarsForEl(wrapper, o.assetDescTypo, '--bkbg-prk-ad-');
            }
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
