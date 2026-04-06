/**
 * NAVBAR
 */
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function () {

    if (navbar && window.scrollY > 50) {
        navbar.classList.add("navbar-scrolled");
    }
    else if (navbar) {
        navbar.classList.remove("navbar-scrolled");
    }

});

/**
 * BACK TO TOP
 */

const BACK_TO_TOP_THRESHOLD = 120;
let backToTopButton = document.querySelector('.back-to-top');

if (!backToTopButton) {
    backToTopButton = document.createElement('a');
    backToTopButton.href = '#top';
    backToTopButton.className = 'back-to-top';
    backToTopButton.setAttribute('aria-label', 'Revenir en haut de la page');
    backToTopButton.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(backToTopButton);
}

const toggleBackToTopVisibility = () => {
    if (!backToTopButton) return;

    const isVisible = window.scrollY > BACK_TO_TOP_THRESHOLD;
    backToTopButton.classList.toggle('is-visible', isVisible);
};

if (backToTopButton) {
    backToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    toggleBackToTopVisibility();
    window.addEventListener('scroll', toggleBackToTopVisibility, { passive: true });
}

/**
 * COMPTEUR
 */

const counters = document.querySelectorAll('.stat-number');

const startCounter = (counter) => {

    const target = +counter.getAttribute('data-target');
    let count = 0;

    const speed = target / 100;

    const update = () => {

        count += speed;

        if (count < target) {
            counter.innerText = Math.ceil(count);
            requestAnimationFrame(update);
        } else {
            counter.innerText = target;
        }

    }

    update();
}


const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startCounter(entry.target);
            observer.unobserve(entry.target);
        }
    })
}, { threshold: 0.6 });


counters.forEach(counter => {
    observer.observe(counter);
});

/**
 * NEWSLETTER MODAL
 */

const newsletterOpenBtn = document.getElementById('open-newsletter-modal');
const newsletterModal = document.getElementById('newsletter-modal');
const newsletterCloseElements = document.querySelectorAll('[data-close-newsletter]');

const openNewsletterModal = () => {
    if (!newsletterModal) return;

    newsletterModal.classList.add('is-open');
    newsletterModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('newsletter-open');
};

const closeNewsletterModal = () => {
    if (!newsletterModal) return;

    newsletterModal.classList.remove('is-open');
    newsletterModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('newsletter-open');
};

if (newsletterOpenBtn && newsletterModal) {
    newsletterOpenBtn.addEventListener('click', (event) => {
        event.preventDefault();
        openNewsletterModal();
    });

    newsletterCloseElements.forEach((element) => {
        element.addEventListener('click', closeNewsletterModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && newsletterModal.classList.contains('is-open')) {
            closeNewsletterModal();
        }
    });
}
