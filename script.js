// script.js

// ---------- POPUP HÅNDTERING ----------
const buyBtns = document.querySelectorAll("#buy-btn, #buy-btn-hero");
const productModal = document.getElementById("product-modal");
const closeProduct = document.getElementById("close-product");

function openModal(){
  if(!productModal) return;
  productModal.removeAttribute('hidden');
  productModal.style.display = 'flex';
  // Focus trap entry point (could be expanded later)
  const title = productModal.querySelector('#product-title');
  if(title) title.focus?.();
}
function closeModal(){
  if(!productModal) return;
  productModal.style.display = 'none';
  productModal.setAttribute('hidden','');
}

buyBtns.forEach(btn => btn.addEventListener('click', openModal));
if (closeProduct) closeProduct.addEventListener('click', closeModal);

window.addEventListener('click', e => {
  if (e.target === productModal) closeModal();
});


// ---------- KJØPSALTERNATIVER (1 glass eller 6 glass) ----------
const optionButtons = document.querySelectorAll('.option-btn');
const totalEl = document.getElementById('total');
const shippingCostEl = document.getElementById('shipping-cost');
const shippingLine = document.getElementById('shipping-line');

const baseShippingCost = 58;

function getShippingCost(units){
  return units > 3 ? 0 : baseShippingCost;
}

function formatKr(n){return `${n} kr`;}

function selectOption(btn){
  optionButtons.forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  const units = parseInt(btn.getAttribute('data-units'),10);
  const price = parseInt(btn.getAttribute('data-price'),10);
  const ship = getShippingCost(units);
  if (totalEl) totalEl.textContent = formatKr(price + ship);
  if (shippingCostEl) shippingCostEl.textContent = ship.toString();
  // Hvis frakt er 0, endre tekst for klarhet
  if (shippingLine){
    if (ship === 0){
      shippingLine.innerHTML = 'Gratis frakt';
    } else {
      shippingLine.innerHTML = `Inkl. fraktkostnader (<span id="shipping-cost">${ship}</span> kr)`;
    }
  }
}

optionButtons.forEach(btn => {
  btn.addEventListener('click', () => selectOption(btn));
});

// Initierer første valg (hvis definert i HTML med .selected)
const preselected = document.querySelector('.option-btn.selected') || optionButtons[0];
if (preselected) selectOption(preselected);

// ---------- VIPPS BETALINGSKNAPP ----------
const vippsBtn = document.querySelector('.vipps-btn');
if (vippsBtn) {
  vippsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const container = vippsBtn.closest('.modal-content') || vippsBtn.parentElement;
    if (!container) return;
    // Avoid duplicating the message if user clicks multiple times
    if (container.querySelector('.vipps-info')) return;

    const info = document.createElement('div');
    info.className = 'vipps-info';
    info.setAttribute('role','status');
    info.setAttribute('aria-live','polite');
    info.innerHTML = `
      <strong>Nettsiden er under utvikling.</strong><br>
      Vipps betaling kommer snart!
      <button class="close-vipps-info" aria-label="Lukk melding">&times;</button>
    `;
    container.appendChild(info);
    const closeBtn = info.querySelector('.close-vipps-info');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => info.remove());
    }
  });
}

// ---------- HERO ANIMASJON ----------
// Legg til i script.js, etter DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  // Lazy init for spice elements only when hero is in view
  function initSpices() {
    const spices = document.querySelectorAll(".spice");
    spices.forEach(spice => {
      const angle = Math.random() * 360; // retning
      const distance = 150 + Math.random() * 200; // hvor langt det flytter seg
      const delay = Math.random() * 10; // forsinkelse
      spice.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
      spice.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
      spice.style.animationDelay = `${delay}s`;
    });
  }

  const heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initSpices();
          obs.disconnect();
        }
      });
    }, { root: document.querySelector('.scroll-container') || null, threshold: 0.25 });
    observer.observe(heroSection);
  } else {
    // fallback
    initSpices();
  }

  // HERO VIDEO simple one-shot playback respecting reduced motion
  const bgVideo = document.querySelector('.background-video');
  if (bgVideo && bgVideo.tagName === 'VIDEO') {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function applyPref(){
      if (prefersReduced.matches){
        bgVideo.pause();
        bgVideo.removeAttribute('autoplay');
      } else {
        // Ensure it only plays once: remove loop attribute if present
        bgVideo.removeAttribute('loop');
        // If it hasn't started yet, attempt play
        if (bgVideo.paused && bgVideo.currentTime === 0){
          bgVideo.play().catch(()=>{});
        }
      }
    }
    prefersReduced.addEventListener('change', applyPref);
    if (bgVideo.readyState >= 1) applyPref(); else bgVideo.addEventListener('loadedmetadata', applyPref, { once:true });
    // No custom looping: let it reach the last frame naturally and stop.
  }
});


// Kontakt-modal fjernet – produktmodal beholdes uendret.

// ---------- SMOOTH SCROLL ----------
// ---------- SMOOTH SCROLL (ignore dead anchors) ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return; // ignore placeholder
    // Contact link handled by modal open
  // Kontakt lenke peker nå til footer (#footer) og håndteres som vanlig scroll.
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---------- HAMBURGER MENY (simplified breakpoint-only) ----------
const hamburger = document.getElementById('hamburger-menu');
const nav = document.querySelector('.nav');
if (hamburger && nav) {
  hamburger.setAttribute('aria-expanded','false');
  hamburger.setAttribute('aria-label','Meny');
  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded','false');
    });
  });
}

function debounce(fn, delay=120){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); }; }

// call this on load and on resize to keep --header-height accurate
function updateHeaderHeightVar() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const h = header.offsetHeight;
  document.documentElement.style.setProperty('--header-height', `${h}px`);
}

// run on load and resize, and observe header changes
window.addEventListener('DOMContentLoaded', updateHeaderHeightVar);
window.addEventListener('resize', debounce(updateHeaderHeightVar,150));
if ('ResizeObserver' in window) {
  const header = document.querySelector('.site-header');
  if (header) {
    new ResizeObserver(updateHeaderHeightVar).observe(header);
  }
}

// ---------- KJØP KNAPP MED FOKUSOUTLINE ----------
// For bedre tilgjengelighet: fjern fokusring fra knapper etter klikk
document.querySelectorAll('.qty-btn').forEach(btn => {
  btn.addEventListener('mouseup', e => {
    btn.blur();
  });
});

// Overlay: go from A -> B and stay at B once user leaves the first (intro) panel.
// Replace previous per-frame fractional overlay logic with a simple threshold-based toggle.
(function () {
  const container = document.querySelector('.scroll-container');
  const overlay = document.querySelector('.page-gradient-overlay');
  if (!container || !overlay) return;

  let raf = null;
  const THRESHOLD = 0.5; // fraction of viewport scrolled before overlay "sticks" to peak

  function updateOverlay() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const vh = container.clientHeight || window.innerHeight;
      const st = container.scrollTop;
      // If we've scrolled past the threshold (i.e. left the intro page), set overlay to peak and keep it
      if (st >= vh * THRESHOLD) {
        overlay.style.setProperty('--page-overlay', '1');
      } else {
        overlay.style.setProperty('--page-overlay', '0');
      }
    });
  }

  // initial state
  updateOverlay();

  container.addEventListener('scroll', updateOverlay, { passive: true });
  window.addEventListener('resize', debounce(updateOverlay,150));
})();
