(function () {
    'use strict';

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

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function mkText(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }

    function getStatusStyle(status, o) {
        if (status === 'done')        return { background: o.doneBg,       color: o.doneColor       };
        if (status === 'in-progress') return { background: o.inProgressBg, color: o.inProgressColor };
        if (status === 'planned')     return { background: o.plannedBg,    color: o.plannedColor    };
        return null;
    }

    function getStatusLabel(status) {
        if (status === 'done')        return '✓ Done';
        if (status === 'in-progress') return '⟳ In Progress';
        if (status === 'planned')     return '○ Planned';
        return '';
    }

    function init() {
        document.querySelectorAll('.bkbg-content-outline-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                outlineTitle:    opts.outlineTitle  || 'Article Outline',
                showTitle:       opts.showTitle     !== false,
                intro:           opts.intro         || '',
                showIntro:       opts.showIntro     !== false,
                sections:        opts.sections      || [],
                style:           opts.style         || 'card',
                showNumbers:     opts.showNumbers   !== false,
                showStatus:      opts.showStatus    !== false,
                showReadTime:    opts.showReadTime  !== false,
                showDescription: opts.showDescription !== false,
                showPoints:      opts.showPoints    !== false,
                collapsible:     opts.collapsible   || false,
                borderRadius:    opts.borderRadius  !== undefined ? opts.borderRadius : 12,
                gap:             opts.gap           !== undefined ? opts.gap : 16,
                fontSize:        opts.fontSize      !== undefined ? opts.fontSize : 14,
                sectionTitleSize:opts.sectionTitleSize !== undefined ? opts.sectionTitleSize : 16,
                titleFontSize:   opts.titleFontSize !== undefined ? opts.titleFontSize : 22,
                bgColor:         opts.bgColor         || '#f8fafc',
                cardBg:          opts.cardBg          || '#ffffff',
                borderColor:     opts.borderColor     || '#e2e8f0',
                titleColor:      opts.titleColor      || '#0f172a',
                introColor:      opts.introColor      || '#64748b',
                numberBg:        opts.numberBg        || '#6366f1',
                numberColor:     opts.numberColor     || '#ffffff',
                sectionTitleColor:opts.sectionTitleColor || '#1e293b',
                descriptionColor: opts.descriptionColor || '#64748b',
                pointColor:      opts.pointColor      || '#374151',
                accentColor:     opts.accentColor     || '#6366f1',
                doneBg:          opts.doneBg          || '#dcfce7',
                doneColor:       opts.doneColor       || '#166534',
                inProgressBg:    opts.inProgressBg    || '#fef9c3',
                inProgressColor: opts.inProgressColor || '#854d0e',
                plannedBg:       opts.plannedBg       || '#f1f5f9',
                plannedColor:    opts.plannedColor    || '#475569'
            };

            var isCard    = o.style === 'card';
            var isList    = o.style === 'list';
            var isCompact = o.style === 'compact';

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-co-block' + (o.collapsible ? ' bkbg-co-collapsible' : ''), {
                background: o.bgColor,
                borderRadius: o.borderRadius + 'px',
                boxSizing: 'border-box'
            });

            /* ── Header ──────────────────────────────────────── */
            if (o.showTitle || o.showIntro) {
                var header = mk('div', 'bkbg-co-header', {
                    borderColor: o.borderColor,
                    marginBottom: o.gap + 'px',
                    paddingBottom: '16px'
                });
                if (o.showTitle && o.outlineTitle) {
                    var titleEl = mkText('h3', 'bkbg-co-title', o.outlineTitle, {
                        color: o.titleColor
                    });
                    header.appendChild(titleEl);
                }
                if (o.showIntro && o.intro) {
                    header.appendChild(mkText('p', 'bkbg-co-intro', o.intro, { color: o.introColor }));
                }
                block.appendChild(header);
            }

            /* ── Sections ────────────────────────────────────── */
            var sectionsWrap = mk('div', 'bkbg-co-sections', { gap: o.gap + 'px' });

            /* Progress tracking */
            var totalPoints = 0, donePoints = 0;

            o.sections.forEach(function (section, sIdx) {
                var sectionEl = mk('div', 'bkbg-co-section' + (isCard ? ' is-card' : ''));

                if (isCard) {
                    sectionEl.style.background = o.cardBg;
                    sectionEl.style.border = '1px solid ' + o.borderColor;
                    sectionEl.style.borderRadius = o.borderRadius + 'px';
                } else {
                    sectionEl.style.borderBottom = '1px solid ' + o.borderColor;
                    sectionEl.style.paddingBottom = '12px';
                }

                /* Section head */
                var headPad = isCard ? '16px 20px' : '12px 0';
                var headBorderB = (o.showPoints && section.points && section.points.length > 0 && isCard)
                    ? '1px solid ' + o.borderColor : 'none';

                var head = mk('div', 'bkbg-co-section-head', {
                    padding: headPad,
                    borderBottom: headBorderB
                });

                /* Number badge */
                if (o.showNumbers) {
                    var numBadge = mkText('div', 'bkbg-co-number', String(sIdx + 1), {
                        background: o.numberBg,
                        color: o.numberColor
                    });
                    head.appendChild(numBadge);
                }

                /* Title + description */
                var info = mk('div', 'bkbg-co-section-info');
                info.appendChild(mkText('div', 'bkbg-co-section-title', section.title || '', {
                    color: o.sectionTitleColor
                }));
                if (o.showDescription && section.description) {
                    info.appendChild(mkText('div', 'bkbg-co-section-desc', section.description, { color: o.descriptionColor }));
                }
                head.appendChild(info);

                /* Read time */
                if (o.showReadTime && section.readTime > 0) {
                    head.appendChild(mkText('span', 'bkbg-co-read-time', section.readTime + ' min', { color: o.descriptionColor }));
                }

                /* Collapsible toggle */
                if (o.collapsible) {
                    var toggleBtn = mkText('button', 'bkbg-co-toggle is-open', '▸');
                    head.appendChild(toggleBtn);
                }

                sectionEl.appendChild(head);

                /* Points body */
                if (o.showPoints && section.points && section.points.length) {
                    var bodyEl = mk('div', 'bkbg-co-body');
                    var ptsPad = isCard ? '10px 20px 16px 20px' : '8px 0 4px ' + (o.showNumbers ? '40px' : '0');
                    var ptsList = mk('ul', 'bkbg-co-points', { padding: ptsPad });

                    section.points.forEach(function (point) {
                        totalPoints++;
                        if (point.status === 'done') donePoints++;

                        var li = mk('li', 'bkbg-co-point', {
                            marginBottom: '7px',
                            fontSize: o.fontSize + 'px'
                        });

                        li.appendChild(mkText('span', 'bkbg-co-arrow', '▸', { color: o.accentColor }));
                        li.appendChild(mkText('span', 'bkbg-co-point-text', point.text || '', { color: o.pointColor }));

                        if (o.showStatus && point.status && point.status !== 'none') {
                            var stStyle = getStatusStyle(point.status, o);
                            if (stStyle) {
                                var badge = mkText('span', 'bkbg-co-status', getStatusLabel(point.status), stStyle);
                                li.appendChild(badge);
                            }
                        }

                        ptsList.appendChild(li);
                    });

                    bodyEl.appendChild(ptsList);
                    sectionEl.appendChild(bodyEl);

                    /* Wire up collapsible */
                    if (o.collapsible) {
                        var toggleBtnRef = head.querySelector('.bkbg-co-toggle');
                        bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';

                        toggleBtnRef.addEventListener('click', function () {
                            var isOpen = toggleBtnRef.classList.contains('is-open');
                            if (isOpen) {
                                bodyEl.style.maxHeight = '0';
                                toggleBtnRef.classList.remove('is-open');
                            } else {
                                bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
                                toggleBtnRef.classList.add('is-open');
                            }
                        });
                    }
                }

                sectionsWrap.appendChild(sectionEl);
            });

            block.appendChild(sectionsWrap);
            typoCssVarsForEl(opts.typoTitle, '--bkco-title-', block);
            typoCssVarsForEl(opts.typoSection, '--bkco-sec-', block);
            /* ── Overall progress bar ────────────────────────── */
            if (totalPoints > 0) {
                var pct = Math.round((donePoints / totalPoints) * 100);
                var barWrap = mk('div', 'bkbg-co-progress-bar', { marginTop: o.gap + 'px' });
                var fill = mk('div', 'bkbg-co-progress-fill', {
                    background: o.accentColor,
                    width: pct + '%'
                });
                barWrap.appendChild(fill);
                block.appendChild(barWrap);
            }

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
