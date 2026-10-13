// Keep the FAQ focused: only one answer stays open at a time.
document.querySelectorAll('.faq-item').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq-item[open]').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const problemCard = document.querySelector('.problem-flip-card');
const problemFlipButton = document.querySelector('.problem-flip-button');

if (problemCard && problemFlipButton) {
  const front = problemCard.querySelector('.problem-flip-front');
  const back = problemCard.querySelector('.problem-flip-back');
  problemFlipButton.addEventListener('click', () => {
    const flipped = problemCard.classList.toggle('is-flipped');
    problemFlipButton.setAttribute('aria-pressed', String(flipped));
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    back.inert = !flipped;
    front.inert = flipped;
    problemFlipButton.setAttribute('aria-label', flipped ? 'Girar para volver al mensaje principal' : 'Girar para ver el otro mensaje');
  });
}

const whatsappChat = document.querySelector('.whatsapp-chat');
const whatsappToggle = document.querySelector('.floating-cta');
const whatsappMinimize = document.querySelector('.whatsapp-chat-minimize');
const whatsappClose = document.querySelector('.whatsapp-chat-close');
let whatsappAutoOpen = window.setTimeout(() => setWhatsappChatOpen(true), 5000);

function setWhatsappChatOpen(open) {
  if (!whatsappChat || !whatsappToggle) return;
  whatsappChat.classList.toggle('is-open', open);
  whatsappChat.setAttribute('aria-hidden', String(!open));
  whatsappChat.inert = !open;
  whatsappToggle.classList.toggle('is-chat-open', open);
  whatsappToggle.setAttribute('aria-expanded', String(open));
  whatsappToggle.setAttribute('aria-label', open ? 'Minimizar chat de WhatsApp' : 'Abrir chat de WhatsApp');
  whatsappToggle.querySelector('span').textContent = open ? 'WhatsApp' : 'Agenda tu diagnóstico';
}

if (whatsappChat && whatsappToggle) {
  const dismissAutoOpen = () => {
    if (whatsappAutoOpen) {
      window.clearTimeout(whatsappAutoOpen);
      whatsappAutoOpen = null;
    }
  };
  whatsappToggle.addEventListener('click', () => {
    dismissAutoOpen();
    setWhatsappChatOpen(!whatsappChat.classList.contains('is-open'));
  });
  [whatsappMinimize, whatsappClose].forEach((button) => button?.addEventListener('click', () => {
    dismissAutoOpen();
    setWhatsappChatOpen(false);
  }));
}

// Subtle reveal and parallax for page content. Interactive controls and the
// WhatsApp widget stay still so their behavior remains predictable.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionTargets = document.querySelectorAll([
  '.hero-copy > *',
  '.hero-proof',
  '.proof-logos img',
  '.problem-flip-shell',
  '.section-heading',
  '.outcomes-list article',
  '.method-step',
  '.diagnostic-intro > *',
  '.diagnostic-details',
  '.testimonial-card',
  '.why-heading > *',
  '.why-list article',
  '.fit-container > h2',
  '.fit-card',
  '.faq-heading > *',
  '.faq-item',
  '.closing-content > *'
].join(','));

if (!motionPreference.matches && motionTargets.length) {
  const visibleMotionTargets = new Set();
  const motionObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in-view');
            visibleMotionTargets.add(entry.target);
          } else {
            visibleMotionTargets.delete(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' })
    : null;

  motionTargets.forEach((element) => {
    const siblings = [...element.parentElement.children].filter((sibling) =>
      sibling.matches(motionTargets[0]) || sibling.matches('.outcomes-list article, .method-step, .testimonial-card, .why-list article, .fit-card, .faq-item')
    );
    const index = siblings.indexOf(element);
    element.dataset.motion = '';
    element.style.setProperty('--motion-delay', `${Math.min(Math.max(index, 0) * 55, 220)}ms`);
    if (motionObserver) motionObserver.observe(element);
    else element.classList.add('is-in-view');
  });

  if (motionObserver) document.documentElement.classList.add('motion-ready');

  let motionFrame = 0;
  const updateParallax = () => {
    motionFrame = 0;
    const viewportCenter = window.innerHeight / 2;
    visibleMotionTargets.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const distance = (bounds.top + bounds.height / 2 - viewportCenter) / window.innerHeight;
      const limit = window.innerWidth <= 700 ? 2 : 4;
      const offset = Math.max(-limit, Math.min(limit, distance * -7));
      element.style.setProperty('--motion-y', `${offset.toFixed(2)}px`);
    });
  };
  const requestParallaxFrame = () => {
    if (!motionFrame) motionFrame = window.requestAnimationFrame(updateParallax);
  };
  window.addEventListener('scroll', requestParallaxFrame, { passive: true });
  window.addEventListener('resize', requestParallaxFrame, { passive: true });
  requestParallaxFrame();
}
