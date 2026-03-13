import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Initializes the scroll-to-top button.
 */
function initScrollToTop() {
  let scrollBtn = document.querySelector('.scroll-to-top');

  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.innerHTML = `
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 7L7 1M7 1L13 7M7 1V19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    const footerWrapper = document.querySelector('footer');
    if (footerWrapper) {
      footerWrapper.appendChild(scrollBtn);
    }
  }

  // Show/hide button
  window.addEventListener('scroll', () => {
    const scrollThreshold = window.innerWidth < 900 ? 1328 : 1046;
    const footer = document.querySelector('footer');
    const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : Infinity;
    const scrollPosition = window.scrollY + window.innerHeight;
    
    if (window.scrollY > scrollThreshold) {
      scrollBtn.classList.add('visible');
      
      // Check if scroll has reached the footer
      if (scrollPosition >= footerTop) {
        scrollBtn.classList.add('stop');
      } else {
        scrollBtn.classList.remove('stop');
      }
    } else {
      scrollBtn.classList.remove('visible');
      scrollBtn.classList.remove('stop');
    }
  });

  // Smooth scroll
  scrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    scrollBtn.blur();
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-container';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Create wrapper div for first and second sections
  const sections = footer.querySelectorAll('.section');
  if (sections.length >= 2) {
    const wrapper = document.createElement('div');
    wrapper.className = 'footer-sections-wrapper';

    wrapper.append(sections[0]);
    wrapper.append(sections[1]);

    footer.prepend(wrapper);
  }

  block.append(footer);

  // Initialize scroll-to-top button
  initScrollToTop();
}