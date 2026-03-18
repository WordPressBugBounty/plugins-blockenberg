(function () {
    'use strict';
    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
    };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(typo).forEach(function (k) {
            var v = typo[k]; if (v === '' || v == null) return;
            var css = _typoKeys[k]; if (!css) return;
            if ((k === 'letterSpacing' || k === 'wordSpacing') && typeof v === 'number') v = v + 'px';
            if ((/^(sizeDesktop|sizeTablet|sizeMobile)$/).test(k) && typeof v === 'number') v = v + 'px';
            el.style.setProperty(prefix + css, '' + v);
        });
    }

    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    var typeIcons = { lesson: '📖', project: '🔨', quiz: '✏️', reading: '📄', video: '🎬' };
    var difficultyLabels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

    function typeColor(t, a) {
        var map = { lesson: a.lessonColor, project: a.projectColor, quiz: a.quizColor, reading: a.readingColor, video: a.videoColor };
        return map[t] || a.lessonColor;
    }

    function buildStep(step, idx, total, a) {
        var tc = typeColor(step.type, a);
        var stepEl = mk('div', 'bkbg-lp-step');

        // Left column: number + connector
        var left = mk('div', 'bkbg-lp-step-left');
        if (a.showStepNumbers) {
            var num = tx('div', 'bkbg-lp-step-num', String(idx + 1));
            num.style.cssText = 'background:' + a.stepNumBg + ';color:' + a.stepNumColor;
            ap(left, num);
        }
        if (idx < total - 1) {
            var conn = mk('div', 'bkbg-lp-connector');
            conn.style.background = a.connectorColor;
            ap(left, conn);
        }
        ap(stepEl, left);

        // Card
        var card = mk('div', 'bkbg-lp-step-card');
        card.style.cssText = 'background:' + a.stepBg + ';border:1px solid ' + a.stepBorderColor;

        var header = mk('div', 'bkbg-lp-step-header');
        var titleRow = mk('div', 'bkbg-lp-step-title-row');
        var icon = tx('span', 'bkbg-lp-type-icon', typeIcons[step.type] || '📖');
        icon.style.color = tc;
        var stepTitle = tx('span', 'bkbg-lp-step-title', step.title);
        stepTitle.style.color = a.stepTitleColor;
        ap(titleRow, icon, stepTitle);
        ap(header, titleRow);

        if (a.showDuration && step.duration) {
            var dur = tx('span', 'bkbg-lp-duration', '⏱ ' + step.duration);
            dur.style.color = a.durationColor;
            ap(header, dur);
        }
        ap(card, header);

        if (step.description) {
            var desc = tx('p', 'bkbg-lp-step-desc', step.description);
            desc.style.color = a.stepDescColor;
            ap(card, desc);
        }

        if (a.showSkills && step.skills && step.skills.length > 0) {
            var skills = mk('div', 'bkbg-lp-skills');
            step.skills.forEach(function (s) {
                var tag = tx('span', 'bkbg-lp-skill-tag', s);
                tag.style.cssText = 'background:' + a.skillBg + ';color:' + a.skillColor;
                ap(skills, tag);
            });
            ap(card, skills);
        }

        ap(stepEl, card);
        return stepEl;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            pathTitle: 'Learning Path', description: '', showDescription: true,
            totalDuration: '', difficulty: 'intermediate',
            showSkills: true, showDuration: true, showStepNumbers: true, steps: [],
            fontSize: 14, titleFontSize: 24, stepTitleSize: 16, lineHeight: 160, borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb',
            titleColor: '#111827', descColor: '#6b7280',
            stepBg: '#ffffff', stepBorderColor: '#e5e7eb',
            stepTitleColor: '#1f2937', stepDescColor: '#6b7280',
            stepNumBg: '#0f172a', stepNumColor: '#ffffff',
            connectorColor: '#e5e7eb', durationColor: '#6b7280',
            skillBg: '#f1f5f9', skillColor: '#475569',
            metaBg: '#f8fafc', metaBorderColor: '#e2e8f0',
            difficultyBg: '#ede9fe', difficultyColor: '#5b21b6',
            lessonColor: '#2563eb', projectColor: '#d97706',
            quizColor: '#7c3aed', readingColor: '#059669', videoColor: '#dc2626'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);

        var wrap = mk('div', 'bkbg-lp-wrap');
        wrap.style.cssText = 'background:' + a.bgColor + ';border-radius:' + a.borderRadius + 'px;border:1px solid ' + a.borderColor + ';overflow:hidden;font-size:' + a.fontSize + 'px;line-height:' + lh;

        typoCssVarsForEl(wrap, a.titleTypo, '--bkbg-lp-tt-');
        typoCssVarsForEl(wrap, a.descTypo, '--bkbg-lp-d-');
        typoCssVarsForEl(wrap, a.stepTitleTypo, '--bkbg-lp-st-');

        // Header
        var header = mk('div', 'bkbg-lp-header');
        header.style.borderBottom = '1px solid ' + a.borderColor;
        var title = tx('h2', 'bkbg-lp-title', a.pathTitle);
        title.style.color = a.titleColor;
        ap(header, title);
        if (a.showDescription && a.description) {
            var desc = tx('p', 'bkbg-lp-desc', a.description);
            desc.style.color = a.descColor;
            ap(header, desc);
        }
        ap(wrap, header);

        // Meta bar
        var meta = mk('div', 'bkbg-lp-meta');
        meta.style.cssText = 'background:' + a.metaBg + ';border-bottom:1px solid ' + a.metaBorderColor;
        if (a.totalDuration) {
            ap(meta, tx('span', 'bkbg-lp-meta-item', '⏱ ' + a.totalDuration));
        }
        ap(meta, tx('span', 'bkbg-lp-meta-item', '📚 ' + a.steps.length + ' steps'));
        var diff = tx('span', 'bkbg-lp-difficulty', difficultyLabels[a.difficulty] || a.difficulty);
        diff.style.cssText = 'background:' + a.difficultyBg + ';color:' + a.difficultyColor;
        ap(meta, diff);
        ap(wrap, meta);

        // Steps
        var stepsEl = mk('div', 'bkbg-lp-steps');
        a.steps.forEach(function (step, i) {
            ap(stepsEl, buildStep(step, i, a.steps.length, a));
        });
        ap(wrap, stepsEl);

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() { document.querySelectorAll('.bkbg-learning-path-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();
