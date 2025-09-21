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
  // Reset purchase UI each time modal opens
  resetPurchaseUI();
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
const totalRow = document.querySelector('.total');
const vippsBtn = document.querySelector('.vipps-btn');

const baseShippingCost = 58;

function getShippingCost(units){
  return units > 3 ? 0 : baseShippingCost;
}

function formatKr(n){return `${n} kr`;}

function resetPurchaseUI(){
  optionButtons.forEach(b=>{
    b.classList.remove('selected');
    b.setAttribute('aria-pressed','false');
  });
  if (totalRow) totalRow.classList.add('hidden');
  if (shippingLine) {
    shippingLine.classList.add('hidden');
    // Reset default shipping text
    shippingLine.innerHTML = `Inkl. fraktkostnader (<span id="shipping-cost">${baseShippingCost}</span> kr)`;
  }
  if (vippsBtn) vippsBtn.classList.add('hidden');
  if (totalEl) totalEl.textContent = ' kr';
}

function selectOption(btn){
  const isAlreadySelected = btn.classList.contains('selected');
  // Toggle off if clicking the same selected button
  if (isAlreadySelected){
    resetPurchaseUI();
    return;
  }
  // Otherwise select this and show pricing + Vipps
  optionButtons.forEach(b=>{ b.classList.remove('selected'); b.setAttribute('aria-pressed','false'); });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed','true');

  const units = parseInt(btn.getAttribute('data-units'),10);
  const price = parseInt(btn.getAttribute('data-price'),10);
  const ship = getShippingCost(units);
  if (totalEl) totalEl.textContent = formatKr(price + ship);
  // Oppdater fraktlinje
  if (shippingLine){
    if (ship === 0){
      shippingLine.innerHTML = 'Gratis frakt';
    } else {
      shippingLine.innerHTML = `Inkl. fraktkostnader (<span id="shipping-cost">${ship}</span> kr)`;
    }
  }
  if (totalRow) totalRow.classList.remove('hidden');
  if (shippingLine) shippingLine.classList.remove('hidden');
  if (vippsBtn) vippsBtn.classList.remove('hidden');
}

optionButtons.forEach(btn => {
  btn.addEventListener('click', () => selectOption(btn));
});

