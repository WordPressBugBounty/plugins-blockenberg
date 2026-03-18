(function () {
    'use strict';

    var VALS = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    var SYMS = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    var MAP  = {M:1000,D:500,C:100,L:50,X:10,V:5,I:1};
    var REF  = [{s:'I',v:1},{s:'V',v:5},{s:'X',v:10},{s:'L',v:50},{s:'C',v:100},{s:'D',v:500},{s:'M',v:1000}];

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

    function toRoman(n) {
        if (isNaN(n)||n<1||n>3999) return '';
        var r='';
        for(var i=0;i<VALS.length;i++){while(n>=VALS[i]){r+=SYMS[i];n-=VALS[i];}}
        return r;
    }

    function fromRoman(s) {
        s = s.toUpperCase().trim();
        if (!s) return NaN;
        if (!/^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(s)) return NaN;
        var v=0;
        for(var i=0;i<s.length;i++){
            var cur=MAP[s[i]],next=MAP[s[i+1]];
            if(next&&cur<next){v-=cur;}else{v+=cur;}
        }
        return v||NaN;
    }

    function showToast(msg) {
        var t=document.querySelector('.bkbg-rnc-toast');
        if(!t){t=document.createElement('div');t.className='bkbg-rnc-toast bkbg-mcc-toast';t.style.cssText='position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;opacity:0;transition:opacity .2s;pointer-events:none;z-index:9999';document.body.appendChild(t);}
        t.textContent=msg;t.style.opacity='1';
        setTimeout(function(){t.style.opacity='0';},1800);
    }

    function initBlock(app) {
        var opts={};
        try{opts=JSON.parse(app.getAttribute('data-opts')||'{}');}catch(e){}

        var accent       = opts.accentColor      || '#6c3fb5';
        var outputBg     = opts.outputBg         || '#f5f3ff';
        var outputBorder = opts.outputBorder      || '#ede9fe';
        var outputColor  = opts.outputColor      || '#3b0764';
        var tabActiveBg   = opts.tabActiveBg     || accent;
        var tabActiveClr  = opts.tabActiveColor  || '#fff';
        var tabInactiveBg = opts.tabInactiveBg   || '#f3f4f6';
        var tabInactiveClr= opts.tabInactiveColor|| '#374151';
        var refBg    = opts.refBg    || '#f9fafb';
        var refBorder= opts.refBorder|| '#e5e7eb';
        var inputBorder = opts.inputBorder || '#e5e7eb';
        var labelColor  = opts.labelColor  || '#374151';
        var cardRadius  = (opts.cardRadius  !== undefined ? opts.cardRadius  : 16)+'px';
        var inputRadius = (opts.inputRadius !== undefined ? opts.inputRadius : 8) +'px';
        var outputFS    = (opts.outputFontSize||52)+'px';

        var state = { mode: opts.defaultMode||'toRoman' };

        var wrap=document.createElement('div'); wrap.className='bkbg-rnc-wrap'; wrap.style.borderRadius=cardRadius;
        if(opts.cardBg) wrap.style.background=opts.cardBg;
        app.appendChild(wrap);

        typoCssVarsForEl(app, opts.titleTypo, '--bkrnc-tt-');
        typoCssVarsForEl(app, opts.subtitleTypo, '--bkrnc-st-');

        // Header
        if(opts.showTitle||opts.showSubtitle){
            var hdr=document.createElement('div'); hdr.className='bkbg-rnc-header';
            if(opts.showTitle&&opts.title){var ti=document.createElement('div');ti.className='bkbg-rnc-title';if(opts.titleColor)ti.style.color=opts.titleColor;ti.textContent=opts.title;hdr.appendChild(ti);}
            if(opts.showSubtitle&&opts.subtitle){var su=document.createElement('div');su.className='bkbg-rnc-subtitle';if(opts.subtitleColor)su.style.color=opts.subtitleColor;su.textContent=opts.subtitle;hdr.appendChild(su);}
            wrap.appendChild(hdr);
        }

        // Tabs
        var tabWrap=document.createElement('div'); tabWrap.className='bkbg-rnc-tabs';
        var tabToRoman=document.createElement('button'); tabToRoman.className='bkbg-rnc-tab'; tabToRoman.type='button'; tabToRoman.textContent='Number → Roman';
        var tabFromRoman=document.createElement('button'); tabFromRoman.className='bkbg-rnc-tab'; tabFromRoman.type='button'; tabFromRoman.textContent='Roman → Number';
        tabWrap.appendChild(tabToRoman); tabWrap.appendChild(tabFromRoman); wrap.appendChild(tabWrap);

        function styleTab(btn,active){btn.style.background=active?tabActiveBg:tabInactiveBg;btn.style.color=active?tabActiveClr:tabInactiveClr;btn.classList.toggle('active',active);}

        // Input
        var fieldWrap=document.createElement('div'); fieldWrap.style.marginBottom='16px';
        var label=document.createElement('label'); label.className='bkbg-rnc-label'; label.style.color=labelColor;
        var input=document.createElement('input'); input.type='text'; input.className='bkbg-rnc-input'; input.style.borderRadius=inputRadius; input.style.borderColor=inputBorder;
        fieldWrap.appendChild(label); fieldWrap.appendChild(input); wrap.appendChild(fieldWrap);

        var errorEl=document.createElement('div'); errorEl.className='bkbg-rnc-error'; wrap.appendChild(errorEl);

        // Output
        var outputBox=document.createElement('div'); outputBox.className='bkbg-rnc-output'; outputBox.style.background=outputBg; outputBox.style.borderColor=outputBorder; outputBox.style.borderRadius=inputRadius;
        var outLabel=document.createElement('div'); outLabel.className='bkbg-rnc-output-label'; outLabel.style.color=labelColor;
        var outResult=document.createElement('div'); outResult.className='bkbg-rnc-output-result'; outResult.style.fontSize=outputFS; outResult.style.color=outputColor;
        outputBox.appendChild(outLabel); outputBox.appendChild(outResult); wrap.appendChild(outputBox);

        // Copy
        var copyWrap,copyBtn;
        if(opts.showCopyButton!==false){
            copyWrap=document.createElement('div'); copyWrap.className='bkbg-rnc-copy-wrap'; copyWrap.style.display='none';
            copyBtn=document.createElement('button'); copyBtn.className='bkbg-rnc-copy-btn'; copyBtn.type='button'; copyBtn.textContent='📋 Copy Result'; copyBtn.style.background=accent;
            copyBtn.addEventListener('click',function(){if(outResult.textContent&&navigator.clipboard){navigator.clipboard.writeText(outResult.textContent).then(function(){showToast('Copied!');});}});
            copyWrap.appendChild(copyBtn); wrap.appendChild(copyWrap);
        }

        // Reference table
        if(opts.showReferenceTable!==false){
            var refBox=document.createElement('div'); refBox.className='bkbg-rnc-ref'; refBox.style.background=refBg; refBox.style.borderColor=refBorder;
            var refTitle=document.createElement('div'); refTitle.className='bkbg-rnc-ref-title'; refTitle.style.color=labelColor; refTitle.textContent='Roman Numerals Reference';
            var refGrid=document.createElement('div'); refGrid.className='bkbg-rnc-ref-grid';
            REF.forEach(function(r){
                var cell=document.createElement('div'); cell.className='bkbg-rnc-ref-cell'; cell.style.borderColor=refBorder;
                var sym=document.createElement('div'); sym.className='bkbg-rnc-ref-sym'; sym.style.color=accent; sym.textContent=r.s;
                var val=document.createElement('div'); val.className='bkbg-rnc-ref-val'; val.textContent=r.v.toLocaleString();
                cell.appendChild(sym); cell.appendChild(val); refGrid.appendChild(cell);
            });
            refBox.appendChild(refTitle); refBox.appendChild(refGrid); wrap.appendChild(refBox);
        }

        if(opts.showFunFact!==false){
            var fact=document.createElement('div'); fact.className='bkbg-rnc-fact'; fact.textContent='Romans used these 7 symbols for numbers 1–3,999. Zero and negatives were not represented.'; wrap.appendChild(fact);
        }

        function update(){
            var v=input.value.trim();
            var result=''; var err='';
            if(state.mode==='toRoman'){
                label.textContent='Enter Integer (1 – 3,999)'; outLabel.textContent='Roman Numeral';
                var n=parseInt(v);
                if(v&&(isNaN(n)||n<1||n>3999)){err='Enter a number between 1 and 3,999';}
                else if(v){result=toRoman(n);}
            }else{
                label.textContent='Enter Roman Numeral'; outLabel.textContent='Integer';
                if(v){var dec=fromRoman(v);if(isNaN(dec)){err='Invalid Roman numeral';}else{result=String(dec);}}
            }
            errorEl.textContent=err;
            if(result){
                outResult.textContent=result; outResult.classList.remove('bkbg-rnc-output-empty');
                if(copyWrap)copyWrap.style.display='';
            }else{
                outResult.textContent='Result will appear here…'; outResult.classList.add('bkbg-rnc-output-empty');
                if(copyWrap)copyWrap.style.display='none';
            }
        }

        function setMode(m){
            state.mode=m;
            var def=opts.defaultValue||'2024';
            input.value=m==='toRoman'?def:toRoman(parseInt(def));
            styleTab(tabToRoman,m==='toRoman'); styleTab(tabFromRoman,m==='fromRoman');
            update();
        }

        tabToRoman.addEventListener('click',function(){setMode('toRoman');});
        tabFromRoman.addEventListener('click',function(){setMode('fromRoman');});
        input.addEventListener('input',update);
        setMode(state.mode);
    }

    function init(){document.querySelectorAll('.bkbg-rnc-app').forEach(initBlock);}
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
