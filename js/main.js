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

  // 5. Testimonials Center Highlight Carousel
  const testimonialsCarousel = document.getElementById('testimonials-carousel');
  const prevTestimonialBtn = document.getElementById('testimonial-prev');
  const nextTestimonialBtn = document.getElementById('testimonial-next');
  const testimonialCards = document.querySelectorAll('.testimonial-card');

  if (testimonialsCarousel && testimonialCards.length > 0) {
    const highlightCenterCard = () => {
      const carouselRect = testimonialsCarousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;
      
      let closestCard = null;
      let minDistance = Infinity;

      testimonialCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(carouselCenter - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestCard = card;
        }
      });

      testimonialCards.forEach(card => {
        if (card === closestCard) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    };

    testimonialsCarousel.addEventListener('scroll', highlightCenterCard);
    window.addEventListener('resize', highlightCenterCard);
    
    // Initial run
    highlightCenterCard();

    // Testimonial Nav Buttons
    const testimonialCardWidth = 572; // Card flex-basis 540 + gap 32
    if (prevTestimonialBtn && nextTestimonialBtn) {
      prevTestimonialBtn.addEventListener('click', () => {
        testimonialsCarousel.scrollBy({ left: -testimonialCardWidth, behavior: 'smooth' });
      });
      nextTestimonialBtn.addEventListener('click', () => {
        testimonialsCarousel.scrollBy({ left: testimonialCardWidth, behavior: 'smooth' });
      });
    }
  }

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
