(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro ---------- */
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---------- Year & local clock ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const clock = document.getElementById('clock');
  const tick = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', timeZoneName: 'short'
    }).format(new Date());
  };
  tick();
  setInterval(tick, 30_000);

  /* ---------- Theme toggle ---------- */
  const toggle = document.querySelector('.theme-toggle');
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark'
                       : window.matchMedia('(prefers-color-scheme: dark)').matches;
  toggle?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Nav: scrolled state + active link ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = [...document.querySelectorAll('.nav__links a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((l) => {
    const target = document.querySelector(l.getAttribute('href'));
    if (target) sectionObserver.observe(target);
  });

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 80}ms`;
    revealObserver.observe(el);
  });

  /* ---------- Count-up stats ---------- */
  const fmt = new Intl.NumberFormat('en-US');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      countObserver.unobserve(el);
      if (reduceMotion) { el.textContent = fmt.format(target); return; }
      const start = performance.now();
      const duration = 1600;
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

  /* ---------- Custom cursor (fine pointers only) ---------- */
  const cursor = document.querySelector('.cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (cursor && finePointer && !reduceMotion) {
    const label = cursor.querySelector('.cursor__label');
    let x = -100, y = -100, cx = x, cy = y;
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
    document.querySelectorAll('a:not([data-cursor]), button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- Subtle tilt on project visuals ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.project__visual').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }
})();
