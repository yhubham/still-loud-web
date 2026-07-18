/*
   StillLoud — Our Work Portfolio Page JavaScript
   Handles: Category filtering, IntersectionObserver reveals,
            Lightbox (keyboard + swipe), Back-to-top, Navbar sticky
*/

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     1. NAVBAR STICKY TRANSITION (same as main site)
     ===================================================== */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.style.padding          = '10px 16px 10px 20px';
        navbar.style.boxShadow        = '0 12px 36px rgba(0,0,0,.35), 0 4px 12px rgba(0,0,0,.2)';
        navbar.style.backgroundColor  = 'rgba(33,37,41,0.97)';
        navbar.style.backdropFilter   = 'blur(12px)';
      } else {
        navbar.style.padding          = '14px 20px 14px 24px';
        navbar.style.boxShadow        = '0 8px 32px rgba(0,0,0,.25), 0 2px 8px rgba(0,0,0,.15)';
        navbar.style.backgroundColor  = 'var(--color-dark)';
        navbar.style.backdropFilter   = 'none';
      }
    }, { passive: true });
  }

  /* =====================================================
     2. MOBILE MENU TOGGLE
     ===================================================== */
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navContainer  = document.querySelector('.nav-container');
  const navLinks      = document.querySelectorAll('.nav-links a');

  if (mobileMenuBtn && navContainer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isActive = mobileMenuBtn.classList.toggle('active');
      navContainer.classList.toggle('active');
      document.body.style.overflow = isActive ? 'hidden' : 'auto';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }

  /* =====================================================
     3. BACK TO TOP
     ===================================================== */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =====================================================
     4. CATEGORY FILTERING
     ===================================================== */
  const filterBtns   = document.querySelectorAll('.ow-filter-btn');
  const allCards     = document.querySelectorAll('.gallery-card');
  const statsEl      = document.getElementById('ow-visible-count');
  const emptyState   = document.getElementById('ow-empty-state');

  let activeFilter   = 'all';

  function applyFilter(category) {
    activeFilter = category;
    let visibleCount = 0;

    allCards.forEach((card, idx) => {
      const cat = card.dataset.category;
      const show = (category === 'all') || (cat === category);

      if (show) {
        card.classList.remove('hidden');
        visibleCount++;
        // Re-trigger reveal animation with stagger
        card.classList.remove('revealed');
        // Use CSS variable for stagger delay (capped at 600ms)
        card.style.setProperty('--reveal-delay', `${Math.min(idx * 0.04, 0.6)}s`);
        // Force reflow before adding class for transition to fire
        void card.offsetWidth;
        requestAnimationFrame(() => card.classList.add('revealed'));
      } else {
        card.classList.add('hidden');
        card.classList.remove('revealed');
      }
    });

    // Update count badge
    if (statsEl) statsEl.textContent = visibleCount;

    // Toggle empty state
    if (emptyState) {
      emptyState.classList.toggle('visible', visibleCount === 0);
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* =====================================================
     5. INTERSECTION OBSERVER — INITIAL CARD REVEAL
     ===================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        if (!card.classList.contains('hidden')) {
          card.classList.add('revealed');
        }
        revealObserver.unobserve(card);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  // Assign stagger delays & observe all cards
  allCards.forEach((card, idx) => {
    card.style.setProperty('--reveal-delay', `${Math.min(idx * 0.05, 0.8)}s`);
    revealObserver.observe(card);
  });

  /* =====================================================
     6. LIGHTBOX
     ===================================================== */
  const lightbox    = document.getElementById('ow-lightbox');
  const lbImg       = document.getElementById('ow-lb-img');
  const lbClose     = document.getElementById('ow-lb-close');
  const lbPrev      = document.getElementById('ow-lb-prev');
  const lbNext      = document.getElementById('ow-lb-next');
  const lbCounter   = document.getElementById('ow-lb-counter');
  const lbLabel     = document.getElementById('ow-lb-label');
  const lbBackdrop  = document.getElementById('ow-lb-backdrop');

  if (!lightbox) return;

  // Build the ordered list of visible images for navigation
  let imageList   = [];  // [{src, alt, category}]
  let currentIdx  = 0;

  function buildImageList() {
    imageList = [];
    allCards.forEach(card => {
      if (!card.classList.contains('hidden')) {
        const img = card.querySelector('.gallery-img');
        imageList.push({
          src      : img.src,
          alt      : img.alt,
          category : card.dataset.categoryLabel || card.dataset.category
        });
      }
    });
  }

  function openLightbox(cardEl) {
    buildImageList();
    const img = cardEl.querySelector('.gallery-img');
    currentIdx = imageList.findIndex(i => i.src === img.src);
    if (currentIdx === -1) currentIdx = 0;
    showImage(currentIdx);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = 'auto';
  }

  function showImage(idx) {
    if (imageList.length === 0) return;
    idx = ((idx % imageList.length) + imageList.length) % imageList.length; // wrap
    currentIdx = idx;
    const item = imageList[idx];

    // Animate image swap
    lbImg.style.opacity   = '0';
    lbImg.style.transform = 'scale(0.96)';
    setTimeout(() => {
      lbImg.src   = item.src;
      lbImg.alt   = item.alt;
      lbImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      lbImg.style.opacity    = '1';
      lbImg.style.transform  = 'scale(1)';
    }, 150);

    if (lbCounter) lbCounter.textContent = `${idx + 1} / ${imageList.length}`;
    if (lbLabel)   lbLabel.textContent   = item.category;
  }

  // Open on card click — skip video / no-lightbox cards
  allCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.hasAttribute('data-no-lightbox')) return;
      openLightbox(card);
    });
  });

  // Close buttons
  lbClose.addEventListener('click',   closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);

  // Nav buttons
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIdx - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIdx + 1); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    switch (e.key) {
      case 'Escape':    closeLightbox();              break;
      case 'ArrowLeft': showImage(currentIdx - 1);   break;
      case 'ArrowRight':showImage(currentIdx + 1);   break;
    }
  });

  /* ── Touch / swipe support ── */
  let touchStartX = 0;
  let touchEndX   = 0;
  const SWIPE_THRESHOLD = 50; // px

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      delta > 0 ? showImage(currentIdx + 1) : showImage(currentIdx - 1);
    }
  }, { passive: true });

  /* =====================================================
     7. RE-BUILD LIGHTBOX LIST WHEN FILTER CHANGES
     (so prev/next only cycle through visible category)
     ===================================================== */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Already handled by applyFilter; imageList rebuilt on open
    });
  });

});
