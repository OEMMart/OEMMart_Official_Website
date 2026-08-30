(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  // 跑马灯内容翻倍以实现无缝循环
  const mq = document.getElementById('marq');
  mq.innerHTML += mq.innerHTML;

  if (reduce || !hasGsap){
    document.body.classList.add('static','lit');
  } else {
    gsap.registerPlugin(ScrollTrigger);

    const stage = document.getElementById('stage');

    // 手机上 2800px 的 pin 等于三屏多的空滚动，而且只有 4 张卡在场（CSS 隐藏了其余 4 张）。
    // gsap.matchMedia 在断点不再匹配时自动 revert 掉这里建的所有动画与 ScrollTrigger，
    // 不需要手写 resize 清理。 https://gsap.com/docs/v3/GSAP/gsap.matchMedia/
    gsap.matchMedia().add({
      isMobile: '(max-width:640px)',
      isDesktop:'(min-width:641px)'
    }, (ctx)=>{
      const { isMobile } = ctx.conditions;

      // display:none 的卡片 offsetParent 为 null，不参与汇聚动画
      const docs = gsap.utils.toArray('.doc').filter(d => d.offsetParent !== null);

      gsap.set('#after', {visibility:'visible'});
      gsap.set('#after > *', {autoAlpha:0, y:44});

      const tl = gsap.timeline({
        scrollTrigger:{
          trigger: stage, start:'top top', end: isMobile ? '+=1500' : '+=2800',
          pin:true, scrub:1, invalidateOnRefresh:true,
          onUpdate: self => document.body.classList.toggle('lit', self.progress > 0.62)
        }
      });

      tl.to('#before', {autoAlpha:0, y:-60, duration:1.2, ease:'power1.in'}, 0.3);
      docs.forEach((doc, i)=>{
        const wrap = doc.parentElement;
        tl.to(doc, {
          x: ()=> stage.clientWidth*0.5 - (wrap.offsetLeft + doc.offsetWidth/2),
          y: ()=> stage.clientHeight*0.44 - (wrap.offsetTop + doc.offsetHeight/2),
          rotation: (i%2 ? 300 : -300),
          scale: 0.04, autoAlpha: 0,
          duration: 2.4, ease: 'power2.in'
        }, 0.5 + i*0.12);
      });
      tl.to('#orb', {autoAlpha:1, scale:1.25, duration:1.6, ease:'power2.out'}, 1.4);
      tl.to('#orb', {scale:0.95, duration:0.5, ease:'power1.inOut'}, 3.2);
      tl.to('#light', {opacity:1, duration:1.8, ease:'power1.inOut'}, 3.6);
      tl.to('#orb', {autoAlpha:0, scale:2.6, duration:1.4, ease:'power2.in'}, 3.7);
      tl.to('#after > *', {autoAlpha:1, y:0, duration:1.4, stagger:0.3, ease:'power3.out'}, 4.6);
      tl.to({}, {duration:0.8});
    });
  }

  // 移动端导航面板：手机上 .nav .links 是 display:none，这是它唯一的入口
  const navToggle = document.getElementById('navtoggle');
  const navMenu   = document.getElementById('navmenu');
  if (navToggle && navMenu){
    const setOpen = open =>{
      navToggle.setAttribute('aria-expanded', String(open));
      navMenu.classList.toggle('open', open);
    };
    navToggle.addEventListener('click', ()=> setOpen(navToggle.getAttribute('aria-expanded') !== 'true'));
    navMenu.addEventListener('click', e =>{ if(e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('click', e =>{
      if(!navMenu.contains(e.target) && !navToggle.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', e =>{ if(e.key === 'Escape') setOpen(false); });
  }

  // reveal
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); io.unobserve(e.target);} });
  },{threshold:0.16});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));

  // 巨型数字滚动计数
  const cio = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1400;
      cio.unobserve(el);
      // 同 countUp：IntersectionObserver 在后台标签页照常触发，但 rAF 不跑，
      // 不特判就会永远停在 0。
      const settle = () => { el.textContent = target; };
      if(document.hidden){ settle(); return; }
      const t0 = performance.now();
      const step = t =>{
        const p = Math.min(1,(t - t0)/dur), eased = 1 - Math.pow(1-p,3);
        el.textContent = Math.round(target*eased);
        if(p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      setTimeout(settle, dur + 220);
    });
  },{threshold:0.6});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

  // Before/After 对比：桌面鼠标 hover 自动跟随，触摸设备按住拖动
  const cmp = document.getElementById('cmp');
  let touching = false;
  const setX = clientX =>{
    const r = cmp.getBoundingClientRect();
    cmp.style.setProperty('--x', Math.min(92, Math.max(8,(clientX - r.left)/r.width*100))+'%');
  };
  cmp.addEventListener('mousemove', e=> setX(e.clientX));                    // 桌面：无需按下，跟随鼠标
  cmp.addEventListener('pointerdown', e=>{ if(e.pointerType!=='mouse'){ touching=true; setX(e.clientX); } });
  cmp.addEventListener('pointermove', e=>{ if(e.pointerType!=='mouse' && touching) setX(e.clientX); });
  cmp.addEventListener('pointerup', ()=> touching=false);
  cmp.addEventListener('pointercancel', ()=> touching=false);

  /* ===== 标书纸：逐词书写 + 自然语言修订第二幕 ===== */
  const sheet = document.getElementById('sheet');
  (function(){
    const wrapWords = node =>{
      [...node.childNodes].forEach(ch=>{
        if(ch.nodeType === 3){
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part=>{
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className='w'; s.textContent=part; frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if(ch.nodeType === 1 && ch.id !== 'caret'){ wrapWords(ch); }
      });
    };
    const paras = [...sheet.querySelectorAll('.para')];
    const originals = paras.map(p=>p.innerHTML);
    const p34 = document.getElementById('p34');
    const bubble = document.getElementById('bubble');
    const P34_REV = '<b>3.4 Exceptions.</b> Our equipment meets the stated requirements with one exception: air quality class, where our <span class="tok">ISO 8573-1 Class 2</span> rating exceeds the specified class, documented with data from <span class="tok">your product catalogue</span>. <span class="rvtag">REWRITTEN</span>';

    if(reduce){
      p34.innerHTML = P34_REV;
      p34.classList.add('sel');
      bubble.classList.add('on');
      return;
    }
    const caret = document.createElement('span'); caret.className='caret'; caret.id='caret';
    const typeWords = (scope, speedMin, speedRand, done) =>{
      const words = [...scope.querySelectorAll('.w:not(.on)')];
      let i = 0;
      const t = ()=>{
        if(i >= words.length){ done && done(); return; }
        words[i].classList.add('on');
        if(words[i].parentNode) words[i].parentNode.insertBefore(caret, words[i].nextSibling);
        i++;
        setTimeout(t, speedMin + Math.random()*speedRand);
      };
      t();
    };
    const run = ()=>{
      // 第一幕：整稿书写
      paras.forEach((p,idx)=>{ p.innerHTML = originals[idx]; p.classList.remove('sel'); });
      bubble.classList.remove('on');
      paras.forEach(wrapWords);
      typeWords(sheet, 38, 66, ()=>{
        // 第二幕：用户圈中 3.4 段，说一句话
        setTimeout(()=>{
          p34.classList.add('sel');
          bubble.classList.add('on');
          // 第三幕：只重写这一段
          setTimeout(()=>{
            p34.innerHTML = P34_REV;
            wrapWords(p34);
            typeWords(p34, 20, 28, ()=>{ setTimeout(run, 5600); });
          }, 2300);
        }, 1100);
      });
    };
    let started = false;
    const sio = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting && !started){ started=true; setTimeout(run,500); sio.disconnect(); } });
    },{threshold:0.35});
    sio.observe(sheet);
  })();

  /* ===== Signal：记录在读者眼前被拼装出来，再揭示联系方式 ===== */
  (function(){
    var wrap=document.getElementById('joinwrap');
    if(!wrap) return;
    var io2=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        wrap.classList.add('on');
        setTimeout(function(){ wrap.classList.add('done'); }, 1200);   // feeders lock once the record lands
        io2.disconnect();
      });
    },{threshold:0.3});
    io2.observe(wrap);

    /* 解锁的三段：找到=免费 → 点一次解锁邮箱(1 credit) → 再点解锁电话(1 credit)。
       产品强制先邮箱后电话，同一条不会扣第二次；这里把这条规则演出来。
       值全部打码：真实联系人不放上公网。 */
    var btn=document.getElementById('unsealbtn'),
        chE=document.getElementById('chEmail'),
        chP=document.getElementById('chPhone'),
        note=document.getElementById('unote');
    if(!btn) return;
    var step=0;
    var STATES=[
      {chip:chE, val:'d••••••@••••••••.com',
       next:'UNLOCK PHONE · 1 CREDIT',
       note:'Email unlocked and stored. Phone never unlocks before email — the product enforces that order.'},
      {chip:chP, val:'+1 ••• ••• ••••',
       next:'UNLOCKED',
       note:'Never charged twice. Repeated clicks return the saved value instead of spending again.'}
    ];
    btn.addEventListener('click',function(){
      var s=STATES[step]; if(!s) return;
      s.chip.classList.add('open');
      s.chip.querySelector('.cht').textContent=s.val;
      btn.textContent=s.next;
      note.textContent=s.note;
      step++;
      if(step>=STATES.length) btn.disabled=true;
    });
  })();

  /* ===== 匹配飞轮 ===== */
  (function(){
    const seq = [
      {tt:'General industrial equipment, standing offer renewal', rg:'Texas · closes in 40 days', sc:34, v:'n'},
      {tt:'HVAC and air treatment equipment, school district', rg:'Ontario · closes in 12 days', sc:61, v:'n'},
      {tt:'Compressed air system, naval yard maintenance', rg:'SAM.gov · closes in 34 days', sc:88, v:'y'},
      {tt:'Rotary screw compressors, wastewater plant retrofit', rg:'State of Ohio · closes in 21 days', sc:93, v:'y'}
    ];
    const card = document.getElementById('fwcard'), tt = document.getElementById('fwtt'),
          rg = document.getElementById('fwrg'), sc = document.getElementById('fwsc'),
          byes = document.getElementById('fbyes'), bno = document.getElementById('fbno');
    let k = 0, busy = false, timer = null;
    const tone = v => v >= 80 ? 't-hi' : v >= 50 ? 't-mid' : 't-low';
    const show = s =>{ tt.textContent = s.tt; rg.textContent = s.rg; sc.textContent = s.sc; sc.className = 'fnum ' + tone(s.sc); };
    const advance = manual =>{
      if(busy) return; busy = true;
      const cur = seq[k];
      const btn = (manual || cur.v) === 'y' ? byes : bno;
      btn.classList.add('pressed');
      const nextK = (k + 1) % seq.length;
      const cycling = nextK === 0;               // 爬到最高分后，柔和淡出重开一轮（非硬跳回落）
      setTimeout(()=>{
        btn.classList.remove('pressed');
        card.classList.add(cycling ? 'cycle' : 'swap');
        setTimeout(()=>{
          k = nextK;
          show(seq[k]);
          card.classList.remove('swap', 'cycle');
          busy = false;
        }, cycling ? 820 : 620);
      }, 650);
    };
    show(seq[0]);
    if(!reduce){
      timer = setInterval(()=>advance(null), 4200);
      const bump = v =>{ clearInterval(timer); advance(v); timer = setInterval(()=>advance(null), 4200); };
      byes.addEventListener('click', ()=>bump('y'));
      bno.addEventListener('click', ()=>bump('n'));
    } else {
      show(seq[0]);
    }
  })();


  /* ══════════════════════════════════════════════════════════════════
     产品演示的幕次驱动
     框内（iframe）是产品自己的界面与交互；这里只负责换幕、走进度、收点击。
     自动循环，任何一次点击就交出控制权（进度条随即填满，不再自走）。
     只有滚进视口的时候才播 —— 页面上不该有一个没人在看却一直在动的东西。
     ══════════════════════════════════════════════════════════════════ */
  (function(){
    const wrap = document.getElementById("sfdemo");
    if(!wrap) return;
    const frame = document.getElementById("sfdFrame");
    const pills = [...document.querySelectorAll("#sfdPills .sfd-pill")];
    const elTitle = document.getElementById("sfdTitle");
    const elDesc  = document.getElementById("sfdDesc");
    const DWELL = 9000;

    /* 解说文字取自产品自己的 client/src/tour/steps.ts 与已批准的 brochure Plate 10，
       不是为官网新写的营销主张。 */
    const SCENES = {
      rank: {
        title: "Two kinds of opportunity, one switch",
        desc: "Gov tenders are contracts already out for bid. Buying signals are companies that just did something that means they are about to buy — and both are scored on the same 0–100 scale.",
      },
      explain: {
        title: "The breakdown, line by line",
        desc: "Each row is one component of the score with the reasoning that produced it. When a score looks wrong, this is the place that tells you which part of it is wrong.",
      },
      reach: {
        title: "Finding people is free",
        desc: "Only revealing a detail spends, one click at a time — and the phone never unlocks before the e-mail.",
      },
    };

    let i = 0, timer = null, held = false, ready = false, visible = false;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function paint(){
      const id = pills[i].dataset.scene, sc = SCENES[id];
      pills.forEach((p, k) => {
        const on = k === i;
        p.classList.toggle("on", on);
        p.classList.toggle("held", on && (held || reduce));
        p.setAttribute("aria-selected", String(on));
      });
      elTitle.textContent = sc.title;
      elDesc.textContent = sc.desc;
      if(ready) frame.contentWindow.postMessage({ sfScene: id }, "*");
    }

    function go(next){
      i = ((next % pills.length) + pills.length) % pills.length;
      // 进度条要从 0 重新走：先撤 .on 让 width 归零并强制回流，再上 .on 起动过渡
      pills.forEach(p => p.classList.remove("on"));
      void pills[i].offsetWidth;
      paint();
      arm();
    }

    function arm(){
      clearTimeout(timer);
      if(held || reduce || !visible) return;
      timer = setTimeout(() => go(i + 1), DWELL);
    }

    pills.forEach((p, k) => p.addEventListener("click", () => {
      held = true;                 // 一旦有人动手，就不再自动往下走
      clearTimeout(timer);
      go(k);
    }));

    // 只播看得见的那一个
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        visible = e.isIntersecting;
        if(visible) arm(); else clearTimeout(timer);
      });
    }, { threshold: 0.32 });
    io.observe(wrap);

    // iframe 里的模块加载完才开始发指令，否则第一条 postMessage 会打空
    /* 高度跟随内容。宽度不缩放：缩到手机宽度会把 11px 的表格文字压成 4px，
       比列不全更糟。窄屏改由 modules.html 里的媒体查询收掉低价值列，文字始终原生大小。 */
    const screen = wrap.querySelector(".sfd-screen");
    addEventListener("message", (e) => {
      const d = e.data || {};
      if(d.sfReady){ ready = true; paint(); arm(); }
      if(d.sfHeight && screen) screen.style.height = Math.max(280, Math.min(560, d.sfHeight)) + "px";
    });

    paint();
  })();

  /* ===== 评分归因：点开任意一行看那几分的理由 =====
     用 <button aria-expanded> 而不是 div，键盘可操作，读屏能报开合状态。 */
  (function(){
    const panel = document.getElementById('attrib');
    if(!panel) return;
    const rows = [...panel.querySelectorAll('.ar')];
    rows.forEach(r => r.addEventListener('click', ()=>{
      r.setAttribute('aria-expanded', r.getAttribute('aria-expanded') !== 'true');
    }));
    // 首次进入视野时把第一行打开，让"可以点"这件事自己说出来
    const aio = new IntersectionObserver(es=>{
      es.forEach(e =>{
        if(!e.isIntersecting) return;
        setTimeout(()=> rows[0]?.setAttribute('aria-expanded','true'), 420);
        aio.disconnect();
      });
    },{threshold:0.3});
    aio.observe(panel);
  })();

  /* 联系表单由 HubSpot 官方嵌入脚本渲染（见 index.html 页尾），
     reCAPTCHA / 文件上传 / 营销同意均由 HubSpot 原生处理。 */
})();
