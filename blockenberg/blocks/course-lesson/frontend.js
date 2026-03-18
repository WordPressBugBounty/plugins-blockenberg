function typoCssVarsForEl(typo, prefix, el) {
    if (!typo || typeof typo !== 'object') return;
    var map = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        transform: 'text-transform', decoration: 'text-decoration',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        sizeUnit: null,
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        lineHeightUnit: null,
        letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
        letterSpacingUnit: null,
        wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m',
        wordSpacingUnit: null
    };
    var sizeU = typo.sizeUnit || 'px';
    var lhU   = typo.lineHeightUnit || '';
    var lsU   = typo.letterSpacingUnit || 'px';
    var wsU   = typo.wordSpacingUnit || 'px';
    Object.keys(map).forEach(function (k) {
        var css = map[k]; if (!css) return;
        var v = typo[k]; if (v === undefined || v === '' || v === null) return;
        if (/size|spacing/i.test(k)) {
            var u = /letterSpacing/.test(k) ? lsU : /wordSpacing/.test(k) ? wsU : /lineHeight/.test(k) ? lhU : sizeU;
            v = v + u;
        }
        el.style.setProperty(prefix + css, v);
    });
}

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

    var resourceIcon = { article: '📄', video: '🎥', download: '⬇️', exercise: '✏️', link: '🔗' };
    var diffInfo = {
        beginner:     { label: '🟢 Beginner',     bg: '#dcfce7', color: '#14532d' },
        intermediate: { label: '🟡 Intermediate', bg: '#fef9c3', color: '#713f12' },
        advanced:     { label: '🔴 Advanced',     bg: '#fee2e2', color: '#991b1b' }
    };

    function sectionBoxStyle(type, a) {
        if (type === 'tip')     return { background: a.tipBg,     color: a.tipColor,     borderLeftColor: a.tipBorder };
        if (type === 'warning') return { background: a.warningBg, color: a.warningColor, borderLeftColor: a.warningBorder };
        if (type === 'note')    return { background: a.noteBg,    color: a.noteColor,    borderLeftColor: a.noteBorder };
        return null;
    }

    function sectionIcon(type) {
        if (type === 'tip')     return '💡 ';
        if (type === 'warning') return '⚠️ ';
        if (type === 'note')    return '📝 ';
        return '';
    }

    function pill(text, bg, color) {
        var s = tx('span', 'bkbg-cl-pill', text);
        s.style.background = bg;
        s.style.color = color;
        return s;
    }

    function sectionHead(label, accentColor) {
        var h = tx('div', 'bkbg-cl-section-head', label);
        h.style.color = accentColor;
        h.style.borderBottomColor = accentColor;
        return h;
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            lessonTitle: '', moduleTitle: '', showModule: true,
            lessonNumber: '', showLessonNumber: true,
            duration: '', showDuration: true,
            difficulty: 'intermediate', showDifficulty: true,
            instructor: '', showInstructor: true,
            prerequisites: [], showPrerequisites: true, prerequisitesLabel: 'Prerequisites',
            objectives: [], showObjectives: true, objectivesLabel: "What You'll Learn",
            intro: '', showIntro: true,
            sections: [], showSections: true,
            resources: [], showResources: true, resourcesLabel: 'Resources',
            prevLesson: '', prevLessonUrl: '#', nextLesson: '', nextLessonUrl: '#', showNav: true,
            fontSize: 15, titleFontSize: 26, lineHeight: 170, borderRadius: 12,
            bgColor: '#ffffff', borderColor: '#e5e7eb', headerBg: '#0f172a',
            headerColor: '#ffffff', metaColor: '#94a3b8',
            introBg: '#f0f9ff', introColor: '#0369a1',
            objectiveBg: '#f0fdf4', objectiveColor: '#14532d', objectiveDot: '#22c55e',
            prereqBg: '#f8fafc', prereqColor: '#374151', prereqDot: '#94a3b8',
            textColor: '#374151', headingColor: '#111827',
            tipBg: '#fefce8', tipColor: '#713f12', tipBorder: '#fbbf24',
            warningBg: '#fff7ed', warningColor: '#9a3412', warningBorder: '#f97316',
            noteBg: '#eff6ff', noteColor: '#1e40af', noteBorder: '#3b82f6',
            resourceBg: '#f8fafc', accentColor: '#3b82f6', navBg: '#f8fafc'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var lh = (a.lineHeight / 100).toFixed(2);
        var diff = diffInfo[a.difficulty] || diffInfo.intermediate;

        var wrap = mk('div', 'bkbg-cl-wrap');
        wrap.style.border = '1px solid ' + a.borderColor;
        wrap.style.borderRadius = a.borderRadius + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.background = a.bgColor;
        typoCssVarsForEl(a.typoTitle, '--bkbg-cles-ttl-', wrap);
        typoCssVarsForEl(a.typoBody, '--bkbg-cles-body-', wrap);

        // ---- Header ----
        var header = mk('div', 'bkbg-cl-header');
        header.style.background = a.headerBg;

        // Breadcrumb
        var breadcrumb = mk('div', 'bkbg-cl-breadcrumb');
        if (a.showModule && a.moduleTitle) {
            var mod = tx('span', 'bkbg-cl-module', a.moduleTitle);
            mod.style.color = a.metaColor;
            ap(breadcrumb, mod);
        }
        if (a.showModule && a.showLessonNumber) {
            var sep = tx('span', 'bkbg-cl-sep', '/');
            sep.style.color = a.metaColor;
            ap(breadcrumb, sep);
        }
        if (a.showLessonNumber && a.lessonNumber) {
            var lnum = tx('span', 'bkbg-cl-lesson-num', a.lessonNumber);
            lnum.style.color = a.metaColor;
            ap(breadcrumb, lnum);
        }
        ap(header, breadcrumb);

        var titleEl = tx('h2', 'bkbg-cl-title', a.lessonTitle);
        titleEl.style.color = a.headerColor;
        ap(header, titleEl);

        var meta = mk('div', 'bkbg-cl-meta');
        if (a.showDuration && a.duration)     ap(meta, pill('⏱ ' + a.duration, 'rgba(255,255,255,.1)', '#cbd5e1'));
        if (a.showDifficulty)                  ap(meta, pill(diff.label, diff.bg, diff.color));
        if (a.showInstructor && a.instructor)  ap(meta, pill('👤 ' + a.instructor, 'rgba(255,255,255,.1)', '#cbd5e1'));
        ap(header, meta);
        ap(wrap, header);

        // ---- Body ----
        var body = mk('div', 'bkbg-cl-body');

        // Intro
        if (a.showIntro && a.intro) {
            var introDiv = mk('div', 'bkbg-cl-intro');
            introDiv.style.background = a.introBg;
            var introP = tx('p', '', a.intro);
            introP.style.color = a.introColor;
            introP.style.lineHeight = lh;
            ap(introDiv, introP);
            ap(body, introDiv);
        }

        // Objectives + Prerequisites
        if (a.showObjectives || a.showPrerequisites) {
            var learnRow = mk('div', 'bkbg-cl-learn-row');
            var cols = (a.showObjectives && a.showPrerequisites) ? 2 : 1;
            learnRow.style.gridTemplateColumns = cols === 2 ? '1fr 1fr' : '1fr';

            if (a.showObjectives && a.objectives.length > 0) {
                var objCard = mk('div', 'bkbg-cl-obj-card');
                objCard.style.background = a.objectiveBg;
                ap(objCard, sectionHead(a.objectivesLabel, a.accentColor));
                var objList = mk('ul', 'bkbg-cl-list');
                a.objectives.forEach(function (obj) {
                    var li = mk('li', 'bkbg-cl-list-item');
                    var dot = tx('span', 'bkbg-cl-list-dot', '✓');
                    dot.style.color = a.objectiveDot;
                    var txt = tx('span', '', obj);
                    txt.style.color = a.objectiveColor;
                    ap(li, dot, txt);
                    ap(objList, li);
                });
                ap(objCard, objList);
                ap(learnRow, objCard);
            }

            if (a.showPrerequisites && a.prerequisites.length > 0) {
                var preCard = mk('div', 'bkbg-cl-prereq-card');
                preCard.style.background = a.prereqBg;
                ap(preCard, sectionHead(a.prerequisitesLabel, a.accentColor));
                var preList = mk('ul', 'bkbg-cl-list');
                a.prerequisites.forEach(function (p) {
                    var li = mk('li', 'bkbg-cl-list-item');
                    var dot = tx('span', 'bkbg-cl-list-dot', '•');
                    dot.style.color = a.prereqDot;
                    var txt = tx('span', '', p);
                    txt.style.color = a.prereqColor;
                    ap(li, dot, txt);
                    ap(preList, li);
                });
                ap(preCard, preList);
                ap(learnRow, preCard);
            }
            ap(body, learnRow);
        }

        // Content Sections
        if (a.showSections && a.sections.length > 0) {
            var contentWrap = mk('div');
            ap(contentWrap, sectionHead('Lesson Content', a.accentColor));
            var secGrid = mk('div', 'bkbg-cl-sections');
            a.sections.forEach(function (sec) {
                var isBox = sec.type !== 'text';
                var boxStyle = sectionBoxStyle(sec.type, a);
                var secDiv = mk('div', isBox ? 'bkbg-cl-section bkbg-cl-section-box' : 'bkbg-cl-section');
                if (boxStyle) {
                    Object.keys(boxStyle).forEach(function (k) { secDiv.style[k] = boxStyle[k]; });
                }
                var heading = tx('h4', '', sectionIcon(sec.type) + sec.heading);
                heading.style.color = isBox ? 'inherit' : a.headingColor;
                var content = tx('p', '', sec.content);
                content.style.color = isBox ? 'inherit' : a.textColor;
                content.style.lineHeight = lh;
                ap(secDiv, heading, content);
                ap(secGrid, secDiv);
            });
            ap(contentWrap, secGrid);
            ap(body, contentWrap);
        }

        // Resources
        if (a.showResources && a.resources.length > 0) {
            var resWrap = mk('div');
            ap(resWrap, sectionHead(a.resourcesLabel, a.accentColor));
            var resGrid = mk('div', 'bkbg-cl-resources');
            a.resources.forEach(function (r) {
                var link = mk('a', 'bkbg-cl-resource');
                link.href = r.url || '#';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.background = a.resourceBg;
                link.style.borderLeftColor = a.accentColor;
                var icon = tx('span', 'bkbg-cl-resource-icon', resourceIcon[r.type] || '🔗');
                var title = tx('span', 'bkbg-cl-resource-title', r.title);
                title.style.color = a.accentColor;
                ap(link, icon, title);
                ap(resGrid, link);
            });
            ap(resWrap, resGrid);
            ap(body, resWrap);
        }

        ap(wrap, body);

        // ---- Nav ----
        if (a.showNav) {
            var nav = mk('div', 'bkbg-cl-nav');
            nav.style.background = a.navBg;
            nav.style.borderTopColor = a.borderColor;

            var prevDiv = mk('div', 'bkbg-cl-nav-prev');
            var prevLabel = tx('div', 'bkbg-cl-nav-label', '← Previous');
            var prevTitle = mk('a', 'bkbg-cl-nav-title');
            prevTitle.href = a.prevLessonUrl || '#';
            prevTitle.textContent = a.prevLesson;
            prevTitle.style.color = a.accentColor;
            ap(prevDiv, prevLabel, prevTitle);

            var nextDiv = mk('div', 'bkbg-cl-nav-next');
            var nextLabel = tx('div', 'bkbg-cl-nav-label', 'Next →');
            var nextTitle = mk('a', 'bkbg-cl-nav-title');
            nextTitle.href = a.nextLessonUrl || '#';
            nextTitle.textContent = a.nextLesson;
            nextTitle.style.color = a.accentColor;
            ap(nextDiv, nextLabel, nextTitle);

            ap(nav, prevDiv, nextDiv);
            ap(wrap, nav);
        }

        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() {
        document.querySelectorAll('.bkbg-course-lesson-app').forEach(buildBlock);
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
