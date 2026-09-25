const modal=document.getElementById('lead-modal');
const openers=document.querySelectorAll('.open-form');
const closeEls=document.querySelectorAll('[data-close-modal]');
const openModal=()=>{modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>modal.querySelector('input')?.focus(),80)};
const closeModal=()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''};
openers.forEach(b=>b.addEventListener('click',openModal));
closeEls.forEach(b=>b.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

const testimonials=[
 {image:'assets/testimonial-new-1.png',alt:'Testimonio de cliente 1'},
 {image:'assets/testimonial-new-2.png',alt:'Testimonio de cliente 2'},
 {image:'assets/testimonial-new-3.png',alt:'Testimonio de cliente 3'},
 {image:'assets/testimonial-new-5.png',alt:'Testimonio de cliente 5'}
];
let current=0;
const img=document.getElementById('testimonial-image'),dots=document.getElementById('testimonial-dots');

testimonials.forEach((t,i)=>{const d=document.createElement('button');d.className='dot'+(i===current?' active':'');d.type='button';d.setAttribute('aria-label',`Ver testimonio ${i+1}`);d.addEventListener('click',()=>show(i));dots.appendChild(d)});
function show(i){current=(i+testimonials.length)%testimonials.length;const t=testimonials[current];img.src=t.image;img.alt=t.alt;[...dots.children].forEach((d,j)=>d.classList.toggle('active',j===current));}
document.querySelector('.testimonial-prev').addEventListener('click',()=>show(current-1));
document.querySelector('.testimonial-next').addEventListener('click',()=>show(current+1));

function sanitizeName(value){
  return value.replace(/[^\p{L}\s]/gu,'').replace(/\s{2,}/g,' ');
}
function sanitizePhone(value){
  return value.replace(/\D/g,'').slice(0,15);
}
function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
function wireFieldValidation(form){
  const nameField=form.querySelector('input[name="name"]');
  const phoneField=form.querySelector('input[name="phone"]');
  const emailField=form.querySelector('input[name="email"]');
  nameField?.addEventListener('input',()=>{nameField.value=sanitizeName(nameField.value)});
  phoneField?.addEventListener('input',()=>{phoneField.value=sanitizePhone(phoneField.value)});
  emailField?.addEventListener('input',()=>{emailField.setCustomValidity(isValidEmail(emailField.value)?'':'Introduce un correo electrónico válido.')});
  emailField?.addEventListener('blur',()=>{emailField.setCustomValidity(isValidEmail(emailField.value)?'':'Introduce un correo electrónico válido.')});
}

const thankYouPage=document.getElementById('thank-you-page');
function showThankYou(){
  closeModal();
  thankYouPage.hidden=false;
  document.body.classList.add('thank-you-mode');
  window.scrollTo({top:0,behavior:'smooth'});
}
function hideThankYou(){
  document.body.classList.remove('thank-you-mode');
  thankYouPage.hidden=true;
  window.scrollTo({top:0,behavior:'smooth'});
}

document.querySelector('.thank-you-back')?.addEventListener('click',hideThankYou);

function handleLead(form,successEl){
  wireFieldValidation(form);
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    const email=form.querySelector('input[name="email"]');
    if(email && !isValidEmail(email.value)){
      email.setCustomValidity('Introduce un correo electrónico válido.');
      email.reportValidity();
      return;
    }
    const data=Object.fromEntries(new FormData(form).entries());
    const leads=JSON.parse(localStorage.getItem('oneonone_leads')||'[]');
    leads.push({...data,createdAt:new Date().toISOString()});
    localStorage.setItem('oneonone_leads',JSON.stringify(leads));
    form.reset();
    if(successEl){form.hidden=true;successEl.hidden=false;}
    showThankYou();
  });
}
handleLead(document.getElementById('lead-form'),document.getElementById('form-success'));
handleLead(document.getElementById('modal-form'),null);
document.querySelector('.close-success')?.addEventListener('click',()=>{document.getElementById('form-success').hidden=true;document.getElementById('lead-form').hidden=false});

document.querySelectorAll('.whatsapp-placeholder').forEach(b=>b.addEventListener('click',()=>alert('El número de WhatsApp se configurará cuando el cliente nos lo proporcione.')));
show(current);

// Palabra dinámica del hero: líderes → ejecutivos → directivos → gerentes → líderes.
(() => {
  const word = document.querySelector('.flip-word');
  if (!word || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = ['líderes.', 'ejecutivos.', 'directivos.', 'gerentes.'];
  let index = 0;
  const changeWord = () => {
    word.classList.remove('flip-in');
    word.classList.add('flip-out');
    setTimeout(() => {
      index = (index + 1) % words.length;
      word.textContent = words[index];
      word.classList.remove('flip-out');
      void word.offsetWidth;
      word.classList.add('flip-in');
    }, 380);
  };
  setInterval(changeWord, 3000);
})();

// Movimiento editorial y parallax suave.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = [...document.querySelectorAll('.reveal, .reveal-stagger')];
  const depthEls = [...document.querySelectorAll('[data-depth]')];
  const layers = [...document.querySelectorAll('[data-parallax]')];

  if (!reduce && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, {threshold:0.14, rootMargin:'0px 0px -7% 0px'});
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  if (reduce || !layers.length) return;
  let ticking=false;
  const update=()=>{
    const vh=window.innerHeight;
    layers.forEach(el=>{
      const parent=el.closest('.parallax-container')||el.parentElement;
      const rect=parent.getBoundingClientRect();
      if(rect.bottom < -150 || rect.top > vh+150) return;
      const speed=parseFloat(el.dataset.parallax||'0.12');
      const centerDelta=(vh*.5)-(rect.top+rect.height*.5);
      const offset=centerDelta*speed;
      el.style.transform=`translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.07)`;
    });
    depthEls.forEach(el=>{
      const rect=el.getBoundingClientRect();
      if(rect.bottom < -100 || rect.top > vh+100) return;
      const speed=parseFloat(el.dataset.depth||'0.08');
      const centerDelta=(vh*.5)-(rect.top+rect.height*.5);
      const offset=centerDelta*speed;
      if(el.classList.contains('is-visible')) el.style.transform=`translate3d(0, ${(offset*.16).toFixed(2)}px, 0)`;
    });
    ticking=false;
  };
  const onScroll=()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}};
  update();
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
})();
