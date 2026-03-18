(function () {
    'use strict';

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

    /* ─── Lightweight Markdown Parser ─── */
    function parseMarkdown(md) {
        var lines = md.split('\n');
        var html = '';
        var i = 0;

        function escHtml(s) {
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function inlineFormat(s) {
            s = escHtml(s);
            s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
            s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
            s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
            s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            s = s.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
            s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
            s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
            s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
            s = s.replace(/  $/, '<br>');
            return s;
        }

        while (i < lines.length) {
            var line = lines[i];

            /* Fenced code block */
            if (/^```/.test(line)) {
                var lang = line.slice(3).trim();
                var code = '';
                i++;
                while (i < lines.length && !/^```/.test(lines[i])) {
                    code += escHtml(lines[i]) + '\n';
                    i++;
                }
                html += '<pre><code' + (lang ? ' class="language-' + escHtml(lang) + '"' : '') + '>' + code + '</code></pre>';
                i++;
                continue;
            }

            /* ATX Headings */
            var hm = line.match(/^(#{1,6})\s+(.+)/);
            if (hm) {
                var level = hm[1].length;
                html += '<h' + level + '>' + inlineFormat(hm[2].trim()) + '</h' + level + '>';
                i++;
                continue;
            }

            /* Horizontal rule */
            if (/^([-*_]){3,}\s*$/.test(line)) {
                html += '<hr>';
                i++;
                continue;
            }

            /* Blockquote */
            if (/^>\s?/.test(line)) {
                var bq = '';
                while (i < lines.length && /^>\s?/.test(lines[i])) {
                    bq += lines[i].replace(/^>\s?/, '') + '\n';
                    i++;
                }
                html += '<blockquote>' + parseMarkdown(bq.trim()) + '</blockquote>';
                continue;
            }

            /* Unordered list */
            if (/^[-*+]\s/.test(line)) {
                html += '<ul>';
                while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
                    html += '<li>' + inlineFormat(lines[i].replace(/^[-*+]\s/, '')) + '</li>';
                    i++;
                }
                html += '</ul>';
                continue;
            }

            /* Ordered list */
            if (/^\d+\.\s/.test(line)) {
                html += '<ol>';
                while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                    html += '<li>' + inlineFormat(lines[i].replace(/^\d+\.\s/, '')) + '</li>';
                    i++;
                }
                html += '</ol>';
                continue;
            }

            /* Table (GFM) */
            if (/\|/.test(line) && i + 1 < lines.length && /^\|?[-:| ]+\|/.test(lines[i + 1])) {
                var headers = line.split('|').filter(function (c, idx, arr) { return idx > 0 || c.trim(); }).map(function (c) { return c.trim(); });
                i += 2;
                html += '<table><thead><tr>';
                headers.forEach(function (h) { html += '<th>' + inlineFormat(h) + '</th>'; });
                html += '</tr></thead><tbody>';
                while (i < lines.length && /\|/.test(lines[i])) {
                    var cells = lines[i].split('|').filter(function (c, idx) { return idx > 0 || c.trim(); }).map(function (c) { return c.trim(); });
                    html += '<tr>';
                    cells.forEach(function (c) { html += '<td>' + inlineFormat(c) + '</td>'; });
                    html += '</tr>';
                    i++;
                }
                html += '</tbody></table>';
                continue;
            }

            /* Empty line → paragraph separator */
            if (/^\s*$/.test(line)) {
                html += '';
                i++;
                continue;
            }

            /* Paragraph */
            var para = '';
            while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^[-*+]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) && !/^>/.test(lines[i]) && !/^```/.test(lines[i]) && !/^([-*_]){3,}\s*$/.test(lines[i]) && !/\|/.test(lines[i])) {
                if (para) para += ' ';
                para += lines[i];
                i++;
            }
            if (para) html += '<p>' + inlineFormat(para) + '</p>';
        }

        return html;
    }


    function initBlock(root) {
        var opts;
        try { opts = JSON.parse(root.getAttribute('data-opts')); } catch (e) { return; }
        var a = opts;

        root.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mdp-wrap';
        wrap.style.cssText = 'max-width:' + a.contentMaxWidth + 'px;margin:0 auto;';
        typoCssVarsForEl(wrap, a.titleTypo, '--bkbg-mdp-tt-');
        root.appendChild(wrap);

        if (a.showTitle) {
            var h = document.createElement('div');
            h.className = 'bkbg-mdp-title';
            h.style.color = a.titleColor;
            h.textContent = a.title;
            wrap.appendChild(h);
        }

        var container = document.createElement('div');
        container.className = 'bkbg-mdp-container';
        container.style.cssText = 'border-color:' + a.borderColor + ';';
        wrap.appendChild(container);

        /* Toolbar */
        if (a.showToolbar) {
            var toolbar = document.createElement('div');
            toolbar.className = 'bkbg-mdp-toolbar';
            toolbar.style.cssText = 'background:' + a.toolbarBg + ';color:' + a.toolbarColor + ';';
            container.appendChild(toolbar);

            var tools = [
                { label: 'B',   title: 'Bold',        prefix: '**', suffix: '**', wrap: true },
                { label: 'I',   title: 'Italic',       prefix: '_',  suffix: '_',  wrap: true },
                { label: 'S',   title: 'Strikethrough',prefix: '~~', suffix: '~~', wrap: true },
                { label: 'H1',  title: 'Heading 1',    line: '# ' },
                { label: 'H2',  title: 'Heading 2',    line: '## ' },
                { label: 'H3',  title: 'Heading 3',    line: '### ' },
                { label: '{ }', title: 'Inline Code',  prefix: '`',  suffix: '`',  wrap: true },
                { label: '🔗',  title: 'Link',          prefix: '[',  suffix: '](url)', wrap: true },
                { label: '≡',   title: 'Bullet List',  line: '- ' },
                { label: '1.',  title: 'Ordered List', line: '1. ' },
                { label: '❝',   title: 'Blockquote',   line: '> ' },
                { label: '━',   title: 'Horizontal Rule', insert: '\n---\n' }
            ];

            tools.forEach(function (tool, idx) {
                if (idx === 3 || idx === 6 || idx === 12) {
                    var sep = document.createElement('div');
                    sep.className = 'bkbg-mdp-toolbar-sep';
                    toolbar.appendChild(sep);
                }
                var btn = document.createElement('button');
                btn.className = 'bkbg-mdp-tool-btn';
                btn.style.color = a.toolbarColor;
                btn.textContent = tool.label;
                btn.title = tool.title;
                btn.addEventListener('click', function () {
                    var ta = editorEl;
                    var start = ta.selectionStart, end = ta.selectionEnd;
                    var sel = ta.value.slice(start, end);
                    var before = ta.value.slice(0, start);
                    var after = ta.value.slice(end);
                    var newVal, newCaret;

                    if (tool.insert) {
                        newVal = before + tool.insert + after;
                        newCaret = start + tool.insert.length;
                    } else if (tool.wrap) {
                        var replacement = tool.prefix + (sel || 'text') + tool.suffix;
                        newVal = before + replacement + after;
                        newCaret = start + replacement.length;
                    } else if (tool.line) {
                        var lineStart = before.lastIndexOf('\n') + 1;
                        var lineBefore = ta.value.slice(0, lineStart);
                        var lineContent = ta.value.slice(lineStart);
                        newVal = lineBefore + tool.line + lineContent;
                        newCaret = lineStart + tool.line.length + (end - lineStart);
                    }

                    ta.value = newVal;
                    ta.selectionStart = ta.selectionEnd = newCaret;
                    ta.focus();
                    ta.dispatchEvent(new Event('input'));
                });
                toolbar.appendChild(btn);
            });

            /* Copy buttons */
            if (a.showCopyBtn) {
                var tbRight = document.createElement('div');
                tbRight.className = 'bkbg-mdp-toolbar-right';
                toolbar.appendChild(tbRight);

                var copyMdBtn = document.createElement('button');
                copyMdBtn.className = 'bkbg-mdp-copy-btn';
                copyMdBtn.style.background = a.accentColor;
                copyMdBtn.textContent = 'Copy MD';
                copyMdBtn.addEventListener('click', function () {
                    navigator.clipboard && navigator.clipboard.writeText(editorEl.value).then(function () {
                        copyMdBtn.textContent = '✓ Copied';
                        setTimeout(function () { copyMdBtn.textContent = 'Copy MD'; }, 1500);
                    });
                });

                var copyHtmlBtn = document.createElement('button');
                copyHtmlBtn.className = 'bkbg-mdp-copy-btn';
                copyHtmlBtn.style.background = '#64748b';
                copyHtmlBtn.textContent = 'Copy HTML';
                copyHtmlBtn.addEventListener('click', function () {
                    navigator.clipboard && navigator.clipboard.writeText(previewEl.innerHTML).then(function () {
                        copyHtmlBtn.textContent = '✓ Copied';
                        setTimeout(function () { copyHtmlBtn.textContent = 'Copy HTML'; }, 1500);
                    });
                });

                tbRight.appendChild(copyMdBtn);
                tbRight.appendChild(copyHtmlBtn);
            }
        }

        /* Split */
        var split = document.createElement('div');
        split.className = 'bkbg-mdp-split';
        split.style.height = a.editorHeight + 'px';
        container.appendChild(split);

        /* Editor pane */
        var editorPane = document.createElement('div');
        editorPane.className = 'bkbg-mdp-pane';
        editorPane.style.cssText = 'background:' + a.editorBg + ';border-right:1px solid rgba(255,255,255,0.08);';
        split.appendChild(editorPane);

        var editorLabel = document.createElement('div');
        editorLabel.className = 'bkbg-mdp-pane-label';
        editorLabel.style.cssText = 'color:' + a.toolbarColor + ';background:' + a.toolbarBg + ';border-color:rgba(255,255,255,0.08);';
        editorLabel.textContent = 'Markdown';
        editorPane.appendChild(editorLabel);

        var editorEl = document.createElement('textarea');
        editorEl.className = 'bkbg-mdp-editor';
        editorEl.style.cssText = 'background:' + a.editorBg + ';color:' + a.editorColor + ';';
        editorEl.value = a.defaultContent;
        editorEl.spellcheck = false;
        editorPane.appendChild(editorEl);

        /* Preview pane */
        var previewPane = document.createElement('div');
        previewPane.className = 'bkbg-mdp-pane';
        previewPane.style.background = a.previewBg;
        split.appendChild(previewPane);

        var previewLabel = document.createElement('div');
        previewLabel.className = 'bkbg-mdp-pane-label';
        previewLabel.style.cssText = 'color:#6b7280;border-color:' + a.borderColor + ';background:#f9fafb;';
        previewLabel.textContent = 'Preview';
        previewPane.appendChild(previewLabel);

        var previewEl = document.createElement('div');
        previewEl.className = 'bkbg-mdp-preview-pane';
        previewEl.style.color = a.previewColor;
        previewPane.appendChild(previewEl);

        /* Status bar */
        if (a.showWordCount) {
            var statusBar = document.createElement('div');
            statusBar.className = 'bkbg-mdp-statusbar';
            statusBar.style.cssText = 'background:' + a.toolbarBg + ';color:' + a.toolbarColor + ';border-color:rgba(255,255,255,0.08);';
            var wordCountEl = document.createElement('span');
            statusBar.appendChild(wordCountEl);
            var charCountEl = document.createElement('span');
            statusBar.appendChild(charCountEl);
            container.appendChild(statusBar);
        }

        function updateWordCount(text) {
            if (!a.showWordCount) return;
            var words = text.trim() ? text.trim().split(/\s+/).length : 0;
            wordCountEl.textContent = words + ' words';
            charCountEl.textContent = text.length + ' chars';
        }

        function render() {
            previewEl.innerHTML = parseMarkdown(editorEl.value);
            updateWordCount(editorEl.value);
        }

        editorEl.addEventListener('input', function () { render(); });

        /* Tab key support */
        editorEl.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var start = editorEl.selectionStart, end = editorEl.selectionEnd;
                editorEl.value = editorEl.value.slice(0, start) + '  ' + editorEl.value.slice(end);
                editorEl.selectionStart = editorEl.selectionEnd = start + 2;
            }
        });

        /* Sync scroll */
        if (a.syncScroll) {
            editorEl.addEventListener('scroll', function () {
                var pct = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
                previewEl.scrollTop = pct * (previewEl.scrollHeight - previewEl.clientHeight);
            });
        }

        render();
    }

    function init() {
        document.querySelectorAll('.bkbg-mdp-app').forEach(initBlock);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
