/**
 * NAVBAR
 */
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function () {

    if (window.scrollY > 50) {
        navbar.classList.add("navbar-scrolled");
    }
    else {
        navbar.classList.remove("navbar-scrolled");
    }

});

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