// ---------- VIPPS BETALINGSKNAPP ----------
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

  // ---------- ONE-PAGE-AT-A-TIME SCROLL CONTROLLER ----------
  const scrollContainer = document.querySelector('.scroll-container');
  const panels = scrollContainer ? Array.from(scrollContainer.querySelectorAll('.panel')) : [];
  let snapLock = false;           // lock during programmatic snap
  let touchStartY = null;         // for touch gesture
  let wheelAccum = 0;             // accumulate small wheel deltas
  const WHEEL_THRESHOLD = 30;     // px
  const TOUCH_THRESHOLD = 28;     // px
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  // Remember original CSS scroll-snap so we can temporarily disable it to avoid jank
  let originalSnapType = '';
  if (scrollContainer) {
    try { originalSnapType = getComputedStyle(scrollContainer).scrollSnapType || ''; } catch(_) {}
  }

  function currentPanelIndex(){
    if (!scrollContainer || panels.length === 0) return 0;
    const vh = scrollContainer.clientHeight || window.innerHeight;
    let best = 0; let bestDist = Infinity;
    for (let i=0;i<panels.length;i++){
      const r = panels[i].getBoundingClientRect();
      const d = Math.abs(r.top);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    // guard: if very near next panel bottom due to momentum, still pick closest
    return best;
  }
  function snapTo(index){
    if (!scrollContainer || panels.length === 0) return;
    const clamped = Math.max(0, Math.min(panels.length - 1, index));

    // Compute precise target inside the scroll container to avoid layout jumps
    const containerRect = scrollContainer.getBoundingClientRect();
    const panelRect = panels[clamped].getBoundingClientRect();
    const targetScrollTop = scrollContainer.scrollTop + (panelRect.top - containerRect.top);

    // Lock input while animating and temporarily disable CSS snap to reduce fighting/jank
    snapLock = true;
    const prevInlineSnap = scrollContainer.style.scrollSnapType;
    scrollContainer.style.scrollSnapType = 'none';

    // Respect reduced motion; on iOS, smooth inside a container is supported in modern Safari
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      scrollContainer.scrollTo({ top: targetScrollTop, behavior: prefersReduced ? 'auto' : 'smooth' });
    } catch(_) {
      scrollContainer.scrollTop = targetScrollTop;
    }

    const settleEpsilon = 2; // px distance considered "at rest"
    const maxDuration = prefersReduced ? 120 : (isTouchDevice ? 550 : 450);
    let settleTimer;

    const cleanup = () => {
      clearTimeout(settleTimer);
      scrollContainer.removeEventListener('scroll', onScroll);
      // Restore original snap behavior
      scrollContainer.style.scrollSnapType = originalSnapType || prevInlineSnap || '';
      snapLock = false;
    };

    const onScroll = () => {
      const dist = Math.abs(scrollContainer.scrollTop - targetScrollTop);
      if (dist <= settleEpsilon) cleanup();
    };

    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    settleTimer = setTimeout(cleanup, maxDuration);
  }
  function snapNext(){ snapTo(currentPanelIndex() + 1); }
  function snapPrev(){ snapTo(currentPanelIndex() - 1); }

  // Wheel (desktop/trackpad)
  if (scrollContainer){
    scrollContainer.addEventListener('wheel', (e) => {
      // If a modal is open, don't hijack scrolling
      if (productModal && productModal.style.display === 'flex') return;
      if (snapLock) { e.preventDefault(); return; }
      // accumulate small deltas to avoid accidental triggers
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) { e.preventDefault(); return; }
      e.preventDefault();
      const dir = wheelAccum > 0 ? 1 : -1; wheelAccum = 0;
      if (dir > 0) snapNext(); else snapPrev();
    }, { passive: false });
  }

  // Touch (mobile)
  if (scrollContainer){
    scrollContainer.addEventListener('touchstart', (e) => { touchStartY = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : null; }, { passive: true });
    scrollContainer.addEventListener('touchmove', (e) => {
      if (touchStartY == null) return;
      const y = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : touchStartY;
      const dy = y - touchStartY;
      if (Math.abs(dy) > TOUCH_THRESHOLD) {
        // Prevent native scrolling beyond a single panel once threshold is met
        e.preventDefault();
      }
    }, { passive: false });
    scrollContainer.addEventListener('touchend', (e) => {
      if (touchStartY == null) return;
      const y = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : touchStartY;
      const dy = y - touchStartY; touchStartY = null;
      if (Math.abs(dy) < TOUCH_THRESHOLD) return;
      if (dy < 0) snapNext(); else snapPrev();
    }, { passive: true });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!scrollContainer) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.altKey || e.metaKey || e.ctrlKey) return;
    switch (e.key) {
      case 'PageDown': case 'ArrowDown': case ' ':
        if (e.shiftKey && e.key === ' ') { snapPrev(); } else { snapNext(); }
        e.preventDefault();
        break;
      case 'PageUp': case 'ArrowUp':
        snapPrev(); e.preventDefault();
        break;
      case 'Home': snapTo(0); e.preventDefault(); break;
      case 'End': snapTo(panels.length - 1); e.preventDefault(); break;
    }
  }, { passive: false });

  // HERO VIDEO with foreshadow: fade overlay when video actually starts
  const bgVideo = document.querySelector('.background-video');
  if (bgVideo && bgVideo.tagName === 'VIDEO') {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const foreshadow = document.querySelector('.video-foreshadow');
    // Ensure critical attributes for iOS inline autoplay
    bgVideo.muted = true;
    bgVideo.setAttribute('muted','');
    bgVideo.setAttribute('playsinline','');
    bgVideo.setAttribute('webkit-playsinline','');

    // Helper to attempt play; resolves silently if blocked
    let interactionHandlersBound = false;
    const removeInteractionHandlers = () => {
      if (!interactionHandlersBound) return;
      interactionHandlersBound = false;
      document.removeEventListener('pointerdown', tryPlayOnce, true);
      document.removeEventListener('touchstart', tryPlayOnce, true);
      document.removeEventListener('keydown', tryPlayOnce, true);
    };
    function hideForeshadow(){ if (foreshadow) foreshadow.classList.add('is-hidden'); }

    // Auto-scroll setup: move down one snap after 1s if user hasn't interacted
    const scrollContainer = document.querySelector('.scroll-container');
    const panels = scrollContainer ? Array.from(scrollContainer.querySelectorAll('.panel')) : [];
    let autoScrolled = false;
    let userInteracted = false;
    const markInteraction = () => { userInteracted = true; };
    window.addEventListener('wheel', markInteraction, { passive: true });
    window.addEventListener('touchstart', markInteraction, { passive: true });
    window.addEventListener('keydown', markInteraction, { passive: true });
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', () => {
        if (scrollContainer.scrollTop > 10) userInteracted = true;
      }, { passive: true });
    }
    function scheduleAutoScroll(){
      if (prefersReduced.matches || autoScrolled) return;
      setTimeout(() => {
        if (autoScrolled || userInteracted || !scrollContainer || panels.length === 0) return;
        autoScrolled = true;
        // Reuse snap controller to move exactly one panel
        snapNext();
      }, 1800);
    }
    function tryPlay() {
      // keep muted to satisfy iOS autoplay policy
      bgVideo.muted = true;
      const p = bgVideo.play();
      if (p && typeof p.then === 'function') {
        p.then(() => { removeInteractionHandlers(); hideForeshadow(); scheduleAutoScroll(); }).catch(() => {});
      }
    }
    function tryPlayOnce(){ removeInteractionHandlers(); tryPlay(); }

    function applyPref(){
      if (prefersReduced.matches){
        bgVideo.pause();
        bgVideo.removeAttribute('autoplay');
        // Do not animate foreshadow away when reduced motion is requested
      } else {
        // Ensure it only plays once: remove loop attribute if present
        bgVideo.removeAttribute('loop');
        // If it hasn't started yet, attempt play
        if (bgVideo.paused && bgVideo.currentTime === 0){
          tryPlay();
        }
        // As a fallback, bind a single user interaction to start playback if blocked
        if (!interactionHandlersBound) {
          interactionHandlersBound = true;
          document.addEventListener('pointerdown', tryPlayOnce, true);
          document.addEventListener('touchstart', tryPlayOnce, true);
          document.addEventListener('keydown', tryPlayOnce, true);
        }
      }
    }
    prefersReduced.addEventListener('change', applyPref);
    if (bgVideo.readyState >= 1) applyPref(); else bgVideo.addEventListener('loadedmetadata', applyPref, { once:true });
    // Also try once media is buffered enough to play
  bgVideo.addEventListener('loadeddata', () => { if (!prefersReduced.matches) tryPlay(); }, { once:true });
  // Ensure foreshadow fades out when playback actually starts and schedule auto-scroll
  bgVideo.addEventListener('playing', () => { hideForeshadow(); scheduleAutoScroll(); }, { once:true });
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
