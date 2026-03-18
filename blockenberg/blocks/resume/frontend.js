(function () {
    var CONTACT_ICONS = { email: '✉', phone: '📞', location: '📍', website: '🌐' };

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

    function initials(name) {
        return (name || 'A').split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
    }

    function sectionHeader(title, accentColor, textColor) {
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-rv-section-header';

        var bar = document.createElement('span');
        bar.className = 'bkbg-rv-section-bar';
        bar.style.background = accentColor;

        var label = document.createElement('span');
        label.className = 'bkbg-rv-section-label';
        label.textContent = title;
        label.style.color = textColor;

        wrap.appendChild(bar);
        wrap.appendChild(label);
        return wrap;
    }

    function buildDivider(color) {
        var d = document.createElement('div');
        d.style.cssText = 'height:1px;background:' + color + ';margin:0 0 16px';
        return d;
    }

    function buildExperience(exp, o, isLast) {
        var item = document.createElement('div');
        item.className = 'bkbg-rv-exp-item';
        item.style.cssText = 'padding-bottom:' + (isLast ? 0 : 20) + 'px;margin-bottom:' + (isLast ? 0 : 4) + 'px';

        // Timeline column
        var tCol = document.createElement('div');
        tCol.className = 'bkbg-rv-timeline-col';

        var dot = document.createElement('div');
        dot.className = 'bkbg-rv-timeline-dot';
        dot.style.background = o.timelineDotColor;
        tCol.appendChild(dot);

        if (!isLast) {
            var line = document.createElement('div');
            line.className = 'bkbg-rv-timeline-line';
            line.style.background = o.dividerColor;
            tCol.appendChild(line);
        }

        // Content
        var content = document.createElement('div');
        content.className = 'bkbg-rv-exp-content';

        var meta = document.createElement('div');
        meta.className = 'bkbg-rv-exp-meta';

        var leftDiv = document.createElement('div');

        var role = document.createElement('div');
        role.className = 'bkbg-rv-exp-role';
        role.textContent = exp.role;
        role.style.color = o.sectionHeadingColor;

        var company = document.createElement('div');
        company.className = 'bkbg-rv-exp-company';
        company.textContent = exp.company + (exp.location ? ' · ' + exp.location : '');
        company.style.color = o.accentColor;

        leftDiv.appendChild(role);
        leftDiv.appendChild(company);

        var dates = document.createElement('div');
        dates.className = 'bkbg-rv-exp-dates';
        dates.textContent = exp.startDate + ' – ' + (exp.isCurrent ? 'Present' : exp.endDate);
        dates.style.color = o.subtextColor;

        meta.appendChild(leftDiv);
        meta.appendChild(dates);
        content.appendChild(meta);

        if (exp.description) {
            var desc = document.createElement('p');
            desc.className = 'bkbg-rv-exp-desc';
            desc.textContent = exp.description;
            desc.style.color = o.textColor;
            content.appendChild(desc);
        }

        item.appendChild(tCol);
        item.appendChild(content);
        return item;
    }

    function buildEducation(edu, o, isLast) {
        var item = document.createElement('div');
        item.className = 'bkbg-rv-edu-item';
        if (!isLast) {
            item.style.cssText = 'padding-bottom:16px;border-bottom:1px solid ' + o.dividerColor + ';margin-bottom:16px';
        }

        var meta = document.createElement('div');
        meta.className = 'bkbg-rv-edu-meta';

        var leftDiv = document.createElement('div');

        var degree = document.createElement('div');
        degree.className = 'bkbg-rv-edu-degree';
        degree.textContent = edu.degree;
        degree.style.color = o.sectionHeadingColor;

        var institution = document.createElement('div');
        institution.className = 'bkbg-rv-edu-institution';
        institution.textContent = edu.institution;
        institution.style.color = o.accentColor;

        leftDiv.appendChild(degree);
        leftDiv.appendChild(institution);

        var years = document.createElement('div');
        years.className = 'bkbg-rv-edu-years';
        years.textContent = edu.startYear + (edu.endYear && edu.endYear !== edu.startYear ? ' – ' + edu.endYear : '');
        years.style.color = o.subtextColor;

        meta.appendChild(leftDiv);
        meta.appendChild(years);
        item.appendChild(meta);

        if (edu.description) {
            var desc = document.createElement('p');
            desc.className = 'bkbg-rv-edu-desc';
            desc.textContent = edu.description;
            desc.style.color = o.textColor;
            item.appendChild(desc);
        }

        return item;
    }

    function buildSkillGroup(skill, o) {
        var group = document.createElement('div');
        group.className = 'bkbg-rv-skill-group';
        group.style.marginBottom = '14px';

        var cat = document.createElement('div');
        cat.className = 'bkbg-rv-skill-cat';
        cat.textContent = skill.category;
        cat.style.color = o.sectionHeadingColor;
        group.appendChild(cat);

        var tags = document.createElement('div');
        tags.className = 'bkbg-rv-tags';

        (skill.items || '').split(',').forEach(function (item) {
            var t = item.trim();
            if (!t) return;
            var tag = document.createElement('span');
            tag.className = 'bkbg-rv-tag';
            tag.textContent = t;
            tag.style.background = o.tagBg;
            tag.style.color = o.tagColor;
            tags.appendChild(tag);
        });

        group.appendChild(tags);
        return group;
    }

    function init() {
        document.querySelectorAll('.bkbg-rv-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                name: 'Alex Morgan', jobTitle: 'Senior Product Designer',
                summary: '', email: '', phone: '', location: '', website: '',
                photoUrl: '', showPhoto: true, showSummary: true, showExperience: true,
                showEducation: true, showSkills: true, showContact: true,
                experienceTitle: 'Work Experience', educationTitle: 'Education',
                skillsTitle: 'Skills', summaryTitle: 'About',
                experience: [], education: [], skills: [],
                layout: 'classic', maxWidth: 820, containerPadding: 40,
                borderRadius: 12, sectionGap: 36, avatarSize: 88,
                accentColor: '#6366f1', bgColor: '#ffffff', headerBg: '#f8fafc',
                sectionHeadingColor: '#111827', textColor: '#374151',
                subtextColor: '#6b7280', tagBg: '#f1f5f9', tagColor: '#475569',
                dividerColor: '#e5e7eb', timelineDotColor: '#6366f1',
            }, opts);

            var outer = document.createElement('div');
            outer.className = 'bkbg-rv-outer layout-' + o.layout;

            typoCssVarsForEl(outer, o.nameTypo, '--bkrv-nm-');
            typoCssVarsForEl(outer, o.bodyTypo, '--bkrv-bt-');

            var card = document.createElement('div');
            card.className = 'bkbg-rv-card';
            card.style.cssText = [
                'max-width:' + o.maxWidth + 'px',
                'margin:0 auto',
                'border-radius:' + o.borderRadius + 'px',
                'background:' + o.bgColor,
                'border:1px solid ' + o.dividerColor,
                'overflow:hidden',
            ].join(';');

            // ── Header ──
            var header = document.createElement('div');
            header.className = 'bkbg-rv-header';
            header.style.cssText = [
                'background:' + o.headerBg,
                'padding:' + o.containerPadding + 'px',
                'border-bottom:1px solid ' + o.dividerColor,
            ].join(';');

            if (o.showPhoto) {
                if (o.photoUrl) {
                    var img = document.createElement('img');
                    img.className = 'bkbg-rv-avatar';
                    img.src = o.photoUrl;
                    img.alt = o.name;
                    img.style.cssText = 'width:' + o.avatarSize + 'px;height:' + o.avatarSize + 'px';
                    header.appendChild(img);
                } else {
                    var fallback = document.createElement('div');
                    fallback.className = 'bkbg-rv-avatar-fallback';
                    fallback.textContent = initials(o.name);
                    fallback.style.cssText = [
                        'width:' + o.avatarSize + 'px',
                        'height:' + o.avatarSize + 'px',
                        'font-size:' + Math.round(o.avatarSize * 0.38) + 'px',
                        'background:' + o.accentColor,
                    ].join(';');
                    header.appendChild(fallback);
                }
            }

            var headerInfo = document.createElement('div');
            headerInfo.style.flexGrow = '1';

            var nameEl = document.createElement('h2');
            nameEl.className = 'bkbg-rv-name';
            nameEl.textContent = o.name;
            nameEl.style.color = o.sectionHeadingColor;
            headerInfo.appendChild(nameEl);

            var titleEl = document.createElement('p');
            titleEl.className = 'bkbg-rv-title';
            titleEl.textContent = o.jobTitle;
            titleEl.style.cssText = 'font-size:16px;color:' + o.accentColor;
            headerInfo.appendChild(titleEl);

            if (o.showContact) {
                var contacts = document.createElement('div');
                contacts.className = 'bkbg-rv-contacts';
                contacts.style.color = o.subtextColor;

                var fields = [
                    { key: 'email', value: o.email, href: 'mailto:' + o.email },
                    { key: 'phone', value: o.phone, href: 'tel:' + o.phone },
                    { key: 'location', value: o.location, href: null },
                    { key: 'website', value: o.website, href: (o.website && !/^https?:\/\//.test(o.website) ? 'https://' : '') + o.website },
                ];

                fields.forEach(function (f) {
                    if (!f.value) return;
                    var el;
                    if (f.href) {
                        el = document.createElement('a');
                        el.href = f.href;
                        el.rel = 'noopener';
                    } else {
                        el = document.createElement('span');
                    }
                    el.className = 'bkbg-rv-contact-item';
                    el.style.color = o.subtextColor;
                    el.textContent = (CONTACT_ICONS[f.key] || '') + ' ' + f.value;
                    contacts.appendChild(el);
                });

                headerInfo.appendChild(contacts);
            }

            header.appendChild(headerInfo);
            card.appendChild(header);

            // ── Body ──
            var body = document.createElement('div');
            body.className = 'bkbg-rv-body';
            body.style.padding = o.containerPadding + 'px';

            var cp = o.containerPadding;
            var sg = o.sectionGap;

            // Summary
            if (o.showSummary && o.summary) {
                var sumSection = document.createElement('div');
                sumSection.className = 'bkbg-rv-section';
                sumSection.style.marginBottom = sg + 'px';
                sumSection.appendChild(sectionHeader(o.summaryTitle, o.accentColor, o.sectionHeadingColor));
                var sumText = document.createElement('p');
                sumText.className = 'bkbg-rv-summary';
                sumText.style.cssText = 'margin:0;color:' + o.textColor;
                sumText.textContent = o.summary;
                sumSection.appendChild(sumText);
                body.appendChild(sumSection);
            }

            // Experience
            if (o.showExperience && o.experience && o.experience.length) {
                var expSection = document.createElement('div');
                expSection.className = 'bkbg-rv-section';
                expSection.style.marginBottom = sg + 'px';
                expSection.appendChild(sectionHeader(o.experienceTitle, o.accentColor, o.sectionHeadingColor));
                var expList = document.createElement('div');
                expList.style.marginTop = '12px';
                o.experience.forEach(function (exp, i) {
                    expList.appendChild(buildExperience(exp, o, i === o.experience.length - 1));
                });
                expSection.appendChild(expList);
                body.appendChild(expSection);
            }

            // Education
            if (o.showEducation && o.education && o.education.length) {
                var eduSection = document.createElement('div');
                eduSection.className = 'bkbg-rv-section';
                eduSection.style.marginBottom = sg + 'px';
                eduSection.appendChild(sectionHeader(o.educationTitle, o.accentColor, o.sectionHeadingColor));
                var eduList = document.createElement('div');
                eduList.style.marginTop = '12px';
                o.education.forEach(function (edu, i) {
                    eduList.appendChild(buildEducation(edu, o, i === o.education.length - 1));
                });
                eduSection.appendChild(eduList);
                body.appendChild(eduSection);
            }

            // Skills
            if (o.showSkills && o.skills && o.skills.length) {
                var skillSection = document.createElement('div');
                skillSection.className = 'bkbg-rv-section';
                skillSection.appendChild(sectionHeader(o.skillsTitle, o.accentColor, o.sectionHeadingColor));
                var skillList = document.createElement('div');
                skillList.style.marginTop = '12px';
                o.skills.forEach(function (skill) {
                    skillList.appendChild(buildSkillGroup(skill, o));
                });
                skillSection.appendChild(skillList);
                body.appendChild(skillSection);
            }

            card.appendChild(body);
            outer.appendChild(card);

            appEl.parentNode.insertBefore(outer, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();
