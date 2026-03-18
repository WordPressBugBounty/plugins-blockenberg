(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = { family:'font-family', weight:'font-weight', transform:'text-transform', style:'font-style', decoration:'text-decoration',
                  sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
                  lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
                  letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
                  wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
        Object.keys(m).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k], u = typo[k + 'Unit'] || '';
                if (/Desktop|Tablet|Mobile/.test(k) && typeof v === 'number') v = v + (u || 'px');
                el.style.setProperty(prefix + m[k], '' + v);
            }
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-dfn-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                term: 'Term',
                pronunciation: '',
                partOfSpeech: 'noun',
                shortDef: '',
                longDef: '',
                etymology: '',
                examples: [''],
                synonyms: '',
                antonyms: '',
                sourceLabel: '',
                sourceUrl: '',
                style: 'card',
                bgColor: '#ffffff',
                borderColor: '#e2e8f0',
                accentColor: '#7c3aed',
                termColor: '#0f172a',
                pronunciationColor: '#7c3aed',
                posColor: '#7c3aed',
                posBg: '#f5f3ff',
                shortDefColor: '#1e293b',
                longDefColor: '#475569',
                exampleColor: '#475569',
                labelColor: '#94a3b8',
                synonymColor: '#7c3aed',
                borderRadius: 10,
                paddingTop: 0,
                paddingBottom: 0,
                showPronunciation: true,
                showPartOfSpeech: true,
                showLongDef: true,
                showExamples: true,
                showSynonyms: true,
                showAntonyms: false,
                showEtymology: false
            }, opts);

            function mk(tag, cls, style, text) {
                var node = document.createElement(tag);
                if (cls) node.className = cls;
                if (style) Object.assign(node.style, style);
                if (text != null) node.textContent = text;
                return node;
            }

            function sectionLabel(txt) {
                var d = mk('div', 'bkbg-dfn-section-label', { color: o.labelColor }, txt);
                return d;
            }

            function tagChips(str, bg, color) {
                var wrap = mk('div', 'bkbg-dfn-tags');
                str.split(',').forEach(function (s) {
                    var t = s.trim();
                    if (!t) return;
                    var chip = mk('span', 'bkbg-dfn-tag', { background: bg, color: color }, t);
                    wrap.appendChild(chip);
                });
                return wrap;
            }

            /* wrap */
            var isSpotlight = o.style === 'spotlight';
            var wrap = mk('div', 'bkbg-dfn-wrap bkbg-dfn-style-' + o.style, {
                background: o.bgColor,
                borderRadius: o.borderRadius + 'px'
            });

            /* Typography CSS vars */
            wrap.style.setProperty('--bkbg-dfn-trm-fs', (o.termFontSize || 24) + 'px');
            wrap.style.setProperty('--bkbg-dfn-sd-fs', (o.shortDefFontSize || 16) + 'px');
            wrap.style.setProperty('--bkbg-dfn-ld-fs', (o.longDefFontSize || 14) + 'px');
            if (o.typoTerm) typoCssVarsForEl(o.typoTerm, '--bkbg-dfn-trm-', wrap);
            if (o.typoShortDef) typoCssVarsForEl(o.typoShortDef, '--bkbg-dfn-sd-', wrap);
            if (o.typoLongDef) typoCssVarsForEl(o.typoLongDef, '--bkbg-dfn-ld-', wrap);
            if (o.style === 'card')       { wrap.style.border = '1px solid ' + o.borderColor; wrap.style.padding = '20px 22px'; }
            if (o.style === 'classic')    { wrap.style.borderLeft = '5px solid ' + o.accentColor; wrap.style.padding = '16px 20px'; }
            if (o.style === 'minimal')    { wrap.style.padding = '8px 0'; }
            if (o.style === 'spotlight')  { wrap.style.border = '1px solid ' + o.borderColor; wrap.style.overflow = 'hidden'; }

            /* header */
            var header = mk('div', 'bkbg-dfn-header');
            if (isSpotlight) { header.style.background = o.accentColor; header.style.padding = '14px 22px'; }

            var headerRow = mk('div', 'bkbg-dfn-header-row');

            var termEl = mk('span', 'bkbg-dfn-term', {
                color: isSpotlight ? '#fff' : o.termColor
            }, '');
            termEl.innerHTML = o.term;
            headerRow.appendChild(termEl);

            if (o.showPronunciation && o.pronunciation) {
                var pron = mk('span', 'bkbg-dfn-pronunciation', {
                    color: isSpotlight ? 'rgba(255,255,255,0.8)' : o.pronunciationColor
                }, o.pronunciation);
                headerRow.appendChild(pron);
            }

            if (o.showPartOfSpeech && o.partOfSpeech) {
                var pos = mk('span', 'bkbg-dfn-pos', {
                    background: isSpotlight ? 'rgba(255,255,255,0.2)' : o.posBg,
                    color: isSpotlight ? '#fff' : o.posColor
                }, o.partOfSpeech);
                headerRow.appendChild(pos);
            }

            header.appendChild(headerRow);
            wrap.appendChild(header);

            /* body */
            var body = mk('div', 'bkbg-dfn-body');
            if (isSpotlight) { body.style.padding = '16px 22px'; }

            /* short def */
            if (o.shortDef) {
                var sd = mk('p', 'bkbg-dfn-short-def', { color: o.shortDefColor }, '');
                sd.innerHTML = o.shortDef;
                body.appendChild(sd);
            }

            /* long def */
            if (o.showLongDef && o.longDef) {
                body.appendChild(sectionLabel('Explanation'));
                var ld = mk('p', 'bkbg-dfn-long-def', { color: o.longDefColor }, '');
                ld.innerHTML = o.longDef;
                body.appendChild(ld);
            }

            /* examples */
            if (o.showExamples && o.examples && o.examples.some(function (e) { return e && e.trim(); })) {
                body.appendChild(sectionLabel('Examples'));
                var ul = mk('ul', 'bkbg-dfn-examples');
                o.examples.forEach(function (ex) {
                    if (!ex || !ex.trim()) return;
                    var li = mk('li', 'bkbg-dfn-example', { color: o.exampleColor });
                    li.style.setProperty('--accent', o.accentColor);
                    li.textContent = ex.trim();
                    ul.appendChild(li);
                });
                body.appendChild(ul);
            }

            /* synonyms */
            if (o.showSynonyms && o.synonyms && o.synonyms.trim()) {
                body.appendChild(sectionLabel('Synonyms'));
                body.appendChild(tagChips(o.synonyms, o.synonymColor + '20', o.synonymColor));
            }

            /* antonyms */
            if (o.showAntonyms && o.antonyms && o.antonyms.trim()) {
                body.appendChild(sectionLabel('Antonyms'));
                body.appendChild(tagChips(o.antonyms, '#dc262620', '#dc2626'));
            }

            /* etymology */
            if (o.showEtymology && o.etymology && o.etymology.trim()) {
                body.appendChild(sectionLabel('Etymology'));
                var ety = mk('p', 'bkbg-dfn-etymology', { color: o.longDefColor }, '');
                ety.innerHTML = o.etymology;
                body.appendChild(ety);
            }

            /* source */
            if (o.sourceLabel || o.sourceUrl) {
                var src = mk('div', 'bkbg-dfn-source', { color: o.labelColor, borderTop: '1px solid ' + o.borderColor });
                if (o.sourceUrl) {
                    var a = document.createElement('a');
                    a.href = o.sourceUrl;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = o.sourceLabel || o.sourceUrl;
                    a.style.color = o.accentColor;
                    src.textContent = '— Source: ';
                    src.appendChild(a);
                } else {
                    src.textContent = '— Source: ' + o.sourceLabel;
                }
                body.appendChild(src);
            }

            wrap.appendChild(body);

            el.parentNode.insertBefore(wrap, el);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
