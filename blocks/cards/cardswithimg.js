import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Load Swiper library dynamically (ES module from scripts/swiper/).
 * Returns the Swiper constructor.
 */
async function loadSwiper() {
  loadCSS(`${window.hlx.codeBasePath}/scripts/swiper/swiper-bundle.min.css`);
  const { default: Swiper } = await import('../../scripts/swiper/swiper-bundle.min.js');
  return Swiper;
}

/**
 * Toggle accordion — expand text overlay to cover image, or collapse it.
 */
function toggleAccordion(slide) {
  const isOpen = slide.classList.toggle('accordion-open');
  const btn = slide.querySelector('.accordion-toggle');
  if (btn) btn.textContent = isOpen ? '−' : '+';
}

export default async function decoratecardwithimgs(block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cardswithimg.css`);

  const Swiper = await loadSwiper();

  // Build Swiper DOM structure
  const swiperEl = document.createElement('div');
  swiperEl.classList.add('swiper', 'cardswithimg-swiper');

  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('swiper-wrapper');

  // Each row from AEM becomes a slide
  [...block.children].forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('swiper-slide');
    moveInstrumentation(row, slide);

    // Separate image from body content
    let imageCol = null;
    let bodyCol = null;

    while (row.firstElementChild) {
      const col = row.firstElementChild;
      if (col.children.length === 1 && col.querySelector('picture')) {
        col.className = 'cardswithimg-card-image';
        imageCol = col;
      } else {
        col.className = 'cardswithimg-card-body';
        bodyCol = col;
      }
      slide.append(col);
    }

    // Build accordion overlay structure:
    // Image is the background, text overlays from the top
    if (bodyCol) {
      // Split body into: header (first heading or first p) + detail (rest)
      const header = document.createElement('div');
      header.className = 'accordion-header';

      const detail = document.createElement('div');
      detail.className = 'accordion-detail';

      const children = [...bodyCol.children];
      // First element is the header/title
      if (children.length > 0) {
        header.append(children[0]);
      }
      // Rest goes into collapsible detail
      children.slice(1).forEach((child) => detail.append(child));

      // +/- toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'accordion-toggle';
      toggleBtn.textContent = '+';
      toggleBtn.setAttribute('aria-label', 'Toggle card details');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAccordion(slide);
      });

      header.append(toggleBtn);
      bodyCol.replaceChildren(header, detail);
    }

    wrapperEl.append(slide);
  });

  swiperEl.append(wrapperEl);

  // Navigation arrows
  const prevBtn = document.createElement('div');
  prevBtn.classList.add('swiper-button-prev');
  const nextBtn = document.createElement('div');
  nextBtn.classList.add('swiper-button-next');
  swiperEl.append(prevBtn, nextBtn);

  // Pagination dots
  const pagination = document.createElement('div');
  pagination.classList.add('swiper-pagination');
  swiperEl.append(pagination);

  // Replace block content
  block.replaceChildren(swiperEl);

  // Optimize images
  swiperEl.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, pic.querySelector('img'));
    img.closest('picture').replaceWith(pic);
  });

  // Initialize Swiper
  // eslint-disable-next-line no-new
  new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    pagination: {
      el: pagination,
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 32 },
    },
  });
}