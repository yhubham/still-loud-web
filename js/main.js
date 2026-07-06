/*
   ARSCREA Javascript Operations (v2 Redesign)
   Handles: Sticky Header, Mobile Menu Drawer, Portfolio Swipe, Testimonials Carousel, & Interactive Hover States
*/

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Navbar Sticky Transition
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.padding = '8px 28px';
      navbar.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.35)';
      navbar.style.backgroundColor = 'rgba(35, 36, 45, 0.98)';
      navbar.style.backdropFilter = 'blur(10px)';
    } else {
      navbar.style.padding = '12px 36px';
      navbar.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
      navbar.style.backgroundColor = 'var(--color-dark)';
      navbar.style.backdropFilter = 'none';
    }
  });

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navContainer = document.querySelector('.nav-container');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (mobileMenuBtn && navContainer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isActive = mobileMenuBtn.classList.toggle('active');
      navContainer.classList.toggle('active');
      
      // Prevent body scrolling when mobile menu drawer is open
      if (isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }

  // 3. Service Pills Hover Interactive Switch
  const servicePills = document.querySelectorAll('.service-pill');
  if (servicePills.length > 0) {
    // Set first pill active initially
    servicePills[0].classList.add('active');
    
    servicePills.forEach(pill => {
      pill.addEventListener('mouseenter', () => {
        servicePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  }

  // 4. Portfolio Carousel Nav Buttons (Scroll-By)
  const portfolioGrid = document.getElementById('portfolio-grid');
  const portfolioPrev = document.getElementById('portfolio-prev');
  const portfolioNext = document.getElementById('portfolio-next');

  if (portfolioGrid && portfolioPrev && portfolioNext) {
    const scrollAmount = 450; // card layout offset width + gap
    
    portfolioPrev.addEventListener('click', () => {
      portfolioGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    portfolioNext.addEventListener('click', () => {
      portfolioGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // 5. Testimonials Infinite-Loop Carousel
  (function () {
    const track     = document.getElementById('testimonials-track');
    const prevBtn   = document.getElementById('testimonial-prev');
    const nextBtn   = document.getElementById('testimonial-next');
    const dotsWrap  = document.getElementById('testimonials-dots');
    if (!track || !prevBtn || !nextBtn) return;

    const originalCards = Array.from(track.querySelectorAll('.testimonial-card'));
    const totalOriginal = originalCards.length;

    /* ── Determine how many cards fit in view ── */
    function getSlidesPerView() {
      const w = window.innerWidth;
      if (w <= 768)  return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    let spv       = getSlidesPerView();
    let current   = 0;          // logical index (0 … totalOriginal-1)
    let isAnimating = false;
    let autoTimer = null;
    const DURATION  = 520;      // ms – matches CSS transition
    const AUTO_DELAY = 4500;    // ms

    /* ── Clone cards for seamless loop ──
       Prepend last `spv` clones, append first `spv` clones          */
    function buildClones() {
      // Remove any existing clones
      track.querySelectorAll('.t-clone').forEach(c => c.remove());

      const newSpv = getSlidesPerView();
      // leading clones (last N originals)
      for (let i = totalOriginal - newSpv; i < totalOriginal; i++) {
        const clone = originalCards[i].cloneNode(true);
        clone.classList.add('t-clone');
        track.insertBefore(clone, track.firstChild);
      }
      // trailing clones (first N originals)
      for (let i = 0; i < newSpv; i++) {
        const clone = originalCards[i].cloneNode(true);
        clone.classList.add('t-clone');
        track.appendChild(clone);
      }
    }

    /* ── Measure a single card width (incl. gap) ── */
    function cardStep() {
      const card = track.querySelector('.testimonial-card');
      if (!card) return 0;
      const style = getComputedStyle(track);
      const gap   = parseFloat(style.gap) || 28;
      return card.getBoundingClientRect().width + gap;
    }

    /* ── Jump to position (no transition) ── */
    function jumpTo(idx) {
      const step   = cardStep();
      const offset = (idx + spv) * step;   // +spv accounts for leading clones
      track.style.transition = 'none';
      track.style.transform  = `translateX(-${offset}px)`;
      // force reflow
      track.getBoundingClientRect();
    }

    /* ── Slide to position (with transition) ── */
    function slideTo(idx, done) {
      if (isAnimating) return;
      isAnimating = true;
      const step   = cardStep();
      const offset = (idx + spv) * step;
      track.style.transition = `transform ${DURATION}ms cubic-bezier(0.25,0.8,0.25,1)`;
      track.style.transform  = `translateX(-${offset}px)`;
      updateDots(((idx % totalOriginal) + totalOriginal) % totalOriginal);
      setTimeout(() => {
        isAnimating = false;
        if (done) done();
      }, DURATION);
    }

    /* ── Navigate ── */
    function goTo(idx) {
      current = idx;
      slideTo(current, () => {
        // Seamless wrap: if we're in clone territory, jump silently
        if (current >= totalOriginal) {
          current = 0;
          jumpTo(current);
        } else if (current < 0) {
          current = totalOriginal - 1;
          jumpTo(current);
        }
      });
    }

    function goNext() { goTo(current + 1); }
    function goPrev() { goTo(current - 1); }

    /* ── Dot indicators ── */
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < totalOriginal; i++) {
        const btn = document.createElement('button');
        btn.className   = 't-dot' + (i === 0 ? ' active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        btn.addEventListener('click', () => { stopAuto(); current = i; slideTo(current); startAuto(); });
        dotsWrap.appendChild(btn);
      }
    }

    function updateDots(idx) {
      dotsWrap.querySelectorAll('.t-dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
      });
    }

    /* ── Autoplay ── */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(goNext, AUTO_DELAY);
    }

    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }

    /* ── Init ── */
    function init() {
      spv = getSlidesPerView();
      buildClones();
      buildDots();
      jumpTo(current);
      startAuto();
    }

    /* ── Button events ── */
    nextBtn.addEventListener('click', () => { stopAuto(); goNext(); startAuto(); });
    prevBtn.addEventListener('click', () => { stopAuto(); goPrev(); startAuto(); });

    /* ── Hover pause ── */
    const wrapper = track.closest('.testimonials-carousel-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAuto);
      wrapper.addEventListener('mouseleave', startAuto);
    }

    /* ── Resize: rebuild clones + re-jump ── */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newSpv = getSlidesPerView();
        if (newSpv !== spv) { spv = newSpv; init(); }
        else { jumpTo(current); }
      }, 200);
    });

    init();
  })();


  // 6. Client Ticker / Marquee Hover Pause
  const marqueeContents = document.querySelectorAll('.marquee-content');
  marqueeContents.forEach(content => {
    content.addEventListener('mouseenter', () => {
      content.style.animationPlayState = 'paused';
    });
    content.addEventListener('mouseleave', () => {
      content.style.animationPlayState = 'running';
    });
  });

  // 7. Back to Top Button Interaction
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 800) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 8. Active Nav Link on Scroll
  const sections = document.querySelectorAll('section, div.top-hero-card');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 150) {
        // Handle nested top-hero-card containing the #home section
        if (section.classList.contains('top-hero-card')) {
          currentSectionId = 'home';
        } else {
          currentSectionId = section.getAttribute('id');
        }
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  });
});
