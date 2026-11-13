(() => {
  const menuButton = document.querySelector('.navtoggle');
  const menu = document.querySelector('.navmenu');
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  const toc = document.querySelector('.policy-toc');
  const compact = matchMedia('(max-width: 820px)');
  const resizeToc = () => { toc.open = !compact.matches; };
  resizeToc();
  compact.addEventListener('change', resizeToc);
  const links = [...document.querySelectorAll('.policy-toc a')];
  const sections = [...document.querySelectorAll('.policy-section')];
  let queued = false;
  const updateSection = () => {
    const current = sections.filter(section => section.getBoundingClientRect().top <= 155).at(-1) || sections[0];
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    queued = false;
  };
  document.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateSection); }
  }, { passive: true });
  links.forEach(link => link.addEventListener('click', () => {
    if (compact.matches) toc.open = false;
  }));
  updateSection();
})();
