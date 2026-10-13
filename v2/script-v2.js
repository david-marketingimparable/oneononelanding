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
  const label = problemFlipButton.querySelector('span');

  problemFlipButton.addEventListener('click', () => {
    const flipped = problemCard.classList.toggle('is-flipped');
    problemFlipButton.setAttribute('aria-pressed', String(flipped));
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    back.inert = !flipped;
    front.inert = flipped;
    label.textContent = flipped ? 'Volver al primer mensaje' : 'Ver el otro mensaje';
  });
}
