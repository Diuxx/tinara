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

initNavbarScroll();
initBackToTop();
initCounters();
initNewsletterModal();
initEmbeddedDonationModal();
