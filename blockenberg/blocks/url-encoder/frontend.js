(function () {
    'use strict';

    function urlEncode(text) { return encodeURIComponent(text); }
    function urlDecode(text) { try { return {ok: true, val: decodeURIComponent(text)}; } catch(e) { return {ok: false, val: 'Invalid URI sequence — cannot decode.'}; } }
    function b64Encode(text) { try { return {ok: true, val: btoa(unescape(encodeURIComponent(text)))}; } catch(e) { return {ok: false, val: 'Encoding failed.'}; } }
    function b64Decode(text) { try { return {ok: true, val: decodeURIComponent(escape(atob(text)))}; } catch(e) { return {ok: false, val: 'Invalid Base64 — cannot decode.'}; } }

    function process(mode, text) {
        if (!text) return {result: '', error: ''};
        if (mode === 'encode') return {result: urlEncode(text), error: ''};
        if (mode === 'decode') { var d = urlDecode(text); return d.ok ? {result:d.val,error:''} : {result:'',error:d.val}; }
        if (mode === 'b64')    { var e = b64Encode(text); return e.ok ? {result:e.val,error:''} : {result:'',error:e.val}; }
        if (mode === 'b64dec') { var r = b64Decode(text); return r.ok ? {result:r.val,error:''} : {result:'',error:r.val}; }
        return {result:'',error:''};
    }

    function showToast(msg) {
        var t = document.getElementById('bkbg-ue-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'bkbg-ue-toast';
            t.className = 'bkbg-ue-toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._to);
        t._to = setTimeout(function(){ t.classList.remove('show'); }, 2000);
    }

    function initApp(app) {
        var opts;
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch(e) { return; }

        var accent      = opts.accentColor      || '#6c3fb5';
        var cardBg      = opts.cardBg           || '#ffffff';
        var tabActiveBg = opts.tabActiveBg      || accent;
        var tabActiveClr= opts.tabActiveColor   || '#ffffff';
        var tabInactBg  = opts.tabInactiveBg    || '#f3f4f6';
        var tabInactClr = opts.tabInactiveColor || '#6b7280';
        var inputBg     = opts.inputBg          || '#f9fafb';
        var inputBorder = opts.inputBorder      || '#e5e7eb';
        var inputColor  = opts.inputColor       || '#1f2937';
        var outputBg    = opts.outputBg         || '#f3f4f6';
        var outputBorder= opts.outputBorder     || '#e5e7eb';
        var outputColor = opts.outputColor      || '#1f2937';
        var errorColor  = opts.errorColor       || '#ef4444';
        var errorBg     = opts.errorBg          || '#fef2f2';
        var btnBg       = opts.btnBg            || accent;
        var btnClr      = opts.btnColor         || '#ffffff';
        var labelColor  = opts.labelColor       || '#374151';
        var cardR       = (opts.cardRadius  || 16) + 'px';
        var inpR        = (opts.inputRadius || 10) + 'px';
        var tabR        = (opts.tabRadius   || 8)  + 'px';
        var maxW        = (opts.maxWidth    || 680) + 'px';
        var ptop        = (opts.paddingTop  || 60)  + 'px';
        var pbot        = (opts.paddingBottom||60)  + 'px';
        var rows        = opts.textareaRows || 5;
        var taHeight    = (rows * 1.6 + 2.5) + 'em';

        var currentTab  = opts.defaultMode || 'encode';
        var currentB64  = 'enc'; // enc | dec

        app.style.paddingTop    = ptop;
        app.style.paddingBottom = pbot;
        if (opts.sectionBg) app.style.background = opts.sectionBg;

        var card = document.createElement('div');
        card.className = 'bkbg-ue-card';
        Object.assign(card.style, {background:cardBg, borderRadius:cardR, padding:'32px', maxWidth:maxW, margin:'0 auto', boxShadow:'0 4px 24px rgba(0,0,0,.09)'});
        app.appendChild(card);

        /* Header */
        if (opts.showTitle && opts.title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'bkbg-ue-title';
            titleEl.textContent = opts.title;
            if (opts.titleColor) titleEl.style.color = opts.titleColor;
            card.appendChild(titleEl);
        }
        if (opts.showSubtitle && opts.subtitle) {
            var subEl = document.createElement('div');
            subEl.className = 'bkbg-ue-subtitle';
            subEl.textContent = opts.subtitle;
            if (opts.subtitleColor) subEl.style.color = opts.subtitleColor;
            card.appendChild(subEl);
        }

        /* Tab bar */
        var tabsData = [{id:'encode',label:'URL Encode'},{id:'decode',label:'URL Decode'}];
        if (opts.showBase64Tab !== false) tabsData.push({id:'b64',label:'Base64'});
        var tabBar = document.createElement('div');
        tabBar.className = 'bkbg-ue-tabs';
        Object.assign(tabBar.style, {display:'flex', gap:'4px', background:tabInactBg, borderRadius:tabR, padding:'4px', marginBottom:'18px'});
        card.appendChild(tabBar);

        var tabBtns = {};
        tabsData.forEach(function(td) {
            var btn = document.createElement('button');
            btn.className = 'bkbg-ue-tab';
            btn.textContent = td.label;
            btn.setAttribute('data-tab', td.id);
            Object.assign(btn.style, {flex:'1',padding:'8px',border:'none',borderRadius:tabR,cursor:'pointer',fontSize:'14px',fontFamily:'inherit',transition:'all .2s'});
            btn.addEventListener('click', function() {
                currentTab = td.id;
                updateTabs();
                inputTA.value = '';
                update();
            });
            tabBtns[td.id] = btn;
            tabBar.appendChild(btn);
        });

        /* B64 sub-mode */
        var subTabWrap = document.createElement('div');
        subTabWrap.className = 'bkbg-ue-subtabs';
        Object.assign(subTabWrap.style, {display:'none', gap:'6px', marginBottom:'14px'});
        card.appendChild(subTabWrap);

        var subTabEnc = document.createElement('button');
        subTabEnc.className = 'bkbg-ue-subtab';
        subTabEnc.textContent = 'Encode';
        var subTabDec = document.createElement('button');
        subTabDec.className = 'bkbg-ue-subtab';
        subTabDec.textContent = 'Decode';
        subTabWrap.appendChild(subTabEnc);
        subTabWrap.appendChild(subTabDec);

        subTabEnc.addEventListener('click', function(){ currentB64='enc'; inputTA.value=''; update(); updateSubTabs(); });
        subTabDec.addEventListener('click', function(){ currentB64='dec'; inputTA.value=''; update(); updateSubTabs(); });

        function makeLabel(text) {
            var l = document.createElement('label');
            l.className = 'bkbg-ue-label';
            l.textContent = text;
            Object.assign(l.style, {display:'block', fontSize:'12px', fontWeight:'600', color:labelColor, marginBottom:'5px'});
            return l;
        }

        /* Input group */
        var inpGroup = document.createElement('div');
        inpGroup.className = 'bkbg-ue-group';
        inpGroup.style.marginBottom = '16px';
        var inpLabel = makeLabel('Text to Encode');
        var inputTA  = document.createElement('textarea');
        inputTA.className = 'bkbg-ue-textarea';
        inputTA.placeholder = opts.defaultText || '';
        inputTA.rows = rows;
        Object.assign(inputTA.style,{width:'100%',padding:'10px 12px',borderRadius:inpR,border:'1.5px solid '+inputBorder,background:inputBg,color:inputColor,fontSize:'14px',fontFamily:'ui-monospace,Menlo,monospace',resize:'vertical',minHeight:taHeight,outline:'none',lineHeight:'1.6',boxSizing:'border-box'});
        inputTA.addEventListener('input', update);
        inpGroup.appendChild(inpLabel);
        inpGroup.appendChild(inputTA);
        card.appendChild(inpGroup);

        /* Char count input */
        var inpCount = document.createElement('div');
        inpCount.className = 'bkbg-ue-charcount';
        Object.assign(inpCount.style,{textAlign:'right',fontSize:'12px',color:'#9ca3af',marginTop:'-12px',marginBottom:'12px'});
        if (opts.showCharCount !== false) card.appendChild(inpCount);

        /* Error box */
        var errBox = document.createElement('div');
        errBox.className = 'bkbg-ue-error';
        Object.assign(errBox.style,{display:'none',background:errorBg,border:'1px solid '+errorColor,color:errorColor,padding:'10px 14px',borderRadius:'8px',fontSize:'14px',marginBottom:'12px'});
        card.appendChild(errBox);

        /* Output group */
        var outGroup = document.createElement('div');
        outGroup.className = 'bkbg-ue-group';
        outGroup.style.marginBottom = '16px';
        var outLabel = makeLabel('Result');
        var outputTA = document.createElement('textarea');
        outputTA.className = 'bkbg-ue-textarea output';
        outputTA.readOnly = true;
        outputTA.rows = rows;
        Object.assign(outputTA.style,{width:'100%',padding:'10px 12px',borderRadius:inpR,border:'1.5px solid '+outputBorder,background:outputBg,color:outputColor,fontSize:'14px',fontFamily:'ui-monospace,Menlo,monospace',resize:'vertical',minHeight:taHeight,outline:'none',lineHeight:'1.6',boxSizing:'border-box',cursor:'text',userSelect:'all'});
        outGroup.appendChild(outLabel);
        outGroup.appendChild(outputTA);
        card.appendChild(outGroup);

        /* Char count output */
        var outCount = document.createElement('div');
        outCount.className = 'bkbg-ue-charcount';
        Object.assign(outCount.style,{textAlign:'right',fontSize:'12px',color:'#9ca3af',marginTop:'-12px',marginBottom:'12px'});
        if (opts.showCharCount !== false) card.appendChild(outCount);

        /* Actions */
        var actions = document.createElement('div');
        actions.className = 'bkbg-ue-actions';
        Object.assign(actions.style,{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'6px'});
        card.appendChild(actions);

        if (opts.showCopyButton !== false) {
            var copyBtn = document.createElement('button');
            copyBtn.className = 'bkbg-ue-btn';
            copyBtn.textContent = 'Copy Result';
            Object.assign(copyBtn.style,{padding:'8px 18px',background:btnBg,color:btnClr,border:'none',borderRadius:inpR,fontWeight:'700',cursor:'pointer',fontSize:'13px',fontFamily:'inherit',transition:'background .2s'});
            copyBtn.addEventListener('click', function(){
                var txt = outputTA.value;
                if (!txt) return;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(txt).then(function(){ showToast('Copied!'); });
                } else {
                    outputTA.select();
                    document.execCommand('copy');
                    showToast('Copied!');
                }
            });
            actions.appendChild(copyBtn);
        }

        if (opts.showClearButton !== false) {
            var clearBtn = document.createElement('button');
            clearBtn.className = 'bkbg-ue-btn secondary';
            clearBtn.textContent = 'Clear';
            Object.assign(clearBtn.style,{padding:'8px 18px',background:'#f3f4f6',color:'#374151',border:'none',borderRadius:inpR,fontWeight:'700',cursor:'pointer',fontSize:'13px',fontFamily:'inherit',transition:'background .2s'});
            clearBtn.addEventListener('click', function(){ inputTA.value=''; update(); });
            actions.appendChild(clearBtn);
        }

        function updateTabs() {
            tabsData.forEach(function(td) {
                var btn = tabBtns[td.id];
                var active = td.id === currentTab;
                btn.style.background = active ? tabActiveBg : 'transparent';
                btn.style.color      = active ? tabActiveClr : tabInactClr;
                btn.style.fontWeight = active ? '700' : '500';
                btn.style.boxShadow  = active ? '0 1px 6px rgba(108,63,181,.25)' : 'none';
            });
            subTabWrap.style.display = currentTab === 'b64' ? 'flex' : 'none';
            inpLabel.textContent = currentTab === 'b64' ? 'Input Text' : (currentTab === 'encode' ? 'Text to Encode' : 'Encoded URL');
        }

        function updateSubTabs() {
            subTabEnc.style.fontWeight   = currentB64 === 'enc' ? '700' : '400';
            subTabEnc.style.borderColor  = currentB64 === 'enc' ? accent : '#d1d5db';
            subTabEnc.style.background   = currentB64 === 'enc' ? accent+'22' : '#fff';
            subTabEnc.style.color        = currentB64 === 'enc' ? accent : '#6b7280';
            subTabDec.style.fontWeight   = currentB64 === 'dec' ? '700' : '400';
            subTabDec.style.borderColor  = currentB64 === 'dec' ? accent : '#d1d5db';
            subTabDec.style.background   = currentB64 === 'dec' ? accent+'22' : '#fff';
            subTabDec.style.color        = currentB64 === 'dec' ? accent : '#6b7280';
        }

        function update() {
            var txt = inputTA.value;
            var mode = currentTab === 'b64' ? (currentB64 === 'enc' ? 'b64' : 'b64dec') : currentTab;
            var res  = process(mode, txt);
            outputTA.value = res.result;
            if (opts.showCharCount !== false) {
                inpCount.textContent = txt.length + ' characters';
                outCount.textContent = res.result.length + ' characters';
            }
            if (res.error) {
                errBox.textContent  = '⚠ ' + res.error;
                errBox.style.display = 'block';
            } else {
                errBox.style.display = 'none';
            }
        }

        updateTabs();
        updateSubTabs();
        update();
    }

    document.querySelectorAll('.bkbg-ue-app').forEach(initApp);
})();
