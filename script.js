const bImg = document.getElementsByClassName("background-img")[0];
const bVideo = document.getElementsByClassName("background-video")[0];
const mainContent = document.getElementsByClassName("main-content")[0];
const home = document.querySelector('#page-one');
const wrapper = document.getElementsByClassName("wrapper")[0];
// const playButton = document.getElementById("playButton"); // Commented out

document.addEventListener('DOMContentLoaded', function() {
    // Auto-start the video sequence when DOM loads
    setTimeout(() => {
        bImg.classList.add('background--fade-down');
        // playButton.classList.add('background--fade-down'); // Commented out
        bVideo.classList.add('background--video-in');
    }, 1000); // Small delay to ensure everything is loaded
});

// Removed wrapper click event since we auto-start now
// wrapper.addEventListener('click', function(){
//     playButton.classList.toggle('toggle-test');
//     bImg.classList.add('background--fade-down');
//     playButton.classList.add('background--fade-down');
//     bVideo.classList.add('background--video-in');
// });

let hasScrolled = false;
const observer = new IntersectionObserver(entries => {
    entry = entries[0];
    console.log(entry.isIntersecting);
    if (!hasScrolled){
        mainContent.classList.toggle('darken', !entry.isIntersecting);
    } else {
        mainContent.classList.toggle('lighten', entry.isIntersecting);
        mainContent.classList.toggle('darken', !entry.isIntersecting);
    }
    if (!hasScrolled && !entry.isIntersecting){hasScrolled = true;}
}, {threshold:0.5});
observer.observe(home);

bImg.addEventListener('animationend', function(){
    bVideo.play();
    setTimeout(() => {
        if (!hasScrolled){
            document.getElementById("hero").scrollIntoView({behavior: "smooth"});
        }
    }, 3000);
})


const openModalButtons = document.querySelectorAll('[data-modal-target]');
const closeModalButtons = document.querySelectorAll('[data-close-button]');

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = document.querySelector(button.dataset.modalTarget);
        openModal(modal);
    })
})

// Click on modal background (outside content) to close
document.getElementById('product-modal').addEventListener('click', (e) => {
    // Only close if clicking on the modal itself, not its content
    if (e.target === e.currentTarget) {
        closeModal(e.target);
    }
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    })
})

function openModal(modal) {
    if (modal == null) return;
    modal.classList.add('active');
}

function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove('active');
}

// Product option functionality
const optionButtons = document.querySelectorAll('.option-btn');
const totalElement = document.getElementById('total');
const shippingLine = document.getElementById('shipping-line');
const shippingCost = document.getElementById('shipping-cost');
const vippsBtn = document.querySelector('.vipps-btn');
const paymentSection = document.querySelector('.payment');

optionButtons.forEach(button => {
    button.addEventListener('click', function() {
        const isCurrentlyPressed = this.getAttribute('aria-pressed') === 'true';
        
        if (isCurrentlyPressed) {
            // Toggle off - deselect this button and hide payment
            this.setAttribute('aria-pressed', 'false');
            hidePaymentSection();
        } else {
            // Remove aria-pressed from all buttons first
            optionButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
            
            // Set aria-pressed to true for clicked button
            this.setAttribute('aria-pressed', 'true');
            
            // Get price and units from data attributes
            const price = parseInt(this.dataset.price);
            const units = parseInt(this.dataset.units);
            
            let total, shippingText;
            
            if (units === 1) {
                // 1 glass: include shipping cost
                const shipping = 58;
                total = price + shipping;
                shippingText = `Inkl. fraktkostnader (${shipping} kr)`;
            } else {
                total = price;
                shippingText = "Gratis frakt";
            }
            
            // Update display
            totalElement.textContent = `${total} kr`;
            shippingLine.innerHTML = `<span class="font-primary font-product font-discrete">${shippingText}</span>`;
            
            // Show payment section and its elements
            showPaymentSection();
        }
    });
});

function showPaymentSection() {
    paymentSection.classList.remove('hidden');
    totalElement.parentElement.classList.remove('hidden');
    shippingLine.classList.remove('hidden');
    vippsBtn.classList.remove('hidden');
}

function hidePaymentSection() {
    paymentSection.classList.add('hidden');
    totalElement.parentElement.classList.add('hidden');
    shippingLine.classList.add('hidden');
    vippsBtn.classList.add('hidden');
    
    // Clear the total text
    totalElement.textContent = ' kr';
}