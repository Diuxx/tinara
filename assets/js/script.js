const NAVBAR_SCROLL_THRESHOLD = 50;
const BACK_TO_TOP_THRESHOLD = 120;

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleNavbarScroll = () => {
        navbar.classList.toggle('navbar-scrolled', window.scrollY > NAVBAR_SCROLL_THRESHOLD);
    };

    handleNavbarScroll();
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
}

function initBackToTop() {
    let backToTopButton = document.querySelector('.back-to-top');

    if (!backToTopButton) {
        backToTopButton = document.createElement('a');
        backToTopButton.href = '#top';
        backToTopButton.className = 'back-to-top';
        backToTopButton.setAttribute('aria-label', 'Revenir en haut de la page');
        backToTopButton.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
        document.body.appendChild(backToTopButton);
    }

    const toggleVisibility = () => {
        const isVisible = window.scrollY > BACK_TO_TOP_THRESHOLD;
        backToTopButton.classList.toggle('is-visible', isVisible);
    };

    backToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (counters.length === 0 || !window.IntersectionObserver) return;

    const startCounter = (counter) => {
        const target = Number(counter.getAttribute('data-target') || 0);
        let value = 0;
        const step = Math.max(target / 100, 1);

        const update = () => {
            value += step;

            if (value < target) {
                counter.innerText = String(Math.ceil(value));
                requestAnimationFrame(update);
            } else {
                counter.innerText = String(target);
            }
        };

        update();
    };

    const observer = new IntersectionObserver((entries, observerRef) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            startCounter(entry.target);
            observerRef.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    counters.forEach((counter) => observer.observe(counter));
}

function initNewsletterModal() {
    const openBtn = document.getElementById('open-newsletter-modal');
    const modal = document.getElementById('newsletter-modal');
    const closeElements = document.querySelectorAll('[data-close-newsletter]');
    if (!openBtn || !modal) return;

    const openModal = () => {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('newsletter-open');
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('newsletter-open');
    };

    openBtn.addEventListener('click', (event) => {
        event.preventDefault();
        openModal();
    });

    closeElements.forEach((element) => {
        element.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

// Reusable modal launcher used by donation and sponsorship pages.
function initEmbeddedDonationModal() {
    const modalElement = document.getElementById('don-modal');
    const iframe = document.getElementById('don-modal-iframe');
    const title = document.getElementById('don-modal-title');
    const triggers = document.querySelectorAll('[data-open-don-modal]');

    if (!modalElement || !iframe || !title || triggers.length === 0 || !window.bootstrap?.Modal) {
        return;
    }

    const modalInstance = new bootstrap.Modal(modalElement);

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();

            const targetUrl = trigger.getAttribute('data-don-url');
            const targetTitle = trigger.getAttribute('data-don-title') || 'Faire un don';
            if (!targetUrl) return;

            title.textContent = targetTitle;
            iframe.title = targetTitle;
            iframe.src = targetUrl;
            modalInstance.show();
        });
    });

    // Reset iframe on close to stop background media/network activity.
    modalElement.addEventListener('hidden.bs.modal', () => {
        iframe.src = 'about:blank';
    });
}

// Fonction pour charger les composants HTML (Header et Footer)

function loadComponents() {
    // Les pages sont maintenant dans des dossiers (/parrainage/, /articles/why/, etc.).
    // On charge donc toujours les composants depuis la racine du site.
    const headerPlaceholder = document.getElementById('header-placeholder');

    if (headerPlaceholder) {
        fetch('/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;

                initActiveMenu();
                initNavbarScroll();
                setupMobileMenuBehavior(headerPlaceholder);
            })
            .catch(err => console.error("Erreur chargement header:", err));
    }

    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (footerPlaceholder) {
        fetch('/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(err => console.error("Erreur chargement footer:", err));
    }
}

