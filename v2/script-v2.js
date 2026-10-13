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
