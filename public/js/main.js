const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#primary-nav');
const contactForm = document.querySelector('#contact-form');
const submitButton = document.querySelector('#submit-button');
const formStatus = document.querySelector('#form-status');

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function closeMenu() {
  if (!menuToggle || !navLinks) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navLinks.classList.remove('is-open');
}

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navLinks.classList.toggle('is-open', open);
});

navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

document.querySelector('#year').textContent = new Date().getFullYear();

const validators = {
  name: (value) => value.trim().length >= 2 ? '' : 'Please enter at least 2 characters.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address.',
  projectType: (value) => value ? '' : 'Please choose a project type.',
  message: (value) => value.trim().length >= 10 ? '' : 'Please enter at least 10 characters.'
};

function setFieldError(name, message) {
  const field = contactForm.elements.namedItem(name);
  const error = document.querySelector(`#${name}-error`);
  if (!field) return;
  if (message) {
    field.setAttribute('aria-invalid', 'true');
    if (error) error.textContent = message;
  } else {
    field.removeAttribute('aria-invalid');
    if (error) error.textContent = '';
  }
}

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status is-visible is-${type}`;
  formStatus.focus();
}

Object.keys(validators).forEach((name) => {
  const field = contactForm?.elements.namedItem(name);
  field?.addEventListener('blur', () => setFieldError(name, validators[name](field.value)));
  field?.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) setFieldError(name, validators[name](field.value));
  });
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  let firstInvalid = null;
  Object.entries(validators).forEach(([name, validate]) => {
    const field = contactForm.elements.namedItem(name);
    const error = validate(field.value);
    setFieldError(name, error);
    if (error && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    showStatus('Please check the highlighted fields and try again.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = 'Sending enquiry… <span aria-hidden="true">⏳</span>';
  formStatus.className = 'form-status';
  const payload = Object.fromEntries(new FormData(contactForm).entries());

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Your enquiry could not be sent. Please try again.');
    showStatus(result.message || 'Thanks — your enquiry has been received.', 'success');
    contactForm.reset();
    Object.keys(validators).forEach((name) => setFieldError(name, ''));
  } catch (error) {
    showStatus(error.message || 'A network error occurred. Please check your connection and try again.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send project enquiry <i data-lucide="arrow-up-right"></i>';
    refreshIcons();
  }
});

window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });
window.addEventListener('load', refreshIcons);