// Petite fonction helper pour le menu mobile (X et fermeture)
function setupMobileMenuBehavior(headerEl) {
    const menuCollapse = headerEl.querySelector('#navMain');
    const togglerIcon = headerEl.querySelector('.navbar-toggler-icon-custom i');

    if (menuCollapse && togglerIcon) {
        menuCollapse.addEventListener('show.bs.collapse', () => {
            togglerIcon.classList.replace('fa-bars', 'fa-times');
        });
        menuCollapse.addEventListener('hide.bs.collapse', () => {
            togglerIcon.classList.replace('fa-times', 'fa-bars');
        });
        
        const navLinks = menuCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    const bsCollapse = bootstrap.Collapse.getInstance(menuCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            });
        });
    }
}

/**
 * Gestion du menu actif (Soulignement)
 */
function initActiveMenu() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    if (navLinks.length === 0) return;

    const normalizePath = (path) => {
        let cleanPath = path || '/';
        cleanPath = cleanPath.replace(/\/index\.html$/, '/');
        cleanPath = cleanPath.replace(/\.html$/, '/');

        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }

        if (cleanPath !== '/' && !cleanPath.endsWith('/')) {
            cleanPath += '/';
        }

        return cleanPath;
    };

    const currentPath = normalizePath(window.location.pathname);

    navLinks.forEach(link => {
        link.classList.remove('active');

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const url = new URL(href, window.location.origin);
        const linkPath = normalizePath(url.pathname);

        // Activation des pages propres : /actualites/, /about/, /faq/, etc.
        if (!url.hash && linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const id = entry.target.getAttribute('id');

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('#' + id)) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });
    }, observerOptions);

    document.querySelectorAll('main section[id]').forEach(section => {
        observer.observe(section);
    });
}


/**
 * Animation d'apparition des éléments (Reveal effect)
 */
function initRevealAnimation() {
    const selectors = [
        '.section', '.action-card', '.actu-card', 
        '.hero h1', '.hero p', 'article img', 'article p'
    ];
    
    const elementsToReveal = document.querySelectorAll(selectors.join(', '));
    
    elementsToReveal.forEach(el => {
        el.classList.add('reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // On utilise isIntersecting OU une petite marge de sécurité
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.05, // On baisse à 5% pour que ça se déclenche plus vite
        rootMargin: '0px 0px -50px 0px' // Déclenche l'effet 50px avant que l'élément n'entre
    });

    elementsToReveal.forEach(el => observer.observe(el));
}


function initHeroTextAnimation() {
    const textElement = document.getElementById('dynamic-text');
    if (!textElement) return;

    const phrases = [
        "Un engagement durable",
        "pour les enfants de Kigoma"
    ];
    
    let currentIndex = 0;

    setInterval(() => {
        // 1. On lance l'effet de disparition
        textElement.classList.add('fade-out');

        setTimeout(() => {
            // 2. On change le texte pendant qu'il est invisible
            currentIndex = (currentIndex + 1) % phrases.length;
            textElement.textContent = phrases[currentIndex];

            // 3. On fait réapparaître le nouveau texte
            textElement.classList.remove('fade-out');
        }, 500); // Temps correspondant à la durée de la transition CSS (0.5s)

    }, 4000); // Change toutes les 4 secondes
}


/**
 * Carrousel "Nos actualités" : défilement automatique + flèches.
 * PC/tablette : 3 cartes visibles.
 * Mobile : 1 carte visible.
 */
function initActuCarousel() {
    const track = document.getElementById('actuTrack');
    const prevBtn = document.getElementById('actuPrev');
    const nextBtn = document.getElementById('actuNext');

    if (!track) return;

    let autoplayTimer = null;
    const AUTOPLAY_DELAY = 3000;
    const SCROLL_TOLERANCE = 3;

    function removeGhostItems() {
        track.querySelectorAll('.actu-carousel-ghost').forEach((ghost) => {
            ghost.remove();
        });
    }

    function getItems() {
        return Array.from(track.querySelectorAll('.actu-carousel-item'))
            .filter((item) => !item.classList.contains('hidden-filter'));
    }

    function getStepWidth() {
        const item = getItems()[0];
        if (!item) return 0;

        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || 0);

        return item.getBoundingClientRect().width + gap;
    }

    function getMaxScroll() {
        return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function hasCarouselScroll() {
        return getMaxScroll() > SCROLL_TOLERANCE;
    }

    function updateButtons() {
        if (!prevBtn || !nextBtn) return;

        const canScroll = hasCarouselScroll();

        prevBtn.disabled = !canScroll;
        nextBtn.disabled = !canScroll;

        prevBtn.classList.toggle('is-disabled', !canScroll);
        nextBtn.classList.toggle('is-disabled', !canScroll);
    }

    function scrollByStep(direction) {
        removeGhostItems();

        const step = getStepWidth();
        const maxScroll = getMaxScroll();

        if (!step || maxScroll <= SCROLL_TOLERANCE) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
            updateButtons();
            return;
        }

        const currentLeft = track.scrollLeft;
        let target;

        if (direction > 0) {
            if (currentLeft >= maxScroll - SCROLL_TOLERANCE) {
                target = 0;
            } else {
                target = Math.min(currentLeft + step, maxScroll);
            }
        } else {
            if (currentLeft <= SCROLL_TOLERANCE) {
                target = maxScroll;
            } else {
                target = Math.max(currentLeft - step, 0);
            }
        }

        track.scrollTo({
            left: target,
            behavior: 'smooth'
        });

        setTimeout(updateButtons, 350);
    }

    function startAutoplay() {
        stopAutoplay();

        if (!hasCarouselScroll()) {
            updateButtons();
            return;
        }

        autoplayTimer = setInterval(() => {
            scrollByStep(1);
        }, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            scrollByStep(-1);
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            scrollByStep(1);
            startAutoplay();
        });
    }

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    track.addEventListener('touchstart', stopAutoplay, { passive: true });
    track.addEventListener('touchend', () => {
        setTimeout(startAutoplay, 2500);
    }, { passive: true });

    window.addEventListener('resize', () => {
        removeGhostItems();
        track.scrollTo({ left: 0, behavior: 'auto' });
        updateButtons();
        startAutoplay();
    });

    removeGhostItems();
    updateButtons();

    if (document.readyState === 'complete') {
        startAutoplay();
    } else {
        window.addEventListener('load', startAutoplay);
    }
}

