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
    const isSubFolder = window.location.pathname.includes('/articles/');
    const pathPrefix = isSubFolder ? '../' : '';

    // 1. CHARGEMENT DU HEADER
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch(pathPrefix + 'header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;

                // --- DYNAMISATION POUR LES SOUS-DOSSIERS (why.html) ---
                if (isSubFolder) {
                    // A. Correction des IMAGES (Logos)
                    headerPlaceholder.querySelectorAll('img').forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && !src.startsWith('http')) {
                            img.src = pathPrefix + src;
                        }
                    });

                    // B. Correction des LIENS (Menu)
                    headerPlaceholder.querySelectorAll('.nav-link, .navbar-brand, .btn-nav').forEach(link => {
                        const href = link.getAttribute('href');
                        // On ne modifie pas les liens externes (http) ni les ancres pures (#mission)
                        if (href && !href.startsWith('http') && !href.startsWith('#')) {
                            link.href = pathPrefix + href;
                        }
                    });
                }

                // Initialisation des comportements mobiles et actifs
                initActiveMenu();
                initNavbarScroll();
                setupMobileMenuBehavior(headerPlaceholder);
            })
            .catch(err => console.error("Erreur chargement header:", err));
    }

    // 2. CHARGEMENT DU FOOTER
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch(pathPrefix + 'footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;

                // --- DYNAMISATION POUR LES SOUS-DOSSIERS ---
                if (isSubFolder) {
                    // Correction des images du footer
                    footerPlaceholder.querySelectorAll('img').forEach(img => {
                        const src = img.getAttribute('src');
                        if (src && !src.startsWith('http')) {
                            img.src = pathPrefix + src;
                        }
                    });
                    // Correction des liens du footer
                    footerPlaceholder.querySelectorAll('a').forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && !href.startsWith('http') && !href.startsWith('#')) {
                            link.href = pathPrefix + href;
                        }
                    });
                }
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
    if (navLinks.length === 0) return; // Sécurité si le header n'est pas encore là

    // 1. GESTION DES PAGES (statique : À propos, Actualités, etc.)
    const currentUrl = window.location.pathname.split("/").pop() || "index.html";
    
    navLinks.forEach(link => {
        link.classList.remove('active'); // On nettoie tout au départ
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentUrl || (currentUrl === "index.html" && linkHref === "index.html")) {
            link.classList.add('active');
        }
    });

    // 2. GESTION DES ANCRES (Observer pour Mission, Actions, etc.)
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Plus sensible pour détecter la section du haut
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // On cherche le lien qui pointe vers cette ancre
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.includes('#' + id)) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // On observe TOUTES les sections qui ont un ID sur la page
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


initNavbarScroll();
initBackToTop();
initCounters();
initNewsletterModal();
initEmbeddedDonationModal();
loadComponents();
initRevealAnimation();
initHeroTextAnimation();
