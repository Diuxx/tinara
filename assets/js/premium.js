/**
 * TINARA — premium.js
 * Gestion de l'animation d'ouverture + scroll reveal avancé
 * À charger APRÈS script.js dans chaque page HTML :
 *   <script src="assets/js/premium.js"></script>
 *
 * Dépendances : aucune (vanilla JS pur, pas de lib externe)
 * Impact performance : léger — IntersectionObserver + requestAnimationFrame
 */

'use strict';

/* ── 1. INTRO ANIMATION ─────────────────────────────────────
   Injecte le portail HTML dans le DOM au chargement,
   puis déclenche l'ouverture après un court délai.
   Le portail est supprimé du DOM après l'animation complète
   pour ne pas impacter le layout ou les interactions.
   ----------------------------------------------------------- */

function initIntroAnimation() {

  // On ne joue l'intro qu'une seule fois par session
  // (pas à chaque navigation interne)
    if (sessionStorage.getItem('tinara-intro-seen')) return;
  // Bloque le scroll pendant l'animation d'ouverture
  document.body.style.overflow = 'hidden';

  // Vérifier la préférence de mouvement réduit
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sessionStorage.setItem('tinara-intro-seen', '1');
    return;
  }

  // ── Injection du HTML du portail ──────────────────────────
  const introHTML = `
    <div id="tinara-intro" aria-hidden="true" role="presentation">
      <div class="intro-panel intro-panel--left"></div>
      <div class="intro-panel intro-panel--right"></div>
      <div class="intro-glow"></div>
      <div class="intro-logo">
        <div class="intro-line"></div>
        <div class="intro-logo-text">TINARA</div>
        <div class="intro-logo-sub">Association · Tanzanie</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', introHTML);

  const intro = document.getElementById('tinara-intro');

  // Séquence temporelle :
  // 0ms      → portail visible, logo présent
  // 200ms    → ligne décorative s'étend (géré en CSS)
  // 700ms    → les panneaux s'écartent + glow apparaît
  // 700+1400 = 2100ms → fin de l'animation des panneaux
  // 2200ms   → on supprime l'élément du DOM

  setTimeout(() => {
    intro.classList.add('is-open');

    // Une fois l'animation terminée, supprimer proprement
    setTimeout(() => {
      intro.classList.add('is-done');
      sessionStorage.setItem('tinara-intro-seen', '1');
      // Réactive le scroll et repositionne en haut
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 1600);// légèrement après la fin de la transition CSS

  }, 700);
}

/* ── 2. SCROLL REVEAL AVANCÉ ────────────────────────────────
   Remplace le système reveal basique.
   On assigne automatiquement les classes selon le type d'élément :
   - .action-card     → reveal-up avec cascade
   - .section-title   → reveal-up + déclenche l'underline animé
   - .stat-number     → reveal-scale
   - .goals .col-4    → reveal-up avec cascade
   - article p        → reveal-up séquentiel
   ----------------------------------------------------------- */

function initPremiumReveal() {

  // Sélecteurs et leur classe de reveal associée
  const revealMap = [
    { selector: '.action-card',       cls: 'reveal-up'    },
    { selector: '.actu-card',         cls: 'reveal-up'    },
    { selector: '.section-title',     cls: 'reveal-up'    },
    { selector: '.stat-number',       cls: 'reveal-scale' },
    { selector: '.goals .col-4',      cls: 'reveal-up'    },
    { selector: '.orphanage-content', cls: 'reveal-left'  },
    { selector: '.orphanage-media',   cls: 'reveal-up'    },
    { selector: 'article p',          cls: 'reveal-up'    },
    { selector: '.aider-card',        cls: 'reveal-up'    },
    { selector: '.parrainage-card',   cls: 'reveal-up'    },
    { selector: '.dons-card',         cls: 'reveal-up'    },
  ];

  // On retire les anciennes classes 'reveal' du script.js
  // pour éviter les conflits
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('reveal');
    el.style.opacity = '';
    el.style.transform = '';
  });

  // Assigner les nouvelles classes
  revealMap.forEach(({ selector, cls }) => {
    document.querySelectorAll(selector).forEach(el => {
      // Éviter les doublons
      if (!el.classList.contains('reveal-up') &&
          !el.classList.contains('reveal-left') &&
          !el.classList.contains('reveal-scale')) {
        el.classList.add(cls);
      }
    });
  });

  // IntersectionObserver avec seuil bas pour déclencher tôt
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('visible');

      // Cas spécial : section-title → déclenche l'underline
      // (la classe visible est déjà utilisée pour le ::after en CSS)

      observer.unobserve(el);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  // Observer tous les éléments avec classe reveal-*
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale')
    .forEach(el => observer.observe(el));
}

/* ── 3. PARALLAX HÉRO SUBTIL ────────────────────────────────
   Le texte du hero monte légèrement au scroll.
   Effet de profondeur perçue. Très léger en perf
   car on utilise transform (pas top/left) sur rAF.
   ----------------------------------------------------------- */

function initHeroParallax() {
  const heroContainer = document.querySelector('#homepage .hero .container');
  if (!heroContainer) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight;

        if (scrollY < maxScroll) {
          // Le texte remonte à 30% de la vitesse de scroll
          const offset = scrollY * 0.28;
          heroContainer.style.transform = `translateY(-${offset}px)`;
          // Légère disparition au scroll
          heroContainer.style.opacity = 1 - (scrollY / (maxScroll * 0.7));
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── 4. SCROLL INDICATOR ────────────────────────────────────
   Injecte l'indicateur de scroll dans le hero de l'index.
   ----------------------------------------------------------- */

function initScrollHint() {
  const hero = document.querySelector('#homepage .hero');
  if (!hero) return;

  // Masquer au scroll
  window.addEventListener('scroll', () => {
    const hint = hero.querySelector('.hero-scroll-hint');
    if (hint) hint.style.opacity = window.scrollY > 80 ? '0' : '';
  }, { passive: true });
}

/* ── 5. MAGNETIC BUTTONS ────────────────────────────────────
   Les boutons CTA principaux réagissent légèrement
   à la position de la souris (effet magnétique subtil).
   Désactivé sur mobile pour ne pas perturber le touch.
   ----------------------------------------------------------- */

function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return; // pas de hover = mobile/touch

  const magnetBtns = document.querySelectorAll('.btn-primary, .btn-secondary');

  magnetBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.18; // intensité : 18%
      const dy = (e.clientY - cy) * 0.18;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ── 6. CURSOR PERSONNALISÉ (desktop uniquement) ────────────
   Un curseur circulaire qui suit la souris avec un léger lag.
   Change de couleur et grossit au survol des éléments cliquables.
   Impact perf : quasi nul (transform sur un div).
   ----------------------------------------------------------- */

function initCustomCursor() {
  // Uniquement desktop avec pointeur précis
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(max-width: 992px)').matches) return;

  const cursor = document.createElement('div');
  cursor.id = 'tinara-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--bs-primary, #008678);
    pointer-events: none;
    z-index: 99998;
    top: 0; left: 0;
    transform: translate(-50%, -50%);
    transition: width 0.2s ease, height 0.2s ease, background 0.2s ease, opacity 0.2s ease;
    opacity: 0;
    mix-blend-mode: multiply;
  `;
  document.body.appendChild(cursor);

  const trail = document.createElement('div');
  trail.id = 'tinara-cursor-trail';
  trail.style.cssText = `
    position: fixed;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(0, 134, 120, 0.35);
    pointer-events: none;
    z-index: 99997;
    top: 0; left: 0;
    transform: translate(-50%, -50%);
    transition: transform 0.12s ease, width 0.2s ease, height 0.2s ease, opacity 0.2s ease;
    opacity: 0;
  `;
  document.body.appendChild(trail);

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.opacity = '1';
    trail.style.opacity = '1';
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Le trail suit avec un léger retard (lerp)
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.14;
    trailY += (mouseY - trailY) * 0.14;
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Grossissement au survol des éléments interactifs
  const interactiveSelectors = 'a, button, .btn, .action-card, .actu-card, .programme-image';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '18px';
      cursor.style.height = '18px';
      cursor.style.background = 'var(--bs-secondary, #df875c)';
      trail.style.width  = '50px';
      trail.style.height = '50px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
      cursor.style.background = 'var(--bs-primary, #008678)';
      trail.style.width  = '32px';
      trail.style.height = '32px';
    });
  });
}

/* ── INIT ────────────────────────────────────────────────── */

// On attend que le DOM soit prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  initIntroAnimation();
  initPremiumReveal();
  initHeroParallax();
  initScrollHint();
  initMagneticButtons();
}
