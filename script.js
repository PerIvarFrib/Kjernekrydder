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
  totalEl.textContent = `${quantity * unitPrice} kr`;
}

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

// ---------- VIPPS BETALINGSKNAPP ----------
const vippsBtn = document.querySelector(".vipps-btn");

vippsBtn.addEventListener("click", () => {
  // Her kobles Vipps API inn når det er klart
  alert(`Vipps-betaling på ${quantity * unitPrice} kr kommer snart!`);
});

// ---------- HERO ANIMASJON ----------
// Legg til i script.js, etter DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  const spices = document.querySelectorAll(".spice");
  spices.forEach(spice => {
    const angle = Math.random() * 360; // retning
    const distance = 150 + Math.random() * 200; // hvor langt det flytter seg
    const delay = Math.random() * 10; // forsinkelse

    spice.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    spice.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    spice.style.animationDelay = `${delay}s`;
  });
});


// ---------- CONTACT POPUP ----------
const contactBtn = document.getElementById("contact-btn");
const contactModal = document.getElementById("contact-modal");
const closeContact = document.getElementById("close-contact");

contactBtn.addEventListener("click", () => {
  contactModal.style.display = "flex";
});

closeContact.addEventListener("click", () => {
  contactModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === contactModal) {
    contactModal.style.display = "none";
  }
});

// ---------- SMOOTH SCROLL ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
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
  // 40px buffer for hamburger
  const availableWidth = headerRect.width - logoWidth - 40;
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
window.addEventListener('resize', updateHamburgerMenu);

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

// Update CSS variable for header height so CSS can use it
function setHeaderHeightVar() {
  if (!header) return;
  const h = Math.round(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', h + 'px');
}

// debounce helper
function debounce(fn, wait = 100) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const recalibrate = debounce(() => {
  setHeaderHeightVar();
  updateHamburgerMenu();
}, 120);

// run initially
setHeaderHeightVar();
updateHamburgerMenu();

// Observe size changes to header (e.g., when font changes, logo loads)
if (window.ResizeObserver && header) {
  const ro = new ResizeObserver(recalibrate);
  ro.observe(header);
}

window.addEventListener('load', recalibrate);
window.addEventListener('orientationchange', recalibrate);
