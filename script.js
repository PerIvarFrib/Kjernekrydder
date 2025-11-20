const bImg = document.getElementsByClassName("background-img")[0];
const bVideo = document.getElementsByClassName("background-video")[0];
const mainContent = document.getElementsByClassName("main-content")[0];
const home = document.querySelector('#page-one');
const wrapper = document.getElementsByClassName("wrapper")[0];
const productModal = document.getElementById('product-modal');
// const playButton = document.getElementById("playButton"); // Commented out

document.addEventListener('DOMContentLoaded', function() {
    // Ensure a baseline history entry exists so Back from modal stays on this page
    try {
      if (!history.state || !history.state.__kkBase) {
        history.replaceState(Object.assign({}, history.state, { __kkBase: true }), '');
      }
    } catch(_) {}
    // Auto-start the video sequence when DOM loads
    if (bVideo) {
      try { bVideo.load(); } catch(_) {}
      bVideo.play().catch(() => {});
    }
    if (bImg && bVideo) {
      setTimeout(() => {
        bImg.classList.add('background--fade-down');
        // playButton.classList.add('background--fade-down'); // Commented out
        bVideo.classList.add('background--video-in');
        bVideo.play().catch(() => {});
      }, 2000); // Small delay to ensure everything is loaded
    }

  // If returning from an internal page (e.g., salgsbetingelser) and we
  // flagged to restore the modal, do so and clear the flag.
  if (history.state && history.state.restoreModalOnBack) {
    try { history.replaceState(Object.assign({}, history.state, { restoreModalOnBack: false }), ''); } catch(_) {}
    if (productModal) { openModal(productModal); }
  }
});

// Also handle BFCache restores where DOMContentLoaded may not fire again
window.addEventListener('pageshow', function(){
  if (history.state && history.state.restoreModalOnBack) {
    try { history.replaceState(Object.assign({}, history.state, { restoreModalOnBack: false }), ''); } catch(_) {}
    if (productModal) { openModal(productModal); }
  }
});

// // Instantly pause background video after Safari/iOS "autoplay unlock"
// bVideo.addEventListener('play', () => {
//   bVideo.pause();
//   bVideo.currentTime = 0; // reset to start frame
// }, { once: true });

// Removed wrapper click event since we auto-start now
// wrapper.addEventListener('click', function(){
//     playButton.classList.toggle('toggle-test');
//     bImg.classList.add('background--fade-down');
//     playButton.classList.add('background--fade-down');
//     bVideo.classList.add('background--video-in');
// });

let hasScrolled = false;
if (home && mainContent) {
  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!hasScrolled){
        mainContent.classList.toggle('darken', !entry.isIntersecting);
    } else {
        mainContent.classList.toggle('lighten', entry.isIntersecting);
        mainContent.classList.toggle('darken', !entry.isIntersecting);
    }
    if (!hasScrolled && !entry.isIntersecting){hasScrolled = true;}
  }, {threshold:0.5});
  observer.observe(home);
}

if (bImg) {
  bImg.addEventListener('animationend', function(){
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!hasScrolled){
          const hero = document.getElementById("hero");
          if (hero) {
            hero.scrollIntoView({behavior: "smooth"});
          }
        }
      }, 3000);
    });
  });
}

const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget);
        openModal(modal);
    })
})

// Click on modal background (outside content) to close
if (productModal) {
  productModal.addEventListener('click', (e) => {
    // Only close if clicking on the modal itself, not its content
    if (e.target === e.currentTarget) {
      closeModal(e.target);
    }
  });
}

// If user clicks a normal link inside the modal content (e.g., salgsbetingelser),
// flag the current history entry so that pressing Back returns with the modal open again.
(function(){
  if(!productModal) return;
  const modalContent = productModal.querySelector('.modal-content');
  if(!modalContent) return;
  modalContent.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href]');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    // Ignore external/non-document links and the Vipps button
    if (a.classList.contains('vipps-btn')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
    // Likely internal navigation; mark to restore modal on back
    try { history.replaceState(Object.assign({}, history.state, { restoreModalOnBack: true }), ''); } catch(_) {}
  });
})();

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal');
    closeModal(modal);
  })
})

let lastFocusedElement = null;
let isClosingFromPopstate = false;

function trapFocus(container){
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(container.querySelectorAll(focusableSelectors))
    .filter(el => !el.hasAttribute('hidden') && !el.classList.contains('hidden'));
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  container.addEventListener('keydown', e => {
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    } else if(e.key === 'Escape'){
      closeModal(container.closest('.modal'));
    }
  });
}