function initActuFilter() {
    const filterBtns = document.querySelectorAll('.actu-filter-btn');
    const emptyMsg = document.getElementById('actuEmpty');
    const carouselWrapper = document.getElementById('actuCarouselWrapper');
    const gridWrapper = document.getElementById('actuGridWrapper');
    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            if (filter === 'all') {
                // Mode carrousel
                if (carouselWrapper) carouselWrapper.style.display = 'block';
                if (gridWrapper) gridWrapper.style.display = 'none';
                if (emptyMsg) emptyMsg.style.display = 'none';
                const track = document.getElementById('actuTrack');
                if (track) track.scrollLeft = 0;
            } else {
                // Mode grille filtrée
                if (carouselWrapper) carouselWrapper.style.display = 'none';
                if (gridWrapper) gridWrapper.style.display = 'block';

                const items = document.querySelectorAll('.actu-grid-item');
                let visibleCount = 0;

                items.forEach(item => {
                    if (item.getAttribute('data-category') === filter) {
                        item.classList.remove('hidden-filter');
                        visibleCount++;
                    } else {
                        item.classList.add('hidden-filter');
                    }
                });

                if (emptyMsg) {
                    emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
                }
            }
        });
    });
}


function updateNavbar() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Scroll classique
window.addEventListener('scroll', updateNavbar);

// 🔥 IMPORTANT : attendre que tout soit chargé (images + position finale)
window.addEventListener('load', () => {
    updateNavbar();

    // 🔥 Fix supplémentaire pour les ancres (#orphelinat)
    setTimeout(updateNavbar, 50);
});

/* Widget parrainer et faire un don */

