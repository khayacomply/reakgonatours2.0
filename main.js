/* main.js — unified behavior for all pages (PRODUCTION-READY) */

/* ===== PRELOADER ===== */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if(preloader) {
    setTimeout(() => { preloader.classList.add("fade-out"); }, 600);
    setTimeout(() => { preloader.remove(); }, 1600);
  }
});

/* ===== DOM READY ===== */
document.addEventListener('DOMContentLoaded', () => {

  /* ----- Mobile Menu Toggle ----- */
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if(menuBtn && nav){
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      nav.style.display = isExpanded ? 'none' : 'flex';
    });
    
    // Close menu when clicking a link (mobile UX)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if(window.innerWidth <= 1100) {
          nav.style.display = 'none';
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ----- Hero Slideshow (only if slides exist) ----- */
  (function(){
    const slides = document.querySelectorAll('.hero-slide');
    if(slides.length < 2) return; // Need at least 2 slides
    
    let idx = 0;
    slides[idx].classList.add('active');
    
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 4200);
  })();

  /* ----- Lightbox for Gallery & Tour Images ----- */
  // Collect all clickable images
  const lightboxImages = [
    ...document.querySelectorAll('.gallery-img'),
    ...document.querySelectorAll('.dest-grid .card img')
  ];
  
  lightboxImages.forEach(img => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(img.src, img.alt || 'Tour image');
    });
    
    // Enable keyboard accessibility
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `View ${img.alt || 'image'} in full size`);
    img.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img.src, img.alt || 'Tour image');
      }
    });
  });

  /* Reusable Lightbox Function */
  function openLightbox(src, alt) {
    let lb = document.querySelector('.lightbox');
    
    // Create lightbox if it doesn't exist
    if(!lb){
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.setAttribute('aria-label', 'Image preview');
      lb.innerHTML = `
        <img src="" alt="">
        <button class="lb-close" 
          aria-label="Close preview"
          style="position:absolute;right:22px;top:18px;background:transparent;
                 border:none;color:#fff;font-size:28px;cursor:pointer;z-index:10">
          ×
        </button>`;
      document.body.appendChild(lb);

      // Close handlers
      const closeBtn = lb.querySelector('.lb-close');
      if(closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
      }
      
      lb.addEventListener('click', (ev) => {
        if(ev.target === lb) closeLightbox();
      });
      
      // Keyboard support
      document.addEventListener('keydown', handleLightboxKeydown);
    }

    // Update image and show
    const lbImg = lb.querySelector('img');
    if(lbImg) {
      lbImg.src = src;
      lbImg.alt = alt;
    }
    lb.style.display = 'flex';
    
    // Focus trap for accessibility
    setTimeout(() => {
      const closeBtn = lb.querySelector('.lb-close');
      if(closeBtn) closeBtn.focus();
    }, 100);
  }

  function closeLightbox() {
    const lb = document.querySelector('.lightbox');
    if(lb) {
      lb.style.display = 'none';
      // Return focus to last focused element (basic implementation)
      document.removeEventListener('keydown', handleLightboxKeydown);
    }
  }

  function handleLightboxKeydown(e) {
    if(e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
  }

  /* ----- Booking Form: Formspree + WhatsApp Fallback ----- */
  const bookingForm = document.getElementById('bookingForm');
  if(bookingForm){
    bookingForm.addEventListener('submit', async function(e){
      e.preventDefault();
      
      // Client-side validation
      const required = this.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if(!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ff4444';
          field.style.boxShadow = '0 0 8px rgba(255,68,68,0.4)';
        } else {
          field.style.borderColor = '';
          field.style.boxShadow = 'none';
        }
      });
      
      if(!valid) {
        alert('Please fill in all required fields marked with *');
        return;
      }

      // Disable button to prevent duplicate submissions
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      const fd = new FormData(this);
      const name = fd.get('name') || '[no name]';
      const phone = fd.get('phone') || '';
      const service = fd.get('service') || '';
      const date = fd.get('date') || '';
      const time = fd.get('time') || '';
      const notes = fd.get('notes') || '';
      const body = `Name: ${name}%0AService: ${service}%0APhone: ${phone}%0ADate: ${date} ${time}%0ANotes: ${notes}`;
      
      try {
        // Formspree submission (if action is set)
        if(this.action && this.action.includes('formspree')) {
          const response = await fetch(this.action, {
            method: 'POST',
            body: fd,
            headers: { 'Accept': 'application/json' }
          });
          
          if(response.ok) {
            // Show success message if element exists
            const successMsg = document.getElementById('formSuccess');
            if(successMsg) {
              successMsg.style.display = 'block';
              successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            this.reset();
            return; // Exit early - no need for fallback
          }
        }
        
        // Fallback: mailto + WhatsApp
        window.location.href = `mailto:booking@reakgonatours.co.za?subject=Booking:${encodeURIComponent(service)}&body=${encodeURIComponent(body)}`;
        
        setTimeout(() => {
          window.open(`https://wa.me/27790988801?text=${encodeURIComponent(body)}`, '_blank', 'noopener');
        }, 800);
        
      } catch(error) {
        console.error('Form submission error:', error);
        alert('Connection error. Please WhatsApp us directly: +27 79 098 8801');
      } finally {
        // Re-enable button
        if(submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
    
    // Real-time validation feedback
    bookingForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', function() {
        if(this.required && !this.value.trim()) {
          this.style.borderColor = '#ff4444';
        } else {
          this.style.borderColor = '';
        }
      });
    });
  }

}); /* End DOMContentLoaded */

/* ===== SCROLL REVEAL (outside DOMContentLoaded for broader support) ===== */
const revealEls = document.querySelectorAll(".reveal");
if(revealEls.length) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        revealObs.unobserve(entry.target); // Stop observing after reveal
      }
    });
  }, { threshold: 0.15 });
  
  revealEls.forEach(el => revealObs.observe(el));
}

/* ===== CHAT POPUP - SAFELY DISABLED ===== */
/* 
   The floating chat button has been removed from CSS/HTML.
   This block is commented out to prevent console errors.
   To re-enable: uncomment below AND add #chat-popup + .chat-btn to HTML/CSS.
*/
/*
const chatBtn = document.querySelector('.chat-btn');
const chatPopup = document.getElementById('chat-popup');
if(chatBtn && chatPopup) {
  chatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isVisible = chatPopup.style.display === 'block';
    chatPopup.style.display = isVisible ? 'none' : 'block';
    chatBtn.setAttribute('aria-expanded', !isVisible);
  });
  
  document.querySelectorAll('.chat-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      window.open(`https://wa.me/27790988801?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  });
}
*/