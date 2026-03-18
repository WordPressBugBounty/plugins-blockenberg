(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family: 'font-family', weight: 'font-weight', style: 'font-style',
            decoration: 'text-decoration', transform: 'text-transform',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
        };
        Object.keys(map).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) {
                    v = v + (typo.sizeUnit || 'px');
                } else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) {
                    v = v + (typo.lineHeightUnit || '');
                } else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.letterSpacingUnit || 'px');
                } else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) {
                    v = v + (typo.wordSpacingUnit || 'px');
                }
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    var SYMBOLS = ['*', '†', '‡', '§', '‖', '¶', '#', '**', '††', '‡‡'];

    function getMarker(style, i) {
        if (style === 'letter') return String.fromCharCode(97 + i);
        if (style === 'roman') {
            var nums = [1,4,5,9,10,40,50,90,100,400,500,900,1000];
            var syms = ['i','iv','v','ix','x','xl','l','xc','c','cd','d','cm','m'];
            var n = i + 1, out = '';
            for (var k = nums.length - 1; k >= 0; k--) {
                while (n >= nums[k]) { out += syms[k]; n -= nums[k]; }
            }
            return out;
        }
        if (style === 'symbol') return SYMBOLS[i % SYMBOLS.length];
        return String(i + 1);
    }

    function init() {
        document.querySelectorAll('.bkbg-fn-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                notes: [],
                title: 'Notes',
                showTitle: true,
                markerStyle: 'number',
                showTooltip: true,
                listStyle: 'default',
                dividerEnabled: true,
                fontSize: 14,
                titleSize: 16,
                borderRadius: 6,
                bgColor: '#f8fafc',
                borderColor: '#e2e8f0',
                titleColor: '#0f172a',
                textColor: '#475569',
                markerColor: '#3b82f6',
                markerBg: '#eff6ff',
                dividerColor: '#e2e8f0',
                tooltipBg: '#1e293b',
                tooltipColor: '#f1f5f9'
            }, opts);

            // ── build block ──────────────────────────────────────────────────────
            var block = document.createElement('div');
            block.className = 'bkbg-fn-block';
            block.style.background = o.bgColor;
            block.style.borderRadius = o.borderRadius + 'px';
            block.style.padding = '20px 24px';
            block.style.boxSizing = 'border-box';

            typoCssVarsForEl(o.typoTitle, '--bkbg-fn-tt-', block);
            typoCssVarsForEl(o.typoNote, '--bkbg-fn-nt-', block);

            if (o.dividerEnabled) {
                var div = document.createElement('div');
                div.className = 'bkbg-fn-divider';
                div.style.borderTopColor = o.dividerColor;
                block.appendChild(div);
            }

            if (o.showTitle && o.title) {
                var titleEl = document.createElement('div');
                titleEl.className = 'bkbg-fn-title';
                titleEl.textContent = o.title;
                titleEl.style.color = o.titleColor;
                block.appendChild(titleEl);
            }

            var list = document.createElement('ol');
            list.className = 'bkbg-fn-list bkbg-fn-list-' + o.listStyle;
            list.style.listStyle = 'none';
            list.style.margin = '0';
            list.style.padding = '0';

            o.notes.forEach(function (note, i) {
                var li = document.createElement('li');
                li.className = 'bkbg-fn-item';
                li.id = 'fn-' + note.id;
                li.style.color = o.textColor;
                if (o.listStyle === 'card') li.style.borderColor = o.borderColor;

                var marker = document.createElement('span');
                marker.className = 'bkbg-fn-marker';
                marker.textContent = getMarker(o.markerStyle, i);
                marker.style.background = o.markerBg;
                marker.style.color = o.markerColor;

                var textSpan = document.createElement('span');
                textSpan.className = 'bkbg-fn-text';
                textSpan.textContent = note.text;

                li.appendChild(marker);
                li.appendChild(textSpan);
                list.appendChild(li);
            });

            block.appendChild(list);

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';

            // ── inject inline markers into page (if showTooltip) ──────────────────
            // Looks for [fn:1] [fn:2] shortcodes already in the page content
            // and replaces them with superscript markers with tooltips
            if (o.showTooltip && o.notes.length) {
                var body = document.body;
                var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null, false);
                var nodesToReplace = [];
                var node;
                while ((node = walker.nextNode())) {
                    if (/\[fn:\d+\]/.test(node.textContent)) {
                        nodesToReplace.push(node);
                    }
                }
                nodesToReplace.forEach(function (textNode) {
                    var parent = textNode.parentNode;
                    if (!parent) return;
                    var frag = document.createDocumentFragment();
                    var parts = textNode.textContent.split(/(\[fn:\d+\])/);
                    parts.forEach(function (part) {
                        var match = part.match(/^\[fn:(\d+)\]$/);
                        if (match) {
                            var noteId = parseInt(match[1], 10);
                            var noteObj = o.notes.filter(function (n) { return n.id === noteId; })[0];
                            if (noteObj) {
                                var ref = document.createElement('span');
                                ref.className = 'bkbg-fn-ref';
                                ref.style.color = o.markerColor;
                                ref.style.background = o.markerBg;
                                ref.setAttribute('tabindex', '0');
                                var idx = o.notes.indexOf(noteObj);
                                ref.textContent = getMarker(o.markerStyle, idx);
                                ref.setAttribute('href', '#fn-' + noteId);

                                var tooltip = document.createElement('span');
                                tooltip.className = 'bkbg-fn-tooltip';
                                tooltip.textContent = noteObj.text;
                                tooltip.style.background = o.tooltipBg;
                                tooltip.style.color = o.tooltipColor;
                                tooltip.style.setProperty('border-top-color', o.tooltipBg);
                                ref.appendChild(tooltip);
                                frag.appendChild(ref);
                            } else {
                                frag.appendChild(document.createTextNode(part));
                            }
                        } else {
                            frag.appendChild(document.createTextNode(part));
                        }
                    });
                    parent.replaceChild(frag, textNode);
                });
            }
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
