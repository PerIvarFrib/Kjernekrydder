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
      }, 1000);
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
const totalElement = document.getElementById('total');
const shippingLine = document.getElementById('shipping-line');
const vippsBtn = document.querySelector('#vipps-btn');
const paymentSection = document.querySelector('.payment');
const quantityDisplay = document.getElementById('quantity-display');
const minusBtn = document.getElementById('quantity-minus');
const plusBtn = document.getElementById('quantity-plus');
// Adjustable inventory: single shared stock value (i antall glass)
const AVAILABLE_INVENTORY = 13;
// Praktisk øvre grense i UI for hvor mange glass som kan velges via Vipps
const MAX_UNITS = 11;

// Immutable map over Vipps-betalingslenker per antall glass.
// Oppdater verdiene manuelt til riktige Vipps-salgslenker.
// Nøkler (1-11) må matche antallsvelgeren i UI.
const PAYMENT_LINKS = Object.freeze({
  1: 'https://betal.vipps.no/a3pgo3',
  2: 'https://betal.vipps.no/k1776q',
  3: 'https://betal.vipps.no/y6twqp',
  4: 'https://betal.vipps.no/1e1lza',
  5: 'https://betal.vipps.no/rpqy9v',
  6: 'https://betal.vipps.no/rezji9',
  7: 'https://betal.vipps.no/jb6qqk',
  8: 'https://betal.vipps.no/zypms9',
  9: 'https://betal.vipps.no/4gld6t',
  10: 'https://betal.vipps.no/39zp1y',
});

let currentUnits = 1;
let isSelectionInStock = false;

function updateVippsLink() {
  if (!vippsBtn) return;

  const link = PAYMENT_LINKS[currentUnits];

  if (isSelectionInStock && link) {
    vippsBtn.setAttribute('href', link);
    vippsBtn.classList.remove('hidden');
  } else {
    vippsBtn.removeAttribute('href');
    vippsBtn.classList.add('hidden');
  }
}

function updateTotalsForQuantity(units){
  currentUnits = units;

  // Base price: 99 kr per glass
  const goods = units * 99;

  // Shipping rules
  let shipping = 0;
  if (units === 1) {
    shipping = 58;
  } else if (units >= 2 && units <= 4) {
    shipping = 73;
  } else if (units >= 5) {
    shipping = 0;
  }

  const total = goods + shipping;

  // Base shipping text
  let shippingText;
  if (shipping > 0) {
    shippingText = `Inkl. fraktkostnader (${shipping} kr)`;
  } else {
    shippingText = 'Gratis frakt';
  }

  // Inventory check and user messaging
  let message = '';
  shippingLine.style.color = '';
  shippingLine.style.fontSize = '';

  if (AVAILABLE_INVENTORY <= 0) {
    // Out of stock: block payment and inform clearly
    isSelectionInStock = false;
    shippingLine.style.color = '#FF1A33';
    shippingLine.style.fontSize = '1rem';
    message = 'Vi er utsolgt for jula. Kom gjerne tilbake i Januar.';
  } else if (units > AVAILABLE_INVENTORY) {
    // Requested quantity exceeds inventory: show how many are left
    isSelectionInStock = false;
    shippingLine.style.color = '#FF1A33';
    shippingLine.style.fontSize = '1rem';
    message += ` Vi har bare ${AVAILABLE_INVENTORY} glass igjen. Reduser antallet for å fortsette.`;
  } else {
    // Within inventory
    isSelectionInStock = true;
    // For larger orders above Vipps-grensen, ask customer to contact by email
    if (currentUnits >= MAX_UNITS && currentUnits <= AVAILABLE_INVENTORY) {
      isSelectionInStock = false;
      shippingLine.style.color = '#FF1A33';
      shippingLine.style.fontSize = '1rem';
      message += ' For større bestillinger, ta kontakt på mail.';
    }
  }

  totalElement.textContent = `${total} kr`;
  shippingLine.textContent = message;

  // Sørg for at Vipps-lenken alltid samsvarer med valgt antall og lagerstatus
  updateVippsLink();
}

// Simplified: always show payment and scroll modal to bottom
function showPayment(){
  paymentSection.classList.remove('hidden');
  totalElement.parentElement.classList.remove('hidden');
  shippingLine.classList.remove('hidden');
  // Oppdater Vipps-lenken ved visning av betalingsseksjonen
  updateVippsLink();
}

// Quantity control: +/- buttons around a readable span
if (quantityDisplay && minusBtn && plusBtn) {
  // Initialise display
  quantityDisplay.textContent = String(currentUnits);

  minusBtn.addEventListener('click', () => {
    currentUnits = Math.max(1, currentUnits - 1);
    quantityDisplay.textContent = String(currentUnits);
    updateTotalsForQuantity(currentUnits);
    showPayment();
  });

  plusBtn.addEventListener('click', () => {
    currentUnits = Math.min(MAX_UNITS, currentUnits + 1);
    quantityDisplay.textContent = String(currentUnits);
    updateTotalsForQuantity(currentUnits);
    showPayment();
  });
}

// Vis betalingsseksjonen med utgangspunkt i 1 glass som standard
if (totalElement && shippingLine && paymentSection) {
  updateTotalsForQuantity(currentUnits);
  showPayment();
}

// Guard against tampering: ensure link matches whitelist before navigation
if (vippsBtn) {
  vippsBtn.addEventListener('click', (e)=>{
    const href = vippsBtn.getAttribute('href');
    const expectedHref = PAYMENT_LINKS[currentUnits];

    // Stopp hvis: ingen antall, ingen href, ikke på lager,
    // ingen forventet lenke for dette antallet, eller href er endret.
    if(!currentUnits || !href || !isSelectionInStock || !expectedHref || href !== expectedHref){
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

