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
     产品剧场
     横移：钉住 + scrub。区块钉在视口，滚轮向下把内部面板向左推，走完释放。
     用户全程只竖着滚 —— 不需要 shift、不需要手动横拖。
     GSAP 管这个叫 "fake horizontal scroll"：pin 外壳、动里面的子元素、ease 必须是 none。
     手机（≤640px）与 prefers-reduced-motion 都不建这套，CSS 已让面板纵向堆叠。
     ══════════════════════════════════════════════════════════════════ */
  const theatre = document.getElementById('theatre');
  const panels  = document.getElementById('panels');

  // 数字滚动：进场时从 0 数到目标，支持一位小数
  const countUp = el =>{
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.cnt), dec = (el.dataset.cnt.split('.')[1] || '').length;
    const dur = 900;
    const settle = () => { el.textContent = target.toFixed(dec); };
    // 后台标签页里 requestAnimationFrame 不会触发。若不特判，数字会被标成"已跑"
    // 却永远停在 0 —— 用户中键新标签页打开本站就会看到这个。
    if (document.hidden){ settle(); return; }
    const t0 = performance.now();
    const step = t =>{
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(settle, dur + 220);   // 兜底：中途被切到后台也不会卡在半路
  };

  if (theatre && panels){
    if (reduce || !hasGsap){
      // 降级：不横移，直接把数字落到终值
      theatre.querySelectorAll('[data-cnt]').forEach(el => el.textContent = el.dataset.cnt);
    } else {
      gsap.matchMedia().add({
        wide: '(min-width:641px)',
        narrow:'(max-width:640px)'
      }, (ctx)=>{
        const dots = [...document.querySelectorAll('#tprog i')];
        const cnts = [...theatre.querySelectorAll('[data-cnt]')];

        if (ctx.conditions.narrow){
          // 纵向堆叠：面板各自进入视口时数字才跑
          const io = new IntersectionObserver(es=>{
            es.forEach(e =>{ if(e.isIntersecting){ e.target.querySelectorAll('[data-cnt]').forEach(countUp); io.unobserve(e.target); } });
          }, {threshold:.35});
          theatre.querySelectorAll('.tp').forEach(p => io.observe(p));
          return () => io.disconnect();
        }

        // 横移距离按实际内容算，invalidateOnRefresh 让它跟着视口变
        const travel = () => Math.max(0, panels.scrollWidth - window.innerWidth);

        const hz = gsap.to(panels, {
          x: () => -travel(),
          ease: 'none',                       // containerAnimation 的硬要求：滚动与位移必须 1:1
          scrollTrigger:{
            trigger: theatre,
            start: 'top top',
            end: () => '+=' + travel(),
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: self =>{
              const i = Math.min(dots.length - 1, Math.round(self.progress * (dots.length - 1)));
              dots.forEach((d, k) => d.classList.toggle('on', k === i));
              armCounters();
            }
          }
        });

        /* 每块面板横向进场时才跑自己的数字。
           这里刻意不用 containerAnimation 子触发器：它依赖容器动画自身的渲染节拍，
           在滚动事件被外壳代理的环境里可能一次都不发火（实测如此）。
           直接读面板的实际横向位置更笨也更可靠 —— 主 onUpdate 每帧都会调它。 */
        function armCounters(){          // 函数声明：会提升，onUpdate 若在创建时同步触发也不会撞 TDZ
          cnts.forEach(el =>{
            if (el.dataset.done) return;
            const p = el.closest('.tp');
            if (p && p.getBoundingClientRect().left < window.innerWidth * 0.78) countUp(el);
          });
        }
        armCounters();   // 第一块一进剧场就在视口里，不等横移
      });
    }

    /* ── 面板交互（两个断点都生效，与横移无关）── */

    // 03 · 打包下载：四行依次扫过，然后报出总量
    const zipbtn = document.getElementById('zipbtn');
    const zipout = document.getElementById('zipout');
    if (zipbtn && zipout){
      zipbtn.addEventListener('click', ()=>{
        const files = [...theatre.querySelectorAll('.fl')];
        zipbtn.disabled = true;
        zipout.classList.remove('on');
        files.forEach(f => f.classList.remove('pull'));
        files.forEach((f, i) => setTimeout(()=> f.classList.add('pull'), i * 190));
        const total = files.reduce((s, f) => s + parseFloat(f.dataset.mb || 0), 0);
        setTimeout(()=>{
          zipout.textContent = '✓ ' + files.length + ' files · ' + total.toFixed(1) + ' MB — one archive, one click';
          zipout.classList.add('on');
          zipbtn.disabled = false;
        }, files.length * 190 + 420);
      });
    }

    // 04 · 决策：journey 真的往前走一格
    const journey = document.getElementById('journey');
    const pursue  = document.getElementById('pursue');
    const decline = document.getElementById('decline');
    const decnote = document.getElementById('decnote');
    if (journey && pursue && decline && decnote){
      const steps = [...journey.children];
      const reset = () =>{
        steps.forEach((li, i) => li.className = i < 2 ? 'done' : (i === 2 ? 'now' : ''));
        pursue.querySelector('span').textContent = 'Pursue';
        decnote.className = 'decn';
        decnote.textContent = 'Deciding moves this tender into your pursued pipeline and notifies the OEMMart team.';
      };
      pursue.addEventListener('click', ()=>{
        steps.forEach((li, i) => li.className = i < 3 ? 'done' : (i === 3 ? 'now' : ''));
        pursue.querySelector('span').textContent = 'Pursuing';
        decnote.className = 'decn ok';
        decnote.textContent = '✓ Moved into your pursued pipeline. Proposal generation is now the live stage.';
        setTimeout(reset, 5200);
      });
      decline.addEventListener('click', ()=>{
        steps.forEach(li => li.className = li.className === 'now' ? '' : li.className);
        decnote.className = 'decn';
        decnote.textContent = 'Declined. It stays on the record, and the scoring learns from the call.';
        setTimeout(reset, 5200);
      });
    }
  }

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
