// main.js — Client Script for sevenai with Supabase, FAQ Accordion & AI Chatbot

import { supabase } from './supabase.js';
import { initChatbot } from './chatbot.js';

document.addEventListener('DOMContentLoaded', () => {

  // Initialize AI Chatbot for Services
  initChatbot();

  // 1. Header scroll effect
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('py-2');
      header.classList.remove('py-4');
    } else {
      header.classList.add('py-4');
      header.classList.remove('py-2');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 3. Scroll Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Horizontal 9:16 Video Carousel Scroll Controls
  const videoCarousel = document.getElementById('video-carousel');
  const scrollLeftBtn = document.getElementById('scroll-left-btn');
  const scrollRightBtn = document.getElementById('scroll-right-btn');

  if (videoCarousel && scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.addEventListener('click', () => {
      videoCarousel.scrollBy({ left: -320, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
      videoCarousel.scrollBy({ left: 320, behavior: 'smooth' });
    });
  }

  // 5. Portfolio Filter Logic for 9:16 Video Cards
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');

      portfolioItems.forEach(item => {
        const itemTags = item.getAttribute('data-tags') || '';
        
        if (category === 'ALL' || itemTags.includes(category)) {
          item.style.display = 'flex';
          item.style.flexDirection = 'column';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 6. Interactive FAQ Accordion Logic
  const faqBtns = document.querySelectorAll('.faq-btn');

  faqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentItem = btn.closest('.faq-item');
      if (!parentItem) return;

      const isActive = parentItem.classList.contains('active');

      // Close all other FAQ items for a clean accordion effect
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== parentItem) {
          item.classList.remove('active');
          const itemBtn = item.querySelector('.faq-btn');
          if (itemBtn) itemBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isActive) {
        parentItem.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        parentItem.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 7. Contact Form Handler with Supabase Database Storage
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formToast = document.getElementById('form-toast');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!submitBtn) return;

      const originalBtnText = submitBtn.innerHTML;
      
      // Capture Form Data
      const formData = {
        nombre: document.getElementById('nombre')?.value?.trim() || '',
        email: document.getElementById('email')?.value?.trim() || '',
        web: document.getElementById('web')?.value?.trim() || '',
        producto: document.getElementById('producto')?.value?.trim() || '',
        mensaje: document.getElementById('mensaje')?.value?.trim() || '',
        created_at: new Date().toISOString()
      };

      // Loading State
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Submitting Brief...</span>
      `;

      let toastMessage = "Thank you! We've received your creative brief and will reach out within 24 hours.";

      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('contactos')
            .insert([formData]);

          if (error) {
            console.warn('Error saving to Supabase:', error.message);
            toastMessage = `Brief received! (Note: ${error.message})`;
          } else {
            console.log('Saved to Supabase:', data);
          }
        } else {
          toastMessage = "Thank you! Your creative brief has been submitted.";
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        toastMessage = "Thank you! Your request has been recorded.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (formToast) {
          formToast.textContent = toastMessage;
          formToast.classList.remove('hidden');
          formToast.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        contactForm.reset();

        setTimeout(() => {
          if (formToast) {
            formToast.classList.add('hidden');
          }
        }, 9000);
      }
    });
  }

});
