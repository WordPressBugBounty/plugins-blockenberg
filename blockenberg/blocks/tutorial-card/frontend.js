(function () {
    'use strict';

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function tx(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function ap(parent) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) parent.appendChild(c); });
        return parent;
    }

    function difficultyInfo(d) {
        if (d === 'beginner') return { label: '🟢 Beginner',     bg: '#dcfce7', color: '#14532d' };
        if (d === 'advanced') return { label: '🔴 Advanced',     bg: '#fee2e2', color: '#991b1b' };
        return                       { label: '🟡 Intermediate', bg: '#fef9c3', color: '#854d0e' };
    }

    function sectionHead(labelText, accentColor, borderColor, parentEl) {
        var wrap  = mk('div', 'bkbg-tc-section-head');
        var label = tx('span', 'bkbg-tc-section-label', labelText, { color: accentColor });
        var rule  = mk('div', 'bkbg-tc-section-rule', { background: borderColor });
        ap(wrap, label, rule);
        ap(parentEl, wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-tutorial-card-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                tutorialTitle: 'Tutorial', subtitle: '', author: '', showAuthor: true,
                difficulty: 'intermediate', duration: '', showDuration: true,
                completionRate: 0, showProgress: false,
                prerequisites: [], showPrerequisites: true, prerequisitesLabel: 'Prerequisites',
                steps: [], showSteps: true, stepsLabel: 'Steps',
                showStepDurations: true, showTips: true,
                materials: [], showMaterials: true, materialsLabel: "What you'll need",
                outcomes: [], showOutcomes: true, outcomesLabel: "What you'll learn",
                fontSize: 14, titleFontSize: 22, lineHeight: 168, borderRadius: 12,
                bgColor: '#ffffff', borderColor: '#e5e7eb',
                headerBg: '#0f172a', headerColor: '#ffffff',
                accentColor: '#3b82f6',
                stepNumberBg: '#3b82f6', stepNumberColor: '#ffffff',
                stepBorderColor: '#e5e7eb',
                stepTipBg: '#fffbeb', stepTipColor: '#92400e', stepTipBorderColor: '#fcd34d',
                prerequisiteBg: '#f1f5f9', prerequisiteColor: '#334155',
                materialBg: '#f0f9ff', materialColor: '#0c4a6e',
                outcomeBg: '#f0fdf4', outcomeColor: '#14532d',
                progressBg: '#e5e7eb', progressFill: '#3b82f6'
            }, opts);

            var lh = (o.lineHeight / 100).toFixed(2);

            // ── Block wrapper ─────────────────────────────────────
            var block = mk('div', 'bkbg-tc-block', {
                border: '1px solid ' + o.borderColor,
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden',
                background: o.bgColor
            });

            // ── Header ───────────────────────────────────────────
            var header = mk('div', 'bkbg-tc-header', { background: o.headerBg });

            // Meta row: difficulty + duration + author
            var diff = difficultyInfo(o.difficulty);
            var metaRow = mk('div', 'bkbg-tc-meta-row');
            ap(metaRow, tx('span', 'bkbg-tc-difficulty', diff.label, { background: diff.bg, color: diff.color }));
            if (o.showDuration && o.duration) {
                ap(metaRow, tx('span', 'bkbg-tc-meta-item', '⏱ ' + o.duration, { color: o.headerColor }));
            }
            if (o.showAuthor && o.author) {
                ap(metaRow, tx('span', 'bkbg-tc-meta-item', '✍️ ' + o.author, { color: o.headerColor }));
            }
            ap(header, metaRow);

            // Title
            ap(header, tx('h2', 'bkbg-tc-title', o.tutorialTitle, {
                color: o.headerColor
            }));

            // Subtitle
            if (o.subtitle) {
                ap(header, tx('p', 'bkbg-tc-subtitle', o.subtitle, {
                    color: o.headerColor
                }));
            }

            // Progress bar
            if (o.showProgress) {
                var progWrap = mk('div', 'bkbg-tc-progress-wrap');
                var progLbl  = mk('div', 'bkbg-tc-progress-label');
                ap(progLbl,
                    tx('span', '', 'Progress', { color: o.headerColor }),
                    tx('span', '', o.completionRate + '%', { color: o.headerColor })
                );
                var track = mk('div', 'bkbg-tc-progress-track', { background: 'rgba(255,255,255,.2)' });
                var fill  = mk('div', 'bkbg-tc-progress-fill', { background: o.progressFill, width: o.completionRate + '%' });
                ap(track, fill);
                ap(progWrap, progLbl, track);
                ap(header, progWrap);
            }
            ap(block, header);

            // ── Body ─────────────────────────────────────────────
            var body = mk('div', 'bkbg-tc-body');

            // Outcomes
            if (o.showOutcomes && o.outcomes && o.outcomes.length > 0) {
                sectionHead(o.outcomesLabel || "What you'll learn", o.accentColor, o.borderColor, body);
                var outcomeList = mk('ul', 'bkbg-tc-outcomes');
                o.outcomes.forEach(function (item) {
                    if (!item || !item.text) return;
                    var li   = mk('li', 'bkbg-tc-outcome');
                    var icon = tx('span', 'bkbg-tc-outcome-icon', '✓', { background: o.outcomeBg, color: o.outcomeColor });
                    var txt  = tx('span', 'bkbg-tc-body-text', item.text, { color: '#374151' });
                    ap(li, icon, txt);
                    ap(outcomeList, li);
                });
                ap(body, outcomeList);
            }

            // Prerequisites & Materials — two column row
            var hasPre = o.showPrerequisites && o.prerequisites && o.prerequisites.length > 0;
            var hasMat = o.showMaterials && o.materials && o.materials.length > 0;
            if (hasPre || hasMat) {
                var cols = mk('div', 'bkbg-tc-meta-cols');
                if (hasPre) {
                    var preCol = mk('div', 'bkbg-tc-col');
                    sectionHead(o.prerequisitesLabel || 'Prerequisites', o.accentColor, o.borderColor, preCol);
                    var preList = mk('ul', 'bkbg-tc-list');
                    o.prerequisites.forEach(function (item) {
                        if (!item || !item.text) return;
                        ap(preList, tx('li', 'bkbg-tc-list-item', '→ ' + item.text, {
                            background: o.prerequisiteBg,
                            color: o.prerequisiteColor
                        }));
                    });
                    ap(preCol, preList);
                    ap(cols, preCol);
                }
                if (hasMat) {
                    var matCol = mk('div', 'bkbg-tc-col');
                    sectionHead(o.materialsLabel || "What you'll need", o.accentColor, o.borderColor, matCol);
                    var matList = mk('ul', 'bkbg-tc-list');
                    o.materials.forEach(function (item) {
                        if (!item || !item.text) return;
                        ap(matList, tx('li', 'bkbg-tc-list-item', '◈ ' + item.text, {
                            background: o.materialBg,
                            color: o.materialColor
                        }));
                    });
                    ap(matCol, matList);
                    ap(cols, matCol);
                }
                ap(body, cols);
            }

            // Steps
            if (o.showSteps && o.steps && o.steps.length > 0) {
                sectionHead(o.stepsLabel || 'Steps', o.accentColor, o.borderColor, body);
                var stepList = mk('ol', 'bkbg-tc-steps');

                o.steps.forEach(function (step, i) {
                    var li       = mk('li', 'bkbg-tc-step');
                    var isLast   = i === o.steps.length - 1;
                    if (!isLast) {
                        li.style.borderBottom = '1px solid ' + o.stepBorderColor;
                    }

                    // Number circle
                    var numCircle = tx('div', 'bkbg-tc-step-num', String(i + 1), {
                        background: o.stepNumberBg,
                        color: o.stepNumberColor
                    });

                    // Step body
                    var stepBody = mk('div', 'bkbg-tc-step-body');

                    // Title row
                    var titleRow = mk('div', 'bkbg-tc-step-title-row');
                    ap(titleRow, tx('span', 'bkbg-tc-step-title', step.title || ('Step ' + (i + 1))));
                    if (o.showStepDurations && step.duration) {
                        ap(titleRow, tx('span', 'bkbg-tc-step-duration', '⏱ ' + step.duration));
                    }
                    ap(stepBody, titleRow);

                    // Content
                    ap(stepBody, tx('p', 'bkbg-tc-step-content', step.content || '', {
                        color: '#374151'
                    }));

                    // Tip
                    if (o.showTips && step.tip) {
                        var tip = mk('div', 'bkbg-tc-tip', {
                            background: o.stepTipBg,
                            color: o.stepTipColor,
                            borderLeftColor: o.stepTipBorderColor
                        });
                        var tipStrong = document.createElement('strong');
                        tipStrong.textContent = '💡 Tip: ';
                        tip.appendChild(tipStrong);
                        tip.appendChild(document.createTextNode(step.tip));
                        ap(stepBody, tip);
                    }

                    ap(li, numCircle, stepBody);
                    ap(stepList, li);
                });
                ap(body, stepList);
            }

            ap(block, body);
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
