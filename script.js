// script.js

// ---------- POPUP HÅNDTERING ----------
const buyBtns = document.querySelectorAll("#buy-btn, #buy-btn-hero");
const productModal = document.getElementById("product-modal");
const closeProduct = document.getElementById("close-product");

buyBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    productModal.style.display = "flex";
  });
});

closeProduct.addEventListener("click", () => {
  productModal.style.display = "none";
});

// Klikk utenfor popup for å lukke
window.addEventListener("click", (e) => {
  if (e.target === productModal) {
    productModal.style.display = "none";
  }
});


// ---------- MENGDEVELGER OG TOTALPRIS ----------
const decreaseBtn = document.getElementById("decrease");
const increaseBtn = document.getElementById("increase");
const qtyEl = document.getElementById("qty");
const totalEl = document.getElementById("total");

let quantity = 1;
const unitPrice = 99; // pris per enhet i kr

function updateTotal() {
  if (totalEl) totalEl.textContent = `${quantity * unitPrice} kr`;
}

if (decreaseBtn && increaseBtn && qtyEl && totalEl) {
  decreaseBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      qtyEl.textContent = quantity;
      updateTotal();
    }
  });

  increaseBtn.addEventListener("click", () => {
    quantity++;
    qtyEl.textContent = quantity;
    updateTotal();
  });
}

// ---------- VIPPS BETALINGSKNAPP ----------
const vippsBtn = document.querySelector(".vipps-btn");

vippsBtn.addEventListener("click", () => {
  // Her kobles Vipps API inn når det er klart
  alert(`Vipps-betaling på ${quantity * unitPrice} kr kommer snart!`);
});

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

  // HERO VIDEO (currently background video): prefer respecting reduced motion
  const bgVideo = document.querySelector('.background-video');
  if (bgVideo && bgVideo.tagName === 'VIDEO') {
    // Pause video if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      bgVideo.pause();
      bgVideo.removeAttribute('autoplay');
    }
    prefersReduced.addEventListener('change', (e) => {
      if (e.matches) {
        bgVideo.pause();
      } else {
        bgVideo.play().catch(()=>{});
      }
    });
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

// ---------- HAMBURGER MENY ----------
// Hamburger-meny for mobil og smale skjermer

// Dynamisk hamburgermeny som vises kun når det ikke er plass til nav
const hamburger = document.getElementById("hamburger-menu");
const nav = document.querySelector(".nav");
const header = document.querySelector(".site-header");

function updateHamburgerMenu() {
  if (!header || !nav || !hamburger) return;
  // Vis begge for å måle
  nav.classList.remove("hide");
  hamburger.classList.remove("show");

  // Sjekk om nav får plass i header
  const headerRect = header.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  const logo = header.querySelector('.logo');
  let logoWidth = 0;
  if (logo) {
    const logoRect = logo.getBoundingClientRect();
    logoWidth = logoRect.width;
  }
  // Include order button width + buffer
  const orderBtn = header.querySelector('.order-btn');
  const orderWidth = orderBtn ? orderBtn.getBoundingClientRect().width : 0;
  const buffer = 60; // space for hamburger
  const availableWidth = headerRect.width - logoWidth - orderWidth - buffer;
  if (navRect.width > availableWidth) {
    nav.classList.add("hide");
    hamburger.classList.add("show");
  } else {
    nav.classList.remove("hide");
    hamburger.classList.remove("show");
    nav.classList.remove("open");
  }
}

window.addEventListener('DOMContentLoaded', updateHamburgerMenu);
function debounce(fn, delay=120){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); }; }
window.addEventListener('resize', debounce(updateHamburgerMenu,150));

if (hamburger && nav) {
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });
}

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