function initStickyDonationWidgets() {
    const currentPath = window.location.pathname
        .replace(/\/index\.html$/, '/')
        .replace(/\.html$/, '/');

    const excludedPages = [
        '/parrainage/',
        '/dons/',
        '/mensuel/',
        '/ponctuel/'
    ];

    if (excludedPages.includes(currentPath)) {
        return;
    }

    if (document.querySelector('.sticky-pc-actions') || document.querySelector('.sticky-mobile-bar')) {
        return;
    }

    const stickyPc = document.createElement('div');
    stickyPc.className = 'sticky-pc-actions d-none d-lg-flex';
    stickyPc.innerHTML = `
        <a href="/parrainage/" class="sticky-btn btn-parraine" aria-label="Parrainer un enfant">
            <span>JE PARRAINE</span>
            <i class="fas fa-heart" aria-hidden="true"></i>
        </a>
        <a href="/dons/" class="sticky-btn btn-don" aria-label="Faire un don">
            <span>FAIRE UN DON</span>
            <i class="fas fa-hand-holding-heart" aria-hidden="true"></i>
        </a>
    `;

    const stickyMobile = document.createElement('div');
    stickyMobile.className = 'sticky-mobile-bar d-lg-none';
    stickyMobile.innerHTML = `
        <a href="/parrainage/" class="mobile-sticky-btn btn-parraine" aria-label="Parrainer un enfant">
            JE PARRAINE <i class="fas fa-heart ms-1" aria-hidden="true"></i>
        </a>
        <a href="/dons/" class="mobile-sticky-btn btn-don" aria-label="Faire un don">
            FAIRE UN DON <i class="fas fa-hand-holding-heart ms-1" aria-hidden="true"></i>
        </a>
    `;

    document.body.appendChild(stickyPc);
    document.body.appendChild(stickyMobile);
    document.body.classList.add('has-sticky-mobile-bar');
}

function initReliableContactScroll() {
    const params = new URLSearchParams(window.location.search);
    const shouldScrollToContact =
        window.location.hash === '#contact' || params.get('section') === 'contact';

    if (!shouldScrollToContact) return;

    function scrollToContact() {
        const contactSection = document.getElementById('contact');
        if (!contactSection) return;

        const navbar = document.querySelector('.navbar-custom');
        const navbarHeight = navbar ? navbar.offsetHeight : 90;
        const offset = navbarHeight + 24;

        const targetTop = contactSection.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    }

    window.addEventListener('load', () => {
        scrollToContact();

        // Sécurité : relance après le chargement du header/footer/images.
        setTimeout(scrollToContact, 300);
        setTimeout(scrollToContact, 900);
    });
}


function initContactDirectForm() {
    const form = document.getElementById('contactDirectForm');
    const status = document.getElementById('contactFormStatus');
    const submitBtn = document.getElementById('contactSubmitBtn');

    if (!form || !status || !submitBtn) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        status.className = 'contact-form-status';
        status.textContent = '';

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            status.classList.add('is-error');
            status.textContent = 'Veuillez corriger les champs indiqués avant d’envoyer le message.';
            return;
        }

        form.classList.add('was-validated');

        const formData = new FormData(form);
        const payload = {};

        formData.forEach((value, key) => {
            payload[key] = value;
        });

        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l’envoi');
            }

            status.classList.add('is-success');
            status.textContent = 'Votre message a bien été envoyé. Merci, nous vous répondrons dès que possible.';

            form.reset();
            form.classList.remove('was-validated');
        } catch (error) {
            status.classList.add('is-error');
            status.textContent = 'Le message n’a pas pu être envoyé pour le moment. Veuillez réessayer ou écrire directement à contact@tinara-association.com.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer le message';
        }
    });
}

initNavbarScroll();
initBackToTop();
initCounters();
initNewsletterModal();
initEmbeddedDonationModal();
loadComponents();
initRevealAnimation();
initHeroTextAnimation();
initActuCarousel();
initActuFilter();
initStickyDonationWidgets();
initReliableContactScroll();
initContactDirectForm();