function openModal(modal) {
  if (modal == null) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add('active');
  const dialogContent = modal.querySelector('.modal-content');
  dialogContent.setAttribute('aria-hidden','false');
  trapFocus(dialogContent);
  setTimeout(()=>{ dialogContent.focus(); },0);
  // Push a history state so a single Back closes the modal first
  try {
    if (!history.state || !history.state.modalOpen) {
      history.pushState(Object.assign({}, history.state, { modalOpen: true }), '');
    }
  } catch(_) {}
}

function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove('active');
    const dialogContent = modal.querySelector('.modal-content');
    dialogContent.setAttribute('aria-hidden','true');
    if(lastFocusedElement){ lastFocusedElement.focus(); }
    // If we added a history entry for the modal, consume it on close
    if (!isClosingFromPopstate && history.state && history.state.modalOpen) {
      try { history.back(); } catch(_) {}
    }
}

// Intercept browser back button to close modal if open
window.addEventListener('popstate', function(event) {
  const modal = document.getElementById('product-modal');
  if (modal && modal.classList.contains('active')) {
    isClosingFromPopstate = true;
    closeModal(modal);
    isClosingFromPopstate = false;
  }
});

// Product option functionality
const optionButtons = document.querySelectorAll('.option-btn[role="radio"]');
const radioGroup = document.querySelector('.purchase-options[role="radiogroup"]');
const totalElement = document.getElementById('total');
const shippingLine = document.getElementById('shipping-line');
const vippsBtn = document.querySelector('#vipps-btn');
// Immutable payment link map (test links for now)
const PAYMENT_LINKS = Object.freeze({
  1: 'https://betal.vipps.no/il7xjx',
  4: 'https://betal.vipps.no/3v598p'
});
let currentUnits = null;
const paymentSection = document.querySelector('.payment');

function updateSelection(newBtn){
  optionButtons.forEach(btn=>{
    const isTarget = btn === newBtn;
    btn.setAttribute('aria-checked', isTarget ? 'true':'false');
    if(isTarget){
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });
}

function computeTotals(btn){
  const price = parseInt(btn.dataset.price,10);
  const units = parseInt(btn.dataset.units,10);
  currentUnits = units;
  let total, shippingText;
  if(units === 1){
    const shipping = 58;
    total = price + shipping;
    shippingText = `Inkl. fraktkostnader (${shipping} kr)`;
  } else {
    total = price;
    shippingText = 'Gratis frakt';
  }
  totalElement.textContent = `${total} kr`;
  shippingLine.textContent = shippingText;
  // Update Vipps link strictly from whitelist
  if(PAYMENT_LINKS[units]){
    vippsBtn.setAttribute('href', PAYMENT_LINKS[units]);
  } else {
    vippsBtn.removeAttribute('href');
  }
}

// Simplified: always show payment and scroll modal to bottom
function showPayment(){
  paymentSection.classList.remove('hidden');
  totalElement.parentElement.classList.remove('hidden');
  shippingLine.classList.remove('hidden');
  vippsBtn.classList.remove('hidden');

  const modalContent = document.querySelector('#product-modal .modal-content');
  if(modalContent){
    requestAnimationFrame(()=>{
      if(modalContent.scrollTo){
        modalContent.scrollTo({top: modalContent.scrollHeight, behavior: 'smooth'});
      } else {
        paymentSection.scrollIntoView({behavior: 'smooth', block: 'end'});
      }
    });
  }
}

if (optionButtons.length) {
  optionButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      updateSelection(btn);
      computeTotals(btn);
      showPayment();
    });
    btn.addEventListener('keydown', e=>{
      if(['ArrowRight','ArrowDown'].includes(e.key)){
        e.preventDefault();
        const idx = Array.from(optionButtons).indexOf(btn);
        const next = optionButtons[(idx+1)%optionButtons.length];
        next.focus();
        next.click();
      } else if(['ArrowLeft','ArrowUp'].includes(e.key)){
        e.preventDefault();
        const idx = Array.from(optionButtons).indexOf(btn);
        const prev = optionButtons[(idx - 1 + optionButtons.length)%optionButtons.length];
        prev.focus();
        prev.click();
      }
    });
  });

  // Remove old aria-pressed logic remnants if any (defensive)
  optionButtons.forEach(b=> b.removeAttribute('aria-pressed'));
}

// Guard against tampering: ensure link matches whitelist before navigation
if (vippsBtn) {
  vippsBtn.addEventListener('click', (e)=>{
    const href = vippsBtn.getAttribute('href');
    if(!currentUnits || !href || PAYMENT_LINKS[currentUnits] !== href){
      e.preventDefault();
      return false;
    }
  });
}

if (bVideo) {
  document.addEventListener("click", function () {
    if (bVideo && bVideo.paused) {
      bVideo.play().catch((error) => {
        console.error("Play failed:", error);
      });
    }
  });
}

