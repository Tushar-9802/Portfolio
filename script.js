/* ==========================================================================
   Tushar Jaju · Portfolio
   - Theme toggle with persistence
   - Active section highlighting (rAF-throttled)
   - Smooth-scroll for in-page links
   - Project leaf expand/collapse (aria-expanded driven)
   - Scroll reveals via IntersectionObserver
   - Contact form validation (live + submit-time)
   ========================================================================== */

(() => {
  'use strict';

  /* ---------- Theme ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const THEME_KEY = 'tj-theme';

  const applyTheme = (mode) => {
    const isDark = mode === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    if (themeIcon) {
      themeIcon.classList.toggle('fa-sun', isDark);
      themeIcon.classList.toggle('fa-moon', !isDark);
    }
    if (themeToggle) themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored ?? (prefersDark ? 'dark' : 'light'));

  themeToggle?.addEventListener('click', () => {
    const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  /* ---------- Reduced-motion preference (respected by all animations) ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis: smooth-scroll wheel/touch interpolation ----------
     Same library + settings as Sai Aryan Goswami's portfolio. Lerp 0.1 +
     1.5s duration gives the slightly-floaty feel without lag. We don't
     hijack anchor clicks — `html { scroll-behavior: smooth }` already
     handles those, and Lenis cooperates with native scroll. */
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    const lenis = new window.Lenis({
      lerp: 0.1,
      duration: 1.5,
      smoothWheel: true,
    });
    const lenisRaf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(lenisRaf);
    };
    requestAnimationFrame(lenisRaf);
  }

  /* ---------- ShuffleText: scramble letters with random chars before
     resolving to the real glyphs. Used once for the hero name and as the
     transition between titles in the cycler. Hindi characters as the
     scramble pool — small nod to the Hindi NLP work in the projects. */
  const SHUFFLE_CHARS = 'अआइईउऊऋएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह';

  const shuffleText = (element, opts = {}) => {
    const text = element.dataset.shuffle || element.textContent;
    if (reduceMotion) { element.textContent = text; return; }

    const chars = opts.chars || SHUFFLE_CHARS;
    /* Tuned slow enough that the eye registers the shuffle as deliberate,
       not flickery. ~1.2s total for a 6-letter name. */
    const steps = opts.steps ?? 8;
    const stepDelay = opts.stepDelay ?? 90;
    const charDelay = opts.charDelay ?? 90;

    const display = new Array(text.length).fill('');
    element.textContent = '';

    text.split('').forEach((char, i) => {
      window.setTimeout(() => {
        if (char === ' ') {
          display[i] = ' ';
          element.textContent = display.join('');
          return;
        }
        let step = 0;
        const id = window.setInterval(() => {
          if (step < steps) {
            display[i] = chars[Math.floor(Math.random() * chars.length)];
            step++;
          } else {
            display[i] = char;
            window.clearInterval(id);
          }
          element.textContent = display.join('');
        }, stepDelay);
      }, i * charDelay);
    });
  };

  document.querySelectorAll('[data-shuffle]').forEach((el) => shuffleText(el));

  /* ---------- TitleCycler: rotates the roles under the hero name every 5s,
     using ShuffleText as the transition. Reads JSON array from data-cycler. */
  document.querySelectorAll('[data-cycler]').forEach((el) => {
    let titles;
    try { titles = JSON.parse(el.dataset.cycler); } catch { return; }
    if (!Array.isArray(titles) || titles.length === 0) return;

    let idx = 0;
    const setTitle = () => {
      el.dataset.shuffle = titles[idx];
      /* Slightly faster than the hero name shuffle since the cycler runs
         repeatedly, but still slow enough to read. ~1s for ~20 chars. */
      shuffleText(el, { steps: 4, stepDelay: 65, charDelay: 38 });
      idx = (idx + 1) % titles.length;
    };
    setTitle();
    if (reduceMotion) return;
    window.setInterval(setTitle, 5000);
  });

  /* ---------- Arrival highlight for nav-clicked sections ---------- */
  /* Smooth scroll itself is handled natively by `html { scroll-behavior: smooth }`.
     Letting the browser handle anchor clicks natively means the URL hash updates,
     which is what triggers the `.section:target` CSS isolation rule. */
  const highlightArrival = (id) => {
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.remove('is-arrived');
    // Force reflow so the animation restarts when re-targeting the same section
    void target.offsetWidth;
    target.classList.add('is-arrived');
    window.setTimeout(() => target.classList.remove('is-arrived'), 1800);
  };
  window.addEventListener('hashchange', () => highlightArrival(location.hash.slice(1)));
  window.addEventListener('load', () => {
    if (location.hash) highlightArrival(location.hash.slice(1));
  });

  /* ---------- Active nav highlighting ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const matches = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', matches);
    });
  };

  let scrollTicking = false;
  const onScroll = () => {
    const scrollY = window.scrollY;
    const winH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    if (scrollY < 80) { setActive('home'); return; }
    if (scrollY + winH >= docH - 120) { setActive('contact'); return; }

    const probe = scrollY + 120;
    let activeId = sections[0]?.id || 'home';
    for (const sec of sections) {
      if (probe >= sec.offsetTop) activeId = sec.id;
    }
    setActive(activeId);
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
  }, { passive: true });
  window.addEventListener('load', onScroll);
  onScroll();

  /* ---------- Projects horizontal-scroll ----------
     Maps vertical scroll progress within .section-projects (which is 280vh
     tall) to the horizontal translateX of the projects rail. While the user
     scrolls down through the section, the cards pan sideways. On mobile or
     reduced-motion (handled in CSS), this is short-circuited to a vertical
     stack. */
  const projectsSection = document.querySelector('.section-projects');
  const projectsRail = document.querySelector('[data-rail]');

  if (projectsSection && projectsRail && !reduceMotion) {
    const updateRail = () => {
      const sectionHeight = projectsSection.offsetHeight;
      const viewportHeight = window.innerHeight;
      const rect = projectsSection.getBoundingClientRect();
      const totalScroll = sectionHeight - viewportHeight;

      // How far into the section we've scrolled, clamped 0..totalScroll.
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      const progress = totalScroll > 0 ? scrolled / totalScroll : 0;

      const railWidth = projectsRail.scrollWidth;
      const visibleWidth = projectsSection.clientWidth;
      const maxTranslate = Math.max(0, railWidth - visibleWidth);

      projectsRail.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
    };

    let railTicking = false;
    const onRailScroll = () => {
      if (railTicking) return;
      railTicking = true;
      requestAnimationFrame(() => { updateRail(); railTicking = false; });
    };
    window.addEventListener('scroll', onRailScroll, { passive: true });
    window.addEventListener('resize', updateRail);
    window.addEventListener('load', updateRail);
    updateRail();
  }

  /* ---------- Experience vertical scroll-jacking ----------
     Mirror of the projects horizontal-scroll, but translate Y instead of X.
     Section is 240vh tall; sticky inner pins; rail translates Y as user
     scrolls. Mobile/reduced-motion falls back to natural stack via CSS. */
  const expSection = document.querySelector('.section-experience');
  const expRail = document.querySelector('[data-exp-rail]');

  if (expSection && expRail && !reduceMotion) {
    const updateExp = () => {
      if (window.innerWidth <= 768) {
        expRail.style.transform = '';
        return;
      }
      const sectionHeight = expSection.offsetHeight;
      const viewportHeight = window.innerHeight;
      const rect = expSection.getBoundingClientRect();
      const totalScroll = sectionHeight - viewportHeight;

      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top));
      const progress = totalScroll > 0 ? scrolled / totalScroll : 0;

      const railHeight = expRail.scrollHeight;
      const expViewport = expRail.parentElement;
      const visibleHeight = expViewport.clientHeight;
      const maxTranslate = Math.max(0, railHeight - visibleHeight);

      expRail.style.transform = `translate3d(0, ${-progress * maxTranslate}px, 0)`;
    };

    let expTicking = false;
    const onExpScroll = () => {
      if (expTicking) return;
      expTicking = true;
      requestAnimationFrame(() => { updateExp(); expTicking = false; });
    };
    window.addEventListener('scroll', onExpScroll, { passive: true });
    window.addEventListener('resize', updateExp);
    window.addEventListener('load', updateExp);
    updateExp();
  }

  /* ---------- Skills: reveal_skills.py terminal ----------
     Fake terminal with `python reveal_skills.py` pre-typed. On click or
     ↵ Enter (when the terminal is focused), runs through a sequence of
     "loading shard X/5: <file>.safetensors" lines with animated progress
     bars. Each completed shard reveals the corresponding skill-group card
     below. The whole thing reads as ML / safetensors loading without
     calling itself out as such. */
  const skillsTerminal = document.querySelector('[data-skills-terminal]');
  const terminalHint = document.querySelector('[data-terminal-hint]');
  const terminalOutput = document.querySelector('[data-terminal-output]');
  const skillGroups = Array.from(document.querySelectorAll('[data-skill-groups] .skill-group'));

  if (skillsTerminal && terminalOutput && skillGroups.length > 0) {
    let scriptRun = false;

    /* Real-feeling shard sizes — modeled on actual safetensors file sizes
       you'd see when loading a 7B model. Per-shard duration tuned so the
       full sequence takes ~3.5s. */
    const shards = [
      { name: 'languages.safetensors',     mb: 87.4,  dur: 580 },
      { name: 'ml_llms.safetensors',       mb: 142.1, dur: 720 },
      { name: 'data.safetensors',          mb: 98.2,  dur: 600 },
      { name: 'build_deploy.safetensors',  mb: 64.5,  dur: 540 },
      { name: 'workflow.safetensors',      mb: 31.8,  dur: 420 },
    ];

    const wait = (ms) => new Promise((r) => window.setTimeout(r, ms));

    const appendLine = (html, extraClass = '') => {
      const div = document.createElement('div');
      div.className = 'terminal-output-line' + (extraClass ? ' ' + extraClass : '');
      div.innerHTML = html;
      terminalOutput.appendChild(div);
      // Keep the latest line in view if the body has scrolled.
      const body = terminalOutput.parentElement;
      if (body) body.scrollTop = body.scrollHeight;
      return div;
    };

    const animateBar = (lineEl, durationMs, totalMb) => new Promise((resolve) => {
      const totalChars = 22;
      const startTime = performance.now();
      const tick = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const filled = Math.floor(progress * totalChars);
        const empty = totalChars - filled;
        const pct = Math.floor(progress * 100);
        const loadedMb = (progress * totalMb).toFixed(1);
        lineEl.innerHTML =
          '  <span class="bar"><span class="bar-fill">' +
          '█'.repeat(filled) +
          '</span>' +
          '░'.repeat(empty) +
          '</span> <span class="pct">' + pct + '%</span>' +
          ' <span class="size">&middot; ' + loadedMb + ' / ' + totalMb + ' MB</span>';
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });

    const runScript = async () => {
      if (scriptRun) return;
      scriptRun = true;
      skillsTerminal.classList.add('is-running');
      if (terminalHint) terminalHint.style.display = 'none';

      appendLine('<span class="prompt">&gt;</span> Initializing PyTorch backend... <span class="ok">&check;</span>');
      await wait(reduceMotion ? 80 : 360);

      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];
        appendLine(
          '<span class="prompt">&gt;</span> Loading shard ' +
          '<span class="num">' + (i + 1) + '/5</span>: ' +
          '<span class="file">' + s.name + '</span>'
        );
        const barLine = appendLine('', '');
        if (reduceMotion) {
          // Skip the bar animation; just snap to 100%.
          barLine.innerHTML =
            '  <span class="bar"><span class="bar-fill">' +
            '█'.repeat(22) + '</span></span> <span class="pct">100%</span>' +
            ' <span class="size">&middot; ' + s.mb + ' MB</span>';
        } else {
          await animateBar(barLine, s.dur, s.mb);
        }

        // Reveal the corresponding skill-group card.
        if (skillGroups[i]) skillGroups[i].classList.add('is-revealed');
        await wait(reduceMotion ? 30 : 130);
      }

      await wait(reduceMotion ? 80 : 240);
      const totalChips = skillGroups.reduce((n, g) => n + g.querySelectorAll('.chips li').length, 0);
      appendLine('<span class="ok">Arsenal initialized</span> &mdash; <span class="num">' + totalChips + '</span> capabilities loaded.');
      appendLine(
        '<span class="prompt">tushar</span><span style="color:var(--text-muted)">@</span><span class="prompt">portfolio</span>:' +
        '<span class="file">~/arsenal</span><span style="color:var(--text-muted)">$</span> <span class="terminal-cursor"></span>',
        ''
      );
    };

    skillsTerminal.addEventListener('click', runScript);
    skillsTerminal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        runScript();
      }
    });

    /* Auto-focus the terminal when the Skills section comes into view, so
       the user can hit Enter without first clicking. preventScroll keeps
       the focus from yanking the page. */
    if ('IntersectionObserver' in window) {
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const skillsIO = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.4 && !scriptRun) {
              try { skillsTerminal.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
            }
          });
        }, { threshold: [0, 0.4, 0.7] });
        skillsIO.observe(skillsSection);
      }
    }
  }

  /* ---------- Project leaves: expand / collapse ----------
     Legacy code from the old expandable-leaves layout. The new horizontal
     rail uses .project-card with always-open content, so this loop runs over
     zero elements. Leaving it as a safe no-op rather than deleting in case
     we ever reintroduce expandable cards. */
  const LEAF_TRANSITION_MS = 520; // matches max-height transition + small buffer
  document.querySelectorAll('.leaf').forEach((leaf) => {
    const btn = leaf.querySelector('.leaf-summary');
    const body = leaf.querySelector('.leaf-body');
    if (!btn || !body) return;
    btn.addEventListener('click', () => {
      const open = leaf.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));

      if (open) {
        // Set max-height to the actual content height so the easing curve
        // applies across the real range — not an arbitrary 1400px ceiling.
        body.style.maxHeight = body.scrollHeight + 'px';
        // After the animation, release the constraint so dynamic reflow works.
        window.setTimeout(() => {
          if (leaf.classList.contains('is-open')) body.style.maxHeight = 'none';
        }, LEAF_TRANSITION_MS);
      } else {
        // Closing: snap from auto/none back to current pixel value, then to 0,
        // so the transition has a starting frame to interpolate from.
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(() => { body.style.maxHeight = '0'; });
      }

      if (!open) return;

      // After the open animation finishes, nudge the page so the leaf stays in view.
      window.setTimeout(() => {
        const rect = leaf.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const overflowBottom = rect.bottom - viewportH;
        const overflowTop = -rect.top + 80; // 80px keeps it clear of the fixed nav
        if (overflowBottom > 0) {
          window.scrollBy({ top: Math.min(overflowBottom + 24, rect.height), behavior: 'smooth' });
        } else if (rect.top < 80) {
          window.scrollBy({ top: -overflowTop, behavior: 'smooth' });
        }
      }, LEAF_TRANSITION_MS);
    });
  });

  /* ---------- Scroll reveal ---------- */
  /* Project cards live inside the sticky horizontal rail; skill groups have
     their own click-to-reveal flow via the terminal — both are excluded so
     the natural scroll observer doesn't fight the custom logic. */
  const revealTargets = document.querySelectorAll(
    '.section, .stat-box'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const showError = (field, msg) => {
      const span = form.querySelector(`[data-error-for="${field.id}"]`);
      if (span) span.textContent = msg || '';
    };

    const validators = {
      fullName: (v) => v.trim().length >= 3 ? '' : 'Please enter at least 3 characters.',
      email_id: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? '' : 'Please enter a valid email.',
      message: (v) => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
    };

    Object.keys(validators).forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;
      field.addEventListener('input', () => showError(field, validators[id](field.value)));
      field.addEventListener('blur', () => showError(field, validators[id](field.value)));
    });

    form.addEventListener('submit', (e) => {
      let firstInvalid = null;
      Object.keys(validators).forEach((id) => {
        const field = document.getElementById(id);
        if (!field) return;
        const msg = validators[id](field.value);
        showError(field, msg);
        if (msg && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
      }
    });
  }
})();
